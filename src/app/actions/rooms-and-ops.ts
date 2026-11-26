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
 rejectTenantKyc,
 submitTenantAadhaarKyc,
 updateTenantProfilePhoto,
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
  const admin = createAdminClient();
  let validPgId: string | null = null;
  if (pgId) {
    const { data: pgCheck } = await (admin.from("pgs" as any) as any)
      .select("id")
      .eq("id", pgId)
      .maybeSingle();
    if (pgCheck?.id) validPgId = pgCheck.id;
  }

  if (!validPgId && session.id) {
    const { data: profile } = await (admin.from("profiles" as any) as any)
      .select("pg_id")
      .eq("id", session.id)
      .maybeSingle();
    if (profile?.pg_id) {
      const { data: pCheck } = await (admin.from("pgs" as any) as any)
        .select("id")
        .eq("id", profile.pg_id)
        .maybeSingle();
      if (pCheck?.id) validPgId = pCheck.id;
    }
  }

  if (!validPgId && session.id) {
    const { data: pg } = await (admin.from("pgs" as any) as any)
      .select("id")
      .eq("owner_id", session.id)
      .limit(1)
      .maybeSingle();
    if (pg?.id) validPgId = pg.id;
  }

  if (!validPgId) {
    const { data: firstPg } = await (admin.from("pgs" as any) as any)
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (firstPg?.id) {
      validPgId = firstPg.id;
    } else {
      // Auto-provision a guaranteed valid PG record in pgs table so FK constraint never fails
      const fallbackPgId = crypto.randomUUID();
      const ownerName = session.full_name || "My";
      await (admin.from("pgs" as any) as any).insert({
        id: fallbackPgId,
        owner_id: session.id || null,
        name: `${ownerName} PG`,
        slug: `pg-${Date.now()}`,
        status: "active",
        subscription_tier: "starter",
      });
      validPgId = fallbackPgId;
    }

    if (session.id && validPgId) {
      try {
        await (admin.from("profiles" as any) as any)
          .update({ pg_id: validPgId, role: "owner" })
          .eq("id", session.id);
      } catch {}
    }
  }

  pgId = validPgId;

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
 if (session.role !== "owner" && session.role !== "admin" && session.role !== "super_admin" && !session.is_super_admin) return { error: "Unauthorized" };

 const name = ((formData.get("name") as string) || "").trim();
 const rawPhone = ((formData.get("phone") as string) || "").trim();
 const phoneDigits = rawPhone.replace(/\D/g, "");
 const phone = (phoneDigits.startsWith("91") && phoneDigits.length === 12 ? phoneDigits.slice(2) : phoneDigits.startsWith("0") && phoneDigits.length === 11 ? phoneDigits.slice(1) : phoneDigits).slice(-10);
 if (!name || phone.length !== 10) {
 return { error: "Please enter Tenant Full Name and a valid 10-digit Mobile Number." };
 }
 const joinDate = ((formData.get("joinDate") as string) || "").trim() || new Date().toISOString().split("T")[0];
 const rentPaid = formData.get("rentPaid") === "on" || formData.get("rentPaid") === "true";
 const rawDep = formData.get("depositAmount") as string;
 const parsedDep = rawDep !== null && rawDep !== "" ? parseInt(rawDep, 10) : NaN;
 const depositAmount = !Number.isNaN(parsedDep) && parsedDep >= 0 ? parsedDep : 0;
 const depositStatus = (formData.get("depositStatus") as "paid" | "pending") || "paid";
 const rawPaidDep = formData.get("depositPaidAmount") as string;
 const parsedPaidDep = rawPaidDep !== null && rawPaidDep !== "" ? parseInt(rawPaidDep, 10) : NaN;
 const depositPaidAmount =
 depositStatus === "paid"
 ? depositAmount
 : !Number.isNaN(parsedPaidDep) && parsedPaidDep >= 0
 ? Math.min(parsedPaidDep, depositAmount > 0 ? depositAmount : parsedPaidDep)
 : 0;
 const depositPaymentMode = (formData.get("depositPaymentMode") as "cash" | "upi" | "bank_transfer") || "cash";
 const depositRef = (formData.get("depositRef") as string) || undefined;

 const profilePhotoFile = formData.get("profilePhoto") as File | null;
 if (!profilePhotoFile || typeof profilePhotoFile !== "object" || !("size" in profilePhotoFile) || profilePhotoFile.size === 0) {
 return { error: "Please upload Resident Profile Photo (mandatory for manual onboarding)." };
 }

 const uploadedPhoto = await uploadPermanentFileToBucket(
 profilePhotoFile,
 "tenant-photos",
 session.pg_id || buildingId || session.id,
 false
 );
 if (uploadedPhoto.error || !uploadedPhoto.url) {
 return { error: uploadedPhoto.error || "Failed to upload resident profile photo." };
 }
 const profilePhotoUrl = uploadedPhoto.url;

 const res = await walkInAddTenant(buildingId, floorIdx, roomId, bedIdx, {
 name,
 phone,
 joinDate,
 rentPaid,
 depositAmount,
 depositPaidAmount,
 depositStatus,
 depositPaymentMode,
 depositRef,
 profilePhotoUrl,
 collectorName: session.full_name,
 collectorId: session.id,
 });

 // Auto-generate Tenant direct credentials using Supabase Service Role Key
 const creds = await createOrUpdateCredentials({
 name,
 phone,
 role: "tenant",
 pgId: session.pg_id,
 buildingId,
 roomNumber: roomId,
 pgName: session.pg_name || "Royal Stay PG",
 });

 if (creds.success && creds.userId && res?.tenantId) {
 try {
 const adminClient = createAdminClient();
 await (adminClient.from("tenants" as any) as any)
 .update({ user_id: creds.userId })
 .eq("id", res.tenantId);
 await (adminClient.from("profiles" as any) as any)
 .update({ avatar_url: profilePhotoUrl, updated_at: new Date().toISOString() })
 .eq("id", creds.userId);
 } catch (linkErr) {
 console.warn("Failed to link tenant user_id after creation:", linkErr);
 }
 }

 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard/attendance");
 revalidatePath("/dashboard/ledger");
 revalidatePath("/dashboard");
 revalidatePath("/tenant");
 revalidatePath("/tenant/dues");
 revalidatePath("/tenant/passes");
 if (res?.tenantId) revalidatePath(`/verify/id/${res.tenantId}`);

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
 revalidatePath("/tenant/passes");
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
 revalidatePath("/tenant/dues");
 revalidatePath("/tenant/passes");
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
 revalidatePath("/tenant/dues");
 revalidatePath("/tenant/passes");
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
 if (session.role !== "owner" && session.role !== "admin" && session.role !== "super_admin") return { error: "Unauthorized" };

 const res = await verifyTenantKyc(tenantId);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/tenant");
 revalidatePath("/tenant/passes");
 revalidatePath(`/verify/id/${tenantId}`);
 return res;
}

export async function rejectTenantKycAction(tenantId: string, reason: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "admin" && session.role !== "super_admin") return { error: "Unauthorized" };

 const res = await rejectTenantKyc(
 tenantId,
 (reason || "").trim() || "Aadhaar photo unclear or mismatch. Please re-upload."
 );
 revalidatePath("/dashboard/rooms");
 revalidatePath("/tenant");
 revalidatePath("/tenant/passes");
 revalidatePath(`/verify/id/${tenantId}`);
 return res;
}

export async function markBedRentPaidAction(tenantId: string) {
 const session = await getCurrentUserSession();
 if (session.role !== "owner" && session.role !== "admin") return { error: "Unauthorized" };

 const res = await markBedRentPaid(tenantId);
 revalidatePath("/dashboard/rooms");
 revalidatePath("/dashboard/ledger");
 revalidatePath("/tenant");
 revalidatePath("/tenant/dues");
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

 const { submitTenantUpiScreenshot, getTenantLiveProfile } = await import("@/lib/data/rooms");
 const profile = await getTenantLiveProfile(session.id, session.phone);
 const res = await submitTenantUpiScreenshot({
 tenantId: profile?.tenantId || session.id,
 tenantName: profile?.fullName || session.full_name,
 room: profile ? `${profile.buildingName} • ${profile.roomNumber}` : "Assigned Room",
 amount,
 utr,
 });

 revalidatePath("/tenant/dues");
 revalidatePath("/tenant");
 revalidatePath("/dashboard/ledger");
 return { success: true, upi: res };
}

async function uploadPermanentFileToBucket(
 file: File,
 bucket: "tenant-photos" | "kyc-documents",
 folder: string,
 allowPdf: boolean
): Promise<{ url?: string; error?: string }> {
 if (file.size > 5 * 1024 * 1024) {
 return { error: "File size must be under 5 MB." };
 }
 const extRaw = (file.name || "photo.jpg").split(".").pop()?.toLowerCase() || "jpg";
 const allowedExts = allowPdf ? ["jpg", "jpeg", "png", "webp", "pdf"] : ["jpg", "jpeg", "png", "webp"];
 const ext = allowedExts.includes(extRaw) ? extRaw : allowPdf ? "jpg" : "";
 if (!ext) {
 return { error: "Please upload a valid JPG, PNG, or WEBP image." };
 }
 const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
 const bytes = new Uint8Array(await file.arrayBuffer());
 const admin = createAdminClient();
 const { error: uploadErr } = await admin.storage
 .from(bucket)
 .upload(filePath, bytes, {
 contentType: file.type || (ext === "pdf" ? "application/pdf" : "image/jpeg"),
 upsert: true,
 });
 if (uploadErr) {
 return { error: `Upload failed: ${uploadErr.message}` };
 }
 const { data: pubData } = admin.storage.from(bucket).getPublicUrl(filePath);
 return { url: pubData?.publicUrl || undefined };
}

export async function submitTenantKycAction(formData: FormData) {
 try {
 const session = await getCurrentUserSession();
 if (!session?.id) return { error: "Unauthorized" };

 const rawAadhaar = ((formData.get("aadhaarNumber") as string) || "").replace(/\D/g, "");
 if (rawAadhaar.length !== 12) {
 return { error: "Please enter a valid 12-digit Aadhaar number." };
 }

 const file = formData.get("aadhaarFile") as File | null;
 const existingDocUrl = ((formData.get("existingDocUrl") as string) || "").trim() || null;
 let docUrl: string | null = existingDocUrl;

 if (file && typeof file === "object" && "size" in file && file.size > 0) {
 const uploaded = await uploadPermanentFileToBucket(file, "kyc-documents", session.id, true);
 if (uploaded.error) return { error: uploaded.error };
 docUrl = uploaded.url || null;
 }

 if (!docUrl) {
 return { error: "Please upload your Aadhaar Card photo or PDF." };
 }

 const res = await submitTenantAadhaarKyc({
 tenantOrUserId: session.id,
 phone: session.phone,
 aadhaarNumber: rawAadhaar,
 docUrl,
 });

 revalidatePath("/tenant");
 revalidatePath("/tenant/passes");
 revalidatePath("/dashboard/rooms");
 if (res?.tenantId) revalidatePath(`/verify/id/${res.tenantId}`);
 revalidatePath(`/verify/id/${session.id}`);
 return {
 success: true,
 kycStatus: "Under Review" as const,
 docUrl,
 tenantId: res?.tenantId,
 };
 } catch (err: any) {
 return { error: err?.message || "Failed to submit Aadhaar KYC." };
 }
}

export async function updateTenantProfilePhotoAction(formData: FormData) {
 try {
 const session = await getCurrentUserSession();
 if (!session?.id) return { error: "Unauthorized" };

 const photoFile = formData.get("profilePhoto") as File | null;
 if (!photoFile || typeof photoFile !== "object" || !("size" in photoFile) || photoFile.size === 0) {
 return { error: "Please choose an image file (JPG, PNG, or WEBP)." };
 }

 const requestedTenantId = ((formData.get("tenantId") as string) || "").trim();
 const isManagement = session.role === "owner" || session.role === "admin" || session.role === "super_admin";
 const targetId = isManagement && requestedTenantId ? requestedTenantId : session.id;

 // Enforce tenant isolation if owner/admin updates for someone else
 if (isManagement && requestedTenantId && session.role !== "super_admin") {
 const admin = createAdminClient();
 const { data: tRow } = await (admin.from("tenants" as any) as any)
 .select("pg_id")
 .eq("id", requestedTenantId)
 .maybeSingle();
 if (tRow && session.pg_id && tRow.pg_id !== session.pg_id) {
 return { error: "Unauthorized: Resident belongs to a different PG." };
 }
 }

 const uploaded = await uploadPermanentFileToBucket(
 photoFile,
 "tenant-photos",
 isManagement && session.pg_id ? session.pg_id : session.id,
 false
 );
 if (uploaded.error || !uploaded.url) {
 return { error: uploaded.error || "Failed to upload profile photo." };
 }

 const res = await updateTenantProfilePhoto({
 tenantOrUserId: targetId,
 phone: !isManagement || !requestedTenantId ? session.phone : undefined,
 photoUrl: uploaded.url,
 });

 revalidatePath("/tenant");
 revalidatePath("/tenant/passes");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/rooms");
 if (res?.tenantId) revalidatePath(`/verify/id/${res.tenantId}`);
 revalidatePath(`/verify/id/${session.id}`);

 return {
 success: true,
 photoUrl: res.photoUrl,
 tenantId: res.tenantId,
 };
 } catch (err: any) {
 return { error: err?.message || "Failed to save profile photo." };
 }
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
