import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import { DesktopLayoutShell } from "@/components/layout/DesktopLayoutShell";
import { Building } from "@/types/schema.types";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { getPlatformBillingSettings } from "@/lib/data/billing-settings";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";
import { SubscriptionStatusGuard } from "@/components/dashboard/SubscriptionStatusGuard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const session = await getCurrentUserSession();

 // Route guard: require valid authenticated session
 if (!session.id) {
 redirect("/login");
 }

 // Route guard: only owner and admin can access /dashboard
 if (session.role === "super_admin") {
 redirect("/super-admin");
 } else if (session.role === "tenant") {
 redirect("/tenant");
 }

 // If owner has no PG, redirect to onboarding wizard
 if (session.role === "owner" && !session.has_pg) {
 redirect("/onboarding");
 }

 const cookieStore = await cookies();
 const activeBuildingId = cookieStore.get("pg_active_building_id")?.value || null;

 // Fetch real buildings for this PG from Supabase
 let buildings: Building[] = [];
 try {
 const supabase = await createClient();
 let query = supabase.from("buildings").select("*");

 if (session.pg_id) {
 query = query.eq("pg_id", session.pg_id);
 }

 // If staff/admin, filter to their assigned buildings
 if (session.role === "admin" && session.assigned_building_ids && session.assigned_building_ids.length > 0) {
 query = query.in("id", session.assigned_building_ids);
 }

 const { data } = await query;
 if (data && data.length > 0) {
 buildings = data as Building[];
 }
 } catch (err) {
 console.error("Error fetching buildings in DashboardLayout:", err);
 }

 const broadcasts = await getActiveBroadcastsForRole(session.role);
 const platformSettings = await getPlatformBillingSettings();

 // Fetch PG subscription status & expiry for lock/expiry guard
 let pgDetails = {
 id: session.pg_id || "default",
 name: session.pg_name || "My PG Property",
 status: "active" as "active" | "pending" | "suspended",
 plan_expires_at: null as string | null,
 plan_price: 1999,
 plan_benefits: [] as string[],
 };

 if (session.pg_id) {
 try {
 const admin = createAdminClient();
 const { data: dbPg } = await (admin.from("pgs" as any) as any)
 .select("id, name, status, plan_expires_at, plan_price, plan_benefits")
 .eq("id", session.pg_id)
 .maybeSingle();

 if (dbPg) {
 pgDetails = {
 id: dbPg.id,
 name: dbPg.name || session.pg_name || "My PG Property",
 status: dbPg.status || "active",
 plan_expires_at: dbPg.plan_expires_at || null,
 plan_price: Number(dbPg.plan_price) || 1999,
 plan_benefits: Array.isArray(dbPg.plan_benefits)
 ? dbPg.plan_benefits
 : typeof dbPg.plan_benefits === "string"
 ? JSON.parse(dbPg.plan_benefits || "[]")
 : [],
 };
 }
 } catch (err) {
 console.warn("Could not fetch PG subscription details in layout:", err);
 }
 }

 return (
 <div className="flex-1 flex flex-col min-h-screen">
 <RealtimeSyncSubscriber
 tables={[
 "buildings",
 "rooms",
 "beds",
 "tenants",
 "rent_payments",
 "security_deposits",
 "attendance_logs",
 "complaints",
 "mess_menu",
 "gate_passes",
 "platform_broadcasts",
 "pgs",
 "platform_billing_settings",
 "pg_subscription_requests",
 ]}
 />
 <SubscriptionStatusGuard
 pg={pgDetails}
 platformSettings={platformSettings}
 userRole={session.role as "owner" | "admin"}
 />
 {/* Responsive App Shell: Desktop Collapsible Sidebar + Desktop TopBar + Mobile TopHeader */}
 <DesktopLayoutShell
 sidebar={
 <DesktopSidebar
 role={session.role}
 fullName={session.full_name}
 pgName={session.pg_name}
 buildings={buildings}
 activeBuildingId={activeBuildingId}
 openComplaintsCount={2}
 pendingPassesCount={1}
 pendingDuesCount={3}
 
            userId={session.id}
          />
 }
 mobileHeader={
 <MobileTopHeader
 fullName={session.full_name}
 role={session.role}
 pgName={session.pg_name}
 buildings={buildings}
 activeBuildingId={activeBuildingId}
 broadcasts={broadcasts}
 
            userId={session.id}
          />
 }
 topBar={
 <DesktopTopBar
 fullName={session.full_name}
 role={session.role}
 pgName={session.pg_name}
 buildings={buildings}
 activeBuildingId={activeBuildingId}
 broadcasts={broadcasts}
 
            userId={session.id}
          />
 }
 >
 {children}
 </DesktopLayoutShell>
 <MobileBottomNav role={session.role} openComplaintsCount={2} pendingDuesCount={3} />
 </div>
 );
}
