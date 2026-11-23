"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Language, ServiceCategory, ServiceItem, CitizenApplication } from "../../types";
import { SERVICES_DATA, CATEGORIES, SAMPLE_APPLICATIONS } from "../../data/services";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { ServiceCard } from "../../components/services/ServiceCard";
import { ServiceDetailModal } from "../../components/services/ServiceDetailModal";
import { ApplicationModal } from "../../components/services/ApplicationModal";
import { OfficerPortalModal } from "../../components/officer/OfficerPortalModal";
import {
  Search,
  SlidersHorizontal,
  X,
  FileCheck2,
  Clock,
  ShieldCheck,
  Building,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function ServicesPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyPopular, setOnlyPopular] = useState(false);

  // Modals state
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);
  const [applyService, setApplyService] = useState<ServiceItem | null>(null);
  const [isOfficerPortalOpen, setIsOfficerPortalOpen] = useState(false);

  // Applications
  const [applications, setApplications] = useState<CitizenApplication[]>(SAMPLE_APPLICATIONS);

  // Filtering logic
  const filteredServices = useMemo(() => {
    let list = SERVICES_DATA;
    if (selectedCategory !== "all") {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (onlyOnline) {
      list = list.filter((s) => s.isOnlineAvailable);
    }
    if (onlyPopular) {
      list = list.filter((s) => s.popular);
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
  }, [selectedCategory, searchQuery, onlyOnline, onlyPopular]);

  const handleApplicationSubmitted = (newApp: CitizenApplication) => {
    setApplications((prev) => [newApp, ...prev]);
  };

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
        activeTab="services"
        onTabChange={(tab) => {
          if (tab === "services") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            router.push(`/?tab=${tab}`);
          }
        }}
        onOpenOfficerPortal={() => setIsOfficerPortalOpen(true)}
        onPresidencyClick={() => router.push("/#presidential-vision")}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-[105px]">
        {/* ========================================================================= */}
        {/* HEADER SECTION FOR SERVICES DIRECTORY WITH PROPORTIONAL BACKGROUND FIT   */}
        {/* ========================================================================= */}
        <section className="relative bg-[#ebf5fd] border-b border-slate-200/80 min-h-[300px] sm:min-h-[360px] flex items-center overflow-hidden">
          {/* Background illustration fitted proportionally on the right so the entire building, clock, and people are visible */}
          <div className="absolute inset-0 flex items-center justify-end pointer-events-none overflow-hidden">
            <img
              src="/services-hero-bg.jpg"
              alt="Illustration Services Publics"
              className="h-full w-auto max-w-none object-contain object-right opacity-80 sm:opacity-100"
            />
          </div>

          {/* Soft gradient wash on the left to guarantee 100% contrast & readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ebf5fd] via-[#ebf5fd]/95 via-45% to-transparent pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl lg:max-w-2xl">
                {/* Breadcrumb back */}
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white/80 px-2.5 py-1 rounded-md border border-slate-200/60 shadow-2xs backdrop-blur-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isFr ? "Retour à l'accueil" : "Return to homepage"}</span>
                </Link>

                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-100 text-blue-700 text-[11px] font-medium ml-2 shadow-2xs backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>
                    {isFr
                      ? "Répertoire National des Services Publics"
                      : "National Directory of Public Services"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal text-slate-900 tracking-tight leading-tight">
                  {isFr ? (
                    <>
                      Catalogue Officiel des{" "}
                      <span className="font-medium text-blue-700">Services & Démarches</span>
                    </>
                  ) : (
                    <>
                      Official Catalogue of{" "}
                      <span className="font-medium text-blue-700">Services & Procedures</span>
                    </>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  {isFr
                    ? "Découvrez l'ensemble des procédures administratives de la République : documents d'identité, actes d'état civil, certificats et immatriculations avec formalités, tarifs réglementés et délais d'obtention."
                    : "Discover all the administrative procedures of the Republic: identity documents, civil status documents, certificates and registrations with formalities, regulated prices and processing times."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SERVICES CATALOG & FILTERS                                                */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          {/* Search bar & Quick toggle buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isFr
                      ? "Rechercher par nom, ministère, code démarche (ex: Passeport, Naissance, CNI, GUCE...)"
                      : "Search by title, ministry, or code (e.g. Passport, Birth certificate...)"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Toggle Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setOnlyOnline(!onlyOnline)}
                  className={`text-xs px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                    onlyOnline
                      ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isFr ? "En ligne uniquement" : "Online Only"}
                </button>

                <button
                  onClick={() => setOnlyPopular(!onlyPopular)}
                  className={`text-xs px-3 py-2 rounded-xl border transition-colors cursor-pointer ${
                    onlyPopular
                      ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isFr ? "Populaires" : "Popular"}
                </button>
              </div>
            </div>

            {/* Category horizontal pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
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
          </div>

          {/* Results Summary bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-normal">
            <span>
              {isFr
                ? `${filteredServices.length} service(s) trouvé(s)`
                : `${filteredServices.length} service(s) found`}
            </span>
            {(searchQuery || selectedCategory !== "all" || onlyOnline || onlyPopular) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setOnlyOnline(false);
                  setOnlyPopular(false);
                }}
                className="text-blue-600 hover:underline cursor-pointer font-medium"
              >
                {isFr ? "Effacer tous les filtres" : "Clear filters"}
              </button>
            )}
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
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <p className="text-xs text-slate-500 font-normal">
                {isFr
                  ? "Aucun service ne correspond à vos critères de recherche."
                  : "No services match your current criteria."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setOnlyOnline(false);
                  setOnlyPopular(false);
                }}
                className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
              >
                {isFr ? "Réinitialiser les filtres" : "Reset all filters"}
              </button>
            </div>
          )}

          {/* Bottom Helpful Navigation */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-sm sm:text-base font-medium text-slate-900">
                {isFr ? "Vous avez déjà déposé une demande ?" : "Already submitted an application?"}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {isFr
                  ? "Suivez l'état d'avancement de votre dossier en direct ou vérifiez l'authenticité d'un document officiel."
                  : "Track the real-time status of your dossier or verify the authenticity of an official certificate."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/?tab=track"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                {isFr ? "Suivre un dossier" : "Track Dossier"}
              </Link>
              <Link
                href="/?tab=verify"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                {isFr ? "Vérifier un document" : "Verify Document"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
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
          router.push(`/?tab=track&id=${trackId}`);
        }}
      />

      <OfficerPortalModal
        isOpen={isOfficerPortalOpen}
        language={language}
        applications={applications}
        onClose={() => setIsOfficerPortalOpen(false)}
        onUpdateStatus={handleOfficerUpdateStatus}
      />

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}
