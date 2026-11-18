import { PlatformBroadcast, UserRole, BroadcastPriority } from "@/types/schema.types";
import { createClient } from "@/lib/supabase/server";

// Fallback in-memory store for broadcasts
let memoryBroadcasts: PlatformBroadcast[] = [
  {
    id: "bc-001",
    title: "Diwali Special Dinner Tonight 🪔",
    message: "Special festive dinner served in the main dining hall from 8:00 PM to 10:30 PM. Sweets & special paneer delicacies included!",
    priority: "info",
    target_roles: ["tenant"],
    is_active: true,
    starts_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "bc-002",
    title: "Upcoming Banking Gateway Maintenance",
    message: "Automatic rent collection settlements will be delayed by 2 hours on Sunday 2:00 AM due to UPI gateway scheduled maintenance.",
    priority: "warning",
    target_roles: ["owner", "admin"],
    is_active: true,
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "bc-003",
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_broadcasts" as any)
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return (data as any[]).filter((b) => {
        const targets: string[] = b.target_roles || [];
        return targets.length === 0 || targets.includes(role);
      });
    }
  } catch {
    // Fallback to memory store
  }

  return memoryBroadcasts.filter((b) => {
    return b.is_active && (b.target_roles.length === 0 || b.target_roles.includes(role));
  });
}

/**
 * Get all broadcasts for Super Admin management
 */
export async function getAllBroadcasts(): Promise<PlatformBroadcast[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_broadcasts" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PlatformBroadcast[];
    }
  } catch {
    // Fallback to memory store
  }

  return memoryBroadcasts;
}

/**
 * Create a new platform broadcast
 */
export async function createBroadcast(data: {
  title: string;
  message: string;
  priority: BroadcastPriority;
  target_roles: UserRole[];
}): Promise<PlatformBroadcast> {
  const newBroadcast: PlatformBroadcast = {
    id: "bc-" + Math.random().toString(36).substr(2, 9),
    title: data.title,
    message: data.message,
    priority: data.priority,
    target_roles: data.target_roles.length === 0 ? ["owner", "admin", "tenant"] : data.target_roles,
    is_active: true,
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    await supabase.from("platform_broadcasts" as any).insert({
      id: newBroadcast.id,
      title: newBroadcast.title,
      message: newBroadcast.message,
      priority: newBroadcast.priority,
      target_roles: newBroadcast.target_roles,
      is_active: true,
    });
  } catch {
    // Fallback memory insertion
  }

  memoryBroadcasts.unshift(newBroadcast);
  return newBroadcast;
}

/**
 * Toggle broadcast active status
 */
export async function toggleBroadcast(id: string): Promise<void> {
  const item = memoryBroadcasts.find((b) => b.id === id);
  if (item) {
    item.is_active = !item.is_active;
  }
}

/**
 * Delete a broadcast
 */
export async function deleteBroadcast(id: string): Promise<void> {
  memoryBroadcasts = memoryBroadcasts.filter((b) => b.id !== id);
}
