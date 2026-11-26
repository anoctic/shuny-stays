"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
 toggleMealPoll,
 submitTenantMealVote,
 getTodayDateIST,
} from "@/lib/data/meal-polls";

/**
 * Super Admin, PG Owner, or PG Admin (Warden):
 * Toggle meal poll ON or OFF, or adjust the cut-off time (default preset 10:00 AM)
 */
export async function toggleMealPollAction(
 pgId: string,
 isActive: boolean,
 startTime: string = "06:00",
 cutoffTime: string = "10:00",
 mealType: string = "lunch",
 title?: string
) {
 const session = await getCurrentUserSession();

 // Authorize: Super Admin, PG Owner, or Admin
 const isAuthorized =
 session.role === "super_admin" ||
 session.role === "owner" ||
 session.role === "admin" ||
 session.is_super_admin;

 if (!isAuthorized) {
 return { error: "Unauthorized: Only PG Owner or Admin can manage meal polls." };
 }

 const effectivePgId = pgId || session.pg_id;
 if (!effectivePgId) {
 return { error: "Missing PG identifier." };
 }

 try {
 const updated = await toggleMealPoll({
 pgId: effectivePgId,
 isActive,
 startTime: startTime || "06:00",
 cutoffTime: cutoffTime || "10:00",
 mealType,
 title: title || "Dopahar Ka Khana (Lunch Poll)",
 userId: session.id,
 });

 revalidatePath("/dashboard");
 revalidatePath("/dashboard/meal-poll");
 revalidatePath("/dashboard/mess");
 revalidatePath("/tenant");
 revalidatePath("/tenant/mess");

 return {
 success: true,
 poll: updated,
 message: isActive
 ? `Lunch poll active! Schedule: ${startTime} AM - ${cutoffTime} AM.`
 : "Lunch poll has been paused.",
 };
 } catch (err: any) {
 console.error("toggleMealPollAction error:", err);
 return { error: err?.message || "Failed to update meal poll." };
 }
}

/**
 * Owner/Admin Action: Update Schedule (Start Time & Cut-off Time)
 */
export async function updateMealScheduleAction(
 pgId: string,
 startTime: string,
 cutoffTime: string
) {
 const session = await getCurrentUserSession();

 const isAuthorized =
 session.role === "super_admin" ||
 session.role === "owner" ||
 session.role === "admin" ||
 session.is_super_admin;

 if (!isAuthorized) {
 return { error: "Unauthorized." };
 }

 const effectivePgId = pgId || session.pg_id;
 if (!effectivePgId) {
 return { error: "Missing PG identifier." };
 }

 try {
 const updated = await toggleMealPoll({
 pgId: effectivePgId,
 isActive: true,
 startTime: startTime || "06:00",
 cutoffTime: cutoffTime || "10:00",
 userId: session.id,
 });

 revalidatePath("/dashboard");
 revalidatePath("/dashboard/meal-poll");
 revalidatePath("/dashboard/mess");
 revalidatePath("/tenant");
 revalidatePath("/tenant/mess");

 return {
 success: true,
 poll: updated,
 message: `Poll schedule updated: ${startTime} AM to ${cutoffTime} AM IST!`,
 };
 } catch (err: any) {
 console.error("updateMealScheduleAction error:", err);
 return { error: err?.message || "Failed to update schedule." };
 }
}

/**
 * Tenant Action: Submit or change vote on the meal poll (Yes or No)
 */
export async function voteMealPollAction(
 pollId: string,
 vote: "yes" | "no",
 providedTenantId?: string
) {
 const session = await getCurrentUserSession();
 const admin = createAdminClient();

 let resolvedTenantId: string | undefined;

 // Always canonicalize to the active tenants.id (even if client passed auth user_id)
 const candidateId = providedTenantId || session.id;
 const { data: tenantRecord } = await (admin.from("tenants" as any) as any)
 .select("id, pg_id")
 .or(`id.eq.${candidateId},user_id.eq.${session.id},user_id.eq.${candidateId}`)
 .eq("is_active", true)
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle();

 if (tenantRecord?.id) {
 resolvedTenantId = tenantRecord.id;
 } else if (session.phone) {
 const digits = session.phone.replace(/\D/g, "").slice(-10);
 if (digits.length === 10) {
 const { data: phoneTenant } = await (admin.from("tenants" as any) as any)
 .select("id")
 .ilike("phone", `%${digits}`)
 .eq("is_active", true)
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle();
 resolvedTenantId = phoneTenant?.id || candidateId;
 } else {
 resolvedTenantId = candidateId;
 }
 } else {
 resolvedTenantId = candidateId;
 }

 if (!resolvedTenantId) {
 return { error: "Unable to identify tenant record for voting." };
 }

 try {
 const res = await submitTenantMealVote(
 pollId,
 resolvedTenantId,
 vote,
 session.id
 );

 if (res.error) {
 return { error: res.error };
 }

 revalidatePath("/tenant");
 revalidatePath("/tenant/mess");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/meal-poll");
 revalidatePath("/dashboard/mess");

 return {
 success: true,
 vote: res.vote,
 message:
 vote === "yes"
 ? "✅ Vote recorded: YES (Lunch Confirmed)!"
 : "❌ Vote recorded: NO (Not Eating).",
 };
 } catch (err: any) {
 console.error("voteMealPollAction error:", err);
 return { error: err?.message || "Failed to submit vote." };
 }
}

/**
 * Super Admin Action: Enable or disable the Meal Poll Facility for a PG
 */
export async function togglePgMealPollFacilityAction(pgId: string, enabled: boolean) {
 const session = await getCurrentUserSession();

 if (session.role !== "super_admin" && !session.is_super_admin) {
 return { error: "Unauthorized: Only Super Admin can toggle PG facility access." };
 }

 try {
 const admin = createAdminClient();
 const { error } = await (admin.from("pgs" as any) as any)
 .update({ meal_poll_enabled: enabled, updated_at: new Date().toISOString() })
 .eq("id", pgId);

 if (error) {
 console.error("togglePgMealPollFacilityAction error:", error);
 return { error: error.message };
 }

 revalidatePath("/super-admin");
 revalidatePath("/dashboard");
 revalidatePath("/dashboard/meal-poll");
 revalidatePath("/dashboard/mess");
 revalidatePath("/tenant");
 revalidatePath("/tenant/mess");

 return {
 success: true,
 enabled,
 message: enabled
 ? "Meal Poll facility activated for this PG!"
 : "Meal Poll facility disabled for this PG.",
 };
 } catch (err: any) {
 console.error("togglePgMealPollFacilityAction exception:", err);
 return { error: err?.message || "Failed to update facility access." };
 }
}
