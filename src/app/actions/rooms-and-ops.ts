"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createOrUpdateCredentials } from "@/lib/auth/credentials";
import { createAdminClient } from "@/lib/supabase/admin";
import {
 addAutoBuilding,
 addFloor,
 addRoom,
 addBed,
 walkInAddTenant,
 vacateBed,
 verifyTenantKyc,
 markBedRentPaid,
 collectRentPayment,
 settleRentPaymentWithOwner,
 collectSecurityDeposit,
 refundSecurityDeposit,
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

 if (!name || name.trim().length === 0) {
 return { error: "Please provide a valid building name." };
 }

 let pgId = session.pg_id;
 if (!pgId && session.id) {
 const admin = createAdminClient();
 const { data: profile } = await (admin.from("profiles" as any) as any)
 .select("pg_id")
 .eq("id", session.id)
 .maybeSingle();
 if (profile?.pg_id) {
 pgId = profile.pg_id;
 } else {
 const { data: pg } = await (admin.from("pgs" as any) as any)
 .select("id")
 .eq("owner_id", session.id)
 .limit(1)
 .maybeSingle();
 if (pg?.id) {
 pgId = pg.id;
 }
 }
 }

 if (!pgId) {
 const admin = createAdminClient();
 const { data: firstPg } = await (admin.from("pgs" as any) as any)
 .select("id")
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle();
 pgId = firstPg?.id || null;
 }

 if (!pgId) {
 return { error: "No associated PG property found. Please ensure your PG is registered." };
 }

 const res = await addAutoBuilding({
 pgId,
 name,
 type,
 floorsCount,
 roomsPerFloor,
 sharing,
 rent,
 });

 if ("error" in res && res.error) {
 return { error: res.error };
 }

 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/attendance");
 revalidatePath("/dashboard/ledger");
 return res;
}

export async function addFloorAction(buildingId: string, name: string, initialRooms: number) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized" };
 }

 const res = await addFloor(buildingId, name, initialRooms);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 return res;
}

export async function addRoomAction(
 buildingId: string,
 floorIdx: number,
 mode: "single" | "bulk",
 data: { roomNumber?: string; startNo?: number; endNo?: number; sharing: number; rent: number }
) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized" };
 }

 const res = await addRoom(buildingId, floorIdx, mode, data);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 return res;
}

export async function addBedAction(buildingId: string, floorIdx: number, roomId: string, label: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized" };
 }

 const res = await addBed(buildingId, floorIdx, roomId, label);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
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
 const depositAmount = parseInt(formData.get("depositAmount") as string) || 8500;
 const depositStatus = (formData.get("depositStatus") as "paid" | "pending") || "paid";
 const depositPaymentMode = (formData.get("depositPaymentMode") as "cash" | "upi" | "bank_transfer") || "cash";
 const depositRef = (formData.get("depositRef") as string) || undefined;

 const res = await walkInAddTenant(buildingId, floorIdx, roomId, bedIdx, {
 name,
 phone,
 joinDate,
 rentPaid,
 depositAmount,
 depositStatus,
 depositPaymentMode,
 depositRef,
 collectorName: session.full_name,
 collectorId: session.id,
 });

 // Auto-generate Tenant direct credentials using Supabase Service Role Key
 const creds = await createOrUpdateCredentials({
 name,
 phone,
 role: "tenant",
 buildingId,
 roomNumber: roomId,
 pgName: session.pg_name || "Royal Stay PG",
 });

 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard/attendance");
 revalidatePath("/dashboard/ledger");
 revalidatePath("/dashboard");
 revalidatePath("/tenant");

 return {
 ...res,
 warning: creds.error ? `Auth notice: ${creds.error}` : undefined,
 credentials: {
 name,
 role: "tenant" as const,
 loginId: creds.login_id,
 password: creds.password,
 phone: creds.phone,
 pgName: session.pg_name || "Royal Stay PG",
 roomInfo: `Room ${roomId}`,
 },
 };
}

export async function collectRentPaymentAction(params: {
 tenantId: string;
 tenantName: string;
 roomNumber: string;
 buildingId: string;
 amount: number;
 paymentMode: "cash" | "admin_upi" | "pg_bank_upi";
 billingMonth?: string;
 transactionRef?: string;
}) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "admin") {
 return { error: "Unauthorized. Staff or Owner access required." };
 }

 const res = await collectRentPayment({
 ...params,
 collectedBy: session.id,
 collectedByName: session.full_name,
 collectedByRole: session.role as "owner" | "admin",
 });

 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard/ledger");
 revalidatePath("/dashboard");
 revalidatePath("/tenant");
 revalidatePath("/tenant/dues");
 return res;
}

export async function settleRentPaymentAction(invoiceId: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized. Only PG Owner can confirm cash receipt and settle." };
 }

 const res = await settleRentPaymentWithOwner({
 invoiceId,
 settledByName: session.full_name,
 settledById: session.id,
 });

 revalidatePath("/dashboard/ledger");
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 return res;
}

export async function collectSecurityDepositAction(params: {
 tenantId: string;
 amount: number;
 paymentMode: "cash" | "upi" | "bank_transfer";
 transactionRef?: string;
}) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "admin") {
 return { error: "Unauthorized." };
 }

 const res = await collectSecurityDeposit({
 ...params,
 collectorName: session.full_name,
 collectorId: session.id,
 });

 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard/ledger");
 revalidatePath("/tenant");
 return res;
}

export async function refundSecurityDepositAction(params: {
 tenantId: string;
 deductionAmount: number;
 deductionReason: string;
}) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized. Only PG Owner can settle or refund security deposits." };
 }

 const res = await refundSecurityDeposit({
 ...params,
 refundedByName: session.full_name,
 refundedById: session.id,
 });

 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard/ledger");
 revalidatePath("/tenant");
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


/**
 * PG Owner Action: Delete Building Block (Vacant only)
 */
export async function deleteBuildingAction(buildingId: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized: Only PG Owner or Super Admin can delete buildings." };
 }
 try {
 const { deleteBuilding } = await import("@/lib/data/rooms");
 const res = await deleteBuilding(buildingId);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/attendance");
 revalidatePath("/dashboard/ledger");
 return res;
 } catch (err: any) {
 return { error: err?.message || "Failed to delete building." };
 }
}

/**
 * PG Owner Action: Delete Floor (Vacant only)
 */
export async function deleteFloorAction(floorId: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized: Only PG Owner or Super Admin can delete floors." };
 }
 try {
 const { deleteFloor } = await import("@/lib/data/rooms");
 const res = await deleteFloor(floorId);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/attendance");
 return res;
 } catch (err: any) {
 return { error: err?.message || "Failed to delete floor." };
 }
}

/**
 * PG Owner Action: Delete Room (Vacant only)
 */
export async function deleteRoomAction(roomId: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized: Only PG Owner or Super Admin can delete rooms." };
 }
 try {
 const { deleteRoom } = await import("@/lib/data/rooms");
 const res = await deleteRoom(roomId);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/attendance");
 return res;
 } catch (err: any) {
 return { error: err?.message || "Failed to delete room." };
 }
}

/**
 * PG Owner Action: Delete Bed (Vacant only)
 */
export async function deleteBedAction(bedId: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized: Only PG Owner or Super Admin can delete beds." };
 }
 try {
 const { deleteBed } = await import("@/lib/data/rooms");
 const res = await deleteBed(bedId);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/attendance");
 return res;
 } catch (err: any) {
 return { error: err?.message || "Failed to delete bed." };
 }
}

/**
 * PG Owner Action: Edit Resident Details and Reassign / Transfer Bed
 */
export async function updateTenantAndBedAction(
 tenantId: string,
 data: {
 fullName: string;
 phone: string;
 emergencyPhone?: string;
 rentAmount: number;
 depositAmount: number;
 newBedId?: string;
 }
) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "super_admin") {
 return { error: "Unauthorized: Only PG Owner or Super Admin can edit resident details or reassign beds." };
 }
 try {
 const { updateTenantAndBed } = await import("@/lib/data/rooms");
 const res = await updateTenantAndBed(tenantId, data);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/attendance");
 revalidatePath("/dashboard/ledger");
 revalidatePath("/tenant");
 return res;
 } catch (err: any) {
 return { error: err?.message || "Failed to update resident details." };
 }
}
