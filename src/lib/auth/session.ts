import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/schema.types";

export interface CurrentUserSession {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  // PG Owner details
  pg_id?: string | null;
  pg_name?: string | null;
  has_pg: boolean;
  // Staff/Admin details
  assigned_building_ids?: string[];
  permissions?: string[];
  // Tenant details
  building_id?: string | null;
  room_id?: string | null;
  bed_id?: string | null;
  // Governance & Multi-tenant helpers
  is_super_admin?: boolean;
  organization_id?: string | null;
}

export const DEMO_USERS: Record<UserRole, CurrentUserSession> = {
  super_admin: {
    id: "90000000-0000-0000-0000-000000000001",
    email: "superadmin@apnapg.com",
    full_name: "Super Administrator",
    role: "super_admin",
    phone: "+91 99999 00001",
    has_pg: true,
    is_super_admin: true,
  },
  owner: {
    id: "90000000-0000-0000-0000-000000000002",
    email: "owner@stanzaliving.com",
    full_name: "Rajesh Sharma",
    role: "owner",
    phone: "+91 98765 43210",
    pg_id: "10000000-0000-0000-0000-000000000001",
    pg_name: "Stanza Living Residency",
    has_pg: true,
  },
  admin: {
    id: "90000000-0000-0000-0000-000000000003",
    email: "warden@stanzaliving.com",
    full_name: "Manoj Kumar (Warden)",
    role: "admin",
    phone: "+91 98765 12345",
    pg_id: "10000000-0000-0000-0000-000000000001",
    pg_name: "Stanza Living Residency",
    has_pg: true,
    assigned_building_ids: ["20000000-0000-0000-0000-000000000001"],
    permissions: ["manage_tenants", "collect_cash", "resolve_complaints", "manage_mess"],
  },
  tenant: {
    id: "90000000-0000-0000-0000-000000000004",
    email: "aarav.patel@student.com",
    full_name: "Aarav Patel",
    role: "tenant",
    phone: "+91 91234 56789",
    pg_id: "10000000-0000-0000-0000-000000000001",
    pg_name: "Stanza Living Residency",
    has_pg: true,
    building_id: "20000000-0000-0000-0000-000000000001",
    room_id: "30000000-0000-0000-0000-000000000001",
    bed_id: "40000000-0000-0000-0000-000000000001",
  },
};

/**
 * Retrieves the current authenticated user session and their role.
 * Queries Supabase `profiles` & `pgs` tables, with fallback to demo personas for development.
 */
export async function getCurrentUserSession(): Promise<CurrentUserSession> {
  const cookieStore = await cookies();

  // 1. Check if demo persona override cookie is set
  const demoRole = cookieStore.get("pg_demo_role")?.value as UserRole | undefined;
  if (demoRole && DEMO_USERS[demoRole]) {
    // If owner has demo no-pg cookie, simulate first-time onboarding
    const noPgCookie = cookieStore.get("pg_demo_no_pg")?.value;
    if (demoRole === "owner" && noPgCookie === "true") {
      return {
        ...DEMO_USERS.owner,
        pg_id: null,
        pg_name: null,
        has_pg: false,
      };
    }
    return DEMO_USERS[demoRole];
  }

  // 2. Real Supabase Auth Session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes("placeholder")) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch profile
        const { data: profile } = await (supabase.from("profiles" as any) as any)
          .select("id, role, full_name, phone")
          .eq("id", user.id)
          .single();

        const role = (profile?.role as UserRole) || "tenant";
        const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

        let pgId: string | null = null;
        let pgName: string | null = null;
        let hasPg = false;
        let assignedBuildings: string[] = [];
        let permissions: string[] = [];
        let buildingId: string | null = null;
        let roomId: string | null = null;
        let bedId: string | null = null;

        if (role === "owner") {
          const { data: pg } = await (supabase.from("pgs" as any) as any)
            .select("id, name")
            .eq("owner_id", user.id)
            .limit(1)
            .maybeSingle();

          if (pg) {
            pgId = pg.id;
            pgName = pg.name;
            hasPg = true;
          }
        } else if (role === "admin") {
          const { data: staff } = await (supabase.from("pg_staff" as any) as any)
            .select("pg_id, assigned_building_ids, permissions")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle();

          if (staff) {
            pgId = staff.pg_id;
            assignedBuildings = staff.assigned_building_ids || [];
            permissions = staff.permissions || [];
            hasPg = true;
          }
        } else if (role === "tenant") {
          const { data: tenant } = await (supabase.from("tenants" as any) as any)
            .select("pg_id, building_id, room_id, bed_id")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle();

          if (tenant) {
            pgId = tenant.pg_id;
            buildingId = tenant.building_id;
            roomId = tenant.room_id;
            bedId = tenant.bed_id;
            hasPg = true;
          }
        } else if (role === "super_admin") {
          hasPg = true;
        }

        return {
          id: user.id,
          email: user.email || "",
          full_name: fullName,
          role,
          phone: profile?.phone || user.user_metadata?.phone,
          pg_id: pgId,
          pg_name: pgName,
          has_pg: hasPg,
          assigned_building_ids: assignedBuildings,
          permissions,
          building_id: buildingId,
          room_id: roomId,
          bed_id: bedId,
          is_super_admin: role === "super_admin",
          organization_id: pgId,
        };
      }
    } catch {
      // Fallback to default owner demo profile if network or session check fails
    }
  }

  // Default fallback for development preview
  return DEMO_USERS.owner;
}
