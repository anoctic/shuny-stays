"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
 CreditCard,
 QrCode,
 Building,
 CheckCircle2,
 AlertCircle,
 Copy,
 Check,
 Save,
 Clock,
 CheckCheck,
 XCircle,
 Sparkles,
 ExternalLink,
} from "lucide-react";
import {
 PlatformBillingSettings,
 PgSubscriptionRequest,
} from "@/lib/data/billing-settings";
import {
 savePlatformBillingSettingsAction,
 reviewPgRenewalRequestAction,
} from "@/app/actions/billing";

interface PlatformBillingCardProps {
 initialSettings: PlatformBillingSettings;
 initialRequests: PgSubscriptionRequest[];
}

export function PlatformBillingCard({
 initialSettings,
 initialRequests,
}: PlatformBillingCardProps) {
 const router = useRouter();

 // Settings Form State
 const [upiId, setUpiId] = useState(initialSettings.upi_id || "anoctic@oksbi");
 const [payeeName, setPayeeName] = useState(initialSettings.payee_name || "Shuny Stays Admin");
 const [accountHolderName, setAccountHolderName] = useState(
 initialSettings.account_holder_name || "Anoctic Technologies"
 );
 const [bankName, setBankName] = useState(initialSettings.bank_name || "State Bank of India");
 const [accountNumber, setAccountNumber] = useState(initialSettings.account_number || "39820192831");
 const [ifscCode, setIfscCode] = useState(initialSettings.ifsc_code || "SBIN0001234");
 const [planPrice, setPlanPrice] = useState<number>(initialSettings.plan_price || 1999);
 const [planDurationDays, setPlanDurationDays] = useState<number>(
 initialSettings.plan_duration_days || 30
 );
 const [benefitsInput, setBenefitsInput] = useState<string>(
 (initialSettings.plan_benefits || []).join("\n")
 );

 const [isSavingSettings, setIsSavingSettings] = useState(false);
 const [requestsList, setRequestsList] = useState<PgSubscriptionRequest[]>(initialRequests);
 const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
 const [copiedKey, setCopiedKey] = useState<string | null>(null);
 const [toastMsg, setToastMsg] = useState<string | null>(null);

 const showToast = (msg: string) => {
 setToastMsg(msg);
 setTimeout(() => setToastMsg(null), 3500);
 };

 const copyToClipboard = (text: string, key: string) => {
 navigator.clipboard.writeText(text);
 setCopiedKey(key);
 showToast(`Copied: ${text}`);
 setTimeout(() => setCopiedKey(null), 2000);
 };

 const handleSaveSettings = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSavingSettings(true);

 const parsedBenefits = benefitsInput
 .split("\n")
 .map((b) => b.trim())
 .filter((b) => b.length > 0);

 const res = await savePlatformBillingSettingsAction({
 upi_id: upiId,
 payee_name: payeeName,
 account_holder_name: accountHolderName,
 bank_name: bankName,
 account_number: accountNumber,
 ifsc_code: ifscCode,
 plan_price: planPrice,
 plan_duration_days: planDurationDays,
 plan_benefits: parsedBenefits,
 });

 setIsSavingSettings(false);
 if (res?.error) {
 showToast(`Error: ${res.error}`);
 } else {
 showToast("Platform Bank & UPI Settings saved live in Supabase!");
 router.refresh();
 }
 };

 const handleReviewRequest = async (
 requestId: string,
 action: "approve" | "reject"
 ) => {
 let rejectionReason: string | undefined = undefined;
 if (action === "reject") {
 const reason = window.prompt("Reason for rejection (optional):", "UTR could not be verified on bank statement.");
 if (reason === null) return; // user cancelled prompt
 rejectionReason = reason;
 }

 setActionLoadingId(requestId);
 try {
 const res = await reviewPgRenewalRequestAction(requestId, action, rejectionReason);
 if ("error" in res && res.error) {
 showToast(`Failed: ${res.error}`);
 } else {
 setRequestsList((prev) =>
 prev.map((r) =>
 r.id === requestId
 ? {
 ...r,
 status: action === "approve" ? "approved" : "rejected",
 rejection_reason: rejectionReason || r.rejection_reason,
 }
 : r
 )
 );
 showToast(
 action === "approve"
 ? "Renewal Approved! PG Membership activated & expiry extended."
 : "Request rejected."
 );
 router.refresh();
 }
 } catch (err: any) {
 showToast(`Error: ${err?.message || "Failed to update request."}`);
 } finally {
 setActionLoadingId(null);
 }
 };

 const pendingRequests = requestsList.filter((r) => r.status === "pending");
 const pastRequests = requestsList.filter((r) => r.status !== "pending");

 return (
 <div className="space-y-4">
 {/* Toast Alert */}
 {toastMsg && (
 <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
 <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
 <span>{toastMsg}</span>
 </div>
 )}

 {/* 1. Pending Renewal Requests Section */}
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
 <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
 <div>
 <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
 <Clock className="w-4 h-4 text-amber-500" />
 Pending PG Renewal Payments ({pendingRequests.length})
 </h3>
 <p className="text-[10px] text-slate-400 mt-0.5">
 PG Owners and Admins submit their UTR after paying to your UPI ID or Bank account.
 </p>
 </div>
 {pendingRequests.length > 0 && (
 <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9.5px] font-black uppercase">
 Action Required
 </span>
 )}
 </div>

 {pendingRequests.length === 0 ? (
 <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
 <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
 <p className="text-xs font-bold text-slate-700">No pending renewal requests</p>
 <p className="text-[10.5px] text-slate-400 mt-0.5">
 When a PG pays and enters their UTR number, it will appear here for verification.
 </p>
 </div>
 ) : (
 <div className="space-y-2.5">
 {pendingRequests.map((req) => (
 <div
 key={req.id}
 className="p-3.5 rounded-xl border border-amber-200/90 bg-amber-50/40 space-y-2.5"
 >
 <div className="flex items-start justify-between gap-2">
 <div>
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-black text-slate-900">{req.pg_name}</span>
 <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 text-[9px] font-black uppercase">
 Pending Verification
 </span>
 </div>
 <p className="text-[10.5px] text-slate-500 mt-0.5">
 Submitted by: <span className="font-bold text-slate-700">{req.submitted_by_name}</span> ({req.submitted_by_role}) •{" "}
 {new Date(req.created_at).toLocaleDateString("en-IN", {
 day: "2-digit",
 month: "short",
 hour: "2-digit",
 minute: "2-digit",
 })}
 </p>
 </div>

 <div className="text-right">
 <span className="text-sm font-black text-emerald-700">
 ₹{req.amount.toLocaleString("en-IN")}
 </span>
 </div>
 </div>

 <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-amber-200">
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-slate-400">UTR / Ref:</span>
 <span className="font-mono text-xs font-black text-slate-900 tracking-wider">
 {req.utr_number}
 </span>
 </div>
 <button
 type="button"
 onClick={() => copyToClipboard(req.utr_number, req.id)}
 className="p-1 rounded text-slate-500 hover:text-slate-800 transition"
 title="Copy UTR"
 >
 {copiedKey === req.id ? (
 <Check className="w-3.5 h-3.5 text-emerald-600" />
 ) : (
 <Copy className="w-3.5 h-3.5" />
 )}
 </button>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end gap-2 pt-1">
 <button
 type="button"
 disabled={actionLoadingId === req.id}
 onClick={() => handleReviewRequest(req.id, "reject")}
 className="px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-[10.5px] font-black transition disabled:opacity-50"
 >
 Reject
 </button>
 <button
 type="button"
 disabled={actionLoadingId === req.id}
 onClick={() => handleReviewRequest(req.id, "approve")}
 className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-black transition shadow-xs disabled:opacity-50 flex items-center gap-1"
 >
 <CheckCheck className="w-3.5 h-3.5" />
 <span>Approve & Extend PG (+{planDurationDays} Days)</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Recent Reviewed Requests */}
 {pastRequests.length > 0 && (
 <div className="pt-2">
 <details className="text-[11px] text-slate-500">
 <summary className="cursor-pointer font-bold hover:text-slate-700">
 View Past Processed Requests ({pastRequests.length})
 </summary>
 <div className="mt-2 space-y-1.5">
 {pastRequests.slice(0, 5).map((r) => (
 <div
 key={r.id}
 className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[10.5px]"
 >
 <div>
 <span className="font-bold text-slate-800">{r.pg_name}</span> • UTR: {r.utr_number}
 </div>
 <span
 className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
 r.status === "approved"
 ? "bg-emerald-100 text-emerald-800"
 : "bg-rose-100 text-rose-800"
 }`}
 >
 {r.status}
 </span>
 </div>
 ))}
 </div>
 </details>
 </div>
 )}
 </div>

 {/* 2. Platform Bank & UPI Settings Card */}
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5">
 <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
 <div>
 <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
 <QrCode className="w-4 h-4 text-indigo-600" />
 Super Admin Bank & UPI Payment Settings
 </h3>
 <p className="text-[10px] text-slate-400 mt-0.5">
 These payment details are shown to PG Owners & Admins when they tap to renew membership.
 </p>
 </div>
 </div>

 <form onSubmit={handleSaveSettings} className="space-y-3">
 {/* Section: UPI ID & Payee Name */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
 Super Admin UPI ID (GPay / PhonePe / Paytm)
 </label>
 <input
 type="text"
 value={upiId}
 onChange={(e) => setUpiId(e.target.value)}
 placeholder="anoctic@oksbi"
 required
 className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
 UPI Payee Name
 </label>
 <input
 type="text"
 value={payeeName}
 onChange={(e) => setPayeeName(e.target.value)}
 placeholder="Shuny Stays Admin"
 required
 className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
 />
 </div>
 </div>

 {/* Section: Bank Account Details */}
 <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
 <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
 <Building className="w-3.5 h-3.5 text-slate-500" />
 Direct Bank Transfer Details
 </span>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
 <div>
 <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
 Account Holder Name
 </label>
 <input
 type="text"
 value={accountHolderName}
 onChange={(e) => setAccountHolderName(e.target.value)}
 placeholder="Anoctic Technologies"
 required
 className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
 Bank Name
 </label>
 <input
 type="text"
 value={bankName}
 onChange={(e) => setBankName(e.target.value)}
 placeholder="State Bank of India"
 required
 className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
 Account Number
 </label>
 <input
 type="text"
 value={accountNumber}
 onChange={(e) => setAccountNumber(e.target.value)}
 placeholder="39820192831"
 required
 className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
 />
 </div>

 <div>
 <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
 IFSC Code
 </label>
 <input
 type="text"
 value={ifscCode}
 onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
 placeholder="SBIN0001234"
 required
 className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
 />
 </div>
 </div>
 </div>

 {/* Section: Plan Price & Duration */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
 Default SaaS Renewal Price (₹)
 </label>
 <input
 type="number"
 value={planPrice}
 onChange={(e) => setPlanPrice(Number(e.target.value))}
 placeholder="1999"
 required
 className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
 Plan Validity Duration (Days)
 </label>
 <input
 type="number"
 value={planDurationDays}
 onChange={(e) => setPlanDurationDays(Number(e.target.value))}
 placeholder="30"
 required
 className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/50"
 />
 </div>
 </div>

 {/* Section: Plan Benefits */}
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
 Plan Benefits (One feature per line)
 </label>
 <textarea
 rows={4}
 value={benefitsInput}
 onChange={(e) => setBenefitsInput(e.target.value)}
 placeholder="Full White-label Branding&#10;Automated WhatsApp Rent Reminders&#10;Live Attendance & Gate Pass System"
 className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 font-medium"
 />
 </div>

 {/* Save Button */}
 <div className="pt-2 flex justify-end">
 <button
 type="submit"
 disabled={isSavingSettings}
 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition disabled:opacity-50"
 >
 <Save className="w-3.5 h-3.5" />
 <span>{isSavingSettings ? "Saving Settings..." : "Save Platform Billing Settings"}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
