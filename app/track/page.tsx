"use client";

import React, { useState, useEffect, Suspense, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Language, OfficerApplicationRecord, OfficerAuditEntry } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignedDocumentAndIdProofViewer } from "@/components/officer/SignedDocumentAndIdProofViewer";
import { getLocalizedServiceTitle } from "@/data/services";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  MapPin,
  ArrowRight,
  Printer,
  Loader2,
  FileText,
  ShieldCheck,
  Award,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  User,
  Calendar,
  Hash,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";

function TrackApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  const [query, setQuery] = useState("");
  const [activeApplication, setActiveApplication] = useState<OfficerApplicationRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<OfficerAuditEntry[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  // Check URL query param on mount (e.g. /track?id=CD-2026-EMP-119844)
  useEffect(() => {
    const paramId = searchParams.get("id") || searchParams.get("trackingId");
    if (paramId && paramId.trim()) {
      setQuery(paramId.trim());
      executeLookup(paramId.trim());
    }
  }, [searchParams]);

  const executeLookup = async (idToSearch: string) => {
    const clean = idToSearch.trim();
    if (!clean) return;

    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(clean)}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setActiveApplication(data.application);
          setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
          return;
        }
      }

      const errData = await res.json().catch(() => null);
      setActiveApplication(null);
      setAuditLogs([]);
      setErrorMessage(
        isFr
          ? errData?.error || "Aucun dossier trouvé pour cette référence dans le registre national."
          : errData?.errorEn || "No application found for this reference code in the national registry."
      );
    } catch (err) {
      console.error("Error fetching tracking data:", err);
      setActiveApplication(null);
      setAuditLogs([]);
      setErrorMessage(
        isFr
          ? "Erreur de connexion au registre national. Veuillez réessayer."
          : "Connection error to the national registry. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/track?id=${encodeURIComponent(query.trim())}`);
      executeLookup(query.trim());
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrackingId(true);
    setTimeout(() => setCopiedTrackingId(false), 2000);
  };

  const getStepIndex = (status: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          labelFr: "Document Officiel Prêt / Délivré",
          labelEn: "Official Document Ready / Issued",
        };
      case "approved":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-600",
          labelFr: "Dossier Approuvé (Double Signature Officielle)",
          labelEn: "Approved (Dual Official E-Signatures)",
        };
      case "verified":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-500",
          labelFr: "Vérifié & Signé (Étape 1 Contrôle)",
          labelEn: "Verified & Signed (Tier 1 Control)",
        };
      case "rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          labelFr: "Dossier Rejeté / Non Conforme",
          labelEn: "Application Rejected / Non-Compliant",
        };
      case "in_review":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          labelFr: "En Cours d'Instruction Administrative",
          labelEn: "Under Administrative Review",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          labelFr: "Demande Enregistrée",
          labelEn: "Application Registered",
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Top Sovereign Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab="track"
        onTabChange={(tab) => {
          if (tab === "track") return;
          router.push(`/?tab=${tab}`);
        }}
        onOpenOfficerPortal={() => router.push("/officer")}
      />

      <main className="flex-1 pt-24 sm:pt-[105px] pb-24">
        {/* National Flag Tricolor Ribbon */}
        <div className="h-1.5 w-full flex no-print">
          <div className="flex-1 bg-[#007fff]" />
          <div className="w-1/6 bg-[#fcd116]" />
          <div className="w-1/6 bg-[#ce1126]" />
        </div>

        {/* HERO BANNER */}
        <section className="relative bg-gradient-to-b from-blue-50/70 via-white to-slate-50/50 border-b border-slate-200/80 py-10 sm:py-14 overflow-hidden no-print">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-3">
            {/* National Seal & Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>
                {isFr
                  ? "Guichet Unique Numérique • République Démocratique du Congo"
                  : "National Digital Portal • Democratic Republic of the Congo"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isFr ? (
                <>
                  Suivi Officiel de{" "}
                  <span className="text-blue-600">votre Démarche Administrative</span>
                </>
              ) : (
                <>
                  Official{" "}
                  <span className="text-blue-600">Application Status Tracking</span>
                </>
              )}
            </h1>

            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {isFr
                ? "Consultez en direct l'avancement de votre dossier, le contrôle de vos pièces justificatives, les signatures électroniques des officiers et l'attribution de votre document officiel."
                : "Track in real-time your application progress, verification of supporting documents, official officer e-signatures, and document issuance."}
            </p>

            {/* SEARCH BOX */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-4">
              <div className="flex items-center gap-2 bg-white border-2 border-blue-600/70 rounded-2xl p-2 shadow-lg shadow-blue-500/5 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                <Search className="w-5 h-5 text-blue-600 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isFr
                      ? "Entrez votre code de suivi (ex: CD-2026-EMP-119844) ou numéro d'acte..."
                      : "Enter tracking reference (e.g. CD-2026-EMP-119844) or document number..."
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none px-2 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm shrink-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isFr ? "Recherche..." : "Tracking..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isFr ? "Rechercher" : "Track"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* MAIN BODY CONTAINER */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          {/* SKELETON LOADING STATE */}
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs animate-pulse space-y-6">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="grid grid-cols-4 gap-4 pt-4">
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-20 bg-slate-100 rounded-xl" />
              </div>
            </div>
          )}

          {/* APPLICATION FOUND VIEW */}
          {!isLoading && activeApplication && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* TOP APPLICATION SUMMARY CARD */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg inline-flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-blue-500" />
                        <span>{activeApplication.trackingId}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeApplication.trackingId)}
                        className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                        title={isFr ? "Copier le code" : "Copy reference"}
                      >
                        {copiedTrackingId ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">{isFr ? "Copié" : "Copied"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>{isFr ? "Copier" : "Copy"}</span>
                          </>
                        )}
                      </button>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isFr ? "Déposé le : " : "Submitted on: "}{activeApplication.submittedAt}</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      {getLocalizedServiceTitle(
                        activeApplication.serviceId,
                        activeApplication.serviceTitle,
                        language
                      )}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {activeApplication.ministryFr}
                    </p>
                  </div>

                  {/* STATUS BADGE */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 shrink-0">
                    {(() => {
                      const badge = getStatusBadge(activeApplication.status);
                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          <span>{isFr ? badge.labelFr : badge.labelEn}</span>
                        </div>
                      );
                    })()}

                    {activeApplication.issuedNumber && (
                      <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {isFr ? "N° d'Acte Officiel : " : "Issued Official Ref: "}
                        <strong>{activeApplication.issuedNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4-STAGE INTERACTIVE WORKFLOW STEPPER */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {isFr ? "Parcours d'instruction & signatures officielles" : "Workflow Milestones & Official Signatures"}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Step 1 */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        getStepIndex(activeApplication.status) >= 1
                          ? "bg-blue-50/50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold mb-1">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            getStepIndex(activeApplication.status) >= 1 ? "text-blue-600" : "text-slate-300"
                          }`}
                        />
                        <span className={getStepIndex(activeApplication.status) >= 1 ? "text-slate-900" : "text-slate-400"}>
                          {isFr ? "1. Dépôt Initial" : "1. Initial Filing"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {isFr ? "Dossier numérique transmis et enregistré" : "Digital dossier logged on portal"}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 font-mono">
                        {activeApplication.submittedAt}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        getStepIndex(activeApplication.status) >= 2
                          ? "bg-blue-50/50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold mb-1">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            getStepIndex(activeApplication.status) >= 2 ? "text-blue-600" : "text-slate-300"
                          }`}
                        />
                        <span className={getStepIndex(activeApplication.status) >= 2 ? "text-slate-900" : "text-slate-400"}>
                          {isFr ? "2. Contrôle & Signature 1" : "2. Verification Signed"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {activeApplication.workflow?.verificationOfficerName ? (
                          <span className="font-medium text-slate-700">
                            {activeApplication.workflow.verificationOfficerName}
                          </span>
                        ) : (
                          isFr ? "Officier de Contrôle" : "Verification Officer"
                        )}
                      </p>
                      <div className="mt-2 text-[10px] text-blue-700 font-medium">
                        {activeApplication.workflow?.docsVerified ? (
                          isFr ? "Pièces & ID validées" : "Docs & ID Verified"
                        ) : (
                          isFr ? "En attente" : "Pending"
                        )}
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        getStepIndex(activeApplication.status) >= 3
                          ? "bg-blue-50/50 border-blue-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold mb-1">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            getStepIndex(activeApplication.status) >= 3 ? "text-blue-600" : "text-slate-300"
                          }`}
                        />
                        <span className={getStepIndex(activeApplication.status) >= 3 ? "text-slate-900" : "text-slate-400"}>
                          {isFr ? "3. Approbation & Signature 2" : "3. Approver Dual-Signed"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {activeApplication.workflow?.approverOfficerName ? (
                          <span className="font-medium text-slate-700">
                            {activeApplication.workflow.approverOfficerName}
                          </span>
                        ) : (
                          isFr ? "Officier d'Approbation" : "Approver Officer"
                        )}
                      </p>
                      <div className="mt-2 text-[10px] text-blue-700 font-medium">
                        {activeApplication.workflow?.approverCheckedDocs ? (
                          isFr ? "Double signature validée" : "Dual signatures affixed"
                        ) : (
                          isFr ? "En attente" : "Pending"
                        )}
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        getStepIndex(activeApplication.status) >= 4
                          ? "bg-emerald-50/70 border-emerald-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold mb-1">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            getStepIndex(activeApplication.status) >= 4 ? "text-emerald-600" : "text-slate-300"
                          }`}
                        />
                        <span className={getStepIndex(activeApplication.status) >= 4 ? "text-slate-900" : "text-slate-400"}>
                          {isFr ? "4. Chef de Service / Délivrance" : "4. Issued & Collection"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {activeApplication.issuedNumber ? (
                          isFr ? "Document officiel scellé" : "Official document sealed"
                        ) : (
                          isFr ? "Attribution du numéro officiel" : "Final issuance pending"
                        )}
                      </p>
                      <div className="mt-2 text-[10px] text-emerald-700 font-medium">
                        {activeApplication.status === "ready"
                          ? (isFr ? "Disponible au guichet" : "Ready at collection hub")
                          : (isFr ? "En finalisation" : "In completion")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OFFICER NOTES & INSTRUCTIONS */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{isFr ? "Décision & Remarques Administratives :" : "Administrative Notes & Decision:"}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-normal leading-relaxed pl-6">
                    {isFr ? activeApplication.statusNotesFr : activeApplication.statusNotesEn}
                  </p>

                  <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        {isFr ? "Centre de délivrance & retrait : " : "Collection Office: "}
                        <strong className="text-slate-800 font-semibold">{activeApplication.collectionPoint}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeApplication.city}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-500">
                    {isFr
                      ? "Présentez ce numéro et votre pièce d'identité originale lors du retrait au guichet provincial."
                      : "Present this tracking code and original ID document upon collection at the regional office."}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>{isFr ? "Imprimer le récépissé" : "Print Receipt"}</span>
                    </button>
                    <Link
                      href="/#services"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>{isFr ? "Autre démarche" : "Other service"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* CITIZEN DOSSIER & DOCUMENT VERIFICATION CARD */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2 COLS: APPLICANT IDENTITY & DETAILS */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>{isFr ? "Informations du Demandeur" : "Applicant Details"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">{isFr ? "Nom Complet :" : "Full Name:"}</span>
                      <strong className="text-slate-800 font-semibold">{activeApplication.applicantName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">{isFr ? "Téléphone :" : "Phone:"}</span>
                      <span className="text-slate-800 font-medium">{activeApplication.phone || "—"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">{isFr ? "Courriel :" : "Email:"}</span>
                      <span className="text-slate-800 font-medium">{activeApplication.email || "—"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">{isFr ? "Ville / Province :" : "City / Province:"}</span>
                      <span className="text-slate-800 font-medium">{activeApplication.city}</span>
                    </div>

                    {activeApplication.idProofSummary.primaryIdNumber && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block mb-0.5">
                          {isFr ? activeApplication.idProofSummary.labelFr : activeApplication.idProofSummary.labelEn} :
                        </span>
                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px] font-medium">
                          {activeApplication.idProofSummary.primaryIdNumber}
                          {activeApplication.idProofSummary.secondaryIdNumber && ` • ${activeApplication.idProofSummary.secondaryIdNumber}`}
                        </span>
                      </div>
                    )}

                    {activeApplication.idProofSummary.address && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block mb-0.5">{isFr ? "Adresse Déclarée :" : "Declared Address:"}</span>
                        <span className="text-slate-700 font-normal">{activeApplication.idProofSummary.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 1 COL: SUPPORTING DOCUMENTS CHECKLIST */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{isFr ? "Pièces Justificatives Déposées" : "Submitted Documents"}</span>
                  </div>

                  <div className="space-y-2.5">
                    {activeApplication.supportingDocuments && activeApplication.supportingDocuments.length > 0 ? (
                      activeApplication.supportingDocuments.map((doc, idx) => (
                        <div
                          key={doc.id || idx}
                          className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              activeApplication.workflow?.docsVerified ? "text-emerald-600" : "text-blue-500"
                            }`}
                          />
                          <div className="min-w-0">
                            <span className="font-medium text-slate-800 block truncate">{doc.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">
                              {doc.fileName}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        {isFr ? "Aucune pièce supplémentaire requise." : "No additional documents required."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* LIVE OFFICIAL SIGNED DOCUMENT & ID PROOF VIEWER (ONLY WHEN ALL PROCESSES COMPLETED) */}
              {activeApplication.status === "ready" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>
                        {isFr
                          ? "Visualisation du Document Officiel Délivré & Scellé"
                          : "Official Issued & Sealed Document"}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isFr ? "Toutes les étapes validées" : "All Processes Completed"}</span>
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <SignedDocumentAndIdProofViewer
                      application={activeApplication}
                      language={language}
                      defaultMode="both"
                      showPrintButton={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 md:p-8 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm md:text-base font-bold text-slate-900">
                      {isFr
                        ? "Document officiel en cours de traitement administratif"
                        : "Official Document Under Administrative Processing"}
                    </h4>
                    <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                      {isFr
                        ? "La visualisation, le téléchargement et l'impression du document officiel définitif ne sont accessibles qu'une fois l'ensemble des étapes administratives validées et scellées par le Chef de Service (Étape 4 : Prêt & Délivrance)."
                        : "Viewing, downloading, and printing the final official document will only be accessible once all administrative workflow stages are fully completed and sealed by the Chief of Service (Step 4: Issued & Ready for Collection)."}
                    </p>
                  </div>
                  <div className="pt-1 flex items-center justify-center gap-2 text-xs text-amber-800 font-medium">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>
                      {isFr
                        ? "Statut actuel : En cours de validation administrative (Étape 4 en attente)"
                        : "Current status: In administrative workflow (Step 4 pending)"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* APPLICATION NOT FOUND / ERROR VIEW */}
          {!isLoading && hasSearched && !activeApplication && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {isFr ? "Dossier introuvable dans le registre" : "Application not found in register"}
                </h3>
                <p className="text-xs text-slate-600 font-normal max-w-md mx-auto leading-relaxed">
                  {errorMessage ||
                    (isFr
                      ? "Veuillez vérifier que la référence correspond exactement au récépissé officiel (ex: CD-2026-EMP-119844) ou effectuer une nouvelle démarche."
                      : "Please check that your reference code matches your official filing receipt (e.g. CD-2026-EMP-119844) or submit a new application.")}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/#services"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <span>{isFr ? "Commencer une nouvelle démarche" : "Start New Application"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}

export default function TrackApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <TrackApplicationContent />
    </Suspense>
  );
}
