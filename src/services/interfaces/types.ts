export interface User {
  id: string;
  email: string;
}

export interface Session {
  user: User;
  token?: string;
  expiresAt?: number;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: string | null;
}

export interface IAuthService {
  signUp(email: string, password: string): Promise<AuthResponse>;
  signIn(email: string, password: string): Promise<AuthResponse>;
  signOut(): Promise<{ error: string | null }>;
  resetPassword(email: string): Promise<{ error: string | null }>;
  updatePassword(password: string, email?: string): Promise<{ error: string | null }>;
  getSession(): Promise<Session | null>;
  getUser(): Promise<User | null>;
  onAuthStateChange(callback: (session: Session | null) => void): { unsubscribe: () => void };
}
