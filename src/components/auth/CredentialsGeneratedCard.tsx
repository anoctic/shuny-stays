"use client";

import { useState } from "react";
import {
 KeyRound,
 Copy,
 Check,
 MessageCircle,
 ShieldCheck,
 User,
 Phone,
 Lock,
 ExternalLink,
 Sparkles,
 X,
} from "lucide-react";

export interface CredentialsGeneratedCardProps {
 name: string;
 role: "owner" | "admin" | "tenant" | "super_admin";
 loginId: string;
 password: string;
 phone?: string;
 email?: string;
 pgName?: string;
 roomInfo?: string;
 onClose?: () => void;
 className?: string;
}

export function CredentialsGeneratedCard({
 name,
 role,
 loginId,
 password,
 phone,
 email,
 pgName = "Shuny Stays Property",
 roomInfo,
 onClose,
 className = "",
}: CredentialsGeneratedCardProps) {
 const [copied, setCopied] = useState(false);

 const roleLabel =
 role === "owner"
 ? "PG Owner"
 : role === "admin"
 ? "Staff / Warden"
 : role === "super_admin"
 ? "Super Admin"
 : "Resident / Tenant";

 const cleanPhone = (phone || loginId).replace(/\D/g, "").slice(-10);

 // Generate WhatsApp message
 const waText = encodeURIComponent(
 `*Shuny Stays Access Credentials*\n` +
 `Hello ${name},\n` +
 `Your ${roleLabel} account on Shuny Stays for *${pgName}* has been generated:\n\n` +
 `🔑 *Login ID / Phone:* ${loginId}\n` +
 `🔒 *Password:* ${password}\n` +
 (roomInfo ? `🛏 *Bed / Room:* ${roomInfo}\n` : "") +
 `🌐 *Sign In Portal:* ${typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://shunystays.com"}/login\n\n` +
 `Please sign in to manage your bookings, attendance, passes & rent receipts.`
 );

 const waUrl = cleanPhone
 ? `https://wa.me/91${cleanPhone}?text=${waText}`
 : `https://wa.me/?text=${waText}`;

 const copyText = () => {
 const textToCopy =
 `Shuny Stays Access Credentials\n` +
 `Name: ${name}\n` +
 `Role: ${roleLabel}\n` +
 `Login ID: ${loginId}\n` +
 `Password: ${password}\n` +
 `Portal: ${typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://shunystays.com"}/login`;

 navigator.clipboard.writeText(textToCopy);
 setCopied(true);
 setTimeout(() => setCopied(false), 2500);
 };

 return (
 <div
 className={`rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 shadow-sm space-y-3 animate-in fade-in zoom-in-95 ${className}`}
 >
 {/* Top Banner */}
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
 <KeyRound className="w-4 h-4" />
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
 {roleLabel}
 </span>
 <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
 <Sparkles className="w-3 h-3 text-emerald-600" />
 Live Supabase Auth
 </span>
 </div>
 <h4 className="text-xs font-black text-emerald-950 mt-0.5">
 Credentials Ready for {name}
 </h4>
 </div>
 </div>

 {onClose && (
 <button
 type="button"
 onClick={onClose}
 className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-200/60 transition"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* Credentials Details Box */}
 <div className="bg-white/90 border border-emerald-200/80 rounded-xl p-3 space-y-2 text-xs">
 <div className="flex items-center justify-between">
 <span className="text-[10.5px] font-bold text-slate-500">Login ID / Phone:</span>
 <span className="font-black text-slate-900 font-mono tracking-tight bg-slate-100 px-2 py-0.5 rounded-md text-xs">
 {loginId}
 </span>
 </div>

 <div className="flex items-center justify-between">
 <span className="text-[10.5px] font-bold text-slate-500">Auto Password:</span>
 <span className="font-black text-indigo-700 font-mono tracking-tight bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-xs">
 {password}
 </span>
 </div>

 {roomInfo && (
 <div className="flex items-center justify-between pt-1 border-t border-slate-100">
 <span className="text-[10.5px] font-bold text-slate-500">Assigned Bed:</span>
 <span className="font-extrabold text-slate-700">{roomInfo}</span>
 </div>
 )}
 </div>

 {/* 2 Primary Actions: Copy & Send on WhatsApp */}
 <div className="grid grid-cols-2 gap-2 pt-0.5">
 <button
 type="button"
 onClick={copyText}
 className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-2xs transition"
 >
 {copied ? (
 <>
 <Check className="w-3.5 h-3.5 text-emerald-600" />
 <span className="text-emerald-700">Copied!</span>
 </>
 ) : (
 <>
 <Copy className="w-3.5 h-3.5 text-slate-500" />
 <span>Copy Access</span>
 </>
 )}
 </button>

 <a
 href={waUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition"
 >
 <MessageCircle className="w-3.5 h-3.5" />
 <span>Send WhatsApp</span>
 </a>
 </div>
 </div>
 );
}
