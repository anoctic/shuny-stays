export const runtime = "edge";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ProfileRow {
 role?: string;
 pg_id?: string | null;
}

interface PgRow {
 id: string;
}

export async function GET() {
 try {
 const supabase = await createClient();
 const {
 data: { user },
 error: authError,
 } = await supabase.auth.getUser();

 if (authError || !user) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 // Default to metadata role or tenant
 let role = (user.user_metadata?.role as string) || "tenant";
 let profilePgId: string | null = null;

 // Query profiles table for role and pg_id if present
 try {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const { data: profile } = (await (supabase.from("profiles" as any) as any)
 .select("*")
 .eq("id", user.id)
 .maybeSingle()) as { data: ProfileRow | null; error: unknown };

 if (profile) {
 if (profile.role) {
 role = profile.role;
 }
 if (profile.pg_id) {
 profilePgId = profile.pg_id;
 }
 }
 } catch (profileErr) {
 console.warn("Could not query profiles table:", profileErr);
 }

 // Role-based destination resolver
 if (role === "super_admin") {
 return NextResponse.json({ redirectTo: "/super-admin" });
 }

 if (role === "owner") {
 let hasPg = Boolean(profilePgId);

 // Check pgs table for owner record
 if (!hasPg) {
 try {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const { data: pg } = (await (supabase.from("pgs" as any) as any)
 .select("id")
 .eq("owner_id", user.id)
 .limit(1)
 .maybeSingle()) as { data: PgRow | null; error: unknown };

 if (pg?.id) {
 hasPg = true;
 }
 } catch (pgErr) {
 console.warn("Could not query pgs table:", pgErr);
 }
 }

 return NextResponse.json({
 redirectTo: hasPg ? "/dashboard" : "/onboarding",
 });
 }

 if (role === "admin") {
 return NextResponse.json({ redirectTo: "/dashboard" });
 }

 // Default tenant destination
 return NextResponse.json({ redirectTo: "/tenant" });
 } catch (err: unknown) {
 const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
 console.error("Error in /api/auth/resolve-role:", errorMessage);
 // Always return a JSON response quickly and never hang
 return NextResponse.json(
 { redirectTo: "/dashboard", error: errorMessage },
 { status: 200 }
 );
 }
}

export async function POST() {
 return GET();
}
