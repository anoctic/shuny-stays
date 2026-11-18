"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import { UserRole, BroadcastPriority, GatePassType } from "@/types/schema.types";
import { createBroadcast, toggleBroadcast, deleteBroadcast } from "@/lib/data/broadcasts";
import { requestGatePass, approveGatePass, rejectGatePass } from "@/lib/data/gate-passes";

/**
 * Super Admin Action: Create Platform Broadcast with Target Audience Roles
 */
export async function createBroadcastAction(formData: FormData) {
  const session = await getCurrentUserSession();
  if (session.role !== "super_admin") {
    return { error: "Unauthorized. Super Admin access required." };
  }

  const title = formData.get("title") as string;
  const message = formData.get("message") as string;
  const priority = (formData.get("priority") as BroadcastPriority) || "info";

  // Target roles array from multi-select
  const rolesRaw = formData.getAll("target_roles") as string[];
  let targetRoles: UserRole[] = [];

  if (rolesRaw.includes("all") || rolesRaw.length === 0) {
    targetRoles = ["owner", "admin", "tenant"];
  } else {
    targetRoles = rolesRaw.filter((r) =>
      ["owner", "admin", "tenant", "super_admin"].includes(r)
    ) as UserRole[];
  }

  if (!title || !message) {
    return { error: "Please enter both announcement title and message body." };
  }

  await createBroadcast({
    title,
    message,
    priority,
    target_roles: targetRoles,
  });

  revalidatePath("/super-admin");
  revalidatePath("/dashboard");
  revalidatePath("/tenant");
  return { success: true };
}

/**
 * Super Admin Action: Toggle Broadcast Active Status
 */
export async function toggleBroadcastAction(id: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "super_admin") {
    return { error: "Unauthorized." };
  }

  await toggleBroadcast(id);
  revalidatePath("/super-admin");
  revalidatePath("/dashboard");
  revalidatePath("/tenant");
  return { success: true };
}

/**
 * Tenant or Warden Action: Request or Issue a Day/Night Pass
 */
export async function requestGatePassAction(formData: FormData) {
  const session = await getCurrentUserSession();

  const passType = (formData.get("pass_type") as GatePassType) || "day_pass";
  const outingDate = formData.get("outing_date") as string;
  const expectedReturnDate = (formData.get("expected_return_date") as string) || outingDate;
  const departureTime = (formData.get("departure_time") as string) || "10:00";
  const expectedReturnTime = (formData.get("expected_return_time") as string) || "20:30";
  const reason = (formData.get("reason") as string) || "Outing";
  const destination = (formData.get("destination") as string) || "City Center";
  const emergencyPhone = (formData.get("emergency_phone") as string) || session.phone || "+91 98765 00000";

  // If warden/owner is creating for a tenant or tenant self-request
  const tenantId = (formData.get("tenant_id") as string) || session.id;
  const tenantName = (formData.get("tenant_name") as string) || session.full_name;

  if (!outingDate || !reason) {
    return { error: "Please enter outing date and reason." };
  }

  const pass = await requestGatePass({
    tenantId,
    tenantName,
    tenantPhone: session.phone || "+91 91234 56789",
    roomNumber: session.room_id ? "Room 101 • Bed A" : "Room 101",
    buildingId: session.building_id || "20000000-0000-0000-0000-000000000001",
    buildingName: "Block A - Krishna Bhawan (Boys)",
    pgId: session.pg_id || "10000000-0000-0000-0000-000000000001",
    passType,
    outingDate,
    expectedReturnDate,
    departureTime,
    expectedReturnTime,
    reason,
    destination,
    emergencyPhone,
    createdByRole: session.role,
    approverId: session.id,
  });

  revalidatePath("/tenant");
  revalidatePath("/tenant/passes");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/passes");
  return { success: true, pass };
}

/**
 * PG Owner or Warden Action: Approve Gate Pass
 * When Owner approves, status becomes 'approved' (GREEN)
 * When Warden approves, status becomes 'pending_owner' (YELLOW)
 */
export async function approveGatePassAction(passId: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") {
    return { error: "Unauthorized to approve passes." };
  }

  const updated = await approveGatePass(passId, session.role, session.id);

  revalidatePath("/tenant");
  revalidatePath("/tenant/passes");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/passes");
  return { success: true, pass: updated };
}

/**
 * PG Owner or Warden Action: Reject Gate Pass (turns RED)
 */
export async function rejectGatePassAction(passId: string, reason: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") {
    return { error: "Unauthorized to reject passes." };
  }

  const updated = await rejectGatePass(passId, reason || "Rejected by authority");

  revalidatePath("/tenant");
  revalidatePath("/tenant/passes");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/passes");
  return { success: true, pass: updated };
}
