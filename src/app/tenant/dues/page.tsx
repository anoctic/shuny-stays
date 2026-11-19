"use client";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  UploadCloud,
  QrCode,
  Sparkles,
  Receipt,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { submitTenantUpiScreenshotAction } from "@/app/actions/rooms-and-ops";

interface ReceiptItem {
  id: string;
  month: string;
  amount: number;
  date: string;
  room: string;
}

const mockReceipts: ReceiptItem[] = [
  {
    id: "REC-202611-01",
    month: "October 2026",
    amount: 8500,
    date: "04 Oct 2026",
    room: "Block A • Room 101",
  },
  {
    id: "REC-202611-02",
    month: "September 2026",
    amount: 8500,
    date: "05 Sep 2026",
    room: "Block A • Room 101",
  },
];

export default function TenantDuesPage() {
  const router = useRouter();
  const [utrInput, setUtrInput] = useState("UTR40988712");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied UPI ID: ${text}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("utr", utrInput);
      fd.append("amount", "8500");
      await submitTenantUpiScreenshotAction(fd);
      router.refresh();
      setSubmitted(true);
      showToast("Payment screenshot submitted for Owner review!");
    } catch {
      setSubmitted(true);
      showToast("Submitted UTR for review!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Direct UPI Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Royal Stay PG Direct UPI</h3>
            <p className="text-[10px] text-slate-400">Due: 5th • Late fee ₹100/day</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums bg-rose-500/15 text-rose-500">
            ₹8,500
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 text-slate-900 shadow-xs">
            <QrCode className="w-12 h-12" />
          </div>
          <div className="min-w-0 space-y-1 flex-1">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
              Verified PG UPI ID
            </div>
            <div className="text-xs font-extrabold font-mono text-slate-900 dark:text-white truncate">
              royalstay@okicici
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard("royalstay@okicici")}
              className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold hover:bg-indigo-500/20"
            >
              Copy UPI ID
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-center text-xs font-extrabold">
            ⏳ Screenshot ({utrInput}) Under Owner Review
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              placeholder="Enter 12-digit UTR Number"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? "Submitting..." : "Upload Payment Screenshot"}</span>
            </button>
          </form>
        )}
      </div>

      {/* Official Digital Rent Receipts Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white px-0.5">
          Official Digital Rent Receipts
        </h3>

        {mockReceipts.map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xs"
          >
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                {r.month} • ₹{r.amount.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400">
                {r.date} • <span className="font-mono">{r.id}</span>
              </div>
            </div>

            <RentReceiptModal
              pgName="Royal Stay PG"
              pgLogo="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=200&h=200&q=80"
              primaryColor="#4F46E5"
              tenantName="Aarav Patel"
              roomNumber={r.room}
              invoiceNumber={r.id}
              amount={`₹${r.amount.toLocaleString("en-IN")}`}
              dueDate={r.date}
            />
          </div>
        ))}
      </div>

      {/* Subtle Brand Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}
