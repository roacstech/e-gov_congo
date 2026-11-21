"use client";

import React, { useState } from "react";
import { ServiceItem, Language, CitizenApplication } from "../../types";
import { X, CheckCircle2, ArrowRight, ArrowLeft, UploadCloud, Copy, Check, FileCheck, Building } from "lucide-react";

interface ApplicationModalProps {
  service: ServiceItem | null;
  language: Language;
  onClose: () => void;
  onSubmitted: (newApp: CitizenApplication) => void;
  onTrackNow: (trackingId: string) => void;
}

const CONGO_CITIES = [
  "Kinshasa - Gombe",
  "Kinshasa - Lingwala",
  "Kinshasa - Limete",
  "Lubumbashi - Haut-Katanga",
  "Goma - Nord-Kivu",
  "Matadi - Kongo-Central",
  "Kisangani - Tshopo",
  "Mbuji-Mayi - Kasaï-Oriental",
  "Bukavu - Sud-Kivu",
];

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  service,
  language,
  onClose,
  onSubmitted,
  onTrackNow,
}) => {
  if (!service) return null;
  const isFr = language === "fr";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+243 ");
  const [city, setCity] = useState(CONGO_CITIES[0]);
  const [nationalIdOrBirthCert, setNationalIdOrBirthCert] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [generatedApp, setGeneratedApp] = useState<CitizenApplication | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles((prev) => [...prev, ...names]);
    }
  };

  const handleCompleteSubmission = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `CD-2026-${randomSuffix}`;

    const newApp: CitizenApplication = {
      trackingId: trackingCode,
      serviceId: service.id,
      serviceTitle: isFr ? service.titleFr : service.titleEn,
      applicantName: fullName.trim() || "Citoyen Déclarant",
      email: email.trim() || "citoyen@example.cd",
      phone: phone.trim() || "+243 81 000 0000",
      city: city,
      submittedAt: "Aujourd'hui, 2026",
      status: "submitted",
      statusNotesFr: "Demande enregistrée sur le portail national. Dossier transmis au bureau d'instruction.",
      statusNotesEn: "Application registered on the national portal. Dossier routed for initial review.",
      collectionPoint: `Guichet Provincial - Centre de ${city}`,
    };

    setGeneratedApp(newApp);
    onSubmitted(newApp);
    setStep(4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                {service.code}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                {isFr ? "Formulaire de Démarche en Ligne" : "Online Procedure Form"}
              </span>
            </div>
            <h3 className="text-base font-medium text-slate-900 leading-snug">
              {isFr ? service.titleFr : service.titleEn}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    step >= 1 ? "bg-blue-600 text-white font-medium" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  1
                </span>
                <span className={step === 1 ? "font-medium text-slate-900" : "text-slate-500"}>
                  {isFr ? "Identité" : "Identity"}
                </span>
              </div>
              <div className="w-8 h-[1px] bg-slate-200" />
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    step >= 2 ? "bg-blue-600 text-white font-medium" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  2
                </span>
                <span className={step === 2 ? "font-medium text-slate-900" : "text-slate-500"}>
                  {isFr ? "Pièces" : "Files"}
                </span>
              </div>
              <div className="w-8 h-[1px] bg-slate-200" />
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    step >= 3 ? "bg-blue-600 text-white font-medium" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  3
                </span>
                <span className={step === 3 ? "font-medium text-slate-900" : "text-slate-500"}>
                  {isFr ? "Délivrance" : "Delivery"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 text-sm flex-1">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-normal">
                {isFr
                  ? "Renseignez vos coordonnées exactes telles qu'elles figurent sur vos actes officiels."
                  : "Please enter your legal identity information as registered in civil records."}
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isFr ? "Nom, Post-nom et Prénom" : "Full Legal Name"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isFr ? "Ex: KAZADI MUKENDI Jean-Pierre" : "Ex: John Doe"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {isFr ? "Adresse Courriel (Email)" : "Email Address"} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="citoyen@domaine.cd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {isFr ? "Numéro de Téléphone" : "Phone Number"} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+243 81 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isFr
                    ? "Numéro de Pièce d'Identité ou Référence de Naissance"
                    : "National ID Number or Birth Certificate Reference"}
                </label>
                <input
                  type="text"
                  placeholder={isFr ? "Ex: NIN-9281902 ou Acte N° 481/2020" : "Ex: ID-102948"}
                  value={nationalIdOrBirthCert}
                  onChange={(e) => setNationalIdOrBirthCert(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-normal">
                {isFr
                  ? "Joignez une copie numérique des documents requis (format PDF ou image lisible)."
                  : "Upload digital copies of required files (PDF or clear image scans)."}
              </p>

              <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs text-slate-600 font-medium mb-1">
                  {isFr ? "Sélectionner les pièces à joindre" : "Choose files to upload"}
                </div>
                <p className="text-[11px] text-slate-400 mb-3">PDF, JPEG ou PNG (max 10 Mo)</p>
                <label className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                  <span>{isFr ? "Parcourir les fichiers" : "Browse files"}</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleSimulatedUpload}
                  />
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-slate-700">
                    {isFr ? "Fichiers téléversés :" : "Uploaded documents:"}
                  </div>
                  {uploadedFiles.map((fn, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-slate-100/70 px-3 py-1.5 rounded border border-slate-200"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate text-slate-700">{fn}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">OK</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 leading-relaxed font-normal">
                {isFr
                  ? "Note : Pour certaines démarches biométriques (passeport, permis), vous recevrez une convocation pour la prise de vue et d'empreintes digitales."
                  : "Note: For biometric documents (passport, driver's license), you will receive an appointment slip for physical biometric enrollment."}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-normal">
                {isFr
                  ? "Sélectionnez le centre administratif communal où vous souhaitez retirer votre document ou effectuer l'enrôlement."
                  : "Select the municipal or regional administrative center where you wish to collect your document or enroll."}
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {isFr ? "Centre Administratif de Retrait" : "Collection & Enrollment Hub"}
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {CONGO_CITIES.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-medium text-slate-800">
                  {isFr ? "Récapitulatif de votre démarche" : "Summary of Application"}
                </div>
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>{isFr ? "Service :" : "Service:"}</span>
                  <span className="font-medium text-slate-800 text-right">
                    {isFr ? service.titleFr : service.titleEn}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>{isFr ? "Demandeur :" : "Applicant:"}</span>
                  <span className="font-medium text-slate-800">{fullName || "Citoyen"}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>{isFr ? "Frais réglementés :" : "Legal fee:"}</span>
                  <span className="text-emerald-700 font-medium">
                    {isFr ? service.costFr : service.costEn}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 font-normal">
                  <span>{isFr ? "Délai estimé :" : "Estimated SLA:"}</span>
                  <span>{isFr ? service.slaFr : service.slaEn}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && generatedApp && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div>
                <h4 className="text-base font-medium text-slate-900 mb-1">
                  {isFr ? "Votre demande a été enregistrée avec succès" : "Application Successfully Submitted"}
                </h4>
                <p className="text-xs text-slate-500 font-normal">
                  {isFr
                    ? "Conservez précieusement votre numéro de référence pour suivre l'avancement de votre dossier."
                    : "Please record your official reference number to follow the progress of your application."}
                </p>
              </div>

              {/* Tracking code pill */}
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl">
                <span className="text-xs text-slate-500 font-normal">
                  {isFr ? "N° de suivi officiel :" : "Tracking ID:"}
                </span>
                <span className="font-mono text-sm font-medium text-blue-700">
                  {generatedApp.trackingId}
                </span>
                <button
                  onClick={() => copyToClipboard(generatedApp.trackingId)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Copier"
                >
                  {hasCopied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left space-y-1 font-normal">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFr ? "Centre désigné :" : "Collection Hub:"}</span>
                  <span className="text-slate-800 font-medium">{generatedApp.collectionPoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isFr ? "Date de soumission :" : "Submitted:"}</span>
                  <span className="text-slate-800">{generatedApp.submittedAt}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onTrackNow(generatedApp.trackingId);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>{isFr ? "Suivre cette demande maintenant" : "Track This Application Now"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls for Step 1-3 */}
        {step < 4 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isFr ? "Précédent" : "Back"}</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep((prev) => (prev + 1) as 2 | 3)}
                disabled={step === 1 && !fullName.trim()}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  step === 1 && !fullName.trim()
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <span>{isFr ? "Continuer" : "Next"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleCompleteSubmission}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>{isFr ? "Confirmer et Soumettre" : "Confirm & Submit"}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
