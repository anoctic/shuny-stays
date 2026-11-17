"use client";

import { useState } from "react";
import {
  Shield,
  ChevronDown,
  LogOut,
  Building,
  User,
  Eye,
  XCircle,
} from "lucide-react";
import { UserSessionProfile } from "@/types/pg-domain.types";
import {
  signOutAction,
  switchDemoPersonaAction,
  exitViewAsOrgAction,
} from "@/app/actions/auth";

interface SuperAdminTopBarProps {
  session: UserSessionProfile;
  viewingOrgName?: string | null;
  viewingOrgId?: string | null;
}

export function SuperAdminTopBar({
  session,
  viewingOrgName,
  viewingOrgId,
}: SuperAdminTopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      {/* Top Bar Header */}
      <header className="h-16 border-b border-purple-100 dark:border-purple-950/60 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              Platform Administration
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Shield className="h-3 w-3" />
              Super Admin
            </span>
          </div>
        </div>

        {/* Right Area: Persona & Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {session.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {session.full_name.split(" ")[0]}
                </span>
                <span className="block text-[10px] text-purple-600 font-semibold">
                  Global Administrator
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
                  </div>

                  {/* Switch Persona */}
                  <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 block mb-1">
                      Switch Role Portal
                    </span>
                    <form action={() => switchDemoPersonaAction("owner")}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-left"
                      >
                        <Building className="h-3.5 w-3.5 text-indigo-600" />
                        Switch to PG Owner (/owner)
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

      {/* View as Organization Banner (Explicitly required by user prompt) */}
      {viewingOrgId && (
        <div className="bg-amber-500 text-slate-950 px-6 py-2.5 flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>
              <strong>VIEWING AS ORGANIZATION:</strong> {viewingOrgName || viewingOrgId} (Tenant ID: {viewingOrgId.slice(0, 13)}...)
            </span>
            <span className="hidden md:inline bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
              Live Org Scope
            </span>
          </div>

          <form action={exitViewAsOrgAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white px-3 py-1 rounded-xl text-[11px] font-bold transition shadow-xs"
            >
              <XCircle className="h-3.5 w-3.5" />
              Exit View As Org
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
