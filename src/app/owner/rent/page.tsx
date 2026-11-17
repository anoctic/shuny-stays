import { Receipt, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { MOCK_INVOICES } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export default function OwnerRentPage() {
  const totalBilled = MOCK_INVOICES.reduce((sum, i) => sum + i.total_amount_paise, 0);
  const totalPaid = MOCK_INVOICES.filter((i) => i.status === "paid").reduce(
    (sum, i) => sum + i.total_amount_paise,
    0
  );
  const totalPending = totalBilled - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Rent & Invoicing Ledger
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monthly rent dues, collection status, and invoice records.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-500 uppercase">Total Billed (Nov 2026)</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
            {formatINR(totalBilled)}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">3 active tenant invoices</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-500 uppercase">Collected</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatINR(totalPaid)}
          </p>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5">Verified in bank</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-500 uppercase">Pending Due</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            {formatINR(totalPending)}
          </p>
          <p className="text-xs text-red-500 font-medium mt-0.5">1 pending • 1 overdue</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Resident</th>
                <th className="px-6 py-3.5">Room</th>
                <th className="px-6 py-3.5">Rent</th>
                <th className="px-6 py-3.5">Electricity</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {inv.invoice_number}
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                    {inv.resident_name}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {inv.room_number}
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatINR(inv.rent_amount_paise)}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {formatINR(inv.electricity_amount_paise)}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-zinc-900 dark:text-zinc-100">
                    {formatINR(inv.total_amount_paise)}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-zinc-500">
                    {inv.due_date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        inv.status === "paid"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : inv.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
