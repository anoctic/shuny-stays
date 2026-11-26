export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Building2, User, KeyRound } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBuildings } from "@/lib/data/rooms";
import { getPgById } from "@/lib/data/pgs";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { PgWifiAndTemplatesCard } from "@/components/settings/PgWifiAndTemplatesCard";

export default async function DashboardSettingsPage() {
 const session = await getCurrentUserSession();
 const [buildings, dbPg] = await Promise.all([
 getAllBuildings(),
 session.pg_id ? getPgById(session.pg_id) : Promise.resolve(null),
 ]);
 const canEditTemplates = session.role === "owner" || session.role === "super_admin";

 return (
 <div className="space-y-4 max-w-2xl mx-auto pb-8">
 {/* Page Header */}
 <div className="flex items-center justify-between pb-3 border-b border-slate-200">
 <div className="flex items-center gap-2.5">
 <Link
 href="/dashboard"
 className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
 >
 <ArrowLeft className="w-4 h-4" />
 </Link>
 <div>
 <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
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

 {/* Floor-Wise Wi-Fi Credentials & Custom WhatsApp Message Templates */}
 <PgWifiAndTemplatesCard
 pgId={dbPg?.id || session.pg_id || ""}
 pgName={dbPg?.name || session.pg_name || "Royal Stay PG"}
 buildings={buildings}
 initialWelcomeTemplate={dbPg?.welcome_message_template}
 initialCustomTemplate={dbPg?.custom_message_template}
 canEdit={canEditTemplates}
 />

 {/* Active Property Scope Card */}
 <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
 <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
 <Building2 className="w-4 h-4 text-indigo-600" />
 Active Property Scope
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
 <div className="p-3 rounded-2xl bg-slate-50">
 <span className="text-[10px] text-slate-400 font-bold uppercase block">
 Property Brand
 </span>
 <span className="font-extrabold text-slate-900">
 {session.pg_name || "Royal Stay PG"}
 </span>
 </div>
 <div className="p-3 rounded-2xl bg-slate-50">
 <span className="text-[10px] text-slate-400 font-bold uppercase block">
 Role Authority
 </span>
 <span className="font-extrabold text-indigo-600 capitalize">
 {session.role === "admin" ? "Warden / Staff" : session.role}
 </span>
 </div>
 </div>
 </div>
 </div>
 );
}
