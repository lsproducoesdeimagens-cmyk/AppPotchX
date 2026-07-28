/**
 * SupabaseAuthService — Implementação real do IAuthService usando @supabase/supabase-js.
 *
 * Substitui o MockAuthService sem alterar qualquer interface, tela ou componente visual.
 * Métodos implementados:
 *  - signUp       : cria conta no Supabase Auth (usado no fluxo de convite para definir senha)
 *  - signIn       : login com e-mail e senha
 *  - signOut      : encerra a sessão
 *  - getSession   : recupera sessão ativa
 *  - getUser      : recupera usuário da sessão ativa
 *  - onAuthStateChange : listener de mudança de estado de autenticação
 *  - resetPassword     : envia e-mail de redefinição de senha via Supabase
 *  - updatePassword    : atualiza a senha do usuário autenticado
 */

import { supabase } from "./supabaseClient";
import type { IAuthService, Session, AuthResponse, User } from "./interfaces/types";

/** Mapeia os campos do Supabase para os tipos internos do app */
function mapSession(supabaseSession: { user: { id: string; email?: string } } | null): Session | null {
  if (!supabaseSession) return null;
  const u = supabaseSession.user;
  return {
    user: {
      id: u.id,
      email: u.email ?? "",
    },
  };
}

export class SupabaseAuthService implements IAuthService {
  // ─── signUp ────────────────────────────────────────────────────────────────
  // Cria um novo usuário no Supabase Auth.
  // Usado quando o cliente clica no link de convite e define a sua senha.
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    const user: User | null = data.user
      ? { id: data.user.id, email: data.user.email ?? "" }
      : null;

    const session: Session | null = mapSession(data.session as any);

    return { user, session, error: null };
  }

  // ─── signIn ────────────────────────────────────────────────────────────────
  // Login com e-mail e senha.
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    const user: User | null = data.user
      ? { id: data.user.id, email: data.user.email ?? "" }
      : null;

    const session: Session | null = mapSession(data.session as any);

    return { user, session, error: null };
  }

  // ─── signOut ───────────────────────────────────────────────────────────────
  async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }

  // ─── getSession ────────────────────────────────────────────────────────────
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return mapSession(data.session as any);
  }

  // ─── getUser ───────────────────────────────────────────────────────────────
  async getUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  // ─── onAuthStateChange ─────────────────────────────────────────────────────
  // Registra listener de mudança de estado de autenticação do Supabase.
  // O Supabase chama o callback imediatamente com a sessão atual, e sempre
  // que o estado mudar (login, logout, token refresh, etc.).
  onAuthStateChange(callback: (session: Session | null) => void): { unsubscribe: () => void } {
    const { data } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      callback(mapSession(supabaseSession as any));
    });

    return {
      unsubscribe: () => data.subscription.unsubscribe(),
    };
  }

  // ─── resetPassword ─────────────────────────────────────────────────────────
  // Envia e-mail de redefinição de senha via Supabase Auth.
  // O link no e-mail terá type=recovery e redirecionará para o app.
  async resetPassword(email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    return { error: error?.message ?? null };
  }

  // ─── updatePassword ────────────────────────────────────────────────────────
  // Atualiza a senha do usuário autenticado na sessão ativa.
  // Chamado após o usuário definir nova senha (fluxo de convite ou recovery).
  async updatePassword(password: string, _email?: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }
}
