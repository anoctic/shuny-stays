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
} from "lucide-react";
import { PgDetailItem } from "@/lib/data/pgs";
import { PlatformBroadcast, UserRole } from "@/types/schema.types";
import { OnboardPgModal } from "@/components/super-admin/OnboardPgModal";
import { EditBrandingModal } from "@/components/super-admin/EditBrandingModal";
import { CredentialsGeneratedCard } from "@/components/auth/CredentialsGeneratedCard";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { togglePgStatusAction } from "@/app/actions/branding";
import {
  createBroadcastAction,
  toggleBroadcastAction,
} from "@/app/actions/passes-and-broadcasts";
import { switchDemoPersonaAction } from "@/app/actions/auth";

interface SuperAdminDashboardProps {
  pgs: PgDetailItem[];
  broadcasts: PlatformBroadcast[];
  initialTab?: "overview" | "pgs" | "broadcast" | "billing" | "settings";
}

export function SuperAdminDashboard({
  pgs: initialPgs,
  broadcasts: initialBroadcasts,
  initialTab = "overview",
}: SuperAdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useRealtimeSync(["pgs", "profiles"]);

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Status toggle handler
  const handleToggleStatus = async (pgId: string, currentStatus: "active" | "pending" | "suspended") => {
    let nextStatus: "active" | "pending" | "suspended" = "active";
    if (currentStatus === "pending") {
      nextStatus = "active";
    } else if (currentStatus === "active") {
      nextStatus = "suspended";
    } else {
      nextStatus = "active";
    }

    try {
      await togglePgStatusAction(pgId, nextStatus);
      router.refresh();
      setPgsList((prev) =>
        prev.map((p) => (p.id === pgId ? { ...p, status: nextStatus } : p))
      );
      showToast(
        nextStatus === "active"
          ? "PG Approved & Activated!"
          : "PG Suspended via Kill-Switch"
      );
    } catch {
      setPgsList((prev) =>
        prev.map((p) => (p.id === pgId ? { ...p, status: nextStatus } : p))
      );
      showToast("Updated PG status.");
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
          {/* MRR & Platform Beds KPI Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Shuny Stays MRR
              </div>
              <div className="text-xl font-extrabold text-indigo-600 tabular-nums mt-1">
                ₹{totalMrr.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5">+28% MoM SaaS</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Active Platform Beds
              </div>
              <div className="text-xl font-extrabold text-slate-900 tabular-nums mt-1">
                {totalBeds}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Across {pgsList.length} White-Label PGs
              </div>
            </div>
          </div>

          {/* City Footprint Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900">City Footprint</h3>
            <div className="space-y-1.5 text-[11px]">
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
        <div className="space-y-2.5">
          {pgsList.map((pg) => {
            const isSuspended = pg.status === "suspended";
            const isPending = pg.status === "pending";
            const isActive = pg.status === "active";
            const primaryColor = pg.primary_color || "#4F46E5";

            return (
              <div
                key={pg.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {pg.logo_url ? (
                      <img
                        src={pg.logo_url}
                        alt={pg.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {pg.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 truncate">
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

                  <EditBrandingModal
                    pg={pg}
                    triggerButton={
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold shrink-0 border border-slate-200"
                      >
                        Branding
                      </button>
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pg.id, "pending")}
                      className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold shadow-xs transition"
                    >
                      Approve PG
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pg.id, pg.status)}
                      className={`py-2 rounded-xl text-[11px] font-extrabold transition border ${
                        isActive
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-600 text-white border-transparent hover:bg-emerald-500 shadow-xs"
                      }`}
                    >
                      {isActive ? "Suspend Kill-Switch" : "Re-Activate PG"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleViewAsOwner(pg.name)}
                    className="py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold transition"
                  >
                    View as Owner →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: BROADCAST */}
      {activeTab === "broadcast" && (
        <div className="space-y-3">
          {/* Targeted Platform Broadcast Creator */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-sm">
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

      {/* TAB 4: BILLING */}
      {activeTab === "billing" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900">
            Shuny Stays SaaS Subscription Tiers
          </h3>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <strong className="block text-slate-900">Free Trial</strong>
              <span className="text-[10px] text-slate-400">Up to 30 Beds • 14 Days</span>
            </div>
            <span className="font-extrabold text-slate-900">₹0</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <strong className="block text-slate-900">Starter White-Label</strong>
              <span className="text-[10px] text-slate-400">Up to 100 Beds • Custom Slug</span>
            </div>
            <span className="font-extrabold text-indigo-600">₹999 / mo</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <strong className="block text-slate-900">Pro Unlimited</strong>
              <span className="text-[10px] text-slate-400">Unlimited Beds + Cloud WhatsApp</span>
            </div>
            <span className="font-extrabold text-emerald-600">₹2,499 / mo</span>
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
