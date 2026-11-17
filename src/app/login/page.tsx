"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Home,
  Crown,
} from "lucide-react";
import { signInAction, switchDemoPersonaAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25 mb-3 border border-blue-400/30">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Apna<span className="text-blue-500">PG</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-[300px] mx-auto">
          Next-gen Mobile SaaS for PG Brands, Multi-Block Hostels & Residents
        </p>
      </div>

      {/* Main Login Card */}
      <div className="my-auto py-4">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl">
          {/* Method Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-2xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => setAuthMode("email")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === "email"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("phone")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authMode === "phone"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone OTP</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {authMode === "email" ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="owner@stanzaliving.com"
                    className="w-full pl-10 pr-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <a href="#" className="text-[10px] text-blue-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] font-bold text-xs text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? "Signing In..." : "Sign In to Portal"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-3.5 text-center py-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 text-left">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="px-3 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold shrink-0">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    className="flex-1 px-3.5 py-3 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert("Phone OTP integration ready via Supabase Phone Auth.")}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                Get 6-Digit OTP
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400">
                Supports WhatsApp & SMS OTP verification
              </p>
            </div>
          )}

          {/* New PG Owner Registration Link */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400">
              Own a PG or Hostel?{" "}
              <Link
                href="/signup"
                className="text-blue-400 hover:text-blue-300 font-bold hover:underline inline-flex items-center gap-1"
              >
                Register as PG Owner <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Instant Role Persona Switcher for Live Testing */}
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
                  <p className="text-[10px] text-slate-400 truncate">Full business suite</p>
                </div>
              </div>
            </button>

            {/* First-Time Owner */}
            <button
              onClick={() => switchDemoPersonaAction("owner", { noPg: true })}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    New Owner
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">Test /onboarding</p>
                </div>
              </div>
            </button>

            {/* Admin / Warden */}
            <button
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
                  <p className="text-[10px] text-slate-400 truncate">Duty desk & mess</p>
                </div>
              </div>
            </button>

            {/* Tenant */}
            <button
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
                  <p className="text-[10px] text-slate-400 truncate">Bed & rent view</p>
                </div>
              </div>
            </button>
          </div>

          {/* Super Admin */}
          <button
            onClick={() => switchDemoPersonaAction("super_admin")}
            className="w-full mt-2 p-2.5 rounded-2xl bg-purple-950/30 hover:bg-purple-950/50 border border-purple-800/40 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-300">Super Admin Portal</p>
                <p className="text-[10px] text-purple-400/80">Platform governance, subscriptions & audit logs</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-1">
        <p className="text-[11px] text-slate-500">
          ApnaPG Platform • 5-Level Architecture • Supabase PostgreSQL RLS
        </p>
      </div>
    </div>
  );
}
