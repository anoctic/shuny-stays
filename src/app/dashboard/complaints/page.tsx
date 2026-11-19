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
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Resident Complaints</h1>
        <p className="text-xs text-slate-400">Live building tickets & resolution status from Supabase</p>
      </div>

      {complaints.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <MessageSquareWarning className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">No active complaints</p>
          <p className="text-[11px] text-slate-400">All resident tickets are resolved and up to date</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {c.cat} • {c.room} • {c.tenantName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === "Open"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                      : c.status === "In Progress"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{c.desc}</p>
              {c.note && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
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
