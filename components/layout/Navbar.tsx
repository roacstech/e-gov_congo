"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Language, ServiceItem } from "../../types";
import { SERVICES_DATA } from "../../data/services";
import {
  Search,
  Globe,
  UserCog,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  FileText,
  Car,
  Home,
  Users,
  Award,
  Briefcase,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: "services" | "track" | "verify" | "faq";
  onTabChange: (tab: "services" | "track" | "verify" | "faq") => void;
  onOpenOfficerPortal: () => void;
  onSearchClick?: () => void;
  onPresidencyClick?: () => void;
}

// Exactly 9 Core Services from Phase 1 Digital Transformation Initiatives
const CORE_9_SERVICE_IDS = [
  "cni-biometrique",
  "passeport-ordinaire",
  "certificat-nationalite",
  "acte-naissance",
  "acte-mariage",
  "acte-deces",
  "permis-conduire",
  "certificat-residence",
  "permis-travail-etranger",
];

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  onOpenOfficerPortal,
  onSearchClick,
  onPresidencyClick,
}) => {
  const isFr = language === "fr";
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [verifyDropdownOpen, setVerifyDropdownOpen] = useState(false);
  const verifyDropdownRef = useRef<HTMLDivElement>(null);
  const verifyCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVerifyMouseEnter = () => {
    if (verifyCloseTimeoutRef.current) {
      clearTimeout(verifyCloseTimeoutRef.current);
      verifyCloseTimeoutRef.current = null;
    }
    setVerifyDropdownOpen(true);
  };

  const handleVerifyMouseLeave = () => {
    verifyCloseTimeoutRef.current = setTimeout(() => {
      setVerifyDropdownOpen(false);
    }, 150);
  };

  // Get full objects for the 9 core services
  const coreServices = React.useMemo(() => {
    return CORE_9_SERVICE_IDS.map((id) =>
      SERVICES_DATA.find((s) => s.id === id)
    ).filter(Boolean) as ServiceItem[];
  }, []);

  // Group the 9 services into 3 clear sovereign clusters
  const serviceClusters = React.useMemo(
    () => [
      {
        titleFr: "Identité & Voyage",
        titleEn: "Identity & Travel",
        items: coreServices.filter((s) =>
          ["cni-biometrique", "passeport-ordinaire", "certificat-nationalite"].includes(s.id)
        ),
      },
      {
        titleFr: "État Civil & Famille",
        titleEn: "Civil Status & Family",
        items: coreServices.filter((s) =>
          ["acte-naissance", "acte-mariage", "acte-deces"].includes(s.id)
        ),
      },
      {
        titleFr: "Mobilité, Domicile & Emploi",
        titleEn: "Mobility, Residence & Work",
        items: coreServices.filter((s) =>
          ["permis-conduire", "certificat-residence", "permis-travail-etranger"].includes(s.id)
        ),
      },
    ],
    [coreServices]
  );

  const getServiceIcon = (id: string) => {
    const iconClass = "w-[22px] h-[22px] text-slate-500 shrink-0";
    switch (id) {
      case "cni-biometrique":
        return <ShieldCheck className={iconClass} />;
      case "passeport-ordinaire":
        return <Globe className={iconClass} />;
      case "certificat-nationalite":
        return <Award className={iconClass} />;
      case "acte-naissance":
        return <FileText className={iconClass} />;
      case "acte-mariage":
        return <Users className={iconClass} />;
      case "acte-deces":
        return <FileText className={iconClass} />;
      case "permis-conduire":
        return <Car className={iconClass} />;
      case "certificat-residence":
        return <Home className={iconClass} />;
      case "permis-travail-etranger":
        return <Briefcase className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const getDropdownTitle = (id: string) => {
    switch (id) {
      case "cni-biometrique":
        return isFr ? "Carte Nationale d'Identité" : "National ID Card";
      case "passeport-ordinaire":
        return isFr ? "Demande de Passeport" : "Apply Passport";
      case "certificat-nationalite":
        return isFr ? "Certificat de Nationalité" : "Nationality Certificate";
      case "acte-naissance":
        return isFr ? "Acte de Naissance" : "Birth Certificate";
      case "acte-mariage":
        return isFr ? "Certificat de Mariage" : "Marriage Certificate";
      case "acte-deces":
        return isFr ? "Certificat de Décès" : "Death Certificate";
      case "permis-conduire":
        return isFr ? "Permis de Conduire" : "Driver's License";
      case "certificat-residence":
        return isFr ? "Certificat de Résidence" : "Residence Certificate";
      case "permis-travail-etranger":
        return isFr ? "Permis de Travail" : "Work Permit";
      default:
        return "";
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setServicesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 150);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setServicesDropdownOpen(false);
      }
      if (
        verifyDropdownRef.current &&
        !verifyDropdownRef.current.contains(event.target as Node)
      ) {
        setVerifyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (verifyCloseTimeoutRef.current) clearTimeout(verifyCloseTimeoutRef.current);
    };
  }, []);

  const handleSelectCoreService = (service: ServiceItem) => {
    setServicesDropdownOpen(false);
    setMobileMenuOpen(false);
    if (service.id === "cni-biometrique") {
      router.push("/services/national-id");
    } else if (service.id === "passeport-ordinaire") {
      router.push("/services/passport");
    } else if (service.id === "certificat-nationalite") {
      router.push("/services/nationality-certificate");
    } else if (service.id === "acte-naissance") {
      router.push("/services/birth-certificate");
    } else if (service.id === "acte-mariage") {
      router.push("/services/marriage-certificate");
    } else if (service.id === "acte-deces") {
      router.push("/services/death-certificate");
    } else if (service.id === "permis-conduire") {
      router.push("/services/driving-license");
    } else if (service.id === "certificat-residence") {
      router.push("/services/residence-certificate");
    } else if (service.id === "permis-travail-etranger") {
      router.push("/services/work-permit");
    } else {
      router.push(`/services/${service.id}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#258cfb] shadow-md border-b border-blue-400/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-24 sm:h-[105px]">
          {/* ============================================================== */}
          {/* LEFT NAVIGATION LINKS                                          */}
          {/* ============================================================== */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 flex-1 justify-end pr-6 xl:pr-8">
            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("faq");
                } else {
                  router.push("/?tab=faq");
                }
              }}
              className="text-sm font-semibold tracking-wide text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer whitespace-nowrap"
            >
              {isFr ? "ACTUALITÉS" : "NEWS"}
            </button>

            <button
              onClick={() => {
                if (onPresidencyClick) {
                  onPresidencyClick();
                } else if (pathname === "/") {
                  const el = document.getElementById("presidential-vision");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#presidential-vision");
                }
              }}
              className="text-sm font-semibold tracking-wide text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer whitespace-nowrap"
            >
              {isFr ? "PRÉSIDENCE" : "PRESIDENCY"}
            </button>

            {/* ============================================================== */}
            {/* SERVICES DROPDOWN (ONLY 9 CORE SERVICES)                       */}
            {/* ============================================================== */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setServicesDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase transition-all cursor-pointer py-2 text-white/95 hover:text-white opacity-90 hover:opacity-100 whitespace-nowrap"
              >
                <span>{isFr ? "SERVICES" : "SERVICES"}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    servicesDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN MENU PANEL */}
              {servicesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-[30%] mt-2 w-[780px] max-w-[94vw] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 text-slate-800 p-6 transition-all">
                  {/* 3 Clusters (3 Columns of 3 Services) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {serviceClusters.map((cluster, cIdx) => (
                      <div key={cIdx} className="space-y-3">
                        {/* Simple heading only */}
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
                          {isFr ? cluster.titleFr : cluster.titleEn}
                        </h4>

                        <div className="space-y-2">
                          {cluster.items.map((service) => (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => handleSelectCoreService(service)}
                              className="w-full text-left py-2 px-1 rounded-md transition-colors cursor-pointer flex items-center gap-3 text-slate-800 hover:text-blue-600"
                            >
                              {getServiceIcon(service.id)}
                              <span className="text-sm font-medium whitespace-nowrap">
                                {getDropdownTitle(service.id)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (pathname === "/") {
                  const el = document.getElementById("faq");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#faq");
                }
              }}
              className="text-sm font-semibold tracking-wide text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer whitespace-nowrap"
            >
              {isFr ? "AFRIQUE" : "AFRICA"}
            </button>
          </nav>

          {/* ============================================================== */}
          {/* CENTER CIRCULAR SEAL & NATIONAL EMBLEM LOGO (Links to Home)    */}
          {/* ============================================================== */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center justify-center cursor-pointer group py-1"
            title="République Démocratique du Congo - Présidence de la République"
          >
            <div className="relative w-22 h-22 sm:w-[94px] sm:h-[94px] flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  <path id="sealTopArc" d="M 28,100 A 72,72 0 0,1 172,100" fill="none" />
                  <path id="sealBottomArc" d="M 172,100 A 72,72 0 0,1 28,100" fill="none" />
                </defs>

                <circle cx="100" cy="100" r="94" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />
                <circle cx="100" cy="100" r="64" fill="none" stroke="#ffffff" strokeWidth="1.2" />

                <circle cx="28" cy="100" r="2.2" fill="#ffffff" />
                <circle cx="172" cy="100" r="2.2" fill="#ffffff" />

                <text fill="#ffffff" fontSize="8.5" fontWeight="600" letterSpacing="1.2">
                  <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
                    RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                  </textPath>
                </text>

                <text fill="#ffffff" fontSize="8.5" fontWeight="600" letterSpacing="1.4">
                  <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
                    PRÉSIDENCE DE LA RÉPUBLIQUE
                  </textPath>
                </text>
              </svg>

              <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center p-0.5">
                <img
                  src="/logo.png"
                  alt="Armoiries de la République Démocratique du Congo"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
            </div>
          </Link>

          {/* ============================================================== */}
          {/* RIGHT NAVIGATION LINKS                                         */}
          {/* ============================================================== */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-start pl-6 xl:pl-8">
            <button
              onClick={() => {
                if (onPresidencyClick) {
                  onPresidencyClick();
                } else if (pathname === "/") {
                  const el = document.getElementById("presidential-vision");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  router.push("/#presidential-vision");
                }
              }}
              className="text-sm font-semibold tracking-wide whitespace-nowrap text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer"
            >
              {isFr ? "PROGRAMMES" : "PROGRAMS"}
            </button>

            {/* ============================================================== */}
            {/* VERIFY DOC & TRACK APPLICATION DROPDOWN                        */}
            {/* ============================================================== */}
            <div
              ref={verifyDropdownRef}
              className="relative"
              onMouseEnter={handleVerifyMouseEnter}
              onMouseLeave={handleVerifyMouseLeave}
            >
              <button
                type="button"
                onClick={() => setVerifyDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide uppercase transition-all cursor-pointer py-2 whitespace-nowrap text-white/95 hover:text-white opacity-90 hover:opacity-100"
              >
                <span>{isFr ? "VÉRIFICATION" : "VERIFY DOC"}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    verifyDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* VERIFY DROPDOWN PANEL */}
              {verifyDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 text-slate-800 p-2.5 transition-all animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyDropdownOpen(false);
                      if (pathname === "/") {
                        onTabChange("track");
                      } else {
                        router.push("/?tab=track");
                      }
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-3 text-slate-800 hover:text-blue-600 hover:bg-blue-50/70"
                  >
                    <Search className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-sm font-semibold block text-slate-900">
                        {isFr ? "Suivi Demande" : "Track Application"}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-normal">
                        {isFr ? "Vérifier l'état d'un dossier avec code" : "Check status with tracking code"}
                      </span>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setVerifyDropdownOpen(false);
                      if (pathname === "/") {
                        onTabChange("verify");
                      } else {
                        router.push("/?tab=verify");
                      }
                    }}
                    className="w-full text-left py-2.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-3 text-slate-800 hover:text-blue-600 hover:bg-blue-50/70"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-sm font-semibold block text-slate-900">
                        {isFr ? "Vérifier Document" : "Verify Document"}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-normal">
                        {isFr ? "Authentifier un acte sécurisé ou QR" : "Authenticate official certificate or QR"}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Language Switcher Pill */}
            <button
              onClick={() => onLanguageChange(isFr ? "en" : "fr")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors cursor-pointer ml-1 border border-white/25 shadow-2xs"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isFr ? "EN" : "FR"}</span>
            </button>

            {/* Officer portal discreet button */}
            <button
              onClick={() => router.push("/officer")}
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full border border-white/20 text-xs font-semibold transition-colors cursor-pointer ml-0.5"
              title={isFr ? "Espace Agent Public (3 Niveaux)" : "Public Officer Portal (3-Tier)"}
            >
              <UserCog className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{isFr ? "Agent" : "Officer"}</span>
            </button>
          </nav>

          {/* ============================================================== */}
          {/* MOBILE TOGGLE & ACTION BUTTONS                                 */}
          {/* ============================================================== */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => onLanguageChange(isFr ? "en" : "fr")}
              className="text-xs text-white font-medium bg-white/15 px-2 py-1 rounded"
            >
              {isFr ? "EN" : "FR"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white hover:text-white/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1f7ae0] border-t border-blue-400/50 px-5 py-4 space-y-3 text-white text-xs">
          {/* 9 Services Accordion on Mobile */}
          <div className="pb-2 border-b border-blue-400/40">
            <button
              type="button"
              onClick={() => setMobileServicesOpen((prev) => !prev)}
              className="w-full flex items-center justify-between py-2 font-bold tracking-wider uppercase text-left"
            >
              <span>{isFr ? "SERVICES (9 DÉMARCHES PRIORITAIRES)" : "SERVICES (9 CORE PROCEDURES)"}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileServicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileServicesOpen && (
              <div className="grid grid-cols-1 gap-1.5 pl-2 pt-2 pb-1">
                {coreServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelectCoreService(service)}
                    className="w-full text-left py-2 px-2.5 rounded-lg bg-blue-600/60 hover:bg-blue-600 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium truncate pr-2">
                      {getDropdownTitle(service.id)}
                    </span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded shrink-0">
                      {service.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-blue-400/40">
            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("track");
                } else {
                  router.push("/?tab=track");
                }
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold tracking-wide uppercase text-sm"
            >
              {isFr ? "SUIVI DEMANDE" : "TRACK APPLICATION"}
            </button>
            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("verify");
                } else {
                  router.push("/?tab=verify");
                }
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold tracking-wide uppercase text-sm"
            >
              {isFr ? "VÉRIFICATION" : "VERIFY DOC"}
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                router.push("/officer");
                setMobileMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 text-white/90"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>{isFr ? "Espace Agent Public" : "Public Officer Portal"}</span>
            </button>

            <span className="text-white/60">© RDC 2026</span>
          </div>
        </div>
      )}
    </header>
  );
};
