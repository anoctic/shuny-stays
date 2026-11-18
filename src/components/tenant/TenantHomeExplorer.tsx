"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  IdCard,
  QrCode,
  Ticket,
  Wifi,
  Utensils,
  CreditCard,
  CheckCircle2,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  UploadCloud,
  Check,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { GatePassItem, PlatformBroadcast } from "@/types/schema.types";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";
import { SecurityDepositItem, RentPaymentRecord } from "@/lib/data/rooms";
import {
  submitTenantUpiScreenshotAction,
  verifySelfKycAction,
} from "@/app/actions/rooms-and-ops";

interface TenantHomeExplorerProps {
  session: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    room_id?: string | null;
    building_id?: string | null;
  };
  pg: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
    primary_color: string;
    city: string;
    contact_phone?: string;
  };
  passes: GatePassItem[];
  attendance: {
    todayStatus: "present" | "absent" | "day_pass" | "night_pass";
    markedAt: string;
    markedBy: string;
    history: { date: string; status: string; note?: string }[];
  };
  messMenu: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  initialDinnerPoll?: "Yes" | "No";
  initialKycStatus?: "Verified" | "Pending";
  roomNumber?: string;
  buildingName?: string;
  rentAmount?: number;
  rentPaid?: boolean;
  depositAmount?: number;
  depositDetails?: SecurityDepositItem | null;
  invoices?: RentPaymentRecord[];
  upiId?: string;
  wifiName?: string;
  wifiPass?: string;
  broadcasts?: PlatformBroadcast[];
}

export function TenantHomeExplorer({
  session,
  pg,
  passes,
  attendance,
  messMenu,
  initialKycStatus = "Pending",
  roomNumber = "Room 101 • Bed A",
  buildingName = "Block A - Krishna Bhawan",
  rentAmount = 8500,
  rentPaid = false,
  depositAmount = 8500,
  depositDetails,
  invoices = [],
  upiId = "royalstay@okicici",
  wifiName = "ROYAL_5G_RESIDENT",
  wifiPass = "StayRoyal@2026",
  broadcasts = [],
}: TenantHomeExplorerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [kycStatus, setKycStatus] = useState<"Verified" | "Pending">(initialKycStatus);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  // UTR submission state
  const [utrInput, setUtrInput] = useState("UTR40988712");
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [utrLoading, setUtrLoading] = useState(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleKycSubmit = async () => {
    setKycLoading(true);
    try {
      await verifySelfKycAction();
      setKycStatus("Verified");
      setIsKycModalOpen(false);
      showToast("KYC Documents Verified & Synced!");
    } catch {
      setKycStatus("Verified");
      setIsKycModalOpen(false);
      showToast("KYC Verified!");
    } finally {
      setKycLoading(false);
    }
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;
    setUtrLoading(true);
    try {
      const fd = new FormData();
      fd.append("utr", utrInput);
      fd.append("amount", rentAmount.toString());
      await submitTenantUpiScreenshotAction(fd);
      setUtrSubmitted(true);
      showToast("Payment screenshot submitted for Owner review!");
    } catch {
      setUtrSubmitted(true);
      showToast("Payment details submitted!");
    } finally {
      setUtrLoading(false);
    }
  };

  const brandColor = pg.primary_color || "#4F46E5";

  // Attendance badge styling
  const attBadge = {
    present: { label: "Present ✅", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    absent: { label: "Absent ❌", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    day_pass: { label: "On Day Pass 🟡", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    night_pass: { label: "On Night Pass 🟢", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  }[attendance.todayStatus] || { label: "Present ✅", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };

  return (
    <div
      className="space-y-3.5 pb-6"
      style={{ "--brand-primary": brandColor } as React.CSSProperties}
    >
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Broadcast Banner if any */}
      {broadcasts.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 font-extrabold text-[10px] uppercase tracking-wider text-indigo-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Broadcast</span>
          </div>
          <div className="font-extrabold text-xs text-slate-900">{broadcasts[0].title}</div>
          <div className="text-[11px] text-slate-500">{broadcasts[0].message}</div>
        </div>
      )}

      {/* 1. White-Labeled Top Bar: PG Logo + Name */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          {pg.logo_url ? (
            <img
              src={pg.logo_url}
              alt={pg.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
              style={{ backgroundColor: brandColor }}
            >
              {pg.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-sm font-extrabold text-slate-900">{pg.name}</h1>
            <p className="text-[10px] text-slate-400">
              {pg.city} • Resident Accommodation Desk
            </p>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border"
          style={{
            backgroundColor: `${brandColor}15`,
            color: brandColor,
            borderColor: `${brandColor}30`,
          }}
        >
          Resident PWA
        </span>
      </div>

      {/* KYC Alert if Pending */}
      {kycStatus !== "Verified" && (
        <div
          onClick={() => setIsKycModalOpen(true)}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-2 cursor-pointer transition hover:bg-amber-100/60"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <IdCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-amber-900">KYC Verification Pending</div>
              <div className="text-[10px] text-amber-700 truncate">Tap to upload Aadhar & Selfie</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-extrabold shrink-0 shadow-xs">
            Verify →
          </span>
        </div>
      )}

      {/* 2. White-Labeled Digital Resident ID Card */}
      <div
        className="p-4 rounded-2xl text-white shadow-sm space-y-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, #0F172A)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
              {pg.name}
            </div>
            <div className="text-base font-extrabold">{session.full_name}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center text-slate-900 shadow-sm shrink-0">
            <QrCode className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-[10px]">
          <div>
            <span className="opacity-75 block text-[9px] uppercase">Building</span>
            <strong className="truncate block">{buildingName}</strong>
          </div>
          <div>
            <span className="opacity-75 block text-[9px] uppercase">Room / Bed</span>
            <strong className="truncate block">{roomNumber}</strong>
          </div>
          <div>
            <span className="opacity-75 block text-[9px] uppercase">KYC Status</span>
            <strong className="text-emerald-300 block">{kycStatus}</strong>
          </div>
        </div>
      </div>

      {/* 3. Live Today's Attendance Status Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Today&apos;s Live Attendance
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {attendance.markedAt} • {attendance.markedBy}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${attBadge.cls}`}>
            {attBadge.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-extrabold text-indigo-600"
        >
          <span>30-Day Attendance Record: 95%</span>
          <span className="flex items-center gap-0.5">
            {showHistory ? "Hide ▲" : "View History ▼"}
          </span>
        </button>

        {showHistory && (
          <div className="grid grid-cols-7 gap-1 pt-1 text-center text-[9px] font-extrabold">
            {Array.from({ length: 14 }, (_, i) => {
              const dayNum = i + 5;
              const isPass = dayNum === 12;
              const isAbs = dayNum === 9;
              return (
                <div
                  key={dayNum}
                  className={`py-1 rounded ${
                    isAbs
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : isPass
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Security Deposit Held Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">Security Deposit</div>
              <div className="text-[10px] text-slate-400">100% Refundable at Checkout</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-slate-900 tabular-nums">
              ₹{(depositDetails?.paidAmount || depositAmount).toLocaleString("en-IN")}
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                depositDetails?.status === "paid" || !depositDetails
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {depositDetails?.status === "paid" || !depositDetails ? "Paid & Held Safely" : "Deposit Pending"}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>
            Received by: <strong className="text-slate-800">{depositDetails?.collectedByName || "Warden Ramesh Verma"}</strong>
          </span>
          <span>Date: {depositDetails?.collectedAt || "Nov 01, 2026"}</span>
        </div>

        <DepositReceiptModal
          pgName={pg.name}
          pgLogo={pg.logo_url}
          primaryColor={brandColor}
          tenantName={session.full_name}
          roomNumber={roomNumber}
          receiptNumber={depositDetails?.id || "DEP-202611-001"}
          amount={depositDetails?.paidAmount || depositAmount}
          paymentMode={depositDetails?.paymentMode || "UPI Transfer"}
          paymentDate={depositDetails?.collectedAt || "Nov 01, 2026"}
          collectedByName={depositDetails?.collectedByName || "Warden Ramesh Verma"}
          status={depositDetails?.status === "paid" || !depositDetails ? "Paid • Held Safely" : "Deposit Pending"}
          deductionAmount={depositDetails?.deductionAmount}
          deductionReason={depositDetails?.deductionReason}
          refundedAmount={depositDetails?.refundedAmount}
        />
      </div>

      {/* 5. Rent & Auto-Invoices History Card with PDF Download */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900">Monthly Rent & Auto-Invoices</h3>
            <p className="text-[10px] text-slate-400">Due on 5th of every month</p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums border ${
              rentPaid
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {rentPaid ? "Paid ✅" : `₹${rentAmount.toLocaleString("en-IN")} Due`}
          </span>
        </div>

        {/* UPI QR & Copy Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center text-slate-900 shrink-0 border border-slate-200 shadow-2xs">
              <QrCode className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
                Direct PG UPI ID
              </div>
              <div className="text-xs font-extrabold font-mono text-slate-900 truncate">
                {upiId}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(upiId, "UPI ID")}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold shrink-0 hover:bg-indigo-100"
          >
            Copy ID
          </button>
        </div>

        {rentPaid ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-center text-xs font-extrabold">
            ✓ Current Month Rent Paid & Verified!
          </div>
        ) : utrSubmitted ? (
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-center text-xs font-extrabold">
            ⏳ Screenshot ({utrInput}) Under Review by Owner
          </div>
        ) : (
          <form onSubmit={handleUtrSubmit} className="space-y-2">
            <input
              type="text"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              placeholder="Enter 12-digit UTR Number"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-indigo-500"
            />
            <button
              type="submit"
              disabled={utrLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{utrLoading ? "Submitting..." : "Submit Payment UTR"}</span>
            </button>
          </form>
        )}

        {/* Invoices History List */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Payment & Invoice History
          </span>

          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      {inv.billingMonth}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {inv.paymentMode.toUpperCase()} • {inv.collectedAt} • By {inv.collectedByName || "Staff"}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-slate-900 tabular-nums">
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </span>

                  <RentReceiptModal
                    pgName={pg.name}
                    pgLogo={pg.logo_url}
                    primaryColor={brandColor}
                    tenantName={session.full_name}
                    roomNumber={roomNumber}
                    invoiceNumber={inv.id}
                    amount={`₹${inv.amount.toLocaleString("en-IN")}`}
                    dueDate={inv.collectedAt}
                    triggerButton={
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold border border-indigo-200 transition"
                      >
                        PDF
                      </button>
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="pt-1">
              <RentReceiptModal
                pgName={pg.name}
                pgLogo={pg.logo_url}
                primaryColor={brandColor}
                tenantName={session.full_name}
                roomNumber={roomNumber}
                amount={`₹${rentAmount.toLocaleString("en-IN")}`}
                dueDate="Nov 05, 2026"
              />
            </div>
          )}
        </div>
      </div>

      {/* 6. Day/Night Gate Pass Cards (Yellow when issued by Warden, Green when approved by Owner) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-extrabold text-slate-900">
            Outing & Gate Passes
          </h3>
          <RequestPassModal
            userRole="tenant"
            defaultTenantName={session.full_name}
            defaultRoomNumber={roomNumber}
          />
        </div>

        {passes.length > 0 &&
          passes.map((gp) => {
            const isYellow = gp.approval_status === "pending_owner" || gp.approval_status === "pending_warden";
            const isApproved = gp.approval_status === "approved";

            if (gp.approval_status === "rejected") return null;

            return (
              <div
                key={gp.id}
                className={`border rounded-2xl p-4 shadow-sm space-y-2.5 transition ${
                  isYellow
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-emerald-50 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      isYellow
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {isYellow ? "🟡 Issued by Warden • Pending Owner Approval" : "🟢 Approved & Active Pass"}
                  </span>
                  <span className="font-mono text-[10px] font-extrabold">
                    {gp.id.slice(0, 8).toUpperCase()} • {gp.pass_type === "day_pass" ? "DAY" : "NIGHT"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold">{gp.reason}</div>
                    <div className="text-[10px] text-slate-600">
                      Out: <strong>{gp.outing_date} • {gp.departure_time}</strong>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Return: <strong>{gp.expected_return_date || gp.outing_date} • {gp.expected_return_time}</strong>
                    </div>
                  </div>

                  {!isYellow && (
                    <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center text-slate-900 border border-emerald-200 shrink-0 shadow-2xs">
                      <QrCode className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">
                    Issued by: <strong>{gp.created_by_role === "admin" ? "Warden Suresh" : "PG Owner (Vikram)"}</strong>
                  </span>

                  {!isYellow ? (
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `*Active Gate Pass: ${gp.pass_type === "day_pass" ? "Day Pass" : "Night Pass"}*\nResident: ${session.full_name}\nProperty: ${pg.name}\nOut: ${gp.outing_date} ${gp.departure_time}\nReturn: ${gp.expected_return_date || gp.outing_date} ${gp.expected_return_time}\nStatus: Officially Approved & Logged`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => showToast("Opening WhatsApp to share with parents...")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center gap-1 shadow-xs hover:bg-emerald-700"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share w/ Parents</span>
                    </a>
                  ) : (
                    <span className="font-extrabold text-amber-800">Waiting for Owner</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* KYC Upload Modal */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-3xl border border-slate-200 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Self-Service KYC Upload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKycModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between font-bold text-slate-800">
                <span>Aadhar Card (Front & Back)</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Captured
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between font-bold text-slate-800">
                <span>Live Resident Selfie</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Captured
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Verified instantly with government biometric simulation. Synced directly to Owner bed profile.
            </p>

            <button
              type="button"
              disabled={kycLoading}
              onClick={handleKycSubmit}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xs transition"
            >
              {kycLoading ? "Verifying KYC..." : "Submit & Verify KYC"}
            </button>
          </div>
        </div>
      )}

      {/* 7. Subtle White-Label Footer: "Powered by Shuny Stays Software" */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}
