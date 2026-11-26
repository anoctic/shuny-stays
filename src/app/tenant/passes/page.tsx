import Link from "next/link";
import {
 QrCode,
 ArrowLeft,
 IdCard,
 ShieldCheck,
 Calendar,
 Phone,
 Sparkles,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getPassesForTenant } from "@/lib/data/gate-passes";
import { getPgById } from "@/lib/data/pgs";
import { getTenantLiveProfile, getSecurityDepositForTenant } from "@/lib/data/rooms";
import { GatePassCard } from "@/components/passes/GatePassCard";
import { RequestPassModal } from "@/components/passes/RequestPassModal";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { TenantIdNoticeView } from "@/components/tenant/TenantIdNoticeView";

export default async function TenantPassesPage() {
 const session = await getCurrentUserSession();
 const liveProfile = await getTenantLiveProfile(session.id, session.phone);
 const lookupId = liveProfile?.tenantId || session.id;
 const [passes, dbPg, depositDetails] = await Promise.all([
 getPassesForTenant(lookupId),
 getPgById(liveProfile?.pgId || session.pg_id || "00000000-0000-0000-0000-000000000001"),
 getSecurityDepositForTenant(lookupId),
 ]);

 const pg = dbPg || {
 id: "00000000-0000-0000-0000-000000000001",
 name: "Royal Stay PG",
 slug: "royal-stay",
 primary_color: "#4F46E5",
 city: "Bengaluru",
 };

 const expectedDeposit = depositDetails?.expectedAmount ?? liveProfile?.depositAmount ?? 0;
 const paidDeposit = depositDetails?.paidAmount ?? 0;
 const depStatus: "paid" | "pending" | "refunded" | "partially_refunded" =
 depositDetails?.status === "refunded" || depositDetails?.status === "partially_refunded"
 ? depositDetails.status
 : depositDetails?.status === "paid" && paidDeposit >= expectedDeposit
 ? "paid"
 : expectedDeposit > 0 || depositDetails?.status === "pending"
 ? "pending"
 : "paid";

 return (
 <TenantIdNoticeView
 session={{
 id: session.id,
 full_name: liveProfile?.fullName || session.full_name,
 phone: liveProfile?.phone || session.phone || "",
 email: liveProfile?.email || session.email,
 room_id: session.room_id,
 building_id: session.building_id,
 }}
 pg={{
 name: pg.name,
 primaryColor: pg.primary_color || "#4F46E5",
 }}
 tenantRecordId={liveProfile?.tenantId || session.id}
 buildingName={liveProfile?.buildingName || "Pending Allocation"}
 roomNumber={
 liveProfile
 ? `${liveProfile.roomNumber} (${liveProfile.bedLabel})`
 : "Pending Room"
 }
 kycStatus={liveProfile?.kycStatus || "Pending"}
 joinDate={liveProfile?.joinDate || "Recently Joined"}
 depositAmount={expectedDeposit}
 depositStatus={depStatus}
 depositPaidAmount={paidDeposit}
 emergencyPhone={(pg as any).contact_phone || "Property Office"}
 passes={passes}
 />
 );
}
