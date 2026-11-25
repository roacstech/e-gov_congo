"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  const [activeTab, setActiveTab] = useState<"services" | "track" | "verify" | "faq">("services");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [detailService, setDetailService] = useState<ServiceItem | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const serviceId = params.get("service");
      if (serviceId) {
        return SERVICES_DATA.find((s) => s.id === serviceId) || null;
      }
    }
    return null;
  });
  const [applyService, setApplyService] = useState<ServiceItem | null>(null);
  const [isOfficerPortalOpen, setIsOfficerPortalOpen] = useState(false);

  // Applications live state (persisting new applications during user session)
  const [applications, setApplications] = useState<CitizenApplication[]>(SAMPLE_APPLICATIONS);
  const [activeTrackingId, setActiveTrackingId] = useState<string>("CD-2026-849201");

  // 3 Featured Services for Home Page matching requested reference UI
  const featuredServices = useMemo(
    () => [
      {
        num: "01",
        service: SERVICES_DATA[0], // CNI
        pillsFr: [
          "Numéro d'Identification Nationale (NIN)",
          "Délai légal : 3 à 5 jours ouvrables",
          "Première délivrance gratuite",
        ],
        pillsEn: [
          "Unique National ID Number (NIN)",
          "Processing: 3 to 5 business days",
          "Free initial card issuance",
        ],
      },
      {
        num: "02",
        service: SERVICES_DATA[1], // Passeport
        pillsFr: [
          "Passeport officiel conforme OACI",
          "Délai officiel : 7 à 10 jours ouvrables",
          "Enrôlement biométrique prioritaire",
        ],
        pillsEn: [
          "Official ICAO-compliant passport",
          "Official SLA: 7 to 10 business days",
          "Priority biometric appointment",
        ],
      },
      {
        num: "03",
        service: SERVICES_DATA[2], // Permis
        pillsFr: [
          "Format carte à puce biométrique",
          "Délivrance rapide : 48 à 72 heures",
          "Homologation nationale des transports",
        ],
        pillsEn: [
          "Smart chip card format",
          "Fast-track turnaround: 48 to 72 hours",
          "National Ministry of Transport approval",
        ],
      },
    ],
    []
  );

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
      <main className="flex-1 pt-24 sm:pt-[105px]">
        {/* ========================================================================= */}
        {/* 1. LIGHT, GENTLE CIVIC HERO SECTION WITH CONGO BACKGROUND IMAGE           */}
        {/* ========================================================================= */}
        <section
          className="relative bg-cover bg-center border-b border-slate-200/80 pt-20 sm:pt-28 pb-20 sm:pb-28 overflow-hidden"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        >
          {/* Subtle translucent tint that preserves the vivid background image while ensuring 100% text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/35 pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-5">
           

            {/* Clear, larger single-line heading */}
            <h1 className="font-heading text-xl sm:text-2xl md:text-[1.85rem] lg:text-[2.35rem] xl:text-[2.75rem] font-bold text-slate-950 tracking-tight max-w-none mx-auto leading-tight md:leading-snug drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] whitespace-normal md:whitespace-nowrap">
              {isFr ? (
                <>
                  L'administration publique simplifiée pour{" "}
                  <span className="font-semibold text-blue-700">tous les citoyens</span>
                </>
              ) : (
                <>
                  Simplified public administration for{" "}
                  <span className="font-bold text-blue-700">all citizens</span>
                </>
              )}
            </h1>

      

            {/* Clean Hero Search - Bigger, clearer */}
            <div className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center bg-white border border-slate-300/90 rounded-2xl shadow-sm p-2 sm:p-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isFr
                      ? "Rechercher un service (ex: Passeport, Naissance, Permis, Casier judiciaire...)"
                      : "Search for a service (e.g., Passport, Birth, Driver's License, Criminal Record Check...)"
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== "services") setActiveTab("services");
                  }}
                  className="w-full px-3.5 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-500 bg-transparent focus:outline-none"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  {isFr ? "Trouver" : "Find"}
                </button>
              </div>

             
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRESIDENTIAL VISION SECTION                                               */}
        {/* ========================================================================= */}
        <section id="presidential-vision" className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 scroll-mt-24">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              {/* President portrait */}
              <div className="md:col-span-5 relative h-72 md:h-full min-h-[300px] overflow-hidden bg-slate-100">
                <img
                  src="/president.jpg"
                  alt={
                    isFr
                      ? "Son Excellence Félix-Antoine Tshisekedi Tshilombo — Président de la République"
                      : "His Excellency Félix-Antoine Tshisekedi Tshilombo — President of the Republic"
                  }
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent md:hidden" />
                <div className="absolute bottom-3 left-3 md:hidden text-white text-xs font-medium">
                  {isFr ? "S.E. Félix-Antoine Tshisekedi" : "H.E. Félix-Antoine Tshisekedi"}
                </div>
              </div>

              {/* Presidential Vision text */}
              <div className="md:col-span-7 p-6 sm:p-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>
                    {isFr
                      ? "Présidence de la République • Vision Numérique"
                      : "Presidency of the Republic • Digital Vision"}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                    {isFr
                      ? "Son Excellence Félix-Antoine Tshisekedi Tshilombo"
                      : "His Excellency Félix-Antoine Tshisekedi Tshilombo"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                    {isFr
                      ? "Président de la République Démocratique du Congo, Chef de l'État"
                      : "President of the Democratic Republic of the Congo, Head of State"}
                  </p>
                </div>

                <blockquote className="border-l-3 border-blue-600 pl-4 text-sm sm:text-base text-slate-700 font-normal italic leading-relaxed">
                  {isFr
                    ? "« Notre ambition est de faire du numérique un puissant levier d'intégration, de transparence et d'équité, en rapprochant l'administration de chaque citoyenne et de chaque citoyen congolais, sur toute l'étendue de la République. »"
                    : "« Our ambition is to make digital technology a powerful driver of integration, transparency, and equity, bringing public administration directly to every Congolese citizen across the entire Republic. »"}
                </blockquote>

                {/* 3 National Pillars */}
                <div className="pt-2 grid grid-cols-3 gap-2.5 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-xs sm:text-sm font-semibold text-slate-900">
                      {isFr ? "Justice" : "Justice"}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      {isFr ? "Égalité régalienne" : "Sovereign equity"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-xs sm:text-sm font-semibold text-slate-900">
                      {isFr ? "Paix" : "Peace"}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      {isFr ? "Sécurité juridique" : "Legal security"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="block text-xs sm:text-sm font-semibold text-slate-900">
                      {isFr ? "Travail" : "Labor"}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      {isFr ? "Service d'excellence" : "Excellence in service"}
                    </span>
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
          {/* TAB 1: 3 FEATURED SERVICES WITH NEW CARD UI MATCHING USER REFERENCE */}
          {activeTab === "services" && (
            <div className="space-y-8">
              {/* Section Header */}
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>
                    {isFr ? "Services Publics Prioritaires" : "Priority Public Services"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-normal text-slate-900 tracking-tight">
                  {isFr ? (
                    <>
                      Démarches Citoyennes <span className="font-medium text-blue-700">Principales</span>
                    </>
                  ) : (
                    <>
                      Key Citizen <span className="font-medium text-blue-700">Procedures</span>
                    </>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  {isFr
                    ? "Les démarches officielles les plus sollicitées par les citoyens de la République."
                    : "The most requested official procedures by citizens of the Republic."}
                </p>
              </div>

              {/* 3 Featured Service Cards - UI Matching Reference Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredServices.map((item) => (
                  <div
                    key={item.service.id}
                    className="bg-[#edf3ff] rounded-[28px] p-7 border border-[#d6e4ff] flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                  >
                    <div>
                      {/* Big Index Number (01, 02, 03) - Exact styling matching user reference UI */}
                      <div className="text-[44px] sm:text-[52px] font-black text-[#6d90fb] leading-none tracking-tight mb-5 select-none">
                        {item.num}
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => {
                          if (item.service.id === "cni-biometrique") {
                            router.push("/services/national-id");
                          } else if (item.service.id === "passeport-ordinaire") {
                            router.push("/services/passport");
                          } else if (item.service.id === "certificat-nationalite") {
                            router.push("/services/nationality-certificate");
                          } else if (item.service.id === "acte-naissance") {
                            router.push("/services/birth-certificate");
                          } else if (item.service.id === "acte-mariage") {
                            router.push("/services/marriage-certificate");
                          } else if (item.service.id === "acte-deces") {
                            router.push("/services/death-certificate");
                          } else if (item.service.id === "permis-conduire") {
                            router.push("/services/driving-license");
                          } else {
                            router.push(`/services/${item.service.id}`);
                          }
                        }}
                        className="text-lg sm:text-xl font-bold text-slate-950 group-hover:text-blue-700 transition-colors cursor-pointer leading-snug mb-2 min-h-[52px]"
                      >
                        {isFr ? item.service.titleFr : item.service.titleEn}
                      </h3>

                      {/* Ministry */}
                      <p className="text-xs sm:text-sm text-slate-600 font-medium truncate mb-3">
                        {isFr ? item.service.ministryFr : item.service.ministryEn}
                      </p>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed mb-6 line-clamp-3 min-h-[54px]">
                        {isFr ? item.service.descriptionFr : item.service.descriptionEn}
                      </p>

                      {/* Deliverables / Checklist Pills Matching Reference Image */}
                      <div className="space-y-2.5 mb-6">
                        {(isFr ? item.pillsFr : item.pillsEn).map((pill, pIdx) => (
                          <div
                            key={pIdx}
                            className="w-full flex items-center gap-2.5 bg-white border border-[#d6e4ff] rounded-full px-4 py-2 text-xs sm:text-sm text-slate-800 shadow-2xs font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#6d90fb] shrink-0 stroke-[2.2]" />
                            <span className="truncate">{pill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-blue-200/50 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.service.id === "cni-biometrique") {
                            router.push("/services/national-id");
                          } else if (item.service.id === "passeport-ordinaire") {
                            router.push("/services/passport");
                          } else if (item.service.id === "certificat-nationalite") {
                            router.push("/services/nationality-certificate");
                          } else if (item.service.id === "acte-naissance") {
                            router.push("/services/birth-certificate");
                          } else if (item.service.id === "acte-mariage") {
                            router.push("/services/marriage-certificate");
                          } else if (item.service.id === "acte-deces") {
                            router.push("/services/death-certificate");
                          } else if (item.service.id === "permis-conduire") {
                            router.push("/services/driving-license");
                          } else {
                            router.push(`/services/${item.service.id}`);
                          }
                        }}
                        className="flex-1 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-normal transition-colors cursor-pointer"
                      >
                        {isFr ? "Détails" : "Details"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.service.id === "cni-biometrique") {
                            router.push("/services/national-id");
                          } else if (item.service.id === "passeport-ordinaire") {
                            router.push("/services/passport");
                          } else if (item.service.id === "certificat-nationalite") {
                            router.push("/services/nationality-certificate");
                          } else if (item.service.id === "acte-naissance") {
                            router.push("/services/birth-certificate");
                          } else if (item.service.id === "acte-mariage") {
                            router.push("/services/marriage-certificate");
                          } else if (item.service.id === "acte-deces") {
                            router.push("/services/death-certificate");
                          } else if (item.service.id === "permis-conduire") {
                            router.push("/services/driving-license");
                          } else {
                            router.push(`/services/${item.service.id}`);
                          }
                        }}
                        className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>{isFr ? "Postuler" : "Apply"}</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Services Button */}
              <div className="pt-4 text-center">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-300 hover:border-blue-300 px-6 py-3 rounded-full text-xs sm:text-sm font-medium shadow-xs transition-all cursor-pointer"
                >
                  <span>
                    {isFr
                      ? "Voir tous les services (12 démarches disponibles)"
                      : "View all services (12 available procedures)"}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Link>
              </div>

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
