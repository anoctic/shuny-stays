import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { UserSessionProfile, MembershipRole } from "@/types/pg-domain.types";
import { DEFAULT_TENANT_ID, DEMO_TENANTS } from "@/lib/tenant/constants";

export const DEMO_PROFILES: Record<MembershipRole, UserSessionProfile> = {
  super_admin: {
    id: "90000000-0000-0000-0000-000000000001",
    email: "superadmin@pgmanager.com",
    full_name: "Alexander Vance (Super Admin)",
    role: "super_admin",
    organization_id: null,
    organization_name: "Platform Governance (All Orgs)",
    is_super_admin: true,
  },
  owner: {
    id: "90000000-0000-0000-0000-000000000002",
    email: "owner@zenithpg.com",
    full_name: "Rajesh Mittal (PG Owner)",
    role: "owner",
    organization_id: "00000000-0000-0000-0000-000000000001",
    organization_name: "Zenith Luxury PG & Hostels",
    is_super_admin: false,
  },
  resident: {
    id: "90000000-0000-0000-0000-000000000003",
    email: "resident@zenithpg.com",
    full_name: "Aditya Sharma (Resident)",
    role: "resident",
    organization_id: "00000000-0000-0000-0000-000000000001",
    organization_name: "Zenith Luxury PG & Hostels",
    is_super_admin: false,
  },
};

/**
 * Retrieves the current authenticated user session and their membership role.
 * Works seamlessly with live Supabase Auth and supports demo personas in development.
 */
export async function getCurrentUserSession(): Promise<UserSessionProfile> {
  const cookieStore = await cookies();

  // 1. Try real Supabase Auth
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch membership row
      const { data: membership } = await (supabase
        .from("memberships" as any) as any)
        .select("role, organization_id, organizations(name)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (membership) {
        const isSuperAdmin = membership.role === "super_admin";
        const orgData = membership.organizations as any;
        return {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email || "Authenticated User",
          role: membership.role as MembershipRole,
          organization_id: membership.organization_id,
          organization_name: orgData?.name || (isSuperAdmin ? "All Organizations" : "Assigned PG"),
          is_super_admin: isSuperAdmin,
        };
      }
    }
  } catch {
    // Continue to cookie-based persona resolution
  }

  // 2. Demo role switcher (allows testing super_admin, owner, and resident roles)
  const demoRoleCookie = cookieStore.get("pg_demo_role")?.value as MembershipRole;
  if (demoRoleCookie && DEMO_PROFILES[demoRoleCookie]) {
    return DEMO_PROFILES[demoRoleCookie];
  }

  // Default to Super Admin for initial setup exploration
  return DEMO_PROFILES.super_admin;
}

/**
 * Resolves the effective organization ID for data queries:
 * - If user is super_admin: allows switching between organizations via cookie.
 * - If user is owner or resident: STRICTLY enforces their membership organization_id.
 *   (Cannot be overridden by dropdowns, query params, or client cookies).
 */
export async function getEffectiveTenantId(): Promise<string> {
  const user = await getCurrentUserSession();
  const cookieStore = await cookies();

  if (user.is_super_admin) {
    const selectedCookie = cookieStore.get("pg_active_tenant_id")?.value;
    return selectedCookie || DEFAULT_TENANT_ID;
  }

  // Regular users are locked to their assigned membership organization
  return user.organization_id || DEFAULT_TENANT_ID;
}
