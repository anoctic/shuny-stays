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
    <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen">
      {/* Top Header Branding */}
      <div className="pt-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4F46E5] shadow-xl shadow-indigo-500/25 mb-3 border border-indigo-400/30">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Shuny<span className="text-indigo-400">OS</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-[320px] mx-auto">
          Direct Sign-In Portal for PG Owners, Wardens & Residents
        </p>
      </div>

      {/* Main Login Card — Direct Credential Sign-In Only */}
      <div className="my-auto py-4">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-white">Sign In</h2>
            <p className="text-[11px] text-slate-400">
              Enter your registered mobile number or email and password
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Clean Direct Credential Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Phone Number or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="login"
                  required
                  placeholder="e.g. 98765 43210 or owner@domain.com"
                  className="w-full pl-10 pr-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter your 10-digit mobile number or full email
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">
                  Default format: Shuny@XXXX
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#4F46E5] hover:bg-indigo-500 active:scale-[0.98] font-bold text-xs text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Sign In to Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Instant Role Persona Switcher for Quick Preview */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Demo Personas
            </span>
            <span className="text-[10px] text-slate-500">Instant Preview</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Owner */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("owner")}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    PG Owner
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">98765 43210</p>
                </div>
              </div>
            </button>

            {/* Admin / Warden */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("admin")}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Warden / Admin
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">98765 12345</p>
                </div>
              </div>
            </button>

            {/* Tenant */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("tenant")}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    Tenant App
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">91234 56789</p>
                </div>
              </div>
            </button>

            {/* Super Admin */}
            <button
              type="button"
              onClick={() => switchDemoPersonaAction("super_admin")}
              className="p-2.5 rounded-2xl bg-purple-950/30 hover:bg-purple-950/50 border border-purple-800/40 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-purple-300">Super Admin</p>
                  <p className="text-[10px] text-purple-400/80 truncate">99999 00001</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-1">
        <p className="text-[11px] text-slate-500">
          ShunyOS SaaS • Direct Credentials Authentication • Supabase PostgreSQL RLS
        </p>
      </div>
    </div>
  );
}
