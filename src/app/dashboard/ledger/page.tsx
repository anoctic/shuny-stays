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

export default async function LedgerPage() {
  const session = await getCurrentUserSession();
  const buildings = await getAllBuildings();
  const expenses = await getExpenses();
  const upiApprovals = await getUpiApprovals();
  const deposits = await getAllSecurityDeposits();
  const rentPayments = await getAllRentPayments();

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
