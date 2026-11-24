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
 ShieldAlert,
 History,
 Calendar,
 ChevronDown,
 ChevronUp,
} from "lucide-react";
import {
 MealPollSummary,
 MealPollHistoryItem,
 TenantHeadcountItem,
} from "@/types/meal-poll.types";
import {
 toggleMealPollAction,
 updateMealScheduleAction,
} from "@/app/actions/meal-polls";

interface AdminMealPollCardProps {
 summary: MealPollSummary;
 history?: MealPollHistoryItem[];
 pgId: string;
}

export function AdminMealPollCard({
 summary: initialSummary,
 history = [],
 pgId,
}: AdminMealPollCardProps) {
 const router = useRouter();
 const [summary, setSummary] = useState<MealPollSummary>(initialSummary);
 const [mainView, setMainView] = useState<"live" | "history">("live");
 const [activeTab, setActiveTab] = useState<"yes" | "no" | "not_answered">("yes");
 const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
 const [historySubTab, setHistorySubTab] = useState<"yes" | "no" | "not_answered">("yes");
 const [isUpdating, setIsUpdating] = useState(false);
 const [toastMessage, setToastMessage] = useState<string | null>(null);

 const poll = summary.poll;
 const isPollActive = poll?.is_active ?? true;
 const isExpired = summary.isCutoffPassed;
 const startTime = poll?.start_time || summary.startTime || "06:00";
 const cutoffTime = poll?.cutoff_time || summary.cutoffTime || "10:00";
 const scheduleStatus = summary.scheduleStatus || (isExpired ? "closed" : "open");

 const showToast = (msg: string) => {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(null), 3500);
 };

 const handleTogglePoll = async () => {
 setIsUpdating(true);
 const nextActive = !isPollActive;

 try {
 const res = await toggleMealPollAction(pgId, nextActive, startTime, cutoffTime);
 if (res.error) {
 showToast(`Failed: ${res.error}`);
 } else {
 showToast(
 nextActive
 ? `Lunch Poll Active! (${startTime} AM - ${cutoffTime} AM)`
 : "Lunch Poll Paused for today"
 );
 router.refresh();
 }
 } catch (err: any) {
 showToast(`Error: ${err?.message || "Failed to toggle poll"}`);
 } finally {
 setIsUpdating(false);
 }
 };

 const handleChangeStartTime = async (newStart: string) => {
 setIsUpdating(true);
 try {
 const res = await updateMealScheduleAction(pgId, newStart, cutoffTime);
 if (res.error) {
 showToast(`Failed: ${res.error}`);
 } else {
 showToast(`Start time updated to ${newStart} AM!`);
 router.refresh();
 }
 } catch (err: any) {
 showToast(`Error: ${err?.message || "Failed to update start time"}`);
 } finally {
 setIsUpdating(false);
 }
 };

 const handleChangeCutoff = async (newCutoff: string) => {
 setIsUpdating(true);
 try {
 const res = await updateMealScheduleAction(pgId, startTime, newCutoff);
 if (res.error) {
 showToast(`Failed: ${res.error}`);
 } else {
 showToast(`Cut-off deadline updated to ${newCutoff} AM!`);
 router.refresh();
 }
 } catch (err: any) {
 showToast(`Error: ${err?.message || "Failed to update cut-off"}`);
 } finally {
 setIsUpdating(false);
 }
 };

 // If Super Admin disabled the facility for this PG
 if (summary.isFacilityEnabled === false) {
 return (
 <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black shrink-0 border border-amber-200/50">
 <ShieldAlert className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-sm font-black text-slate-900">
 Meal Poll & Food Wastage Prevention
 </h2>
 <p className="text-xs text-amber-700 font-bold">
 Facility Disabled by Super Admin
 </p>
 </div>
 </div>
 <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
 Ye facility Super Admin dwara is PG ke liye deactivate ki gayi hai. Rozana automatic lunch headcount poll aur zero-wastage system chalu karne ke liye Super Admin se activate karwayein.
 </div>
 </div>
 );
 }

 const currentTabList: TenantHeadcountItem[] =
 activeTab === "yes"
 ? summary.yesList
 : activeTab === "no"
 ? summary.noList
 : summary.notAnsweredList;

 return (
 <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
 {/* TOP BAR: VIEW TOGGLE (TODAY'S POLL vs HISTORY) */}
 <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
 <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
 <button
 type="button"
 onClick={() => setMainView("live")}
 className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
 mainView === "live"
 ? "bg-white text-slate-900 shadow-xs"
 : "text-slate-500 hover:text-slate-900"
 }`}
 >
 <Utensils className="w-3.5 h-3.5 text-amber-500" />
 <span>Today&apos;s Live Poll</span>
 </button>

 <button
 type="button"
 onClick={() => setMainView("history")}
 className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
 mainView === "history"
 ? "bg-white text-slate-900 shadow-xs"
 : "text-slate-500 hover:text-slate-900"
 }`}
 >
 <History className="w-3.5 h-3.5 text-indigo-500" />
 <span>Poll History {history.length > 0 ? `(${history.length})` : ""}</span>
 </button>
 </div>

 {/* Status indicator on top right */}
 {mainView === "live" && (
 <span
 className={`px-2.5 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider shrink-0 border ${
 !isPollActive
 ? "bg-slate-100 text-slate-600 border-slate-200"
 : scheduleStatus === "upcoming"
 ? "bg-indigo-50 text-indigo-700 border-indigo-200"
 : scheduleStatus === "open"
 ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
 : "bg-slate-100 text-slate-700 border-slate-200"
 }`}
 >
 {!isPollActive
 ? "Paused"
 : scheduleStatus === "upcoming"
 ? `Opens at ${startTime} AM`
 : scheduleStatus === "open"
 ? "🟢 Live Voting Active"
 : `Closed (${cutoffTime} AM passed)`}
 </span>
 )}
 </div>

 {toastMessage && (
 <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold animate-in fade-in flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
 <span>{toastMessage}</span>
 </div>
 )}

 {/* ===================== VIEW 1: TODAY'S LIVE POLL ===================== */}
 {mainView === "live" ? (
 <div className="space-y-4">
 {/* HEADER ROW WITH SCHEDULE & PAUSE/RESUME */}
 <div className="flex items-center justify-between gap-3 flex-wrap">
 <div className="space-y-0.5">
 <h2 className="text-sm sm:text-base font-black text-slate-900">
 Dopahar Ka Khana (Lunch Headcount)
 </h2>
 <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
 <span className="flex items-center gap-1 font-semibold text-slate-600">
 <Clock className="w-3.5 h-3.5 text-indigo-500" />
 Auto-Schedule: <strong>{startTime} AM to {cutoffTime} AM IST</strong>
 </span>
 <span>•</span>
 <span className="text-amber-600 font-bold flex items-center gap-0.5">
 <Flame className="w-3 h-3" /> Zero Food Wastage
 </span>
 </p>
 </div>

 <button
 type="button"
 onClick={handleTogglePoll}
 disabled={isUpdating}
 className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs shrink-0 ${
 isPollActive
 ? "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
 : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
 }`}
 >
 <Power className="w-3.5 h-3.5" />
 <span>{isUpdating ? "Updating..." : isPollActive ? "Pause Today" : "Resume Poll"}</span>
 </button>
 </div>

 {/* TIME CONFIGURATION CONTROLS (START TIME & CUT-OFF TIME) */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
 {/* START TIME PRESETS */}
 <div className="space-y-1.5">
 <span className="text-[10.5px] font-extrabold text-slate-600 flex items-center gap-1">
 <Clock className="w-3 h-3 text-indigo-600" />
 <span>Auto-Start Time:</span>
 </span>
 <div className="flex items-center gap-1 flex-wrap">
 {["06:00", "06:30", "07:00", "07:30", "08:00"].map((timeStr) => (
 <button
 key={timeStr}
 type="button"
 onClick={() => handleChangeStartTime(timeStr)}
 disabled={isUpdating || startTime === timeStr}
 className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition active:scale-95 ${
 startTime === timeStr
 ? "bg-indigo-600 text-white border-transparent shadow-xs"
 : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
 }`}
 >
 {timeStr} AM {timeStr === "06:00" ? "(Def)" : ""}
 </button>
 ))}
 </div>
 </div>

 {/* CUT-OFF TIME PRESETS */}
 <div className="space-y-1.5">
 <span className="text-[10.5px] font-extrabold text-slate-600 flex items-center gap-1">
 <Clock className="w-3 h-3 text-amber-600" />
 <span>Cut-off Deadline:</span>
 </span>
 <div className="flex items-center gap-1 flex-wrap">
 {["09:30", "10:00", "10:30", "11:00"].map((timeStr) => (
 <button
 key={timeStr}
 type="button"
 onClick={() => handleChangeCutoff(timeStr)}
 disabled={isUpdating || cutoffTime === timeStr}
 className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition active:scale-95 ${
 cutoffTime === timeStr
 ? "bg-amber-600 text-white border-transparent shadow-xs"
 : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
 }`}
 >
 {timeStr} AM {timeStr === "10:00" ? "(Def)" : ""}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* KPI METRIC CARDS */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {/* YES: Total Food to prepare */}
 <div
 onClick={() => setActiveTab("yes")}
 className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
 activeTab === "yes"
 ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20"
 : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
 YES (Confirmed)
 </span>
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
 </div>
 <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-1">
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
 ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20"
 : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
 NO (Opted Out)
 </span>
 <XCircle className="w-3.5 h-3.5 text-rose-600" />
 </div>
 <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-1">
 {summary.totalNo}
 </div>
 <div className="text-[10px] text-rose-700 font-bold mt-0.5">
 ❌ Skip Lunch
 </div>
 </div>

 {/* NOT ANSWERED: Auto-considered NO */}
 <div
 onClick={() => setActiveTab("not_answered")}
 className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
 activeTab === "not_answered"
 ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500/20"
 : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
 Not Answered
 </span>
 <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
 </div>
 <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-1">
 {summary.totalNotAnswered}
 </div>
 <div className="text-[10px] text-amber-700 font-bold mt-0.5">
 ⚠️ Counted as NO
 </div>
 </div>

 {/* TOTAL RESIDENTS */}
 <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
 Total Residents
 </span>
 <Users className="w-3.5 h-3.5 text-slate-400" />
 </div>
 <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-1">
 {summary.totalTenants}
 </div>
 <div className="text-[10px] text-slate-500 font-bold mt-0.5">
 Active in PG
 </div>
 </div>
 </div>

 {/* 3 HEADCOUNT SECTIONS / TABS */}
 <div className="space-y-3">
 <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
 <button
 type="button"
 onClick={() => setActiveTab("yes")}
 className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
 activeTab === "yes"
 ? "bg-white text-emerald-700 shadow-xs"
 : "text-slate-500 hover:text-slate-900"
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
 ? "bg-white text-rose-700 shadow-xs"
 : "text-slate-500 hover:text-slate-900"
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
 ? "bg-white text-amber-700 shadow-xs"
 : "text-slate-500 hover:text-slate-900"
 }`}
 >
 <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
 <span>NOT ANSWERED ({summary.totalNotAnswered})</span>
 </button>
 </div>

 {/* TENANT LIST CARDS */}
 <div className="space-y-1.5 max-h-[320px] overflow-y-auto phone-scroll pr-0.5">
 {currentTabList.length === 0 ? (
 <div className="text-center py-6 text-slate-400 text-xs">
 Koi bhi tenant is category me nahi hai.
 </div>
 ) : (
 currentTabList.map((tenant) => (
 <div
 key={tenant.tenantId}
 className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
 >
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5">
 <span className="font-extrabold text-xs text-slate-900 truncate">
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
 ? "bg-emerald-100 text-emerald-800"
 : tenant.vote === "no"
 ? "bg-rose-100 text-rose-800"
 : "bg-amber-100 text-amber-800"
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
 ) : (
 /* ===================== VIEW 2: DATE-WISE MEAL POLL HISTORY ===================== */
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
 <Calendar className="w-4 h-4 text-indigo-600" />
 <span>Past Daily Poll Records (Tap any date to inspect)</span>
 </h3>
 <span className="text-[10px] text-slate-400 font-bold">
 Total {history.length} Days Recorded
 </span>
 </div>

 {history.length === 0 ? (
 <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
 Abhi tak koi purana poll history record nahi mila.
 </div>
 ) : (
 <div className="space-y-2.5">
 {history.map((record) => {
 const isExpanded = expandedHistoryId === record.id;
 const formattedDate = new Date(record.pollDate + "T12:00:00Z").toLocaleDateString(
 "en-IN",
 {
 weekday: "short",
 day: "2-digit",
 month: "short",
 year: "numeric",
 }
 );

 const listToDisplay =
 historySubTab === "yes"
 ? record.yesList
 : historySubTab === "no"
 ? record.noList
 : record.notAnsweredList;

 return (
 <div
 key={record.id}
 className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition"
 >
 {/* ACCORDION HEADER (COMPACT PREVIEW) */}
 <div
 onClick={() =>
 setExpandedHistoryId(isExpanded ? null : record.id)
 }
 className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition"
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
 <Calendar className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
 {formattedDate}
 </div>
 <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5 flex-wrap">
 <span>Schedule: {record.startTime} AM - {record.cutoffTime} AM</span>
 <span>•</span>
 <span>{record.totalTenants} Residents</span>
 </div>
 </div>
 </div>

 {/* QUICK METRICS CHIPS */}
 <div className="flex items-center gap-1.5 shrink-0">
 <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-[10.5px] border border-emerald-200">
 🍽️ {record.totalYes} Plates
 </span>
 <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px]">
 ❌ {record.totalNo} No
 </span>
 <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
 {isExpanded ? (
 <ChevronUp className="w-3.5 h-3.5" />
 ) : (
 <ChevronDown className="w-3.5 h-3.5" />
 )}
 </div>
 </div>
 </div>

 {/* EXPANDED FULL BREAKDOWN */}
 {isExpanded && (
 <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in">
 {/* 3 TABS FOR THIS HISTORICAL DATE */}
 <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
 <button
 type="button"
 onClick={() => setHistorySubTab("yes")}
 className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
 historySubTab === "yes"
 ? "bg-white text-emerald-700 shadow-2xs"
 : "text-slate-500"
 }`}
 >
 <CheckCircle2 className="w-3 h-3 text-emerald-600" />
 <span>YES ({record.totalYes})</span>
 </button>

 <button
 type="button"
 onClick={() => setHistorySubTab("no")}
 className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
 historySubTab === "no"
 ? "bg-white text-rose-700 shadow-2xs"
 : "text-slate-500"
 }`}
 >
 <XCircle className="w-3 h-3 text-rose-600" />
 <span>NO ({record.totalNo})</span>
 </button>

 <button
 type="button"
 onClick={() => setHistorySubTab("not_answered")}
 className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
 historySubTab === "not_answered"
 ? "bg-white text-amber-700 shadow-2xs"
 : "text-slate-500"
 }`}
 >
 <AlertCircle className="w-3 h-3 text-amber-600" />
 <span>Unanswered ({record.totalNotAnswered})</span>
 </button>
 </div>

 {/* LIST OF TENANTS FOR THIS TAB */}
 <div className="space-y-1.5 max-h-[240px] overflow-y-auto phone-scroll pr-0.5">
 {listToDisplay.length === 0 ? (
 <div className="text-center py-4 text-slate-400 text-xs">
 Koi bhi tenant is category me nahi tha.
 </div>
 ) : (
 listToDisplay.map((t) => (
 <div
 key={t.tenantId}
 className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2"
 >
 <div className="min-w-0">
 <div className="flex items-center gap-1.5">
 <span className="font-extrabold text-xs text-slate-900 truncate">
 {t.fullName}
 </span>
 <span className="text-[10px] text-slate-400 font-bold">
 {t.roomNumber} {t.bedName}
 </span>
 </div>
 {t.phone && (
 <div className="text-[10px] text-slate-400 font-mono mt-0.5">
 {t.phone}
 </div>
 )}
 </div>

 <div className="shrink-0 text-right">
 <span
 className={`inline-block px-2 py-0.5 rounded-md text-[9.5px] font-extrabold ${
 t.vote === "yes"
 ? "bg-emerald-50 text-emerald-700"
 : t.vote === "no"
 ? "bg-rose-50 text-rose-700"
 : "bg-amber-50 text-amber-700"
 }`}
 >
 {t.vote === "yes"
 ? "Confirmed Eating"
 : t.vote === "no"
 ? "Skipped"
 : "Defaulted to NO"}
 </span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}
 </div>
 );
}
