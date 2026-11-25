"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ApplicationStatus,
  Language,
  OfficerApplicationRecord,
  OfficerProfile,
  SupportingDocumentItem,
} from "@/types";
import { SignaturePad } from "@/components/officer/SignaturePad";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

const ALL_SERVICES_DROPDOWN = [
  { id: "cni-biometrique", fr: "Carte Nationale d'Identité", en: "National Identity Card" },
  { id: "passeport-ordinaire", fr: "Passeport Ordinaire", en: "Ordinary Passport" },
  { id: "certificat-nationalite", fr: "Certificat de Nationalité", en: "Nationality Certificate" },
  { id: "acte-naissance", fr: "Acte de Naissance", en: "Birth Certificate" },
  { id: "acte-mariage", fr: "Certificat de Mariage", en: "Marriage Certificate" },
  { id: "acte-deces", fr: "Certificat de Décès", en: "Death Certificate" },
  { id: "permis-conduire", fr: "Permis de Conduire", en: "Driver's License" },
  { id: "certificat-residence", fr: "Certificat de Résidence", en: "Residence Certificate" },
  { id: "permis-travail-etranger", fr: "Permis de Travail", en: "Work Permit" },
];

const PAGE_SIZE = 10;

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface VerificationOfficerWorkspaceProps {
  language: Language;
  officer: OfficerProfile;
  refreshSignal: number;
  openedApp: OfficerApplicationRecord | null;
  onSelectApp: (app: OfficerApplicationRecord | null) => void;
  onSessionExpired: () => void;
}

export const VerificationOfficerWorkspace: React.FC<
  VerificationOfficerWorkspaceProps
> = ({ language, officer, refreshSignal, openedApp, onSelectApp, onSessionExpired }) => {
  const isFr = language === "fr";

  // Server-side query parameters
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified">("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Server-side response data
  const [listItems, setListItems] = useState<OfficerApplicationRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [serviceCounts, setServiceCounts] = useState<Record<string, number>>({});
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    verified: 0,
    all: 0,
  });

  // Active attachment index for side-by-side comparison
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);

  // Verification & signing state
  const [docsChecked, setDocsChecked] = useState(false);
  const [idProofChecked, setIdProofChecked] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [rejectionMode, setRejectionMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    if (searchInput === debouncedSearch) return;
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(t);
  }, [searchInput, debouncedSearch]);

  const onSessionExpiredRef = useRef(onSessionExpired);
  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
  }, [onSessionExpired]);

  const loadServerPage = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          serviceId: selectedServiceId,
          status: statusFilter,
          search: debouncedSearch,
        });
        const res = await fetch(`/api/officer/applications?${qs.toString()}`, {
          cache: "no-store",
          signal,
        });
        if (res.status === 401) {
          onSessionExpiredRef.current();
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        setListItems(data.applications || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.serviceCounts) setServiceCounts(data.serviceCounts);
        if (data.statusCounts) setStatusCounts(data.statusCounts);
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          console.error("Server pagination load error:", err);
        }
      } finally {
        if (!signal?.aborted) {
          setLoadingList(false);
        }
      }
    },
    [page, selectedServiceId, statusFilter, debouncedSearch]
  );

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoadingList(true);
      await loadServerPage(controller.signal);
    })();
    return () => controller.abort();
  }, [loadServerPage, refreshSignal]);

  const resetReviewForm = () => {
    setActiveDocIndex(0);
    setDocsChecked(false);
    setIdProofChecked(false);
    setRemarks("");
    setSignatureData(null);
    setRejectionMode(false);
    setRejectionReason("");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleOpenApplication = (app: OfficerApplicationRecord) => {
    resetReviewForm();
    onSelectApp(app);
  };

  const handleSubmitVerification = async (action: "verify_and_sign" | "reject") => {
    if (!openedApp) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (action === "verify_and_sign") {
      if (!docsChecked || !idProofChecked) {
        setErrorMsg(
          isFr
            ? "Veuillez confirmer les informations citoyen, les documents et l'ID proof."
            : "Please confirm Citizen Details / Documents and ID Proof are valid."
        );
        return;
      }
      if (!signatureData) {
        setErrorMsg(
          isFr ? "Veuillez signer avant de valider." : "Please sign before submitting."
        );
        return;
      }
    } else if (!rejectionReason.trim()) {
      setErrorMsg(
        isFr ? "Veuillez indiquer le motif du rejet." : "Please enter a rejection reason."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/officer/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: openedApp.trackingId,
          action,
          signatureData,
          docsChecked,
          idProofChecked,
          checklist: { documents: docsChecked, idProof: idProofChecked },
          notesFr: remarks || undefined,
          notesEn: remarks || undefined,
          rejectionReason: rejectionReason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || (isFr ? "Erreur lors de la validation." : "Action failed."));
        return;
      }

      onSelectApp(data.application);
      setSignatureData(null);
      setRejectionMode(false);
      setLoadingList(true);
      await loadServerPage();

      if (action === "verify_and_sign") {
        setSuccessMsg(
          isFr
            ? "Dossier vérifié et signé."
            : "Verified and signed."
        );
      } else {
        setSuccessMsg(isFr ? "Dossier rejeté." : "Application rejected.");
      }
    } catch {
      setErrorMsg(isFr ? "Erreur réseau." : "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "submitted":
      case "in_review":
        return {
          label: isFr ? "À vérifier" : "Pending Verify",
          cls: "bg-blue-600 text-white border-blue-600",
        };
      case "verified":
        return {
          label: isFr ? "Vérifié" : "Verified",
          cls: "bg-emerald-600 text-white border-emerald-600",
        };
      case "approved":
        return {
          label: isFr ? "Approuvé" : "Approved",
          cls: "bg-blue-50 text-blue-700 border-blue-300",
        };
      case "ready":
        return {
          label: isFr ? "Délivré" : "Ready",
          cls: "bg-emerald-50 text-emerald-800 border-emerald-300",
        };
      case "rejected":
        return {
          label: isFr ? "Rejeté" : "Rejected",
          cls: "bg-rose-50 text-rose-700 border-rose-300",
        };
    }
  };

  const renderInlineDocumentPreview = (
    app: OfficerApplicationRecord,
    doc: SupportingDocumentItem | undefined
  ) => {
    if (!doc) {
      return (
        <div className="h-80 border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-xs text-gray-400">
          <FileText className="w-8 h-8 mb-2 text-gray-300" />
          <span>{isFr ? "Aucun document joint" : "No attachment selected"}</span>
        </div>
      );
    }

    if (doc.dataUrl) {
      if (doc.dataUrl.startsWith("data:application/pdf")) {
        return (
          <iframe
            src={doc.dataUrl}
            title={doc.fileName}
            className="w-full h-[460px] border border-gray-300 bg-white"
          />
        );
      }
      return (
        <div className="border border-gray-300 bg-gray-100 p-3 flex items-center justify-center min-h-[360px] max-h-[480px] overflow-auto">
          <img
            src={doc.dataUrl}
            alt={doc.fileName}
            className="max-w-full max-h-[440px] object-contain"
          />
        </div>
      );
    }

    if (
      (doc.type === "photo" ||
        doc.type === "photo_oaci" ||
        doc.fileName.toLowerCase().includes("photo")) &&
      app.photoUrl
    ) {
      return (
        <div className="border border-gray-300 bg-gray-50 p-6 flex flex-col items-center justify-center min-h-[360px] space-y-3">
          <img
            src={app.photoUrl}
            alt={app.applicantName}
            className="w-44 h-56 object-cover border border-gray-300 bg-white"
          />
          <span className="font-mono text-[11px] text-gray-600">{doc.fileName}</span>
        </div>
      );
    }

    const key = `${doc.name} ${doc.fileName} ${doc.type}`.toLowerCase();

    // 1. Realistic ID Card / Passport Bio Page Preview
    if (
      doc.isIdProof ||
      key.includes("passeport") ||
      key.includes("cni") ||
      key.includes("identit") ||
      key.includes("electeur")
    ) {
      const mrzName = app.applicantName.toUpperCase().replace(/[^A-Z0-9]+/g, "<").slice(0, 26);
      const mrzRef = app.trackingId.replace(/[^A-Z0-9]/g, "").slice(0, 12);
      return (
        <div className="border border-gray-300 bg-slate-50 p-4 space-y-4">
          <div className="bg-white border border-slate-300 overflow-hidden shadow-xs">
            <div className="h-1.5 w-full flex">
              <div className="flex-1 bg-blue-600" />
              <div className="w-1/4 bg-amber-400" />
              <div className="w-1/4 bg-rose-600" />
            </div>
            <div className="px-4 py-2.5 bg-slate-800 text-white flex items-center justify-between text-[11px]">
              <span className="font-bold tracking-wider uppercase">
                {isFr ? "République Démocratique du Congo" : "Democratic Republic of the Congo"}
              </span>
              <span className="font-mono text-slate-300">{doc.fileName}</span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-24 h-28 bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 overflow-hidden">
                {app.photoUrl ? (
                  <img
                    src={app.photoUrl}
                    alt={app.applicantName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs min-w-0">
                <div className="col-span-2">
                  <div className="text-[10px] uppercase text-gray-400">
                    {isFr ? "Titulaire / Nom Complet" : "Holder / Full Name"}
                  </div>
                  <div className="font-bold text-gray-900 truncate">{app.applicantName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">
                    {isFr ? "N° Document" : "Document No."}
                  </div>
                  <div className="font-mono font-semibold text-blue-700 truncate">
                    {app.idProofSummary.primaryIdNumber}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">
                    {isFr ? "Nationalité" : "Nationality"}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {app.idProofSummary.nationality || "Congolaise"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">
                    {isFr ? "Date de Naissance" : "Birth Date"}
                  </div>
                  <div className="text-gray-800">{app.idProofSummary.birthDate || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">
                    {isFr ? "Lieu de Naissance" : "Birth Place"}
                  </div>
                  <div className="text-gray-800 truncate">{app.idProofSummary.birthPlace || app.city}</div>
                </div>
                {app.idProofSummary.secondaryIdNumber && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase text-gray-400">
                      {isFr ? "Visa / Référence" : "Secondary / Visa Ref"}
                    </div>
                    <div className="font-mono text-gray-700 truncate">
                      {app.idProofSummary.secondaryIdNumber}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 font-mono text-[10px] tracking-widest text-slate-600 truncate">
              P&lt;COD{mrzName}&lt;&lt;&lt;&lt;&lt;&lt; &bull; {mrzRef}&lt;COD
            </div>
          </div>
        </div>
      );
    }

    // 2. Realistic Official Employment Contract Sheet
    if (key.includes("contrat") || key.includes("onem") || key.includes("travail")) {
      return (
        <div className="border border-gray-300 bg-gray-100 p-4">
          <div className="bg-white border border-gray-300 p-5 space-y-4 text-xs shadow-xs">
            <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-gray-800">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {isFr ? "Office National de l'Emploi (ONEM)" : "National Employment Office (ONEM)"}
                </div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{doc.name}</div>
              </div>
              <span className="font-mono text-[10px] bg-gray-100 border border-gray-300 px-2 py-1 text-gray-600">
                {doc.fileName}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-gray-600">
              {isFr
                ? "Le présent contrat est conclu entre l'entreprise employeur ci-dessous et l'employé désigné, soumis au visa de l'Inspection du Travail et de l'ONEM."
                : "This employment agreement is executed between the employer and employee identified below, stamped for provincial labor inspection."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 border border-gray-200 p-3">
              <div>
                <div className="text-[10px] uppercase text-gray-400">{isFr ? "Employeur" : "Employer"}</div>
                <div className="font-semibold text-gray-900">
                  {app.details["Employer"] || "Entreprise Enregistrée (RCCM)"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-gray-400">{isFr ? "Employé" : "Employee"}</div>
                <div className="font-semibold text-gray-900">{app.applicantName}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-gray-400">{isFr ? "Poste & Secteur" : "Position & Sector"}</div>
                <div className="text-gray-800">
                  {app.details["Job / Sector"] || app.details["Occupation"] || app.serviceTitle}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-gray-400">{isFr ? "Lieu d'affectation" : "Work Location"}</div>
                <div className="text-gray-800">{app.collectionPoint}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-gray-300 flex items-center justify-between text-[11px] text-gray-500">
              <span>{isFr ? "Réf. Dossier" : "Ref"}: {app.trackingId}</span>
              <span className="border border-blue-700 text-blue-700 font-bold px-2 py-0.5 uppercase text-[10px]">
                {isFr ? "Visé ONEM • Copie Numérique" : "ONEM Visa • Uploaded Copy"}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 3. Realistic CV / Diploma / Academic Sheet
    if (key.includes("cv") || key.includes("diplom") || key.includes("scolaire") || key.includes("etude")) {
      return (
        <div className="border border-gray-300 bg-gray-100 p-4">
          <div className="bg-white border border-gray-300 p-5 space-y-4 text-xs shadow-xs">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-300">
              <div>
                <div className="text-sm font-bold text-gray-900">{app.applicantName}</div>
                <div className="text-[11px] text-gray-600 mt-0.5">
                  {app.details["Job / Sector"] || app.details["Occupation"] || doc.name}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {app.phone} &bull; {app.email} &bull; {app.city}
                </div>
              </div>
              <span className="font-mono text-[10px] bg-gray-100 border border-gray-300 px-2 py-1 text-gray-600">
                {doc.fileName}
              </span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div className="font-bold uppercase tracking-wider text-gray-500">
                {isFr ? "Pièce Académique / Qualification Légalisée" : "Legalized Qualification & Dossier"}
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">{isFr ? "Intitulé :" : "Document:"}</span>
                  <span className="font-semibold text-gray-900 text-right">{doc.name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">{isFr ? "Profession / Titre :" : "Qualification:"}</span>
                  <span className="text-gray-800 text-right">
                    {app.details["Occupation"] || app.details["Job / Sector"] || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">{isFr ? "Naissance :" : "Birth:"}</span>
                  <span className="text-gray-800 text-right">
                    {[app.idProofSummary.birthDate, app.idProofSummary.birthPlace].filter(Boolean).join(" • ") || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
              <span>{isFr ? "Soumis le" : "Submitted"}: {app.submittedAt}</span>
              <span className="font-semibold text-gray-700 border border-gray-400 px-2 py-0.5 uppercase text-[10px]">
                {isFr ? "Copie Certifiée Conforme" : "Certified True Copy"}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 4. Realistic Medical / Hospital Attestation Sheet
    if (key.includes("medic") || key.includes("sante") || key.includes("aptitude") || key.includes("hopital")) {
      return (
        <div className="border border-gray-300 bg-gray-100 p-4">
          <div className="bg-white border border-gray-300 p-5 space-y-4 text-xs shadow-xs">
            <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-emerald-700">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {isFr ? "Ministère de la Santé Publique" : "Ministry of Public Health"}
                </div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{doc.name}</div>
              </div>
              <span className="font-mono text-[10px] bg-gray-100 border border-gray-300 px-2 py-1 text-gray-600">
                {doc.fileName}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/40 border border-emerald-200 space-y-2 text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">{isFr ? "Patient / Sujet :" : "Subject:"}</span>
                <span className="font-bold text-gray-900">{app.applicantName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">{isFr ? "Établissement / Médecin :" : "Facility / Doctor:"}</span>
                <span className="text-gray-800 text-right">
                  {app.details["Hospital / Doctor"] || `Centre Médical Agréé (${app.city})`}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">{isFr ? "Pièce d'identité :" : "ID Reference:"}</span>
                <span className="font-mono text-gray-800">{app.idProofSummary.primaryIdNumber}</span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-gray-600 italic">
              {isFr
                ? "Atteste que l'intéressé(e) a subi les examens réglementaires requis pour le dossier administratif concerné."
                : "Certifies that the named applicant completed the required medical examination for administrative clearance."}
            </p>

            <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
              <span>{app.city} &bull; {app.submittedAt}</span>
              <span className="border border-emerald-700 text-emerald-700 font-bold px-2 py-0.5 uppercase text-[10px]">
                {isFr ? "Cachet Médical Valide" : "Physician Stamp"}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 5. Realistic Official Civil / Administrative Paper Certificate Fallback
    return (
      <div className="border border-gray-300 bg-gray-100 p-4">
        <div className="bg-white border border-gray-300 p-5 space-y-4 text-xs shadow-xs">
          <div className="flex items-start justify-between gap-2 pb-3 border-b-2 border-blue-800">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                {isFr ? "République Démocratique du Congo • Pièce Jointe" : "DR Congo • Supporting Attestation"}
              </div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">{doc.name}</div>
            </div>
            <span className="font-mono text-[10px] bg-gray-100 border border-gray-300 px-2 py-1 text-gray-600 shrink-0">
              {doc.fileName}
            </span>
          </div>

          <div className="divide-y divide-gray-200 text-xs">
            <div className="py-2 flex justify-between gap-3">
              <span className="text-gray-500">{isFr ? "Titulaire :" : "Holder:"}</span>
              <span className="font-bold text-gray-900">{app.applicantName}</span>
            </div>
            <div className="py-2 flex justify-between gap-3">
              <span className="text-gray-500">{isFr ? "Service :" : "Service:"}</span>
              <span className="text-gray-800 text-right">{app.serviceTitle}</span>
            </div>
            <div className="py-2 flex justify-between gap-3">
              <span className="text-gray-500">{isFr ? "Réf. ID :" : "ID Reference:"}</span>
              <span className="font-mono text-gray-900">{app.idProofSummary.primaryIdNumber}</span>
            </div>
            {app.details["Quarter Chief / Utility"] && (
              <div className="py-2 flex justify-between gap-3">
                <span className="text-gray-500">{isFr ? "Quartier / Compteur :" : "Quarter / Utility:"}</span>
                <span className="text-gray-800 text-right">{app.details["Quarter Chief / Utility"]}</span>
              </div>
            )}
            <div className="py-2 flex justify-between gap-3">
              <span className="text-gray-500">{isFr ? "Autorité / Bureau :" : "Issuing Office:"}</span>
              <span className="text-gray-800 text-right">{app.collectionPoint}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span>{app.trackingId} &bull; {app.submittedAt}</span>
            <span className="border border-gray-400 text-gray-700 font-semibold px-2 py-0.5 uppercase text-[10px]">
              {isFr ? "Document Soumis" : "Submitted Record"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /* ====================================================================== */
  /* VIEW A: SERVICE DROPDOWN + PAGINATED LIST (10 PER PAGE)                */
  /* ====================================================================== */
  if (!openedApp) {
    const startIdx =
      pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const endIdx = Math.min(
      pagination.page * pagination.limit,
      pagination.totalItems
    );

    return (
      <div>
        {/* Integrated Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="min-w-[230px] md:w-72">
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
              {isFr ? "Service" : "Select Service"}
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => {
                setSelectedServiceId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-gray-500 text-xs font-semibold text-gray-900 cursor-pointer"
            >
              <option value="all">
                {isFr
                  ? `Tous les services (${serviceCounts.all || 0})`
                  : `All Services (${serviceCounts.all || 0})`}
              </option>
              {ALL_SERVICES_DROPDOWN.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {isFr ? srv.fr : srv.en} ({serviceCounts[srv.id] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
              {isFr ? "Recherche" : "Search"}
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 focus-within:border-gray-500">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  isFr ? "N° de suivi ou nom du citoyen..." : "Tracking ID or citizen name..."
                }
                className="w-full text-xs bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="min-w-[180px] md:w-52 shrink-0">
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">
              {isFr ? "Statut" : "Status"}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | "pending" | "verified");
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-gray-500 text-xs font-semibold text-gray-900 cursor-pointer"
            >
              <option value="all">
                {isFr ? `Tous (${statusCounts.all})` : `All (${statusCounts.all})`}
              </option>
              <option value="pending">
                {isFr ? `À vérifier (${statusCounts.pending})` : `Pending (${statusCounts.pending})`}
              </option>
              <option value="verified">
                {isFr ? `Vérifiés (${statusCounts.verified})` : `Verified (${statusCounts.verified})`}
              </option>
            </select>
          </div>
        </div>

        {/* Integrated Applications Table (10 items per page) */}
        <div>
          {loadingList ? (
            <div className="p-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500 mx-auto" />
              <p className="text-xs text-gray-500">
                {isFr ? "Chargement..." : "Loading applications..."}
              </p>
            </div>
          ) : listItems.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">
                {isFr
                  ? "Aucune demande trouvée pour ce filtre."
                  : "No applications found for this filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse lg:table-fixed">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    <th className="py-2.5 px-4 whitespace-nowrap lg:w-[16%]">
                      {isFr ? "N° Suivi" : "Tracking ID"}
                    </th>
                    <th className="py-2.5 px-4 lg:w-[20%]">
                      {isFr ? "Citoyen" : "Citizen"}
                    </th>
                    <th className="py-2.5 px-4 lg:w-[23%]">
                      {isFr ? "Service" : "Service"}
                    </th>
                    <th className="py-2.5 px-4 hidden md:table-cell lg:w-[19%]">
                      {isFr ? "Ville / Centre" : "City / Office"}
                    </th>
                    <th className="py-2.5 px-4 whitespace-nowrap hidden sm:table-cell lg:w-[10%]">
                      {isFr ? "Date Soumise" : "Submitted Date"}
                    </th>
                    <th className="py-2.5 px-4 text-left whitespace-nowrap lg:w-[12%]">
                      {isFr ? "Statut" : "Status"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {listItems.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <tr
                        key={app.trackingId}
                        tabIndex={0}
                        onClick={() => handleOpenApplication(app)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenApplication(app);
                          }
                        }}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                          <span className="font-mono text-xs font-bold text-blue-700">
                            {app.trackingId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-bold text-gray-900">
                            {app.applicantName}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {app.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-medium text-gray-800">
                            {app.serviceTitle}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {app.serviceCode}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-middle hidden md:table-cell">
                          <div className="text-gray-800">{app.city}</div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {app.collectionPoint !== app.city
                              ? app.collectionPoint
                              : app.idProofSummary.primaryIdNumber}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 align-middle hidden sm:table-cell">
                          {app.submittedAt}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-block text-[11px] font-semibold px-3 py-1 border ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Server-Side Pagination Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-gray-600">
              {isFr
                ? `Affichage ${startIdx}–${endIdx} sur ${pagination.totalItems} demandes`
                : `Showing ${startIdx}–${endIdx} of ${pagination.totalItems} applications`}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!pagination.hasPrev || loadingList}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{isFr ? "Précédent" : "Previous"}</span>
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    disabled={loadingList}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 border font-medium cursor-pointer ${
                      pagination.page === pageNum
                        ? "bg-gray-600 text-white border-gray-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={!pagination.hasNext || loadingList}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                <span>{isFr ? "Suivant" : "Next"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* VIEW B: SIDE-BY-SIDE COMPARE (LEFT CITIZEN | RIGHT UPLOADED DOC) + SIGN*/
  /* ====================================================================== */
  const canVerify =
    openedApp.status === "submitted" || openedApp.status === "in_review";
  const activeDoc =
    openedApp.supportingDocuments[activeDocIndex] ||
    openedApp.supportingDocuments[0];

  return (
    <div>
      {/* Integrated Sub-header */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-700">
            {openedApp.trackingId}
          </span>
          <span className="text-gray-300">&bull;</span>
          <span className="text-xs font-bold text-gray-900">
            {openedApp.serviceTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 border ${
              getStatusBadge(openedApp.status).cls
            }`}
          >
            {getStatusBadge(openedApp.status).label}
          </span>
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="px-4 py-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2 no-print">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectApp(null)}
            className="text-xs font-semibold underline cursor-pointer shrink-0"
          >
            {isFr ? "Dossier suivant" : "Next Application"}
          </button>
        </div>
      )}

      {/* SIDE-BY-SIDE 50/50 COMPARISON INSIDE SINGLE UNIFIED CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-gray-200 border-b border-gray-200">
            {/* LEFT: CITIZEN DETAILS */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    {isFr ? "Détails du Citoyen" : "Citizen Details"}
                  </h3>
                </div>
                <span className="text-[11px] text-gray-500">
                  {openedApp.submittedAt}
                </span>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-gray-50 border border-gray-200">
                {openedApp.photoUrl ? (
                  <img
                    src={openedApp.photoUrl}
                    alt={openedApp.applicantName}
                    className="w-16 h-20 object-cover border border-gray-300 shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-16 h-20 bg-white border border-gray-300 flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-gray-300" />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-bold text-gray-900">
                    {openedApp.applicantName}
                  </div>
                  {openedApp.issuedNumber ? (
                    <div className="font-mono text-xs text-blue-700 font-semibold">
                      {openedApp.issuedNumber}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500">
                      {isFr
                        ? "N° ID généré après signature d'approbation"
                        : "ID number generated after Approver signs"}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 truncate">
                    {openedApp.phone} &bull; {openedApp.email}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 text-xs">
                {Object.entries(openedApp.details)
                  .filter(([, val]) => Boolean(val))
                  .map(([label, val]) => (
                    <div
                      key={label}
                      className="py-2 flex items-start justify-between gap-4"
                    >
                      <span className="text-gray-500 shrink-0">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {val}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* RIGHT: UPLOADED DOCUMENTS & ID PROOF (SCALABLE SELECTOR FOR 10+ DOCS) */}
            <div className="p-5 space-y-4 flex flex-col border-t lg:border-t-0 border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    {isFr
                      ? "Documents & ID Proof Téléversés"
                      : "Uploaded Documents & ID Proof"}
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-gray-500">
                  {openedApp.supportingDocuments.length > 0
                    ? `${activeDocIndex + 1} / ${openedApp.supportingDocuments.length}`
                    : `0 ${isFr ? "fichiers" : "files"}`}
                </span>
              </div>

              {openedApp.supportingDocuments.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <select
                    value={activeDocIndex}
                    onChange={(e) => setActiveDocIndex(Number(e.target.value))}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 bg-white focus:border-gray-500 text-xs font-semibold text-gray-900 cursor-pointer"
                  >
                    {openedApp.supportingDocuments.map((doc, idx) => (
                      <option key={idx} value={idx}>
                        {idx + 1}. {doc.name}
                        {doc.isIdProof ? " [ID Proof]" : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={activeDocIndex <= 0}
                    onClick={() => setActiveDocIndex((i) => Math.max(0, i - 1))}
                    title={isFr ? "Document précédent" : "Previous document"}
                    className="h-[34px] w-9 inline-flex items-center justify-center border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      activeDocIndex >= openedApp.supportingDocuments.length - 1
                    }
                    onClick={() =>
                      setActiveDocIndex((i) =>
                        Math.min(openedApp.supportingDocuments.length - 1, i + 1)
                      )
                    }
                    title={isFr ? "Document suivant" : "Next document"}
                    className="h-[34px] w-9 inline-flex items-center justify-center border border-gray-300 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 cursor-pointer disabled:cursor-not-allowed shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex-1">
                {renderInlineDocumentPreview(openedApp, activeDoc)}
              </div>
            </div>
          </div>

          {/* BOTTOM: SIGN & CONFIRM SECTION (CLEAN, NO DRAW/STAMP/APPLY) */}
          {canVerify ? (
            <div className="p-5 space-y-4 no-print">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-600" />
                <span>
                  {isFr ? "Signer & Confirmer" : "Sign & Confirm"}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-300 cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={docsChecked}
                    onChange={(e) => setDocsChecked(e.target.checked)}
                    className="w-4 h-4 text-gray-700"
                  />
                  <span className="font-medium text-gray-800">
                    {isFr
                      ? "Informations citoyen & documents conformes"
                      : "Citizen details & uploaded documents match"}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-300 cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={idProofChecked}
                    onChange={(e) => setIdProofChecked(e.target.checked)}
                    className="w-4 h-4 text-gray-700"
                  />
                  <span className="font-medium text-gray-800">
                    {isFr
                      ? "Pièce d'identité (ID Proof) valide"
                      : "ID Proof verified & valid"}
                  </span>
                </label>
              </div>

              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  isFr ? "Observation (optionnel)..." : "Verification note (optional)..."
                }
                className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 focus:border-gray-500"
              />

              <SignaturePad
                language={language}
                officerName={officer.fullName}
                officerId={officer.officerId}
                roleTitle={isFr ? "Vérificateur" : "Verification Officer"}
                value={signatureData}
                onChange={setSignatureData}
              />

              {rejectionMode && (
                <div className="p-3 bg-rose-50 border border-rose-300 space-y-2">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={
                      isFr ? "Motif du rejet..." : "Enter rejection reason..."
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-300"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSubmitVerification("reject")}
                      className="px-3.5 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      {isFr ? "Confirmer le Rejet" : "Confirm Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectionMode(false)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs text-gray-800 cursor-pointer"
                    >
                      {isFr ? "Annuler" : "Cancel"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                {!rejectionMode && (
                  <button
                    type="button"
                    onClick={() => setRejectionMode(true)}
                    className="px-3.5 py-2 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium cursor-pointer"
                  >
                    {isFr ? "Rejeter" : "Reject"}
                  </button>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitVerification("verify_and_sign")}
                  className="ml-auto px-6 py-2.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isFr ? "Confirmer" : "Confirm"}</span>
                </button>
              </div>
            </div>
          ) : openedApp.status === "rejected" ? (
            <div className="p-5 bg-rose-50 flex items-center gap-2.5 text-xs text-rose-900">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                <strong>{isFr ? "Rejeté :" : "Rejected:"}</strong>{" "}
                {openedApp.workflow.rejectionReason || openedApp.statusNotesFr}
              </span>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 flex items-center justify-between gap-3 text-xs text-emerald-900">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {isFr
                    ? `Vérifié et signé par ${
                        openedApp.workflow.verificationOfficerName || "Vérificateur"
                      }.`
                    : `Verified & signed by ${
                        openedApp.workflow.verificationOfficerName || "Verification Officer"
                      }.`}
                </span>
              </div>
              {openedApp.workflow.verificationSignature && (
                <img
                  src={openedApp.workflow.verificationSignature}
                  alt="Signature"
                  className="h-10 bg-white px-2 py-0.5 border border-emerald-300 object-contain shrink-0"
                />
              )}
            </div>
          )}
    </div>
  );
};
