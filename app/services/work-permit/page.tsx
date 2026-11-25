"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Language, CitizenApplication } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import { readSupportingFile, UploadedFilePayload } from "@/lib/file-upload";
import {
  Briefcase,
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
  Building2,
  AlertCircle,
  RotateCcw,
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

const DRC_PROVINCES = [
  "Kinshasa",
  "Haut-Katanga",
  "Lualaba",
  "Kongo Central",
  "Nord-Kivu",
  "Sud-Kivu",
  "Ituri",
  "Tshopo",
  "Kasaï-Oriental",
  "Kasaï-Central",
  "Kasaï",
  "Kwango",
  "Kwilu",
  "Mai-Ndombe",
  "Lomami",
  "Sankuru",
  "Haut-Lomami",
  "Tanganyika",
  "Maniema",
  "Haut-Uele",
  "Bas-Uele",
  "Équateur",
  "Mongala",
  "Nord-Ubangi",
  "Sud-Ubangi",
  "Tshuapa",
];

const COMMISSION_OFFICES = [
  "Kinshasa - Commission Nationale de l'Emploi des Étrangers (Siège Central Gombe)",
  "Kinshasa - Direction Provinciale de l'ONEM (Limete)",
  "Lubumbashi - Antenne Provinciale Emploi & ONEM (Haut-Katanga)",
  "Kolwezi - Commission Provinciale de l'Emploi (Lualaba)",
  "Goma - Direction Provinciale du Travail & ONEM (Nord-Kivu)",
  "Bukavu - Direction Provinciale du Travail & ONEM (Sud-Kivu)",
  "Kisangani - Antenne Provinciale de l'ONEM (Tshopo)",
  "Matadi - Direction Provinciale du Travail (Kongo Central)",
  "Mbuji-Mayi - Antenne Provinciale du Travail (Kasaï-Oriental)",
  "Kananga - Direction Provinciale de l'Emploi (Kasaï-Central)",
];

const APPLICATION_TYPES = [
  {
    id: "new",
    labelFr: "Nouvelle Demande (Première Carte de Travail)",
    labelEn: "New Work Permit Application (First Card)",
  },
  {
    id: "renewal",
    labelFr: "Renouvellement de Carte de Travail",
    labelEn: "Work Permit Renewal",
  },
  {
    id: "employer_change",
    labelFr: "Changement d'Employeur ou de Fonction",
    labelEn: "Change of Employer or Job Position",
  },
  {
    id: "duplicate",
    labelFr: "Duplicata (Perte / Vol / Détérioration)",
    labelEn: "Duplicate (Lost / Stolen / Damaged)",
  },
] as const;

const PERMIT_CATEGORIES = [
  {
    id: "A",
    labelFr: "Catégorie A — Cadre Supérieur, Dirigeant ou Mandataire Social",
    labelEn: "Category A — Senior Executive, Director or Corporate Officer",
  },
  {
    id: "B",
    labelFr: "Catégorie B — Personnel Qualifié, Ingénieur ou Expert Technique",
    labelEn: "Category B — Skilled Specialist, Engineer or Technical Expert",
  },
  {
    id: "C",
    labelFr: "Catégorie C — Spécialiste Temporaire / Mission Courte (<= 6 mois)",
    labelEn: "Category C — Short-Term Specialist / Mission (<= 6 months)",
  },
  {
    id: "D",
    labelFr: "Catégorie D — Travailleur Indépendant ou Investisseur Agréé",
    labelEn: "Category D — Independent Contractor or Approved Investor",
  },
];

const PERMIT_DURATIONS = [
  { id: "6m", labelFr: "6 mois (Mission temporaire)", labelEn: "6 months (Temporary)" },
  { id: "1y", labelFr: "1 an (Validité ordinaire)", labelEn: "1 year (Standard)" },
  { id: "2y", labelFr: "2 ans (Durée maximale légale)", labelEn: "2 years (Maximum legal)" },
];

const BUSINESS_SECTORS = [
  {
    id: "mining",
    labelFr: "Mines, Géologie & Hydrocarbures",
    labelEn: "Mining, Geology & Hydrocarbons",
  },
  {
    id: "construction",
    labelFr: "BTP, Génie Civil & Infrastructures",
    labelEn: "Construction, Civil Engineering & Infrastructure",
  },
  {
    id: "finance",
    labelFr: "Banques, Assurances & Audit Financier",
    labelEn: "Banking, Insurance & Financial Audit",
  },
  {
    id: "telecom",
    labelFr: "Télécommunications, Numérique & Ingénierie IT",
    labelEn: "Telecommunications, Digital & IT Engineering",
  },
  {
    id: "industry",
    labelFr: "Industrie, Agro-industrie & Commerce",
    labelEn: "Manufacturing, Agribusiness & Commerce",
  },
  {
    id: "ngo",
    labelFr: "Santé, Enseignement & ONG Internationales",
    labelEn: "Healthcare, Education & International NGOs",
  },
];

const CONTRACT_TYPES = [
  {
    id: "cdi",
    labelFr: "Contrat à Durée Indéterminée (CDI) visé ONEM",
    labelEn: "Permanent Employment Contract (CDI) — ONEM Endorsed",
  },
  {
    id: "cdd",
    labelFr: "Contrat à Durée Déterminée (CDD) visé ONEM",
    labelEn: "Fixed-Term Employment Contract (CDD) — ONEM Endorsed",
  },
  {
    id: "secondment",
    labelFr: "Détachement / Convention d'Expatriation",
    labelEn: "Corporate Secondment / Expatriation Agreement",
  },
  {
    id: "consulting",
    labelFr: "Mandat Technique / Contrat de Prestation Spécialisée",
    labelEn: "Technical Mandate / Specialized Service Contract",
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
  defaultYear?: number;
  placeholder?: string;
}

function DatePickerField({
  value,
  onChange,
  language,
  minYear = 1945,
  maxYear = new Date().getFullYear(),
  defaultYear = 1990,
  placeholder = "AAAA-MM-JJ",
}: DatePickerProps) {
  const isFr = language === "fr";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date(defaultYear, 0, 1);
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? defaultYear : initialDate.getFullYear()
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
                title={isFr ? "Mois précédent" : "Previous month"}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                title={isFr ? "Mois suivant" : "Next month"}
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

function getBilingualLabel(
  list: ReadonlyArray<{ id: string; labelFr: string; labelEn: string }>,
  id: string,
  isFr: boolean
): string {
  const found = list.find((item) => item.id === id);
  if (!found) return id;
  return isFr ? found.labelFr : found.labelEn;
}

function WorkPermitContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // STEP PROGRESS STATE (1: Identity & Employment, 2: Documents, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1.1: PERMIT TYPE & CATEGORY (SIMPLE DROPDOWNS)
  const [applicationType, setApplicationType] = useState<
    "new" | "renewal" | "employer_change" | "duplicate"
  >("new");
  const [permitCategory, setPermitCategory] = useState("B");
  const [requestedDuration, setRequestedDuration] = useState("2y");
  const [workProvince, setWorkProvince] = useState("Haut-Katanga");
  const [previousPermitNumber, setPreviousPermitNumber] = useState("");
  const [previousExpiryDate, setPreviousExpiryDate] = useState("");

  // STEP 1.2: FOREIGN WORKER IDENTITY & IMMIGRATION DETAILS
  const [surname, setSurname] = useState("");
  const [postName, setPostName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [visaNumber, setVisaNumber] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");
  const [drcAddress, setDrcAddress] = useState("");

  // STEP 1.3: EMPLOYER & EMPLOYMENT CONTRACT DETAILS
  const [employerName, setEmployerName] = useState("");
  const [employerRccm, setEmployerRccm] = useState("");
  const [businessSector, setBusinessSector] = useState("mining");
  const [jobTitle, setJobTitle] = useState("");
  const [contractType, setContractType] = useState("cdd");
  const [onemRef, setOnemRef] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [employerContact, setEmployerContact] = useState("");
  const [employerAddress, setEmployerAddress] = useState("");
  const [commissionOffice, setCommissionOffice] = useState(
    COMMISSION_OFFICES[2]
  );

  // STEP 2: SUPPORTING LEGAL DOCUMENTS (4 MANDATORY ROWS)
  const [contractDoc, setContractDoc] = useState<string | null>(null);
  const [passportVisaDoc, setPassportVisaDoc] = useState<string | null>(null);
  const [cvDiplomasDoc, setCvDiplomasDoc] = useState<string | null>(null);
  const [medicalDoc, setMedicalDoc] = useState<string | null>(null);
  const [uploadedFilePayloads, setUploadedFilePayloads] = useState<
    Record<string, UploadedFilePayload>
  >({});

  // STEP 3 & SUBMITTED RECEIPT STATE
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(
    null
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDemoFill = () => {
    setPermitCategory("B");
    setRequestedDuration("2y");
    setWorkProvince("Haut-Katanga");
    if (applicationType !== "new") {
      setPreviousPermitNumber("CT-CD-2024-009412");
      setPreviousExpiryDate("2026-04-30");
    }

    setSurname("MOREAU");
    setPostName("");
    setFirstName("Alexandre Laurent");
    setGender("M");
    setBirthDate("1987-05-19");
    setBirthPlace("Lyon, France");
    setNationality("Française");
    setPassportNumber("21FR948210");
    setPassportExpiry("2031-08-14");
    setVisaNumber("DGM-VISA-ETAB-2026-4812");
    setPhone("+243 81 904 3311");
    setEmail("a.moreau@katanga-engineering.cd");
    setDrcAddress(
      "45 Avenue Kasavubu, Quartier Golf Malela, Commune de Lubumbashi, Haut-Katanga"
    );

    setEmployerName("KATANGA MINING & INFRASTRUCTURE SARL");
    setEmployerRccm("CD/LSHI/RCCM/19-B-00492");
    setBusinessSector("mining");
    setJobTitle("Ingénieur Chef de Projet Métallurgie");
    setContractType("cdd");
    setOnemRef("ONEM-LSHI-VISA-2026-1194");
    setContractStartDate("2026-05-01");
    setEmployerContact("rh@katanga-engineering.cd / +243 99 710 2200");
    setEmployerAddress(
      "Zone Industrielle de Ruashi, Boulevard M'Siri N° 108, Lubumbashi, Haut-Katanga"
    );
    setCommissionOffice(COMMISSION_OFFICES[2]);

    setContractDoc("contrat_travail_vise_onem_moreau.pdf");
    setPassportVisaDoc("passeport_visa_etablissement_moreau.pdf");
    setCvDiplomasDoc("cv_diplome_ingenieur_legalise.pdf");
    setMedicalDoc("certificat_aptitude_medicale_travail.pdf");

    setDeclarationAgreed(true);
    setValidationError(null);
  };

  const handleSingleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (name: string | null) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setter(file.name);
      const payload = await readSupportingFile(file);
      setUploadedFilePayloads((prev) => ({ ...prev, [file.name]: payload }));
    }
  };

  const validateStep1 = () => {
    if (
      !surname.trim() ||
      !firstName.trim() ||
      !birthDate ||
      !birthPlace.trim() ||
      !nationality.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner l'identité et la nationalité complètes du travailleur étranger."
          : "Please fill in the foreign worker's complete identity and nationality."
      );
      return false;
    }

    if (
      applicationType !== "new" &&
      !previousPermitNumber.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez indiquer le numéro de votre carte de travail précédente."
          : "Please specify your previous work permit card number."
      );
      return false;
    }

    if (
      !passportNumber.trim() ||
      !passportExpiry ||
      !visaNumber.trim() ||
      !drcAddress.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez indiquer le numéro et la validité du passeport, le numéro de visa de séjour et l'adresse de résidence en RDC."
          : "Please enter valid passport details, DRC residence visa number, and current residence address in the DRC."
      );
      return false;
    }

    if (!phone || phone.trim() === "+243" || !email || !email.includes("@")) {
      setValidationError(
        isFr
          ? "Un numéro de téléphone et une adresse email valides sont requis pour le suivi officiel."
          : "A valid contact phone number and email address are required for official tracking."
      );
      return false;
    }

    if (
      !employerName.trim() ||
      !employerRccm.trim() ||
      !jobTitle.trim() ||
      !contractStartDate ||
      !employerContact.trim() ||
      !employerAddress.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez compléter toutes les informations obligatoires de l'employeur, du poste et du contrat de travail."
          : "Please complete all mandatory employer, job position, and employment contract fields."
      );
      return false;
    }

    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!contractDoc) {
      setValidationError(
        isFr
          ? "Le contrat de travail dûment visé par l'ONEM est obligatoire."
          : "Employment contract endorsed by ONEM is mandatory."
      );
      return false;
    }
    if (!passportVisaDoc) {
      setValidationError(
        isFr
          ? "La copie du passeport en cours de validité avec visa de séjour est obligatoire."
          : "Copy of valid passport with active DRC residence visa is mandatory."
      );
      return false;
    }
    if (!cvDiplomasDoc) {
      setValidationError(
        isFr
          ? "Le Curriculum Vitae et les diplômes ou qualifications légalisés sont obligatoires."
          : "Curriculum Vitae and authenticated diplomas are mandatory."
      );
      return false;
    }
    if (!medicalDoc) {
      setValidationError(
        isFr
          ? "L'attestation médicale d'aptitude physique est obligatoire."
          : "Medical fitness certificate is mandatory."
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
          ? "Veuillez cocher la déclaration sur l'honneur confirmant l'exactitude des données soumises."
          : "Please check the legal declaration certifying the accuracy of the submitted details."
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-EMP-${randomSuffix}`;
    const fullApplicantName = [surname.trim(), postName.trim(), firstName.trim()]
      .filter(Boolean)
      .join(" ");

    const supportingDocsPayload = [
      {
        ...(contractDoc ? uploadedFilePayloads[contractDoc] : {}),
        id: "onem_contract",
        name: "Contrat de travail visé par l'ONEM",
        fileName: contractDoc || "contrat_travail_onem.pdf",
      },
      {
        ...(passportVisaDoc ? uploadedFilePayloads[passportVisaDoc] : {}),
        id: "passport_visa",
        name: "Passeport valide & Visa de séjour",
        fileName: passportVisaDoc || "passeport_visa_sejour.pdf",
      },
      {
        ...(cvDiplomasDoc ? uploadedFilePayloads[cvDiplomasDoc] : {}),
        id: "cv_diplomas",
        name: "Curriculum Vitae & Diplômes légalisés",
        fileName: cvDiplomasDoc || "cv_diplomes_legalises.pdf",
      },
      {
        ...(medicalDoc ? uploadedFilePayloads[medicalDoc] : {}),
        id: "medical_fitness",
        name: "Attestation médicale d'aptitude",
        fileName: medicalDoc || "attestation_medicale_aptitude.pdf",
      },
    ];

    const durationLabelFr = getBilingualLabel(
      PERMIT_DURATIONS,
      requestedDuration,
      true
    );
    const sectorLabelFr = getBilingualLabel(
      BUSINESS_SECTORS,
      businessSector,
      true
    );
    const contractLabelFr = getBilingualLabel(
      CONTRACT_TYPES,
      contractType,
      true
    );

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: "permis-travail-etranger",
      serviceTitle: isFr
        ? "Permis de Travail pour Étrangers (Carte de Travail)"
        : "Work Permit for Foreign Nationals",
      applicantName: fullApplicantName,
      email: email.trim(),
      phone: phone.trim(),
      city: workProvince,
      submittedAt: new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "submitted",
      statusNotesFr:
        "Demande de carte de travail enregistrée. Instruction par la Commission Nationale de l'Emploi des Étrangers et l'ONEM en cours (délai légal : 10 jours ouvrables).",
      statusNotesEn:
        "Foreign national work permit dossier recorded. Review by National Commission for Foreign Employment and ONEM underway (turnaround: 10 business days).",
      collectionPoint: commissionOffice,
    };

    try {
      await fetch("/api/applications/work-permit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "permis-travail-etranger",
          serviceTitle: isFr
            ? "Permis de Travail pour Étrangers (Carte de Travail)"
            : "Work Permit for Foreign Nationals",
          applicationType,
          permitCategory,
          requestedDuration: durationLabelFr,
          workProvince,
          previousPermitNumber,
          previousExpiryDate,
          applicantSurname: surname,
          applicantPostName: postName,
          applicantFirstName: firstName,
          gender,
          birthDate,
          birthPlace,
          nationality,
          passportNumber,
          passportExpiry,
          visaNumber,
          phone,
          email,
          drcAddress,
          employerName,
          employerRccm,
          businessSector: sectorLabelFr,
          jobTitle,
          contractType: contractLabelFr,
          onemRef,
          contractStartDate,
          employerContact,
          employerAddress,
          commissionOffice,
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
                  Permis de{" "}
                  <span className="text-blue-600">Travail</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Work Permit</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Effectuez votre demande officielle en ligne pour l'obtention, le renouvellement ou le transfert de la Carte de Travail pour Étrangers auprès du Ministère de l'Emploi et de l'ONEM en RDC."
                : "Official online application for the issuance, renewal, or employer transfer of the Foreign National Work Permit with the Ministry of Employment and ONEM in the DRC."}
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
                  title={
                    isFr ? "Remplir avec des données de test" : "Fill with test data"
                  }
                >
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  <span>{isFr ? "Remplissage Démo" : "Demo Fill"}</span>
                </button>
              </div>

              {/* Header Title (Centered, Clean) */}
              <div className="text-center space-y-1 pb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Formulaire de Demande de Permis de Travail (Carte de Travail)"
                    : "Foreign National Work Permit Application Form"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Commission Nationale de l'Emploi des Étrangers • Ministère de l'Emploi, Travail et Prévoyance Sociale"
                    : "National Commission for Foreign Employment • Ministry of Employment, Labor and Social Security"}
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
                        {isFr ? "Identité & Emploi" : "Identity & Employment"}
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
              {/* STEP 1: PERMIT TYPE, WORKER IDENTITY & EMPLOYER DETAILS        */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Permit Type & Category (Clean Dropdowns) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Type de Démarche & Catégorie de Carte de Travail"
                          : "Application Type & Work Permit Category"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Type de démarche *" : "Application Type *"}
                        </label>
                        <select
                          value={applicationType}
                          onChange={(e) =>
                            setApplicationType(
                              e.target.value as
                                | "new"
                                | "renewal"
                                | "employer_change"
                                | "duplicate"
                            )
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {APPLICATION_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {isFr ? type.labelFr : type.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Catégorie de carte sollicitée *"
                            : "Requested Permit Category *"}
                        </label>
                        <select
                          value={permitCategory}
                          onChange={(e) => setPermitCategory(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {PERMIT_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {isFr ? cat.labelFr : cat.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Durée de validité sollicitée *"
                            : "Requested Permit Duration *"}
                        </label>
                        <select
                          value={requestedDuration}
                          onChange={(e) => setRequestedDuration(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {PERMIT_DURATIONS.map((dur) => (
                            <option key={dur.id} value={dur.id}>
                              {isFr ? dur.labelFr : dur.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Province d'affectation professionnelle *"
                            : "Work Assignment Province *"}
                        </label>
                        <select
                          value={workProvince}
                          onChange={(e) => setWorkProvince(e.target.value)}
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

                    {/* Conditional Previous Permit Details (Shown when not "new") */}
                    {applicationType !== "new" && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4 mt-2">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm uppercase tracking-wider">
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                          <span>
                            {applicationType === "renewal"
                              ? isFr
                                ? "Données de la Carte de Travail à Renouveler"
                                : "Previous Work Permit Renewal Information"
                              : applicationType === "employer_change"
                              ? isFr
                                ? "Référence de la Carte de Travail Actuelle"
                                : "Current Work Permit Reference"
                              : isFr
                              ? "Informations sur la Carte Perdue / Volée"
                              : "Lost / Stolen Work Card Details"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {isFr
                                ? "N° de l'Ancienne Carte de Travail *"
                                : "Previous Work Permit Number *"}
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: CT-CD-2024-009412"
                              value={previousPermitNumber}
                              onChange={(e) =>
                                setPreviousPermitNumber(e.target.value)
                              }
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {isFr
                                ? "Date d'expiration précédente"
                                : "Previous Expiration Date"}
                            </label>
                            <DatePickerField
                              value={previousExpiryDate}
                              onChange={setPreviousExpiryDate}
                              language={language}
                              minYear={2015}
                              maxYear={2035}
                              defaultYear={2026}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1.2 Foreign Worker Identity & Immigration Status */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Identité & Statut Migratoire du Travailleur Étranger"
                          : "Foreign Worker Identity & Immigration Details"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille *" : "Surname *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MOREAU"
                          value={surname}
                          onChange={(e) =>
                            setSurname(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Post-nom (Optionnel)"
                            : "Middle Name (Optional)"}
                        </label>
                        <input
                          type="text"
                          placeholder={isFr ? "Si applicable" : "If applicable"}
                          value={postName}
                          onChange={(e) =>
                            setPostName(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Prénom(s) *" : "Given Name(s) *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Alexandre Laurent"
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
                              name="workerGender"
                              checked={gender === "M"}
                              onChange={() => setGender("M")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Masculin (M)" : "Male (M)"}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="workerGender"
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
                          minYear={1945}
                          maxYear={new Date().getFullYear() - 16}
                          defaultYear={1988}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Lieu & Pays de naissance *"
                            : "Place & Country of Birth *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Lyon, France"
                          value={birthPlace}
                          onChange={(e) => setBirthPlace(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Nationalité actuelle *"
                            : "Current Nationality *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Française"
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "N° de Passeport *" : "Passport Number *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 21FR948210"
                          value={passportNumber}
                          onChange={(e) =>
                            setPassportNumber(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900 uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Expiration du passeport *"
                            : "Passport Expiry Date *"}
                        </label>
                        <DatePickerField
                          value={passportExpiry}
                          onChange={setPassportExpiry}
                          language={language}
                          minYear={new Date().getFullYear()}
                          maxYear={new Date().getFullYear() + 15}
                          defaultYear={new Date().getFullYear() + 4}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "N° Visa de Séjour / Établissement (DGM) *"
                            : "DRC Residence Visa Number (DGM) *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: DGM-VISA-ETAB-2026-4812"
                          value={visaNumber}
                          onChange={(e) =>
                            setVisaNumber(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900 uppercase"
                        />
                      </div>

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
                          {isFr ? "Email du demandeur *" : "Applicant Email *"}
                        </label>
                        <input
                          type="email"
                          placeholder="nom@entreprise.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Wide Full-Width Residence Address in DRC */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Adresse de résidence actuelle en RDC *"
                          : "Current Residential Address in DRC *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 45 Avenue Kasavubu, Quartier Golf Malela, Commune de Lubumbashi, Haut-Katanga"
                            : "Ex: 45 Kasavubu Avenue, Golf Malela Quarter, Lubumbashi Municipality, Haut-Katanga"
                        }
                        value={drcAddress}
                        onChange={(e) => setDrcAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* 1.3 Employer, Employment Contract & Commission Desk */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Employeur, Contrat de Travail & Guichet ONEM"
                          : "Employer, Employment Contract & ONEM Desk"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Raison sociale de l'entreprise / Employeur *"
                            : "Employer / Company Legal Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KATANGA MINING & INFRASTRUCTURE SARL"
                          value={employerName}
                          onChange={(e) => setEmployerName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "N° RCCM ou Identification Nationale *"
                            : "Company RCCM / National ID Number *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: CD/LSHI/RCCM/19-B-00492"
                          value={employerRccm}
                          onChange={(e) =>
                            setEmployerRccm(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900 uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Secteur d'activité *" : "Business Sector *"}
                        </label>
                        <select
                          value={businessSector}
                          onChange={(e) => setBusinessSector(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {BUSINESS_SECTORS.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {isFr ? sec.labelFr : sec.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Intitulé du poste / Fonction *"
                            : "Job Title / Position *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Ingénieur Chef de Projet"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Type de contrat *" : "Contract Type *"}
                        </label>
                        <select
                          value={contractType}
                          onChange={(e) => setContractType(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {CONTRACT_TYPES.map((ct) => (
                            <option key={ct.id} value={ct.id}>
                              {isFr ? ct.labelFr : ct.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "N° Visa ONEM du contrat (si déjà émis)"
                            : "ONEM Contract Endorsement No."}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: ONEM-LSHI-VISA-2026-1194"
                          value={onemRef}
                          onChange={(e) =>
                            setOnemRef(e.target.value.toUpperCase())
                          }
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900 uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Date de prise de fonction *"
                            : "Contract Start Date *"}
                        </label>
                        <DatePickerField
                          value={contractStartDate}
                          onChange={setContractStartDate}
                          language={language}
                          minYear={2020}
                          maxYear={new Date().getFullYear() + 3}
                          defaultYear={new Date().getFullYear()}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Contact RH de l'employeur *"
                            : "Employer HR Contact *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: rh@entreprise.cd / +243 99..."
                          value={employerContact}
                          onChange={(e) => setEmployerContact(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Wide Full-Width Employer Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Adresse physique complète du siège / lieu d'affectation *"
                          : "Full Physical Address of Employer / Worksite *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: Zone Industrielle de Ruashi, Boulevard M'Siri N° 108, Lubumbashi, Haut-Katanga"
                            : "Ex: Ruashi Industrial Zone, 108 M'Siri Boulevard, Lubumbashi, Haut-Katanga"
                        }
                        value={employerAddress}
                        onChange={(e) => setEmployerAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Direction / Guichet de la Commission Nationale & ONEM compétent *"
                          : "Competent National Commission / ONEM Office *"}
                      </label>
                      <select
                        value={commissionOffice}
                        onChange={(e) => setCommissionOffice(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                      >
                        {COMMISSION_OFFICES.map((office) => (
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
              {/* STEP 2: SUPPORTING LEGAL DOCUMENTS (4 MANDATORY ROWS)          */}
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
                    {/* Row 1: Employment Contract Endorsed by ONEM */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          1
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Contrat de travail visé par l'ONEM"
                            : "Employment Contract Endorsed by ONEM"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {contractDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {contractDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setContractDoc(null)}
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
                              handleSingleFileUpload(e, setContractDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Valid Passport with Residence Visa */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Copie du Passeport en cours de validité avec Visa de séjour"
                            : "Valid Passport Copy with Active Residence Visa"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {passportVisaDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {passportVisaDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPassportVisaDoc(null)}
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
                              handleSingleFileUpload(e, setPassportVisaDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Curriculum Vitae & Authenticated Diplomas */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Curriculum Vitae et Diplômes légalisés"
                            : "Curriculum Vitae and Authenticated Diplomas"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {cvDiplomasDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {cvDiplomasDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCvDiplomasDoc(null)}
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
                              handleSingleFileUpload(e, setCvDiplomasDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Medical Certificate of Fitness */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Attestation Médicale d'Aptitude Physique"
                            : "Medical Certificate of Fitness for Work"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {medicalDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {medicalDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setMedicalDoc(null)}
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
                              handleSingleFileUpload(e, setMedicalDoc)
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
                      <span>
                        {isFr ? "Étape précédente" : "Previous Step"}
                      </span>
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
                        ? "Vérifiez attentivement les informations ci-dessous avant la soumission à la Commission Nationale de l'Emploi des Étrangers."
                        : "Carefully verify all details below before submitting to the National Commission for Foreign Employment."}
                    </p>
                  </div>

                  {/* 1. Application Scope & Category Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Objet de la Demande" : "Application Scope"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Type de Démarche" : "Application Type"}
                        </span>
                        <span className="text-sm font-bold text-blue-600 block mt-1">
                          {getBilingualLabel(
                            APPLICATION_TYPES,
                            applicationType,
                            isFr
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Catégorie Sollicitée" : "Permit Category"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {getBilingualLabel(
                            PERMIT_CATEGORIES,
                            permitCategory,
                            isFr
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Durée Sollicitée" : "Duration"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {getBilingualLabel(
                            PERMIT_DURATIONS,
                            requestedDuration,
                            isFr
                          )}{" "}
                          • {workProvince}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Guichet ONEM Compétent" : "ONEM / Ministry Desk"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {commissionOffice}
                        </span>
                      </div>

                      {applicationType !== "new" && previousPermitNumber && (
                        <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-slate-100 flex flex-wrap gap-6 text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">
                              {isFr
                                ? "Ancien N° Carte de Travail : "
                                : "Previous Permit No: "}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {previousPermitNumber}
                            </span>
                          </div>
                          {previousExpiryDate && (
                            <div>
                              <span className="text-slate-500 font-medium">
                                {isFr ? "Expiration précédente : " : "Previous Expiry: "}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {previousExpiryDate}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Foreign Worker Identity Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr
                          ? "Identité & Statut Migratoire du Travailleur"
                          : "Foreign Worker Identity & Immigration"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Nom Complet" : "Full Name"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {[surname, postName, firstName]
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Sexe & Nationalité" : "Gender & Nationality"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {gender === "M"
                            ? isFr
                              ? "Masculin"
                              : "Male"
                            : isFr
                            ? "Féminin"
                            : "Female"}{" "}
                          • {nationality}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Date & Lieu de Naissance"
                            : "Birth Date & Place"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {birthDate} • {birthPlace}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Passeport & Expiration"
                            : "Passport & Expiry"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {passportNumber} ({passportExpiry})
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "N° Visa Séjour (DGM)" : "Residence Visa (DGM)"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {visaNumber}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Contact (SMS & Email)" : "Contact Info"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {phone}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {email}
                        </span>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Adresse de Résidence en RDC"
                            : "Residential Address in DRC"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {drcAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Employer & Contract Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr
                          ? "Employeur & Contrat de Travail"
                          : "Employer & Contract Details"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Employeur / Entreprise" : "Employer Name"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {employerName}
                        </span>
                        <span className="text-xs font-mono text-slate-500 block mt-0.5">
                          {employerRccm}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Secteur & Poste" : "Sector & Job Title"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {jobTitle}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {getBilingualLabel(
                            BUSINESS_SECTORS,
                            businessSector,
                            isFr
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Contrat & Début" : "Contract & Start Date"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {getBilingualLabel(CONTRACT_TYPES, contractType, isFr)}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {isFr ? "Début :" : "Start:"} {contractStartDate}{" "}
                          {onemRef ? `• ONEM: ${onemRef}` : ""}
                        </span>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Lieu d'Affectation & Contact RH"
                            : "Worksite Address & HR Contact"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {employerAddress}
                        </span>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          RH: {employerContact}
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
                            {contractDoc || "contrat_travail_onem.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Contrat visé ONEM" : "ONEM Contract"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            2
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {passportVisaDoc || "passeport_visa.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Passeport & Visa" : "Passport & Visa"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {cvDiplomasDoc || "cv_diplomes.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "CV & Diplômes légalisés" : "CV & Diplomas"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            4
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {medicalDoc || "attestation_medicale.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Aptitude Médicale" : "Medical Certificate"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Declaration on Honour */}
                  <label className="flex items-start gap-3 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAgreed}
                      onChange={(e) => setDeclarationAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-400 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      {isFr
                        ? "Je certifie sur l'honneur l'exactitude des renseignements fournis concernant l'identité, le statut migratoire et le contrat de travail conformément au Code du Travail de la République Démocratique du Congo."
                        : "I solemnly certify on honour the accuracy of all details provided regarding identity, immigration status, and employment contract under the Labor Code of the Democratic Republic of the Congo."}
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
                              ? "Soumettre la Demande"
                              : "Submit Application"}
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
                    ? "Demande de Permis de Travail Enregistrée"
                    : "Work Permit Application Submitted"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isFr
                    ? "Votre dossier a été transmis à la Commission Nationale de l'Emploi des Étrangers et à l'ONEM pour instruction légale."
                    : "Your dossier has been routed to the National Commission for Foreign Employment and ONEM for official processing."}
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
                        ? "Permis de Travail pour Étrangers"
                        : "Foreign National Work Permit"}
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
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Bénéficiaire :" : "Worker:"}
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {submittedApp.applicantName} ({nationality})
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Catégorie & Durée :" : "Category & Term:"}
                    </span>
                    <span className="font-extrabold text-blue-600 text-right">
                      {isFr ? `Catégorie ${permitCategory}` : `Category ${permitCategory}`} •{" "}
                      {getBilingualLabel(
                        PERMIT_DURATIONS,
                        requestedDuration,
                        isFr
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Employeur & Poste :" : "Employer & Role:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {employerName} — {jobTitle}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Passeport & Visa :" : "Passport & Visa:"}
                    </span>
                    <span className="font-mono font-medium text-slate-900 text-right">
                      {passportNumber} • {visaNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Guichet Compétent :" : "Commission Desk:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {commissionOffice}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Délai Légal :" : "Processing SLA:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {isFr ? "10 jours ouvrables" : "10 business days"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Tarif Officiel :" : "Official Fee:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {isFr
                        ? "Selon catégorie (Tarif commission nationale)"
                        : "According to category (National commission tariff)"}
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
                  <span>
                    {isFr ? "Imprimer le Récépissé" : "Print Receipt"}
                  </span>
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
                    {isFr ? "Nouvelle Demande" : "New Application"}
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

export default function WorkPermitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkPermitContent />
    </Suspense>
  );
}
