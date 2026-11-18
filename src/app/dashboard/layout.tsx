import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Building } from "@/types/schema.types";

export const runtime = "edge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

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
    if (session.pg_id) {
      let query = supabase.from("buildings").select("*").eq("pg_id", session.pg_id);

      // If staff/admin, filter to their assigned buildings
      if (session.role === "admin" && session.assigned_building_ids && session.assigned_building_ids.length > 0) {
        query = query.in("id", session.assigned_building_ids);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        buildings = data as Building[];
      }
    }
  } catch {
    // Keep fallback demo buildings
  }

  // Fallback demo buildings if database has no records yet
  if (buildings.length === 0) {
    buildings = [
      {
        id: "20000000-0000-0000-0000-000000000001",
        pg_id: session.pg_id || "10000000-0000-0000-0000-000000000001",
        name: "Block A - Krishna Bhawan",
        gender_type: "boys",
        address: "Plot 42, Knowledge Park III",
        city: "Greater Noida",
        state: "UP",
        pincode: "201310",
        warden_name: "Manoj Kumar",
        warden_phone: "+91 98765 12345",
        total_floors: 3,
        amenities: ["High Speed WiFi", "RO Water", "Power Backup"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "20000000-0000-0000-0000-000000000002",
        pg_id: session.pg_id || "10000000-0000-0000-0000-000000000001",
        name: "Block B - Saraswati Bhawan",
        gender_type: "girls",
        address: "Plot 43, Knowledge Park III",
        city: "Greater Noida",
        state: "UP",
        pincode: "201310",
        warden_name: "Sunita Devi",
        warden_phone: "+91 98765 54321",
        total_floors: 3,
        amenities: ["High Speed WiFi", "Biometric Entry", "Gym"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <MobileTopHeader
        fullName={session.full_name}
        role={session.role}
        pgName={session.pg_name}
        buildings={buildings}
        activeBuildingId={activeBuildingId}
      />
      <main className="flex-1 p-4 pb-24 overflow-y-auto">{children}</main>
      <MobileBottomNav role={session.role} openComplaintsCount={2} pendingDuesCount={3} />
    </div>
  );
}
