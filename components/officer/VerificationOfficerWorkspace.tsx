"use client";

import React, { useMemo, useState } from "react";
import {
  ApplicationStatus,
  Language,
  OfficerApplicationRecord,
  OfficerProfile,
  SupportingDocumentItem,
} from "@/types";
import { SignaturePad } from "@/components/officer/SignaturePad";
import { SignedDocumentAndIdProofViewer } from "@/components/officer/SignedDocumentAndIdProofViewer";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  IdCard,
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

interface VerificationOfficerWorkspaceProps {
  language: Language;
  officer: OfficerProfile;
  applications: OfficerApplicationRecord[];
  onApplicationUpdated: (updated: OfficerApplicationRecord) => Promise<void> | void;
}

export const VerificationOfficerWorkspace: React.FC<
  VerificationOfficerWorkspaceProps
> = ({ language, officer, applications, onApplicationUpdated }) => {
  const isFr = language === "fr";

  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"pending" | "verified" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [openedTrackingId, setOpenedTrackingId] = useState<string | null>(null);

  // Side-by-side right document selector
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
  const [showSignedPreview, setShowSignedPreview] = useState(false);

  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    for (const app of applications) {
      counts[app.serviceId] = (counts[app.serviceId] || 0) + 1;
    }
    return counts;
  }, [applications]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      if (selectedServiceId !== "all" && app.serviceId !== selectedServiceId) {
        return false;
      }
      if (statusFilter === "pending") {
        if (app.status !== "submitted" && app.status !== "in_review") return false;
      } else if (statusFilter === "verified") {
        if (app.status === "submitted" || app.status === "in_review") return false;
      }
      if (q) {
        return (
          app.trackingId.toLowerCase().includes(q) ||
          app.applicantName.toLowerCase().includes(q) ||
          app.serviceTitle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, selectedServiceId, statusFilter, searchQuery]);

  const openedApp = useMemo(() => {
    if (!openedTrackingId) return null;
    return applications.find((a) => a.trackingId === openedTrackingId) || null;
  }, [applications, openedTrackingId]);

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
    setShowSignedPreview(false);
  };

  const handleOpenApplication = (trackingId: string) => {
    resetReviewForm();
    setOpenedTrackingId(trackingId);
  };

  const handleSubmitVerification = async (action: "verify_and_sign" | "reject") => {
    if (!openedApp) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (action === "verify_and_sign") {
      if (!docsChecked || !idProofChecked) {
        setErrorMsg(
          isFr
            ? "Veuillez confirmer que les informations citoyen et les documents / ID proof correspondent."
            : "Please confirm both Citizen Details / Documents and ID Proof are correct."
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

      await onApplicationUpdated(data.application);
      setSignatureData(null);
      setRejectionMode(false);

      if (action === "verify_and_sign") {
        setSuccessMsg(
          isFr
            ? "Dossier vérifié et signé. Votre signature est apposée sur le Document et l'ID Proof."
            : "Verified and signed. Your signature has been placed on the Document and ID Proof."
        );
        setShowSignedPreview(true);
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
          cls: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "verified":
        return {
          label: isFr ? "Vérifié & Signé" : "Verified & Signed",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "approved":
        return {
          label: isFr ? "Approuvé" : "Approved",
          cls: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "ready":
        return {
          label: isFr ? "Délivré" : "Ready",
          cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "rejected":
        return {
          label: isFr ? "Rejeté" : "Rejected",
          cls: "bg-rose-50 text-rose-700 border-rose-200",
        };
    }
  };

  const renderInlineDocumentPreview = (
    app: OfficerApplicationRecord,
    doc: SupportingDocumentItem | undefined
  ) => {
    if (!doc) {
      return (
        <div className="h-72 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-xs text-slate-400">
          <FileText className="w-8 h-8 mb-2 text-slate-300" />
          <span>{isFr ? "Aucun document joint" : "No attachment selected"}</span>
        </div>
      );
    }

    // 1. Real uploaded binary file (image or PDF)
    if (doc.dataUrl) {
      if (doc.dataUrl.startsWith("data:application/pdf")) {
        return (
          <iframe
            src={doc.dataUrl}
            title={doc.fileName}
            className="w-full h-[420px] rounded-xl border border-slate-200 bg-white"
          />
        );
      }
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 flex items-center justify-center min-h-[320px] max-h-[440px] overflow-auto">
          <img
            src={doc.dataUrl}
            alt={doc.fileName}
            className="max-w-full max-h-[400px] rounded-lg object-contain shadow-xs"
          />
        </div>
      );
    }

    // 2. Photo slot with citizen photoUrl
    if (
      (doc.type === "photo" ||
        doc.type === "photo_oaci" ||
        doc.fileName.toLowerCase().includes("photo")) &&
      app.photoUrl
    ) {
      return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center min-h-[320px] space-y-3">
          <img
            src={app.photoUrl}
            alt={app.applicantName}
            className="w-44 h-56 rounded-xl object-cover border-2 border-blue-200 shadow-xs bg-white"
          />
          <span className="font-mono text-xs text-slate-600">{doc.fileName}</span>
        </div>
      );
    }

    // 3. Structured digital attachment view for filename-only / demo-fill records
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4 min-h-[320px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  doc.isIdProof
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {doc.isIdProof ? (
                  <IdCard className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {doc.isIdProof
                    ? isFr
                      ? "Pièce d'Identité (ID Proof)"
                      : "Uploaded ID Proof"
                    : isFr
                    ? "Document Téléversé"
                    : "Uploaded Document"}
                </div>
                <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
              </div>
            </div>
            <span className="font-mono text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700">
              {doc.fileName}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
              <span className="text-slate-400">
                {isFr ? "Titulaire :" : "Holder:"}
              </span>
              <span className="font-bold text-slate-900">{app.applicantName}</span>
            </div>
            <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
              <span className="text-slate-400">
                {isFr ? "Réf. Dossier :" : "Tracking ID:"}
              </span>
              <span className="font-mono font-semibold text-blue-700">
                {app.trackingId}
              </span>
            </div>
            <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
              <span className="text-slate-400">
                {isFr ? "N° Pièce / ID Proof :" : "ID Proof Ref:"}
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {app.idProofSummary.primaryIdNumber}
              </span>
            </div>
            {app.idProofSummary.secondaryIdNumber && (
              <div className="flex justify-between gap-3 py-1 border-b border-slate-100">
                <span className="text-slate-400">
                  {isFr ? "Réf. Secondaire :" : "Secondary Ref:"}
                </span>
                <span className="font-mono text-slate-700">
                  {app.idProofSummary.secondaryIdNumber}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-3 py-1">
              <span className="text-slate-400">
                {isFr ? "Centre / Ville :" : "Office / City:"}
              </span>
              <span className="text-slate-700 text-right">{app.collectionPoint}</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          {isFr
            ? "Document enregistré au dépôt du dossier. Comparez les références ci-dessus avec les informations citoyen à gauche."
            : "Document logged at submission. Compare the attachment details above with the citizen details on the left."}
        </p>
      </div>
    );
  };

  /* ====================================================================== */
  /* VIEW A: SERVICE DROPDOWN + FULL LIST BELOW                             */
  /* ====================================================================== */
  if (!openedApp) {
    const pendingCount = applications.filter(
      (a) => a.status === "submitted" || a.status === "in_review"
    ).length;
    const verifiedCount = applications.filter(
      (a) => a.status !== "submitted" && a.status !== "in_review"
    ).length;

    return (
      <div className="space-y-4">
        {/* Top Filter Bar: All Services Dropdown + Status + Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="min-w-[240px] sm:w-72">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                {isFr ? "Service" : "Select Service"}
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 text-xs font-semibold text-slate-900 cursor-pointer"
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
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                {isFr ? "Recherche" : "Search"}
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-blue-500">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isFr ? "N° de suivi ou nom du citoyen..." : "Tracking ID or citizen name..."
                  }
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "pending"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isFr ? `À vérifier (${pendingCount})` : `Pending (${pendingCount})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("verified")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "verified"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isFr ? `Vérifiés (${verifiedCount})` : `Verified (${verifiedCount})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isFr ? `Tous (${applications.length})` : `All (${applications.length})`}
              </button>
            </div>
          </div>
        </div>

        {/* Applications List Below */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              {isFr ? "Liste des Demandes" : "Applications List"} ({filteredList.length})
            </span>
            <span className="text-slate-500">
              {isFr
                ? "Cliquez sur une ligne pour comparer les détails et les documents"
                : "Click any row to compare citizen details & uploaded documents"}
            </span>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                {isFr
                  ? "Aucune demande trouvée pour ce filtre."
                  : "No applications found for this filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredList.map((app) => {
                const badge = getStatusBadge(app.status);
                return (
                  <button
                    key={app.trackingId}
                    type="button"
                    onClick={() => handleOpenApplication(app.trackingId)}
                    className="w-full text-left px-5 py-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 min-w-0">
                      <span className="font-mono text-xs font-bold text-blue-700 shrink-0 w-40">
                        {app.trackingId}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {app.applicantName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {app.serviceTitle} • {app.city}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-[11px] text-slate-400">
                        {app.supportingDocuments.length}{" "}
                        {isFr ? "pièces" : "docs"} • {app.submittedAt}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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
    <div className="space-y-4">
      {/* Top Bar with Back Button */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpenedTrackingId(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isFr ? "Retour à la liste" : "Back to List"}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700">
                {openedApp.trackingId}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-900">
                {openedApp.serviceTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              getStatusBadge(openedApp.status).cls
            }`}
          >
            {getStatusBadge(openedApp.status).label}
          </span>
          {openedApp.workflow.verificationSignature && (
            <button
              type="button"
              onClick={() => setShowSignedPreview((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium cursor-pointer"
            >
              {showSignedPreview
                ? isFr
                  ? "Comparaison"
                  : "Back to Compare"
                : isFr
                ? "Voir Document & ID Signés"
                : "View Signed Doc & ID"}
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 no-print">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpenedTrackingId(null)}
            className="text-xs font-semibold underline cursor-pointer shrink-0"
          >
            {isFr ? "Dossier suivant" : "Next Application"}
          </button>
        </div>
      )}

      {showSignedPreview ? (
        <SignedDocumentAndIdProofViewer
          application={openedApp}
          language={language}
          defaultMode="both"
          showPrintButton={true}
        />
      ) : (
        <>
          {/* SIDE-BY-SIDE 50/50 COMPARISON */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* LEFT: CITIZEN DETAILS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {isFr ? "Détails du Citoyen" : "Citizen Details"}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {openedApp.submittedAt}
                </span>
              </div>

              {/* Citizen Photo + Primary Header */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                {openedApp.photoUrl ? (
                  <img
                    src={openedApp.photoUrl}
                    alt={openedApp.applicantName}
                    className="w-16 h-20 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-16 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-slate-300" />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-bold text-slate-900">
                    {openedApp.applicantName}
                  </div>
                  <div className="font-mono text-xs text-blue-700 font-semibold">
                    {openedApp.idProofSummary.primaryIdNumber}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {openedApp.phone} • {openedApp.email}
                  </div>
                </div>
              </div>

              {/* Structured Citizen Key-Value Comparison Grid */}
              <div className="divide-y divide-slate-100 text-xs">
                {Object.entries(openedApp.details)
                  .filter(([, val]) => Boolean(val))
                  .map(([label, val]) => (
                    <div
                      key={label}
                      className="py-2 flex items-start justify-between gap-4"
                    >
                      <span className="text-slate-500 shrink-0">{label}</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {val}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* RIGHT: UPLOADED DOCUMENTS & ID PROOF */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {isFr
                      ? "Documents & ID Proof Téléversés"
                      : "Uploaded Documents & ID Proof"}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  {openedApp.supportingDocuments.length}{" "}
                  {isFr ? "fichiers" : "files"}
                </span>
              </div>

              {/* Document Selector Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {openedApp.supportingDocuments.map((doc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveDocIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      activeDocIndex === idx
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {doc.isIdProof ? (
                      <IdCard className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span className="truncate max-w-[180px]">{doc.name}</span>
                  </button>
                ))}
              </div>

              {/* Inline Document / ID Proof Comparison Canvas */}
              <div className="flex-1">
                {renderInlineDocumentPreview(openedApp, activeDoc)}
              </div>
            </div>
          </div>

          {/* BOTTOM: VERIFY & SIGN PANEL */}
          {canVerify ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 no-print">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>
                    {isFr
                      ? "Validation & Signature — Officier de Vérification"
                      : "Confirm & Sign — 1. Verification Officer"}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-300">
                  <input
                    type="checkbox"
                    checked={docsChecked}
                    onChange={(e) => setDocsChecked(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-medium text-slate-800">
                    {isFr
                      ? "Informations citoyen & documents conformes"
                      : "Citizen details & uploaded documents match"}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-300">
                  <input
                    type="checkbox"
                    checked={idProofChecked}
                    onChange={(e) => setIdProofChecked(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-medium text-slate-800">
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
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500"
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
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={
                      isFr ? "Motif du rejet..." : "Enter rejection reason..."
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSubmitVerification("reject")}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      {isFr ? "Confirmer le Rejet" : "Confirm Reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectionMode(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                  >
                    {isFr ? "Rejeter" : "Reject"}
                  </button>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitVerification("verify_and_sign")}
                  className="ml-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isFr ? "Vérifier & Signer" : "Verify & Sign"}</span>
                </button>
              </div>
            </div>
          ) : openedApp.status === "rejected" ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-2.5 text-xs text-rose-900">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                <strong>{isFr ? "Rejeté :" : "Rejected:"}</strong>{" "}
                {openedApp.workflow.rejectionReason || openedApp.statusNotesFr}
              </span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-900">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {isFr
                    ? `Déjà vérifié et signé par ${
                        openedApp.workflow.verificationOfficerName || "Vérificateur"
                      }.`
                    : `Already verified & signed by ${
                        openedApp.workflow.verificationOfficerName || "Verification Officer"
                      }.`}
                </span>
              </div>
              {openedApp.workflow.verificationSignature && (
                <img
                  src={openedApp.workflow.verificationSignature}
                  alt="Signature"
                  className="h-10 bg-white px-2 py-0.5 rounded border border-emerald-200 object-contain shrink-0"
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
