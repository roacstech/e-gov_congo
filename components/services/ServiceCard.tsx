"use client";

import React from "react";
import { ServiceItem, Language } from "../../types";
import {
  Clock,
  ArrowRight,
  Banknote,
  Building2,
  ShieldCheck,
  FileText,
  Scale,
  Car,
  Briefcase,
  Sparkles,
  FileCheck,
} from "lucide-react";

interface ServiceCardProps {
  service: ServiceItem;
  language: Language;
  onSelect: (service: ServiceItem) => void;
  onApply: (service: ServiceItem) => void;
  viewMode?: "grid" | "list";
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  language,
  onSelect,
  onApply,
  viewMode = "grid",
}) => {
  const isFr = language === "fr";

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "identity":
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case "civil_status":
        return <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
      case "transport":
        return <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case "justice":
        return <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case "business":
        return <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "identity":
        return isFr ? "Identité & Passeport" : "Identity & Passport";
      case "civil_status":
        return isFr ? "État Civil" : "Civil Status";
      case "transport":
        return isFr ? "Mobilité & Transport" : "Mobility & Transport";
      case "justice":
        return isFr ? "Justice & Légal" : "Justice & Legal";
      case "business":
        return isFr ? "Entreprises & Emploi" : "Business & Employment";
      default:
        return isFr ? "Service Public" : "Public Service";
    }
  };

  const reqCount = isFr
    ? service.requirementsFr?.length || 0
    : service.requirementsEn?.length || 0;

  // =========================================================================
  // LIST VIEW LAYOUT
  // =========================================================================
  if (viewMode === "list") {
    return (
      <div className="group bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wide text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              {service.code}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              {getCategoryIcon(service.category)}
              <span>{getCategoryLabel(service.category)}</span>
            </div>
            {service.isOnlineAvailable ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isFr ? "Démarche en ligne" : "Online application"}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {isFr ? "Guichet communal" : "In-person desk"}
              </span>
            )}
          </div>

          <h3
            onClick={() => onSelect(service)}
            className="text-base font-medium text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer"
          >
            {isFr ? service.titleFr : service.titleEn}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{isFr ? service.ministryFr : service.ministryEn}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-1">
            {isFr ? service.descriptionFr : service.descriptionEn}
          </p>
        </div>

        {/* Middle Stats: Cost and SLA */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 py-2 md:py-0 border-y md:border-y-0 md:border-l md:pl-5 border-slate-100 shrink-0">
          <div className="min-w-[120px]">
            <span className="text-[10px] uppercase font-semibold text-slate-600 tracking-wider block">
              {isFr ? "Tarif officiel" : "Regulated fee"}
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {isFr ? service.costFr : service.costEn}
            </span>
          </div>

          <div className="min-w-[110px]">
            <span className="text-[10px] uppercase font-semibold text-slate-600 tracking-wider block">
              {isFr ? "Délai légal" : "Turnaround"}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{isFr ? service.slaFr : service.slaEn}</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelect(service)}
            className="h-9 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
          >
            {isFr ? "Détails & Pièces" : "Details & Docs"}
          </button>

          {service.isOnlineAvailable ? (
            <button
              type="button"
              onClick={() => onApply(service)}
              className="h-9 px-3.5 rounded-lg inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>{isFr ? "Postuler" : "Apply"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(service)}
              className="h-9 px-3 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {isFr ? "Guide Guichet" : "Desk Guide"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // GRID VIEW LAYOUT (DEFAULT)
  // =========================================================================
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative">
      <div className="flex-1 flex flex-col">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold tracking-wide text-blue-700 bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-md shrink-0">
              {service.code}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md truncate">
              {getCategoryIcon(service.category)}
              <span className="truncate">{getCategoryLabel(service.category)}</span>
            </span>
          </div>

          {service.isOnlineAvailable ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isFr ? "En ligne" : "Online"}</span>
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
              {isFr ? "En guichet" : "In-person"}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(service)}
          className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer leading-snug line-clamp-2 min-h-[46px] mb-2"
          title={isFr ? service.titleFr : service.titleEn}
        >
          {isFr ? service.titleFr : service.titleEn}
        </h3>

        {/* Issuing Authority / Ministry */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal truncate mb-3">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate" title={isFr ? service.ministryFr : service.ministryEn}>
            {isFr ? service.ministryFr : service.ministryEn}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 min-h-[36px] mb-4">
          {isFr ? service.descriptionFr : service.descriptionEn}
        </p>

        {/* Transparency Box: Official Price & SLA */}
        <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 mb-4 space-y-2 mt-auto">
          {/* Regulated Price */}
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] text-slate-600 flex items-center gap-1 shrink-0">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isFr ? "Tarif officiel :" : "Regulated fee:"}</span>
            </span>
            <span className="text-xs font-semibold text-slate-900 text-right leading-tight">
              {isFr ? service.costFr : service.costEn}
            </span>
          </div>

          {/* Guaranteed Legal Delay */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
            <span className="text-slate-600 flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{isFr ? "Délai légal :" : "Processing SLA:"}</span>
            </span>
            <span className="font-medium text-slate-800">
              {isFr ? service.slaFr : service.slaEn}
            </span>
          </div>
        </div>

        {/* Requirements indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
          <FileCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isFr
              ? `${reqCount} pièce(s) justificative(s) requise(s)`
              : `${reqCount} required supporting document(s)`}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs mt-auto shrink-0">
        <button
          type="button"
          onClick={() => onSelect(service)}
          className="h-8.5 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-medium border border-slate-200/80"
        >
          {isFr ? "Détails & Pièces" : "Details & Docs"}
        </button>

        {service.isOnlineAvailable ? (
          <button
            type="button"
            onClick={() => onApply(service)}
            className="h-8.5 px-3.5 rounded-lg inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <span>{isFr ? "Postuler en ligne" : "Apply Online"}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(service)}
            className="h-8.5 px-3 rounded-lg inline-flex items-center justify-center text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium transition-colors cursor-pointer"
          >
            <span>{isFr ? "Guide guichet" : "Counter guide"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
