"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Language, CitizenApplication } from "../../../types";
import { SERVICES_DATA } from "../../../data/services";
import { Navbar } from "../../../components/layout/Navbar";
import { Footer } from "../../../components/layout/Footer";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Banknote,
  FileText,
  Building2,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  Check,
  Copy,
  Layers,
  FileCheck,
} from "lucide-react";

function ServiceDetailContent() {
  const params = useParams();
  const serviceId = params?.id as string;
  const router = useRouter();

  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  const service =
    SERVICES_DATA.find((s) => s.id === serviceId) || SERVICES_DATA[0];

  const [activeTab, setActiveTab] = useState<"apply" | "requirements" | "workflow">("apply");

  // Form states
  const [appStep, setAppStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Kinshasa - Gombe");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [submittedApp, setSubmittedApp] = useState<CitizenApplication | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles((prev) => [...prev, ...names]);
    }
  };

  const handleSubmit = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-${service.code}-${randomSuffix}`;

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: service.id,
      serviceTitle: isFr ? service.titleFr : service.titleEn,
      applicantName: fullName.trim() || (isFr ? "Citoyen Congolais" : "Congolese Citizen"),
      email: email.trim() || "citoyen@service-public.cd",
      phone: phone.trim() || "+243 81 000 0000",
      city: city,
      submittedAt: "Aujourd'hui, 2026",
      status: "submitted",
      statusNotesFr:
        "Pré-demande enregistrée sur le portail national. Dossier transmis pour instruction administrative.",
      statusNotesEn:
        "Application recorded on the national portal. Dossier routed for administrative processing.",
      collectionPoint: `Guichet Provincial - Centre de ${city}`,
    };

    setSubmittedApp(newApp);
    setAppStep(4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab="services"
        onTabChange={(tab) => {
          router.push(`/?tab=${tab}`);
        }}
        onOpenOfficerPortal={() => router.push("/?officer=true")}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 sm:pt-[105px]">
        {/* Sovereign Color Stripe */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#007fff]" />
          <div className="w-1/6 bg-[#fcd116]" />
          <div className="w-1/6 bg-[#ce1126]" />
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#eef6fe] via-[#f5f9fd] to-[#f8fafc] border-b border-slate-200/90 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isFr ? "Accueil" : "Home"}</span>
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500 font-medium">{isFr ? "Services Publics" : "Public Services"}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-900 font-semibold">{isFr ? service.titleFr : service.titleEn}</span>
            </div>

            {/* Title & Sovereign Badges */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold tracking-wider text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    {service.code}
                  </span>
                  {service.isOnlineAvailable ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isFr ? "Démarche 100% en ligne" : "Online application"}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {isFr ? "Guichet physique" : "In-person registration"}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight leading-tight">
                  {isFr ? service.titleFr : service.titleEn}
                </h1>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium">{isFr ? service.ministryFr : service.ministryEn}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isFr ? service.descriptionFr : service.descriptionEn}
                </p>
              </div>

              {/* Quick Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm shrink-0 w-full lg:w-72 space-y-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    {isFr ? "Tarif Réglementé" : "Official Regulated Fee"}
                  </span>
                  <div className="text-base font-bold text-slate-900">
                    {isFr ? service.costFr : service.costEn}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    {isFr ? "Délai Légal Moyen" : "Legal Turnaround"}
                  </span>
                  <div className="text-sm font-semibold text-slate-800">
                    {isFr ? service.slaFr : service.slaEn}
                  </div>
                </div>

                {service.isOnlineAvailable ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("apply");
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isFr ? "Commencer la démarche" : "Start Application Online"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    {isFr ? "Présentation au guichet communal requise" : "In-person visit required"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tab Controls */}
        <div className="bg-white border-b border-slate-200 sticky top-24 sm:top-[105px] z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2">
              <button
                type="button"
                onClick={() => setActiveTab("apply")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "apply"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{isFr ? "1. Démarche & Formulaire" : "1. Application Form"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("requirements")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "requirements"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isFr ? "2. Pièces Requises" : "2. Requirements"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("workflow")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "workflow"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isFr ? "3. Procédure & Délais" : "3. Official Workflow"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {activeTab === "apply" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                {appStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isFr ? "Formulaire de Démarche" : "Service Application"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isFr
                          ? "Saisissez les informations relatives au bénéficiaire de la démarche."
                          : "Enter beneficiary details for this official procedure."}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Nom complet du demandeur *" : "Full Applicant Name *"}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: KABANGE MUKENDI Éric"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Téléphone (+243) *" : "Phone (+243) *"}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {isFr ? "Email *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="citoyen@example.cd"
                          className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {isFr ? "Ville / Commune d'Instruction *" : "City / Processing Location *"}
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Kinshasa - Gombe">Kinshasa - Gombe</option>
                        <option value="Kinshasa - Limete">Kinshasa - Limete</option>
                        <option value="Lubumbashi - Haut-Katanga">Lubumbashi - Haut-Katanga</option>
                        <option value="Goma - Nord-Kivu">Goma - Nord-Kivu</option>
                        <option value="Matadi - Kongo-Central">Matadi - Kongo-Central</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setAppStep(2)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 ml-auto"
                      >
                        <span>{isFr ? "Continuer" : "Continue"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {appStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {isFr ? "Pièces justificatives" : "Supporting Documents"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isFr ? "Téléversez les documents requis." : "Upload required files."}
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50">
                      <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                      <div>
                        <label
                          htmlFor="generic-file-upload"
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer block"
                        >
                          {isFr ? "Téléverser les pièces justificatives" : "Upload supporting documents"}
                        </label>
                        <span className="text-[11px] text-slate-400">PDF, JPG, PNG (Max. 5 MB)</span>
                        <input
                          id="generic-file-upload"
                          type="file"
                          multiple
                          onChange={handleSimulatedUpload}
                          className="hidden"
                        />
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="pt-2 text-left space-y-1.5 max-w-sm mx-auto">
                          {uploadedFiles.map((fn, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center justify-between border border-emerald-100"
                            >
                              <span className="truncate">{fn}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setAppStep(1)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {isFr ? "Retour" : "Back"}
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isFr ? "Soumettre la demande" : "Submit Application"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {appStep === 4 && submittedApp && (
                  <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {isFr ? "Demande Enregistrée avec Succès !" : "Application Registered!"}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {isFr
                          ? "Votre dossier a été enregistré sur le portail officiel de la RDC. Conservez votre numéro de suivi."
                          : "Your application has been registered on the official DRC portal. Keep your tracking number."}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 max-w-md mx-auto text-left space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-[11px] font-semibold uppercase text-slate-600">
                          {isFr ? "Récépissé Officiel" : "Official Receipt"}
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {service.code}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {isFr ? "Numéro de Suivi Unique" : "Tracking Number"}
                        </span>
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-900">
                          <span>{submittedApp.trackingId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(submittedApp.trackingId)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-sans font-medium flex items-center gap-1 cursor-pointer"
                          >
                            {hasCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{hasCopied ? (isFr ? "Copié" : "Copied") : (isFr ? "Copier" : "Copy")}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Link
                        href={`/?tab=track&id=${submittedApp.trackingId}`}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        <span>{isFr ? "Suivre en direct ce dossier" : "Track Dossier Live"}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Information summary */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {isFr ? "Autorité Compétente" : "Issuing Authority"}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isFr ? service.ministryFr : service.ministryEn}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isFr ? "Tarif :" : "Fee:"}</span>
                    <span className="font-bold text-slate-900">{isFr ? service.costFr : service.costEn}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{isFr ? "Délai moyen :" : "Turnaround:"}</span>
                    <span className="font-bold text-slate-900">{isFr ? service.slaFr : service.slaEn}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900">
                {isFr ? "Pièces & Justificatifs Requis" : "Required Documents"}
              </h3>
              <ul className="space-y-3">
                {(isFr ? service.requirementsFr : service.requirementsEn).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "workflow" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900">
                {isFr ? "Instruction et Délais d'Obtention" : "Processing Workflow & SLA"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isFr
                  ? `Le délai réglementaire pour l'obtention de ce document est de ${service.slaFr}. Les démarches s'effectuent sous le contrôle de : ${service.ministryFr}.`
                  : `The official turnaround time for this document is ${service.slaEn}. Handled under the supervision of: ${service.ministryEn}.`}
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}

export default function GenericServiceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ServiceDetailContent />
    </Suspense>
  );
}
