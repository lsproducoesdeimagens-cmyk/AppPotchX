import { IAuthService, Session, AuthResponse, User } from "./interfaces/types";

export class SupabaseAuthService implements IAuthService {
  async signUp(email: string, password: string): Promise<AuthResponse> {
    return { user: null, session: null, error: "SupabaseAuthService não configurado (stub)." };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return { user: null, session: null, error: "SupabaseAuthService não configurado (stub)." };
  }

  async signOut(): Promise<{ error: string | null }> {
    return { error: null };
  }

  async getSession(): Promise<Session | null> {
    return null;
  }

  async getUser(): Promise<User | null> {
    return null;
  }

  onAuthStateChange(callback: (session: Session | null) => void): { unsubscribe: () => void } {
    return {
      unsubscribe: () => {}
    };
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    return { error: "SupabaseAuthService não configurado (stub)." };
  }

  async updatePassword(password: string, email?: string): Promise<{ error: string | null }> {
    return { error: "SupabaseAuthService não configurado (stub)." };
  }
}
