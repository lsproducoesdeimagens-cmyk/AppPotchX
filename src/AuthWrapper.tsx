/**
 * AuthWrapper — Gerencia autenticação via Supabase Auth.
 *
 * Estados:
 *  - checking      : verificando sessão existente
 *  - login         : tela de login (acessos subsequentes)
 *  - signup        : tela de cadastro de senha (primeiro acesso)
 *  - verify_email  : aguardando confirmação de e-mail
 *  - authenticated : renderiza o App original intocado
 *
 * Regras de senha:
 *  - mínimo 6 caracteres
 *  - pelo menos 1 letra maiúscula
 *  - pelo menos 1 letra minúscula
 *  - pelo menos 1 número
 *  - pelo menos 1 símbolo especial (@, #, $, %, !, etc.)
 *
 * NÃO modifica nenhum componente visual do App original.
 */

import React, { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabaseClient";

/* ─────────────────────────────────────────────────────────────
   Tipos
───────────────────────────────────────────────────────────── */
type AuthScreen = "checking" | "login" | "signup" | "verify_email";

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
   Validação de senha
───────────────────────────────────────────────────────────── */
const SPECIAL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

function checkStrength(pwd: string): PasswordStrength {
  return {
    minLength: pwd.length >= 6,
    hasUpper:  /[A-Z]/.test(pwd),
    hasLower:  /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: SPECIAL_RE.test(pwd),
  };
}

function isValid(s: PasswordStrength): boolean {
  return Object.values(s).every(Boolean);
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
const ShieldLogo = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
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
   Componente principal
───────────────────────────────────────────────────────────── */
export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [screen, setScreen]   = useState<AuthScreen>("checking");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");
  const [busy, setBusy]       = useState(false);

  // Campos de senha
  const newPwd     = usePasswordField();
  const confirmPwd = usePasswordField();
  const loginPwd   = usePasswordField();

  // Força da senha
  const strength = checkStrength(newPwd.value);

  // Referência para evitar loop no listener
  const handledRef = useRef(false);

  /* ── Inicialização: verifica sessão ── */
  useEffect(() => {
    const checkHashAndSession = async () => {
      const hash = window.location.hash || "";
      const searchParams = new URLSearchParams(window.location.search);
      const isInviteOrRecovery = hash.includes("access_token") || searchParams.has("type") || hash.includes("type=signup") || hash.includes("type=invite") || hash.includes("type=recovery");

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Se temos sessão, mas é o fluxo de primeiro acesso por convite/cadastro ou link:
        if (isInviteOrRecovery || (session.user?.app_metadata?.provider === "email" && !session.user?.last_sign_in_at)) {
          // Mantém desautenticado temporariamente no front para que ele defina as credenciais manualmente na tela de signup
          setSession(null);
          // O e-mail NÃO deve ser preenchido automaticamente, o usuário deve digitar manualmente.
          setEmail("");
          setScreen("signup");
        } else {
          setSession(session);
        }
      } else {
        if (isInviteOrRecovery) {
          setEmail("");
          setScreen("signup");
        } else {
          setScreen("login");
        }
      }
    };

    checkHashAndSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const hash = window.location.hash || "";
          const isFirstAccess = hash.includes("type=invite") || hash.includes("type=signup") || hash.includes("type=recovery") || !session.user?.last_sign_in_at;

          if (isFirstAccess && !handledRef.current) {
            handledRef.current = true;
            setSession(null);
            setEmail("");
            setScreen("signup");
          } else if (!handledRef.current) {
            handledRef.current = true;
            setSession(session);
            setScreen("checking"); // força re-render limpo
          }
        }
        if (event === "SIGNED_OUT") {
          handledRef.current = false;
          setSession(null);
          setScreen("login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /* ── Autenticado: renderiza o App original ── */
  if (session) return <>{children}</>;

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

  /** LOGIN — acessos subsequentes */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: loginPwd.value,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        setError("E-mail ou senha incorretos.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("E-mail não confirmado. Verifique sua caixa de entrada.");
      } else {
        setError(error.message);
      }
    }
    setBusy(false);
  };

  /** SIGNUP — primeiro acesso */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Valida regras
    if (!isValid(strength)) {
      setError("A senha não atende a todos os requisitos.");
      return;
    }
    if (newPwd.value !== confirmPwd.value) {
      setError("As senhas não coincidem.");
      return;
    }

    setBusy(true);

    // Se o usuário veio por um convite, ele já está pré-autenticado temporariamente na sessão ou nós atualizamos via updateUser.
    // Primeiro tentamos atualizar a senha do usuário logado (caso ele tenha entrado via link e esteja no fluxo de primeiro acesso).
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (currentSession) {
      // Usuário está temporariamente logado via link de convite. Atualiza a senha.
      const { error } = await supabase.auth.updateUser({
        password: newPwd.value
      });

      if (error) {
        setError(error.message);
        setBusy(false);
      } else {
        // Sucesso: Autentica o usuário no front e redireciona
        setSession(currentSession);
        setBusy(false);
      }
    } else {
      // Caso comum: Usuário está preenchendo o formulário sem uma sessão de convite ativa no momento.
      // Tentamos o signUp normal.
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password: newPwd.value,
        options: {
          emailRedirectTo: "https://copiadeseguranca.com/potchx/",
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          // Se o usuário já está cadastrado (foi convidado via admin no webhook), 
          // mas não está com sessão ativa (por exemplo, clicou no link mas a sessão expirou),
          // ele deve definir a senha. Como não há sessão ativa, instruímos que use a recuperação de senha
          // ou tentamos fazer signIn com a senha digitada se ele já a definiu.
          setError("Este e-mail já está pré-cadastrado. Por favor, acesse o link enviado ao seu e-mail.");
        } else {
          setError(error.message);
        }
      } else {
        if (data.session) {
          setSession(data.session);
        } else {
          setScreen("verify_email");
        }
      }
      setBusy(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     Renders
  ───────────────────────────────────────────────────────── */
  return (
    <div style={s.page}>
      {/* Orbs decorativos */}
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      {/* ── TELA: AGUARDANDO CONFIRMAÇÃO DE E-MAIL ── */}
      {screen === "verify_email" && (
        <div style={s.glass}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <div style={s.emailIcon}>✉️</div>
          <h1 style={s.title}>Verifique seu e-mail</h1>
          <p style={s.subtitle}>
            Enviamos um link de confirmação para<br />
            <strong style={{ color: "#93c5fd" }}>{email}</strong>
          </p>
          <p style={{ ...s.body, marginBottom: 24 }}>
            Clique no link do e-mail para ativar sua conta. Após a
            confirmação, você será redirecionado automaticamente para o
            aplicativo.
          </p>
          <p style={s.body}>
            Não recebeu?{" "}
            <button
              style={s.linkBtn}
              onClick={async () => {
                clearMessages();
                setBusy(true);
                await supabase.auth.resend({ type: "signup", email: email.trim() });
                setInfo("E-mail reenviado com sucesso.");
                setBusy(false);
              }}
              disabled={busy}
            >
              Reenviar e-mail
            </button>
          </p>
          {info  && <p style={s.infoMsg}>{info}</p>}
          {error && <p style={s.errorMsg}>{error}</p>}
          <button style={s.ghost} onClick={() => { setScreen("login"); clearMessages(); }}>
            ← Voltar ao login
          </button>
        </div>
      )}

      {/* ── TELA: LOGIN ── */}
      {screen === "login" && (
        <div style={s.glass}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <h1 style={s.title}>PotchX</h1>
          <p style={s.subtitle}>Entre com sua conta</p>

          <form onSubmit={handleLogin} style={s.form} noValidate>
            {/* E-mail */}
            <Field label="E-mail">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                style={s.input}
                onFocus={(e) => focusStyle(e, true)}
                onBlur={(e)  => focusStyle(e, false)}
              />
            </Field>

            {/* Senha */}
            <Field label="Senha">
              <PasswordInput field={loginPwd} placeholder="••••••••" id="login-password" />
            </Field>

            {error && <p style={s.errorMsg}>{error}</p>}

            <Btn loading={busy} label="Entrar" />
          </form>

          <div style={s.divider}><span style={s.dividerText}>ou</span></div>

          <p style={s.body}>
            Primeiro acesso?{" "}
            <button
              style={s.linkBtn}
              onClick={() => { setScreen("signup"); clearMessages(); loginPwd.setValue(""); }}
            >
              Criar conta
            </button>
          </p>
          <p style={s.footer}>Acesso restrito · PotchX &copy; {new Date().getFullYear()}</p>
        </div>
      )}

      {/* ── TELA: SIGNUP (criar senha) ── */}
      {screen === "signup" && (
        <div style={{ ...s.glass, maxWidth: "440px" }}>
          <div style={s.logoWrap}><ShieldLogo /></div>
          <h1 style={s.title}>Crie seu acesso ao PotchX</h1>
          <p style={s.subtitle}>Defina seu e-mail e senha de acesso</p>

          <form onSubmit={handleSignup} style={s.form} noValidate>
            {/* E-mail */}
            <Field label="E-mail">
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                style={s.input}
                onFocus={(e) => focusStyle(e, true)}
                onBlur={(e)  => focusStyle(e, false)}
              />
            </Field>

            {/* Nova senha */}
            <Field label="Nova senha">
              <PasswordInput field={newPwd} placeholder="Crie sua senha" id="signup-pwd" />
            </Field>

            {/* Indicador de força */}
            {newPwd.value.length > 0 && (
              <div style={s.strengthBox}>
                <StrengthRow ok={strength.minLength} label="Mínimo 6 caracteres" />
                <StrengthRow ok={strength.hasUpper}   label="Pelo menos 1 letra maiúscula" />
                <StrengthRow ok={strength.hasLower}   label="Pelo menos 1 letra minúscula" />
                <StrengthRow ok={strength.hasNumber}  label="Pelo menos 1 número" />
                <StrengthRow ok={strength.hasSpecial} label="Pelo menos 1 símbolo (@, #, $, %…)" />
              </div>
            )}

            {/* Confirmar senha */}
            <Field label="Confirmar nova senha">
              <PasswordInput field={confirmPwd} placeholder="Repita a senha" id="signup-confirm" />
            </Field>

            {/* Feedback de comparação em tempo real */}
            {confirmPwd.value.length > 0 && newPwd.value !== confirmPwd.value && (
              <p style={s.warnMsg}>⚠ As senhas não coincidem.</p>
            )}
            {confirmPwd.value.length > 0 && newPwd.value === confirmPwd.value && (
              <p style={s.okMsg}>✓ Senhas coincidem.</p>
            )}

            {error && <p style={s.errorMsg}>{error}</p>}

            <Btn loading={busy} label="Confirmar cadastro" />
          </form>

          <button style={{ ...s.ghost, marginTop: 16 }}
            onClick={() => { setScreen("login"); clearMessages(); newPwd.setValue(""); confirmPwd.setValue(""); }}>
            ← Voltar ao login
          </button>
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
        aria-label={field.visible ? "Ocultar senha" : "Mostrar senha"}
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

/** Botão de submit com loading */
function Btn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
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
  emailIcon: { textAlign: "center", fontSize: 40, marginBottom: 8 },
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
