import { MockAuthService } from "./mockAuthService";
// import { SupabaseAuthService } from "./supabaseAuthService";

// Instancia o MockAuthService como serviço de autenticação ativo para o app.
// Futuramente, basta trocar pela instância de SupabaseAuthService sem afetar as telas.
export const authService = new MockAuthService();
