import { AlertCircle, Clock, CheckCircle2, MessageSquareWarning } from "lucide-react";
import { getComplaints } from "@/lib/data/rooms";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ComplaintsPage() {
 const complaints = await getComplaints();

 return (
 <div className="space-y-4">
 <div>
 <h1 className="text-lg font-black text-slate-900">Resident Complaints</h1>
 <p className="text-xs text-slate-400">Live building tickets & resolution status from Supabase</p>
 </div>

 {complaints.length === 0 ? (
 <div className="p-8 text-center rounded-2xl bg-white border border-slate-200">
 <MessageSquareWarning className="w-9 h-9 text-slate-300 mx-auto mb-2" />
 <p className="text-xs font-extrabold text-slate-700">No active complaints</p>
 <p className="text-[11px] text-slate-400">All resident tickets are resolved and up to date</p>
 </div>
 ) : (
 <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3.5">
 {complaints.map((c) => (
 <div
 key={c.id}
 className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
 {c.cat} • {c.room} • {c.tenantName}
 </span>
 <span
 className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
 c.status === "Open"
 ? "bg-rose-100 text-rose-800"
 : c.status === "In Progress"
 ? "bg-amber-100 text-amber-800"
 : "bg-emerald-100 text-emerald-800"
 }`}
 >
 {c.status}
 </span>
 </div>
 <p className="text-xs font-bold text-slate-900">{c.desc}</p>
 {c.note && (
 <p className="text-[11px] text-slate-500 mt-1 italic">
 Note: {c.note}
 </p>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
