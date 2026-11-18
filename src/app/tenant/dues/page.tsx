"use client";

import { CreditCard, UploadCloud, CheckCircle2, QrCode, Sparkles } from "lucide-react";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";

export default function TenantDuesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Rent & Invoices</h1>
        <p className="text-xs text-slate-400">View upcoming dues, download official receipts, and upload UPI screenshot</p>
      </div>

      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Invoice #INV-2026-11-001</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Current Active Cycle
          </span>
        </div>

        <div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">₹10,650</div>
          <p className="text-[11px] text-slate-400">Due by 5th Dec 2026 (Rent ₹9,500 + Electricity ₹650 + Maint ₹500)</p>
        </div>

        {/* View & Download PDF Receipt Modal */}
        <RentReceiptModal
          pgName="Royal Stay PG"
          pgLogo="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80"
          primaryColor="#4F46E5"
          tenantName="Aarav Patel"
          roomNumber="Room 101 • Bed A (Block A)"
          invoiceNumber="INV-2026-11-001"
          amount="₹10,650"
          dueDate="Nov 05, 2026"
        />

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Pay to PG UPI ID</p>
              <p className="text-[10px] text-slate-500 font-mono">royalstay@okaxis</p>
            </div>
          </div>
          <button
            onClick={() => alert("Copied UPI ID: royalstay@okaxis")}
            className="text-[11px] font-bold text-indigo-600 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            Copy
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Upload Payment Screenshot / UTR
          </label>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-500 transition-colors">
            <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tap to upload receipt</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or PDF up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Subtle Brand Footer */}
      <footer className="pt-4 pb-2 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>Powered by</span>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
            ShunyOS
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Cloud-Native Multi-Tenant PG & Hostel Operating System
        </p>
      </footer>
    </div>
  );
}
