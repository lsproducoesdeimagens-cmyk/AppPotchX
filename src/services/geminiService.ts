import { supabase } from "./supabaseClient";

// Simple in-memory cache to improve fluidity on slower connections
const translationCache: Record<string, any> = {};

export async function getBackupExplanation(country: string) {
  const cacheKey = `explanation_${country.toLowerCase()}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    const { data, error } = await supabase.functions.invoke("translate-data", {
      body: { action: "getBackupExplanation", country },
    });

    if (error) throw error;
    
    const result = data?.text || "Sorry, I couldn't generate an explanation.";
    translationCache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error("Error calling translate-data Edge Function:", error);
    return "An error occurred while trying to generate the explanation. Please try again.";
  }
}

export async function getTranslatedForm(country: string) {
  const cacheKey = `form_${country.toLowerCase()}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    const { data, error } = await supabase.functions.invoke("translate-data", {
      body: { action: "getTranslatedForm", country },
    });

    if (error) throw error;

    translationCache[cacheKey] = data;
    return data;
  } catch (error) {
    console.error("Error translating form via Edge Function:", error);
    return null;
  }
}

export async function translateFormData(data: any, country: string) {
  // Apenas os três campos de dados médicos digitados pelo usuário são enviados para a IA.
  // Rótulos, títulos e demais textos já são traduzidos localmente e não são enviados.
  const fieldsToTranslate = {
    medications: data.medications,
    allergies: data.allergies,
    diseaseType: data.diseaseType,
  };

  try {
    const { data: translatedFields, error } = await supabase.functions.invoke("translate-data", {
      body: { 
        action: "translateFormData", 
        country,
        // Mandamos os campos de saúde como contexto extra para a Edge Function processar
        healthData: fieldsToTranslate
      },
    });

    if (error) throw error;

    // Retorna o objeto completo, substituindo apenas os três campos médicos pelos traduzidos.
    // Todos os demais dados (nome, nacionalidade, hotel, etc.) permanecem intocados.
    return {
      ...data,
      medications: translatedFields.medications || data.medications,
      allergies: translatedFields.allergies || data.allergies,
      diseaseType: translatedFields.diseaseType || data.diseaseType,
    };
  } catch (error) {
    console.error("Error translating medical data via Edge Function:", error);
    return data;
  }
}

