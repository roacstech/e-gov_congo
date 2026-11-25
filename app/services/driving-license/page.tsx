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
  Car,
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
  MapPin,
  AlertCircle,
  RotateCcw,
  FileText,
  Upload,
  Building2,
  Sparkles,
  ShieldCheck,
  Loader2,
  RefreshCw,
  BadgeAlert,
  Droplet,
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

const DELIVERY_CENTRES = [
  "Kinshasa - Centre Principal CNPR (Gombe)",
  "Kinshasa - Centre Provincial de Limete",
  "Kinshasa - Centre Spécialisé de Ngaliema",
  "Kinshasa - Antenne Municipale de Masina",
  "Lubumbashi - Centre Biométrique Provincial du Haut-Katanga",
  "Kolwezi - Centre des Transports du Lualaba",
  "Goma - Direction Provinciale de la CNPR (Nord-Kivu)",
  "Bukavu - Centre Provincial des Transports (Sud-Kivu)",
  "Kisangani - Centre Territorial de la Tshopo",
  "Matadi - Centre Urbain des Transports (Kongo Central)",
  "Mbuji-Mayi - Antenne Provinciale du Kasaï-Oriental",
  "Kananga - Direction Provinciale du Kasaï-Central",
];

const LICENSE_CATEGORIES = [
  {
    id: "A",
    titleFr: "Catégorie A",
    titleEn: "Category A",
    descFr: "Motocyclettes, tricycles et quadricycles à moteur",
    descEn: "Motorcycles, tricycles, and motor quadricycles",
  },
  {
    id: "B",
    titleFr: "Catégorie B",
    titleEn: "Category B",
    descFr: "Véhicules légers, berlines et utilitaires jusqu'à 3,5 tonnes",
    descEn: "Light vehicles, passenger cars, and utility vehicles up to 3.5t",
  },
  {
    id: "C",
    titleFr: "Catégorie C",
    titleEn: "Category C",
    descFr: "Poids lourds de transport de marchandises excédant 3,5 tonnes",
    descEn: "Heavy commercial vehicles and trucks exceeding 3.5 tonnes",
  },
  {
    id: "D",
    titleFr: "Catégorie D",
    titleEn: "Category D",
    descFr: "Transport en commun de personnes (minibus, bus et autocars)",
    descEn: "Public passenger transport (minibuses, transit buses, coaches)",
  },
  {
    id: "E",
    titleFr: "Catégorie E",
    titleEn: "Category E",
    descFr: "Ensembles de véhicules articulés et remorques lourdes",
    descEn: "Articulated commercial vehicle combinations and heavy trailers",
  },
];

const BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

const RENEWAL_REASONS = [
  {
    id: "expiry",
    labelFr: "Expiration de la durée de validité légale",
    labelEn: "Expiration of legal validity period",
  },
  {
    id: "loss",
    labelFr: "Perte ou Vol (Déclaration de perte)",
    labelEn: "Lost or Stolen license (Loss report)",
  },
  {
    id: "damage",
    labelFr: "Détérioration ou carte endommagée",
    labelEn: "Damaged or unreadable smart card",
  },
  {
    id: "upgrade",
    labelFr: "Extension ou adjonction de catégorie",
    labelEn: "License category upgrade / extension",
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
  minYear = 1940,
  maxYear = new Date().getFullYear(),
  placeholder = "AAAA-MM-JJ",
}: DatePickerProps) {
  const isFr = language === "fr";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date(1995, 0, 1);
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? 1995 : initialDate.getFullYear()
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

function DrivingLicenseContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // STEP PROGRESS STATE (1: Identity & Category, 2: Documents, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // APPLICATION TYPE: "new" vs "renewal" vs "duplicate"
  const [applicationType, setApplicationType] = useState<
    "new" | "renewal" | "duplicate"
  >("new");

  // LICENSE CATEGORY (A, B, C, D, E)
  const [licenseCategory, setLicenseCategory] = useState("B");

  // RENEWAL / DUPLICATE SPECIFIC FIELDS
  const [previousLicenseNumber, setPreviousLicenseNumber] = useState("");
  const [previousIssueDate, setPreviousIssueDate] = useState("");
  const [renewalReason, setRenewalReason] = useState(
    "Expiration de la durée de validité légale"
  );

  // STEP 1: APPLICANT PERSONAL IDENTITY
  const [surname, setSurname] = useState("");
  const [postName, setPostName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [nationality, setNationality] = useState("Congolaise");
  const [idNumber, setIdNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [profession, setProfession] = useState("");

  // STEP 1: RESIDENCE & BIOMETRIC APPOINTMENT
  const [residenceAddress, setResidenceAddress] = useState("");
  const [residenceCity, setResidenceCity] = useState("Kinshasa");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");
  const [deliveryCenter, setDeliveryCenter] = useState(DELIVERY_CENTRES[0]);

  // STEP 2: SUPPORTING LEGAL DOCUMENTS (4 ROWS)
  const [medicalFitnessDoc, setMedicalFitnessDoc] = useState<string | null>(
    null
  );
  const [identityDoc, setIdentityDoc] = useState<string | null>(null);
  const [drivingCertDoc, setDrivingCertDoc] = useState<string | null>(null);
  const [residenceDoc, setResidenceDoc] = useState<string | null>(null);

  // STEP 3 & SUBMITTED RECEIPT STATE
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(
    null
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDemoFill = () => {
    setSurname("KALONJI");
    setPostName("MUTOMBO");
    setFirstName("Patrick");
    setGender("M");
    setBirthDate("1992-07-25");
    setBirthPlace("Kinshasa - Gombe");
    setNationality("Congolaise");
    setIdNumber("NIN-CD-1992-048192");
    setBloodGroup("O+");
    setProfession("Logisticiens des Transports");
    setResidenceAddress(
      "14 Avenue Colonel Lukusa, Quartier Socimat, Commune de la Gombe, Kinshasa"
    );
    setResidenceCity("Kinshasa");
    setPhone("+243 81 777 6543");
    setEmail("patrick.kalonji@egov.cd");
    setDeliveryCenter(DELIVERY_CENTRES[0]);
    setLicenseCategory("B");

    if (applicationType !== "new") {
      setPreviousLicenseNumber("PC-CD-2021-084920");
      setPreviousIssueDate("2021-03-15");
      setRenewalReason("Expiration de la durée de validité légale");
      setDrivingCertDoc("copie_ancien_permis_kalonji.pdf");
    } else {
      setDrivingCertDoc("attestation_reussite_cnpr_autoecole.pdf");
    }

    setMedicalFitnessDoc("certificat_aptitude_medicale_vision.pdf");
    setIdentityDoc("cni_kalonji_mutombo_patrick.pdf");
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
    if (
      !surname.trim() ||
      !postName.trim() ||
      !firstName.trim() ||
      !birthDate ||
      !birthPlace.trim() ||
      !residenceAddress.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner toutes les informations obligatoires du demandeur, y compris l'adresse complète."
          : "Please fill in all mandatory applicant details, including residential address."
      );
      return false;
    }

    if (applicationType !== "new" && !previousLicenseNumber.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner le numéro de votre ancien permis pour le renouvellement."
          : "Please specify your previous driver's license number for renewal."
      );
      return false;
    }

    if (!phone || phone.trim() === "+243") {
      setValidationError(
        isFr
          ? "Le numéro de téléphone est obligatoire pour les convocations et alertes SMS."
          : "Contact phone number is mandatory for appointment notifications."
      );
      return false;
    }

    if (!email || !email.includes("@")) {
      setValidationError(
        isFr
          ? "Une adresse email valide est requise pour le suivi officiel."
          : "A valid email address is required for official tracking."
      );
      return false;
    }

    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!medicalFitnessDoc) {
      setValidationError(
        isFr
          ? "Le certificat médical d'aptitude physique et visuelle est obligatoire."
          : "Medical fitness certificate is mandatory."
      );
      return false;
    }
    if (!identityDoc) {
      setValidationError(
        isFr
          ? "La pièce d'identité officielle (CNI / NIN ou Passeport) est obligatoire."
          : "National identity document is mandatory."
      );
      return false;
    }
    if (!drivingCertDoc) {
      setValidationError(
        applicationType === "new"
          ? isFr
            ? "L'attestation d'auto-école ou certificat de réussite CNPR est obligatoire."
            : "Driving school training certificate is mandatory."
          : isFr
          ? "La copie de l'ancien permis ou la déclaration de perte est obligatoire."
          : "Copy of previous license or loss declaration is mandatory."
      );
      return false;
    }
    if (!residenceDoc) {
      setValidationError(
        isFr
          ? "Le certificat de résidence et domicile est obligatoire."
          : "Certificate of residence is mandatory."
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
          ? "Veuillez certifier sur l'honneur l'exactitude des informations fournies pour cette demande."
          : "Please check the legal declaration to certify the accuracy of your statements."
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-DRV-${randomSuffix}`;
    const fullApplicantName = `${surname.trim()} ${postName.trim()} ${firstName.trim()}`;

    const supportingDocsPayload = [
      {
        id: "medical_fitness",
        name: "Certificat d'Aptitude Médicale",
        fileName: medicalFitnessDoc || "certificat_medical.pdf",
      },
      {
        id: "national_id",
        name: "Pièce d'Identité / CNI / NIN",
        fileName: identityDoc || "cni_demandeur.pdf",
      },
      {
        id: "driving_competence",
        name:
          applicationType === "new"
            ? "Certificat de Réussite CNPR"
            : "Ancien Permis / Déclaration",
        fileName: drivingCertDoc || "certificat_competence.pdf",
      },
      {
        id: "residence_cert",
        name: "Certificat de Résidence",
        fileName: residenceDoc || "certificat_residence.pdf",
      },
    ];

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: "permis-conduire",
      serviceTitle: isFr
        ? applicationType === "renewal"
          ? "Renouvellement de Permis de Conduire"
          : "Permis de Conduire Sécurisé"
        : applicationType === "renewal"
        ? "Driver's License Renewal"
        : "Smart Driver's License",
      applicantName: fullApplicantName,
      email: email.trim(),
      phone: phone.trim(),
      city: residenceCity,
      submittedAt: new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "submitted",
      statusNotesFr:
        "Dossier de permis de conduire enregistré. Contrôle médical et vérification des aptitudes en cours.",
      statusNotesEn:
        "Driver license dossier recorded. Medical check and qualifications verification in progress.",
      collectionPoint: deliveryCenter,
    };

    try {
      await fetch("/api/applications/driving-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "permis-conduire",
          serviceTitle: isFr
            ? "Permis de Conduire Sécurisé"
            : "Smart Driver's License",
          applicationType,
          licenseCategory,
          previousLicenseNumber,
          previousIssueDate,
          renewalReason,
          applicantSurname: surname,
          applicantPostName: postName,
          applicantFirstName: firstName,
          gender,
          birthDate,
          birthPlace,
          nationality,
          idNumber,
          bloodGroup,
          profession,
          residenceAddress,
          residenceCity,
          phone,
          email,
          deliveryCenter,
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
                  Permis de Conduire{" "}
                  <span className="text-blue-600">Sécurisé</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Driver's License</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Effectuez votre demande officielle en ligne pour l'obtention, le renouvellement ou le duplicata du permis de conduire biométrique sécurisé au format carte à puce en RDC."
                : "Official online application for the issuance, renewal, or replacement of the secure smart biometric driver's license in the DRC."}
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
                    ? "Formulaire de Demande de Permis de Conduire"
                    : "Driver's License Application Form"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Commission Nationale de Prévention Routière • Ministère des Transports"
                    : "National Road Safety Commission • Ministry of Transport"}
                </p>
              </div>

              {/* 3-Step Connected Progress Stepper (Mathematically centered, no lines poking out) */}
              <div className="w-full max-w-xl mx-auto pt-1 pb-6">
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
                        {isFr ? "Identité & Catégorie" : "Identity & Category"}
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
              {/* STEP 1: IDENTITY & LICENSE CATEGORY                            */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Application Type & License Category */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Car className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Type de Démarche & Catégorie de Permis"
                          : "Application Type & License Category"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Application Type Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Type de démarche *" : "Application Type *"}
                        </label>
                        <select
                          value={applicationType}
                          onChange={(e) =>
                            setApplicationType(
                              e.target.value as "new" | "renewal" | "duplicate"
                            )
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          <option value="new">
                            {isFr
                              ? "Nouvelle Demande (Premier Permis)"
                              : "New License Application"}
                          </option>
                          <option value="renewal">
                            {isFr
                              ? "Renouvellement (Permis Expiré)"
                              : "License Renewal"}
                          </option>
                          <option value="duplicate">
                            {isFr
                              ? "Duplicata (Perte / Vol / Détérioration)"
                              : "Duplicate (Lost / Stolen / Damaged)"}
                          </option>
                        </select>
                      </div>

                      {/* License Category Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Catégorie de permis sollicitée *"
                            : "Requested License Category *"}
                        </label>
                        <select
                          value={licenseCategory}
                          onChange={(e) => setLicenseCategory(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {LICENSE_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {isFr
                                ? `${cat.titleFr} — ${cat.descFr}`
                                : `${cat.titleEn} — ${cat.descEn}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Renewal Details Card (Only shown when renewal/duplicate selected) */}
                    {applicationType !== "new" && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4 mt-2">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm uppercase tracking-wider">
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                          <span>
                            {applicationType === "renewal"
                              ? isFr
                                ? "Données de l'Ancien Permis à Renouveler"
                                : "Previous License Renewal Information"
                              : isFr
                              ? "Informations du Permis Perdu / Volé"
                              : "Lost / Stolen License Information"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {isFr
                                ? "Ancien N° de Permis de Conduire *"
                                : "Previous License Number *"}
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: PC-CD-2021-084920"
                              value={previousLicenseNumber}
                              onChange={(e) =>
                                setPreviousLicenseNumber(e.target.value)
                              }
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {isFr
                                ? "Date de délivrance précédente"
                                : "Previous Issuance Date"}
                            </label>
                            <DatePickerField
                              value={previousIssueDate}
                              onChange={setPreviousIssueDate}
                              language={language}
                              minYear={2000}
                              maxYear={new Date().getFullYear()}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {isFr ? "Motif de la demande *" : "Renewal Reason *"}
                            </label>
                            <select
                              value={renewalReason}
                              onChange={(e) => setRenewalReason(e.target.value)}
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                            >
                              {RENEWAL_REASONS.map((reason) => (
                                <option key={reason.id} value={reason.labelFr}>
                                  {isFr ? reason.labelFr : reason.labelEn}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1.2 Applicant Civil Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Identité Civile du Conducteur"
                          : "Driver Civil Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille *" : "Surname *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KALONJI"
                          value={surname}
                          onChange={(e) =>
                            setSurname(e.target.value.toUpperCase())
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
                          placeholder="Ex: MUTOMBO"
                          value={postName}
                          onChange={(e) =>
                            setPostName(e.target.value.toUpperCase())
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
                          placeholder="Ex: Patrick"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 capitalize"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Sexe *" : "Gender *"}
                        </label>
                        <div className="flex items-center gap-4 pt-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="driverGender"
                              checked={gender === "M"}
                              onChange={() => setGender("M")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Masculin (M)" : "Male (M)"}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="driverGender"
                              checked={gender === "F"}
                              onChange={() => setGender("F")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Féminin (F)" : "Female (F)"}</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Date de naissance *" : "Date of Birth *"}
                        </label>
                        <DatePickerField
                          value={birthDate}
                          onChange={setBirthDate}
                          language={language}
                          minYear={1940}
                          maxYear={new Date().getFullYear() - 18}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Lieu de naissance *" : "Place of Birth *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa - Gombe"
                          value={birthPlace}
                          onChange={(e) => setBirthPlace(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nationalité" : "Nationality"}
                        </label>
                        <input
                          type="text"
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "N° CNI / NIN / Passeport" : "National ID / NIN / Passport"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NIN-CD-1992-048192"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-red-500" />
                          <span>{isFr ? "Groupe Sanguin *" : "Blood Group *"}</span>
                        </label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-slate-900 cursor-pointer"
                        >
                          {BLOOD_GROUPS.map((grp) => (
                            <option key={grp} value={grp}>
                              {grp}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Profession / Métier" : "Profession / Occupation"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Chauffeur Professionnel / Cadre"
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Province de résidence *" : "Province of Residence *"}
                        </label>
                        <select
                          value={residenceCity}
                          onChange={(e) => setResidenceCity(e.target.value)}
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

                    {/* Wide Full-Width Address Field for Residence */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Adresse physique de résidence complète *"
                          : "Full Physical Residential Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 14 Avenue Colonel Lukusa, Quartier Socimat, Commune de la Gombe, Kinshasa"
                            : "Ex: 14 Colonel Lukusa Avenue, Socimat Quarter, Gombe Municipality, Kinshasa"
                        }
                        value={residenceAddress}
                        onChange={(e) => setResidenceAddress(e.target.value)}
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Adresse Email officielle *"
                            : "Official Email Address *"}
                        </label>
                        <input
                          type="email"
                          placeholder="citoyen@egov.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Centre d'enrôlement biométrique & de retrait *"
                          : "Biometric Enrollment & Pickup Center *"}
                      </label>
                      <select
                        value={deliveryCenter}
                        onChange={(e) => setDeliveryCenter(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                      >
                        {DELIVERY_CENTRES.map((center) => (
                          <option key={center} value={center}>
                            {center}
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
                    {/* Row 1: Medical Fitness Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          1
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Certificat Médical d'Aptitude Physique & Visuelle"
                            : "Medical & Visual Fitness Certificate"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {medicalFitnessDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {medicalFitnessDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMedicalFitnessDoc(null)}
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
                            onChange={(e) =>
                              handleSingleFileUpload(e, setMedicalFitnessDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Official National Identity Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Pièce d'Identité Officielle (CNI / NIN ou Passeport)"
                            : "National Identity Document (NIN or Passport)"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {identityDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {identityDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIdentityDoc(null)}
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
                            onChange={(e) =>
                              handleSingleFileUpload(e, setIdentityDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Driving School Cert OR Previous License (Adapts to New vs Renewal) */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {applicationType === "new"
                            ? isFr
                              ? "Attestation Auto-École ou Certificat de Réussite CNPR"
                              : "Driving School Certificate / CNPR Test"
                            : isFr
                            ? "Copie de l'Ancien Permis ou Déclaration de Perte"
                            : "Copy of Previous License / Loss Report"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {drivingCertDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {drivingCertDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setDrivingCertDoc(null)}
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
                            onChange={(e) =>
                              handleSingleFileUpload(e, setDrivingCertDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Certificate of Residence */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Certificat de Résidence & Domicile Récent"
                            : "Recent Certificate of Residence"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {residenceDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {residenceDoc}
                            </span>
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
                            onChange={(e) =>
                              handleSingleFileUpload(e, setResidenceDoc)
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
                        ? "Vérification Complète du Dossier"
                        : "Complete Application Review"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isFr
                        ? "Vérifiez attentivement les informations ci-dessous avant la soumission définitive au centre d'enrôlement."
                        : "Carefully verify the information below before final submission."}
                    </p>
                  </div>

                  {/* 1. Category & Type Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Objet de la Demande" : "Application Details"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Type de Démarche" : "Application Type"}
                        </span>
                        <span className="text-sm font-bold text-blue-600 block mt-1">
                          {applicationType === "new"
                            ? isFr
                              ? "Nouvelle Demande"
                              : "New License"
                            : applicationType === "renewal"
                            ? isFr
                              ? "Renouvellement"
                              : "Renewal"
                            : isFr
                            ? "Duplicata pour Perte / Vol"
                            : "Duplicate / Lost"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Catégorie Sollicitée" : "Requested Category"}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 block mt-1">
                          Catégorie {licenseCategory}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Centre d'Enrôlement" : "Biometrics Center"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {deliveryCenter}
                        </span>
                      </div>

                      {applicationType !== "new" && (
                        <div className="sm:col-span-3 pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">
                              {isFr ? "Ancien N° Permis : " : "Previous No: "}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {previousLicenseNumber || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">
                              {isFr ? "Motif : " : "Reason: "}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {renewalReason}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Driver Identity Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Identité du Conducteur" : "Driver Identity"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Nom Complet" : "Full Name"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {surname} {postName} {firstName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Date & Lieu de Naissance" : "Birth Date & Place"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {birthDate} • {birthPlace}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Groupe Sanguin" : "Blood Group"}
                        </span>
                        <span className="text-sm font-extrabold text-red-600 block mt-1">
                          {bloodGroup}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "N° CNI / NIN" : "National ID / NIN"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {idNumber || "—"}
                        </span>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Adresse de Résidence" : "Residential Address"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {residenceAddress}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Contact Téléphone" : "Phone"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {phone}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Email Officiel" : "Email"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Verified Attached Documents */}
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
                            {medicalFitnessDoc || "certificat_medical.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Certificat Médical d'Aptitude" : "Medical Certificate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            2
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {identityDoc || "piece_identite.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Pièce d'Identité / CNI" : "National ID"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {drivingCertDoc || "certificat_conduite.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {applicationType === "new"
                            ? isFr
                              ? "Attestation Auto-École / CNPR"
                              : "Driving School Test"
                            : isFr
                            ? "Ancien Permis / Déclaration"
                            : "Previous License / Loss"}
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
                          {isFr ? "Certificat de Résidence" : "Residence Certificate"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Declaration on Honour */}
                  <label className="flex items-start gap-3 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAgreed}
                      onChange={(e) => setDeclarationAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-400 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      {isFr
                        ? "Je certifie sur l'honneur l'exactitude des déclarations fournies ci-dessus conformément à la réglementation routière en vigueur en République Démocratique du Congo."
                        : "I solemnly certify on honour the accuracy of the statements provided above in accordance with traffic regulations in the Democratic Republic of the Congo."}
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
            /* OFFICIAL SUBMISSION RECEIPT                                    */
            /* ============================================================== */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-center">
              {/* ANIMATED TICK CHECKMARK */}
              <div className="flex justify-center pt-2">
                <AnimatedCheckmark size={64} />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Demande de Permis de Conduire Enregistrée"
                    : "Driver's License Application Successfully Submitted"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isFr
                    ? "Votre dossier officiel a été transmis à la commission des transports. Veuillez vous présenter au centre choisi muni de votre récépissé."
                    : "Your official dossier has been routed to the transport department. Present yourself at the chosen center with your receipt."}
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
                      {isFr ? "Permis de Conduire Sécurisé" : "Smart Driver's License"}
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
                    <span className="text-slate-500">{isFr ? "Titulaire :" : "Driver:"}</span>
                    <span className="font-bold text-slate-900 text-right">
                      {submittedApp.applicantName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Catégorie Sollicitée :" : "Category:"}</span>
                    <span className="font-extrabold text-blue-600 text-right">
                      Catégorie {licenseCategory} ({applicationType === "renewal" ? (isFr ? "Renouvellement" : "Renewal") : applicationType === "duplicate" ? (isFr ? "Duplicata" : "Duplicate") : (isFr ? "Nouveau" : "New")})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Groupe Sanguin :" : "Blood Group:"}</span>
                    <span className="font-bold text-red-600 text-right">{bloodGroup}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Centre d'Enrôlement :" : "Center:"}</span>
                    <span className="font-medium text-slate-900 text-right">{deliveryCenter}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Contact (SMS & Email) :" : "Contact:"}</span>
                    <span className="font-medium text-slate-900 text-right">{phone}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{isFr ? "Frais Réglementés :" : "Regulated Fee:"}</span>
                    <span className="font-medium text-slate-900 text-right">45 000 CDF</span>
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
                  <span>{isFr ? "Nouvelle Demande" : "New Application"}</span>
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

export default function DrivingLicensePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DrivingLicenseContent />
    </Suspense>
  );
}
