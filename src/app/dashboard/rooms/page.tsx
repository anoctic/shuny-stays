import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBuildings } from "@/lib/data/rooms";
import { getPassesForManagement } from "@/lib/data/gate-passes";
import { RoomsExplorer } from "@/components/pg/RoomsExplorer";

export default async function RoomsPage() {
  const session = await getCurrentUserSession();
  const buildings = await getAllBuildings();
  const passes = await getPassesForManagement({ pgId: session.pg_id || undefined });

  const activePasses = passes.map((p) => ({
    tenantId: p.tenant_id,
    passType: p.pass_type,
    status: p.approval_status,
  }));

  return (
    <RoomsExplorer
      initialBuildings={buildings}
      userRole={session.role}
      activePasses={activePasses}
    />
  );
}
