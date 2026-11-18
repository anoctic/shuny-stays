"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import {
  onboardNewPg,
  updatePgBranding,
  uploadPgLogoToStorage,
  getPgById,
} from "@/lib/data/pgs";

/**
 * Super Admin Server Action: Onboard New PG with White-Label Branding
 */
export async function onboardPgAction(formData: FormData) {
  const session = await getCurrentUserSession();

  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const primaryColor = (formData.get("primary_color") as string) || "#4F46E5";
  const ownerName = formData.get("owner_name") as string;
  const ownerEmail = formData.get("owner_email") as string;
  const ownerPhone = formData.get("owner_phone") as string;
  const subscriptionTier =
    (formData.get("subscription_tier") as
      | "Free Trial"
      | "Starter"
      | "Pro"
      | "Enterprise") || "Starter";
  const city = (formData.get("city") as string) || "Bengaluru";

  if (!name || !slug || !ownerName || !ownerEmail || !ownerPhone) {
    return { error: "Please fill in all required fields." };
  }

  // Handle Logo Upload (if provided as file)
  let logoUrl = formData.get("logo_url") as string | null;
  const logoFile = formData.get("logo_file") as File | null;

  const tempPgId = crypto.randomUUID();

  if (logoFile && logoFile.size > 0) {
    try {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = logoFile.name.split(".").pop() || "png";
      const uploadRes = await uploadPgLogoToStorage(
        tempPgId,
        buffer,
        logoFile.type || "image/png",
        ext
      );
      if (uploadRes.url) {
        logoUrl = uploadRes.url;
      }
    } catch (err: any) {
      console.warn("Logo upload warning:", err);
    }
  }

  // If no logo uploaded, use high-resolution property logo preset
  if (!logoUrl) {
    logoUrl = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80";
  }

  const newPg = await onboardNewPg({
    name,
    slug,
    logo_url: logoUrl,
    primary_color: primaryColor,
    owner_name: ownerName,
    owner_email: ownerEmail,
    owner_phone: ownerPhone,
    subscription_tier: subscriptionTier,
    city,
  });

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/organizations");
  revalidatePath(`/pg/${newPg.slug}`);

  return { success: true, pg: newPg };
}

/**
 * Super Admin Server Action: Update Existing PG Branding
 */
export async function updatePgBrandingAction(formData: FormData) {
  const session = await getCurrentUserSession();

  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  const pgId = formData.get("pg_id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const primaryColor = formData.get("primary_color") as string;
  const subscriptionTier = formData.get("subscription_tier") as
    | "Free Trial"
    | "Starter"
    | "Pro"
    | "Enterprise";

  if (!pgId) {
    return { error: "Missing PG Identifier." };
  }

  let logoUrl = (formData.get("logo_url") as string) || null;
  const logoFile = formData.get("logo_file") as File | null;

  if (logoFile && logoFile.size > 0) {
    try {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = logoFile.name.split(".").pop() || "png";
      const uploadRes = await uploadPgLogoToStorage(
        pgId,
        buffer,
        logoFile.type || "image/png",
        ext
      );
      if (uploadRes.url) {
        logoUrl = uploadRes.url;
      }
    } catch (err: any) {
      console.warn("Logo re-upload warning:", err);
    }
  }

  const updated = await updatePgBranding(pgId, {
    name,
    slug,
    primary_color: primaryColor,
    logo_url: logoUrl,
    subscription_tier: subscriptionTier,
  });

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/organizations");
  if (updated?.slug) {
    revalidatePath(`/pg/${updated.slug}`);
    revalidatePath(`/api/manifest/${updated.slug}`);
  }
  revalidatePath("/tenant");

  return { success: true, pg: updated };
}

/**
 * Super Admin Server Action: Toggle PG Status (Approve / Kill-Switch Suspend / Re-activate)
 */
export async function togglePgStatusAction(
  pgId: string,
  targetStatus?: "active" | "pending" | "suspended"
) {
  const session = await getCurrentUserSession();

  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  const { togglePgStatus } = await import("@/lib/data/pgs");
  const updated = await togglePgStatus(pgId, targetStatus);

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/organizations");
  if (updated?.slug) {
    revalidatePath(`/pg/${updated.slug}`);
  }

  return { success: true, pg: updated };
}
