"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CitizenApplication, Language, ServiceOfficer } from "../../types";
import { X, Shield, Key, Lock, User, RefreshCw, LogOut, ExternalLink, Sparkles, AlertCircle } from "lucide-react";

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

  // Officer Authentication State
  const [isOfficerLoggedIn, setIsOfficerLoggedIn] = useState(false);
  const [currentOfficer, setCurrentOfficer] = useState<ServiceOfficer | null>(null);
  const [usernameInput, setUsernameInput] = useState("officer.cni");
  const [passwordInput, setPasswordInput] = useState("Cni@Kinshasa2026");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Application selection and status update
  const [selectedApp, setSelectedApp] = useState<CitizenApplication | null>(null);
  const [officerNote, setOfficerNote] = useState("");

  // Check saved officer session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("egov_active_officer_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.username) {
          setIsOfficerLoggedIn(true);
          setCurrentOfficer(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load officer session:", e);
    }
  }, []);

  // Filter or prioritize applications for the logged in officer's service
  useEffect(() => {
    if (applications.length > 0) {
      if (currentOfficer?.serviceId && currentOfficer.serviceId !== "all") {
        const matched = applications.find(
          (a) =>
            a.serviceId?.toLowerCase().includes(currentOfficer.serviceId.toLowerCase()) ||
            a.serviceTitle?.toLowerCase().includes(currentOfficer.serviceTitle.toLowerCase())
        );
        setSelectedApp(matched || applications[0]);
      } else {
        setSelectedApp(applications[0]);
      }
    }
  }, [applications, currentOfficer]);

  if (!isOpen) return null;

  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/officers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const officerData = data.officer;
        setIsOfficerLoggedIn(true);
        setCurrentOfficer(officerData);
        localStorage.setItem("egov_active_officer_session", JSON.stringify(officerData));
      } else {
        setLoginError(data.error || "Identifiants invalides.");
      }
    } catch (err) {
      console.error("Officer login error:", err);
      // Local fallback for offline testing
      const cleanU = usernameInput.trim().toLowerCase();
      const mockOfficer: ServiceOfficer = {
        officerId: "OFF-CNI-001",
        fullName: cleanU.includes("pass")
          ? "Officier Mireille Kapinga"
          : "Agent Baudouin Ilunga",
        username: cleanU,
        serviceId: cleanU.includes("pass") ? "passeport-ordinaire" : "cni-biometrique",
        serviceTitle: cleanU.includes("pass")
          ? "Demande de Passeport Ordinaire"
          : "Carte Nationale d'Identité",
        ministry: "Ministère de l'Intérieur, Sécurité et Affaires Coutumières",
        role: "service_officer",
        isActive: true,
      };
      setIsOfficerLoggedIn(true);
      setCurrentOfficer(mockOfficer);
      localStorage.setItem("egov_active_officer_session", JSON.stringify(mockOfficer));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOfficerLogout = () => {
    setIsOfficerLoggedIn(false);
    setCurrentOfficer(null);
    localStorage.removeItem("egov_active_officer_session");
  };

  const quickFillOfficer = (user: string, pass: string) => {
    setUsernameInput(user);
    setPasswordInput(pass);
    setLoginError("");
  };

  const handleStatusChange = (status: CitizenApplication["status"]) => {
    if (!selectedApp) return;
    const note =
      officerNote.trim() ||
      (status === "approved"
        ? isFr
          ? `Dossier instruit et approuvé par l'officier ${currentOfficer?.fullName || "de service"}.`
          : `Dossier reviewed and approved by civil officer ${currentOfficer?.fullName || ""}.`
        : status === "ready"
        ? isFr
          ? "Document officiel imprimé et disponible au bureau de retrait."
          : "Official document printed and ready at collection counter."
        : isFr
        ? "Mise à jour du statut administratif par le service compétent."
        : "Administrative status update by authorized service.");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* ============================================================== */}
        {/* MODAL HEADER                                                  */}
        {/* ============================================================== */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">
                  {isFr
                    ? "Guichet Dématérialisé — Espace Agent Ministériel"
                    : "Digital Sovereign Desk — Public Officer Portal"}
                </h3>
                {isOfficerLoggedIn && currentOfficer && (
                  <span className="text-[10px] bg-blue-500/30 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full font-mono font-semibold">
                    {currentOfficer.officerId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isOfficerLoggedIn && currentOfficer
                  ? `${currentOfficer.fullName} • ${currentOfficer.serviceTitle}`
                  : isFr
                  ? "Instruction des demandes citoyennes par service habilité"
                  : "Citizen procedure clearance and verification"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Link to Super Admin Dashboard */}
            <Link
              href="/admin"
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-semibold transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isFr ? "Espace Super Admin" : "Super Admin"}</span>
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* IF NOT LOGGED IN: OFFICER LOGIN VIEW                          */}
        {/* ============================================================== */}
        {!isOfficerLoggedIn ? (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="max-w-md mx-auto space-y-5">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isFr ? "Authentification Agent Requise" : "Officer Authentication Required"}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-slate-900">
                  {isFr ? "Connexion au Service Habilité" : "Sign in to Service Desk"}
                </h4>
                <p className="text-xs text-slate-500">
                  {isFr
                    ? "Connectez-vous avec les identifiants générés par le Super Admin pour votre service."
                    : "Log in with the credentials generated by the Super Admin for your service."}
                </p>
              </div>

              {/* Informational banner: Default credentials loaded */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {isFr
                      ? "Identifiants par défaut chargés. Cliquez directement ci-dessous."
                      : "Default credentials loaded. Click below to enter."}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  1-Clic
                </span>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleOfficerLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nom d'utilisateur de l'agent (Par défaut)
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      required
                      placeholder="officer.cni"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mot de passe (Par défaut)
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50 text-sm"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>
                        {isFr
                          ? "Accéder au Guichet Agent (Accès Immédiat)"
                          : "Access Officer Desk (Direct Access)"}
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Preset Selector for Demo/Testing */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block text-center">
                  Comptes de test pré-configurés par le Super Admin :
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => quickFillOfficer("officer.cni", "Cni@Kinshasa2026")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-medium cursor-pointer"
                  >
                    CNI (officer.cni)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFillOfficer("officer.passport", "Pass@Dgm2026")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-medium cursor-pointer"
                  >
                    Passeport (officer.passport)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFillOfficer("officer.driving", "Permis@Rdc2026")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-medium cursor-pointer"
                  >
                    Permis (officer.driving)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFillOfficer("officer.birth", "EtatCivil@2026")}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors font-medium cursor-pointer"
                  >
                    État Civil (officer.birth)
                  </button>
                </div>
              </div>

              {/* Link to Super Admin Dashboard */}
              <div className="text-center pt-2">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Vous êtes Super Admin ? Ouvrir le Tableau de Bord Central →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* IF LOGGED IN: OFFICER DESK WORKFLOW                            */
          /* ============================================================== */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden text-xs">
            {/* Applications list sidebar */}
            <div className="border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {isFr ? "Dossiers" : "Dossiers"} ({applications.length})
                </div>
                <button
                  onClick={handleOfficerLogout}
                  className="text-[11px] text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                  title="Changer d'agent"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{isFr ? "Quitter" : "Logout"}</span>
                </button>
              </div>

              {applications.map((app) => (
                <div
                  key={app.trackingId}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedApp?.trackingId === app.trackingId
                      ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-blue-700 font-bold">
                      {app.trackingId}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        app.status === "ready"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.status === "approved"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 truncate">
                    {app.applicantName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {app.serviceTitle}
                  </div>
                </div>
              ))}
            </div>

            {/* Application Detail and Actions */}
            <div className="md:col-span-2 overflow-y-auto p-6 space-y-5 bg-white">
              {selectedApp ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">
                        {selectedApp.trackingId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {selectedApp.serviceTitle}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400 font-normal">
                      {selectedApp.submittedAt}
                    </span>
                  </div>

                  {/* Citizen Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">
                        {isFr ? "Nom du déclarant :" : "Applicant:"}
                      </span>
                      <span className="text-slate-900 font-bold">
                        {selectedApp.applicantName}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">
                        {isFr ? "Contact :" : "Contact:"}
                      </span>
                      <span className="text-slate-800 font-medium">
                        {selectedApp.phone}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">
                        {isFr ? "Courriel :" : "Email:"}
                      </span>
                      <span className="text-slate-800">
                        {selectedApp.email}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block mb-0.5">
                        {isFr ? "Point de retrait :" : "Collection Hub:"}
                      </span>
                      <span className="text-slate-800">
                        {selectedApp.collectionPoint || "Kinshasa - Gombe"}
                      </span>
                    </div>
                  </div>

                  {/* Current notes */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-medium">
                      {isFr
                        ? "Statut actuel & Observations officielles :"
                        : "Current Status & Officer Notes:"}
                    </span>
                    <p className="text-slate-800 leading-relaxed">
                      {isFr ? selectedApp.statusNotesFr : selectedApp.statusNotesEn}
                    </p>
                  </div>

                  {/* Change status actions */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="block font-bold text-slate-800">
                      {isFr
                        ? "Mettre à jour l'observation officielle de l'agent :"
                        : "Update official remark:"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        isFr
                          ? "Ex: Contrôle de conformité validé. Document prêt pour délivrance."
                          : "Ex: Compliance check cleared. Document ready for issuance."
                      }
                      value={officerNote}
                      onChange={(e) => setOfficerNote(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange("in_review")}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors font-semibold cursor-pointer"
                      >
                        {isFr ? "Passer en instruction" : "Set In Review"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange("approved")}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors font-semibold cursor-pointer"
                      >
                        {isFr ? "Approuver le dossier" : "Approve Dossier"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange("ready")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-semibold shadow-xs cursor-pointer"
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
        )}

        {/* ============================================================== */}
        {/* MODAL FOOTER                                                  */}
        {/* ============================================================== */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              {isFr
                ? "Toutes les actions sont enregistrées dans le journal d'audit national."
                : "All actions logged in state audit registry."}
            </span>
            <Link
              href="/admin"
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Tableau de bord Super Admin
            </Link>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
          >
            {isFr ? "Fermer" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
