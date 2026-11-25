"use client";

import React, { useState } from "react";
import { CitizenApplication, Language } from "../../types";
import { SignedDocumentAndIdProofViewer } from "../officer/SignedDocumentAndIdProofViewer";
import { getLocalizedServiceTitle } from "../../data/services";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  ArrowRight,
  Printer,
  Loader2,
} from "lucide-react";

interface TrackingSectionProps {
  language: Language;
  applications: CitizenApplication[];
  initialTrackingId?: string;
  onNewApplicationClick: () => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  language,
  applications,
  initialTrackingId = "",
  onNewApplicationClick,
}) => {
  const isFr = language === "fr";
  const [query, setQuery] = useState(initialTrackingId);
  const [activeResult, setActiveResult] = useState<CitizenApplication | null>(() => {
    if (initialTrackingId) {
      return (
        applications.find(
          (a) => a.trackingId.toLowerCase() === initialTrackingId.trim().toLowerCase()
        ) || null
      );
    }
    return applications[0] || null;
  });

  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = async (searchText: string) => {
    const clean = searchText.trim();
    if (!clean) return;
    setHasSearched(true);
    setIsSearching(true);

    try {
      const res = await fetch(
        `/api/officer/applications?trackingId=${encodeURIComponent(clean)}&publicLookup=1`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setActiveResult(data.application);
          return;
        }
      }
    } catch (err) {
      console.error("Live tracking lookup error:", err);
    } finally {
      setIsSearching(false);
    }

    const lower = clean.toLowerCase();
    const found = applications.find(
      (a) =>
        a.trackingId.toLowerCase() === lower ||
        a.applicantName.toLowerCase().includes(lower)
    );
    setActiveResult(found || null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const getStepIndex = (status: CitizenApplication["status"]) => {
    switch (status) {
      case "submitted":
      case "in_review":
        return 1;
      case "verified":
        return 2;
      case "approved":
        return 3;
      case "ready":
        return 4;
      case "rejected":
        return 2;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-medium text-slate-900 tracking-tight">
          {isFr ? "Suivi en direct de votre démarche" : "Live Application Status Tracking"}
        </h2>
        <p className="text-xs text-slate-500 font-normal max-w-lg mx-auto">
          {isFr
            ? "Saisissez la référence de suivi transmise lors de votre dépôt (ex: CD-2026-849201) pour consulter l'état d'avancement de votre dossier."
            : "Enter the reference code provided upon submission (e.g. CD-2026-849201) to check real-time progress."}
        </p>

        {/* Input box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-4">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1.5 shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder={isFr ? "Ex: CD-2026-849201" : "Ex: CD-2026-849201"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isFr ? "Rechercher" : "Track"}</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
            <span>{isFr ? "Exemples :" : "Quick examples:"}</span>
            {applications.slice(0, 3).map((app) => (
              <button
                key={app.trackingId}
                type="button"
                onClick={() => {
                  setQuery(app.trackingId);
                  setActiveResult(app);
                  setHasSearched(true);
                }}
                className="font-mono text-blue-600 hover:underline cursor-pointer"
              >
                {app.trackingId}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Result Card */}
      {activeResult ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          {/* Top meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  {activeResult.trackingId}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{activeResult.submittedAt}</span>
              </div>
              <h3 className="text-base font-medium text-slate-900">
                {getLocalizedServiceTitle(activeResult.serviceId, activeResult.serviceTitle, language)}
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {isFr ? "Bénéficiaire : " : "Applicant: "}
                <span className="text-slate-800 font-medium">{activeResult.applicantName}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  activeResult.status === "ready"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : activeResult.status === "approved"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : activeResult.status === "verified"
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : activeResult.status === "rejected"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : activeResult.status === "in_review"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>
                  {activeResult.status === "ready"
                    ? isFr
                      ? "Document & ID Proof délivrés"
                      : "Document & ID Proof Ready"
                    : activeResult.status === "approved"
                    ? isFr
                      ? "Approuvé (Double Signature)"
                      : "Approved (Dual Signed)"
                    : activeResult.status === "verified"
                    ? isFr
                      ? "Vérifié & Signé (Étape 1)"
                      : "Verified & Signed (Tier 1)"
                    : activeResult.status === "rejected"
                    ? isFr
                      ? "Dossier rejeté"
                      : "Rejected"
                    : activeResult.status === "in_review"
                    ? isFr
                      ? "En cours d'instruction"
                      : "In Administrative Review"
                    : isFr
                    ? "Demande enregistrée"
                    : "Application Received"}
                </span>
              </span>
            </div>
          </div>

          {/* Stepper progress */}
          <div>
            <div className="text-xs font-medium text-slate-700 uppercase tracking-wider mb-4">
              {isFr ? "Parcours d'avancement" : "Application Milestones"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div
                className={`p-3.5 rounded-xl border ${
                  getStepIndex(activeResult.status) >= 1
                    ? "bg-blue-50/40 border-blue-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      getStepIndex(activeResult.status) >= 1 ? "text-blue-600" : "text-slate-300"
                    }`}
                  />
                  <span className={getStepIndex(activeResult.status) >= 1 ? "text-slate-900" : "text-slate-400"}>
                    {isFr ? "1. Dépôt Initial" : "1. Submission"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {isFr ? "Dossier numérique téléversé" : "Digital dossier logged"}
                </p>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3.5 rounded-xl border ${
                  getStepIndex(activeResult.status) >= 2
                    ? "bg-blue-50/40 border-blue-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      getStepIndex(activeResult.status) >= 2 ? "text-blue-600" : "text-slate-300"
                    }`}
                  />
                  <span className={getStepIndex(activeResult.status) >= 2 ? "text-slate-900" : "text-slate-400"}>
                    {isFr ? "2. Vérification & Signature 1" : "2. Verification Officer Signed"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {isFr ? "Contrôle document + ID proof & signature" : "Documents & ID proof verified + signed"}
                </p>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3.5 rounded-xl border ${
                  getStepIndex(activeResult.status) >= 3
                    ? "bg-blue-50/40 border-blue-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      getStepIndex(activeResult.status) >= 3 ? "text-blue-600" : "text-slate-300"
                    }`}
                  />
                  <span className={getStepIndex(activeResult.status) >= 3 ? "text-slate-900" : "text-slate-400"}>
                    {isFr ? "3. Approbation & Signature 2" : "3. Approver Signed & Approved"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {isFr ? "Double signature sur Document + ID Proof" : "Dual signatures on Document & ID Proof"}
                </p>
              </div>

              {/* Step 4 */}
              <div
                className={`p-3.5 rounded-xl border ${
                  getStepIndex(activeResult.status) >= 4
                    ? "bg-emerald-50/60 border-emerald-300"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      getStepIndex(activeResult.status) >= 4 ? "text-emerald-600" : "text-slate-300"
                    }`}
                  />
                  <span className={getStepIndex(activeResult.status) >= 4 ? "text-slate-900" : "text-slate-400"}>
                    {isFr ? "4. Chef de Service / Retrait" : "4. Head of Service Issued"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {isFr ? "Document & ID Proof scellés et prêts" : "Final sealed Document & ID Proof ready"}
                </p>
              </div>
            </div>
          </div>

          {/* Officer remarks & Collection center */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div>
              <div className="text-xs font-medium text-slate-700 mb-1">
                {isFr ? "Notification administrative en temps réel :" : "Administrative Officer Notes:"}
              </div>
              <p className="text-xs text-slate-600 font-normal leading-relaxed">
                {isFr ? activeResult.statusNotesFr : activeResult.statusNotesEn}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isFr ? "Lieu de retrait : " : "Collection Point: "}
                  <strong className="font-medium text-slate-800">{activeResult.collectionPoint}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeResult.city}</span>
              </div>
            </div>
          </div>

          {/* Action to print receipt */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 font-normal">
              {isFr
                ? "Présentez ce numéro et une pièce d'identité originale lors du retrait."
                : "Present this number with original ID upon collection."}
            </span>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isFr ? "Imprimer le récépissé" : "Print Receipt"}</span>
            </button>
          </div>

          {/* Live Signed Document & ID Proof when workflow signatures exist */}
          {activeResult.workflow &&
            (activeResult.workflow.verificationSignature ||
              activeResult.workflow.approverSignature ||
              activeResult.status === "verified" ||
              activeResult.status === "approved" ||
              activeResult.status === "ready") && (
              <div className="pt-4 border-t border-slate-200">
                <SignedDocumentAndIdProofViewer
                  application={activeResult}
                  language={language}
                  defaultMode="both"
                  showPrintButton={false}
                />
              </div>
            )}
        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="text-sm font-medium text-slate-800">
            {isFr ? "Aucun dossier trouvé pour cette référence" : "No dossier found for this reference"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
            {isFr
              ? "Vérifiez que le code correspond au format officiel (ex: CD-2026-849201) ou commencez une nouvelle démarche en ligne."
              : "Check the reference format (e.g. CD-2026-849201) or start a new application online."}
          </p>
          <button
            onClick={onNewApplicationClick}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <span>{isFr ? "Effectuer une démarche" : "Start New Application"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
};
