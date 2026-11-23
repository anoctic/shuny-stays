import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
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
      <DesktopSidebar
        role="tenant"
        fullName={session.full_name}
        pgName={session.pg_name || "Shuny Stays Luxury PG"}
        pendingDuesCount={1}
      />
      {/* Mobile Top Header (strictly lg:hidden) */}
      <MobileTopHeader
        fullName={session.full_name}
        role="tenant"
        pgName={session.pg_name || "Shuny Stays Luxury PG"}
        broadcasts={broadcasts}
      />
      {/* Desktop Top Utility Bar (strictly hidden lg:flex) */}
      <DesktopTopBar
        fullName={session.full_name}
        role="tenant"
        pgName={session.pg_name || "Shuny Stays Luxury PG"}
        broadcasts={broadcasts}
      />
      <main className="flex-1 p-4 pb-24 lg:pl-64 lg:p-8 lg:pb-12 overflow-y-auto">
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          {children}
        </div>
      </main>
      <MobileBottomNav role="tenant" pendingDuesCount={1} />
    </div>
  );
}
