export const runtime = "edge";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Building2, User, KeyRound } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";

export default async function DashboardSettingsPage() {
  const session = await getCurrentUserSession();

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              Account & PG Security Settings
            </h1>
            <p className="text-[11px] text-slate-400">
              {session.role === "owner"
                ? "PG Owner Account & Property Access Control"
                : "Staff / Warden Account & Security"}
            </p>
          </div>
        </div>
      </div>

      {/* Account Security Card Component */}
      <AccountSecurityCard
        role={session.role}
        currentEmail={session.email}
        currentPhone={session.phone}
      />

      {/* Active Property Scope Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Active Property Scope
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Property Brand
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {session.pg_name || "Royal Stay PG"}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Role Authority
            </span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 capitalize">
              {session.role === "admin" ? "Warden / Staff" : session.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
