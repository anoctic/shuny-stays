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
 getTenantLiveProfile,
} from "@/lib/data/rooms";
import { getTenantMealPollStatus } from "@/lib/data/meal-polls";
import { TenantHomeExplorer } from "@/components/tenant/TenantHomeExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantDashboardPage() {
 const session = await getCurrentUserSession();
 const liveProfile = await getTenantLiveProfile(session.id, session.phone);
 const lookupId = liveProfile?.tenantId || session.id;
 const targetPgId = liveProfile?.pgId || session.pg_id || "00000000-0000-0000-0000-000000000001";

 const [
 broadcasts,
 passes,
 attendance,
 dbPg,
 messMenu,
 dinnerPoll,
 dbDeposit,
 invoices,
 ] = await Promise.all([
 getActiveBroadcastsForRole("tenant"),
 getPassesForTenant(lookupId),
 getTenantAttendanceStatus(session.id),
 getPgById(targetPgId),
 getMessMenu(),
 getTenantDinnerPoll(session.id),
 getSecurityDepositForTenant(lookupId),
 getRentPaymentsForTenant(lookupId),
 ]);

 const pg = dbPg || {
 id: targetPgId,
 name: "Royal Stay PG",
 slug: "royal-stay",
 logo_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80",
 primary_color: "#4F46E5",
 city: "Bengaluru",
 contact_phone: "+91 98222 33441",
 };

 const [lunchPollStatus, dinnerPollStatus] = await Promise.all([
 getTenantMealPollStatus(pg.id, lookupId, "lunch"),
 getTenantMealPollStatus(pg.id, lookupId, "dinner"),
 ]);

 const expectedDep = dbDeposit?.expectedAmount ?? liveProfile?.depositAmount ?? 0;

 // Security Deposit for this tenant (never pretend paid if missing/pending!)
 const depositDetails = dbDeposit || {
 id: liveProfile ? `DEP-${liveProfile.tenantId.slice(0, 8).toUpperCase()}` : "DEP-PENDING",
 pgId: pg.id,
 buildingId: "",
 buildingName: liveProfile?.buildingName || "Main Wing",
 tenantId: lookupId,
 tenantName: liveProfile?.fullName || session.full_name,
 roomNumber: liveProfile?.roomNumber || "Pending Allocation",
 bedLabel: liveProfile?.bedLabel || "Pending",
 expectedAmount: expectedDep,
 paidAmount: 0,
 status: (expectedDep > 0 ? "pending" : "paid") as "pending" | "paid",
 paymentMode: "cash" as const,
 collectedByName: "Pending Collection",
 collectedAt: "",
 deductionAmount: 0,
 refundedAmount: 0,
 createdAt: new Date().toISOString(),
 };

 // Live Current-Month Rent Paid check
 const now = new Date();
 const currentBillingMonth = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
 const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

 let lastRentPaidAt: string | null = null;
 const rentPaid = invoices.some((inv) => {
 const st = (inv.status || "").toLowerCase();
 if (!["settled_with_owner", "collected_by_admin", "paid", "verified"].includes(st)) return false;
 if (!lastRentPaidAt && inv.collectedAt) lastRentPaidAt = inv.collectedAt;
 const bm = (inv.billingMonth || "").trim();
 const dt = inv.collectedAt || "";
 return (
 bm.toLowerCase() === currentBillingMonth.toLowerCase() ||
 bm.startsWith(currentYearMonth) ||
 (!bm && dt.startsWith(currentYearMonth))
 );
 });
 if (!lastRentPaidAt) {
 const latestPaid = invoices.find((inv) =>
 ["settled_with_owner", "collected_by_admin", "paid", "verified"].includes((inv.status || "").toLowerCase())
 );
 lastRentPaidAt = latestPaid?.collectedAt || null;
 }

 return (
 <TenantHomeExplorer
 session={{
 id: session.id,
 full_name: liveProfile?.fullName || session.full_name,
 email: liveProfile?.email || session.email,
 phone: liveProfile?.phone || session.phone || undefined,
 room_id: session.room_id || undefined,
 building_id: liveProfile?.buildingId || session.building_id || undefined,
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
 tenantRecordId={liveProfile?.tenantId || session.id}
 buildingId={liveProfile?.buildingId || session.building_id || null}
 joinDate={liveProfile?.joinDate}
 lastRentPaidAt={lastRentPaidAt}
 initialKycStatus={liveProfile?.kycStatus || "Pending"}
 initialAadhaarNumber={liveProfile?.aadhaarNumber || null}
 initialKycDocUrl={liveProfile?.kycDocUrl || null}
 initialKycRejectionReason={liveProfile?.kycRejectionReason || null}
 initialProfilePhotoUrl={liveProfile?.profilePhotoUrl || null}
 roomNumber={
 liveProfile
 ? `${liveProfile.roomNumber} • ${liveProfile.bedLabel}`
 : "Pending Allocation"
 }
 buildingName={liveProfile?.buildingName || "Main Block"}
 rentAmount={liveProfile?.rentAmount ?? 0}
 rentPaid={rentPaid}
 depositAmount={expectedDep}
 depositDetails={depositDetails}
 invoices={invoices}
 upiId={liveProfile?.upiId || (pg as any).upi_id || "royalstay@okicici"}
 wifiName="ROYAL_5G_RESIDENT"
 wifiPass="StayRoyal@2026"
 broadcasts={broadcasts}
 mealPollStatus={lunchPollStatus}
 dinnerPollStatus={dinnerPollStatus}
 />
 );
}
