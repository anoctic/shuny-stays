"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
 QrCode,
 ArrowLeft,
 IdCard,
 ShieldCheck,
 Calendar,
 Phone,
 Sparkles,
 X,
 Send,
 Ticket,
} from "lucide-react";
import { GatePassItem } from "@/types/schema.types";
import { GatePassCard } from "@/components/passes/GatePassCard";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { submitVacateNoticeAction } from "@/app/actions/rooms-and-ops";

interface TenantIdNoticeViewProps {
 session: {
 id: string;
 full_name: string;
 phone: string;
 email?: string | null;
 room_id?: string | null;
 building_id?: string | null;
 };
 pg: {
 name: string;
 primaryColor: string;
 };
 buildingName: string;
 roomNumber: string;
 kycStatus: string;
 joinDate: string;
 depositAmount: number;
 emergencyPhone: string;
 passes: GatePassItem[];
}

export function TenantIdNoticeView({
 session,
 pg,
 buildingName,
 roomNumber,
 kycStatus,
 joinDate,
 depositAmount,
 emergencyPhone,
 passes,
}: TenantIdNoticeViewProps) {
 const router = useRouter();
 const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
 const [noticeDate, setNoticeDate] = useState("25 Dec 2026");
 const [noticeReason, setNoticeReason] = useState("Internship completed / Relocating");
 const [loading, setLoading] = useState(false);
 const [toastMessage, setToastMessage] = useState<string | null>(null);

 const showToast = (msg: string) => {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(null), 3000);
 };

 const handleNoticeSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 try {
 const fd = new FormData();
 fd.append("date", noticeDate);
 fd.append("reason", noticeReason);
 await submitVacateNoticeAction(fd);
 router.refresh();
 setIsNoticeModalOpen(false);
 showToast("Vacate notice sent to Owner & Warden!");
 } catch {
 setIsNoticeModalOpen(false);
 showToast("Notice submitted!");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="space-y-3.5 pb-6">
 {toastMessage && (
 <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
 {toastMessage}
 </div>
 )}

 {/* White-Labeled Digital Resident ID Card */}
 <div
 className="p-4 rounded-3xl text-white space-y-3 shadow-md"
 style={{
 background: `linear-gradient(135deg, ${pg.primaryColor || "#4F46E5"}, #0F172A)`,
 }}
 >
 <div className="flex items-center justify-between">
 <div>
 <div className="text-[10px] font-extrabold uppercase opacity-80 tracking-wider">
 {pg.name}
 </div>
 <div className="text-base font-extrabold">{session.full_name}</div>
 </div>
 <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center text-slate-900 shadow-sm">
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

 {/* Resident Stay Details Card */}
 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2 text-xs shadow-sm">
 <div className="flex justify-between">
 <span className="text-slate-400">Joining Date</span>
 <strong className="text-slate-900">{joinDate}</strong>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-400">Security Deposit</span>
 <strong className="text-emerald-600">₹{depositAmount.toLocaleString("en-IN")} Held</strong>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-400">Emergency Contact</span>
 <strong className="text-slate-900">{emergencyPhone}</strong>
 </div>
 </div>

 {/* Submit Vacate / Notice Request Button */}
 <button
 type="button"
 onClick={() => setIsNoticeModalOpen(true)}
 className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 border border-rose-500/25 text-xs font-extrabold transition shadow-xs"
 >
 Submit Vacate / Notice Period Request
 </button>

 {/* Resident Account & Login Security */}
 <AccountSecurityCard
 role="tenant"
 currentPhone={session.phone}
 currentEmail={session.email}
 />

 {/* Active Day / Night Passes Section */}
 <div className="space-y-3 pt-2">
 <div className="flex items-center justify-between px-0.5">
 <div className="flex items-center gap-2">
 <Ticket className="w-4 h-4 text-indigo-600" />
 <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
 My Outing Passes ({passes.length})
 </h2>
 </div>
 <RequestPassModal
 userRole="tenant"
 defaultTenantName={session.full_name}
 defaultRoomNumber={roomNumber}
 />
 </div>

 <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3.5">
 {passes.map((pass) => (
 <GatePassCard key={pass.id} pass={pass} viewerRole="tenant" />
 ))}
 </div>
 </div>

 {/* Notice Period Modal */}
 {isNoticeModalOpen && (
 <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
 <div className="bg-white w-full max-w-[420px] rounded-3xl border border-slate-200 p-4 space-y-3.5 shadow-2xl">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-extrabold text-slate-900">
 Submit Vacate / Notice Request
 </h3>
 <button
 type="button"
 onClick={() => setIsNoticeModalOpen(false)}
 className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <form onSubmit={handleNoticeSubmit} className="space-y-3">
 <div>
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
 Expected Vacate Date
 </label>
 <input
 type="text"
 value={noticeDate}
 onChange={(e) => setNoticeDate(e.target.value)}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
 Reason for Vacating
 </label>
 <input
 type="text"
 value={noticeReason}
 onChange={(e) => setNoticeReason(e.target.value)}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
 />
 </div>

 <p className="text-[10px] text-slate-400">
 Notice period starts today. Security deposit reconciliation will be processed upon room inspection.
 </p>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold shadow-sm transition"
 >
 {loading ? "Submitting Notice..." : "Submit Notice to Owner & Warden"}
 </button>
 </form>
 </div>
 </div>
 )}

 {/* Subtle Brand Footer */}
 <footer className="pt-3 pb-1 text-center space-y-1">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
 <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
 <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
 </div>
 </footer>
 </div>
 );
}
