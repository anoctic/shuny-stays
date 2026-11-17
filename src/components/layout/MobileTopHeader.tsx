"use client";

import { useState } from "react";
import { LogOut, UserCircle2, Bell, Shield, KeyRound, Sparkles } from "lucide-react";
import { UserRole, Building } from "@/types/schema.types";
import { BuildingSwitcher } from "./BuildingSwitcher";
import { signOutAction, switchDemoPersonaAction } from "@/app/actions/auth";

interface MobileTopHeaderProps {
  fullName: string;
  role: UserRole;
  pgName?: string | null;
  buildings?: Building[];
  activeBuildingId?: string | null;
}

export function MobileTopHeader({
  fullName,
  role,
  pgName,
  buildings = [],
  activeBuildingId,
}: MobileTopHeaderProps) {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  // Role Badge Styling
  const roleBadgeConfig = {
    super_admin: {
      label: "Super Admin",
      className: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200",
      dot: "bg-purple-500",
    },
    owner: {
      label: "PG Owner",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200",
      dot: "bg-emerald-500",
    },
    admin: {
      label: "Warden / Admin",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200",
      dot: "bg-amber-500",
    },
    tenant: {
      label: "Tenant",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200",
      dot: "bg-blue-500",
    },
  };

  const badge = roleBadgeConfig[role] || roleBadgeConfig.tenant;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: User or PG Info & Building Switcher */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {fullName}
              </h2>
            </div>
            {pgName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate -mt-0.5">
                {pgName}
              </p>
            )}
          </div>
        </div>

        {/* Right: Role Badge & Quick Switcher / Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role Badge */}
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            title="Click to test other role personas"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-transform active:scale-95 shadow-xs ${badge.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${badge.dot}`} />
            <span>{badge.label}</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={() => signOutAction()}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* For Owners: Top Building Switcher Dropdown */}
      {role === "owner" && buildings.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Current Building:</span>
          <BuildingSwitcher buildings={buildings} activeBuildingId={activeBuildingId} />
        </div>
      )}

      {/* Demo Persona Switcher Dropdown (Dev Testing) */}
      {showPersonaMenu && (
        <div className="absolute right-4 top-14 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Switch Demo Role
            </span>
          </div>

          <div className="space-y-1 mt-1">
            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("owner");
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">PG Owner</span>
                <p className="text-[10px] text-slate-400">Full business & financial superset</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("owner", { noPg: true });
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border border-dashed border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/30"
            >
              <div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">New Owner (First-Time)</span>
                <p className="text-[10px] text-slate-500">Test /onboarding wizard</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("admin");
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Admin / Warden</span>
                <p className="text-[10px] text-slate-400">Assigned building ops & mess</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("tenant");
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Tenant (Resident)</span>
                <p className="text-[10px] text-slate-400">Bed, rent dues & mess menu</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("super_admin");
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div>
                <span className="font-semibold text-purple-600 dark:text-purple-400">Super Admin</span>
                <p className="text-[10px] text-slate-400">Platform governance & subscriptions</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
