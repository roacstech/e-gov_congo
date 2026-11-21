"use client";

import React from "react";
import { Language } from "../../types";
import { ShieldCheck, Search, FileText, CheckCircle2, UserCog, Globe } from "lucide-react";

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: "services" | "track" | "verify" | "faq";
  onTabChange: (tab: "services" | "track" | "verify" | "faq") => void;
  onOpenOfficerPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  onOpenOfficerPortal,
}) => {
  const isFr = language === "fr";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Official Top sovereign bar */}
      <div className="bg-slate-50 border-b border-slate-200/60 text-xs text-slate-600 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-normal text-slate-600">
              {isFr
                ? "Portail Numérique Officiel des Services Publics de la République"
                : "Official Digital Public Services Portal of the Republic"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLanguageChange(isFr ? "en" : "fr")}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              title="Changer de langue"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isFr ? "English" : "Français"}</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={onOpenOfficerPortal}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5 text-slate-500" />
              <span>{isFr ? "Espace Agent Public" : "Public Officer Portal"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Emblem */}
          <div
            onClick={() => onTabChange("services")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 tracking-tight">
                  service-public.cd
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                  RDC
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {isFr ? "Guichet Unique de l'Administration" : "Single Government Service Gateway"}
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange("services")}
              className={`px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activeTab === "services"
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {isFr ? "Démarches & Services" : "Procedures & Services"}
            </button>

            <button
              onClick={() => onTabChange("track")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activeTab === "track"
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>{isFr ? "Suivre une demande" : "Track Application"}</span>
            </button>

            <button
              onClick={() => onTabChange("verify")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activeTab === "verify"
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isFr ? "Vérifier un document" : "Verify Document"}</span>
            </button>

            <button
              onClick={() => onTabChange("faq")}
              className={`px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activeTab === "faq"
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {isFr ? "Aide & Questions" : "Help & FAQ"}
            </button>
          </nav>

          {/* Quick CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange("track")}
              className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isFr ? "Mon Dossier" : "My Dossier"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
