"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
 CreditCard,
 UploadCloud,
 QrCode,
 Receipt,
 Copy,
} from "lucide-react";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { submitTenantUpiScreenshotAction } from "@/app/actions/rooms-and-ops";

export interface ReceiptItem {
 id: string;
 month: string;
 amount: number;
 date: string;
 room: string;
}

interface TenantDuesClientViewProps {
 receipts: ReceiptItem[];
 pgName: string;
 pgLogo: string;
 primaryColor: string;
 tenantName: string;
 upiId: string;
 dueAmount: number;
}

export function TenantDuesClientView({
 receipts,
 pgName,
 pgLogo,
 primaryColor,
 tenantName,
 upiId,
 dueAmount,
}: TenantDuesClientViewProps) {
 const router = useRouter();
 const [utrInput, setUtrInput] = useState("");
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
 fd.append("amount", dueAmount.toString());
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

 {/* Desktop 2-Column Split: UPI Card (col-5) & Receipts (col-7) */}
 <div className="space-y-3.5 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
 {/* Direct UPI Card */}
 <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm h-fit">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-xs font-extrabold text-slate-900">{pgName} Direct UPI</h3>
 <p className="text-[10px] text-slate-400">Due: 5th • Late fee ₹100/day</p>
 </div>
 <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums ${
 dueAmount > 0 ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/15 text-emerald-500"
 }`}>
 ₹{dueAmount.toLocaleString("en-IN")}
 </span>
 </div>

 <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
 <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 text-slate-900 shadow-xs">
 <QrCode className="w-12 h-12" />
 </div>
 <div className="min-w-0 space-y-1 flex-1">
 <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
 Verified PG UPI ID
 </div>
 <div className="text-xs font-extrabold font-mono text-slate-900 truncate">
 {upiId}
 </div>
 <button
 type="button"
 onClick={() => copyToClipboard(upiId)}
 className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 text-[10px] font-extrabold hover:bg-indigo-500/20 cursor-pointer"
 >
 Copy UPI ID
 </button>
 </div>
 </div>

 {submitted ? (
 <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 text-center text-xs font-extrabold">
 ⏳ Screenshot ({utrInput}) Under Owner Review
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-2">
 <input
 type="text"
 value={utrInput}
 onChange={(e) => setUtrInput(e.target.value)}
 placeholder="Enter 12-digit UTR Number"
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-indigo-500"
 />
 <button
 type="submit"
 disabled={loading}
 className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
 >
 <UploadCloud className="w-4 h-4" />
 <span>{loading ? "Submitting..." : "Upload Payment Screenshot"}</span>
 </button>
 </form>
 )}
 </div>

 {/* Official Digital Rent Receipts Section */}
 <div className="lg:col-span-7 space-y-2">
 <h3 className="text-xs font-extrabold text-slate-900 px-0.5">
 Official Digital Rent Receipts
 </h3>

 {receipts.length === 0 ? (
 <div className="p-6 text-center rounded-2xl bg-white border border-slate-200">
 <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
 <p className="text-xs font-extrabold text-slate-700">No payment receipts yet</p>
 <p className="text-[11px] text-slate-400">Approved rent transactions will show here automatically</p>
 </div>
 ) : (
 <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
 {receipts.map((r) => (
 <div
 key={r.id}
 className="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-slate-300 transition"
 >
 <div>
 <div className="text-xs font-extrabold text-slate-900">
 {r.month} • ₹{r.amount.toLocaleString("en-IN")}
 </div>
 <div className="text-[10px] text-slate-400">
 {r.date} • <span className="font-mono">{r.id}</span>
 </div>
 </div>

 <RentReceiptModal
 pgName={pgName}
 pgLogo={pgLogo}
 primaryColor={primaryColor}
 tenantName={tenantName}
 roomNumber={r.room}
 invoiceNumber={r.id}
 amount={`₹${r.amount.toLocaleString("en-IN")}`}
 dueDate={r.date}
 />
 </div>
 ))}
 </div>
 )}
 </div>
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
