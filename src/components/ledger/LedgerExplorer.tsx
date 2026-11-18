"use client";

import { useState } from "react";
import {
  IndianRupee,
  Image as ImageIcon,
  MessageCircle,
  X,
  Plus,
  Check,
  AlertCircle,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import {
  BuildingItem,
  ExpenseItem,
  UpiApprovalItem,
  TenantProfileItem,
} from "@/lib/data/rooms";
import {
  logExpenseAction,
  approveUpiPaymentAction,
  rejectUpiPaymentAction,
  markBedRentPaidAction,
} from "@/app/actions/rooms-and-ops";
import { BedProfileSheet } from "@/components/pg/BedProfileSheet";

interface LedgerExplorerProps {
  buildings: BuildingItem[];
  expenses: ExpenseItem[];
  upiApprovals: UpiApprovalItem[];
  userRole: "owner" | "admin" | "super_admin" | "tenant";
}

export function LedgerExplorer({
  buildings,
  expenses,
  upiApprovals,
  userRole,
}: LedgerExplorerProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isUpiSettingsOpen, setIsUpiSettingsOpen] = useState(false);
  const [previewUpiItem, setPreviewUpiItem] = useState<UpiApprovalItem | null>(null);

  // Active BedProfileSheet for sending rent reminder
  const [activeReminderTarget, setActiveReminderTarget] = useState<{
    building: BuildingItem;
    floor: any;
    floorIdx: number;
    room: any;
    bed: any;
    bedIdx: number;
  } | null>(null);

  // Filter buildings
  const visibleBuildings =
    selectedBuildingId === "all"
      ? buildings
      : buildings.filter((b) => b.id === selectedBuildingId);

  // Stats calculation
  let collected = 0;
  let expected = 0;
  const occupiedList: {
    building: BuildingItem;
    floor: any;
    floorIdx: number;
    room: any;
    bed: any;
    bedIdx: number;
    tenant: TenantProfileItem;
  }[] = [];

  visibleBuildings.forEach((b) => {
    b.floors.forEach((f, fIdx) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed, bIdx) => {
          if (bed.occupied && bed.tenant) {
            expected += r.rent;
            if (bed.tenant.rentPaid) {
              collected += r.rent;
            }
            occupiedList.push({
              building: b,
              floor: f,
              floorIdx: fIdx,
              room: r,
              bed,
              bedIdx: bIdx,
              tenant: bed.tenant,
            });
          }
        });
      });
    });
  });

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = Math.max(0, collected - totalExpense);
  const pendingDues = Math.max(0, expected - collected);
  const pendingUpi = upiApprovals.filter((u) => u.status === "Pending");

  return (
    <div className="space-y-3.5">
      {/* 1. Bento P&L Summary */}
      <div className="p-4 rounded-2xl bg-[#4F46E5] text-white shadow-md space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold">November Rent & Net Profit</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsUpiSettingsOpen(true)}
              className="px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-[10px] font-extrabold transition"
            >
              UPI & Late Fee
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-[10px] font-extrabold transition shadow-xs"
            >
              + Expense
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-white/15">
            <div className="text-[9px] opacity-85">Collected</div>
            <div className="text-xs font-extrabold tabular-nums mt-0.5">
              ₹{collected.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/15">
            <div className="text-[9px] opacity-85">Expenses</div>
            <div className="text-xs font-extrabold tabular-nums mt-0.5">
              ₹{totalExpense.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-400/25 border border-emerald-300/40">
            <div className="text-[9px] text-emerald-100">Net Profit</div>
            <div className="text-xs font-extrabold tabular-nums text-emerald-200 mt-0.5">
              ₹{netProfit.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/15 opacity-90">
          <span>Expected: ₹{expected.toLocaleString("en-IN")}</span>
          <span>Pending Dues: ₹{pendingDues.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* 2. Pending UPI Screenshot Verification Queue */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#0F172A]">
            UPI Screenshot Verification ({pendingUpi.length})
          </h3>
          <span className="text-[10px] font-bold text-emerald-600">0% Gateway Fee</span>
        </div>

        {upiApprovals.map((u) => (
          <div
            key={u.id}
            className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setPreviewUpiItem(u)}
                className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 flex items-center justify-center shrink-0 transition"
                title="Preview Screenshot"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#0F172A] truncate">
                  {u.tenantName} • ₹{u.amount.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {u.room} • <span className="font-mono">{u.utr}</span>
                </div>
              </div>
            </div>

            {u.status === "Pending" ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    await approveUpiPaymentAction(u.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs transition active:scale-95"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await rejectUpiPaymentAction(u.id);
                  }}
                  className="p-1.5 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 transition active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  u.status === "Approved"
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                }`}
              >
                {u.status}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 3. Residents Rent Ledger */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-[#0F172A] px-0.5">
          Residents Rent Ledger ({occupiedList.length})
        </h3>

        {occupiedList.map((item) => (
          <div
            key={item.tenant.id}
            className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-[#0F172A] truncate">
                  {item.tenant.name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                    item.tenant.rentPaid
                      ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                  }`}
                >
                  {item.tenant.rentPaid
                    ? "Paid"
                    : `Due ₹${item.room.rent.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">
                {item.building.name} • Room {item.room.number} ({item.bed.label})
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveReminderTarget({
                    building: item.building,
                    floor: item.floor,
                    floorIdx: item.floorIdx,
                    room: item.room,
                    bed: item.bed,
                    bedIdx: item.bedIdx,
                  })
                }
                className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 transition active:scale-95"
                title="Send WhatsApp Reminder"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {!item.tenant.rentPaid && (
                <button
                  type="button"
                  onClick={async () => {
                    await markBedRentPaidAction(item.tenant.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[10px] font-extrabold shadow-xs transition active:scale-95"
                >
                  Cash Paid
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Logged Expenses */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#0F172A]">Logged Expenses</h3>
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="text-[10px] font-extrabold text-[#4F46E5] hover:underline"
          >
            + Log Expense
          </button>
        </div>

        {expenses.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between text-[11px] py-1 border-b last:border-b-0 border-[#E2E8F0]"
          >
            <div>
              <span className="font-bold text-[#0F172A]">{e.category}</span>
              <span className="text-[9.5px] text-[#64748B] block">
                {e.scope} • {e.date}
              </span>
            </div>
            <span className="font-extrabold text-rose-500 tabular-nums">
              -₹{e.amount.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      {/* Sheets / Modals */}
      {isExpenseModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
          onClick={() => setIsExpenseModalOpen(false)}
        >
          <div
            className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0F172A]">+ Log PG Expense</h3>
                <button
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await logExpenseAction(formData);
                  setIsExpenseModalOpen(false);
                }}
                className="space-y-2.5 text-xs"
              >
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Expense Category</label>
                  <input
                    name="category"
                    type="text"
                    required
                    defaultValue="Electricity Bill"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Amount (₹)</label>
                  <input
                    name="amount"
                    type="number"
                    required
                    defaultValue="4500"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Scope</label>
                  <select
                    name="scope"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  >
                    <option value="All Buildings">All Buildings</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
                >
                  Save Expense Record
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isUpiSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
          onClick={() => setIsUpiSettingsOpen(false)}
        >
          <div
            className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0F172A]">UPI QR & Late Fee Settings</h3>
                <button
                  onClick={() => setIsUpiSettingsOpen(false)}
                  className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Owner Direct UPI ID</label>
                  <input
                    type="text"
                    defaultValue="royalstaypg@okicici"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-mono font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Due Date</label>
                  <input
                    type="text"
                    defaultValue="5th of every month"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Auto Late Fee (₹/day)</label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUpiSettingsOpen(false)}
                className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
              >
                Save Payment Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUpiItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
          onClick={() => setPreviewUpiItem(null)}
        >
          <div
            className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0F172A]">
                  UPI Payment Proof ({previewUpiItem.tenantName})
                </h3>
                <button
                  onClick={() => setPreviewUpiItem(null)}
                  className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white text-center space-y-1">
                <div className="text-xs text-emerald-400 font-extrabold">
                  ✓ Google Pay / UPI Transfer Verified
                </div>
                <div className="text-2xl font-black tabular-nums">
                  ₹{previewUpiItem.amount.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] font-mono text-slate-300">
                  Ref: {previewUpiItem.utr} • {previewUpiItem.time}
                </div>
              </div>

              {previewUpiItem.status === "Pending" && (
                <button
                  type="button"
                  onClick={async () => {
                    await approveUpiPaymentAction(previewUpiItem.id);
                    setPreviewUpiItem(null);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
                >
                  Approve & Unlock PDF Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeReminderTarget && (
        <BedProfileSheet
          isOpen={true}
          onClose={() => setActiveReminderTarget(null)}
          building={activeReminderTarget.building}
          floor={activeReminderTarget.floor}
          floorIdx={activeReminderTarget.floorIdx}
          room={activeReminderTarget.room}
          bed={activeReminderTarget.bed}
          bedIdx={activeReminderTarget.bedIdx}
          userRole={userRole}
          initialTemplate="rent_reminder"
        />
      )}
    </div>
  );
}
