"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  CheckCircle2,
  Receipt,
  Check,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Banknote,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  BuildingItem,
  ExpenseItem,
  UpiApprovalItem,
  SecurityDepositItem,
  RentPaymentRecord,
} from "@/lib/data/rooms";
import { settleRentPaymentAction } from "@/app/actions/rooms-and-ops";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";

interface LedgerExplorerProps {
  buildings: BuildingItem[];
  expenses: ExpenseItem[];
  upiApprovals: UpiApprovalItem[];
  initialDeposits?: SecurityDepositItem[];
  initialRentPayments?: RentPaymentRecord[];
  userRole: "owner" | "admin" | "super_admin" | "tenant";
  currentUserName?: string;
}

export function LedgerExplorer({
  buildings,
  expenses,
  upiApprovals,
  initialDeposits = [],
  initialRentPayments = [],
  userRole,
  currentUserName = "Manoj Kumar",
}: LedgerExplorerProps) {
  const router = useRouter();
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";

  const [activeTab, setActiveTab] = useState<"rent" | "deposits">("rent");
  const [rentPayments, setRentPayments] = useState<RentPaymentRecord[]>(initialRentPayments);
  const [deposits, setDeposits] = useState<SecurityDepositItem[]>(initialDeposits);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1-Tap Confirm Cash Received (Owner Reconciliation)
  const handleConfirmHandover = async (record: RentPaymentRecord) => {
    setIsProcessingId(record.id);
    await settleRentPaymentAction(record.id);
    router.refresh();

    setRentPayments((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: "settled_with_owner",
              settledAt: "Just now",
              settledByName: currentUserName,
            }
          : r
      )
    );
    setIsProcessingId(null);
    showToast(`Confirmed ₹${record.amount.toLocaleString("en-IN")} Cash from ${record.collectedByName}! Settled to Ledger.`);
  };

  // Calculations
  const pendingHandovers = rentPayments.filter((r) => r.status === "collected_by_admin");
  const settledPayments = rentPayments.filter((r) => r.status === "settled_with_owner");

  const pendingHandoverTotal = pendingHandovers.reduce((acc, r) => acc + r.amount, 0);
  const rentCollectedTotal = settledPayments.reduce((acc, r) => acc + r.amount, 0);

  // Security deposits sum (active paid deposits)
  const activePaidDeposits = deposits.filter((d) => d.status === "paid");
  const totalSecurityDeposits = activePaidDeposits.reduce((acc, d) => acc + (d.paidAmount || d.expectedAmount), 0);

  // Admin Collections
  const myAdminCollections = rentPayments.filter(
    (r) => r.collectedByRole === "admin" || (r.collectedByName && r.collectedByName.includes("Suresh"))
  );
  const myAdminTotal = myAdminCollections.reduce((acc, r) => acc + r.amount, 0);
  const myAdminPending = myAdminCollections
    .filter((r) => r.status === "collected_by_admin")
    .reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-slate-700 backdrop-blur-md animate-in fade-in flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OWNER VIEW: 3 KPI CARDS + TABS */}
      {/* ========================================================================= */}
      {isOwner ? (
        <>
          {/* 1. Exactly 3 Clean KPI Cards (1 col mobile, 3 cols desktop) */}
          <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {/* KPI 1: Rent Collected */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Rent Revenue (Nov 2026)
                </div>
                <div className="text-xl font-black text-emerald-600 tabular-nums mt-0.5">
                  ₹{rentCollectedTotal.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {settledPayments.length} Invoices Settled into Bank
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Settled
              </span>
            </div>

            {/* KPI 2: Pending Cash Handover from Admin */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Cash Handover from Staff
                </div>
                <div className="text-xl font-black text-amber-600 tabular-nums mt-0.5">
                  ₹{pendingHandoverTotal.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {pendingHandovers.length} payments waiting for physical handover
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                Pending Handover
              </span>
            </div>

            {/* KPI 3: Security Deposit Held — Refundable */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Security Deposit Held (Refundable)
                </div>
                <div className="text-xl font-black text-[#4F46E5] tabular-nums mt-0.5">
                  ₹{totalSecurityDeposits.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Strictly Held in Trust • Kept Separate from Profit
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Trust Account
              </span>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/90">
            <button
              type="button"
              onClick={() => setActiveTab("rent")}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === "rent"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rent & Handovers ({rentPayments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("deposits")}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === "deposits"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Security Deposits ({deposits.length})
            </button>
          </div>

          {/* TAB 1: RENT & HANDOVERS */}
          {activeTab === "rent" && (
            <div className="space-y-3.5">
              {/* 2. Pending Cash Handover List with 1-Tap Confirm Cash Received */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending Staff Cash Handovers ({pendingHandovers.length})</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700">Warden Cash Desk</span>
                </div>

                {pendingHandovers.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center text-xs text-slate-400">
                    All cash collections from warden desk have been settled!
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
                    {pendingHandovers.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm hover:border-amber-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block">
                              {item.tenantName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.room} • Mode: <strong className="text-slate-700">{item.paymentMode.toUpperCase()}</strong>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 tabular-nums">
                              ₹{item.amount.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold block">
                              Pending Handover
                            </span>
                          </div>
                        </div>

                        {/* Alert banner matching exact spec: Collected by [Admin] • Collect ₹X from Admin */}
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-950">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Collected by {item.collectedByName} • Collect ₹{item.amount.toLocaleString("en-IN")} from {item.collectedByName}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.collectedAt}
                          </span>

                          <button
                            type="button"
                            disabled={isProcessingId === item.id}
                            onClick={() => handleConfirmHandover(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isProcessingId === item.id ? "Settling..." : "Confirm Cash Received"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Settled Payment & Auto-Invoice Audit History */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 px-0.5">
                  Settled Payments & Auto-Invoices ({settledPayments.length})
                </h3>

                <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
                  {settledPayments.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-2 shadow-sm hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {inv.tenantName}
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Settled
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {inv.room} • {inv.paymentMode.toUpperCase()} • <span className="font-mono">{inv.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-900 tabular-nums">
                          ₹{inv.amount.toLocaleString("en-IN")}
                        </span>

                        <RentReceiptModal
                          pgName="Royal Stay PG"
                          primaryColor="#4F46E5"
                          tenantName={inv.tenantName}
                          roomNumber={inv.room}
                          invoiceNumber={inv.id}
                          amount={`₹${inv.amount.toLocaleString("en-IN")}`}
                          dueDate={inv.collectedAt}
                          triggerButton={
                            <button
                              type="button"
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-[10px] font-extrabold border border-indigo-200 transition cursor-pointer"
                            >
                              Invoice PDF
                            </button>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY DEPOSITS (REFUNDABLE LEDGER) */}
          {activeTab === "deposits" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Security Deposits Ledger ({deposits.length})
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold">100% Refundable</span>
              </div>

              <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900">
                            {dep.tenantName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              dep.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : dep.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {dep.status === "paid"
                              ? "Paid • Held Safely"
                              : dep.status === "pending"
                              ? "Deposit Pending"
                              : "Refunded"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {dep.buildingName} • Room {dep.roomNumber} ({dep.bedLabel})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          ₹{(dep.paidAmount || dep.expectedAmount).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          #{dep.id}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        Mode: <strong className="text-slate-800">{dep.paymentMode.toUpperCase()}</strong> • Collected by{" "}
                        <strong className="text-slate-800">{dep.collectedByName || "Staff"}</strong>
                      </span>

                      <DepositReceiptModal
                        pgName="Royal Stay PG"
                        primaryColor="#4F46E5"
                        tenantName={dep.tenantName}
                        roomNumber={`Room ${dep.roomNumber}`}
                        bedLabel={dep.bedLabel}
                        receiptNumber={dep.id}
                        amount={dep.paidAmount || dep.expectedAmount}
                        paymentMode={dep.paymentMode}
                        collectedByName={dep.collectedByName || "Staff Desk"}
                        status={dep.status === "paid" ? "Paid • Held Safely" : "Refunded"}
                        deductionAmount={dep.deductionAmount}
                        deductionReason={dep.deductionReason}
                        refundedAmount={dep.refundedAmount}
                        triggerButton={
                          <button
                            type="button"
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-[10px] font-extrabold border border-indigo-200 transition cursor-pointer"
                          >
                            Deposit Receipt
                          </button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ========================================================================= */
        /* ADMIN VIEW: MY COLLECTIONS & CASH HANDOVER DESK */
        /* ========================================================================= */
        <div className="space-y-3.5">
          {/* Admin Collections KPI Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                My Total Collections
              </div>
              <div className="text-xl font-black text-emerald-600 tabular-nums mt-0.5">
                ₹{myAdminTotal.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">All modes combined</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Handover
              </div>
              <div className="text-xl font-black text-amber-600 tabular-nums mt-0.5">
                ₹{myAdminPending.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-amber-700 font-bold mt-0.5">Physical Cash in Hand</div>
            </div>
          </div>

          {/* Admin Collections History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs font-extrabold text-slate-900">
                My Collections History ({myAdminCollections.length})
              </h3>
              <span className="text-[10px] text-slate-400">Warden Cash Register</span>
            </div>

            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
              {myAdminCollections.map((col) => {
                const isSettled = col.status === "settled_with_owner";

                return (
                  <div
                    key={col.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900">
                            {col.tenantName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              isSettled
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isSettled ? "Handed Over to Owner ✅" : "Pending Handover to Owner"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {col.room} • Mode: <strong className="text-slate-700">{col.paymentMode.toUpperCase()}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          ₹{col.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-400 block">
                          #{col.id}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {col.collectedAt}
                      </span>

                      <RentReceiptModal
                        pgName="Royal Stay PG"
                        primaryColor="#4F46E5"
                        tenantName={col.tenantName}
                        roomNumber={col.room}
                        invoiceNumber={col.id}
                        amount={`₹${col.amount.toLocaleString("en-IN")}`}
                        dueDate={col.collectedAt}
                        triggerButton={
                          <button
                            type="button"
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                          >
                            View Receipt
                          </button>
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
