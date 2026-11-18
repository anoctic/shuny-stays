import { cookies } from "next/headers";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getTodayAttendanceSheet } from "@/lib/data/attendance";
import { AttendanceSheet } from "@/components/attendance/AttendanceSheet";

export default async function AttendancePage() {
  const session = await getCurrentUserSession();
  const cookieStore = await cookies();
  const activeBuildingId = cookieStore.get("pg_active_building_id")?.value;

  const buildingsData = await getTodayAttendanceSheet({
    pgId: session.pg_id || undefined,
    buildingId: activeBuildingId || undefined,
    userRole: session.role,
    assignedBuildingIds: session.assigned_building_ids || [],
  });

  return (
    <AttendanceSheet
      initialBuildings={buildingsData}
      userRole={session.role}
      userName={session.full_name}
      assignedBuildingIds={session.assigned_building_ids || []}
    />
  );
}
