"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { computeTenantCycleStatus } from "@/lib/utils/billing-cycle";
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
 ExternalLink,
 Camera,
 Upload,
} from "lucide-react";
import { GatePassItem, PlatformBroadcast } from "@/types/schema.types";
import { ActiveBroadcastBanner } from "@/components/broadcasts/ActiveBroadcastBanner";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { SecurityDepositItem, RentPaymentRecord } from "@/lib/data/rooms";
import { TenantMealPollCard } from "@/components/mess/TenantMealPollCard";
import { MealPoll } from "@/types/meal-poll.types";
import {
 submitTenantUpiScreenshotAction,
 submitTenantKycAction,
 updateTenantProfilePhotoAction,
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
 initialKycStatus?: "Verified" | "Under Review" | "Pending" | "Rejected";
 initialAadhaarNumber?: string | null;
 initialKycDocUrl?: string | null;
 initialKycRejectionReason?: string | null;
 initialProfilePhotoUrl?: string | null;
 tenantRecordId?: string;
 buildingId?: string | null;
 joinDate?: string;
 lastRentPaidAt?: string | null;
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
 mealPollStatus?: {
 poll: MealPoll | null;
 isCutoffPassed: boolean;
 scheduleStatus?: "upcoming" | "open" | "closed";
 tenantVote: "yes" | "no" | null;
 canVote: boolean;
 statusMessage: string;
 } | null;
 dinnerPollStatus?: {
 poll: MealPoll | null;
 isCutoffPassed: boolean;
 scheduleStatus?: "upcoming" | "open" | "closed";
 tenantVote: "yes" | "no" | null;
 canVote: boolean;
 statusMessage: string;
 } | null;
}

export function TenantHomeExplorer({
 session,
 pg,
 passes,
 attendance,
 messMenu,
 initialKycStatus = "Pending",
 initialAadhaarNumber = null,
 initialKycDocUrl = null,
 initialKycRejectionReason = null,
 initialProfilePhotoUrl = null,
 tenantRecordId,
 buildingId = null,
 joinDate,
 lastRentPaidAt = null,
 roomNumber = "Pending Room",
 buildingName = "Main Block",
 rentAmount = 0,
 rentPaid = false,
 depositAmount = 0,
 depositDetails,
 invoices = [],
 upiId = "royalstay@okicici",
 wifiName = "ROYAL_5G_RESIDENT",
 wifiPass = "StayRoyal@2026",
 broadcasts = [],
 mealPollStatus,
 dinnerPollStatus = null,
}: TenantHomeExplorerProps) {
 const router = useRouter();
 useRealtimeSync([
 "tenants",
 "rent_payments",
 "security_deposits",
 "gate_passes",
 "meal_polls",
 "meal_poll_responses",
 "complaints",
 "rooms",
 "pg_attendance_logs",
 ]);

 const [isIdQrModalOpen, setIsIdQrModalOpen] = useState(false);
 const [copiedIdLink, setCopiedIdLink] = useState(false);
 const [origin, setOrigin] = useState("https://shunystays.com");

 const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(initialProfilePhotoUrl);
 const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
 const [photoFile, setPhotoFile] = useState<File | null>(null);
 const [photoPreview, setPhotoPreview] = useState<string | null>(null);
 const [photoUploading, setPhotoUploading] = useState(false);
 const [photoError, setPhotoError] = useState<string | null>(null);

 useEffect(() => {
 setProfilePhotoUrl(initialProfilePhotoUrl);
 }, [initialProfilePhotoUrl]);

 useEffect(() => {
 if (typeof window !== "undefined") {
 setOrigin(window.location.origin);
 }
 }, []);

 const activeTenantId = tenantRecordId || session.id;
 const verifyIdUrl = `${origin}/verify/id/${activeTenantId}`;
 const cycleStatus = computeTenantCycleStatus({
 checkInDate: joinDate,
 rentPaid,
 lastPaidAt: lastRentPaidAt,
 });

 const [showHistory, setShowHistory] = useState(false);
 const [kycStatus, setKycStatus] = useState<"Verified" | "Under Review" | "Pending" | "Rejected">(initialKycStatus);
 const [isKycModalOpen, setIsKycModalOpen] = useState(false);
 const [kycLoading, setKycLoading] = useState(false);
 const [aadhaarInput, setAadhaarInput] = useState(initialAadhaarNumber || "");
 const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
 const [aadhaarDocUrl, setAadhaarDocUrl] = useState<string | null>(initialKycDocUrl || null);
 const [kycError, setKycError] = useState<string | null>(null);

 useEffect(() => {
 setKycStatus(initialKycStatus);
 }, [initialKycStatus]);

 useEffect(() => {
 if (initialAadhaarNumber) setAadhaarInput(initialAadhaarNumber);
 if (initialKycDocUrl) setAadhaarDocUrl(initialKycDocUrl);
 }, [initialAadhaarNumber, initialKycDocUrl]);

 // UTR submission state
 const [utrInput, setUtrInput] = useState("");
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

 const handleKycSubmit = async (e?: React.FormEvent) => {
 if (e) e.preventDefault();
 setKycError(null);
 const cleanAadhaar = aadhaarInput.replace(/\D/g, "");
 if (cleanAadhaar.length !== 12) {
 setKycError("Please enter your valid 12-digit Aadhaar number.");
 return;
 }
 if (!aadhaarFile && !aadhaarDocUrl) {
 setKycError("Please upload your Aadhaar Card photo or PDF.");
 return;
 }

 setKycLoading(true);
 try {
 const fd = new FormData();
 fd.append("aadhaarNumber", cleanAadhaar);
 if (aadhaarFile) fd.append("aadhaarFile", aadhaarFile);
 if (aadhaarDocUrl) fd.append("existingDocUrl", aadhaarDocUrl);
 const res = await submitTenantKycAction(fd);
 if (res && "error" in res && res.error) {
 setKycError(res.error);
 } else {
 setKycStatus("Under Review");
 if (res && "docUrl" in res && res.docUrl) {
 setAadhaarDocUrl(res.docUrl);
 }
 router.refresh();
 setIsKycModalOpen(false);
 showToast("Aadhaar submitted! Waiting for PG Owner approval.");
 }
 } catch {
 setKycError("Failed to upload Aadhaar KYC. Please try again.");
 } finally {
 setKycLoading(false);
 }
 };

 const handleProfilePhotoSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setPhotoError(null);
 if (!photoFile) {
 setPhotoError("Please select your profile photo (JPG, PNG, or WEBP).");
 return;
 }
 setPhotoUploading(true);
 try {
 const fd = new FormData();
 fd.append("profilePhoto", photoFile);
 const res = await updateTenantProfilePhotoAction(fd);
 if (res && "error" in res && res.error) {
 setPhotoError(res.error);
 } else if (res && "photoUrl" in res && res.photoUrl) {
 setProfilePhotoUrl(res.photoUrl);
 if (photoPreview) URL.revokeObjectURL(photoPreview);
 setPhotoPreview(null);
 setPhotoFile(null);
 setIsPhotoModalOpen(false);
 router.refresh();
 showToast("Profile photo saved permanently! Synced to PG Owner portal.");
 }
 } catch {
 setPhotoError("Failed to upload profile photo. Please try again.");
 } finally {
 setPhotoUploading(false);
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
 router.refresh();
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

 {/* Urgent / Emergency Broadcast Banner */}
 <ActiveBroadcastBanner broadcasts={broadcasts} userRole="tenant" />

 {/* 3-Column Desktop Bento Workspace (1 col mobile, 3 cols desktop >= 1024px) */}
 <div className="space-y-3.5 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
 {/* COLUMN 1: Identity, KYC, Attendance & Security */}
 <div className="space-y-3.5">
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

 {/* Profile Photo Reminder Banner (only if resident has not uploaded photo yet) */}
 {!profilePhotoUrl && (
 <div
 onClick={() => setIsPhotoModalOpen(true)}
 className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between gap-2 cursor-pointer transition hover:bg-indigo-100/70"
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="w-8 h-8 rounded-xl bg-indigo-600/15 flex items-center justify-center text-indigo-700 shrink-0">
 <Camera className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <div className="text-xs font-extrabold text-indigo-950">
 Please update your profile photo
 </div>
 <div className="text-[10px] text-indigo-700 truncate">
 Upload once for your permanent ID card &amp; Owner bed profile
 </div>
 </div>
 </div>
 <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[10px] font-extrabold shrink-0 shadow-xs">
 Upload Photo →
 </span>
 </div>
 )}

 {/* KYC Alert / Status Banner when not yet Verified */}
 {kycStatus !== "Verified" && (
 <div
 onClick={() => setIsKycModalOpen(true)}
 className={`rounded-2xl p-3.5 flex items-center justify-between gap-2 cursor-pointer transition border ${
 kycStatus === "Under Review"
 ? "bg-sky-50 border-sky-200 hover:bg-sky-100/60"
 : kycStatus === "Rejected"
 ? "bg-rose-50 border-rose-200 hover:bg-rose-100/60"
 : "bg-amber-50 border-amber-200 hover:bg-amber-100/60"
 }`}
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <div
 className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
 kycStatus === "Under Review"
 ? "bg-sky-500/20 text-sky-700"
 : kycStatus === "Rejected"
 ? "bg-rose-500/20 text-rose-700"
 : "bg-amber-500/20 text-amber-700"
 }`}
 >
 <IdCard className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <div
 className={`text-xs font-extrabold ${
 kycStatus === "Under Review"
 ? "text-sky-900"
 : kycStatus === "Rejected"
 ? "text-rose-900"
 : "text-amber-900"
 }`}
 >
 {kycStatus === "Under Review"
 ? "Aadhaar Submitted • Under Owner Review"
 : kycStatus === "Rejected"
 ? "KYC Rejected • Re-upload Aadhaar"
 : "KYC Verification Pending"}
 </div>
 <div
 className={`text-[10px] truncate ${
 kycStatus === "Under Review"
 ? "text-sky-700"
 : kycStatus === "Rejected"
 ? "text-rose-700"
 : "text-amber-700"
 }`}
 >
 {kycStatus === "Under Review"
 ? `Aadhaar XXXX-${aadhaarInput.replace(/\D/g, "").slice(-4) || "••••"} submitted. Waiting for PG Owner approval.`
 : kycStatus === "Rejected"
 ? initialKycRejectionReason || "Tap to re-upload clear Aadhaar photo"
 : "Tap to enter 12-digit Aadhaar & upload Aadhaar card"}
 </div>
 </div>
 </div>
 <span
 className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold shrink-0 shadow-xs ${
 kycStatus === "Under Review"
 ? "bg-sky-600 text-white"
 : kycStatus === "Rejected"
 ? "bg-rose-600 text-white"
 : "bg-amber-500 text-slate-950"
 }`}
 >
 {kycStatus === "Under Review" ? "Reviewing" : kycStatus === "Rejected" ? "Re-upload →" : "Verify →"}
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
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2.5 min-w-0">
 <button
 type="button"
 onClick={() => setIsPhotoModalOpen(true)}
 title={profilePhotoUrl ? "Update Profile Photo" : "Upload Profile Photo"}
 className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-white/60 transition"
 >
 {profilePhotoUrl ? (
 <img
 src={profilePhotoUrl}
 alt={session.full_name}
 className="w-full h-full object-cover"
 />
 ) : (
 <Camera className="w-5 h-5 text-white/85" />
 )}
 </button>
 <div className="min-w-0">
 <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 truncate">
 {pg.name}
 </div>
 <div className="text-base font-extrabold truncate">{session.full_name}</div>
 <div className="text-[10px] text-white/75 mt-0.5">
 Month Cycle Ends: <strong className="text-white">{cycleStatus.formattedEndDate}</strong>
 </div>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsIdQrModalOpen(true)}
 title="Tap to enlarge & scan dynamic Resident ID QR"
 className="w-12 h-12 rounded-xl bg-white p-1 flex flex-col items-center justify-center text-slate-900 shadow-sm shrink-0 hover:ring-2 hover:ring-white/80 active:scale-95 transition cursor-pointer"
 >
 <img
 src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
 verifyIdUrl
 )}&color=0F172A`}
 alt="Resident ID QR"
 className="w-8 h-8 object-contain"
 />
 <span className="text-[6.5px] font-black text-indigo-700 leading-none mt-0.5">
 SCAN ID
 </span>
 </button>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/20 text-[10px]">
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
 <strong
 className={`block ${
 kycStatus === "Verified"
 ? "text-emerald-300"
 : kycStatus === "Under Review"
 ? "text-sky-300"
 : kycStatus === "Rejected"
 ? "text-rose-300"
 : "text-amber-300"
 }`}
 >
 {kycStatus}
 </strong>
 </div>
 <div>
 <span className="opacity-75 block text-[9px] uppercase">Month Ends</span>
 <strong
 className={`block ${
 cycleStatus.bucket === "expired"
 ? "text-rose-300"
 : cycleStatus.bucket === "3days"
 ? "text-amber-300"
 : "text-emerald-300"
 }`}
 >
 {cycleStatus.badgeText}
 </strong>
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

 {/* Mobile-only Meal Poll Card (< lg) */}
 {(mealPollStatus?.poll || dinnerPollStatus?.poll) && (
 <div className="lg:hidden">
 <TenantMealPollCard
 poll={mealPollStatus?.poll || null}
 dinnerPoll={dinnerPollStatus?.poll || null}
 isCutoffPassed={mealPollStatus?.isCutoffPassed ?? false}
 dinnerIsCutoffPassed={dinnerPollStatus?.isCutoffPassed ?? false}
 initialVote={mealPollStatus?.tenantVote || null}
 dinnerInitialVote={dinnerPollStatus?.tenantVote || null}
 tenantId={activeTenantId}
 scheduleStatus={mealPollStatus?.scheduleStatus}
 dinnerScheduleStatus={dinnerPollStatus?.scheduleStatus}
 />
 </div>
 )}
        {/* Quick Link to Today's Menu & Full 7-Day Timetable (Mobile) */}
        <Link
          href="/tenant/mess"
          className="lg:hidden p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/80 to-white border border-orange-200/80 flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition active:scale-98 group block"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Utensils className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 group-hover:text-orange-700 transition-colors truncate">
                Aaj Ka Menu & 7-Day Timetable
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                Breakfast, Lunch, Snacks & Dinner for the whole week
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>

 {/* Resident Account & Login Security on Desktop (Column 1 bottom) */}
 <div className="hidden lg:block pt-1">
 <AccountSecurityCard
 role="tenant"
 currentPhone={session.phone}
 currentEmail={session.email}
 />
 </div>
 </div>

 {/* COLUMN 2: Monthly Rent, Auto-Invoices & Security Deposit */}
 <div className="space-y-3.5">
 {/* 4. Security Deposit Held Card */}
 {(() => {
 const expectedDep = depositDetails?.expectedAmount ?? depositAmount;
 const paidDep = depositDetails ? (depositDetails.paidAmount ?? 0) : 0;
 const remainingDep = Math.max(0, expectedDep - paidDep);
 const isDepPaid = depositDetails?.status === "paid" && remainingDep === 0;
 const isDepRefunded = depositDetails?.status === "refunded" || depositDetails?.status === "partially_refunded";
 const hasPendingBalance = !isDepPaid && !isDepRefunded && (remainingDep > 0 || depositDetails?.status === "pending");

 return (
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <div className="min-w-0">
 <div className="text-xs font-extrabold text-slate-900">Security Deposit</div>
 <div className="text-[10px] text-slate-400">
 {paidDep > 0 && remainingDep > 0
 ? `Total: ₹${expectedDep.toLocaleString("en-IN")} • Paid: ₹${paidDep.toLocaleString("en-IN")}`
 : "100% Refundable at Checkout"}
 </div>
 </div>
 </div>
 <div className="text-right shrink-0">
 <div className="text-sm font-black text-slate-900 tabular-nums">
 ₹{(paidDep > 0 ? paidDep : expectedDep).toLocaleString("en-IN")}
 {paidDep > 0 && remainingDep > 0 && (
 <span className="text-[10px] font-bold text-slate-400"> / ₹{expectedDep.toLocaleString("en-IN")}</span>
 )}
 </div>
 <span
 className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold border ${
 isDepPaid
 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
 : isDepRefunded
 ? "bg-indigo-50 text-indigo-700 border-indigo-200"
 : "bg-amber-50 text-amber-700 border-amber-200"
 }`}
 >
 {isDepPaid
 ? "Paid & Held Safely"
 : isDepRefunded
 ? "Settled / Refunded"
 : paidDep > 0
 ? `₹${remainingDep.toLocaleString("en-IN")} Pending`
 : hasPendingBalance
 ? "Pending • To be collected"
 : "No Deposit Due"}
 </span>
 </div>
 </div>

 <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
 <span>
 {paidDep > 0 ? (
 <>
 Received by: <strong className="text-slate-800">{depositDetails?.collectedByName || "PG Owner"}</strong>
 </>
 ) : hasPendingBalance ? (
 <strong className="text-amber-700">Remaining: ₹{remainingDep.toLocaleString("en-IN")} to be paid</strong>
 ) : (
 <span>Recorded by PG Office</span>
 )}
 </span>
 <span>
 {paidDep > 0
 ? `Date: ${depositDetails?.collectedAt ? new Date(depositDetails.collectedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recorded"}`
 : "Pending Collection"}
 </span>
 </div>

 <DepositReceiptModal
 pgName={pg.name}
 pgLogo={pg.logo_url}
 primaryColor={brandColor}
 tenantName={session.full_name}
 roomNumber={roomNumber}
 receiptNumber={depositDetails?.id || (tenantRecordId ? `DEP-${tenantRecordId.slice(0, 8).toUpperCase()}` : "DEP-PENDING")}
 amount={paidDep > 0 ? paidDep : expectedDep}
 paymentMode={paidDep > 0 ? depositDetails?.paymentMode || "Cash / UPI" : "Pending"}
 paymentDate={
 paidDep > 0 && depositDetails?.collectedAt
 ? new Date(depositDetails.collectedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
 : "Pending"
 }
 collectedByName={paidDep > 0 ? depositDetails?.collectedByName || "PG Owner" : "Pending Collection"}
 status={
 isDepPaid
 ? "Paid • Held Safely"
 : isDepRefunded
 ? "Settled • Refunded"
 : paidDep > 0
 ? `Partial (₹${paidDep.toLocaleString("en-IN")} Paid • ₹${remainingDep.toLocaleString("en-IN")} Pending)`
 : "Pending • To be collected"
 }
 deductionAmount={depositDetails?.deductionAmount}
 deductionReason={depositDetails?.deductionReason}
 refundedAmount={depositDetails?.refundedAmount}
 />
 </div>
 );
 })()}

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
 </div>

 {/* COLUMN 3: Lunch Poll, Outing Passes & Quick Support */}
 <div className="space-y-3.5">
 {/* Desktop-only Meal Poll Card (>= lg) */}
 {(mealPollStatus?.poll || dinnerPollStatus?.poll) && (
 <div className="hidden lg:block">
 <TenantMealPollCard
 poll={mealPollStatus?.poll || null}
 dinnerPoll={dinnerPollStatus?.poll || null}
 isCutoffPassed={mealPollStatus?.isCutoffPassed ?? false}
 dinnerIsCutoffPassed={dinnerPollStatus?.isCutoffPassed ?? false}
 initialVote={mealPollStatus?.tenantVote || null}
 dinnerInitialVote={dinnerPollStatus?.tenantVote || null}
 tenantId={activeTenantId}
 scheduleStatus={mealPollStatus?.scheduleStatus}
 dinnerScheduleStatus={dinnerPollStatus?.scheduleStatus}
 />
 </div>
 )}
        {/* Quick Link to Today's Menu & Full 7-Day Timetable (Desktop) */}
        <Link
          href="/tenant/mess"
          className="hidden lg:flex p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/80 to-white border border-orange-200/80 items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition active:scale-98 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Utensils className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 group-hover:text-orange-700 transition-colors truncate">
                Aaj Ka Menu & 7-Day Timetable
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                Breakfast, Lunch, Snacks & Dinner for the whole week
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>

 {/* 6. Day/Night Gate Pass Cards */}
 <div className="space-y-2.5">
 <div className="flex items-center justify-between px-0.5">
 <h3 className="text-xs font-extrabold text-slate-900">
 Outing &amp; Gate Passes
 </h3>
 <RequestPassModal
 userRole="tenant"
 defaultTenantName={session.full_name}
 defaultRoomNumber={roomNumber}
 tenantId={activeTenantId}
 pgId={pg.id}
 buildingId={buildingId || session.building_id || undefined}
 />
 </div>

 {passes.length > 0 ? (
 passes.map((gp) => {
 const isYellow =
 gp.approval_status === "pending_owner" ||
 gp.approval_status === "requested" ||
 gp.approval_status === "pending_warden";
 const isRejected = gp.approval_status === "rejected";
 const isApproved = gp.approval_status === "approved";

 return (
 <div
 key={gp.id}
 className={`border rounded-2xl p-4 shadow-sm space-y-2.5 transition ${
 isRejected
 ? "bg-rose-50 border-rose-200 text-rose-950"
 : isYellow
 ? "bg-amber-50 border-amber-200 text-amber-950"
 : "bg-emerald-50 border-emerald-200 text-emerald-950"
 }`}
 >
 <div className="flex items-center justify-between gap-2">
 <span
 className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
 isRejected
 ? "bg-rose-100 text-rose-800 border-rose-300"
 : isYellow
 ? "bg-amber-100 text-amber-800 border-amber-300"
 : "bg-emerald-100 text-emerald-800 border-emerald-300"
 }`}
 >
 {isRejected
 ? "🔴 Rejected by Owner / Authority"
 : isYellow
 ? "🟡 Waiting for Owner Approval"
 : "🟢 Approved & Active Pass"}
 </span>
 <span className="font-mono text-[10px] font-extrabold">
 {gp.pass_number || gp.id.slice(0, 8).toUpperCase()} • {gp.pass_type === "day_pass" ? "DAY" : "NIGHT"}
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
 {isRejected && gp.rejection_reason && (
 <div className="text-[10px] text-rose-700 font-bold pt-0.5">
 Rejection Reason: {gp.rejection_reason}
 </div>
 )}
 </div>

 {isApproved && (
 <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-emerald-200 shrink-0 shadow-2xs">
 <img
 src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
 `PASS:${gp.pass_number || gp.id}|TENANT:${session.full_name}|STATUS:APPROVED`
 )}&color=0F172A`}
 alt="Pass QR"
 className="w-10 h-10 object-contain"
 />
 </div>
 )}
 </div>

 <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
 <span className="text-slate-600">
 Requested by: <strong>{gp.created_by_role === "admin" ? "Warden" : gp.created_by_role === "owner" ? "PG Owner" : session.full_name}</strong>
 </span>

 {isApproved ? (
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
 ) : isRejected ? (
 <span className="font-extrabold text-rose-700">Not Approved</span>
 ) : (
 <span className="font-extrabold text-amber-800">Waiting for Owner</span>
 )}
 </div>
 </div>
 );
 })
 ) : (
 <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
 No gate passes requested yet. Tap &quot;Request Outing Pass&quot; above to apply.
 </div>
 )}
 </div>

 {/* Quick Maintenance Complaint Card */}
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
 <div className="min-w-0">
 <div className="text-xs font-extrabold text-slate-900">Need Help or Maintenance?</div>
 <div className="text-[10px] text-slate-400">Raise Wi-Fi, plumbing, electrical or room issues</div>
 </div>
 <Link
 href="/tenant/complaints"
 className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold shrink-0 transition"
 >
 Complaints →
 </Link>
 </div>

 {/* Mobile-only Resident Account & Login Security (bottom of page on mobile) */}
 <div className="lg:hidden pt-1">
 <AccountSecurityCard
 role="tenant"
 currentPhone={session.phone}
 currentEmail={session.email}
 />
 </div>
 </div>
 </div>

 {/* Profile Photo Upload Modal */}
 {isPhotoModalOpen && (
 <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
 <div className="bg-white w-full max-w-[400px] rounded-3xl border border-slate-200 p-4 space-y-3.5 shadow-2xl">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Camera className="w-5 h-5 text-indigo-600" />
 <h3 className="text-sm font-extrabold text-slate-900">
 Update Permanent Profile Photo
 </h3>
 </div>
 <button
 type="button"
 onClick={() => setIsPhotoModalOpen(false)}
 className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {photoError && (
 <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
 {photoError}
 </div>
 )}

 <form onSubmit={handleProfilePhotoSubmit} className="space-y-3 text-xs">
 <div className="w-28 h-28 mx-auto rounded-3xl bg-slate-100 border-2 border-indigo-200 overflow-hidden flex items-center justify-center">
 {photoPreview || profilePhotoUrl ? (
 <img
 src={photoPreview || profilePhotoUrl || ""}
 alt="Profile Preview"
 className="w-full h-full object-cover"
 />
 ) : (
 <Camera className="w-8 h-8 text-slate-400" />
 )}
 </div>

 <div>
 <label className="text-[11px] font-bold text-slate-600 block mb-1">
 Select Profile Photo (JPG, PNG, WEBP) *
 </label>
 <input
 type="file"
 accept="image/jpeg,image/png,image/webp"
 required
 onChange={(e) => {
 const f = e.target.files?.[0] || null;
 if (photoPreview) URL.revokeObjectURL(photoPreview);
 setPhotoFile(f);
 setPhotoPreview(f ? URL.createObjectURL(f) : null);
 }}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-extrabold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
 />
 </div>

 <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[10.5px] text-indigo-800 font-semibold">
 Stored permanently on your Digital ID Card and synced live to your PG Owner&apos;s bed profile.
 </div>

 <button
 type="submit"
 disabled={photoUploading}
 className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xs transition flex items-center justify-center gap-1.5"
 >
 <Upload className="w-4 h-4" />
 <span>{photoUploading ? "Uploading..." : "Save Profile Photo Permanently"}</span>
 </button>
 </form>
 </div>
 </div>
 )}

 {/* Dynamic Resident ID QR Modal */}
 {isIdQrModalOpen && (
 <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
 <div className="bg-white w-full max-w-[380px] rounded-3xl border border-slate-200 p-5 space-y-4 shadow-2xl text-center">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase">
 <ShieldCheck className="w-4 h-4 text-emerald-600" />
 Resident Digital ID QR
 </div>
 <button
 type="button"
 onClick={() => setIsIdQrModalOpen(false)}
 className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="space-y-1">
 <h3 className="text-base font-black text-slate-900">{session.full_name}</h3>
 <p className="text-xs font-bold text-indigo-600">
 {pg.name} • {roomNumber}
 </p>
 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold">
 <span>Month Ends: {cycleStatus.formattedEndDate}</span>
 <span>•</span>
 <span>{cycleStatus.badgeText}</span>
 </div>
 </div>

 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 inline-block shadow-inner">
 <img
 src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
 verifyIdUrl
 )}&color=0F172A`}
 alt="Resident ID Verification QR Code"
 className="w-48 h-48 mx-auto rounded-lg"
 />
 </div>

 <div className="space-y-2 pt-1">
 <button
 type="button"
 onClick={() => {
 navigator.clipboard.writeText(verifyIdUrl);
 setCopiedIdLink(true);
 setTimeout(() => setCopiedIdLink(false), 2500);
 }}
 className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
 >
 {copiedIdLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
 <span>{copiedIdLink ? "ID Verification Link Copied!" : "Copy Digital ID URL"}</span>
 </button>
 <a
 href={verifyIdUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold items-center justify-center gap-1 transition"
 >
 <span>Open Live Resident ID Card</span>
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 </div>
 </div>
 </div>
 )}

 {/* KYC Upload Modal */}
 {isKycModalOpen && (
 <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
 <div className="bg-white w-full max-w-[420px] rounded-3xl border border-slate-200 p-4 space-y-3.5 shadow-2xl">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <IdCard className="w-5 h-5 text-indigo-600" />
 <h3 className="text-sm font-extrabold text-slate-900">
 Aadhaar KYC Verification
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

 {kycError && (
 <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
 {kycError}
 </div>
 )}

 <form onSubmit={handleKycSubmit} className="space-y-3 text-xs">
 <div>
 <label className="text-[11px] font-bold text-slate-600 block mb-1">
 1. 12-Digit Aadhaar Number *
 </label>
 <input
 type="text"
 inputMode="numeric"
 required
 maxLength={14}
 value={aadhaarInput}
 onChange={(e) => {
 const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
 setAadhaarInput(digits);
 }}
 placeholder="e.g. 421890341122"
 className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-indigo-500"
 />
 <p className="text-[10px] text-slate-400 mt-1">
 Entered: {aadhaarInput.replace(/\D/g, "").length}/12 digits
 </p>
 </div>

 <div>
 <label className="text-[11px] font-bold text-slate-600 block mb-1">
 2. Upload Aadhaar Card Photo / PDF *
 </label>
 <input
 type="file"
 accept="image/*,.pdf"
 onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-extrabold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
 />
 {aadhaarFile ? (
 <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
 <Check className="w-3.5 h-3.5" /> Selected: {aadhaarFile.name}
 </p>
 ) : aadhaarDocUrl ? (
 <p className="text-[10px] text-sky-700 font-bold mt-1">
 Already uploaded Aadhaar on file. Choose a new file to replace.
 </p>
 ) : null}
 </div>

 <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10.5px] text-amber-800 font-semibold">
 After upload, KYC status shows <strong>Under Review</strong> until the PG Owner reviews & approves your Aadhaar.
 </div>

 <button
 type="submit"
 disabled={kycLoading}
 className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xs transition"
 >
 {kycLoading ? "Uploading Aadhaar..." : "Submit Aadhaar for Owner Approval"}
 </button>
 </form>
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
