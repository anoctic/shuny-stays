import { getCurrentUserSession } from "@/lib/auth/session";
import { getPgById } from "@/lib/data/pgs";
import { getRentPaymentsForTenant } from "@/lib/data/rooms";
import { TenantDuesClientView, ReceiptItem } from "@/components/tenant/TenantDuesClientView";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantDuesPage() {
  const session = await getCurrentUserSession();
  const pg = (await getPgById(session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2")) || {
    id: "23594b9e-da90-4884-95aa-5f978d91a0d2",
    name: "Shuny Stays Luxury PG",
    slug: "shuny-stays-luxury",
    logo_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80",
    primary_color: "#4F46E5",
    upi_id: "anoctic@oksbi",
  };

  const payments = await getRentPaymentsForTenant(session.id);

  const receipts: ReceiptItem[] = payments.map((p) => ({
    id: p.id,
    month: p.billingMonth,
    amount: p.amount,
    date: p.collectedAt ? new Date(p.collectedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recent",
    room: p.room || "Room 101",
  }));

  const hasPending = payments.some((p) => p.status === "pending");
  const dueAmount = hasPending ? 8500 : 0;

  return (
    <TenantDuesClientView
      receipts={receipts}
      pgName={pg.name}
      pgLogo={pg.logo_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80"}
      primaryColor={pg.primary_color || "#4F46E5"}
      tenantName={session.full_name}
      upiId={(pg as any).upi_id || "anoctic@oksbi"}
      dueAmount={dueAmount}
    />
  );
}
