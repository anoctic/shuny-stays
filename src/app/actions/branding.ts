"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import {
  onboardNewPg,
  updatePgBranding,
  uploadPgLogoToStorage,
} from "@/lib/data/pgs";
import { createOrUpdateCredentials, normalizePhone } from "@/lib/auth/credentials";
import { createAdminClient } from "@/lib/supabase/admin";

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
    } catch (err: unknown) {
      console.warn("Logo upload warning:", err);
    }
  }

  // If no logo uploaded, use high-resolution property logo preset
  if (!logoUrl) {
    logoUrl = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80";
  }

  const cleanPhone = normalizePhone(ownerPhone);
  if (cleanPhone.length !== 10) {
    return { error: "Please enter a valid 10-digit mobile number for the owner." };
  }

  // 1. Provision Owner credentials in Supabase Auth FIRST using Service Role Key
  const creds = await createOrUpdateCredentials({
    name: ownerName,
    phone: cleanPhone,
    email: ownerEmail,
    role: "owner",
    pgName: name,
  });

  if (!creds.success || creds.error) {
    return {
      error: `Failed to provision Owner Supabase Auth credentials: ${creds.error || "Authentication error"}. Verify SUPABASE_SERVICE_ROLE_KEY.`,
    };
  }

  // 2. Onboard new PG linked directly to the real auth user id
  let newPg;
  try {
    newPg = await onboardNewPg({
      name,
      slug,
      logo_url: logoUrl,
      primary_color: primaryColor,
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_phone: cleanPhone,
      subscription_tier: subscriptionTier,
      city,
      owner_id: creds.userId,
    });
  } catch (err: any) {
    return {
      error: `Failed to register PG in database: ${err?.message || "Unknown database error"}.`,
    };
  }

  // 3. Ensure profiles and pgs are explicitly linked with newPg.id and cleanPhone
  try {
    const admin = createAdminClient();
    await admin.from("profiles").upsert(
      {
        id: creds.userId,
        role: "owner",
        full_name: ownerName,
        phone: cleanPhone,
        email: ownerEmail || creds.email,
        pg_id: newPg.id,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "id" }
    );

    await (admin.from("pgs" as any) as any)
      .update({ owner_id: creds.userId } as any)
      .eq("id", newPg.id);

    await admin.from("pg_staff").upsert(
      {
        pg_id: newPg.id,
        user_id: creds.userId,
        designation: "Owner",
        permissions: ["ALL"],
        is_active: true,
      } as any,
      { onConflict: "pg_id,user_id" }
    );
  } catch (linkErr) {
    console.error("Database linkage error after provisioning:", linkErr);
  }

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/organizations");
  revalidatePath(`/pg/${newPg.slug}`);

  return {
    success: true,
    pg: newPg,
    credentials: {
      name: ownerName,
      role: "owner" as const,
      loginId: creds.phone || creds.login_id,
      password: creds.password,
      phone: creds.phone,
      email: creds.email,
      pgName: newPg.name,
    },
  };
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
    } catch (err: unknown) {
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

/**
 * Super Admin Server Action: Permanently Delete PG and all its records
 */
export async function deletePgAction(pgId: string) {
  const session = await getCurrentUserSession();

  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  const { deletePg } = await import("@/lib/data/pgs");
  await deletePg(pgId);

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/organizations");
  revalidatePath("/dashboard");

  return { success: true, pgId };
}
