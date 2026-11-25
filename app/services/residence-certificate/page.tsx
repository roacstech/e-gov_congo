"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Language, CitizenApplication } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import { readSupportingFile, UploadedFilePayload } from "@/lib/file-upload";
import {
  Home,
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
  Sparkles,
  ShieldCheck,
  Loader2,
  ClipboardList,
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

const MUNICIPAL_OFFICES = [
  "Kinshasa - Maison Communale de la Gombe (Bureau Central)",
  "Kinshasa - Maison Communale de Ngaliema",
  "Kinshasa - Maison Communale de Limete",
  "Kinshasa - Maison Communale de Lingwala",
  "Kinshasa - Maison Communale de Bandalungwa",
  "Kinshasa - Maison Communale de Kasa-Vubu",
  "Kinshasa - Maison Communale de Kalamu",
  "Kinshasa - Maison Communale de Lemba",
  "Kinshasa - Maison Communale de Matete",
  "Kinshasa - Maison Communale de Mont-Ngafula",
  "Kinshasa - Maison Communale de Masina",
  "Lubumbashi - Maison Communale de Lubumbashi",
  "Lubumbashi - Maison Communale de Kampemba",
  "Goma - Commune de Goma / Administration de Quartier",
  "Bukavu - Maison Communale d'Ibanda",
  "Kisangani - Maison Communale de Makiso",
  "Matadi - Mairie de Matadi / Administration Communale",
  "Kananga - Maison Communale de Kananga",
  "Mbuji-Mayi - Maison Communale de Diulu",
];

const APPLICATION_TYPES = [
  {
    id: "first",
    labelFr: "Première délivrance / Nouvel emménagement",
    labelEn: "First Issuance / New Residence",
  },
  {
    id: "renewal",
    labelFr: "Renouvellement (Certificat expiré > 3 mois)",
    labelEn: "Renewal (Expired > 3 months)",
  },
  {
    id: "change",
    labelFr: "Changement d'adresse / Mutation communale",
    labelEn: "Change of Address / Municipal Transfer",
  },
] as const;

const OFFICIAL_PURPOSES = [
  {
    id: "identity",
    labelFr: "Demande de Carte d'Identité (CNI) ou Passeport",
    labelEn: "National ID (CNI) or Passport Application",
  },
  {
    id: "banking",
    labelFr: "Dossier Bancaire / Ouverture de Compte",
    labelEn: "Banking Dossier / Account Opening",
  },
  {
    id: "employment",
    labelFr: "Dossier d'Emploi / Recrutement Administratif",
    labelEn: "Employment File / Civil Service Recruitment",
  },
  {
    id: "education",
    labelFr: "Inscription Scolaire, Universitaire ou Bourse",
    labelEn: "School, University Enrollment or Scholarship",
  },
  {
    id: "legal",
    labelFr: "Procédure Judiciaire, État Civil ou Demande de Visa",
    labelEn: "Judicial, Civil Status or Visa Procedure",
  },
  {
    id: "other",
    labelFr: "Autre Démarche Administrative Officielle",
    labelEn: "Other Official Administrative Procedure",
  },
];

const MARITAL_STATUSES = [
  { id: "single", labelFr: "Célibataire", labelEn: "Single" },
  { id: "married", labelFr: "Marié(e)", labelEn: "Married" },
  { id: "widowed", labelFr: "Veuf / Veuve", labelEn: "Widowed" },
  { id: "divorced", labelFr: "Divorcé(e)", labelEn: "Divorced" },
];

const RESIDENCE_DURATIONS = [
  { id: "lt6m", labelFr: "Moins de 6 mois", labelEn: "Less than 6 months" },
  { id: "6m1y", labelFr: "6 mois à 1 an", labelEn: "6 months to 1 year" },
  { id: "1to3y", labelFr: "1 à 3 ans", labelEn: "1 to 3 years" },
  { id: "3to5y", labelFr: "3 à 5 ans", labelEn: "3 to 5 years" },
  { id: "gt5y", labelFr: "Plus de 5 ans", labelEn: "More than 5 years" },
];

const OCCUPANCY_STATUSES = [
  {
    id: "tenant",
    labelFr: "Locataire avec contrat de bail",
    labelEn: "Tenant with Signed Lease",
  },
  {
    id: "owner",
    labelFr: "Propriétaire du bien / Titre foncier",
    labelEn: "Property Owner / Title Holder",
  },
  {
    id: "hosted",
    labelFr: "Hébergé(e) en famille ou chez un tiers",
    labelEn: "Hosted by Family or Third Party",
  },
  {
    id: "official",
    labelFr: "Logement de fonction / Société",
    labelEn: "Employer / Official Housing",
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
  minYear = 1930,
  maxYear = new Date().getFullYear(),
  placeholder = "AAAA-MM-JJ",
}: DatePickerProps) {
  const isFr = language === "fr";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date(1992, 0, 1);
  const [viewYear, setViewYear] = useState(
    isNaN(initialDate.getFullYear()) ? 1992 : initialDate.getFullYear()
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

function ResidenceCertificateContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // STEP PROGRESS STATE (1: Identity & Residence, 2: Documents, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1.1: APPLICATION TYPE & OFFICIAL PURPOSE (SIMPLE DROPDOWNS)
  const [applicationType, setApplicationType] = useState<
    "first" | "renewal" | "change"
  >("first");
  const [purpose, setPurpose] = useState("identity");
  const [previousCertNumber, setPreviousCertNumber] = useState("");
  const [previousAddress, setPreviousAddress] = useState("");

  // STEP 1.2: APPLICANT CIVIL IDENTITY
  const [surname, setSurname] = useState("");
  const [postName, setPostName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [nationality, setNationality] = useState("Congolaise");
  const [idNumber, setIdNumber] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("single");
  const [profession, setProfession] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");

  // STEP 1.3: CURRENT ADDRESS, OCCUPANCY & MUNICIPAL OFFICE
  const [province, setProvince] = useState("Kinshasa");
  const [city, setCity] = useState("");
  const [commune, setCommune] = useState("");
  const [quarter, setQuarter] = useState("");
  const [avenueParcel, setAvenueParcel] = useState("");
  const [residenceDuration, setResidenceDuration] = useState("1to3y");
  const [occupancyStatus, setOccupancyStatus] = useState("tenant");
  const [quarterChiefName, setQuarterChiefName] = useState("");
  const [landlordHostName, setLandlordHostName] = useState("");
  const [utilityMeterRef, setUtilityMeterRef] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [municipalOffice, setMunicipalOffice] = useState(MUNICIPAL_OFFICES[0]);

  // STEP 2: SUPPORTING LEGAL DOCUMENTS
  const [identityDoc, setIdentityDoc] = useState<string | null>(null);
  const [quarterChiefDoc, setQuarterChiefDoc] = useState<string | null>(null);
  const [addressProofDoc, setAddressProofDoc] = useState<string | null>(null);
  const [supplementaryDoc, setSupplementaryDoc] = useState<string | null>(null);
  const [uploadedFilePayloads, setUploadedFilePayloads] = useState<
    Record<string, UploadedFilePayload>
  >({});

  // STEP 3 & SUBMISSION RECEIPT STATE
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(
    null
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDemoFill = () => {
    setPurpose("identity");
    if (applicationType !== "first") {
      setPreviousCertNumber("RES-CD-2025-019482");
      setPreviousAddress(
        "08 Avenue Kasa-Vubu, Quartier Matonge II, Commune de Kalamu, Kinshasa"
      );
    }

    setSurname("TSHIBANGU");
    setPostName("MBUYI");
    setFirstName("Christian");
    setGender("M");
    setBirthDate("1991-09-14");
    setBirthPlace("Mbuji-Mayi");
    setNationality("Congolaise");
    setIdNumber("NIN-CD-1991-062348");
    setMaritalStatus("married");
    setProfession("Analyste Financier");
    setPhone("+243 81 555 2468");
    setEmail("christian.tshibangu@egov.cd");

    setProvince("Kinshasa");
    setCity("Kinshasa");
    setCommune("Gombe");
    setQuarter("Socimat");
    setAvenueParcel("22 Avenue des Cliniques, Parcelle N° 14B");
    setResidenceDuration("1to3y");
    setOccupancyStatus("tenant");
    setQuarterChiefName("M. MBIKAYI Alphonse (Chef de Quartier Socimat)");
    setLandlordHostName("Mme KASONGO Béatrice");
    setUtilityMeterRef("SNEL-KIN-0482910");
    setFullAddress(
      "22 Avenue des Cliniques, Parcelle N° 14B, Quartier Socimat, Commune de la Gombe, Kinshasa (Réf. Près de l'Hôpital Général)"
    );
    setMunicipalOffice(MUNICIPAL_OFFICES[0]);

    setIdentityDoc("cni_tshibangu_mbuyi_christian.pdf");
    setQuarterChiefDoc("attestation_chef_quartier_socimat.pdf");
    setAddressProofDoc("contrat_bail_facture_snel_gombe.pdf");
    setSupplementaryDoc("quittance_regideso_03_2026.pdf");

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
      !postName.trim() ||
      !firstName.trim() ||
      !birthDate ||
      !birthPlace.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner l'identité civile complète du demandeur (nom, post-nom, prénom, date et lieu de naissance)."
          : "Please complete all mandatory applicant civil identity fields (surname, post-name, first name, birth date and place)."
      );
      return false;
    }

    if (applicationType === "change" && !previousAddress.trim()) {
      setValidationError(
        isFr
          ? "Veuillez indiquer votre adresse précédente pour le traitement du changement d'adresse."
          : "Please enter your previous residential address for the address transfer."
      );
      return false;
    }

    if (
      !city.trim() ||
      !commune.trim() ||
      !quarter.trim() ||
      !avenueParcel.trim() ||
      !fullAddress.trim()
    ) {
      setValidationError(
        isFr
          ? "Veuillez renseigner l'adresse de domicile complète (ville, commune, quartier, avenue/parcelle et adresse physique)."
          : "Please fill in your complete residential address details (city, municipality, quarter, street/plot, and full physical address)."
      );
      return false;
    }

    if (!phone || phone.trim() === "+243") {
      setValidationError(
        isFr
          ? "Le numéro de téléphone de contact est obligatoire pour recevoir le récépissé."
          : "A contact phone number is mandatory to receive notifications."
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
    if (!identityDoc) {
      setValidationError(
        isFr
          ? "La copie de votre pièce d'identité officielle est obligatoire."
          : "Copy of your official identity document is mandatory."
      );
      return false;
    }
    if (!quarterChiefDoc) {
      setValidationError(
        isFr
          ? "L'attestation de confirmation du Chef de Quartier ou Chef d'Avenue est obligatoire."
          : "Neighborhood quarter/street chief confirmation attestation is mandatory."
      );
      return false;
    }
    if (!addressProofDoc) {
      setValidationError(
        isFr
          ? "Le justificatif de domicile (facture SNEL/REGIDESO, contrat de bail ou titre de propriété) est obligatoire."
          : "Proof of residence (utility bill, signed lease, or property title) is mandatory."
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
          ? "Veuillez certifier sur l'honneur l'exactitude de votre adresse de domicile et des informations fournies."
          : "Please check the declaration on honour to certify the accuracy of your residential address and statements."
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-RES-${randomSuffix}`;
    const fullApplicantName = `${surname.trim()} ${postName.trim()} ${firstName.trim()}`;

    const supportingDocsPayload = [
      {
        ...(identityDoc ? uploadedFilePayloads[identityDoc] : {}),
        id: "national_id",
        name: "Pièce d'Identité Officielle",
        fileName: identityDoc || "piece_identite.pdf",
      },
      {
        ...(quarterChiefDoc ? uploadedFilePayloads[quarterChiefDoc] : {}),
        id: "quarter_chief_attestation",
        name: "Attestation du Chef de Quartier",
        fileName: quarterChiefDoc || "attestation_chef_quartier.pdf",
      },
      {
        ...(addressProofDoc ? uploadedFilePayloads[addressProofDoc] : {}),
        id: "address_proof",
        name: "Justificatif de Domicile (SNEL/REGIDESO/Bail)",
        fileName: addressProofDoc || "justificatif_domicile.pdf",
      },
    ];

    if (supplementaryDoc) {
      supportingDocsPayload.push({
        ...(uploadedFilePayloads[supplementaryDoc] || {}),
        id: "supplementary_proof",
        name: "Document Complémentaire / Ancien Certificat",
        fileName: supplementaryDoc,
      });
    }

    const purposeLabelFr = getBilingualLabel(OFFICIAL_PURPOSES, purpose, true);
    const maritalLabelFr = getBilingualLabel(MARITAL_STATUSES, maritalStatus, true);
    const durationLabelFr = getBilingualLabel(RESIDENCE_DURATIONS, residenceDuration, true);
    const occupancyLabelFr = getBilingualLabel(OCCUPANCY_STATUSES, occupancyStatus, true);

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: "certificat-residence",
      serviceTitle: isFr
        ? "Certificat de Résidence & Domicile"
        : "Certificate of Residence & Domicile",
      applicantName: fullApplicantName,
      email: email.trim(),
      phone: phone.trim(),
      city: province,
      submittedAt: new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "submitted",
      statusNotesFr:
        "Demande de certificat de résidence enregistrée. Vérification du domicile communal en cours (délai : 24 heures).",
      statusNotesEn:
        "Residence certificate application recorded. Municipal address verification underway (turnaround: 24 hours).",
      collectionPoint: municipalOffice,
    };

    try {
      await fetch("/api/applications/residence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "certificat-residence",
          serviceTitle: isFr
            ? "Certificat de Résidence & Domicile"
            : "Certificate of Residence & Domicile",
          applicationType,
          purpose: purposeLabelFr,
          previousCertNumber,
          previousAddress,
          applicantSurname: surname,
          applicantPostName: postName,
          applicantFirstName: firstName,
          gender,
          birthDate,
          birthPlace,
          nationality,
          idNumber,
          maritalStatus: maritalLabelFr,
          profession,
          province,
          city,
          commune,
          quarter,
          avenueParcel,
          fullAddress,
          residenceDuration: durationLabelFr,
          occupancyStatus: occupancyLabelFr,
          quarterChiefName,
          landlordHostName,
          utilityMeterRef,
          phone,
          email,
          municipalOffice,
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
                  Certificat de{" "}
                  <span className="text-blue-600">Résidence</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Residence Certificate</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Effectuez votre demande officielle en ligne pour la délivrance, le renouvellement ou la mise à jour de l'attestation légale de résidence et domicile auprès de votre commune en RDC."
                : "Official online application for the issuance, renewal, or address update of your legal Certificate of Residence and Domicile with your municipal office in the DRC."}
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
                    ? "Formulaire de Demande de Certificat de Résidence"
                    : "Residence Certificate Application Form"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Administration Communale & Quartiers • Ministère de l'Intérieur et Sécurité"
                    : "Municipal Administration & District Offices • Ministry of Interior and Security"}
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
                        {isFr ? "Identité & Domicile" : "Identity & Residence"}
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
              {/* STEP 1: APPLICATION DETAILS, IDENTITY & RESIDENCE ADDRESS      */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Application Type & Official Purpose (Clean Dropdowns) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Type de Démarche & Motif Officiel"
                          : "Application Type & Official Purpose"}
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
                              e.target.value as "first" | "renewal" | "change"
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
                            ? "Motif officiel de la demande *"
                            : "Official Purpose *"}
                        </label>
                        <select
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {OFFICIAL_PURPOSES.map((p) => (
                            <option key={p.id} value={p.id}>
                              {isFr ? p.labelFr : p.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Conditional Previous Certificate / Previous Address Fields */}
                    {applicationType !== "first" && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-4 mt-2">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs sm:text-sm uppercase tracking-wider">
                          <Home className="w-4 h-4 text-blue-600" />
                          <span>
                            {applicationType === "renewal"
                              ? isFr
                                ? "Référence du Certificat à Renouveler"
                                : "Previous Certificate Reference"
                              : isFr
                              ? "Informations sur l'Ancien Domicile"
                              : "Previous Domicile Information"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {isFr
                                ? "N° de l'ancien certificat (si connu)"
                                : "Previous Certificate No. (if known)"}
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: RES-CD-2025-019482"
                              value={previousCertNumber}
                              onChange={(e) =>
                                setPreviousCertNumber(e.target.value)
                              }
                              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              {applicationType === "change"
                                ? isFr
                                  ? "Ancienne adresse de résidence complète *"
                                  : "Previous Full Residence Address *"
                                : isFr
                                ? "Ancienne adresse (si différente)"
                                : "Previous Address (if different)"}
                            </label>
                            <input
                              type="text"
                              placeholder={
                                isFr
                                  ? "Ex: 08 Avenue Kasa-Vubu, Quartier Matonge II, Commune de Kalamu, Kinshasa"
                                  : "Ex: 08 Kasa-Vubu Avenue, Matonge II Quarter, Kalamu Municipality, Kinshasa"
                              }
                              value={previousAddress}
                              onChange={(e) => setPreviousAddress(e.target.value)}
                              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                            />
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
                          ? "Identité Civile du Demandeur"
                          : "Applicant Civil Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille *" : "Surname *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: TSHIBANGU"
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
                          placeholder="Ex: MBUYI"
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
                          placeholder="Ex: Christian"
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
                              name="residenceGender"
                              checked={gender === "M"}
                              onChange={() => setGender("M")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Masculin (M)" : "Male (M)"}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="residenceGender"
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
                          minYear={1930}
                          maxYear={new Date().getFullYear()}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Lieu de naissance *" : "Place of Birth *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Mbuji-Mayi"
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
                          {isFr
                            ? "N° CNI / NIN / Passeport"
                            : "National ID / NIN / Passport"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: NIN-CD-1991-062348"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "État civil" : "Marital Status"}
                        </label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {MARITAL_STATUSES.map((m) => (
                            <option key={m.id} value={m.id}>
                              {isFr ? m.labelFr : m.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Profession / Activité"
                            : "Profession / Occupation"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Analyste Financier"
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
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
                          {isFr
                            ? "Adresse Email officielle *"
                            : "Official Email Address *"}
                        </label>
                        <input
                          type="email"
                          placeholder="nom@egov.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.3 Residence Address, Occupancy & Municipal Office */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr
                          ? "Adresse de Résidence & Administration Communale"
                          : "Residential Address & Municipal Office"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Province *" : "Province *"}
                        </label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {DRC_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Ville / Territoire *" : "City / Territory *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Commune *" : "Municipality / Commune *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Gombe"
                          value={commune}
                          onChange={(e) => setCommune(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Quartier *" : "Quarter / Neighborhood *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Socimat"
                          value={quarter}
                          onChange={(e) => setQuarter(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Avenue / Rue & N° Parcelle *"
                            : "Street / Avenue & Plot No. *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 22 Av. des Cliniques, N° 14B"
                          value={avenueParcel}
                          onChange={(e) => setAvenueParcel(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Durée de résidence à cette adresse *"
                            : "Duration at Current Address *"}
                        </label>
                        <select
                          value={residenceDuration}
                          onChange={(e) => setResidenceDuration(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {RESIDENCE_DURATIONS.map((dur) => (
                            <option key={dur.id} value={dur.id}>
                              {isFr ? dur.labelFr : dur.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Statut d'occupation du logement *"
                            : "Housing Occupancy Status *"}
                        </label>
                        <select
                          value={occupancyStatus}
                          onChange={(e) => setOccupancyStatus(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                        >
                          {OCCUPANCY_STATUSES.map((occ) => (
                            <option key={occ.id} value={occ.id}>
                              {isFr ? occ.labelFr : occ.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Nom du Chef de Quartier / Chef d'Avenue"
                            : "Quarter / Street Chief Name"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: M. MBIKAYI Alphonse"
                          value={quarterChiefName}
                          onChange={(e) => setQuarterChiefName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Wide Full-Width Address Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Adresse physique complète & Point de repère *"
                          : "Full Physical Residential Address & Landmark *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 22 Avenue des Cliniques, Parcelle N° 14B, Quartier Socimat, Commune de la Gombe, Kinshasa (Réf. Hôpital Général)"
                            : "Ex: 22 Cliniques Avenue, Plot No. 14B, Socimat Quarter, Gombe Municipality, Kinshasa (Near General Hospital)"
                        }
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Nom du Bailleur / Hébergeur (si applicable)"
                            : "Landlord / Host Name (if applicable)"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Mme KASONGO Béatrice"
                          value={landlordHostName}
                          onChange={(e) => setLandlordHostName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr
                            ? "Référence Compteur SNEL / REGIDESO (Optionnel)"
                            : "SNEL / REGIDESO Utility Ref. (Optional)"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: SNEL-KIN-0482910"
                          value={utilityMeterRef}
                          onChange={(e) => setUtilityMeterRef(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Maison Communale / Administration compétente *"
                          : "Competent Municipal Office / City Hall *"}
                      </label>
                      <select
                        value={municipalOffice}
                        onChange={(e) => setMunicipalOffice(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 cursor-pointer"
                      >
                        {MUNICIPAL_OFFICES.map((office) => (
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
              {/* STEP 2: SUPPORTING LEGAL DOCUMENTS                           */}
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
                    {/* Row 1: Official Identity Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          1
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Pièce d'Identité Officielle (CNI / NIN, Passeport ou Carte d'Électeur)"
                            : "Official Identity Document (NIN, Passport or Voter Card)"}{" "}
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
                              handleSingleFileUpload(e, setIdentityDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 2: Neighborhood Quarter Chief Attestation */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Attestation du Chef de Quartier ou Chef d'Avenue"
                            : "Neighborhood Quarter / Street Chief Attestation"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {quarterChiefDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {quarterChiefDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuarterChiefDoc(null)}
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
                              handleSingleFileUpload(e, setQuarterChiefDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Proof of Domicile (Utility Bill / Lease / Property Title) */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Justificatif de Domicile (Facture SNEL / REGIDESO, Bail ou Titre)"
                            : "Proof of Domicile (SNEL / REGIDESO Bill, Lease or Title)"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {addressProofDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {addressProofDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAddressProofDoc(null)}
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
                              handleSingleFileUpload(e, setAddressProofDoc)
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Optional Host Attestation / Previous Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-slate-200">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr
                            ? "Lettre d'Hébergement ou Ancien Certificat"
                            : "Host Letter or Previous Certificate"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            {isFr ? "(Optionnel)" : "(Optional)"}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {supplementaryDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">
                              {supplementaryDoc}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSupplementaryDoc(null)}
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
                              handleSingleFileUpload(e, setSupplementaryDoc)
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
                        ? "Vérifiez attentivement les informations ci-dessous avant la soumission définitive à l'administration communale."
                        : "Carefully verify the information below before final submission to the municipal office."}
                    </p>
                  </div>

                  {/* 1. Application Purpose Review */}
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
                          {getBilingualLabel(
                            APPLICATION_TYPES,
                            applicationType,
                            isFr
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Motif Officiel" : "Official Purpose"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {getBilingualLabel(OFFICIAL_PURPOSES, purpose, isFr)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Maison Communale" : "Municipal Office"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {municipalOffice}
                        </span>
                      </div>

                      {applicationType !== "first" &&
                        (previousCertNumber || previousAddress) && (
                          <div className="sm:col-span-3 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-500 font-medium">
                                {isFr
                                  ? "Ancien N° Certificat : "
                                  : "Previous Certificate No: "}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {previousCertNumber || "—"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">
                                {isFr
                                  ? "Ancienne Adresse : "
                                  : "Previous Address: "}
                              </span>
                              <span className="font-semibold text-slate-900">
                                {previousAddress || "—"}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* 2. Applicant Identity Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr ? "Identité du Demandeur" : "Applicant Identity"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
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
                          {isFr ? "N° CNI / NIN" : "National ID / NIN"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1 font-mono">
                          {idNumber || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "État Civil & Profession"
                            : "Marital Status & Profession"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {getBilingualLabel(
                            MARITAL_STATUSES,
                            maritalStatus,
                            isFr
                          )}{" "}
                          • {profession || "—"}
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
                    </div>
                  </div>

                  {/* 3. Residential Address & Occupancy Review */}
                  <div className="pb-6 border-b border-slate-200 space-y-4">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {isFr
                          ? "Domicile & Statut d'Occupation"
                          : "Residential Address & Occupancy"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Province / Ville / Commune"
                            : "Province / City / Commune"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {province} • {city} • {commune}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Quartier & Avenue" : "Quarter & Street"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {quarter} • {avenueParcel}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Occupation & Durée"
                            : "Occupancy & Duration"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {getBilingualLabel(
                            OCCUPANCY_STATUSES,
                            occupancyStatus,
                            isFr
                          )}{" "}
                          (
                          {getBilingualLabel(
                            RESIDENCE_DURATIONS,
                            residenceDuration,
                            isFr
                          )}
                          )
                        </span>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr
                            ? "Adresse Physique Complète"
                            : "Full Physical Address"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 block mt-1">
                          {fullAddress}
                        </span>
                      </div>

                      {(quarterChiefName || landlordHostName || utilityMeterRef) && (
                        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600 pt-1">
                          {quarterChiefName && (
                            <span>
                              <strong>
                                {isFr ? "Chef de quartier : " : "Quarter Chief: "}
                              </strong>
                              {quarterChiefName}
                            </span>
                          )}
                          {landlordHostName && (
                            <span>
                              <strong>
                                {isFr
                                  ? "Bailleur / Hébergeur : "
                                  : "Landlord / Host: "}
                              </strong>
                              {landlordHostName}
                            </span>
                          )}
                          {utilityMeterRef && (
                            <span>
                              <strong>
                                {isFr ? "Réf. Compteur : " : "Utility Ref: "}
                              </strong>
                              <span className="font-mono">{utilityMeterRef}</span>
                            </span>
                          )}
                        </div>
                      )}
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
                            {identityDoc || "piece_identite.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr
                            ? "Pièce d'Identité Officielle"
                            : "Official Identity Document"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            2
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {quarterChiefDoc || "attestation_chef_quartier.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr
                            ? "Attestation du Chef de Quartier"
                            : "Quarter Chief Attestation"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {addressProofDoc || "justificatif_domicile.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr
                            ? "Justificatif de Domicile"
                            : "Proof of Domicile"}
                        </span>
                      </div>

                      {supplementaryDoc && (
                        <div className="flex items-center justify-between py-2 text-xs">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                              4
                            </span>
                            <span className="font-medium truncate text-slate-800">
                              {supplementaryDoc}
                            </span>
                          </div>
                          <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                            {isFr
                              ? "Pièce Complémentaire"
                              : "Supplementary Proof"}
                          </span>
                        </div>
                      )}
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
                        ? "Je certifie sur l'honneur résider effectivement à l'adresse déclarée ci-dessus et atteste l'authenticité des documents joints conformément aux règlements de l'administration communale en RDC."
                        : "I solemnly certify on honour that I effectively reside at the residential address stated above and attest to the authenticity of the attached documents under DRC municipal regulations."}
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
                    ? "Demande de Certificat de Résidence Enregistrée"
                    : "Residence Certificate Application Submitted"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isFr
                    ? "Votre dossier officiel a été transmis à la maison communale compétente pour vérification et délivrance sous 24 heures."
                    : "Your official dossier has been routed to the competent municipal office for verification and issuance within 24 hours."}
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
                        ? "Certificat de Résidence & Domicile"
                        : "Certificate of Residence & Domicile"}
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
                      {isFr ? "Demandeur :" : "Applicant:"}
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {submittedApp.applicantName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Objet / Motif :" : "Purpose:"}
                    </span>
                    <span className="font-semibold text-blue-600 text-right">
                      {getBilingualLabel(OFFICIAL_PURPOSES, purpose, isFr)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Domicile Déclaré :" : "Address:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {avenueParcel}, {quarter}, {commune}, {province}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Administration :" : "Municipal Office:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {municipalOffice}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Contact (SMS & Email) :" : "Contact:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {phone}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Délai Légal :" : "Turnaround:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      {isFr ? "24 heures" : "24 hours"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 gap-4">
                    <span className="text-slate-500 shrink-0">
                      {isFr ? "Frais Réglementés :" : "Regulated Fee:"}
                    </span>
                    <span className="font-medium text-slate-900 text-right">
                      5 000 CDF
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

export default function ResidenceCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResidenceCertificateContent />
    </Suspense>
  );
}
