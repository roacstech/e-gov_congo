"use client";

import React from "react";
import { ServiceItem, Language } from "../../types";
import { Clock, ArrowRight, CheckCircle2, Shield, FileText } from "lucide-react";

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
    <div className="group bg-white rounded-xl border border-slate-200/90 p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-medium tracking-wide text-blue-700 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded">
            {service.code}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isFr ? service.slaFr : service.slaEn}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(service)}
          className="text-base font-medium text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer leading-snug mb-1.5"
        >
          {isFr ? service.titleFr : service.titleEn}
        </h3>

        {/* Ministry / Authority */}
        <p className="text-xs text-slate-500 font-normal line-clamp-1 mb-2.5">
          {isFr ? service.ministryFr : service.ministryEn}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2 mb-4">
          {isFr ? service.descriptionFr : service.descriptionEn}
        </p>
      </div>

      {/* Footer details & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 font-normal truncate">
          <span className="text-slate-400">{isFr ? "Tarif : " : "Fee: "}</span>
          <span className="text-slate-700">{isFr ? service.costFr : service.costEn}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelect(service)}
            className="text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isFr ? "Détails" : "Details"}
          </button>
          {service.isOnlineAvailable ? (
            <button
              onClick={() => onApply(service)}
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>{isFr ? "Postuler" : "Apply"}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
              {isFr ? "En guichet" : "In Person"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
