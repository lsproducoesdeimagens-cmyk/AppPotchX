import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase variables in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log("Testando conexão com Supabase...");

  // 1. Verificar usuários (via auth se possível, mas como anon não podemos listar,
  // então vamos testar a tabela travel_documents)

  const { data, error } = await supabase
    .from("travel_documents")
    .select("id, created_at")
    .limit(5);

  if (error) {
    console.error(
      "Erro na interação com Supabase (travel_documents):",
      error.message,
    );
  } else {
    console.log("Sucesso! Interação realizada com Supabase.");
    console.log("Últimos documentos salvos:", data);
  }
}

testSupabase();
