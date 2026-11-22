"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Power,
  RefreshCw,
  Sparkles,
  Phone,
  DoorOpen,
  ChevronRight,
  Flame,
} from "lucide-react";
import { MealPollSummary, TenantHeadcountItem } from "@/types/meal-poll.types";
import { toggleMealPollAction } from "@/app/actions/meal-polls";

interface AdminMealPollCardProps {
  summary: MealPollSummary;
  pgId: string;
}

export function AdminMealPollCard({ summary: initialSummary, pgId }: AdminMealPollCardProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<MealPollSummary>(initialSummary);
  const [activeTab, setActiveTab] = useState<"yes" | "no" | "not_answered">("yes");
  const [isToggling, setIsToggling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const poll = summary.poll;
  const isPollActive = poll?.is_active ?? false;
  const isExpired = summary.isCutoffPassed;
  const cutoffTime = poll?.cutoff_time || "10:00";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTogglePoll = async () => {
    setIsToggling(true);
    const nextActive = !isPollActive;

    try {
      const res = await toggleMealPollAction(pgId, nextActive, cutoffTime);
      if (res.error) {
        showToast(`Failed: ${res.error}`);
      } else {
        showToast(
          nextActive
            ? `Lunch Poll Activated! Cut-off: ${cutoffTime} AM`
            : "Lunch Poll Deactivated"
        );
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to toggle poll"}`);
    } finally {
      setIsToggling(false);
    }
  };

  const handleChangeCutoff = async (newTime: string) => {
    setIsToggling(true);
    try {
      const res = await toggleMealPollAction(pgId, true, newTime);
      if (res.error) {
        showToast(`Failed: ${res.error}`);
      } else {
        showToast(`Cut-off time updated to ${newTime} AM!`);
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to update cut-off"}`);
    } finally {
      setIsToggling(false);
    }
  };

  const currentTabList: TenantHeadcountItem[] =
    activeTab === "yes"
      ? summary.yesList
      : activeTab === "no"
      ? summary.noList
      : summary.notAnsweredList;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* HEADER ROW WITH TOGGLE & STATUS */}
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black shrink-0 border border-amber-200/50">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                Dopahar Ka Khana (Lunch Poll)
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider ${
                  !isPollActive
                    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    : isExpired
                    ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                }`}
              >
                {!isPollActive
                  ? "Off / Inactive"
                  : isExpired
                  ? `Closed (${cutoffTime} AM passed)`
                  : "Live Voting Active"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Cut-off: <strong>{cutoffTime} AM IST</strong>
              </span>
              <span>•</span>
              <span>Food Wastage Prevention System</span>
            </p>
          </div>
        </div>

        {/* TOGGLE SWITCH BUTTON */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTogglePoll}
            disabled={isToggling}
            className={`px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
              isPollActive
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isToggling ? "Updating..." : isPollActive ? "Stop Poll" : "Start Lunch Poll"}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 text-indigo-900 dark:text-indigo-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CUT-OFF TIME PRESETS (WHEN ACTIVE) */}
      {isPollActive && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Preset Cut-off Deadline:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["09:30", "10:00", "10:30", "11:00"].map((timeStr) => (
              <button
                key={timeStr}
                type="button"
                onClick={() => handleChangeCutoff(timeStr)}
                disabled={isToggling || cutoffTime === timeStr}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold border transition active:scale-95 ${
                  cutoffTime === timeStr
                    ? "bg-indigo-600 text-white border-transparent shadow-xs"
                    : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                }`}
              >
                {timeStr} AM {timeStr === "10:00" ? "(Default)" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI METRIC CARDS (TOTAL YES, NO, NOT ANSWERED) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* YES: Total Food to prepare */}
        <div
          onClick={() => setActiveTab("yes")}
          className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
            activeTab === "yes"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              YES (Confirmed)
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
            {summary.totalYes}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
            🍽️ Plates to Prepare
          </div>
        </div>

        {/* NO: Opted Out */}
        <div
          onClick={() => setActiveTab("no")}
          className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
            activeTab === "no"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/20"
              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              NO (Opted Out)
            </span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
            {summary.totalNo}
          </div>
          <div className="text-[10px] text-rose-700 font-bold mt-0.5">
            ❌ Skip Lunch
          </div>
        </div>

        {/* NOT ANSWERED: Counted as NO */}
        <div
          onClick={() => setActiveTab("not_answered")}
          className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
            activeTab === "not_answered"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20"
              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Not Answered
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
            {summary.totalNotAnswered}
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-0.5">
            ⚠️ Counted as NO
          </div>
        </div>

        {/* Total Tenants */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Residents
            </span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
            {summary.totalTenants}
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-0.5">
            Active in PG
          </div>
        </div>
      </div>

      {/* WASTAGE SAVINGS NOTICE */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            Non-respondents ({summary.totalNotAnswered}) are auto-marked as <strong>NO</strong> after {cutoffTime} AM to stop meal wastage.
          </span>
        </span>
        <strong className="text-indigo-700 dark:text-indigo-300 shrink-0 font-black">
          Cook for {summary.totalYes} Only
        </strong>
      </div>

      {/* 3 HEADCOUNT SECTIONS / TABS */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab("yes")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === "yes"
                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>YES ({summary.totalYes})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("no")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === "no"
                ? "bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>NO ({summary.totalNo})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("not_answered")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === "not_answered"
                ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>NOT ANSWERED ({summary.totalNotAnswered})</span>
          </button>
        </div>

        {/* TENANT LIST CARDS */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto phone-scroll pr-0.5">
          {currentTabList.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Koi bhi tenant is category me nahi hai.
            </div>
          ) : (
            currentTabList.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {tenant.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {tenant.roomNumber} {tenant.bedName}
                    </span>
                  </div>
                  {tenant.phone && (
                    <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{tenant.phone}</span>
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                      tenant.vote === "yes"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : tenant.vote === "no"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {tenant.vote === "yes" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Eating Lunch</span>
                      </>
                    ) : tenant.vote === "no" ? (
                      <>
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Not Eating</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>No Response (Default NO)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
