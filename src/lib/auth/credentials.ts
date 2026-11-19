/* eslint-disable @typescript-eslint/no-explicit-any */
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
  login_id: string; // Clean 10-digit phone number or email
  email: string; // The normalized Supabase Auth email (${cleanPhone}@login.shunystays.app)
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
 * Strips +91, 91 prefix, leading zeros, and all non-digits.
 */
export function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.replace(/\D/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.slice(-10);
}

/**
 * Server-side helper using Service Role Key to create or update user credentials
 * in Supabase Auth and public.profiles.
 *
 * Never fails silently: Throws or returns exact error if SUPABASE_SERVICE_ROLE_KEY
 * is missing or auth provisioning fails.
 */
export async function createOrUpdateCredentials(
  params: CreateCredentialsParams
): Promise<GeneratedCredentials> {
  const { name, phone, email, role, pgId, pgName, permissions } = params;

  const cleanPhone = normalizePhone(phone);
  const password = generateReadablePassword();

  // Strict Phone-First Authentication Identifier:
  // When a 10-digit phone number is available, ALWAYS provision Supabase Auth using
  // ${cleanPhone}@login.shunystays.app so phone-based sign-in matches auth.users 100%.
  // Contact email is saved in profiles.email and user_metadata.contact_email.
  let loginEmail: string;
  if (cleanPhone.length === 10) {
    loginEmail = `${cleanPhone}@login.shunystays.app`;
  } else if (email && email.trim().length > 0 && email.includes("@")) {
    loginEmail = email.trim().toLowerCase();
  } else {
    return {
      success: false,
      userId: "",
      login_id: "",
      email: "",
      password: "",
      name,
      phone: cleanPhone,
      role,
      error: "Valid 10-digit mobile number or email address is required.",
    };
  }

  const loginId = cleanPhone.length === 10 ? cleanPhone : (email || loginEmail);
  let userId = crypto.randomUUID();

  try {
    const admin = createAdminClient();

    // Check if user already exists with this loginEmail or phone
    const { data: usersList, error: listErr } =
      await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) {
      console.warn("admin.auth.admin.listUsers warning:", listErr.message);
    }

    // Priority 1: Match exact loginEmail (e.g. 9027003865@login.shunystays.app)
    let existing = usersList?.users?.find(
      (u) => u.email?.toLowerCase() === loginEmail.toLowerCase()
    );

    // Priority 2: Match by phone field if available
    if (!existing && cleanPhone.length === 10) {
      existing = usersList?.users?.find(
        (u) => u.phone && normalizePhone(u.phone) === cleanPhone
      );
    }

    // Priority 3: Match by user_metadata.phone
    if (!existing && cleanPhone.length === 10) {
      existing = usersList?.users?.find(
        (u) =>
          u.user_metadata?.phone &&
          normalizePhone(u.user_metadata.phone) === cleanPhone
      );
    }

    if (existing) {
      userId = existing.id;
      // Update password and auto-confirm email so the user can immediately log in
      const { error: updateErr } = await admin.auth.admin.updateUserById(
        userId,
        {
          password,
          email: loginEmail,
          email_confirm: true,
          user_metadata: {
            ...existing.user_metadata,
            full_name: name,
            role,
            phone: cleanPhone,
            contact_email: email
              ? email.trim().toLowerCase()
              : existing.user_metadata?.contact_email || null,
            pg_id: pgId || existing.user_metadata?.pg_id || null,
            email_verified: true,
          },
        }
      );

      if (updateErr) {
        throw new Error(
          `Failed to update existing Supabase Auth user credentials: ${updateErr.message}`
        );
      }
    } else {
      // Create new Supabase Auth user with confirmed email
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email: loginEmail,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            role,
            phone: cleanPhone,
            contact_email: email ? email.trim().toLowerCase() : null,
            pg_id: pgId || null,
            email_verified: true,
          },
        });

      if (createErr || !created?.user) {
        const errMsg = createErr?.message || "User creation failed";
        if (
          errMsg.toLowerCase().includes("already registered") ||
          errMsg.toLowerCase().includes("already exists") ||
          errMsg.toLowerCase().includes("duplicate")
        ) {
          // Re-fetch list of users to find them and update
          const { data: retryList } = await admin.auth.admin.listUsers({ perPage: 1000 });
          const userMatch = retryList?.users?.find(
            (u) =>
              u.email?.toLowerCase() === loginEmail.toLowerCase() ||
              (cleanPhone.length === 10 && u.phone && normalizePhone(u.phone) === cleanPhone) ||
              (cleanPhone.length === 10 &&
                u.user_metadata?.phone &&
                normalizePhone(u.user_metadata.phone) === cleanPhone)
          );
          if (userMatch) {
            userId = userMatch.id;
            await admin.auth.admin.updateUserById(userId, {
              password,
              email: loginEmail,
              email_confirm: true,
              user_metadata: {
                ...userMatch.user_metadata,
                full_name: name,
                role,
                phone: cleanPhone,
                contact_email: email ? email.trim().toLowerCase() : null,
                pg_id: pgId || null,
                email_verified: true,
              },
            });
          } else {
            throw new Error(`Failed to create Supabase Auth user: ${errMsg}`);
          }
        } else {
          throw new Error(`Failed to create Supabase Auth user: ${errMsg}`);
        }
      }

      if (!created.user?.id) {
        throw new Error("Failed to create Supabase Auth user: No user ID returned.");
      }

      userId = created.user.id;
    }

    // Upsert into public.profiles
    const profilePayload: Record<string, any> = {
      id: userId,
      full_name: name,
      role: role,
      phone: cleanPhone || null,
      email: email ? email.trim().toLowerCase() : loginEmail,
      updated_at: new Date().toISOString(),
    };
    if (pgId) {
      // Only set pg_id if pgId already exists in pgs table to prevent foreign key violation 23503
      const { data: pgExists } = await (admin.from("pgs" as any) as any)
        .select("id")
        .eq("id", pgId)
        .maybeSingle();
      if (pgExists?.id) {
        profilePayload.pg_id = pgId;
      }
    }

    const { error: profileErr } = await admin
      .from("profiles")
      .upsert(profilePayload as any, { onConflict: "id" });

    if (profileErr) {
      throw new Error(`Failed to upsert public.profiles record: ${profileErr.message}`);
    }

    // Link pg_staff and pgs based on role
    if (role === "owner" && pgId) {
      await admin.from("pg_staff").upsert(
        {
          pg_id: pgId,
          user_id: userId,
          designation: "Owner",
          permissions: ["ALL"],
          is_active: true,
        } as any,
        { onConflict: "pg_id,user_id" }
      );

      await (admin.from("pgs" as any) as any)
        .update({ owner_id: userId } as any)
        .eq("id", pgId);
    } else if (role === "admin" && pgId) {
      await admin.from("pg_staff").upsert(
        {
          pg_id: pgId,
          user_id: userId,
          designation: "Warden",
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
    const errorMsg = err?.message || String(err);
    console.error("createOrUpdateCredentials error:", errorMsg);
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
      error: errorMsg,
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
