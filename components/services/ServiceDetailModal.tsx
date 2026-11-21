"use client";

import React from "react";
import { ServiceItem, Language } from "../../types";
import { X, Clock, Banknote, Building2, Check, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  language: Language;
  onClose: () => void;
  onApply: (service: ServiceItem) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  language,
  onClose,
  onApply,
}) => {
  if (!service) return null;
  const isFr = language === "fr";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                {service.code}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                {isFr ? "Service Public Certifié" : "Certified Public Service"}
              </span>
            </div>
            <h2 className="text-lg font-medium text-slate-900 leading-snug">
              {isFr ? service.titleFr : service.titleEn}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isFr ? service.ministryFr : service.ministryEn}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5">
              {isFr ? "Description de la démarche" : "Service Overview"}
            </h4>
            <p className="text-slate-700 leading-relaxed font-normal">
              {isFr ? service.descriptionFr : service.descriptionEn}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{isFr ? "Délai moyen de délivrance" : "Processing SLA"}</span>
              </div>
              <div className="text-sm font-medium text-slate-800">
                {isFr ? service.slaFr : service.slaEn}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isFr ? "Tarif légal réglementé" : "Official Legal Tariff"}</span>
              </div>
              <div className="text-sm font-medium text-slate-800">
                {isFr ? service.costFr : service.costEn}
              </div>
            </div>
          </div>

          {/* Requirements list */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2.5">
              {isFr ? "Pièces & Conditions requises" : "Required Documents & Conditions"}
            </h4>
            <ul className="space-y-2">
              {(isFr ? service.requirementsFr : service.requirementsEn).map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-normal">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2]" />
                  </div>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Verification notice */}
          <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed font-normal">
              {isFr
                ? "Tous les documents délivrés comportent un cachet électronique infalsifiable et un QR Code de validation consultable sur le portail national."
                : "All documents issued carry a tamper-proof electronic security seal and validation QR code verifiable on the national portal."}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isFr ? "Fermer" : "Close"}
          </button>
          {service.isOnlineAvailable ? (
            <button
              onClick={() => {
                onClose();
                onApply(service);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>{isFr ? "Commencer la démarche en ligne" : "Start Application Online"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-xs text-slate-500 font-normal flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{isFr ? "Présentation physique obligatoire" : "In-person appointment required"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
