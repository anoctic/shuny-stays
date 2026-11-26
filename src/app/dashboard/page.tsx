import Link from "next/link";
import { Utensils } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBuildings } from "@/lib/data/rooms";
import { getPassesForManagement } from "@/lib/data/gate-passes";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { getMealPollSummary } from "@/lib/data/meal-polls";
import { ActiveBroadcastBanner } from "@/components/broadcasts/ActiveBroadcastBanner";
import { RoomsExplorer } from "@/components/pg/RoomsExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
 const session = await getCurrentUserSession();
 const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

 const [buildings, passes, broadcasts, lunchSummary, dinnerSummary] = await Promise.all([
 getAllBuildings(),
 getPassesForManagement({ pgId: session.pg_id || undefined }),
 getActiveBroadcastsForRole(session.role),
 getMealPollSummary(pgId, "lunch"),
 getMealPollSummary(pgId, "dinner"),
 ]);

 const activePasses = passes.map((p) => ({
 tenantId: p.tenant_id,
 passType: p.pass_type,
 status: p.approval_status,
 }));

 const isAfternoonOrEvening = new Date().getHours() >= 12;
 const primarySummary = isAfternoonOrEvening ? dinnerSummary : lunchSummary;
 const primaryLabel = isAfternoonOrEvening ? "Raat Ka Khana (Dinner)" : "Dopahar Ka Khana (Lunch)";

 return (
 <div className="space-y-3.5">
 {/* Targeted Platform Broadcast Banner */}
 <ActiveBroadcastBanner broadcasts={broadcasts} userRole={session.role} />

 {/* Daily Meal Headcount Live Banner (Lunch + Dinner) */}
 {lunchSummary.isFacilityEnabled !== false && (
 <Link
 href="/dashboard/meal-poll"
 className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-2 transition hover:bg-amber-100/50 shadow-2xs group"
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
 <Utensils className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <div className="text-xs font-black text-slate-900 truncate">
 {primaryLabel}: {primarySummary.totalYes} Eating • {primarySummary.totalNo} Skip
 </div>
 <div className="text-[10px] text-slate-500 truncate">
 ☀️ Lunch: {lunchSummary.totalYes} Yes ({lunchSummary.totalNo} No) • 🌙 Dinner: {dinnerSummary.totalYes} Yes ({dinnerSummary.totalNo} No)
 </div>
 </div>
 </div>
 <span className="text-[10.5px] font-extrabold text-amber-700 flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition">
 <span>Open Meal Poll</span>
 <span>→</span>
 </span>
 </Link>
 )}

 {/* 5-Level Rooms & Beds Explorer */}
 <RoomsExplorer
 initialBuildings={buildings}
 userRole={session.role}
 activePasses={activePasses}
 />
 </div>
 );
}
