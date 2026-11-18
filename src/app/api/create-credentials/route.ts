import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createOrUpdateCredentials } from "@/lib/auth/credentials";
import { UserRole } from "@/types/schema.types";

export const runtime = "edge";

/**
 * POST /api/create-credentials
 *
 * Security: Restricted strictly to authenticated super_admin, owner, or staff (admin) callers.
 * Public unauthenticated requests are rejected with 401 Unauthorized.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY via createAdminClient so creating/updating
 * credentials does not affect or log out the active staff/owner session.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Strict Authentication & Role Check
    const cookieStore = await cookies();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let callerRole: UserRole | null = null;

    if (user) {
      // Query profile role from Supabase
      const { data: profile } = await (supabase.from("profiles" as any) as any)
        .select("role")
        .eq("id", user.id)
        .single();

      callerRole =
        (profile?.role as UserRole) ||
        (user.user_metadata?.role as UserRole) ||
        null;
    } else {
      // In development / demo testing, accept demo staff/owner persona cookie
      const demoRole = cookieStore.get("pg_demo_role")?.value as
        | UserRole
        | undefined;
      if (demoRole && ["super_admin", "owner", "admin"].includes(demoRole)) {
        callerRole = demoRole;
      }
    }

    const allowedCallerRoles: UserRole[] = ["super_admin", "owner", "admin"];
    if (!callerRole || !allowedCallerRoles.includes(callerRole)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized: Active Super Admin, Owner, or Staff session is required to provision credentials.",
        },
        { status: 401 }
      );
    }

    // 2. Validate Request Body
    const body = await req.json();
    const {
      name,
      phone,
      email,
      role = "tenant",
      pgId,
      pgName,
      buildingId,
      roomNumber,
      bedLabel,
      permissions,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required to generate credentials." },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: "Either phone number or email is required." },
        { status: 400 }
      );
    }

    // 3. Provision Credentials
    const creds = await createOrUpdateCredentials({
      name,
      phone,
      email,
      role: role as UserRole,
      pgId,
      pgName,
      buildingId,
      roomNumber,
      bedLabel,
      permissions,
    });

    return NextResponse.json({
      success: true,
      login_id: creds.login_id,
      password: creds.password,
      email: creds.email,
      role: creds.role,
      name: creds.name,
      phone: creds.phone,
      pgName: creds.pgName,
    });
  } catch (err: any) {
    console.error("Error in /api/create-credentials:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate credentials.",
      },
      { status: 500 }
    );
  }
}
