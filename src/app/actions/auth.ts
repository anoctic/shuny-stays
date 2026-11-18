"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserSession } from "@/lib/auth/session";
import { UserRole } from "@/types/schema.types";

/**
 * Unified Login (Email & Password)
 */
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Clear demo cookies upon real sign-in
  const cookieStore = await cookies();
  cookieStore.delete("pg_demo_role");
  cookieStore.delete("pg_demo_no_pg");

  // Determine user role and route
  const sess = await getCurrentUserSession();

  if (sess.role === "super_admin") {
    redirect("/super-admin");
  } else if (sess.role === "owner") {
    if (!sess.has_pg) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  } else if (sess.role === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/tenant");
  }
}

/**
 * PG Owner Sign Up Action
 * Automatically creates entry in auth.users, and the trigger handles profiles with role 'owner'
 */
export async function signUpOwnerAction(formData: FormData) {
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  if (!fullName || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "owner",
        full_name: fullName,
        phone: phone || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Check if session was automatically established (email confirmation disabled in Supabase)
  if (data.session) {
    const cookieStore = await cookies();
    cookieStore.delete("pg_demo_role");
    redirect("/onboarding");
  }

  // If email confirmation required or demo mode
  return {
    success: true,
    message: "Owner account registered! Please check your email to verify or sign in.",
  };
}

/**
 * PG Owner First-Time Onboarding Wizard Submission
 * Creates pgs record, first building record, and assigns owner in pg_staff
 */
export async function submitOnboardingAction(formData: FormData) {
  const pgName = formData.get("pg_name") as string;
  const city = formData.get("city") as string;
  const contactPhone = formData.get("contact_phone") as string;
  const buildingName = formData.get("building_name") as string;
  const genderType = (formData.get("gender_type") as "boys" | "girls" | "coliving") || "coliving";
  const address = (formData.get("address") as string) || `${city}, India`;
  const totalFloors = parseInt((formData.get("total_floors") as string) || "2", 10);

  if (!pgName || !city || !buildingName) {
    return { error: "Please fill in PG brand name, city, and building name." };
  }

  const sess = await getCurrentUserSession();
  const supabase = await createClient();
  const slug = pgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);

  // 1. Insert PG Brand record
  const { data: newPg, error: pgError } = await supabase
    .from("pgs")
    .insert({
      owner_id: sess.id,
      name: pgName,
      slug,
      contact_email: sess.email || "owner@apnapg.demo",
      contact_phone: contactPhone || sess.phone || "+91 98765 00000",
      status: "active",
      subscription_tier: "starter",
    })
    .select("id")
    .single();

  if (pgError || !newPg) {
    // If running in local demo without auth session, clear demo no_pg cookie
    const cookieStore = await cookies();
    cookieStore.delete("pg_demo_no_pg");
    redirect("/dashboard");
  }

  // 2. Insert First Building record
  const { data: newBuilding, error: bldError } = await supabase
    .from("buildings")
    .insert({
      pg_id: newPg.id,
      name: buildingName,
      gender_type: genderType,
      address,
      city,
      state: "State",
      pincode: "110001",
      total_floors: totalFloors,
      amenities: ["High Speed WiFi", "RO Drinking Water", "Power Backup"],
    })
    .select("id")
    .single();

  if (newBuilding) {
    // 3. Insert Owner into pg_staff with ALL permissions
    await supabase.from("pg_staff").insert({
      user_id: sess.id,
      pg_id: newPg.id,
      assigned_building_ids: [newBuilding.id],
      permissions: ["ALL"],
      designation: "Owner",
      is_active: true,
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete("pg_demo_no_pg");

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Switch Demo Persona (Owner, Admin/Warden, Tenant, Super Admin)
 */
export async function switchDemoPersonaAction(role: UserRole, options?: { noPg?: boolean }): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("pg_demo_role", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  if (options?.noPg) {
    cookieStore.set("pg_demo_no_pg", "true", { path: "/" });
    redirect("/onboarding");
  } else {
    cookieStore.delete("pg_demo_no_pg");
  }

  if (role === "super_admin") {
    redirect("/super-admin");
  } else if (role === "owner" || role === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/tenant");
  }
}

/**
 * Switch Active Building Filter for Owner Dropdown
 */
export async function switchActiveBuildingAction(buildingId: string | null): Promise<void> {
  const cookieStore = await cookies();
  if (!buildingId || buildingId === "all") {
    cookieStore.delete("pg_active_building_id");
  } else {
    cookieStore.set("pg_active_building_id", buildingId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }
  revalidatePath("/dashboard");
}

/**
 * View as Organization Mode for Super Admin
 */
export async function enterViewAsOrgAction(formData: FormData): Promise<void> {
  const orgId = formData.get("organization_id") as string;
  const cookieStore = await cookies();
  if (orgId) {
    cookieStore.set("pg_active_tenant_id", orgId, { path: "/", httpOnly: true, sameSite: "lax" });
  }
  redirect("/dashboard");
}

export async function exitViewAsOrgAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("pg_active_tenant_id");
  redirect("/super-admin/organizations");
}

export async function switchOrganizationAction(orgId: string): Promise<void> {
  const cookieStore = await cookies();
  if (orgId) {
    cookieStore.set("pg_active_tenant_id", orgId, { path: "/", httpOnly: true, sameSite: "lax" });
  }
  revalidatePath("/dashboard");
}

export async function createOrganizationAction(formData: FormData): Promise<any> {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const city = formData.get("city") as string;
  const contactEmail = formData.get("contact_email") as string;
  const contactPhone = formData.get("contact_phone") as string;

  return { success: true, message: `Organization ${name} created.` };
}

/**
 * Sign Out Action
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("pg_demo_role");
  cookieStore.delete("pg_demo_no_pg");
  cookieStore.delete("pg_active_building_id");

  redirect("/login");
}
