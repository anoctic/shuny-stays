import { getCurrentUserSession } from "@/lib/auth/session";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { getPassesForTenant } from "@/lib/data/gate-passes";
import { getTenantAttendanceStatus } from "@/lib/data/attendance";
import { getPgById } from "@/lib/data/pgs";
import {
  getMessMenu,
  getTenantDinnerPoll,
  getSecurityDepositForTenant,
  getRentPaymentsForTenant,
} from "@/lib/data/rooms";
import { TenantHomeExplorer } from "@/components/tenant/TenantHomeExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // Security Deposit for this tenant
  const dbDeposit = await getSecurityDepositForTenant(session.id);
  const depositDetails = dbDeposit || {
    id: "DEP-PENDING",
    pgId: pg.id,
    buildingId: "",
    buildingName: "Main Wing",
    tenantId: session.id,
    tenantName: session.full_name,
    roomNumber: "Pending Allocation",
    bedLabel: "Pending",
    expectedAmount: 0,
    paidAmount: 0,
    status: "pending" as const,
    paymentMode: "upi" as const,
    collectedByName: "Management",
    collectedAt: "-",
    deductionAmount: 0,
    refundedAmount: 0,
    createdAt: new Date().toISOString(),
  };

  // Rent Payments & Invoices for this tenant
  const invoices = await getRentPaymentsForTenant(session.id);

  const rentPaid = invoices.some(
    (inv) =>
      inv.billingMonth.includes("November 2026") ||
      inv.status === "collected_by_admin" ||
      inv.status === "settled_with_owner"
  );

  return (
    <TenantHomeExplorer
      session={{
        id: session.id,
        full_name: session.full_name,
        email: session.email,
        phone: session.phone || undefined,
        room_id: session.room_id || undefined,
        building_id: session.building_id || undefined,
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
      rentPaid={rentPaid}
      depositDetails={depositDetails}
      invoices={invoices}
      upiId="royalstay@okicici"
      wifiName="ROYAL_5G_RESIDENT"
      wifiPass="StayRoyal@2026"
      broadcasts={broadcasts}
    />
  );
}
