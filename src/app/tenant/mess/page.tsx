import { Utensils, Clock } from "lucide-react";
import { getMessMenu } from "@/lib/data/rooms";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getTenantMealPollStatus } from "@/lib/data/meal-polls";
import { TenantMealPollCard } from "@/components/mess/TenantMealPollCard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantMessPage() {
 const session = await getCurrentUserSession();
 const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

 const [menuData, pollStatus] = await Promise.all([
 getMessMenu(),
 getTenantMealPollStatus(pgId, session.id, "lunch"),
 ]);

 const meals = [
 { meal: "Breakfast", time: "7:30 AM - 9:30 AM", items: menuData.breakfast, special: false },
 { meal: "Lunch", time: "12:30 PM - 2:30 PM", items: menuData.lunch, special: false },
 { meal: "Snacks", time: "5:00 PM - 6:00 PM", items: menuData.snacks, special: false },
 { meal: "Dinner", time: "8:00 PM - 10:00 PM", items: menuData.dinner, special: true },
 ];

 return (
 <div className="space-y-4">
 <div>
 <h1 className="text-lg font-black text-slate-900">Mess & Dining</h1>
 <p className="text-xs text-slate-400">Vote for lunch and view today's meal schedule</p>
 </div>

 {/* TENANT LUNCH HEADCOUNT POLL CARD */}
 {pollStatus.poll && (
 <TenantMealPollCard
 poll={pollStatus.poll}
 isCutoffPassed={pollStatus.isCutoffPassed}
 initialVote={pollStatus.tenantVote}
 tenantId={session.id}
 scheduleStatus={pollStatus.scheduleStatus}
 />
 )}

 {/* WEEKLY DINING SCHEDULE */}
 <div className="space-y-2.5">
 <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 pt-1">
 Daily Dining Schedule
 </h2>
 <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-3.5">
 {meals.map((m) => (
 <div
 key={m.meal}
 className={`p-3.5 rounded-2xl border shadow-xs hover:border-slate-300 transition ${
 m.special
 ? "bg-amber-50/60 border-amber-300"
 : "bg-white border-slate-200/80"
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
 <Utensils className="w-3.5 h-3.5 text-blue-600" /> {m.meal}
 </span>
 <span className="text-[10px] text-slate-400 flex items-center gap-1">
 <Clock className="w-3 h-3" /> {m.time}
 </span>
 </div>
 <p className="text-xs text-slate-700 font-medium mt-1">{m.items}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
