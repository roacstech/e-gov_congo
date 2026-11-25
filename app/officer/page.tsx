"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getLocalizedServiceTitle } from "@/data/services";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  IdCard,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
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
}[] = [
  {
    tier: "verification_officer",
    username: "officer.verifier",
    password: "Verify@Rdc2026",
    titleFr: "Officier de Vérification",
    titleEn: "Verification Officer",
    shortDescFr: "Vérifie document & ID proof puis signe.",
    shortDescEn: "Verifies document & ID proof, then signs.",
  },
  {
    tier: "approver_officer",
    username: "officer.approver",
    password: "Approve@Rdc2026",
    titleFr: "Officier d'Approbation",
    titleEn: "Approver Officer",
    shortDescFr: "Contrôle, signe et approuve (2 signatures).",
    shortDescEn: "Checks, signs & approves (both signatures).",
  },
  {
    tier: "head_of_service",
    username: "officer.head",
    password: "Head@Rdc2026",
    titleFr: "Chef de Service",
    titleEn: "Head of Service",
    shortDescFr: "Valide les 2 signatures et délivre le dossier.",
    shortDescEn: "Reviews dual signatures and issues document.",
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

  // Top bar profile menu & verifier active dossier
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [openedVerifierApp, setOpenedVerifierApp] =
    useState<OfficerApplicationRecord | null>(null);

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard data for Tier 2 & Tier 3
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

  // Filters & active workspace selection for Tier 2 & Tier 3
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("pending_approval");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("review");

  // Action form for Tier 2 & Tier 3
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

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleSessionExpired = useCallback(() => {
    setOfficer(null);
    setOpenedVerifierApp(null);
  }, []);

  const loadApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await fetch("/api/officer/applications?limit=100", {
        cache: "no-store",
      });
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
          if (data.officer.roleTier !== "verification_officer" && data.officer.roleTier !== "approver_officer") {
            await loadApplications();
          }
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
      setOpenedVerifierApp(null);
      setWorkspaceTab("review");
      setProfileOpen(false);
      setActionError(null);
      setActionSuccess(null);
      if (data.officer.roleTier !== "verification_officer" && data.officer.roleTier !== "approver_officer") {
        await loadApplications();
      }
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
    setProfileOpen(false);
    setApplications([]);
    setSelectedTrackingId(null);
    setOpenedVerifierApp(null);
    setSignatureData(null);
    setDocsChecked(false);
    setIdProofChecked(false);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleRefresh = async () => {
    if (
      officer?.roleTier === "verification_officer" ||
      officer?.roleTier === "approver_officer"
    ) {
      setRefreshSignal((s) => s + 1);
    } else {
      await loadApplications();
    }
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
    action: "check_and_approve" | "head_issue" | "reject"
  ) => {
    if (!selectedApp) return;
    setActionError(null);
    setActionSuccess(null);

    if (action !== "reject") {
      if (action === "check_and_approve" && (!docsChecked || !idProofChecked)) {
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

      if (action === "check_and_approve") {
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
          cls: "bg-amber-50 text-amber-700 border-amber-300",
        };
      case "verified":
        return {
          label: isFr ? "Vérifié" : "Verified",
          cls: "bg-sky-50 text-sky-700 border-sky-300",
        };
      case "approved":
        return {
          label: isFr ? "Approuvé" : "Approved",
          cls: "bg-blue-50 text-blue-700 border-blue-300",
        };
      case "ready":
        return {
          label: isFr ? "Délivré" : "Ready",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-300",
        };
      case "rejected":
        return {
          label: isFr ? "Rejeté" : "Rejected",
          cls: "bg-rose-50 text-rose-700 border-rose-300",
        };
    }
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-800">
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
            <Loader2 className="w-7 h-7 animate-spin text-gray-500 mx-auto" />
            <p className="text-xs text-gray-500">
              {isFr ? "Chargement..." : "Loading..."}
            </p>
          </div>
        ) : !officer ? (
          /* ================================================================ */
          /* CLEAN FLAT OFFICER LOGIN                                         */
          /* ================================================================ */
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isFr ? "Accueil" : "Back"}</span>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Role Cards */}
              <div className="md:col-span-7 bg-white border border-gray-300 p-6 space-y-4">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {isFr ? "Portail Agent Public" : "Officer Portal"}
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isFr
                      ? "Choisissez un rôle ou connectez-vous."
                      : "Select an officer role or sign in with credentials."}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {ROLE_ACCOUNTS.map((role) => (
                    <div
                      key={role.tier}
                      className="border border-gray-300 p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs font-bold text-gray-900">
                          {isFr ? role.titleFr : role.titleEn}
                        </div>
                        <p className="text-xs text-gray-600">
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
                        className="px-3.5 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isFr ? "Connexion" : "Sign In"}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {directory.filter((d) => d.serviceId !== "all").length > 0 && (
                  <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500">
                    {isFr ? "Agents de service :" : "Service agents:"}{" "}
                    {directory
                      .filter((d) => d.serviceId !== "all")
                      .map((d) => (
                        <button
                          key={d.officerId}
                          type="button"
                          onClick={() => setUsername(d.username)}
                          className="text-gray-700 hover:underline mr-2 cursor-pointer font-mono"
                        >
                          {d.username}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Manual Form */}
              <div className="md:col-span-5 bg-white border border-gray-300 p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {isFr ? "Connexion Manuelle" : "Officer Sign In"}
                  </h2>
                </div>

                {loginError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      {isFr ? "Identifiant" : "Username"}
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="officer.verifier"
                      className="w-full px-3 py-2 text-xs border border-gray-300 bg-white focus:border-gray-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      {isFr ? "Mot de passe" : "Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs border border-gray-300 bg-white focus:border-gray-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="w-full py-2.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
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
          /* CLEAN FLAT OFFICER WORKSPACE                                     */
          /* ================================================================ */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            {(officer.roleTier === "verification_officer" ||
              officer.roleTier === "approver_officer") &&
              openedVerifierApp && (
                <div className="mb-3 no-print">
                  <button
                    type="button"
                    onClick={() => setOpenedVerifierApp(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isFr ? "Retour à la liste" : "Back to List"}</span>
                  </button>
                </div>
              )}

            <div className="bg-white border border-gray-300">
              {/* Clean Top Bar */}
              <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {officer.fullName}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {(isFr ? officer.roleLabelFr : officer.roleLabelEn).replace(/^\d+\.\s*/, "")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loadingApps}
                    title={isFr ? "Actualiser" : "Refresh"}
                    aria-label={isFr ? "Actualiser" : "Refresh"}
                    className="h-9 w-9 inline-flex items-center justify-center border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingApps ? "animate-spin" : ""}`} />
                  </button>

                  {/* Profile Details & Sign Out Dropdown */}
                  <div ref={profileRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      className="h-9 inline-flex items-center gap-1.5 px-3 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-800 cursor-pointer transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{isFr ? "Profil" : "Profile"}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-gray-300 shadow-lg z-40 p-4 space-y-3 text-xs">
                        <div className="pb-2.5 border-b border-gray-200">
                          <div className="font-bold text-gray-900">{officer.fullName}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {(isFr ? officer.roleLabelFr : officer.roleLabelEn).replace(/^\d+\.\s*/, "")}
                          </div>
                        </div>
                        <div className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 items-center">
                          <span className="text-gray-500">
                            {isFr ? "Matricule" : "Officer ID"}
                          </span>
                          <span className="font-mono text-gray-900 text-right">
                            {officer.officerId}
                          </span>

                          <span className="text-gray-500">
                            {isFr ? "Identifiant" : "Username"}
                          </span>
                          <span className="font-mono text-gray-900 text-right">
                            {officer.username}
                          </span>

                          {officer.email && (
                            <>
                              <span className="text-gray-500">
                                {isFr ? "E-mail" : "Email"}
                              </span>
                              <span className="text-gray-800 text-right break-all">
                                {officer.email}
                              </span>
                            </>
                          )}

                          {officer.phone && (
                            <>
                              <span className="text-gray-500">
                                {isFr ? "Téléphone" : "Phone"}
                              </span>
                              <span className="text-gray-800 text-right tabular-nums">
                                {officer.phone}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="pt-2.5 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              handleLogout();
                            }}
                            className="w-full h-9 flex items-center justify-center gap-2 px-3 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 cursor-pointer transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{isFr ? "Déconnexion" : "Sign Out"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {officer.roleTier === "verification_officer" ||
            officer.roleTier === "approver_officer" ? (
              <VerificationOfficerWorkspace
                language={language}
                officer={officer}
                refreshSignal={refreshSignal}
                openedApp={openedVerifierApp}
                onSelectApp={setOpenedVerifierApp}
                onSessionExpired={handleSessionExpired}
              />
            ) : (
              <div className="p-4 space-y-4">
                {/* Tier 2 & Tier 3 Queue Filter Pills + Search */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 no-print">
                  <div className="flex flex-wrap items-center gap-1 bg-white p-1 border border-gray-300">
                    {queueTabs.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setQueueFilter(t.key)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                          queueFilter === t.key
                            ? "bg-gray-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{t.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 font-semibold ${
                            queueFilter === t.key
                              ? "bg-gray-500 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {t.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-1 lg:max-w-md">
                    <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5">
                      <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
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
                      className="px-3 py-1.5 border border-gray-300 bg-white text-xs text-gray-700 max-w-[170px]"
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

                {/* 2-Column Workspace for Tier 2 & Tier 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Queue */}
                  <div className="lg:col-span-4 bg-white border border-gray-300 overflow-hidden no-print">
                    <div className="max-h-[72vh] overflow-y-auto divide-y divide-gray-200">
                      {filteredApplications.length === 0 ? (
                        <div className="p-10 text-center space-y-2">
                          <FileText className="w-7 h-7 text-gray-300 mx-auto" />
                          <p className="text-xs text-gray-500">
                            {isFr ? "Aucun dossier ici." : "No dossiers in this queue."}
                          </p>
                          <button
                            type="button"
                            onClick={() => setQueueFilter("all")}
                            className="text-xs font-medium text-gray-700 underline cursor-pointer"
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
                                  ? "bg-gray-100 border-l-4 border-l-gray-600"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[11px] font-semibold text-blue-700">
                                  {app.trackingId}
                                </span>
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 border ${pill.cls}`}
                                >
                                  {pill.label}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-gray-900 truncate mt-1">
                                {app.applicantName}
                              </div>
                              <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-gray-500">
                                <span className="truncate">
                                  {getLocalizedServiceTitle(app.serviceId, app.serviceTitle, language)}
                                </span>
                                <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                                  <span
                                    className={
                                      app.workflow.verificationSignature
                                        ? "text-emerald-600 font-bold"
                                        : "text-gray-300"
                                    }
                                  >
                                    ●1
                                  </span>
                                  <span
                                    className={
                                      app.workflow.approverSignature
                                        ? "text-blue-600 font-bold"
                                        : "text-gray-300"
                                    }
                                  >
                                    ●2
                                  </span>
                                  <span
                                    className={
                                      app.status === "ready"
                                        ? "text-indigo-600 font-bold"
                                        : "text-gray-300"
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
                        <div className="bg-white border border-gray-300 p-5 space-y-4 no-print">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-mono font-bold text-blue-700">
                                  {selectedApp.trackingId}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-600 font-medium">
                                  {getLocalizedServiceTitle(selectedApp.serviceId, selectedApp.serviceTitle, language)}
                                </span>
                                {selectedApp.issuedNumber && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="font-mono font-semibold text-emerald-700">
                                      {selectedApp.issuedNumber}
                                    </span>
                                  </>
                                )}
                              </div>
                              <h2 className="text-base font-bold text-gray-900">
                                {selectedApp.applicantName}
                              </h2>
                              <p className="text-xs text-gray-500">
                                {selectedApp.phone} • {selectedApp.email} •{" "}
                                {selectedApp.collectionPoint}
                              </p>
                            </div>

                            <span
                              className={`text-xs font-semibold px-3 py-1 border ${
                                getStatusPill(selectedApp.status).cls
                              }`}
                            >
                              {getStatusPill(selectedApp.status).label}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div
                              className={`px-3 py-2 border flex items-center justify-between ${
                                selectedApp.workflow.verificationSignature
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                  : "bg-gray-50 border-gray-200 text-gray-600"
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
                              className={`px-3 py-2 border flex items-center justify-between ${
                                selectedApp.workflow.approverSignature
                                  ? "bg-blue-50 border-blue-300 text-blue-800"
                                  : "bg-gray-50 border-gray-200 text-gray-600"
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
                              className={`px-3 py-2 border flex items-center justify-between ${
                                selectedApp.status === "ready"
                                  ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                                  : "bg-gray-50 border-gray-200 text-gray-600"
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

                          <div className="flex items-center gap-1 pt-2 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => setWorkspaceTab("review")}
                              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                workspaceTab === "review"
                                  ? "bg-gray-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {isFr ? "Contrôle & Signature" : "Review & Sign"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setWorkspaceTab("document")}
                              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                workspaceTab === "document"
                                  ? "bg-gray-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <span>{isFr ? "Document & ID Proof" : "Document & ID Proof"}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 ${
                                  workspaceTab === "document"
                                    ? "bg-gray-500 text-white"
                                    : signatureCount === 2
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {signatureCount}/2
                              </span>
                            </button>
                            {selectedAppAudit.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setWorkspaceTab("history")}
                                className={`px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                  workspaceTab === "history"
                                    ? "bg-gray-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {isFr ? "Historique" : "History"} ({selectedAppAudit.length})
                              </button>
                            )}
                          </div>
                        </div>

                        {actionError && (
                          <div className="p-3 bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-center gap-2 no-print">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{actionError}</span>
                          </div>
                        )}
                        {actionSuccess && (
                          <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2 no-print">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{actionSuccess}</span>
                          </div>
                        )}

                        {workspaceTab === "review" && (
                          <div className="space-y-4 no-print">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white border border-gray-300 p-4 space-y-2">
                                <div className="text-xs font-bold text-gray-800 pb-2 border-b border-gray-200">
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
                                        <span className="text-gray-500">{key}</span>
                                        <span className="font-medium text-gray-900 text-right">
                                          {val}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              <div className="bg-white border border-gray-300 p-4 space-y-3">
                                <div className="text-xs font-bold text-gray-800 pb-2 border-b border-gray-200">
                                  {isFr ? "Documents & ID Proof" : "Documents & ID Proof"}
                                </div>

                                <div className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 text-xs">
                                  {selectedApp.photoUrl ? (
                                    <img
                                      src={selectedApp.photoUrl}
                                      alt="Citizen"
                                      className="w-11 h-14 object-cover border border-gray-300 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-11 h-14 bg-white border border-gray-300 flex items-center justify-center shrink-0">
                                      <IdCard className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-mono font-bold text-gray-900 truncate">
                                      {selectedApp.idProofSummary.primaryIdNumber}
                                    </div>
                                    {selectedApp.idProofSummary.secondaryIdNumber && (
                                      <div className="font-mono text-[11px] text-gray-500 truncate">
                                        {selectedApp.idProofSummary.secondaryIdNumber}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  {selectedApp.supportingDocuments.map((doc, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        {doc.isIdProof ? (
                                          <IdCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        ) : (
                                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        )}
                                        <span className="truncate font-medium text-gray-800">
                                          {doc.fileName}
                                        </span>
                                      </div>
                                      {doc.dataUrl && (
                                        <button
                                          type="button"
                                          onClick={() => setPreviewDoc(doc)}
                                          className="text-gray-700 hover:underline text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer shrink-0 ml-2"
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

                            {selectedApp.status === "ready" ? (
                              <div className="bg-emerald-50 border border-emerald-300 p-4 flex items-center justify-between gap-3 text-xs text-emerald-900">
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
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-medium cursor-pointer shrink-0"
                                >
                                  {isFr ? "Voir Document" : "View Document"}
                                </button>
                              </div>
                            ) : selectedApp.status === "rejected" ? (
                              <div className="bg-rose-50 border border-rose-300 p-4 flex items-center gap-2.5 text-xs text-rose-900">
                                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span>
                                  <strong>{isFr ? "Rejeté :" : "Rejected:"}</strong>{" "}
                                  {selectedApp.workflow.rejectionReason ||
                                    selectedApp.statusNotesFr}
                                </span>
                              </div>
                            ) : canActOnSelected ? (
                              <div className="bg-white border border-gray-300 p-5 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                  <Award className="w-4 h-4 text-gray-700" />
                                  <span>
                                    {isFr
                                      ? "Délivrer le Document"
                                      : "Seal & Issue Document"}
                                  </span>
                                </h3>

                                <input
                                  type="text"
                                  value={officerRemarks}
                                  onChange={(e) => setOfficerRemarks(e.target.value)}
                                  placeholder={
                                    isFr ? "Remarque (optionnel)..." : "Remark (optional)..."
                                  }
                                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 focus:border-gray-500"
                                />

                                <SignaturePad
                                  language={language}
                                  officerName={officer.fullName}
                                  officerId={officer.officerId}
                                  roleTitle={isFr ? "Chef Service" : "Head"}
                                  value={signatureData}
                                  onChange={setSignatureData}
                                />

                                {rejectionMode && (
                                  <div className="p-3 bg-rose-50 border border-rose-300 space-y-2">
                                    <input
                                      type="text"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder={
                                        isFr ? "Motif du rejet..." : "Rejection reason..."
                                      }
                                      className="w-full px-3 py-2 text-xs bg-white border border-rose-300"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={submittingAction}
                                        onClick={() => handleWorkflowSubmit("reject")}
                                        className="px-3.5 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold cursor-pointer"
                                      >
                                        {isFr ? "Confirmer" : "Confirm Reject"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRejectionMode(false)}
                                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs text-gray-800 cursor-pointer"
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
                                      className="px-3.5 py-2 border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium cursor-pointer"
                                    >
                                      {isFr ? "Rejeter" : "Reject"}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    disabled={submittingAction}
                                    onClick={() => handleWorkflowSubmit("head_issue")}
                                    className="ml-auto px-5 py-2.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-60 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                                  >
                                    {submittingAction && (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    )}
                                    <span>
                                      {isFr ? "Sceller & Délivrer" : "Seal & Issue"}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 border border-gray-300 p-4 text-xs text-gray-700 flex items-center justify-between gap-3">
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
                                  className="text-gray-800 font-semibold underline cursor-pointer shrink-0"
                                >
                                  {isFr ? "Voir Document & ID" : "View Document & ID"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {workspaceTab === "document" && (
                          <SignedDocumentAndIdProofViewer
                            application={selectedApp}
                            language={language}
                            defaultMode="both"
                            showPrintButton={true}
                          />
                        )}

                        {workspaceTab === "history" && (
                          <div className="bg-white border border-gray-300 p-5 space-y-2 no-print">
                            <div className="text-xs font-bold text-gray-800 pb-2 border-b border-gray-200">
                              {isFr ? "Historique des Signatures" : "Signature Audit Log"}
                            </div>
                            <div className="divide-y divide-gray-200 text-xs">
                              {selectedAppAudit.map((entry) => (
                                <div
                                  key={entry.id}
                                  className="py-2.5 flex items-center justify-between gap-3"
                                >
                                  <div className="min-w-0">
                                    <span className="font-semibold text-gray-900">
                                      {entry.officerName}
                                    </span>
                                    <span className="text-gray-400 ml-2 font-mono text-[11px]">
                                      {entry.action}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-gray-400 shrink-0">
                                    {new Date(entry.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-white border border-gray-300 p-12 text-center text-xs text-gray-500">
                        {isFr ? "Sélectionnez un dossier." : "Select a dossier."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </main>

      {previewDoc && previewDoc.dataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white border border-gray-300 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">
                {previewDoc.fileName}
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
              {previewDoc.dataUrl.startsWith("data:application/pdf") ? (
                <iframe
                  src={previewDoc.dataUrl}
                  title={previewDoc.fileName}
                  className="w-full h-[65vh] bg-white border border-gray-300"
                />
              ) : (
                <img
                  src={previewDoc.dataUrl}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[65vh] object-contain"
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
          <div className="w-8 h-8 border-3 border-gray-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <OfficerPortalContent />
    </Suspense>
  );
}
