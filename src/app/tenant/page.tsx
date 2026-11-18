import { getCurrentUserSession } from "@/lib/auth/session";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { getPassesForTenant } from "@/lib/data/gate-passes";
import { getTenantAttendanceStatus } from "@/lib/data/attendance";
import { getPgById } from "@/lib/data/pgs";
import { getMessMenu, getTenantDinnerPoll } from "@/lib/data/rooms";
import { TenantHomeExplorer } from "@/components/tenant/TenantHomeExplorer";

export default async function TenantDashboardPage() {
  const session = await getCurrentUserSession();
  const broadcasts = await getActiveBroadcastsForRole("tenant");
  const passes = await getPassesForTenant(session.id);
  const attendance = await getTenantAttendanceStatus(session.id);
  const pg = (await getPgById(session.pg_id || "00000000-0000-0000-0000-000000000001")) || {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Royal Stay PG",
    slug: "royal-stay",
    logo_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80",
    primary_color: "#4F46E5",
    city: "Bengaluru",
    contact_phone: "+91 98222 33441",
  };

  const messMenu = await getMessMenu();
  const dinnerPoll = await getTenantDinnerPoll(session.id);

  return (
    <TenantHomeExplorer
      session={{
        id: session.id,
        full_name: session.full_name,
        email: session.email,
        phone: session.phone,
        room_id: session.room_id,
        building_id: session.building_id,
      }}
      pg={{
        id: pg.id,
        name: pg.name,
        slug: pg.slug,
        logo_url: pg.logo_url,
        primary_color: pg.primary_color,
        city: pg.city,
        contact_phone: pg.contact_phone,
      }}
      passes={passes}
      attendance={{
        todayStatus: attendance.todayStatus,
        markedAt: attendance.markedAt,
        markedBy: attendance.markedBy,
        history: attendance.history,
      }}
      messMenu={{
        breakfast: messMenu.breakfast,
        lunch: messMenu.lunch,
        dinner: messMenu.dinner,
      }}
      initialDinnerPoll={dinnerPoll}
      initialKycStatus="Pending"
      roomNumber="Room 101 • Bed A"
      buildingName="Block A - Krishna Bhawan"
      rentAmount={8500}
      rentPaid={false}
      upiId="royalstay@okicici"
      wifiName="ROYAL_5G_RESIDENT"
      wifiPass="StayRoyal@2026"
      broadcasts={broadcasts}
    />
  );
}
