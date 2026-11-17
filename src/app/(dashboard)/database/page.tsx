import Link from "next/link";
import {
  Database,
  Layers,
  Terminal,
  ShieldCheck,
  Server,
  Activity,
  HardDrive,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { MOCK_CLUSTER_STATS, MOCK_PG_TABLES } from "@/lib/mock-data";

export default function DatabaseOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              PostgreSQL Management Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-semibold">
              Supabase Postgres
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Cluster health, connection pool telemetry, and multi-tenant schema introspection.
          </p>
        </div>

        <Link
          href="/database/query"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          Open SQL Query Console
        </Link>
      </div>

      {/* Cluster Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>DATABASE ENGINE</span>
            <Server className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="mt-3 text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
            PostgreSQL 15.6
          </p>
          <span className="text-[11px] text-zinc-400 block mt-1">
            Supabase Cloud Hosted
          </span>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>CONNECTION POOL</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {MOCK_CLUSTER_STATS.activeConnections}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              / {MOCK_CLUSTER_STATS.maxConnections} max
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            PgBouncer Transaction Mode
          </span>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>TOTAL DATABASE SIZE</span>
            <HardDrive className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {MOCK_CLUSTER_STATS.databaseSize}
          </p>
          <span className="text-[11px] text-zinc-400 block mt-1">
            Includes tables, indexes & WAL
          </span>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>BUFFER CACHE HIT RATIO</span>
            <Cpu className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-bold font-mono text-emerald-600">
            {MOCK_CLUSTER_STATS.cacheHitRatio}%
          </p>
          <span className="text-[11px] text-zinc-400 block mt-1">
            Optimal read performance
          </span>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/database/schema"
          className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center mb-4">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-600 transition-colors flex items-center justify-between">
            Schema & Tables
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Browse public schema tables, data types, constraints, foreign keys, and disk utilization.
          </p>
        </Link>

        <Link
          href="/database/query"
          className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-4">
            <Terminal className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
            SQL Query Console
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Run raw or parameterized SQL queries against your Postgres instance with tenant isolation.
          </p>
        </Link>

        <Link
          href="/database/rls"
          className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
            RLS Security Policies
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Audit Row Level Security rules to ensure complete data isolation between PG organizations.
          </p>
        </Link>
      </div>

      {/* Top Tables Overview */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
          PostgreSQL Public Schema Tables
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2.5">Table Name</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Estimated Rows</th>
                <th className="px-4 py-2.5">Total Disk Size</th>
                <th className="px-4 py-2.5">RLS Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {MOCK_PG_TABLES.map((t) => (
                <tr key={t.table_name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                    public.{t.table_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{t.table_type}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {t.row_count_estimate}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{t.total_size_pretty}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
