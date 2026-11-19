import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types/schema.types";

export interface CreateCredentialsParams {
  name: string;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  pgId?: string | null;
  pgName?: string | null;
  buildingId?: string | null;
  roomNumber?: string | null;
  bedLabel?: string | null;
  permissions?: string[];
}

export interface GeneratedCredentials {
  success: boolean;
  userId: string;
  login_id: string; // Phone number or email
  email: string; // The normalized Supabase Auth email
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  pgName?: string;
  error?: string;
}

/**
 * Generates a clean, readable password like "Shuny@4821"
 */
export function generateReadablePassword(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Shuny@${digits}`;
}

/**
 * Normalizes a 10-digit Indian phone number
 */
export function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";
  const cleaned = rawPhone.replace(/\D/g, "");
  return cleaned.slice(-10);
}

/**
 * Server-side helper using Service Role Key to create or update user credentials
 * without logging out or modifying the currently active staff/owner session.
 */
export async function createOrUpdateCredentials(
  params: CreateCredentialsParams
): Promise<GeneratedCredentials> {
  const { name, phone, email, role, pgId, pgName, buildingId, permissions } = params;

  const cleanPhone = normalizePhone(phone);
  const password = generateReadablePassword();

  // CRITICAL FIX: Phone-first auth identifier.
  // When a 10-digit phone number is available, ALWAYS provision Supabase Auth using
  // ${cleanPhone}@login.shunystays.app so phone-based sign-in matches auth.users 100%.
  // Any real email is preserved in user_metadata.contact_email and profiles.email.
  let loginEmail: string;
  if (cleanPhone.length >= 10) {
    loginEmail = `${cleanPhone}@login.shunystays.app`;
  } else if (email && email.trim().length > 0 && email.includes("@")) {
    loginEmail = email.trim().toLowerCase();
  } else {
    // Fallback if neither phone nor email provided
    const randomCode = Math.random().toString(36).substring(2, 8);
    loginEmail = `user.${randomCode}@login.shunystays.app`;
  }

  const loginId = cleanPhone.length >= 10 ? cleanPhone : (email || loginEmail);

  let userId = crypto.randomUUID();

  try {
    const admin = createAdminClient();

    // Check if user already exists with this loginEmail or phone
    const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) {
      console.warn("admin.auth.admin.listUsers warning:", listErr.message);
    }

    const existing = usersList?.users?.find(
      (u) =>
        u.email?.toLowerCase() === loginEmail.toLowerCase() ||
        (cleanPhone.length >= 10 && (u.user_metadata?.phone === cleanPhone || (u.phone && normalizePhone(u.phone) === cleanPhone)))
    );

    if (existing) {
      userId = existing.id;
      // Update password and auto-confirm so the user can immediately log in
      const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
        password,
        email: loginEmail,
        email_confirm: true,
        user_metadata: {
          ...existing.user_metadata,
          full_name: name,
          role,
          phone: cleanPhone,
          contact_email: email ? email.trim().toLowerCase() : (existing.user_metadata?.contact_email || null),
          pg_id: pgId || existing.user_metadata?.pg_id || null,
        },
      });

      if (updateErr) {
        throw new Error(`Failed to update existing user credentials: ${updateErr.message}`);
      }
    } else {
      // Create new Supabase Auth user with confirmed email
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: loginEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role,
          phone: cleanPhone,
          contact_email: email ? email.trim().toLowerCase() : null,
          pg_id: pgId || null,
        },
      });

      if (createErr) {
        throw new Error(`Failed to create Supabase user: ${createErr.message}`);
      }

      if (created?.user) {
        userId = created.user.id;
      }
    }

    // Upsert into public.profiles
    await admin.from("profiles").upsert(
      {
        id: userId,
        full_name: name,
        role: role,
        phone: cleanPhone || null,
        email: email ? email.trim().toLowerCase() : loginEmail,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "id" }
    );

    // Link pg_staff or pgs based on role
    if (role === "owner" && pgId) {
      await admin.from("pg_staff").upsert(
        {
          pg_id: pgId,
          user_id: userId,
          role: "owner",
          permissions: ["ALL"],
          is_active: true,
        } as any,
        { onConflict: "pg_id,user_id" }
      );

      await (admin.from("pgs" as any) as any).update({ owner_id: userId } as any).eq("id", pgId);
    } else if (role === "admin" && pgId) {
      await admin.from("pg_staff").upsert(
        {
          pg_id: pgId,
          user_id: userId,
          role: "warden",
          permissions: permissions || [
            "manage_tenants",
            "collect_cash",
            "resolve_complaints",
            "manage_mess",
          ],
          is_active: true,
        } as any,
        { onConflict: "pg_id,user_id" }
      );
    }
  } catch (err: any) {
    console.error("createOrUpdateCredentials error:", err);
    return {
      success: false,
      userId,
      login_id: loginId,
      email: loginEmail,
      password,
      name,
      phone: cleanPhone,
      role,
      pgName: pgName || undefined,
      error: err?.message || String(err),
    };
  }

  return {
    success: true,
    userId,
    login_id: loginId,
    email: loginEmail,
    password,
    name,
    phone: cleanPhone,
    role,
    pgName: pgName || undefined,
  };
}
