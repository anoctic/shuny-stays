"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserSession } from "@/lib/auth/session";
import { MembershipRole } from "@/types/pg-domain.types";

/**
 * Supabase Email & Password Sign In
 */
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const sess = await getCurrentUserSession();
  if (sess.is_super_admin) {
    redirect("/super-admin");
  } else if (sess.role === "owner") {
    redirect("/owner");
  } else {
    redirect("/resident");
  }
}

/**
 * Sign Out Action
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("pg_demo_role");
  cookieStore.delete("pg_active_tenant_id");

  redirect("/login");
}

/**
 * Demo Persona Switcher (For local testing between Super Admin, Owner, Resident)
 */
export async function switchDemoPersonaAction(role: MembershipRole): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("pg_demo_role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  // If switching away from super_admin, clear any view_as org cookie
  if (role !== "super_admin") {
    cookieStore.delete("pg_active_tenant_id");
  }

  if (role === "super_admin") {
    redirect("/super-admin");
  } else if (role === "owner") {
    redirect("/owner");
  } else {
    redirect("/resident");
  }
}

/**
 * Switch Active Organization
 * STRICTLY restricted to super_admin. Non-super-admins are blocked!
 */
export async function switchOrganizationAction(organizationId: string): Promise<void> {
  const session = await getCurrentUserSession();

  if (!session.is_super_admin) {
    throw new Error("Unauthorized: Only super_admin is permitted to switch organizations.");
  }

  const cookieStore = await cookies();
  cookieStore.set("pg_active_tenant_id", organizationId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}

/**
 * Super Admin enters 'View as Organization' mode with explicit banner
 */
export async function enterViewAsOrgAction(formData: FormData): Promise<void> {
  const session = await getCurrentUserSession();
  if (!session.is_super_admin) {
    throw new Error("Unauthorized: Super admin privilege required.");
  }

  const orgId = formData.get("organization_id") as string;
  if (!orgId) return;

  const cookieStore = await cookies();
  cookieStore.set("pg_active_tenant_id", orgId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  revalidatePath("/super-admin");
  redirect("/super-admin");
}

/**
 * Super Admin exits 'View as Organization' mode
 */
export async function exitViewAsOrgAction(): Promise<void> {
  const session = await getCurrentUserSession();
  if (!session.is_super_admin) {
    throw new Error("Unauthorized: Super admin privilege required.");
  }

  const cookieStore = await cookies();
  cookieStore.delete("pg_active_tenant_id");

  revalidatePath("/super-admin");
  redirect("/super-admin");
}

/**
 * Super Admin Action: Create New Organization
 * Only accessible to super_admin. Uses server-side service role client.
 */
export async function createOrganizationAction(formData: FormData): Promise<void> {
  const session = await getCurrentUserSession();

  if (!session.is_super_admin) {
    throw new Error("Unauthorized: Super admin privilege required.");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const contact_email = formData.get("contact_email") as string;
  const contact_phone = formData.get("contact_phone") as string;
  const address = formData.get("address") as string;

  if (!name || !slug || !contact_email) {
    throw new Error("Organization Name, Slug, and Contact Email are required.");
  }

  // Service role client is strictly isolated to server-side code
  const admin = createAdminClient();

  const { error } = await (admin.from("organizations" as any) as any).insert({
    name,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    contact_email,
    contact_phone: contact_phone || null,
    address: address || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/organizations");
}
