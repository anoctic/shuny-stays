import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import { DesktopLayoutShell } from "@/components/layout/DesktopLayoutShell";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const session = await getCurrentUserSession();

 // If unauthenticated, redirect to login
 if (!session.id) {
 redirect("/login");
 }

 const broadcasts = await getActiveBroadcastsForRole("tenant");

 // If super_admin or owner/admin, redirect to respective portals
 if (session.role === "super_admin") {
 redirect("/super-admin");
 } else if (session.role === "owner" || session.role === "admin") {
 redirect("/dashboard");
 }

 return (
 <div className="flex-1 flex flex-col min-h-screen">
 <RealtimeSyncSubscriber
 tables={[
 "tenants",
 "rent_payments",
 "security_deposits",
 "attendance_logs",
 "complaints",
 "mess_menu",
 "gate_passes",
 "platform_broadcasts",
 ]}
 />
 <DesktopLayoutShell
 sidebar={
 <DesktopSidebar
 role="tenant"
 fullName={session.full_name}
 pgName={session.pg_name || "Shuny Stays Luxury PG"}
 pendingDuesCount={1}
 
            userId={session.id}
          />
 }
 mobileHeader={
 <MobileTopHeader
 fullName={session.full_name}
 role="tenant"
 pgName={session.pg_name || "Shuny Stays Luxury PG"}
 broadcasts={broadcasts}
 
            userId={session.id}
          />
 }
 topBar={
 <DesktopTopBar
 fullName={session.full_name}
 role="tenant"
 pgName={session.pg_name || "Shuny Stays Luxury PG"}
 broadcasts={broadcasts}
 
            userId={session.id}
          />
 }
 >
 {children}
 </DesktopLayoutShell>
 <MobileBottomNav role="tenant" pendingDuesCount={1} />
 </div>
 );
}
