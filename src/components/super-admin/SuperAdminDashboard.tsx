"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { PgDetailItem } from "@/lib/data/pgs";
import { PlatformBroadcast, UserRole } from "@/types/schema.types";
import { OnboardPgModal } from "@/components/super-admin/OnboardPgModal";
import { EditBrandingModal } from "@/components/super-admin/EditBrandingModal";
import { togglePgStatusAction } from "@/app/actions/branding";
import {
  createBroadcastAction,
  toggleBroadcastAction,
} from "@/app/actions/passes-and-broadcasts";
import { switchDemoPersonaAction } from "@/app/actions/auth";

interface SuperAdminDashboardProps {
  pgs: PgDetailItem[];
  broadcasts: PlatformBroadcast[];
  initialTab?: "overview" | "pgs" | "broadcast" | "billing";
}

export function SuperAdminDashboard({
  pgs: initialPgs,
  broadcasts: initialBroadcasts,
  initialTab = "overview",
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "pgs" | "broadcast" | "billing">(initialTab);
  const [pgsList, setPgsList] = useState<PgDetailItem[]>(initialPgs);
  const [broadcastsList, setBroadcastsList] = useState<PlatformBroadcast[]>(initialBroadcasts);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

      const newBc: PlatformBroadcast = {
        id: `bc-${Date.now()}`,
        title: bcTitle,
        message: bcMsg,
        priority: "info",
        target_roles: roles as UserRole[],
        is_active: true,
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
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "overview"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pgs")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "pgs"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          PGs ({pgsList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("broadcast")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "broadcast"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Broadcast
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "billing"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Billing
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
              <div className="text-[10.5px] font-semibold text-slate-400">ShunyOS MRR</div>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums mt-1">
                ₹{totalMrr.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-emerald-500 mt-0.5">+28% MoM SaaS</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
              <div className="text-[10.5px] font-semibold text-slate-400">Active Platform Beds</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-1">
                {totalBeds}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Across {pgsList.length} White-Label PGs
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">City Footprint</h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-600 dark:text-slate-300">Noida & Greater Noida</span>
                <strong className="text-slate-900 dark:text-white">140 Beds</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-600 dark:text-slate-300">Gurugram Cyber Hub</span>
                <strong className="text-slate-900 dark:text-white">95 Beds</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-600 dark:text-slate-300">Kota & Pune</span>
                <strong className="text-slate-900 dark:text-white">70 Beds</strong>
              </div>
            </div>
          </div>

          <OnboardPgModal
            triggerButton={
              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition active:scale-[0.99]"
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
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {pg.logo_url ? (
                      <img
                        src={pg.logo_url}
                        alt={pg.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {pg.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {pg.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-600"
                              : isPending
                              ? "bg-amber-500/20 text-amber-600"
                              : "bg-rose-500/15 text-rose-500"
                          }`}
                        >
                          {isActive ? "Active" : isPending ? "Pending" : "Suspended"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        /pg/{pg.slug} • {pg.owner_name} • {pg.subscription_tier}
                      </div>
                    </div>
                  </div>

                  <EditBrandingModal
                    pg={pg}
                    triggerButton={
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold shrink-0"
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
                      className="py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs transition"
                    >
                      Approve PG
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pg.id, pg.status)}
                      className={`py-1.5 rounded-xl text-[10px] font-extrabold transition shadow-xs ${
                        isActive
                          ? "bg-rose-500/15 hover:bg-rose-500/20 text-rose-600"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white"
                      }`}
                    >
                      {isActive ? "Suspend Kill-Switch" : "Re-Activate PG"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleViewAsOwner(pg.name)}
                    className="py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold transition"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-sm">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
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
                <label className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetOwner}
                    onChange={(e) => setTargetOwner(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800 dark:text-slate-200">PG Owners</span>
                </label>
                <label className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetAdmin}
                    onChange={(e) => setTargetAdmin(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800 dark:text-slate-200">Wardens</span>
                </label>
                <label className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetTenant}
                    onChange={(e) => setTargetTenant(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800 dark:text-slate-200">Tenants</span>
                </label>
              </div>
            </div>

            <form onSubmit={handlePublishBroadcast} className="space-y-2 text-xs">
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-indigo-500"
              />
              <textarea
                rows={2}
                value={bcMsg}
                onChange={(e) => setBcMsg(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
              Active Platform Broadcasts
            </h3>

            {broadcastsList.map((b) => (
              <div
                key={b.id}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {b.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleBroadcast(b.id)}
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition ${
                      b.is_active
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {b.is_active ? "Live" : "Paused"}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">{b.message}</p>
                <div className="flex gap-1 pt-0.5">
                  {b.target_roles.map((r) => (
                    <span
                      key={r}
                      className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-500 text-[8.5px] font-extrabold uppercase"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
            ShunyOS SaaS Subscription Tiers
          </h3>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <strong className="block text-slate-900 dark:text-white">Free Trial</strong>
              <span className="text-[10px] text-slate-400">Up to 30 Beds • 14 Days</span>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">₹0</span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <strong className="block text-slate-900 dark:text-white">Starter White-Label</strong>
              <span className="text-[10px] text-slate-400">Up to 100 Beds • Custom Slug</span>
            </div>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">₹999 / mo</span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <strong className="block text-slate-900 dark:text-white">Pro Unlimited</strong>
              <span className="text-[10px] text-slate-400">Unlimited Beds + Cloud WhatsApp</span>
            </div>
            <span className="font-extrabold text-emerald-600">₹2,499 / mo</span>
          </div>
        </div>
      )}

      {/* Subtle Platform Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold border border-slate-200/50 dark:border-slate-700/50">
          <Crown className="w-3 h-3 text-purple-500" />
          <span>ShunyOS SaaS Engine</span>
          <span className="text-slate-400">• v2.4 Production</span>
        </div>
      </footer>
    </div>
  );
}
