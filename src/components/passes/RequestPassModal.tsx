"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
 QrCode,
 Plus,
 Calendar,
 Clock,
 MapPin,
 Phone,
 Sparkles,
 Sun,
 Moon,
 X,
 Send,
} from "lucide-react";
import { GatePassType, UserRole } from "@/types/schema.types";
import { requestGatePassAction } from "@/app/actions/passes-and-broadcasts";

interface RequestPassModalProps {
 userRole: UserRole;
 defaultTenantName?: string;
 defaultRoomNumber?: string;
}

export function RequestPassModal({
 userRole,
 defaultTenantName = "Aarav Patel",
 defaultRoomNumber = "Room 101 • Bed A",
}: RequestPassModalProps) {
 const router = useRouter();
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 // Form State
 const [passType, setPassType] = useState<GatePassType>("day_pass");
 const [outingDate, setOutingDate] = useState(new Date().toISOString().split("T")[0]);
 const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
 const [departureTime, setDepartureTime] = useState("14:00");
 const [expectedReturnTime, setExpectedReturnTime] = useState("20:30");
 const [reason, setReason] = useState("University Library study and group discussion");
 const [destination, setDestination] = useState("Central Knowledge Park");
 const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210");

 const applyPreset = (preset: {
 type: GatePassType;
 reason: string;
 depTime: string;
 retTime: string;
 daysAhead?: number;
 }) => {
 setPassType(preset.type);
 setReason(preset.reason);
 setDepartureTime(preset.depTime);
 setExpectedReturnTime(preset.retTime);

 const today = new Date();
 setOutingDate(today.toISOString().split("T")[0]);

 if (preset.type === "night_pass" && preset.daysAhead) {
 const ret = new Date(Date.now() + preset.daysAhead * 86400000);
 setReturnDate(ret.toISOString().split("T")[0]);
 } else {
 setReturnDate(today.toISOString().split("T")[0]);
 }
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setError(null);
 setIsSubmitting(true);

 const formData = new FormData();
 formData.append("pass_type", passType);
 formData.append("outing_date", outingDate);
 formData.append("expected_return_date", passType === "day_pass" ? outingDate : returnDate);
 formData.append("departure_time", departureTime);
 formData.append("expected_return_time", expectedReturnTime);
 formData.append("reason", reason);
 formData.append("destination", destination);
 formData.append("emergency_phone", emergencyPhone);
 formData.append("tenant_name", defaultTenantName);

 const res = await requestGatePassAction(formData);
 if (res?.error) {
 setError(res.error);
 setIsSubmitting(false);
 } else {
 router.refresh();
 setIsSubmitting(false);
 setIsOpen(false);
 }
 };

 return (
 <div>
 {/* Trigger Button */}
 <button
 onClick={() => setIsOpen(true)}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-blue-600/25 active:scale-95 transition-all"
 >
 <Plus className="w-4 h-4" />
 <span>Request Outing Pass</span>
 </button>

 {/* Modal Backdrop & Dialog */}
 {isOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
 <div className="bg-white border border-slate-200 rounded-3xl max-w-[460px] w-full p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
 {/* Header */}
 <div className="flex items-center justify-between pb-3 border-b border-slate-100">
 <div className="flex items-center gap-2.5">
 <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
 <QrCode className="w-5 h-5" />
 </div>
 <div>
 <h2 className="text-sm font-black text-slate-900">
 {userRole === "tenant" ? "Apply for Gate Pass" : "Issue Gate Pass to Resident"}
 </h2>
 <p className="text-[11px] text-slate-400">
 Dual Day Pass & Night Pass with 2-step approval
 </p>
 </div>
 </div>
 <button
 onClick={() => setIsOpen(false)}
 className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="mt-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium">
 {error}
 </div>
 )}

 {/* Quick Presets */}
 <div className="mt-3">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
 Quick Presets
 </span>
 <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
 <button
 type="button"
 onClick={() =>
 applyPreset({
 type: "day_pass",
 reason: "University Library study & assignments",
 depTime: "14:00",
 retTime: "20:00",
 })
 }
 className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0"
 >
 📚 Library (4h)
 </button>
 <button
 type="button"
 onClick={() =>
 applyPreset({
 type: "day_pass",
 reason: "Market & shopping necessities",
 depTime: "17:00",
 retTime: "20:00",
 })
 }
 className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0"
 >
 🛍️ Market (2h)
 </button>
 <button
 type="button"
 onClick={() =>
 applyPreset({
 type: "night_pass",
 reason: "Weekend hometown visit with family",
 depTime: "16:00",
 retTime: "21:00",
 daysAhead: 2,
 })
 }
 className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap shrink-0"
 >
 🏡 Hometown (2-Day)
 </button>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
 {/* Pass Type Switcher Cards */}
 <div>
 <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
 Select Pass Type
 </label>
 <div className="grid grid-cols-2 gap-2">
 {/* Day Pass Card */}
 <button
 type="button"
 onClick={() => setPassType("day_pass")}
 className={`p-3 rounded-2xl border text-left transition-all ${
 passType === "day_pass"
 ? "bg-amber-50 border-amber-500 shadow-sm"
 : "bg-slate-50 border-slate-200 opacity-70"
 }`}
 >
 <div className="flex items-center gap-1.5 mb-1">
 <Sun className="w-4 h-4 text-amber-500" />
 <span className="text-xs font-black text-slate-900">
 Day Pass
 </span>
 </div>
 <p className="text-[10px] text-slate-500">
 Same-day outing hours (Return by night curfew)
 </p>
 </button>

 {/* Night Pass Card */}
 <button
 type="button"
 onClick={() => setPassType("night_pass")}
 className={`p-3 rounded-2xl border text-left transition-all ${
 passType === "night_pass"
 ? "bg-indigo-50 border-indigo-500 shadow-sm"
 : "bg-slate-50 border-slate-200 opacity-70"
 }`}
 >
 <div className="flex items-center gap-1.5 mb-1">
 <Moon className="w-4 h-4 text-indigo-500" />
 <span className="text-xs font-black text-slate-900">
 Night Pass
 </span>
 </div>
 <p className="text-[10px] text-slate-500">
 Overnight / Multi-day leave from hostel
 </p>
 </button>
 </div>
 </div>

 {/* Dates & Hours */}
 <div className="grid grid-cols-2 gap-2.5">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
 {passType === "day_pass" ? "Outing Date" : "Departure Date"}
 </label>
 <input
 type="date"
 required
 value={outingDate}
 onChange={(e) => {
 setOutingDate(e.target.value);
 if (passType === "day_pass") setReturnDate(e.target.value);
 }}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
 />
 </div>

 {passType === "night_pass" ? (
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
 Expected Return Date
 </label>
 <input
 type="date"
 required
 value={returnDate}
 onChange={(e) => setReturnDate(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
 />
 </div>
 ) : (
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
 Return Time
 </label>
 <input
 type="time"
 required
 value={expectedReturnTime}
 onChange={(e) => setExpectedReturnTime(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
 />
 </div>
 )}
 </div>

 {passType === "night_pass" && (
 <div className="grid grid-cols-2 gap-2.5">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
 Departure Time
 </label>
 <input
 type="time"
 value={departureTime}
 onChange={(e) => setDepartureTime(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
 />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
 Expected Return Time
 </label>
 <input
 type="time"
 value={expectedReturnTime}
 onChange={(e) => setExpectedReturnTime(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
 />
 </div>
 </div>
 )}

 {/* Reason */}
 <div>
 <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
 Purpose / Outing Reason
 </label>
 <input
 type="text"
 required
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 placeholder="e.g. Attending family function, medical appointment"
 className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-blue-500"
 />
 </div>

 {/* Destination Area & Emergency Contact */}
 <div className="grid grid-cols-2 gap-2.5">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
 Destination Area
 </label>
 <input
 type="text"
 value={destination}
 onChange={(e) => setDestination(e.target.value)}
 placeholder="e.g. Connaught Place"
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
 />
 </div>
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
 Emergency Phone
 </label>
 <input
 type="tel"
 value={emergencyPhone}
 onChange={(e) => setEmergencyPhone(e.target.value)}
 placeholder="+91 98765 43210"
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
 />
 </div>
 </div>

 {/* Notice of Yellow-to-Green Flow */}
 <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
 🟡 <span className="font-bold">2-Step Approval:</span> When submitted, this pass appears as a <span className="font-bold">YELLOW CARD</span> (&quot;Issued by Warden • Pending Owner Approval&quot;). Once the PG Owner approves, it instantly turns <span className="font-bold text-emerald-700">GREEN</span> with your QR Code pass.
 </div>

 {/* Action Buttons */}
 <div className="flex items-center justify-end gap-2 pt-1">
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
 >
 <Send className="w-3.5 h-3.5" />
 {isSubmitting ? "Submitting Pass..." : "Submit Pass Request"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
