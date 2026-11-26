"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  LogIn,
  CheckCheck,
} from "lucide-react";
import { GatePass, UserRole } from "@/types/schema.types";
import {
  approveGatePassAction,
  rejectGatePassAction,
  recordPassReturnAction,
} from "@/app/actions/passes-and-broadcasts";

interface GatePassCardProps {
  pass: GatePass;
  viewerRole: UserRole;
}

export function GatePassCard({ pass, viewerRole }: GatePassCardProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRecordingReturn, setIsRecordingReturn] = useState(false);
  const [returnToast, setReturnToast] = useState<string | null>(null);

  const isDayPass = pass.pass_type === "day_pass";
  const isPendingOwner =
    pass.approval_status === "pending_owner" ||
    pass.approval_status === "requested" ||
    pass.approval_status === "pending_warden";
  const isApproved = pass.approval_status === "approved";
  const isRejected = pass.approval_status === "rejected";
  const isCompleted = pass.approval_status === "completed";

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await approveGatePassAction(pass.id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await rejectGatePassAction(pass.id, rejectReason);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
        setShowRejectInput(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordReturn = async () => {
    setIsRecordingReturn(true);
    try {
      const res = await recordPassReturnAction(pass.id);
      if (res?.error) {
        alert(`Error: ${res.error}`);
      } else {
        setReturnToast("Entry attendance recorded successfully!");
        router.refresh();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to record return.");
    } finally {
      setIsRecordingReturn(false);
    }
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
      <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/95 via-amber-50/70 to-yellow-50/90 p-4 shadow-md transition-all relative">
        {/* Yellow Header Banner */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-200/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-black tracking-wide text-amber-900 uppercase">
              {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-700" />
            Issued by Warden • Pending Owner Approval
          </span>
        </div>

        {/* Resident & Pass Details */}
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-black text-slate-900">
              {pass.tenant_name}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {pass.room_number || "Room 101"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-2.5 rounded-2xl border border-amber-200/60">
            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Outing Date
              </span>
              <p className="font-bold text-slate-800 mt-0.5">
                {pass.outing_date}
              </p>
            </div>
            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Return By
              </span>
              <p className="font-bold text-slate-800 mt-0.5">
                {pass.expected_return_time || "20:30"} ({pass.expected_return_date})
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-700">
            <span className="font-bold text-slate-900">Reason:</span> {pass.reason}
          </p>

          {pass.destination && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" /> {pass.destination}
            </p>
          )}
        </div>

        {/* Notice for Tenant */}
        {viewerRole === "tenant" && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300/80 text-[11px] text-amber-900 font-medium">
            ⏳ Warden has verified this pass. Awaiting final 1-tap confirmation from PG Owner. As soon as approved, this card will automatically turn <span className="font-bold text-emerald-700">GREEN</span> with your QR pass.
          </div>
        )}

        {/* Owner / Admin Action Buttons */}
        {(viewerRole === "owner" || viewerRole === "super_admin" || viewerRole === "admin") && (
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
                  {isProcessing
                    ? "Approving..."
                    : viewerRole === "admin"
                    ? "Verify & Forward to Owner"
                    : "Approve Pass (Turn Green)"}
                </button>
              </>
            ) : (
              <div className="w-full space-y-2">
                <input
                  type="text"
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 bg-white"
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

  // 2. GREEN CARD: Approved & Active with QR Code, Return Attendance Action & WhatsApp Share
  if (isApproved) {
    return (
      <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/95 via-emerald-50/70 to-teal-50/90 p-4 shadow-md transition-all relative">
        {/* Green Header Banner */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
            <span className="text-[11px] font-black tracking-wide text-emerald-900 uppercase">
              {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Approved & Active
          </span>
        </div>

        {/* Resident & Security Details */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <h3 className="text-base font-black text-slate-900">
              {pass.tenant_name}
            </h3>
            <p className="text-xs font-bold text-emerald-800">
              {pass.room_number} • {pass.building_name || "Block A"}
            </p>
            <p className="text-xs text-slate-700 mt-1">
              <span className="font-bold">Reason:</span> {pass.reason}
            </p>
          </div>

          {/* Active QR Code Graphic */}
          <div className="p-1.5 rounded-2xl bg-white border border-emerald-300 shadow-xs flex flex-col items-center shrink-0">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
                `PASS:${pass.pass_number}|TENANT:${pass.tenant_name}|STATUS:APPROVED|OUT:${pass.outing_date}|RET:${pass.expected_return_date}`
              )}&color=0F172A`}
              alt="Pass QR"
              className="w-12 h-12 rounded-lg"
            />
            <span className="text-[8px] font-mono font-bold text-emerald-700 mt-0.5">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Timings Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-2xl border border-emerald-200/60">
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Departure
            </span>
            <p className="font-bold text-slate-800 mt-0.5">
              {pass.outing_date} at {pass.departure_time || "10:00"}
            </p>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expected Return
            </span>
            <p className="font-bold text-slate-800 mt-0.5">
              {pass.expected_return_date} at {pass.expected_return_time || "20:30"}
            </p>
          </div>
        </div>

        {/* WhatsApp Share with Parents & Return Entry Action */}
        <div className="mt-3.5 pt-3 border-t border-emerald-200/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Gate Authorized
            </div>

            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 text-[11px] font-bold border border-emerald-300 shadow-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </a>
          </div>

          {/* Mark Return Attendance Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleRecordReturn}
              disabled={isRecordingReturn}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-xs font-black shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isRecordingReturn
                  ? "Marking Entry Attendance..."
                  : "Mark Return / Entry Attendance (वापसी दर्ज करें)"}
              </span>
            </button>
            <p className="text-[10px] text-emerald-800/80 text-center mt-1">
              Tap when resident returns to PG • Automatically marks Present in attendance sheet
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. COMPLETED CARD: Returned & Verified (Attendance Logged)
  if (isCompleted) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 shadow-sm transition-all relative">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-[11px] font-black tracking-wide text-slate-700 uppercase">
              {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-800 border border-slate-300">
            <CheckCheck className="w-3.5 h-3.5 text-slate-700" />
            Returned & Closed
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-black text-slate-900">
              {pass.tenant_name}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {pass.room_number || "Room 101"}
            </span>
          </div>

          {/* Actual Entry Log Banner */}
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                Actual Return Entry
              </span>
              {pass.is_late ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-black">
                  ⚠️ Late Return
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-black">
                  ✅ On Time
                </span>
              )}
            </div>
            <p className="text-xs font-black text-emerald-900">
              {pass.actual_entry_time || "N/A"} on {pass.actual_entry_date || pass.expected_return_date}
            </p>
            {pass.entry_recorded_by && (
              <p className="text-[10px] text-emerald-700">
                Verified by: {pass.entry_recorded_by} • Synced to Daily Attendance
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1">
            <div>
              <span>Outing: {pass.outing_date}</span>
            </div>
            <div>
              <span>Scheduled: {pass.expected_return_time || "20:30"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. RED CARD: Rejected
  return (
    <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/90 p-4 shadow-xs transition-all relative">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-[11px] font-black tracking-wide text-rose-900 uppercase">
            {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-900">
          <XCircle className="w-3 h-3 text-rose-700" />
          Rejected
        </span>
      </div>

      <div className="mt-2.5 space-y-1">
        <h3 className="text-sm font-bold text-slate-900">
          {pass.tenant_name} ({pass.room_number})
        </h3>
        <p className="text-xs text-rose-800">
          <span className="font-semibold">Reason:</span> {pass.rejection_reason || "Not approved"}
        </p>
      </div>
    </div>
  );
}
