import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment variables.");
    }
    
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Simple in-memory cache to improve fluidity on slower connections
const translationCache: Record<string, any> = {};

export async function getBackupExplanation(country: string) {
  const cacheKey = `explanation_${country.toLowerCase()}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  const model = "gemini-2.5-flash";
  const ai = getAI();

  const prompt = `The user is from "${country}". 
  1. Identify the primary language spoken in "${country}".
  2. Explain what a "backup" (data backup/cópia de segurança) is in that language.
  3. The explanation should be clear, professional, and helpful for a general user.
  4. Format the output in Markdown. 
  5. Start the response with a friendly greeting in that language.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Sorry, I couldn't generate an explanation.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "An error occurred while trying to generate the explanation. Please try again.";
  }
}

export async function getTranslatedForm(country: string) {
  const cacheKey = `form_${country.toLowerCase()}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  const model = "gemini-2.5-flash";
  const ai = getAI();

  const prompt = `Translate the following form labels and placeholders into the primary language of "${country}". 
  Return a JSON object matching the requested schema.
  
  Labels to translate:
  - title: "Cópia de Segurança"
  - subtitle: "Preencha seus dados para gerar uma cópia de segurança para viagem. Imprima e leve sempre com você."
  - personalData: "Dados Pessoais"
  - fullName: "Nome Completo"
  - bloodType: "Tipo Sanguíneo"
  - rhFactor: "Fator RH"
  - nationality: "Nacionalidade"
  - healthInfo: "DADOS de Saúde"
  - medications: "Medicamentos em Uso"
  - allergies: "Alergias"
  - diseaseType: "Condições Médicas"
  - hotelData: "Dados do Hotel"
  - hotelAddress: "Endereço do Hotel"
  - hotelPhone: "Telefone do Hotel"
  - emergencyContact: "Contato de Emergência"
  - emergencyName: "Nome"
  - emergencyPhone: "Telefone"
  - destinationCountry: "País de Destino"
  - passportPhoto: "Foto do Passaporte"
  - uploadText: "Clique para enviar a foto do passaporte"
  - viewDoc: "Visualizar Cópia"
  - downloadPdf: "Baixar PDF"
  - select: "Selecione"
  - placeholderMedications: "Seus medicamentos ou 'Não'"
  - placeholderAllergies: "Suas alergias ou 'Não'"
  - placeholderDisease: "Informe as condições médicas ou 'Não'"
  - placeholderHotelAddress: "Nome e endereço completo do hotel"
  - placeholderHotelPhone: "Telefone do hotel"
  - placeholderEmergencyName: "Nome do contato de emergência"
  - placeholderEmergencyPhone: "Telefone do contato"
  - successTitle: "Cópia de Segurança Salva!"
  - successMessage: "Sua **Cópia de Segurança** foi salva com sucesso no seu dispositivo."
  - downloadAgain: "Baixar PDF Novamente"
  - close: "Fechar"
  - presentationTitle: "Cópia de Segurança para Viagem"
  - presentationSubtitle: "(Backup de Segurança)"
  - presentationDescription: "A Cópia de Segurança para Viagem é uma ferramenta de identificação digital projetada para lhe dar tranquilidade enquanto explora. Ela permite que você mantenha seus documentos originais seguros, garantindo que você tenha todas as suas informações essenciais à mão."
  - whyUseIt: "Por que usar?"
  - keepOriginalsTitle: "Mantenha os Originais Seguros"
  - keepOriginalsDesc: "Deixe seu Passaporte ou RG original no cofre do hotel. Use esta cópia para atividades diárias, idas à praia e vida noturna."
  - emergencyReadyTitle: "Pronto para Emergências"
  - emergencyReadyDesc: "Centraliza seu tipo sanguíneo, alergias e informações de contato do hotel local — traduzidos para o idioma local do país que você está visitando."
  - totalPrivacyTitle: "Privacidade Total"
  - totalPrivacyDesc: "Para sua segurança, nenhum dado é armazenado no aplicativo. Suas informações e fotos são salvas apenas na galeria do seu telefone e são excluídas permanentemente do sistema do aplicativo após cada download."
  - notLegalSubstituteTitle: "Importante: Não é um Substituto Legal"
  - notLegalSubstituteDesc: "Esta cópia é apenas para assistência informativa e de identificação. Ela não substitui seus documentos oficiais originais em situações formais."
  - mustCarryTitle: "Você DEVE portar seu Passaporte ou RG original para:"
  - immigrationBorders: "Imigração e Fronteiras"
  - flightsHotelCheckin: "Voos e Check-in em Hotéis"
  - policeEncounters: "Encontros com a Polícia"
  - bankingExchange: "Operações Bancárias e Câmbio"
  - nextButton: "Próximo"
  - originCountryLabel: "Qual é o seu país de origem?"
  - originCountryPlaceholder: "Digite seu país de origem..."
  - getTranslationButton: "Obter Tradução Local"
  - backToPresentation: "Voltar para apresentação"
  - backToForm: "Voltar para o formulário"
  - attentionTitle: "ATENÇÃO"
  - attentionDesc: ""
  - securityBackupLabel: "Security Identification Backup"
  - foldLineLabel: "Linha de Dobra"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            personalData: { type: Type.STRING },
            fullName: { type: Type.STRING },
            bloodType: { type: Type.STRING },
            rhFactor: { type: Type.STRING },
            nationality: { type: Type.STRING },
            healthInfo: { type: Type.STRING },
            medications: { type: Type.STRING },
            allergies: { type: Type.STRING },
            diseaseType: { type: Type.STRING },
            hotelData: { type: Type.STRING },
            hotelAddress: { type: Type.STRING },
            hotelPhone: { type: Type.STRING },
            emergencyContact: { type: Type.STRING },
            emergencyName: { type: Type.STRING },
            emergencyPhone: { type: Type.STRING },
            destinationCountry: { type: Type.STRING },
            passportPhoto: { type: Type.STRING },
            uploadText: { type: Type.STRING },
            viewDoc: { type: Type.STRING },
            downloadPdf: { type: Type.STRING },
            select: { type: Type.STRING },
            placeholderMedications: { type: Type.STRING },
            placeholderAllergies: { type: Type.STRING },
            placeholderDisease: { type: Type.STRING },
            placeholderHotelAddress: { type: Type.STRING },
            placeholderHotelPhone: { type: Type.STRING },
            placeholderEmergencyName: { type: Type.STRING },
            placeholderEmergencyPhone: { type: Type.STRING },
            successTitle: { type: Type.STRING },
            successMessage: { type: Type.STRING },
            downloadAgain: { type: Type.STRING },
            close: { type: Type.STRING },
            presentationTitle: { type: Type.STRING },
            presentationSubtitle: { type: Type.STRING },
            presentationDescription: { type: Type.STRING },
            whyUseIt: { type: Type.STRING },
            keepOriginalsTitle: { type: Type.STRING },
            keepOriginalsDesc: { type: Type.STRING },
            emergencyReadyTitle: { type: Type.STRING },
            emergencyReadyDesc: { type: Type.STRING },
            totalPrivacyTitle: { type: Type.STRING },
            totalPrivacyDesc: { type: Type.STRING },
            notLegalSubstituteTitle: { type: Type.STRING },
            notLegalSubstituteDesc: { type: Type.STRING },
            mustCarryTitle: { type: Type.STRING },
            immigrationBorders: { type: Type.STRING },
            flightsHotelCheckin: { type: Type.STRING },
            policeEncounters: { type: Type.STRING },
            bankingExchange: { type: Type.STRING },
            nextButton: { type: Type.STRING },
            originCountryLabel: { type: Type.STRING },
            originCountryPlaceholder: { type: Type.STRING },
            getTranslationButton: { type: Type.STRING },
            backToPresentation: { type: Type.STRING },
            backToForm: { type: Type.STRING },
            attentionTitle: { type: Type.STRING },
            attentionDesc: { type: Type.STRING },
            securityBackupLabel: { type: Type.STRING },
            foldLineLabel: { type: Type.STRING },
          },
          required: [
            "title",
            "subtitle",
            "personalData",
            "fullName",
            "bloodType",
            "rhFactor",
            "nationality",
            "healthInfo",
            "medications",
            "allergies",
            "diseaseType",
            "hotelData",
            "hotelAddress",
            "hotelPhone",
            "destinationCountry",
            "emergencyContact",
            "emergencyName",
            "emergencyPhone",
            "passportPhoto",
            "uploadText",
            "viewDoc",
            "downloadPdf",
            "select",
            "placeholderMedications",
            "placeholderAllergies",
            "placeholderDisease",
            "placeholderHotelAddress",
            "placeholderHotelPhone",
            "placeholderEmergencyName",
            "placeholderEmergencyPhone",
            "successTitle",
            "successMessage",
            "downloadAgain",
            "close",
            "presentationTitle",
            "presentationSubtitle",
            "presentationDescription",
            "whyUseIt",
            "keepOriginalsTitle",
            "keepOriginalsDesc",
            "emergencyReadyTitle",
            "emergencyReadyDesc",
            "totalPrivacyTitle",
            "totalPrivacyDesc",
            "notLegalSubstituteTitle",
            "notLegalSubstituteDesc",
            "mustCarryTitle",
            "immigrationBorders",
            "flightsHotelCheckin",
            "policeEncounters",
            "bankingExchange",
            "nextButton",
            "originCountryLabel",
            "originCountryPlaceholder",
            "getTranslationButton",
            "backToPresentation",
            "backToForm",
            "attentionTitle",
            "attentionDesc",
            "securityBackupLabel",
            "foldLineLabel",
          ],
        },
      },
    });

    const result = JSON.parse(response.text);
    translationCache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error("Error translating form:", error);
    return null;
  }
}

export async function translateFormData(data: any, country: string) {
  const model = "gemini-2.5-flash"; // Usando 2.5 Flash que é mais eficiente para o plano gratuito
  const ai = getAI();

  // Extraindo apenas os campos que o usuário deseja traduzir via IA
  const fieldsToTranslate = {
    nationality: data.nationality,
    medications: data.medications,
    allergies: data.allergies,
    diseaseType: data.diseaseType,
  };

  const prompt = `Translate the following medical and personal data into the primary language of "${country}". 
  
  STRICT RULES:
  1. ONLY translate the text values.
  2. If a value is "---", "Não", "None", or empty, keep it exactly as is or translate only if it's a clear "No/None" term.
  3. For 'nationality', translate the nationality name to the destination language (e.g., 'Brasileira' becomes 'Brazilian' in English, 'Brasileño' in Spanish, etc.).
  4. Keep the keys exactly as they are.
  5. Return ONLY a JSON object.
  
  Data to translate:
  ${JSON.stringify(fieldsToTranslate, null, 2)}
  
  Return a JSON object with the same keys.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nationality: { type: Type.STRING },
            medications: { type: Type.STRING },
            allergies: { type: Type.STRING },
            diseaseType: { type: Type.STRING },
          },
          required: ["nationality", "medications", "allergies", "diseaseType"],
        },
      },
    });

    const translatedFields = JSON.parse(response.text);

    // Retorna o objeto completo, mantendo os dados originais e apenas substituindo os traduzidos pela IA
    return {
      ...data,
      ...translatedFields,
    };
  } catch (error) {
    console.error("Error translating form data:", error);
    return data;
  }
}
