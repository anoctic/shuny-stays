import { PlatformBroadcast, UserRole, BroadcastPriority } from "@/types/schema.types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Get all active broadcasts targeting a specific user role from Supabase
 */
export async function getActiveBroadcastsForRole(role: UserRole): Promise<PlatformBroadcast[]> {
 try {
 const admin = createAdminClient();
 const { data, error } = await (admin.from("platform_broadcasts" as any) as any)
 .select("*")
 .eq("is_active", true)
 .order("created_at", { ascending: false });

 if (error) {
 console.error("getActiveBroadcastsForRole error:", error.message);
 return [];
 }

 if (data && data.length > 0) {
 const filtered = (data as any[]).filter((b) => {
 const targets: string[] = b.target_roles || [];
 return targets.length === 0 || targets.includes(role);
 });
 return filtered as PlatformBroadcast[];
 }
 } catch (err) {
 console.error("getActiveBroadcastsForRole database critical error:", err);
 }

 return [];
}

/**
 * Get all broadcasts for Super Admin and management portals from Supabase
 */
export async function getAllBroadcasts(): Promise<PlatformBroadcast[]> {
 try {
 const admin = createAdminClient();
 const { data, error } = await (admin.from("platform_broadcasts" as any) as any)
 .select("*")
 .order("created_at", { ascending: false });

 if (error) {
 console.warn("getAllBroadcasts database error:", error.message);
 return [];
 }

 return (data || []) as PlatformBroadcast[];
 } catch (err) {
 console.error("getAllBroadcasts critical error:", err);
 return [];
 }
}

/**
 * Create a new platform broadcast persisted strictly in Supabase
 */
export async function createBroadcast(data: {
 title: string;
 message: string;
 priority: BroadcastPriority;
 target_roles: UserRole[];
}): Promise<PlatformBroadcast> {
 const admin = createAdminClient();
 const newId = crypto.randomUUID();
 const targetRoles = data.target_roles.length === 0 ? ["owner", "admin", "tenant"] : data.target_roles;

 const newBroadcast: PlatformBroadcast = {
 id: newId,
 title: data.title.trim(),
 message: data.message.trim(),
 priority: data.priority,
 target_roles: targetRoles as UserRole[],
 is_active: true,
 starts_at: new Date().toISOString(),
 created_at: new Date().toISOString(),
 };

 const { error } = await (admin.from("platform_broadcasts" as any) as any).insert({
 id: newBroadcast.id,
 title: newBroadcast.title,
 message: newBroadcast.message,
 priority: newBroadcast.priority,
 target_roles: newBroadcast.target_roles,
 is_active: true,
 created_at: newBroadcast.created_at,
 } as any);

 if (error) {
 console.error("createBroadcast Supabase insert error:", error.message);
 throw new Error(`Failed to create broadcast in database: ${error.message}`);
 }

 return newBroadcast;
}

/**
 * Toggle broadcast active status (Live <-> Paused) in Supabase
 */
export async function toggleBroadcast(id: string): Promise<boolean> {
 const admin = createAdminClient();

 const { data, error: fetchErr } = await (admin.from("platform_broadcasts" as any) as any)
 .select("is_active")
 .eq("id", id)
 .single();

 if (fetchErr || !data) {
 console.error("toggleBroadcast query error:", fetchErr);
 throw new Error(`Broadcast not found in database: ${fetchErr?.message || "Not found"}`);
 }

 const nextActive = !data.is_active;
 const { error: updateErr } = await (admin.from("platform_broadcasts" as any) as any)
 .update({ is_active: nextActive } as any)
 .eq("id", id);

 if (updateErr) {
 console.error("toggleBroadcast update error:", updateErr);
 throw new Error(`Failed to update broadcast status: ${updateErr.message}`);
 }

 return nextActive;
}

/**
 * Delete a broadcast permanently from Supabase
 */
export async function deleteBroadcast(id: string): Promise<boolean> {
 const admin = createAdminClient();
 const { error } = await (admin.from("platform_broadcasts" as any) as any)
 .delete()
 .eq("id", id);

 if (error) {
 console.error("deleteBroadcast database error:", error.message);
 throw new Error(`Failed to delete broadcast from database: ${error.message}`);
 }

 return true;
}
