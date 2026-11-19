export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";

export default async function SuperAdminSettingsPage() {
  const session = await getCurrentUserSession();

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Link
            href="/super-admin"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <KeyRound className="w-5 h-5 text-purple-600" />
              Super Admin Platform & Login Security
            </h1>
            <p className="text-[11px] text-slate-400">
              Manage root governance credentials and multi-tenant access authentication.
            </p>
          </div>
        </div>
      </div>

      {/* Account Security Card Component */}
      <AccountSecurityCard
        role="super_admin"
        currentEmail={session.email || "superadmin@apnapg.com"}
        currentPhone={session.phone || "9999900001"}
      />
    </div>
  );
}
