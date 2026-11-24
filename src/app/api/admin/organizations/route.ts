import { NextResponse } from "next/server";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_TENANTS } from "@/lib/tenant/constants";

export const runtime = "edge";

export async function GET() {
 const session = await getCurrentUserSession();

 if (!session.is_super_admin) {
 return NextResponse.json(
 { error: "Forbidden: Super Admin access required." },
 { status: 403 }
 );
 }

 try {
 const admin = createAdminClient();
 const { data, error } = await (admin.from("organizations" as any) as any).select("*");

 if (error || !data || data.length === 0) {
 return NextResponse.json({ organizations: DEMO_TENANTS });
 }

 return NextResponse.json({ organizations: data });
 } catch (err: any) {
 return NextResponse.json({ organizations: DEMO_TENANTS });
 }
}

export async function POST(request: Request) {
 const session = await getCurrentUserSession();

 if (!session.is_super_admin) {
 return NextResponse.json(
 { error: "Forbidden: Super Admin access required." },
 { status: 403 }
 );
 }

 try {
 const body = await request.json();
 const { name, slug, contact_email, contact_phone, address } = body;

 if (!name || !slug || !contact_email) {
 return NextResponse.json(
 { error: "Missing required organization parameters" },
 { status: 400 }
 );
 }

 const admin = createAdminClient();
 const { data, error } = await (admin.from("organizations" as any) as any)
 .insert({
 name,
 slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
 contact_email,
 contact_phone: contact_phone || null,
 address: address || null,
 })
 .select()
 .single();

 if (error) {
 return NextResponse.json({ error: error.message }, { status: 400 });
 }

 return NextResponse.json({ success: true, organization: data });
 } catch (err: any) {
 return NextResponse.json(
 { error: err?.message || "Failed to create organization" },
 { status: 500 }
 );
 }
}
