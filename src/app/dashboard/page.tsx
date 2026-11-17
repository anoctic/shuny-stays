import { cookies } from "next/headers";
import Link from "next/link";
import {
  Building2,
  BedDouble,
  Users,
  IndianRupee,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Utensils,
  Receipt,
  Sparkles,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getCurrentUserSession();
  const isOwner = session.role === "owner";

  const cookieStore = await cookies();
  const activeBuildingId = cookieStore.get("pg_active_building_id")?.value;

  const currentScopeText = activeBuildingId
    ? "Filtered: Block A - Krishna Bhawan (Boys)"
    : "Scope: All Buildings (Block A & Block B)";

  return (
    <div className="space-y-4">
      {/* Scope Badge Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {currentScopeText}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          Live RLS
        </span>
      </div>

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-5 shadow-lg shadow-blue-500/15">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-amber-300" />
            {isOwner ? "Owner Operations Portal" : "Warden & Staff Console"}
          </div>
          <h1 className="text-xl font-black tracking-tight">
            Hello, {session.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-blue-100/90 mt-1">
            {isOwner
              ? "Here is the operational and financial pulse across your properties today."
              : "Here are today's complaints, attendance, and mess schedule for your assigned blocks."}
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Occupancy Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Occupancy</span>
            <BedDouble className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            94%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">29/31</span> Beds Occupied
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: "94%" }} />
          </div>
        </div>

        {/* Complaints Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Complaints</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            2 Open
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
            1 High Priority WiFi
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: "40%" }} />
          </div>
        </div>

        {/* Financial Cards (Visible to Owner ONLY) */}
        {isOwner ? (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Rent Collected</span>
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                ₹2,85,000
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                92% of Nov billing cycle
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Dues</span>
                <Receipt className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                ₹25,000
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                3 residents overdue
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Tenants</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                29 Active
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                In assigned block
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider">Today&apos;s Mess</span>
                <Utensils className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                Dinner: Paneer
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                8:00 PM - 10:00 PM
              </p>
            </div>
          </>
        )}
      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <Link
            href="/dashboard/rooms"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <BedDouble className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Rooms
            </span>
          </Link>

          <Link
            href="/dashboard/tenants"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Tenants
            </span>
          </Link>

          <Link
            href="/dashboard/mess"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Mess Menu
            </span>
          </Link>

          <Link
            href={isOwner ? "/dashboard/finance" : "/dashboard/complaints"}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 transition-all text-center group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              {isOwner ? <IndianRupee className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {isOwner ? "Finance" : "Complaints"}
            </span>
          </Link>
        </div>
      </div>

      {/* Auto-Bed Generation Feature Callout */}
      <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <BedDouble className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs">
          <p className="font-bold text-blue-950 dark:text-blue-100">
            Smart Auto-Bed Generator Active
          </p>
          <p className="text-blue-800/80 dark:text-blue-300/80 text-[11px] mt-0.5 leading-relaxed">
            Whenever you add a Room with sharing type N (e.g. 2 or 3), PostgreSQL database triggers instantly generate Bed A, Bed B, and Bed C automatically.
          </p>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recent Activity
          </h2>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            View All
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Rent Paid by Aarav Patel
                </p>
                <p className="text-[10px] text-slate-400">Block A • Room 101 • Bed A</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              +₹10,650
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  WiFi Speed Complaint
                </p>
                <p className="text-[10px] text-slate-400">Room 101 • In Progress</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
              Medium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
