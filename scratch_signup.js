import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase variables in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignUp() {
  console.log("1. Testando as credenciais locais do Supabase...");
  console.log("URL conectada:", supabaseUrl);

  const testEmail = `tester${Date.now()}@exemplo.com.br`;
  const testPassword = "TestPassword1234!";

  console.log(`\n2. Tentando cadastrar usuário (Modo CLI): ${testEmail}`);
  console.log(
    "Senha de teste (com maiuscula, minuscula, 4 numeros, 1 simbolo):",
    testPassword,
  );

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      console.error("\n❌ ERRO DO SUPABASE AO CADASTRAR:", error.message);
      console.error("Detalhes do erro completo:", error);
    } else {
      console.log(
        "\n✅ SUCESSO! O Supabase processou o cadastro perfeitamente.",
      );
      console.log(
        "User inserido ou requisição aceita:",
        data.user ? data.user.id : "Nenhum (mas sem erro)",
      );
    }
  } catch (e) {
    console.error("Exceção capturada:", e);
  }
}

testSignUp();
