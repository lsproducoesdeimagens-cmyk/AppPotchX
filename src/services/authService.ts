import { SupabaseAuthService } from "./supabaseAuthService";

// Instancia o SupabaseAuthService como serviço de autenticação real do app.
// A interface IAuthService é idêntica ao MockAuthService — nenhuma tela foi alterada.
export const authService = new SupabaseAuthService();
