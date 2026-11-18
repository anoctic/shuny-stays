"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Printer,
  X,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface DepositReceiptModalProps {
  pgName: string;
  pgLogo?: string | null;
  primaryColor?: string;
  tenantName: string;
  roomNumber: string;
  bedLabel?: string;
  receiptNumber?: string;
  amount: string | number;
  paymentMode?: string;
  paymentDate?: string;
  collectedByName?: string;
  status?: string;
  deductionAmount?: number;
  deductionReason?: string;
  refundedAmount?: number;
  triggerButton?: React.ReactNode;
}

export function DepositReceiptModal({
  pgName,
  pgLogo,
  primaryColor = "#4F46E5",
  tenantName,
  roomNumber,
  bedLabel = "Bed A",
  receiptNumber = "DEP-202611-001",
  amount,
  paymentMode = "UPI Transfer",
  paymentDate = "Nov 01, 2026",
  collectedByName = "Warden Ramesh Verma",
  status = "Paid • Held Safely",
  deductionAmount = 0,
  deductionReason,
  refundedAmount,
  triggerButton,
}: DepositReceiptModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedAmount =
    typeof amount === "number" ? `₹${amount.toLocaleString("en-IN")}` : amount;

  const handlePrint = () => {
    window.print();
  };

  const isRefunded = status.toLowerCase().includes("refund");

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
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Download Deposit Receipt (PDF)
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-[480px] rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-full">
            {/* Modal Top Control Bar (Hidden when printing) */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 print:hidden bg-slate-50">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security Deposit Certificate & Receipt
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
                  className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 space-y-4 bg-white text-slate-900">
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
                      Security Deposit Acknowledgement
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/20">
                    DEPOSIT RECEIPT
                  </span>
                  <p className="text-[10px] text-white/80 mt-1 font-mono">
                    #{receiptNumber}
                  </p>
                </div>
              </div>

              {/* Receipt Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Resident & Room
                  </span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{tenantName}</p>
                  <p className="text-[11px] text-slate-500">
                    {roomNumber} • {bedLabel}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Date Received & Status
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{paymentDate}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 ${
                      isRefunded
                        ? "text-purple-700 bg-purple-50 border border-purple-200"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {status}
                  </span>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                  <span>Particulars</span>
                  <span>Amount (INR)</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <p className="font-bold text-slate-800">
                      Refundable Security Deposit Held in Trust
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Mode: {paymentMode.toUpperCase()} • Received by {collectedByName}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 tabular-nums">
                    {formattedAmount}
                  </span>
                </div>

                {deductionAmount > 0 && (
                  <div className="flex items-center justify-between text-xs py-1 text-rose-600">
                    <div>
                      <p className="font-bold">Checkout Deductions</p>
                      <p className="text-[10px] text-rose-500">
                        Reason: {deductionReason || "Damages / painting"}
                      </p>
                    </div>
                    <span className="font-bold tabular-nums">
                      -₹{deductionAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-2.5 border-t-2 border-slate-900 text-sm font-black">
                  <span>{isRefunded ? "Total Amount Refunded" : "Total Deposit Held"}</span>
                  <span className="text-base text-emerald-700 tabular-nums">
                    {isRefunded && refundedAmount != null
                      ? `₹${refundedAmount.toLocaleString("en-IN")}`
                      : formattedAmount}
                  </span>
                </div>
              </div>

              {/* Terms & Conditions Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Refund Policy & Safeguard Terms:</span>
                </div>
                <p>
                  1. This deposit is held strictly in trust and is 100% refundable at the time of checkout.
                </p>
                <p>
                  2. Standard 30-day notice period is required prior to vacating. Inspection for room damage will be conducted jointly with resident.
                </p>
              </div>

              {/* Subtle White-Label Footer */}
              <div className="text-center pt-2 border-t border-slate-100 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-semibold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                  <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
                </div>
                <p className="text-[9px] text-slate-400">
                  Official computer-generated deposit receipt issued via Shuny Stays Cloud PG Engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
