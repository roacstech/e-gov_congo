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
  Award,
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
  Scale,
  ShieldCheck,
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

const NATIONALITY_JURISDICTIONS = [
  { id: "kinshasa-gombe", labelFr: "Kinshasa - Tribunal de Grande Instance de la Gombe - Palais de Justice", labelEn: "Kinshasa - High Court of Gombe - Palace of Justice" },
  { id: "kinshasa-chancellerie", labelFr: "Kinshasa - Direction de la Chancellerie - Ministère de la Justice", labelEn: "Kinshasa - Chancery Directorate - Ministry of Justice" },
  { id: "kinshasa-matete", labelFr: "Kinshasa - Tribunal de Grande Instance de Matete", labelEn: "Kinshasa - High Court of Matete" },
  { id: "lubumbashi-tgi", labelFr: "Haut-Katanga - Tribunal de Grande Instance de Lubumbashi", labelEn: "Haut-Katanga - High Court of Lubumbashi" },
  { id: "goma-tgi", labelFr: "Nord-Kivu - Tribunal de Grande Instance de Goma", labelEn: "Nord-Kivu - High Court of Goma" },
  { id: "bukavu-tgi", labelFr: "Sud-Kivu - Tribunal de Grande Instance de Bukavu", labelEn: "Sud-Kivu - High Court of Bukavu" },
  { id: "mbuji-mayi-tgi", labelFr: "Kasaï-Oriental - Tribunal de Grande Instance de Mbuji-Mayi", labelEn: "Kasaï-Oriental - High Court of Mbuji-Mayi" },
  { id: "kisangani-tgi", labelFr: "Tshopo - Tribunal de Grande Instance de Kisangani", labelEn: "Tshopo - High Court of Kisangani" },
  { id: "matadi-tgi", labelFr: "Kongo-Central - Tribunal de Grande Instance de Matadi", labelEn: "Kongo-Central - High Court of Matadi" },
  { id: "consulat-etranger", labelFr: "Ambassade / Poste Diplomatique RDC à l'Étranger", labelEn: "Embassy / DRC Diplomatic Mission Abroad" },
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

const SAMPLE_PHOTO_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'><rect width='200' height='260' fill='%23e2e8f0'/><circle cx='100' cy='90' r='45' fill='%2394a3b8'/><path d='M30 230 C30 165 70 150 100 150 C130 150 170 165 170 230 Z' fill='%2394a3b8'/></svg>";

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
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
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

  const selectedParts = value ? value.split("-").map(Number) : null;
  const isCurrentSelection = (day: number) => {
    if (!selectedParts || selectedParts.length !== 3) return false;
    return (
      selectedParts[0] === viewYear &&
      selectedParts[1] === viewMonth + 1 &&
      selectedParts[2] === day
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen && value) {
            const p = value.split("-").map(Number);
            if (p.length === 3 && !isNaN(p[0])) {
              setInternalViewYear(p[0]);
              setInternalViewMonth(p[1] - 1);
            }
          }
          setIsOpen(!isOpen);
        }}
        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium text-slate-900 flex items-center justify-between cursor-pointer shadow-2xs"
      >
        <span className={value ? "text-slate-900 font-semibold" : "text-slate-400"}>
          {value || (isFr ? "JJ/MM/AAAA" : "YYYY-MM-DD")}
        </span>
        <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 sm:w-80 p-3 bg-white border border-slate-200 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-1.5 pb-2.5 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md py-1 px-1.5 cursor-pointer focus:ring-1 focus:ring-blue-500"
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
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md py-1 px-1.5 cursor-pointer focus:ring-1 focus:ring-blue-500"
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
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-2 text-center">
            {(isFr ? DAYS_FR : DAYS_EN).map((d) => (
              <span key={d} className="text-[10px] font-semibold text-slate-400 py-0.5">
                {d}
              </span>
            ))}

            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <span key={`empty-${i}`} className="w-8 h-8" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const selected = isCurrentSelection(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 mx-auto text-xs rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer ${
                    selected
                      ? "bg-blue-600 text-white font-bold shadow-2xs"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
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

function NationalityCertificateContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // Stepper State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields - Step 1: Civil Identity & Lineage
  const [surname, setSurname] = useState("");
  const [postName, setPostName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("République Démocratique du Congo");
  const [maritalStatus, setMaritalStatus] = useState("Marié");
  const [occupation, setOccupation] = useState("");

  // Lineage - Father (Full Name, Nationality, National ID / NIN)
  const [fatherFullName, setFatherFullName] = useState("");
  const [fatherNationality, setFatherNationality] = useState("Congolaise");
  const [fatherIdNumber, setFatherIdNumber] = useState("");
  const [fatherCommunity, setFatherCommunity] = useState("");
  const [fatherOrigin, setFatherOrigin] = useState("");

  // Lineage - Mother (Full Name, Nationality, National ID / NIN)
  const [motherFullName, setMotherFullName] = useState("");
  const [motherNationality, setMotherNationality] = useState("Congolaise");
  const [motherIdNumber, setMotherIdNumber] = useState("");
  const [motherCommunity, setMotherCommunity] = useState("");
  const [motherOrigin, setMotherOrigin] = useState("");

  // Origin & Residence
  const [originProvince, setOriginProvince] = useState("Kasaï-Oriental");
  const [originTerritory, setOriginTerritory] = useState("");
  const [residenceProvince, setResidenceProvince] = useState("Kinshasa");
  const [residenceCity, setResidenceCity] = useState("Kinshasa - Gombe");
  const [residenceAddress, setResidenceAddress] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");
  const [jurisdiction, setJurisdiction] = useState(NATIONALITY_JURISDICTIONS[0].labelFr);

  // Photo
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);

  // Camera Modal States
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Supporting Documents - Step 2 (Uploaded on Step 2 page)
  const [birthCertDoc, setBirthCertDoc] = useState<string | null>(null);
  const [fatherIdDoc, setFatherIdDoc] = useState<string | null>(null);
  const [motherIdDoc, setMotherIdDoc] = useState<string | null>(null);
  const [residenceDoc, setResidenceDoc] = useState<string | null>(null);
  const [uploadedFilePayloads, setUploadedFilePayloads] = useState<
    Record<string, UploadedFilePayload>
  >({});

  // Step 3 Review & Submission
  const [declarationAgreed, setDeclarationAgreed] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Auto-scroll smoothly to top whenever submittedApp is set (shows tick animation!)
  useEffect(() => {
    if (submittedApp) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submittedApp]);

  // Pre-fill realistic Congolese citizen demo data
  const handleDemoFill = () => {
    setSurname("KABAMBA");
    setPostName("TSHISUNGU");
    setFirstName("Marcel");
    setGender("M");
    setBirthDate("1994-05-18");
    setBirthCity("Mbuji-Mayi");
    setBirthCountry("République Démocratique du Congo");
    setMaritalStatus("Marié");
    setOccupation("Magistrat / Juriste");

    setFatherFullName("KABAMBA KALONJI Sylvestre");
    setFatherNationality("Congolaise");
    setFatherIdNumber("NIN-CD-1965-098234");
    setFatherCommunity("Baluba");
    setFatherOrigin("Miabi");

    setMotherFullName("MUTOMBO MPINGA Christine");
    setMotherNationality("Congolaise");
    setMotherIdNumber("NIN-CD-1970-112349");
    setMotherCommunity("Baluba");
    setMotherOrigin("Tshilenge");

    setOriginProvince("Kasaï-Oriental");
    setOriginTerritory("Miabi");
    setResidenceProvince("Kinshasa");
    setResidenceCity("Kinshasa - Gombe");
    setResidenceAddress("Avenue des Aviateurs n° 45, Quartier Golf");
    setPhone("+243 81 928 3746");
    setEmail("marcel.kabamba@justice.gouv.cd");
    setJurisdiction("Kinshasa - Tribunal de Grande Instance de la Gombe - Palais de Justice");

    setPhotoDataUrl(SAMPLE_PHOTO_SVG);
    setPhotoFileName("photo_officielle_kabamba.jpg");

    setBirthCertDoc("acte_naissance_certifie_kabamba.pdf");
    setFatherIdDoc("cni_pere_kabamba.pdf");
    setMotherIdDoc("cni_mere_mutombo.pdf");
    setResidenceDoc("certificat_residence_gombe.pdf");

    setValidationError(null);
  };

  // Camera Management
  const startCamera = async (deviceId?: string) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevs);
      if (!deviceId && videoDevs.length > 0) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      setCameraError(
        isFr
          ? "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur."
          : "Unable to access camera. Please verify your browser permissions."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const v = videoRef.current;
      const vWidth = v.videoWidth || 640;
      const vHeight = v.videoHeight || 480;
      const srcAspect = vWidth / vHeight;
      const dstAspect = 480 / 600;

      let sx, sy, sWidth, sHeight;
      if (srcAspect > dstAspect) {
        sHeight = vHeight;
        sWidth = vHeight * dstAspect;
        sx = (vWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = vWidth;
        sHeight = vWidth / dstAspect;
        sx = 0;
        sy = (vHeight - sHeight) / 2;
      }

      ctx.drawImage(v, sx, sy, sWidth, sHeight, 0, 0, 480, 600);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPhotoDataUrl(dataUrl);
      setPhotoFileName(`photo_nationalite_${Date.now()}.jpg`);
      stopCamera();
      setIsCameraModalOpen(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoDataUrl(reader.result as string);
        setPhotoFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
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
    if (!surname.trim() || !postName.trim() || !firstName.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner le nom, post-nom et prénom."
          : "Please provide your full surname, post-name, and first name."
      );
      return false;
    }
    if (!birthDate) {
      setValidationError(
        isFr
          ? "Veuillez sélectionner votre date de naissance."
          : "Please select your date of birth."
      );
      return false;
    }
    if (!birthCity.trim()) {
      setValidationError(
        isFr
          ? "Veuillez renseigner votre lieu de naissance."
          : "Please provide your place of birth."
      );
      return false;
    }
    if (!fatherFullName.trim() || !motherFullName.trim()) {
      setValidationError(
        isFr
          ? "La filiation parentale est obligatoire."
          : "Parental lineage is mandatory."
      );
      return false;
    }
    if (!phone.trim() || phone.trim() === "+243" || !email.trim()) {
      setValidationError(
        isFr
          ? "Veuillez fournir un numéro de téléphone et une adresse e-mail valides."
          : "Please provide a valid phone number and email address."
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!photoFileName && !photoDataUrl) {
      setValidationError(
        isFr
          ? "La photographie d'identité officielle est obligatoire."
          : "Official identity photo is mandatory."
      );
      return false;
    }
    if (!birthCertDoc) {
      setValidationError(
        isFr
          ? "L'acte de naissance certifié conforme est obligatoire."
          : "Certified birth certificate is mandatory."
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
          ? "Le certificat de résidence récent est obligatoire."
          : "Recent residence certificate is mandatory."
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
          ? "Veuillez certifier sur l'honneur l'exactitude des renseignements fournis."
          : "Please confirm the declaration on honour to proceed."
      );
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-NAT-${randomSuffix}`;
    const computedName = `${surname.trim()} ${postName.trim()} ${firstName.trim()}`;

    const supportingDocsPayload = [
      { type: "photo_oaci", name: photoFileName || "photo_oaci.jpg" },
      {
        type: "birth_certificate",
        name: birthCertDoc || "acte_naissance.pdf",
        ...(birthCertDoc ? uploadedFilePayloads[birthCertDoc] : {}),
      },
      {
        type: "father_id",
        name: fatherIdDoc || "cni_pere.pdf",
        ...(fatherIdDoc ? uploadedFilePayloads[fatherIdDoc] : {}),
      },
      {
        type: "mother_id",
        name: motherIdDoc || "cni_mere.pdf",
        ...(motherIdDoc ? uploadedFilePayloads[motherIdDoc] : {}),
      },
      {
        type: "residence_certificate",
        name: residenceDoc || "certificat_residence.pdf",
        ...(residenceDoc ? uploadedFilePayloads[residenceDoc] : {}),
      },
    ];

    try {
      const response = await fetch("/api/applications/nationality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: trackingCode,
          serviceId: "certificat-nationalite",
          serviceTitle: isFr
            ? "Certificat de Nationalité Congolaise"
            : "Certificate of Congolese Nationality",
          applicantName: computedName,
          surname: surname.trim(),
          postName: postName.trim(),
          firstName: firstName.trim(),
          gender,
          birthDate,
          birthCity: birthCity.trim(),
          birthCountry: birthCountry.trim(),
          maritalStatus,
          occupation: occupation.trim(),
          fatherFullName: fatherFullName.trim(),
          fatherNationality,
          fatherIdNumber: fatherIdNumber.trim() || "NIN-CD-1965-098234",
          fatherCommunity: fatherCommunity.trim(),
          fatherOrigin: fatherOrigin.trim(),
          motherFullName: motherFullName.trim(),
          motherNationality,
          motherIdNumber: motherIdNumber.trim() || "NIN-CD-1970-112349",
          motherCommunity: motherCommunity.trim(),
          motherOrigin: motherOrigin.trim(),
          originProvince,
          originTerritory: originTerritory.trim(),
          residenceAddress: residenceAddress.trim(),
          residenceCity: residenceCity.trim(),
          phone: phone.trim(),
          email: email.trim(),
          jurisdiction,
          photoUrl: photoDataUrl || SAMPLE_PHOTO_SVG,
          supportingDocuments: supportingDocsPayload,
          declarationAgreed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }

      const newApp: CitizenApplication = {
        trackingId: trackingCode,
        serviceId: "certificat-nationalite",
        serviceTitle: isFr
          ? "Certificat de Nationalité Congolaise"
          : "Certificate of Congolese Nationality",
        applicantName: computedName,
        email: email.trim(),
        phone: phone.trim(),
        city: residenceCity,
        submittedAt: "Aujourd'hui, 2026",
        status: "submitted",
        statusNotesFr:
          "Pré-demande enregistrée. Dossier transmis pour instruction juridique et vérification de la filiation.",
        statusNotesEn:
          "Pre-application registered. File routed for judicial review and lineage verification.",
        collectionPoint: jurisdiction,
      };

      setSubmittedApp(newApp);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      // Fallback local persistence if offline
      const fallbackApp: CitizenApplication = {
        trackingId: trackingCode,
        serviceId: "certificat-nationalite",
        serviceTitle: isFr
          ? "Certificat de Nationalité Congolaise"
          : "Certificate of Congolese Nationality",
        applicantName: computedName,
        email: email.trim(),
        phone: phone.trim(),
        city: residenceCity,
        submittedAt: "Aujourd'hui, 2026",
        status: "submitted",
        statusNotesFr:
          "Pré-demande enregistrée localement. Dossier transmis pour instruction juridique.",
        statusNotesEn:
          "Application registered locally. File routed for legal inquiry.",
        collectionPoint: jurisdiction,
      };
      setSubmittedApp(fallbackApp);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab="services"
        onTabChange={(tab) => router.push(`/?tab=${tab}`)}
        onOpenOfficerPortal={() => router.push("/?officer=true")}
      />

      <main className="flex-1 pt-24 sm:pt-[105px]">
        {/* ========================================================================= */}
        {/* DRC CIVIC HERO BANNER (MATCHES PASSPORT & NATIONAL ID 1:1)               */}
        {/* ========================================================================= */}
        <section
          className="relative bg-cover bg-center border-b border-slate-200/90 py-10 sm:py-14 overflow-hidden no-print"
          style={{ backgroundImage: "url('/national-id-hero-bg.jpg')" }}
        >
          {/* Translucent overlay maintaining crisp daylight contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90 backdrop-blur-[0.5px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2.5">
            {/* Centered Main Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              {isFr ? (
                <>
                  Certificat de{" "}
                  <span className="text-blue-600">Nationalité</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Nationality Certificate</span>
                </>
              )}
            </h1>

            {/* Centered Subtitle */}
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {isFr
                ? "Preuve juridique souveraine établissant la qualité de citoyen congolais d'origine ou acquise conformément à la Loi n° 04/024 du 29 novembre 2004."
                : "Official legal proof certifying Congolese citizenship by origin or acquisition under Law No. 04/024 of November 29, 2004."}
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
                    ? "Formulaire de Demande de Certificat de Nationalité"
                    : "Nationality Certificate Application Form"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {isFr
                    ? "Direction de la Chancellerie et des Cultes • Ministère de la Justice et Garde des Sceaux"
                    : "Chancery Directorate • Ministry of Justice and Keeper of the Seals"}
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
              {/* STEP 1: PERSONAL IDENTITY (CIVIL STATUS, FILIATION, RESIDENCE) */}
              {/* ============================================================== */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* 1.1 Civil Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
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
                          placeholder="Ex: KABAMBA"
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 uppercase font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Post-nom *" : "Post-name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: TSHISUNGU"
                          value={postName}
                          onChange={(e) => setPostName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 uppercase font-medium text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Prénom *" : "First Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Marcel"
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
                        <div className="flex items-center gap-5 pt-2.5">
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              checked={gender === "M"}
                              onChange={() => setGender("M")}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isFr ? "Masculin" : "Male"}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
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
                          placeholder="Ex: Mbuji-Mayi"
                          value={birthCity}
                          onChange={(e) => setBirthCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "État civil *" : "Marital Status *"}
                        </label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium cursor-pointer"
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
                          placeholder="Ex: Magistrat / Juriste"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1.2 Parental Lineage (Father & Mother with National ID / NIN) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {isFr ? "Filiation Parentale & Nationalité des Parents" : "Parental Lineage & Parents' Nationality"}
                      </h2>
                    </div>

                    {/* Father Info Box */}
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
                            placeholder="Ex: KABAMBA KALONJI Sylvestre"
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

                    {/* Mother Info Box */}
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
                            placeholder="Ex: MUTOMBO MPINGA Christine"
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
                  </div>

                  {/* 1.3 Origin & Current Residence */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-slate-900">
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
                          {isFr ? "Territoire / Ville d'origine *" : "Territory / City of Origin *"}
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Miabi"
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
                          {isFr ? "Ville / Commune de résidence *" : "City / District of Residence *"}
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
                        {isFr ? "Adresse résidentielle complète *" : "Full Residential Address *"}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Avenue des Aviateurs n° 45, Quartier Golf"
                        value={residenceAddress}
                        onChange={(e) => setResidenceAddress(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Numéro de téléphone *" : "Phone Number *"}
                        </label>
                        <input
                          type="tel"
                          placeholder="+243 81 000 0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-mono font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Adresse email *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          placeholder="citoyen@justice.gouv.cd"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    {/* Issuing Court / Jurisdiction */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Juridiction / Tribunal de délivrance *" : "Issuing High Court / Jurisdiction *"}
                      </label>
                      <select
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-medium cursor-pointer"
                      >
                        {NATIONALITY_JURISDICTIONS.map((j) => (
                          <option key={j.id} value={isFr ? j.labelFr : j.labelEn}>
                            {isFr ? j.labelFr : j.labelEn}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-500">
                        {isFr
                          ? "Le certificat officiel scellé par le Garde des Sceaux sera instruit et délivré par ce tribunal / greffe."
                          : "The official certificate sealed by the Keeper of the Seals will be examined and issued by this court registry."}
                      </p>
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-4 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNextToStep2}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 2: SUPPORTING LEGAL DOCUMENTS (UPLOADING FORM PAGE)       */}
              {/* ============================================================== */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-slate-100">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                      {isFr
                        ? "Pièces Justificatives Obligatoires • Loi n° 04/024"
                        : "Mandatory Legal Supporting Documents • Law No. 04/024"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {isFr
                        ? "Veuillez fournir les copies numériques lisibles des 5 documents probants ci-dessous. Formats acceptés : PDF, JPG, PNG - max 5 Mo."
                        : "Please provide readable digital copies of the 5 required official documents below. Accepted formats: PDF, JPG, PNG - max 5MB."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Row 1: Official Identity Photo */}
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
                                className="w-5 h-5 object-cover rounded-xs border border-blue-200"
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
                            <span>{isFr ? "Aucune photo" : "No photo chosen"}</span>
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
                              ? isFr ? "Reprendre" : "Retake"
                              : isFr ? "Prendre Photo" : "Take Photo"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Birth Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          2
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Acte de Naissance certifié conforme" : "Certified Birth Certificate"}{" "}
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

                    {/* Row 3: Father's ID Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          3
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

                    {/* Row 4: Mother's ID Document */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          4
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

                    {/* Row 5: Residence Certificate */}
                    <div className="border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-3.5 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 sm:gap-4 shadow-2xs min-h-[66px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-blue-100">
                          5
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {isFr ? "Certificat de Résidence Récent" : "Recent Certificate of Residence"}{" "}
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
                      onClick={handleNextToStep3}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <span>{isFr ? "Étape suivante" : "Next Step"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* STEP 3: REVIEW & SUBMIT (CLEAN FORM STYLE, NO BULKY CARDS)     */}
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
                        : "Carefully verify the information below before final submission to registry."}
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

                  {/* 2. Parents' Lineage & Parents' National ID */}
                  <div className="pb-6 border-b border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {isFr
                        ? "Filiation Parentale & Pièces d'Identité des Parents"
                        : "Parental Lineage & Parents' Identification"}
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
                        <p className="text-xs text-blue-700 font-mono font-medium">
                          NIN: {fatherIdNumber || "NIN-CD-1965-098234"}
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
                        <p className="text-xs text-blue-700 font-mono font-medium">
                          NIN: {motherIdNumber || "NIN-CD-1970-112349"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Origin, Residence & Issuing Court */}
                  <div className="pb-6 border-b border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {isFr
                        ? "Origine, Résidence & Juridiction de Délivrance"
                        : "Origin, Residence & Issuing Jurisdiction"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Origine Territoriale" : "Territorial Origin"}
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {originProvince} — {originTerritory || "Miabi"}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          {phone} • {email}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {isFr ? "Adresse & Juridiction / Tribunal Choisi" : "Address & Judicial High Court"}
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {residenceAddress}, {residenceCity}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 mt-1">
                          {jurisdiction}
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
                          {isFr ? "Photo d'Identité Officielle" : "Official Identity Photo"}
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
                          {isFr ? "Acte de Naissance Légalisé" : "Birth Certificate"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            3
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {fatherIdDoc || "cni_pere.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Carte d'Identité / NIN Père" : "Father's National ID"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            4
                          </span>
                          <span className="font-medium truncate text-slate-800">
                            {motherIdDoc || "cni_mere.pdf"}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-medium shrink-0 ml-3">
                          {isFr ? "Carte d'Identité / NIN Mère" : "Mother's National ID"}
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
                          {isFr ? "Certificat de Résidence Récent" : "Residence Certificate"}
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
                        ? "Je certifie sur l'honneur l'exactitude de toutes les déclarations ci-dessus concernant l'identité civile, la filiation parentale, les numéros d'identité des parents et les pièces jointes. Je confirme la soumission de ma demande de certificat de nationalité."
                        : "I solemnly declare on my honour that all statements above concerning civil identity, parental lineage, parents' identification numbers, and attachments are true and correct. I confirm the submission of my nationality certificate application."}
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
                    ? "Demande de Certificat Enregistrée avec Succès !"
                    : "Nationality Application Successfully Registered!"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                  {isFr
                    ? "Votre pré-demande a été enregistrée au registre judiciaire national. Conservez précieusement votre récépissé officiel."
                    : "Your pre-application has been registered in the national judicial database. Please keep your official receipt."}
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
                      {isFr ? "Certificat de Nationalité Congolaise" : "Nationality Certificate Application"}
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
                    <span className="text-slate-500">{isFr ? "Demandeur :" : "Applicant:"}</span>
                    <span className="font-bold text-slate-900 text-right">{submittedApp.applicantName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Date & Lieu de Naissance :" : "Birth Date & Place:"}</span>
                    <span className="font-medium text-slate-900 text-right">
                      {birthDate} — {birthCity || "Mbuji-Mayi"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Père & N° National ID :" : "Father & National ID:"}</span>
                    <span className="font-medium text-slate-900 text-right">
                      {fatherFullName || "—"} • {fatherIdNumber || "NIN-CD-1965-098234"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Mère & N° National ID :" : "Mother & National ID:"}</span>
                    <span className="font-medium text-slate-900 text-right">
                      {motherFullName || "—"} • {motherIdNumber || "NIN-CD-1970-112349"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{isFr ? "Juridiction / Tribunal :" : "High Court / Registry:"}</span>
                    <span className="font-medium text-blue-700 text-right">{jurisdiction}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{isFr ? "Province d'origine :" : "Province of Origin:"}</span>
                    <span className="font-medium text-slate-900 text-right">{originProvince} — {originTerritory || "Miabi"}</span>
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
                    setPhotoDataUrl(null);
                    setPhotoFileName(null);
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
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isFr ? "Capture Photo Officielle" : "Official Photo Capture"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {isFr ? "Conforme aux normes officielles OACI" : "Official ICAO standard"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsCameraModalOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {cameraError ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
                    <p className="text-xs text-red-700 font-medium">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(selectedDeviceId)}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                    >
                      {isFr ? "Réessayer" : "Retry"}
                    </button>
                  </div>
                ) : (
                  <div className="relative aspect-4/5 max-h-[360px] mx-auto bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-300">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    {/* Face Oval Guide */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                    </div>
                  </div>
                )}

                {devices.length > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <SwitchCamera className="w-4 h-4 text-slate-400" />
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => {
                        setSelectedDeviceId(e.target.value);
                        startCamera(e.target.value);
                      }}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700"
                    >
                      {devices.map((d, idx) => (
                        <option key={d.deviceId || idx} value={d.deviceId}>
                          {d.label || `Caméra ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={!isCameraActive}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
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
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    {isFr ? "Annuler" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer language={language} />
    </div>
  );
}

export default function NationalityCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <NationalityCertificateContent />
    </Suspense>
  );
}
