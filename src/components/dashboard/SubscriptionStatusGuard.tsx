"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
 Lock,
 AlertTriangle,
 CreditCard,
 QrCode,
 Building,
 Copy,
 Check,
 ExternalLink,
 LogOut,
 X,
 Sparkles,
 CheckCircle2,
 Clock,
 ChevronRight,
 ShieldAlert,
} from "lucide-react";
import { PlatformBillingSettings } from "@/lib/data/billing-settings";
import { submitPgRenewalUtrAction } from "@/app/actions/billing";
import { signOutAction } from "@/app/actions/auth";

interface SubscriptionStatusGuardProps {
 pg: {
 id: string;
 name: string;
 status: "active" | "pending" | "suspended";
 plan_expires_at?: string | null;
 plan_price?: number;
 plan_benefits?: string[];
 };
 platformSettings: PlatformBillingSettings;
 userRole: "owner" | "admin";
}

export function SubscriptionStatusGuard({
 pg,
 platformSettings,
 userRole,
}: SubscriptionStatusGuardProps) {
 const router = useRouter();

 const now = new Date();
 const expiryDate = pg.plan_expires_at ? new Date(pg.plan_expires_at) : null;
 const daysLeft = expiryDate
 ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
 : 999;

 const isSuspended = pg.status === "suspended";
 const isExpired = isSuspended || (expiryDate !== null && daysLeft <= 0);
 const isExpiringSoon = !isExpired && daysLeft <= 5 && daysLeft > 0;

 // Modals state
 const [showExpiringSoonModal, setShowExpiringSoonModal] = useState(false);
 const [isTapToPayOpen, setIsTapToPayOpen] = useState(false);
 const [copiedKey, setCopiedKey] = useState<string | null>(null);
 const [toastMsg, setToastMsg] = useState<string | null>(null);

 // UTR submission state
 const [utrInput, setUtrInput] = useState("");
 const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
 const [submittedUtrSuccess, setSubmittedUtrSuccess] = useState<string | null>(null);

 useEffect(() => {
 if (isExpiringSoon) {
 const dismissed = sessionStorage.getItem(`shuny_expiry_dismissed_${pg.id}`);
 if (!dismissed) {
 setShowExpiringSoonModal(true);
 }
 }
 }, [isExpiringSoon, pg.id]);

 const showToast = (msg: string) => {
 setToastMsg(msg);
 setTimeout(() => setToastMsg(null), 3000);
 };

 const copyToClipboard = (text: string, key: string) => {
 navigator.clipboard.writeText(text);
 setCopiedKey(key);
 showToast(`Copied: ${text}`);
 setTimeout(() => setCopiedKey(null), 2000);
 };

 const handleDismissExpiringSoon = () => {
 sessionStorage.setItem(`shuny_expiry_dismissed_${pg.id}`, "true");
 setShowExpiringSoonModal(false);
 };

 const handleLogout = async () => {
 await signOutAction();
 };

 const renewalPrice = pg.plan_price || platformSettings.plan_price || 1999;
 const renewalBenefits =
 pg.plan_benefits && pg.plan_benefits.length > 0
 ? pg.plan_benefits
 : platformSettings.plan_benefits || [
 "Full White-label Branding",
 "Automated WhatsApp Rent Reminders",
 "Live Attendance & Gate Pass System",
 "2-Step Cash & UPI Ledger Settlement",
 "Instant Real-Time Multi-Building Management",
 ];

 const upiDeepLink = `upi://pay?pa=${platformSettings.upi_id}&pn=${encodeURIComponent(
 platformSettings.payee_name
 )}&am=${renewalPrice}&cu=INR`;

 const handleSubmitUtr = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!utrInput.trim() || utrInput.trim().length < 4) {
 showToast("Please enter a valid 12-digit UTR number.");
 return;
 }

 setIsSubmittingUtr(true);
 try {
 const res = await submitPgRenewalUtrAction(
 pg.id,
 pg.name,
 utrInput.trim().toUpperCase(),
 renewalPrice
 );

 if (res?.error) {
 showToast(`Failed: ${res.error}`);
 } else {
 setSubmittedUtrSuccess(utrInput.trim().toUpperCase());
 showToast("UTR submitted successfully! Super Admin is verifying.");
 router.refresh();
 }
 } catch (err: any) {
 showToast(`Error: ${err?.message || "Failed to submit UTR."}`);
 } finally {
 setIsSubmittingUtr(false);
 }
 };

 // IF NEITHER EXPIRED NOR EXPIRING SOON, RENDER NOTHING
 if (!isExpired && !showExpiringSoonModal && !isTapToPayOpen) {
 return null;
 }

 return (
 <>
 {/* Toast Alert */}
 {toastMsg && (
 <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-white/20 animate-fade-in flex items-center gap-2">
 <Sparkles className="w-3.5 h-3.5 text-amber-300" />
 <span>{toastMsg}</span>
 </div>
 )}

 {/* =========================================================================
 CASE 1: FULL SCREEN LOCK POPUP (When Suspended or Plan Expired)
 Non-dismissible: Cannot close, backdrop blur, covers entire screen
 ========================================================================= */}
 {isExpired && (
 <div className="fixed inset-0 z-[90] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
 <div className="w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl p-5 md:p-6 space-y-4 animate-scale-in">
 {/* Warning Header */}
 <div className="text-center space-y-2">
 <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
 <Lock className="w-7 h-7" />
 </div>
 <div>
 <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
 {isSuspended ? "Membership Suspended" : "Plan Expired"}
 </span>
 <h2 className="text-base font-black text-slate-900 mt-1">
 Aapki PG Membership Expire / Suspend Ho Gayi Hai
 </h2>
 <p className="text-xs text-slate-500 mt-1">
 Dashboard access continue karne ke liye please apna PG subscription plan renew karein.
 </p>
 </div>
 </div>

 {/* PG & Plan Summary Card */}
 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
 <div className="flex items-center justify-between pb-2 border-b border-slate-200">
 <div>
 <span className="text-[10px] font-bold text-slate-400 uppercase">Property Name</span>
 <div className="text-xs font-black text-slate-900">{pg.name}</div>
 </div>
 <div className="text-right">
 <span className="text-[10px] font-bold text-slate-400 uppercase">Renewal Price</span>
 <div className="text-sm font-black text-indigo-600">
 ₹{renewalPrice.toLocaleString("en-IN")}
 </div>
 </div>
 </div>

 {/* Status details */}
 <div className="text-[11px] text-slate-600 font-medium">
 {isSuspended ? (
 <span className="text-rose-600 font-bold flex items-center gap-1">
 <ShieldAlert className="w-3.5 h-3.5" />
 Account suspended by Super Admin.
 </span>
 ) : (
 <span>
 Expired on:{" "}
 <strong className="text-rose-600">
 {expiryDate?.toLocaleDateString("en-IN", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 })}
 </strong>
 </span>
 )}
 </div>

 {/* Benefits Pills */}
 <div className="pt-1 border-t border-slate-200/60">
 <span className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">
 Plan Benefits Included:
 </span>
 <div className="flex flex-wrap gap-1">
 {renewalBenefits.slice(0, 3).map((b, i) => (
 <span
 key={i}
 className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[9.5px] font-medium"
 >
 ✓ {b}
 </span>
 ))}
 </div>
 </div>
 </div>

 {/* Verification Pending Notice (If UTR submitted) */}
 {submittedUtrSuccess && (
 <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
 <div className="flex items-center gap-1.5 text-xs font-black">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 <span>Payment Verification In Progress</span>
 </div>
 <p className="text-[11px] text-emerald-700">
 UTR: <strong className="font-mono">{submittedUtrSuccess}</strong> submitted. Super Admin is verifying. Aapka dashboard verification hote hi unlock ho jayega.
 </p>
 </div>
 )}

 {/* Action Buttons */}
 <div className="space-y-2 pt-1">
 <button
 type="button"
 onClick={() => setIsTapToPayOpen(true)}
 className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-98 transition"
 >
 <CreditCard className="w-4 h-4 text-amber-300" />
 <span>Tap to Pay / Renew Membership (₹{renewalPrice})</span>
 </button>

 <button
 type="button"
 onClick={handleLogout}
 className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Log Out</span>
 </button>
 </div>
 </div>
 </div>
 )}

 {/* =========================================================================
 CASE 2: EXPIRING SOON PRE-DASHBOARD POPUP (<= 5 Days Left)
 Dismissible with "Later" button
 ========================================================================= */}
 {!isExpired && showExpiringSoonModal && (
 <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
 <div className="w-full max-w-md bg-white rounded-3xl border border-amber-200 shadow-2xl p-5 space-y-3.5 animate-scale-in">
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2.5">
 <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
 <AlertTriangle className="w-5 h-5" />
 </div>
 <div>
 <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
 Expiring in {daysLeft} {daysLeft === 1 ? "Day" : "Days"}
 </span>
 <h3 className="text-xs font-black text-slate-900 mt-0.5">
 Aapka PG Plan Jaldi Expire Hone Wala Hai!
 </h3>
 </div>
 </div>
 <button
 type="button"
 onClick={handleDismissExpiringSoon}
 className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <p className="text-xs text-slate-600">
 <strong className="text-slate-900">{pg.name}</strong> ka membership plan{" "}
 <strong className="text-amber-700">
 {expiryDate?.toLocaleDateString("en-IN", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 })}
 </strong>{" "}
 ko expire ho raha hai. Kisi bhi rukawat se bachne ke liye abhi renew karein.
 </p>

 {/* Plan Info */}
 <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
 <div>
 <span className="text-[9.5px] font-bold text-slate-400 uppercase">Renewal Plan</span>
 <div className="text-xs font-bold text-slate-900">
 30 Days SaaS Membership
 </div>
 </div>
 <div className="text-sm font-black text-indigo-600">
 ₹{renewalPrice.toLocaleString("en-IN")}
 </div>
 </div>

 {/* Buttons */}
 <div className="flex items-center gap-2 pt-1">
 <button
 type="button"
 onClick={handleDismissExpiringSoon}
 className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition text-center"
 >
 Later
 </button>
 <button
 type="button"
 onClick={() => {
 setShowExpiringSoonModal(false);
 setIsTapToPayOpen(true);
 }}
 className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition shadow-sm text-center flex items-center justify-center gap-1"
 >
 <span>Tap to Pay</span>
 <ChevronRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 )}

 {/* =========================================================================
 TAP TO PAY SHEET / MODAL
 Super Admin UPI ID (Copy + deep link) & Bank details (with Copy) + UTR Form
 ========================================================================= */}
 {isTapToPayOpen && (
 <div
 className="fixed inset-0 z-[95] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
 onClick={() => {
 if (!isExpired) setIsTapToPayOpen(false);
 }}
 >
 <div
 className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
 <div className="flex items-center gap-2">
 <CreditCard className="w-5 h-5 text-indigo-600" />
 <div>
 <h3 className="text-xs font-black text-slate-900">
 Renew PG Membership: ₹{renewalPrice.toLocaleString("en-IN")}
 </h3>
 <p className="text-[10px] text-slate-400">
 Pay directly to Super Admin UPI or Bank Account
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsTapToPayOpen(false)}
 className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* 1. UPI Payment Section */}
 <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
 <QrCode className="w-3.5 h-3.5 text-indigo-600" />
 Option 1: Pay via UPI ID
 </span>
 <span className="text-[10px] font-bold text-indigo-600">
 Instant Payment
 </span>
 </div>

 {/* UPI ID Box */}
 <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-200">
 <div>
 <span className="text-[9.5px] font-bold text-slate-400 uppercase block">
 Super Admin UPI ID
 </span>
 <span className="text-xs font-black text-indigo-950 font-mono tracking-wide">
 {platformSettings.upi_id}
 </span>
 </div>
 <button
 type="button"
 onClick={() => copyToClipboard(platformSettings.upi_id, "upi")}
 className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10.5px] font-black transition flex items-center gap-1"
 >
 {copiedKey === "upi" ? (
 <>
 <Check className="w-3 h-3 text-emerald-600" />
 <span>Copied!</span>
 </>
 ) : (
 <>
 <Copy className="w-3 h-3" />
 <span>Copy</span>
 </>
 )}
 </button>
 </div>

 {/* Direct UPI App link */}
 <a
 href={upiDeepLink}
 className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition"
 >
 <ExternalLink className="w-3.5 h-3.5" />
 <span>Open in GPay / PhonePe / Paytm</span>
 </a>
 </div>

 {/* 2. Direct Bank Details Section */}
 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
 <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
 <Building className="w-3.5 h-3.5 text-slate-500" />
 Option 2: Direct Bank Transfer (NEFT / IMPS)
 </span>

 <div className="space-y-1.5 text-xs">
 <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
 <div>
 <span className="text-[9.5px] text-slate-400 block font-bold">
 Account Holder
 </span>
 <strong className="text-slate-900">{platformSettings.account_holder_name}</strong>
 </div>
 <button
 type="button"
 onClick={() => copyToClipboard(platformSettings.account_holder_name, "holder")}
 className="p-1 text-slate-400 hover:text-slate-700"
 >
 <Copy className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
 <div>
 <span className="text-[9.5px] text-slate-400 block font-bold">Bank Name</span>
 <strong className="text-slate-900">{platformSettings.bank_name}</strong>
 </div>
 </div>

 <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
 <div>
 <span className="text-[9.5px] text-slate-400 block font-bold">
 Account Number
 </span>
 <strong className="text-slate-900 font-mono tracking-wider">
 {platformSettings.account_number}
 </strong>
 </div>
 <button
 type="button"
 onClick={() => copyToClipboard(platformSettings.account_number, "acc")}
 className="p-1 text-slate-400 hover:text-slate-700"
 >
 <Copy className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
 <div>
 <span className="text-[9.5px] text-slate-400 block font-bold">IFSC Code</span>
 <strong className="text-slate-900 font-mono tracking-wider">
 {platformSettings.ifsc_code}
 </strong>
 </div>
 <button
 type="button"
 onClick={() => copyToClipboard(platformSettings.ifsc_code, "ifsc")}
 className="p-1 text-slate-400 hover:text-slate-700"
 >
 <Copy className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>

 {/* 3. Submit UTR Section */}
 <form
 onSubmit={handleSubmitUtr}
 className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2.5"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-black text-white flex items-center gap-1.5">
 <CheckCircle2 className="w-4 h-4 text-emerald-400" />
 Payment Done? Submit UTR
 </span>
 <span className="text-[10px] text-slate-300 font-bold">Step 2 of 2</span>
 </div>
 <p className="text-[10.5px] text-slate-300">
 Payment karne ke baad apna 12-digit UTR ya Reference number yahan enter karein.
 </p>

 <div>
 <input
 type="text"
 value={utrInput}
 onChange={(e) => setUtrInput(e.target.value)}
 placeholder="Enter 12-digit UTR Number (e.g. 409823910283)"
 required
 className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
 />
 </div>

 <button
 type="submit"
 disabled={isSubmittingUtr}
 className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition disabled:opacity-50"
 >
 <span>{isSubmittingUtr ? "Submitting UTR..." : "Payment Done — Submit UTR Number"}</span>
 </button>
 </form>
 </div>
 </div>
 )}
 </>
 );
}
