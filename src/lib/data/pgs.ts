import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types/schema.types";

export interface PgDetailItem {
 id: string;
 name: string;
 slug: string;
 logo_url: string | null;
 primary_color: string;
 contact_email: string;
 contact_phone: string;
 owner_id: string;
 owner_name: string;
 status: "active" | "pending" | "suspended";
 subscription_tier: "Free Trial" | "Starter" | "Pro" | "Enterprise";
 subscription_valid_until?: string | null;
 plan_expires_at?: string | null;
 plan_price?: number;
 plan_benefits?: string[];
 buildings_count: number;
 beds_count: number;
 residents_count: number;
 city: string;
 created_at: string;
 upi_id?: string | null;
 owner_initial_password?: string | null;
 meal_poll_enabled?: boolean;
  gate_pass_enabled?: boolean;
}

/**
 * Fetch all registered PGs directly from Supabase with live counts
 */
export const getAllPgs = cache(async (): Promise<PgDetailItem[]> => {
 try {
 const admin = createAdminClient();
 let { data, error } = await (admin.from("pgs" as any) as any)
 .select(`
 id,
 name,
 slug,
 logo_url,
 primary_color,
 contact_email,
 contact_phone,
 owner_id,
 status,
 subscription_tier,
 subscription_valid_until,
 plan_expires_at,
 plan_price,
 plan_benefits,
 owner_initial_password,
 city,
 meal_poll_enabled,
 gate_pass_enabled,
 created_at
 `)
 .order("created_at", { ascending: false });

 // Defensive fallback: if any column is missing or query fails, retry with essential columns
 if (error) {
 console.warn("getAllPgs primary select warning, retrying with core columns:", error?.message);
 const fallback = await (admin.from("pgs" as any) as any)
 .select(`
 id,
 name,
 slug,
 logo_url,
 primary_color,
 contact_email,
 contact_phone,
 owner_id,
 status,
 subscription_tier,
 created_at
 `)
 .order("created_at", { ascending: false });

 if (fallback.error) {
 console.error("getAllPgs fallback error:", fallback.error);
 return [];
 }
 data = fallback.data;
 }

 if (!data || data.length === 0) {
 return [];
 }

 // 1. Fetch owners from profiles to get real names if available
 const ownerIds = (data as any[]).map((d) => d.owner_id).filter(Boolean);
 const ownerMap: Record<string, string> = {};
 if (ownerIds.length > 0) {
 try {
 const { data: owners } = await (admin.from("profiles" as any) as any)
 .select("id, full_name")
 .in("id", ownerIds);
 if (owners) {
 (owners as any[]).forEach((o) => {
 if (o.full_name) ownerMap[o.id] = o.full_name;
 });
 }
 } catch {
 // Ignore profile lookup error
 }
 }

 // 2. Fetch live counts per PG (buildings, beds, active tenants)
 const [bldgRes, bedRes, tenantRes] = await Promise.all([
 admin.from("buildings").select("id, pg_id"),
 admin.from("beds").select("id, pg_id"),
 admin.from("tenants").select("id, pg_id").eq("is_active", true),
 ]);

 const bldgCounts: Record<string, number> = {};
 (bldgRes.data || []).forEach((b: any) => {
 bldgCounts[b.pg_id] = (bldgCounts[b.pg_id] || 0) + 1;
 });

 const bedCounts: Record<string, number> = {};
 (bedRes.data || []).forEach((b: any) => {
 bedCounts[b.pg_id] = (bedCounts[b.pg_id] || 0) + 1;
 });

 const residentCounts: Record<string, number> = {};
 (tenantRes.data || []).forEach((t: any) => {
 residentCounts[t.pg_id] = (residentCounts[t.pg_id] || 0) + 1;
 });

 const dbPgs: PgDetailItem[] = (data as any[]).map((d) => {
 // Map subscription tier to human-readable format
 let tier: "Free Trial" | "Starter" | "Pro" | "Enterprise" = "Starter";
 const rawTier = (d.subscription_tier || "").toLowerCase();
 if (rawTier.includes("pro")) tier = "Pro";
 else if (rawTier.includes("enterprise")) tier = "Enterprise";
 else if (rawTier.includes("free") || rawTier.includes("trial")) tier = "Free Trial";

 return {
 id: d.id,
 name: d.name,
 slug: d.slug,
 logo_url: d.logo_url || null,
 primary_color: d.primary_color || "#4F46E5",
 contact_email: d.contact_email,
 contact_phone: d.contact_phone,
 owner_id: d.owner_id,
 owner_name: ownerMap[d.owner_id] || "PG Owner",
 status: (d.status || "active") as any,
 subscription_tier: tier,
 subscription_valid_until: d.subscription_valid_until,
 plan_expires_at: d.plan_expires_at || d.subscription_valid_until || null,
 plan_price: Number(d.plan_price) || 1999,
 plan_benefits: Array.isArray(d.plan_benefits)
 ? d.plan_benefits
 : typeof d.plan_benefits === "string"
 ? JSON.parse(d.plan_benefits || "[]")
 : [
 "Full White-label Branding",
 "Automated WhatsApp Rent Reminders",
 "Live Attendance & Gate Pass System",
 "2-Step Cash & UPI Ledger Settlement",
 "Instant Real-Time Multi-Building Management",
 ],
 buildings_count: bldgCounts[d.id] || 1,
 beds_count: bedCounts[d.id] || 12,
 residents_count: residentCounts[d.id] || 0,
 city: d.city || "Bengaluru",
 created_at: d.created_at,
 owner_initial_password: d.owner_initial_password || null,
 meal_poll_enabled: d.meal_poll_enabled !== false,
        gate_pass_enabled: d.gate_pass_enabled !== false,
 };
 });

 return dbPgs;
 } catch (err) {
 console.error("getAllPgs database critical error:", err);
 return [];
 }
});

/**
 * Get PG by slug (case-insensitive) for white-label routing
 */
export const getPgBySlug = cache(async (slug: string): Promise<PgDetailItem | null> => {
 const normalized = slug.trim().toLowerCase();
 const all = await getAllPgs();
 const match = all.find((p) => p.slug.toLowerCase() === normalized) || null;
 return match;
});

/**
 * Get PG by ID
 */
export const getPgById = cache(async (id: string): Promise<PgDetailItem | null> => {
 const all = await getAllPgs();
 const match = all.find((p) => p.id === id) || null;
 return match;
});

/**
 * Upload PG logo strictly at `${pgId}/logo.${fileExt}` with upsert: true
 */
export async function uploadPgLogoToStorage(
 pgId: string,
 fileBytes: Buffer | Uint8Array,
 mimeType: string,
 fileExt: string = "png"
): Promise<{ url: string | null; error?: string }> {
 try {
 const admin = createAdminClient();
 const filePath = `${pgId}/logo.${fileExt}`;

 const { error: uploadError } = await admin.storage
 .from("pg-logos")
 .upload(filePath, fileBytes, {
 contentType: mimeType,
 upsert: true,
 });

 if (uploadError) {
 console.warn("Supabase Storage upload notice:", uploadError.message);
 }

 const { data: publicData } = admin.storage
 .from("pg-logos")
 .getPublicUrl(filePath);

 const publicUrl = `${publicData.publicUrl}?t=${Date.now()}`;
 return { url: publicUrl };
 } catch (err: any) {
 return { url: null, error: err?.message || "Storage upload failed" };
 }
}

/**
 * Super Admin: Onboard a new PG Brand with custom branding & owner
 */
export async function onboardNewPg(data: {
 name: string;
 slug: string;
 logo_url?: string | null;
 primary_color: string;
 owner_name: string;
 owner_email: string;
 owner_phone: string;
 subscription_tier: "Free Trial" | "Starter" | "Pro" | "Enterprise";
 city?: string;
 owner_id?: string;
 owner_initial_password?: string;
}): Promise<PgDetailItem> {
 const pgId = crypto.randomUUID();
 const ownerId = data.owner_id || crypto.randomUUID();
 const now = new Date().toISOString();

 const newPg: PgDetailItem = {
 id: pgId,
 name: data.name.trim(),
 slug: data.slug.trim().toLowerCase(),
 logo_url: data.logo_url || null,
 primary_color: data.primary_color || "#4F46E5",
 contact_email: data.owner_email.trim(),
 contact_phone: data.owner_phone.trim(),
 owner_id: ownerId,
 owner_name: data.owner_name.trim(),
 status: "active",
 subscription_tier: data.subscription_tier,
 subscription_valid_until: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
 buildings_count: 1,
 beds_count: 10,
 residents_count: 0,
 city: data.city || "Bengaluru",
 created_at: now,
 owner_initial_password: data.owner_initial_password || null,
 meal_poll_enabled: true,
 gate_pass_enabled: true,
 };

 const admin = createAdminClient();

 // 1. Ensure owner profile exists with pg_id = null first
 const { error: profErr1 } = await admin.from("profiles").upsert(
 {
 id: ownerId,
 full_name: data.owner_name,
 role: "owner" as UserRole,
 phone: data.owner_phone,
 email: data.owner_email,
 pg_id: null,
 } as any,
 { onConflict: "id" }
 );
 if (profErr1) {
 console.error("onboardNewPg profiles step 1 error:", profErr1.message);
 throw new Error(`Database profile initialization error: ${profErr1.message}`);
 }

 // 2. Insert pgs record
 const { error: pgErr } = await (admin.from("pgs" as any) as any).insert({
 id: pgId,
 owner_id: ownerId,
 name: newPg.name,
 slug: newPg.slug,
 logo_url: newPg.logo_url,
 primary_color: newPg.primary_color,
 contact_email: newPg.contact_email,
 contact_phone: newPg.contact_phone,
 status: "active",
 subscription_tier: newPg.subscription_tier.toLowerCase().replace(" ", "_"),
 owner_initial_password: data.owner_initial_password || null,
 city: data.city || "Bengaluru",
 meal_poll_enabled: true,
 gate_pass_enabled: true,
 } as any);
 if (pgErr) {
 console.error("onboardNewPg pgs step 2 error:", pgErr.message);
 throw new Error(`Database PG registration error: ${pgErr.message}`);
 }

 // 3. Link owner profile to the newly created pg_id
 const { error: profErr2 } = await (admin.from("profiles" as any) as any)
 .update({ pg_id: pgId } as any)
 .eq("id", ownerId);
 if (profErr2) {
 console.error("onboardNewPg profiles step 3 error:", profErr2.message);
 }

 // 4. Link owner in pg_staff with ALL permissions
 const { error: staffErr } = await admin.from("pg_staff").upsert(
 {
 pg_id: pgId,
 user_id: ownerId,
 designation: "Owner",
 permissions: ["ALL"],
 is_active: true,
 } as any,
 { onConflict: "pg_id,user_id" }
 );
 if (staffErr) {
 console.error("onboardNewPg pg_staff step 4 error:", staffErr.message);
 }

 // 5. Newly onboarded PGs start clean with 0 buildings as requested
  return newPg;
}

/**
 * Super Admin: Update Branding & Subscription for existing PG in Supabase
 */
export async function updatePgBranding(
 pgId: string,
 data: {
 name?: string;
 slug?: string;
 logo_url?: string | null;
 primary_color?: string;
 subscription_tier?: "Free Trial" | "Starter" | "Pro" | "Enterprise";
 }
): Promise<PgDetailItem | null> {
 const admin = createAdminClient();

 const updateFields: any = {
 updated_at: new Date().toISOString(),
 };
 if (data.name !== undefined) updateFields.name = data.name.trim();
 if (data.slug !== undefined) updateFields.slug = data.slug.trim().toLowerCase();
 if (data.logo_url !== undefined) updateFields.logo_url = data.logo_url;
 if (data.primary_color !== undefined) updateFields.primary_color = data.primary_color;
 if (data.subscription_tier !== undefined) {
 updateFields.subscription_tier = data.subscription_tier.toLowerCase().replace(" ", "_");
 }

 const { data: updatedDb, error } = await (admin.from("pgs" as any) as any)
 .update(updateFields)
 .eq("id", pgId)
 .select()
 .single();

 if (error || !updatedDb) {
 console.error("updatePgBranding error:", error);
 throw new Error(`Failed to update PG branding: ${error?.message || "Not found"}`);
 }

 return {
 id: updatedDb.id,
 name: updatedDb.name,
 slug: updatedDb.slug,
 logo_url: updatedDb.logo_url,
 primary_color: updatedDb.primary_color || "#4F46E5",
 contact_email: updatedDb.contact_email,
 contact_phone: updatedDb.contact_phone,
 owner_id: updatedDb.owner_id,
 owner_name: "PG Owner",
 status: updatedDb.status,
 subscription_tier: (updatedDb.subscription_tier || "Starter") as any,
 subscription_valid_until: updatedDb.subscription_valid_until,
 buildings_count: 1,
 beds_count: 12,
 residents_count: 8,
 city: "Bengaluru",
 created_at: updatedDb.created_at,
 };
}

/**
 * Super Admin: Toggle PG Status (Active / Suspended / Pending) in Supabase
 */
export async function togglePgStatus(
 pgId: string,
 targetStatus?: "active" | "pending" | "suspended"
): Promise<PgDetailItem> {
 const admin = createAdminClient();

 // 1. Fetch current status from Supabase
 const { data: dbData, error: fetchErr } = await (admin.from("pgs" as any) as any)
 .select("id, status")
 .eq("id", pgId)
 .maybeSingle();

 if (fetchErr) {
 console.error("togglePgStatus current status query error:", fetchErr.message);
 }

 const currentStatus = dbData?.status || "active";
 let newStatus: "active" | "pending" | "suspended";
 if (targetStatus) {
 newStatus = targetStatus;
 } else if (currentStatus === "active") {
 newStatus = "suspended";
 } else {
 newStatus = "active";
 }

 let updatedDb: any = null;

 // 2. Try Atomic Stored Procedure RPC first
 try {
 const { data: rpcData, error: rpcErr } = await (admin.rpc as any)("toggle_pg_status", {
 target_pg_id: pgId,
 new_status: newStatus,
 });

 if (!rpcErr && rpcData) {
 updatedDb = rpcData;
 } else if (rpcErr) {
 console.warn("toggle_pg_status RPC fallback to direct update:", rpcErr.message);
 }
 } catch (rpcCatch) {
 console.warn("toggle_pg_status RPC invocation notice:", rpcCatch);
 }

 // Fallback to direct table update if RPC did not execute
 if (!updatedDb) {
 const { data, error: updateError } = await (admin.from("pgs" as any) as any)
 .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
 .eq("id", pgId)
 .select()
 .maybeSingle();

 if (updateError) {
 console.error("togglePgStatus Supabase table update error:", updateError);
 throw new Error(`Database error on pgs table: ${updateError.message || updateError.code || "Update failed"}`);
 }

 if (!data) {
 throw new Error(`PG with ID "${pgId}" not found in database to update.`);
 }

 updatedDb = data;
 }

 return {
 id: updatedDb.id,
 name: updatedDb.name,
 slug: updatedDb.slug,
 logo_url: updatedDb.logo_url,
 primary_color: updatedDb.primary_color || "#4F46E5",
 contact_email: updatedDb.contact_email,
 contact_phone: updatedDb.contact_phone,
 owner_id: updatedDb.owner_id,
 owner_name: "PG Owner",
 status: updatedDb.status,
 subscription_tier: (updatedDb.subscription_tier || "Starter") as any,
 subscription_valid_until: updatedDb.subscription_valid_until,
 buildings_count: 1,
 beds_count: 12,
 residents_count: 8,
 city: "Bengaluru",
 created_at: updatedDb.created_at,
 };
}

/**
 * Super Admin: Permanently Delete PG and wipe all its associated records in Supabase
 */
export async function deletePg(pgId: string): Promise<boolean> {
 const admin = createAdminClient();

 try {
 // 1. Try atomic PostgreSQL stored procedure first
 const { error: rpcError } = await (admin.rpc as any)("delete_pg_cascade", {
 target_pg_id: pgId,
 });

 if (rpcError) {
 console.warn("delete_pg_cascade RPC error, executing manual table cleanup:", rpcError.message);
 // Fallback manual table cleanup in child-first foreign key order
 await (admin.from("profiles" as any) as any).update({ pg_id: null } as any).eq("pg_id", pgId);
 await (admin.from("audit_logs" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("gate_passes" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("attendance_logs" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("complaints" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("mess_menu" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("expenses" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("security_deposits" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("rent_payments" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("tenants" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("pg_staff" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("beds" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("rooms" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("floors" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("buildings" as any) as any).delete().eq("pg_id", pgId);
 await (admin.from("pgs" as any) as any).delete().eq("id", pgId);
 }
 } catch (err) {
 console.error("deletePg error:", err);
 throw err;
 }

 return true;
}
