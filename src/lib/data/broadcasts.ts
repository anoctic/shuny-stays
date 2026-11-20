import { PlatformBroadcast, UserRole, BroadcastPriority } from "@/types/schema.types";
import { createAdminClient } from "@/lib/supabase/admin";

// Safe deep-clone helper to prevent cross-request memory mutation
function deepClone<T>(obj: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

// Fallback in-memory store for broadcasts
let memoryBroadcasts: PlatformBroadcast[] = [
  {
    id: "bc000000-0000-0000-0000-000000000001",
    title: "Diwali Special Dinner Tonight 🪔",
    message: "Special festive dinner served in the main dining hall from 8:00 PM to 10:30 PM. Sweets & special paneer delicacies included!",
    priority: "info",
    target_roles: ["tenant"],
    is_active: true,
    starts_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "bc000000-0000-0000-0000-000000000002",
    title: "Upcoming Banking Gateway Maintenance",
    message: "Automatic rent collection settlements will be delayed by 2 hours on Sunday 2:00 AM due to UPI gateway scheduled maintenance.",
    priority: "warning",
    target_roles: ["owner", "admin"],
    is_active: true,
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "bc000000-0000-0000-0000-000000000003",
    title: "Urgent: Mandatory Govt ID & Police Verification",
    message: "All residents must submit Aadhaar / Passport scan copies to the warden desk by Friday 6:00 PM as per local administrative guidelines.",
    priority: "urgent",
    target_roles: ["owner", "admin", "tenant"],
    is_active: true,
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

/**
 * Get all active broadcasts targeting a specific user role
 */
export async function getActiveBroadcastsForRole(role: UserRole): Promise<PlatformBroadcast[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("platform_broadcasts" as any) as any)
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const filtered = (data as any[]).filter((b) => {
        const targets: string[] = b.target_roles || [];
        return targets.length === 0 || targets.includes(role);
      });
      return deepClone(filtered);
    }
  } catch (err) {
    console.warn("getActiveBroadcastsForRole database read warning:", err);
  }

  const memoryFiltered = memoryBroadcasts.filter((b) => {
    return b.is_active && (b.target_roles.length === 0 || b.target_roles.includes(role));
  });
  return deepClone(memoryFiltered);
}

/**
 * Get all broadcasts for Super Admin and management portals
 */
export async function getAllBroadcasts(): Promise<PlatformBroadcast[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("platform_broadcasts" as any) as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      // Sync memory cache with DB
      const dbBroadcasts: PlatformBroadcast[] = data as PlatformBroadcast[];
      memoryBroadcasts = dbBroadcasts;
      return deepClone(dbBroadcasts);
    }
  } catch (err) {
    console.warn("getAllBroadcasts database read warning:", err);
  }

  return deepClone(memoryBroadcasts);
}

/**
 * Create a new platform broadcast persisted in Supabase
 */
export async function createBroadcast(data: {
  title: string;
  message: string;
  priority: BroadcastPriority;
  target_roles: UserRole[];
}): Promise<PlatformBroadcast> {
  const newId = crypto.randomUUID();
  const targetRoles = data.target_roles.length === 0 ? ["owner", "admin", "tenant"] : data.target_roles;

  const newBroadcast: PlatformBroadcast = {
    id: newId,
    title: data.title,
    message: data.message,
    priority: data.priority,
    target_roles: targetRoles as UserRole[],
    is_active: true,
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    const { error } = await (admin.from("platform_broadcasts" as any) as any).insert({
      id: newBroadcast.id,
      title: newBroadcast.title,
      message: newBroadcast.message,
      priority: newBroadcast.priority,
      target_roles: newBroadcast.target_roles,
      is_active: true,
    } as any);

    if (error) {
      console.error("createBroadcast Supabase insert error:", error.message);
    }
  } catch (err) {
    console.error("createBroadcast database critical error:", err);
  }

  memoryBroadcasts.unshift(newBroadcast);
  return newBroadcast;
}

/**
 * Toggle broadcast active status (Live <-> Paused) in Supabase and memory
 */
export async function toggleBroadcast(id: string): Promise<boolean> {
  let nextActive = false;

  // 1. Check current status from DB or memory
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("platform_broadcasts" as any) as any)
      .select("is_active")
      .eq("id", id)
      .maybeSingle();

    if (data && typeof data.is_active === "boolean") {
      nextActive = !data.is_active;
    } else {
      const mem = memoryBroadcasts.find((b) => b.id === id);
      nextActive = mem ? !mem.is_active : false;
    }

    // 2. Persist update to Supabase
    await (admin.from("platform_broadcasts" as any) as any)
      .update({ is_active: nextActive } as any)
      .eq("id", id);
  } catch (err) {
    console.error("toggleBroadcast database error:", err);
    const mem = memoryBroadcasts.find((b) => b.id === id);
    nextActive = mem ? !mem.is_active : false;
  }

  // 3. Keep memory in sync
  const item = memoryBroadcasts.find((b) => b.id === id);
  if (item) {
    item.is_active = nextActive;
  }

  return nextActive;
}

/**
 * Delete a broadcast permanently from Supabase and memory
 */
export async function deleteBroadcast(id: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { error } = await (admin.from("platform_broadcasts" as any) as any)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("deleteBroadcast Supabase delete error:", error.message);
    }
  } catch (err) {
    console.error("deleteBroadcast database error:", err);
  }

  // Remove from memory store
  memoryBroadcasts = memoryBroadcasts.filter((b) => b.id !== id);
  return true;
}
