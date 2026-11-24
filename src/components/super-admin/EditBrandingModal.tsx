"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
 Palette,
 Sparkles,
 UploadCloud,
 CheckCircle2,
 X,
 Building2,
 ExternalLink,
} from "lucide-react";
import { updatePgBrandingAction } from "@/app/actions/branding";
import { PgDetailItem } from "@/lib/data/pgs";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
 { name: "Indigo", hex: "#4F46E5" },
 { name: "Emerald", hex: "#059669" },
 { name: "Sky Blue", hex: "#0284C7" },
 { name: "Violet", hex: "#7C3AED" },
 { name: "Rose", hex: "#E11D48" },
 { name: "Amber", hex: "#D97706" },
 { name: "Dark Slate", hex: "#1E293B" },
];

interface EditBrandingModalProps {
 pg: PgDetailItem;
 triggerButton?: React.ReactNode;
}

export function EditBrandingModal({ pg, triggerButton }: EditBrandingModalProps) {
 const router = useRouter();
 const [isOpen, setIsOpen] = useState(false);
 const [isPending, startTransition] = useTransition();
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);

 const [pgName, setPgName] = useState(pg.name);
 const [slug, setSlug] = useState(pg.slug);
 const [primaryColor, setPrimaryColor] = useState(pg.primary_color || "#4F46E5");
 const [logoPreview, setLogoPreview] = useState<string | null>(pg.logo_url);
 const [logoFile, setLogoFile] = useState<File | null>(null);
 const [subscriptionTier, setSubscriptionTier] = useState(pg.subscription_tier);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 setLogoFile(file);
 setLogoPreview(URL.createObjectURL(file));
 }
 };

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setError(null);
 setSuccess(null);

 const formData = new FormData(e.currentTarget);
 formData.set("pg_id", pg.id);
 formData.set("primary_color", primaryColor);
 formData.set("subscription_tier", subscriptionTier);
 if (logoFile) {
 formData.set("logo_file", logoFile);
 }

 startTransition(async () => {
 const res = await updatePgBrandingAction(formData);
 if (res?.error) {
 setError(res.error);
 } else if (res?.success) {
 router.refresh();
 setSuccess("Branding updated successfully!");
 setTimeout(() => {
 setIsOpen(false);
 setSuccess(null);
 }, 1500);
 }
 });
 };

 return (
 <>
 {triggerButton ? (
 <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
 {triggerButton}
 </div>
 ) : (
 <button
 type="button"
 onClick={() => setIsOpen(true)}
 className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
 >
 <Palette className="w-3.5 h-3.5 text-purple-600" />
 Edit Branding
 </button>
 )}

 {isOpen && (
 <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
 <div className="bg-white w-full max-w-[500px] rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 space-y-4">
 {/* Header */}
 <div className="flex items-center justify-between pb-3 border-b border-slate-100">
 <div className="flex items-center gap-2.5">
 <div
 className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
 style={{ backgroundColor: primaryColor }}
 >
 <Palette className="w-4 h-4" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900">
 Edit Brand & Theme
 </h3>
 <p className="text-[11px] text-slate-500 font-medium">
 Custom logo, accent color, and URL slug
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
 {error}
 </div>
 )}

 {success && (
 <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 {success}
 </div>
 )}

 {/* Live Preview Card */}
 <div
 className="rounded-2xl p-4 text-white shadow-md flex items-center justify-between transition-colors duration-200"
 style={{ backgroundColor: primaryColor }}
 >
 <div className="flex items-center gap-3">
 <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center font-black text-base text-white border border-white/30">
 {logoPreview ? (
 <img
 src={logoPreview}
 alt="Logo Preview"
 className="w-full h-full object-cover"
 />
 ) : (
 pgName.slice(0, 2).toUpperCase()
 )}
 </div>
 <div>
 <h4 className="text-sm font-black tracking-tight leading-none">
 {pgName}
 </h4>
 <p className="text-[10px] text-white/80 mt-1 font-mono">
 /pg/{slug}
 </p>
 </div>
 </div>

 <div className="text-right">
 <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
 {subscriptionTier}
 </span>
 <p className="text-[9px] text-white/70 mt-1">Powered by Shuny Stays Software</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Brand Name */}
 <div>
 <label className="text-xs font-bold text-slate-700 block mb-1">
 Brand Name
 </label>
 <input
 type="text"
 name="name"
 value={pgName}
 onChange={(e) => setPgName(e.target.value)}
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>

 {/* URL Slug */}
 <div>
 <label className="text-xs font-bold text-slate-700 block mb-1">
 Slug (Public URL)
 </label>
 <input
 type="text"
 name="slug"
 value={slug}
 onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-indigo-700 font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>

 {/* Logo Upload */}
 <div>
 <label className="text-xs font-bold text-slate-700 block mb-1">
 Replace Logo (Supabase Storage: pg-logos)
 </label>
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
 {logoPreview ? (
 <img
 src={logoPreview}
 alt="Logo"
 className="w-full h-full object-cover"
 />
 ) : (
 <UploadCloud className="w-5 h-5 text-slate-400" />
 )}
 </div>
 <label className="flex-1 cursor-pointer">
 <div className="px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 text-center transition-all">
 <span className="text-xs font-bold text-indigo-600 block">
 Upload New Logo Image
 </span>
 <span className="text-[10px] text-slate-400 block">
 Saved to path: {pg.id}/logo.ext
 </span>
 </div>
 <input
 type="file"
 accept="image/*"
 onChange={handleFileChange}
 className="hidden"
 />
 </label>
 </div>
 </div>

 {/* Primary Color Palette */}
 <div>
 <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
 <Palette className="w-3.5 h-3.5 text-indigo-600" /> Primary Brand Color
 </label>
 <div className="flex flex-wrap gap-2 items-center">
 {COLOR_PRESETS.map((color) => (
 <button
 key={color.hex}
 type="button"
 onClick={() => setPrimaryColor(color.hex)}
 className={cn(
 "w-7 h-7 rounded-full transition-transform active:scale-95 border-2 cursor-pointer",
 primaryColor === color.hex
 ? "border-slate-900 scale-110 shadow-sm"
 : "border-transparent"
 )}
 style={{ backgroundColor: color.hex }}
 />
 ))}
 <div className="flex items-center gap-1.5 ml-2 border border-slate-300 rounded-xl px-2 py-1 bg-white">
 <input
 type="color"
 value={primaryColor}
 onChange={(e) => setPrimaryColor(e.target.value)}
 className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
 />
 <input
 type="text"
 value={primaryColor}
 onChange={(e) => setPrimaryColor(e.target.value)}
 className="w-16 text-[11px] font-mono font-bold uppercase bg-transparent text-slate-900 focus:outline-none"
 />
 </div>
 </div>
 </div>

 {/* Subscription Tier */}
 <div>
 <label className="text-xs font-bold text-slate-700 block mb-1">
 Subscription Tier
 </label>
 <div className="grid grid-cols-4 gap-1.5">
 {(["Free Trial", "Starter", "Pro", "Enterprise"] as const).map(
 (tier) => (
 <button
 key={tier}
 type="button"
 onClick={() => setSubscriptionTier(tier)}
 className={cn(
 "py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
 subscriptionTier === tier
 ? "bg-indigo-600 text-white shadow-xs"
 : "bg-slate-100 text-slate-700 hover:bg-slate-200"
 )}
 >
 {tier}
 </button>
 )
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="pt-2 flex items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isPending}
 className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
 >
 {isPending ? "Updating Branding..." : "Save Changes"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </>
 );
}
