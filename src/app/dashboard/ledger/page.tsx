import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBuildings, getExpenses, getUpiApprovals } from "@/lib/data/rooms";
import { LedgerExplorer } from "@/components/ledger/LedgerExplorer";

export default async function LedgerPage() {
  const session = await getCurrentUserSession();
  const buildings = await getAllBuildings();
  const expenses = await getExpenses();
  const upiApprovals = await getUpiApprovals();

  return (
    <LedgerExplorer
      buildings={buildings}
      expenses={expenses}
      upiApprovals={upiApprovals}
      userRole={session.role}
    />
  );
}
