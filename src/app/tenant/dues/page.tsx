"use client";

import { CreditCard, UploadCloud, CheckCircle2, QrCode } from "lucide-react";

export default function TenantDuesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Rent & Invoices</h1>
        <p className="text-xs text-slate-400">View upcoming dues and upload UPI transaction screenshot</p>
      </div>

      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Invoice #INV-2026-11-001</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Pending Payment
          </span>
        </div>

        <div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">₹10,650</div>
          <p className="text-[11px] text-slate-400">Due by 5th Dec 2026</p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Pay to PG UPI ID</p>
              <p className="text-[10px] text-slate-500 font-mono">stanza@okaxis</p>
            </div>
          </div>
          <button
            onClick={() => alert("Copied UPI ID")}
            className="text-[11px] font-bold text-blue-600 px-2 py-1 bg-white rounded-lg border border-slate-200"
          >
            Copy
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Upload Payment Screenshot / UTR
          </label>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tap to upload receipt</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or PDF up to 5MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
