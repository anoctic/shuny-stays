import { QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getPassesForTenant } from "@/lib/data/gate-passes";
import { GatePassCard } from "@/components/passes/GatePassCard";
import { RequestPassModal } from "@/components/passes/RequestPassModal";

export default async function TenantPassesPage() {
  const session = await getCurrentUserSession();
  const passes = await getPassesForTenant(session.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/tenant"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white">
              My Outing & Gate Passes
            </h1>
            <p className="text-[11px] text-slate-400">Day Passes & Night Passes</p>
          </div>
        </div>

        <RequestPassModal
          userRole="tenant"
          defaultTenantName={session.full_name}
          defaultRoomNumber="Room 101 • Bed A"
        />
      </div>

      <div className="space-y-3">
        {passes.map((pass) => (
          <GatePassCard key={pass.id} pass={pass} viewerRole="tenant" />
        ))}
      </div>
    </div>
  );
}
