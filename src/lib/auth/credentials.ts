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

  // Normalize login email: if email is omitted or empty, use ${cleanPhone}@login.shunystays.app
  let loginEmail: string;
  if (email && email.trim().length > 0 && email.includes("@")) {
    loginEmail = email.trim().toLowerCase();
  } else if (cleanPhone.length >= 10) {
    loginEmail = `${cleanPhone}@login.shunystays.app`;
  } else {
    // Fallback if neither phone nor email provided
    const randomCode = Math.random().toString(36).substring(2, 8);
    loginEmail = `user.${randomCode}@login.shunystays.app`;
  }

  const loginId = cleanPhone || email || loginEmail;

  let userId = crypto.randomUUID();

  try {
    const admin = createAdminClient();

    // Check if user already exists with this email
    const { data: usersList } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = usersList?.users?.find(
      (u) => u.email?.toLowerCase() === loginEmail.toLowerCase()
    );

    if (existing) {
      userId = existing.id;
      // Update password so the user can immediately log in with the new credentials
      await admin.auth.admin.updateUserById(userId, {
        password,
        user_metadata: {
          full_name: name,
          role,
          phone: cleanPhone,
          pg_id: pgId || null,
        },
      });
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
          pg_id: pgId || null,
        },
      });

      if (!createErr && created?.user) {
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
  } catch (err) {
    console.warn("createOrUpdateCredentials fallback note:", err);
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
