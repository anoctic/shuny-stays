import { Activity, ShieldCheck, Database, CheckCircle2, Server, Cpu } from "lucide-react";
import { MOCK_CLUSTER_STATS, MOCK_PG_TABLES } from "@/lib/mock-data";

export default function SuperAdminHealthPage() {
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          Platform Health & Database Uptime
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Real-time PostgreSQL engine status, RLS policy enforcement, and infrastructure metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              DB Connection Pool
            </span>
            <Server className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {MOCK_CLUSTER_STATS.activeConnections} / {MOCK_CLUSTER_STATS.maxConnections}
          </p>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: "13%" }} />
          </div>
          <p className="text-[11px] text-zinc-400">Connection headroom: 87% available</p>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              Cache Hit Ratio
            </span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">
            {MOCK_CLUSTER_STATS.cacheHitRatio}%
          </p>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "99.4%" }} />
          </div>
          <p className="text-[11px] text-zinc-400">High in-memory buffer cache efficiency</p>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              RLS Policy Status
            </span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">
            100% Enforced
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>All 11 tables guarded by tenant membership</span>
          </div>
        </div>
      </div>

      {/* Database Node Info */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
          Engine Details
        </h3>
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-xs font-mono space-y-2">
          <div className="flex justify-between">
            <span className="text-zinc-500">PostgreSQL Engine:</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{MOCK_CLUSTER_STATS.postgresVersion}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Database Size:</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{MOCK_CLUSTER_STATS.databaseSize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Cluster Uptime:</span>
            <span className="text-emerald-600 font-bold">{MOCK_CLUSTER_STATS.uptime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Region:</span>
            <span className="text-zinc-800 dark:text-zinc-200">ap-south-1 (Mumbai, AWS)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
