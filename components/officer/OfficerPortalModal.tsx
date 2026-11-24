"use client";

import React, { useState } from "react";
import { CitizenApplication, Language } from "../../types";
import { X, Shield } from "lucide-react";

interface OfficerPortalModalProps {
  isOpen: boolean;
  language: Language;
  applications: CitizenApplication[];
  onClose: () => void;
  onUpdateStatus: (trackingId: string, newStatus: CitizenApplication["status"], notes: string) => void;
}

export const OfficerPortalModal: React.FC<OfficerPortalModalProps> = ({
  isOpen,
  language,
  applications,
  onClose,
  onUpdateStatus,
}) => {
  const isFr = language === "fr";

  const [selectedApp, setSelectedApp] = useState<CitizenApplication | null>(
    applications[0] || null
  );
  const [officerNote, setOfficerNote] = useState("");

  if (!isOpen) return null;

  const handleStatusChange = (status: CitizenApplication["status"]) => {
    if (!selectedApp) return;
    const note =
      officerNote.trim() ||
      (status === "approved"
        ? isFr
          ? "Dossier instruit et approuvé par l'officier de service."
          : "Dossier reviewed and approved by civil officer."
        : status === "ready"
        ? isFr
          ? "Document imprimé et disponible au bureau de retrait."
          : "Document printed and ready at collection counter."
        : isFr
        ? "Mise à jour du statut administratif."
        : "Administrative status update.");

    onUpdateStatus(selectedApp.trackingId, status, note);
    setSelectedApp({
      ...selectedApp,
      status,
      statusNotesFr: note,
      statusNotesEn: note,
    });
    setOfficerNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Shield className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-900">
                  {isFr ? "Guichet Dématérialisé — Espace Agent Administratif" : "Digital Desk — Public Officer Portal"}
                </h3>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-normal">
                  Agent ID: OFF-KIN-042
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {isFr
                  ? "Instruction des demandes citoyennes et délivrance des attestations officielles"
                  : "Citizen application processing and official certification clearance"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden text-xs">
          {/* Applications list sidebar */}
          <div className="border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-2 py-1">
              {isFr ? "Dossiers en attente" : "Pending Dossiers"} ({applications.length})
            </div>
            {applications.map((app) => (
              <div
                key={app.trackingId}
                onClick={() => setSelectedApp(app)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedApp?.trackingId === app.trackingId
                    ? "bg-white border-blue-400 shadow-xs ring-1 ring-blue-400"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-blue-700 font-medium">
                    {app.trackingId}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                      app.status === "ready"
                        ? "bg-emerald-50 text-emerald-700"
                        : app.status === "approved"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="font-medium text-slate-800 truncate">{app.applicantName}</div>
                <div className="text-[11px] text-slate-500 truncate">{app.serviceTitle}</div>
              </div>
            ))}
          </div>

          {/* Application Detail and Actions */}
          <div className="md:col-span-2 overflow-y-auto p-6 space-y-5 bg-white">
            {selectedApp ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {selectedApp.trackingId}
                    </span>
                    <h4 className="text-base font-medium text-slate-900 mt-1">
                      {selectedApp.serviceTitle}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-normal">{selectedApp.submittedAt}</span>
                </div>

                {/* Citizen Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">{isFr ? "Nom du déclarant :" : "Applicant:"}</span>
                    <span className="text-slate-800 font-medium">{selectedApp.applicantName}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">{isFr ? "Contact :" : "Contact:"}</span>
                    <span className="text-slate-800">{selectedApp.phone}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">{isFr ? "Courriel :" : "Email:"}</span>
                    <span className="text-slate-800">{selectedApp.email}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">{isFr ? "Point de retrait :" : "Collection Hub:"}</span>
                    <span className="text-slate-800">{selectedApp.collectionPoint}</span>
                  </div>
                </div>

                {/* Current notes */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-normal">
                    {isFr ? "Statut actuel & Observations :" : "Current Status & Officer Notes:"}
                  </span>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {isFr ? selectedApp.statusNotesFr : selectedApp.statusNotesEn}
                  </p>
                </div>

                {/* Change status actions */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block font-medium text-slate-700">
                    {isFr ? "Mettre à jour l'observation officielle :" : "Update official remark:"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isFr
                        ? "Ex: Contrôle d'état civil validé. Rendez-vous fixé au guichet."
                        : "Ex: Civil check verified. Ready for counter pickup."
                    }
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange("in_review")}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors font-medium cursor-pointer"
                    >
                      {isFr ? "Passer en instruction" : "Set In Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("approved")}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors font-medium cursor-pointer"
                    >
                      {isFr ? "Approuver le dossier" : "Approve Dossier"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("ready")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium cursor-pointer"
                    >
                      {isFr ? "Délivrer (Prêt au retrait)" : "Issue (Ready for Collection)"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400">
                {isFr ? "Sélectionnez une demande dans la liste." : "Select an application to inspect."}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{isFr ? "Toutes les actions sont enregistrées dans le journal d'audit national." : "All actions logged in state audit registry."}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isFr ? "Fermer l'espace agent" : "Close Officer Portal"}
          </button>
        </div>
      </div>
    </div>
  );
};
