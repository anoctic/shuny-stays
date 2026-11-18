import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateCredentials } from "@/lib/auth/credentials";
import { UserRole } from "@/types/schema.types";

/**
 * POST /api/create-credentials
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY via createAdminClient so creating/updating
 * credentials does not affect or log out the active staff/owner session.
 *
 * Body JSON:
 * {
 *   name: string,
 *   phone?: string,
 *   email?: string,
 *   role: "owner" | "admin" | "tenant" | "super_admin",
 *   pgId?: string,
 *   pgName?: string,
 *   buildingId?: string,
 *   roomNumber?: string,
 *   bedLabel?: string,
 *   permissions?: string[]
 * }
 *
 * Returns:
 * {
 *   success: true,
 *   login_id: string, // 10-digit phone number or email
 *   password: string, // Readable password e.g. "Shuny@4821"
 *   email: string,    // Normalized Supabase auth email
 *   role: string,
 *   name: string,
 *   phone: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
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
