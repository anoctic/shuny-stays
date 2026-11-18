"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import {
  addAutoBuilding,
  addFloor,
  addRoom,
  addBed,
  walkInAddTenant,
  vacateBed,
  verifyTenantKyc,
  markBedRentPaid,
  logExpense,
  approveUpiPayment,
  rejectUpiPayment,
  toggleStaffPermission,
  resolveComplaint,
  updateMessMenu,
} from "@/lib/data/rooms";

export async function addAutoBuildingAction(formData: FormData) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "super_admin") {
    return { error: "Unauthorized. PG Owner access required." };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const floorsCount = parseInt(formData.get("floorsCount") as string) || 3;
  const roomsPerFloor = parseInt(formData.get("roomsPerFloor") as string) || 3;
  const sharing = parseInt(formData.get("sharing") as string) || 2;
  const rent = parseInt(formData.get("rent") as string) || 8500;

  const res = await addAutoBuilding({ name, type, floorsCount, roomsPerFloor, sharing, rent });
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard");
  return res;
}

export async function addFloorAction(buildingId: string, name: string, initialRooms: number) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner") return { error: "Unauthorized" };

  const res = await addFloor(buildingId, name, initialRooms);
  revalidatePath("/dashboard/rooms");
  return res;
}

export async function addRoomAction(
  buildingId: string,
  floorIdx: number,
  mode: "single" | "bulk",
  data: { roomNumber?: string; startNo?: number; endNo?: number; sharing: number; rent: number }
) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner") return { error: "Unauthorized" };

  const res = await addRoom(buildingId, floorIdx, mode, data);
  revalidatePath("/dashboard/rooms");
  return res;
}

export async function addBedAction(buildingId: string, floorIdx: number, roomId: string, label: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner") return { error: "Unauthorized" };

  const res = await addBed(buildingId, floorIdx, roomId, label);
  revalidatePath("/dashboard/rooms");
  return res;
}

export async function walkInAddTenantAction(
  buildingId: string,
  floorIdx: number,
  roomId: string,
  bedIdx: number,
  formData: FormData
) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const joinDate = (formData.get("joinDate") as string) || "18 Nov 2026";
  const rentPaid = formData.get("rentPaid") === "on" || formData.get("rentPaid") === "true";

  const res = await walkInAddTenant(buildingId, floorIdx, roomId, bedIdx, { name, phone, joinDate, rentPaid });
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/ledger");
  return res;
}

export async function vacateBedAction(buildingId: string, floorIdx: number, roomId: string, bedIdx: number) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner") return { error: "Unauthorized" };

  const res = await vacateBed(buildingId, floorIdx, roomId, bedIdx);
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/attendance");
  return res;
}

export async function verifyTenantKycAction(tenantId: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

  const res = await verifyTenantKyc(tenantId);
  revalidatePath("/dashboard/rooms");
  return res;
}

export async function markBedRentPaidAction(tenantId: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

  const res = await markBedRentPaid(tenantId);
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/ledger");
  return res;
}

export async function logExpenseAction(formData: FormData) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner") return { error: "Unauthorized" };

  const category = formData.get("category") as string;
  const amount = parseInt(formData.get("amount") as string) || 0;
  const scope = (formData.get("scope") as string) || "All Buildings";

  const res = await logExpense(category, amount, scope);
  revalidatePath("/dashboard/ledger");
  return res;
}

export async function approveUpiPaymentAction(id: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

  const res = await approveUpiPayment(id);
  revalidatePath("/dashboard/ledger");
  return res;
}

export async function rejectUpiPaymentAction(id: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

  const res = await rejectUpiPayment(id);
  revalidatePath("/dashboard/ledger");
  return res;
}

export async function toggleStaffPermissionAction(staffId: string, permKey: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner") return { error: "Unauthorized" };

  const res = await toggleStaffPermission(staffId, permKey);
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/ops");
  return res;
}

export async function resolveComplaintAction(id: string, note?: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

  const res = await resolveComplaint(id, note);
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/ops");
  return res;
}

export async function updateMessMenuAction(formData: FormData) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

  const breakfast = formData.get("breakfast") as string;
  const lunch = formData.get("lunch") as string;
  const dinner = formData.get("dinner") as string;

  const res = await updateMessMenu({ breakfast, lunch, dinner });
  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard/ops");
  return res;
}

// --- TENANT PORTAL ACTIONS ---

export async function submitTenantComplaintAction(formData: FormData) {
  const session = await getCurrentUserSession();
  const cat = (formData.get("cat") as string) || "Wi-Fi";
  const desc = (formData.get("desc") as string) || "Issue with PG facility";

  const { submitTenantComplaint } = await import("@/lib/data/rooms");
  const res = await submitTenantComplaint({
    tenantId: session.id,
    tenantName: session.full_name,
    buildingId: session.building_id || "b-a",
    room: session.room_id ? "Room 101 • Bed A" : "Room 101",
    cat,
    desc,
  });

  revalidatePath("/tenant/complaints");
  revalidatePath("/tenant");
  revalidatePath("/dashboard/ops");
  return { success: true, complaint: res };
}

export async function submitDinnerPollAction(choice: "Yes" | "No") {
  const session = await getCurrentUserSession();
  const { setTenantDinnerPoll } = await import("@/lib/data/rooms");
  const res = await setTenantDinnerPoll(session.id, choice);
  revalidatePath("/tenant");
  revalidatePath("/dashboard/ops");
  return res;
}

export async function submitTenantUpiScreenshotAction(formData: FormData) {
  const session = await getCurrentUserSession();
  const utr = (formData.get("utr") as string) || `UTR${Math.floor(10000000 + Math.random() * 90000000)}`;
  const amount = parseInt(formData.get("amount") as string) || 8500;

  const { submitTenantUpiScreenshot } = await import("@/lib/data/rooms");
  const res = await submitTenantUpiScreenshot({
    tenantId: session.id,
    tenantName: session.full_name,
    room: "Block A • Room 101",
    amount,
    utr,
  });

  revalidatePath("/tenant/dues");
  revalidatePath("/tenant");
  revalidatePath("/dashboard/ledger");
  return { success: true, upi: res };
}

export async function verifySelfKycAction() {
  const session = await getCurrentUserSession();
  const { verifyTenantKyc } = await import("@/lib/data/rooms");
  await verifyTenantKyc(session.id);
  revalidatePath("/tenant");
  revalidatePath("/tenant/passes");
  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function submitVacateNoticeAction(formData: FormData) {
  const session = await getCurrentUserSession();
  const date = (formData.get("date") as string) || "25 Dec 2026";
  const reason = (formData.get("reason") as string) || "Relocating / Semester completed";

  const { submitVacateNotice } = await import("@/lib/data/rooms");
  const res = await submitVacateNotice(session.id, session.full_name, date, reason);
  revalidatePath("/tenant");
  revalidatePath("/tenant/passes");
  revalidatePath("/dashboard/ops");
  return res;
}
