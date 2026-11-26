export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/super-admin", request.url));
  response.cookies.delete("pg_super_admin_viewing_pg_id");
  response.cookies.delete("pg_active_building_id");
  return response;
}
