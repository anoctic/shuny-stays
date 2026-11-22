"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  RefreshCw,
  KeyRound,
  Calendar,
  ShieldCheck,
  MapPin,
  Palette,
  BedDouble,
  Users,
  CheckCircle2,
  X,
  Edit3,
  ArrowRight,
  Pause,
  Play,
  Save,
  Clock,
  Crown,
} from "lucide-react";
import { PgDetailItem } from "@/lib/data/pgs";
import {
  resetPgOwnerPasswordAction,
  togglePgStatusAction,
} from "@/app/actions/branding";
import { updatePgPlanDetailsAction } from "@/app/actions/billing";
import { switchDemoPersonaAction } from "@/app/actions/auth";

interface PgDetailsModalProps {
  pg: PgDetailItem;
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated?: (newExpiry: string, newPrice: number) => void;
  onStatusToggled?: (newStatus: "active" | "pending" | "suspended") => void;
}

export function PgDetailsModal({
  pg,
  isOpen,
  onClose,
  onPlanUpdated,
  onStatusToggled,
}: PgDetailsModalProps) {
  const router = useRouter();

  // Password state
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(
    pg.owner_initial_password || "Shuny@2026"
  );
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  // Status state
  const [currentStatus, setCurrentStatus] = useState(pg.status);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Copy tracking states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Inline Edit Plan state
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const defaultDateStr = pg.plan_expires_at
    ? new Date(pg.plan_expires_at).toISOString().split("T")[0]
    : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
  const [planExpiryDate, setPlanExpiryDate] = useState(defaultDateStr);
  const [planPrice, setPlanPrice] = useState(pg.plan_price || 1999);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleRegeneratePassword = async () => {
    if (
      !confirm(
        `Are you sure you want to regenerate a new password for "${pg.name}"? The owner will need the new password to log in.`
      )
    ) {
      return;
    }

    setIsResettingPassword(true);
    setPasswordToast(null);

    try {
      const res = await resetPgOwnerPasswordAction(pg.id);
      if (res?.error) {
        setPasswordToast(`Error: ${res.error}`);
      } else if (res?.newPassword) {
        setCurrentPassword(res.newPassword);
        setShowPassword(true);
        navigator.clipboard.writeText(res.newPassword);
        setPasswordToast("New password generated & copied to clipboard!");
        router.refresh();
      }
    } catch (err: any) {
      setPasswordToast(`Error: ${err?.message || "Failed to reset password"}`);
    } finally {
      setIsResettingPassword(false);
      setTimeout(() => setPasswordToast(null), 4000);
    }
  };

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    let nextStatus: "active" | "pending" | "suspended" = "active";
    if (currentStatus === "active") nextStatus = "suspended";
    else nextStatus = "active";

    try {
      const res = await togglePgStatusAction(pg.id, nextStatus);
      if (res?.error) {
        alert(`Status update failed: ${res.error}`);
      } else {
        setCurrentStatus(nextStatus);
        if (onStatusToggled) onStatusToggled(nextStatus);
        router.refresh();
      }
    } catch (err: any) {
      alert(`Error: ${err?.message || "Failed to update status"}`);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    setPlanError(null);
    setPlanSuccess(null);

    try {
      const isoExpiry = new Date(`${planExpiryDate}T23:59:59.000Z`).toISOString();
      const res = await updatePgPlanDetailsAction(
        pg.id,
        isoExpiry,
        Number(planPrice)
      );

      if (res?.error) {
        setPlanError(res.error);
      } else {
        setPlanSuccess("Plan updated successfully!");
        if (onPlanUpdated) {
          onPlanUpdated(isoExpiry, Number(planPrice));
        }
        setIsEditingPlan(false);
        router.refresh();
        setTimeout(() => setPlanSuccess(null), 3000);
      }
    } catch (err: any) {
      setPlanError(err?.message || "Failed to save plan details.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleViewAsOwner = async () => {
    try {
      await switchDemoPersonaAction("owner");
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    }
  };

  // Expiry calculation
  const expiryDateObj = pg.plan_expires_at ? new Date(pg.plan_expires_at) : null;
  const isExpired = expiryDateObj ? expiryDateObj < new Date() : false;
  const daysRemaining = expiryDateObj
    ? Math.ceil((expiryDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 30;

  const cleanPhone = (pg.contact_phone || "").replace(/\D/g, "").slice(-10);
  const portalUrl = `https://shunystays.com/pg/${pg.slug}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {pg.logo_url ? (
              <img
                src={pg.logo_url}
                alt={pg.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0 bg-white"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 border-2 border-white/20"
                style={{ backgroundColor: pg.primary_color || "#4F46E5" }}
              >
                {pg.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white truncate">
                  {pg.name}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    currentStatus === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : currentStatus === "pending"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {currentStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 text-amber-300" />
                  {pg.subscription_tier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 truncate">
                <span>/pg/{pg.slug}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {pg.city || "Bengaluru"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 text-xs">
          {/* SECTION 1: PG OWNER CREDENTIALS & LOGIN PASSWORD */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-200/90 dark:border-indigo-800/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                    Owner Login Credentials & Generated Password
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Used by PG Owner to log into their management dashboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRegeneratePassword}
                disabled={isResettingPassword}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs transition"
                title="Generate fresh password and update Supabase Auth"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isResettingPassword ? "animate-spin" : ""}`}
                />
                <span>Reset / Regenerate</span>
              </button>
            </div>

            {passwordToast && (
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 font-bold text-[11px] flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{passwordToast}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Login ID / Mobile */}
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/90 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Owner Mobile / Login ID
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm select-all">
                    {cleanPhone || pg.contact_phone}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(cleanPhone || pg.contact_phone, "login_id")
                    }
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition"
                    title="Copy Login ID"
                  >
                    {copiedField === "login_id" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Generated Password
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-black text-indigo-900 dark:text-indigo-200 text-sm select-all">
                    {showPassword ? currentPassword : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentPassword, "password")}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition"
                      title="Copy Password"
                    >
                      {copiedField === "password" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Email & Auth Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">Owner Name:</span>
                <strong className="text-slate-900 dark:text-white truncate">
                  {pg.owner_name}
                </strong>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">Email:</span>
                <strong className="text-slate-900 dark:text-white truncate select-all">
                  {pg.contact_email}
                </strong>
              </div>
            </div>
          </div>

          {/* SECTION 2: INITIAL DETAILS ENTERED AT PG ONBOARDING */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full PG Brand & Property Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  PG Name
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white truncate">
                  {pg.name}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  City / Location
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white truncate">
                  {pg.city || "Bengaluru"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Brand Color
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className="w-4 h-4 rounded-md border border-slate-300 shrink-0 shadow-2xs"
                    style={{ backgroundColor: pg.primary_color || "#4F46E5" }}
                  />
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                    {pg.primary_color || "#4F46E5"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Buildings
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {pg.buildings_count} Property Wing
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Total Capacity
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-indigo-500" />
                  {pg.beds_count} Beds Total
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Active Residents
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  {pg.residents_count} Residents
                </p>
              </div>
            </div>

            {/* Custom URL & White-label Portal Link */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  White-label Resident Portal URL
                </span>
                <p className="font-mono text-slate-800 dark:text-slate-200 truncate font-semibold">
                  {portalUrl}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(portalUrl, "portal_url")}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1 transition"
                  title="Copy URL"
                >
                  {copiedField === "portal_url" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy</span>
                </button>
                <a
                  href={`/pg/${pg.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 3: SUBSCRIPTION PLAN & EDIT PLAN */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    Subscription & Renewal Plan
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Expiry date, monthly pricing, and tenant access benefits
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingPlan(!isEditingPlan)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-800 dark:text-white text-[10px] font-extrabold flex items-center gap-1 transition shadow-2xs"
              >
                <Edit3 className="w-3 h-3 text-indigo-600" />
                <span>{isEditingPlan ? "Cancel" : "Edit Plan"}</span>
              </button>
            </div>

            {planSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{planSuccess}</span>
              </div>
            )}

            {planError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-800 dark:text-rose-200 font-bold text-[11px]">
                {planError}
              </div>
            )}

            {/* INLINE EDIT PLAN FORM */}
            {isEditingPlan ? (
              <form
                onSubmit={handleSavePlan}
                className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Plan Expiry Date
                    </label>
                    <input
                      type="date"
                      value={planExpiryDate}
                      onChange={(e) => setPlanExpiryDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Monthly Price (₹)
                    </label>
                    <input
                      type="number"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(Number(e.target.value))}
                      required
                      min={0}
                      step={50}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingPlan(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPlan}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingPlan ? "Saving..." : "Save Plan Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* PLAN DISPLAY SUMMARY */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Plan Expiry
                  </span>
                  <p
                    className={`font-black text-sm mt-0.5 ${
                      isExpired ? "text-rose-600" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {expiryDateObj
                      ? expiryDateObj.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "30 Days"}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isExpired
                        ? "bg-rose-50 text-rose-700"
                        : daysRemaining <= 5
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {isExpired
                      ? "Expired"
                      : `${daysRemaining} days left`}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Plan Price
                  </span>
                  <p className="font-black text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
                    ₹{pg.plan_price || 1999}
                    <span className="text-[10px] font-normal text-slate-400">
                      /month
                    </span>
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-slate-400">
                    Billed via UPI / Bank
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Tier & Onboarding
                  </span>
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">
                    {pg.subscription_tier}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Joined:{" "}
                    {new Date(pg.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Plan Benefits Checklist */}
            <div className="pt-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1.5">
                Active Plan Benefits
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(pg.plan_benefits || [
                  "Full White-label Branding & Custom Domain",
                  "Automated WhatsApp Rent Reminders",
                  "Live Attendance & Gate Pass System",
                  "2-Step Cash & UPI Ledger Settlement",
                  "Multi-Building & Multi-Warden Controls",
                ]).map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                currentStatus === "active"
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
              }`}
            >
              {currentStatus === "active" ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-rose-600" />
                  <span>Suspend PG</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-white" />
                  <span>Activate PG</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleViewAsOwner}
              className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold flex items-center gap-1.5 transition"
            >
              <span>Login as Owner</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
