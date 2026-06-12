/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Download,
  Eye,
  Globe,
  Heart,
  Hotel,
  Loader2,
  MapPin,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import CameraModal from "./components/CameraModal";
import { detectLanguageFromCountry } from "./constants/globalCountryLanguageMap";
import {
  PRELOADED_TRANSLATIONS,
  TranslatedForm,
} from "./constants/translations";
import { translateFormData } from "./services/geminiService";

interface FormData {
  fullName: string;
  bloodType: string;
  rhFactor: string;
  nationality: string;
  medications: string;
  allergies: string;
  diseaseType: string;
  hotelAddress: string;
  hotelPhone: string;
  destinationCountry: string;
  emergencyName: string;
  emergencyPhone: string;
}

const CustomShield = ({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L3 5V11C3 16.5 7.5 21 12 22.5C16.5 21 21 16.5 21 11V5L12 2Z"
      fill="#0f2d4a"
      stroke="#0f2d4a"
      strokeWidth="1"
    />
    <path
      d="M12 4L5 6.3V11C5 15.5 8.5 19.2 12 20.5C15.5 19.2 19 15.5 19 11V6.3L12 4Z"
      stroke="white"
      strokeWidth="0.8"
    />
  </svg>
);

export default function App() {
  const [country, setCountry] = useState("");
  const [identifiedLanguage, setIdentifiedLanguage] = useState<string | null>(
    null,
  );
  const [destIdentifiedLanguage, setDestIdentifiedLanguage] = useState<
    string | null
  >(null);
  const [translatedForm, setTranslatedForm] = useState<TranslatedForm | null>(
    null,
  );
  const [previewTranslations, setPreviewTranslations] =
    useState<TranslatedForm | null>(null);
  const [passportImage, setPassportImage] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [translatedData, setTranslatedData] = useState<FormData | null>(null);
  const [lastTranslatedData, setLastTranslatedData] = useState<{
    input: string;
    output: FormData;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [showVerso, setShowVerso] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    bloodType: "",
    rhFactor: "",
    nationality: "",
    medications: "",
    allergies: "",
    diseaseType: "",
    hotelAddress: "",
    hotelPhone: "",
    destinationCountry: "",
    emergencyName: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    const img = new Image();
    img.src = "https://picsum.photos/seed/brazil-beach-rio/1920/1080";
    img.onload = () => setBgLoaded(true);
  }, []);

  useEffect(() => {
    const langCode = detectLanguageFromCountry(country);
    setIdentifiedLanguage(langCode);
  }, [country]);

  useEffect(() => {
    const langCode = detectLanguageFromCountry(formData.destinationCountry);
    setDestIdentifiedLanguage(langCode);
  }, [formData.destinationCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;

    const langMap: Record<string, string> = {
      pt: "portuguese",
      en: "english",
      es: "spanish",
      fr: "french",
      it: "italian",
      de: "german",
      ru: "russian",
      ar: "arabic",
      zh: "chinese",
      hi: "hindi",
      fa: "persian",
      ja: "japanese",
      ko: "korean",
      th: "thai",
      vi: "vietnamese",
      pl: "polish",
      nl: "dutch",
    };

    const internalKey = identifiedLanguage
      ? langMap[identifiedLanguage]
      : "english";
    const translation =
      PRELOADED_TRANSLATIONS[internalKey] || PRELOADED_TRANSLATIONS.english;

    setTranslatedForm(translation);
    setPreviewTranslations(translation);
  };

  const handleBack = () => {
    if (showPreview) {
      setShowPreview(false);
      setShowVerso(false);
      return;
    }
    if (showForm) {
      setShowForm(false);
      return;
    }
    setTranslatedForm(null);
    setPreviewTranslations(null);
    setTranslatedData(null);
    setCountry("");
    setShowForm(false);
    setPassportImage(null);
    setFormData({
      fullName: "",
      bloodType: "",
      rhFactor: "",
      nationality: "",
      medications: "",
      allergies: "",
      diseaseType: "",
      hotelAddress: "",
      hotelPhone: "",
      destinationCountry: "",
      emergencyName: "",
      emergencyPhone: "",
    });
  };

  const getCountryColors = (countryName: string): string[] => {
    const normalized = countryName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const countryMap: Record<string, string[]> = {
      argentina: ["#74acdf", "#ffffff", "#74acdf"],
      brasil: ["#009739", "#FEDD00", "#012169"],
      brazil: ["#009739", "#FEDD00", "#012169"],
      canada: ["#ff0000", "#ffffff", "#ff0000"],
      chile: ["#0039a6", "#ffffff", "#d52b1e"],
      colombia: ["#fcd116", "#003893", "#ce1126"],
      "costa rica": ["#002b7f", "#ffffff", "#ce1126", "#ffffff", "#002b7f"],
      cuba: ["#002a8f", "#ffffff", "#002a8f", "#ffffff", "#002a8f"],
      "el salvador": ["#0047bb", "#ffffff", "#0047bb"],
      equador: ["#ffdd00", "#0033a0", "#ed1c24"],
      "estados unidos": ["#B22234", "#FFFFFF", "#3C3B6E"],
      usa: ["#B22234", "#FFFFFF", "#3C3B6E"],
      guatemala: ["#0047bb", "#ffffff", "#0047bb"],
      haiti: ["#00209f", "#d21034"],
      honduras: ["#0047bb", "#ffffff", "#0047bb"],
      jamaica: ["#009b3a", "#000000", "#fced02"],
      mexico: ["#006847", "#ffffff", "#ce1126"],
      nicaragua: ["#0047bb", "#ffffff", "#0047bb"],
      panama: ["#ffffff", "#da121a", "#002b7f"],
      paraguai: ["#d52b1e", "#ffffff", "#0038a8"],
      peru: ["#d91023", "#ffffff", "#d91023"],
      uruguai: ["#ffffff", "#0038a8", "#ffffff", "#0038a8"],
      venezuela: ["#ffcc00", "#003399", "#cf142b"],
      alemanha: ["#000000", "#DD0000", "#FFCE00"],
      "germany en": ["#000000", "#DD0000", "#FFCE00"],
      "paises baixos": ["#21468B", "#FFFFFF", "#AE1C28"],
      "netherlands en": ["#21468B", "#FFFFFF", "#AE1C28"],
      franca: ["#002395", "#FFFFFF", "#ED2939"],
      "france en": ["#002395", "#FFFFFF", "#ED2939"],
      italia: ["#008c45", "#f4f5f0", "#cd212a"],
      "italy en": ["#008c45", "#f4f5f0", "#cd212a"],
      espanha: ["#aa151b", "#f1bf00", "#aa151b"],
      "spain en": ["#aa151b", "#f1bf00", "#aa151b"],
      portugal: ["#006600", "#ff0000"],
      "reino unido": ["#012169", "#ffffff", "#c8102e"],
      "united kingdom en": ["#012169", "#ffffff", "#c8102e"],
      china: ["#ee1c25", "#ffff00"],
      japao: ["#ffffff", "#bc002d", "#ffffff"],
      "japan en": ["#ffffff", "#bc002d", "#ffffff"],
      australia: ["#00008b", "#ffffff", "#ff0000"],
    };

    for (const key in countryMap) {
      if (normalized.includes(key)) return countryMap[key];
    }
    return ["#1a2b4b", "#D9D9D9", "#1a2b4b"];
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "destinationCountry") {
      const langCode = detectLanguageFromCountry(value);
      const langMap: Record<string, string> = {
        pt: "portuguese",
        en: "english",
        es: "spanish",
        fr: "french",
        it: "italian",
        de: "german",
        ru: "russian",
        ar: "arabic",
        zh: "chinese",
        hi: "hindi",
        fa: "persian",
        ja: "japanese",
        ko: "korean",
        th: "thai",
        vi: "vietnamese",
        pl: "polish",
        nl: "dutch",
      };
      const internalKey = langMap[langCode];
      if (internalKey && PRELOADED_TRANSLATIONS[internalKey]) {
        setPreviewTranslations(PRELOADED_TRANSLATIONS[internalKey]);
      }
    }
  };

  useEffect(() => {
    if (!translatedForm) return;
    const destCountry = formData.destinationCountry.trim();
    if (!destCountry) {
      setTranslatedData(formData);
      return;
    }
    const langCode = detectLanguageFromCountry(destCountry.toLowerCase());
    const langMap: Record<string, string> = {
      pt: "portuguese",
      en: "english",
      es: "spanish",
      fr: "french",
      it: "italian",
      de: "german",
      ru: "russian",
      ar: "arabic",
      zh: "chinese",
      hi: "hindi",
      fa: "persian",
      ja: "japanese",
      ko: "korean",
      th: "thai",
      vi: "vietnamese",
      pl: "polish",
      nl: "dutch",
    };
    const internalKey = langMap[langCode] || "english";
    const labelsResult = PRELOADED_TRANSLATIONS[internalKey];
    if (labelsResult) {
      setPreviewTranslations(labelsResult);
    }
    setTranslatedData(formData);
  }, [
    formData.destinationCountry,
    formData.emergencyName,
    formData.fullName,
    formData.medications,
    formData.allergies,
    formData.diseaseType,
    formData.hotelAddress,
  ]);

  const handleViewDoc = async () => {
    if (!formData.destinationCountry.trim()) {
      setShowPreview(true);
      return;
    }
    const currentInputKey =
      JSON.stringify(formData) + formData.destinationCountry;
    if (lastTranslatedData && lastTranslatedData.input === currentInputKey) {
      setTranslatedData(lastTranslatedData.output);
      setShowPreview(true);
      return;
    }
    setTranslating(true);
    try {
      const translated = await translateFormData(
        formData,
        formData.destinationCountry,
      );
      setTranslatedData(translated);
      setLastTranslatedData({ input: currentInputKey, output: translated });
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedData(formData);
    } finally {
      setTranslating(false);
      setShowPreview(true);
    }
  };

  // FUNÇÃO CORRIGIDA: Baixa frente e verso juntos
  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (!frontRef.current || !backRef.current) {
        console.error("Elementos não encontrados");
        alert("Erro: documento não encontrado");
        setDownloading(false);
        return;
      }

      // Captura a FRENTE (estática na área invisível)
      const frontImage = await toPng(frontRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Captura o VERSO (estático na área invisível)
      const backImage = await toPng(backRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 125;
      const imgHeight = 176;
      const x = (210 - imgWidth) / 2;
      const y = (297 - imgHeight) / 2;

      // Página 1: FRENTE
      pdf.addImage(frontImage, "PNG", x, y, imgWidth, imgHeight);

      // Página 2: VERSO
      pdf.addPage();
      pdf.addImage(backImage, "PNG", x, y, imgWidth, imgHeight);

      const fileName = `PotchX-${formData.fullName.replace(/\s+/g, "-").toLowerCase() || "documento"}.pdf`;
      pdf.save(fileName);

      setShowSuccess(true);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar PDF: " + (err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans selection:bg-indigo-100 overflow-x-hidden">
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: bgLoaded ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-0"
          style={{
            backgroundImage:
              'url("https://picsum.photos/seed/brazil-beach-rio/1920/1080")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </motion.div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-sm w-full text-center shadow-2xl border border-zinc-100"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CustomShield size={40} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-4">
                  {previewTranslations?.successTitle ||
                    "Cópia de Segurança Salva!"}
                </h2>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  {(
                    previewTranslations?.successMessage ||
                    "Sua **Cópia de Segurança** foi salva com sucesso no seu dispositivo."
                  )
                    .split("**")
                    .map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
                    )}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      handleDownload();
                    }}
                    className="w-full py-4 px-8 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                  >
                    {previewTranslations?.downloadAgain ||
                      "Baixar PDF Novamente"}
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      setShowPreview(false);
                      setShowForm(false);
                      setTranslatedForm(null);
                      setPreviewTranslations(null);
                      setTranslatedData(null);
                      setCountry("");
                      setPassportImage(null);
                      setFormData({
                        fullName: "",
                        bloodType: "",
                        rhFactor: "",
                        nationality: "",
                        medications: "",
                        allergies: "",
                        diseaseType: "",
                        hotelAddress: "",
                        hotelPhone: "",
                        destinationCountry: "",
                        emergencyName: "",
                        emergencyPhone: "",
                      });
                    }}
                    className="w-full py-3 px-8 rounded-2xl bg-zinc-100 text-zinc-600 font-bold hover:bg-zinc-200 transition-all"
                  >
                    {previewTranslations?.close || "Fechar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div
                key="presentation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/20">
                  <header className="space-y-6 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <CustomShield size={32} />
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
                        {translatedForm?.presentationTitle || "PotchX"}{" "}
                        <span className="text-indigo-600 font-medium text-xl md:text-2xl block md:inline">
                          {translatedForm?.presentationSubtitle ||
                            "(Security Backup)"}
                        </span>
                      </h1>
                    </div>

                    <div className="max-w-lg px-4">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 relative z-10 bg-white">
                          <div className="relative">
                            <input
                              id="country"
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              placeholder={
                                translatedForm?.originCountryPlaceholder ||
                                "Enter your country of origin..."
                              }
                              className="w-full px-6 py-3 rounded-xl border-2 border-indigo-500 bg-white outline-none ring-4 ring-indigo-500/10 transition-all text-lg font-medium"
                              autoFocus
                            />
                            <AnimatePresence>
                              {identifiedLanguage && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="absolute -bottom-6 left-0 text-left overflow-hidden"
                                >
                                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] block py-1">
                                    {translatedForm?.languageIdentifiedLabel ||
                                      "Language"}
                                    :{" "}
                                    {{
                                      pt: "Português",
                                      en: "English",
                                      es: "Español",
                                      fr: "Français",
                                      it: "Italiano",
                                      de: "Deutsch",
                                      ru: "Русский",
                                      ar: "العربية",
                                      zh: "中文",
                                      hi: "हिन्दी",
                                      fa: "فارسی",
                                      ja: "日本語",
                                      ko: "한국어",
                                      th: "ไทย",
                                      vi: "Tiếng Việt",
                                      pl: "Polski",
                                      nl: "Nederlands",
                                    }[identifiedLanguage] || identifiedLanguage}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <AnimatePresence>
                            {country.trim() !== "" && (
                              <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 20,
                                }}
                                className="relative z-0"
                              >
                                <button
                                  type="submit"
                                  className="w-full mt-4 flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 group"
                                >
                                  <Globe
                                    size={20}
                                    className="group-hover:rotate-12 transition-transform"
                                  />
                                  {translatedForm?.getTranslationButton ||
                                    "Get Local Translation"}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </form>
                    </div>

                    <p className="text-lg md:text-xl text-zinc-700 leading-relaxed font-medium">
                      {translatedForm?.presentationDescription ||
                        "The PotchX is a digital identification tool designed to give you peace of mind while exploring. It allows you to keep your original documents safe while ensuring you have all your essential info on hand."}
                    </p>
                  </header>

                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
                        <MapPin size={16} />
                        {translatedForm?.whyUseIt || "Why use it?"}
                      </div>
                      <ul className="space-y-4">
                        <li className="flex gap-3">
                          <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          </div>
                          <p className="text-sm text-zinc-600">
                            <strong className="text-zinc-900 block">
                              {translatedForm?.keepOriginalsTitle ||
                                "Keep Originals Secure"}
                            </strong>
                            {translatedForm?.keepOriginalsDesc ||
                              "Leave your official Passport or ID in the hotel safe. Use this copy for daily activities, beach trips, and nightlife."}
                          </p>
                        </li>
                        <li className="flex gap-3">
                          <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          </div>
                          <p className="text-sm text-zinc-600">
                            <strong className="text-zinc-900 block">
                              {translatedForm?.emergencyReadyTitle ||
                                "Emergency Ready"}
                            </strong>
                            {translatedForm?.emergencyReadyDesc ||
                              "It centralizes your blood type, allergies, and local hotel contact info—translated into the local language of the country you are visiting."}
                          </p>
                        </li>
                        <li className="flex gap-3">
                          <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          </div>
                          <p className="text-sm text-zinc-600">
                            <strong className="text-zinc-900 block">
                              {translatedForm?.totalPrivacyTitle ||
                                "Total Privacy"}
                            </strong>
                            {translatedForm?.totalPrivacyDesc ||
                              "For your safety, no data is stored in the app. Your info and photos are saved only to your phone's gallery and are permanently deleted from the app's system after each download."}
                          </p>
                        </li>
                      </ul>
                    </section>

                    <section className="space-y-4 bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                      <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-wider text-xs">
                        <AlertTriangle size={16} />
                        {translatedForm?.notLegalSubstituteTitle ||
                          "Important: Not a Legal Substitute"}
                      </div>
                      <p className="text-sm text-amber-900/80 leading-relaxed">
                        {translatedForm?.notLegalSubstituteDesc ||
                          "This copy is for informational and identification assistance only. It does not replace your original official documents in formal situations."}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">
                          {translatedForm?.mustCarryTitle ||
                            "You MUST carry your original Passport or ID for:"}
                        </p>
                        <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4">
                          <li>
                            {translatedForm?.immigrationBorders ||
                              "Immigration & Borders"}
                          </li>
                          <li>
                            {translatedForm?.flightsHotelCheckin ||
                              "Flights & Hotel Check-in"}
                          </li>
                          <li>
                            {translatedForm?.policeEncounters ||
                              "Police Encounters"}
                          </li>
                          <li>
                            {translatedForm?.bankingExchange ||
                              "Banking & Currency Exchange"}
                          </li>
                        </ul>
                        <button
                          onClick={() => {
                            if (translatedForm) {
                              setShowForm(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              const input = document.getElementById("country");
                              input?.focus();
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={`mt-6 w-full py-4 px-8 rounded-2xl text-white font-bold transition-all shadow-xl flex items-center justify-center gap-2 group ${
                            translatedForm
                              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                          }`}
                        >
                          {translatedForm?.nextButton || "Next"}
                          <ArrowRight
                            className="group-hover:translate-x-1 transition-transform"
                            size={20}
                          />
                        </button>
                      </div>
                    </section>
                  </div>

                  <div className="pt-8 border-t border-zinc-100">
                    {/* Form moved to top */}
                  </div>
                </div>
              </motion.div>
            ) : showPreview && previewTranslations ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 flex flex-col items-center"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                <div className="w-full max-w-4xl flex justify-between items-center">
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setShowVerso(false);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold text-white hover:bg-white/30 transition-all border border-white/20"
                  >
                    <ArrowLeft size={16} />
                    {previewTranslations?.backToForm || "Back to form"}
                  </button>

                  <button
                    onClick={() => handleDownload()}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 py-2 px-6 rounded-full bg-amber-400 text-amber-950 font-bold hover:bg-amber-500 transition-all shadow-lg shadow-amber-200 text-sm disabled:opacity-50"
                  >
                    {downloading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                    {previewTranslations?.downloadPdf}
                  </button>
                </div>

                {/* ========================================================== */}
                {/* ÁREA INVISÍVEL PARA CAPTURA DO PDF */}
                {/* ========================================================== */}
                <div
                  style={{
                    position: "absolute",
                    top: "-9999px",
                    left: "-9999px",
                    pointerEvents: "none",
                  }}
                >
                  {/* FRENTE ESTÁTICA PARA O PDF */}
                  <div
                    ref={frontRef}
                    className="bg-white text-black flex flex-col overflow-hidden"
                    style={{
                      width: "472px",
                      height: "665px",
                      display: "block",
                    }}
                  >
                    <div
                      className="bg-white shadow-2xl overflow-hidden relative flex flex-col border border-zinc-300"
                      style={{
                        width: "100%",
                        maxWidth: "472px",
                        minHeight: "665px",
                        fontFamily: "Arial, Helvetica, sans-serif",
                        color: "black",
                      }}
                    >
                      {(() => {
                        const colors = getCountryColors(
                          formData.destinationCountry,
                        );
                        const borderThickness = "12px";
                        return (
                          <>
                            <div
                              className="absolute top-0 left-0 right-0 flex z-20"
                              style={{ height: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    height: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                            <div
                              className="absolute bottom-0 left-0 right-0 flex z-20"
                              style={{ height: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    height: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                            <div
                              className="absolute top-0 bottom-0 left-0 flex flex-col z-20"
                              style={{ width: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    width: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                            <div
                              className="absolute top-0 bottom-0 right-0 flex flex-col z-20"
                              style={{ width: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    width: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                          </>
                        );
                      })()}

                      <div className="h-[332.5px] p-[27px] flex flex-col relative bg-white font-serif">
                        <div className="flex items-start mb-6 relative">
                          <div className="mt-[-3px]">
                            <CustomShield size={32} />
                          </div>
                          <div className="flex-1 text-center pr-8">
                            <h1 className="text-[15px] font-bold uppercase tracking-tight leading-none text-[#0f2d4a] font-sans">
                              {previewTranslations?.title ||
                                "CÓPIA DE SEGURANÇA"}
                            </h1>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 flex-1">
                          <div className="space-y-1">
                            <div className="-mt-1">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.fullName ||
                                  "NOME COMPLETO"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).fullName ||
                                  "Leonardo dos Santos Silva"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.bloodType ||
                                  "TIPO SANGUÍNEO"}{" "}
                                / {previewTranslations?.rhFactor || "FATOR RH"}:
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).bloodType || "B"}
                                {(translatedData || formData).rhFactor || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.nationality ||
                                  "NACIONALIDADE"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).nationality ||
                                  "Brasileira"}
                              </p>
                            </div>
                            <div className="pt-2">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200 mb-2">
                                {previewTranslations?.healthInfo ||
                                  "DADOS DE SAÚDE"}
                              </p>
                              <div className="space-y-1">
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.medications ||
                                      "Medicamentos em uso"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData).medications ||
                                      "Tadalafila"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.allergies ||
                                      "Alergias"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData).allergies ||
                                      "Abacaxi"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[#0f2d4a] text-[9px] font-bold uppercase mb-0 whitespace-nowrap tracking-tighter">
                                    {previewTranslations?.diseaseType ||
                                      "Condições Médicas"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData).diseaseType ||
                                      "Não"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="-mt-1">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.hotelAddress ||
                                  "ENDEREÇO DO HOTEL"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight line-clamp-2 uppercase">
                                {(translatedData || formData).hotelAddress ||
                                  "Casa, Pia Rua São Paulo 56, Centro RJ"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.hotelPhone ||
                                  "TELEFONE DO HOTEL"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).hotelPhone ||
                                  "21982572997"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.destinationCountry ||
                                  "PAÍS DE DESTINO"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData)
                                  .destinationCountry || "Brasil"}
                              </p>
                            </div>
                            <div className="pt-2">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200 mb-2">
                                {previewTranslations?.emergencyContact ||
                                  "CONTATO DE EMERGÊNCIA"}
                              </p>
                              <div className="space-y-1">
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.emergencyName ||
                                      "Nome"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData)
                                      .emergencyName || "Davi Divino"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.emergencyPhone ||
                                      "Telefone"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData)
                                      .emergencyPhone || "21982572997"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-8 right-8 h-px flex items-center justify-center">
                          <div className="absolute inset-0 flex">
                            {getCountryColors(formData.destinationCountry).map(
                              (c, i) => (
                                <div
                                  key={i}
                                  className="flex-1 h-full"
                                  style={{ backgroundColor: c }}
                                />
                              ),
                            )}
                          </div>
                          <div className="relative bg-white px-3 text-[5px] text-zinc-400 font-bold tracking-[0.3em] uppercase z-10">
                            {previewTranslations?.foldLineLabel || "Fold Line"}
                          </div>
                        </div>
                      </div>
                      <div className="h-[332.5px] flex flex-col items-center justify-start bg-white relative pt-[0.26cm]">
                        {passportImage ? (
                          <div
                            className="rounded-sm overflow-hidden border border-zinc-200 p-0.5"
                            style={{ width: "11.8cm", height: "8.23cm" }}
                          >
                            <img
                              src={passportImage}
                              alt="Passport"
                              className="w-full h-full object-fill grayscale-[20%]"
                            />
                          </div>
                        ) : (
                          <div
                            className="rounded-sm bg-zinc-50 flex flex-col items-center justify-center text-zinc-200 border border-dashed border-zinc-200"
                            style={{ width: "10cm", height: "8.22cm" }}
                          >
                            <Camera size={48} strokeWidth={1} />
                            <p className="text-[10px] font-bold uppercase mt-3 tracking-widest">
                              Passport Photo Area
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VERSO ESTÁTICO PARA O PDF (copiado do Código 2) */}
                  <div
                    ref={backRef}
                    className="bg-white text-black flex flex-col overflow-hidden"
                    style={{
                      width: "472px",
                      height: "665px",
                      display: "block",
                    }}
                  >
                    <div
                      className="bg-white shadow-2xl overflow-hidden relative flex flex-col border border-zinc-300"
                      style={{
                        width: "100%",
                        maxWidth: "472px",
                        minHeight: "665px",
                        backgroundColor: "white",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                      }}
                    >
                      <div
                        style={{
                          transform: "rotate(-90deg)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <h1
                          style={{
                            fontFamily:
                              "'Nunito', 'Arial Rounded MT Bold', 'Gotham Rounded', 'Poppins', sans-serif",
                            fontSize: "150px",
                            fontWeight: 800,
                            letterSpacing: "8px",
                            margin: 0,
                            whiteSpace: "nowrap",
                            background: (() => {
                              const colors = getCountryColors(
                                formData.destinationCountry,
                              );
                              if (colors.length === 1) return colors[0];
                              if (colors.length === 2)
                                return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
                              if (colors.length >= 3)
                                return `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
                              return "#1a2b4b";
                            })(),
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          PotchX
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FRENTE VISÍVEL PARA O USUÁRIO (sem ref) */}
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() => setShowVerso(!showVerso)}
                    style={{
                      cursor: "pointer",
                      display: showVerso ? "none" : "block",
                      width: "100%",
                      maxWidth: "472px",
                      margin: "0 auto",
                    }}
                  >
                    <div
                      className="bg-white shadow-2xl overflow-hidden relative flex flex-col border border-zinc-300"
                      style={{
                        width: "100%",
                        maxWidth: "472px",
                        minHeight: "665px",
                        fontFamily: "Arial, Helvetica, sans-serif",
                        color: "black",
                      }}
                    >
                      {(() => {
                        const colors = getCountryColors(
                          formData.destinationCountry,
                        );
                        const borderThickness = "12px";
                        return (
                          <>
                            <div
                              className="absolute top-0 left-0 right-0 flex z-20"
                              style={{ height: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    height: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                            <div
                              className="absolute bottom-0 left-0 right-0 flex z-20"
                              style={{ height: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    height: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                            <div
                              className="absolute top-0 bottom-0 left-0 flex flex-col z-20"
                              style={{ width: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    width: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                            <div
                              className="absolute top-0 bottom-0 right-0 flex flex-col z-20"
                              style={{ width: borderThickness }}
                            >
                              {colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1"
                                  style={{
                                    backgroundColor: c,
                                    width: borderThickness,
                                  }}
                                ></div>
                              ))}
                            </div>
                          </>
                        );
                      })()}

                      <div className="h-[332.5px] p-[27px] flex flex-col relative bg-white font-serif">
                        <div className="flex items-start mb-6 relative">
                          <div className="mt-[-3px]">
                            <CustomShield size={32} />
                          </div>
                          <div className="flex-1 text-center pr-8">
                            <h1 className="text-[15px] font-bold uppercase tracking-tight leading-none text-[#0f2d4a] font-sans">
                              {previewTranslations?.title ||
                                "CÓPIA DE SEGURANÇA"}
                            </h1>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 flex-1">
                          <div className="space-y-1">
                            <div className="-mt-1">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.fullName ||
                                  "NOME COMPLETO"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).fullName ||
                                  "Leonardo dos Santos Silva"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.bloodType ||
                                  "TIPO SANGUÍNEO"}{" "}
                                / {previewTranslations?.rhFactor || "FATOR RH"}:
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).bloodType || "B"}
                                {(translatedData || formData).rhFactor || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.nationality ||
                                  "NACIONALIDADE"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).nationality ||
                                  "Brasileira"}
                              </p>
                            </div>
                            <div className="pt-2">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200 mb-2">
                                {previewTranslations?.healthInfo ||
                                  "DADOS DE SAÚDE"}
                              </p>
                              <div className="space-y-1">
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.medications ||
                                      "Medicamentos em uso"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData).medications ||
                                      "Tadalafila"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.allergies ||
                                      "Alergias"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData).allergies ||
                                      "Abacaxi"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[#0f2d4a] text-[9px] font-bold uppercase mb-0 whitespace-nowrap tracking-tighter">
                                    {previewTranslations?.diseaseType ||
                                      "Condições Médicas"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData).diseaseType ||
                                      "Não"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="-mt-1">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.hotelAddress ||
                                  "ENDEREÇO DO HOTEL"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight line-clamp-2 uppercase">
                                {(translatedData || formData).hotelAddress ||
                                  "Casa, Pia Rua São Paulo 56, Centro RJ"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.hotelPhone ||
                                  "TELEFONE DO HOTEL"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData).hotelPhone ||
                                  "21982572997"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-wider mb-0">
                                {previewTranslations?.destinationCountry ||
                                  "PAÍS DE DESTINO"}
                                :
                              </p>
                              <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                {(translatedData || formData)
                                  .destinationCountry || "Brasil"}
                              </p>
                            </div>
                            <div className="pt-2">
                              <p className="text-[#0f2d4a] text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200 mb-2">
                                {previewTranslations?.emergencyContact ||
                                  "CONTATO DE EMERGÊNCIA"}
                              </p>
                              <div className="space-y-1">
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.emergencyName ||
                                      "Nome"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData)
                                      .emergencyName || "Davi Divino"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[#0f2d4a] text-[10px] font-bold uppercase mb-0">
                                    {previewTranslations?.emergencyPhone ||
                                      "Telefone"}
                                    :
                                  </p>
                                  <p className="text-black text-[9px] font-bold leading-tight uppercase">
                                    {(translatedData || formData)
                                      .emergencyPhone || "21982572997"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-8 right-8 h-px flex items-center justify-center">
                          <div className="absolute inset-0 flex">
                            {getCountryColors(formData.destinationCountry).map(
                              (c, i) => (
                                <div
                                  key={i}
                                  className="flex-1 h-full"
                                  style={{ backgroundColor: c }}
                                />
                              ),
                            )}
                          </div>
                          <div className="relative bg-white px-3 text-[5px] text-zinc-400 font-bold tracking-[0.3em] uppercase z-10">
                            {previewTranslations?.foldLineLabel || "Fold Line"}
                          </div>
                        </div>
                      </div>
                      <div className="h-[332.5px] flex flex-col items-center justify-start bg-white relative pt-[0.26cm]">
                        {passportImage ? (
                          <div
                            className="rounded-sm overflow-hidden border border-zinc-200 p-0.5"
                            style={{ width: "10cm", height: "8.22cm" }}
                          >
                            <img
                              src={passportImage}
                              alt="Passport"
                              className="w-full h-full object-cover grayscale-[20%]"
                            />
                          </div>
                        ) : (
                          <div
                            className="rounded-sm bg-zinc-50 flex flex-col items-center justify-center text-zinc-200 border border-dashed border-zinc-200"
                            style={{ width: "10cm", height: "8.22cm" }}
                          >
                            <Camera size={48} strokeWidth={1} />
                            <p className="text-[10px] font-bold uppercase mt-3 tracking-widest">
                              Passport Photo Area
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-center text-base font-bold text-amber-400 mt-3 hover:text-amber-300 transition-colors cursor-pointer">
                      👆{" "}
                      {previewTranslations?.clickToFlip ||
                        "Clique aqui para ver o verso"}
                    </p>
                  </div>

                  {/* VERSO VISÍVEL PARA O USUÁRIO (sem ref) */}
                  {showVerso && (
                    <div
                      onClick={() => setShowVerso(false)}
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        maxWidth: "472px",
                        margin: "0 auto",
                      }}
                    >
                      <div
                        className="bg-white shadow-2xl overflow-hidden relative flex flex-col border border-zinc-300"
                        style={{
                          width: "100%",
                          maxWidth: "472px",
                          minHeight: "665px",
                          backgroundColor: "white",
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                        }}
                      >
                        <div
                          style={{
                            transform: "rotate(-90deg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <h1
                            style={{
                              fontFamily:
                                "'Nunito', 'Arial Rounded MT Bold', 'Gotham Rounded', 'Poppins', sans-serif",
                              fontSize: "72px",
                              fontWeight: 800,
                              letterSpacing: "8px",
                              margin: 0,
                              whiteSpace: "nowrap",
                              background: (() => {
                                const colors = getCountryColors(
                                  formData.destinationCountry,
                                );
                                if (colors.length === 1) return colors[0];
                                if (colors.length === 2)
                                  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
                                if (colors.length >= 3)
                                  return `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
                                return "#1a2b4b";
                              })(),
                              WebkitBackgroundClip: "text",
                              backgroundClip: "text",
                              color: "transparent",
                            }}
                          >
                            PotchX
                          </h1>
                        </div>
                      </div>
                      <p className="text-center text-base font-bold text-amber-400 mt-3 hover:text-amber-300 transition-colors cursor-pointer">
                        🔄{" "}
                        {previewTranslations?.clickToBack ||
                          "Clique aqui para voltar"}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold text-white hover:bg-white/30 transition-all border border-white/20"
                >
                  <ArrowLeft size={16} />
                  {translatedForm?.backToPresentation || "Back to presentation"}
                </button>

                <div className="bg-[#1a2b4b] text-white rounded-t-[2rem] p-8 text-center space-y-2 border-b border-white/10 shadow-xl">
                  <div className="flex justify-center items-center gap-3 mb-2">
                    <CustomShield size={24} />
                    <h1 className="text-2xl font-bold tracking-wide uppercase">
                      {translatedForm?.title}
                    </h1>
                    <CustomShield size={24} />
                  </div>
                  <p className="text-sm text-blue-100/80 max-w-xl mx-auto leading-relaxed">
                    {translatedForm?.subtitle}
                  </p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-b-[2rem] shadow-2xl space-y-10">
                  {/* Personal Data Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-600 border-b border-zinc-100 pb-3">
                      <User size={20} />
                      <h2 className="text-lg font-bold uppercase tracking-wider">
                        {translatedForm?.personalData}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.fullName} *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.bloodType} *
                        </label>
                        <select
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                          <option value="">{translatedForm?.select}</option>
                          <option>A</option>
                          <option>B</option>
                          <option>AB</option>
                          <option>O</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.rhFactor} *
                        </label>
                        <select
                          name="rhFactor"
                          value={formData.rhFactor}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                          <option value="">{translatedForm?.select}</option>
                          <option>+</option>
                          <option>-</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.nationality} *
                        </label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Health Info Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-600 border-b border-zinc-100 pb-3">
                      <Heart size={20} />
                      <h2 className="text-lg font-bold uppercase tracking-wider">
                        {translatedForm?.healthInfo}
                      </h2>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.medications} *
                        </label>
                        <input
                          type="text"
                          name="medications"
                          value={formData.medications}
                          onChange={handleInputChange}
                          placeholder={translatedForm?.placeholderMedications}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.allergies} *
                        </label>
                        <input
                          type="text"
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          placeholder={translatedForm?.placeholderAllergies}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.diseaseType} *
                        </label>
                        <input
                          type="text"
                          name="diseaseType"
                          value={formData.diseaseType}
                          onChange={handleInputChange}
                          placeholder={translatedForm?.placeholderDisease}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Hotel Data Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-600 border-b border-zinc-100 pb-3">
                      <Hotel size={20} />
                      <h2 className="text-lg font-bold uppercase tracking-wider">
                        {translatedForm?.hotelData}
                      </h2>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.hotelAddress} *
                        </label>
                        <textarea
                          name="hotelAddress"
                          value={formData.hotelAddress}
                          onChange={handleInputChange}
                          placeholder={translatedForm?.placeholderHotelAddress}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.hotelPhone} *
                        </label>
                        <input
                          type="text"
                          name="hotelPhone"
                          value={formData.hotelPhone}
                          onChange={handleInputChange}
                          placeholder={translatedForm?.placeholderHotelPhone}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.destinationCountry} *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="destinationCountry"
                            value={formData.destinationCountry}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                          <AnimatePresence>
                            {destIdentifiedLanguage && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute -bottom-5 left-0"
                              >
                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                                  {translatedForm?.languageIdentifiedLabel ||
                                    "Language Identified"}
                                  :{" "}
                                  {{
                                    pt: "Português",
                                    en: "English",
                                    es: "Español",
                                    fr: "Français",
                                    it: "Italiano",
                                    de: "Deutsch",
                                  }[destIdentifiedLanguage] ||
                                    destIdentifiedLanguage}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Emergency Contact Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-600 border-b border-zinc-100 pb-3">
                      <Phone size={20} />
                      <h2 className="text-lg font-bold uppercase tracking-wider">
                        {translatedForm?.emergencyContact}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.emergencyName} *
                        </label>
                        <input
                          type="text"
                          name="emergencyName"
                          value={formData.emergencyName}
                          onChange={handleInputChange}
                          placeholder={translatedForm?.placeholderEmergencyName}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">
                          {translatedForm?.emergencyPhone} *
                        </label>
                        <input
                          type="text"
                          name="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={handleInputChange}
                          placeholder={
                            translatedForm?.placeholderEmergencyPhone
                          }
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Passport Photo Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 text-amber-600 border-b border-zinc-100 pb-3">
                      <Camera size={20} />
                      <h2 className="text-lg font-bold uppercase tracking-wider">
                        {translatedForm?.passportPhoto}
                      </h2>
                    </div>

                    {passportImage ? (
                      <div className="space-y-4">
                        <div className="relative aspect-video max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-zinc-100 group">
                          <img
                            src={passportImage}
                            alt="Passport"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                              onClick={() => setShowCamera(true)}
                              className="p-4 rounded-full bg-white text-indigo-600 hover:scale-110 transition-all shadow-xl"
                            >
                              <Camera size={24} />
                            </button>
                            <button
                              onClick={() => setPassportImage(null)}
                              className="p-4 rounded-full bg-red-500 text-white hover:scale-110 transition-all shadow-xl"
                            >
                              <Trash2 size={24} />
                            </button>
                          </div>
                        </div>
                        <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Passport Photo Captured
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCamera(true)}
                        className="w-full border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group flex flex-col items-center gap-4"
                      >
                        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                          <Camera
                            className="text-zinc-400 group-hover:text-indigo-600"
                            size={32}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-zinc-900 font-bold text-lg">
                            Take Passport Photo
                          </p>
                          <p className="text-zinc-500 text-sm">
                            Position your document horizontally
                          </p>
                        </div>
                      </button>
                    )}
                  </section>

                  <div className="flex justify-center pt-10 border-t border-zinc-100">
                    <button
                      onClick={() => handleViewDoc()}
                      disabled={translating}
                      className="w-full md:w-auto flex items-center justify-center gap-2 py-4 px-12 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 min-w-[240px]"
                    >
                      {translating ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Traduzindo...
                        </>
                      ) : (
                        <>
                          <Eye size={20} />
                          {translatedForm?.viewDoc || "Visualizar PotchX"}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <footer className="text-center text-xs font-bold text-white/60 uppercase tracking-widest pt-8">
                  PotchX &copy; {new Date().getFullYear()}
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showCamera && (
            <CameraModal
              onCapture={(img) => setPassportImage(img)}
              onClose={() => setShowCamera(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
