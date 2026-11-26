"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CitizenApplication,
  Language,
  OfficerApplicationRecord,
} from "../../types";
import { getLocalizedServiceTitle } from "../../data/services";
import { SignedDocumentAndIdProofViewer } from "../officer/SignedDocumentAndIdProofViewer";
import { downloadOfficialCardOrDocumentPng } from "@/lib/id-card-export";
import {
  ShieldCheck,
  CheckCircle2,
  Search,
  AlertCircle,
  Loader2,
  ArrowRight,
  Download,
  Award,
  RotateCcw,
  Lock,
} from "lucide-react";

interface VerificationSectionProps {
  language: Language;
  onSwitchToTrack?: (trackingId?: string) => void;
}

type VerifiableApp = OfficerApplicationRecord | CitizenApplication;

export const VerificationSection: React.FC<VerificationSectionProps> = ({
  language,
  onSwitchToTrack,
}) => {
  const isFr = language === "fr";
  const [docNumber, setDocNumber] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [captchaSvgUrl, setCaptchaSvgUrl] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(true);

  const [verifiedApps, setVerifiedApps] = useState<VerifiableApp[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackingRedirectCode, setTrackingRedirectCode] = useState<string | null>(null);

  const applyCaptchaData = (data: { challengeToken?: string; svgDataUrl?: string }) => {
    setChallengeToken(data.challengeToken || "");
    setCaptchaSvgUrl(data.svgDataUrl || "");
    setCaptchaInput("");
  };

  const loadCaptcha = useCallback(async () => {
    setLoadingCaptcha(true);
    try {
      const res = await fetch("/api/verify/captcha", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      applyCaptchaData(data);
    } catch (err) {
      console.error("Failed to load CAPTCHA:", err);
    } finally {
      setLoadingCaptcha(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/verify/captcha", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) applyCaptchaData(data);
      })
      .catch((err) => console.error("Failed to load CAPTCHA:", err))
      .finally(() => {
        if (active) setLoadingCaptcha(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const getIssuedNum = (app: VerifiableApp) =>
    app.issuedNumber || app.workflow?.issuedDocumentNumber || app.trackingId;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = docNumber.trim().replace(/\s+/g, "").toUpperCase();
    const cleanCaptcha = captchaInput.trim().toUpperCase();
    if (!clean) {
      setErrorMsg(
        isFr
          ? "Veuillez saisir votre numéro de document officiel."
          : "Please enter your official document number."
      );
      return;
    }
    if (!cleanCaptcha || !challengeToken) {
      setErrorMsg(
        isFr
          ? "Veuillez saisir le code de sécurité CAPTCHA."
          : "Please enter the security CAPTCHA code."
      );
      return;
    }

    setErrorMsg(null);
    setTrackingRedirectCode(null);
    setVerifiedApps([]);
    setIsVerifying(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNumber: clean,
          captchaInput: cleanCaptcha,
          challengeToken,
        }),
      });
      const data = await res.json();

      // Rotate CAPTCHA after each check for security
      await loadCaptcha();

      if (!res.ok) {
        if (data.errorCode === "EXPIRED_CAPTCHA") {
          setErrorMsg(
            isFr
              ? "Le code CAPTCHA a expiré. Un nouveau code a été généré, veuillez réessayer."
              : "The CAPTCHA code has expired. A new code was generated, please try again."
          );
        } else if (data.errorCode === "INVALID_CAPTCHA") {
          setErrorMsg(
            isFr
              ? "Code de sécurité CAPTCHA incorrect. Veuillez saisir le nouveau code."
              : "Incorrect security CAPTCHA code. Please enter the new code."
          );
        } else {
          setErrorMsg(
            data.error ||
              (isFr ? "Erreur lors de la vérification." : "Verification failed.")
          );
        }
        return;
      }

      if (data.isTrackingCode) {
        setTrackingRedirectCode(clean);
        setErrorMsg(
          isFr
            ? "Ceci est un numéro de suivi de demande, pas un numéro de document officiel. Utilisez « Suivi Demande » pour suivre l'avancement, ou saisissez le numéro délivré après approbation finale des officiers."
            : "This is an application tracking code, not an issued official document number. Use 'Track Application' to follow progress, or enter the official document number issued after final officer approval."
        );
        return;
      }

      const apps: VerifiableApp[] = Array.isArray(data.applications)
        ? data.applications
        : [];
      if (apps.length > 0) {
        setVerifiedApps(apps);
        return;
      }

      setErrorMsg(
        isFr
          ? "Aucun document officiel approuvé trouvé pour ce numéro dans le registre national."
          : "No approved official document found for this number in the central state registry."
      );
    } catch (err) {
      console.error("Document verification lookup error:", err);
      await loadCaptcha();
      setErrorMsg(
        isFr
          ? "Erreur réseau lors de la vérification. Veuillez réessayer."
          : "Network error during verification. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadAll = async () => {
    if (verifiedApps.length === 0) return;
    setDownloadingAll(true);
    try {
      for (const app of verifiedApps) {
        await downloadOfficialCardOrDocumentPng(app, language);
        await new Promise((r) => setTimeout(r, 220));
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Verification & Security CAPTCHA Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 max-w-2xl mx-auto">
        <form onSubmit={handleVerify} className="space-y-5">
          {/* Document Number Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              {isFr ? "Numéro de Document Officiel" : "Official Document Number"}
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                required
                placeholder={
                  isFr
                    ? "Ex: NIN-CD-2026-..., OP-CD-..., NAT-CD-..., ACTE-NAISS-..."
                    : "Ex: NIN-CD-2026-..., OP-CD-..., NAT-CD-..., ACTE-NAISS-..."
                }
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {isFr
                ? "Uniquement pour les documents officiels délivrés après validation complète des officiers."
                : "Only for official documents issued after all officer approval stages are complete."}
            </p>
          </div>

          {/* Security CAPTCHA Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isFr ? "Contrôle de sécurité (CAPTCHA)" : "Security Verification (CAPTCHA)"}
                </span>
              </span>
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={loadingCaptcha}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3 h-3 ${loadingCaptcha ? "animate-spin" : ""}`} />
                <span>{isFr ? "Actualiser le code" : "New code"}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="h-[60px] w-[200px] rounded-lg border border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                {captchaSvgUrl ? (
                  <img
                    src={captchaSvgUrl}
                    alt={isFr ? "Code de sécurité CAPTCHA" : "Security CAPTCHA code"}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  required
                  maxLength={8}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={
                    isFr ? "Recopiez les 6 caractères" : "Enter the 6 characters shown"
                  }
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono font-semibold tracking-[0.2em] uppercase text-slate-900 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal placeholder:text-xs focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
                <p className="text-[11px] text-slate-500">
                  {isFr
                    ? "Protection anti-robot pour sécuriser l'accès aux actes officiels."
                    : "Anti-bot check protecting access to official state documents."}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying || loadingCaptcha}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>
              {isVerifying
                ? isFr
                  ? "Vérification sécurisée..."
                  : "Verifying securely..."
                : isFr
                ? "Vérifier et afficher le document"
                : "Verify & Access Official Document"}
            </span>
          </button>
        </form>
      </div>

      {/* Error / Tracking Notice */}
      {errorMsg && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>{errorMsg}</span>
          </div>
          {trackingRedirectCode && onSwitchToTrack && (
            <button
              type="button"
              onClick={() => onSwitchToTrack(trackingRedirectCode)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shrink-0 cursor-pointer transition-colors"
            >
              <span>{isFr ? "Aller au Suivi Demande" : "Go to Track Application"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Results Banner & Batch Download when multiple documents match */}
      {verifiedApps.length > 1 && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>{verifiedApps.length}</strong>{" "}
              {isFr
                ? "documents officiels approuvés trouvés et prêts au téléchargement."
                : "approved official service documents / ID cards ready to view & download."}
            </span>
          </div>
          <button
            type="button"
            disabled={downloadingAll}
            onClick={handleDownloadAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {downloadingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>
              {downloadingAll
                ? isFr
                  ? "Téléchargement..."
                  : "Downloading..."
                : isFr
                ? "Télécharger tout (PNG)"
                : "Download All (PNG)"}
            </span>
          </button>
        </div>
      )}

      {/* Verified Live Database Documents & ID Cards */}
      {verifiedApps.length > 0 && (
        <div className="space-y-8">
          {verifiedApps.map((app) => {
            const num = getIssuedNum(app);
            const isFinalSealed =
              app.status === "ready" || Boolean(app.workflow?.headSignature);
            return (
              <div
                key={`${app.serviceId}-${app.trackingId}-${num}`}
                className="bg-white rounded-2xl border border-emerald-200/90 p-4 sm:p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 no-print">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-800">
                          {isFr
                            ? "Document Authentique & Certifié Conforme"
                            : "Authentic & Certified Government Document"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isFinalSealed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          {isFinalSealed
                            ? isFr
                              ? "Délivré & Scellé (Final)"
                              : "Final Issued & Sealed"
                            : isFr
                            ? "Approuvé (Double Signature)"
                            : "Officer Approved (Dual Signed)"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {getLocalizedServiceTitle(
                          app.serviceId,
                          app.serviceTitle,
                          language
                        )}{" "}
                        &bull;{" "}
                        <span className="font-medium text-slate-700">
                          {app.applicantName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded text-emerald-800">
                      {num}
                    </span>
                  </div>
                </div>

                <SignedDocumentAndIdProofViewer
                  key={`${app.trackingId}-${num}`}
                  application={app}
                  language={language}
                  defaultMode="both"
                  showPrintButton={true}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
