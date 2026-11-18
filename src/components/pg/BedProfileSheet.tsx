"use client";

import { useState } from "react";
import {
  X,
  Phone,
  PhoneForwarded,
  Ticket,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Building,
  Check,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  Send,
  AlertTriangle,
} from "lucide-react";
import { TenantProfileItem, BuildingItem, FloorItem, RoomItem, BedItem, RentPaymentRecord } from "@/lib/data/rooms";
import {
  verifyTenantKycAction,
  vacateBedAction,
  collectRentPaymentAction,
  settleRentPaymentAction,
  collectSecurityDepositAction,
  refundSecurityDepositAction,
} from "@/app/actions/rooms-and-ops";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";

interface BedProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem;
  floor: FloorItem;
  floorIdx: number;
  room: RoomItem;
  bed: BedItem;
  bedIdx: number;
  userRole: "owner" | "admin" | "super_admin" | "tenant";
  initialTemplate?: "rent_reminder" | "welcome_info" | "custom";
}

export function BedProfileSheet({
  isOpen,
  onClose,
  building,
  floor,
  floorIdx,
  room,
  bed,
  bedIdx,
  userRole,
  initialTemplate = "rent_reminder",
}: BedProfileSheetProps) {
  const [whatsappTemplate, setWhatsappTemplate] = useState<"rent_reminder" | "welcome_info" | "custom">(initialTemplate);
  const [whatsappAutoApi, setWhatsappAutoApi] = useState(false);
  const [customMsg, setCustomMsg] = useState("Namaste! Aapke PG room se juda ek zaroori update hai.");
  const [vacateConfirmStep, setVacateConfirmStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Collect Rent State
  const [isCollectingRent, setIsCollectingRent] = useState(false);
  const [rentPaymentMode, setRentPaymentMode] = useState<"cash" | "admin_upi" | "pg_bank_upi">("cash");
  const [rentTxRef, setRentTxRef] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<RentPaymentRecord | null>(null);

  // Security Deposit State
  const [isCollectingDeposit, setIsCollectingDeposit] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState<number>(bed.tenant?.deposit || 8500);
  const [depositModeInput, setDepositModeInput] = useState<"cash" | "upi" | "bank_transfer">("cash");
  const [depositRefInput, setDepositRefInput] = useState("");

  // Refund Deposit State (Owner Only)
  const [isRefundingDeposit, setIsRefundingDeposit] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState("");

  // Pending Handover state on this bed
  const [isHandoverPending, setIsHandoverPending] = useState(
    bed.tenant?.id === "t-rahul" || bed.tenant?.id === "t-karan"
  );

  if (!isOpen || !bed.tenant) return null;

  const t = bed.tenant;
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";
  const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // Build WhatsApp Message
  const getWhatsappMessage = () => {
    if (whatsappTemplate === "rent_reminder") {
      return `Namaste ${t.name}, ShunyOS Stay (${building.name}, Room ${room.number}) ka aapka rent ₹${room.rent.toLocaleString("en-IN")} due hai. Kripya UPI ID royalstaypg@okicici par pay karein.`;
    }
    if (whatsappTemplate === "welcome_info") {
      return `Welcome ${t.name} to ShunyOS Stay (${building.name}, Room ${room.number})! Wi-Fi: ShunyOS_5G | Pass: ShunyOS@2026.`;
    }
    return customMsg;
  };

  const handleSendWhatsapp = () => {
    const msg = getWhatsappMessage();
    if (whatsappAutoApi) {
      setToastMsg(`⚡ Cloud API dispatched to ${t.name}`);
      setTimeout(() => setToastMsg(null), 3000);
    } else {
      const cleanPhone = t.phone.replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    }
  };

  const handleVerifyKyc = async () => {
    setIsProcessing(true);
    await verifyTenantKycAction(t.id);
    t.kycStatus = "Verified";
    setIsProcessing(false);
    setToastMsg("KYC verified successfully ✓");
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Collect Rent Handler
  const handleConfirmCollectRent = async () => {
    setIsProcessing(true);
    const res = await collectRentPaymentAction({
      tenantId: t.id,
      tenantName: t.name,
      roomNumber: `${building.name} • Room ${room.number}`,
      buildingId: building.id,
      amount: room.rent,
      paymentMode: rentPaymentMode,
      transactionRef: rentTxRef || undefined,
    });

    if (res.invoice) {
      setGeneratedInvoice(res.invoice);
      t.rentPaid = true;
      if (res.invoice.status === "collected_by_admin") {
        setIsHandoverPending(true);
      }
    }
    setIsProcessing(false);
    setIsCollectingRent(false);
    setToastMsg(`Rent ₹${room.rent.toLocaleString("en-IN")} collected! Invoice generated.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1-Tap Confirm Cash Handover on Drawer
  const handleConfirmHandover = async () => {
    setIsProcessing(true);
    const invId = generatedInvoice?.id || (t.id === "t-rahul" ? "INV-202611-04" : "INV-202611-05");
    await settleRentPaymentAction(invId);
    setIsHandoverPending(false);
    setIsProcessing(false);
    setToastMsg("Cash confirmed & settled with Owner Ledger ✅");
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Collect Deposit Handler
  const handleConfirmCollectDeposit = async () => {
    setIsProcessing(true);
    await collectSecurityDepositAction({
      tenantId: t.id,
      amount: depositAmountInput,
      paymentMode: depositModeInput,
      transactionRef: depositRefInput || undefined,
    });

    t.deposit = depositAmountInput;
    t.depositStatus = "paid";
    t.depositPaymentMode = depositModeInput;
    t.depositCollectedByName = isOwner ? "Owner Manoj Kumar" : "Warden Staff";
    t.depositCollectedAt = "Today";

    setIsProcessing(false);
    setIsCollectingDeposit(false);
    setToastMsg(`Deposit ₹${depositAmountInput.toLocaleString("en-IN")} marked Paid & Held Safely!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Refund Deposit Handler (Owner Only)
  const handleConfirmRefundDeposit = async () => {
    setIsProcessing(true);
    await refundSecurityDepositAction({
      tenantId: t.id,
      deductionAmount,
      deductionReason: deductionReason || "Checkout room inspection",
    });

    t.depositStatus = deductionAmount > 0 ? "partially_refunded" : "refunded";
    t.depositDeduction = deductionAmount;
    t.depositDeductionReason = deductionReason;
    t.depositRefundedAmount = Math.max(0, t.deposit - deductionAmount);

    setIsProcessing(false);
    setIsRefundingDeposit(false);
    setToastMsg(`Security deposit settled: Refunded ₹${(t.deposit - deductionAmount).toLocaleString("en-IN")}`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleVacate = async () => {
    setIsProcessing(true);
    await vacateBedAction(building.id, floorIdx, room.id, bedIdx);
    setIsProcessing(false);
    onClose();
  };

  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const netRefund = Math.max(0, (t.deposit || 8500) - deductionAmount);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-3xl p-5 pb-8 max-h-[92%] overflow-y-auto shadow-2xl border-t border-slate-200 bg-white text-slate-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900">{t.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      t.kycStatus === "Verified"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    KYC {t.kycStatus}
                  </span>
                </div>
                <p className="text-[10.5px] font-bold text-slate-500">
                  {building.name} • {floor.name} • Room {room.number} ({bed.label})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {toastMsg && (
            <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Quick Call & Issue Gate Pass Buttons */}
          <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-extrabold">
            <a
              href={`tel:${t.phone}`}
              className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Call Student</span>
            </a>
            <a
              href={`tel:${t.parentPhone}`}
              className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95 shadow-xs"
            >
              <PhoneForwarded className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Parent</span>
            </a>
            <button
              onClick={() => {
                alert(`Gate Pass generation shortcut for ${t.name}`);
              }}
              className="py-2 px-2 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Gate Pass</span>
            </button>
          </div>

          {/* AMBER ALERT BANNER: PENDING CASH HANDOVER TO OWNER */}
          {isHandoverPending && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-amber-900">
                      Pending Cash Handover from Staff
                    </div>
                    <div className="text-[10px] text-amber-700">
                      Rent collected by Warden • Pending physical handover to Owner
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-900 tabular-nums">
                  ₹{room.rent.toLocaleString("en-IN")}
                </span>
              </div>

              {isOwner && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmHandover}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Cash Received & Settle to Ledger</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. DEDICATED SECURITY DEPOSIT CARD (PART 1) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Security Deposit</h4>
                  <p className="text-[10px] text-slate-400">100% Refundable at Checkout</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-slate-900 tabular-nums">
                  ₹{(t.deposit || 8500).toLocaleString("en-IN")}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    t.depositStatus === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : t.depositStatus === "pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  {t.depositStatus === "paid"
                    ? "Paid • Held Safely"
                    : t.depositStatus === "pending"
                    ? "Deposit Pending"
                    : "Refunded"}
                </span>
              </div>
            </div>

            {/* Deposit Metadata */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500">
              <span>
                Mode: <strong className="text-slate-800">{(t.depositPaymentMode || "UPI").toUpperCase()}</strong>
              </span>
              <span>
                Collected by: <strong className="text-slate-800">{t.depositCollectedByName || "Warden Ramesh"}</strong>
              </span>
            </div>

            {/* Actions: Collect Deposit (if pending) OR Refund Deposit (if paid & Owner) */}
            <div className="pt-1 flex items-center gap-2">
              {t.depositStatus === "pending" ? (
                <button
                  type="button"
                  onClick={() => setIsCollectingDeposit(!isCollectingDeposit)}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition shadow-xs active:scale-95"
                >
                  {isCollectingDeposit ? "Cancel" : "Collect Deposit"}
                </button>
              ) : (
                <>
                  <DepositReceiptModal
                    pgName="Royal Stay PG"
                    primaryColor="#4F46E5"
                    tenantName={t.name}
                    roomNumber={`Room ${room.number}`}
                    bedLabel={bed.label}
                    amount={t.deposit || 8500}
                    paymentMode={t.depositPaymentMode || "UPI"}
                    collectedByName={t.depositCollectedByName || "Warden Staff"}
                    status={t.depositStatus === "paid" ? "Paid • Held Safely" : "Refunded"}
                    deductionAmount={t.depositDeduction}
                    deductionReason={t.depositDeductionReason}
                    refundedAmount={t.depositRefundedAmount}
                    triggerButton={
                      <button
                        type="button"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold border border-slate-200/90 text-center transition"
                      >
                        Deposit Receipt
                      </button>
                    }
                  />

                  {isOwner && t.depositStatus === "paid" && (
                    <button
                      type="button"
                      onClick={() => setIsRefundingDeposit(!isRefundingDeposit)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10.5px] font-bold border border-purple-200 text-center transition"
                    >
                      {isRefundingDeposit ? "Cancel" : "Settle / Refund Deposit"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Quick Collect Deposit Form Panel */}
            {isCollectingDeposit && t.depositStatus === "pending" && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2 animate-in fade-in">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
                  Collect Security Deposit
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Amount (₹)</label>
                    <input
                      type="number"
                      value={depositAmountInput}
                      onChange={(e) => setDepositAmountInput(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Mode</label>
                    <select
                      value={depositModeInput}
                      onChange={(e) => setDepositModeInput(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI</option>
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Ref / UTR (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-DEP-991"
                    value={depositRefInput}
                    onChange={(e) => setDepositRefInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmCollectDeposit}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xs transition"
                >
                  {isProcessing ? "Saving..." : "Confirm Deposit Collection"}
                </button>
              </div>
            )}

            {/* Settle / Refund Deposit Panel (Owner Only) */}
            {isRefundingDeposit && isOwner && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 mt-2 animate-in fade-in text-xs">
                <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wide block">
                  Checkout Deposit Settlement
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                      Deduction (₹)
                    </label>
                    <input
                      type="number"
                      value={deductionAmount}
                      onChange={(e) => setDeductionAmount(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                      Net Refund Amount
                    </label>
                    <div className="px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-black text-emerald-700 tabular-nums">
                      ₹{netRefund.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                    Deduction Reason (if any)
                  </label>
                  <input
                    type="text"
                    value={deductionReason}
                    onChange={(e) => setDeductionReason(e.target.value)}
                    placeholder="e.g. Wall painting damage / Key loss"
                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmRefundDeposit}
                  className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold shadow-xs transition"
                >
                  {isProcessing ? "Processing..." : `Confirm Refund ₹${netRefund.toLocaleString("en-IN")} & Close`}
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. FLOOR-WISE RENT COLLECTION & 2-STEP AUTO-INVOICE (PART 2) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 text-xs shadow-sm">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">College / Office</span>
                <strong className="text-slate-800">{t.college}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Joining Date</span>
                <strong className="text-slate-800">{t.joinDate}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Monthly Rent</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-indigo-600 tabular-nums">
                    ₹{room.rent.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      t.rentPaid
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {t.rentPaid ? "Paid" : "Rent Due"}
                  </span>
                </div>
              </div>

              {!t.rentPaid ? (
                <button
                  type="button"
                  onClick={() => setIsCollectingRent(!isCollectingRent)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-extrabold text-xs shadow-xs transition active:scale-95"
                >
                  {isCollectingRent ? "Close" : "Collect Rent"}
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" /> Paid
                  </span>
                  <RentReceiptModal
                    pgName="Royal Stay PG"
                    primaryColor="#4F46E5"
                    tenantName={t.name}
                    roomNumber={`Room ${room.number}`}
                    amount={`₹${room.rent.toLocaleString("en-IN")}`}
                    dueDate="Nov 05, 2026"
                    triggerButton={
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold hover:bg-indigo-100"
                      >
                        Invoice PDF
                      </button>
                    }
                  />
                </div>
              )}
            </div>

            {/* Slide-Up Collect Rent Sheet */}
            {isCollectingRent && !t.rentPaid && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>Cycle: November 2026</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    Preview: Today, {nowTime}
                  </span>
                </div>

                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
                  Select Collection Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setRentPaymentMode("cash")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      rentPaymentMode === "cash"
                        ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentPaymentMode("admin_upi")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      rentPaymentMode === "admin_upi"
                        ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    📱 Admin UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentPaymentMode("pg_bank_upi")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      rentPaymentMode === "pg_bank_upi"
                        ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    🏦 PG Bank UPI
                  </button>
                </div>

                {rentPaymentMode === "admin_upi" && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    💡 Paid to Warden UPI. Will flag in Owner Ledger as &ldquo;Pending Cash Handover&rdquo;.
                  </p>
                )}

                {rentPaymentMode === "pg_bank_upi" && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ⚡ Direct to PG Bank Account. Marks automatically as &ldquo;Settled with Owner&rdquo;.
                  </p>
                )}

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                    UTR / Transaction Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={rentTxRef}
                    onChange={(e) => setRentTxRef(e.target.value)}
                    placeholder="e.g. UTR-4910281"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmCollectRent}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Receipt & Generate Invoice</span>
                </button>
              </div>
            )}

            {/* INSTANT INVOICE SUCCESS CARD (Auto-displays right after payment) */}
            {generatedInvoice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instant Invoice Generated</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800">
                    {generatedInvoice.id}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-950">
                  <span>₹{generatedInvoice.amount.toLocaleString("en-IN")} via {generatedInvoice.paymentMode.toUpperCase()}</span>
                  <span className="text-[10px] text-emerald-700">{generatedInvoice.collectedAt}</span>
                </div>

                {/* 1-Tap Send on WhatsApp (wa.me) */}
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`https://wa.me/91${t.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Namaste ${t.name}! Rent payment of ₹${generatedInvoice.amount.toLocaleString("en-IN")} for Royal Stay PG (${building.name}, Room ${room.number}) has been recorded.\n• Invoice No: ${generatedInvoice.id}\n• Payment Mode: ${generatedInvoice.paymentMode.toUpperCase()}\n• Timestamp: ${generatedInvoice.collectedAt}\n• Status: Confirmed Paid ✅\nThank you!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Invoice on WhatsApp</span>
                  </a>

                  <RentReceiptModal
                    pgName="Royal Stay PG"
                    primaryColor="#4F46E5"
                    tenantName={t.name}
                    roomNumber={`Room ${room.number}`}
                    invoiceNumber={generatedInvoice.id}
                    amount={`₹${generatedInvoice.amount.toLocaleString("en-IN")}`}
                    dueDate={generatedInvoice.collectedAt}
                    triggerButton={
                      <button
                        type="button"
                        className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-extrabold hover:bg-emerald-100/50 transition"
                      >
                        PDF
                      </button>
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Send WhatsApp Menu (3 Templates + Live Preview) */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp</span>
              </span>
              <button
                type="button"
                onClick={() => setWhatsappAutoApi(!whatsappAutoApi)}
                className="px-2 py-0.5 rounded bg-white text-slate-900 text-[9px] font-extrabold border border-slate-200 shadow-2xs"
              >
                {whatsappAutoApi ? "Cloud API Auto ⚡" : "wa.me Link (Free)"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setWhatsappTemplate("rent_reminder")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "rent_reminder"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Rent Reminder
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTemplate("welcome_info")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "welcome_info"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Welcome & Wi-Fi
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTemplate("custom")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "custom"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Custom Msg
              </button>
            </div>

            {whatsappTemplate === "custom" ? (
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10.5px] text-slate-900"
              />
            ) : (
              <div className="p-2 bg-white/80 rounded-lg text-[10px] text-slate-600 leading-relaxed border border-emerald-100">
                &ldquo;{getWhatsappMessage()}&rdquo;
              </div>
            )}

            <button
              type="button"
              onClick={handleSendWhatsapp}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-xs"
            >
              Send WhatsApp Message
            </button>
          </div>

          {/* Vacate Bed (Owner Only, Two-Step Inline Confirm) */}
          {isOwner && (
            <div className="pt-1">
              {!vacateConfirmStep ? (
                <button
                  type="button"
                  onClick={() => setVacateConfirmStep(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition"
                >
                  Vacate / Checkout Bed
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="text-[10.5px] font-extrabold text-rose-700">
                    Confirm free up {bed.label}?
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleVacate}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold hover:bg-rose-700"
                    >
                      Yes, Vacate
                    </button>
                    <button
                      type="button"
                      onClick={() => setVacateConfirmStep(false)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-extrabold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
