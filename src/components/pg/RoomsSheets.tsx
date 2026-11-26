"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Layers, Plus, FileSpreadsheet, UserPlus, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { BuildingItem, FloorItem, RoomItem } from "@/lib/data/rooms";
import {
 addAutoBuildingAction,
 addFloorAction,
 addRoomAction,
 addBedAction,
 walkInAddTenantAction,
} from "@/app/actions/rooms-and-ops";
import { CredentialsGeneratedCard } from "@/components/auth/CredentialsGeneratedCard";

// ==============================================================================
// 1. WALK-IN EXPRESS ADD TENANT SHEET
// ==============================================================================
interface WalkInSheetProps {
 isOpen: boolean;
 onClose: () => void;
 building: BuildingItem;
 floor: FloorItem;
 floorIdx: number;
 room: RoomItem;
 bedIdx: number;
}

export function WalkInSheet({
 isOpen,
 onClose,
 building,
 floor,
 floorIdx,
 room,
 bedIdx,
}: WalkInSheetProps) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [depositStatusInput, setDepositStatusInput] = useState<"paid" | "pending">("paid");
 const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
 const [photoFileName, setPhotoFileName] = useState<string | null>(null);
 const [createdCreds, setCreatedCreds] = useState<{
 name: string;
 role: "tenant";
 loginId: string;
 password: string;
 phone: string;
 pgName?: string;
 roomInfo?: string;
 } | null>(null);

 if (!isOpen) return null;
 const bed = room.beds[bedIdx];

 const handleClose = () => {
 setCreatedCreds(null);
 setError(null);
 setDepositStatusInput("paid");
 if (photoPreviewUrl) {
 URL.revokeObjectURL(photoPreviewUrl);
 }
 setPhotoPreviewUrl(null);
 setPhotoFileName(null);
 onClose();
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsSubmitting(true);
 setError(null);
 try {
 const formData = new FormData(e.currentTarget);
 const res = await walkInAddTenantAction(building.id, floorIdx, room.id, bedIdx, formData);
 if (res && "error" in res && (res as any).error) {
 setError((res as any).error);
 setIsSubmitting(false);
 return;
 }
 router.refresh();
 setIsSubmitting(false);
 if (res && "credentials" in res && (res as any).credentials) {
 setCreatedCreds((res as any).credentials);
 } else {
 handleClose();
 }
 } catch (err: any) {
 setError(err?.message || "Failed to add tenant");
 setIsSubmitting(false);
 }
 };

 return (
 <div
 className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
 onClick={handleClose}
 >
 <div
 className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="space-y-3.5">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-extrabold text-[#0F172A]">Walk-In Express Add</h3>
 <p className="text-[10.5px] text-emerald-600 font-bold">
 {building.name} • {floor.name} • Room {room.number} ({bed?.label || "Bed"})
 </p>
 </div>
 <button
 onClick={handleClose}
 className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {createdCreds ? (
 <div className="space-y-3">
 <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>Resident added! Direct login credentials auto-generated.</span>
 </div>

 <CredentialsGeneratedCard
 name={createdCreds.name}
 role="tenant"
 loginId={createdCreds.loginId}
 password={createdCreds.password}
 phone={createdCreds.phone}
 pgName={createdCreds.pgName}
 roomInfo={`${building.name} • Room ${room.number} (${bed?.label || "Bed"})`}
 onClose={handleClose}
 />

 <button
 type="button"
 onClick={handleClose}
 className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95"
 >
 Done & Return to Rooms
 </button>
 </div>
 ) : (

 <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
 {/* Permanent Profile Photo Upload (Mandatory for manual onboarding) */}
 <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center gap-3">
 <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
 {photoPreviewUrl ? (
 <img
 src={photoPreviewUrl}
 alt="Resident Preview"
 className="w-full h-full object-cover"
 />
 ) : (
 <Camera className="w-5 h-5 text-indigo-500" />
 )}
 </div>
 <div className="min-w-0 flex-1 space-y-1">
 <label className="font-extrabold text-[#0F172A] block text-[11px]">
 Resident Profile Photo * <span className="text-indigo-600 font-bold">(Permanent ID Photo)</span>
 </label>
 <input
 name="profilePhoto"
 type="file"
 accept="image/jpeg,image/png,image/webp"
 required
 onChange={(e) => {
 const f = e.target.files?.[0];
 if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
 if (f) {
 setPhotoPreviewUrl(URL.createObjectURL(f));
 setPhotoFileName(f.name);
 } else {
 setPhotoPreviewUrl(null);
 setPhotoFileName(null);
 }
 }}
 className="w-full text-[10.5px] font-semibold text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
 />
 <p className="text-[9.5px] text-slate-500 truncate">
 {photoFileName ? `Selected: ${photoFileName}` : "Saved permanently to PG portal & resident Digital ID card."}
 </p>
 </div>
 </div>

 <div>
 <label className="font-bold text-[#64748B] block mb-1">1. Tenant Full Name *</label>
 <input
 name="name"
 type="text"
 required
 autoComplete="off"
 placeholder="e.g. Harshit"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-indigo-500"
 />
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">2. Phone / WhatsApp (Login ID) *</label>
 <input
 name="phone"
 type="tel"
 required
 autoComplete="off"
 placeholder="e.g. 9867456788"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-indigo-500"
 />
 <p className="text-[10px] text-indigo-600 font-semibold mt-1">
 🔑 Auto Login ID = Mobile No. • Password = FirstName@Last4Digits (e.g. Harshit@6788)
 </p>
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">3. Joining Date (Leave blank for Today)</label>
 <input
 name="joinDate"
 type="date"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
 />
 </div>

 {/* Security Deposit Section */}
 <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
 <div className="flex items-center justify-between">
 <span className="font-extrabold text-[11px] text-slate-800">
 4. Security Deposit Setup
 </span>
 <span className="text-[10px] text-indigo-600 font-bold">100% Refundable</span>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
 {depositStatusInput === "pending" ? "Total Expected Deposit (₹)" : "Deposit Amount (₹)"}
 </label>
 <input
 name="depositAmount"
 type="number"
 min="0"
 required
 placeholder={`e.g. ${room.rent || 8500}`}
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-indigo-500 text-xs"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
 Deposit Status
 </label>
 <select
 name="depositStatus"
 value={depositStatusInput}
 onChange={(e) => setDepositStatusInput(e.target.value as "paid" | "pending")}
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none text-xs"
 >
 <option value="paid">Paid • Collected Now</option>
 <option value="pending">Pending • To be collected</option>
 </select>
 </div>
 </div>

 {depositStatusInput === "pending" && (
 <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
 <label className="text-[10px] font-extrabold text-amber-900 block">
 Paid Now / Partial Advance (₹) — Optional
 </label>
 <input
 name="depositPaidAmount"
 type="number"
 min="0"
 placeholder="Leave blank if ₹0 paid (or enter partial e.g. 2000)"
 className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-amber-500 text-xs"
 />
 <p className="text-[9.5px] text-amber-800 font-medium">
 Remaining balance syncs live as Pending in both Owner &amp; Tenant portals.
 </p>
 </div>
 )}

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
 Payment Mode
 </label>
 <select
 name="depositPaymentMode"
 defaultValue="cash"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none text-xs"
 >
 <option value="cash">💵 Cash to Warden/Owner</option>
 <option value="upi">📱 UPI Transfer</option>
 <option value="bank_transfer">🏦 Bank NEFT/IMPS</option>
 </select>
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
 UTR / Receipt Ref (Opt.)
 </label>
 <input
 name="depositRef"
 type="text"
 placeholder="e.g. UTR-998811"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none text-xs"
 />
 </div>
 </div>
 </div>

 {/* Optional Resident, Parent, Emergency & KYC Fields (Can be filled after onboarding too) */}
 <details open className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2.5">
 <summary className="text-[11px] font-extrabold text-slate-800 cursor-pointer select-none flex items-center justify-between">
 <span>5. Parent, Emergency, Aadhaar / PAN &amp; Age (Optional)</span>
 <span className="text-[9.5px] font-bold text-indigo-600">Can fill after onboarding</span>
 </summary>
 <p className="text-[10px] text-slate-500">
 Optional at onboarding — need not be filled now; can be completed/edited after onboarding.
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 Parent&apos;s Name (Opt.)
 </label>
 <input
 name="parentsName"
 type="text"
 placeholder="e.g. Rajesh Kumar"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 Parent&apos;s Mobile No. (Opt.)
 </label>
 <input
 name="parentsPhone"
 type="tel"
 maxLength={10}
 placeholder="e.g. 9811223344"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 Emergency Contact Name (Opt.)
 </label>
 <input
 name="emergencyContactName"
 type="text"
 placeholder="e.g. Sunita Devi"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 Emergency Contact No. (Opt.)
 </label>
 <input
 name="emergencyContactPhone"
 type="tel"
 maxLength={10}
 placeholder="e.g. 9811223355"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 Relation (Opt.)
 </label>
 <input
 name="emergencyRelation"
 type="text"
 placeholder="e.g. Father / Mother / Guardian"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 Age (Opt.)
 </label>
 <input
 name="age"
 type="number"
 min={10}
 max={120}
 placeholder="e.g. 21"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 Aadhaar Card No. (Opt.)
 </label>
 <input
 name="aadhaarNumber"
 type="text"
 maxLength={12}
 placeholder="12-digit Aadhaar (Opt.)"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
 PAN Card No. (Opt.)
 </label>
 <input
 name="panNumber"
 type="text"
 maxLength={10}
 placeholder="e.g. ABCDE1234F (Opt.)"
 className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-semibold text-slate-900 uppercase placeholder:text-slate-400 placeholder:normal-case focus:outline-none text-xs"
 />
 </div>
 </div>
 </details>

 <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] cursor-pointer">
 <span className="font-bold text-[#0F172A]">6. Current Month Rent Paid?</span>
 <input
 name="rentPaid"
 type="checkbox"
 defaultChecked
 className="w-4 h-4 accent-emerald-500 rounded"
 />
 </label>

 <p className="text-[10px] text-[#64748B]">
 KYC starts as <strong>Pending</strong> until resident uploads 12-digit Aadhaar in their app &amp; you approve it.
 </p>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
 >
 {isSubmitting ? "Assigning..." : "Assign Bed & Generate Receipts"}
 </button>
 </form>
 )}
 </div>
 </div>
 </div>
 );
}

// ==============================================================================
// 2. SMART AUTO-BUILDING BUILDER SHEET
// ==============================================================================
export function AutoBuildingSheet({
 isOpen,
 onClose,
}: {
 isOpen: boolean;
 onClose: () => void;
}) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 if (!isOpen) return null;

 const handleClose = () => {
 setError(null);
 onClose();
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsSubmitting(true);
 setError(null);
 try {
 const formData = new FormData(e.currentTarget);
 const res = await addAutoBuildingAction(formData);
 if (res && "error" in res && res.error) {
 setError(typeof res.error === "string" ? res.error : "Failed to create building");
 setIsSubmitting(false);
 return;
 }
 router.refresh();
 setIsSubmitting(false);
 handleClose();
 } catch (err: any) {
 setError(err?.message || "Failed to create building");
 setIsSubmitting(false);
 }
 };

 return (
 <div
 className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
 onClick={handleClose}
 >
 <div
 className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="space-y-3.5">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-extrabold text-[#0F172A]">Smart Auto-Building Builder</h3>
 <button
 onClick={handleClose}
 className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
 <div className="grid grid-cols-3 gap-2">
 <div className="col-span-2">
 <label className="font-bold text-[#64748B] block mb-1">Building Name</label>
 <input
 name="name"
 type="text"
 required
 defaultValue="Block B"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 />
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Type</label>
 <select
 name="type"
 className="w-full px-2 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 >
 <option value="Boys">Boys</option>
 <option value="Girls">Girls</option>
 <option value="Co-ed">Co-ed</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Total Floors</label>
 <input
 name="floorsCount"
 type="number"
 min="1"
 max="20"
 defaultValue="4"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
 />
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Rooms Per Floor</label>
 <input
 name="roomsPerFloor"
 type="number"
 min="1"
 max="50"
 defaultValue="10"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Sharing</label>
 <select
 name="sharing"
 defaultValue="2"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 >
 <option value="2">2-Seater</option>
 <option value="3">3-Seater</option>
 <option value="1">1-Seater</option>
 </select>
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Monthly Rent (₹)</label>
 <input
 name="rent"
 type="number"
 defaultValue="8500"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95 mt-2"
 >
 {isSubmitting ? "Generating..." : "Auto-Divide Floors, Rooms & Beds"}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
}

// ==============================================================================
// 3. ADD FLOOR SHEET
// ==============================================================================
export function AddFloorSheet({
 isOpen,
 onClose,
 building,
}: {
 isOpen: boolean;
 onClose: () => void;
 building: BuildingItem | null;
}) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 if (!isOpen || !building) return null;

 const handleClose = () => {
 setError(null);
 onClose();
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsSubmitting(true);
 setError(null);
 try {
 const formData = new FormData(e.currentTarget);
 const name = formData.get("name") as string;
 const roomsCount = parseInt(formData.get("roomsCount") as string) || 3;
 const res = await addFloorAction(building.id, name, roomsCount);
 if (res && "error" in res && (res as any).error) {
 setError((res as any).error);
 setIsSubmitting(false);
 return;
 }
 router.refresh();
 setIsSubmitting(false);
 handleClose();
 } catch (err: any) {
 setError(err?.message || "Failed to add floor");
 setIsSubmitting(false);
 }
 };

 return (
 <div
 className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
 onClick={handleClose}
 >
 <div
 className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="space-y-3.5">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-extrabold text-[#0F172A]">+ Add Floor to {building.name}</h3>
 <button
 onClick={handleClose}
 className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Floor Name</label>
 <input
 name="name"
 type="text"
 required
 defaultValue={`${building.floors.length}th Floor`}
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 />
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Initial Rooms Count</label>
 <input
 name="roomsCount"
 type="number"
 defaultValue="3"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 />
 </div>
 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
 >
 {isSubmitting ? "Creating..." : "Create Floor & Rooms"}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
}

// ==============================================================================
// 4. ADD ROOM SHEET (SINGLE OR BULK SERIES)
// ==============================================================================
export function AddRoomSheet({
 isOpen,
 onClose,
 building,
 floorIdx,
}: {
 isOpen: boolean;
 onClose: () => void;
 building: BuildingItem | null;
 floorIdx: number;
}) {
 const router = useRouter();
 const [mode, setMode] = useState<"single" | "bulk">("single");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);

 if (!isOpen || !building) return null;
 const floor = building.floors[floorIdx];
 if (!floor) return null;

 const handleClose = () => {
 setError(null);
 onClose();
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsSubmitting(true);
 setError(null);
 try {
 const formData = new FormData(e.currentTarget);
 const sharing = parseInt(formData.get("sharing") as string) || 2;
 const rent = parseInt(formData.get("rent") as string) || 8500;

 let res;
 if (mode === "single") {
 const roomNumber = formData.get("roomNumber") as string;
 res = await addRoomAction(building.id, floorIdx, "single", { roomNumber, sharing, rent });
 } else {
 const startNo = parseInt(formData.get("startNo") as string) || 102;
 const endNo = parseInt(formData.get("endNo") as string) || 105;
 res = await addRoomAction(building.id, floorIdx, "bulk", { startNo, endNo, sharing, rent });
 }

 if (res && "error" in res && (res as any).error) {
 setError((res as any).error);
 setIsSubmitting(false);
 return;
 }

 router.refresh();
 setIsSubmitting(false);
 handleClose();
 } catch (err: any) {
 setError(err?.message || "Failed to add room(s)");
 setIsSubmitting(false);
 }
 };

 return (
 <div
 className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
 onClick={handleClose}
 >
 <div
 className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="space-y-3.5">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-extrabold text-[#0F172A]">
 + Add Room ({building.name} • {floor.name})
 </h3>
 <button
 onClick={handleClose}
 className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[10.5px] font-extrabold">
 <button
 type="button"
 onClick={() => setMode("single")}
 className={`py-1.5 rounded-lg transition ${
 mode === "single" ? "bg-[#4F46E5] text-white shadow-xs" : "text-[#64748B]"
 }`}
 >
 Single Room
 </button>
 <button
 type="button"
 onClick={() => setMode("bulk")}
 className={`py-1.5 rounded-lg transition ${
 mode === "bulk" ? "bg-[#4F46E5] text-white shadow-xs" : "text-[#64748B]"
 }`}
 >
 Bulk Series
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
 {mode === "single" ? (
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Room Number</label>
 <input
 name="roomNumber"
 type="text"
 required
 defaultValue={`${(floorIdx + 1) * 100 + floor.rooms.length + 1}`}
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 />
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Start No.</label>
 <input
 name="startNo"
 type="number"
 defaultValue="102"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 />
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">End No.</label>
 <input
 name="endNo"
 type="number"
 defaultValue="105"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 />
 </div>
 </div>
 )}

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Sharing</label>
 <select
 name="sharing"
 defaultValue="2"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 >
 <option value="2">2-Seater</option>
 <option value="3">3-Seater</option>
 <option value="1">1-Seater</option>
 </select>
 </div>
 <div>
 <label className="font-bold text-[#64748B] block mb-1">Rent (₹)</label>
 <input
 name="rent"
 type="number"
 defaultValue="8500"
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
 >
 {isSubmitting ? "Generating..." : "Generate Room(s) & Beds"}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
}

// ==============================================================================
// 5. ADD BED SHEET
// ==============================================================================
export function AddBedSheet({
 isOpen,
 onClose,
 building,
 floorIdx,
 roomId,
}: {
 isOpen: boolean;
 onClose: () => void;
 building: BuildingItem | null;
 floorIdx: number;
 roomId: string | null;
}) {
 const router = useRouter();
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 if (!isOpen || !building || !roomId) return null;

 const floor = building.floors[floorIdx];
 const room = floor?.rooms.find((r) => r.id === roomId);
 if (!room) return null;

 const nextLabel = `Bed ${String.fromCharCode(65 + room.beds.length)}`;

 const handleClose = () => {
 setError(null);
 onClose();
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsSubmitting(true);
 setError(null);
 try {
 const formData = new FormData(e.currentTarget);
 const label = formData.get("label") as string;
 const res = await addBedAction(building.id, floorIdx, roomId, label);
 if (res && "error" in res && (res as any).error) {
 setError((res as any).error);
 setIsSubmitting(false);
 return;
 }
 router.refresh();
 setIsSubmitting(false);
 handleClose();
 } catch (err: any) {
 setError(err?.message || "Failed to add bed");
 setIsSubmitting(false);
 }
 };

 return (
 <div
 className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
 onClick={handleClose}
 >
 <div
 className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="space-y-3.5">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-extrabold text-[#0F172A]">
 + Add Extra Bed (Room {room.number})
 </h3>
 <button
 onClick={handleClose}
 className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
 <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-3 text-xs">
 <input
 name="label"
 type="text"
 required
 defaultValue={nextLabel}
 className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-xs text-[#0F172A]"
 />
 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
 >
 {isSubmitting ? "Adding..." : `Add ${nextLabel}`}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
}

export { BulkSetupModal as CsvImportModal } from "./BulkSetupModal";
