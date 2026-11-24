import { getCurrentUserSession } from "@/lib/auth/session";
import {
 getStaffList,
 getComplaints,
 getAuditLogs,
 getMessMenu,
} from "@/lib/data/rooms";
import { getPassesForManagement } from "@/lib/data/gate-passes";
import { OpsAndStaffExplorer } from "@/components/ops/OpsAndStaffExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StaffPage() {
 const session = await getCurrentUserSession();
 const staffList = await getStaffList(session.pg_id || undefined);
 const complaints = await getComplaints();
 const auditLogs = await getAuditLogs();
 const messMenu = await getMessMenu();
 const passes = await getPassesForManagement({ pgId: session.pg_id || undefined });

 return (
 <OpsAndStaffExplorer
      staffList={staffList}
      gatePasses={passes}
      complaints={complaints}
      auditLogs={auditLogs}
      messMenu={messMenu}
      userRole={session.role}
      initialSubTab="passes_staff"
      pgId={session.pg_id || undefined}
      pgName={session.pg_name || undefined}
    />
 );
}
