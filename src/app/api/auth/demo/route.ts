import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/schema.types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get("role") || "owner") as UserRole;
  
  let redirectUrl = new URL("/dashboard", request.url);
  if (role === "super_admin") {
    redirectUrl = new URL("/super-admin", request.url);
  } else if (role === "tenant") {
    redirectUrl = new URL("/tenant", request.url);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("pg_demo_role", role, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  response.cookies.delete("pg_demo_no_pg");

  return response;
}
