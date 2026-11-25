import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PlatformBillingSettings {
 id: string;
 upi_id: string;
 payee_name: string;
 account_holder_name: string;
 bank_name: string;
 account_number: string;
 ifsc_code: string;
 plan_price: number;
 plan_duration_days: number;
 plan_benefits: string[];
 updated_at?: string;
}

export interface PgSubscriptionRequest {
 id: string;
 pg_id: string;
 pg_name: string;
 submitted_by_user_id: string | null;
 submitted_by_name: string;
 submitted_by_role: string;
 amount: number;
 utr_number: string;
 status: "pending" | "approved" | "rejected";
 rejection_reason?: string | null;
 reviewed_by?: string | null;
 reviewed_at?: string | null;
 created_at: string;
 updated_at?: string;
}

export const DEFAULT_PLATFORM_BILLING_SETTINGS: PlatformBillingSettings = {
 id: "default",
 upi_id: "anoctic@oksbi",
 payee_name: "Shuny Stays Admin",
 account_holder_name: "Anoctic Technologies",
 bank_name: "State Bank of India",
 account_number: "39820192831",
 ifsc_code: "SBIN0001234",
 plan_price: 1999,
 plan_duration_days: 30,
 plan_benefits: [
 "Full White-label Branding",
 "Automated WhatsApp Rent Reminders",
 "Live Attendance & Gate Pass System",
 "2-Step Cash & UPI Ledger Settlement",
 "Instant Real-Time Multi-Building Management",
 ],
};

/**
 * Fetch platform billing & UPI details directly from Supabase
 */
export const getPlatformBillingSettings = cache(async (): Promise<PlatformBillingSettings> => {
 try {
 const admin = createAdminClient();
 const { data, error } = await (admin.from("platform_billing_settings" as any) as any)
 .select("*")
 .eq("id", "default")
 .maybeSingle();

 if (!error && data) {
 return {
 id: data.id || "default",
 upi_id: data.upi_id || DEFAULT_PLATFORM_BILLING_SETTINGS.upi_id,
 payee_name: data.payee_name || DEFAULT_PLATFORM_BILLING_SETTINGS.payee_name,
 account_holder_name: data.account_holder_name || DEFAULT_PLATFORM_BILLING_SETTINGS.account_holder_name,
 bank_name: data.bank_name || DEFAULT_PLATFORM_BILLING_SETTINGS.bank_name,
 account_number: data.account_number || DEFAULT_PLATFORM_BILLING_SETTINGS.account_number,
 ifsc_code: data.ifsc_code || DEFAULT_PLATFORM_BILLING_SETTINGS.ifsc_code,
 plan_price: Number(data.plan_price) || DEFAULT_PLATFORM_BILLING_SETTINGS.plan_price,
 plan_duration_days: Number(data.plan_duration_days) || DEFAULT_PLATFORM_BILLING_SETTINGS.plan_duration_days,
 plan_benefits: Array.isArray(data.plan_benefits)
 ? data.plan_benefits
 : typeof data.plan_benefits === "string"
 ? JSON.parse(data.plan_benefits || "[]")
 : DEFAULT_PLATFORM_BILLING_SETTINGS.plan_benefits,
 updated_at: data.updated_at,
 };
 }
 } catch (err) {
 console.error("getPlatformBillingSettings error:", err);
 }

 return { ...DEFAULT_PLATFORM_BILLING_SETTINGS };
});

/**
 * Update platform billing & UPI details in Supabase (Super Admin only)
 */
export async function updatePlatformBillingSettings(
 settings: Partial<PlatformBillingSettings>
): Promise<PlatformBillingSettings> {
 const admin = createAdminClient();

 const updatePayload = {
 id: "default",
 upi_id: settings.upi_id?.trim() || DEFAULT_PLATFORM_BILLING_SETTINGS.upi_id,
 payee_name: settings.payee_name?.trim() || DEFAULT_PLATFORM_BILLING_SETTINGS.payee_name,
 account_holder_name: settings.account_holder_name?.trim() || DEFAULT_PLATFORM_BILLING_SETTINGS.account_holder_name,
 bank_name: settings.bank_name?.trim() || DEFAULT_PLATFORM_BILLING_SETTINGS.bank_name,
 account_number: settings.account_number?.trim() || DEFAULT_PLATFORM_BILLING_SETTINGS.account_number,
 ifsc_code: settings.ifsc_code?.trim() || DEFAULT_PLATFORM_BILLING_SETTINGS.ifsc_code,
 plan_price: Number(settings.plan_price) || DEFAULT_PLATFORM_BILLING_SETTINGS.plan_price,
 plan_duration_days: Number(settings.plan_duration_days) || DEFAULT_PLATFORM_BILLING_SETTINGS.plan_duration_days,
 plan_benefits: settings.plan_benefits || DEFAULT_PLATFORM_BILLING_SETTINGS.plan_benefits,
 updated_at: new Date().toISOString(),
 };

 const { data, error } = await (admin.from("platform_billing_settings" as any) as any)
 .upsert(updatePayload, { onConflict: "id" })
 .select()
 .single();

 if (error) {
 console.error("updatePlatformBillingSettings error:", error);
 throw new Error(`Failed to update billing settings: ${error.message}`);
 }

 return {
 ...updatePayload,
 updated_at: data?.updated_at || updatePayload.updated_at,
 };
}

/**
 * Submit UTR payment renewal request from PG Owner or PG Admin
 */
export async function submitPgRenewalRequest(params: {
 pgId: string;
 pgName: string;
 utrNumber: string;
 amount: number;
 submittedByUserId?: string | null;
 submittedByName?: string;
 submittedByRole?: string;
}): Promise<PgSubscriptionRequest> {
 const admin = createAdminClient();

 const cleanUtr = params.utrNumber.trim().toUpperCase();
 if (!cleanUtr || cleanUtr.length < 4) {
 throw new Error("Please enter a valid UTR / Transaction Reference number.");
 }

 const newRecord = {
 pg_id: params.pgId,
 pg_name: params.pgName,
 submitted_by_user_id: params.submittedByUserId || null,
 submitted_by_name: params.submittedByName || "PG Administrator",
 submitted_by_role: params.submittedByRole || "owner",
 amount: Number(params.amount) || 1999,
 utr_number: cleanUtr,
 status: "pending",
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };

 const { data, error } = await (admin.from("pg_subscription_requests" as any) as any)
 .insert(newRecord)
 .select()
 .single();

 if (error) {
 console.error("submitPgRenewalRequest error:", error);
 throw new Error(`Failed to submit renewal request: ${error.message}`);
 }

 return data as PgSubscriptionRequest;
}

/**
 * Fetch all PG subscription / renewal requests (Super Admin view)
 */
export async function getAllSubscriptionRequests(): Promise<PgSubscriptionRequest[]> {
 try {
 const admin = createAdminClient();
 const { data, error } = await (admin.from("pg_subscription_requests" as any) as any)
 .select("*")
 .order("created_at", { ascending: false });

 if (!error && data) {
 return (data as any[]).map((r) => ({
 id: r.id,
 pg_id: r.pg_id,
 pg_name: r.pg_name,
 submitted_by_user_id: r.submitted_by_user_id,
 submitted_by_name: r.submitted_by_name || "Owner",
 submitted_by_role: r.submitted_by_role || "owner",
 amount: Number(r.amount) || 1999,
 utr_number: r.utr_number,
 status: r.status,
 rejection_reason: r.rejection_reason,
 reviewed_by: r.reviewed_by,
 reviewed_at: r.reviewed_at,
 created_at: r.created_at,
 updated_at: r.updated_at,
 }));
 }
 } catch (err) {
 console.error("getAllSubscriptionRequests error:", err);
 }
 return [];
}

/**
 * Review a renewal request: Approve (activates PG & extends expiry) or Reject
 */
export async function reviewSubscriptionRequest(
 requestId: string,
 action: "approve" | "reject",
 reviewerId?: string | null,
 rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
 const admin = createAdminClient();

 // 1. Fetch request details
 const { data: request, error: reqErr } = await (admin.from("pg_subscription_requests" as any) as any)
 .select("*")
 .eq("id", requestId)
 .maybeSingle();

 if (reqErr || !request) {
 throw new Error("Subscription request not found.");
 }

 const now = new Date();

 if (action === "approve") {
 // Fetch platform billing duration setting
 const platformSettings = await getPlatformBillingSettings();
 const extensionDays = platformSettings.plan_duration_days || 30;

 // Fetch PG's current plan_expires_at
 const { data: pgData } = await (admin.from("pgs" as any) as any)
 .select("id, plan_expires_at, status")
 .eq("id", request.pg_id)
 .maybeSingle();

 let baseDate = now;
 if (pgData?.plan_expires_at) {
 const currentExpiry = new Date(pgData.plan_expires_at);
 if (currentExpiry > now) {
 // If still active, extend from current expiry date
 baseDate = currentExpiry;
 }
 }

 const newExpiry = new Date(baseDate.getTime() + extensionDays * 24 * 60 * 60 * 1000);

 // Update PG status to active and extend plan_expires_at
 const { error: pgUpdateErr } = await (admin.from("pgs" as any) as any)
 .update({
 status: "active",
 plan_expires_at: newExpiry.toISOString(),
 updated_at: now.toISOString(),
 })
 .eq("id", request.pg_id);

 if (pgUpdateErr) {
 throw new Error(`Failed to update PG status: ${pgUpdateErr.message}`);
 }

 // Update request status
 await (admin.from("pg_subscription_requests" as any) as any)
 .update({
 status: "approved",
 reviewed_by: reviewerId || null,
 reviewed_at: now.toISOString(),
 updated_at: now.toISOString(),
 })
 .eq("id", requestId);

 return {
 success: true,
 message: `Request approved! PG plan extended by ${extensionDays} days until ${newExpiry.toLocaleDateString("en-IN")}.`,
 };
 } else {
 // Reject
 await (admin.from("pg_subscription_requests" as any) as any)
 .update({
 status: "rejected",
 rejection_reason: rejectionReason || "UTR verification failed or amount mismatch.",
 reviewed_by: reviewerId || null,
 reviewed_at: now.toISOString(),
 updated_at: now.toISOString(),
 })
 .eq("id", requestId);

 return {
 success: true,
 message: "Request marked as rejected.",
 };
 }
}

/**
 * Super Admin: Update a PG's specific expiry date, price, or benefits directly
 */
export async function updatePgPlanDetails(
 pgId: string,
 planExpiresAt: string,
 planPrice: number,
 planBenefits?: string[]
): Promise<boolean> {
 const admin = createAdminClient();

 const updateData: any = {
 plan_expires_at: planExpiresAt,
 plan_price: planPrice,
 updated_at: new Date().toISOString(),
 };

 if (planBenefits && planBenefits.length > 0) {
 updateData.plan_benefits = planBenefits;
 }

 const { error } = await (admin.from("pgs" as any) as any)
 .update(updateData)
 .eq("id", pgId);

 if (error) {
 console.error("updatePgPlanDetails error:", error);
 throw new Error(`Failed to update PG plan details: ${error.message}`);
 }

 return true;
}
