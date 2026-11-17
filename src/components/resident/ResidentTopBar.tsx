"use client";

import { useState } from "react";
import { User, ChevronDown, LogOut, Shield, Building, BedDouble } from "lucide-react";
import { UserSessionProfile } from "@/types/pg-domain.types";
import { signOutAction, switchDemoPersonaAction } from "@/app/actions/auth";

interface ResidentTopBarProps {
  session: UserSessionProfile;
}

export function ResidentTopBar({ session }: ResidentTopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-emerald-100 dark:border-emerald-950/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          <BedDouble className="h-4 w-4" />
        </div>
        <div>
          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 block leading-tight">
            {session.organization_name || "Zenith Luxury PG"}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
            Resident Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <User className="h-3 w-3" />
          Resident
        </span>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left"
          >
            <div className="h-8 w-8 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              {session.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {session.full_name.split(" ")[0]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {session.full_name}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">{session.email}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Room 101 • Bed 101-A
                  </p>
                </div>

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
                  <form action={() => switchDemoPersonaAction("owner")}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-left"
                    >
                      <Building className="h-3.5 w-3.5 text-indigo-600" />
                      Switch to PG Owner (/owner)
                    </button>
                  </form>
                </div>

                <div className="p-2">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-left"
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
