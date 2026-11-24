import { Utensils, Clock, Sparkles } from "lucide-react";
import { getMessMenu } from "@/lib/data/rooms";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getMealPollSummary } from "@/lib/data/meal-polls";
import { AdminMealPollCard } from "@/components/mess/AdminMealPollCard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardMessPage() {
 const session = await getCurrentUserSession();
 const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

 const [menuData, pollSummary] = await Promise.all([
 getMessMenu(),
 getMealPollSummary(pgId),
 ]);

 const meals = [
 { meal: "Breakfast", time: "7:30 AM - 9:30 AM", items: menuData.breakfast, special: false },
 { meal: "Lunch", time: "12:30 PM - 2:30 PM", items: menuData.lunch, special: false },
 { meal: "Snacks", time: "5:00 PM - 6:00 PM", items: menuData.snacks || "Tea & Samosa", special: false },
 { meal: "Dinner", time: "8:00 PM - 10:00 PM", items: menuData.dinner, special: true },
 ];

 return (
 <div className="space-y-4">
 <div>
 <h1 className="text-lg font-black text-slate-900">Mess & Dining Management</h1>
 <p className="text-xs text-slate-400">Headcount poll & live weekly schedule</p>
 </div>

 {/* INTERACTIVE LUNCH HEADCOUNT POLL CARD */}
 <AdminMealPollCard summary={pollSummary} pgId={pgId} />

 {/* WEEKLY DINING SCHEDULE */}
 <div className="space-y-2.5">
 <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 pt-1">
 Standard Daily Schedule
 </h2>
 {meals.map((m) => (
 <div
 key={m.meal}
 className={`p-3.5 rounded-2xl border shadow-xs ${
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
 );
}
