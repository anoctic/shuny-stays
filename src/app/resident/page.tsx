import Link from "next/link";
import {
  BedDouble,
  Receipt,
  AlertCircle,
  Wifi,
  Megaphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function ResidentHomePage() {
  // STRICTLY this resident's data (Aditya Sharma)
  const residentBed = {
    room_number: "101",
    bed_code: "101-A",
    property_name: "Zenith Heights (Men's Coliving)",
    address: "45 Koramangala 5th Block, Bengaluru",
    sharing_type: "Double Sharing",
    is_ac: true,
    monthly_rent_paise: 950000,
    security_deposit_held_paise: 1900000,
    warden_name: "Ramesh Kumar",
    warden_phone: "+91 98111 22233",
    wifi_ssid: "Zenith_Coliving_5G",
    wifi_pass: "ZenithResident@2026",
  };

  const latestInvoice = {
    invoice_number: "INV-2026-11-001",
    billing_month: "November 2026",
    total_amount_paise: 995000,
    status: "paid" as const,
    paid_date: "02 Nov 2026",
  };

  const activeComplaint = {
    title: "Wi-Fi speed fluctuation in Room 101",
    category: "Wi-Fi",
    status: "open" as const,
    created_at: "Yesterday",
  };

  const pgNotice = {
    title: "Saturday Overhead Tank Cleaning",
    message:
      "Water supply will be paused from 10:00 AM to 12:30 PM this Saturday for scheduled tank sterilization. Drinking RO water remains unaffected.",
    date: "16 Nov 2026",
  };

  return (
    <div className="space-y-5">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-emerald-300 font-semibold">
            {residentBed.property_name}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Active Stay
          </span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Room {residentBed.room_number} • Bed {residentBed.bed_code}
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          {residentBed.sharing_type} • AC Room • {formatINR(residentBed.monthly_rent_paise)} / mo
        </p>
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-400">Security Deposit:</span>
          <span className="font-extrabold text-emerald-400">
            {formatINR(residentBed.security_deposit_held_paise)} Held
          </span>
        </div>
      </div>

      {/* Notice Board Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex items-start gap-3">
        <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Megaphone className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            PG Notice Board ({pgNotice.date})
          </span>
          <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 mt-0.5">
            {pgNotice.title}
          </h4>
          <p className="text-xs text-amber-900/90 dark:text-amber-300/90 mt-0.5 leading-snug">
            {pgNotice.message}
          </p>
        </div>
      </div>

      {/* Invoice Snapshot */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" />
            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              Current Month Rent ({latestInvoice.billing_month})
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Paid ✓
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatINR(latestInvoice.total_amount_paise)}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
              Invoice: {latestInvoice.invoice_number}
            </p>
          </div>
          <Link
            href="/resident/invoices"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View receipt <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Complaints Snapshot */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              My Active Support Ticket
            </span>
          </div>
          <Link
            href="/resident/complaints"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            Track All →
          </Link>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {activeComplaint.title}
            </p>
            <p className="text-[11px] text-zinc-500">
              Category: {activeComplaint.category} • Raised {activeComplaint.created_at}
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Open
          </span>
        </div>
      </div>

      {/* Amenities & Contact Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <Wifi className="h-4 w-4 text-indigo-600" />
            <span>Wi-Fi Details</span>
          </div>
          <p className="text-[11px] text-zinc-500 truncate">{residentBed.wifi_ssid}</p>
          <p className="text-xs font-mono font-bold text-indigo-600 truncate">
            {residentBed.wifi_pass}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <Phone className="h-4 w-4 text-emerald-600" />
            <span>Warden Desk</span>
          </div>
          <p className="text-[11px] text-zinc-500 truncate">{residentBed.warden_name}</p>
          <p className="text-xs font-mono font-bold text-emerald-600 truncate">
            {residentBed.warden_phone}
          </p>
        </div>
      </div>
    </div>
  );
}
