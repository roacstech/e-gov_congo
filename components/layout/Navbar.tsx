"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Language } from "../../types";
import { Search, Globe, UserCog, Menu, X } from "lucide-react";

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: "services" | "track" | "verify" | "faq";
  onTabChange: (tab: "services" | "track" | "verify" | "faq") => void;
  onOpenOfficerPortal: () => void;
  onSearchClick?: () => void;
  onPresidencyClick?: () => void;
}

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
  const isServicesPage = pathname === "/services";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#258cfb] shadow-md border-b border-blue-400/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-24 sm:h-[105px]">
          {/* ============================================================== */}
          {/* LEFT NAVIGATION LINKS                                          */}
          {/* ============================================================== */}
          <nav className="hidden lg:flex items-center gap-7 flex-1 justify-end pr-8">
            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("faq");
                } else {
                  router.push("/?tab=faq");
                }
              }}
              className="text-xs font-medium tracking-wider text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer"
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
              className="text-xs font-medium tracking-wider text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer"
            >
              {isFr ? "PRÉSIDENCE" : "PRESIDENCY"}
            </button>

            {/* SEPARATE SERVICE PAGE LINK */}
            <Link
              href="/services"
              className={`text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                isServicesPage
                  ? "text-white border-b-2 border-white pb-1"
                  : "text-white/95 hover:text-white opacity-90 hover:opacity-100"
              }`}
            >
              {isFr ? "SERVICES" : "SERVICES"}
            </Link>

            <button
              onClick={() => {
                if (pathname !== "/services") {
                  router.push("/services");
                }
              }}
              className="text-xs font-medium tracking-wider text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer"
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
              {/* Circular Seal SVG with Official Circular Inscription */}
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
              >
                <defs>
                  {/* Top arc for upper text */}
                  <path
                    id="sealTopArc"
                    d="M 28,100 A 72,72 0 0,1 172,100"
                    fill="none"
                  />
                  {/* Bottom arc for lower text */}
                  <path
                    id="sealBottomArc"
                    d="M 172,100 A 72,72 0 0,1 28,100"
                    fill="none"
                  />
                </defs>

                {/* Outer concentric white rings */}
                <circle
                  cx="100"
                  cy="100"
                  r="94"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  opacity="0.85"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="64"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />

                {/* Star / dot separators */}
                <circle cx="28" cy="100" r="2.2" fill="#ffffff" />
                <circle cx="172" cy="100" r="2.2" fill="#ffffff" />

                {/* Upper curved text */}
                <text
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="600"
                  letterSpacing="1.2"
                >
                  <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
                    RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                  </textPath>
                </text>

                {/* Lower curved text */}
                <text
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="600"
                  letterSpacing="1.4"
                >
                  <textPath
                    href="#sealBottomArc"
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    PRÉSIDENCE DE LA RÉPUBLIQUE
                  </textPath>
                </text>
              </svg>

              {/* Central National Coat of Arms / Emblem Image */}
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
          <nav className="hidden lg:flex items-center gap-7 flex-1 justify-start pl-8">
            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("track");
                } else {
                  router.push("/?tab=track");
                }
              }}
              className={`text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                pathname === "/" && activeTab === "track"
                  ? "text-white border-b-2 border-white pb-1"
                  : "text-white/95 hover:text-white opacity-90 hover:opacity-100"
              }`}
            >
              {isFr ? "SUIVI DOSSIER" : "EVENTS"}
            </button>

            <Link
              href="/services"
              className="text-xs font-medium tracking-wider text-white/95 hover:text-white uppercase transition-opacity hover:opacity-100 opacity-90 cursor-pointer"
            >
              {isFr ? "PROGRAMMES" : "PROGRAMS"}
            </Link>

            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("verify");
                } else {
                  router.push("/?tab=verify");
                }
              }}
              className={`text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                pathname === "/" && activeTab === "verify"
                  ? "text-white border-b-2 border-white pb-1"
                  : "text-white/95 hover:text-white opacity-90 hover:opacity-100"
              }`}
            >
              {isFr ? "VÉRIFICATION" : "MEDIA"}
            </button>

            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("faq");
                } else {
                  router.push("/?tab=faq");
                }
              }}
              className={`text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                pathname === "/" && activeTab === "faq"
                  ? "text-white border-b-2 border-white pb-1"
                  : "text-white/95 hover:text-white opacity-90 hover:opacity-100"
              }`}
            >
              {isFr ? "RESSOURCES" : "RESOURCES"}
            </button>

            {/* Search Trigger */}
            <button
              onClick={() => {
                if (onSearchClick) {
                  onSearchClick();
                } else if (pathname === "/services") {
                  window.scrollTo({ top: 120, behavior: "smooth" });
                } else {
                  router.push("/services");
                }
              }}
              className="text-white hover:text-white/80 p-1 transition-opacity cursor-pointer ml-1"
              title={isFr ? "Recherche" : "Search"}
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Language Switcher Pill */}
            <button
              onClick={() => onLanguageChange(isFr ? "en" : "fr")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full transition-colors cursor-pointer ml-2 border border-white/20"
              title="Change Language"
            >
              <Globe className="w-3 h-3" />
              <span>{isFr ? "EN" : "FR"}</span>
            </button>

            {/* Officer portal discreet button */}
            <button
              onClick={onOpenOfficerPortal}
              className="text-white/80 hover:text-white p-1 transition-colors cursor-pointer"
              title={isFr ? "Espace Agent Public" : "Public Officer Portal"}
            >
              <UserCog className="w-4 h-4" />
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
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-blue-400/40">
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-2 font-medium tracking-wider uppercase"
            >
              {isFr ? "SERVICES (CATALOGUE)" : "SERVICES (PAGE)"}
            </Link>
            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("track");
                } else {
                  router.push("/?tab=track");
                }
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-medium tracking-wider uppercase"
            >
              {isFr ? "SUIVI DOSSIER" : "TRACK DOSSIER"}
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
              className="text-left py-2 font-medium tracking-wider uppercase"
            >
              {isFr ? "VÉRIFICATION" : "VERIFY DOC"}
            </button>
            <button
              onClick={() => {
                if (pathname === "/") {
                  onTabChange("faq");
                } else {
                  router.push("/?tab=faq");
                }
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-medium tracking-wider uppercase"
            >
              {isFr ? "RESSOURCES & FAQ" : "RESOURCES"}
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                onOpenOfficerPortal();
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
