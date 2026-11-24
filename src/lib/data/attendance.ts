import {
 AttendanceLog,
 AttendanceStatus,
 BedAttendanceItem,
 UserRole,
} from "@/types/schema.types";
import { createClient } from "@/lib/supabase/server";
import { getPassesForManagement } from "./gate-passes";

/**
 * Fetch hierarchical attendance sheet for today directly from Supabase!
 * Auto-links with active gate passes for today.
 */
export async function getTodayAttendanceSheet(options?: {
 pgId?: string;
 buildingId?: string | null;
 userRole?: UserRole;
 assignedBuildingIds?: string[];
}) {
 const todayStr = new Date().toISOString().split("T")[0];
 const supabase = await createClient();

 // 1. Fetch active gate passes for today to auto-link
 const passes = await getPassesForManagement();
 const activePassMap = new Map<string, { passType: "day_pass" | "night_pass"; passNumber: string; status: string }>();

 passes.forEach((p) => {
 if (p.approval_status !== "rejected") {
 const isDayMatch = p.outing_date === todayStr;
 const isNightMatch = todayStr >= p.outing_date && todayStr <= p.expected_return_date;

 if ((p.pass_type === "day_pass" && isDayMatch) || (p.pass_type === "night_pass" && isNightMatch)) {
 activePassMap.set(p.tenant_id, {
 passType: p.pass_type,
 passNumber: p.pass_number,
 status: p.approval_status,
 });
 }
 }
 });

 // 2. Query today's attendance logs from Supabase
 const { data: dbLogs } = await (supabase.from("attendance_logs" as any) as any)
 .select("tenant_id, status, updated_at, marked_by")
 .eq("attendance_date", todayStr);

 const logsMap = new Map<string, { status: AttendanceStatus; updatedAt?: string; markedBy?: string }>();
 if (dbLogs) {
 dbLogs.forEach((l: any) => {
 logsMap.set(l.tenant_id, {
 status: l.status as AttendanceStatus,
 updatedAt: l.updated_at,
 markedBy: l.marked_by,
 });
 });
 }

 // 3. Query buildings hierarchy from Supabase
 let bldgQuery = supabase
 .from("buildings" as any)
 .select(
 `id, name, gender_type, pg_id,
 floors (
 id, floor_name, floor_number,
 rooms (
 id, room_number, sharing_type,
 beds (
 id, bed_name, status,
 tenants (
 id, full_name, phone, is_active
 )
 )
 )
 )`
 );

 if (options?.pgId) {
    bldgQuery = bldgQuery.eq('pg_id', options.pgId);
  } else if (options?.userRole !== 'super_admin') {
    return [];
  }

  if (options?.buildingId && options.buildingId !== "all") {
    bldgQuery = bldgQuery.eq("id", options.buildingId);
  }

 const { data: dbBuildings, error: bldErr } = await (bldgQuery as any);

 let rawBuildings = (dbBuildings || []) as any[];

 if (options?.userRole === "admin" && options?.assignedBuildingIds && options.assignedBuildingIds.length > 0) {
 rawBuildings = rawBuildings.filter((b) => options.assignedBuildingIds!.includes(b.id));
 }

 // 4. Construct live hierarchy
 const result = rawBuildings.map((building: any) => {
 const rawFloors = (building.floors || []).sort(
 (a: any, b: any) => (a.floor_number ?? 0) - (b.floor_number ?? 0)
 );

 const floors = rawFloors.map((floor: any) => {
 const rawRooms = (floor.rooms || []).sort((a: any, b: any) =>
 String(a.room_number).localeCompare(String(b.room_number), undefined, { numeric: true })
 );

 const beds: BedAttendanceItem[] = [];

 rawRooms.forEach((room: any) => {
 const rawBeds = (room.beds || []).sort((a: any, b: any) =>
 String(a.bed_name).localeCompare(String(b.bed_name))
 );

 rawBeds.forEach((bed: any) => {
 const rawTenant = Array.isArray(bed.tenants) ? bed.tenants[0] : bed.tenants;

 // Only show occupied beds or beds with tenants on attendance sheet
 if (!rawTenant && bed.status !== "occupied") {
 return;
 }

 const tenantId = rawTenant?.id || bed.id;
 const tenantName = rawTenant?.full_name || "Resident";
 const tenantPhone = rawTenant?.phone || undefined;

 const activePass = activePassMap.get(tenantId);
 const savedLog = logsMap.get(tenantId);

 let currentStatus: AttendanceStatus = "present";
 if (savedLog) {
 currentStatus = savedLog.status;
 } else if (activePass) {
 currentStatus = activePass.passType === "day_pass" ? "day_pass" : "night_pass";
 }

 beds.push({
 bed_id: bed.id,
 bed_name: bed.bed_name,
 room_id: room.id,
 room_number: room.room_number,
 sharing_type: room.sharing_type,
 floor_id: floor.id,
 floor_name: floor.floor_name,
 floor_number: floor.floor_number,
 building_id: building.id,
 building_name: building.name,
 tenant_id: tenantId,
 tenant_name: tenantName,
 tenant_phone: tenantPhone,
 status: currentStatus,
 has_active_pass: !!activePass,
 pass_type: activePass?.passType || null,
 pass_number: activePass?.passNumber || null,
 pass_status: (activePass?.status as any) || null,
 updated_at: savedLog?.updatedAt,
 });
 });
 });

 const totalBeds = beds.length;
 const presentCount = beds.filter((b) => b.status === "present").length;
 const passCount = beds.filter((b) => b.status === "day_pass" || b.status === "night_pass").length;
 const absentCount = beds.filter((b) => b.status === "absent").length;

 return {
 floor_id: floor.id,
 floor_name: floor.floor_name,
 floor_number: floor.floor_number,
 beds,
 stats: {
 total: totalBeds,
 present: presentCount,
 onPass: passCount,
 absent: absentCount,
 },
 };
 });

 const buildingTotalBeds = floors.reduce((acc: number, f: any) => acc + f.stats.total, 0);
 const buildingPresent = floors.reduce((acc: number, f: any) => acc + f.stats.present, 0);
 const buildingOnPass = floors.reduce((acc: number, f: any) => acc + f.stats.onPass, 0);
 const buildingAbsent = floors.reduce((acc: number, f: any) => acc + f.stats.absent, 0);

 return {
 building_id: building.id,
 building_name: building.name,
 gender_type: building.gender_type,
 floors,
 stats: {
 total: buildingTotalBeds,
 present: buildingPresent,
 onPass: buildingOnPass,
 absent: buildingAbsent,
 },
 };
 });

 return result;
}

/**
 * Save / Update attendance logs live in Supabase
 */
export async function saveAttendanceLogs(
 items: { tenant_id: string; status: AttendanceStatus; bed_id?: string; building_id?: string; pg_id?: string }[],
 markedByRole: UserRole,
 markedByName: string
) {
 try {
 const supabase = await createClient();
 const today = new Date().toISOString().split("T")[0];

 const records = items.map((i) => ({
 tenant_id: i.tenant_id,
 bed_id: i.bed_id,
 attendance_date: today,
 status: i.status,
 marked_by: markedByName,
 }));

 await (supabase.from("attendance_logs" as any) as any).upsert(records, {
 onConflict: "tenant_id, attendance_date",
 });
 } catch (err) {
 console.error("Error saving attendance to Supabase:", err);
 }

 return { success: true, count: items.length };
}

/**
 * Get tenant's live attendance status & history directly from Supabase
 */
export async function getTenantAttendanceStatus(tenantId: string) {
 if (!tenantId) {
 return {
 todayStatus: "present" as AttendanceStatus,
 markedAt: new Date().toISOString(),
 markedBy: "Warden / Management",
 history: [],
 };
 }

 const supabase = await createClient();
 const todayStr = new Date().toISOString().split("T")[0];

 // Resolve matching tenant records (tenantId might be tenants.id OR profiles.id/user_id)
 const targetIds: string[] = [tenantId];
 try {
 const { data: tenantRec } = await (supabase.from("tenants" as any) as any)
 .select("id, user_id")
 .or(`id.eq.${tenantId},user_id.eq.${tenantId}`)
 .limit(1)
 .maybeSingle();

 if (tenantRec?.id && !targetIds.includes(tenantRec.id)) {
 targetIds.push(tenantRec.id);
 }
 if (tenantRec?.user_id && !targetIds.includes(tenantRec.user_id)) {
 targetIds.push(tenantRec.user_id);
 }
 } catch (err) {
 console.warn("Tenant lookup in getTenantAttendanceStatus:", err);
 }

 const { data: logs } = await (supabase.from("attendance_logs" as any) as any)
 .select("attendance_date, status, updated_at, marked_by")
 .in("tenant_id", targetIds)
 .order("attendance_date", { ascending: false })
 .limit(30);

 const todayLog = (logs || []).find((l: any) => l.attendance_date === todayStr);

 const history = (logs || []).map((l: any) => ({
 date: l.attendance_date,
 status: l.status as AttendanceStatus,
 note: undefined,
 }));

 return {
 todayStatus: (todayLog?.status as AttendanceStatus) || "present",
 markedAt: todayLog?.updated_at || new Date().toISOString(),
 markedBy: todayLog?.marked_by || "Warden / Management",
 history,
 };
}
