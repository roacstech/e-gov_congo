"use client";

import React from "react";
import { ServiceItem, Language } from "../../types";
import { Clock, ArrowRight } from "lucide-react";

interface ServiceCardProps {
  service: ServiceItem;
  language: Language;
  onSelect: (service: ServiceItem) => void;
  onApply: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  language,
  onSelect,
  onApply,
}) => {
  const isFr = language === "fr";

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-full">
      <div className="flex-1 flex flex-col">
        {/* Header tags: Code & SLA */}
        <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
          <span className="text-[11px] font-medium tracking-wide text-blue-700 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded">
            {service.code}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isFr ? service.slaFr : service.slaEn}</span>
          </div>
        </div>

        {/* Title - consistent height and 2-line clamp */}
        <h3
          onClick={() => onSelect(service)}
          className="text-sm sm:text-base font-medium text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer leading-snug line-clamp-2 min-h-[44px] mb-1.5"
          title={isFr ? service.titleFr : service.titleEn}
        >
          {isFr ? service.titleFr : service.titleEn}
        </h3>

        {/* Issuing Authority / Ministry */}
        <p className="text-xs text-slate-500 font-normal truncate mb-2">
          {isFr ? service.ministryFr : service.ministryEn}
        </p>

        {/* Description - consistent 2-line clamp */}
        <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2 min-h-[36px] mb-4">
          {isFr ? service.descriptionFr : service.descriptionEn}
        </p>
      </div>

      {/* Footer actions - clean baseline alignment without pricing */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs mt-auto shrink-0">
        <button
          type="button"
          onClick={() => onSelect(service)}
          className="h-8 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 whitespace-nowrap text-xs font-normal"
        >
          {isFr ? "Détails" : "Details"}
        </button>

        {service.isOnlineAvailable ? (
          <button
            type="button"
            onClick={() => onApply(service)}
            className="h-8 px-4 rounded-lg inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer shrink-0 whitespace-nowrap min-w-[85px]"
          >
            <span>{isFr ? "Postuler" : "Apply"}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        ) : (
          <span className="h-8 px-3 rounded-lg inline-flex items-center justify-center text-[11px] text-slate-500 bg-slate-100 border border-slate-200 shrink-0 whitespace-nowrap">
            {isFr ? "En guichet" : "In Person"}
          </span>
        )}
      </div>
    </div>
  );
};
