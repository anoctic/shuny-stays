import { getCurrentUserSession } from "@/lib/auth/session";
import { getPgById } from "@/lib/data/pgs";
import { getRentPaymentsForTenant, getTenantLiveProfile } from "@/lib/data/rooms";
import { TenantDuesClientView, ReceiptItem } from "@/components/tenant/TenantDuesClientView";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantDuesPage() {
 const session = await getCurrentUserSession();
 const liveProfile = await getTenantLiveProfile(session.id, session.phone);
 const lookupId = liveProfile?.tenantId || session.id;
 const targetPgId = liveProfile?.pgId || session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

 const [dbPg, payments] = await Promise.all([
 getPgById(targetPgId),
 getRentPaymentsForTenant(lookupId),
 ]);

 const pg = dbPg || {
 id: targetPgId,
 name: "Shuny Stays Luxury PG",
 slug: "shuny-stays-luxury",
 logo_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80",
 primary_color: "#4F46E5",
 upi_id: "anoctic@oksbi",
 };

 const receipts: ReceiptItem[] = payments.map((p) => ({
 id: p.id,
 month: p.billingMonth,
 amount: p.amount,
 date: p.collectedAt ? new Date(p.collectedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
 room: p.room || liveProfile?.roomNumber || "Pending Room",
 }));

 const now = new Date();
 const currentBillingMonth = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
 const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

 const isCurrentMonthPaid = payments.some((p) => {
 const st = (p.status || "").toLowerCase();
 if (!["settled_with_owner", "collected_by_admin", "paid", "verified"].includes(st)) return false;
 const bm = (p.billingMonth || "").trim();
 const dt = p.collectedAt || "";
 return (
 bm.toLowerCase() === currentBillingMonth.toLowerCase() ||
 bm.startsWith(currentYearMonth) ||
 (!bm && dt.startsWith(currentYearMonth))
 );
 });

 const dueAmount = isCurrentMonthPaid ? 0 : (liveProfile?.rentAmount ?? 0);

 return (
 <TenantDuesClientView
 receipts={receipts}
 pgName={pg.name}
 pgLogo={pg.logo_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80"}
 primaryColor={pg.primary_color || "#4F46E5"}
 tenantName={liveProfile?.fullName || session.full_name}
 upiId={liveProfile?.upiId || (pg as any).upi_id || "anoctic@oksbi"}
 dueAmount={dueAmount}
 />
 );
}
