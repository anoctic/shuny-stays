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
