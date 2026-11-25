"use client";

import React from "react";
import { Language } from "../../types";
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const isFr = language === "fr";

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-20 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-700">
                <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <span className="text-slate-800 font-medium">service-public.cd</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {isFr
                ? "Plateforme unifiée de modernisation administrative et de dématérialisation des services publics au bénéfice des citoyens et des entreprises."
                : "Unified administrative modernization platform delivering digitized public services for citizens and enterprises."}
            </p>
            <div className="text-xs text-slate-400 font-normal">
              © 2026 République Démocratique du Congo.
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-800 uppercase tracking-wider">
              {isFr ? "Services Populaires" : "Popular Services"}
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 font-normal">
              <li>
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                  {isFr ? "Carte d'Identité Biométrique" : "Biometric Identity Card"}
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                  {isFr ? "Demande de Passeport" : "Passport Application"}
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                  {isFr ? "Casier Judiciaire (Bulletin N°3)" : "Criminal Record Certificate"}
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                  {isFr ? "Permis de Conduire Numérique" : "Smart Driver's License"}
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                  {isFr ? "Création d'Entreprise (GUCE)" : "Business Creation (GUCE)"}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-800 uppercase tracking-wider">
              {isFr ? "Institutions & Portails" : "Institutions & Portals"}
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 font-normal">
              <li className="flex items-center gap-1">
                <a
                  href="#privacy"
                  className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>{isFr ? "Présidence de la République" : "Presidency of the Republic"}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li className="flex items-center gap-1">
                <a
                  href="#privacy"
                  className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>{isFr ? "Primature du Gouvernement" : "Prime Minister's Office"}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li className="flex items-center gap-1">
                <a
                  href="#privacy"
                  className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>{isFr ? "Ministère de la Justice" : "Ministry of Justice"}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li className="flex items-center gap-1">
                <a
                  href="#privacy"
                  className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>{isFr ? "Journal Officiel de la RDC" : "Official Gazette of DRC"}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-800 uppercase tracking-wider">
              {isFr ? "Assistance & Contact" : "Support & Inquiries"}
            </div>
            <div className="space-y-2 text-xs text-slate-600 font-normal">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>+243 (0) 81 000 4688 / N° Vert : 114</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>contact@service-public.cd</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                <span>Boulevard du 30 Juin, Gombe, Kinshasa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider and legal */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-normal gap-3">
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 cursor-pointer">
              {isFr ? "Mentions Légales" : "Legal Notice"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="hover:text-slate-800 cursor-pointer">
              {isFr ? "Protection des Données Personnelles" : "Personal Data Protection"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="hover:text-slate-800 cursor-pointer">
              {isFr ? "Accessibilité Numérique" : "Digital Accessibility"}
            </span>
          </div>
          <div>
            <span>{isFr ? "Système Sécurisé SSL 256-bit" : "Secured 256-bit SSL System"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
