export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const pgId = request.nextUrl.searchParams.get("pgId")?.trim();
  const dest = request.nextUrl.searchParams.get("to") === "dashboard" ? "/dashboard" : "/dashboard/rooms";

  if (!pgId) {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const [{ data: { user } }, { data: pg }] = await Promise.all([
      supabase.auth.getUser(),
      (admin.from("pgs" as any) as any).select("id").eq("id", pgId).maybeSingle(),
    ]);

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const cleanEmail = (user.email || "").toLowerCase().trim();
    const cleanPhone = (user.phone || (user.user_metadata?.phone as string) || "").replace(/\D/g, "");
    let isSuperAdmin =
      cleanEmail === "anoctic@gmail.com" ||
      cleanEmail.includes("superadmin") ||
      cleanPhone === "9027003865" ||
      cleanPhone === "9999900001" ||
      user.user_metadata?.role === "super_admin";

    if (!isSuperAdmin) {
      const { data: profile } = await (admin.from("profiles" as any) as any)
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      isSuperAdmin = profile?.role === "super_admin";
    }

    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!pg?.id) {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  const response = NextResponse.redirect(new URL(dest, request.url));
  response.cookies.set("pg_super_admin_viewing_pg_id", pgId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  response.cookies.delete("pg_active_building_id");
  return response;
}
