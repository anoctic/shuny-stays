import { Crown, Building2, Users, ShieldCheck, Activity, Database, ArrowRight } from "lucide-react";

export default function SuperAdminPage() {
  return (
    <div className="space-y-4">
      {/* Platform Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 text-white p-5 shadow-lg shadow-purple-500/15">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2">
          <Crown className="w-3.5 h-3.5 text-amber-300" /> Platform Governance
        </div>
        <h1 className="text-xl font-black tracking-tight">SaaS Command Center</h1>
        <p className="text-xs text-purple-100/90 mt-1">
          Platform-level metrics, active PG brand approvals, and database RLS health.
        </p>
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
        <div className="flex items-center justify-between mb-3">
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

      {/* Managed PG Brands */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Onboarded PG Brands
        </h2>

        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Stanza Living Residency</p>
              <p className="text-[10px] text-slate-400">Owner: Rajesh Sharma • 2 Buildings</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              Growth Tier
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Royal Stay PG</p>
              <p className="text-[10px] text-slate-400">Owner: Vikram Singh • 1 Building</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Starter Tier
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
