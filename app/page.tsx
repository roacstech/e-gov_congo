"use client";

import React, { useState, useMemo } from "react";
import { Language, ServiceCategory, ServiceItem, CitizenApplication } from "../types";
import { SERVICES_DATA, CATEGORIES, SAMPLE_APPLICATIONS } from "../data/services";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ServiceCard } from "../components/services/ServiceCard";
import { ServiceDetailModal } from "../components/services/ServiceDetailModal";
import { ApplicationModal } from "../components/services/ApplicationModal";
import { TrackingSection } from "../components/tracking/TrackingSection";
import { VerificationSection } from "../components/verification/VerificationSection";
import { FaqSection } from "../components/faq/FaqSection";
import { OfficerPortalModal } from "../components/officer/OfficerPortalModal";
import {
  Search,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

export default function Home() {
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  const [activeTab, setActiveTab] = useState<"services" | "track" | "verify" | "faq">("services");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);
  const [applyService, setApplyService] = useState<ServiceItem | null>(null);
  const [isOfficerPortalOpen, setIsOfficerPortalOpen] = useState(false);

  // Applications live state (persisting new applications during user session)
  const [applications, setApplications] = useState<CitizenApplication[]>(SAMPLE_APPLICATIONS);
  const [activeTrackingId, setActiveTrackingId] = useState<string>("CD-2026-849201");

  // Filtering services
  const filteredServices = useMemo(() => {
    let list = SERVICES_DATA;
    if (selectedCategory !== "all") {
      list = list.filter((s) => s.category === selectedCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.titleFr.toLowerCase().includes(q) ||
          s.titleEn.toLowerCase().includes(q) ||
          s.descriptionFr.toLowerCase().includes(q) ||
          s.descriptionEn.toLowerCase().includes(q) ||
          s.ministryFr.toLowerCase().includes(q) ||
          s.ministryEn.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Handler when citizen completes submission
  const handleApplicationSubmitted = (newApp: CitizenApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    setActiveTrackingId(newApp.trackingId);
  };

  // Handler for officer status update
  const handleOfficerUpdateStatus = (
    trackingId: string,
    newStatus: CitizenApplication["status"],
    notes: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.trackingId === trackingId) {
          return {
            ...app,
            status: newStatus,
            statusNotesFr: notes,
            statusNotesEn: notes,
          };
        }
        return app;
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenOfficerPortal={() => setIsOfficerPortalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. LIGHT, GENTLE CIVIC HERO SECTION (No dark banner, refined typography) */}
        {/* ========================================================================= */}
        <section className="bg-white border-b border-slate-200/80 pt-12 pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
            {/* National Republic Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-blue-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>
                {isFr
                  ? "République Démocratique du Congo • Portail des Services Numériques"
                  : "Democratic Republic of the Congo • Digital Public Services"}
              </span>
            </div>

            {/* Clear, gentle heading - no harsh bold */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
              {isFr ? (
                <>
                  L'administration publique simplifiée pour{" "}
                  <span className="font-medium text-blue-700">tous les citoyens</span>
                </>
              ) : (
                <>
                  Public administration simplified for{" "}
                  <span className="font-medium text-blue-700">every citizen</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-2xl mx-auto leading-relaxed">
              {isFr
                ? "Délivrance d'actes d'état civil, carte d'identité, passeport, permis de conduire et certificats juridiques sans attente superflue."
                : "Issuance of civil registry acts, national ID cards, passports, driver's licenses, and legal certificates with ease."}
            </p>

            {/* Clean Hero Search */}
            <div className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-xs p-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isFr
                      ? "Rechercher un service (ex: Passeport, Naissance, Permis, Casier judiciaire...)"
                      : "Search a service (e.g. Passport, Birth certificate, ID card...)"
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== "services") setActiveTab("services");
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 mr-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (activeTab !== "services") setActiveTab("services");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {isFr ? "Trouver" : "Search"}
                </button>
              </div>

              {/* Fast quick links */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-slate-500">
                <span className="text-slate-400">{isFr ? "Fréquents :" : "Popular:"}</span>
                {["CNI", "Passeport", "Casier Judiciaire", "Acte de Naissance", "Permis"].map(
                  (item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(item);
                        setActiveTab("services");
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200/70 text-slate-600 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 3 Calm Quick Action Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-6 text-left">
              <div
                onClick={() => setActiveTab("services")}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-800 group-hover:text-blue-700">
                      {isFr ? "12 Démarches en ligne" : "12 Online Procedures"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      {isFr ? "Catalogue complet" : "Complete directory"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("track")}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-800 group-hover:text-emerald-700">
                      {isFr ? "Suivre un dossier" : "Track Application"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      {isFr ? "Statut en temps réel" : "Real-time timeline"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("verify")}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-800 group-hover:text-indigo-700">
                      {isFr ? "Vérifier un document" : "Verify Document"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      {isFr ? "Certificat QR officiel" : "Official QR security"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. TABBED CONTENT SECTION */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* TAB 1: SERVICES DIRECTORY */}
          {activeTab === "services" && (
            <div className="space-y-6">
              {/* Category Pills Filter */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as ServiceCategory)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-slate-900 text-white font-medium"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {isFr ? cat.labelFr : cat.labelEn}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-500 font-normal">
                  <span>
                    {filteredServices.length}{" "}
                    {isFr ? "services disponibles" : "available services"}
                  </span>
                </div>
              </div>

              {/* Service Cards Grid */}
              {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      language={language}
                      onSelect={(srv) => setDetailService(srv)}
                      onApply={(srv) => setApplyService(srv)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
                  <p className="text-xs text-slate-500 font-normal">
                    {isFr
                      ? "Aucun service ne correspond à votre recherche."
                      : "No services match your search."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                  >
                    {isFr ? "Réinitialiser les filtres" : "Reset filters"}
                  </button>
                </div>
              )}

              {/* Citizen Workflow 4-Step Guide */}
              <div className="mt-14 bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
                <div className="text-center max-w-md mx-auto mb-6">
                  <span className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">
                    {isFr ? "Processus Dématérialisé" : "Online Procedure"}
                  </span>
                  <h3 className="text-base font-medium text-slate-900 mt-1">
                    {isFr ? "Comment obtenir votre document en 4 étapes" : "How to obtain your document in 4 steps"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-[11px]">
                      1
                    </div>
                    <div className="font-medium text-slate-800">
                      {isFr ? "Sélectionnez le service" : "Select Service"}
                    </div>
                    <p className="text-slate-500 font-normal leading-relaxed">
                      {isFr
                        ? "Consultez les pièces requises et tarifs légaux applicables."
                        : "Review required attachments and regulated fees."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-[11px]">
                      2
                    </div>
                    <div className="font-medium text-slate-800">
                      {isFr ? "Dépôt en ligne sécurisé" : "Secure Online Filing"}
                    </div>
                    <p className="text-slate-500 font-normal leading-relaxed">
                      {isFr
                        ? "Renseignez vos données et téléversez vos justificatifs."
                        : "Fill in your details and upload supporting documents."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-[11px]">
                      3
                    </div>
                    <div className="font-medium text-slate-800">
                      {isFr ? "Instruction administrative" : "Administrative Review"}
                    </div>
                    <p className="text-slate-500 font-normal leading-relaxed">
                      {isFr
                        ? "Vérification d'authenticité par l'officier de service."
                        : "Document verification performed by civil service officers."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium text-[11px]">
                      4
                    </div>
                    <div className="font-medium text-slate-800">
                      {isFr ? "Retrait ou téléchargement" : "Collection or Download"}
                    </div>
                    <p className="text-slate-500 font-normal leading-relaxed">
                      {isFr
                        ? "Récupérez votre document muni du QR Code souverain."
                        : "Collect or download your document with verified sovereign QR."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TRACKING */}
          {activeTab === "track" && (
            <TrackingSection
              language={language}
              applications={applications}
              initialTrackingId={activeTrackingId}
              onNewApplicationClick={() => {
                setActiveTab("services");
              }}
            />
          )}

          {/* TAB 3: DOCUMENT VERIFICATION */}
          {activeTab === "verify" && <VerificationSection language={language} />}

          {/* TAB 4: HELP & FAQ */}
          {activeTab === "faq" && <FaqSection language={language} />}
        </section>
      </main>

      {/* Modals & Dialogs */}
      <ServiceDetailModal
        service={detailService}
        language={language}
        onClose={() => setDetailService(null)}
        onApply={(srv) => {
          setDetailService(null);
          setApplyService(srv);
        }}
      />

      <ApplicationModal
        service={applyService}
        language={language}
        onClose={() => setApplyService(null)}
        onSubmitted={handleApplicationSubmitted}
        onTrackNow={(trackId) => {
          setActiveTrackingId(trackId);
          setActiveTab("track");
        }}
      />

      <OfficerPortalModal
        isOpen={isOfficerPortalOpen}
        language={language}
        applications={applications}
        onClose={() => setIsOfficerPortalOpen(false)}
        onUpdateStatus={handleOfficerUpdateStatus}
      />

      {/* Simple, neat Footer */}
      <Footer language={language} />
    </div>
  );
}
