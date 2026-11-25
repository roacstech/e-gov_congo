"use client";

import React, { useState } from "react";
import {
  ApplicationWorkflowData,
  CitizenApplication,
  Language,
  OfficerApplicationRecord,
} from "@/types";
import { getLocalizedServiceTitle } from "@/data/services";
import { downloadOfficialCardOrDocumentPng } from "@/lib/id-card-export";
import {
  CheckCircle2,
  Download,
  FileText,
  Printer,
  QrCode,
  Award,
} from "lucide-react";

type ViewableApplication = OfficerApplicationRecord | CitizenApplication;

interface SignedDocumentAndIdProofViewerProps {
  application: ViewableApplication;
  language: Language;
  defaultMode?: "both" | "document" | "id_proof";
  showPrintButton?: boolean;
}

function isFullRecord(app: ViewableApplication): app is OfficerApplicationRecord {
  return "tableName" in app;
}

/** Deterministic dense 2D QR verification matrix SVG */
const RealisticQrMatrix: React.FC<{ seed: string; size?: number }> = ({
  seed,
  size = 46,
}) => {
  const grid = 15;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinder = (r: number, c: number) =>
    (r < 5 && c < 5) ||
    (r < 5 && c >= grid - 5) ||
    (r >= grid - 5 && c < 5);

  const cells: boolean[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (isFinder(r, c)) {
        const lr = r >= grid - 5 ? r - (grid - 5) : r;
        const lc = c >= grid - 5 ? c - (grid - 5) : c;
        cells.push(
          lr === 0 ||
            lr === 4 ||
            lc === 0 ||
            lc === 4 ||
            (lr === 2 && lc === 2)
        );
      } else {
        hash ^= (r * 31 + c * 17) & 0xff;
        hash = Math.imul(hash, 16777619);
        cells.push((hash >>> 24) % 2 === 0);
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      className="bg-white p-0.5"
      aria-label="Verification QR"
    >
      {cells.map((filled, idx) =>
        filled ? (
          <rect
            key={idx}
            x={idx % grid}
            y={Math.floor(idx / grid)}
            width="1"
            height="1"
            fill="#0f172a"
          />
        ) : null
      )}
    </svg>
  );
};

/** Deterministic 1D linear barcode SVG for back of PVC ID card */
const LinearBarcodeStrip: React.FC<{ seed: string }> = ({ seed }) => {
  const bars: { x: number; w: number }[] = [];
  let x = 2;
  let h = 1315423911;
  for (let i = 0; i < seed.length; i++) {
    h ^= (h << 5) + seed.charCodeAt(i) + (h >> 2);
  }
  while (x < 138) {
    h = Math.imul(h ^ (x * 13), 2654435761);
    const w = ((h >>> 0) % 3) + 1;
    const gap = ((h >>> 4) % 2) + 1.2;
    bars.push({ x, w });
    x += w + gap;
  }
  return (
    <svg
      width="124"
      height="18"
      viewBox="0 0 140 20"
      aria-hidden="true"
      className="opacity-85"
    >
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={1} width={b.w} height={18} fill="#0f172a" />
      ))}
    </svg>
  );
};

const DrcOfficialSeal: React.FC<{
  docNumber: string;
  approvedDate?: string | null;
  isApproved: boolean;
  size?: number;
}> = ({ docNumber, approvedDate, isApproved, size = 92 }) => {
  if (!isApproved) return null;
  return (
    <div
      aria-label="Official Republic Seal"
      className="pointer-events-none select-none opacity-80 -rotate-12 shrink-0"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="text-[#1e3a8a]"
      >
        <defs>
          <path
            id="sealTopArc"
            d="M 18,60 A 42,42 0 1,1 102,60"
            fill="none"
          />
          <path
            id="sealBottomArc"
            d="M 104,64 A 44,44 0 1,1 16,64"
            fill="none"
          />
        </defs>
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeDasharray="2 1.5"
        />
        <circle
          cx="60"
          cy="60"
          r="33"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <text
          fill="currentColor"
          fontSize="6.6"
          fontWeight="700"
          letterSpacing="1.3"
        >
          <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
            RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
          </textPath>
        </text>
        <text
          fill="currentColor"
          fontSize="6.4"
          fontWeight="700"
          letterSpacing="1.2"
        >
          <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
            ★ SCEAU OFFICIEL ★ APPROUVÉ
          </textPath>
        </text>
        <text
          x="60"
          y="53"
          textAnchor="middle"
          fill="currentColor"
          fontSize="8"
          fontWeight="800"
          letterSpacing="0.8"
        >
          R.D.C.
        </text>
        <line
          x1="34"
          y1="57"
          x2="86"
          y2="57"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fill="currentColor"
          fontSize="5.4"
          fontWeight="700"
          fontFamily="monospace"
        >
          {docNumber.slice(0, 16)}
        </text>
        {approvedDate && (
          <text
            x="60"
            y="74"
            textAnchor="middle"
            fill="currentColor"
            fontSize="5.2"
            fontWeight="600"
          >
            {approvedDate}
          </text>
        )}
      </svg>
    </div>
  );
};

/** Fine wavy security guilloché + rosette pattern across full PVC surface */
const PvcSecuritySubstrate: React.FC = () => (
  <>
    <svg
      className="pointer-events-none select-none absolute inset-0 w-full h-full opacity-[0.18]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="pvc-guilloche"
          width="72"
          height="36"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 18 Q 18 3, 36 18 T 72 18"
            fill="none"
            stroke="#0284c7"
            strokeWidth="0.65"
          />
          <path
            d="M0 26 Q 18 11, 36 26 T 72 26"
            fill="none"
            stroke="#0369a1"
            strokeWidth="0.45"
          />
          <path
            d="M0 10 Q 18 25, 36 10 T 72 10"
            fill="none"
            stroke="#d97706"
            strokeWidth="0.35"
          />
          <circle
            cx="36"
            cy="18"
            r="14"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.25"
            strokeDasharray="1.5 1.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pvc-guilloche)" />
    </svg>
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 bg-linear-120 from-transparent via-white/35 to-transparent opacity-65"
    />
  </>
);

/** Realistic neutral studio passport silhouette when no binary photo is uploaded */
const PassportSilhouettePortrait: React.FC = () => (
  <svg
    viewBox="0 0 80 100"
    className="w-full h-full bg-linear-to-b from-sky-100 to-slate-200"
    aria-label="Biometric Portrait"
  >
    <circle cx="40" cy="36" r="16" fill="#94a3b8" />
    <path d="M14 96 C14 68 66 68 66 96 Z" fill="#64748b" />
    <path
      d="M27 56 L40 65 L53 56"
      fill="none"
      stroke="#e2e8f0"
      strokeWidth="2.5"
    />
  </svg>
);

function getServiceAttestationText(serviceId: string, isFr: boolean): string {
  switch (serviceId) {
    case "permis-travail-etranger":
      return isFr
        ? "Le Ministère de l'Emploi, Travail et Prévoyance Sociale autorise le travailleur étranger désigné ci-dessous à exercer l'activité professionnelle mentionnée sur le territoire de la République Démocratique du Congo."
        : "The Ministry of Employment, Labor and Social Security authorizes the foreign national identified below to engage in the employment specified within the Democratic Republic of the Congo.";
    case "passeport-ordinaire":
    case "passport":
      return isFr
        ? "Le Ministère des Affaires Étrangères certifie la délivrance du passeport biométrique de la République Démocratique du Congo au titulaire ci-dessous."
        : "The Ministry of Foreign Affairs certifies the issuance of the Biometric Passport of the Democratic Republic of the Congo to the holder below.";
    case "certificat-nationalite":
      return isFr
        ? "Le Ministère de la Justice atteste solennellement que l'intéressé(e) possède la nationalité congolaise conformément à la législation en vigueur."
        : "The Ministry of Justice certifies that the person named below holds Congolese nationality in accordance with the law in force.";
    case "acte-naissance":
      return isFr
        ? "L'Officier de l'État Civil certifie que l'acte de naissance suivant a été régulièrement inscrit aux registres de l'État Civil."
        : "The Civil Registrar certifies that the following birth record has been duly entered in the official Civil Registry.";
    case "acte-mariage":
      return isFr
        ? "L'Officier de l'État Civil certifie l'enregistrement officiel de l'union matrimoniale des époux désignés ci-dessous."
        : "The Civil Registrar certifies the official registration of marriage between the spouses identified below.";
    case "acte-deces":
      return isFr
        ? "L'Officier de l'État Civil certifie l'enregistrement officiel du décès et l'établissement du présent certificat."
        : "The Civil Registrar certifies the official registration of death and issuance of this certificate.";
    case "permis-conduire":
      return isFr
        ? "Le Ministère des Transports et la Commission Nationale de Prévention Routière autorisent le conducteur identifié ci-dessous à conduire les catégories mentionnées."
        : "The Ministry of Transport and CNPR authorize the driver identified below to operate vehicles of the listed license category.";
    case "certificat-residence":
      return isFr
        ? "L'Autorité Communale atteste que le citoyen identifié ci-dessous réside effectivement à l'adresse mentionnée dans la juridiction."
        : "The Municipal Authority certifies that the resident identified below officially resides at the stated address.";
    default:
      return isFr
        ? "L'autorité compétente de la République Démocratique du Congo certifie et délivre le présent document officiel."
        : "The competent authority of the Democratic Republic of the Congo certifies and issues this official document.";
  }
}

const DETAIL_LABEL_MAP: Record<string, { fr: string; en: string }> = {
  "Passport & Visa": { fr: "Passeport & Visa", en: "Passport & Visa" },
  Employer: { fr: "Employeur", en: "Employer" },
  "Job / Sector": { fr: "Poste / Secteur", en: "Job / Sector" },
  "License Category": { fr: "Catégorie de Permis", en: "License Category" },
  "ID / NIN": { fr: "Pièce d'Identité / NIN", en: "ID / NIN" },
  Groom: { fr: "Époux", en: "Groom" },
  Bride: { fr: "Épouse", en: "Bride" },
  "Marriage Date & Regime": { fr: "Date & Régime Matrimonial", en: "Marriage Date & Regime" },
  "Death Date & Place": { fr: "Date & Lieu du Décès", en: "Death Date & Place" },
  "Hospital / Doctor": { fr: "Hôpital / Médecin", en: "Hospital / Doctor" },
  Declarant: { fr: "Déclarant", en: "Declarant" },
  "Father Name & ID": { fr: "Nom du Père & N° ID", en: "Father Name & ID" },
  "Father Details": { fr: "Nationalité & Profession (Père)", en: "Father Nationality & Occupation" },
  "Mother Name & ID": { fr: "Nom de la Mère & N° ID", en: "Mother Name & ID" },
  "Mother Details": { fr: "Nationalité & Profession (Mère)", en: "Mother Nationality & Occupation" },
  "Birth Time": { fr: "Heure de Naissance", en: "Birth Time" },
  "Quarter Chief / Utility": { fr: "Chef de Quartier / Compteur", en: "Quarter Chief / Utility" },
  Address: { fr: "Adresse", en: "Address" },
  "Province / Origin": { fr: "Province / Origine", en: "Province / Origin" },
  "Birth Date": { fr: "Date de Naissance", en: "Birth Date" },
  "Birth Place": { fr: "Lieu de Naissance", en: "Birth Place" },
  Nationality: { fr: "Nationalité", en: "Nationality" },
  Gender: { fr: "Sexe", en: "Gender" },
  "Marital Status": { fr: "État Civil", en: "Marital Status" },
  Occupation: { fr: "Profession", en: "Occupation" },
  Phone: { fr: "Téléphone", en: "Phone" },
  Email: { fr: "Courriel", en: "Email" },
};

function getLocalizedDetailLabel(key: string, isFr: boolean): string {
  const entry = DETAIL_LABEL_MAP[key];
  if (entry) return isFr ? entry.fr : entry.en;
  return key;
}

function getLocalizedDetailValue(key: string, rawVal: string, isFr: boolean): string {
  const trimmed = rawVal.trim();
  if (key === "Nationality") {
    if (/^congolais(e)?$/i.test(trimmed) || /^congolese$/i.test(trimmed)) {
      return isFr ? "Congolaise" : "Congolese";
    }
  }
  if (key === "Marital Status") {
    if (/^mari[ée](\(e\))?$/i.test(trimmed) || /^married$/i.test(trimmed)) {
      return isFr ? "Marié(e)" : "Married";
    }
    if (/^c[ée]libataire$/i.test(trimmed) || /^single$/i.test(trimmed)) {
      return isFr ? "Célibataire" : "Single";
    }
    if (/^divorc[ée](\(e\))?$/i.test(trimmed) || /^divorced$/i.test(trimmed)) {
      return isFr ? "Divorcé(e)" : "Divorced";
    }
    if (/^veuf(\/veuve)?$|^veuve$/i.test(trimmed) || /^widowed$/i.test(trimmed)) {
      return isFr ? "Veuf / Veuve" : "Widowed";
    }
  }
  if (key === "Gender") {
    if (/^(m|masculin|homme|male)$/i.test(trimmed)) {
      return isFr ? "Masculin (M)" : "Male (M)";
    }
    if (/^(f|f[ée]minin|femme|female)$/i.test(trimmed)) {
      return isFr ? "Féminin (F)" : "Female (F)";
    }
  }
  return trimmed;
}

export const SignedDocumentAndIdProofViewer: React.FC<
  SignedDocumentAndIdProofViewerProps
> = ({ application, language, defaultMode = "both", showPrintButton = true }) => {
  const isFr = language === "fr";
  const [viewMode, setViewMode] = useState<
    "both" | "document" | "id_proof" | "cover"
  >(defaultMode);
  const [downloading, setDownloading] = useState(false);

  const isNationalId =
    application.serviceId === "cni-biometrique" ||
    application.serviceId === "cni" ||
    (isFullRecord(application) &&
      application.tableName === "national_id_applications");

  const isPassport =
    application.serviceId === "passeport-ordinaire" ||
    application.serviceId === "passport" ||
    (isFullRecord(application) &&
      application.tableName === "passport_applications");

  const isBirthCertificate =
    application.serviceId === "acte-naissance" ||
    application.serviceId === "birth-certificate" ||
    (isFullRecord(application) &&
      application.tableName === "birth_applications");

  const isMarriageCertificate =
    application.serviceId === "acte-mariage" ||
    application.serviceId === "marriage-certificate" ||
    (isFullRecord(application) &&
      application.tableName === "marriage_applications");

  const isDeathCertificate =
    application.serviceId === "acte-deces" ||
    application.serviceId === "death-certificate" ||
    (isFullRecord(application) &&
      application.tableName === "death_applications");

  const localizedServiceTitle = getLocalizedServiceTitle(
    application.serviceId,
    application.serviceTitle,
    language
  );

  const wf: ApplicationWorkflowData = application.workflow || {
    workflowStage: application.status,
    docsVerified: application.status !== "submitted",
    idProofVerified: application.status !== "submitted",
    verificationChecklist: {},
    approverCheckedDocs:
      application.status === "approved" || application.status === "ready",
    approverCheckedIdProof:
      application.status === "approved" || application.status === "ready",
    issuedDocumentNumber: application.issuedNumber || null,
  };

  const issuedNumber =
    wf.issuedDocumentNumber ||
    application.issuedNumber ||
    (application.status === "approved" || application.status === "ready"
      ? `CD-${application.trackingId.slice(-8)}`
      : null);

  const photoUrl = application.photoUrl || null;
  const idProofSummary = application.idProofSummary || {
    labelFr: "Carte Nationale d'Identité",
    labelEn: "National Identity Card",
    primaryIdNumber: issuedNumber || application.trackingId,
    secondaryIdNumber: null,
    holderName: application.applicantName,
    birthDate: null,
    birthPlace: application.city,
    nationality: "Congolaise",
    address: application.collectionPoint || application.city,
  };

  const detailsMap = isFullRecord(application) ? application.details : {};
  const ministryName = isFullRecord(application)
    ? isFr
      ? application.ministryFr
      : application.ministryEn
    : isFr
    ? "Services Publics de la République"
    : "Public Administration of the Republic";

  // Put service-specific critical fields FIRST and keep all populated fields (never cut off Employer/Visa/Parents/etc.)
  const priorityOrder = [
    "Passport & Visa",
    "Employer",
    "Job / Sector",
    "License Category",
    "ID / NIN",
    "Groom",
    "Bride",
    "Marriage Date & Regime",
    "Death Date & Place",
    "Hospital / Doctor",
    "Declarant",
    "Father Name & ID",
    "Mother Name & ID",
    "Quarter Chief / Utility",
    "Address",
    "Province / Origin",
    "Birth Date",
    "Birth Place",
    "Nationality",
    "Gender",
    "Marital Status",
    "Occupation",
    "Phone",
    "Email",
  ];

  const allDocDetailEntries = Object.entries(detailsMap)
    .filter(
      ([k, val]) =>
        Boolean(val) &&
        k !== "Service" &&
        k !== "Citizen Name" &&
        k !== "Collection Hub"
    )
    .sort(([a], [b]) => {
      const ia = priorityOrder.indexOf(a);
      const ib = priorityOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

  const hasVerificationSig = Boolean(wf.verificationSignature);
  const hasApproverSig = Boolean(wf.approverSignature);
  const bothSigned = hasVerificationSig && hasApproverSig;

  const formatShortDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(isFr ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const sealDate = formatShortDate(wf.approvedAt) || application.submittedAt;
  const expiryDate = (() => {
    const d = wf.approvedAt ? new Date(wf.approvedAt) : new Date();
    const yr = isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
    return `25 NOV ${yr + 10}`;
  })();
  const passportExpiryObj = (() => {
    const raw = wf.approvedAt ? new Date(wf.approvedAt) : new Date();
    const d = isNaN(raw.getTime()) ? new Date() : new Date(raw.getTime());
    d.setFullYear(d.getFullYear() + 5);
    return d;
  })();
  const passportExpiryDate = passportExpiryObj
    .toLocaleDateString(isFr ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  const mrzClean = (val: string) =>
    val
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "<");
  const mrzDoc = mrzClean(issuedNumber || application.trackingId).slice(0, 15);
  const mrzHolder = mrzClean(idProofSummary.holderName).slice(0, 28);
  const mrzDob = (idProofSummary.birthDate || "900101")
    .replace(/[^0-9]/g, "")
    .slice(2, 8)
    .padEnd(6, "0");

  const holderNameParts = idProofSummary.holderName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const passportSurname = (
    holderNameParts[0] || idProofSummary.holderName
  ).toUpperCase();
  const passportGivenNames = (
    holderNameParts.length > 1 ? holderNameParts.slice(1).join(" ") : "—"
  ).toUpperCase();
  const passportSexCode = String(detailsMap["Gender"] || "M")
    .trim()
    .toUpperCase()
    .startsWith("F")
    ? "F"
    : "M";
  const passportNationality = /congol/i.test(
    String(idProofSummary.nationality || "Congolaise")
  )
    ? "CONGOLAISE / CONGOLESE"
    : String(idProofSummary.nationality || "CONGOLAISE / CONGOLESE").toUpperCase();
  const passportExpMrz = `${String(passportExpiryObj.getFullYear()).slice(-2)}${String(
    passportExpiryObj.getMonth() + 1
  ).padStart(2, "0")}${String(passportExpiryObj.getDate()).padStart(2, "0")}`;
  const passportMrzLine1 = `P<COD${mrzClean(passportSurname)}<<${mrzClean(
    passportGivenNames
  )}`
    .padEnd(44, "<")
    .slice(0, 44);
  const passportMrzLine2 = `${mrzClean(issuedNumber || application.trackingId)
    .slice(0, 9)
    .padEnd(9, "<")}0COD${mrzDob}0${passportSexCode}${passportExpMrz}<<<<<<<<<<<<<<<`.slice(
    0,
    44
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadOfficialCardOrDocumentPng(application, language);
    } finally {
      setDownloading(false);
    }
  };

  const renderDocSignatures = () => (
    <div className="pt-4 border-t border-gray-300 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-300 bg-white/95 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-gray-600 mb-1">
            <span>{isFr ? "Vérification" : "Verification"}</span>
            {hasVerificationSig && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className="h-14 bg-white border border-gray-200 flex items-center justify-center px-2 overflow-hidden">
            {wf.verificationSignature ? (
              <img
                src={wf.verificationSignature}
                alt="Verification Signature"
                className="max-h-12 object-contain"
              />
            ) : (
              <span className="text-[10px] text-gray-400">
                {isFr ? "En attente" : "Pending"}
              </span>
            )}
          </div>
          <div className="mt-1 text-[10px] text-gray-800 font-semibold truncate">
            {wf.verificationOfficerName || "—"}
          </div>
          {wf.verifiedAt && (
            <div className="text-[9px] text-gray-500">
              {formatShortDate(wf.verifiedAt)}
            </div>
          )}
        </div>

        <div className="border border-gray-300 bg-white/95 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-gray-600 mb-1">
            <span>{isFr ? "Approbation" : "Approver"}</span>
            {hasApproverSig && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
            )}
          </div>
          <div className="h-14 bg-white border border-gray-200 flex items-center justify-center px-2 overflow-hidden">
            {wf.approverSignature ? (
              <img
                src={wf.approverSignature}
                alt="Approver Signature"
                className="max-h-12 object-contain"
              />
            ) : (
              <span className="text-[10px] text-gray-400">
                {isFr ? "En attente" : "Pending"}
              </span>
            )}
          </div>
          <div className="mt-1 text-[10px] text-gray-800 font-semibold truncate">
            {wf.approverOfficerName || "—"}
          </div>
          {wf.approvedAt && (
            <div className="text-[9px] text-gray-500">
              {formatShortDate(wf.approvedAt)}
            </div>
          )}
        </div>
      </div>

      {(wf.headSignature || application.status === "ready") && (
        <div className="border border-gray-300 bg-white/95 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Award className="w-4 h-4 text-[#0f295c] shrink-0" />
            <div className="min-w-0 text-[10px]">
              <span className="font-bold uppercase text-gray-900">
                {isFr ? "Chef de Service : " : "Head of Service: "}
              </span>
              <span className="text-gray-600 truncate">
                {wf.headOfficerName || "—"}
              </span>
            </div>
          </div>
          {wf.headSignature && (
            <img
              src={wf.headSignature}
              alt="Head Signature"
              className="h-8 bg-white px-2 border border-gray-300 object-contain shrink-0"
            />
          )}
        </div>
      )}
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* NATIONAL IDENTITY CARD ONLY: 2-SIDED POLYCARBONATE PVC SMART CARD      */
  /* ---------------------------------------------------------------------- */
  const renderFrontIdCard = () => (
    <div className="print-clean-page print-id-card w-full max-w-[388px] aspect-[1.586/1] rounded-xl relative bg-linear-to-br from-[#dff0ff] via-[#f5f9ff] to-[#fef3c7]/65 border border-slate-400/75 shadow-[0_10px_24px_-6px_rgba(15,23,42,0.26),0_2px_6px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-white/90 overflow-hidden flex flex-col justify-between p-3.5">
      <PvcSecuritySubstrate />

      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-[56%] top-[54%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 object-contain opacity-[0.09]"
      />

      <div className="relative z-10 flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Emblème RDC"
          className="w-8 h-8 object-contain shrink-0"
        />
        <div className="min-w-0 leading-tight">
          <div className="text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-[#0c3b7a] truncate">
            République Démocratique du Congo
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-6 h-[2.5px] flex shrink-0">
              <span className="flex-1 bg-[#007fff]" />
              <span className="w-2 bg-[#fcd116]" />
              <span className="w-1.5 bg-[#ce1126]" />
            </div>
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-900 truncate">
              {isFr ? "Carte Nationale d'Identité" : "National Identity Card"}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-3 items-start my-auto pt-1.5">
        <div className="relative flex flex-col items-start gap-1.5 shrink-0">
          <div className="w-[74px] h-[94px] rounded-md overflow-hidden border border-sky-900/25 shadow-2xs relative bg-slate-100">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={application.applicantName}
                className="w-full h-full object-cover"
              />
            ) : (
              <PassportSilhouettePortrait />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -bottom-2 w-7 h-7 rounded-full bg-linear-to-tr from-sky-300/65 via-amber-200/70 to-rose-300/55 border border-white/70 opacity-75"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <svg width="28" height="20" viewBox="0 0 38 28" aria-hidden="true">
              <defs>
                <linearGradient id="goldPvcChip" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="45%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
              </defs>
              <rect
                x="1"
                y="1"
                width="36"
                height="26"
                rx="4"
                fill="url(#goldPvcChip)"
                stroke="#854d0e"
                strokeWidth="0.9"
              />
              <line x1="13" y1="1" x2="13" y2="27" stroke="#854d0e" strokeWidth="0.85" />
              <line x1="25" y1="1" x2="25" y2="27" stroke="#854d0e" strokeWidth="0.85" />
              <line x1="1" y1="10" x2="13" y2="10" stroke="#854d0e" strokeWidth="0.85" />
              <line x1="25" y1="10" x2="37" y2="10" stroke="#854d0e" strokeWidth="0.85" />
              <line x1="1" y1="18" x2="13" y2="18" stroke="#854d0e" strokeWidth="0.85" />
              <line x1="25" y1="18" x2="37" y2="18" stroke="#854d0e" strokeWidth="0.85" />
              <rect
                x="13"
                y="8"
                width="12"
                height="12"
                rx="2"
                fill="none"
                stroke="#854d0e"
                strokeWidth="0.85"
              />
            </svg>
            <span className="font-mono text-[6.5px] font-bold text-sky-900/65 uppercase">
              BIOMÉTRIE
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 leading-tight pt-0.5">
          <div>
            <div className="text-[6.5px] font-bold uppercase tracking-wider text-sky-900/65">
              {isFr ? "N° Identification Nationale" : "National ID Number"}
            </div>
            <div className="font-mono text-[11.5px] font-extrabold text-[#0c3b7a] tracking-wide">
              {issuedNumber || idProofSummary.primaryIdNumber}
            </div>
          </div>

          <div>
            <div className="text-[6.5px] font-bold uppercase tracking-wider text-sky-900/65">
              {isFr ? "Nom • Postnom • Prénom" : "Surname & Given Names"}
            </div>
            <div className="text-[11px] font-extrabold uppercase text-slate-900 truncate">
              {idProofSummary.holderName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="min-w-0">
              <div className="text-[6.5px] font-bold uppercase tracking-wider text-sky-900/65">
                {isFr ? "Naissance" : "Birth Date / Place"}
              </div>
              <div className="text-[9px] font-bold uppercase text-slate-800 truncate">
                {[
                  idProofSummary.birthDate,
                  idProofSummary.birthPlace || application.city,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[6.5px] font-bold uppercase tracking-wider text-sky-900/65">
                {isFr ? "Sexe / Nat." : "Sex / Nat."}
              </div>
              <div className="text-[9px] font-bold uppercase text-slate-800 truncate">
                {detailsMap["Gender"] || "M"} &bull;{" "}
                {idProofSummary.nationality || "Congolaise"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="min-w-0">
              <div className="text-[6.5px] font-bold uppercase tracking-wider text-sky-900/65">
                {isFr ? "Délivrée le" : "Issued"}
              </div>
              <div className="text-[8.5px] font-semibold uppercase text-slate-800 truncate">
                {sealDate} &bull; {application.city}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[6.5px] font-bold uppercase tracking-wider text-sky-900/65">
                {isFr ? "Validité" : "Expires"}
              </div>
              <div className="text-[8.5px] font-bold uppercase text-slate-800">
                {expiryDate}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none select-none absolute right-0.5 bottom-0 w-7 h-9 overflow-hidden opacity-25 grayscale contrast-125">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
          ) : (
            <PassportSilhouettePortrait />
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[7px] font-bold uppercase tracking-[0.14em] text-[#0c3b7a]/75">
        <span>Justice &bull; Paix &bull; Travail</span>
        <span className="font-mono text-slate-600">
          {issuedNumber || idProofSummary.primaryIdNumber}
        </span>
      </div>
    </div>
  );

  const backDetailRows: [string, string][] = [
    [
      isFr ? "ADRESSE" : "ADDRESS",
      String(detailsMap["Address"] || idProofSummary.address || application.city),
    ] as [string, string],
    ...(detailsMap["Province / Origin"]
      ? [
          [
            isFr ? "ORIGINE" : "ORIGIN",
            String(detailsMap["Province / Origin"]),
          ] as [string, string],
        ]
      : []),
    ...(detailsMap["Father Name & ID"] || detailsMap["Mother Name & ID"]
      ? [
          [
            isFr ? "FILIATION" : "PARENTS",
            [detailsMap["Father Name & ID"], detailsMap["Mother Name & ID"]]
              .filter(Boolean)
              .join(" / "),
          ] as [string, string],
        ]
      : []),
    [
      isFr ? "AUTORITÉ" : "AUTHORITY",
      String(application.collectionPoint || application.city),
    ] as [string, string],
  ].slice(0, 4);

  const renderBackIdCard = () => (
    <div className="print-clean-page print-id-card w-full max-w-[388px] aspect-[1.586/1] rounded-xl relative bg-linear-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e0f2fe]/65 border border-slate-400/75 shadow-[0_10px_24px_-6px_rgba(15,23,42,0.26),0_2px_6px_rgba(15,23,42,0.10)] ring-1 ring-inset ring-white/90 overflow-hidden flex flex-col justify-between">
      <PvcSecuritySubstrate />

      <div className="relative z-10">
        <div className="mt-2.5 h-6 w-full bg-linear-to-b from-[#1f2937] via-[#030712] to-[#111827] shadow-inner" />

        <div className="px-3.5 pt-2 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-0.5 leading-tight">
            {backDetailRows.map(([label, val]) => (
              <div key={label} className="text-[8px] line-clamp-1">
                <span className="font-bold uppercase tracking-wider text-sky-900/70 mr-1">
                  {label}:
                </span>
                <span className="font-bold uppercase text-slate-900">
                  {val}
                </span>
              </div>
            ))}
            <div className="pt-0.5">
              <LinearBarcodeStrip
                seed={`${issuedNumber || application.trackingId}${application.applicantName}`}
              />
            </div>
          </div>

          <div className="border border-slate-300 bg-white p-0.5 shrink-0 shadow-2xs">
            <RealisticQrMatrix
              seed={`${issuedNumber || application.trackingId}|${application.applicantName}`}
              size={44}
            />
          </div>
        </div>

        <div className="mx-3.5 mt-1.5 px-2 py-1 bg-[#fffef7]/95 border border-slate-300/80 relative">
          <div className="grid grid-cols-2 gap-2 items-end">
            <div className="min-w-0">
              <div className="h-6 flex items-center justify-start overflow-hidden">
                {wf.verificationSignature ? (
                  <img
                    src={wf.verificationSignature}
                    alt="Verification Signature"
                    className="max-h-6 object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="text-[6.5px] text-slate-400 italic">
                    {isFr ? "Non signé" : "Unsigned"}
                  </span>
                )}
              </div>
              <div className="border-t border-slate-300 pt-0.5 text-[6.5px] font-semibold text-slate-700 truncate">
                {isFr ? "Vérif." : "Verifier"}:{" "}
                {wf.verificationOfficerName || "—"}
              </div>
            </div>

            <div className="min-w-0">
              <div className="h-6 flex items-center justify-start overflow-hidden">
                {wf.approverSignature ? (
                  <img
                    src={wf.approverSignature}
                    alt="Approver Signature"
                    className="max-h-6 object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="text-[6.5px] text-slate-400 italic">
                    {isFr ? "En attente" : "Pending"}
                  </span>
                )}
              </div>
              <div className="border-t border-slate-300 pt-0.5 text-[6.5px] font-semibold text-slate-700 truncate">
                {isFr ? "Approb." : "Approver"}:{" "}
                {wf.approverOfficerName || "—"}
              </div>
            </div>
          </div>

          {bothSigned && (
            <div className="pointer-events-none absolute -right-1.5 -top-5">
              <DrcOfficialSeal
                docNumber={issuedNumber || application.trackingId}
                approvedDate={sealDate}
                isApproved={bothSigned}
                size={54}
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 px-3.5 pb-2 pt-1 font-mono text-[8px] font-semibold tracking-[0.15em] text-slate-800 leading-[1.28]">
        <div className="truncate">
          {`IDCOD${mrzDoc}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 30)}
        </div>
        <div className="truncate">
          {`${mrzDob}M${expiryDate.slice(-2)}1231COD<<<<<<<<<<<<<<<<<<<<`.slice(0, 30)}
        </div>
        <div className="truncate">
          {`${mrzHolder}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 30)}
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* BIOMETRIC PASSPORT: REALISTIC ICAO TD3 BOOKLET + BILINGUAL FR/EN       */
  /* ---------------------------------------------------------------------- */
  const renderPassportBioDataPage = () => (
    <div className="print-clean-page print-passport-page w-full max-w-[438px] aspect-[1.42/1] rounded-xl relative bg-linear-to-br from-[#ecf5ff] via-[#fefdf8] to-[#ecfdf5]/75 border border-[#0f295c]/45 shadow-[0_12px_28px_-6px_rgba(15,41,92,0.26),0_2px_6px_rgba(15,23,42,0.08)] ring-1 ring-inset ring-white/90 overflow-hidden flex flex-col justify-between">
      <PvcSecuritySubstrate />

      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-[58%] top-[52%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 object-contain opacity-[0.08]"
      />

      {/* Top DRC tricolor hairline */}
      <div className="relative z-10 h-[3px] w-full flex shrink-0">
        <span className="flex-1 bg-[#007fff]" />
        <span className="w-1/6 bg-[#fcd116]" />
        <span className="w-1/6 bg-[#ce1126]" />
      </div>

      {/* Main Polycarbonate Bio-Data Section */}
      <div className="relative z-10 px-3.5 pt-2 pb-1.5 flex-1 flex flex-col justify-between">
        {/* Bilingual Passport Header */}
        <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[#0f295c]/20">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/logo.png"
              alt="Emblème RDC"
              className="w-7 h-7 object-contain shrink-0"
            />
            <div className="min-w-0 leading-tight">
              <div className="text-[7.5px] font-extrabold uppercase tracking-[0.11em] text-[#0c3b7a] truncate">
                République Démocratique du Congo
              </div>
              <div className="text-[6.2px] font-semibold uppercase tracking-[0.08em] text-slate-600 truncate">
                Democratic Republic of the Congo
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#0f295c] mt-0.5">
                PASSEPORT &bull; PASSPORT
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            <div className="text-right leading-none">
              <span className="block text-[6px] font-semibold uppercase text-slate-500">
                Type
              </span>
              <span className="font-mono text-[11px] font-extrabold text-[#0f295c]">
                P
              </span>
            </div>
            {/* ICAO e-Passport Biometric Chip Symbol */}
            <svg
              width="24"
              height="15"
              viewBox="0 0 28 18"
              aria-label="Biometric e-Passport"
              className="text-amber-700"
            >
              <rect
                x="1"
                y="1"
                width="26"
                height="16"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <line x1="1" y1="9" x2="9.5" y2="9" stroke="currentColor" strokeWidth="1.3" />
              <line x1="18.5" y1="9" x2="27" y2="9" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="14" cy="9" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </div>
        </div>

        {/* Portrait + Bilingual ICAO Bio Fields */}
        <div className="relative flex gap-3 items-start my-auto py-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-[74px] h-[94px] rounded-sm overflow-hidden border border-[#0f295c]/35 shadow-2xs relative bg-slate-100">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={application.applicantName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PassportSilhouettePortrait />
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -bottom-2 w-7 h-7 rounded-full bg-linear-to-tr from-sky-300/65 via-amber-200/70 to-emerald-300/60 border border-white/70 opacity-80"
              />
            </div>
            <span className="font-mono text-[6px] font-bold uppercase tracking-wider text-[#0c3b7a]/75">
              BIOMÉTRIQUE &bull; ICAO
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1 leading-tight">
            <div className="flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[6px] font-bold uppercase tracking-wider text-sky-900/70">
                  N° du passeport / Passport No.
                </div>
                <div className="font-mono text-[11px] font-extrabold text-[#0c3b7a] tracking-wide">
                  {issuedNumber || application.trackingId}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[6px] font-bold uppercase tracking-wider text-sky-900/70">
                  Pays / Country
                </div>
                <div className="font-mono text-[8.5px] font-bold text-slate-800">
                  RDC
                </div>
              </div>
            </div>

            <div>
              <div className="text-[6px] font-bold uppercase tracking-wider text-sky-900/70">
                Nom / Surname
              </div>
              <div className="text-[10px] font-extrabold uppercase text-slate-900 truncate">
                {passportSurname}
              </div>
            </div>

            <div>
              <div className="text-[6px] font-bold uppercase tracking-wider text-sky-900/70">
                Post-nom &amp; Prénoms / Given names
              </div>
              <div className="text-[9.5px] font-bold uppercase text-slate-900 truncate">
                {passportGivenNames}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="col-span-2 min-w-0">
                <div className="text-[5.8px] font-bold uppercase tracking-wider text-sky-900/70">
                  Nationalité / Nationality
                </div>
                <div className="text-[8px] font-bold uppercase text-slate-800 truncate">
                  {passportNationality}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[5.8px] font-bold uppercase tracking-wider text-sky-900/70">
                  Sexe / Sex
                </div>
                <div className="text-[8.5px] font-bold uppercase text-slate-900">
                  {passportSexCode}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="min-w-0">
                <div className="text-[5.8px] font-bold uppercase tracking-wider text-sky-900/70">
                  Naissance / Date of birth
                </div>
                <div className="text-[8px] font-bold uppercase text-slate-800 truncate">
                  {idProofSummary.birthDate || "—"}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[5.8px] font-bold uppercase tracking-wider text-sky-900/70">
                  Lieu / Place of birth
                </div>
                <div className="text-[8px] font-bold uppercase text-slate-800 truncate">
                  {idProofSummary.birthPlace || application.city}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="min-w-0">
                <div className="text-[5.8px] font-bold uppercase tracking-wider text-sky-900/70">
                  Délivré le / Date of issue
                </div>
                <div className="text-[8px] font-semibold uppercase text-slate-800 truncate">
                  {sealDate}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[5.8px] font-bold uppercase tracking-wider text-sky-900/70">
                  Expire le / Date of expiry
                </div>
                <div className="text-[8px] font-bold uppercase text-slate-900">
                  {passportExpiryDate}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[5.8px] font-bold uppercase tracking-wider text-sky-900/70">
                Autorité / Authority
              </div>
              <div className="text-[7.5px] font-semibold uppercase text-slate-700 truncate">
                {application.collectionPoint || application.city}
              </div>
            </div>
          </div>

          <div className="pointer-events-none select-none absolute right-0.5 bottom-1 w-7 h-9 overflow-hidden opacity-20 grayscale contrast-125">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
              />
            ) : (
              <PassportSilhouettePortrait />
            )}
          </div>
        </div>
      </div>

      {/* Crisp ICAO TD3 Machine Readable Zone (2 lines) */}
      <div className="relative z-10 bg-white/95 border-t border-slate-300/80 px-3.5 py-2 font-mono text-[8px] font-semibold tracking-[0.09em] text-slate-800 leading-[1.35]">
        <div className="truncate">{passportMrzLine1}</div>
        <div className="truncate">{passportMrzLine2}</div>
      </div>
    </div>
  );

  const passportBackRows: [string, string][] = [
    [
      "DOMICILE / ADDRESS",
      String(detailsMap["Address"] || idProofSummary.address || application.city),
    ],
    [
      "PROFESSION / OCCUPATION",
      String(detailsMap["Occupation"] || "—"),
    ],
    [
      "FILIATION / PARENTS",
      [detailsMap["Father Name & ID"], detailsMap["Mother Name & ID"]]
        .filter(Boolean)
        .join(" / ") || "—",
    ],
    [
      "ORIGINE / ORIGIN",
      String(detailsMap["Province / Origin"] || application.city),
    ],
  ];

  const renderPassportEndorsementPage = () => (
    <div className="print-clean-page print-passport-page w-full max-w-[438px] aspect-[1.42/1] rounded-xl relative bg-linear-to-br from-[#fcfbf7] via-[#f8fafc] to-[#eff6ff]/70 border border-[#0f295c]/45 border-l-4 border-l-[#0f295c] shadow-[0_12px_28px_-6px_rgba(15,41,92,0.22),0_2px_6px_rgba(15,23,42,0.08)] ring-1 ring-inset ring-white/90 overflow-hidden flex flex-col justify-between p-3.5">
      <PvcSecuritySubstrate />

      <div className="relative z-10 flex items-center justify-between gap-2 pb-1.5 border-b border-[#0f295c]/20">
        <div className="min-w-0">
          <div className="text-[7px] font-extrabold uppercase tracking-[0.12em] text-[#0f295c]">
            Observations &amp; Signatures Officielles
          </div>
          <div className="text-[6.2px] font-semibold uppercase tracking-[0.09em] text-slate-500">
            Official Endorsements &amp; Consular Authority
          </div>
        </div>
        <span className="font-mono text-[8.5px] font-bold text-[#0c3b7a] shrink-0">
          {issuedNumber || application.trackingId}
        </span>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-2.5 pt-1.5">
        <div className="flex-1 min-w-0 space-y-1 leading-tight">
          {passportBackRows.map(([label, val]) => (
            <div key={label} className="text-[7.8px] line-clamp-1">
              <span className="font-bold uppercase tracking-wider text-sky-900/75 mr-1">
                {label}:
              </span>
              <span className="font-semibold uppercase text-slate-900">
                {val}
              </span>
            </div>
          ))}
        </div>

        <div className="border border-slate-300 bg-white p-0.5 shrink-0 shadow-2xs">
          <RealisticQrMatrix
            seed={`PASS|${issuedNumber || application.trackingId}|${application.applicantName}`}
            size={46}
          />
        </div>
      </div>

      {/* Signatures + Official Seal Strip */}
      <div className="relative z-10 mt-1.5 px-2.5 py-1.5 bg-[#fffef7]/95 border border-slate-300/85">
        <div className="grid grid-cols-2 gap-2.5 items-end">
          <div className="min-w-0">
            <div className="h-7 flex items-center justify-start overflow-hidden">
              {wf.verificationSignature ? (
                <img
                  src={wf.verificationSignature}
                  alt="Verification Signature"
                  className="max-h-7 object-contain mix-blend-multiply"
                />
              ) : (
                <span className="text-[6.5px] text-slate-400 italic">
                  {isFr ? "Non signé" : "Unsigned"}
                </span>
              )}
            </div>
            <div className="border-t border-slate-300 pt-0.5 text-[6.5px] font-semibold text-slate-700 truncate">
              Vérif. / Verifier: {wf.verificationOfficerName || "—"}
            </div>
          </div>

          <div className="min-w-0">
            <div className="h-7 flex items-center justify-start overflow-hidden">
              {wf.approverSignature ? (
                <img
                  src={wf.approverSignature}
                  alt="Approver Signature"
                  className="max-h-7 object-contain mix-blend-multiply"
                />
              ) : (
                <span className="text-[6.5px] text-slate-400 italic">
                  {isFr ? "En attente" : "Pending"}
                </span>
              )}
            </div>
            <div className="border-t border-slate-300 pt-0.5 text-[6.5px] font-semibold text-slate-700 truncate">
              Approb. / Approver: {wf.approverOfficerName || "—"}
            </div>
          </div>
        </div>

        {bothSigned && (
          <div className="pointer-events-none absolute -right-1 -top-5">
            <DrcOfficialSeal
              docNumber={issuedNumber || application.trackingId}
              approvedDate={sealDate}
              isApproved={bothSigned}
              size={60}
            />
          </div>
        )}
      </div>

      <div className="relative z-10 pt-1 text-[6.5px] leading-snug text-slate-600 flex items-center justify-between gap-2">
        <span className="truncate">
          Ce passeport est la propriété de la R.D. Congo &bull; Property of DR Congo
        </span>
        <span className="font-mono font-bold text-[#0f295c] shrink-0">
          {issuedNumber || "—"}
        </span>
      </div>
    </div>
  );

  const renderPassportCover = () => (
    <div className="print-clean-page print-passport-page w-full max-w-[270px] aspect-[1/1.40] rounded-r-2xl rounded-l-sm relative bg-linear-to-br from-[#0d2756] via-[#091c40] to-[#06122a] border border-[#050f24] border-l-4 border-l-[#040a18] shadow-[0_14px_30px_-8px_rgba(6,18,42,0.55)] ring-1 ring-inset ring-amber-200/20 overflow-hidden flex flex-col items-center justify-between py-6 px-5 text-center select-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial from-white/[0.06] via-transparent to-black/25"
      />
      <div className="relative z-10 space-y-1">
        <div className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#e7c564]">
          République Démocratique du Congo
        </div>
        <div className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#e7c564]/80">
          Democratic Republic of the Congo
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-amber-300/10 border border-[#e7c564]/45 flex items-center justify-center p-2 shadow-inner">
          <img
            src="/logo.png"
            alt="Armoiries RDC"
            className="w-15 h-15 object-contain"
          />
        </div>
        <div className="space-y-0.5">
          <div className="font-serif text-lg font-extrabold uppercase tracking-[0.22em] text-[#f0cf72]">
            PASSEPORT
          </div>
          <div className="font-serif text-[11px] font-bold uppercase tracking-[0.26em] text-[#e7c564]/85">
            PASSPORT
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#e7c564]/80">
          Justice &bull; Paix &bull; Travail
        </div>
        <svg
          width="28"
          height="18"
          viewBox="0 0 28 18"
          aria-label="Biometric Passport Symbol"
          className="text-[#e7c564]"
        >
          <rect
            x="1"
            y="1"
            width="26"
            height="16"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <line x1="1" y1="9" x2="9.5" y2="9" stroke="currentColor" strokeWidth="1.3" />
          <line x1="18.5" y1="9" x2="27" y2="9" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="14" cy="9" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        {isNationalId ? (
          <div className="inline-flex bg-gray-100 p-0.5 text-xs border border-gray-300">
            <button
              type="button"
              onClick={() => setViewMode("both")}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === "both"
                  ? "bg-gray-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFr ? "Recto & Verso" : "Front & Back"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("document")}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === "document"
                  ? "bg-gray-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFr ? "Recto (Face)" : "Front Side"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("id_proof")}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === "id_proof"
                  ? "bg-gray-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFr ? "Verso (Dos)" : "Back Side"}
            </button>
          </div>
        ) : isPassport ? (
          <div className="inline-flex bg-gray-100 p-0.5 text-xs border border-gray-300">
            <button
              type="button"
              onClick={() => setViewMode("both")}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === "both"
                  ? "bg-gray-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFr ? "Passeport Complet" : "Passport Booklet"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("document")}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === "document"
                  ? "bg-gray-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFr ? "Page Biométrique" : "Bio-Data Page"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("id_proof")}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === "id_proof"
                  ? "bg-gray-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFr ? "Mentions & Sceau" : "Signatures & Seal"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cover")}
              className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                viewMode === "cover"
                  ? "bg-gray-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isFr ? "Couverture" : "Cover"}
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-800">
            <FileText className="w-4 h-4 text-[#0f295c]" />
            <span>{localizedServiceTitle}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {downloading
                ? isFr
                  ? "Export..."
                  : "Downloading..."
                : isFr
                ? "Télécharger"
                : "Download"}
            </span>
          </button>

          {showPrintButton && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isFr ? "Imprimer" : "Print"}</span>
            </button>
          )}
        </div>
      </div>

      {/* NATIONAL ID SERVICE -> ONLY 2-SIDED POLYCARBONATE PVC SMART CARD */}
      {isNationalId ? (
        <div className="flex flex-wrap gap-5 items-start justify-center">
          {(viewMode === "both" || viewMode === "document") && renderFrontIdCard()}
          {(viewMode === "both" || viewMode === "id_proof") && renderBackIdCard()}
        </div>
      ) : isPassport ? (
        /* PASSPORT SERVICE -> REALISTIC BILINGUAL DRC BIOMETRIC PASSPORT */
        <div className="flex flex-wrap gap-5 items-start justify-center">
          {(viewMode === "both" || viewMode === "document") &&
            renderPassportBioDataPage()}
          {(viewMode === "both" || viewMode === "id_proof") &&
            renderPassportEndorsementPage()}
          {viewMode === "cover" && renderPassportCover()}
        </div>
      ) : isBirthCertificate ? (
        /* BIRTH CERTIFICATE -> DISTINCT DRC CIVIL REGISTRY BIRTH EXTRACT (FOREST EMERALD & PARCHMENT LEDGER) */
        (() => {
          const birthTimeStr = detailsMap["Birth Time"]
            ? ` • ${detailsMap["Birth Time"]}`
            : "";
          const childBirthDateStr =
            (idProofSummary.birthDate || detailsMap["Birth Date"] || "—") +
            birthTimeStr;
          const childBirthPlaceStr =
            idProofSummary.birthPlace || detailsMap["Birth Place"] || application.city;
          const hospitalStr = detailsMap["Hospital / Doctor"] || "—";
          const rawDeclarant = String(detailsMap["Declarant"] || "Père");
          const declarantDisplay =
            !isFr && /^p[èe]re$/i.test(rawDeclarant)
              ? "Father"
              : !isFr && /^m[èe]re$/i.test(rawDeclarant)
              ? "Mother"
              : rawDeclarant;
          const childGenderDisplay = getLocalizedDetailValue(
            "Gender",
            String(detailsMap["Gender"] || "M"),
            isFr
          );

          return (
            <div className="print-clean-page mx-auto relative bg-[#fcfaf2] border-2 border-[#064e3b] overflow-hidden flex flex-col justify-between w-full max-w-3xl">
              <img
                src="/logo.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 object-contain opacity-[0.045]"
              />

              <div className="relative z-10 m-1.5 border border-[#064e3b]/35 bg-[#fcfaf2]/80">
                {/* Top Civil Registry Emblem & Dual-Column Authority Header */}
                <div className="bg-[#064e3b] text-white px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/logo.png"
                      alt="Emblème RDC"
                      className="w-10 h-10 object-contain shrink-0 bg-white/95 rounded-full p-0.5"
                    />
                    <div className="min-w-0 leading-tight">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#fcd116] truncate">
                        République Démocratique du Congo
                      </div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-white truncate">
                        {isFr
                          ? "État Civil • Registre des Naissances"
                          : "Civil Registry • Register of Births"}
                      </div>
                      <div className="text-[10px] text-emerald-100/90 truncate">
                        {application.collectionPoint || application.city}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 border-l border-emerald-700/80 pl-3">
                    <div className="text-[9px] uppercase tracking-wider text-emerald-200">
                      {isFr ? "Acte N° / Register" : "Birth Act No."}
                    </div>
                    <div className="font-mono text-sm font-extrabold text-[#fcd116]">
                      {issuedNumber || "—"}
                    </div>
                  </div>
                </div>

                {/* Main Civil Registry Document Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="text-center pb-3 border-b border-emerald-900/20">
                    <h4 className="font-serif text-lg font-extrabold uppercase tracking-wide text-[#064e3b]">
                      {isFr
                        ? "EXTRAIT D'ACTE DE NAISSANCE"
                        : "OFFICIAL BIRTH CERTIFICATE EXTRACT"}
                    </h4>
                    <p className="text-[11px] font-serif italic text-gray-600 mt-1">
                      {isFr
                        ? "L'Officier de l'État Civil soussigné certifie que l'acte ci-dessous figure au Registre Officiel des Naissances."
                        : "The undersigned Civil Registrar certifies that the following birth record is duly inscribed in the Official Civil Register."}
                    </p>
                  </div>

                  {/* SECTION I: REGISTERED CHILD */}
                  <div className="border border-emerald-900/25 bg-white/95">
                    <div className="bg-emerald-50/90 border-b border-emerald-900/20 px-3.5 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#064e3b]">
                        {isFr
                          ? "I. Identité de l'Enfant Déclaré"
                          : "I. Registered Child Details"}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800">
                        {isFr ? "Délivré le : " : "Issued: "} {sealDate}
                      </span>
                    </div>

                    <div className="p-3.5 flex items-start gap-4">
                      {photoUrl && (
                        <img
                          src={photoUrl}
                          alt={application.applicantName}
                          className="w-16 h-20 object-cover border border-emerald-900/30 shrink-0 bg-white"
                        />
                      )}
                      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 text-xs">
                        <div className="sm:col-span-2 pb-1.5 border-b border-gray-100">
                          <span className="text-[10px] uppercase tracking-wide text-gray-500 block">
                            {isFr
                              ? "Nom Complet de l'Enfant (Nom • Post-nom • Prénom)"
                              : "Child Full Name (Surname • Post-Name • First Name)"}
                          </span>
                          <span className="font-serif text-base font-bold text-gray-900 uppercase">
                            {application.applicantName}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">
                            {isFr ? "Date & Heure de Naissance" : "Date & Time of Birth"}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {childBirthDateStr}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">
                            {isFr ? "Sexe de l'Enfant" : "Sex"}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {childGenderDisplay}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">
                            {isFr ? "Commune / Lieu de Naissance" : "Birthplace / City"}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {childBirthPlaceStr}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">
                            {isFr ? "Maternité / Centre Hospitalier" : "Hospital / Maternity"}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {hospitalStr}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION II: PARENTS LINEAGE (FATHER & MOTHER CARDS) */}
                  <div className="border border-emerald-900/25 bg-white/95">
                    <div className="bg-emerald-50/90 border-b border-emerald-900/20 px-3.5 py-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#064e3b]">
                        {isFr ? "II. Filiation Parentale" : "II. Parents' Lineage"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 text-xs">
                      <div className="p-3.5 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/75 block">
                          {isFr ? "Père" : "Father"}
                        </span>
                        <div className="font-bold text-gray-900">
                          {detailsMap["Father Name & ID"] || "—"}
                        </div>
                        {detailsMap["Father Details"] && (
                          <div className="text-[11px] text-gray-600">
                            {detailsMap["Father Details"]}
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900/75 block">
                          {isFr ? "Mère" : "Mother"}
                        </span>
                        <div className="font-bold text-gray-900">
                          {detailsMap["Mother Name & ID"] || "—"}
                        </div>
                        {detailsMap["Mother Details"] && (
                          <div className="text-[11px] text-gray-600">
                            {detailsMap["Mother Details"]}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-3.5 py-2 bg-gray-50/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-500 mr-1.5">
                          {isFr ? "Province d'Origine :" : "Province / Origin:"}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {detailsMap["Province / Origin"] || application.city}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-gray-500 mr-1.5">
                          {isFr ? "Déclarant :" : "Declarant:"}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {declarantDisplay}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION III: SIGNATURES, QR CODE & CIVIL REGISTRY SEAL */}
                  <div className="relative pt-1">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="flex-1">{renderDocSignatures()}</div>
                      <div className="border border-emerald-900/20 bg-white p-2.5 flex flex-col items-center justify-center shrink-0">
                        <RealisticQrMatrix
                          seed={`BIRTH|${issuedNumber || application.applicantName}|${childBirthDateStr}`}
                          size={58}
                        />
                        <span className="font-mono text-[8px] font-bold text-[#064e3b] mt-1">
                          {issuedNumber || "—"}
                        </span>
                      </div>
                    </div>

                    {bothSigned && (
                      <div className="flex justify-end mt-2 sm:mt-0 sm:absolute sm:right-24 sm:-top-6">
                        <DrcOfficialSeal
                          docNumber={issuedNumber || application.trackingId}
                          approvedDate={sealDate}
                          isApproved={bothSigned}
                          size={88}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-5 py-2 bg-[#064e3b] text-white flex items-center justify-between text-[10px]">
                <span className="font-mono">
                  {issuedNumber || "—"} &bull; {sealDate}
                </span>
                <span className="uppercase tracking-wider font-semibold text-[#fcd116]">
                  {bothSigned
                    ? isFr
                      ? "État Civil Certifié & Scellé"
                      : "Civil Registry Certified & Sealed"
                    : isFr
                    ? "En cours"
                    : "In progress"}
                </span>
              </div>
            </div>
          );
        })()
      ) : isMarriageCertificate ? (
        /* MARRIAGE CERTIFICATE -> REGAL BURGUNDY & GOLD CIVIL MARRIAGE ACT (CENTERED) */
        (() => {
          const translateNatCombo = (val?: string | null) => {
            if (!val) return "—";
            return isFr ? val : val.replace(/\bCongolaise\b/gi, "Congolese");
          };
          const marriageCombo = String(detailsMap["Marriage Date & Regime"] || "");
          const [mDatePart, mRegimePart] = marriageCombo.split(" • ");
          const localizedRegime =
            !isFr && /communaut[ée]\s+r[ée]duite\s+aux\s+acqu[êe]ts/i.test(mRegimePart || "")
              ? "Community of Accrued Gains"
              : !isFr && /s[ée]paration\s+de\s+biens/i.test(mRegimePart || "")
              ? "Separation of Property"
              : mRegimePart || (isFr ? "Communauté réduite aux acquêts" : "Community of Property");

          return (
            <div className="print-clean-page mx-auto relative bg-[#fefcf7] border-2 border-[#6b102f] overflow-hidden flex flex-col justify-between w-full max-w-3xl">
              <img
                src="/logo.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 object-contain opacity-[0.045]"
              />

              <div className="relative z-10 m-1.5 border border-[#b45309]/40 bg-[#fefcf7]/85">
                {/* Regal Burgundy Ceremonial Header */}
                <div className="bg-[#6b102f] text-white px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/logo.png"
                      alt="Emblème RDC"
                      className="w-10 h-10 object-contain shrink-0 bg-white/95 rounded-full p-0.5"
                    />
                    <div className="min-w-0 leading-tight">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#fcd116] truncate">
                        République Démocratique du Congo
                      </div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-white truncate">
                        {isFr
                          ? "État Civil • Registre des Mariages"
                          : "Civil Registry • Marriage Register"}
                      </div>
                      <div className="text-[10px] text-rose-100/90 truncate">
                        {application.collectionPoint || application.city}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 border-l border-rose-800/80 pl-3">
                    <div className="text-[9px] uppercase tracking-wider text-rose-200">
                      {isFr ? "Acte de Mariage N°" : "Marriage Act No."}
                    </div>
                    <div className="font-mono text-sm font-extrabold text-[#fcd116]">
                      {issuedNumber || "—"}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Ceremonial Proclamation Header */}
                  <div className="text-center pb-3 border-b border-[#6b102f]/20">
                    <h4 className="font-serif text-lg font-extrabold uppercase tracking-wide text-[#6b102f]">
                      {isFr
                        ? "CERTIFICAT D'ENREGISTREMENT DE MARIAGE"
                        : "OFFICIAL MARRIAGE REGISTRATION CERTIFICATE"}
                    </h4>
                    <p className="text-[11px] font-serif italic text-gray-600 mt-1">
                      {isFr
                        ? "L'Officier de l'État Civil certifie solennellement la célébration et l'inscription de l'union matrimoniale des époux ci-dessous."
                        : "The Civil Registrar solemnly certifies the celebration and official inscription of marriage between the spouses identified below."}
                    </p>
                  </div>

                  {/* Celebration Date, Matrimonial Regime & Issue Date Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-rose-200/70 border border-[#6b102f]/25 text-xs">
                    <div className="bg-white px-3.5 py-2">
                      <span className="text-[10px] uppercase text-gray-500 block">
                        {isFr ? "Date du Mariage" : "Date of Marriage"}
                      </span>
                      <span className="font-bold text-gray-900">
                        {mDatePart || sealDate}
                      </span>
                    </div>
                    <div className="bg-white px-3.5 py-2">
                      <span className="text-[10px] uppercase text-gray-500 block">
                        {isFr ? "Régime Matrimonial" : "Matrimonial Regime"}
                      </span>
                      <span className="font-bold text-[#6b102f]">
                        {localizedRegime}
                      </span>
                    </div>
                    <div className="bg-white px-3.5 py-2">
                      <span className="text-[10px] uppercase text-gray-500 block">
                        {isFr ? "Date de Délivrance" : "Issue Date"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {sealDate}
                      </span>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE TWO-SPOUSE CONTRACTING REGISTER */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* GROOM PANEL */}
                    <div className="border border-[#6b102f]/25 bg-white/95">
                      <div className="bg-rose-50/90 border-b border-[#6b102f]/20 px-3.5 py-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b102f]">
                          {isFr ? "I. L'Époux (Contractant)" : "I. The Groom"}
                        </span>
                      </div>
                      <div className="p-3.5 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">
                            {isFr ? "Nom Complet & N° ID" : "Full Name & ID"}
                          </span>
                          <span className="font-bold text-gray-900">
                            {detailsMap["Groom"] || "—"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Naissance :" : "Birth:"}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {detailsMap["Groom Birth"] || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Qualité :" : "Details:"}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {translateNatCombo(detailsMap["Groom Details"])}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Domicile :" : "Residence:"}
                            </span>
                            <span className="text-gray-800">
                              {detailsMap["Groom Residence"] || detailsMap["Address"] || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Filiation :" : "Parents:"}
                            </span>
                            <span className="text-gray-800">
                              {detailsMap["Groom Parents"] || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BRIDE PANEL */}
                    <div className="border border-[#6b102f]/25 bg-white/95">
                      <div className="bg-rose-50/90 border-b border-[#6b102f]/20 px-3.5 py-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b102f]">
                          {isFr ? "II. L'Épouse (Contractante)" : "II. The Bride"}
                        </span>
                      </div>
                      <div className="p-3.5 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 block">
                            {isFr ? "Nom Complet & N° ID" : "Full Name & ID"}
                          </span>
                          <span className="font-bold text-gray-900">
                            {detailsMap["Bride"] || "—"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Naissance :" : "Birth:"}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {detailsMap["Bride Birth"] || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Qualité :" : "Details:"}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {translateNatCombo(detailsMap["Bride Details"])}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Domicile :" : "Residence:"}
                            </span>
                            <span className="text-gray-800">
                              {detailsMap["Bride Residence"] || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">
                              {isFr ? "Filiation :" : "Parents:"}
                            </span>
                            <span className="text-gray-800">
                              {detailsMap["Bride Parents"] || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION III: SIGNATURES, QR & SEAL */}
                  <div className="relative pt-1">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="flex-1">{renderDocSignatures()}</div>
                      <div className="border border-[#6b102f]/20 bg-white p-2.5 flex flex-col items-center justify-center shrink-0">
                        <RealisticQrMatrix
                          seed={`MARRIAGE|${issuedNumber || application.applicantName}|${mDatePart}`}
                          size={58}
                        />
                        <span className="font-mono text-[8px] font-bold text-[#6b102f] mt-1">
                          {issuedNumber || "—"}
                        </span>
                      </div>
                    </div>

                    {bothSigned && (
                      <div className="flex justify-end mt-2 sm:mt-0 sm:absolute sm:right-24 sm:-top-6">
                        <DrcOfficialSeal
                          docNumber={issuedNumber || application.trackingId}
                          approvedDate={sealDate}
                          isApproved={bothSigned}
                          size={88}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-5 py-2 bg-[#6b102f] text-white flex items-center justify-between text-[10px]">
                <span className="font-mono">
                  {issuedNumber || "—"} &bull; {sealDate}
                </span>
                <span className="uppercase tracking-wider font-semibold text-[#fcd116]">
                  {bothSigned
                    ? isFr
                      ? "Mariage Enregistré & Scellé"
                      : "Marriage Registered & Sealed"
                    : isFr
                    ? "En cours"
                    : "In progress"}
                </span>
              </div>
            </div>
          );
        })()
      ) : isDeathCertificate ? (
        /* DEATH CERTIFICATE -> SOLEMN CHARCOAL SLATE CIVIL DEATH ACT (CENTERED) */
        (() => {
          const deathCombo = String(detailsMap["Death Date & Place"] || "");
          const [dDatePart, dPlacePart] = deathCombo.split(" • ");
          const deathDateTime = `${dDatePart || sealDate}${
            detailsMap["Death Time"] ? ` • ${detailsMap["Death Time"]}` : ""
          }`;
          const [hospitalPart, doctorPart] = String(
            detailsMap["Hospital / Doctor"] || ""
          ).split(" • ");
          const decNat = getLocalizedDetailValue(
            "Nationality",
            String(detailsMap["Nationality"] || idProofSummary.nationality || "Congolaise"),
            isFr
          );
          const decGender = getLocalizedDetailValue(
            "Gender",
            String(detailsMap["Gender"] || "M"),
            isFr
          );
          const decMarital = getLocalizedDetailValue(
            "Marital Status",
            String(detailsMap["Marital Status"] || "—"),
            isFr
          );
          const decBirth = [
            idProofSummary.birthDate || detailsMap["Birth Date"],
            idProofSummary.birthPlace || detailsMap["Birth Place"],
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <div className="print-clean-page mx-auto relative bg-[#fbfcfd] border-2 border-[#1e293b] overflow-hidden flex flex-col justify-between w-full max-w-3xl">
              <img
                src="/logo.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 object-contain opacity-[0.045] grayscale"
              />

              <div className="relative z-10 m-1.5 border border-slate-400/60 bg-[#fbfcfd]/90">
                {/* Solemn Charcoal Slate Header */}
                <div className="bg-[#1e293b] text-white px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/logo.png"
                      alt="Emblème RDC"
                      className="w-10 h-10 object-contain shrink-0 bg-white/95 rounded-full p-0.5"
                    />
                    <div className="min-w-0 leading-tight">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#fcd116] truncate">
                        République Démocratique du Congo
                      </div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-white truncate">
                        {isFr
                          ? "État Civil • Registre des Décès"
                          : "Civil Registry • Death Register"}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate">
                        {application.collectionPoint || application.city}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 border-l border-slate-600 pl-3">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300">
                      {isFr ? "Acte de Décès N°" : "Death Act No."}
                    </div>
                    <div className="font-mono text-sm font-extrabold text-[#fcd116]">
                      {issuedNumber || "—"}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Title & Civil Registrar Proclamation */}
                  <div className="text-center pb-3 border-b border-slate-300">
                    <h4 className="font-serif text-lg font-extrabold uppercase tracking-wide text-slate-900">
                      {isFr
                        ? "ACTE DE DÉCÈS & CERTIFICAT D'INHUMATION"
                        : "OFFICIAL DEATH REGISTRATION CERTIFICATE"}
                    </h4>
                    <p className="text-[11px] font-serif italic text-gray-600 mt-1">
                      {isFr
                        ? "L'Officier de l'État Civil certifie l'inscription régulière au Registre des Décès de la personne défunte identifiée ci-dessous."
                        : "The Civil Registrar certifies the official entry in the Civil Death Register of the deceased person identified below."}
                    </p>
                  </div>

                  {/* SECTION I: DECEASED PERSON DETAILS */}
                  <div className="border border-slate-300 bg-white/95">
                    <div className="bg-slate-100 border-b border-slate-300 px-3.5 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800">
                        {isFr ? "I. Identité du Défunt" : "I. Deceased Person Details"}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600">
                        {isFr ? "Délivré le : " : "Issued: "} {sealDate}
                      </span>
                    </div>

                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 text-xs">
                      <div className="sm:col-span-2 flex flex-wrap items-baseline justify-between gap-2 pb-1.5 border-b border-gray-100">
                        <div>
                          <span className="text-[10px] uppercase tracking-wide text-gray-500 block">
                            {isFr ? "Nom Complet du Défunt" : "Deceased Full Name"}
                          </span>
                          <span className="font-serif text-base font-bold text-gray-900 uppercase">
                            {application.applicantName}
                          </span>
                        </div>
                        {detailsMap["Deceased ID"] && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-gray-500 block">
                              {isFr ? "N° ID / NIN" : "ID / NIN"}
                            </span>
                            <span className="font-mono font-semibold text-slate-800">
                              {detailsMap["Deceased ID"]}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Naissance (Date & Lieu)" : "Date & Place of Birth"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {decBirth || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Sexe & État Civil" : "Sex & Marital Status"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {decGender} &bull; {decMarital}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Nationalité & Profession" : "Nationality & Occupation"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {decNat}
                          {detailsMap["Occupation"] ? ` • ${detailsMap["Occupation"]}` : ""}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Dernier Domicile" : "Last Residence"}
                        </span>
                        <span className="font-medium text-gray-800">
                          {detailsMap["Address"] || idProofSummary.address || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION II: MEDICAL CERTIFICATION OF DEATH */}
                  <div className="border border-slate-300 bg-white/95">
                    <div className="bg-slate-100 border-b border-slate-300 px-3.5 py-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800">
                        {isFr
                          ? "II. Constatation Médicale du Décès"
                          : "II. Circumstances & Medical Certification"}
                      </span>
                      {detailsMap["Medical Notice"] && (
                        <span className="font-mono text-[10px] font-semibold text-slate-700">
                          {detailsMap["Medical Notice"]}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Date & Heure du Décès" : "Date & Time of Death"}
                        </span>
                        <span className="font-bold text-gray-900">
                          {deathDateTime}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Lieu du Décès" : "Place of Death"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {dPlacePart || application.city}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Établissement / Centre Médical" : "Hospital / Facility"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {hospitalPart || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase text-gray-500 block">
                          {isFr ? "Médecin Certificateur" : "Certifying Physician"}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {doctorPart || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION III: DECLARANT */}
                  <div className="border border-slate-300 bg-slate-50/75 px-3.5 py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 block">
                        {isFr ? "Déclarant" : "Declarant"}
                      </span>
                      <span className="font-bold text-gray-900">
                        {detailsMap["Declarant"] || "—"}
                      </span>
                      {detailsMap["Declarant ID"] && (
                        <span className="block font-mono text-[10px] text-slate-600">
                          {detailsMap["Declarant ID"]}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-gray-500 block">
                        {isFr ? "Domicile du Déclarant" : "Declarant Residence"}
                      </span>
                      <span className="text-[11px] text-gray-800">
                        {detailsMap["Declarant Residence"] || "—"}
                      </span>
                    </div>
                  </div>

                  {/* SIGNATURES, QR & SEAL */}
                  <div className="relative pt-1">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="flex-1">{renderDocSignatures()}</div>
                      <div className="border border-slate-300 bg-white p-2.5 flex flex-col items-center justify-center shrink-0">
                        <RealisticQrMatrix
                          seed={`DEATH|${issuedNumber || application.applicantName}|${deathDateTime}`}
                          size={58}
                        />
                        <span className="font-mono text-[8px] font-bold text-slate-800 mt-1">
                          {issuedNumber || "—"}
                        </span>
                      </div>
                    </div>

                    {bothSigned && (
                      <div className="flex justify-end mt-2 sm:mt-0 sm:absolute sm:right-24 sm:-top-6">
                        <DrcOfficialSeal
                          docNumber={issuedNumber || application.trackingId}
                          approvedDate={sealDate}
                          isApproved={bothSigned}
                          size={88}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative z-10 px-5 py-2 bg-[#1e293b] text-white flex items-center justify-between text-[10px]">
                <span className="font-mono">
                  {issuedNumber || "—"} &bull; {sealDate}
                </span>
                <span className="uppercase tracking-wider font-semibold text-[#fcd116]">
                  {bothSigned
                    ? isFr
                      ? "Décès Enregistré & Scellé"
                      : "Death Registered & Sealed"
                    : isFr
                    ? "En cours"
                    : "In progress"}
                </span>
              </div>
            </div>
          );
        })()
      ) : (
        /* ALL OTHER SERVICES -> SERVICE-SPECIFIC OFFICIAL DOCUMENT ONLY (CENTERED) */
        <div className="print-clean-page mx-auto relative bg-[#fcfbf7] border-2 border-[#0f295c]/80 overflow-hidden flex flex-col justify-between w-full max-w-3xl">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 object-contain opacity-[0.055]"
          />

          <div className="relative z-10">
            <div className="h-1.5 w-full flex">
              <div className="flex-1 bg-[#007fff]" />
              <div className="w-1/6 bg-[#fcd116]" />
              <div className="w-1/6 bg-[#ce1126]" />
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="text-center space-y-1 pb-3.5 border-b-2 border-[#0f295c]">
                <img
                  src="/logo.png"
                  alt="Emblème de la République Démocratique du Congo"
                  className="w-14 h-14 object-contain mx-auto mb-1"
                />
                <div className="font-serif text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f295c]">
                  République Démocratique du Congo
                </div>
                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-700">
                  Justice &bull; Paix &bull; Travail
                </div>
                <div className="text-[11px] font-medium text-gray-600">
                  {ministryName}
                </div>
              </div>

              <div className="bg-white/95 border border-[#0f295c]/25 p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {isFr ? "Acte / Titre Officiel" : "Official Document"}
                  </div>
                  <h4 className="font-serif text-base font-bold uppercase text-gray-900">
                    {localizedServiceTitle}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-gray-500">
                    {isFr ? "N° Officiel" : "Official Document No."}
                  </div>
                  <div className="font-mono text-sm font-bold text-[#0f295c]">
                    {issuedNumber || application.trackingId}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-gray-700 font-serif italic">
                {getServiceAttestationText(application.serviceId, isFr)}
              </p>

              {/* Beneficiary Header Card (With Photo if present) */}
              <div className="bg-white/95 border border-gray-300 p-3.5 flex items-center gap-4">
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt={application.applicantName}
                    className="w-16 h-20 object-cover border border-gray-300 shrink-0 bg-white"
                  />
                )}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 block">
                      {isFr ? "Bénéficiaire / Titulaire" : "Beneficiary / Holder"}
                    </span>
                    <span className="font-bold text-gray-900">
                      {application.applicantName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 block">
                      {isFr ? "Date de Délivrance" : "Issue Date"}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {sealDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 block">
                      {isFr ? "Bureau de Délivrance" : "Issuing Office"}
                    </span>
                    <span className="font-medium text-gray-800">
                      {application.collectionPoint || application.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Service-Specific Registry Fields (Employer, Job/Sector, Passport/Visa, Parents, Groom/Bride, License, etc.) */}
              {allDocDetailEntries.length > 0 && (
                <div className="bg-white/95 border border-gray-300 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:gap-px sm:bg-gray-200 text-xs">
                  {allDocDetailEntries.map(([k, val]) => (
                    <div
                      key={k}
                      className="bg-white px-3.5 py-2 flex items-start justify-between gap-3"
                    >
                      <span className="text-gray-500 shrink-0">
                        {getLocalizedDetailLabel(k, isFr)}
                      </span>
                      <span className="font-semibold text-gray-900 text-right">
                        {getLocalizedDetailValue(k, String(val), isFr)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                {renderDocSignatures()}
                {bothSigned && (
                  <div className="flex justify-end mt-2 sm:mt-0 sm:absolute sm:right-2 sm:-top-8">
                    <DrcOfficialSeal
                      docNumber={issuedNumber || application.trackingId}
                      approvedDate={sealDate}
                      isApproved={bothSigned}
                      size={96}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 px-5 py-2.5 bg-[#0f295c] text-white flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-mono">
              <QrCode className="w-3.5 h-3.5 text-[#fcd116]" />
              {issuedNumber || application.trackingId} &bull; {sealDate}
            </span>
            <span className="uppercase tracking-wider font-semibold text-[#fcd116]">
              {bothSigned
                ? isFr
                  ? "Certifié & Scellé"
                  : "Official Seal Applied"
                : isFr
                ? "En cours"
                : "In progress"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
