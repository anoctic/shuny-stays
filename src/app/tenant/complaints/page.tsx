"use client";

import { MessageSquareWarning, Plus, CheckCircle2, Clock } from "lucide-react";

export default function TenantComplaintsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Complaints</h1>
          <p className="text-xs text-slate-400">Track and submit maintenance issues</p>
        </div>
        <button
          onClick={() => alert("Raise ticket flow in Step 3.")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Issue
        </button>
      </div>

      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            In Progress
          </span>
          <span className="text-[10px] text-slate-400">Raised Yesterday</span>
        </div>
        <h2 className="text-xs font-bold text-slate-900 dark:text-white">WiFi speed slow in Room 101</h2>
        <p className="text-[11px] text-slate-500">
          Warden Manoj Kumar has assigned technician to check the 1st floor router.
        </p>
      </div>
    </div>
  );
}
