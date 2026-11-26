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
import { exitSuperAdminPgSetupAction } from "@/app/actions/auth";

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
  const buildingsPromise = (async (): Promise<Building[]> => {
    try {
      const client = session.is_super_admin_setup_mode ? createAdminClient() : await createClient();
      let query = (client.from("buildings" as any) as any).select("*");
      if (session.pg_id) {
        query = query.eq("pg_id", session.pg_id);
      }
      if (session.role === "admin" && session.assigned_building_ids && session.assigned_building_ids.length > 0) {
        query = query.in("id", session.assigned_building_ids);
      }
      const { data } = await query;
      return (data && data.length > 0 ? (data as Building[]) : []);
    } catch (err) {
      console.error("Error fetching buildings in DashboardLayout:", err);
      return [];
    }
  })();

  const pgDetailsPromise = (async () => {
    if (!session.pg_id) return null;
    try {
      const admin = createAdminClient();
      const { data: dbPg } = await (admin.from("pgs" as any) as any)
        .select("id, name, status, plan_expires_at, plan_price, plan_benefits")
        .eq("id", session.pg_id)
        .maybeSingle();
      return dbPg;
    } catch (err) {
      console.warn("Could not fetch PG subscription details in layout:", err);
      return null;
    }
  })();

  const [buildings, broadcasts, platformSettings, dbPg] = await Promise.all([
    buildingsPromise,
    getActiveBroadcastsForRole(session.role),
    getPlatformBillingSettings(),
    pgDetailsPromise,
  ]);

  // Fetch PG subscription status & expiry for lock/expiry guard
  let pgDetails = {
    id: session.pg_id || "default",
    name: session.pg_name || "My PG Property",
    status: "active" as "active" | "pending" | "suspended",
    plan_expires_at: null as string | null,
    plan_price: 1999,
    plan_benefits: [] as string[],
  };

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
 {session.is_super_admin_setup_mode ? (
          <div className="bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-900 text-white px-4 py-2 text-xs flex items-center justify-between gap-3 border-b border-indigo-500/30 z-[60]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0">
                Super Admin Setup Mode
              </span>
              <span className="truncate font-semibold text-indigo-100">
                Managing <strong className="text-white font-black">{session.pg_name || pgDetails.name}</strong>
              </span>
            </div>
            <form action={exitSuperAdminPgSetupAction}>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-extrabold text-[11px] border border-white/20 transition shrink-0 cursor-pointer"
              >
                ← Back to Super Admin
              </button>
            </form>
          </div>
        ) : (
          <SubscriptionStatusGuard
            pg={pgDetails}
            platformSettings={platformSettings}
            userRole={session.role as "owner" | "admin"}
          />
        )}
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
 />
 }
 >
 {children}
 </DesktopLayoutShell>
 <MobileBottomNav role={session.role} openComplaintsCount={2} pendingDuesCount={3} />
 </div>
 );
}
