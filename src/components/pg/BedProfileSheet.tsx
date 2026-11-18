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
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Zap,
} from "lucide-react";
import { TenantProfileItem, BuildingItem, FloorItem, RoomItem, BedItem } from "@/lib/data/rooms";
import { verifyTenantKycAction, vacateBedAction } from "@/app/actions/rooms-and-ops";

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
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 max-h-[89%] overflow-y-auto phone-scroll shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-[#0F172A]">{t.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      t.kycStatus === "Verified"
                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-700 border border-amber-500/40"
                    }`}
                  >
                    KYC {t.kycStatus}
                  </span>
                </div>
                <p className="text-[10.5px] font-bold text-[#64748B]">
                  {building.name} • {floor.name} • Room {room.number} ({bed.label})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition"
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
              className="py-2 px-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] hover:bg-[#E2E8F0] flex items-center justify-center gap-1 text-[#0F172A] transition active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Call Student</span>
            </a>
            <a
              href={`tel:${t.parentPhone}`}
              className="py-2 px-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] hover:bg-[#E2E8F0] flex items-center justify-center gap-1 text-[#0F172A] transition active:scale-95"
            >
              <PhoneForwarded className="w-3.5 h-3.5 text-emerald-500" />
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

          {/* Personal, College, Deposit & KYC Docs */}
          <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] space-y-2 text-[10.5px]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[#64748B] block">College / Office</span>
                <strong className="text-[#0F172A]">{t.college}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Joining Date</span>
                <strong className="text-[#0F172A]">{t.joinDate}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Monthly Rent</span>
                <strong className="text-[#4F46E5]">
                  ₹{room.rent.toLocaleString("en-IN")}{" "}
                  <span className={t.rentPaid ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                    ({t.rentPaid ? "Paid" : "Due"})
                  </span>
                </strong>
              </div>
              <div>
                <span className="text-[#64748B] block">Security Deposit</span>
                <strong className="text-emerald-600">₹{t.deposit.toLocaleString("en-IN")}</strong>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="font-bold text-[#64748B]">Docs: Aadhar Front/Back + Police Verif</span>
              {t.kycStatus !== "Verified" ? (
                <button
                  onClick={handleVerifyKyc}
                  disabled={isProcessing}
                  className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[9.5px] transition active:scale-95"
                >
                  Verify Now
                </button>
              ) : (
                <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
                  Verified ✓
                </span>
              )}
            </div>
          </div>

          {/* Send WhatsApp Menu (3 Templates + Live Preview) */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
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
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-white text-[#0F172A] border border-[#E2E8F0]"
                }`}
              >
                Rent Reminder
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTemplate("welcome_info")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "welcome_info"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-white text-[#0F172A] border border-[#E2E8F0]"
                }`}
              >
                Welcome & Wi-Fi
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTemplate("custom")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "custom"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-white text-[#0F172A] border border-[#E2E8F0]"
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
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[10.5px] text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            ) : (
              <div className="p-2 rounded-xl bg-white border border-emerald-500/20 text-[10px] text-[#64748B] leading-relaxed">
                &ldquo;{getWhatsappMessage()}&rdquo;
              </div>
            )}

            <button
              type="button"
              onClick={handleSendWhatsapp}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send WhatsApp Message</span>
            </button>
          </div>

          {/* Vacate Bed (Owner Only, Two-Step Inline Confirm) */}
          {isOwner && (
            <div>
              {!vacateConfirmStep ? (
                <button
                  type="button"
                  onClick={() => setVacateConfirmStep(true)}
                  className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/25 text-xs font-extrabold transition"
                >
                  Vacate / Checkout Bed
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-2 animate-fade-in">
                  <span className="text-[10.5px] font-extrabold text-rose-600">
                    Confirm free up {bed.label}?
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleVacate}
                      className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-extrabold shadow-xs transition"
                    >
                      Yes, Vacate
                    </button>
                    <button
                      type="button"
                      onClick={() => setVacateConfirmStep(false)}
                      className="px-2 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] text-[10px] font-extrabold transition"
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
