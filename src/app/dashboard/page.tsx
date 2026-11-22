import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBuildings } from "@/lib/data/rooms";
import { getPassesForManagement } from "@/lib/data/gate-passes";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { getMealPollSummary } from "@/lib/data/meal-polls";
import { ActiveBroadcastBanner } from "@/components/broadcasts/ActiveBroadcastBanner";
import { AdminMealPollCard } from "@/components/mess/AdminMealPollCard";
import { RoomsExplorer } from "@/components/pg/RoomsExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getCurrentUserSession();
  const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

  const [buildings, passes, broadcasts, pollSummary] = await Promise.all([
    getAllBuildings(),
    getPassesForManagement({ pgId: session.pg_id || undefined }),
    getActiveBroadcastsForRole(session.role),
    getMealPollSummary(pgId),
  ]);

  const activePasses = passes.map((p) => ({
    tenantId: p.tenant_id,
    passType: p.pass_type,
    status: p.approval_status,
  }));

  return (
    <div className="space-y-3.5">
      {/* Targeted Platform Broadcast Banner */}
      <ActiveBroadcastBanner broadcasts={broadcasts} userRole={session.role} />

      {/* Lunch Headcount Poll & Wastage Prevention Card */}
      <AdminMealPollCard summary={pollSummary} pgId={pgId} />

      {/* 5-Level Rooms & Beds Explorer */}
      <RoomsExplorer
        initialBuildings={buildings}
        userRole={session.role}
        activePasses={activePasses}
      />
    </div>
  );
}
