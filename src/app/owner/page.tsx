import Link from "next/link";
import {
  Building2,
  BedDouble,
  Users,
  Receipt,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { MOCK_ROOMS, MOCK_COMPLAINTS, MOCK_PROPERTIES } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { BedOccupancyGrid } from "@/components/pg/BedOccupancyGrid";
import { getCurrentUserSession } from "@/lib/auth/session";

export default async function OwnerDashboardPage() {
  const session = await getCurrentUserSession();

  // Metrics specific to this owner's organization
  const totalBeds = 52;
  const occupiedBeds = 47;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const totalMonthlyBilled = 2556000;
  const totalCollected = 1850000;
  const totalPending = totalMonthlyBilled - totalCollected;

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {session.organization_name || "Zenith Luxury PG"} Operations
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time occupancy, monthly rent collections, and resident operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/owner/rooms"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <BedDouble className="h-3.5 w-3.5" />
            Manage Inventory
          </Link>
          <Link
            href="/owner/complaints"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            Complaints (2)
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Occupancy */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Bed Occupancy
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BedDouble className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {occupancyRate}%
            </span>
            <span className="text-xs text-zinc-500">
              ({occupiedBeds}/{totalBeds} beds)
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="font-semibold">5 vacant beds available</span>
          </div>
        </div>

        {/* KPI 2: Collections */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Rent Collected
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatINR(totalCollected)}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {formatINR(totalPending)} pending collection
          </p>
        </div>

        {/* KPI 3: Residents */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Active Residents
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              3
            </span>
            <span className="text-xs text-emerald-600 font-semibold">100% KYC Verified</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Across 2 properties</p>
        </div>

        {/* KPI 4: Complaints */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Open Complaints
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {MOCK_COMPLAINTS.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">Needs Attention</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">1 Wi-Fi • 1 Plumbing</p>
        </div>
      </div>

      {/* Bed Occupancy Grid */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Live Bed Inventory & Occupancy
            </h2>
            <p className="text-xs text-zinc-500">
              Real-time room status across properties for {session.organization_name}
            </p>
          </div>
          <Link
            href="/owner/rooms"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
          >
            Manage inventory <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <BedOccupancyGrid rooms={MOCK_ROOMS} />
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/owner/properties"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 transition shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Properties ({MOCK_PROPERTIES.length})
              </p>
              <p className="text-xs text-zinc-500">Koramangala & Indiranagar</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </Link>

        <Link
          href="/owner/rent"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 transition shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Rent & Ledger
              </p>
              <p className="text-xs text-zinc-500">Track paid & pending invoices</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </Link>

        <Link
          href="/owner/residents"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 transition shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Residents Directory
              </p>
              <p className="text-xs text-zinc-500">Tenant KYC & Leases</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400" />
        </Link>
      </div>
    </div>
  );
}
