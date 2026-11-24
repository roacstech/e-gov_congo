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
  Baby,
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
  HeartHandshake,
  Loader2,
} from "lucide-react";

const DRC_PROVINCES = [
  "Kinshasa",
  "Haut-Katanga",
  "Nord-Kivu",
  "Sud-Kivu",
  "Kongo-Central",
  "Kasaï-Oriental",
  "Kasaï-Central",
  "Kasaï",
  "Lualaba",
  "Haut-Lomami",
  "Tanganyika",
  "Maniema",
  "Ituri",
  "Haut-Uele",
  "Bas-Uele",
  "Tshopo",
  "Lomami",
  "Sankuru",
  "Kwilu",
  "Kwango",
  "Mai-Ndombe",
  "Équateur",
  "Mongala",
  "Nord-Ubangi",
  "Sud-Ubangi",
  "Tshuapa",
];

const CIVIL_REGISTRY_OFFICES = [
  { id: "kin-gombe", labelFr: "Kinshasa - Maison Communale de la Gombe (Bureau Central)", labelEn: "Kinshasa - Gombe Municipal Council (Central Office)" },
  { id: "kin-kalamu", labelFr: "Kinshasa - Maison Communale de Kalamu", labelEn: "Kinshasa - Kalamu Municipal Council" },
  { id: "kin-limete", labelFr: "Kinshasa - Maison Communale de Limete", labelEn: "Kinshasa - Limete Municipal Council" },
  { id: "kin-ngaliema", labelFr: "Kinshasa - Maison Communale de Ngaliema", labelEn: "Kinshasa - Ngaliema Municipal Council" },
  { id: "kin-masina", labelFr: "Kinshasa - Maison Communale de Masina", labelEn: "Kinshasa - Masina Municipal Council" },
  { id: "lshi-centre", labelFr: "Haut-Katanga - Hôtel de Ville de Lubumbashi", labelEn: "Haut-Katanga - Lubumbashi City Hall" },
  { id: "goma-mairie", labelFr: "Nord-Kivu - Mairie de Goma (État Civil)", labelEn: "Nord-Kivu - Goma City Hall (Civil Status)" },
  { id: "bkv-ibanda", labelFr: "Sud-Kivu - Maison Communale d'Ibanda (Bukavu)", labelEn: "Sud-Kivu - Ibanda Municipal Council (Bukavu)" },
  { id: "mbj-diulu", labelFr: "Kasaï-Oriental - Maison Communale de Diulu (Mbuji-Mayi)", labelEn: "Kasaï-Oriental - Diulu Municipal Council (Mbuji-Mayi)" },
  { id: "kis-makiso", labelFr: "Tshopo - Maison Communale de Makiso (Kisangani)", labelEn: "Tshopo - Makiso Municipal Council (Kisangani)" },
  { id: "mat-matadi", labelFr: "Kongo-Central - Mairie de Matadi", labelEn: "Kongo-Central - Matadi City Hall" },
  { id: "consulat-etranger", labelFr: "Poste Consulaire / Ambassade RDC à l'Étranger", labelEn: "Consular Office / DRC Embassy Abroad" },
];

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const YEARS = Array.from({ length: 40 }, (_, i) => 2026 - i);

interface DropdownCalendarPickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  language: Language;
}

function DropdownCalendarPicker({
  value,
  onChange,
  language,
}: DropdownCalendarPickerProps) {
  const isFr = language === "fr";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = value ? new Date(value) : new Date(2025, 0, 15);
  const initialYear = isNaN(parsedDate.getFullYear())
    ? 2025
    : parsedDate.getFullYear();
  const initialMonth = isNaN(parsedDate.getMonth()) ? 0 : parsedDate.getMonth();

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

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

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const handleDaySelect = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 flex items-center justify-between text-left shadow-2xs cursor-pointer transition-colors"
      >
        <span>
          {value
            ? value
            : isFr
            ? "Sélectionner la date de naissance"
            : "Select date of birth"}
        </span>
        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
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
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 cursor-pointer focus:outline-none focus:border-blue-500"
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
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 cursor-pointer focus:outline-none focus:border-blue-500"
              >
                {YEARS.map((y) => (
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
              <span key={i} className="text-[11px] font-bold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: adjustedFirstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mm = String(viewMonth + 1).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const dateString = `${viewYear}-${mm}-${dd}`;
              const isSelected = value === dateString;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
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

function BirthCertificateContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // Navigation & Step Control
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // SECTION 1.1: CHILD'S CIVIL IDENTITY
  const [surname, setSurname] = useState("");
  const [postName, setPostName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("08:15");
  const [birthCity, setBirthCity] = useState("");
  const [birthHospital, setBirthHospital] = useState("");

  // SECTION 1.2: PARENTAL LINEAGE
  // Father
  const [fatherFullName, setFatherFullName] = useState("");
  const [fatherNationality, setFatherNationality] = useState("Congolaise");
  const [fatherIdNumber, setFatherIdNumber] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  // Mother
  const [motherFullName, setMotherFullName] = useState("");
  const [motherNationality, setMotherNationality] = useState("Congolaise");
  const [motherIdNumber, setMotherIdNumber] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");

  // SECTION 1.3: DECLARANT & CIVIL REGISTRY OFFICE
  const [declarantRole, setDeclarantRole] = useState("Père");
  const [originProvince, setOriginProvince] = useState("Kinshasa");
  const [originCity, setOriginCity] = useState("Kinshasa - Gombe");
  const [civilRegistryOffice, setCivilRegistryOffice] = useState(
    "Kinshasa - Maison Communale de la Gombe (Bureau Central)"
  );
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");

  // STEP 2: SUPPORTING LEGAL DOCUMENTS (4 REQUIRED SINGLE-LINE ROWS, NO BABY PHOTO)
  const [maternityNoticeDoc, setMaternityNoticeDoc] = useState<string | null>(null);
  const [fatherIdDoc, setFatherIdDoc] = useState<string | null>(null);
  const [motherIdDoc, setMotherIdDoc] = useState<string | null>(null);
  const [residenceDoc, setResidenceDoc] = useState<string | null>(null);

  // STEP 3 & SUBMITTED RECEIPT STATE (IN-PLACE CARD MATCHING OTHER SERVICES)
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleDemoFill = () => {
    // Child info
    setSurname("ILUNGA");
    setPostName("KABANGA");
    setFirstName("Jean-Marc");
    setGender("M");
    setBirthDate("2024-03-15");
    setBirthTime("07:45");
    setBirthCity("Kinshasa - Limete");
    setBirthHospital("Maternité Saint-Joseph de Limete");

    // Parental Lineage
    setFatherFullName("ILUNGA KABANGA Jean-Paul");
    setFatherNationality("Congolaise");
    setFatherIdNumber("NIN-CD-1988-049281");
    setFatherOccupation("Ingénieur Informaticien");

    setMotherFullName("KASONGO WA BEYA Thérèse");
    setMotherNationality("Congolaise");
    setMotherIdNumber("NIN-CD-1992-073145");
    setMotherOccupation("Médecin Généraliste");

    // Declarant & Office
    setDeclarantRole("Père");
    setOriginProvince("Kinshasa");
    setOriginCity("Kinshasa - Gombe");
    setCivilRegistryOffice("Kinshasa - Maison Communale de la Gombe (Bureau Central)");
    setPhone("+243 81 999 4523");
    setEmail("ilunga.famille@egov.cd");

    // Pre-filled Supporting Documents (No baby photo needed)
    setMaternityNoticeDoc("avis_naissance_maternite_st_joseph.pdf");
    setFatherIdDoc("cni_pere_ilunga_jean_paul.pdf");
    setMotherIdDoc("cni_mere_kasongo_therese.pdf");
    setResidenceDoc("certificat_residence_gombe.pdf");
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
    if (!surname.trim() || !postName.trim() || !firstName.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner le nom, post-nom et prénom de l'enfant."
          : "Please provide the child's surname, post-name, and first name."
      );
      return false;
    }
    if (!birthDate) {
      setValidationError(
        isFr
          ? "Veuillez sélectionner la date de naissance de l'enfant."
          : "Please select the child's date of birth."
      );
      return false;
    }
    if (!birthCity.trim() || !birthHospital.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner le lieu de naissance et la formation médicale (maternité)."
          : "Please provide the place of birth and maternity clinic / hospital."
      );
      return false;
    }
    if (!fatherFullName.trim() || !motherFullName.trim()) {
      setValidationError(
        isFr
          ? "La filiation parentale (nom du père et nom de la mère) est obligatoire."
          : "Parental lineage (father's and mother's names) is mandatory."
      );
      return false;
    }
    if (!phone.trim() || phone.trim() === "+243" || !email.trim()) {
      setValidationError(
        isFr
          ? "Veuillez fournir un numéro de téléphone et une adresse e-mail de contact valides."
          : "Please provide a valid contact phone number and email address."
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!maternityNoticeDoc) {
      setValidationError(
        isFr
          ? "L'avis de naissance ou déclaration de la maternité est obligatoire."
          : "The hospital delivery notice / maternity declaration is mandatory."
      );
      return false;
    }
    if (!fatherIdDoc && !motherIdDoc) {
      setValidationError(
        isFr
          ? "La pièce d'identité d'au moins un parent est obligatoire."
          : "At least one parent's identity document is mandatory."
      );
      return false;
    }
    if (!residenceDoc) {
      setValidationError(
        isFr
          ? "Le certificat de résidence & domicile est obligatoire."
          : "Residence certificate is mandatory."
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
    const trackingCode = `CD-2026-AN-${randomSuffix}`;
    const computedApplicantName = `${surname.trim()} ${postName.trim()} ${firstName.trim()}`;

    const supportingDocsPayload = [
      { type: "maternity_notice", name: maternityNoticeDoc || "avis_naissance.pdf" },
      { type: "father_id", name: fatherIdDoc || "cni_pere.pdf" },
      { type: "mother_id", name: motherIdDoc || "cni_mere.pdf" },
      { type: "residence_certificate", name: residenceDoc || "certificat_residence.pdf" },
    ];

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: "acte-naissance",
      serviceTitle: isFr ? "Acte de Naissance Sécurisé" : "Official Birth Certificate",
      applicantName: computedApplicantName,
      email: email.trim(),
      phone: phone.trim(),
      city: originCity,
      submittedAt: new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "submitted",
      statusNotesFr:
        "Déclaration d'acte de naissance enregistrée. Contrôle de conformité de l'avis de maternité et transcription à l'état civil en cours.",
      statusNotesEn:
        "Birth declaration registered. Hospital birth notice compliance check and civil registry recording underway.",
      collectionPoint: civilRegistryOffice,
    };

    try {
      await fetch("/api/applications/birth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "acte-naissance",
          serviceTitle: isFr ? "Acte de Naissance Sécurisé" : "Official Birth Certificate",
          applicantName: computedApplicantName,
          surname: surname.trim(),
          postName: postName.trim(),
          firstName: firstName.trim(),
          gender,
          birthDate,
          birthTime: birthTime.trim(),
          birthCity: birthCity.trim(),
          birthHospital: birthHospital.trim(),
          birthCountry: "République Démocratique du Congo",
          declarantRole,
          fatherFullName: fatherFullName.trim(),
          fatherNationality: fatherNationality.trim(),
          fatherIdNumber: fatherIdNumber.trim(),
          fatherOccupation: fatherOccupation.trim(),
          motherFullName: motherFullName.trim(),
          motherNationality: motherNationality.trim(),
          motherIdNumber: motherIdNumber.trim(),
          motherOccupation: motherOccupation.trim(),
          originProvince,
          originCity,
          civilRegistryOffice,
          phone: phone.trim(),
          email: email.trim(),
          supportingDocuments: supportingDocsPayload,
          declarationAgreed: true,
        }),
      });

      setSubmittedApp(newApp);
    } catch {
      // Fallback offline simulation so user flow never halts
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
      {/* Top Navigation */}
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
                  Acte de Naissance{" "}
                  <span className="text-blue-600">Officiel</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Birth Certificate</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Effectuez votre demande officielle en ligne pour l'enregistrement et la délivrance de l'acte de naissance certifié conforme selon le Code de la Famille de la RDC."
                : "Official online application for certified birth registration and issuance of birth certificate under the DRC Family Code."}
            </p>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FORM CONTAINER (MAX-W-5XL, IDENTICAL TO NATIONAL-ID)          */}
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
                  <span>{isFr ? "Remplir Démo" : "Demo Fill"}</span>
                </button>
              </div>

              {/* Header Title (Centered, Clean) */}
              <div className="text-center space-y-1 pb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Formulaire de Déclaration d'Acte de Naissance"
                    : "Birth Certificate Application Form"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Direction Générale de l'État Civil • Ministère de l'Intérieur et Sécurité"
                    : "General Directorate of Civil Status • Ministry of Interior and Security"}
                </p>
              </div>

              {/* 3-Step Connected Progress Stepper matching UI */}
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
                        {isFr ? "Identité & Filiation" : "Identity & Lineage"}
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
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 1: IDENTITY & LINEAGE                                     */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Child Civil Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Baby className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Identité Civile de l'Enfant" : "Child Civil Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille *" : "Surname / Family Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: ILUNGA"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 uppercase font-semibold text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Post-nom *" : "Post-name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KABANGA"
                          value={postName}
                          onChange={(e) => setPostName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 uppercase font-semibold text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Prénom *" : "First Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Jean-Marc"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 capitalize font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Gender Radio */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Sexe *" : "Gender *"}
                        </label>
                        <div className="flex items-center gap-4 pt-2.5">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === "M"}
                              onChange={() => setGender("M")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Masculin (M)" : "Male (M)"}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === "F"}
                              onChange={() => setGender("F")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Féminin (F)" : "Female (F)"}</span>
                          </label>
                        </div>
                      </div>

                      {/* Date of Birth Picker */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Date de naissance *" : "Date of Birth *"}
                        </label>
                        <DropdownCalendarPicker
                          value={birthDate}
                          onChange={setBirthDate}
                          language={language}
                        />
                      </div>

                      {/* Time of Birth */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Heure de naissance" : "Time of Birth"}
                        </label>
                        <input
                          type="time"
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Lieu de naissance (Ville / Territoire) *" : "Place of Birth (City / Territory) *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa - Limete"
                          value={birthCity}
                          onChange={(e) => setBirthCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Formation Médicale / Maternité *" : "Medical Facility / Maternity Clinic *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Maternité Saint-Joseph de Limete"
                          value={birthHospital}
                          onChange={(e) => setBirthHospital(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.2 Parental Lineage */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Filiation Parentale & Identité des Parents" : "Parental Lineage & Parents' Identity"}
                      </h2>
                    </div>

                    {/* Father Details */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {isFr ? "Nom du Père" : "Father Name"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nom complet du Père *" : "Father's Full Name *"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: ILUNGA KABANGA Jean-Paul"
                            value={fatherFullName}
                            onChange={(e) => setFatherFullName(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nationalité du Père *" : "Father's Nationality *"}
                          </label>
                          <input
                            type="text"
                            value={fatherNationality}
                            onChange={(e) => setFatherNationality(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "N° CNI / NIN / Carte d'électeur du Père" : "Father's ID / NIN / Voter Card No."}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: NIN-CD-1988-049281"
                            value={fatherIdNumber}
                            onChange={(e) => setFatherIdNumber(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Profession du Père" : "Father's Profession"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Ingénieur Informaticien"
                            value={fatherOccupation}
                            onChange={(e) => setFatherOccupation(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mother Details */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {isFr ? "Nom de la Mère" : "Mother Name"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nom complet de la Mère *" : "Mother's Full Name *"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: KASONGO WA BEYA Thérèse"
                            value={motherFullName}
                            onChange={(e) => setMotherFullName(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nationalité de la Mère *" : "Mother's Nationality *"}
                          </label>
                          <input
                            type="text"
                            value={motherNationality}
                            onChange={(e) => setMotherNationality(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "N° CNI / NIN / Carte d'électeur de la Mère" : "Mother's ID / NIN / Voter Card No."}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: NIN-CD-1992-073145"
                            value={motherIdNumber}
                            onChange={(e) => setMotherIdNumber(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Profession de la Mère" : "Mother's Profession"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Médecin Généraliste"
                            value={motherOccupation}
                            onChange={(e) => setMotherOccupation(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1.3 Declarant & Civil Registry Office */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <HeartHandshake className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Déclarant & Centre d'État Civil de Rattachement" : "Declarant & Civil Registry Office"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Qualité du Déclarant *" : "Declarant Relationship *"}
                        </label>
                        <select
                          value={declarantRole}
                          onChange={(e) => setDeclarantRole(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium cursor-pointer"
                        >
                          <option value="Père">{isFr ? "Père de l'enfant" : "Father of child"}</option>
                          <option value="Mère">{isFr ? "Mère de l'enfant" : "Mother of child"}</option>
                          <option value="Médecin / Sage-femme">{isFr ? "Médecin / Sage-femme" : "Doctor / Midwife"}</option>
                          <option value="Tuteur légal">{isFr ? "Tuteur légal" : "Legal Guardian"}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Province d'enregistrement *" : "Registration Province *"}
                        </label>
                        <select
                          value={originProvince}
                          onChange={(e) => setOriginProvince(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium cursor-pointer"
                        >
                          {DRC_PROVINCES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Ville / Commune d'enregistrement *" : "City / Municipality *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa - Gombe"
                          value={originCity}
                          onChange={(e) => setOriginCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Bureau de l'État Civil de transcription *" : "Civil Registry Transcription Bureau *"}
                      </label>
                      <select
                        value={civilRegistryOffice}
                        onChange={(e) => setCivilRegistryOffice(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium cursor-pointer"
                      >
                        {CIVIL_REGISTRY_OFFICES.map((o) => (
                          <option key={o.id} value={isFr ? o.labelFr : o.labelEn}>
                            {isFr ? o.labelFr : o.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Téléphone de contact *" : "Contact Phone *"}
                        </label>
                        <input
                          type="text"
                          placeholder="+243 81 000 0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Adresse courriel (Email) *" : "Email Address *"}
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

                  {/* Step 1 Actions: Simple Text on Button */}
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
              {/* STEP 2: SUPPORTING LEGAL DOCUMENTS (4 REQUIRED ROWS, NO BABY PHOTO) */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5 text-slate-900 pb-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                      {isFr ? "Soumission des Pièces Justificatives" : "Supporting Documents Submission"}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-0.5">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      {isFr
                        ? "Formats acceptés : PDF, JPG, PNG - Max 10 Mo par document."
                        : "Accepted formats: PDF, JPG, PNG - Max 10MB per document."}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Row 1: Hospital Delivery Declaration */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          1
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Avis de Naissance / Déclaration de la Maternité" : "Hospital Birth / Delivery Notice"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {maternityNoticeDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{maternityNoticeDoc}</span>
                            <button
                              type="button"
                              onClick={() => setMaternityNoticeDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setMaternityNoticeDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Father's ID Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Carte d'Identité / NIN du Père" : "Father's National ID / NIN"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {fatherIdDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{fatherIdDoc}</span>
                            <button
                              type="button"
                              onClick={() => setFatherIdDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setFatherIdDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Mother's ID Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Carte d'Identité / NIN de la Mère" : "Mother's National ID / NIN"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {motherIdDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{motherIdDoc}</span>
                            <button
                              type="button"
                              onClick={() => setMotherIdDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setMotherIdDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Residence Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Certificat de Résidence & Domicile" : "Residence Certificate"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {residenceDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{residenceDoc}</span>
                            <button
                              type="button"
                              onClick={() => setResidenceDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setResidenceDoc)}
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
              {/* STEP 3: REVIEW & SUBMIT (CLEAN FORM STYLE MATCHING NATIONAL ID) */}
              {/* ============================================================== */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {isFr ? "Vérification Complète du Dossier" : "Complete Application Review"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isFr
                        ? "Vérifiez attentivement les informations ci-dessous avant la soumission définitive."
                        : "Carefully verify the information below before final submission."}
                    </p>
                  </div>

                  {/* 1. Child Civil Identity Row */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Identité de l'Enfant" : "Child Identity"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Nom de l'Enfant" : "Child's Full Name"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {surname} {postName} {firstName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Sexe & Date de Naissance" : "Gender & Birth Date"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {gender === "M" ? (isFr ? "Masculin" : "Male") : (isFr ? "Féminin" : "Female")} • {birthDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Heure & Lieu de Naissance" : "Birth Time & Place"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {(birthTime || "07:45")} • {birthCity}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Maternité / Formation Médicale" : "Maternity Clinic / Facility"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {birthHospital || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Parents' Lineage (Symmetrical & Clean Grid) */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Filiation Parentale" : "Parental Lineage"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Father Column */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                          {isFr ? "Nom du Père" : "Father Name"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Nom Complet" : "Full Name"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {fatherFullName || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Nationalité" : "Nationality"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {fatherNationality || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "N° CNI / NIN" : "National ID / NIN"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                              {fatherIdNumber || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Profession" : "Profession"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {fatherOccupation || "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mother Column */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                          {isFr ? "Nom de la Mère" : "Mother Name"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Nom Complet" : "Full Name"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {motherFullName || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Nationalité" : "Nationality"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {motherNationality || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "N° CNI / NIN" : "National ID / NIN"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                              {motherIdNumber || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              {isFr ? "Profession" : "Profession"}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 block mt-1">
                              {motherOccupation || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Declarant & Registry Office */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Déclarant & Centre d'État Civil" : "Declarant & Civil Registry"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Qualité du Déclarant" : "Declarant Relationship"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {declarantRole}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Contact Déclarant" : "Declarant Contact"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {phone}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {email}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Centre d'État Civil" : "Civil Registry Office"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {civilRegistryOffice}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {originCity}, {originProvince}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Verified Attached Documents */}
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
                            {maternityNoticeDoc || "avis_naissance_maternite.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Avis de Naissance (Maternité)" : "Hospital Birth Notice"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            2
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {fatherIdDoc || "cni_pere.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Carte d'Identité / NIN du Père" : "Father's National ID / NIN"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {motherIdDoc || "cni_mere.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Carte d'Identité / NIN de la Mère" : "Mother's National ID / NIN"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            4
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {residenceDoc || "certificat_residence.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Certificat de Résidence & Domicile" : "Residence Certificate"}
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
                        ? "Je certifie sur l'honneur l'exactitude de toutes les déclarations ci-dessus concernant la naissance de l'enfant, la filiation des parents et les pièces justificatives. Je confirme la soumission officielle de la déclaration."
                        : "I solemnly declare on my honour that all statements above concerning the child's birth, parents' lineage, and attached documents are true and exact. I confirm the official submission."}
                    </span>
                  </label>

                  {/* Step 3 Bottom Actions */}
                  <div className="pt-4 flex items-center justify-between">
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
              <div className="flex justify-center no-print">
                <AnimatedCheckmark size={64} />
              </div>

              <div className="space-y-1 no-print">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Demande d'Acte de Naissance Enregistrée avec Succès !"
                    : "Birth Certificate Application Successfully Registered!"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  {isFr
                    ? "Votre déclaration a été transmise au registre national d'état civil. Conservez précieusement votre récépissé officiel."
                    : "Your declaration has been transmitted to the national civil status registry. Please keep your official receipt."}
                </p>
              </div>

              {/* Reference Tracking Badge */}
              <div className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-sm transition-colors no-print">
                <span className="font-mono text-base sm:text-lg font-bold tracking-wider">
                  {submittedApp.trackingId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submittedApp.trackingId)}
                  className="text-blue-100 hover:text-white transition-colors cursor-pointer p-1"
                  title={isFr ? "Copier le code" : "Copy code"}
                >
                  {hasCopied ? (
                    <Check className="w-4 h-4 text-white" />
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
                      {isFr ? "Acte de Naissance Sécurisé" : "Birth Certificate Registration"}
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
                    <span className="text-slate-500">{isFr ? "Nom de l'enfant :" : "Child Full Name:"}</span>
                    <span className="font-bold text-slate-900 text-right">{submittedApp.applicantName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Sexe & Naissance :" : "Gender & Birth Date:"}</span>
                    <span className="font-medium text-slate-900 text-right">
                      {gender === "M" ? (isFr ? "Masculin" : "Male") : (isFr ? "Féminin" : "Female")} • {birthDate} ({birthTime})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Lieu & Formation Médicale :" : "Place & Facility:"}</span>
                    <span className="font-medium text-slate-900 text-right">
                      {birthCity} — {birthHospital}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Père :" : "Father:"}</span>
                    <span className="font-medium text-slate-900 text-right">{fatherFullName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Mère :" : "Mother:"}</span>
                    <span className="font-medium text-slate-900 text-right">{motherFullName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Déclarant :" : "Declarant:"}</span>
                    <span className="font-medium text-slate-900 text-right">
                      {declarantRole} ({phone})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Centre d'État Civil :" : "Civil Registry:"}</span>
                    <span className="font-medium text-slate-900 text-right">{civilRegistryOffice}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{isFr ? "Frais Réglementés :" : "Regulated Fee:"}</span>
                    <span className="font-medium text-slate-900 text-right">10 000 CDF</span>
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

export default function BirthCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BirthCertificateContent />
    </Suspense>
  );
}
