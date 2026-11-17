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
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
          PG
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign in to PG Manager
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Multi-Tenant Paying Guest System & Supabase PostgreSQL Studio
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-6 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:px-10 space-y-6">
          {/* Supabase Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@pgmanager.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition-colors disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In with Supabase"}
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                1-Click Demo Personas:
              </span>
            </div>

            {/* Persona 1: Super Admin */}
            <form action={() => switchDemoPersonaAction("super_admin")}>
              <button
                type="submit"
                className="w-full p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-100/60 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded bg-cyan-600 text-white flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-cyan-950 dark:text-cyan-200 block">
                      Super Admin
                    </span>
                    <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono">
                      Full access • DB Studio • SQL Console • Switch Orgs
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-cyan-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Persona 2: PG Owner */}
            <form action={() => switchDemoPersonaAction("owner")}>
              <button
                type="submit"
                className="w-full p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded bg-indigo-600 text-white flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200 block">
                      PG Owner (Zenith Luxury PG)
                    </span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-mono">
                      Locked to own org • Hostel Ops • No DB Studio
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Persona 3: Resident Tenant */}
            <form action={() => switchDemoPersonaAction("resident")}>
              <button
                type="submit"
                className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded bg-zinc-600 text-white flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-200 block">
                      Resident Tenant (Aditya Sharma)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Locked to own room & bills • No administrative access
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <div className="text-center text-[11px] text-zinc-400 pt-2 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>RLS strictly enforces memberships role boundaries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
