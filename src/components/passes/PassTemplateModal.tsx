"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  X,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Smartphone,
  Save,
  QrCode,
} from "lucide-react";

interface PassTemplateModalProps {
  pgId?: string | null;
}

export function PassTemplateModal({ pgId }: PassTemplateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Configuration state
  const [curfewTime, setCurfewTime] = useState("21:30");
  const [parentApprovalRequired, setParentApprovalRequired] = useState(true);
  const [gateQrRequired, setGateQrRequired] = useState(true);
  const [autoApproveDayPass, setAutoApproveDayPass] = useState(false);
  const [maxNightStayOutDays, setMaxNightStayOutDays] = useState("3");
  const [passRulesText, setPassRulesText] = useState(
    "1. Strict reporting to gate before 09:30 PM.\n2. In-campus biometric/QR scanning mandatory.\n3. Valid institution / corporate ID card required on re-entry."
  );

  // Load from localStorage if previously customized
  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = `pg_outpass_config_${pgId || "default"}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.curfewTime) setCurfewTime(parsed.curfewTime);
          if (parsed.parentApprovalRequired !== undefined)
            setParentApprovalRequired(parsed.parentApprovalRequired);
          if (parsed.gateQrRequired !== undefined)
            setGateQrRequired(parsed.gateQrRequired);
          if (parsed.autoApproveDayPass !== undefined)
            setAutoApproveDayPass(parsed.autoApproveDayPass);
          if (parsed.maxNightStayOutDays)
            setMaxNightStayOutDays(parsed.maxNightStayOutDays);
          if (parsed.passRulesText) setPassRulesText(parsed.passRulesText);
        } catch {}
      }
    }
  }, [pgId]);

  const handleSave = () => {
    setIsSaving(true);
    if (typeof window !== "undefined") {
      const key = `pg_outpass_config_${pgId || "default"}`;
      const config = {
        curfewTime,
        parentApprovalRequired,
        gateQrRequired,
        autoApproveDayPass,
        maxNightStayOutDays,
        passRulesText,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(config));
    }

    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setTimeout(() => {
        setShowSavedToast(false);
        setIsOpen(false);
      }, 1500);
    }, 400);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold border border-indigo-200/90 shadow-2xs flex items-center gap-2 transition active:scale-95 cursor-pointer"
      >
        <Settings className="w-4 h-4 text-indigo-600" />
        <span>Outpass Rules & Template</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Outpass Rules & Layout Template
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Define curfew timings, gate pass layout rules & parent notifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Saved Toast */}
            {showSavedToast && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Outpass template rules updated & applied live!</span>
              </div>
            )}

            {/* Form controls */}
            <div className="space-y-4 text-xs">
              {/* Curfew Cutoff Time */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Daily Return Curfew Cut-off</span>
                  </label>
                  <input
                    type="time"
                    value={curfewTime}
                    onChange={(e) => setCurfewTime(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-extrabold text-slate-900 text-xs shadow-2xs"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["20:30", "21:00", "21:30", "22:00", "22:30"].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setCurfewTime(time)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                        curfewTime === time
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 cursor-pointer transition">
                  <div className="flex items-center gap-2.5 pr-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-800 text-xs">
                        Parent WhatsApp Outing Updates
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Enable 1-tap WhatsApp sharing of active outpasses to parent contacts
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={parentApprovalRequired}
                    onChange={(e) => setParentApprovalRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 cursor-pointer transition">
                  <div className="flex items-center gap-2.5 pr-2">
                    <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-800 text-xs">
                        Gate QR Code Verification
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Generate dynamic verified QR stamps on approved green outpass cards
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gateQrRequired}
                    onChange={(e) => setGateQrRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 cursor-pointer transition">
                  <div className="flex items-center gap-2.5 pr-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-slate-800 text-xs">
                        Auto-Approve Daytime Passes
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Day passes under curfew hours turn GREEN automatically without warden approval
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoApproveDayPass}
                    onChange={(e) => setAutoApproveDayPass(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Max Consecutive Night Stay Out */}
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Maximum Consecutive Night Stay Allowed
                </label>
                <select
                  value={maxNightStayOutDays}
                  onChange={(e) => setMaxNightStayOutDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="1">1 Night (Weekend Stay)</option>
                  <option value="2">2 Nights (Standard)</option>
                  <option value="3">3 Nights (Extended Weekend)</option>
                  <option value="7">7 Nights (Holiday / Semester Break)</option>
                </select>
              </div>

              {/* Custom Outpass Instructions / Guidelines */}
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Printed Guidelines on Digital Gate Pass
                </label>
                <textarea
                  rows={3}
                  value={passRulesText}
                  onChange={(e) => setPassRulesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-medium text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500/20 text-xs"
                  placeholder="Enter custom gate rules for residents..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Template & Rules"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
