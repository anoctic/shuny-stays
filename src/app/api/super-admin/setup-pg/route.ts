export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const session = await getCurrentUserSession();
  if (!session.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!session.is_super_admin && session.role !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const pgId = request.nextUrl.searchParams.get("pgId")?.trim();
  const dest = request.nextUrl.searchParams.get("to") === "dashboard" ? "/dashboard" : "/dashboard/rooms";

  if (!pgId) {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  try {
    const admin = createAdminClient();
    const { data: pg } = await (admin.from("pgs" as any) as any)
      .select("id")
      .eq("id", pgId)
      .maybeSingle();

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
