"use client";

import { useState } from "react";
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  Shield,
  Sparkles,
  Home,
  Crown,
} from "lucide-react";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { signInAction, switchDemoPersonaAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signInAction(formData);

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-[#F8FAFC] pb-24 text-[#0F172A]">
      {/* Sticky Translucent Header matching Blueprint */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShunyStaysEmblem className="w-8 h-8 shadow-xs" />
          <div>
            <div className="text-xs font-black tracking-tight">
              <span className="text-[#0F172A]">Shuny</span>
              <span className="text-[#4F46E5] ml-0.5">Stays</span>
            </div>
            <div className="text-[10px] font-semibold text-[#64748B]">
              Direct Sign-In Portal
            </div>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[#4F46E5] text-[10px] font-extrabold uppercase tracking-wider">
          Secure Auth
        </span>
      </header>

      {/* Main Content Body */}
      <div className="p-4 space-y-4 my-auto">
        {/* Welcome Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5">
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A]">Sign In</h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Enter your registered mobile number or email and password
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Clean Direct Credential Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="login"
                  required
                  placeholder="e.g. 98765 43210 or name@domain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F1F5F9] border border-slate-200 font-bold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter your 10-digit mobile number or full email
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">
                  Default format: Shuny@XXXX
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F1F5F9] border border-slate-200 font-bold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.98] font-extrabold text-xs text-white shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 mt-1"
            >
              {isLoading ? "Authenticating..." : "Sign In to Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 1-Click Demo Personas for Quick Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Personas
            </span>
            <span className="text-[10px] text-slate-400">Instant Preview</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Owner */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("owner")}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left shadow-xs transition group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-extrabold text-[#0F172A] group-hover:text-emerald-600 transition-colors">
                    PG Owner
                  </p>
                  <p className="text-[10px] text-slate-400 tabular-nums">98765 43210</p>
                </div>
              </div>
            </button>

            {/* Admin / Warden */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("admin")}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left shadow-xs transition group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-extrabold text-[#0F172A] group-hover:text-amber-700 transition-colors">
                    Warden Desk
                  </p>
                  <p className="text-[10px] text-slate-400 tabular-nums">98765 12345</p>
                </div>
              </div>
            </button>

            {/* Tenant */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("tenant")}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left shadow-xs transition group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-200/80 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                    Tenant App
                  </p>
                  <p className="text-[10px] text-slate-400 tabular-nums">91234 56789</p>
                </div>
              </div>
            </button>

            {/* Super Admin */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("super_admin")}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left shadow-xs transition group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-extrabold text-[#0F172A] group-hover:text-purple-600 transition-colors">
                    Super Admin
                  </p>
                  <p className="text-[10px] text-slate-400 tabular-nums">99999 00001</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Brand Footer */}
      <footer className="text-center pt-2 pb-3 border-t border-slate-200/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-500 text-[10.5px] font-semibold shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}
