"use client";

import React, { useState } from "react";
import {
  ApplicationWorkflowData,
  CitizenApplication,
  Language,
  OfficerApplicationRecord,
} from "@/types";
import {
  CheckCircle2,
  FileText,
  IdCard,
  Printer,
  QrCode,
  UserCheck,
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

export const SignedDocumentAndIdProofViewer: React.FC<
  SignedDocumentAndIdProofViewerProps
> = ({ application, language, defaultMode = "both", showPrintButton = true }) => {
  const isFr = language === "fr";
  const [viewMode, setViewMode] = useState<"both" | "document" | "id_proof">(
    defaultMode
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
      ? `CD-CERT-${application.trackingId.slice(-6)}`
      : null);

  const photoUrl = application.photoUrl || null;
  const idProofSummary = application.idProofSummary || {
    labelFr: "Pièce d'Identité Certifiée",
    labelEn: "Certified Identity Proof",
    primaryIdNumber: issuedNumber || application.trackingId,
    secondaryIdNumber: null,
    holderName: application.applicantName,
    birthDate: null,
    birthPlace: application.city,
    nationality: "Congolaise",
    address: application.collectionPoint || application.city,
  };

  const ministryName = isFullRecord(application)
    ? isFr
      ? application.ministryFr
      : application.ministryEn
    : isFr
    ? "République Démocratique du Congo"
    : "Democratic Republic of the Congo";

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

  const renderSignaturesGrid = () => (
    <div className="pt-4 border-t border-slate-200 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Verification Officer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1.5">
            <span>{isFr ? "1. Vérification" : "1. Verification"}</span>
            {hasVerificationSig && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className="h-14 bg-white rounded-lg border border-slate-200 flex items-center justify-center px-2 overflow-hidden">
            {wf.verificationSignature ? (
              <img
                src={wf.verificationSignature}
                alt="Verification Signature"
                className="max-h-12 object-contain"
              />
            ) : (
              <span className="text-[10px] text-slate-400">
                {isFr ? "En attente" : "Pending"}
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[10px] text-slate-700 font-medium truncate">
            {wf.verificationOfficerName || "—"}
          </div>
          {wf.verifiedAt && (
            <div className="text-[9px] text-slate-400">
              {formatShortDate(wf.verifiedAt)}
            </div>
          )}
        </div>

        {/* 2. Approver Officer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1.5">
            <span>{isFr ? "2. Approbation" : "2. Approver"}</span>
            {hasApproverSig && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            )}
          </div>
          <div className="h-14 bg-white rounded-lg border border-slate-200 flex items-center justify-center px-2 overflow-hidden">
            {wf.approverSignature ? (
              <img
                src={wf.approverSignature}
                alt="Approver Signature"
                className="max-h-12 object-contain"
              />
            ) : (
              <span className="text-[10px] text-slate-400">
                {isFr ? "En attente" : "Pending"}
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[10px] text-slate-700 font-medium truncate">
            {wf.approverOfficerName || "—"}
          </div>
          {wf.approvedAt && (
            <div className="text-[9px] text-slate-400">
              {formatShortDate(wf.approvedAt)}
            </div>
          )}
        </div>
      </div>

      {/* 3. Head of Service Seal (shown concisely when present or approved) */}
      {(wf.headSignature || application.status === "ready") && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-indigo-900">
                {isFr ? "3. Chef de Service" : "3. Head of Service"}
              </div>
              <div className="text-[10px] text-slate-600 truncate">
                {wf.headOfficerName || "—"}
              </div>
            </div>
          </div>
          {wf.headSignature && (
            <img
              src={wf.headSignature}
              alt="Head Signature"
              className="h-9 bg-white px-2 py-0.5 rounded border border-indigo-200 object-contain shrink-0"
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode("both")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              viewMode === "both"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isFr ? "Document + ID" : "Document + ID Proof"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("document")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              viewMode === "document"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isFr ? "Document" : "Document"}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("id_proof")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              viewMode === "id_proof"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isFr ? "ID Proof" : "ID Proof"}
          </button>
        </div>

        {showPrintButton && (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isFr ? "Imprimer" : "Print"}</span>
          </button>
        )}
      </div>

      {/* Document & ID Proof Grid */}
      <div
        className={`grid gap-4 ${
          viewMode === "both" ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* 1. OFFICIAL DOCUMENT */}
        {(viewMode === "both" || viewMode === "document") && (
          <div className="print-clean-page bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="h-1 w-full flex">
                <div className="flex-1 bg-[#007fff]" />
                <div className="w-1/6 bg-[#fcd116]" />
                <div className="w-1/6 bg-[#ce1126]" />
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="/logo.png"
                      alt="RDC"
                      className="w-9 h-9 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {isFr ? "Document Officiel" : "Official Document"}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {application.serviceTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{ministryName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[11px] font-bold text-slate-900">
                      {issuedNumber || application.trackingId}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {application.submittedAt}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">
                      {isFr ? "Bénéficiaire" : "Beneficiary"}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {application.applicantName}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">
                      {isFr ? "Référence" : "Reference"}
                    </span>
                    <span className="font-mono text-slate-800">
                      {application.trackingId}
                    </span>
                  </div>
                  <div className="col-span-2 p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">
                      {isFr ? "Centre de délivrance" : "Issuing Office"}
                    </span>
                    <span className="text-slate-800">
                      {application.collectionPoint || application.city}
                    </span>
                  </div>
                </div>

                {renderSignaturesGrid()}
              </div>
            </div>

            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
                {application.trackingId}
              </span>
              <span className={bothSigned ? "text-emerald-700 font-semibold" : ""}>
                {bothSigned
                  ? isFr
                    ? "Signé (1 & 2)"
                    : "Signed (1 & 2)"
                  : isFr
                  ? "En attente"
                  : "In progress"}
              </span>
            </div>
          </div>
        )}

        {/* 2. CITIZEN ID PROOF */}
        {(viewMode === "both" || viewMode === "id_proof") && (
          <div className="print-clean-page bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="h-1 w-full flex">
                <div className="flex-1 bg-[#007fff]" />
                <div className="w-1/6 bg-[#fcd116]" />
                <div className="w-1/6 bg-[#ce1126]" />
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <IdCard className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        {isFr ? "Pièce d'Identité (ID Proof)" : "Identity Proof"}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {idProofSummary.holderName}
                      </h4>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      bothSigned
                        ? "bg-emerald-50 text-emerald-700"
                        : wf.idProofVerified
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {bothSigned
                      ? isFr
                        ? "Approuvé"
                        : "Approved"
                      : wf.idProofVerified
                      ? isFr
                        ? "Vérifié"
                        : "Verified"
                      : isFr
                      ? "En attente"
                      : "Pending"}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50">
                  <div className="w-16 h-20 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={application.applicantName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        {isFr ? "N° Identité / NIN" : "ID / NIN"}
                      </span>
                      <span className="font-mono font-bold text-slate-900 break-all">
                        {idProofSummary.primaryIdNumber}
                      </span>
                    </div>
                    {idProofSummary.secondaryIdNumber && (
                      <div className="font-mono text-[11px] text-slate-600 truncate">
                        {idProofSummary.secondaryIdNumber}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 truncate">
                      {idProofSummary.nationality || "Congolaise"} •{" "}
                      {idProofSummary.birthPlace || application.city}
                    </div>
                  </div>
                </div>

                {renderSignaturesGrid()}
              </div>
            </div>

            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-mono">{application.trackingId}</span>
              <span className={bothSigned ? "text-emerald-700 font-semibold" : ""}>
                {bothSigned
                  ? isFr
                    ? "ID Signé (1 & 2)"
                    : "ID Signed (1 & 2)"
                  : isFr
                  ? "En attente"
                  : "In progress"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
