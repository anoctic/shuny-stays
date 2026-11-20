import { getCurrentUserSession } from "@/lib/auth/session";
import {
  getAllBuildings,
  getExpenses,
  getUpiApprovals,
  getAllSecurityDeposits,
  getAllRentPayments,
} from "@/lib/data/rooms";
import { LedgerExplorer } from "@/components/ledger/LedgerExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LedgerPage() {
  const session = await getCurrentUserSession();
  const effectivePgId = session.role === "super_admin" ? undefined : (session.pg_id || undefined);

  const buildings = await getAllBuildings();
  const expenses = await getExpenses(effectivePgId);
  const upiApprovals = await getUpiApprovals(effectivePgId);
  const deposits = await getAllSecurityDeposits(effectivePgId);
  const rentPayments = await getAllRentPayments(effectivePgId);

  return (
    <LedgerExplorer
      buildings={buildings}
      expenses={expenses}
      upiApprovals={upiApprovals}
      initialDeposits={deposits}
      initialRentPayments={rentPayments}
      userRole={session.role}
      currentUserName={session.full_name}
    />
  );
}
