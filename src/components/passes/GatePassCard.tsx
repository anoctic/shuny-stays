"use client";

import { useState } from "react";
import {
  QrCode,
  Share2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { GatePass, UserRole } from "@/types/schema.types";
import { approveGatePassAction, rejectGatePassAction } from "@/app/actions/passes-and-broadcasts";

interface GatePassCardProps {
  pass: GatePass;
  viewerRole: UserRole;
}

export function GatePassCard({ pass, viewerRole }: GatePassCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isDayPass = pass.pass_type === "day_pass";
  const isPendingOwner = pass.approval_status === "pending_owner";
  const isApproved = pass.approval_status === "approved";
  const isRejected = pass.approval_status === "rejected";

  const handleApprove = async () => {
    setIsProcessing(true);
    await approveGatePassAction(pass.id);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please enter a rejection reason.");
      return;
    }
    setIsProcessing(true);
    await rejectGatePassAction(pass.id, rejectReason);
    setIsProcessing(false);
    setShowRejectInput(false);
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `*Gate Pass Authorization • ${pass.building_name || "Resident Stay"}*\n` +
      `Pass No: ${pass.pass_number}\n` +
      `Resident: ${pass.tenant_name}\n` +
      `Property: ${pass.building_name || "Stanza Residency"}\n` +
      `Pass Type: ${isDayPass ? "Day Pass (Same Day Outing)" : "Night Pass (Overnight Stay)"}\n` +
      `Outing Date: ${pass.outing_date}\n` +
      `Expected Return: ${pass.expected_return_date} by ${pass.expected_return_time || "20:00"}\n` +
      `Destination: ${pass.destination || "City Outing"}\n` +
      `Status: APPROVED & ACTIVE ✅\n` +
      `Emergency Contact: ${pass.emergency_phone || "Hostel Desk"}\n\n` +
      `_Powered by Shuny Stays Software_`
    );
    return `https://wa.me/?text=${text}`;
  };

  // 1. YELLOW CARD: Issued by Warden • Pending Owner Approval
  if (isPendingOwner) {
    return (
      <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-br from-amber-50/95 via-amber-50/70 to-yellow-50/90 dark:from-amber-950/40 dark:to-yellow-950/20 p-4 shadow-md transition-all relative">
        {/* Yellow Header Banner */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-black tracking-wide text-amber-900 dark:text-amber-200 uppercase">
              {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-100 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-700 dark:text-amber-300" />
            Issued by Warden • Pending Owner Approval
          </span>
        </div>

        {/* Resident & Pass Details */}
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {pass.tenant_name}
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {pass.room_number || "Room 101"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Outing Date
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {pass.outing_date}
              </p>
            </div>
            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Return By
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {pass.expected_return_time || "20:30"} ({pass.expected_return_date})
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-slate-100">Reason:</span> {pass.reason}
          </p>

          {pass.destination && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" /> {pass.destination}
            </p>
          )}
        </div>

        {/* Notice for Tenant */}
        {viewerRole === "tenant" && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/30 border border-amber-300/80 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
            ⏳ Warden has verified this pass. Awaiting final 1-tap confirmation from PG Owner. As soon as approved, this card will automatically turn <span className="font-bold text-emerald-700 dark:text-emerald-300">GREEN</span> with your QR pass.
          </div>
        )}

        {/* Owner Action Buttons (Owner reviews and 1-tap approves) */}
        {viewerRole === "owner" && (
          <div className="mt-3.5 pt-3 border-t border-amber-200/80 flex items-center justify-end gap-2">
            {!showRejectInput ? (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? "Approving..." : "Approve Pass (Turn Green)"}
                </button>
              </>
            ) : (
              <div className="w-full space-y-2">
                <input
                  type="text"
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 bg-white dark:bg-slate-800"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. GREEN CARD: Approved & Active with QR Code & WhatsApp Share Button
  if (isApproved) {
    return (
      <div className="rounded-3xl border-2 border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50/95 via-emerald-50/70 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/20 p-4 shadow-md transition-all relative">
        {/* Green Header Banner */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-[11px] font-black tracking-wide text-emerald-900 dark:text-emerald-200 uppercase">
              {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
            Approved & Active
          </span>
        </div>

        {/* Resident & Security Details */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {pass.tenant_name}
            </h3>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {pass.room_number} • {pass.building_name || "Block A"}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              <span className="font-bold">Reason:</span> {pass.reason}
            </p>
          </div>

          {/* Active QR Code Graphic */}
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-xs flex flex-col items-center shrink-0">
            <QrCode className="w-12 h-12 text-slate-900 dark:text-white" />
            <span className="text-[8px] font-mono font-bold text-emerald-700 mt-0.5">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Timings Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Departure
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {pass.outing_date} at {pass.departure_time || "10:00"}
            </p>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expected Return
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {pass.expected_return_date} at {pass.expected_return_time || "20:30"}
            </p>
          </div>
        </div>

        {/* WhatsApp Share with Parents Button */}
        <div className="mt-3.5 pt-3 border-t border-emerald-200/80 flex items-center justify-between gap-2">
          <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Gate Authorized
          </div>

          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp with Parents</span>
          </a>
        </div>
      </div>
    );
  }

  // 3. RED CARD: Rejected
  return (
    <div className="rounded-3xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/90 dark:bg-rose-950/40 p-4 shadow-xs transition-all relative">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-200 dark:border-rose-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-[11px] font-black tracking-wide text-rose-900 dark:text-rose-200 uppercase">
            {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100">
          <XCircle className="w-3 h-3 text-rose-700" />
          Rejected
        </span>
      </div>

      <div className="mt-2.5 space-y-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {pass.tenant_name} ({pass.room_number})
        </h3>
        <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
          <span className="font-bold">Reason for Rejection:</span>{" "}
          {pass.rejection_reason || "Curfew restriction / unconfirmed outing."}
        </p>
      </div>
    </div>
  );
}
