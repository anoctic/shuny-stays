"use client";

import { useState } from "react";
import { ShieldCheck, Building2, User, KeyRound, Sparkles, ArrowRight, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-500/20">
          PG
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          PG Manager & SaaS Platform
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Role-isolated portals with Supabase PostgreSQL RLS enforcement
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 shadow-xs border border-zinc-200 dark:border-zinc-800 rounded-3xl sm:px-8 space-y-6">
          {/* Supabase Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@pgmanager.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In to Portal"}
            </button>
          </form>

          {/* 1-Click Role Switcher */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              1-Click Role Portals:
            </span>

            {/* Super Admin */}
            <form action={() => switchDemoPersonaAction("super_admin")}>
              <button
                type="submit"
                className="w-full p-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100/60 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-purple-950 dark:text-purple-200 block">
                      Super Admin Portal (/super-admin)
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-400">
                      Platform Overview • Subscriptions • DB Studio • View As Org
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Owner */}
            <form action={() => switchDemoPersonaAction("owner")}>
              <button
                type="submit"
                className="w-full p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100/60 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200 block">
                      PG Owner Portal (/owner)
                    </span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400">
                      Zenith Luxury PG • Rooms & Beds • Occupancy • Rent Ledger
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Resident */}
            <form action={() => switchDemoPersonaAction("resident")}>
              <button
                type="submit"
                className="w-full p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200 block">
                      Resident Portal (/resident)
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Aditya Sharma • My Bed 101-A • Invoices • Support Tickets
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <div className="text-center text-[10px] text-zinc-400 pt-1 flex items-center justify-center gap-1 font-mono">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>RLS strictly enforced on memberships & user_id</span>
          </div>
        </div>
      </div>
    </div>
  );
}
