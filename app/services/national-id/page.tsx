"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Language, CitizenApplication } from "../../../types";
import { SERVICES_DATA } from "../../../data/services";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import { AnimatedCheckmark } from "@/components/AnimatedCheckmark";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Check,
  Copy,
  Calendar as CalendarIcon,
  Sparkles,
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
  Loader2,
} from "lucide-react";

const CNI_SERVICE = SERVICES_DATA[0];

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
    if (!val) return isFr ? "Sélectionner la date" : "Select date";
    const parts = val.split("-").map(Number);
    if (parts.length !== 3) return val;
    const [y, m, d] = parts;
    const monthName = isFr ? MONTHS_FR[m - 1] : MONTHS_EN[m - 1];
    return isFr ? `${d} ${monthName} ${y}` : `${monthName} ${d}, ${y}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between cursor-pointer"
      >
        <span className={value ? "text-slate-900 font-medium" : "text-slate-400"}>
          {formatDisplay(value)}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-slate-800">
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 py-1 text-slate-900 border border-slate-200 focus:outline-none cursor-pointer"
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
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 rounded-lg px-2 py-1 text-slate-900 border border-slate-200 focus:outline-none cursor-pointer"
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
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center mb-1.5">
            {(isFr ? DAYS_FR : DAYS_EN).map((dayName, idx) => (
              <span key={idx} className="text-[11px] font-semibold text-slate-400 py-1">
                {dayName}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = value === formattedDate;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "text-slate-800 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              {isFr ? "Effacer" : "Clear"}
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                onChange(nowStr);
                setIsOpen(false);
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
            >
              {isFr ? "Aujourd'hui" : "Today"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NationalIdServicePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // Flow step: 1 = Fill Form, 2 = Upload Docs & Photo, 3 = Review & Submit
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Civil Identity
  const [surname, setSurname] = useState("");
  const [postName, setPostName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("celibataire");
  const [nationalityOrigin, setNationalityOrigin] = useState("origine");

  // Step 1: Parents' Filiation (Parent Nationality & ID)
  const [fatherFullName, setFatherFullName] = useState("");
  const [fatherNationality, setFatherNationality] = useState("Congolaise");
  const [fatherIdNumber, setFatherIdNumber] = useState("");
  const [motherFullName, setMotherFullName] = useState("");
  const [motherNationality, setMotherNationality] = useState("Congolaise");
  const [motherIdNumber, setMotherIdNumber] = useState("");
  const [originProvince, setOriginProvince] = useState(DRC_PROVINCES[5]);
  const [originTerritory, setOriginTerritory] = useState("");
  const [originSector, setOriginSector] = useState("");

  // Step 1: Current Residence & Contact
  const [residenceProvince, setResidenceProvince] = useState(DRC_PROVINCES[0]);
  const [residenceCity, setResidenceCity] = useState("Kinshasa - Gombe");
  const [residenceAddress, setResidenceAddress] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");

  // Step 2: Supporting Files & Real Camera Photo
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [birthCertDoc, setBirthCertDoc] = useState<string | null>(null);
  const [residenceDoc, setResidenceDoc] = useState<string | null>(null);
  const [parentIdDoc, setParentIdDoc] = useState<string | null>(null);

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedModalPhoto, setCapturedModalPhoto] = useState<string | null>(null);
  const [isCameraMirrored, setIsCameraMirrored] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  // Step 3: Legal Declaration
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  // Completed Submission State
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (submittedApp) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submittedApp]);

  // Demo auto-fill option
  const handleDemoFill = () => {
    // 1. Fill Form
    setSurname("MUKENDI");
    setPostName("KABANGE");
    setFirstName("Éric");
    setGender("M");
    setBirthDate("1995-04-18");
    setBirthCity("Kinshasa / Barumbu");
    setMaritalStatus("celibataire");
    setNationalityOrigin("origine");

    setFatherFullName("MUKENDI TSHISUNGU Joseph");
    setFatherNationality("Congolaise");
    setFatherIdNumber("NIN-CD-1965-098234");
    setMotherFullName("KABANGE KALONJI Marie");
    setMotherNationality("Congolaise");
    setMotherIdNumber("NIN-CD-1970-112349");
    setOriginProvince("Kasaï-Oriental");
    setOriginTerritory("Miabi");
    setOriginSector("Bakwa-Kalonji");

    setResidenceProvince("Kinshasa");
    setResidenceCity("Kinshasa - Gombe");
    setResidenceAddress("14 Avenue de la Paix, Quartier Batetela");
    setPhone("+243 81 234 5678");
    setEmail("eric.mukendi@example.cd");
    setOccupation("Ingénieur Réseaux Informatiques");

    // 2. Upload Docs & Photo (Matching exact filenames from Image 1)
    setPhotoFileName("photo_specimen.jpg");
    setBirthCertDoc("acte_naissance.pdf");
    setResidenceDoc("certif_residence.pdf");
    setParentIdDoc("cni_parent.pdf");
    setUploadedDocs([
      "photo_specimen.jpg",
      "acte_naissance.pdf",
      "certif_residence.pdf",
      "cni_parent.pdf",
    ]);
    setDeclarationAgreed(true);
    setValidationError(null);

    const samplePhotoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="380" viewBox="0 0 300 380">
      <rect width="100%" height="100%" fill="#e2e8f0"/>
      <circle cx="150" cy="140" r="70" fill="#2563eb"/>
      <path d="M60 340 C60 250, 240 250, 240 340 Z" fill="#1e3a8a"/>
      <circle cx="150" cy="130" r="45" fill="#fbcfe8"/>
      <text x="150" y="365" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">PHOTO CONGOLAISE OFFICIELLE</text>
    </svg>`;
    setPhotoDataUrl(`data:image/svg+xml;utf8,${encodeURIComponent(samplePhotoSvg)}`);
  };

  // Real Camera Handling
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCameraError(
        isFr
          ? "Accès caméra non disponible. Vous pouvez téléverser un fichier photo ci-dessous."
          : "Camera access unavailable. You can upload a photo file below."
      );
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (isCameraMirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedModalPhoto(dataUrl);
      }
      stopCamera();
    }
  };

  const confirmCapturedPhoto = () => {
    if (capturedModalPhoto) {
      setPhotoDataUrl(capturedModalPhoto);
      setPhotoFileName("photo_specimen.jpg");
      setCapturedModalPhoto(null);
      setIsCameraModalOpen(false);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoDataUrl(event.target.result as string);
          setPhotoFileName(file.name);
          setCapturedModalPhoto(null);
          setIsCameraModalOpen(false);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSingleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0].name);
    }
  };

  // Step 1 Validation -> Go to Step 2
  const handleProceedToStep2 = () => {
    if (!surname.trim() || !postName.trim() || !firstName.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner votre Nom, Post-nom et Prénom complets."
          : "Please provide your Full Surname, Post-name and First Name."
      );
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    if (!birthDate) {
      setValidationError(
        isFr ? "Veuillez sélectionner votre date de naissance." : "Please select your date of birth."
      );
      return;
    }

    if (!fatherFullName.trim() || !motherFullName.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner les informations des parents - père et mère."
          : "Please provide both parents' information - father and mother."
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
          ? "Veuillez fournir votre photo d'identité."
          : "Please provide your identity photo."
      );
      return;
    }

    if (!birthCertDoc) {
      setValidationError(
        isFr
          ? "Veuillez joindre l'acte de naissance sécurisé."
          : "Please attach the secured birth certificate."
      );
      return;
    }

    if (!residenceDoc) {
      setValidationError(
        isFr
          ? "Veuillez joindre le certificat de résidence."
          : "Please attach the certificate of residence."
      );
      return;
    }

    if (!parentIdDoc) {
      setValidationError(
        isFr
          ? "Veuillez joindre la pièce d'identité ou le passeport du parent."
          : "Please attach the parent's national ID card or passport."
      );
      return;
    }

    setUploadedDocs([
      photoFileName || "photo_specimen.jpg",
      birthCertDoc,
      residenceDoc,
      parentIdDoc,
    ].filter(Boolean) as string[]);

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
    const trackingCode = `CD-2026-ID-${randomSuffix}`;
    const fullApplicantName = `${surname.trim()} ${postName.trim()} ${firstName.trim()}`;

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: "cni-biometrique",
      serviceTitle: isFr ? CNI_SERVICE.titleFr : CNI_SERVICE.titleEn,
      applicantName: fullApplicantName,
      email: email.trim() || "citoyen@service-public.cd",
      phone: phone.trim() || "+243 81 000 0000",
      city: residenceCity,
      submittedAt: "Aujourd'hui, 2026",
      status: "submitted",
      statusNotesFr:
        "Dossier officiel enregistré. Contrôle de filiation et validation d'état civil en cours.",
      statusNotesEn:
        "Official dossier registered. Lineage verification and civil registry review underway.",
      collectionPoint: residenceCity,
    };

    try {
      // Persist application directly into live PostgreSQL database
      await fetch("/api/applications/national-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "cni",
          serviceTitle: isFr ? CNI_SERVICE.titleFr : CNI_SERVICE.titleEn,
          applicantName: fullApplicantName,
          surname,
          postName,
          firstName,
          gender,
          birthDate,
          birthCity,
          maritalStatus,
          nationalityOrigin,
          fatherFullName,
          fatherNationality,
          fatherIdNumber,
          motherFullName,
          motherNationality,
          motherIdNumber,
          originProvince,
          originTerritory,
          originSector,
          residenceProvince,
          residenceCity,
          residenceAddress,
          phone,
          email,
          occupation,
          photoUrl: photoDataUrl,
          supportingDocuments: uploadedDocs,
          declarationAgreed,
          collectionPoint: residenceCity,
        }),
      });
    } catch (err) {
      console.error("Database persistence error:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedApp(newApp);
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
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab="services"
        onTabChange={(tab) => {
          router.push(`/?tab=${tab}`);
        }}
        onOpenOfficerPortal={() => router.push("/?officer=true")}
      />

      {/* Main Container */}
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
          {/* Translucent overlay that preserves the background photo while maintaining crisp contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90 backdrop-blur-[0.5px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2.5">
            {/* Centered Main Title (No "Biometric") */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              {isFr ? (
                <>
                  Carte Nationale{" "}
                  <span className="text-blue-600">d'Identité</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">National ID Card</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle (No "Biometric") */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Effectuez votre demande officielle en ligne pour l'obtention de la carte d'identité sécurisée dotée d'une puce électronique cryptographique et d'un Numéro d'Identification Nationale (NIN) unique."
                : "Official online application for the smart identity card featuring an encrypted cryptographic chip and unique National Identification Number (NIN)."}
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          {/* Form Card OR Receipt */}
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
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isFr
                    ? "Formulaire de Demande de Carte Nationale d'Identité"
                    : "National Identity Card Application Form"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Direction Générale de la Population • Ministère de l'Intérieur et Sécurité"
                    : "General Directorate of Population • Ministry of Interior and Security"}
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
              {/* STAGE 1: FILL FORM ALL (CIVIL IDENTITY, PARENTS, RESIDENCE)    */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Civil Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                      <User className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Identité Civile du Citoyen" : "Citizen Civil Identity"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nom de famille *" : "Surname / Family Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MUKENDI"
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
                          placeholder="Ex: Éric"
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
                          placeholder="Ex: Kinshasa / Barumbu"
                          value={birthCity}
                          onChange={(e) => setBirthCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "État Civil *" : "Marital Status *"}
                        </label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="celibataire">{isFr ? "Célibataire" : "Single"}</option>
                          <option value="marie">{isFr ? "Marié" : "Married"}</option>
                          <option value="veuf">{isFr ? "Veuf / Veuve" : "Widowed"}</option>
                          <option value="divorce">{isFr ? "Divorcé" : "Divorced"}</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Nationalité du demandeur *" : "Applicant Nationality *"}
                        </label>
                        <select
                          value={nationalityOrigin}
                          onChange={(e) => setNationalityOrigin(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                        >
                          <option value="origine">
                            {isFr ? "Congolaise d'origine • Art. 10 Constitution" : "Congolese by Origin • Art. 10 Constitution"}
                          </option>
                          <option value="acquisition">
                            {isFr ? "Congolaise par acquisition / naturalisation" : "Congolese by Acquisition / Naturalization"}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 1.2 Parental Lineage (Parents' Nationality & ID) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Filiation Parentale & Nationalité des Parents" : "Parental Lineage & Parents' Nationality"}
                      </h2>
                    </div>

                    {/* Father Info */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                        {isFr ? "Père" : "Father"}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nom complet *" : "Full Name *"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: MUKENDI TSHISUNGU Joseph"
                            value={fatherFullName}
                            onChange={(e) => setFatherFullName(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nationalité *" : "Nationality *"}
                          </label>
                          <input
                            type="text"
                            value={fatherNationality}
                            onChange={(e) => setFatherNationality(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "N° ID / NIN / Carte d'électeur *" : "ID / NIN / Voter Card No. *"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: NIN-CD-1965-098234"
                            value={fatherIdNumber}
                            onChange={(e) => setFatherIdNumber(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mother Info */}
                    <div className="bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                        {isFr ? "Mère" : "Mother"}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nom complet *" : "Full Name *"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: KABANGE KALONJI Marie"
                            value={motherFullName}
                            onChange={(e) => setMotherFullName(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "Nationalité *" : "Nationality *"}
                          </label>
                          <input
                            type="text"
                            value={motherNationality}
                            onChange={(e) => setMotherNationality(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            {isFr ? "N° ID / NIN / Carte d'électeur *" : "ID / NIN / Voter Card No. *"}
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: NIN-CD-1970-112349"
                            value={motherIdNumber}
                            onChange={(e) => setMotherIdNumber(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-mono font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Territorial origin */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Province d'origine *" : "Province of Origin *"}
                        </label>
                        <select
                          value={originProvince}
                          onChange={(e) => setOriginProvince(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
                          {isFr ? "Territoire / Ville d'origine *" : "Territory / City of Origin *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Miabi"
                          value={originTerritory}
                          onChange={(e) => setOriginTerritory(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Secteur / Chefferie / Village *" : "Sector / Chiefdom / Village *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Bakwa-Kalonji"
                          value={originSector}
                          onChange={(e) => setOriginSector(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.3 Residence & Contact */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Résidence Actuelle & Contact" : "Current Residence & Contact"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Province de résidence *" : "Province of Residence *"}
                        </label>
                        <select
                          value={residenceProvince}
                          onChange={(e) => setResidenceProvince(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
                          {isFr ? "Ville / Commune de résidence *" : "City / Municipality *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Kinshasa - Gombe"
                          value={residenceCity}
                          onChange={(e) => setResidenceCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Profession / Métier *" : "Occupation / Profession *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Ingénieur Réseaux"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Contact details: Phone and Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Téléphone (+243) *" : "Phone (+243) *"}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+243 81 234 5678"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Adresse Email *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="citoyen@example.cd"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Wide Full-Width Big Address Field */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr
                          ? "Adresse physique complète *"
                          : "Full Physical Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isFr
                            ? "Ex: 14 Avenue de la Paix, Quartier Batetela, Commune de la Gombe, Réf. Arrêt Métro"
                            : "Ex: 14 Peace Avenue, Batetela Quarter, Gombe Municipality, Ref. Metro Stop"
                        }
                        value={residenceAddress}
                        onChange={(e) => setResidenceAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Step 1 Bottom Action */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 2: SUPPORTING DOCUMENTS SUBMISSION (THEME BLUE STYLING)  */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Card Header with Document Icon */}
                  <div className="flex items-center gap-2.5 text-slate-900">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                      {isFr ? "Soumission des Pièces Justificatives" : "Supporting Documents Submission"}
                    </h2>
                  </div>

                  {/* Formats Info (No Background) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-0.5">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      {isFr
                        ? "Formats acceptés : PDF, JPG, PNG - Max 10 Mo par document."
                        : "Accepted formats: PDF, JPG, PNG - Max 10MB per document."}
                    </span>
                  </div>

                  {/* 4 Numbered Supporting Document Rows */}
                  <div className="space-y-3.5">
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
                              ? isFr
                                ? "Reprendre Photo"
                                : "Retake Photo"
                              : isFr
                              ? "Prendre Photo"
                              : "Take Photo"}
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
                          {isFr ? "Acte de Naissance Sécurisé" : "Secured Birth Certificate"}{" "}
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

                    {/* Row 3: Certificate of Residence */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Certificat de Résidence Récent" : "Certificate of Residence"}{" "}
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

                    {/* Row 4: Parent's National ID Card / Passport */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Pièce d'Identité / Passeport du Parent" : "Parent's National ID Card / Passport"}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 flex-nowrap">
                        {parentIdDoc ? (
                          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{parentIdDoc}</span>
                            <button
                              type="button"
                              onClick={() => setParentIdDoc(null)}
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
                            onChange={(e) => handleSingleFileUpload(e, setParentIdDoc)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Bottom Actions (Matching Theme) */}
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
                      onClick={handleProceedToStep3}
                      className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STAGE 3: COMPLETE APPLICATION REVIEW (CLEAN FORM STYLE)       */}
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
                          {isFr ? "Demandeur officiel" : "Official Applicant"}
                        </span>
                        <span className="text-sm font-bold text-slate-950 block mt-0.5">
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
                          {birthCity}
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
                          {isFr ? "Origine de Nationalité" : "Nationality Origin"}
                        </span>
                        <span className="text-sm font-medium text-slate-800 block mt-0.5">
                          {nationalityOrigin === "origine"
                            ? isFr ? "Congolaise d'Origine" : "Congolese by Origin"
                            : isFr ? "Acquise par Naturalisation" : "By Naturalization"}
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
                        {fatherIdNumber && (
                          <p className="text-xs text-slate-400 font-mono">
                            {isFr ? "N° Pièce :" : "ID No:"} {fatherIdNumber}
                          </p>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Mère" : "Mother"}
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{motherFullName || "—"}</p>
                        <p className="text-xs text-slate-500">
                          {isFr ? "Nationalité :" : "Nationality:"} {motherNationality}
                        </p>
                        {motherIdNumber && (
                          <p className="text-xs text-slate-400 font-mono">
                            {isFr ? "N° Pièce :" : "ID No:"} {motherIdNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Origin & Residence */}
                  <div className="pb-6 border-b border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {isFr ? "Origine Territoriale & Résidence" : "Territorial Origin & Residence"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Origine Territoriale" : "Territorial Origin"}
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {originProvince} — {originTerritory} ({originSector})
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          {phone} • {email}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Adresse de Résidence" : "Residential Address"}
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {residenceAddress}, {residenceCity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. Verified Attached Documents - Clean Gray Only (NO CARDS, NO BLUE) */}
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
                            {photoFileName || "photo_specimen.jpg"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Photo d'Identité" : "Identity Photo"}
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
                            {residenceDoc || "certif_residence.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Certificat de Résidence" : "Residence Certificate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            4
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {parentIdDoc || "cni_parent.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Pièce d'Identité Parent" : "Parent's ID Document"}
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
                        ? "Je certifie sur l'honneur l'exactitude de toutes les informations ci-dessus concernant l'identité civile, la filiation des parents, la nationalité et les pièces jointes. Je confirme la soumission de ma demande."
                        : "I solemnly declare on my honour that all information above concerning civil identity, parents' lineage, nationality and attachments is exact and true. I confirm the submission of my application."}
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
            /* OFFICIAL SUBMISSION RECEIPT                                    */
            /* ============================================================== */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-center">
              <div className="flex justify-center no-print">
                <AnimatedCheckmark size={64} />
              </div>

              <div className="space-y-1 no-print">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isFr ? "Demande Enregistrée avec Succès !" : "Application Successfully Registered!"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isFr
                    ? "Votre numéro officiel de suivi a été généré :"
                    : "Your official tracking reference has been generated:"}
                </p>
              </div>

              {/* Tracking ID Badge (Screen View) */}
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
                      {isFr ? "Demande de Carte d'Identité" : "National ID Application"}
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
                      {birthDate || "18/04/1995"} — {birthCity || "Kinshasa"}
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
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{isFr ? "Province d'origine :" : "Province of Origin:"}</span>
                    <span className="font-medium text-slate-900 text-right">{originProvince} ({originTerritory || "Miabi"})</span>
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

        {/* Identity Photo Capture Modal */}
        {isCameraModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isFr ? "Photo d'Identité" : "Identity Photo"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isFr
                        ? "Cadrez votre visage au centre pour votre pièce d'identité."
                        : "Align your face in the center frame for your official photo."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsCameraModalOpen(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <canvas ref={canvasRef} className="hidden" />

                {capturedModalPhoto ? (
                  <div className="space-y-4 text-center">
                    <div className="w-44 h-56 mx-auto rounded-xl overflow-hidden border-2 border-blue-600 shadow-md bg-slate-100">
                      <img
                        src={capturedModalPhoto}
                        alt="Captured portrait"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-blue-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        {isFr ? "Portrait capturé avec succès !" : "Portrait captured successfully!"}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {isFr ? "Vérifiez que le visage est bien éclairé et net." : "Ensure your face is well-lit and clear."}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedModalPhoto(null);
                          startCamera();
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {isFr ? "Reprendre" : "Retake"}
                      </button>
                      <button
                        type="button"
                        onClick={confirmCapturedPhoto}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        {isFr ? "Valider cette photo" : "Confirm This Photo"}
                      </button>
                    </div>
                  </div>
                ) : cameraActive ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto w-full max-w-sm h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-transform ${isCameraMirrored ? "-scale-x-100" : ""}`}
                      />
                      {/* Switch Camera Icon on Top (No Text) */}
                      <button
                        type="button"
                        onClick={() => setIsCameraMirrored((prev) => !prev)}
                        className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-md border border-white/20 active:scale-95"
                        title={isFr ? "Inverser la caméra" : "Switch camera"}
                        aria-label="Switch camera"
                      >
                        <SwitchCamera className="w-4 h-4 text-white" />
                      </button>

                      {/* Portrait guide overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-36 h-48 border-2 border-dashed border-white/70 rounded-full" />
                      </div>
                      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                        <span className="text-[10px] text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full font-medium">
                          {isFr ? "Centrez votre visage dans l'ovale" : "Center your face in the oval"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Capture Photo & Cancel */}
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isFr ? "Prendre la photo" : "Capture Photo"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopCamera();
                          setIsCameraModalOpen(false);
                        }}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {isFr ? "Annuler" : "Cancel"}
                      </button>
                    </div>

                    {/* Important Instructions at the Bottom */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-medium flex-wrap text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        {isFr ? "Retirez les lunettes & couvre-chefs" : "Remove glasses & hats"}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        {isFr ? "Bon éclairage sans reflets" : "Good lighting, no shadows"}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        {isFr ? "Regardez droit, expression neutre" : "Look straight, neutral face"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">
                        {isFr ? "Prise de vue ou sélection de fichier" : "Take photo or upload file"}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        {isFr
                          ? "Utilisez votre caméra en direct ou sélectionnez une photo conforme depuis votre appareil."
                          : "Use your live camera or select an official photo from your device."}
                      </p>
                    </div>

                    {cameraError && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 p-2.5 rounded-lg max-w-sm mx-auto font-medium">
                        {cameraError}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isFr ? "Activer la caméra" : "Start Camera"}</span>
                      </button>

                      <label className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>{isFr ? "Téléverser depuis l'appareil" : "Upload from device"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer language={language} />
    </div>
  );
}
