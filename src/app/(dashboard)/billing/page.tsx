import { Plus, Download, Receipt, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { MOCK_INVOICES } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export default function BillingPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Rent Invoices & Billing
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Automated monthly rent generation, utility charges (electricity/food), and payment receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors">
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors">
            <Plus className="h-4 w-4" />
            Generate Invoices
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase font-semibold border-b border-zinc-200 dark:border-zinc-800 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Resident</th>
                <th className="px-5 py-3.5">Billing Month</th>
                <th className="px-5 py-3.5">Base Rent</th>
                <th className="px-5 py-3.5">Electricity</th>
                <th className="px-5 py-3.5">Total Dues</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-5 py-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {inv.invoice_number}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {inv.resident_name}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Room {inv.room_number}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400 font-medium">
                    {inv.billing_month}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-800 dark:text-zinc-200">
                    {formatINR(inv.rent_amount_paise)}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-500">
                    {formatINR(inv.electricity_amount_paise)}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {formatINR(inv.total_amount_paise)}
                  </td>
                  <td className="px-5 py-4 font-mono text-zinc-600 dark:text-zinc-400">
                    {inv.due_date}
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(inv.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
