import { GatePass, GatePassType, GatePassApprovalStatus, UserRole } from "@/types/schema.types";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper for loose typing against custom Supabase schemas
const db = (admin: any, table: string) => admin.from(table) as any;

/**
 * Get all passes for a specific tenant from Supabase
 */
export async function getPassesForTenant(tenantId: string): Promise<GatePass[]> {
 if (!tenantId) return [];
 try {
 const admin = createAdminClient();

 // Support lookup by either tenant record ID or auth user ID
 let effectiveTenantId = tenantId;
 const { data: tenant } = await db(admin, "tenants")
 .select("id, full_name, phone, room_id, buildings(name), rooms(room_number)")
 .or(`id.eq.${tenantId},user_id.eq.${tenantId}`)
 .maybeSingle();

 if (tenant) {
 effectiveTenantId = tenant.id;
 }

 const { data, error } = await db(admin, "gate_passes")
 .select("*, buildings(name), tenants(full_name, phone, rooms(room_number))")
 .eq("tenant_id", effectiveTenantId)
 .order("created_at", { ascending: false });

 if (error) {
 console.error("getPassesForTenant error:", error);
 return [];
 }

 if (data && data.length > 0) {
 return (data as any[]).map((d) => ({
 id: d.id,
 pg_id: d.pg_id,
 building_id: d.building_id,
 building_name: d.buildings?.name || (tenant as any)?.buildings?.name || "Main Block",
 tenant_id: d.tenant_id,
 tenant_name: d.tenants?.full_name || (tenant as any)?.full_name || "Resident",
 tenant_phone: d.tenants?.phone || (tenant as any)?.phone || "+91 98765 00000",
 room_number: d.tenants?.rooms?.room_number ? `Room ${d.tenants.rooms.room_number}` : "Room 101",
 pass_type: d.pass_type as GatePassType,
 pass_number: d.pass_number || `GP-${d.id.slice(0, 6)}`,
 outing_date: d.outing_date || (d.from_datetime ? new Date(d.from_datetime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
 expected_return_date: d.expected_return_date || (d.to_datetime ? new Date(d.to_datetime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
 departure_time: d.departure_time || "10:00",
 expected_return_time: d.expected_return_time || "20:00",
        actual_entry_time: d.actual_entry_time || null,
        actual_entry_date: d.actual_entry_date || null,
        is_late: Boolean(d.is_late),
        entry_recorded_by: d.entry_recorded_by || null,
 reason: d.reason || "Outing",
 destination: d.destination || "City Outing",
 emergency_phone: d.emergency_phone || null,
 approval_status: (d.approval_status || "pending_owner") as GatePassApprovalStatus,
 warden_approved_by: d.warden_approved_by || d.issued_by_staff_id,
 warden_approved_at: d.warden_approved_at,
 owner_approved_by: d.owner_approved_by || d.approved_by_owner_id,
 owner_approved_at: d.owner_approved_at,
 rejection_reason: d.rejection_reason || null,
 created_by_role: (d.created_by_role || "tenant") as UserRole,
 created_at: d.created_at || new Date().toISOString(),
 updated_at: d.updated_at || d.created_at || new Date().toISOString(),
 }));
 }
 } catch (err) {
 console.error("getPassesForTenant database error:", err);
 }

 return [];
}

/**
 * Get all passes for Owner or Admin from Supabase
 */
export async function getPassesForManagement(options?: {
 pgId?: string;
 buildingId?: string | null;
 status?: GatePassApprovalStatus;
}): Promise<GatePass[]> {
 try {
 const admin = createAdminClient();
 let query = db(admin, "gate_passes")
 .select("*, buildings(name), tenants(full_name, phone, rooms(room_number))")
 .order("created_at", { ascending: false });

 if (options?.pgId) {
 query = query.eq("pg_id", options.pgId);
 }
 if (options?.buildingId && options.buildingId !== "all") {
 query = query.eq("building_id", options.buildingId);
 }
 if (options?.status) {
 query = query.eq("approval_status", options.status);
 }

 const { data, error } = await query;
 if (error) {
 console.error("getPassesForManagement error:", error);
 return [];
 }

 if (data && data.length > 0) {
 return (data as any[]).map((d) => ({
 id: d.id,
 pg_id: d.pg_id,
 building_id: d.building_id,
 building_name: d.buildings?.name || "Main Block",
 tenant_id: d.tenant_id,
 tenant_name: d.tenants?.full_name || "Resident",
 tenant_phone: d.tenants?.phone || "+91 98765 00000",
 room_number: d.tenants?.rooms?.room_number ? `Room ${d.tenants.rooms.room_number}` : "Room 101",
 pass_type: d.pass_type as GatePassType,
 pass_number: d.pass_number || `GP-${d.id.slice(0, 6)}`,
 outing_date: d.outing_date || (d.from_datetime ? new Date(d.from_datetime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
 expected_return_date: d.expected_return_date || (d.to_datetime ? new Date(d.to_datetime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
 departure_time: d.departure_time || "10:00",
 expected_return_time: d.expected_return_time || "20:00",
        actual_entry_time: d.actual_entry_time || null,
        actual_entry_date: d.actual_entry_date || null,
        is_late: Boolean(d.is_late),
        entry_recorded_by: d.entry_recorded_by || null,
 reason: d.reason || "Outing",
 destination: d.destination || "City Outing",
 emergency_phone: d.emergency_phone || null,
 approval_status: (d.approval_status || "pending_owner") as GatePassApprovalStatus,
 warden_approved_by: d.warden_approved_by || d.issued_by_staff_id,
 warden_approved_at: d.warden_approved_at,
 owner_approved_by: d.owner_approved_by || d.approved_by_owner_id,
 owner_approved_at: d.owner_approved_at,
 rejection_reason: d.rejection_reason || null,
 created_by_role: (d.created_by_role || "tenant") as UserRole,
 created_at: d.created_at || new Date().toISOString(),
 updated_at: d.updated_at || d.created_at || new Date().toISOString(),
 }));
 }
 } catch (err) {
 console.error("getPassesForManagement error:", err);
 }

 return [];
}

/**
 * Request a new pass (Tenant or Warden/Owner) - persists strictly in Supabase
 */
export async function requestGatePass(params: {
 tenantId: string;
 tenantName: string;
 tenantPhone?: string;
 roomNumber?: string;
 buildingId: string;
 buildingName?: string;
 pgId: string;
 passType: GatePassType;
 outingDate: string;
 expectedReturnDate: string;
 departureTime?: string;
 expectedReturnTime?: string;
 reason: string;
 destination?: string;
 emergencyPhone?: string;
 createdByRole: UserRole;
 approverId?: string;
}): Promise<GatePass> {
 const prefix = params.passType === "day_pass" ? "DP" : "NP";
 const randomNum = Math.floor(100 + Math.random() * 900);
 const passNumber = `${prefix}-${new Date().getFullYear()}-${randomNum}`;
 const passId = crypto.randomUUID();

 let initialStatus: GatePassApprovalStatus = "pending_owner";
 let wardenApprovedBy: string | null = null;
 let wardenApprovedAt: string | null = null;
 let ownerApprovedBy: string | null = null;
 let ownerApprovedAt: string | null = null;

 if (params.createdByRole === "owner") {
 initialStatus = "approved";
 ownerApprovedBy = params.approverId || "Owner";
 ownerApprovedAt = new Date().toISOString();
 } else if (params.createdByRole === "admin") {
 initialStatus = "pending_owner";
 wardenApprovedBy = params.approverId || "Warden";
 wardenApprovedAt = new Date().toISOString();
 } else {
 initialStatus = "pending_owner";
 }

 const admin = createAdminClient();

 const { error } = await db(admin, "gate_passes").insert({
 id: passId,
 pg_id: params.pgId,
 building_id: params.buildingId,
 tenant_id: params.tenantId,
 pass_type: params.passType,
 pass_number: passNumber,
 outing_date: params.outingDate,
 expected_return_date: params.expectedReturnDate,
 departure_time: params.departureTime || (params.passType === "day_pass" ? "10:00" : "17:00"),
 expected_return_time: params.expectedReturnTime || (params.passType === "day_pass" ? "20:00" : "21:00"),
    actual_entry_time: null,
    actual_entry_date: null,
    is_late: false,
    entry_recorded_by: null,
 reason: params.reason,
 destination: params.destination || "City Outing",
 emergency_phone: params.emergencyPhone || null,
 approval_status: initialStatus,
 warden_approved_by: wardenApprovedBy,
 warden_approved_at: wardenApprovedAt,
 owner_approved_by: ownerApprovedBy,
 owner_approved_at: ownerApprovedAt,
 created_by_role: params.createdByRole,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 });

 if (error) {
 console.error("requestGatePass Supabase insert error:", error);
 throw new Error(`Failed to create gate pass in database: ${error.message}`);
 }

 const createdPass: GatePass = {
 id: passId,
 pg_id: params.pgId,
 building_id: params.buildingId,
 building_name: params.buildingName || "Main Building",
 tenant_id: params.tenantId,
 tenant_name: params.tenantName,
 tenant_phone: params.tenantPhone || "+91 98765 00000",
 room_number: params.roomNumber || "Room 101",
 pass_type: params.passType,
 pass_number: passNumber,
 outing_date: params.outingDate,
 expected_return_date: params.expectedReturnDate,
 departure_time: params.departureTime || (params.passType === "day_pass" ? "10:00" : "17:00"),
 expected_return_time: params.expectedReturnTime || (params.passType === "day_pass" ? "20:00" : "21:00"),
 reason: params.reason,
 destination: params.destination || "City Outing",
 emergency_phone: params.emergencyPhone || null,
 approval_status: initialStatus,
 warden_approved_by: wardenApprovedBy,
 warden_approved_at: wardenApprovedAt,
 owner_approved_by: ownerApprovedBy,
 owner_approved_at: ownerApprovedAt,
 created_by_role: params.createdByRole,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };

 return createdPass;
}

/**
 * Approve a pass in Supabase (Owner approves -> turns GREEN / Warden approves -> moves to pending_owner)
 */
export async function approveGatePass(passId: string, approverRole: UserRole, approverId?: string): Promise<GatePass | null> {
 const admin = createAdminClient();

 const updateData: any = {
 updated_at: new Date().toISOString(),
 };

 if (approverRole === "owner") {
 updateData.approval_status = "approved";
 updateData.owner_approved_by = approverId || "Owner";
 updateData.owner_approved_at = new Date().toISOString();
 } else if (approverRole === "admin") {
 updateData.approval_status = "pending_owner";
 updateData.warden_approved_by = approverId || "Warden";
 updateData.warden_approved_at = new Date().toISOString();
 }

 const { data, error } = await db(admin, "gate_passes")
 .update(updateData)
 .eq("id", passId)
 .select("*, buildings(name), tenants(full_name, phone, rooms(room_number))")
 .single();

 if (error || !data) {
 console.error("approveGatePass error:", error);
 throw new Error(`Failed to approve gate pass in database: ${error?.message || "Not found"}`);
 }

 return {
 id: data.id,
 pg_id: data.pg_id,
 building_id: data.building_id,
 building_name: data.buildings?.name || "Main Block",
 tenant_id: data.tenant_id,
 tenant_name: data.tenants?.full_name || "Resident",
 tenant_phone: data.tenants?.phone || "+91 98765 00000",
 room_number: data.tenants?.rooms?.room_number ? `Room ${data.tenants.rooms.room_number}` : "Room 101",
 pass_type: data.pass_type as GatePassType,
 pass_number: data.pass_number,
 outing_date: data.outing_date,
 expected_return_date: data.expected_return_date,
 departure_time: data.departure_time,
 expected_return_time: data.expected_return_time,
    actual_entry_time: data.actual_entry_time || null,
    actual_entry_date: data.actual_entry_date || null,
    is_late: Boolean(data.is_late),
    entry_recorded_by: data.entry_recorded_by || null,
 reason: data.reason,
 destination: data.destination,
 emergency_phone: data.emergency_phone,
 approval_status: data.approval_status as GatePassApprovalStatus,
 warden_approved_by: data.warden_approved_by,
 warden_approved_at: data.warden_approved_at,
 owner_approved_by: data.owner_approved_by,
 owner_approved_at: data.owner_approved_at,
 rejection_reason: data.rejection_reason,
 created_by_role: data.created_by_role as UserRole,
 created_at: data.created_at,
 updated_at: data.updated_at,
 };
}

/**
 * Reject a pass in Supabase (Turns RED!)
 */
export async function rejectGatePass(passId: string, reason: string): Promise<GatePass | null> {
 const admin = createAdminClient();

 const { data, error } = await db(admin, "gate_passes")
 .update({
 approval_status: "rejected",
 rejection_reason: reason.trim(),
 updated_at: new Date().toISOString(),
 })
 .eq("id", passId)
 .select("*, buildings(name), tenants(full_name, phone, rooms(room_number))")
 .single();

 if (error || !data) {
 console.error("rejectGatePass error:", error);
 throw new Error(`Failed to reject gate pass in database: ${error?.message || "Not found"}`);
 }

 return {
 id: data.id,
 pg_id: data.pg_id,
 building_id: data.building_id,
 building_name: data.buildings?.name || "Main Block",
 tenant_id: data.tenant_id,
 tenant_name: data.tenants?.full_name || "Resident",
 tenant_phone: data.tenants?.phone || "+91 98765 00000",
 room_number: data.tenants?.rooms?.room_number ? `Room ${data.tenants.rooms.room_number}` : "Room 101",
 pass_type: data.pass_type as GatePassType,
 pass_number: data.pass_number,
 outing_date: data.outing_date,
 expected_return_date: data.expected_return_date,
 departure_time: data.departure_time,
 expected_return_time: data.expected_return_time,
    actual_entry_time: data.actual_entry_time || null,
    actual_entry_date: data.actual_entry_date || null,
    is_late: Boolean(data.is_late),
    entry_recorded_by: data.entry_recorded_by || null,
 reason: data.reason,
 destination: data.destination,
 emergency_phone: data.emergency_phone,
 approval_status: data.approval_status as GatePassApprovalStatus,
 warden_approved_by: data.warden_approved_by,
 warden_approved_at: data.warden_approved_at,
 owner_approved_by: data.owner_approved_by,
 owner_approved_at: data.owner_approved_at,
 rejection_reason: data.rejection_reason,
 created_by_role: data.created_by_role as UserRole,
 created_at: data.created_at,
 updated_at: data.updated_at,
 };
}


/**
 * Record Entry / Return Attendance for an approved Gate Pass
 */
export async function recordGatePassReturn(passId: string, recordedBy: string): Promise<GatePass | null> {
  const admin = createAdminClient();
  const now = new Date();

  // IST Time string: HH:MM
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const actualEntryTime = istFormatter.format(now);

  // IST Date string: YYYY-MM-DD
  const istDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const actualEntryDate = istDateFormatter.format(now);

  // 1. Fetch current pass to check deadline
  const { data: passData, error: fetchErr } = await db(admin, "gate_passes")
    .select("*, tenants(id, full_name)")
    .eq("id", passId)
    .single();

  if (fetchErr || !passData) {
    console.error("recordGatePassReturn fetch error:", fetchErr);
    throw new Error(`Gate pass not found: ${fetchErr?.message || "Not found"}`);
  }

  // 2. Check if return is late
  let isLate = false;
  if (passData.expected_return_date && passData.expected_return_time) {
    const expectedStr = `${passData.expected_return_date}T${passData.expected_return_time}:00`;
    const actualStr = `${actualEntryDate}T${actualEntryTime}:00`;
    if (actualStr > expectedStr) {
      isLate = true;
    }
  }

  // 3. Update gate pass to completed
  const { data, error } = await db(admin, "gate_passes")
    .update({
      approval_status: "completed",
      actual_entry_time: actualEntryTime,
      actual_entry_date: actualEntryDate,
      is_late: isLate,
      entry_recorded_by: recordedBy,
      updated_at: now.toISOString(),
    })
    .eq("id", passId)
    .select("*, buildings(name), tenants(full_name, phone, rooms(room_number))")
    .single();

  if (error || !data) {
    console.error("recordGatePassReturn update error:", error);
    throw new Error(`Failed to record gate pass return: ${error?.message || "Not found"}`);
  }

  // 4. Upsert attendance log for today
  try {
    await db(admin, "attendance_logs").upsert(
      {
        tenant_id: data.tenant_id,
        attendance_date: actualEntryDate,
        status: "present",
        marked_by: `Gate Return by ${recordedBy} (${actualEntryTime}${isLate ? " - LATE" : ""})`,
        updated_at: now.toISOString(),
      },
      { onConflict: "tenant_id, attendance_date" }
    );
  } catch (attErr) {
    console.warn("Attendance sync on gate pass return:", attErr);
  }

  return {
    id: data.id,
    pg_id: data.pg_id,
    building_id: data.building_id,
    building_name: data.buildings?.name || "Main Block",
    tenant_id: data.tenant_id,
    tenant_name: data.tenants?.full_name || "Resident",
    tenant_phone: data.tenants?.phone || "+91 98765 00000",
    room_number: data.tenants?.rooms?.room_number ? `Room ${data.tenants.rooms.room_number}` : "Room 101",
    pass_type: data.pass_type as GatePassType,
    pass_number: data.pass_number,
    outing_date: data.outing_date,
    expected_return_date: data.expected_return_date,
    departure_time: data.departure_time,
    expected_return_time: data.expected_return_time,
    actual_entry_time: data.actual_entry_time,
    actual_entry_date: data.actual_entry_date,
    is_late: Boolean(data.is_late),
    entry_recorded_by: data.entry_recorded_by,
    reason: data.reason,
    destination: data.destination,
    emergency_phone: data.emergency_phone,
    approval_status: data.approval_status as GatePassApprovalStatus,
    warden_approved_by: data.warden_approved_by,
    warden_approved_at: data.warden_approved_at,
    owner_approved_by: data.owner_approved_by,
    owner_approved_at: data.owner_approved_at,
    rejection_reason: data.rejection_reason,
    created_by_role: data.created_by_role as UserRole,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
