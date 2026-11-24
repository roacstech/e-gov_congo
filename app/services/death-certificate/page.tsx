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
  FileText,
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
  Upload,
  Building2,
  Sparkles,
  ShieldCheck,
  Loader2,
  Activity,
  HeartCrack,
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

const MARITAL_STATUSES = [
  { id: "marie", labelFr: "Marié(e)", labelEn: "Married" },
  { id: "veuf", labelFr: "Veuf / Veuve", labelEn: "Widowed" },
  { id: "celibataire", labelFr: "Célibataire", labelEn: "Single" },
  { id: "divorce", labelFr: "Divorcé(e)", labelEn: "Divorced" },
];

const LOCATION_TYPES = [
  {
    id: "hopital",
    labelFr: "Hôpital / Centre Médical",
    labelEn: "Hospital / Medical Center",
  },
  {
    id: "domicile",
    labelFr: "Domicile / Résidence privée",
    labelEn: "Home / Private Residence",
  },
  {
    id: "voie_publique",
    labelFr: "Voie publique / Accident",
    labelEn: "Public Road / Accident",
  },
  {
    id: "autre",
    labelFr: "Autre lieu d'occurrence",
    labelEn: "Other location",
  },
];

const DECLARANT_RELATIONSHIPS = [
  {
    id: "conjoint",
    labelFr: "Conjoint(e) survivant(e)",
    labelEn: "Surviving Spouse",
  },
  {
    id: "enfant",
    labelFr: "Enfant / Descendant direct",
    labelEn: "Child / Direct Descendant",
  },
  {
    id: "parent",
    labelFr: "Père / Mère",
    labelEn: "Father / Mother",
  },
  {
    id: "fratrie",
    labelFr: "Frère / Sœur",
    labelEn: "Brother / Sister",
  },
  {
    id: "mandataire",
    labelFr: "Proche parent / Mandataire légal de la famille",
    labelEn: "Close relative / Legal representative",
  },
];

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
  minYear = 1920,
  maxYear = new Date().getFullYear(),
  placeholder = "AAAA-MM-JJ",
}: DatePickerProps) {
  const isFr = language === "fr";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date(1960, 0, 1);
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? 1960 : initialDate.getFullYear()
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

  const handleSelectDay = (day: number) => {
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
        className="w-full text-left text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 w-[280px] sm:w-[320px] text-slate-800">
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                {(isFr ? MONTHS_FR : MONTHS_EN).map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                title="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                title="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {(isFr ? DAYS_FR : DAYS_EN).map((d, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold text-slate-400 uppercase py-1"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const dateString = `${viewYear}-${String(viewMonth + 1).padStart(
                2,
                "0"
              )}-${String(d).padStart(2, "0")}`;
              const isSelected = value === dateString;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DeathCertificateContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // STEP PROGRESS STATE (1: Identity & Circumstances, 2: Documents, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1: DECEASED IDENTITY
  const [deceasedSurname, setDeceasedSurname] = useState("");
  const [deceasedPostName, setDeceasedPostName] = useState("");
  const [deceasedFirstName, setDeceasedFirstName] = useState("");
  const [deceasedGender, setDeceasedGender] = useState<"M" | "F">("M");
  const [deceasedBirthDate, setDeceasedBirthDate] = useState("");
  const [deceasedBirthPlace, setDeceasedBirthPlace] = useState("");
  const [deceasedNationality, setDeceasedNationality] = useState("Congolaise");
  const [deceasedIdNumber, setDeceasedIdNumber] = useState("");
  const [deceasedMaritalStatus, setDeceasedMaritalStatus] = useState("Marié(e)");
  const [deceasedOccupation, setDeceasedOccupation] = useState("");
  const [deceasedLastResidence, setDeceasedLastResidence] = useState("");

  // STEP 1: CIRCUMSTANCES & MEDICAL RECORD OF DEATH
  const [deathDate, setDeathDate] = useState("");
  const [deathTime, setDeathTime] = useState("");
  const [deathLocationType, setDeathLocationType] = useState(
    "Hôpital / Centre Médical"
  );
  const [deathPlace, setDeathPlace] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [medicalNoticeNumber, setMedicalNoticeNumber] = useState("");
  const [certifyingDoctor, setCertifyingDoctor] = useState("");

  // STEP 1: DECLARANT IDENTITY & REGISTRY OFFICE
  const [declarantSurname, setDeclarantSurname] = useState("");
  const [declarantPostName, setDeclarantPostName] = useState("");
  const [declarantFirstName, setDeclarantFirstName] = useState("");
  const [declarantRelationship, setDeclarantRelationship] = useState(
    "Enfant / Descendant direct"
  );
  const [declarantIdNumber, setDeclarantIdNumber] = useState("");
  const [declarantPhone, setDeclarantPhone] = useState("+243 ");
  const [declarantEmail, setDeclarantEmail] = useState("");
  const [declarantResidence, setDeclarantResidence] = useState("");
  const [civilRegistryOffice, setCivilRegistryOffice] = useState(
    CIVIL_REGISTRY_OFFICES[0]
  );
  const [registrationCity, setRegistrationCity] = useState("Kinshasa");

  // STEP 2: SUPPORTING LEGAL DOCUMENTS (4 MANDATORY ROWS)
  const [medicalNoticeDoc, setMedicalNoticeDoc] = useState<string | null>(null);
  const [deceasedIdDoc, setDeceasedIdDoc] = useState<string | null>(null);
  const [declarantIdDoc, setDeclarantIdDoc] = useState<string | null>(null);
  const [burialPermitDoc, setBurialPermitDoc] = useState<string | null>(null);

  // STEP 3 & SUBMISSION STATE
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(
    null
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDemoFill = () => {
    // Deceased details
    setDeceasedSurname("MUKENDI");
    setDeceasedPostName("TSHISUNGU");
    setDeceasedFirstName("Joseph");
    setDeceasedGender("M");
    setDeceasedBirthDate("1952-04-12");
    setDeceasedBirthPlace("Kananga");
    setDeceasedNationality("Congolaise");
    setDeceasedIdNumber("NIN-CD-1952-004812");
    setDeceasedMaritalStatus("Marié(e)");
    setDeceasedOccupation("Professeur d'Université Émérite");
    setDeceasedLastResidence(
      "18 Avenue de la Paix, Quartier Batetela, Commune de la Gombe, Kinshasa"
    );

    // Circumstances of death
    setDeathDate("2026-03-10");
    setDeathTime("08:45");
    setDeathLocationType("Hôpital / Centre Médical");
    setDeathPlace("Kinshasa - Gombe");
    setHospitalName(
      "Hôpital Général de Référence de Kinshasa (Ex-Mama Yemo)"
    );
    setMedicalNoticeNumber("AVIS-MED-2026-0814");
    setCertifyingDoctor("Dr. KABANGA Jean-Paul (Matricule CNOM: 49102)");

    // Declarant details
    setDeclarantSurname("MUKENDI");
    setDeclarantPostName("ILUNGA");
    setDeclarantFirstName("Dieudonné");
    setDeclarantRelationship("Enfant / Descendant direct");
    setDeclarantIdNumber("NIN-CD-1985-091421");
    setDeclarantPhone("+243 81 998 7766");
    setDeclarantEmail("famille.mukendi@egov.cd");
    setDeclarantResidence(
      "24 Avenue des Aviateurs, Quartier Haut-Commandement, Commune de la Gombe, Kinshasa"
    );
    setCivilRegistryOffice(CIVIL_REGISTRY_OFFICES[0]);
    setRegistrationCity("Kinshasa");

    // Supporting Documents
    setMedicalNoticeDoc("constat_deces_medical_mama_yemo.pdf");
    setDeceasedIdDoc("cni_defunt_mukendi_joseph.pdf");
    setDeclarantIdDoc("cni_declarant_mukendi_dieudonne.pdf");
    setBurialPermitDoc("livret_famille_acte_domicile.pdf");
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
      !deceasedSurname.trim() ||
      !deceasedPostName.trim() ||
      !deceasedFirstName.trim() ||
      !deceasedBirthDate ||
      !deceasedBirthPlace.trim() ||
      !deceasedLastResidence.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner toutes les informations obligatoires du défunt, y compris la dernière résidence."
          : "Please fill in all mandatory deceased details, including last residence."
      );
      return false;
    }

    if (!deathDate || !deathPlace.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner la date et le lieu précis de survenance du décès."
          : "Please specify the date and exact place of death."
      );
      return false;
    }

    if (
      !declarantSurname.trim() ||
      !declarantPostName.trim() ||
      !declarantFirstName.trim() ||
      !declarantResidence.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner l'identité complète et l'adresse de résidence du déclarant."
          : "Please provide the declarant's full name and residential address."
      );
      return false;
    }

    if (!declarantPhone || declarantPhone.trim() === "+243") {
      setValidationError(
        isFr
          ? "Le numéro de téléphone du déclarant est obligatoire pour le suivi officiel."
          : "Declarant's contact phone number is mandatory for official tracking."
      );
      return false;
    }

    if (!declarantEmail || !declarantEmail.includes("@")) {
      setValidationError(
        isFr
          ? "Une adresse email valide est requise pour l'envoi du récépissé."
          : "A valid email address is required to receive the receipt."
      );
      return false;
    }

    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!medicalNoticeDoc) {
      setValidationError(
        isFr
          ? "Le constat médical de décès ou avis hospitalier est obligatoire."
          : "Medical death certificate or hospital notification is mandatory."
      );
      return false;
    }
    if (!deceasedIdDoc) {
      setValidationError(
        isFr
          ? "La pièce d'identité du défunt est obligatoire."
          : "Deceased identity document is mandatory."
      );
      return false;
    }
    if (!declarantIdDoc) {
      setValidationError(
        isFr
          ? "La pièce d'identité du déclarant est obligatoire."
          : "Declarant's national ID document is mandatory."
      );
      return false;
    }
    if (!burialPermitDoc) {
      setValidationError(
        isFr
          ? "Le certificat de domicile, livret de famille ou permis d'inhumation est obligatoire."
          : "Proof of residence, family booklet, or burial permit is mandatory."
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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!declarationAgreed) {
      setValidationError(
        isFr
          ? "Veuillez certifier sur l'honneur l'exactitude des informations fournies pour cette déclaration."
          : "Please check the legal declaration to certify the accuracy of your statements."
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-DEC-${randomSuffix}`;
    const computedDeceasedName = `${deceasedSurname.trim()} ${deceasedPostName.trim()} ${deceasedFirstName.trim()}`;
    const computedDeclarantName = `${declarantSurname.trim()} ${declarantPostName.trim()} ${declarantFirstName.trim()}`;

    const supportingDocsPayload = [
      {
        id: "medical_death_notice",
        name: "Constat Médical de Décès",
        fileName: medicalNoticeDoc || "constat_deces_medical.pdf",
      },
      {
        id: "deceased_id",
        name: "Pièce d'Identité du Défunt",
        fileName: deceasedIdDoc || "cni_defunt.pdf",
      },
      {
        id: "declarant_id",
        name: "Pièce d'Identité du Déclarant",
        fileName: declarantIdDoc || "cni_declarant.pdf",
      },
      {
        id: "burial_permit",
        name: "Livret de Famille / Domicile",
        fileName: burialPermitDoc || "livret_famille.pdf",
      },
    ];

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: "acte-deces",
      serviceTitle: isFr
        ? "Certificat & Déclaration de Décès"
        : "Death Registration & Certificate",
      applicantName: computedDeceasedName,
      email: declarantEmail.trim(),
      phone: declarantPhone.trim(),
      city: registrationCity,
      submittedAt: new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "submitted",
      statusNotesFr:
        "Déclaration de décès enregistrée au greffe communal. Contrôle du constat médical et transcription en cours.",
      statusNotesEn:
        "Death declaration recorded at municipal civil registry. Verification of medical certificate in progress.",
      collectionPoint: civilRegistryOffice,
    };

    try {
      await fetch("/api/applications/death", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "acte-deces",
          serviceTitle: isFr
            ? "Certificat & Déclaration de Décès"
            : "Death Registration & Certificate",
          deceasedFullName: computedDeceasedName,
          deceasedGender,
          deceasedBirthDate,
          deceasedBirthPlace,
          deceasedNationality,
          deceasedIdNumber,
          deceasedMaritalStatus,
          deceasedOccupation,
          deceasedLastResidence,
          deathDate,
          deathTime,
          deathPlace,
          deathLocationType,
          hospitalName,
          medicalNoticeNumber,
          certifyingDoctor,
          declarantFullName: computedDeclarantName,
          declarantRelationship,
          declarantIdNumber,
          declarantResidence,
          declarantPhone,
          declarantEmail,
          civilRegistryOffice,
          registrationCity,
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
                  Acte de Décès{" "}
                  <span className="text-blue-600">Officiel</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Death Certificate</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Effectuez votre déclaration officielle en ligne pour l'enregistrement du décès et la délivrance de l'acte certifié conforme selon le Code de la Famille de la RDC."
                : "Official online application for legal death declaration and issuance of certified death certificate under the DRC Family Code."}
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
                    ? "Formulaire de Déclaration d'Acte de Décès"
                    : "Death Declaration Application Form"}
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
                        width:
                          currentStep === 1
                            ? "0%"
                            : currentStep === 2
                            ? "50%"
                            : "100%",
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
                        {currentStep > 1 ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          "1"
                        )}
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
                        {isFr ? "Identité & Circonstances" : "Identity & Details"}
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
                        {currentStep > 2 ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          "2"
                        )}
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
              {/* STEP 1: IDENTITY & CIRCUMSTANCES                               */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Deceased Civil Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Identité Civile du Défunt"
                          : "Deceased Civil Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille du défunt *" : "Deceased Surname *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MUKENDI"
                          value={deceasedSurname}
                          onChange={(e) =>
                            setDeceasedSurname(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Post-nom *" : "Post-name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: TSHISUNGU"
                          value={deceasedPostName}
                          onChange={(e) =>
                            setDeceasedPostName(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Prénom *" : "First Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Joseph"
                          value={deceasedFirstName}
                          onChange={(e) => setDeceasedFirstName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 capitalize"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Sexe du défunt *" : "Gender *"}
                        </label>
                        <div className="flex items-center gap-4 pt-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="deceasedGender"
                              checked={deceasedGender === "M"}
                              onChange={() => setDeceasedGender("M")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Masculin (M)" : "Male (M)"}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="deceasedGender"
                              checked={deceasedGender === "F"}
                              onChange={() => setDeceasedGender("F")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Féminin (F)" : "Female (F)"}</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Date de naissance du défunt *"
                            : "Deceased Date of Birth *"}
                        </label>
                        <DatePickerField
                          value={deceasedBirthDate}
                          onChange={setDeceasedBirthDate}
                          language={language}
                          minYear={1910}
                          maxYear={new Date().getFullYear()}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Lieu de naissance *"
                            : "Place of Birth *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kananga"
                          value={deceasedBirthPlace}
                          onChange={(e) => setDeceasedBirthPlace(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nationalité du défunt" : "Nationality"}
                        </label>
                        <input
                          type="text"
                          value={deceasedNationality}
                          onChange={(e) => setDeceasedNationality(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "N° CNI / NIN / Carte d'électeur"
                            : "National ID / NIN / Voter Card"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NIN-CD-1952-004812"
                          value={deceasedIdNumber}
                          onChange={(e) => setDeceasedIdNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "État civil au décès" : "Marital Status"}
                        </label>
                        <select
                          value={deceasedMaritalStatus}
                          onChange={(e) =>
                            setDeceasedMaritalStatus(e.target.value)
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {MARITAL_STATUSES.map((status) => (
                            <option key={status.id} value={status.labelFr}>
                              {isFr ? status.labelFr : status.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Dernière profession / Activité"
                            : "Last Known Profession / Occupation"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Professeur d'Université Émérite"
                          value={deceasedOccupation}
                          onChange={(e) =>
                            setDeceasedOccupation(e.target.value)
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Province de dernière résidence *"
                            : "Last Known Residence Province *"}
                        </label>
                        <select
                          value={registrationCity}
                          onChange={(e) => setRegistrationCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {DRC_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Wide Full-Width Address Field for Deceased Last Residence */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Dernière adresse de résidence complète du défunt *"
                          : "Deceased Last Known Full Physical Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 18 Avenue de la Paix, Quartier Batetela, Commune de la Gombe, Kinshasa"
                            : "Ex: 18 Peace Avenue, Batetela Quarter, Gombe Municipality, Kinshasa"
                        }
                        value={deceasedLastResidence}
                        onChange={(e) =>
                          setDeceasedLastResidence(e.target.value)
                        }
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* 1.2 Circumstances & Medical Record of Death */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Circonstances & Constat Médical du Décès"
                          : "Circumstances & Medical Record of Death"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Date de survenance du décès *" : "Date of Death *"}
                        </label>
                        <DatePickerField
                          value={deathDate}
                          onChange={setDeathDate}
                          language={language}
                          minYear={1950}
                          maxYear={new Date().getFullYear()}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Heure constatée du décès" : "Time of Death"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 08:45"
                          value={deathTime}
                          onChange={(e) => setDeathTime(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Cadre de survenance *" : "Location Type *"}
                        </label>
                        <select
                          value={deathLocationType}
                          onChange={(e) => setDeathLocationType(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {LOCATION_TYPES.map((type) => (
                            <option key={type.id} value={type.labelFr}>
                              {isFr ? type.labelFr : type.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Lieu / Établissement médical du décès *"
                            : "Place / Medical Facility of Death *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Hôpital Général de Référence de Kinshasa (Ex-Mama Yemo)"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Ville / Commune de survenance *"
                            : "City / Municipality of Occurrence *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa - Gombe"
                          value={deathPlace}
                          onChange={(e) => setDeathPlace(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "N° AVIS / Procès-verbal de constat médical *"
                            : "Medical Death Notice / Report No. *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: AVIS-MED-2026-0814"
                          value={medicalNoticeNumber}
                          onChange={(e) =>
                            setMedicalNoticeNumber(e.target.value)
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Médecin constatant / Médecin légiste *"
                            : "Certifying Doctor / Coroner *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Dr. KABANGA Jean-Paul (Matricule: CNOM-49102)"
                          value={certifyingDoctor}
                          onChange={(e) => setCertifyingDoctor(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.3 Declarant Identity & Civil Registry Office */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Identité du Déclarant & Centre d'État Civil"
                          : "Declarant Identity & Civil Registry Office"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Nom de famille du déclarant *"
                            : "Declarant Surname *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MUKENDI"
                          value={declarantSurname}
                          onChange={(e) =>
                            setDeclarantSurname(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Post-nom *" : "Post-name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: ILUNGA"
                          value={declarantPostName}
                          onChange={(e) =>
                            setDeclarantPostName(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Prénom *" : "First Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Dieudonné"
                          value={declarantFirstName}
                          onChange={(e) =>
                            setDeclarantFirstName(e.target.value)
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 capitalize"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Lien de parenté / Qualité du déclarant *"
                            : "Relationship to Deceased *"}
                        </label>
                        <select
                          value={declarantRelationship}
                          onChange={(e) =>
                            setDeclarantRelationship(e.target.value)
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {DECLARANT_RELATIONSHIPS.map((rel) => (
                            <option key={rel.id} value={rel.labelFr}>
                              {isFr ? rel.labelFr : rel.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "N° CNI / NIN du déclarant"
                            : "Declarant's National ID / NIN"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NIN-CD-1985-091421"
                          value={declarantIdNumber}
                          onChange={(e) => setDeclarantIdNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Wide Full-Width Address Field for Declarant Residence */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Adresse de résidence complète du déclarant *"
                          : "Declarant's Current Full Residence Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 24 Avenue des Aviateurs, Quartier Haut-Commandement, Commune de la Gombe, Kinshasa"
                            : "Ex: 24 Aviators Avenue, Haut-Commandement Quarter, Gombe Municipality, Kinshasa"
                        }
                        value={declarantResidence}
                        onChange={(e) => setDeclarantResidence(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Téléphone de contact (SMS) *"
                            : "Contact Phone (SMS) *"}
                        </label>
                        <input
                          type="text"
                          value={declarantPhone}
                          onChange={(e) => setDeclarantPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Adresse Email pour récépissé *"
                            : "Email Address for Receipt *"}
                        </label>
                        <input
                          type="email"
                          placeholder="famille@egov.cd"
                          value={declarantEmail}
                          onChange={(e) => setDeclarantEmail(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Centre d'État Civil / Maison Communale compétente *"
                          : "Civil Registry Office / Competent City Hall *"}
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
                    {/* Row 1: Medical Death Notice */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          1
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Constat Médical de Décès / Avis Hospitalier"
                            : "Medical Death Notice / Hospital Certificate"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {medicalNoticeDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {medicalNoticeDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMedicalNoticeDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>
                              {isFr ? "Aucun fichier" : "No file chosen"}
                            </span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>
                            {isFr ? "Choisir un fichier" : "Choose File"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleSingleFileUpload(e, setMedicalNoticeDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Deceased Identity Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Pièce d'Identité / CNI / NIN du Défunt"
                            : "Deceased National ID / Identity Document"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {deceasedIdDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {deceasedIdDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDeceasedIdDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>
                              {isFr ? "Aucun fichier" : "No file chosen"}
                            </span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>
                            {isFr ? "Choisir un fichier" : "Choose File"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleSingleFileUpload(e, setDeceasedIdDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Declarant Identity Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Pièce d'Identité / CNI / NIN du Déclarant"
                            : "Declarant National ID / Passport"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {declarantIdDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {declarantIdDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDeclarantIdDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>
                              {isFr ? "Aucun fichier" : "No file chosen"}
                            </span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>
                            {isFr ? "Choisir un fichier" : "Choose File"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleSingleFileUpload(e, setDeclarantIdDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Proof of Residence / Family Booklet / Burial Permit */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Certificat de Domicile ou Livret de Famille"
                            : "Proof of Residence or Family Booklet"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {burialPermitDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {burialPermitDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setBurialPermitDoc(null)}
                              className="text-slate-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                              title={isFr ? "Supprimer" : "Remove"}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-xs font-mono text-slate-400 shrink-0">
                            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>
                              {isFr ? "Aucun fichier" : "No file chosen"}
                            </span>
                          </div>
                        )}

                        <label className="h-9 px-3.5 sm:px-4 rounded-lg bg-white hover:bg-blue-50/60 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>
                            {isFr ? "Choisir un fichier" : "Choose File"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleSingleFileUpload(e, setBurialPermitDoc)
                            }
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
                      {isFr
                        ? "Vérification Complète de la Déclaration"
                        : "Complete Declaration Review"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isFr
                        ? "Vérifiez attentivement les informations ci-dessous avant la soumission définitive au greffe."
                        : "Carefully verify the information below before final submission."}
                    </p>
                  </div>

                  {/* 1. Deceased Identity Review Section */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Identité du Défunt" : "Deceased Identity"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Nom Complet" : "Full Name"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deceasedSurname} {deceasedPostName} {deceasedFirstName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Sexe & Nationalité" : "Gender & Nationality"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deceasedGender === "M"
                            ? isFr
                              ? "Masculin"
                              : "Male"
                            : isFr
                            ? "Féminin"
                            : "Female"}{" "}
                          • {deceasedNationality}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Date & Lieu de Naissance" : "Birth Date & Place"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deceasedBirthDate} • {deceasedBirthPlace}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "N° CNI / NIN" : "National ID / NIN"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {deceasedIdNumber || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "État Civil & Profession" : "Status & Profession"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deceasedMaritalStatus} • {deceasedOccupation || "—"}
                        </span>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Dernière Résidence Connue"
                            : "Last Known Residence"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deceasedLastResidence || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Circumstances of Death Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr
                          ? "Circonstances du Décès & Constat Médical"
                          : "Death Circumstances & Medical Record"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Date & Heure du Décès" : "Death Date & Time"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deathDate} {deathTime ? `à ${deathTime}` : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Cadre de Survenance" : "Location Type"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deathLocationType}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Lieu / Établissement" : "Place / Facility"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {hospitalName || deathPlace}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {deathPlace}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "N° Avis & Médecin" : "Report No. & Doctor"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {medicalNoticeNumber}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {certifyingDoctor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Declarant & Registry Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr
                          ? "Déclarant & Centre d'État Civil"
                          : "Declarant & Civil Registry Office"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Nom du Déclarant" : "Declarant Full Name"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {declarantSurname} {declarantPostName}{" "}
                          {declarantFirstName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Lien de Parenté" : "Relationship"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {declarantRelationship}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Contact Déclarant" : "Contact Phone / Email"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {declarantPhone}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {declarantEmail}
                        </span>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Résidence du Déclarant"
                            : "Declarant Residence"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {declarantResidence || "—"}
                        </span>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Centre d'État Civil Assigné"
                            : "Assigned Civil Registry Office"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {civilRegistryOffice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Verified Attached Documents */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr
                          ? "Documents Justificatifs Joints"
                          : "Verified Attached Documents"}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            1
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {medicalNoticeDoc || "constat_deces_medical.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr
                            ? "Constat Médical de Décès"
                            : "Medical Death Notice"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            2
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {deceasedIdDoc || "cni_defunt.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr
                            ? "Pièce d'Identité du Défunt"
                            : "Deceased ID Document"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {declarantIdDoc || "cni_declarant.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr
                            ? "Pièce d'Identité du Déclarant"
                            : "Declarant ID Document"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            4
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {burialPermitDoc || "livret_famille.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr
                            ? "Certificat de Domicile / Livret"
                            : "Residence Proof / Family Booklet"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Declaration on Honour - Clean Simple Gray */}
                  <label className="flex items-start gap-3 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAgreed}
                      onChange={(e) => setDeclarationAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-400 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      {isFr
                        ? "Je certifie sur l'honneur l'exactitude des informations fournies pour la déclaration de ce décès conformément aux dispositions du Code de la Famille de la République Démocratique du Congo."
                        : "I solemnly certify on honour the accuracy of the information provided for this death declaration under the provisions of the Family Code of the Democratic Republic of the Congo."}
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
                      <span>
                        {isFr ? "Modifier les informations" : "Edit Details"}
                      </span>
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
                          <span>
                            {isFr ? "Envoi en cours..." : "Submitting..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            {isFr
                              ? "Soumettre la Déclaration"
                              : "Submit Declaration"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* OFFICIAL SUBMISSION RECEIPT (MATCHES OTHER SOVEREIGN SERVICES)  */
            /* ============================================================== */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-center">
              {/* ANIMATED TICK CHECKMARK */}
              <div className="flex justify-center pt-2">
                <AnimatedCheckmark size={64} />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Déclaration de Décès Enregistrée"
                    : "Death Declaration Successfully Submitted"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isFr
                    ? "Votre déclaration officielle de décès a été transmise à l'officier de l'état civil communal pour transcription légale."
                    : "Your official death declaration has been registered with the civil registrar for legal certification."}
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
                        ? "Déclaration & Acte de Décès"
                        : "Death Declaration & Certificate"}
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
                    <span className="text-slate-500">
                      {isFr ? "Nom du Défunt :" : "Deceased:"}
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {submittedApp.applicantName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">
                      {isFr ? "Date du Décès :" : "Date of Death:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {deathDate} {deathTime ? `à ${deathTime}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">
                      {isFr ? "Lieu de Décès :" : "Place of Death:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {hospitalName || deathPlace}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">
                      {isFr ? "Déclarant & Lien :" : "Declarant:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {declarantSurname} {declarantFirstName} (
                      {declarantRelationship})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">
                      {isFr ? "Centre d'État Civil :" : "Civil Registry:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {civilRegistryOffice}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">
                      {isFr ? "Contact (SMS & Email) :" : "Contact:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {declarantPhone}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">
                      {isFr ? "Frais Réglementés :" : "Regulated Fee:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {isFr ? "Gratuit (Droit Civil)" : "Free (Civil Right)"}
                    </span>
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
                  <span>
                    {isFr ? "Nouvelle Déclaration" : "New Declaration"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

export default function DeathCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DeathCertificateContent />
    </Suspense>
  );
}
