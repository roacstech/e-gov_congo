"use client";

import React, { useState } from "react";
import { Language } from "../../types";
import { FAQS } from "../../data/services";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqSectionProps {
  language: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ language }) => {
  const isFr = language === "fr";
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-medium mb-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isFr ? "Centre d'Assistance aux Usagers" : "Citizen Support Center"}</span>
        </div>
        <h2 className="text-xl font-medium text-slate-900 tracking-tight">
          {isFr ? "Foire Aux Questions & Démarches Administratives" : "Frequently Asked Questions"}
        </h2>
        <p className="text-xs text-slate-500 font-normal max-w-md mx-auto">
          {isFr
            ? "Retrouvez les réponses aux questions les plus courantes sur vos démarches en ligne et en guichet."
            : "Find answers to commonly asked questions about online procedures and municipal offices."}
        </p>
      </div>

      <div className="space-y-3 pt-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200/90 overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800">
                  {isFr ? faq.qFr : faq.qEn}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-3">
                  {isFr ? faq.aFr : faq.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
