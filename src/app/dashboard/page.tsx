import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBuildings } from "@/lib/data/rooms";
import { getPassesForManagement } from "@/lib/data/gate-passes";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { ActiveBroadcastBanner } from "@/components/broadcasts/ActiveBroadcastBanner";
import { RoomsExplorer } from "@/components/pg/RoomsExplorer";

export const runtime = "edge";

export default async function DashboardPage() {
  const session = await getCurrentUserSession();
  const buildings = await getAllBuildings();
  const passes = await getPassesForManagement({ pgId: session.pg_id || undefined });
  const broadcasts = await getActiveBroadcastsForRole(session.role);

  const activePasses = passes.map((p) => ({
    tenantId: p.tenant_id,
    passType: p.pass_type,
    status: p.approval_status,
  }));

  return (
    <div className="space-y-3.5">
      {/* Targeted Platform Broadcast Banner */}
      <ActiveBroadcastBanner broadcasts={broadcasts} userRole={session.role} />

      {/* 5-Level Rooms & Beds Explorer */}
      <RoomsExplorer
        initialBuildings={buildings}
        userRole={session.role}
        activePasses={activePasses}
      />
    </div>
  );
}
