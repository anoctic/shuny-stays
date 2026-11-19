"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Palette,
  User,
  Mail,
  Phone,
  Shield,
  ExternalLink,
  Crown,
  X,
} from "lucide-react";
import { onboardPgAction } from "@/app/actions/branding";
import { CredentialsGeneratedCard } from "@/components/auth/CredentialsGeneratedCard";
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

export function OnboardPgModal({ triggerButton }: { triggerButton?: React.ReactNode } = {}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    name: string;
    role: "owner";
    loginId: string;
    password: string;
    phone?: string;
    email?: string;
    pgName?: string;
  } | null>(null);

  // Form states for live preview
  const [pgName, setPgName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<
    "Free Trial" | "Starter" | "Pro" | "Enterprise"
  >("Starter");

  // Auto-slug generator from brand name
  const handleNameChange = (val: string) => {
    setPgName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    formData.set("primary_color", primaryColor);
    formData.set("subscription_tier", subscriptionTier);
    if (logoFile) {
      formData.set("logo_file", logoFile);
    }

    startTransition(async () => {
      const res = await onboardPgAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        router.refresh();
        setSuccess(`Successfully onboarded "${res.pg.name}" on Shuny Stays!`);
        if (res.credentials) {
          setCreatedCreds(res.credentials);
        } else {
          setTimeout(() => {
            setIsOpen(false);
            setSuccess(null);
            setPgName("");
            setSlug("");
            setLogoPreview(null);
            setLogoFile(null);
          }, 1800);
        }
      }
    });
  };

  const handleResetAndClose = () => {
    setIsOpen(false);
    setCreatedCreds(null);
    setSuccess(null);
    setError(null);
    setPgName("");
    setSlug("");
    setLogoPreview(null);
    setLogoFile(null);
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="w-full cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-purple-500/25 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Onboard New PG
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[520px] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Onboard New PG Brand
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    White-label branding & instant owner credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instant Credentials Card if created */}
            {createdCreds ? (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PG Onboarded! Credentials automatically provisioned in Supabase Auth.</span>
                </div>

                <CredentialsGeneratedCard
                  name={createdCreds.name}
                  role="owner"
                  loginId={createdCreds.loginId}
                  password={createdCreds.password}
                  phone={createdCreds.phone}
                  email={createdCreds.email}
                  pgName={createdCreds.pgName}
                  onClose={handleResetAndClose}
                />

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-sm transition active:scale-98"
                >
                  Done & Return to Directory
                </button>
              </div>
            ) : (
              <>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {success}
              </div>
            )}

            {/* Live White-Label Branding Card Preview */}
            <div className="rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Live White-Label Preview
              </span>

              <div
                className="rounded-2xl p-3.5 text-white shadow-md flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center font-black text-sm text-white border border-white/30">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (pgName || "PG").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight leading-none">
                      {pgName || "Your PG Brand Name"}
                    </h4>
                    <p className="text-[10px] text-white/80 mt-1 font-mono">
                      /pg/{slug || "custom-slug"}
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
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  PG Brand Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Royal Stay Luxury PG"
                  value={pgName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  White-Label URL Slug *
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs">
                  <span className="text-slate-400 font-mono select-none mr-1">
                    https://shunystays.pages.dev/pg/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    required
                    placeholder="royal-stay"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                    className="flex-1 bg-transparent text-purple-600 dark:text-purple-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tenants can bookmark and install the PWA directly from this link.
                </p>
              </div>

              {/* Logo Upload to Supabase Storage pg-logos */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  PG Brand Logo (Upload to pg-logos bucket)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Uploaded logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UploadCloud className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <label className="flex-1 cursor-pointer">
                    <div className="px-3.5 py-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-800 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-center transition-all">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block">
                        Choose Logo Image (PNG / JPEG / WebP)
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Saved to folder: ${"{pgId}"}/logo.ext
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

              {/* Brand Accent / Primary Color */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-500" /> Brand Primary Color
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setPrimaryColor(color.hex)}
                      className={cn(
                        "w-7 h-7 rounded-full transition-transform active:scale-95 border-2",
                        primaryColor === color.hex
                          ? "border-slate-900 dark:border-white scale-110 shadow-sm"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}

                  <div className="flex items-center gap-1.5 ml-2 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 bg-white dark:bg-slate-800">
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
                      className="w-16 text-[11px] font-mono font-bold uppercase bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> PG Owner Credentials
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Owner Full Name *
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      required
                      placeholder="Vikram Malhotra"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      defaultValue="Bengaluru"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      name="owner_email"
                      required
                      placeholder="vikram@royalstay.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="owner_phone"
                      required
                      placeholder="+91 98222 33441"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
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
                            "py-2 rounded-xl text-xs font-bold transition-all",
                            subscriptionTier === tier
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          )}
                        >
                          {tier}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  {isPending ? "Provisioning PG & Branding..." : "Complete Onboarding"}
                </button>
              </div>
            </form>
            </>
          )}
          </div>
        </div>
      )}
    </>
  );
}
