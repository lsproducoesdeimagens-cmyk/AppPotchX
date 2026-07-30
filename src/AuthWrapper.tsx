/**
 * AuthWrapper — Gerencia autenticação do PotchX via Supabase Auth.
 *
 * Estados:
 *  - checking       : verificando sessão ou licença
 *  - login          : tela de login
 *  - signup         : tela de cadastro (qualquer e-mail e senha)
 *  - forgot_password: tela de solicitação de redefinição de senha
 *  - new_password   : tela de definição de nova senha
 *  - no_access      : usuário autenticado mas sem licença ativa
 *
 * Fluxo de acesso (Stripe → licença → signup → app):
 *  1. Comprador paga no Stripe → webhook registra licença em stripe_subscriptions (user_id = null)
 *  2. Usuário final (pode ser outra pessoa) abre o app e cria conta com qualquer e-mail/senha
 *  3. Após login, AuthWrapper verifica licença ativa em stripe_subscriptions
 *  4. Se licença disponível (user_id IS NULL) → reivindica e libera acesso
 *  5. Se licença já vinculada ao user_id → libera acesso
 *  6. Se nenhuma licença ativa → tela no_access
 *
 * Fluxo de recovery (esqueci minha senha):
 *  1. Usuário clica em "Forgot Password" → Supabase envia link com type=recovery
 *  2. AuthWrapper detecta type=recovery na URL → exibe tela new_password
 *  3. Ao confirmar, chama supabase.auth.updateUser({ password })
 *
 * Regras de senha:
 *  - mínimo 6 caracteres
 *  - pelo menos 1 letra maiúscula
 *  - pelo menos 1 letra minúscula
 *  - pelo menos 1 número
 *  - pelo menos 1 símbolo especial
 *
 * NÃO modifica nenhum componente visual do App original.
 */

import React, { useEffect, useRef, useState } from "react";
import type { Session } from "./services/interfaces/types";
import { authService } from "./services/authService";
import { supabase } from "./services/supabaseClient";

/* ─────────────────────────────────────────────────────────────
   Tipos
   ───────────────────────────────────────────────────────────── */
type AuthScreen = "checking" | "login" | "signup" | "forgot_password" | "new_password" | "no_access";

interface PasswordStrength {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

interface AuthWrapperProps {
  children: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────────
   Validação de senha e e-mail
   ───────────────────────────────────────────────────────────── */
const SPECIAL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

function checkStrength(pwd: string): PasswordStrength {
  return {
    minLength: pwd.length >= 6,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: SPECIAL_RE.test(pwd),
  };
}

function isValid(s: PasswordStrength): boolean {
  return Object.values(s).every(Boolean);
}

function validateEmail(emailStr: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
}

/* ─────────────────────────────────────────────────────────────
   Ícones de olho (show/hide)
   ───────────────────────────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
             a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1
             12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
             m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Ícone do logo (shield — mesmo do app original)
   ───────────────────────────────────────────────────────────── */
const ShieldLogo = ({ size = 52 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 5V11C3 16.5 7.5 21 12 22.5C16.5 21 21 16.5 21 11V5L12 2Z"
      fill="#0f2d4a" stroke="#0f2d4a" strokeWidth="1"/>
    <path d="M12 4L5 6.3V11C5 15.5 8.5 19.2 12 20.5C15.5 19.2 19 15.5 19 11V6.3L12 4Z"
      stroke="white" strokeWidth="0.8"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Hook: campo de senha com toggle show/hide
   ───────────────────────────────────────────────────────────── */
function usePasswordField(initial = "") {
  const [value, setValue] = useState(initial);
  const [visible, setVisible] = useState(false);
  const toggle = () => setVisible((v) => !v);
  return { value, setValue, visible, toggle };
}

/* ─────────────────────────────────────────────────────────────
   Verificação e reivindicação de slot de licença via RPC Supabase
   ─────────────────────────────────────────────────────────────
   A função RPC `claim_license_slot` (SECURITY DEFINER) é atômica.
   Validação: Usuário → license_users → stripe_subscriptions (plano, status, validade)
   ───────────────────────────────────────────────────────────── */

interface LicenseResult {
  access:    boolean;
  reason:    string;       // existing_user | new_user_claimed | license_full | license_expired | no_active_license | rpc_error
  plan?:     string;
  max_users?: number;
}

interface NoAccessInfo {
  title:    string;
  subtitle: string;
  body:     string;
}

/** Chama a RPC atômica que verifica e/ou reivindica um slot de licença. */
async function claimLicenseSlot(userId: string, buyerEmail?: string | null): Promise<LicenseResult> {
  try {
    const { data, error } = await supabase.rpc("claim_license_slot", {
      p_user_id:     userId,
      p_buyer_email: buyerEmail || null,
    });
    if (error) {
      console.error("[AuthWrapper] RPC claim_license_slot error:", error.message);
      return { access: false, reason: "rpc_error" };
    }
    return (data ?? { access: false, reason: "unknown" }) as LicenseResult;
  } catch {
    return { access: false, reason: "rpc_error" };
  }
}

/** Retorna o conteúdo da tela no_access de acordo com a razão do bloqueio. */
function getLicenseBlockMessage(result: LicenseResult): NoAccessInfo {
  const max = result.max_users ?? 1;
  const plural = max > 1 ? "users" : "user";

  switch (result.reason) {
    case "license_full":
      return {
        title:    "License Limit Reached",
        subtitle: `License Limit Reached — This license allows up to ${max} ${plural}.`,
        body:     "To add more users, upgrade your plan or contact support.",
      };
    case "license_expired":
      return {
        title:    "License Expired",
        subtitle: "License Expired — Please renew your subscription.",
        body:     "Please renew your subscription to restore access. Your account data is preserved.",
      };
    case "no_active_license":
      return {
        title:    "Access Not Found",
        subtitle: "Access Not Found — Complete your purchase.",
        body:     "Complete your purchase to activate access, or contact support if you believe this is an error.",
      };
    default:
      return {
        title:    "Access Not Found",
        subtitle: "Could not verify your license. Please try again.",
        body:     "If the problem persists, sign out and sign back in, or contact support.",
      };
  }
}

/* ─────────────────────────────────────────────────────────────
   Componente principal
   ───────────────────────────────────────────────────────────── */
export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [screen, setScreen]   = useState<AuthScreen>("checking");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");
  const [busy, setBusy]       = useState(false);
  // Controla se o usuário está no fluxo de recovery (redefinição de senha)
  // Evita que o onAuthStateChange execute a verificação de licença durante o recovery
  const inRecoveryRef = useRef(false);
  // Controla se estamos limpando a sessão após um link de convite (invite)
  // Evita que o onAuthStateChange processe a sessão temporária de convite criada pelo link
  const isResettingInviteRef = useRef(false);
  // Mensagem dinâmica exibida na tela no_access conforme a razão do bloqueio
  const [noAccessInfo, setNoAccessInfo] = useState<NoAccessInfo>({
    title:    "Access Not Found",
    subtitle: "No active license was found for this account.",
    body:     "Complete your purchase to activate access, or contact support if you believe this is an error.",
  });

  // Campos de senha
  const newPwd     = usePasswordField();
  const confirmPwd = usePasswordField();
  const loginPwd   = usePasswordField();

  // Força da senha
  const strength = checkStrength(newPwd.value);

  // Referência para evitar loop no listener
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  /* ── Inicialização: verifica sessão e trata link de recovery na URL ── */
  useEffect(() => {
    // ── 1. Verifica parâmetros de recovery na URL ──────────────────────────
    // O Supabase envia links de reset com: ?token_hash=...&type=recovery
    // Esses parâmetros chegam como hash (#) ou query string (?)
    const parseAuthParams = () => {
      // Supabase usa hash fragment (#access_token=...&type=...)
      const hash = window.location.hash.substring(1);
      // Ou query string (?token_hash=...&type=...)
      const search = window.location.search.substring(1);

      const params = new URLSearchParams(hash || search);
      return {
        tokenHash:   params.get("token_hash"),
        type:        params.get("type"),
        accessToken: params.get("access_token"),
        refreshToken:params.get("refresh_token"),
      };
    };

    const { tokenHash, type, accessToken, refreshToken } = parseAuthParams();

    // Captura o buyer_email da URL e persiste no sessionStorage para não perder na navegação
    const buyerEmailParam = new URLSearchParams(window.location.search).get("buyer_email");
    if (buyerEmailParam) {
      sessionStorage.setItem("potchx_buyer_email", buyerEmailParam);
      // Limpa os parâmetros de busca para manter a URL do app limpa
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Se for detectado fluxo de convite (invite), nós destruímos a sessão temporária
    // gerada pelo link do Supabase, limpamos a URL e abrimos a tela de login vazia.
    if (type === "invite" || (accessToken && type === "invite")) {
      isResettingInviteRef.current = true;
      authService.signOut().then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        isResettingInviteRef.current = false;
        setScreen("login");
      });
      return;
    }

    if (accessToken && refreshToken) {
      // Link com access_token direto (formato legado Supabase ou magic link)
      // Seta a sessão diretamente para que onAuthStateChange a processe
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        if (error) {
          console.error("[AuthWrapper] Erro ao setar sessão do link:", error.message);
          setScreen("login");
        }
        // A sessão será capturada pelo onAuthStateChange abaixo
      });
    } else if (tokenHash && type === "recovery") {
      // Link de redefinição de senha (Forgot Password)
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" }).then(({ error }) => {
        if (error) {
          console.error("[AuthWrapper] Erro ao verificar OTP de recovery:", error.message);
          setScreen("login");
        } else {
          // Sessão temporária criada para recovery — exibe tela de nova senha
          inRecoveryRef.current = true;
          setScreen("new_password");
        }
      });
    }

    // ── 2. Listener de mudança de estado de autenticação ──────────────────────
    // Após qualquer login/signup bem-sucedido, verifica se existe licença ativa.
    // O acesso é liberado pela LICENÇA (não pelo e-mail do comprador).
    subscriptionRef.current = authService.onAuthStateChange(async (sess) => {
      if (sess) {
        // Se estiver no fluxo de recovery ou limpando o convite, não faz a verificação
        if (inRecoveryRef.current || isResettingInviteRef.current) return;

        // Recupera o buyer_email armazenado no sessionStorage
        const savedBuyerEmail = sessionStorage.getItem("potchx_buyer_email");

        // Verifica/reivindica slot de licença via RPC (atômica, tipada por plano)
        setScreen("checking");
        const result = await claimLicenseSlot(sess.user.id, savedBuyerEmail);
        if (result.access) {
          setSession(sess);
        } else {
          // Usuário autenticado mas sem licença válida: exibe motivo específico
          setNoAccessInfo(getLicenseBlockMessage(result));
          setSession(null);
          setScreen("no_access");
        }
      } else {
        setSession(null);
        // Não sobrescreve a tela se estiver no fluxo de recovery
        if (!inRecoveryRef.current) {
          setScreen("login");
        }
      }
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  /* ── Autenticado: renderiza APENAS o App original intocado (sem qualquer alteração de layout) ── */
  if (session) {
    return <>{children}</>;
  }

  /* ── Carregando ── */
  if (screen === "checking") {
    return (
      <div style={s.loadingScreen}>
        <div style={s.spinner} />
        <style>{keyframes}</style>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     Handlers
     ───────────────────────────────────────────────────────── */
  const clearMessages = () => { setError(""); setInfo(""); };

  /** LOGIN — entrar na conta */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (loginPwd.value.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    const res = await authService.signIn(email, loginPwd.value);
    setBusy(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSession(res.session);
      loginPwd.setValue("");
    }
  }

  /** SIGNUP — cria conta Supabase Auth com e-mail e senha escolhidos pelo usuário.
   * Qualquer e-mail é aceito — não precisa ser o e-mail do comprador Stripe.
   * A licença é verificada após o login pelo checkAndClaimLicense. */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (!isValid(strength)) {
      setError("Password does not meet all requirements.");
      return;
    }

    if (newPwd.value !== confirmPwd.value) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const res = await authService.signUp(email, newPwd.value);
    setBusy(false);

    if (res.error) {
      setError(res.error);
    } else {
      setInfo("Account successfully created.");
      newPwd.setValue("");
      confirmPwd.setValue("");
      setTimeout(() => {
        setScreen("login");
        clearMessages();
      }, 1500);
    }
  }

  /** ESQUECI MINHA SENHA — verificar e-mail */
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    setBusy(true);
    const res = await authService.resetPassword(email);
    setBusy(false);

    if (res.error) {
      setError(res.error);
    } else {
      newPwd.setValue("");
      confirmPwd.setValue("");
      setScreen("new_password");
    }
  }

  /** DEFINIR NOVA SENHA — fluxo de recovery (link enviado por e-mail) */
  async function handleNewPassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!isValid(strength)) {
      setError("Password does not meet all requirements.");
      return;
    }

    if (newPwd.value !== confirmPwd.value) {
      setError("Passwords do not match.");
      return;
    }

    // Limpa o flag de recovery ANTES de chamar updatePassword.
    // Assim, quando onAuthStateChange disparar após o update,
    // a verificação de licença será executada normalmente.
    inRecoveryRef.current = false;

    setBusy(true);
    const res = await authService.updatePassword(newPwd.value);
    setBusy(false);

    if (res.error) {
      inRecoveryRef.current = true; // restaura o flag se a atualização falhou
      setError(res.error);
    } else {
      setInfo("Password successfully changed.");
      newPwd.setValue("");
      confirmPwd.setValue("");
      // onAuthStateChange dispara com a sessão ativa e a verificação de licença
      // será executada automaticamente (inRecoveryRef já é false).
    }
  }

  /* ─────────────────────────────────────────────────────────
     Renders
     ───────────────────────────────────────────────────────── */
  return (
    <div style={s.page}>
      {/* Orbs decorativos */}
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      {/* ── TELA: LOGIN ── */}
      {screen === "login" && (
        <div style={s.glass}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <h1 style={s.title}>PotchX</h1>
          <p style={s.subtitle}>Sign in to your account</p>

          <form onSubmit={handleLogin} style={s.form} noValidate>
            {/* E-mail */}
            <Field label="Email">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                style={s.input}
                onFocus={(e) => focusStyle(e, true)}
                onBlur={(e)  => focusStyle(e, false)}
              />
            </Field>

            {/* Senha */}
            <Field label="Password">
              <PasswordInput field={loginPwd} placeholder="••••••••" id="login-password" />
            </Field>

            {error && <p style={s.errorMsg}>{error}</p>}
            {info  && <p style={s.infoMsg}>{info}</p>}

            <Btn loading={busy} label="Sign In" />
          </form>

          <div style={s.divider}><span style={s.dividerText}>or</span></div>

          <p style={s.body}>
            First time here?{" "}
            <button
              style={s.linkBtn}
              onClick={() => { setScreen("signup"); clearMessages(); loginPwd.setValue(""); }}
            >
              Create Account
            </button>
          </p>
          <p style={{ ...s.body, marginTop: 8 }}>
            <button
              style={s.linkBtn}
              onClick={() => { setScreen("forgot_password"); clearMessages(); loginPwd.setValue(""); }}
            >
              Forgot Password?
            </button>
          </p>
          <p style={s.footer}>Restricted access · PotchX &copy; {new Date().getFullYear()}</p>
        </div>
      )}

      {/* ── TELA: SIGNUP (criar conta) ── */}
      {screen === "signup" && (
        <div style={{ ...s.glass, maxWidth: "440px" }}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <h1 style={s.title}>Create your account</h1>
          <p style={s.subtitle}>Set your email and password</p>

          <form onSubmit={handleSignup} style={s.form} noValidate>
            {/* E-mail */}
            <Field label="Email">
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                style={s.input}
                onFocus={(e) => focusStyle(e, true)}
                onBlur={(e)  => focusStyle(e, false)}
              />
            </Field>

            {/* Criar senha */}
            <Field label="Create Password">
              <PasswordInput field={newPwd} placeholder="Create your password" id="signup-pwd" />
            </Field>

            {/* Indicador de força */}
            {newPwd.value.length > 0 && (
              <div style={s.strengthBox}>
                <StrengthRow ok={strength.minLength} label="Minimum 6 characters" />
                <StrengthRow ok={strength.hasUpper}   label="At least 1 uppercase letter" />
                <StrengthRow ok={strength.hasLower}   label="At least 1 lowercase letter" />
                <StrengthRow ok={strength.hasNumber}  label="At least 1 number" />
                <StrengthRow ok={strength.hasSpecial} label="At least 1 symbol (@, #, $, %…)" />
              </div>
            )}

            {/* Confirmar senha */}
            <Field label="Confirm Password">
              <PasswordInput field={confirmPwd} placeholder="Repeat password" id="signup-confirm" />
            </Field>

            {/* Feedback de comparação em tempo real */}
            {confirmPwd.value.length > 0 && newPwd.value !== confirmPwd.value && (
              <p style={s.warnMsg}>⚠ Passwords do not match.</p>
            )}
            {confirmPwd.value.length > 0 && newPwd.value === confirmPwd.value && (
              <p style={s.okMsg}>✓ Passwords match.</p>
            )}

            {error && <p style={s.errorMsg}>{error}</p>}
            {info && <p style={s.infoMsg}>{info}</p>}

            <Btn loading={busy} label="Create Account" disabled={!isValid(strength) || newPwd.value !== confirmPwd.value} />
          </form>

          <button style={{ ...s.ghost, marginTop: 16 }}
            onClick={() => { setScreen("login"); clearMessages(); newPwd.setValue(""); confirmPwd.setValue(""); }}>
            ← Back to Login
          </button>
        </div>
      )}

      {/* ── TELA: RECUPERAÇÃO DE SENHA (forgot password) ── */}
      {screen === "forgot_password" && (
        <div style={s.glass}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <h1 style={s.title}>Reset Password</h1>
          <p style={s.subtitle}>Enter your email to set a new password</p>

          <form onSubmit={handleForgotPassword} style={s.form} noValidate>
            <Field label="Email">
              <input
                id="recovery-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                style={s.input}
                onFocus={(e) => focusStyle(e, true)}
                onBlur={(e)  => focusStyle(e, false)}
              />
            </Field>

            {error && <p style={s.errorMsg}>{error}</p>}
            {info && <p style={s.infoMsg}>{info}</p>}

            <Btn loading={busy} label="Continue" />
          </form>

          <button style={{ ...s.ghost, marginTop: 16 }}
            onClick={() => { setScreen("login"); clearMessages(); }}>
            ← Back to Login
          </button>
        </div>
      )}

      {/* ── TELA: DEFINIR NOVA SENHA ── */}
      {screen === "new_password" && (
        <div style={{ ...s.glass, maxWidth: "440px" }}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <h1 style={s.title}>New Password</h1>
          <p style={s.subtitle}>Choose your new password</p>

          <form onSubmit={handleNewPassword} style={s.form} noValidate>
            {/* Nova senha */}
            <Field label="New Password">
              <PasswordInput field={newPwd} placeholder="Create your new password" id="new-pwd" />
            </Field>

            {/* Indicador de força */}
            {newPwd.value.length > 0 && (
              <div style={s.strengthBox}>
                <StrengthRow ok={strength.minLength} label="Minimum 6 characters" />
                <StrengthRow ok={strength.hasUpper}   label="At least 1 uppercase letter" />
                <StrengthRow ok={strength.hasLower}   label="At least 1 lowercase letter" />
                <StrengthRow ok={strength.hasNumber}  label="At least 1 number" />
                <StrengthRow ok={strength.hasSpecial} label="At least 1 symbol (@, #, $, %…)" />
              </div>
            )}

            {/* Confirmar nova senha */}
            <Field label="Confirm New Password">
              <PasswordInput field={confirmPwd} placeholder="Repeat new password" id="new-confirm" />
            </Field>

            {/* Feedback de comparação em tempo real */}
            {confirmPwd.value.length > 0 && newPwd.value !== confirmPwd.value && (
              <p style={s.warnMsg}>⚠ Passwords do not match.</p>
            )}
            {confirmPwd.value.length > 0 && newPwd.value === confirmPwd.value && (
              <p style={s.okMsg}>✓ Passwords match.</p>
            )}

            {error && <p style={s.errorMsg}>{error}</p>}
            {info && <p style={s.infoMsg}>{info}</p>}

            <Btn loading={busy} label="Confirm" disabled={!isValid(strength) || newPwd.value !== confirmPwd.value} />
          </form>

          <button style={{ ...s.ghost, marginTop: 16 }}
            onClick={() => { setScreen("login"); clearMessages(); newPwd.setValue(""); confirmPwd.setValue(""); }}>
            ← Back to Login
          </button>
        </div>
      )}

      {/* ── TELA: SEM LICENÇA ATIVA ── */}
      {screen === "no_access" && (
        <div style={s.glass}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <h1 style={s.title}>{noAccessInfo.title}</h1>
          <p style={s.subtitle}>{noAccessInfo.subtitle}</p>
          <p style={{ ...s.body, marginTop: 8 }}>
            {noAccessInfo.body}
          </p>
          <button
            style={{ ...s.ghost, marginTop: 24 }}
            onClick={async () => {
              await authService.signOut();
            }}
          >
            ← Sign Out
          </button>
          <p style={s.footer}>PotchX &copy; {new Date().getFullYear()}</p>
        </div>
      )}

      <style>{keyframes}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sub-componentes internos
   ───────────────────────────────────────────────────────────── */

/** Wrapper de campo com label */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

/** Input de senha com botão de olho */
function PasswordInput({
  field,
  placeholder,
  id,
}: {
  field: ReturnType<typeof usePasswordField>;
  placeholder: string;
  id: string;
}) {
  return (
    <div style={s.pwWrap}>
      <input
        id={id}
        type={field.visible ? "text" : "password"}
        value={field.value}
        onChange={(e) => field.setValue(e.target.value)}
        placeholder={placeholder}
        required
        autoComplete="new-password"
        style={{ ...s.input, paddingRight: "48px" }}
        onFocus={(e) => focusStyle(e, true, true)}
        onBlur={(e)  => focusStyle(e, false, true)}
      />
      <button
        type="button"
        aria-label={field.visible ? "Hide Password" : "Show Password"}
        onClick={field.toggle}
        style={s.eyeBtn}
      >
        <span style={{ color: "#94a3b8" }}>
          {field.visible ? <EyeClosed /> : <EyeOpen />}
        </span>
      </button>
    </div>
  );
}

/** Linha do indicador de força */
function StrengthRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: ok ? "#34d399" : "#6b7280", fontSize: 13, lineHeight: 1 }}>
        {ok ? "✓" : "○"}
      </span>
      <span style={{ fontSize: 12, color: ok ? "#a7f3d0" : "#6b7280" }}>{label}</span>
    </div>
  );
}

/** Botão de submit com loading e suporte a desabilitado */
function Btn({ loading, label, disabled = false }: { loading: boolean; label: string; disabled?: boolean }) {
  const isCurrentlyDisabled = loading || disabled;
  return (
    <button
      type="submit"
      disabled={isCurrentlyDisabled}
      style={{
        ...s.btn,
        opacity: isCurrentlyDisabled ? 0.5 : 1,
        cursor: isCurrentlyDisabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? <span style={s.btnSpinner} /> : label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Utilitário de foco inline
   ───────────────────────────────────────────────────────────── */
function focusStyle(
  e: React.FocusEvent<HTMLInputElement>,
  focused: boolean,
  hasRightPad = false,
) {
  const el = e.target;
  el.style.background     = focused ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.07)";
  el.style.borderColor    = focused ? "rgba(59,130,246,0.6)"   : "rgba(255,255,255,0.12)";
  el.style.boxShadow      = focused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none";
  el.style.paddingRight   = hasRightPad ? "48px" : "16px";
}

/* ─────────────────────────────────────────────────────────────
   Keyframes CSS
   ───────────────────────────────────────────────────────────── */
const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @keyframes float1  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.1)} }
  @keyframes float2  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,35px) scale(1.08)} }
  @keyframes float3  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,20px) scale(0.95)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes btnSpin { to{transform:rotate(360deg)} }
  @keyframes fadeIn  { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  input::placeholder { color: rgba(255,255,255,0.25) !important; }
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px rgba(15,45,74,0.95) inset !important;
    -webkit-text-fill-color: #ffffff !important;
    border-color: rgba(255,255,255,0.12) !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

/* ─────────────────────────────────────────────────────────────
   Estilos
   ───────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Inter', sans-serif",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#0a1628 0%,#0f2d4a 40%,#1a3a5c 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "24px 16px",
  },
  orb1: {
    position: "absolute", top: "-15%", left: "-10%",
    width: 520, height: 520, borderRadius: "50%",
    background: "radial-gradient(circle,rgba(59,130,246,.18) 0%,transparent 70%)",
    animation: "float1 12s ease-in-out infinite", pointerEvents: "none",
  },
  orb2: {
    position: "absolute", bottom: "-20%", right: "-10%",
    width: 600, height: 600, borderRadius: "50%",
    background: "radial-gradient(circle,rgba(16,185,129,.14) 0%,transparent 70%)",
    animation: "float2 15s ease-in-out infinite", pointerEvents: "none",
  },
  orb3: {
    position: "absolute", top: "40%", left: "55%",
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)",
    animation: "float3 10s ease-in-out infinite", pointerEvents: "none",
  },
  glass: {
    position: "relative", zIndex: 10,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: "44px 36px 32px",
    width: "100%", maxWidth: 400,
    boxShadow: "0 32px 64px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.06) inset",
    animation: "fadeIn 0.55s cubic-bezier(0.22,1,0.36,1) both",
  },
  logoWrap:  { display: "flex", justifyContent: "center", marginBottom: 14 },
  title: {
    margin: "0 0 6px", textAlign: "center",
    fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "0 0 28px", textAlign: "center",
    fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.6,
  },
  body: { fontSize: 13, color: "rgba(255,255,255,.45)", textAlign: "center", lineHeight: 1.7, margin: "0 0 8px" },
  form:      { display: "flex", flexDirection: "column", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 7 },
  label:     { fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.7)", letterSpacing: "0.02em" },
  input: {
    width: "100%", padding: "13px 16px", fontSize: 15,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, color: "#fff", outline: "none",
    boxSizing: "border-box",
    transition: "border-color .2s,box-shadow .2s,background .2s",
  } as React.CSSProperties,
  pwWrap:  { position: "relative", display: "flex", alignItems: "center" },
  eyeBtn: {
    position: "absolute", right: 14, background: "none", border: "none",
    cursor: "pointer", padding: 4, display: "flex", alignItems: "center", lineHeight: 1,
  },
  strengthBox: {
    background: "rgba(0,0,0,.2)", borderRadius: 10,
    padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6,
    border: "1px solid rgba(255,255,255,.06)",
  },
  errorMsg: {
    margin: 0, padding: "10px 14px",
    background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)",
    borderRadius: 10, color: "#fca5a5", fontSize: 13, textAlign: "center",
  },
  warnMsg: {
    margin: 0, fontSize: 12, color: "#fbbf24", textAlign: "left",
  },
  okMsg: {
    margin: 0, fontSize: 12, color: "#34d399", textAlign: "left",
  },
  infoMsg: {
    margin: "8px 0 0", padding: "10px 14px",
    background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)",
    borderRadius: 10, color: "#6ee7b7", fontSize: 13, textAlign: "center",
  },
  btn: {
    marginTop: 4, padding: "14px", fontSize: 15, fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#3b82f6 100%)",
    border: "none", borderRadius: 12, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(59,130,246,.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    height: 50, letterSpacing: "0.02em", transition: "opacity .2s",
    width: "100%",
  },
  btnSpinner: {
    display: "inline-block", width: 20, height: 20,
    border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
    borderRadius: "50%", animation: "btnSpin .7s linear infinite",
  },
  ghost: {
    display: "block", width: "100%", marginTop: 8,
    background: "none", border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12, color: "rgba(255,255,255,.5)", fontSize: 13,
    padding: "11px", cursor: "pointer", letterSpacing: "0.01em",
    transition: "border-color .2s,color .2s",
  },
  linkBtn: {
    background: "none", border: "none", color: "#60a5fa",
    cursor: "pointer", fontSize: 13, fontWeight: 500, padding: 0,
    textDecoration: "underline",
  },
  divider: {
    display: "flex", alignItems: "center",
    margin: "18px 0 4px",
    gap: 10,
  },
  dividerText: {
    color: "rgba(255,255,255,.2)", fontSize: 12,
    flexShrink: 0, margin: "0 auto",
  },
  footer: {
    marginTop: 24, textAlign: "center",
    fontSize: 11, color: "rgba(255,255,255,.2)",
  },
  loadingScreen: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center", background: "#0a1628",
  },
  spinner: {
    width: 36, height: 36,
    border: "3px solid rgba(255,255,255,.1)", borderTopColor: "#3b82f6",
    borderRadius: "50%", animation: "spin .8s linear infinite",
  },
};
