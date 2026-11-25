"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Language, CitizenApplication } from "@/types";
import { SERVICES_DATA } from "@/data/services";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import { readSupportingFile, UploadedFilePayload } from "@/lib/file-upload";
import {
  Globe,
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
  Camera,
  X,
  User,
  Users,
  MapPin,
  AlertCircle,
  RotateCcw,
  SwitchCamera,
  FileText,
  Upload,
  Building2,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const PASSPORT_SERVICE = SERVICES_DATA[1]; // "passeport-ordinaire"

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

const PASSPORT_HUBS = [
  { id: "kinshasa-chancellerie", labelFr: "Kinshasa - Direction Centrale de la Chancellerie - Gombe", labelEn: "Kinshasa - Central Chancery Directorate - Gombe" },
  { id: "kinshasa-limete", labelFr: "Kinshasa - Centre d'Enrôlement de Limete", labelEn: "Kinshasa - Limete Enrollment Center" },
  { id: "lubumbashi", labelFr: "Haut-Katanga - Direction Provinciale de Lubumbashi", labelEn: "Haut-Katanga - Lubumbashi Provincial Directorate" },
  { id: "goma", labelFr: "Nord-Kivu - Antenne Provinciale de Goma", labelEn: "Nord-Kivu - Goma Provincial Branch" },
  { id: "matadi", labelFr: "Kongo-Central - Antenne Provinciale de Matadi", labelEn: "Kongo-Central - Matadi Provincial Branch" },
  { id: "bukavu", labelFr: "Sud-Kivu - Antenne Provinciale de Bukavu", labelEn: "Sud-Kivu - Bukavu Provincial Branch" },
  { id: "mbuji-mayi", labelFr: "Kasaï-Oriental - Antenne Provinciale de Mbuji-Mayi", labelEn: "Kasaï-Oriental - Mbuji-Mayi Provincial Branch" },
  { id: "kisangani", labelFr: "Tshopo - Antenne Provinciale de Kisangani", labelEn: "Tshopo - Kisangani Provincial Branch" },
  { id: "consulat-etranger", labelFr: "Ambassade / Mission Diplomatique RDC à l'Étranger", labelEn: "Embassy / DRC Diplomatic Mission Abroad" },
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

const YEARS = Array.from({ length: 97 }, (_, i) => 2026 - i);

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

  const [internalViewYear, setInternalViewYear] = useState<number | null>(null);
  const [internalViewMonth, setInternalViewMonth] = useState<number | null>(null);

  const parsedParts = value ? value.split("-").map(Number) : null;
  const parsedYear = parsedParts && !isNaN(parsedParts[0]) ? parsedParts[0] : 1995;
  const parsedMonth = parsedParts && !isNaN(parsedParts[1]) ? parsedParts[1] - 1 : 0;

  const viewYear = internalViewYear ?? parsedYear;
  const viewMonth = internalViewMonth ?? parsedMonth;

  const setViewYear = (yr: number | ((prev: number) => number)) => {
    setInternalViewYear(typeof yr === "function" ? yr(viewYear) : yr);
  };
  const setViewMonth = (m: number | ((prev: number) => number)) => {
    setInternalViewMonth(typeof m === "function" ? m(viewMonth) : m);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

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

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const formatDisplay = (val: string) => {
    if (!val) return "";
    const parts = val.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return val;
    const [y, m, d] = parts;
    const monthName = isFr ? MONTHS_FR[m - 1] : MONTHS_EN[m - 1];
    return `${String(d).padStart(2, "0")} ${monthName} ${y}`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen && value) {
            const parts = value.split("-").map(Number);
            if (parts.length === 3 && !parts.some(isNaN)) {
              setInternalViewYear(parts[0]);
              setInternalViewMonth(parts[1] - 1);
            }
          }
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border bg-white transition-all text-left cursor-pointer ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-slate-300 hover:border-slate-400"
        } ${!value ? "text-slate-400" : "text-slate-900 font-medium"}`}
      >
        <span className="truncate">
          {value
            ? formatDisplay(value)
            : isFr
            ? "Sélectionner la date de naissance"
            : "Select date of birth"}
        </span>
        <Calendar className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
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
                className="text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer focus:outline-none"
              >
                {(isFr ? MONTHS_FR : MONTHS_EN).map((mName, idx) => (
                  <option key={idx} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer focus:outline-none"
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
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

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
            {(isFr ? DAYS_FR : DAYS_EN).map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(viewMonth + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const dateKey = `${viewYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = value === dateKey;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer ${
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

function PassportApplicationContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // Step state (1: Personal Identity, 2: Supporting Documents, 3: Review & Submit)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields: Civil Status
  const [surname, setSurname] = useState("");
  const [postName, setPostName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("1995-04-18");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("République Démocratique du Congo");
  const [maritalStatus, setMaritalStatus] = useState("Célibataire");
  const [occupation, setOccupation] = useState("");

  // Filiation
  const [fatherFullName, setFatherFullName] = useState("");
  const [fatherNationality, setFatherNationality] = useState("Congolaise");
  const [motherFullName, setMotherFullName] = useState("");
  const [motherNationality, setMotherNationality] = useState("Congolaise");

  // Origin & Residence
  const [originProvince, setOriginProvince] = useState("Kasaï-Oriental");
  const [originTerritory, setOriginTerritory] = useState("");
  const [residenceProvince, setResidenceProvince] = useState("Kinshasa");
  const [residenceCity, setResidenceCity] = useState("Kinshasa - Gombe");
  const [residenceAddress, setResidenceAddress] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");

  // Enrollment Hub
  const [collectionPoint, setCollectionPoint] = useState(
    "Kinshasa - Direction Centrale de la Chancellerie - Gombe"
  );

  // Identity Photo & Modal
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Supporting Documents
  const [birthCertDoc, setBirthCertDoc] = useState<string | null>(null);
  const [nationalityCertDoc, setNationalityCertDoc] = useState<string | null>(null);
  const [identityCardDoc, setIdentityCardDoc] = useState<string | null>(null);
  const [residenceDoc, setResidenceDoc] = useState<string | null>(null);
  const [uploadedFilePayloads, setUploadedFilePayloads] = useState<
    Record<string, UploadedFilePayload>
  >({});

  // Declaration
  const [declarationAgreed, setDeclarationAgreed] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (submittedApp) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submittedApp]);

  // Demo auto-fill option
  const handleDemoFill = () => {
    setSurname("ILUNGA");
    setPostName("TSHISEKEDI");
    setFirstName("Blandine");
    setGender("F");
    setBirthDate("1996-08-24");
    setBirthCity("Lubumbashi");
    setBirthCountry("République Démocratique du Congo");
    setMaritalStatus("Célibataire");
    setOccupation("Juriste d'Entreprise");

    setFatherFullName("ILUNGA KABANGA Jean-Paul");
    setFatherNationality("Congolaise");
    setMotherFullName("KASONGO WA BEYA Thérèse");
    setMotherNationality("Congolaise");

    setOriginProvince("Haut-Katanga");
    setOriginTerritory("Lubumbashi");
    setResidenceProvince("Kinshasa");
    setResidenceCity("Kinshasa - Gombe");
    setResidenceAddress("24, Boulevard du 30 Juin, Résidence Royal");
    setPhone("+243 99 876 5432");
    setEmail("b.ilunga@example.cd");

    setCollectionPoint("Kinshasa - Direction Centrale de la Chancellerie - Gombe");

    // Sample documents for demo
    setPhotoFileName("photo_oaci_ilunga.jpg");
    setPhotoDataUrl("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'><rect width='200' height='260' fill='%23e2e8f0'/><circle cx='100' cy='90' r='45' fill='%2394a3b8'/><path d='M30 230 C30 165 70 150 100 150 C130 150 170 165 170 230 Z' fill='%2394a3b8'/></svg>");
    setBirthCertDoc("acte_naissance_certifie_ilunga.pdf");
    setNationalityCertDoc("certificat_nationalite_legalise.pdf");
    setIdentityCardDoc("cni_attestation_valide.pdf");
    setResidenceDoc("certificat_residence_gombe.pdf");

    setValidationError(null);
  };

  // Camera Management
  const startCamera = async (mode: "user" | "environment" = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraModalOpen(false);
  };

  const toggleCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setPhotoDataUrl(dataUrl);
        setPhotoFileName("photo_capture_webcam.jpg");
        stopCamera();
      }
    }
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotoDataUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSingleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setter(file.name);
      const payload = await readSupportingFile(file);
      setUploadedFilePayloads((prev) => ({ ...prev, [file.name]: payload }));
    }
  };

  // Step 1 Validation -> Go to Step 2
  const handleProceedToStep2 = () => {
    if (!surname.trim() || !postName.trim() || !firstName.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner vos nom, post-nom et prénom."
          : "Please provide your surname, post-name, and first name."
      );
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    if (!birthCity.trim() || !birthDate) {
      setValidationError(
        isFr
          ? "Veuillez renseigner votre date et lieu de naissance."
          : "Please select your date of birth and birth place."
      );
      return;
    }

    if (!fatherFullName.trim() || !motherFullName.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner les informations des deux parents - filiation obligatoire."
          : "Please provide full names for both parents - mandatory lineage."
      );
      return;
    }

    if (!residenceAddress.trim() || !phone.trim() || phone.trim() === "+243" || !email.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner votre adresse de résidence, téléphone et adresse email."
          : "Please provide your residential address, phone number, and email address."
      );
      return;
    }

    setValidationError(null);
    setCurrentStep(2);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  // Step 2 Validation -> Go to Step 3
  const handleProceedToStep3 = () => {
    if (!photoDataUrl && !photoFileName) {
      setValidationError(
        isFr
          ? "Veuillez fournir votre photo d'identité conforme OACI."
          : "Please provide your ICAO-compliant identity photo."
      );
      return;
    }

    if (!birthCertDoc) {
      setValidationError(
        isFr
          ? "Veuillez joindre l'acte de naissance certifié conforme."
          : "Please attach the certified copy of your birth certificate."
      );
      return;
    }

    if (!nationalityCertDoc) {
      setValidationError(
        isFr
          ? "Veuillez joindre le certificat de nationalité congolaise légalisé."
          : "Please attach the legalized Congolese nationality certificate."
      );
      return;
    }

    if (!identityCardDoc) {
      setValidationError(
        isFr
          ? "Veuillez joindre la carte d'identité ou attestation d'identité valide."
          : "Please attach your national ID card or valid identity attestation."
      );
      return;
    }

    if (!residenceDoc) {
      setValidationError(
        isFr
          ? "Veuillez joindre le certificat de résidence ou casier judiciaire."
          : "Please attach the residence certificate or police clearance."
      );
      return;
    }

    setValidationError(null);
    setCurrentStep(3);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  // Step 3 Final Submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!declarationAgreed) {
      setValidationError(
        isFr
          ? "Veuillez certifier sur l'honneur l'exactitude des informations fournies."
          : "Please check the legal declaration to certify the accuracy of your statements."
      );
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-PASS-${randomSuffix}`;
    const computedName = `${surname.trim().toUpperCase()} ${postName.trim()} ${firstName.trim()}`;

    const supportingDocs = [
      { type: "photo", name: photoFileName || "photo_oaci.jpg" },
      {
        type: "birth_certificate",
        name: birthCertDoc,
        ...(birthCertDoc ? uploadedFilePayloads[birthCertDoc] : {}),
      },
      {
        type: "nationality_certificate",
        name: nationalityCertDoc,
        ...(nationalityCertDoc ? uploadedFilePayloads[nationalityCertDoc] : {}),
      },
      {
        type: "identity_document",
        name: identityCardDoc,
        ...(identityCardDoc ? uploadedFilePayloads[identityCardDoc] : {}),
      },
      {
        type: "residence_certificate",
        name: residenceDoc,
        ...(residenceDoc ? uploadedFilePayloads[residenceDoc] : {}),
      },
    ].filter((d) => d.name);

    try {
      const response = await fetch("/api/applications/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "passeport-ordinaire",
          serviceTitle: isFr ? "Demande de Passeport Ordinaire" : "Passport Application",
          applicantName: computedName,
          surname: surname.trim(),
          postName: postName.trim(),
          firstName: firstName.trim(),
          gender,
          birthDate,
          birthCity: birthCity.trim(),
          birthCountry: birthCountry.trim(),
          maritalStatus,
          occupation: occupation.trim() || "Sans profession",
          fatherFullName: fatherFullName.trim(),
          fatherNationality,
          motherFullName: motherFullName.trim(),
          motherNationality,
          originProvince,
          originTerritory: originTerritory.trim() || originProvince,
          residenceProvince,
          residenceCity: residenceCity.trim(),
          residenceAddress: residenceAddress.trim(),
          phone: phone.trim(),
          email: email.trim(),
          collectionPoint,
          photoUrl: photoDataUrl || null,
          supportingDocuments: supportingDocs,
          declarationAgreed: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur de sauvegarde");
      }

      const newApp: CitizenApplication = {
        trackingId: trackingCode,
        serviceId: "passeport-ordinaire",
        serviceTitle: isFr ? "Demande de Passeport Ordinaire" : "Passport Application",
        applicantName: computedName,
        email: email.trim(),
        phone: phone.trim(),
        city: residenceCity.trim(),
        submittedAt: "Aujourd'hui, 2026",
        status: "submitted",
        statusNotesFr:
          "Pré-demande enregistrée au registre consulaire national. Dossier transmis pour contrôle d'éligibilité et instruction.",
        statusNotesEn:
          "Pre-application recorded in national consular registry. Dossier routed for eligibility check and processing.",
        collectionPoint,
      };

      setSubmittedApp(newApp);
      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      setValidationError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer."
          : "An error occurred while saving your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Top Sovereign Navbar */}
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
        {/* DRC CIVIC HERO BANNER (MATCHES NATIONAL ID 1:1)                           */}
        {/* ========================================================================= */}
        <section
          className="relative bg-cover bg-center border-b border-slate-200/90 py-10 sm:py-14 overflow-hidden no-print"
          style={{ backgroundImage: "url('/national-id-hero-bg.jpg')" }}
        >
          {/* Translucent overlay maintaining crisp contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90 backdrop-blur-[0.5px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2.5">
            {/* Centered Main Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              {isFr ? (
                <>
                  Passeport{" "}
                  <span className="text-blue-600">Ordinaire</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Passport Application</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Demande officielle en ligne pour l'obtention du passeport ordinaire conforme aux normes internationales de l'OACI pour vos voyages à l'international."
                : "Official online application for the standard Congolese passport for international travel, compliant with international ICAO standards."}
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          {/* Form Card OR Receipt */}
          {!submittedApp ? (
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
              {/* Demo Fill Button at top-right of form card */}
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

              {/* Form Title & Ministry Subtitle (Centered, Clean) */}
              <div className="text-center space-y-1 pb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Formulaire de Demande de Passeport Ordinaire"
                    : "Passport Application Form"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Direction de la Chancellerie et des Affaires Consulaires • Ministère des Affaires Étrangères"
                    : "Directorate of Chancery and Consular Affairs • Ministry of Foreign Affairs"}
                </p>
              </div>

              {/* 3-Step Connected Progress Stepper */}
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
                        {isFr ? "Identité Personnelle" : "Personal Identity"}
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
              {/* STEP 1: PERSONAL IDENTITY (CIVIL STATUS, FILIATION, RESIDENCE) */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Civil Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Identité Civile du Bénéficiaire" : "Citizen Civil Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille *" : "Surname / Family Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: TSHISEKEDI"
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
                          placeholder="Ex: KABANGE"
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
                          placeholder="Ex: Christian"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 capitalize font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Sexe *" : "Gender *"}
                        </label>
                        <div className="flex items-center gap-4 pt-2.5">
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === "M"}
                              onChange={() => setGender("M")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Masculin" : "Male"}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === "F"}
                              onChange={() => setGender("F")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Féminin" : "Female"}</span>
                          </label>
                        </div>
                      </div>

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

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Lieu de naissance *" : "Place of Birth *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa"
                          value={birthCity}
                          onChange={(e) => setBirthCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Pays de naissance *" : "Country of Birth *"}
                        </label>
                        <input
                          type="text"
                          value={birthCountry}
                          onChange={(e) => setBirthCountry(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "État civil *" : "Marital Status *"}
                        </label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        >
                          <option value="Célibataire">{isFr ? "Célibataire" : "Single"}</option>
                          <option value="Marié">{isFr ? "Marié" : "Married"}</option>
                          <option value="Divorcé">{isFr ? "Divorcé" : "Divorced"}</option>
                          <option value="Veuf / Veuve">{isFr ? "Veuf / Veuve" : "Widowed"}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Profession / Fonction *" : "Profession / Occupation *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Économiste / Juriste"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.2 Filiation (Lineage) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Filiation Parentale & Nationalité des Parents" : "Parental Lineage & Parents' Nationality"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom complet du père *" : "Father's Full Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: TSHISEKEDI WA MULUMBA Étienne"
                          value={fatherFullName}
                          onChange={(e) => setFatherFullName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nationalité du père *" : "Father's Nationality *"}
                        </label>
                        <input
                          type="text"
                          value={fatherNationality}
                          onChange={(e) => setFatherNationality(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom complet de la mère *" : "Mother's Full Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: KALANGA KABEDI Marthe"
                          value={motherFullName}
                          onChange={(e) => setMotherFullName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nationalité de la mère *" : "Mother's Nationality *"}
                        </label>
                        <input
                          type="text"
                          value={motherNationality}
                          onChange={(e) => setMotherNationality(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.3 Origin & Current Residence */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Origine & Résidence Actuelle" : "Origin & Current Residence"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Province d'origine *" : "Province of Origin *"}
                        </label>
                        <select
                          value={originProvince}
                          onChange={(e) => setOriginProvince(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
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
                          {isFr ? "Territoire / Ville d'origine *" : "Territory / City of Origin *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Miabi / Lubao"
                          value={originTerritory}
                          onChange={(e) => setOriginTerritory(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Province de résidence *" : "Current Province of Residence *"}
                        </label>
                        <select
                          value={residenceProvince}
                          onChange={(e) => setResidenceProvince(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
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
                          {isFr ? "Commune / Ville de résidence *" : "Municipality / City of Residence *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa - Gombe"
                          value={residenceCity}
                          onChange={(e) => setResidenceCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Adresse physique complète *" : "Full Street Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 14, Avenue des Huileries, Quartier Golf"
                        value={residenceAddress}
                        onChange={(e) => setResidenceAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Numéro de téléphone (+243) *" : "Contact Phone (+243) *"}
                        </label>
                        <input
                          type="tel"
                          placeholder="+243 81 234 5678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono text-slate-900 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Adresse email *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          placeholder="citoyen@example.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.4 Enrollment Hub Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-bold uppercase tracking-wider">
                        {isFr ? "Centre d'Enrôlement & Retrait" : "Biometric Hub & Collection Center"}
                      </h2>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Centre consulaire de capture biométrique *" : "Selected Consular Hub *"}
                      </label>
                      <select
                        value={collectionPoint}
                        onChange={(e) => setCollectionPoint(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                      >
                        {PASSPORT_HUBS.map((hub) => (
                          <option key={hub.id} value={isFr ? hub.labelFr : hub.labelEn}>
                            {isFr ? hub.labelFr : hub.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Step 1 Next Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 2: SUPPORTING DOCUMENTS UPLOAD                             */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      {isFr ? "Pièces Justificatives Officielles" : "Mandatory Supporting Documents"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isFr
                        ? "Fournissez les documents requis pour l'instruction de votre passeport. Formats acceptés : PDF, JPG, PNG - Max 5 Mo."
                        : "Attach required documents for your passport processing. Accepted formats: PDF, JPG, PNG - Max 5MB."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Row 1: Identity Photo */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          1
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Photo d'Identité Officielle" : "Official Identity Photo"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {photoFileName ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            {photoDataUrl ? (
                              <img
                                src={photoDataUrl}
                                alt="Thumb"
                                className="w-4 h-4 object-cover rounded-xs border border-blue-200"
                              />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{photoFileName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoDataUrl(null);
                                setPhotoFileName(null);
                              }}
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

                        <button
                          type="button"
                          onClick={() => {
                            setIsCameraModalOpen(true);
                            startCamera();
                          }}
                          className="h-9 px-3.5 sm:px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
                        >
                          <Camera className="w-4 h-4 text-white" />
                          <span>
                            {photoFileName
                              ? isFr ? "Reprendre Photo" : "Retake Photo"
                              : isFr ? "Prendre Photo" : "Take Photo"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Secured Birth Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Acte de Naissance Sécurisé" : "Certified Birth Certificate"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {birthCertDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{birthCertDoc}</span>
                            <button
                              type="button"
                              onClick={() => setBirthCertDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setBirthCertDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 3: Legalized Nationality Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Certificat de Nationalité Légalisé" : "Legalized Nationality Certificate"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {nationalityCertDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{nationalityCertDoc}</span>
                            <button
                              type="button"
                              onClick={() => setNationalityCertDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setNationalityCertDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 4: Valid ID / Attestation */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Carte d'Identité ou Attestation Valide" : "National ID / Valid Identification"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {identityCardDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{identityCardDoc}</span>
                            <button
                              type="button"
                              onClick={() => setIdentityCardDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setIdentityCardDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Row 5: Certificate of Residence or Police Clearance */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          5
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Certificat de Résidence Récent" : "Proof of Residence / Police Clearance"}{" "}
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
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationError(null);
                        setCurrentStep(1);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isFr ? "Retour à l'Identité" : "Back to Identity"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToStep3}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 3: REVIEW & SUBMIT (CLEAN FORM STYLE, NO BULKY CARDS)   */}
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

                  {/* 1. Applicant Identity Form Row */}
                  <div className="flex items-start gap-4 sm:gap-6 pb-6 border-b border-slate-200">
                    {photoDataUrl ? (
                      <img
                        src={photoDataUrl}
                        alt="Citizen"
                        className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-slate-300 bg-slate-100 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-20 sm:w-20 sm:h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Nom & Post-nom" : "Full Name"}
                        </span>
                        <span className="text-sm font-bold text-slate-900 block mt-0.5">
                          {surname} {postName} {firstName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Sexe & Date de Naissance" : "Gender & Birth Date"}
                        </span>
                        <span className="text-sm font-medium text-slate-800 block mt-0.5">
                          {gender === "M" ? (isFr ? "Masculin" : "Male") : (isFr ? "Féminin" : "Female")} • {birthDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Lieu de Naissance" : "Place of Birth"}
                        </span>
                        <span className="text-sm font-medium text-slate-800 block mt-0.5">
                          {birthCity}, {birthCountry}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "État Civil" : "Marital Status"}
                        </span>
                        <span className="text-sm font-medium text-slate-800 block mt-0.5">
                          {maritalStatus}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Profession" : "Profession / Occupation"}
                        </span>
                        <span className="text-sm font-medium text-slate-800 block mt-0.5">
                          {occupation || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Parents' Lineage (Clean Form Layout) */}
                  <div className="pb-6 border-b border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {isFr ? "Filiation Parentale" : "Parental Lineage"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Père" : "Father"}
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{fatherFullName || "—"}</p>
                        <p className="text-xs text-slate-500">
                          {isFr ? "Nationalité :" : "Nationality:"} {fatherNationality}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Mère" : "Mother"}
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{motherFullName || "—"}</p>
                        <p className="text-xs text-slate-500">
                          {isFr ? "Nationalité :" : "Nationality:"} {motherNationality}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Origin, Residence & Consular Hub */}
                  <div className="pb-6 border-b border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {isFr ? "Origine, Résidence & Centre de Retrait" : "Origin, Residence & Consular Hub"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Origine Territoriale" : "Territorial Origin"}
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {originProvince} — {originTerritory || "Centre"}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          {phone} • {email}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Adresse & Centre Consulaire Choisi" : "Address & Selected Consular Hub"}
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {residenceAddress}, {residenceCity}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 mt-1">
                          {collectionPoint}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Verified Attached Documents - Simple Clean Gray Only (NO CARDS, NO BLUE) */}
                  <div className="space-y-3 pb-6 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {isFr ? "Documents joints vérifiés :" : "Verified Attached Documents:"}
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            1
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {photoFileName || "photo_oaci.jpg"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Photo d'Identité OACI" : "Identity Photo"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            2
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {birthCertDoc || "acte_naissance.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Acte de Naissance" : "Birth Certificate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {nationalityCertDoc || "certificat_nationalite.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Certificat de Nationalité" : "Nationality Certificate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            4
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {identityCardDoc || "carte_identite.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Carte d'Identité / Attestation" : "Identity Document"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            5
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {residenceDoc || "certificat_residence.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Certificat de Résidence / Casier" : "Residence / Police Clearance"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Declaration on Honour - Clean Simple Gray (NO BLUE CONTAINER) */}
                  <label className="flex items-start gap-3 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAgreed}
                      onChange={(e) => setDeclarationAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-400 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      {isFr
                        ? "Je certifie sur l'honneur l'exactitude de toutes les informations ci-dessus concernant l'identité civile, la filiation des parents, la nationalité et les pièces jointes. Je confirme la soumission de ma demande de passeport."
                        : "I solemnly declare on my honour that all information above concerning civil identity, parents' lineage, nationality, and attachments is exact and true. I confirm the submission of my passport application."}
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
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
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
              <div className="flex justify-center no-print">
                <AnimatedCheckmark size={64} />
              </div>

              <div className="space-y-1 no-print">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr ? "Demande de Passeport Enregistrée avec Succès !" : "Passport Application Successfully Registered!"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  {isFr
                    ? "Votre pré-demande a été enregistrée au registre consulaire national. Conservez précieusement votre récépissé officiel."
                    : "Your pre-application has been registered in the national consular database. Please keep your official receipt."}
                </p>
              </div>

              {/* Reference Badge */}
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
                      {isFr ? "Demande de Passeport Ordinaire" : "Passport Application"}
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

                {photoDataUrl && (
                  <div className="flex justify-center pt-1 pb-2">
                    <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-blue-600 shadow-xs bg-slate-100">
                      <img
                        src={photoDataUrl}
                        alt="Citizen"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Nom complet :" : "Full Name:"}</span>
                    <span className="font-bold text-slate-900 text-right">{submittedApp.applicantName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Date & Lieu de Naissance :" : "Birth Date & Place:"}</span>
                    <span className="font-medium text-slate-900 text-right">
                      {birthDate} — {birthCity || "Kinshasa"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Nom du Père :" : "Father's Name:"}</span>
                    <span className="font-medium text-slate-900 text-right">{fatherFullName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Nationalité du Père :" : "Father's Nationality:"}</span>
                    <span className="font-medium text-slate-900 text-right">{fatherNationality || "Congolaise"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Nom de la Mère :" : "Mother's Name:"}</span>
                    <span className="font-medium text-slate-900 text-right">{motherFullName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Nationalité de la Mère :" : "Mother's Nationality:"}</span>
                    <span className="font-medium text-slate-900 text-right">{motherNationality || "Congolaise"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Centre d'Enrôlement & Retrait :" : "Biometric Hub & Pickup:"}</span>
                    <span className="font-medium text-blue-700 text-right">{collectionPoint}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{isFr ? "Province d'origine :" : "Province of Origin:"}</span>
                    <span className="font-medium text-slate-900 text-right">{originProvince} ({originTerritory || "Centre"})</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                    setSurname("");
                    setPostName("");
                    setFirstName("");
                    setBirthCity("");
                    setFatherFullName("");
                    setMotherFullName("");
                    setResidenceAddress("");
                    setPhotoDataUrl(null);
                    setPhotoFileName(null);
                    setBirthCertDoc(null);
                    setNationalityCertDoc(null);
                    setIdentityCardDoc(null);
                    setResidenceDoc(null);
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

        {/* Identity Photo Capture Modal */}
        {isCameraModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-900">
                    {isFr ? "Capture Photo d'Identité" : "Identity Photo Capture"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      facingMode === "user" ? "-scale-x-100" : ""
                    }`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Circular Camera Switch Icon Button (NO TEXT) */}
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer shadow-md"
                    title={isFr ? "Changer de caméra" : "Switch camera"}
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>

                  {/* Visual Portrait Guide Overlay */}
                  <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                      {isFr ? "Cadrez votre visage ici" : "Frame your face here"}
                    </span>
                  </div>
                </div>

                {/* Bottom portrait guidelines */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed text-center">
                  {isFr
                    ? "Retirez vos lunettes et chapeaux • Regardez l'objectif • Éclairage clair et uniforme"
                    : "Remove hats and glasses • Look straight ahead • Good lighting and neutral expression"}
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {isFr ? "Annuler" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isFr ? "Prendre la photo" : "Capture Photo"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}

export default function PassportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <PassportApplicationContent />
    </Suspense>
  );
}
