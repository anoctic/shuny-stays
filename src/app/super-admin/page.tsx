import { Crown, Building2, Users, ShieldCheck, Activity, Database, ArrowRight, Megaphone, Sparkles } from "lucide-react";
import { BroadcastCreatorModal } from "@/components/broadcasts/BroadcastCreatorModal";
import { getAllBroadcasts } from "@/lib/data/broadcasts";

export default async function SuperAdminPage() {
  const broadcasts = await getAllBroadcasts();

  return (
    <div className="space-y-4">
      {/* Platform Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 text-white p-5 shadow-lg shadow-purple-500/15">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2">
          <Crown className="w-3.5 h-3.5 text-amber-300" /> Platform Governance
        </div>
        <h1 className="text-xl font-black tracking-tight">SaaS Command Center</h1>
        <p className="text-xs text-purple-100/90 mt-1">
          Platform-level metrics, active PG brand approvals, and targeted platform broadcasts.
        </p>
      </div>

      {/* Broadcast Section */}
      <div className="bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-800/60 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Targeted Role Broadcasts
              </h2>
              <p className="text-[11px] text-slate-400">
                Announcements targeted to Owners, Wardens, or Tenants
              </p>
            </div>
          </div>
          <BroadcastCreatorModal initialBroadcasts={broadcasts} />
        </div>

        {/* Broadcasts Summary Pills */}
        <div className="space-y-2 mt-2">
          {broadcasts.slice(0, 3).map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between"
            >
              <div className="truncate pr-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                    b.priority === "urgent" ? "bg-rose-100 text-rose-800" : b.priority === "warning" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {b.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Target: {b.target_roles.join(", ")}
                  </span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white truncate">{b.title}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.message}</p>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                b.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
              }`}>
                {b.is_active ? "Active" : "Paused"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active PGs</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">12</div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">+2 pending approval</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Residents</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">480</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Across 24 buildings</p>
        </div>
      </div>

      {/* Database Security / RLS Health */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Supabase RLS Isolation
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Active
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          All 13 PostgreSQL tables enforce Row Level Security. Tenant data is isolated strictly to their assigned bed and building.
        </p>
      </div>
    </div>
  );
}
