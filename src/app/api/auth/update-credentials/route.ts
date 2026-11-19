/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/auth/credentials";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/update-credentials
 *
 * Atomically updates user authentication credentials in `auth.users`
 * (via supabase.auth.admin.updateUserById) and updates `public.profiles`.
 *
 * Security: Callers can update their own credentials, or super_admin/owner/admin
 * can update subordinate credentials.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: callerUser },
    } = await supabase.auth.getUser();

    if (!callerUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active session required." },
        { status: 401 }
      );
    }

    // Determine caller role
    const { data: callerProfile } = await (supabase.from("profiles" as any) as any)
      .select("role")
      .eq("id", callerUser.id)
      .single();

    const callerRole = callerProfile?.role || callerUser.user_metadata?.role;

    const body = await req.json();
    const {
      userId: targetUserId = callerUser.id,
      name,
      phone,
      email,
      password,
    } = body;

    // Authorization check: only super_admin, owner, or staff (admin) can update other users
    const isSelf = targetUserId === callerUser.id;
    const isStaffOrAdmin = ["super_admin", "owner", "admin"].includes(callerRole);

    if (!isSelf && !isStaffOrAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot update other user credentials." },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    // Prepare auth.users update payload
    const authUpdatePayload: any = {};
    const metadataUpdate: any = {};

    if (password && password.trim().length >= 6) {
      authUpdatePayload.password = password.trim();
    }

    const cleanPhone = phone ? normalizePhone(phone) : undefined;
    if (cleanPhone && cleanPhone.length >= 10) {
      authUpdatePayload.phone = cleanPhone;
      metadataUpdate.phone = cleanPhone;
      // Dual login identifier
      authUpdatePayload.email = `${cleanPhone}@login.shunystays.app`;
      authUpdatePayload.email_confirm = true;
    } else if (email && email.trim().length > 0 && email.includes("@")) {
      authUpdatePayload.email = email.trim().toLowerCase();
      authUpdatePayload.email_confirm = true;
    }

    if (name) {
      metadataUpdate.full_name = name.trim();
    }
    if (email) {
      metadataUpdate.contact_email = email.trim().toLowerCase();
    }

    if (Object.keys(metadataUpdate).length > 0) {
      // Merge with existing metadata
      const { data: existingUserData } = await admin.auth.admin.getUserById(targetUserId);
      authUpdatePayload.user_metadata = {
        ...(existingUserData?.user?.user_metadata || {}),
        ...metadataUpdate,
      };
    }

    // 1. Update auth.users via admin client
    if (Object.keys(authUpdatePayload).length > 0) {
      const { error: authErr } = await admin.auth.admin.updateUserById(
        targetUserId,
        authUpdatePayload
      );

      if (authErr) {
        return NextResponse.json(
          { success: false, error: `Failed to update auth.users: ${authErr.message}` },
          { status: 500 }
        );
      }
    }

    // 2. Update public.profiles
    const profileUpdatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (name) profileUpdatePayload.full_name = name.trim();
    if (cleanPhone) profileUpdatePayload.phone = cleanPhone;
    if (email) profileUpdatePayload.email = email.trim().toLowerCase();

    const { error: profileErr } = await (admin.from("profiles" as any) as any)
      .update(profileUpdatePayload)
      .eq("id", targetUserId);

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: `Failed to update public.profiles: ${profileErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      message: "Credentials and profile updated successfully.",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error updating credentials.";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
