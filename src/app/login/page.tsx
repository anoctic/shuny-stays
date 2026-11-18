"use client";

export const runtime = "edge";

import { useState } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { signInAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-4 py-8 text-[#0F172A]">
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Top Header matching Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-2.5">
            <ShunyStaysEmblem className="w-9 h-9 shadow-xs" />
            <div className="text-left">
              <div className="text-sm font-black tracking-tight">
                <span className="text-[#0F172A]">Shuny</span>
                <span className="text-[#4F46E5] ml-0.5">Stays</span>
              </div>
              <div className="text-[11px] font-semibold text-[#64748B]">
                Direct Sign-In Portal
              </div>
            </div>
          </div>
        </div>

        {/* Clean Sign In Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
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

          {/* Clean Credential Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#F1F5F9] border border-slate-200 font-bold text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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

        {/* Subtle Brand Footer */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-500 text-[10.5px] font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
            <span>
              Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
