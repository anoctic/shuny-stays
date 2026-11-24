"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
 Calendar,
 CreditCard,
 X,
 Save,
 Clock,
 Sparkles,
 Edit3,
} from "lucide-react";
import { PgDetailItem } from "@/lib/data/pgs";
import { updatePgPlanDetailsAction } from "@/app/actions/billing";

interface EditPgPlanModalProps {
 pg: PgDetailItem;
}

export function EditPgPlanModal({ pg }: EditPgPlanModalProps) {
 const router = useRouter();
 const [isOpen, setIsOpen] = useState(false);

 // Initial date formatting: YYYY-MM-DD
 const defaultDateStr = pg.plan_expires_at
 ? new Date(pg.plan_expires_at).toISOString().split("T")[0]
 : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];

 const [expiryDate, setExpiryDate] = useState(defaultDateStr);
 const [price, setPrice] = useState(pg.plan_price || 1999);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 setErrorMsg(null);

 try {
 const isoExpiry = new Date(`${expiryDate}T23:59:59.000Z`).toISOString();
 const res = await updatePgPlanDetailsAction(pg.id, isoExpiry, Number(price));

 if (res?.error) {
 setErrorMsg(res.error);
 } else {
 setIsOpen(false);
 router.refresh();
 }
 } catch (err: any) {
 setErrorMsg(err?.message || "Failed to update PG plan details.");
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <>
 <button
 type="button"
 onClick={() => setIsOpen(true)}
 className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[10px] font-bold border border-slate-200 transition flex items-center gap-1 shrink-0"
 title="Edit PG Expiry & Price"
 >
 <Edit3 className="w-3 h-3 text-indigo-500" />
 <span>Edit Plan</span>
 </button>

 {isOpen && (
 <div
 className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
 onClick={() => setIsOpen(false)}
 >
 <div
 className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 animate-scale-in"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between pb-2 border-b border-slate-100">
 <div className="flex items-center gap-1.5">
 <Calendar className="w-4 h-4 text-indigo-600" />
 <h3 className="text-xs font-black text-slate-900">
 Edit Plan: {pg.name}
 </h3>
 </div>
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {errorMsg && (
 <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold">
 {errorMsg}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-3">
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
 Membership Expiry Date
 </label>
 <input
 type="date"
 value={expiryDate}
 onChange={(e) => setExpiryDate(e.target.value)}
 required
 className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-bold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
 Renewal Price (₹)
 </label>
 <input
 type="number"
 value={price}
 onChange={(e) => setPrice(Number(e.target.value))}
 required
 className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-bold text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 </div>

 <div className="pt-2 flex items-center justify-end gap-2">
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="px-3.5 py-2 sm:py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 active:scale-95 transition"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="px-4 py-2 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-xs disabled:opacity-50 active:scale-95 transition"
 >
 <Save className="w-3.5 h-3.5" />
 <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </>
 );
}
