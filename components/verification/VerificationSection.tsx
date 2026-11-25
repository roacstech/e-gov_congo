"use client";

import React, { useState } from "react";
import { CitizenApplication, Language, VerifiedDocument } from "../../types";
import { SAMPLE_DOCUMENTS, getLocalizedServiceTitle } from "../../data/services";
import { SignedDocumentAndIdProofViewer } from "../officer/SignedDocumentAndIdProofViewer";
import { ShieldCheck, CheckCircle2, QrCode, Search, Building2, Calendar, AlertCircle, Loader2 } from "lucide-react";

interface VerificationSectionProps {
  language: Language;
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({ language }) => {
  const isFr = language === "fr";
  const [docNumber, setDocNumber] = useState("");
  const [verifiedDoc, setVerifiedDoc] = useState<VerifiedDocument | null>(null);
  const [liveVerifiedApp, setLiveVerifiedApp] = useState<CitizenApplication | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = docNumber.trim().replace(/\s+/g, "").toUpperCase();
    if (!clean) return;

    setErrorMsg(null);
    setVerifiedDoc(null);
    setLiveVerifiedApp(null);

    if (SAMPLE_DOCUMENTS[clean]) {
      setVerifiedDoc(SAMPLE_DOCUMENTS[clean]);
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(
        `/api/officer/applications?trackingId=${encodeURIComponent(clean)}&publicLookup=1`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const app: CitizenApplication | undefined = data.application;
        if (app) {
          const isOfficiallyApproved =
            (app.status === "approved" || app.status === "ready") &&
            Boolean(app.issuedNumber || app.workflow?.issuedDocumentNumber);
          if (!isOfficiallyApproved) {
            setErrorMsg(
              isFr
                ? "Ce dossier est en cours de traitement et n'a pas encore de numéro officiel délivré. Utilisez « Suivi Demande » pour suivre son avancement."
                : "This application is still in progress and has not yet received an approved official document number. Use 'Track Application' to check status."
            );
            return;
          }
          setVerifiedDoc(null);
          setLiveVerifiedApp(app);
          return;
        }
      }
    } catch (err) {
      console.error("Document verification lookup error:", err);
    } finally {
      setIsVerifying(false);
    }

    setErrorMsg(
      isFr
        ? "Numéro de document non répertorié ou certificat invalide dans le registre central."
        : "Document number not found or invalid certificate in central state registry."
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isFr ? "Authentification Souveraine de Documents" : "Sovereign Document Authentication"}</span>
        </div>
        <h2 className="text-xl font-medium text-slate-900 tracking-tight">
          {isFr ? "Vérification d'authenticité d'un document d'État" : "Verify Official Government Document"}
        </h2>
        <p className="text-xs text-slate-500 font-normal max-w-lg mx-auto">
          {isFr
            ? "Saisissez le numéro officiel figurant sur votre document (Certificat de Nationalité, Passeport, Carte CNI, Acte d'État Civil, Permis) pour vérifier son authenticité."
            : "Enter the official document number printed on your document (Nationality Certificate, Passport, National ID, Civil Act, Permit) to verify its authenticity."}
        </p>

        {/* Search input */}
        <form onSubmit={handleVerify} className="max-w-lg mx-auto pt-4">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1.5 shadow-xs focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600">
            <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder={
                isFr
                  ? "Ex: NAT-CD-2026-350142, OP-CD-..., NIN-CD-..."
                  : "Ex: NAT-CD-2026-350142, OP-CD-..., NIN-CD-..."
              }
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
            >
              {isVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isFr ? "Vérifier" : "Verify"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
            <span>{isFr ? "Exemples démo :" : "Demo samples:"}</span>
            <button
              type="button"
              onClick={() => {
                setDocNumber("DOC-CD-99412");
                setVerifiedDoc(SAMPLE_DOCUMENTS["DOC-CD-99412"]);
                setLiveVerifiedApp(null);
                setErrorMsg(null);
              }}
              className="font-mono text-emerald-700 hover:underline cursor-pointer"
            >
              DOC-CD-99412
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => {
                setDocNumber("DOC-CD-78210");
                setVerifiedDoc(SAMPLE_DOCUMENTS["DOC-CD-78210"]);
                setLiveVerifiedApp(null);
                setErrorMsg(null);
              }}
              className="font-mono text-emerald-700 hover:underline cursor-pointer"
            >
              DOC-CD-78210
            </button>
          </div>
        </form>
      </div>

      {/* Verified Document Presentation */}
      {verifiedDoc && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
          {/* Subtle sovereign watermark bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

          {/* Top authenticity badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="text-xs font-medium text-emerald-800">
                  {isFr ? "Document Authentique & Certifié Conforme" : "Authentic & Certified Government Document"}
                </span>
                <p className="text-[11px] text-slate-500 font-normal">
                  {isFr ? "Registre national centralisé de la République" : "Republic centralized state register"}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-slate-700">
              {verifiedDoc.documentNumber}
            </span>
          </div>

          {/* Document Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-5">
            <div className="md:col-span-2 space-y-4 text-xs">
              <div>
                <span className="text-slate-400">{isFr ? "Nature du document :" : "Document Type:"}</span>
                <h4 className="text-sm font-medium text-slate-900 mt-0.5">
                  {isFr ? verifiedDoc.documentTypeFr : verifiedDoc.documentTypeEn}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">
                    {isFr ? "Bénéficiaire légal :" : "Beneficiary Name:"}
                  </span>
                  <span className="text-slate-800 font-medium">{verifiedDoc.beneficiaryName}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">
                    {isFr ? "Numéro NIN / Registre :" : "NIN / Registry No:"}
                  </span>
                  <span className="font-mono text-slate-800 font-medium">{verifiedDoc.nationalIdNumber}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-normal">
                    {isFr ? verifiedDoc.issuingAuthorityFr : verifiedDoc.issuingAuthorityEn}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isFr ? "Date de délivrance : " : "Issue Date: "} {verifiedDoc.issueDate}</span>
                  </span>
                  {verifiedDoc.expiryDate && (
                    <span className="text-slate-600 font-normal">
                      {isFr ? "Validité : " : "Validity: "} {verifiedDoc.expiryDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code & Security Stamp Preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs mb-2">
                {/* Visual QR element */}
                <div className="w-24 h-24 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] p-2 leading-tight">
                  <QrCode className="w-20 h-20 text-white" />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                SIG-CD-SHA256-OK
              </span>
              <span className="text-[10px] text-emerald-700 font-medium mt-1">
                {isFr ? "Signature cryptée vérifiée" : "Cryptographic signature ok"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-normal flex items-center justify-between">
            <span>
              {isFr
                ? "Document officiel délivré en vertu des dispositions légales de la République."
                : "Official legal document issued under the laws of the Republic."}
            </span>
            <span className="text-emerald-700 font-medium">Statut : VALIDE</span>
          </div>
        </div>
      )}

      {/* Live Database Document & ID Proof Presentation with Dual Officer Signatures */}
      {liveVerifiedApp && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-800">
                  {isFr
                    ? "Document Authentique & Certifié Conforme"
                    : "Authentic & Certified Government Document"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {getLocalizedServiceTitle(
                    liveVerifiedApp.serviceId,
                    liveVerifiedApp.serviceTitle,
                    language
                  )}{" "}
                  &bull; {liveVerifiedApp.applicantName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded text-emerald-800">
                {liveVerifiedApp.issuedNumber ||
                  liveVerifiedApp.workflow?.issuedDocumentNumber}
              </span>
            </div>
          </div>

          <SignedDocumentAndIdProofViewer
            application={liveVerifiedApp}
            language={language}
            defaultMode="both"
            showPrintButton={true}
          />
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
