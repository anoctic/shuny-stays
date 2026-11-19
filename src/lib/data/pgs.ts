import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Pg, UserRole } from "@/types/schema.types";

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
  buildings_count: number;
  beds_count: number;
  residents_count: number;
  city: string;
  created_at: string;
}

// Safe deep-clone helper to prevent shared isolate memory mutations
function deepClone<T>(obj: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

// In-memory persistent registry for PGs across sessions
let memoryPgs: PgDetailItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Royal Stay PG",
    slug: "royal-stay",
    logo_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80",
    primary_color: "#4F46E5", // Indigo
    contact_email: "contact@royalstay.com",
    contact_phone: "+91 98222 33441",
    owner_id: "10000000-0000-0000-0000-000000000001",
    owner_name: "Vikram Malhotra",
    status: "active",
    subscription_tier: "Pro",
    subscription_valid_until: "2027-12-31T23:59:59Z",
    buildings_count: 2,
    beds_count: 24,
    residents_count: 18,
    city: "Bengaluru",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Zenith Luxury PG & Hostels",
    slug: "zenith-pg",
    logo_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&h=200&q=80",
    primary_color: "#059669", // Emerald
    contact_email: "admin@zenithpg.com",
    contact_phone: "+91 98111 22334",
    owner_id: "10000000-0000-0000-0000-000000000002",
    owner_name: "Amitabh Sen",
    status: "active",
    subscription_tier: "Enterprise",
    subscription_valid_until: "2027-08-01T23:59:59Z",
    buildings_count: 3,
    beds_count: 36,
    residents_count: 29,
    city: "Gurugram",
    created_at: "2026-02-15T12:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "GreenVilla Executive Stays",
    slug: "greenvilla-pg",
    logo_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=200&h=200&q=80",
    primary_color: "#0284C7", // Sky
    contact_email: "ops@greenvillapg.com",
    contact_phone: "+91 98444 55667",
    owner_id: "10000000-0000-0000-0000-000000000003",
    owner_name: "Sneha Reddy",
    status: "active",
    subscription_tier: "Starter",
    subscription_valid_until: "2026-12-15T23:59:59Z",
    buildings_count: 1,
    beds_count: 12,
    residents_count: 9,
    city: "Hyderabad",
    created_at: "2026-03-01T09:30:00Z",
  },
];

/**
 * Fetch all registered PGs
 */
export async function getAllPgs(): Promise<PgDetailItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pgs")
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
        created_at
      `);

    if (!error && data && data.length > 0) {
      // Merge database records with memory records
      const dbPgs: PgDetailItem[] = (data as any[]).map((d) => {
        const mem = memoryPgs.find((m) => m.id === d.id);
        return {
          id: d.id,
          name: d.name,
          slug: d.slug,
          logo_url: d.logo_url || mem?.logo_url || null,
          primary_color: d.primary_color || mem?.primary_color || "#4F46E5",
          contact_email: d.contact_email,
          contact_phone: d.contact_phone,
          owner_id: d.owner_id,
          owner_name: mem?.owner_name || "PG Owner",
          status: d.status || "active",
          subscription_tier: (d.subscription_tier || "Starter") as any,
          subscription_valid_until: d.subscription_valid_until,
          buildings_count: mem?.buildings_count || 1,
          beds_count: mem?.beds_count || 12,
          residents_count: mem?.residents_count || 8,
          city: mem?.city || "Bengaluru",
          created_at: d.created_at,
        };
      });

      // Include memory-only PGs (newly onboarded in demo)
      const existingIds = new Set(dbPgs.map((p) => p.id));
      const unmergedMemory = memoryPgs.filter((m) => !existingIds.has(m.id));
      return deepClone([...dbPgs, ...unmergedMemory]);
    }
  } catch {
    // Fallback to memory
  }

  return deepClone(memoryPgs);
}

/**
 * Get PG by slug (case-insensitive) for white-label routing
 */
export async function getPgBySlug(slug: string): Promise<PgDetailItem | null> {
  const normalized = slug.trim().toLowerCase();
  const all = await getAllPgs();
  const match = all.find((p) => p.slug.toLowerCase() === normalized) || null;
  return match ? deepClone(match) : null;
}

/**
 * Get PG by ID
 */
export async function getPgById(id: string): Promise<PgDetailItem | null> {
  const all = await getAllPgs();
  const match = all.find((p) => p.id === id) || null;
  return match ? deepClone(match) : null;
}

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

    // Return the public URL with cache-buster timestamp
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
}): Promise<PgDetailItem> {
  const pgId = crypto.randomUUID();
  const ownerId = crypto.randomUUID();
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
  };

  // Push to memory registry immediately
  memoryPgs.unshift(newPg);

  // Attempt database persistence
  try {
    const admin = createAdminClient();

    // 1. Create or upsert owner profile
    await admin.from("profiles").upsert(
      {
        id: ownerId,
        full_name: data.owner_name,
        role: "owner" as UserRole,
        phone: data.owner_phone,
      } as any,
      { onConflict: "id" }
    );

    // 2. Create pgs record
    await admin.from("pgs").insert({
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
    } as any);

    // 3. Link owner in pg_staff with ALL permissions
    await admin.from("pg_staff").insert({
      pg_id: pgId,
      user_id: ownerId,
      role: "owner",
      permissions: ["ALL"],
      is_active: true,
    } as any);
  } catch (err) {
    console.warn("DB Onboarding note: saved to active memory store.", err);
  }

  return newPg;
}

/**
 * Super Admin: Update Branding & Subscription for existing PG
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
  const index = memoryPgs.findIndex((p) => p.id === pgId);
  if (index === -1) return null;

  const current = memoryPgs[index];
  const updated: PgDetailItem = {
    ...current,
    name: data.name !== undefined ? data.name.trim() : current.name,
    slug: data.slug !== undefined ? data.slug.trim().toLowerCase() : current.slug,
    logo_url: data.logo_url !== undefined ? data.logo_url : current.logo_url,
    primary_color: data.primary_color !== undefined ? data.primary_color : current.primary_color,
    subscription_tier: data.subscription_tier !== undefined ? data.subscription_tier : current.subscription_tier,
  };

  memoryPgs[index] = updated;

  // Persist to Supabase if reachable
  try {
    const admin = createAdminClient();
    await (admin.from("pgs" as any) as any)
      .update({
        name: updated.name,
        slug: updated.slug,
        logo_url: updated.logo_url,
        primary_color: updated.primary_color,
        subscription_tier: updated.subscription_tier.toLowerCase().replace(" ", "_"),
      } as any)
      .eq("id", pgId);
  } catch {
    // Keep memory updated
  }

  return updated;
}

/**
 * Super Admin: Toggle PG Status (Active / Suspended / Pending)
 */
export async function togglePgStatus(
  pgId: string,
  targetStatus?: "active" | "pending" | "suspended"
): Promise<PgDetailItem | null> {
  const index = memoryPgs.findIndex((p) => p.id === pgId);
  if (index === -1) return null;

  const current = memoryPgs[index];
  let newStatus: "active" | "pending" | "suspended";

  if (targetStatus) {
    newStatus = targetStatus;
  } else if (current.status === "active") {
    newStatus = "suspended";
  } else {
    newStatus = "active";
  }

  const updated: PgDetailItem = {
    ...current,
    status: newStatus,
  };

  memoryPgs[index] = updated;

  try {
    const admin = createAdminClient();
    await (admin.from("pgs" as any) as any)
      .update({ status: newStatus } as any)
      .eq("id", pgId);
  } catch {
    // Keep memory updated
  }

  return updated;
}
