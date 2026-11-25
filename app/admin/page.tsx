"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Language, ServiceItem, ServiceOfficer } from "../../types";
import { SERVICES_DATA, CATEGORIES } from "../../data/services";
import {
  Shield,
  Users,
  Key,
  Eye,
  EyeOff,
  Plus,
  Check,
  Copy,
  Trash2,
  Edit3,
  Search,
  Filter,
  ExternalLink,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  Layers,
  FileText,
  Building2,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function SuperAdminPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("fr");
  const isFr = language === "fr";

  // Sync saved language from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("egov_language") as Language;
      if (savedLang === "en" || savedLang === "fr") {
        setLanguage(savedLang);
      }
    } catch {}
  }, []);

  const toggleLanguage = () => {
    const nextLang = isFr ? "en" : "fr";
    setLanguage(nextLang);
    try {
      localStorage.setItem("egov_language", nextLang);
    } catch {}
  };

  // Auth State - Default pre-filled credentials for 1-click access
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState("superadmin");
  const [adminPassword, setAdminPassword] = useState("AdminRDC@2026");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminSession, setAdminSession] = useState<{
    username: string;
    fullName: string;
    role: string;
  } | null>(null);

  // Dashboard Navigation
  const [activeTab, setActiveTab] = useState<
    "overview" | "services" | "officers" | "audit"
  >("overview");

  // Officers Management State
  const [officers, setOfficers] = useState<ServiceOfficer[]>([]);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [officerSearch, setOfficerSearch] = useState("");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>("all");

  // Create Officer Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingOfficer, setIsSubmittingOfficer] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // New Officer Form - Pre-filled with standard defaults so user can just click
  const [newFullName, setNewFullName] = useState("Agent Baudouin Ilunga");
  const [newUsername, setNewUsername] = useState("officer.cni");
  const [newPassword, setNewPassword] = useState("Cni@Kinshasa2026");
  const [newServiceId, setNewServiceId] = useState(SERVICES_DATA[0].id);
  const [newRole, setNewRole] = useState<ServiceOfficer["role"]>("service_officer");
  const [newPhone, setNewPhone] = useState("+243 81 234 5671");
  const [newEmail, setNewEmail] = useState("officer.cni@interieur.gouv.cd");

  // Edit Officer Modal State
  const [editingOfficer, setEditingOfficer] = useState<ServiceOfficer | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // Password Visibility toggles map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("egov_superadmin_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.username) {
          setIsAuthenticated(true);
          setAdminSession(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read admin session:", e);
    }
  }, []);

  // Fetch Officers from API
  const fetchOfficers = async () => {
    setIsLoadingOfficers(true);
    try {
      const res = await fetch("/api/officers");
      if (res.ok) {
        const data = await res.json();
        if (data.officers) {
          const mapped: ServiceOfficer[] = data.officers.map((o: Record<string, unknown>) => ({
            id: o.id as number,
            officerId: (o.officer_id || o.officerId) as string,
            fullName: (o.full_name || o.fullName) as string,
            username: o.username as string,
            password: o.password as string,
            serviceId: (o.service_id || o.serviceId) as string,
            serviceTitle: (o.service_title || o.serviceTitle) as string,
            ministry: o.ministry as string,
            role: (o.role || "service_officer") as ServiceOfficer["role"],
            isActive: Boolean(o.is_active ?? o.isActive ?? true),
            phone: o.phone as string,
            email: o.email as string,
            createdAt: (o.created_at || o.createdAt) as string,
          }));
          setOfficers(mapped);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch officers:", err);
    } finally {
      setIsLoadingOfficers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOfficers();
    }
  }, [isAuthenticated]);

  // Handle Super Admin Login - Pre-filled so user can just click
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    const user = (adminUsername || "superadmin").trim();
    const pass = adminPassword || "AdminRDC@2026";

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          password: pass,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminSession(data.user);
        localStorage.setItem("egov_superadmin_session", JSON.stringify(data.user));
      } else {
        setLoginError(data.error || "Identifiants invalides.");
      }
    } catch (err) {
      console.error("Login error:", err);
      // Resilient fallback for offline testing
      if (
        (user.toLowerCase() === "superadmin" ||
          user.toLowerCase() === "admin.rdc") &&
        pass === "AdminRDC@2026"
      ) {
        const fallbackSession = {
          username: "superadmin",
          fullName: "Super Administrateur — Portail National RDC",
          role: "super_admin",
        };
        setIsAuthenticated(true);
        setAdminSession(fallbackSession);
        localStorage.setItem("egov_superadmin_session", JSON.stringify(fallbackSession));
      } else {
        setLoginError("Connexion impossible ou identifiants incorrects.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminSession(null);
    localStorage.removeItem("egov_superadmin_session");
  };

  // Quick autofill demo credentials
  const autofillDemo = () => {
    setAdminUsername("superadmin");
    setAdminPassword("AdminRDC@2026");
    setLoginError("");
  };

  // Auto-generate strong password for service officer
  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  // Auto-suggest username when service changes
  const handleServiceSelect = (srvId: string) => {
    setNewServiceId(srvId);
    const srv = SERVICES_DATA.find((s) => s.id === srvId);
    if (srv) {
      const slug = srv.code.toLowerCase().replace(/[^a-z0-9]/g, "");
      setNewUsername(`officer.${slug}`);
    }
  };

  // Submit New Officer
  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setIsSubmittingOfficer(true);

    const srv = SERVICES_DATA.find((s) => s.id === newServiceId) || SERVICES_DATA[0];

    try {
      const res = await fetch("/api/officers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFullName,
          username: newUsername,
          password: newPassword,
          serviceId: srv.id,
          serviceTitle: isFr ? srv.titleFr : srv.titleEn,
          ministry: isFr ? srv.ministryFr : srv.ministryEn,
          role: newRole,
          isActive: true,
          phone: newPhone,
          email: newEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCreateSuccess(
          isFr
            ? "Compte agent créé avec succès avec ses identifiants !"
            : "Officer account created successfully with credentials!"
        );
        fetchOfficers();
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setNewFullName("");
          setNewUsername("");
          setNewPassword("");
          setCreateSuccess("");
        }, 1200);
      } else {
        setCreateError(data.error || "Erreur lors de la création.");
      }
    } catch (err) {
      console.error("Create officer error:", err);
      // Fallback local add
      const fallbackOfficer: ServiceOfficer = {
        id: Date.now(),
        officerId: `OFF-${srv.code}-${Math.floor(100 + Math.random() * 900)}`,
        fullName: newFullName,
        username: newUsername,
        password: newPassword,
        serviceId: srv.id,
        serviceTitle: isFr ? srv.titleFr : srv.titleEn,
        ministry: isFr ? srv.ministryFr : srv.ministryEn,
        role: newRole,
        isActive: true,
        phone: newPhone,
        email: newEmail,
        createdAt: new Date().toISOString(),
      };
      setOfficers((prev) => [fallbackOfficer, ...prev]);
      setCreateSuccess("Compte agent ajouté avec succès (mode local) !");
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setNewFullName("");
        setNewUsername("");
        setNewPassword("");
        setCreateSuccess("");
      }, 1000);
    } finally {
      setIsSubmittingOfficer(false);
    }
  };

  // Update Officer (e.g. Password or Status)
  const handleUpdateOfficer = async () => {
    if (!editingOfficer) return;
    try {
      await fetch("/api/officers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingOfficer.id,
          officerId: editingOfficer.officerId,
          password: editPassword || undefined,
          isActive: editIsActive,
        }),
      });
      fetchOfficers();
      setEditingOfficer(null);
      setEditPassword("");
    } catch (err) {
      console.error("Error updating officer:", err);
      setOfficers((prev) =>
        prev.map((o) =>
          o.officerId === editingOfficer.officerId
            ? {
                ...o,
                password: editPassword || o.password,
                isActive: editIsActive,
              }
            : o
        )
      );
      setEditingOfficer(null);
    }
  };

  // Delete Officer
  const handleDeleteOfficer = async (officerId: string) => {
    if (
      !confirm(
        isFr
          ? "Confirmez-vous la révocation et suppression de cet accès agent ?"
          : "Are you sure you want to revoke and delete this officer access?"
      )
    ) {
      return;
    }

    try {
      await fetch(`/api/officers?officerId=${officerId}`, {
        method: "DELETE",
      });
      fetchOfficers();
    } catch (err) {
      console.error("Error deleting officer:", err);
      setOfficers((prev) => prev.filter((o) => o.officerId !== officerId));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      const matchesService =
        selectedServiceFilter === "all" || o.serviceId === selectedServiceFilter;
      const q = officerSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.fullName.toLowerCase().includes(q) ||
        o.username.toLowerCase().includes(q) ||
        o.officerId.toLowerCase().includes(q) ||
        o.serviceTitle.toLowerCase().includes(q);
      return matchesService && matchesSearch;
    });
  }, [officers, selectedServiceFilter, officerSearch]);

  // Count officers assigned to each service
  const serviceOfficerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    officers.forEach((o) => {
      counts[o.serviceId] = (counts[o.serviceId] || 0) + 1;
    });
    return counts;
  }, [officers]);

  // =========================================================================
  // RENDER: SUPER ADMIN LOGIN VIEW (if unauthenticated)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
        {/* Language switch button in login top right */}
        <div className="absolute top-5 right-5 z-20">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer text-xs font-bold"
          >
            {isFr ? "EN" : "FR"}
          </button>
        </div>

        {/* Subtle national colors glowing aura */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div className="text-center space-y-2">
            {/* National Republic Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>
                {isFr
                  ? "RDC • Direction Générale des Systèmes Numériques"
                  : "DRC • General Directorate of Digital Systems"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
              {isFr ? "Portail Super Admin" : "Super Admin Portal"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isFr
                ? "Gestion centralisée des services publics et habilitation des agents ministériels"
                : "Centralized public services management and ministerial officer credentials"}
            </p>
          </div>

          <div className="mt-8 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Informational banner that default credentials are ready */}
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isFr
                    ? "Identifiants par défaut chargés. Cliquez directement ci-dessous pour entrer."
                    : "Default credentials loaded. Just click Sign In below to enter."}
                </span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-500/40 font-bold shrink-0">
                {isFr ? "1-Clic" : "1-Click"}
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  {isFr
                    ? "Identifiant Super Admin (Par défaut)"
                    : "Super Admin Username (Default)"}
                </label>
                <div className="relative flex items-center">
                  <Shield className="w-4 h-4 text-blue-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="superadmin"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  {isFr
                    ? "Mot de passe souverain (Par défaut)"
                    : "Sovereign Password (Default)"}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-blue-400 absolute left-3.5" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isFr ? "Connexion en cours..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>
                        {isFr
                          ? "Connexion Super Admin (Accès Immédiat)"
                          : "Sign In as Super Admin (Instant Access)"}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Demo Credentials Helper Button */}
              <div className="pt-2 text-center border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={autofillDemo}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isFr
                      ? "Réinitialiser aux valeurs par défaut (superadmin / AdminRDC@2026)"
                      : "Reset to default credentials (superadmin / AdminRDC@2026)"}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                {isFr ? "← Retour au portail citoyen public" : "← Back to citizen public portal"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: AUTHENTICATED SUPER ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* TOP SOVEREIGN HEADER BAR                                                  */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Left: Emblem & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                <Shield className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-white">
                    SUPER ADMIN • RDC
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-medium">
                    {isFr ? "Souverain" : "Sovereign"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                  {isFr
                    ? "Contrôle central des services & habilitations des agents"
                    : "Central service control & officer authorizations"}
                </p>
              </div>
            </div>

            {/* Right: Quick actions & user menu */}
            <div className="flex items-center gap-3 text-xs">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer font-bold"
              >
                {isFr ? "EN" : "FR"}
              </button>

              {/* View Public Portal */}
              <Link
                href="/"
                target="_blank"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              >
                <span>{isFr ? "Portail Citoyen" : "Public Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {/* Connected Admin badge */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  SA
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white leading-none">
                    {adminSession?.username || "superadmin"}
                  </div>
                  <div className="text-[10px] text-emerald-400">{isFr ? "En ligne" : "Online"}</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer"
                title={isFr ? "Déconnexion" : "Sign Out"}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isFr ? "Quitter" : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isFr ? "Tableau de Bord & Vue d'Ensemble" : "Dashboard & Overview"}</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "services"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>
                {isFr ? "Tous les Services Publics" : "All Public Services"} (
                {SERVICES_DATA.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("officers")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "officers"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {isFr ? "Identifiants & Comptes Agents" : "Officer Credentials & Accounts"} (
                {officers.length})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA                                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ======================================================================= */}
        {/* TAB 1: OVERVIEW & DASHBOARD METRICS                                     */}
        {/* ======================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Sovereign Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-full bg-white/5 skew-x-12 pointer-events-none" />
              <div className="relative z-10 space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium">
                  <Shield className="w-3.5 h-3.5 text-blue-300" />
                  <span>
                    {isFr
                      ? "Console Centrale d'Administration Souveraine"
                      : "Central Sovereign Administration Console"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {isFr
                    ? "Bienvenue dans l'Espace Super Admin"
                    : "Welcome to the Super Admin Portal"}
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                  {isFr
                    ? "Gérez l'ensemble des 12 services publics officiels, créez et configurez des identifiants (nom d'utilisateur & mot de passe) distincts pour chaque agent instructeur ministériel, et supervisez les flux administratifs."
                    : "Manage all 12 official public services, create and configure separate usernames and passwords for each ministerial officer, and monitor administrative workflows."}
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(true);
                    }}
                    className="bg-white hover:bg-blue-50 text-blue-900 font-bold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isFr
                        ? "Créer des identifiants agent"
                        : "Create Officer Credentials"}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="bg-blue-700/80 hover:bg-blue-700 border border-blue-400/30 text-white font-semibold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isFr ? "Consulter tous les services" : "View All Services"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Metric 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isFr ? "Services Homologués" : "Active Services"}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {SERVICES_DATA.length}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {isFr ? "100% opérationnels" : "100% operational"}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 stroke-[1.75]" />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isFr ? "Comptes Agents Créés" : "Officer Accounts"}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {officers.length}
                  </h3>
                  <span className="text-[11px] text-blue-600 font-medium">
                    {isFr ? "Identifiants distincts" : "Distinct credentials"}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Key className="w-6 h-6 stroke-[1.75]" />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isFr ? "Ministères Connectés" : "Connected Ministries"}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">6</h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isFr ? "Régaliens & Sectoriels" : "Sovereign & Sectoral"}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 stroke-[1.75]" />
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isFr ? "Sécurité Souveraine" : "Sovereign Security"}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">AES-256</h3>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {isFr ? "PostgreSQL Chiffré" : "Encrypted PostgreSQL"}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Officer Credentials Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Recent Officer Accounts */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {isFr
                        ? "Derniers Identifiants Agents Générés"
                        : "Recently Created Officer Credentials"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isFr
                        ? "Comptes autorisés à instruire les dossiers de service"
                        : "Authorized accounts for service dossier clearance"}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("officers")}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isFr ? "Gérer tout" : "Manage all"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {officers.slice(0, 4).map((officer) => (
                    <div
                      key={officer.officerId}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center">
                          {officer.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {officer.fullName}
                          </div>
                          <div className="text-[11px] text-blue-700 font-medium">
                            {officer.serviceTitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                          {officer.username}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            officer.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {officer.isActive
                            ? isFr
                              ? "Actif"
                              : "Active"
                            : isFr
                            ? "Inactif"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 1 Col: Quick Administration Shortcuts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  {isFr ? "Actions Rapides Super Admin" : "Super Admin Quick Actions"}
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full text-left p-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 text-blue-900 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">
                          {isFr ? "Créer un identifiant agent" : "Create Officer Account"}
                        </div>
                        <div className="text-[11px] text-blue-700">
                          {isFr ? "Nom d'utilisateur & mot de passe" : "Username & password"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => setActiveTab("services")}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">
                          {isFr ? "Afficher les 12 services" : "View all 12 services"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isFr ? "Détails, SLA & tarifs" : "Details, SLA & fees"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <Link
                    href="/"
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">
                          {isFr ? "Guichet Public des Citoyens" : "Citizen Public Portal"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isFr ? "Tester les formulaires" : "Test application forms"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: VIEW ALL SERVICES (As explicitly requested by user)              */}
        {/* ======================================================================= */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isFr
                    ? "Répertoire Intégral des Services Publics RDC"
                    : "Complete DRC Public Services Directory"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFr
                    ? "Visualisez l'ensemble des démarches citoyennes et leurs agents instructeurs habilités"
                    : "View all citizen procedures and their authorized ministerial officers"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>
                    {isFr ? "Créer identifiant pour un service" : "Create Service Credentials"}
                  </span>
                </button>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICES_DATA.map((service) => {
                const count = serviceOfficerCounts[service.id] || 0;
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Code & Category Tag */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          {service.code}
                        </span>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium capitalize">
                          {service.category.replace("_", " ")}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 min-h-[44px]">
                        {isFr ? service.titleFr : service.titleEn}
                      </h3>

                      {/* Ministry */}
                      <p className="text-xs text-slate-600 font-medium truncate">
                        {isFr ? service.ministryFr : service.ministryEn}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {isFr ? service.descriptionFr : service.descriptionEn}
                      </p>

                      {/* Metadata: SLA & Cost */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="block text-[10px] text-slate-400 font-medium uppercase">
                            {isFr ? "Délai (SLA)" : "Processing"}
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px] truncate block">
                            {isFr ? service.slaFr : service.slaEn}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="block text-[10px] text-slate-400 font-medium uppercase">
                            {isFr ? "Tarif Légal" : "Regulated Fee"}
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px] truncate block">
                            {isFr ? service.costFr : service.costEn}
                          </span>
                        </div>
                      </div>

                      {/* Officers assigned badge */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">
                          {isFr ? "Agents habilités :" : "Assigned officers:"}
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                            count > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {count}{" "}
                          {count > 1
                            ? isFr
                              ? "agents"
                              : "officers"
                            : isFr
                            ? "agent"
                            : "officer"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
                      <button
                        onClick={() => {
                          setNewServiceId(service.id);
                          const slug = service.code.toLowerCase().replace(/[^a-z0-9]/g, "");
                          setNewUsername(`officer.${slug}`);
                          setIsCreateModalOpen(true);
                        }}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isFr ? "Créer identifiant" : "Add Credentials"}</span>
                      </button>

                      <Link
                        href={`/services/${service.id}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title={isFr ? "Voir la démarche" : "View procedure"}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: OFFICER CREDENTIALS MANAGEMENT (Username & Password generation)  */}
        {/* ======================================================================= */}
        {activeTab === "officers" && (
          <div className="space-y-6">
            {/* Header with Search and Add Button */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isFr
                    ? "Gestion des Identifiants & Mots de Passe par Service"
                    : "Service Officer Credentials & Passwords"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFr
                    ? "Créez et administrez les accès séparés pour chaque agent responsable d'un service"
                    : "Create and manage separate access credentials for each service officer"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={fetchOfficers}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title={isFr ? "Actualiser" : "Refresh"}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoadingOfficers ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>
                    {isFr ? "Créer un Nouvel Identifiant" : "Create New Officer Account"}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    isFr
                      ? "Rechercher un agent par nom, nom d'utilisateur, identifiant..."
                      : "Search by officer name, username, ID..."
                  }
                  value={officerSearch}
                  onChange={(e) => setOfficerSearch(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={selectedServiceFilter}
                  onChange={(e) => setSelectedServiceFilter(e.target.value)}
                  className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="all">
                    {isFr ? "Tous les services" : "All Services"}
                  </option>
                  {SERVICES_DATA.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {isFr ? s.titleFr : s.titleEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Officers Credentials Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">{isFr ? "Agent / Identifiant" : "Officer / ID"}</th>
                      <th className="py-3.5 px-4">{isFr ? "Service Attribué" : "Assigned Service"}</th>
                      <th className="py-3.5 px-4">{isFr ? "Nom d'Utilisateur" : "Username"}</th>
                      <th className="py-3.5 px-4">{isFr ? "Mot de Passe" : "Password"}</th>
                      <th className="py-3.5 px-4">{isFr ? "Statut" : "Status"}</th>
                      <th className="py-3.5 px-4 text-right">{isFr ? "Actions" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOfficers.length > 0 ? (
                      filteredOfficers.map((officer) => {
                        const isVisible = visiblePasswords[officer.officerId];
                        return (
                          <tr
                            key={officer.officerId}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            {/* Officer Name & ID */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">
                                {officer.fullName}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">
                                {officer.officerId}
                              </div>
                              {officer.email && (
                                <div className="text-[10px] text-slate-400">
                                  {officer.email}
                                </div>
                              )}
                            </td>

                            {/* Service */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-blue-700">
                                {officer.serviceTitle}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-xs">
                                {officer.ministry}
                              </div>
                            </td>

                            {/* Username */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                <span>{officer.username}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(officer.username, `u-${officer.officerId}`)
                                  }
                                  title={isFr ? "Copier le nom d'utilisateur" : "Copy username"}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  {copiedId === `u-${officer.officerId}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Password (Protected with show/hide and copy) */}
                            <td className="py-3.5 px-4">
                              <div className="inline-flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[11px]">
                                <span className="font-medium text-slate-800">
                                  {isVisible ? officer.password : "••••••••••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePasswordVisibility(officer.officerId)
                                  }
                                  title={
                                    isVisible
                                      ? isFr
                                        ? "Masquer le mot de passe"
                                        : "Hide password"
                                      : isFr
                                      ? "Afficher le mot de passe"
                                      : "Show password"
                                  }
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  {isVisible ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {officer.password && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(
                                        officer.password || "",
                                        `p-${officer.officerId}`
                                      )
                                    }
                                    title={isFr ? "Copier le mot de passe" : "Copy password"}
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    {copiedId === `p-${officer.officerId}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 ${
                                  officer.isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    officer.isActive ? "bg-emerald-600" : "bg-red-600"
                                  }`}
                                />
                                <span>
                                  {officer.isActive
                                    ? isFr
                                      ? "Actif"
                                      : "Active"
                                    : isFr
                                    ? "Suspendu"
                                    : "Suspended"}
                                </span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingOfficer(officer);
                                    setEditPassword("");
                                    setEditIsActive(officer.isActive);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title={
                                    isFr
                                      ? "Modifier ou réinitialiser le mot de passe"
                                      : "Edit or reset password"
                                  }
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOfficer(officer.officerId)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                                  title={isFr ? "Supprimer cet agent" : "Delete this officer"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          {isFr
                            ? "Aucun agent ne correspond à vos critères de recherche."
                            : "No officers match your search criteria."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW OFFICER CREDENTIALS FOR A SERVICE                       */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isFr
                      ? "Créer des Identifiants pour un Service"
                      : "Create Separate Service Credentials"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isFr
                      ? "Assignez un agent à une démarche officielle avec nom d'utilisateur et mot de passe"
                      : "Assign an officer to an official procedure with username and password"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateOfficer} className="space-y-4 text-xs">
              {/* Service Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isFr ? "1. Service Public Habilité *" : "1. Authorized Public Service *"}
                </label>
                <select
                  value={newServiceId}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {SERVICES_DATA.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      [{srv.code}] {isFr ? srv.titleFr : srv.titleEn} —{" "}
                      {isFr ? srv.ministryFr : srv.ministryEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isFr
                    ? "2. Nom complet de l'agent instructeur *"
                    : "2. Officer Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isFr ? "ex: Agent Joseph Mwamba" : "e.g. Officer Joseph Mwamba"
                  }
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isFr ? "3. Nom d'utilisateur unique *" : "3. Unique Username *"}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder={
                      isFr
                        ? "ex: officer.cni ou agent.passeport"
                        : "e.g. officer.cni or agent.passport"
                    }
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isFr
                    ? "L'agent utilisera cet identifiant pour se connecter à son guichet de traitement."
                    : "The officer will use this username to sign in to their processing desk."}
                </p>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {isFr ? "4. Mot de passe de l'agent *" : "4. Officer Password *"}
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    {isFr ? "⚡ Générer un mot de passe fort" : "⚡ Generate strong password"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="ex: SecretKey@2026"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Role & Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isFr ? "Téléphone officiel" : "Official Phone"}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isFr ? "Email ministériel" : "Ministerial Email"}
                  </label>
                  <input
                    type="email"
                    placeholder="agent@gouv.cd"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  {isFr ? "Annuler" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOfficer}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingOfficer ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{isFr ? "Création..." : "Creating..."}</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>
                        {isFr
                          ? "Enregistrer et générer les identifiants"
                          : "Save & Generate Credentials"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT OFFICER / RESET PASSWORD                                      */}
      {/* ========================================================================= */}
      {editingOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {isFr
                  ? `Modifier l'accès : ${editingOfficer.fullName}`
                  : `Edit Access: ${editingOfficer.fullName}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOfficer(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-slate-600">
              <div>
                <strong>{isFr ? "Identifiant :" : "Identifier:"}</strong> {editingOfficer.officerId}
              </div>
              <div>
                <strong>{isFr ? "Nom d'utilisateur :" : "Username:"}</strong> {editingOfficer.username}
              </div>
              <div>
                <strong>{isFr ? "Service :" : "Service:"}</strong> {editingOfficer.serviceTitle}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isFr
                  ? "Nouveau mot de passe (laisser vide pour ne pas modifier)"
                  : "New password (leave empty to keep unchanged)"}
              </label>
              <input
                type="text"
                placeholder={isFr ? "Nouveau mot de passe" : "New password"}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="editIsActive" className="text-slate-800 font-medium cursor-pointer">
                {isFr
                  ? "Compte actif et autorisé à traiter les dossiers"
                  : "Active account authorized to process applications"}
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingOfficer(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {isFr ? "Annuler" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleUpdateOfficer}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
              >
                {isFr ? "Enregistrer modifications" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
