"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Building2, CheckCircle2 } from "lucide-react";
import { createOrganizationAction } from "@/app/actions/auth";

export function CreateOrgModal() {
 const router = useRouter();
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsSubmitting(true);
 const formData = new FormData(e.currentTarget);
 try {
 await createOrganizationAction(formData);
 router.refresh();
 setSuccess(true);
 setTimeout(() => {
 setSuccess(false);
 setIsOpen(false);
 }, 1500);
 } catch (err: any) {
 alert(err.message || "Failed to create organization");
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <>
 <button
 onClick={() => setIsOpen(true)}
 className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition"
 >
 <Plus className="h-4 w-4" />
 Create Organization
 </button>

 {isOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
 <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
 <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
 <div className="flex items-center gap-2.5">
 <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
 <Building2 className="h-4 w-4" />
 </div>
 <div>
 <h3 className="font-extrabold text-sm text-slate-900">
 Register New PG Organization
 </h3>
 <p className="text-[11px] text-slate-500 font-medium">
 Onboard a new PG Owner onto the platform
 </p>
 </div>
 </div>
 <button
 onClick={() => setIsOpen(false)}
 className="p-1 rounded-full text-slate-400 hover:text-slate-600"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 {success ? (
 <div className="py-8 text-center space-y-2">
 <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
 <p className="font-extrabold text-sm text-slate-900">
 Organization Created!
 </p>
 <p className="text-xs text-slate-600">
 New tenant schema and default membership initialized.
 </p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-3.5">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Organization Name *
 </label>
 <input
 type="text"
 name="name"
 required
 placeholder="e.g. Royal Nest Luxury Hostels"
 className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Slug (Unique identifier) *
 </label>
 <input
 type="text"
 name="slug"
 required
 placeholder="royal-nest-hostels"
 className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-mono text-[11px] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Contact Email *
 </label>
 <input
 type="email"
 name="contact_email"
 required
 placeholder="owner@royalnest.com"
 className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 Contact Phone
 </label>
 <input
 type="tel"
 name="contact_phone"
 placeholder="+91 98765 43210"
 className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">
 City / Address
 </label>
 <input
 type="text"
 name="address"
 placeholder="e.g. HSR Layout, Bengaluru"
 className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
 />
 </div>

 <div className="pt-2 flex justify-end gap-2">
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
 >
 {isSubmitting ? "Creating..." : "Save Organization"}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 )}
 </>
 );
}
