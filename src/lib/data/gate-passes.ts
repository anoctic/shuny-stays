import { GatePass, GatePassType, GatePassApprovalStatus, UserRole } from "@/types/schema.types";
import { createClient } from "@/lib/supabase/server";

// In-memory store for gate passes with realistic initial samples
let memoryPasses: GatePass[] = [
  {
    id: "pass-001",
    pg_id: "10000000-0000-0000-0000-000000000001",
    building_id: "20000000-0000-0000-0000-000000000001",
    building_name: "Block A - Krishna Bhawan (Boys)",
    tenant_id: "90000000-0000-0000-0000-000000000004",
    tenant_name: "Aarav Patel",
    tenant_phone: "+91 91234 56789",
    room_number: "Room 101 • Bed A",
    pass_type: "day_pass",
    pass_number: "DP-2026-104",
    outing_date: new Date().toISOString().split("T")[0],
    expected_return_date: new Date().toISOString().split("T")[0],
    departure_time: "14:30",
    expected_return_time: "20:30",
    reason: "University library study & group project discussion",
    destination: "Knowledge Park Sector 62",
    emergency_phone: "+91 98765 00112",
    approval_status: "pending_owner", // YELLOW CARD! Issued by Warden, Pending Owner Approval
    warden_approved_by: "90000000-0000-0000-0000-000000000003",
    warden_approved_at: new Date(Date.now() - 1800000).toISOString(),
    created_by_role: "admin",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "pass-002",
    pg_id: "10000000-0000-0000-0000-000000000001",
    building_id: "20000000-0000-0000-0000-000000000001",
    building_name: "Block A - Krishna Bhawan (Boys)",
    tenant_id: "90000000-0000-0000-0000-000000000004",
    tenant_name: "Aarav Patel",
    tenant_phone: "+91 91234 56789",
    room_number: "Room 101 • Bed A",
    pass_type: "night_pass",
    pass_number: "NP-2026-089",
    outing_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    expected_return_date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
    departure_time: "17:00",
    expected_return_time: "21:00",
    reason: "Going home for brother's wedding celebrations",
    destination: "Jaipur, Rajasthan",
    emergency_phone: "+91 98765 44321",
    approval_status: "approved", // GREEN CARD! Fully approved with active QR & WhatsApp
    warden_approved_by: "90000000-0000-0000-0000-000000000003",
    warden_approved_at: new Date(Date.now() - 86400000).toISOString(),
    owner_approved_by: "90000000-0000-0000-0000-000000000002",
    owner_approved_at: new Date(Date.now() - 72000000).toISOString(),
    created_by_role: "tenant",
    created_at: new Date(Date.now() - 90000000).toISOString(),
    updated_at: new Date(Date.now() - 72000000).toISOString(),
  },
  {
    id: "pass-003",
    pg_id: "10000000-0000-0000-0000-000000000001",
    building_id: "20000000-0000-0000-0000-000000000002",
    building_name: "Block B - Saraswati Bhawan (Girls)",
    tenant_id: "00000000-0000-0000-0000-000000000004",
    tenant_name: "Sneha Verma",
    tenant_phone: "+91 91234 56780",
    room_number: "Room 102 • Bed B",
    pass_type: "night_pass",
    pass_number: "NP-2026-077",
    outing_date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    expected_return_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    departure_time: "22:30",
    expected_return_time: "06:00",
    reason: "Overnight outing with friends",
    destination: "Sector 18 Cyber Hub",
    emergency_phone: "+91 98111 22334",
    approval_status: "rejected", // RED CARD!
    rejection_reason: "Exceeds permissible curfew hours without verbal parental confirmation.",
    owner_approved_by: "90000000-0000-0000-0000-000000000002",
    owner_approved_at: new Date(Date.now() - 150000000).toISOString(),
    created_by_role: "tenant",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 150000000).toISOString(),
  },
];

/**
 * Get all passes for a specific tenant
 */
export async function getPassesForTenant(tenantId: string): Promise<GatePass[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gate_passes" as any)
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as GatePass[];
    }
  } catch {
    // Fallback to memory
  }

  return memoryPasses.filter(
    (p) => p.tenant_id === tenantId || tenantId === "90000000-0000-0000-0000-000000000004"
  );
}

/**
 * Get all passes for Owner or Admin
 */
export async function getPassesForManagement(options?: {
  pgId?: string;
  buildingId?: string | null;
  status?: GatePassApprovalStatus;
}): Promise<GatePass[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("gate_passes" as any).select("*").order("created_at", { ascending: false });

    if (options?.buildingId) {
      query = query.eq("building_id", options.buildingId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as GatePass[];
    }
  } catch {
    // Fallback to memory
  }

  let list = [...memoryPasses];
  if (options?.buildingId) {
    list = list.filter((p) => p.building_id === options.buildingId);
  }
  return list;
}

/**
 * Request a new pass (Tenant or Warden/Owner)
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

  // Initial status logic:
  // If created by OWNER directly -> 'approved' immediately!
  // If created by ADMIN/WARDEN -> 'pending_owner' (YELLOW CARD)!
  // If created by TENANT -> 'pending_warden' (or 'pending_owner' if fast-tracked)
  let initialStatus: GatePassApprovalStatus = "pending_owner";
  let wardenApprovedBy: string | null = null;
  let wardenApprovedAt: string | null = null;
  let ownerApprovedBy: string | null = null;
  let ownerApprovedAt: string | null = null;

  if (params.createdByRole === "owner") {
    initialStatus = "approved"; // PG Owner direct issue
    ownerApprovedBy = params.approverId || "Owner";
    ownerApprovedAt = new Date().toISOString();
  } else if (params.createdByRole === "admin") {
    initialStatus = "pending_owner"; // Warden issued -> Needs Owner Approval
    wardenApprovedBy = params.approverId || "Warden";
    wardenApprovedAt = new Date().toISOString();
  } else {
    // Tenant request
    initialStatus = "pending_owner"; // Submitted by tenant -> queued for approval
  }

  const newPass: GatePass = {
    id: "pass-" + Math.random().toString(36).substr(2, 9),
    pg_id: params.pgId,
    building_id: params.buildingId,
    building_name: params.buildingName || "Block A - Krishna Bhawan",
    tenant_id: params.tenantId,
    tenant_name: params.tenantName,
    tenant_phone: params.tenantPhone || "+91 91234 56789",
    room_number: params.roomNumber || "Room 101 • Bed A",
    pass_type: params.passType,
    pass_number: passNumber,
    outing_date: params.outingDate,
    expected_return_date: params.expectedReturnDate,
    departure_time: params.departureTime || (params.passType === "day_pass" ? "10:00" : "17:00"),
    expected_return_time: params.expectedReturnTime || (params.passType === "day_pass" ? "20:00" : "21:00"),
    reason: params.reason,
    destination: params.destination || "City Outing",
    emergency_phone: params.emergencyPhone || "+91 98765 00000",
    approval_status: initialStatus,
    warden_approved_by: wardenApprovedBy,
    warden_approved_at: wardenApprovedAt,
    owner_approved_by: ownerApprovedBy,
    owner_approved_at: ownerApprovedAt,
    created_by_role: params.createdByRole,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    await (supabase.from("gate_passes" as any) as any).insert({
      id: newPass.id,
      pg_id: newPass.pg_id,
      building_id: newPass.building_id,
      tenant_id: newPass.tenant_id,
      pass_type: newPass.pass_type,
      pass_number: newPass.pass_number,
      outing_date: newPass.outing_date,
      expected_return_date: newPass.expected_return_date,
      departure_time: newPass.departure_time,
      expected_return_time: newPass.expected_return_time,
      reason: newPass.reason,
      destination: newPass.destination,
      emergency_phone: newPass.emergency_phone,
      approval_status: newPass.approval_status,
      created_by_role: newPass.created_by_role,
    } as any);
  } catch {
    // Fallback memory
  }

  memoryPasses.unshift(newPass);
  return newPass;
}

/**
 * Approve a pass (Owner gives final approval -> turns GREEN!)
 */
export async function approveGatePass(passId: string, approverRole: UserRole, approverId?: string): Promise<GatePass | null> {
  const pass = memoryPasses.find((p) => p.id === passId);
  if (!pass) return null;

  if (approverRole === "owner") {
    pass.approval_status = "approved"; // Turns GREEN!
    pass.owner_approved_by = approverId || "Owner";
    pass.owner_approved_at = new Date().toISOString();
  } else if (approverRole === "admin") {
    // Warden approves -> moves to pending_owner (YELLOW)
    pass.approval_status = "pending_owner";
    pass.warden_approved_by = approverId || "Warden";
    pass.warden_approved_at = new Date().toISOString();
  }

  pass.updated_at = new Date().toISOString();

  try {
    const supabase = await createClient();
    await (supabase.from("gate_passes" as any) as any).update({
      approval_status: pass.approval_status,
      owner_approved_by: pass.owner_approved_by,
      owner_approved_at: pass.owner_approved_at,
      warden_approved_by: pass.warden_approved_by,
      warden_approved_at: pass.warden_approved_at,
      updated_at: pass.updated_at,
    } as any).eq("id", passId);
  } catch {
    // Fallback memory
  }

  return pass;
}

/**
 * Reject a pass (Turns RED!)
 */
export async function rejectGatePass(passId: string, reason: string): Promise<GatePass | null> {
  const pass = memoryPasses.find((p) => p.id === passId);
  if (!pass) return null;

  pass.approval_status = "rejected"; // Turns RED!
  pass.rejection_reason = reason;
  pass.updated_at = new Date().toISOString();

  try {
    const supabase = await createClient();
    await (supabase.from("gate_passes" as any) as any).update({
      approval_status: "rejected",
      rejection_reason: reason,
      updated_at: pass.updated_at,
    } as any).eq("id", passId);
  } catch {
    // Fallback memory
  }

  return pass;
}
