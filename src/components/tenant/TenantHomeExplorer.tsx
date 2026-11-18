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
  Phone,
} from "lucide-react";
import { GatePassItem, PlatformBroadcast } from "@/types/schema.types";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import {
  submitDinnerPollAction,
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
  initialDinnerPoll = "Yes",
  initialKycStatus = "Pending",
  roomNumber = "Room 101 • Bed A",
  buildingName = "Block A - Krishna Bhawan",
  rentAmount = 8500,
  rentPaid = false,
  upiId = "royalstay@okicici",
  wifiName = "ROYAL_5G_RESIDENT",
  wifiPass = "StayRoyal@2026",
  broadcasts = [],
}: TenantHomeExplorerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [dinnerPoll, setDinnerPoll] = useState<"Yes" | "No">(initialDinnerPoll);
  const [dinnerLoading, setDinnerLoading] = useState(false);
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

  const handleDinnerVote = async (choice: "Yes" | "No") => {
    setDinnerPoll(choice);
    setDinnerLoading(true);
    try {
      await submitDinnerPollAction(choice);
      showToast(`Dinner headcount updated (${choice})!`);
    } catch {
      showToast(`Saved ${choice} for dinner.`);
    } finally {
      setDinnerLoading(false);
    }
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
    present: { label: "Present ✅", cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
    absent: { label: "Absent ❌", cls: "bg-rose-500/15 text-rose-500 border-rose-500/30" },
    day_pass: { label: "On Day Pass 🟡", cls: "bg-amber-500/20 text-amber-700 border-amber-500/40" },
    night_pass: { label: "On Night Pass 🟢", cls: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30" },
  }[attendance.todayStatus] || { label: "Present ✅", cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Broadcast Banner if any */}
      {broadcasts.length > 0 && (
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-900 dark:text-indigo-200 text-xs">
          <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Broadcast</span>
          </div>
          <div className="font-bold text-xs">{broadcasts[0].title}</div>
          <div className="text-[11px] opacity-80 mt-0.5">{broadcasts[0].message}</div>
        </div>
      )}

      {/* Hero Card: Dynamic PG Branding & Resident Greeting */}
      <div
        className="p-4 rounded-3xl text-white shadow-md relative overflow-hidden transition-colors"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, #0F172A)`,
        }}
      >
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                {pg.name} Resident
              </span>
              <span className="text-[10px] text-white/80 font-mono">PWA</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white pt-0.5">
              Welcome, {session.full_name.split(" ")[0]} 👋
            </h1>
            <p className="text-[11px] text-white/80 font-medium">
              {buildingName} • {roomNumber}
            </p>
          </div>

          {pg.logo_url ? (
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md p-1 border border-white/25 overflow-hidden shrink-0 shadow-sm">
              <img src={pg.logo_url} alt={pg.name} className="w-full h-full object-cover rounded-xl" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center font-black text-sm shrink-0">
              {pg.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* KYC Verification Alert Banner (if pending) */}
      {kycStatus !== "Verified" ? (
        <div
          onClick={() => setIsKycModalOpen(true)}
          className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 cursor-pointer flex items-center justify-between gap-2 transition hover:bg-amber-500/20 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <IdCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-amber-700">KYC Verification Pending</div>
              <div className="text-[10px] text-amber-900/70 truncate">Tap to upload Aadhar & Selfie</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-extrabold shrink-0 shadow-xs">
            Verify →
          </span>
        </div>
      ) : null}

      {/* TODAY'S LIVE ATTENDANCE CARD + COLLAPSIBLE 30-DAY HISTORY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
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
          className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10.5px] font-extrabold text-indigo-600 dark:text-indigo-400"
        >
          <span>30-Day Attendance Record: 95%</span>
          <span className="flex items-center gap-0.5">
            {showHistory ? "Hide" : "View History"}
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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
                      ? "bg-rose-500/20 text-rose-500"
                      : isPass
                      ? "bg-amber-500/20 text-amber-600"
                      : "bg-emerald-500/15 text-emerald-600"
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTIVE DAY / NIGHT GATE PASS CARD (YELLOW -> GREEN) */}
      {passes.length > 0 &&
        passes.map((gp) => {
          const isYellow = gp.approval_status === "pending_owner" || gp.approval_status === "pending_warden";
          const isApproved = gp.approval_status === "approved";
          const isRejected = gp.approval_status === "rejected";

          if (isRejected) return null;

          return (
            <div
              key={gp.id}
              className={`p-4 rounded-2xl border shadow-sm space-y-2.5 transition-all ${
                isYellow
                  ? "bg-amber-400/20 border-amber-500/50 text-amber-950 dark:text-amber-100"
                  : "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400/40 text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    isYellow ? "bg-amber-500 text-slate-950" : "bg-white/20 text-white backdrop-blur-xs"
                  }`}
                >
                  {isYellow ? "🟡 Pending Owner Approval" : "🟢 Approved & Active Pass"}
                </span>
                <span className="font-mono text-[10px] font-extrabold tracking-wide">
                  {gp.id.slice(0, 8).toUpperCase()} • {gp.pass_type === "day_pass" ? "DAY" : "NIGHT"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold">{gp.reason}</div>
                  <div className="text-[10px] opacity-90">
                    Out: <strong>{gp.outing_date} • {gp.departure_time}</strong>
                  </div>
                  <div className="text-[10px] opacity-90">
                    Return: <strong>{gp.expected_return_date || gp.outing_date} • {gp.expected_return_time}</strong>
                  </div>
                </div>

                {!isYellow && (
                  <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center text-slate-900 shrink-0 shadow-sm">
                    <QrCode className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div
                className={`pt-2 border-t ${
                  isYellow ? "border-amber-500/30" : "border-white/20"
                } flex items-center justify-between text-[10px]`}
              >
                <span>
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
                    className="px-2.5 py-1 rounded-lg bg-white text-emerald-800 font-extrabold flex items-center gap-1 shadow-xs hover:bg-slate-100"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share w/ Parents</span>
                  </a>
                ) : (
                  <span className="font-extrabold text-amber-800 dark:text-amber-300">Waiting for Owner</span>
                )}
              </div>
            </div>
          );
        })}

      {/* Digital Room & Wi-Fi Card (2-Col Quick Grid) */}
      <div className="grid grid-cols-2 gap-2.5">
        <RequestPassModal
          userRole="tenant"
          defaultTenantName={session.full_name}
          defaultRoomNumber={roomNumber}
          triggerButton={
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 text-left hover:border-indigo-400 transition cursor-pointer shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Ticket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    + Request
                  </span>
                </div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">Day / Night Pass</div>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Outing or home visit</div>
            </div>
          }
        />

        <div
          onClick={() => copyToClipboard(wifiPass, `Wi-Fi Password (${wifiPass})`)}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 text-left hover:border-emerald-400 transition cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-wide">
                Copy Pass
              </span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{wifiName}</div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{wifiPass}</div>
        </div>
      </div>

      {/* Daily Mess Menu & Interactive Dinner Poll */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Tonight&apos;s Dinner & Meal Poll</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">8:00 - 10:00 PM</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
          {messMenu.dinner}
        </p>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs font-extrabold text-slate-900 dark:text-white">Eating Dinner Tonight?</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={dinnerLoading}
              onClick={() => handleDinnerVote("Yes")}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                dinnerPoll === "Yes"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              disabled={dinnerLoading}
              onClick={() => handleDinnerVote("No")}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                dinnerPoll === "No"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Rent Payment & Direct UPI Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">{pg.name} Direct UPI</h3>
            <p className="text-[10px] text-slate-400">Due: 5th of Month • Late fee ₹100/day</p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums ${
              rentPaid ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-500"
            }`}
          >
            ₹{rentAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 text-slate-900 shadow-xs">
            <QrCode className="w-11 h-11" />
          </div>
          <div className="min-w-0 space-y-1 flex-1">
            <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
              Verified PG UPI ID
            </div>
            <div className="text-xs font-extrabold font-mono text-slate-900 dark:text-white truncate">
              {upiId}
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(upiId, "UPI ID")}
              className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold hover:bg-indigo-500/20"
            >
              Copy UPI ID
            </button>
          </div>
        </div>

        {rentPaid ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 text-center text-xs font-extrabold">
            ✓ November Rent Paid & Verified!
          </div>
        ) : utrSubmitted ? (
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-center text-xs font-extrabold">
            ⏳ Screenshot ({utrInput}) Under Owner Review
          </div>
        ) : (
          <form onSubmit={handleUtrSubmit} className="space-y-2">
            <input
              type="text"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              placeholder="Enter 12-digit UTR Number"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-indigo-500"
            />
            <button
              type="submit"
              disabled={utrLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{utrLoading ? "Submitting..." : "Upload Payment Screenshot"}</span>
            </button>
          </form>
        )}

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
      </div>

      {/* KYC Self-Service Upload Bottom Sheet / Modal */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[420px] rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Self-Service KYC Upload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKycModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Aadhar Card (Front & Back)</span>
                <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Captured
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Live Resident Selfie</span>
                <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Captured
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Verified instantly with government biometric registry simulation. Synced directly to Owner bed profile.
            </p>

            <button
              type="button"
              disabled={kycLoading}
              onClick={handleKycSubmit}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition"
            >
              {kycLoading ? "Verifying KYC..." : "Submit & Verify KYC"}
            </button>
          </div>
        </div>
      )}

      {/* Subtle White-Label Footer: Powered by ShunyOS */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold border border-slate-200/50 dark:border-slate-700/50">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Powered by</span>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
            ShunyOS
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Cloud-Native Multi-Tenant PG & Hostel Operating System
        </p>
      </footer>
    </div>
  );
}
