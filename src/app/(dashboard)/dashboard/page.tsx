import Link from "next/link";
import {
  Building2,
  BedDouble,
  Users,
  Receipt,
  AlertCircle,
  Database,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  Terminal,
  Lock,
} from "lucide-react";
import {
  MOCK_PROPERTIES,
  MOCK_ROOMS,
  MOCK_INVOICES,
  MOCK_COMPLAINTS,
  MOCK_CLUSTER_STATS,
  MOCK_PG_TABLES,
} from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { BedOccupancyGrid } from "@/components/pg/BedOccupancyGrid";
import { getCurrentUserSession } from "@/lib/auth/session";

export default async function DashboardOverviewPage() {
  const session = await getCurrentUserSession();

  const totalBeds = 52;
  const occupiedBeds = 47;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const totalMonthlyBilled = 995000 + 782000 + 779000;
  const totalCollected = 995000;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {session.is_super_admin
                ? "Platform Governance & Database Console"
                : `${session.organization_name || "PG Hostels"} Operations`}
            </h1>
            {!session.is_super_admin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                <Lock className="h-2.5 w-2.5" />
                Membership Locked
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Logged in as <strong className="font-semibold text-zinc-700 dark:text-zinc-200">{session.full_name}</strong> (Role: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{session.role}</span>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {session.is_super_admin ? (
            <>
              <Link
                href="/admin/organizations"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-zinc-900 text-cyan-800 dark:text-cyan-300 shadow-sm transition-colors"
              >
                <Building2 className="h-3.5 w-3.5" />
                Manage Organizations
              </Link>
              <Link
                href="/database/query"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-colors"
              >
                <Terminal className="h-3.5 w-3.5" />
                Launch SQL Console
              </Link>
            </>
          ) : (
            <Link
              href="/complaints"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {session.role === "resident" ? "My Complaints" : "Manage Complaints"}
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Bed Occupancy
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {occupancyRate}%
            </span>
            <span className="text-xs text-zinc-500">
              ({occupiedBeds}/{totalBeds} beds)
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>High occupancy this month</span>
          </div>
        </div>

        {/* KPI 2: Collections */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Rent Collected
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatINR(totalCollected)}
            </span>
            <span className="text-xs text-zinc-500">
              / {formatINR(totalMonthlyBilled)}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {formatINR(totalMonthlyBilled - totalCollected)} pending collection
          </div>
        </div>

        {/* KPI 3: Complaints */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Open Complaints
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {MOCK_COMPLAINTS.length}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Needs Attention
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            1 plumbing • 1 wifi issue
          </div>
        </div>

        {/* KPI 4: Security / Isolation */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              RLS Isolation
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              Active
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500 font-mono">
            {session.is_super_admin ? "Role: Platform Super Admin" : "Tenant: Membership Bound"}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Bed Occupancy Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Live Bed Inventory & Occupancy
              </h2>
              <p className="text-xs text-zinc-500">
                Real-time room status across properties for this tenant
              </p>
            </div>
            <Link
              href="/rooms"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
            >
              Manage all rooms <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <BedOccupancyGrid rooms={MOCK_ROOMS} />
        </div>

        {/* Right Col: PostgreSQL DB Manager (Super Admin Only) OR Organization Details */}
        <div className="space-y-4">
          {session.is_super_admin ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-600" />
                    PostgreSQL Studio
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Schema inspection & RLS tenant security
                  </p>
                </div>
                <Link
                  href="/database/schema"
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-500 flex items-center gap-1"
                >
                  View schema <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4 shadow-sm">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      RLS Isolation Active
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 mt-0.5 text-[11px]">
                      Organization filtered by membership user_id
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    Top Postgres Tables
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {MOCK_PG_TABLES.slice(0, 4).map((table) => (
                      <div
                        key={table.table_name}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          public.{table.table_name}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                          <span>{table.row_count_estimate} rows</span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                            {table.total_size_pretty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/database/query"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-cyan-50/60 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 text-xs font-semibold hover:bg-cyan-100 transition-colors"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  Open Interactive SQL Playground
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    My Organization
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Tenant isolation enforced by membership
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {session.organization_name}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Koramangala, Bengaluru
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Your Role:</span>
                    <span className="font-mono font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                      {session.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Organization ID:</span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-300 text-[11px]">
                      {session.organization_id?.slice(0, 13)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Database Access:</span>
                    <span className="text-zinc-400 text-[11px]">
                      Restricted to Super Admin
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
