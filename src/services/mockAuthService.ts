import { IAuthService, Session, AuthResponse, User } from "./interfaces/types";

const USERS_KEY = "potchx_users";
const SESSION_KEY = "potchx_session";

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
}

export class MockAuthService implements IAuthService {
  private listeners: ((session: Session | null) => void)[] = [];

  private simulateDelay(): Promise<void> {
    const ms = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getStoredUsers(): StoredUser[] {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveStoredUsers(users: StoredUser[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private notify(session: Session | null): void {
    this.listeners.forEach((listener) => listener(session));
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    await this.simulateDelay();
    const users = this.getStoredUsers();
    
    const emailLower = email.toLowerCase().trim();
    if (users.some((u) => u.email === emailLower)) {
      return {
        user: null,
        session: null,
        error: "Este e-mail já está cadastrado.",
      };
    }

    const newUser: StoredUser = {
      id: Math.random().toString(36).substring(2, 11),
      email: emailLower,
      passwordHash: password,
    };

    users.push(newUser);
    this.saveStoredUsers(users);

    const user: User = { id: newUser.id, email: newUser.email };

    return {
      user,
      session: null,
      error: null,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    await this.simulateDelay();
    const users = this.getStoredUsers();
    
    const emailLower = email.toLowerCase().trim();
    const matchedUser = users.find(
      (u) => u.email === emailLower && u.passwordHash === password
    );

    if (!matchedUser) {
      return {
        user: null,
        session: null,
        error: "E-mail ou senha incorretos.",
      };
    }

    const user: User = { id: matchedUser.id, email: matchedUser.email };
    const session: Session = { user };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.notify(session);

    return {
      user,
      session,
      error: null,
    };
  }

  async signOut(): Promise<{ error: string | null }> {
    await this.simulateDelay();
    localStorage.removeItem(SESSION_KEY);
    this.notify(null);
    return { error: null };
  }

  async getSession(): Promise<Session | null> {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    if (!sessionJson) return null;
    try {
      return JSON.parse(sessionJson) as Session;
    } catch {
      return null;
    }
  }

  async getUser(): Promise<User | null> {
    const session = await this.getSession();
    return session ? session.user : null;
  }

  onAuthStateChange(callback: (session: Session | null) => void): { unsubscribe: () => void } {
    this.listeners.push(callback);
    
    this.getSession().then((session) => {
      callback(session);
    });

    return {
      unsubscribe: () => {
        this.listeners = this.listeners.filter((l) => l !== callback);
      },
    };
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    await this.simulateDelay();
    const users = this.getStoredUsers();
    const emailLower = email.toLowerCase().trim();
    const exists = users.some((u) => u.email === emailLower);

    if (!exists) {
      return { error: "Este e-mail não está cadastrado." };
    }
    return { error: null };
  }

  async updatePassword(password: string, email?: string): Promise<{ error: string | null }> {
    await this.simulateDelay();
    const users = this.getStoredUsers();
    let targetEmail = email?.toLowerCase().trim();

    if (!targetEmail) {
      const activeUser = await this.getUser();
      if (!activeUser) {
        return { error: "Nenhum usuário ativo para atualizar a senha." };
      }
      targetEmail = activeUser.email.toLowerCase().trim();
    }

    const userIndex = users.findIndex((u) => u.email === targetEmail);
    if (userIndex === -1) {
      return { error: "Usuário não encontrado." };
    }

    users[userIndex].passwordHash = password;
    this.saveStoredUsers(users);
    return { error: null };
  }
}
