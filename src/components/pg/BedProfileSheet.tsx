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
} from "lucide-react";
import { TenantProfileItem, BuildingItem, FloorItem, RoomItem, BedItem } from "@/lib/data/rooms";
import { verifyTenantKycAction, vacateBedAction, markBedRentPaidAction } from "@/app/actions/rooms-and-ops";

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
  const [paymentMode, setPaymentMode] = useState<"cash" | "admin_upi" | "pg_upi">("cash");

  if (!isOpen || !bed.tenant) return null;

  const t = bed.tenant;
  const isOwner = userRole === "owner";

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

  const handleConfirmCollectRent = async () => {
    setIsProcessing(true);
    await markBedRentPaidAction(t.id);
    t.rentPaid = true;
    setIsProcessing(false);
    setIsCollectingRent(false);
    setToastMsg(`Rent ₹${room.rent.toLocaleString("en-IN")} marked Paid via ${paymentMode.toUpperCase()}! Instant Invoice generated.`);
    setTimeout(() => setToastMsg(null), 3000);
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

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-3xl p-5 pb-8 max-h-[90%] overflow-y-auto shadow-2xl border-t border-slate-200 bg-white text-slate-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
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
            <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Quick Call & Issue Gate Pass Buttons */}
          <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-extrabold">
            <a
              href={`tel:${t.phone}`}
              className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Call Student</span>
            </a>
            <a
              href={`tel:${t.parentPhone}`}
              className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95"
            >
              <PhoneForwarded className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Parent</span>
            </a>
            <button
              onClick={() => {
                alert(`Gate Pass generation shortcut for ${t.name}`);
              }}
              className="py-2 px-2 rounded-xl bg-purple-600 text-white flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Gate Pass</span>
            </button>
          </div>

          {/* Security Deposit Badge */}
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Security Deposit Held
            </span>
            <span className="font-extrabold text-indigo-700">
              ₹{t.deposit.toLocaleString("en-IN")} • Refundable
            </span>
          </div>

          {/* Personal, College & Monthly Rent Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 text-xs shadow-sm">
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
                  <span className="text-sm font-black text-indigo-600">
                    ₹{room.rent.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      t.rentPaid
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {t.rentPaid ? "Paid" : "Due"}
                  </span>
                </div>
              </div>

              {!t.rentPaid ? (
                <button
                  type="button"
                  onClick={() => setIsCollectingRent(!isCollectingRent)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xs transition"
                >
                  {isCollectingRent ? "Close" : "Collect Rent"}
                </button>
              ) : (
                <span className="text-emerald-600 font-extrabold text-xs flex items-center gap-1">
                  <Check className="w-4 h-4" /> Paid & Settled
                </span>
              )}
            </div>

            {/* Collect Rent Mode Panel */}
            {isCollectingRent && !t.rentPaid && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 mt-2 animate-in fade-in">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
                  Select Collection Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("cash")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      paymentMode === "cash"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("admin_upi")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      paymentMode === "admin_upi"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    📱 Admin UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("pg_upi")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      paymentMode === "pg_upi"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    🏦 Bank UPI
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmCollectRent}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Receipt & Generate Invoice</span>
                </button>
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
