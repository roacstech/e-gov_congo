"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Language, CitizenApplication } from "@/types";
import { SERVICES_DATA } from "@/data/services";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import {
  Heart,
  CheckCircle2,
  Clock,
  Banknote,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  User,
  Users,
  MapPin,
  AlertCircle,
  RotateCcw,
  FileText,
  Upload,
  Building2,
  Sparkles,
  ShieldCheck,
  Loader2,
  ScrollText,
} from "lucide-react";

const DRC_PROVINCES = [
  "Kinshasa",
  "Kongo Central",
  "Kwango",
  "Kwilu",
  "Mai-Ndombe",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Lomami",
  "Sankuru",
  "Haut-Katanga",
  "Haut-Lomami",
  "Lualaba",
  "Tanganyika",
  "Maniema",
  "Nord-Kivu",
  "Sud-Kivu",
  "Ituri",
  "Haut-Uele",
  "Bas-Uele",
  "Tshopo",
  "Équateur",
  "Mongala",
  "Nord-Ubangi",
  "Sud-Ubangi",
  "Tshuapa",
];

const CIVIL_REGISTRY_OFFICES = [
  "Kinshasa - Maison Communale de la Gombe (Bureau Central)",
  "Kinshasa - Maison Communale de Limete",
  "Kinshasa - Maison Communale de Lingwala",
  "Kinshasa - Maison Communale de Bandalungwa",
  "Kinshasa - Maison Communale de Ngaliema",
  "Kinshasa - Maison Communale de Kasa-Vubu",
  "Kinshasa - Maison Communale de Lemba",
  "Kinshasa - Maison Communale de Kalamu",
  "Kinshasa - Maison Communale de Matete",
  "Kinshasa - Maison Communale de Mont-Ngafula",
  "Lubumbashi - Hôtel de Ville / État Civil Central",
  "Lubumbashi - Maison Communale de Lubumbashi",
  "Lubumbashi - Maison Communale de Kampemba",
  "Goma - Hôtel de Ville / Service d'État Civil",
  "Kisangani - Mairie Centrale / État Civil Makiso",
  "Matadi - Mairie de Matadi / État Civil",
  "Bukavu - Hôtel de Ville / État Civil Ibanda",
  "Kananga - Bureau Central de l'État Civil",
];

const MATRIMONIAL_REGIMES = [
  {
    id: "acquêts",
    labelFr: "Communauté réduite aux acquêts (Régime légal par défaut)",
    labelEn: "Community of property acquired after marriage (Legal Default)",
  },
  {
    id: "séparation",
    labelFr: "Séparation de biens pure et simple",
    labelEn: "Separation of property",
  },
  {
    id: "universelle",
    labelFr: "Communauté universelle de tous les biens",
    labelEn: "Universal community of property",
  },
];

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  language: Language;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
}

function DatePickerField({
  value,
  onChange,
  language,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
  placeholder = "AAAA-MM-JJ",
}: DatePickerProps) {
  const isFr = language === "fr";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date(2000, 0, 1);
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? 2000 : initialDate.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDate.getMonth()) ? 0 : initialDate.getMonth()
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => Math.max(minYear, prev - 1));
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => Math.min(maxYear, prev + 1));
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleDaySelect = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 flex items-center justify-between text-left shadow-2xs cursor-pointer transition-colors"
      >
        <span>
          {value || (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {(isFr ? MONTHS_FR : MONTHS_EN).map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {(isFr ? DAYS_FR : DAYS_EN).map((d, i) => (
              <span
                key={`${d}-${i}`}
                className="text-[11px] font-semibold text-slate-400"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const mm = String(viewMonth + 1).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const dateStr = `${viewYear}-${mm}-${dd}`;
              const isSelected = value === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MarriageCertificateContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // Navigation & Step Control
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // SECTION 1.1: GROOM'S IDENTITY (L'ÉPOUX)
  const [groomSurname, setGroomSurname] = useState("");
  const [groomPostName, setGroomPostName] = useState("");
  const [groomFirstName, setGroomFirstName] = useState("");
  const [groomBirthDate, setGroomBirthDate] = useState("");
  const [groomBirthPlace, setGroomBirthPlace] = useState("");
  const [groomNationality, setGroomNationality] = useState("Congolaise");
  const [groomIdNumber, setGroomIdNumber] = useState("");
  const [groomOccupation, setGroomOccupation] = useState("");
  const [groomResidence, setGroomResidence] = useState("");
  const [groomFatherName, setGroomFatherName] = useState("");
  const [groomMotherName, setGroomMotherName] = useState("");

  // SECTION 1.2: BRIDE'S IDENTITY (L'ÉPOUSE)
  const [brideSurname, setBrideSurname] = useState("");
  const [bridePostName, setBridePostName] = useState("");
  const [brideFirstName, setBrideFirstName] = useState("");
  const [brideBirthDate, setBrideBirthDate] = useState("");
  const [brideBirthPlace, setBrideBirthPlace] = useState("");
  const [brideNationality, setBrideNationality] = useState("Congolaise");
  const [brideIdNumber, setBrideIdNumber] = useState("");
  const [brideOccupation, setBrideOccupation] = useState("");
  const [brideResidence, setBrideResidence] = useState("");
  const [brideFatherName, setBrideFatherName] = useState("");
  const [brideMotherName, setBrideMotherName] = useState("");

  // SECTION 1.3: MARRIAGE CELEBRATION & REGISTRY
  const [marriageDate, setMarriageDate] = useState("");
  const [matrimonialRegime, setMatrimonialRegime] = useState(
    "Communauté réduite aux acquêts"
  );
  const [registrationCity, setRegistrationCity] = useState("Kinshasa");
  const [civilRegistryOffice, setCivilRegistryOffice] = useState(
    "Kinshasa - Maison Communale de la Gombe (Bureau Central)"
  );
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");

  // STEP 2: SUPPORTING LEGAL DOCUMENTS (4 REQUIRED SINGLE-LINE ROWS)
  const [groomBirthCertDoc, setGroomBirthCertDoc] = useState<string | null>(null);
  const [brideBirthCertDoc, setBrideBirthCertDoc] = useState<string | null>(null);
  const [groomIdDoc, setGroomIdDoc] = useState<string | null>(null);
  const [brideIdDoc, setBrideIdDoc] = useState<string | null>(null);

  // STEP 3 & SUBMITTED RECEIPT STATE (IN-PLACE CARD MATCHING OTHER SERVICES)
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleDemoFill = () => {
    // Groom info
    setGroomSurname("KABILA");
    setGroomPostName("TSHIMANGA");
    setGroomFirstName("Dieudonné");
    setGroomBirthDate("1989-06-18");
    setGroomBirthPlace("Kinshasa - Gombe");
    setGroomNationality("Congolaise");
    setGroomIdNumber("NIN-CD-1989-031982");
    setGroomOccupation("Ingénieur Civil");
    setGroomResidence("14 Avenue de la Justice, Quartier Batetela, Commune de la Gombe, Kinshasa");
    setGroomFatherName("KABILA MUKENDI Joseph");
    setGroomMotherName("MASIKA NZUZI Claudine");

    // Bride info
    setBrideSurname("MPUTU");
    setBridePostName("KALOMBO");
    setBrideFirstName("Grace");
    setBrideBirthDate("1993-11-24");
    setBrideBirthPlace("Lubumbashi");
    setBrideNationality("Congolaise");
    setBrideIdNumber("NIN-CD-1993-074129");
    setBrideOccupation("Médecin Spécialiste");
    setBrideResidence("28 Avenue Colonel Mondjiba, Quartier Basoko, Commune de Ngaliema, Kinshasa");
    setBrideFatherName("MPUTU ILUNGA François");
    setBrideMotherName("KAPINGA MBOMBO Thérèse");

    // Marriage Details
    setMarriageDate("2024-02-14");
    setMatrimonialRegime("Communauté réduite aux acquêts");
    setRegistrationCity("Kinshasa");
    setCivilRegistryOffice("Kinshasa - Maison Communale de la Gombe (Bureau Central)");
    setPhone("+243 81 555 7890");
    setEmail("mariage.kabila@egov.cd");

    // Pre-filled Supporting Documents
    setGroomBirthCertDoc("acte_naissance_epoux_kabila.pdf");
    setBrideBirthCertDoc("acte_naissance_epouse_mputu.pdf");
    setGroomIdDoc("cni_epoux_kabila_dieudonne.pdf");
    setBrideIdDoc("cni_epouse_mputu_grace.pdf");
    setDeclarationAgreed(true);
    setValidationError(null);
  };

  const handleSingleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (name: string | null) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0].name);
    }
  };

  const validateStep1 = () => {
    if (
      !groomSurname.trim() ||
      !groomPostName.trim() ||
      !groomFirstName.trim() ||
      !groomBirthDate ||
      !groomBirthPlace.trim() ||
      !groomResidence.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner toutes les informations obligatoires de l'époux, y compris l'adresse de résidence."
          : "Please fill in all mandatory groom details, including residential address."
      );
      return false;
    }

    if (
      !brideSurname.trim() ||
      !bridePostName.trim() ||
      !brideFirstName.trim() ||
      !brideBirthDate ||
      !brideBirthPlace.trim() ||
      !brideResidence.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner toutes les informations obligatoires de l'épouse, y compris l'adresse de résidence."
          : "Please fill in all mandatory bride details, including residential address."
      );
      return false;
    }

    if (!marriageDate) {
      setValidationError(
        isFr
          ? "Veuillez indiquer la date de célébration du mariage."
          : "Please specify the marriage celebration date."
      );
      return false;
    }

    if (!phone || phone.trim() === "+243") {
      setValidationError(
        isFr
          ? "Le numéro de téléphone officiel est obligatoire."
          : "Official phone number is mandatory."
      );
      return false;
    }

    if (!email || !email.includes("@")) {
      setValidationError(
        isFr
          ? "Une adresse email valide est requise pour le suivi."
          : "A valid email address is required for official tracking."
      );
      return false;
    }

    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!groomBirthCertDoc) {
      setValidationError(
        isFr
          ? "L'acte de naissance de l'époux est obligatoire."
          : "Groom's birth certificate is mandatory."
      );
      return false;
    }
    if (!brideBirthCertDoc) {
      setValidationError(
        isFr
          ? "L'acte de naissance de l'épouse est obligatoire."
          : "Bride's birth certificate is mandatory."
      );
      return false;
    }
    if (!groomIdDoc) {
      setValidationError(
        isFr
          ? "La pièce d'identité / NIN de l'époux est obligatoire."
          : "Groom's national ID / NIN document is mandatory."
      );
      return false;
    }
    if (!brideIdDoc) {
      setValidationError(
        isFr
          ? "La pièce d'identité / NIN de l'épouse est obligatoire."
          : "Bride's national ID / NIN document is mandatory."
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleNextToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  const handleNextToStep3 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = async () => {
    if (!declarationAgreed) {
      setValidationError(
        isFr
          ? "Veuillez certifier sur l'honneur l'exactitude des informations fournies."
          : "Please confirm the declaration on honour to proceed."
      );
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-MR-${randomSuffix}`;
    const computedGroomName = `${groomSurname.trim()} ${groomPostName.trim()} ${groomFirstName.trim()}`;
    const computedBrideName = `${brideSurname.trim()} ${bridePostName.trim()} ${brideFirstName.trim()}`;
    const jointSpousesName = `${computedGroomName} & ${computedBrideName}`;

    const supportingDocsPayload = [
      { type: "groom_birth_cert", name: groomBirthCertDoc || "acte_naissance_epoux.pdf" },
      { type: "bride_birth_cert", name: brideBirthCertDoc || "acte_naissance_epouse.pdf" },
      { type: "groom_id", name: groomIdDoc || "cni_epoux.pdf" },
      { type: "bride_id", name: brideIdDoc || "cni_epouse.pdf" },
    ];

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: "acte-mariage",
      serviceTitle: isFr
        ? "Certificat d'Enregistrement de Mariage"
        : "Marriage Registration Certificate",
      applicantName: jointSpousesName,
      email: email.trim(),
      phone: phone.trim(),
      city: registrationCity,
      submittedAt: new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "submitted",
      statusNotesFr:
        "Dossier d'union conjugale enregistré au greffe communal. Vérification des pièces et transcription en cours.",
      statusNotesEn:
        "Marriage application recorded at civil registry. Verification of documents and transcription in progress.",
      collectionPoint: civilRegistryOffice,
    };

    try {
      await fetch("/api/applications/marriage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "acte-mariage",
          serviceTitle: isFr
            ? "Certificat d'Enregistrement de Mariage"
            : "Marriage Registration Certificate",
          groomFullName: computedGroomName,
          groomBirthDate,
          groomBirthPlace,
          groomNationality,
          groomIdNumber,
          groomOccupation,
          groomResidence,
          groomFatherName,
          groomMotherName,
          brideFullName: computedBrideName,
          brideBirthDate,
          brideBirthPlace,
          brideNationality,
          brideIdNumber,
          brideOccupation,
          brideResidence,
          brideFatherName,
          brideMotherName,
          marriageDate,
          matrimonialRegime,
          civilRegistryOffice,
          registrationCity,
          phone,
          email,
          supportingDocuments: supportingDocsPayload,
          declarationAgreed: true,
        }),
      });

      setSubmittedApp(newApp);
    } catch (err) {
      console.error("Local persistence fallback:", err);
      setSubmittedApp(newApp);
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab="services"
        onTabChange={(tab) => router.push(`/?tab=${tab}`)}
        onOpenOfficerPortal={() => router.push("/?officer=true")}
      />

      <main className="flex-1 pt-24 sm:pt-[105px] pb-20">
        {/* Sovereign Color Stripe (DRC Flag Colors) */}
        <div className="h-1.5 w-full flex no-print">
          <div className="flex-1 bg-[#007fff]" />
          <div className="w-1/6 bg-[#fcd116]" />
          <div className="w-1/6 bg-[#ce1126]" />
        </div>

        {/* ========================================================================= */}
        {/* DRC CIVIC HERO BANNER (REALISTIC PHOTOGRAPHIC BG, CENTERED HEADING & TEXT)*/}
        {/* ========================================================================= */}
        <section
          className="relative bg-cover bg-center border-b border-slate-200/90 py-10 sm:py-14 overflow-hidden no-print"
          style={{ backgroundImage: "url('/national-id-hero-bg.jpg')" }}
        >
          {/* Translucent overlay maintaining daylight contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90 backdrop-blur-[0.5px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2.5">
            {/* Centered Main Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              {isFr ? (
                <>
                  Acte de Mariage{" "}
                  <span className="text-blue-600">Officiel</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Marriage Certificate</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Effectuez votre demande officielle en ligne pour l'enregistrement et la délivrance de l'acte de mariage certifié conforme selon le Code de la Famille de la RDC."
                : "Official online application for civil marriage registration and issuance of certified marriage certificate under the DRC Family Code."}
            </p>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FORM CONTAINER (MAX-W-5XL, IDENTICAL TO OTHER SERVICES)       */}
        {/* ============================================================== */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          {!submittedApp ? (
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
              {/* Demo Fill Button placed neatly inside top-right of form card */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 bg-slate-100/70 hover:bg-slate-100 border border-slate-200/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title={isFr ? "Remplir avec des données de test" : "Fill with test data"}
                >
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  <span>{isFr ? "Remplissage Démo" : "Demo Fill"}</span>
                </button>
              </div>

              {/* Header Title (Centered, Clean) */}
              <div className="text-center space-y-1 pb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Formulaire de Déclaration d'Acte de Mariage"
                    : "Marriage Registration Application Form"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Direction Générale de l'État Civil • Ministère de l'Intérieur et Sécurité"
                    : "General Directorate of Civil Status • Ministry of Interior and Security"}
                </p>
              </div>

              {/* 3-Step Connected Progress Stepper (Mathematically centered, no lines poking out) */}
              <div className="w-full max-w-xl mx-auto pt-2 pb-6">
                <div className="relative">
                  {/* Continuous horizontal connecting track between step circle centers */}
                  <div
                    className="absolute top-5 -translate-y-1/2 h-[2px] bg-slate-200 z-0"
                    style={{ left: "16.666%", right: "16.666%" }}
                  >
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                      }}
                    />
                  </div>

                  {/* 3 Step Nodes in Balanced Grid */}
                  <div className="grid grid-cols-3 relative z-10">
                    {/* Step 1 Node */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          currentStep === 1
                            ? "bg-blue-600 text-white ring-4 ring-blue-500/25 border-2 border-white shadow-xs"
                            : currentStep > 1
                            ? "bg-blue-600 text-white"
                            : "bg-white border-2 border-slate-300 text-slate-400"
                        }`}
                      >
                        {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : "1"}
                      </div>
                      <span
                        className={`mt-2 text-xs sm:text-sm tracking-tight text-center ${
                          currentStep === 1
                            ? "text-slate-900 font-bold"
                            : currentStep > 1
                            ? "text-slate-700 font-semibold"
                            : "text-slate-400 font-medium"
                        }`}
                      >
                        {isFr ? "Identité des Époux" : "Spouses' Identity"}
                      </span>
                    </div>

                    {/* Step 2 Node */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          currentStep === 2
                            ? "bg-blue-600 text-white ring-4 ring-blue-500/25 border-2 border-white shadow-xs"
                            : currentStep > 2
                            ? "bg-blue-600 text-white"
                            : "bg-white border-2 border-slate-300 text-slate-400"
                        }`}
                      >
                        {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : "2"}
                      </div>
                      <span
                        className={`mt-2 text-xs sm:text-sm tracking-tight text-center ${
                          currentStep === 2
                            ? "text-slate-900 font-bold"
                            : currentStep > 2
                            ? "text-slate-700 font-semibold"
                            : "text-slate-400 font-medium"
                        }`}
                      >
                        {isFr ? "Pièces Justificatives" : "Supporting Documents"}
                      </span>
                    </div>

                    {/* Step 3 Node */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          currentStep === 3
                            ? "bg-blue-600 text-white ring-4 ring-blue-500/25 border-2 border-white shadow-xs"
                            : "bg-white border-2 border-slate-300 text-slate-400"
                        }`}
                      >
                        3
                      </div>
                      <span
                        className={`mt-2 text-xs sm:text-sm tracking-tight text-center ${
                          currentStep === 3
                            ? "text-slate-900 font-bold"
                            : "text-slate-400 font-medium"
                        }`}
                      >
                        {isFr ? "Vérification & Soumission" : "Review & Submit"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Alert */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 1: SPOUSES' IDENTITY & CELEBRATION DETAILS                 */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Groom's Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Identité de l'Époux" : "Groom's Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille de l'époux *" : "Groom's Surname *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KABILA"
                          value={groomSurname}
                          onChange={(e) => setGroomSurname(e.target.value.toUpperCase())}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Post-nom *" : "Post-name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: TSHIMANGA"
                          value={groomPostName}
                          onChange={(e) => setGroomPostName(e.target.value.toUpperCase())}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Prénom *" : "First Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Dieudonné"
                          value={groomFirstName}
                          onChange={(e) => setGroomFirstName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Date de naissance de l'époux *" : "Groom's Date of Birth *"}
                        </label>
                        <DatePickerField
                          value={groomBirthDate}
                          onChange={setGroomBirthDate}
                          language={language}
                          minYear={1930}
                          maxYear={new Date().getFullYear() - 18}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Lieu de naissance de l'époux *" : "Groom's Place of Birth *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa - Gombe"
                          value={groomBirthPlace}
                          onChange={(e) => setGroomBirthPlace(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nationalité de l'époux *" : "Groom's Nationality *"}
                        </label>
                        <input
                          type="text"
                          value={groomNationality}
                          onChange={(e) => setGroomNationality(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Row 3: Groom's National ID & Profession */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "N° CNI / NIN de l'époux" : "Groom's National ID / NIN"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NIN-CD-1989-031982"
                          value={groomIdNumber}
                          onChange={(e) => setGroomIdNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Profession de l'époux" : "Groom's Profession"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Ingénieur Civil"
                          value={groomOccupation}
                          onChange={(e) => setGroomOccupation(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Row 4: Wide Full-Width Address Field for Groom's Residence */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Résidence actuelle de l'époux *" : "Groom's Current Residence Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 14 Avenue de la Justice, Quartier Batetela, Commune de la Gombe, Kinshasa"
                            : "Ex: 14 Justice Avenue, Batetela Quarter, Gombe Municipality, Kinshasa"
                        }
                        value={groomResidence}
                        onChange={(e) => setGroomResidence(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom du père de l'époux" : "Groom's Father's Name"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KABILA MUKENDI Joseph"
                          value={groomFatherName}
                          onChange={(e) => setGroomFatherName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de la mère de l'époux" : "Groom's Mother's Name"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MASIKA NZUZI Claudine"
                          value={groomMotherName}
                          onChange={(e) => setGroomMotherName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.2 Bride's Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Identité de l'Épouse" : "Bride's Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille de l'épouse *" : "Bride's Surname *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MPUTU"
                          value={brideSurname}
                          onChange={(e) => setBrideSurname(e.target.value.toUpperCase())}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Post-nom *" : "Post-name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KALOMBO"
                          value={bridePostName}
                          onChange={(e) => setBridePostName(e.target.value.toUpperCase())}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Prénom *" : "First Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Grace"
                          value={brideFirstName}
                          onChange={(e) => setBrideFirstName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Date de naissance de l'épouse *" : "Bride's Date of Birth *"}
                        </label>
                        <DatePickerField
                          value={brideBirthDate}
                          onChange={setBrideBirthDate}
                          language={language}
                          minYear={1930}
                          maxYear={new Date().getFullYear() - 18}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Lieu de naissance de l'épouse *" : "Bride's Place of Birth *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Lubumbashi"
                          value={brideBirthPlace}
                          onChange={(e) => setBrideBirthPlace(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nationalité de l'épouse *" : "Bride's Nationality *"}
                        </label>
                        <input
                          type="text"
                          value={brideNationality}
                          onChange={(e) => setBrideNationality(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Row 3: Bride's National ID & Profession */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "N° CNI / NIN de l'épouse" : "Bride's National ID / NIN"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NIN-CD-1993-074129"
                          value={brideIdNumber}
                          onChange={(e) => setBrideIdNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Profession de l'épouse" : "Bride's Profession"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Médecin Spécialiste"
                          value={brideOccupation}
                          onChange={(e) => setBrideOccupation(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Row 4: Wide Full-Width Address Field for Bride's Residence */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Résidence actuelle de l'épouse *" : "Bride's Current Residence Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 28 Avenue Colonel Mondjiba, Quartier Basoko, Commune de Ngaliema, Kinshasa"
                            : "Ex: 28 Colonel Mondjiba Avenue, Basoko Quarter, Ngaliema Municipality, Kinshasa"
                        }
                        value={brideResidence}
                        onChange={(e) => setBrideResidence(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom du père de l'épouse" : "Bride's Father's Name"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MPUTU ILUNGA François"
                          value={brideFatherName}
                          onChange={(e) => setBrideFatherName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de la mère de l'épouse" : "Bride's Mother's Name"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KAPINGA MBOMBO Thérèse"
                          value={brideMotherName}
                          onChange={(e) => setBrideMotherName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.3 Marriage Celebration & Registry Office */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Heart className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Célébration & Centre d'État Civil"
                          : "Marriage Celebration & Civil Registry"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Date de célébration du mariage civil *"
                            : "Civil Marriage Celebration Date *"}
                        </label>
                        <DatePickerField
                          value={marriageDate}
                          onChange={setMarriageDate}
                          language={language}
                          minYear={1950}
                          maxYear={new Date().getFullYear()}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Régime matrimonial choisi *" : "Matrimonial Property Regime *"}
                        </label>
                        <select
                          value={matrimonialRegime}
                          onChange={(e) => setMatrimonialRegime(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {MATRIMONIAL_REGIMES.map((regime) => (
                            <option key={regime.id} value={regime.labelFr}>
                              {isFr ? regime.labelFr : regime.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Ville de l'État Civil" : "City / Municipality"}
                        </label>
                        <input
                          type="text"
                          value={registrationCity}
                          onChange={(e) => setRegistrationCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Centre d'État Civil / Maison Communale *" : "Civil Registry Office / City Hall *"}
                        </label>
                        <select
                          value={civilRegistryOffice}
                          onChange={(e) => setCivilRegistryOffice(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {CIVIL_REGISTRY_OFFICES.map((office) => (
                            <option key={office} value={office}>
                              {office}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Téléphone de contact (SMS) *" : "Contact Phone (SMS) *"}
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Adresse Email *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          placeholder="famille@egov.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Actions: Clean Standard Text */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextToStep2}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 2: SUPPORTING LEGAL DOCUMENTS (4 REQUIRED ROWS)           */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5 text-slate-900 pb-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                      {isFr
                        ? "Soumission des Pièces Justificatives"
                        : "Supporting Documents Submission"}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 -mt-3">
                    {isFr
                      ? "Formats acceptés : PDF, JPG, PNG - Max 10 Mo par document officiel."
                      : "Accepted formats: PDF, JPG, PNG - Max 10MB per official document."}
                  </p>

                  <div className="space-y-3 pt-2">
                    {/* Row 1: Groom's Birth Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          1
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Acte de Naissance de l'Époux"
                            : "Groom's Birth Certificate"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {groomBirthCertDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {groomBirthCertDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setGroomBirthCertDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>{isFr ? "Aucun fichier" : "No file chosen"}</span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>{isFr ? "Choisir un fichier" : "Choose File"}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleSingleFileUpload(e, setGroomBirthCertDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Bride's Birth Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Acte de Naissance de l'Épouse"
                            : "Bride's Birth Certificate"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {brideBirthCertDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {brideBirthCertDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setBrideBirthCertDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>{isFr ? "Aucun fichier" : "No file chosen"}</span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>{isFr ? "Choisir un fichier" : "Choose File"}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleSingleFileUpload(e, setBrideBirthCertDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Groom's National ID */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Carte d'Identité / NIN de l'Époux"
                            : "Groom's National ID / NIN"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {groomIdDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {groomIdDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setGroomIdDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>{isFr ? "Aucun fichier" : "No file chosen"}</span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>{isFr ? "Choisir un fichier" : "Choose File"}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleSingleFileUpload(e, setGroomIdDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Bride's National ID */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Carte d'Identité / NIN de l'Épouse"
                            : "Bride's National ID / NIN"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {brideIdDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {brideIdDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setBrideIdDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>{isFr ? "Aucun fichier" : "No file chosen"}</span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>{isFr ? "Choisir un fichier" : "Choose File"}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleSingleFileUpload(e, setBrideIdDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Bottom Actions */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError(null);
                        setCurrentStep(1);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{isFr ? "Étape précédente" : "Previous Step"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextToStep3}
                      className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 3: REVIEW & SUBMIT (CLEAN UNIFORM FORM LAYOUT)             */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {isFr ? "Vérification Complète du Dossier" : "Complete Application Review"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isFr
                        ? "Vérifiez attentivement les informations ci-dessous avant la soumission définitive au greffe."
                        : "Carefully verify the information below before final submission."}
                    </p>
                  </div>

                  {/* 1. Spouses' Identity Review Section */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Identité des Époux" : "Spouses' Identity"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Groom Column */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                          {isFr ? "L'Époux (Mari)" : "Groom (Husband)"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Nom Complet" : "Full Name"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {groomSurname} {groomPostName} {groomFirstName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Date & Lieu de Naissance" : "Birth Date & Place"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {groomBirthDate} • {groomBirthPlace}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "N° CNI / NIN" : "National ID / NIN"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                              {groomIdNumber || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Profession" : "Profession"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {groomOccupation || "—"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Résidence Actuelle" : "Current Residence"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {groomResidence || "—"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Filiation de l'époux" : "Groom's Parents"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {groomFatherName || "—"} & {groomMotherName || "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bride Column */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                          {isFr ? "L'Épouse (Femme)" : "Bride (Wife)"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Nom Complet" : "Full Name"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {brideSurname} {bridePostName} {brideFirstName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Date & Lieu de Naissance" : "Birth Date & Place"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {brideBirthDate} • {brideBirthPlace}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "N° CNI / NIN" : "National ID / NIN"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                              {brideIdNumber || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Profession" : "Profession"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {brideOccupation || "—"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Résidence Actuelle" : "Current Residence"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {brideResidence || "—"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Filiation de l'épouse" : "Bride's Parents"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {brideFatherName || "—"} & {brideMotherName || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Marriage Celebration & Civil Registry Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Détails de l'Union & Centre d'État Civil" : "Marriage Details & Civil Registry"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Date de Célébration" : "Celebration Date"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {marriageDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Régime Matrimonial" : "Property Regime"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {matrimonialRegime}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Centre d'État Civil" : "Registry Office"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {civilRegistryOffice}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {registrationCity}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Contact des Époux" : "Spouses' Contact"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {phone}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Verified Attached Documents */}
                  <div className="pb-6 border-b border-slate-200 space-y-3">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Pièces Justificatives Vérifiées" : "Verified Attached Documents"}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            1
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {groomBirthCertDoc || "acte_naissance_epoux.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Acte de Naissance de l'Époux" : "Groom's Birth Certificate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            2
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {brideBirthCertDoc || "acte_naissance_epouse.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Acte de Naissance de l'Épouse" : "Bride's Birth Certificate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {groomIdDoc || "cni_epoux.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Carte d'Identité / NIN de l'Époux" : "Groom's National ID / NIN"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            4
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {brideIdDoc || "cni_epouse.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Carte d'Identité / NIN de l'Épouse" : "Bride's National ID / NIN"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Declaration on Honour - Clean Simple Gray */}
                  <label className="flex items-start gap-3 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAgreed}
                      onChange={(e) => setDeclarationAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-400 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      {isFr
                        ? "Nous certifions sur l'honneur l'exactitude des déclarations d'union ci-dessus conformément aux dispositions du Code de la Famille de la République Démocratique du Congo."
                        : "We solemnly certify on honour the accuracy of the marriage declarations above under the provisions of the Family Code of the Democratic Republic of the Congo."}
                    </span>
                  </label>

                  {/* Step 3 Actions */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError(null);
                        setCurrentStep(2);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isFr ? "Modifier les informations" : "Edit Details"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleFinalSubmit}
                      className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isFr ? "Envoi en cours..." : "Submitting..."}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>{isFr ? "Soumettre la Demande" : "Submit Application"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* OFFICIAL SUBMISSION RECEIPT (MATCHES PASSPORT & NATIONAL ID)   */
            /* ============================================================== */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-center">
              {/* ANIMATED TICK CHECKMARK */}
              <div className="flex justify-center pt-2">
                <AnimatedCheckmark size={64} />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Demande de Certificat de Mariage Enregistrée"
                    : "Marriage Registration Successfully Submitted"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isFr
                    ? "Votre dossier officiel d'union conjugale a été transmis au bureau de l'officier d'état civil."
                    : "Your official marriage dossier has been registered with the civil registry office."}
                </p>
              </div>

              {/* Big Tracking Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-600 text-white shadow-xs max-w-md mx-auto">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                    {isFr ? "Numéro de Suivi Dossier" : "Official Tracking ID"}
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold tracking-wide">
                    {submittedApp.trackingId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submittedApp.trackingId)}
                  className="text-blue-100 hover:text-white transition-colors cursor-pointer p-1"
                  title={isFr ? "Copier le code" : "Copy code"}
                >
                  {hasCopied ? (
                    <Check className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Receipt Summary Card */}
              <div className="print-clean-page bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 text-left text-xs space-y-3.5 max-w-lg mx-auto shadow-xs">
                {/* Clean Official Receipt Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {isFr ? "Récépissé Officiel" : "Official Receipt"}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {isFr
                        ? "Enregistrement de Mariage Civil"
                        : "Civil Marriage Registration"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {isFr ? "N° de Référence" : "Reference No"}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-blue-600 tracking-wider">
                      {submittedApp.trackingId}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Les Époux :" : "Spouses:"}</span>
                    <span className="font-bold text-slate-900 text-right">
                      {submittedApp.applicantName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Date de Célébration :" : "Celebration Date:"}</span>
                    <span className="font-medium text-slate-900 text-right">{marriageDate}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Régime Matrimonial :" : "Property Regime:"}</span>
                    <span className="font-medium text-slate-900 text-right">{matrimonialRegime}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Centre d'État Civil :" : "Civil Registry:"}</span>
                    <span className="font-medium text-slate-900 text-right">{civilRegistryOffice}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Contact (SMS & Email) :" : "Contact:"}</span>
                    <span className="font-medium text-slate-900 text-right">{phone}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{isFr ? "Frais Réglementés :" : "Regulated Fee:"}</span>
                    <span className="font-medium text-slate-900 text-right">15 000 CDF</span>
                  </div>
                </div>
              </div>

              {/* Actions (Screen View Only) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isFr ? "Imprimer le Récépissé" : "Print Receipt"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedApp(null);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>{isFr ? "Nouvelle Déclaration" : "New Application"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}

export default function MarriageCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MarriageCertificateContent />
    </Suspense>
  );
}
