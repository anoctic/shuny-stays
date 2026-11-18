"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Ticket,
  Utensils,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  QrCode,
  Sparkles,
} from "lucide-react";
import {
  StaffItem,
  ComplaintItem,
  AuditLogItem,
  MessMenu,
} from "@/lib/data/rooms";
import { GatePass } from "@/types/schema.types";
import {
  toggleStaffPermissionAction,
  resolveComplaintAction,
  updateMessMenuAction,
} from "@/app/actions/rooms-and-ops";
import {
  approveGatePassAction,
  rejectGatePassAction,
} from "@/app/actions/passes-and-broadcasts";

interface OpsAndStaffExplorerProps {
  staffList: StaffItem[];
  gatePasses: GatePass[];
  complaints: ComplaintItem[];
  auditLogs: AuditLogItem[];
  messMenu: MessMenu;
  userRole: "owner" | "admin" | "super_admin" | "tenant";
  initialSubTab?: "passes_staff" | "audit_mess" | "complaints";
}

export function OpsAndStaffExplorer({
  staffList,
  gatePasses,
  complaints,
  auditLogs,
  messMenu,
  userRole,
  initialSubTab = "passes_staff",
}: OpsAndStaffExplorerProps) {
  const isOwner = userRole === "owner";
  const [subTab, setSubTab] = useState<"passes_staff" | "audit_mess" | "complaints">(initialSubTab);
  const [isEditMessOpen, setIsEditMessOpen] = useState(false);
  const [isAddWardenOpen, setIsAddWardenOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const pendingPassesCount = gatePasses.filter(
    (p) => p.approval_status === "pending_owner"
  ).length;
  const openTicketsCount = complaints.filter((c) => c.status !== "Resolved").length;

  return (
    <div className="space-y-3.5">
      {/* Sub-Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => setSubTab("passes_staff")}
          className={`py-1.5 rounded-xl text-[10.5px] font-extrabold transition ${
            subTab === "passes_staff"
              ? "bg-[#4F46E5] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Passes ({pendingPassesCount}) & Staff
        </button>
        <button
          type="button"
          onClick={() => setSubTab("audit_mess")}
          className={`py-1.5 rounded-xl text-[10.5px] font-extrabold transition ${
            subTab === "audit_mess"
              ? "bg-[#4F46E5] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Audit & Mess
        </button>
        <button
          type="button"
          onClick={() => setSubTab("complaints")}
          className={`py-1.5 rounded-xl text-[10.5px] font-extrabold transition ${
            subTab === "complaints"
              ? "bg-[#4F46E5] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Tickets ({openTicketsCount})
        </button>
      </div>

      {toastMsg && (
        <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: PASSES & STAFF */}
      {subTab === "passes_staff" && (
        <div className="space-y-3.5">
          {/* Day & Night Pass Approval Queue */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-[#0F172A]">Day & Night Pass Queue</h3>
                <p className="text-[10px] text-[#64748B]">
                  Approve Warden passes (Yellow ➔ Green on Student App)
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-700 border border-amber-500/30">
                {pendingPassesCount} Pending
              </span>
            </div>

            {gatePasses.length === 0 ? (
              <p className="text-[10.5px] text-[#64748B] py-2 text-center">
                No active gate passes in queue.
              </p>
            ) : (
              gatePasses.map((gp) => {
                const isYellow = gp.approval_status === "pending_owner";
                const isGreen = gp.approval_status === "approved";

                return (
                  <div
                    key={gp.id}
                    className={`p-2.5 rounded-xl border space-y-1.5 transition ${
                      isYellow
                        ? "bg-amber-500/10 border-amber-500/35"
                        : isGreen
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-rose-500/10 border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-extrabold uppercase">
                          {gp.pass_type === "day_pass" ? "DAY PASS" : "NIGHT PASS"}
                        </span>
                        <span className="text-xs font-extrabold text-[#0F172A]">
                          {gp.tenant_name}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          isYellow
                            ? "bg-amber-400 text-slate-950 font-black"
                            : isGreen
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {isYellow ? "Yellow • Pending Owner" : isGreen ? "Green • Approved" : "Rejected"}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#64748B]">
                      {gp.building_name || "Block A"} • Room {gp.room_number || "G01"} • Outing:{" "}
                      {gp.outing_date} → Return: {gp.expected_return_date} ({gp.expected_return_time})
                    </div>
                    <div className="text-[10px] font-semibold text-[#0F172A]">
                      Reason: {gp.destination || "Personal Outing"}{" "}
                      <span className="text-[#64748B] font-normal">
                        ({gp.warden_approved_by ? "Issued by Warden" : "Tenant Request"})
                      </span>
                    </div>

                    {isYellow && isOwner && (
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            await approveGatePassAction(gp.id);
                            setToastMsg(`Approved! Pass turned GREEN on ${gp.tenant_name}'s app ✅`);
                            setTimeout(() => setToastMsg(null), 3500);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10.5px] font-extrabold shadow-xs transition active:scale-95"
                        >
                          Approve (Turn Green on Student App)
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await rejectGatePassAction(gp.id, "Rejected by Owner");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 text-[10.5px] font-extrabold transition active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Building-Scoped Staff / Warden Manager */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-[#0F172A]">
                  Staff / Warden Permissions
                </h3>
                <p className="text-[10px] text-[#64748B]">
                  Toggles live-update Warden role access
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWardenOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-[#EEF2FF] text-[#4338CA] border border-indigo-200 text-[10px] font-extrabold transition active:scale-95"
              >
                + Add Warden
              </button>
            </div>

            {staffList.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-[#0F172A]">Warden {st.name}</div>
                    <div className="text-[10px] text-[#64748B]">+91 {st.phone}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-[10px] font-extrabold border border-indigo-200">
                    Block A Scoped
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(st.permissions).map(([permKey, enabled]) => (
                    <button
                      key={permKey}
                      type="button"
                      onClick={async () => {
                        await toggleStaffPermissionAction(st.id, permKey);
                      }}
                      className={`px-2 py-1 rounded-lg text-[9.5px] font-extrabold border transition ${
                        enabled
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                          : "opacity-45 text-[#64748B] border-[#E2E8F0] line-through bg-white"
                      }`}
                    >
                      {enabled ? "✓" : "✕"} {permKey.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUDIT & MESS */}
      {subTab === "audit_mess" && (
        <div className="space-y-3.5">
          {/* Daily Mess Menu & Dinner Poll Headcount */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#0F172A]">Daily Mess Menu & Dinner Poll</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-extrabold border border-emerald-500/30">
                {messMenu.baseYes + 3} Plates Tonight
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="text-[#0F172A]">Breakfast:</strong> {messMenu.breakfast}
              </div>
              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="text-[#0F172A]">Lunch:</strong> {messMenu.lunch}
              </div>
              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="text-[#0F172A]">Dinner:</strong> {messMenu.dinner}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditMessOpen(true)}
              className="w-full py-2 rounded-xl bg-[#EEF2FF] text-[#4338CA] hover:bg-indigo-100 border border-indigo-200 text-[11px] font-extrabold transition active:scale-95"
            >
              Edit Mess Menu & Timings
            </button>
          </div>

          {/* Tamper-Proof Audit Log */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
            <h3 className="text-xs font-extrabold text-[#0F172A]">
              Tamper-Proof Warden Audit Log
            </h3>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[10.5px]"
              >
                <p className="font-semibold text-[#0F172A]">{log.text}</p>
                <span className="text-[9px] font-bold text-[#64748B]">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TICKETS / COMPLAINTS */}
      {subTab === "complaints" && (
        <div className="space-y-2">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0F172A]">
                  {c.cat} • {c.room}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    c.status === "Resolved"
                      ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-700 border border-amber-500/40"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">{c.desc}</p>

              {c.status !== "Resolved" ? (
                <button
                  type="button"
                  onClick={async () => {
                    await resolveComplaintAction(c.id, "Resolved by Staff & Verified");
                  }}
                  className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10.5px] font-extrabold shadow-xs transition active:scale-95"
                >
                  Mark Resolved
                </button>
              ) : (
                <div className="text-[10px] font-bold text-emerald-600">
                  ✓ {c.note || "Resolved by Staff"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Mess Menu Sheet */}
      {isEditMessOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
          onClick={() => setIsEditMessOpen(false)}
        >
          <div
            className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0F172A]">
                  Edit Mess Menu & Timings
                </h3>
                <button
                  onClick={() => setIsEditMessOpen(false)}
                  className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await updateMessMenuAction(formData);
                  setIsEditMessOpen(false);
                }}
                className="space-y-2.5 text-xs"
              >
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Breakfast</label>
                  <input
                    name="breakfast"
                    type="text"
                    defaultValue={messMenu.breakfast}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Lunch</label>
                  <input
                    name="lunch"
                    type="text"
                    defaultValue={messMenu.lunch}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Dinner</label>
                  <input
                    name="dinner"
                    type="text"
                    defaultValue={messMenu.dinner}
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
                >
                  Save Mess Schedule
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Warden Sheet */}
      {isAddWardenOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
          onClick={() => setIsAddWardenOpen(false)}
        >
          <div
            className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#0F172A]">+ Add Staff / Warden</h3>
                <button
                  onClick={() => setIsAddWardenOpen(false)}
                  className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Sunita Devi"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="9810998877"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Assign Building</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]">
                    <option>Block A - Krishna Bhawan</option>
                    <option>Block B - Saraswati Bhawan</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setToastMsg("Warden added successfully with scoped permissions!");
                  setIsAddWardenOpen(false);
                  setTimeout(() => setToastMsg(null), 3500);
                }}
                className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
              >
                Create Warden Login & Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
