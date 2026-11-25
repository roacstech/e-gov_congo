"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ApplicationStatus,
  Language,
  OfficerApplicationRecord,
  OfficerAuditEntry,
  OfficerProfile,
  OfficerRoleTier,
  SupportingDocumentItem,
} from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignaturePad } from "@/components/officer/SignaturePad";
import { SignedDocumentAndIdProofViewer } from "@/components/officer/SignedDocumentAndIdProofViewer";
import { VerificationOfficerWorkspace } from "@/components/officer/VerificationOfficerWorkspace";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  IdCard,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Stamp,
  X,
  XCircle,
} from "lucide-react";

type QueueFilter =
  | "pending_verification"
  | "pending_approval"
  | "pending_head"
  | "ready"
  | "all";

type WorkspaceTab = "review" | "document" | "history";

interface DashboardStats {
  total: number;
  pendingVerification: number;
  pendingApproval: number;
  pendingHeadIssuance: number;
  ready: number;
  rejected: number;
}

const ROLE_ACCOUNTS: {
  tier: OfficerRoleTier;
  username: string;
  password: string;
  titleFr: string;
  titleEn: string;
  shortDescFr: string;
  shortDescEn: string;
  badgeCls: string;
  defaultQueue: QueueFilter;
}[] = [
  {
    tier: "verification_officer",
    username: "officer.verifier",
    password: "Verify@Rdc2026",
    titleFr: "1. Officier de Vérification",
    titleEn: "1. Verification Officer",
    shortDescFr: "Vérifie document & ID proof puis signe.",
    shortDescEn: "Verifies document & ID proof, then signs.",
    badgeCls: "bg-amber-50 border-amber-200 text-amber-800",
    defaultQueue: "pending_verification",
  },
  {
    tier: "approver_officer",
    username: "officer.approver",
    password: "Approve@Rdc2026",
    titleFr: "2. Officier d'Approbation",
    titleEn: "2. Approver Officer",
    shortDescFr: "Contrôle, signe et approuve (2 signatures).",
    shortDescEn: "Checks, signs & approves (both signatures).",
    badgeCls: "bg-blue-50 border-blue-200 text-blue-800",
    defaultQueue: "pending_approval",
  },
  {
    tier: "head_of_service",
    username: "officer.head",
    password: "Head@Rdc2026",
    titleFr: "3. Chef de Service",
    titleEn: "3. Head of Service",
    shortDescFr: "Valide les 2 signatures et délivre le dossier.",
    shortDescEn: "Reviews dual signatures and issues document.",
    badgeCls: "bg-indigo-50 border-indigo-200 text-indigo-800",
    defaultQueue: "pending_head",
  },
];

function getDefaultQueueForTier(tier: OfficerRoleTier): QueueFilter {
  if (tier === "verification_officer") return "pending_verification";
  if (tier === "approver_officer") return "pending_approval";
  return "pending_head";
}

function OfficerPortalContent() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  const [loadingSession, setLoadingSession] = useState(true);
  const [officer, setOfficer] = useState<OfficerProfile | null>(null);
  const [directory, setDirectory] = useState<OfficerProfile[]>([]);

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard data
  const [applications, setApplications] = useState<OfficerApplicationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<OfficerAuditEntry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pendingVerification: 0,
    pendingApproval: 0,
    pendingHeadIssuance: 0,
    ready: 0,
    rejected: 0,
  });
  const [loadingApps, setLoadingApps] = useState(false);

  // Filters & active workspace selection
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("pending_verification");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("review");

  // Action form
  const [docsChecked, setDocsChecked] = useState(false);
  const [idProofChecked, setIdProofChecked] = useState(false);
  const [officerRemarks, setOfficerRemarks] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [rejectionMode, setRejectionMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<SupportingDocumentItem | null>(null);

  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await fetch("/api/officer/applications", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) setOfficer(null);
        return;
      }
      const data = await res.json();
      setApplications(data.applications || []);
      setAuditLogs(data.auditLogs || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/officer/auth", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        setDirectory(data.directory || []);
        if (data.authenticated && data.officer) {
          setOfficer(data.officer);
          setQueueFilter(getDefaultQueueForTier(data.officer.roleTier));
          await loadApplications();
        } else {
          setOfficer(null);
        }
      } catch (err) {
        console.error("Session error:", err);
      } finally {
        if (active) setLoadingSession(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadApplications]);

  const performLogin = async (u: string, p: string) => {
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/officer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || (isFr ? "Échec de connexion." : "Login failed."));
        return;
      }
      setOfficer(data.officer);
      setQueueFilter(getDefaultQueueForTier(data.officer.roleTier));
      setSelectedTrackingId(null);
      setWorkspaceTab("review");
      setActionError(null);
      setActionSuccess(null);
      await loadApplications();
    } catch {
      setLoginError(isFr ? "Erreur réseau." : "Network error.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(username, password);
  };

  const handleLogout = async () => {
    await fetch("/api/officer/auth", { method: "DELETE" });
    setOfficer(null);
    setApplications([]);
    setSelectedTrackingId(null);
    setSignatureData(null);
    setDocsChecked(false);
    setIdProofChecked(false);
    setActionError(null);
    setActionSuccess(null);
  };

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      if (queueFilter === "pending_verification") {
        if (app.status !== "submitted" && app.status !== "in_review") return false;
      } else if (queueFilter === "pending_approval") {
        if (app.status !== "verified") return false;
      } else if (queueFilter === "pending_head") {
        if (app.status !== "approved") return false;
      } else if (queueFilter === "ready") {
        if (app.status !== "ready") return false;
      }
      if (serviceFilter !== "all" && app.serviceId !== serviceFilter) return false;
      if (q) {
        return (
          app.trackingId.toLowerCase().includes(q) ||
          app.applicantName.toLowerCase().includes(q) ||
          app.serviceTitle.toLowerCase().includes(q) ||
          (app.issuedNumber || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, queueFilter, serviceFilter, searchQuery]);

  const selectedApp = useMemo(() => {
    if (selectedTrackingId) {
      return (
        applications.find((a) => a.trackingId === selectedTrackingId) ||
        filteredApplications[0] ||
        null
      );
    }
    return filteredApplications[0] || applications[0] || null;
  }, [selectedTrackingId, applications, filteredApplications]);

  const selectedAppAudit = useMemo(() => {
    if (!selectedApp) return [];
    return auditLogs.filter((l) => l.trackingId === selectedApp.trackingId);
  }, [auditLogs, selectedApp]);

  const resetActionForm = () => {
    setDocsChecked(false);
    setIdProofChecked(false);
    setOfficerRemarks("");
    setSignatureData(null);
    setRejectionMode(false);
    setRejectionReason("");
    setActionError(null);
  };

  const handleSelectDossier = (trackingId: string) => {
    setSelectedTrackingId(trackingId);
    resetActionForm();
    setActionSuccess(null);
    setWorkspaceTab("review");
  };

  const handleWorkflowSubmit = async (
    action: "verify_and_sign" | "check_and_approve" | "head_issue" | "reject"
  ) => {
    if (!selectedApp) return;
    setActionError(null);
    setActionSuccess(null);

    if (action !== "reject") {
      if (
        (action === "verify_and_sign" || action === "check_and_approve") &&
        (!docsChecked || !idProofChecked)
      ) {
        setActionError(
          isFr
            ? "Cochez les deux contrôles (Documents et ID Proof)."
            : "Please check both Document and ID Proof verification."
        );
        return;
      }
      if (!signatureData) {
        setActionError(
          isFr ? "Signature requise." : "Please add your signature first."
        );
        return;
      }
    } else if (!rejectionReason.trim()) {
      setActionError(
        isFr ? "Motif du rejet requis." : "Please enter a rejection reason."
      );
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch("/api/officer/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingId: selectedApp.trackingId,
          action,
          signatureData,
          docsChecked,
          idProofChecked,
          checklist: { documents: docsChecked, idProof: idProofChecked },
          notesFr: officerRemarks || undefined,
          notesEn: officerRemarks || undefined,
          rejectionReason: rejectionReason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || (isFr ? "Action refusée." : "Action failed."));
        return;
      }

      const updated: OfficerApplicationRecord = data.application;
      setApplications((prev) =>
        prev.map((a) => (a.trackingId === updated.trackingId ? updated : a))
      );
      await loadApplications();
      resetActionForm();

      if (action === "verify_and_sign") {
        setWorkspaceTab("document");
        setActionSuccess(
          isFr
            ? "Vérifié et signé. Transmis à l'Officier d'Approbation."
            : "Verified & signed. Sent to Approver Officer."
        );
      } else if (action === "check_and_approve") {
        setWorkspaceTab("document");
        setActionSuccess(
          isFr
            ? "Approuvé. Les 2 signatures sont apposées sur le Document et l'ID Proof."
            : "Approved. Both signatures are now on the Document and ID Proof."
        );
      } else if (action === "head_issue") {
        setWorkspaceTab("document");
        setActionSuccess(
          isFr
            ? `Document ${updated.issuedNumber || ""} scellé et délivré.`
            : `Document ${updated.issuedNumber || ""} sealed & issued.`
        );
      } else {
        setActionSuccess(isFr ? "Dossier rejeté." : "Application rejected.");
      }
    } catch {
      setActionError(isFr ? "Erreur serveur." : "Server error.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusPill = (status: ApplicationStatus) => {
    switch (status) {
      case "submitted":
      case "in_review":
        return {
          label: isFr ? "À vérifier" : "To Verify",
          cls: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "verified":
        return {
          label: isFr ? "Vérifié" : "Verified",
          cls: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "approved":
        return {
          label: isFr ? "Approuvé" : "Approved",
          cls: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "ready":
        return {
          label: isFr ? "Délivré" : "Ready",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "rejected":
        return {
          label: isFr ? "Rejeté" : "Rejected",
          cls: "bg-rose-50 text-rose-700 border-rose-200",
        };
    }
  };

  const getTierBadgeStyle = (tier: OfficerRoleTier) => {
    if (tier === "verification_officer")
      return "bg-amber-50 text-amber-800 border-amber-200";
    if (tier === "approver_officer")
      return "bg-blue-50 text-blue-800 border-blue-200";
    return "bg-indigo-50 text-indigo-800 border-indigo-200";
  };

  const uniqueServices = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of applications) {
      map.set(a.serviceId, a.serviceTitle);
    }
    return Array.from(map.entries());
  }, [applications]);

  const canActOnSelected = useMemo(() => {
    if (!officer || !selectedApp) return false;
    if (
      officer.roleTier === "verification_officer" &&
      (selectedApp.status === "submitted" || selectedApp.status === "in_review")
    ) {
      return true;
    }
    if (officer.roleTier === "approver_officer" && selectedApp.status === "verified") {
      return true;
    }
    if (officer.roleTier === "head_of_service" && selectedApp.status === "approved") {
      return true;
    }
    return false;
  }, [officer, selectedApp]);

  const queueTabs: { key: QueueFilter; label: string; count: number }[] = [
    {
      key: "pending_verification",
      label: isFr ? "1. Vérification" : "1. Verify",
      count: stats.pendingVerification,
    },
    {
      key: "pending_approval",
      label: isFr ? "2. Approbation" : "2. Approve",
      count: stats.pendingApproval,
    },
    {
      key: "pending_head",
      label: isFr ? "3. Chef Service" : "3. Issue",
      count: stats.pendingHeadIssuance,
    },
    {
      key: "ready",
      label: isFr ? "Délivrés" : "Ready",
      count: stats.ready,
    },
    {
      key: "all",
      label: isFr ? "Tous" : "All",
      count: stats.total,
    },
  ];

  const signatureCount =
    (selectedApp?.workflow.verificationSignature ? 1 : 0) +
    (selectedApp?.workflow.approverSignature ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        activeTab="services"
        onTabChange={(tab) => router.push(`/?tab=${tab}`)}
        onOpenOfficerPortal={() => router.push("/officer")}
      />

      <main className="flex-1 pt-24 sm:pt-[105px] pb-16">
        <div className="h-1 w-full flex no-print">
          <div className="flex-1 bg-[#007fff]" />
          <div className="w-1/6 bg-[#fcd116]" />
          <div className="w-1/6 bg-[#ce1126]" />
        </div>

        {loadingSession ? (
          <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500">
              {isFr ? "Chargement..." : "Loading..."}
            </p>
          </div>
        ) : !officer ? (
          /* ================================================================ */
          /* CLEAN OFFICER LOGIN                                              */
          /* ================================================================ */
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFr ? "Accueil" : "Back"}</span>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Role Cards */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900">
                    {isFr ? "Portail Agent Public" : "Officer Portal"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isFr
                      ? "Choisissez un rôle ou connectez-vous."
                      : "Select an officer role or sign in with credentials."}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {ROLE_ACCOUNTS.map((role) => (
                    <div
                      key={role.tier}
                      className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${role.badgeCls}`}
                        >
                          {isFr ? role.titleFr : role.titleEn}
                        </span>
                        <p className="text-xs text-slate-600">
                          {isFr ? role.shortDescFr : role.shortDescEn}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={loggingIn}
                        onClick={() => {
                          setUsername(role.username);
                          setPassword(role.password);
                          performLogin(role.username, role.password);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isFr ? "Connexion" : "Sign In"}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {directory.filter((d) => d.serviceId !== "all").length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    {isFr ? "Agents de service :" : "Service agents:"}{" "}
                    {directory
                      .filter((d) => d.serviceId !== "all")
                      .map((d) => (
                        <button
                          key={d.officerId}
                          type="button"
                          onClick={() => setUsername(d.username)}
                          className="text-blue-600 hover:underline mr-2 cursor-pointer font-mono"
                        >
                          {d.username}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Manual Form */}
              <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {isFr ? "Connexion Manuelle" : "Officer Sign In"}
                  </h2>
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      {isFr ? "Identifiant" : "Username"}
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="officer.verifier"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      {isFr ? "Mot de passe" : "Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loggingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>{isFr ? "Se connecter" : "Sign In"}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* CLEAN OFFICER WORKSPACE                                          */
          /* ================================================================ */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4">
            {/* Compact Top Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {officer.fullName}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getTierBadgeStyle(
                      officer.roleTier
                    )}`}
                  >
                    {isFr ? officer.roleLabelFr : officer.roleLabelEn}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {officer.officerId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadApplications}
                  disabled={loadingApps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingApps ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">{isFr ? "Actualiser" : "Refresh"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isFr ? "Changer de rôle" : "Switch Role"}</span>
                </button>
              </div>
            </div>

            {officer.roleTier === "verification_officer" ? (
              <VerificationOfficerWorkspace
                language={language}
                officer={officer}
                applications={applications}
                onApplicationUpdated={async (updated) => {
                  setApplications((prev) =>
                    prev.map((a) =>
                      a.trackingId === updated.trackingId ? updated : a
                    )
                  );
                  await loadApplications();
                }}
              />
            ) : (
              <>
            {/* Single-Row Queue Filter Pills + Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 no-print">
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                {queueTabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setQueueFilter(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      queueFilter === t.key
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        queueFilter === t.key
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-1 lg:max-w-md">
                <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isFr ? "Rechercher..." : "Search ID or name..."}
                    className="w-full text-xs bg-transparent focus:outline-none"
                  />
                </div>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 shadow-2xs max-w-[170px]"
                >
                  <option value="all">{isFr ? "Tous services" : "All services"}</option>
                  {uniqueServices.map(([sid, stitle]) => (
                    <option key={sid} value={sid}>
                      {stitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clean 2-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Queue */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden no-print">
                <div className="max-h-[72vh] overflow-y-auto divide-y divide-slate-100">
                  {filteredApplications.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <FileText className="w-7 h-7 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">
                        {isFr ? "Aucun dossier ici." : "No dossiers in this queue."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setQueueFilter("all")}
                        className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                        {isFr ? "Voir tous" : "Show all"}
                      </button>
                    </div>
                  ) : (
                    filteredApplications.map((app) => {
                      const pill = getStatusPill(app.status);
                      const isSelected = selectedApp?.trackingId === app.trackingId;
                      return (
                        <button
                          key={app.trackingId}
                          type="button"
                          onClick={() => handleSelectDossier(app.trackingId)}
                          className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-50/70 border-l-3 border-l-blue-600"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-semibold text-blue-700">
                              {app.trackingId}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${pill.cls}`}
                            >
                              {pill.label}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900 truncate mt-1">
                            {app.applicantName}
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="truncate">{app.serviceTitle}</span>
                            <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                              <span
                                className={
                                  app.workflow.verificationSignature
                                    ? "text-emerald-600 font-bold"
                                    : "text-slate-300"
                                }
                              >
                                ●1
                              </span>
                              <span
                                className={
                                  app.workflow.approverSignature
                                    ? "text-blue-600 font-bold"
                                    : "text-slate-300"
                                }
                              >
                                ●2
                              </span>
                              <span
                                className={
                                  app.status === "ready"
                                    ? "text-indigo-600 font-bold"
                                    : "text-slate-300"
                                }
                              >
                                ●3
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div className="lg:col-span-8 space-y-4">
                {selectedApp ? (
                  <>
                    {/* Compact Header + 3-Step Strip */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 no-print">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-blue-700">
                              {selectedApp.trackingId}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-medium">
                              {selectedApp.serviceTitle}
                            </span>
                            {selectedApp.issuedNumber && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono font-semibold text-emerald-700">
                                  {selectedApp.issuedNumber}
                                </span>
                              </>
                            )}
                          </div>
                          <h2 className="text-base font-bold text-slate-900">
                            {selectedApp.applicantName}
                          </h2>
                          <p className="text-xs text-slate-500">
                            {selectedApp.phone} • {selectedApp.email} •{" "}
                            {selectedApp.collectionPoint}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                            getStatusPill(selectedApp.status).cls
                          }`}
                        >
                          {getStatusPill(selectedApp.status).label}
                        </span>
                      </div>

                      {/* Minimal 3-step progress bar */}
                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div
                          className={`px-3 py-2 rounded-xl border flex items-center justify-between ${
                            selectedApp.workflow.verificationSignature
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="font-semibold truncate">
                            {isFr ? "1. Vérifier & Signer" : "1. Verify & Sign"}
                          </span>
                          {selectedApp.workflow.verificationSignature && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>

                        <div
                          className={`px-3 py-2 rounded-xl border flex items-center justify-between ${
                            selectedApp.workflow.approverSignature
                              ? "bg-blue-50/70 border-blue-200 text-blue-800"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="font-semibold truncate">
                            {isFr ? "2. Approuver & Signer" : "2. Approve & Sign"}
                          </span>
                          {selectedApp.workflow.approverSignature && (
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </div>

                        <div
                          className={`px-3 py-2 rounded-xl border flex items-center justify-between ${
                            selectedApp.status === "ready"
                              ? "bg-indigo-50/70 border-indigo-200 text-indigo-800"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="font-semibold truncate">
                            {isFr ? "3. Chef de Service" : "3. Head Issue"}
                          </span>
                          {selectedApp.status === "ready" && (
                            <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Workspace View Tabs */}
                      <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setWorkspaceTab("review")}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            workspaceTab === "review"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {isFr ? "Contrôle & Signature" : "Review & Sign"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkspaceTab("document")}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            workspaceTab === "document"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span>{isFr ? "Document & ID Proof" : "Document & ID Proof"}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              workspaceTab === "document"
                                ? "bg-white/20 text-white"
                                : signatureCount === 2
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {signatureCount}/2
                          </span>
                        </button>
                        {selectedAppAudit.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setWorkspaceTab("history")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              workspaceTab === "history"
                                ? "bg-slate-900 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {isFr ? "Historique" : "History"} ({selectedAppAudit.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Feedback Messages */}
                    {actionError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 no-print">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{actionError}</span>
                      </div>
                    )}
                    {actionSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2 no-print">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{actionSuccess}</span>
                        </div>
                      </div>
                    )}

                    {/* TAB 1: REVIEW & SIGN */}
                    {workspaceTab === "review" && (
                      <div className="space-y-4 no-print">
                        {/* Civil Data + Attachments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Citizen Details */}
                          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                            <div className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                              {isFr ? "Informations du Dossier" : "Application Details"}
                            </div>
                            <div className="space-y-1.5 text-xs">
                              {Object.entries(selectedApp.details)
                                .filter(([, val]) => Boolean(val))
                                .map(([key, val]) => (
                                  <div
                                    key={key}
                                    className="flex items-start justify-between gap-2 py-1"
                                  >
                                    <span className="text-slate-400">{key}</span>
                                    <span className="font-medium text-slate-900 text-right">
                                      {val}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Documents & ID Proof */}
                          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                            <div className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                              {isFr ? "Documents & ID Proof" : "Documents & ID Proof"}
                            </div>

                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 text-xs">
                              {selectedApp.photoUrl ? (
                                <img
                                  src={selectedApp.photoUrl}
                                  alt="Citizen"
                                  className="w-11 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                  <IdCard className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-mono font-bold text-slate-900 truncate">
                                  {selectedApp.idProofSummary.primaryIdNumber}
                                </div>
                                {selectedApp.idProofSummary.secondaryIdNumber && (
                                  <div className="font-mono text-[11px] text-slate-500 truncate">
                                    {selectedApp.idProofSummary.secondaryIdNumber}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              {selectedApp.supportingDocuments.map((doc, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {doc.isIdProof ? (
                                      <IdCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    )}
                                    <span className="truncate font-medium text-slate-800">
                                      {doc.fileName}
                                    </span>
                                  </div>
                                  {doc.dataUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewDoc(doc)}
                                      className="text-blue-600 hover:underline text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>{isFr ? "Voir" : "View"}</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Card */}
                        {selectedApp.status === "ready" ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-900">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <span className="font-semibold">
                                {isFr
                                  ? "Document et ID Proof signés et délivrés."
                                  : "Document & ID Proof signed and issued."}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setWorkspaceTab("document")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-medium cursor-pointer shrink-0"
                            >
                              {isFr ? "Voir Document" : "View Document"}
                            </button>
                          </div>
                        ) : selectedApp.status === "rejected" ? (
                          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-2.5 text-xs text-rose-900">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>
                              <strong>{isFr ? "Rejeté :" : "Rejected:"}</strong>{" "}
                              {selectedApp.workflow.rejectionReason ||
                                selectedApp.statusNotesFr}
                            </span>
                          </div>
                        ) : canActOnSelected ? (
                          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                {officer.roleTier === "approver_officer" && (
                                  <>
                                    <Stamp className="w-4 h-4 text-blue-600" />
                                    <span>
                                      {isFr
                                        ? "2. Contrôler & Approuver"
                                        : "2. Check, Sign & Approve"}
                                    </span>
                                  </>
                                )}
                                {officer.roleTier === "head_of_service" && (
                                  <>
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    <span>
                                      {isFr
                                        ? "3. Délivrer le Document"
                                        : "3. Seal & Issue Document"}
                                    </span>
                                  </>
                                )}
                              </h3>
                            </div>

                            {officer.roleTier === "approver_officer" &&
                              selectedApp.workflow.verificationOfficerName && (
                                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between gap-3">
                                  <span className="text-emerald-900 font-medium">
                                    {isFr ? "Vérifié par :" : "Verified by:"}{" "}
                                    <strong>
                                      {selectedApp.workflow.verificationOfficerName}
                                    </strong>
                                  </span>
                                  {selectedApp.workflow.verificationSignature && (
                                    <img
                                      src={selectedApp.workflow.verificationSignature}
                                      alt="Tier 1 Signature"
                                      className="h-9 bg-white px-2 py-0.5 rounded border border-emerald-200 object-contain"
                                    />
                                  )}
                                </div>
                              )}

                            {officer.roleTier === "approver_officer" && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-300">
                                  <input
                                    type="checkbox"
                                    checked={docsChecked}
                                    onChange={(e) => setDocsChecked(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className="font-medium text-slate-800">
                                    {isFr ? "Documents vérifiés" : "Documents checked & OK"}
                                  </span>
                                </label>

                                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-300">
                                  <input
                                    type="checkbox"
                                    checked={idProofChecked}
                                    onChange={(e) => setIdProofChecked(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className="font-medium text-slate-800">
                                    {isFr ? "ID Proof vérifié" : "ID Proof checked & OK"}
                                  </span>
                                </label>
                              </div>
                            )}

                            <input
                              type="text"
                              value={officerRemarks}
                              onChange={(e) => setOfficerRemarks(e.target.value)}
                              placeholder={
                                isFr ? "Remarque (optionnel)..." : "Remark (optional)..."
                              }
                              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500"
                            />

                            <SignaturePad
                              language={language}
                              officerName={officer.fullName}
                              officerId={officer.officerId}
                              roleTitle={
                                officer.roleTier === "approver_officer"
                                  ? isFr
                                    ? "Approbateur"
                                    : "Approver"
                                  : isFr
                                  ? "Chef Service"
                                  : "Head"
                              }
                              value={signatureData}
                              onChange={setSignatureData}
                            />

                            {rejectionMode && (
                              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                                <input
                                  type="text"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder={
                                    isFr ? "Motif du rejet..." : "Rejection reason..."
                                  }
                                  className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={submittingAction}
                                    onClick={() => handleWorkflowSubmit("reject")}
                                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                                  >
                                    {isFr ? "Confirmer" : "Confirm Reject"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectionMode(false)}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 cursor-pointer"
                                  >
                                    {isFr ? "Annuler" : "Cancel"}
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2 pt-1">
                              {!rejectionMode && (
                                <button
                                  type="button"
                                  onClick={() => setRejectionMode(true)}
                                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                                >
                                  {isFr ? "Rejeter" : "Reject"}
                                </button>
                              )}

                              {officer.roleTier === "approver_officer" && (
                                <button
                                  type="button"
                                  disabled={submittingAction}
                                  onClick={() =>
                                    handleWorkflowSubmit("check_and_approve")
                                  }
                                  className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                                >
                                  {submittingAction && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  )}
                                  <span>
                                    {isFr ? "Signer & Approuver" : "Sign & Approve"}
                                  </span>
                                </button>
                              )}

                              {officer.roleTier === "head_of_service" && (
                                <button
                                  type="button"
                                  disabled={submittingAction}
                                  onClick={() => handleWorkflowSubmit("head_issue")}
                                  className="ml-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                                >
                                  {submittingAction && (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  )}
                                  <span>
                                    {isFr ? "Sceller & Délivrer" : "Seal & Issue"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center justify-between gap-3">
                            <span>
                              {selectedApp.status === "submitted" ||
                              selectedApp.status === "in_review"
                                ? isFr
                                  ? "En attente de 1. Officier de Vérification."
                                  : "Waiting for 1. Verification Officer."
                                : selectedApp.status === "verified"
                                ? isFr
                                  ? "En attente de 2. Officier d'Approbation."
                                  : "Waiting for 2. Approver Officer."
                                : isFr
                                ? "En attente de 3. Chef de Service."
                                : "Waiting for 3. Head of Service."}
                            </span>
                            <button
                              type="button"
                              onClick={() => setWorkspaceTab("document")}
                              className="text-blue-600 font-semibold hover:underline cursor-pointer shrink-0"
                            >
                              {isFr ? "Voir Document & ID" : "View Document & ID"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: SIGNED DOCUMENT & ID PROOF */}
                    {workspaceTab === "document" && (
                      <SignedDocumentAndIdProofViewer
                        application={selectedApp}
                        language={language}
                        defaultMode="both"
                        showPrintButton={true}
                      />
                    )}

                    {/* TAB 3: AUDIT HISTORY */}
                    {workspaceTab === "history" && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 no-print">
                        <div className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                          {isFr ? "Historique des Signatures" : "Signature Audit Log"}
                        </div>
                        <div className="divide-y divide-slate-100 text-xs">
                          {selectedAppAudit.map((entry) => (
                            <div
                              key={entry.id}
                              className="py-2.5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900">
                                  {entry.officerName}
                                </span>
                                <span className="text-slate-400 ml-2 font-mono text-[11px]">
                                  {entry.action}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 shrink-0">
                                {new Date(entry.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                    {isFr ? "Sélectionnez un dossier." : "Select a dossier."}
                  </div>
                )}
              </div>
            </div>
              </>
            )}
          </div>
        )}
      </main>

      {previewDoc && previewDoc.dataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                {previewDoc.fileName}
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-100 flex items-center justify-center">
              {previewDoc.dataUrl.startsWith("data:application/pdf") ? (
                <iframe
                  src={previewDoc.dataUrl}
                  title={previewDoc.fileName}
                  className="w-full h-[65vh] rounded-lg bg-white"
                />
              ) : (
                <img
                  src={previewDoc.dataUrl}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[65vh] rounded-lg object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer language={language} />
    </div>
  );
}

export default function OfficerPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OfficerPortalContent />
    </Suspense>
  );
}
