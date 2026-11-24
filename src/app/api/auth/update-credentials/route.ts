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
 * Supports calls from AccountSecurityCard (currentPassword, newLoginIdentifier, newPassword)
 * as well as direct management calls (userId, name, phone, email, password).
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

 // Determine caller role from profiles or metadata
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
 currentPassword,
 newLoginIdentifier,
 newPassword,
 } = body;

 const finalPassword = (newPassword || password || "").trim();
 const finalIdentifier = (newLoginIdentifier || "").trim();

 // Authorization check: only super_admin, owner, or staff (admin) can update other users
 const isSelf = targetUserId === callerUser.id;
 const isStaffOrAdmin = ["super_admin", "owner", "admin"].includes(callerRole);

 if (!isSelf && !isStaffOrAdmin) {
 return NextResponse.json(
 { success: false, error: "Forbidden: Cannot update other user credentials." },
 { status: 403 }
 );
 }

 // If caller is updating own password or login ID, verify currentPassword if provided
 if (isSelf && currentPassword) {
 const loginEmail = callerUser.email || "";
 const { error: verifyErr } = await supabase.auth.signInWithPassword({
 email: loginEmail,
 password: currentPassword,
 });

 if (verifyErr) {
 return NextResponse.json(
 { success: false, error: "Incorrect current password. Please re-enter your current password." },
 { status: 400 }
 );
 }
 }

 const admin = createAdminClient();

 // Prepare auth.users update payload
 const authUpdatePayload: any = {};
 const metadataUpdate: any = {};

 if (finalPassword && finalPassword.length >= 6) {
 authUpdatePayload.password = finalPassword;
 }

 let resolvedPhone: string | undefined = phone ? normalizePhone(phone) : undefined;
 let resolvedEmail: string | undefined = email ? email.trim().toLowerCase() : undefined;

 if (finalIdentifier) {
 const cleaned = finalIdentifier.replace(/\D/g, "");
 if (cleaned.length >= 10) {
 resolvedPhone = cleaned.slice(-10);
 resolvedEmail = `${resolvedPhone}@login.shunystays.app`;
 } else if (finalIdentifier.includes("@")) {
 resolvedEmail = finalIdentifier.toLowerCase();
 }
 }

 if (resolvedPhone && resolvedPhone.length >= 10) {
 authUpdatePayload.phone = resolvedPhone;
 metadataUpdate.phone = resolvedPhone;
 // Phone-first auth format
 authUpdatePayload.email = `${resolvedPhone}@login.shunystays.app`;
 authUpdatePayload.email_confirm = true;
 } else if (resolvedEmail && resolvedEmail.includes("@")) {
 authUpdatePayload.email = resolvedEmail;
 authUpdatePayload.email_confirm = true;
 }

 if (name) {
 metadataUpdate.full_name = name.trim();
 }
 if (resolvedEmail && !resolvedEmail.endsWith("@login.shunystays.app")) {
 metadataUpdate.contact_email = resolvedEmail;
 }

 if (Object.keys(metadataUpdate).length > 0) {
 const { data: existingUserData } = await admin.auth.admin.getUserById(targetUserId);
 authUpdatePayload.user_metadata = {
 ...(existingUserData?.user?.user_metadata || {}),
 ...metadataUpdate,
 };
 }

 // 1. Update auth.users atomically via admin client
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
 if (resolvedPhone) profileUpdatePayload.phone = resolvedPhone;
 if (resolvedEmail) profileUpdatePayload.email = resolvedEmail;

 const { error: profileErr } = await (admin.from("profiles" as any) as any)
 .update(profileUpdatePayload)
 .eq("id", targetUserId);

 if (profileErr) {
 return NextResponse.json(
 { success: false, error: `Failed to update public.profiles: ${profileErr.message}` },
 { status: 500 }
 );
 }

 const returnLoginId = resolvedPhone || resolvedEmail || callerUser.email;

 return NextResponse.json({
 success: true,
 userId: targetUserId,
 loginId: returnLoginId,
 message: "Credentials and profile updated successfully in Supabase.",
 });
 } catch (err: unknown) {
 const errorMsg = err instanceof Error ? err.message : "Internal error updating credentials.";
 return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
 }
}
