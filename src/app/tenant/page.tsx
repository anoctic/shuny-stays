import Link from "next/link";
import {
  BedDouble,
  CreditCard,
  Utensils,
  MessageSquareWarning,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Clock,
  QrCode,
  AlertCircle,
  Share2,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { getPassesForTenant } from "@/lib/data/gate-passes";
import { getTenantAttendanceStatus } from "@/lib/data/attendance";
import { getPgById } from "@/lib/data/pgs";
import { ActiveBroadcastBanner } from "@/components/broadcasts/ActiveBroadcastBanner";
import { GatePassCard } from "@/components/passes/GatePassCard";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { TenantAttendanceCard } from "@/components/attendance/TenantAttendanceCard";

export default async function TenantDashboardPage() {
  const session = await getCurrentUserSession();
  const broadcasts = await getActiveBroadcastsForRole("tenant");
  const passes = await getPassesForTenant(session.id);
  const attendance = await getTenantAttendanceStatus(session.id);
  const pg = await getPgById(session.pg_id || "00000000-0000-0000-0000-000000000001");

  const brandColor = pg?.primary_color || "#4F46E5";
  const brandName = pg?.name || "Royal Stay PG";

  return (
    <div className="space-y-4">
      {/* Targeted Platform Broadcast Banner (Super Admin announcements for Tenants) */}
      <ActiveBroadcastBanner broadcasts={broadcasts} userRole="tenant" />

      {/* Resident Welcome Card with Dynamic PG Branding */}
      <div
        className="relative overflow-hidden rounded-3xl text-white p-5 shadow-lg shadow-indigo-500/15 transition-colors"
        style={{
          background: `linear-gradient(135deg, ${brandColor} 0%, #1e1b4b 100%)`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {brandName} Resident PWA
            </div>
            {pg?.logo_url && (
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/20 backdrop-blur-md border border-white/20">
                <img src={pg.logo_url} alt={brandName} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <h1 className="text-xl font-black tracking-tight">
            Welcome, {session.full_name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-blue-100/90 mt-1">
            Track your stay, apply for Day & Night Outing Passes, and view mess schedule.
          </p>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* TODAY'S LIVE ATTENDANCE CARD */}
      <TenantAttendanceCard
        todayStatus={attendance.todayStatus}
        markedAt={attendance.markedAt}
        markedBy={attendance.markedBy}
        history={attendance.history}
      />

      {/* DUAL DAY PASS & NIGHT PASS SYSTEM SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Outing & Gate Passes
              </h2>
              <p className="text-[10px] text-slate-400">
                Yellow: Pending Owner • Green: Approved & Active
              </p>
            </div>
          </div>
          <RequestPassModal
            userRole="tenant"
            defaultTenantName={session.full_name}
            defaultRoomNumber={session.room_id ? "Room 101 • Bed A" : "Room 101"}
          />
        </div>

        {/* Passes List (Yellow, Green, Red) */}
        <div className="space-y-3">
          {passes.map((pass) => (
            <GatePassCard key={pass.id} pass={pass} viewerRole="tenant" />
          ))}
        </div>
      </div>

      {/* Bed Allocation Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Bed & Room
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Active Resident
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Room 101 • Bed A
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Block A - Krishna Bhawan (Boys Wing)
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Double Sharing • AC • Attached Bath
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Rent Due Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Upcoming Rent Due
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Due Dec 05
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹10,650
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rent ₹9,500 + Electricity ₹650 + Maintenance ₹500
            </p>
          </div>
        </div>

        <Link
          href="/tenant/dues"
          className="mt-3.5 w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] font-bold text-xs text-white shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
        >
          <CreditCard className="w-4 h-4" />
          Pay Rent / Upload UPI Screenshot
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Today's Mess Menu Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Today&apos;s Mess Schedule
            </h2>
          </div>
          <Link href="/tenant/mess" className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
            Full Menu
          </Link>
        </div>

        <div className="space-y-2">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Dinner (8:00 PM - 10:00 PM)</p>
              <p className="text-[11px] text-slate-500">Paneer Butter Masala, Dal Tadka, Roti, Gulab Jamun</p>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              Special
            </span>
          </div>
        </div>
      </div>

      {/* Subtle White-Label Footer: Powered by ShunyOS */}
      <footer className="pt-4 pb-2 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>Powered by</span>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
            ShunyOS
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Cloud-Native Multi-Tenant PG & Hostel Operating System
        </p>
      </footer>
    </div>
  );
}
