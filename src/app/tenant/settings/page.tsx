export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck, Home } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";

export default async function TenantSettingsPage() {
 const session = await getCurrentUserSession();

 return (
 <div className="space-y-4 max-w-2xl mx-auto pb-8">
 {/* Header */}
 <div className="flex items-center justify-between pb-3 border-b border-slate-200">
 <div className="flex items-center gap-2.5">
 <Link
 href="/tenant"
 className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
 >
 <ArrowLeft className="w-4 h-4" />
 </Link>
 <div>
 <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
 <KeyRound className="w-5 h-5 text-indigo-600" />
 Resident Account & Security
 </h1>
 <p className="text-[11px] text-slate-400">
 Manage your personal tenant sign-in mobile number, email, and password.
 </p>
 </div>
 </div>
 </div>

 {/* Account Security Card Component */}
 <AccountSecurityCard
 role="tenant"
 currentEmail={session.email}
 currentPhone={session.phone}
 />
 </div>
 );
}
