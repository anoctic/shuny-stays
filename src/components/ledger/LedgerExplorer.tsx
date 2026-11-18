"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  BuildingItem,
  ExpenseItem,
  UpiApprovalItem,
  TenantProfileItem,
} from "@/lib/data/rooms";
import { markBedRentPaidAction } from "@/app/actions/rooms-and-ops";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";

interface CashHandoverItem {
  id: string;
  adminName: string;
  tenantName: string;
  room: string;
  amount: number;
  time: string;
  settled: boolean;
}

interface LedgerExplorerProps {
  buildings: BuildingItem[];
  expenses: ExpenseItem[];
  upiApprovals: UpiApprovalItem[];
  userRole: "owner" | "admin" | "super_admin" | "tenant";
}

const initialHandovers: CashHandoverItem[] = [
  {
    id: "ch-01",
    adminName: "Warden Suresh",
    tenantName: "Rahul Sharma",
    room: "Block A • Room 101",
    amount: 8500,
    time: "Today, 11:30 AM",
    settled: false,
  },
  {
    id: "ch-02",
    adminName: "Warden Suresh",
    tenantName: "Karan Mehta",
    room: "Block A • Room 102",
    amount: 8500,
    time: "Yesterday, 06:15 PM",
    settled: false,
  },
];

const mockSettledInvoices = [
  {
    id: "INV-202611-01",
    tenantName: "Aman Verma",
    room: "Block A • Room 102",
    amount: 8500,
    date: "15 Nov 2026",
    method: "Cash Handover (Verified)",
  },
  {
    id: "INV-202611-02",
    tenantName: "Aarav Patel",
    room: "Block A • Room 101",
    amount: 8500,
    date: "12 Nov 2026",
    method: "Bank UPI Transfer",
  },
  {
    id: "INV-202611-03",
    tenantName: "Vikram Sen",
    room: "Block B • Room 201",
    amount: 9000,
    date: "10 Nov 2026",
    method: "Admin QR UPI",
  },
];

export function LedgerExplorer({
  buildings,
  expenses,
  upiApprovals,
  userRole,
}: LedgerExplorerProps) {
  const [handovers, setHandovers] = useState<CashHandoverItem[]>(initialHandovers);
  const [settledInvoices, setSettledInvoices] = useState(mockSettledInvoices);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Compute stats
  let totalDeposits = 0;
  let rentCollected = 42500;

  buildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          if (bed.occupied && bed.tenant) {
            totalDeposits += bed.tenant.deposit || 8500;
          }
        });
      });
    });
  });

  const pendingHandoverTotal = handovers
    .filter((h) => !h.settled)
    .reduce((acc, h) => acc + h.amount, 0);

  // 1-Tap Confirm Cash Received
  const handleConfirmHandover = async (item: CashHandoverItem) => {
    setHandovers((prev) =>
      prev.map((h) => (h.id === item.id ? { ...h, settled: true } : h))
    );

    const newInvoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      tenantName: item.tenantName,
      room: item.room,
      amount: item.amount,
      date: "Today",
      method: "Cash Handover (Owner Verified)",
    };

    setSettledInvoices([newInvoice, ...settledInvoices]);
    showToast(`Confirmed ₹${item.amount.toLocaleString("en-IN")} Cash from ${item.adminName}!`);
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* 1. Exactly 3 Clean KPI Cards */}
      <div className="space-y-2.5">
        {/* KPI 1: Rent Collected */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
              Rent Collected
            </div>
            <div className="text-xl font-black text-emerald-600 tabular-nums mt-0.5">
              ₹{rentCollected.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Current Active Cycle</div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Verified
          </span>
        </div>

        {/* KPI 2: Pending Cash Handover from Admin */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Cash Handover from Admin
            </div>
            <div className="text-xl font-black text-amber-600 tabular-nums mt-0.5">
              ₹{pendingHandoverTotal.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Collected by Warden • Waiting for Owner Deposit
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
              Security Deposit Held — Refundable
            </div>
            <div className="text-xl font-black text-indigo-600 tabular-nums mt-0.5">
              ₹{totalDeposits.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Held in Trust • 100% Refundable at Checkout
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Refundable
          </span>
        </div>
      </div>

      {/* 2. Pending Cash Handover List with 1-Tap Confirm Cash Received */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-extrabold text-slate-900">
            Pending Cash Handovers ({handovers.filter((h) => !h.settled).length})
          </h3>
          <span className="text-[10px] font-bold text-amber-700">Warden Cash Desk</span>
        </div>

        {handovers.filter((h) => !h.settled).length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center text-xs text-slate-400">
            All cash collections from warden have been settled & verified!
          </div>
        ) : (
          handovers
            .filter((h) => !h.settled)
            .map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {item.tenantName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.room} • Collected by {item.adminName}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900 tabular-nums">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.time}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleConfirmHandover(item)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Cash Received</span>
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* 3. Settled Payment & Auto-Invoice Audit History */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-900 px-0.5">
          Settled Payments & Invoices Audit
        </h3>

        {settledInvoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-2 shadow-sm"
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
                {inv.room} • {inv.method} • <span className="font-mono">{inv.id}</span>
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
                dueDate={inv.date}
                triggerButton={
                  <button
                    type="button"
                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold border border-indigo-200 transition"
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
  );
}
