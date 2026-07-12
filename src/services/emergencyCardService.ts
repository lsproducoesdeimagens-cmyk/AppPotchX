import { supabase } from "./supabaseClient";

export interface EmergencyCardData {
  full_name: string;
  blood_type?: string;
  rh_factor?: string;
  nationality?: string;
  medications?: string;
  allergies?: string;
  disease_type?: string;
  hotel_address?: string;
  hotel_phone?: string;
  destination_country?: string;
  emergency_name?: string;
  emergency_phone?: string;
  passport_image_url?: string;
  destination_language?: string;
}

export interface SavedEmergencyCard extends EmergencyCardData {
  id: string;
  created_at: string;
}

/**
 * Salva um cartão de emergência no banco de dados Supabase.
 * @returns O cartão salvo com id e created_at, ou null em caso de erro.
 */
export async function saveEmergencyCard(
  data: EmergencyCardData
): Promise<SavedEmergencyCard | null> {
  const { data: saved, error } = await supabase
    .from("emergency_cards")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar cartão de emergência:", error.message);
    return null;
  }

  return saved as SavedEmergencyCard;
}

/**
 * Lista os cartões de emergência mais recentes.
 * @param limit Número máximo de registros a retornar (padrão: 10).
 */
export async function listEmergencyCards(
  limit = 10
): Promise<SavedEmergencyCard[]> {
  const { data, error } = await supabase
    .from("emergency_cards")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar cartões de emergência:", error.message);
    return [];
  }

  return (data ?? []) as SavedEmergencyCard[];
}
