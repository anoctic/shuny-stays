"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  LogOut,
  Shield,
  User,
  Lock,
} from "lucide-react";
import { UserSessionProfile } from "@/types/pg-domain.types";
import { signOutAction, switchDemoPersonaAction } from "@/app/actions/auth";

interface OwnerTopBarProps {
  session: UserSessionProfile;
}

export function OwnerTopBar({ session }: OwnerTopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-indigo-100 dark:border-indigo-950/60 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
          {session.organization_name || "Zenith Luxury PG & Hostels"}
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Building2 className="h-3 w-3" />
          PG Owner
        </span>

        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          <Lock className="h-2.5 w-2.5 text-emerald-500" />
          Membership Locked
        </span>
      </div>

      {/* Right Controls: User Profile & Persona Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left"
          >
            <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {session.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {session.full_name.split(" ")[0]}
              </span>
              <span className="block text-[10px] text-indigo-600 font-semibold">
                Owner Portal
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {session.full_name}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {session.email}
                  </p>
                  <p className="text-[10px] text-indigo-600 font-medium mt-0.5">
                    {session.organization_name}
                  </p>
                </div>

                {/* Switch Persona */}
                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 block mb-1">
                    Switch Role Portal
                  </span>
                  <form action={() => switchDemoPersonaAction("super_admin")}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-left"
                    >
                      <Shield className="h-3.5 w-3.5 text-purple-600" />
                      Switch to Super Admin (/super-admin)
                    </button>
                  </form>
                  <form action={() => switchDemoPersonaAction("resident")}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-left"
                    >
                      <User className="h-3.5 w-3.5 text-emerald-600" />
                      Switch to Resident (/resident)
                    </button>
                  </form>
                </div>

                <div className="p-2">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
