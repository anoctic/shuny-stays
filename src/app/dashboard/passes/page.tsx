import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getPassesForManagement } from "@/lib/data/gate-passes";
import { getAllBroadcasts } from "@/lib/data/broadcasts";
import { GatePassCard } from "@/components/passes/GatePassCard";
import { BroadcastCreatorModal } from "@/components/broadcasts/BroadcastCreatorModal";
import { PassTemplateModal } from "@/components/passes/PassTemplateModal";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPassesPage() {
  const session = await getCurrentUserSession();
  const [passes, broadcasts] = await Promise.all([
    getPassesForManagement({ pgId: session.pg_id || undefined }),
    getAllBroadcasts(),
  ]);

  return (
    <div className="space-y-4">
      <RealtimeSyncSubscriber tables={["gate_passes", "tenants", "platform_broadcasts"]} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900">
              Resident Gate Passes & Broadcasts
            </h1>
            <p className="text-[11px] text-slate-500">
              {session.role === "owner" ? "Owner 1-Tap Final Approvals" : "Warden Verification Desk"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BroadcastCreatorModal initialBroadcasts={broadcasts} />
          <PassTemplateModal pgId={session.pg_id} />
        </div>
      </div>

      <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3.5">
        {passes.map((pass) => (
          <GatePassCard key={pass.id} pass={pass} viewerRole={session.role} />
        ))}
      </div>
    </div>
  );
}
