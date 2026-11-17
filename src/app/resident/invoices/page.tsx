"use client";

import { Receipt, CheckCircle2, Download, QrCode } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function ResidentInvoicesPage() {
  // STRICTLY this resident's invoices (no other tenants)
  const myInvoices = [
    {
      id: "60000000-0000-0000-0000-000000000001",
      invoice_number: "INV-2026-11-001",
      billing_month: "November 2026",
      due_date: "2026-11-05",
      rent_amount_paise: 950000,
      electricity_amount_paise: 45000,
      total_amount_paise: 995000,
      status: "paid" as const,
      payment_mode: "UPI (Direct to Owner)",
      utr: "431899204511",
    },
    {
      id: "60000000-0000-0000-0000-000000000004",
      invoice_number: "INV-2026-10-001",
      billing_month: "October 2026",
      due_date: "2026-10-05",
      rent_amount_paise: 950000,
      electricity_amount_paise: 38000,
      total_amount_paise: 988000,
      status: "paid" as const,
      payment_mode: "UPI",
      utr: "428810923411",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-emerald-600" />
          My Rent Invoices & Receipts
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Download monthly rent receipts for HRA claims and tax filing.
        </p>
      </div>

      <div className="space-y-4">
        {myInvoices.map((inv) => (
          <div
            key={inv.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono">
                  {inv.invoice_number}
                </span>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {inv.billing_month}
                </h3>
                <p className="text-xs text-zinc-400">Due by {inv.due_date}</p>
              </div>

              <div className="text-right">
                <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 block">
                  {formatINR(inv.total_amount_paise)}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block mt-1">
                  Paid ✓
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] text-zinc-400">Base Rent:</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">{formatINR(inv.rent_amount_paise)}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400">Electricity & Utility:</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">{formatINR(inv.electricity_amount_paise)}</p>
              </div>
              <div className="col-span-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">UPI UTR Ref:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{inv.utr}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Receipt downloaded for ${inv.invoice_number}`)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Download Official PDF Receipt (HRA)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
