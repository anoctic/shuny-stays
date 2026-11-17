import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUserSession } from "@/lib/auth/session";
import { DEMO_TENANTS } from "@/lib/tenant/constants";

export async function GET() {
  const session = await getCurrentUserSession();

  // If super admin, return all organizations
  if (session.is_super_admin) {
    return NextResponse.json({
      tenants: DEMO_TENANTS,
      is_super_admin: true,
    });
  }

  // Regular users (owner, resident) can only see their assigned organization
  const assigned = DEMO_TENANTS.filter((t) => t.id === session.organization_id);
  return NextResponse.json({
    tenants: assigned.length > 0 ? assigned : [DEMO_TENANTS[0]],
    is_super_admin: false,
  });
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUserSession();

    // STRICT CHECK: Only super_admin is allowed to switch organizations
    if (!session.is_super_admin) {
      return NextResponse.json(
        {
          error: "Forbidden: Only super_admin is authorized to switch organizations. Your organization is determined by your membership.",
        },
        { status: 403 }
      );
    }

    const { tenant_id } = await request.json();

    const tenant = DEMO_TENANTS.find((t) => t.id === tenant_id);
    if (!tenant) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("pg_active_tenant_id", tenant.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, activeTenant: tenant });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to switch organization" },
      { status: 500 }
    );
  }
}
