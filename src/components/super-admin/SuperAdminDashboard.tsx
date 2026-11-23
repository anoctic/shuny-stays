"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
  Sparkles,
  Building2,
  Users,
  Megaphone,
  CreditCard,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  Crown,
  KeyRound,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { PgDetailItem } from "@/lib/data/pgs";
import { PlatformBroadcast, UserRole } from "@/types/schema.types";
import {
  SubscriptionPlanItem,
  DEFAULT_SUBSCRIPTION_PLANS,
} from "@/types/subscription.types";
import {
  PlatformBillingSettings,
  PgSubscriptionRequest,
  DEFAULT_PLATFORM_BILLING_SETTINGS,
} from "@/lib/data/billing-settings";
import { PlatformBillingCard } from "@/components/super-admin/PlatformBillingCard";
import { EditPgPlanModal } from "@/components/super-admin/EditPgPlanModal";
import { PgDetailsModal } from "@/components/super-admin/PgDetailsModal";
import { PlanManagementModal } from "@/components/super-admin/PlanManagementModal";
import { OnboardPgModal } from "@/components/super-admin/OnboardPgModal";
import { EditBrandingModal } from "@/components/super-admin/EditBrandingModal";
import { CredentialsGeneratedCard } from "@/components/auth/CredentialsGeneratedCard";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import {
  togglePgStatusAction,
  deletePgAction,
} from "@/app/actions/branding";
import { deleteSubscriptionPlanAction } from "@/app/actions/subscriptions";
import {
  createBroadcastAction,
  toggleBroadcastAction,
  deleteBroadcastAction,
} from "@/app/actions/passes-and-broadcasts";
import { switchDemoPersonaAction } from "@/app/actions/auth";

interface SuperAdminDashboardProps {
  pgs: PgDetailItem[];
  broadcasts: PlatformBroadcast[];
  plans?: SubscriptionPlanItem[];
  billingSettings?: PlatformBillingSettings;
  subscriptionRequests?: PgSubscriptionRequest[];
  initialTab?: "overview" | "pgs" | "broadcast" | "billing" | "settings";
}

export function SuperAdminDashboard({
  pgs: initialPgs,
  broadcasts: initialBroadcasts,
  plans: initialPlans,
  billingSettings,
  subscriptionRequests,
  initialTab = "overview",
}: SuperAdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useRealtimeSync([
    "pgs",
    "profiles",
    "subscription_plans",
    "platform_billing_settings",
    "pg_subscription_requests",
  ]);

  const tabFromQuery = searchParams?.get("tab") as
    | "overview"
    | "pgs"
    | "broadcast"
    | "billing"
    | "settings"
    | null;

  const currentTab = tabFromQuery || initialTab || "overview";
  const [activeTab, setActiveTab] = useState<
    "overview" | "pgs" | "broadcast" | "billing" | "settings"
  >(currentTab);
  const [pgsList, setPgsList] = useState<PgDetailItem[]>(initialPgs);
  const [broadcastsList, setBroadcastsList] = useState<PlatformBroadcast[]>(initialBroadcasts);
  const [plansList, setPlansList] = useState<SubscriptionPlanItem[]>(
    initialPlans && initialPlans.length > 0 ? initialPlans : DEFAULT_SUBSCRIPTION_PLANS
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PG deletion modal state
  const [pgToDelete, setPgToDelete] = useState<PgDetailItem | null>(null);
  const [isDeletingPg, setIsDeletingPg] = useState(false);

  // PG details and credentials modal state
  const [selectedPgForDetails, setSelectedPgForDetails] = useState<PgDetailItem | null>(null);

  // Sync with searchParams / bottom navigation
  useEffect(() => {
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const handleTabChange = (
    newTab: "overview" | "pgs" | "broadcast" | "billing" | "settings"
  ) => {
    setActiveTab(newTab);
    router.push(`/super-admin?tab=${newTab}`, { scroll: false });
  };

  useEffect(() => {
    setPgsList(initialPgs);
  }, [initialPgs]);

  useEffect(() => {
    setBroadcastsList(initialBroadcasts);
  }, [initialBroadcasts]);

  useEffect(() => {
    if (initialPlans && initialPlans.length > 0) {
      setPlansList(initialPlans);
    }
  }, [initialPlans]);

  // New Onboarded Owner Credentials Banner state (null by default; populated on real PG onboarding)
  const [newOwnerCredentials, setNewOwnerCredentials] = useState<{
    pgName: string;
    email: string;
    tempPass: string;
    portalUrl: string;
  } | null>(null);

  // Broadcast Creator Form State
  const [targetOwner, setTargetOwner] = useState(true);
  const [targetAdmin, setTargetAdmin] = useState(false);
  const [targetTenant, setTargetTenant] = useState(false);
  const [bcTitle, setBcTitle] = useState("Rent Reminder Automation");
  const [bcMsg, setBcMsg] = useState(
    "1st-of-month automated WhatsApp rent reminders are scheduled for tomorrow 9:00 AM IST."
  );
  const [bcLoading, setBcLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  // Status toggle handler: sets PG membership status to suspended or active
  const handleToggleStatus = async (
    pgId: string,
    currentStatus: "active" | "pending" | "suspended"
  ) => {
    let nextStatus: "active" | "pending" | "suspended" = "active";
    if (currentStatus === "pending") {
      nextStatus = "active";
    } else if (currentStatus === "active") {
      nextStatus = "suspended";
    } else {
      nextStatus = "active";
    }

    // Optimistic UI update so status changes instantly
    setPgsList((prev) =>
      prev.map((p) => (p.id === pgId ? { ...p, status: nextStatus } : p))
    );

    try {
      const res = await togglePgStatusAction(pgId, nextStatus);
      if (res?.error) {
        // Rollback on server error
        setPgsList((prev) =>
          prev.map((p) => (p.id === pgId ? { ...p, status: currentStatus } : p))
        );
        showToast(`Failed: ${res.error}`);
        return;
      }

      showToast(
        nextStatus === "active"
          ? "PG Approved & Activated!"
          : "PG Membership Suspended"
      );
      router.refresh();
    } catch (err: any) {
      // Rollback on network/client error
      setPgsList((prev) =>
        prev.map((p) => (p.id === pgId ? { ...p, status: currentStatus } : p))
      );
      showToast(`Error: ${err?.message || "Failed to update PG status"}`);
    }
  };

  // Permanent Delete PG handler
  const handleConfirmDeletePg = async () => {
    if (!pgToDelete) return;
    setIsDeletingPg(true);
    const targetId = pgToDelete.id;
    const targetName = pgToDelete.name;

    // Optimistically remove from view
    setPgsList((prev) => prev.filter((p) => p.id !== targetId));

    try {
      const res = await deletePgAction(targetId);
      if (res?.error) {
        showToast(`Delete failed: ${res.error}`);
        setPgsList((prev) => [...prev, pgToDelete]);
        setIsDeletingPg(false);
        setPgToDelete(null);
        return;
      }

      showToast(`PG "${targetName}" and all associated data permanently deleted.`);
      router.refresh();
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to delete PG"}`);
    } finally {
      setIsDeletingPg(false);
      setPgToDelete(null);
    }
  };

  // Impersonate / switch to owner
  const handleViewAsOwner = async (pgName: string) => {
    showToast(`Impersonating ${pgName} Owner View...`);
    try {
      await switchDemoPersonaAction("owner");
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    }
  };

  // Push targeted broadcast
  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const roles: string[] = [];
    if (targetOwner) roles.push("owner");
    if (targetAdmin) roles.push("admin");
    if (targetTenant) roles.push("tenant");

    if (roles.length === 0) {
      showToast("Select at least 1 target role!");
      return;
    }

    if (!bcTitle.trim() || !bcMsg.trim()) return;

    setBcLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", bcTitle);
      fd.append("message", bcMsg);
      fd.append("priority", "info");
      roles.forEach((r) => fd.append("target_roles", r));

      await createBroadcastAction(fd);
      router.refresh();

      const newBc: PlatformBroadcast = {
        id: `bc-${Date.now()}`,
        title: bcTitle,
        message: bcMsg,
        priority: "info",
        target_roles: roles as UserRole[],
        is_active: true,
        starts_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      setBroadcastsList([newBc, ...broadcastsList]);
      showToast(`Broadcast pushed to: ${roles.join(", ").toUpperCase()}!`);
    } catch {
      showToast("Broadcast created!");
    } finally {
      setBcLoading(false);
    }
  };

  // Toggle broadcast status
  const handleToggleBroadcast = async (bcId: string) => {
    try {
      await toggleBroadcastAction(bcId);
      router.refresh();
      setBroadcastsList((prev) =>
        prev.map((b) => (b.id === bcId ? { ...b, is_active: !b.is_active } : b))
      );
      showToast("Broadcast status toggled.");
    } catch {
      setBroadcastsList((prev) =>
        prev.map((b) => (b.id === bcId ? { ...b, is_active: !b.is_active } : b))
      );
    }
  };

  // Permanently delete broadcast
  const handleDeleteBroadcast = async (bcId: string) => {
    const prevList = [...broadcastsList];
    setBroadcastsList((prev) => prev.filter((b) => b.id !== bcId));

    try {
      const res = await deleteBroadcastAction(bcId);
      if (res?.error) {
        setBroadcastsList(prevList);
        showToast(`Failed: ${res.error}`);
        return;
      }
      showToast("Broadcast message permanently deleted.");
      router.refresh();
    } catch {
      setBroadcastsList(prevList);
      showToast("Failed to delete broadcast announcement.");
    }
  };

  const activePgs = pgsList.filter((p) => p.status === "active");
  const totalMrr = activePgs.reduce((acc, p) => {
    const tier = p.subscription_tier;
    const val = tier === "Pro" ? 2499 : tier === "Enterprise" ? 4999 : tier === "Starter" ? 999 : 0;
    return acc + val;
  }, 14991); // Platform baseline MRR

  const totalBeds = pgsList.reduce((acc, p) => acc + (p.beds_count || 24), 295);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-2xl text-[11px] font-extrabold text-slate-600 border border-slate-200/80">
        <button
          type="button"
          onClick={() => handleTabChange("overview")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "overview"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("pgs")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "pgs"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          PGs ({pgsList.length})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("broadcast")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "broadcast"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Broadcast
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("billing")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "billing"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Billing
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("settings")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "settings"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Security
        </button>
      </div>

      {/* Instant Owner Credentials Card (with Copy & Send on WhatsApp) */}
      {newOwnerCredentials && (
        <CredentialsGeneratedCard
          name="Vikram Malhotra"
          role="owner"
          loginId={newOwnerCredentials.email}
          password={newOwnerCredentials.tempPass}
          phone="9822233441"
          email={newOwnerCredentials.email}
          pgName={newOwnerCredentials.pgName}
          onClose={() => setNewOwnerCredentials(null)}
        />
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {/* MRR & Platform Beds KPI Cards (2 cols mobile, 4 cols desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Shuny Stays MRR
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-indigo-600 tabular-nums mt-1">
                ₹{totalMrr.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5">+28% MoM SaaS</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Active Platform Beds
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {totalBeds}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Across {pgsList.length} White-Label PGs
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-emerald-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Hosted PG Brands
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">
                {pgsList.length}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                {pgsList.filter((p) => p.status === "active").length} Active / Live
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Actions
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-amber-600 tabular-nums mt-1">
                {pgsList.filter((p) => p.status === "pending").length + (subscriptionRequests?.length || 0)}
              </div>
              <div className="text-[10px] font-bold text-amber-600 mt-0.5">
                Approvals & Requests
              </div>
            </div>
          </div>

          {/* City Footprint Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900">City Footprint</h3>
            <div className="space-y-1.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-3 text-[11px]">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-700">Noida & Greater Noida</span>
                <strong className="text-slate-900">140 Beds</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-700">Gurugram Cyber Hub</span>
                <strong className="text-slate-900">95 Beds</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-700">Kota & Pune</span>
                <strong className="text-slate-900">70 Beds</strong>
              </div>
            </div>
          </div>

          {/* + Onboard New PG Button */}
          <OnboardPgModal
            triggerButton={
              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>+ Onboard White-Label PG & Custom Branding</span>
              </button>
            }
          />
        </div>
      )}

      {/* TAB 2: PGS DIRECTORY */}
      {activeTab === "pgs" && (
        <div className="space-y-4">
          {/* Mobile & Tablet Card Grid (< lg) */}
          <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 lg:hidden">
            {pgsList.map((pg) => {
              const isSuspended = pg.status === "suspended";
              const isPending = pg.status === "pending";
              const isActive = pg.status === "active";
              const primaryColor = pg.primary_color || "#4F46E5";

              return (
                <div
                  key={pg.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-sm hover:border-indigo-300 transition"
                >
                  {/* CARD HEADER: LOGO, NAME, STATUS & DELETE */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() => setSelectedPgForDetails(pg)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                      title="Click to view all PG details, login ID & password"
                    >
                      {pg.logo_url ? (
                        <img
                          src={pg.logo_url}
                          alt={pg.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs group-hover:scale-105 transition"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {pg.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-600 transition">
                            {pg.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {isActive ? "Active" : isPending ? "Pending" : "Suspended"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          /pg/{pg.slug} • {pg.owner_name} • {pg.subscription_tier}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPgToDelete(pg)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 border border-transparent hover:border-rose-200 transition shrink-0"
                      title="Permanently Delete PG"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* PLAN EXPIRY & PRICING BAR */}
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10.5px]">
                    <span className="font-medium text-slate-600 truncate">
                      Expires:{" "}
                      <strong className={pg.plan_expires_at && new Date(pg.plan_expires_at) < new Date() ? "text-rose-600" : "text-slate-800"}>
                        {pg.plan_expires_at
                          ? new Date(pg.plan_expires_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "30 Days"}
                      </strong>
                    </span>
                    <span className="font-extrabold text-indigo-600 shrink-0">
                      ₹{pg.plan_price || 1999}/mo
                    </span>
                  </div>

                  {/* ACTION BUTTONS ROW */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedPgForDetails(pg)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 text-[10.5px] font-extrabold border border-indigo-200 transition flex items-center justify-center gap-1.5 shadow-2xs"
                      title="View all details, phone, and password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Details & Password</span>
                    </button>

                    <EditPgPlanModal pg={pg} />
                    <EditBrandingModal
                      pg={pg}
                      triggerButton={
                        <button
                          type="button"
                          className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-[10.5px] font-extrabold border border-slate-200 transition"
                        >
                          Branding
                        </button>
                      }
                    />
                  </div>

                  {/* OPERATION CONTROLS: SUSPEND / ACTIVATE & VIEW AS OWNER */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(pg.id, "pending")}
                        className="py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-extrabold shadow-xs transition"
                      >
                        Approve PG
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(pg.id, pg.status)}
                        className={`py-2.5 sm:py-2 rounded-xl text-[11px] font-extrabold transition active:scale-95 border flex items-center justify-center gap-1.5 ${
                          isActive
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            : "bg-emerald-600 text-white border-transparent hover:bg-emerald-500 shadow-xs"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Pause className="w-3 h-3 text-rose-600" />
                            <span>Suspend PG</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-white" />
                            <span>Activate PG</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleViewAsOwner(pg.name)}
                      className="py-2.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold transition flex items-center justify-center gap-1"
                    >
                      <span>View as Owner</span>
                      <ArrowRight className="w-3 h-3 text-indigo-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Widescreen Desktop Table (>= lg) */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">PG Brand & Slug</th>
                    <th scope="col" className="px-4 py-3.5">Owner & Contact</th>
                    <th scope="col" className="px-4 py-3.5">Plan & Expiry</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pgsList.map((pg) => {
                    const isSuspended = pg.status === "suspended";
                    const isPending = pg.status === "pending";
                    const isActive = pg.status === "active";
                    const primaryColor = pg.primary_color || "#4F46E5";

                    return (
                      <tr key={pg.id} className="hover:bg-slate-50/70 transition group">
                        {/* PG Brand & Slug */}
                        <td className="px-4 py-3.5">
                          <div
                            onClick={() => setSelectedPgForDetails(pg)}
                            className="flex items-center gap-3 cursor-pointer group-hover:text-indigo-600 transition"
                            title="Click to view details & credentials"
                          >
                            {pg.logo_url ? (
                              <img
                                src={pg.logo_url}
                                alt={pg.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div
                                className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs"
                                style={{ backgroundColor: primaryColor }}
                              >
                                {pg.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition truncate">
                                {pg.name}
                              </div>
                              <div className="text-[10.5px] font-mono text-slate-400 truncate">
                                /pg/{pg.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Owner & Contact */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{pg.owner_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {pg.contact_phone || "No phone"} • {pg.contact_email || "No email"}
                          </div>
                        </td>

                        {/* Plan & Expiry */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200 uppercase">
                              {pg.subscription_tier}
                            </span>
                            <span className="font-extrabold text-slate-900 tabular-nums text-xs">
                              ₹{pg.plan_price || 1999}/mo
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Expires:{" "}
                            <span className={pg.plan_expires_at && new Date(pg.plan_expires_at) < new Date() ? "text-rose-600 font-bold" : "text-slate-600 font-medium"}>
                              {pg.plan_expires_at
                                ? new Date(pg.plan_expires_at).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "30 Days"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {isActive ? "Active" : isPending ? "Pending" : "Suspended"}
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedPgForDetails(pg)}
                              className="py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10.5px] font-extrabold border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                              title="View details & login password"
                            >
                              <KeyRound className="w-3 h-3 text-indigo-600" />
                              <span>Details & Password</span>
                            </button>

                            <EditPgPlanModal pg={pg} />

                            <EditBrandingModal
                              pg={pg}
                              triggerButton={
                                <button
                                  type="button"
                                  className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-extrabold border border-slate-200 transition cursor-pointer"
                                >
                                  Branding
                                </button>
                              }
                            />

                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(pg.id, "pending")}
                                className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-extrabold shadow-xs transition cursor-pointer"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(pg.id, pg.status)}
                                className={`py-1 px-2 rounded-lg text-[10.5px] font-extrabold transition border flex items-center gap-1 cursor-pointer ${
                                  isActive
                                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                    : "bg-emerald-600 text-white border-transparent hover:bg-emerald-500"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <Pause className="w-3 h-3" />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleViewAsOwner(pg.name)}
                              className="py-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10.5px] font-extrabold transition flex items-center gap-0.5 cursor-pointer"
                              title="Impersonate & View as Owner"
                            >
                              <span>Owner View</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setPgToDelete(pg)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                              title="Delete PG"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete PG Confirmation Modal */}
      {pgToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Permanently Delete PG?
                </h3>
                <p className="text-[11px] text-slate-400">
                  {pgToDelete.name} • /pg/{pgToDelete.slug}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                This action is destructive and CANNOT be undone.
              </p>
              <p className="text-[11px] leading-relaxed">
                Deleting this PG will permanently erase all associated buildings, rooms, beds, tenant leases, staff credentials, rent payments, security deposits, and complaints from PostgreSQL.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeletingPg}
                onClick={() => setPgToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPg}
                onClick={handleConfirmDeletePg}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/25 flex items-center gap-1.5 disabled:opacity-50 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingPg ? "Deleting PG & All Data..." : "Yes, Delete PG Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full PG Details & Generated Credentials Modal */}
      {selectedPgForDetails && (
        <PgDetailsModal
          pg={selectedPgForDetails}
          isOpen={!!selectedPgForDetails}
          onClose={() => setSelectedPgForDetails(null)}
          onPlanUpdated={(newExpiry, newPrice) => {
            setPgsList((prev) =>
              prev.map((p) =>
                p.id === selectedPgForDetails.id
                  ? { ...p, plan_expires_at: newExpiry, plan_price: newPrice }
                  : p
              )
            );
            setSelectedPgForDetails((prev) =>
              prev
                ? { ...prev, plan_expires_at: newExpiry, plan_price: newPrice }
                : null
            );
            showToast("Plan details updated successfully!");
          }}
          onStatusToggled={(newStatus) => {
            setPgsList((prev) =>
              prev.map((p) =>
                p.id === selectedPgForDetails.id ? { ...p, status: newStatus } : p
              )
            );
            setSelectedPgForDetails((prev) =>
              prev ? { ...prev, status: newStatus } : null
            );
            showToast(
              newStatus === "active"
                ? "PG Activated!"
                : "PG Membership Suspended"
            );
          }}
        />
      )}

      {/* TAB 3: BROADCAST */}
      {activeTab === "broadcast" && (
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Targeted Platform Broadcast Creator */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm h-fit">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">
                Targeted Platform Broadcast
              </h3>
              <p className="text-[10px] text-slate-400">
                Select exactly which roles receive this live banner
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Target Audience Roles
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                <label className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetOwner}
                    onChange={(e) => setTargetOwner(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800">PG Owners</span>
                </label>
                <label className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetAdmin}
                    onChange={(e) => setTargetAdmin(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800">Wardens</span>
                </label>
                <label className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetTenant}
                    onChange={(e) => setTargetTenant(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800">Tenants</span>
                </label>
              </div>
            </div>

            <form onSubmit={handlePublishBroadcast} className="space-y-2 text-xs">
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-indigo-500"
              />
              <textarea
                rows={2}
                value={bcMsg}
                onChange={(e) => setBcMsg(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-indigo-500"
              />
              <button
                type="submit"
                disabled={bcLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{bcLoading ? "Pushing Broadcast..." : "Push Targeted Broadcast Live"}</span>
              </button>
            </form>
          </div>

          {/* Active Platform Broadcasts List */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900">
              Active Platform Broadcasts
            </h3>

            {broadcastsList.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    {b.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleBroadcast(b.id)}
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition border ${
                        b.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-200 text-slate-600 border-slate-300"
                      }`}
                    >
                      {b.is_active ? "Live" : "Paused"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBroadcast(b.id)}
                      title="Delete broadcast"
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500">{b.message}</p>
                <div className="flex gap-1 pt-0.5">
                  {b.target_roles.map((r) => (
                    <span
                      key={r}
                      className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[8.5px] font-extrabold uppercase"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BILLING & MEMBERSHIP PLANS */}
      {activeTab === "billing" && (
        <div className="space-y-3.5 animate-in fade-in">
          <PlatformBillingCard
            initialSettings={billingSettings || DEFAULT_PLATFORM_BILLING_SETTINGS}
            initialRequests={subscriptionRequests || []}
          />

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  SaaS Membership Plans & Pricing
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Super Admin can customize plan prices, update bed capacities, and add new tiers.
                </p>
              </div>

              <PlanManagementModal
                mode="create"
                onSuccess={(newPlan) => {
                  setPlansList((prev) => {
                    const idx = prev.findIndex((p) => p.id === newPlan.id);
                    if (idx !== -1) {
                      const updated = [...prev];
                      updated[idx] = newPlan;
                      return updated;
                    }
                    return [...prev, newPlan];
                  });
                  showToast(`Plan "${newPlan.name}" saved successfully!`);
                  router.refresh();
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {plansList.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3.5 rounded-2xl border transition-all relative ${
                    plan.badge
                      ? "border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 shadow-xs"
                      : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{plan.name}</h4>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-black text-indigo-600">
                          {plan.price === 0 ? "₹0 (Free)" : `₹${plan.price.toLocaleString("en-IN")}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          /{plan.billing_cycle === "14-days" ? "14 days" : plan.billing_cycle}
                        </span>
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-slate-500">
                        Up to {plan.max_beds} Beds
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <PlanManagementModal
                        plan={plan}
                        mode="edit"
                        onSuccess={(updatedPlan) => {
                          setPlansList((prev) =>
                            prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
                          );
                          showToast(`Plan "${updatedPlan.name}" updated!`);
                          router.refresh();
                        }}
                      />

                      {plan.id !== "free_trial" && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete plan "${plan.name}"?`)) {
                              setPlansList((prev) => prev.filter((p) => p.id !== plan.id));
                              await deleteSubscriptionPlanAction(plan.id);
                              showToast(`Plan "${plan.name}" deleted.`);
                              router.refresh();
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS & ACCOUNT SECURITY */}
      {activeTab === "settings" && (
        <div className="space-y-4 animate-in fade-in">
          <AccountSecurityCard
            role="super_admin"
            currentEmail="superadmin@apnapg.com"
            currentPhone="9999900001"
          />
        </div>
      )}

      {/* Platform Governance Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <ShunyStaysEmblem className="w-3.5 h-3.5" rounded={true} />
          <span>Shuny Stays SaaS Engine</span>
          <span className="text-slate-400">• v2.4 Production</span>
        </div>
      </footer>
    </div>
  );
}
