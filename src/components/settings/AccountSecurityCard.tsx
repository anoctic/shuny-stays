"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { UserRole } from "@/types/schema.types";

interface AccountSecurityCardProps {
  currentEmail?: string | null;
  currentPhone?: string | null;
  role?: UserRole | string;
  className?: string;
}

export function AccountSecurityCard({
  currentEmail,
  currentPhone,
  role = "tenant",
  className = "",
}: AccountSecurityCardProps) {
  const router = useRouter();

  // Compute clean display login ID
  const initialDisplayLoginId = useMemo(() => {
    if (currentEmail && currentEmail.endsWith("@login.shunystays.app")) {
      const phoneDigits = currentEmail.replace("@login.shunystays.app", "").slice(-10);
      return phoneDigits;
    }
    if (currentPhone && currentPhone.replace(/\D/g, "").length >= 10) {
      return currentPhone.replace(/\D/g, "").slice(-10);
    }
    return currentEmail || "user@shunystays.app";
  }, [currentEmail, currentPhone]);

  const [activeLoginId, setActiveLoginId] = useState(initialDisplayLoginId);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newLoginIdentifier, setNewLoginIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roleLabelConfig: Record<string, { label: string; badgeClass: string }> = {
    super_admin: {
      label: "Super Admin",
      badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    },
    owner: {
      label: "PG Owner",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    },
    admin: {
      label: "Warden / Admin",
      badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    },
    tenant: {
      label: "Resident Tenant",
      badgeClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    },
  };

  const roleMeta = roleLabelConfig[role] || roleLabelConfig.tenant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validations
    if (!currentPassword.trim()) {
      setError("Please enter your current password to authorize changes.");
      return;
    }

    if (!newLoginIdentifier.trim() && !newPassword.trim()) {
      setError(
        "Please enter a new login email / mobile number or a new password to make an update."
      );
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation password do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newLoginIdentifier: newLoginIdentifier.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update security credentials. Please try again.");
        return;
      }

      // Successful update
      setSuccess(data.message || "Account security credentials updated successfully!");
      if (data.loginId) {
        setActiveLoginId(data.loginId);
      }

      // Reset sensitive password inputs
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNewLoginIdentifier("");

      // Trigger server revalidation
      router.refresh();
    } catch (err: any) {
      console.error("Credentials update client error:", err);
      setError("Network or server connection failed. Please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* Header & Role Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              Account & Login Security
            </h2>
            <p className="text-[11px] text-slate-400">
              Update your registered sign-in phone number, email address, or password.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${roleMeta.badgeClass}`}
          >
            {roleMeta.label}
          </span>
        </div>
      </div>

      {/* Current Active Sign-in ID Banner */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {activeLoginId.includes("@") ? (
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Active Sign-In Identifier
            </span>
            <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200 truncate block">
              {activeLoginId}
            </span>
          </div>
        </div>
        <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
        </span>
      </div>

      {/* Toast / Banner Feedback */}
      {success && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        {/* Current Password Field */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>
              Current Password <span className="text-rose-500">*</span>
            </span>
            <span className="text-[10px] font-normal text-slate-400">Required to authorize change</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* New Login Identifier (Email or Phone) */}
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>New Login Identifier (Optional)</span>
            <span className="text-[10px] font-normal text-slate-400">10-Digit Mobile or Email</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={newLoginIdentifier}
              onChange={(e) => setNewLoginIdentifier(e.target.value)}
              placeholder="e.g. 9876543210 or yourname@gmail.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
          <p className="text-[10px] text-slate-400 px-0.5">
            Leave blank if you only wish to change your password. 10-digit mobile numbers enable 1-tap phone sign-in.
          </p>
        </div>

        {/* New Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
              New Password (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={!newPassword.trim()}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 active:scale-[0.99] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Update Account Security</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
