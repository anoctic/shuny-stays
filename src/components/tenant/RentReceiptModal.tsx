"use client";

import { useState } from "react";
import {
 Receipt,
 Printer,
 Download,
 CheckCircle2,
 X,
 Sparkles,
 Building2,
 ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RentReceiptModalProps {
 pgName: string;
 pgLogo?: string | null;
 primaryColor?: string;
 tenantName: string;
 roomNumber: string;
 invoiceNumber?: string;
 amount: string;
 dueDate: string;
 triggerButton?: React.ReactNode;
}

export function RentReceiptModal({
 pgName,
 pgLogo,
 primaryColor = "#4F46E5",
 tenantName,
 roomNumber,
 invoiceNumber = "INV-2026-11-001",
 amount,
 dueDate,
 triggerButton,
}: RentReceiptModalProps) {
 const [isOpen, setIsOpen] = useState(false);

 const handlePrint = () => {
 window.print();
 };

 return (
 <>
 {triggerButton ? (
 <div onClick={() => setIsOpen(true)} className="cursor-pointer">
 {triggerButton}
 </div>
 ) : (
 <button
 type="button"
 onClick={() => setIsOpen(true)}
 className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
 >
 <Receipt className="w-4 h-4 text-indigo-600" />
 View & Download Official PDF Receipt
 </button>
 )}

 {isOpen && (
 <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:p-0 print:bg-white">
 <div className="bg-white w-full max-w-[480px] rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-full">
 {/* Modal Top Control Bar (Hidden when printing) */}
 <div className="flex items-center justify-between p-3.5 border-b border-slate-100 print:hidden bg-slate-50">
 <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
 <Receipt className="w-4 h-4 text-indigo-600" />
 Official Rent Receipt
 </span>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={handlePrint}
 className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
 >
 <Printer className="w-3 h-3" />
 Print / Save PDF
 </button>
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Printable Receipt Paper */}
 <div className="p-6 space-y-5 bg-white text-slate-900">
 {/* Header with PG Brand Hero */}
 <div
 className="rounded-2xl p-4 text-white flex items-center justify-between"
 style={{ backgroundColor: primaryColor }}
 >
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center font-black text-lg border border-white/30 text-white">
 {pgLogo ? (
 <img
 src={pgLogo}
 alt={pgName}
 className="w-full h-full object-cover"
 />
 ) : (
 pgName.slice(0, 2).toUpperCase()
 )}
 </div>
 <div>
 <h2 className="text-base font-black leading-tight">{pgName}</h2>
 <p className="text-[11px] text-white/80 mt-0.5">
 Accommodation Rent Invoice & Receipt
 </p>
 </div>
 </div>

 <div className="text-right">
 <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/20">
 TAX INVOICE
 </span>
 <p className="text-[10px] text-white/80 mt-1 font-mono">
 #{invoiceNumber}
 </p>
 </div>
 </div>

 {/* Receipt Metadata Grid */}
 <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-4">
 <div>
 <span className="text-[10px] uppercase font-bold text-slate-400">
 Billed To Resident
 </span>
 <p className="font-bold text-slate-900 mt-0.5">{tenantName}</p>
 <p className="text-[11px] text-slate-500">{roomNumber}</p>
 </div>
 <div className="text-right">
 <span className="text-[10px] uppercase font-bold text-slate-400">
 Billing Date & Status
 </span>
 <p className="font-bold text-slate-900 mt-0.5">{dueDate}</p>
 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
 <CheckCircle2 className="w-3 h-3 text-emerald-600" />
 Verified Paid
 </span>
 </div>
 </div>

 {/* Itemized Line Items Table */}
 <div className="space-y-2">
 <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
 <span>Description</span>
 <span>Amount (INR)</span>
 </div>

 <div className="flex items-center justify-between text-xs py-1">
 <div>
 <p className="font-semibold text-slate-800">
 Monthly Room Stay & Bed Charges
 </p>
 <p className="text-[10px] text-slate-400">Double Sharing • AC Room</p>
 </div>
 <span className="font-bold text-slate-900">₹9,500</span>
 </div>

 <div className="flex items-center justify-between text-xs py-1">
 <div>
 <p className="font-semibold text-slate-800">Electricity Submeter</p>
 <p className="text-[10px] text-slate-400">65 Units @ ₹10/unit</p>
 </div>
 <span className="font-bold text-slate-900">₹650</span>
 </div>

 <div className="flex items-center justify-between text-xs py-1">
 <div>
 <p className="font-semibold text-slate-800">
 Maintenance & 3x Mess Services
 </p>
 <p className="text-[10px] text-slate-400">Includes High-Speed Wi-Fi</p>
 </div>
 <span className="font-bold text-slate-900">₹500</span>
 </div>

 {/* Total */}
 <div className="flex items-center justify-between pt-3 border-t-2 border-slate-900 text-sm font-black">
 <span>Grand Total Paid</span>
 <span className="text-base text-indigo-700">{amount}</span>
 </div>
 </div>

 {/* Security & Verification Seal */}
 <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-emerald-600" />
 <span className="text-[11px] font-semibold text-slate-600">
 Payment UTR: UTR-83920194821 (UPI Autopay)
 </span>
 </div>
 <span className="text-[10px] font-mono text-slate-400">SEALED</span>
 </div>

 {/* Subtle White-Label Footer */}
 <div className="text-center pt-3 border-t border-slate-100 space-y-1">
 <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-semibold shadow-2xs">
 <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
 <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
 </div>
 <p className="text-[9px] text-slate-400">
 Official computer-generated receipt issued through Shuny Stays Cloud PG Engine.
 </p>
 </div>
 </div>
 </div>
 </div>
 )}
 </>
 );
}
