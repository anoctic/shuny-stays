import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ComplaintsPage() {
  const complaints = [
    { title: "WiFi High Ping in Room 101", category: "WiFi", room: "Room 101", status: "in_progress", priority: "medium" },
    { title: "Geyser not heating in Room 204", category: "Electrical", room: "Room 204", status: "open", priority: "high" },
    { title: "Tap leakage in 1st floor common washroom", category: "Plumbing", room: "Common Area", status: "resolved", priority: "low" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Resident Complaints</h1>
        <p className="text-xs text-slate-400">Assigned building tickets & resolution status</p>
      </div>

      <div className="space-y-2.5">
        {complaints.map((c) => (
          <div key={c.title} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {c.category} • {c.room}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                c.status === "open" ? "bg-rose-100 text-rose-800" : c.status === "in_progress" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {c.status}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
