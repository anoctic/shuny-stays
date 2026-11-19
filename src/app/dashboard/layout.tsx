import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Building } from "@/types/schema.types";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";

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
        ]}
      />
      <MobileTopHeader
        fullName={session.full_name}
        role={session.role}
        pgName={session.pg_name}
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        broadcasts={broadcasts}
      />
      <main className="flex-1 p-4 pb-24 overflow-y-auto">{children}</main>
      <MobileBottomNav role={session.role} openComplaintsCount={2} pendingDuesCount={3} />
    </div>
  );
}
