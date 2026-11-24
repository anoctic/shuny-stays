import { NextResponse } from "next/server";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_PG_TABLES } from "@/lib/mock-data";

export const runtime = "edge";

export async function GET() {
 try {
 // Verify super_admin privilege
 const session = await getCurrentUserSession();
 if (!session.is_super_admin) {
 return NextResponse.json(
 { error: "Forbidden: Schema introspection is restricted to super_admin." },
 { status: 403 }
 );
 }

 // Service role client is isolated to server-side code
 const supabase = createAdminClient();

 // Try introspecting live Supabase Postgres schema via RPC
 const { data, error } = await (supabase.rpc as any)("pg_admin_get_tables");

 if (error || !data) {
 return NextResponse.json({
 tables: MOCK_PG_TABLES,
 source: "mock_catalog",
 });
 }

 return NextResponse.json({
 tables: data,
 source: "live_postgres",
 });
 } catch (err: any) {
 return NextResponse.json(
 { error: err?.message || "Internal error" },
 { status: 500 }
 );
 }
}
