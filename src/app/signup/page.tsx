"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, User, Mail, Lock, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { signUpOwnerAction } from "@/app/actions/auth";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await signUpOwnerAction(formData);

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else if (res?.success) {
      setSuccessMsg(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen">
      {/* Top Header */}
      <div className="pt-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/25 mb-3 border border-emerald-400/30">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Join as <span className="text-emerald-400">PG Owner</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-[320px] mx-auto">
          Start managing your PG brands, multi-block buildings, auto-generated beds, and rent collection.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="my-auto py-4">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-emerald-200">{successMsg}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                Proceed to Login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder="Rajesh Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="rajesh.sharma@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Role Indicator Note */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2.5 text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-200 leading-snug">
                  Signing up assigns you the <span className="font-bold text-white">Owner</span> role with 100% full business, financial and operational authority.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] font-bold text-xs text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? "Creating Owner Account..." : "Create Owner Account & Setup PG"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline inline-flex items-center gap-1"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-1">
        <p className="text-[11px] text-slate-500">
          ShunyOS SaaS • 5-Level Multi-Tenant Architecture • Supabase PostgreSQL RLS
        </p>
      </div>
    </div>
  );
}
