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
  X,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  FileText,
  Scale,
  Car,
  Briefcase,
  LayoutGrid,
  List,
  QrCode,
  PhoneCall,
  Flame,
} from "lucide-react";

type SortOption = "default" | "fastest" | "title";

export default function ServicesPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [onlyPopular, setOnlyPopular] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);
  const [applyService, setApplyService] = useState<ServiceItem | null>(null);
  const [isOfficerPortalOpen, setIsOfficerPortalOpen] = useState(false);

  // Applications
  const [applications, setApplications] = useState<CitizenApplication[]>(SAMPLE_APPLICATIONS);

  // Quick suggestions for search
  const popularKeywords = [
    { fr: "Demande de Passeport", en: "Apply Passport" },
    { fr: "Carte CNI", en: "National ID (CNI)" },
    { fr: "Permis de conduire", en: "Driver's License" },
    { fr: "Acte de naissance", en: "Birth Certificate" },
    { fr: "Casier judiciaire", en: "Criminal Record" },
    { fr: "Création d'entreprise (RCCM)", en: "Business Creation (RCCM)" },
  ];

  // Category procedure counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SERVICES_DATA.length };
    SERVICES_DATA.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Category icons mapping
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "identity":
        return <ShieldCheck className="w-4 h-4 shrink-0" />;
      case "civil_status":
        return <FileText className="w-4 h-4 shrink-0" />;
      case "transport":
        return <Car className="w-4 h-4 shrink-0" />;
      case "justice":
        return <Scale className="w-4 h-4 shrink-0" />;
      case "business":
        return <Briefcase className="w-4 h-4 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 shrink-0" />;
    }
  };

  // Turnaround weight for sorting by fastest
  const getSlaWeight = (service: ServiceItem): number => {
    const s = service.slaFr.toLowerCase();
    if (s.includes("immédiat")) return 0;
    if (s.includes("24")) return 1;
    if (s.includes("48") || s.includes("72")) return 2;
    if (s.includes("3") || s.includes("5")) return 3;
    if (s.includes("7") || s.includes("10")) return 4;
    return 5;
  };

  // Filtering and sorting logic
  const filteredServices = useMemo(() => {
    let list = [...SERVICES_DATA];

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

    // Sorting
    if (sortBy === "fastest") {
      list.sort((a, b) => getSlaWeight(a) - getSlaWeight(b));
    } else if (sortBy === "title") {
      list.sort((a, b) => {
        const titleA = isFr ? a.titleFr : a.titleEn;
        const titleB = isFr ? b.titleFr : b.titleEn;
        return titleA.localeCompare(titleB);
      });
    }

    return list;
  }, [selectedCategory, searchQuery, onlyOnline, onlyPopular, sortBy, isFr]);

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
        {/* SOVEREIGN ACCENT STRIPE (Congolese Flag Colors: Sky Blue, Yellow, Red)    */}
        {/* ========================================================================= */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#007fff]" />
          <div className="w-1/6 bg-[#fcd116]" />
          <div className="w-1/6 bg-[#ce1126]" />
        </div>

        {/* ========================================================================= */}
        {/* HERO SECTION FOR SERVICES DIRECTORY                                       */}
        {/* ========================================================================= */}
        <section className="relative bg-gradient-to-b from-[#eaf4fe] via-[#f2f8fd] to-[#f8fafc] border-b border-slate-200/80 overflow-hidden">
          {/* Subtle decorative watermark/grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading and Meta */}
              <div className="lg:col-span-7 space-y-4">
                {/* Breadcrumbs and Official Seal Tag */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-medium transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isFr ? "Retour au portail principal" : "Return to main portal"}</span>
                  </Link>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>
                      {isFr
                        ? "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • RÉPERTOIRE OFFICIEL"
                        : "DEMOCRATIC REPUBLIC OF THE CONGO • OFFICIAL DIRECTORY"}
                    </span>
                  </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-slate-900 tracking-tight leading-tight">
                  {isFr ? (
                    <>
                      Catalogue Officiel des{" "}
                      <span className="text-blue-600">Services & Démarches</span>
                    </>
                  ) : (
                    <>
                      Official Catalogue of{" "}
                      <span className="text-blue-600">Public Services & Procedures</span>
                    </>
                  )}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {isFr
                    ? "Accédez aux formalités administratives certifiées de l'État : pièces d'identité biométriques, actes d'état civil, permis sécurisés et enregistrements d'entreprises. Tarifs transparents sans frais cachés et délais garantis par la loi."
                    : "Access certified sovereign public administrative procedures: biometric identity documents, civil status acts, smart licenses, and business registration. Guaranteed legal turnaround times and transparent official tariffs without unofficial surcharges."}
                </p>

                {/* Quick Trust Highlights / Badges */}
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-base font-bold text-blue-700 block">12+</span>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {isFr ? "Démarches certifiées" : "Certified procedures"}
                    </span>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-base font-bold text-emerald-600 block">100%</span>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {isFr ? "Tarifs réglementés" : "Regulated tariffs"}
                    </span>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-base font-bold text-indigo-600 block">24h - 10j</span>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {isFr ? "Délais garantis" : "Guaranteed SLA"}
                    </span>
                  </div>

                  <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-base font-bold text-amber-600 block">QR Code</span>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {isFr ? "Vérification directe" : "Instant verification"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Properly framed illustration */}
              <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
                <div className="relative w-full max-w-md bg-white p-3 rounded-2xl border border-slate-200/90 shadow-md">
                  <div className="overflow-hidden rounded-xl bg-slate-50 relative aspect-[4/3]">
                    <img
                      src="/services-hero-bg.jpg"
                      alt="Services Publics RDC"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Floating pill over image */}
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-white/40 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-semibold text-slate-800">
                          {isFr ? "Guichet Numérique Ouvert 24/7" : "Digital Portal Open 24/7"}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded">
                        Kinshasa / RDC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CITIZEN 3-STEP GUIDE ("COMMENT ÇA MARCHE ?")                               */}
        {/* ========================================================================= */}
        <section className="bg-white border-b border-slate-200/80 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  {isFr ? "Guide du Citoyen" : "Citizen Guide"}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {isFr ? "Comment accomplir votre démarche ?" : "How to complete your procedure?"}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {isFr
                    ? "Service certifié conforme aux normes administratives de la RDC"
                    : "Certified sovereign public administration service"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {isFr ? "Rechercher & Vérifier" : "Search & Verify"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    {isFr
                      ? "Identifiez votre démarche, consultez les pièces requises et le tarif officiel réglementé."
                      : "Find your procedure, check mandatory supporting documents and official regulated fees."}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {isFr ? "Déposer votre dossier" : "Submit Application"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    {isFr
                      ? "Remplissez le formulaire en ligne ou présentez-vous au guichet communal avec les pièces justificatives."
                      : "Complete the online application form or visit the municipal desk with required originals."}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {isFr ? "Suivre & Retirer" : "Track & Collect"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    {isFr
                      ? "Suivez l'instruction de votre dossier en direct et retirez votre document officiel sécurisé par QR Code."
                      : "Track real-time dossier progress with your unique ID and collect your tamper-proof QR certificate."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SERVICES CATALOG & FILTERS                                                */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          {/* Main Filter Console */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
            {/* Search input + Suggestions */}
            <div className="space-y-2.5">
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isFr
                      ? "Rechercher par nom, ministère, code démarche (ex: Passeport, Naissance, CNI, GUCE...)"
                      : "Search by title, ministry, or code (e.g. Passport, Birth certificate, CNI, GUCE...)"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={isFr ? "Effacer la recherche" : "Clear search"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Popular Search Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                <span className="font-medium text-slate-600 shrink-0">
                  {isFr ? "Suggestions :" : "Popular :"}
                </span>
                {popularKeywords.map((item, idx) => {
                  const label = isFr ? item.fr : item.en;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSearchQuery(isFr ? item.fr : item.en)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors cursor-pointer text-[11px]"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category horizontal pills with icons & counts */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-2">
                {isFr ? "Catégories de démarches" : "Service Categories"}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as ServiceCategory)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white font-medium shadow-xs"
                          : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className={isSelected ? "text-blue-400" : "text-slate-500"}>
                        {getCategoryIcon(cat.id)}
                      </span>
                      <span>{isFr ? cat.labelFr : cat.labelEn}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-200/80 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Toggles, Sorting, and View Switcher */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* Left: Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyOnline(!onlyOnline)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    onlyOnline
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      onlyOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                    }`}
                  />
                  <span>{isFr ? "En ligne uniquement" : "Online Only"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOnlyPopular(!onlyPopular)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    onlyPopular
                      ? "bg-amber-50 border-amber-300 text-amber-800 font-semibold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Flame
                    className={`w-3.5 h-3.5 ${
                      onlyPopular ? "text-amber-500" : "text-slate-400"
                    }`}
                  />
                  <span>{isFr ? "Démarches populaires" : "Popular Only"}</span>
                </button>
              </div>

              {/* Right: Sort & View switcher */}
              <div className="flex items-center gap-3 ml-auto">
                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="hidden sm:inline font-medium text-slate-500">
                    {isFr ? "Trier par :" : "Sort by:"}
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label={isFr ? "Trier les services" : "Sort services"}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                  >
                    <option value="default">{isFr ? "Recommandés" : "Recommended"}</option>
                    <option value="fastest">
                      {isFr ? "Délai le plus rapide" : "Fastest Turnaround"}
                    </option>
                    <option value="title">{isFr ? "Nom (A-Z)" : "Title (A-Z)"}</option>
                  </select>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-blue-700 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title={isFr ? "Vue en grille" : "Grid view"}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-blue-700 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                    title={isFr ? "Vue en liste" : "List view"}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-1 font-normal">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                {isFr
                  ? `${filteredServices.length} démarche(s) disponible(s)`
                  : `${filteredServices.length} public service(s) available`}
              </span>
              {(searchQuery || selectedCategory !== "all" || onlyOnline || onlyPopular) && (
                <span className="text-slate-400">• Filtres actifs</span>
              )}
            </div>

            {(searchQuery || selectedCategory !== "all" || onlyOnline || onlyPopular) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setOnlyOnline(false);
                  setOnlyPopular(false);
                  setSortBy("default");
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium text-xs flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isFr ? "Réinitialiser tous les filtres" : "Clear all filters"}</span>
              </button>
            )}
          </div>

          {/* Service Cards (Grid or List view) */}
          {filteredServices.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    language={language}
                    viewMode="grid"
                    onSelect={(srv) => {
                      if (srv.id === "cni-biometrique") router.push("/services/national-id");
                      else router.push(`/services/${srv.id}`);
                    }}
                    onApply={(srv) => {
                      if (srv.id === "cni-biometrique") router.push("/services/national-id");
                      else router.push(`/services/${srv.id}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    language={language}
                    viewMode="list"
                    onSelect={(srv) => {
                      if (srv.id === "cni-biometrique") router.push("/services/national-id");
                      else router.push(`/services/${srv.id}`);
                    }}
                    onApply={(srv) => {
                      if (srv.id === "cni-biometrique") router.push("/services/national-id");
                      else router.push(`/services/${srv.id}`);
                    }}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-800">
                  {isFr ? "Aucune démarche trouvée" : "No procedures found"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isFr
                    ? "Aucun service ne correspond à vos critères de recherche. Essayez d'ajuster vos mots-clés ou de réinitialiser les filtres."
                    : "No services match your current query or category filters. Try adjusting your search term or resetting filters."}
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setOnlyOnline(false);
                  setOnlyPopular(false);
                  setSortBy("default");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {isFr ? "Réinitialiser les filtres" : "Reset all filters"}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BOTTOM CITIZEN ASSISTANCE & DOSSIER TRACKING CALLOUT                     */}
          {/* ========================================================================= */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-blue-200 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isFr
                      ? "Guichet Unique Numérique de la RDC"
                      : "Single Digital Window of the DRC"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {isFr
                    ? "Vous avez déjà soumis un dossier administratif ?"
                    : "Already submitted an administrative dossier?"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {isFr
                    ? "Suivez en temps réel l'avancement de votre demande grâce à votre numéro de suivi officiel, ou vérifiez instantanément l'authenticité d'un certificat d'État via notre système cryptographique."
                    : "Track the real-time processing status of your file using your official tracking number, or instantly verify the sovereign validity of any state document via QR code."}
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                <Link
                  href="/?tab=track"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-blue-900 hover:bg-slate-100 transition-colors shadow-xs inline-flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{isFr ? "Suivre un dossier en direct" : "Track Dossier Live"}</span>
                </Link>

                <Link
                  href="/?tab=verify"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-700/80 hover:bg-blue-600 text-white border border-white/20 transition-colors shadow-xs inline-flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>{isFr ? "Vérifier un document officiel" : "Verify Official Document"}</span>
                </Link>
              </div>
            </div>

            {/* Helpline footnote */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {isFr
                    ? "Centre d'Assistance Citoyenne : disponible du lundi au vendredi de 8h à 17h (Heure de Kinshasa)"
                    : "Citizen Support Hotline: available Monday to Friday 8:00 to 17:00 (Kinshasa Time)"}
                </span>
              </div>
              <div className="text-slate-400">
                <span>{isFr ? "Portail Anti-Corruption RDC" : "DRC Anti-Corruption Portal"}</span>
              </div>
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
