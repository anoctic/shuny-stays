"use client";

import { useState } from "react";
import { Plus, Edit2, X, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { SubscriptionPlanItem } from "@/types/subscription.types";
import { saveSubscriptionPlanAction } from "@/app/actions/subscriptions";

interface PlanManagementModalProps {
 plan?: SubscriptionPlanItem | null;
 mode?: "create" | "edit";
 triggerButton?: React.ReactNode;
 onSuccess?: (plan: SubscriptionPlanItem) => void;
}

export function PlanManagementModal({
 plan,
 mode = "create",
 triggerButton,
 onSuccess,
}: PlanManagementModalProps) {
 const [isOpen, setIsOpen] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const [id, setId] = useState(plan?.id || "");
 const [name, setName] = useState(plan?.name || "");
 const [price, setPrice] = useState(plan?.price ?? 999);
 const [billingCycle, setBillingCycle] = useState(plan?.billing_cycle || "monthly");
 const [maxBeds, setMaxBeds] = useState(plan?.max_beds ?? 100);
 const [badge, setBadge] = useState(plan?.badge || "");
 const [featuresText, setFeaturesText] = useState(
 plan?.features?.join("\n") ||
 "Up to 100 Beds\nCustom White-Label Slug\nAutomated WhatsApp Receipts\nDirect Zero-Fee UPI"
 );
 const [isActive, setIsActive] = useState(plan?.is_active ?? true);

 const handleOpen = () => {
 setError(null);
 if (plan) {
 setId(plan.id);
 setName(plan.name);
 setPrice(plan.price);
 setBillingCycle(plan.billing_cycle);
 setMaxBeds(plan.max_beds);
 setBadge(plan.badge || "");
 setFeaturesText(plan.features?.join("\n") || "");
 setIsActive(plan.is_active ?? true);
 } else {
 setId("");
 setName("");
 setPrice(999);
 setBillingCycle("monthly");
 setMaxBeds(100);
 setBadge("");
 setFeaturesText("Up to 100 Beds\nCustom White-Label Slug\nAutomated WhatsApp Receipts\nDirect Zero-Fee UPI");
 setIsActive(true);
 }
 setIsOpen(true);
 };

 const handleClose = () => {
 setIsOpen(false);
 setError(null);
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 const planId = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
 if (!planId) {
 setError("Please enter a valid Plan ID (e.g. 'starter' or 'pro_max').");
 return;
 }
 if (!name.trim()) {
 setError("Please enter a Plan Name.");
 return;
 }

 const features = featuresText
 .split("\n")
 .map((f) => f.trim())
 .filter((f) => f.length > 0);

 const planData: SubscriptionPlanItem = {
 id: planId,
 name: name.trim(),
 price: Number(price) || 0,
 billing_cycle: billingCycle,
 max_beds: Number(maxBeds) || 50,
 badge: badge.trim() || null,
 features,
 is_active: isActive,
 };

 setIsSaving(true);
 try {
 const res = await saveSubscriptionPlanAction(planData);
 if (res.error) {
 setError(res.error);
 setIsSaving(false);
 return;
 }

 onSuccess?.(planData);
 setIsOpen(false);
 } catch (err: any) {
 setError(err?.message || "Failed to save plan.");
 } finally {
 setIsSaving(false);
 }
 };

 return (
 <>
 {triggerButton ? (
 <div onClick={handleOpen}>{triggerButton}</div>
 ) : mode === "edit" ? (
 <button
 type="button"
 onClick={handleOpen}
 className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
 title="Edit Plan Price & Features"
 >
 <Edit2 className="w-3.5 h-3.5" />
 <span>Edit</span>
 </button>
 ) : (
 <button
 type="button"
 onClick={handleOpen}
 className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>Add Plan</span>
 </button>
 )}

 {isOpen && (
 <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
 <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
 {/* Header */}
 <div className="flex items-center justify-between pb-3 border-b border-slate-100">
 <div className="flex items-center gap-2.5">
 <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200">
 <Sparkles className="w-4 h-4 text-indigo-600" />
 </div>
 <div>
 <h3 className="text-sm font-black text-slate-900">
 {mode === "edit" ? "Edit Membership Plan" : "Create New Membership Plan"}
 </h3>
 <p className="text-[11px] text-slate-500 font-medium">
 Set SaaS pricing, bed capacity limits, and tier perks.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={handleClose}
 className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {error && (
 <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-3.5">
 <div className="grid grid-cols-2 gap-3">
 {/* Plan Identifier */}
 <div>
 <label className="block text-[11px] font-bold text-slate-700 mb-1">
 Plan ID / Code *
 </label>
 <input
 type="text"
 required
 disabled={mode === "edit"}
 value={id}
 onChange={(e) => setId(e.target.value)}
 placeholder="e.g. starter_plus"
 className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono text-slate-800 disabled:opacity-60"
 />
 <span className="text-[9px] text-slate-500 font-medium">Unique lowercase key</span>
 </div>

 {/* Plan Name */}
 <div>
 <label className="block text-[11px] font-bold text-slate-700 mb-1">
 Plan Display Name *
 </label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. Starter White-Label"
 className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2.5">
 {/* Price */}
 <div>
 <label className="block text-[11px] font-bold text-slate-700 mb-1">
 Price (₹) *
 </label>
 <input
 type="number"
 min="0"
 step="1"
 required
 value={price}
 onChange={(e) => setPrice(Number(e.target.value))}
 className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-black text-indigo-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>

 {/* Billing Cycle */}
 <div>
 <label className="block text-[11px] font-bold text-slate-700 mb-1">
 Cycle
 </label>
 <select
 value={billingCycle}
 onChange={(e) => setBillingCycle(e.target.value)}
 className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 >
 <option value="monthly">Monthly (/mo)</option>
 <option value="quarterly">Quarterly (/qtr)</option>
 <option value="yearly">Yearly (/yr)</option>
 <option value="14-days">14 Days Trial</option>
 </select>
 </div>

 {/* Max Beds */}
 <div>
 <label className="block text-[11px] font-bold text-slate-700 mb-1">
 Max Beds
 </label>
 <input
 type="number"
 min="1"
 value={maxBeds}
 onChange={(e) => setMaxBeds(Number(e.target.value))}
 className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>
 </div>

 {/* Badge Tag */}
 <div>
 <label className="block text-[11px] font-bold text-slate-700 mb-1">
 Highlight Badge Tag (Optional)
 </label>
 <input
 type="text"
 value={badge}
 onChange={(e) => setBadge(e.target.value)}
 placeholder="e.g. Most Popular, Best Value, Recommended"
 className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>

 {/* Features List */}
 <div>
 <label className="block text-[11px] font-bold text-slate-700 mb-1">
 Plan Features & Perks (One per line)
 </label>
 <textarea
 rows={4}
 value={featuresText}
 onChange={(e) => setFeaturesText(e.target.value)}
 placeholder="Up to 100 Beds&#10;Custom Slug&#10;WhatsApp Receipts"
 className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-sans text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 <span className="text-[10px] text-slate-500 font-medium">
 Each line appears with a green checkmark on the pricing card.
 </span>
 </div>

 {/* Buttons */}
 <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
 <button
 type="button"
 onClick={handleClose}
 className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSaving}
 className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 disabled:opacity-50 transition active:scale-95 cursor-pointer"
 >
 {isSaving ? "Saving Plan..." : mode === "edit" ? "Update Plan Price & Features" : "Create Plan"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </>
 );
}
