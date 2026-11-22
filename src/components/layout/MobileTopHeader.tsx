"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Sparkles, Building2, Ticket, PhoneCall, ChevronDown, KeyRound } from "lucide-react";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { UserRole, Building, PlatformBroadcast } from "@/types/schema.types";
import { BuildingSwitcher } from "./BuildingSwitcher";
import { NotificationCenter } from "./NotificationCenter";
import { signOutAction, switchDemoPersonaAction } from "@/app/actions/auth";

interface MobileTopHeaderProps {
  fullName: string;
  role: UserRole;
  pgName?: string | null;
  buildings?: Building[];
  activeBuildingId?: string | null;
  broadcasts?: PlatformBroadcast[];
}

export function MobileTopHeader({
  fullName,
  role,
  pgName,
  buildings = [],
  activeBuildingId,
  broadcasts = [],
}: MobileTopHeaderProps) {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  // Fintech Indigo Exact Badge Styling from Blueprint
  const roleBadgeConfig = {
    super_admin: {
      label: "Super Admin",
      className: "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30",
      dot: "bg-indigo-600",
    },
    owner: {
      label: "PG Owner",
      className: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30",
      dot: "bg-emerald-600",
    },
    admin: {
      label: "Warden / Admin",
      className: "bg-amber-500/20 text-amber-800 border border-amber-500/40",
      dot: "bg-amber-600",
    },
    tenant: {
      label: "Tenant",
      className: "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30",
      dot: "bg-indigo-600",
    },
  };

  const badge = roleBadgeConfig[role] || roleBadgeConfig.tenant;

  // Initials for avatar
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-[40] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 lg:ml-64 lg:px-8 lg:py-3 shadow-xs transition-colors">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2.5">
        {/* Left: Role-Specific Monogram & Brand / Identity */}
        <div className="flex items-center gap-2 min-w-0">
          {role === "owner" && (
            pgName && pgName !== "Shuny Stays Properties" ? (
              <div className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {pgName.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <ShunyStaysEmblem className="w-8 h-8 shadow-xs" />
            )
          )}
          {role === "admin" && (
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {initials}
            </div>
          )}
          {role === "tenant" && (
            <div className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {pgName ? pgName.slice(0, 2).toUpperCase() : "RS"}
            </div>
          )}
          {role === "super_admin" && (
            <ShunyStaysEmblem className="w-8 h-8 shadow-xs" />
          )}

          <div className="min-w-0">
            <div className="text-xs font-extrabold text-[#0F172A] truncate">
              {role === "super_admin" ? (
                <span>
                  Shuny<span className="text-[#4F46E5]">Stays</span> Super Admin
                </span>
              ) : role === "tenant" ? (
                pgName || "Royal Stay PG"
              ) : role === "admin" ? (
                `Warden ${fullName}`
              ) : (
                pgName || "Shuny Stays Properties"
              )}
            </div>
            <div className="text-[10px] font-semibold text-[#64748B] truncate">
              {role === "super_admin"
                ? "SaaS Platform Control"
                : role === "owner"
                ? "Owner • Shuny Stays"
                : role === "admin"
                ? "Scoped Admin • Shuny Stays"
                : `${fullName} • Tenant`}
            </div>
          </div>
        </div>

        {/* Right: Quick Building Switcher / Notification Bell / Role Badge / Sign Out */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* For Owners with buildings: Compact inline switcher if single bar */}
          {role === "owner" && buildings.length > 0 && (
            <div className="hidden sm:block">
              <BuildingSwitcher buildings={buildings} activeBuildingId={activeBuildingId} />
            </div>
          )}

          {/* Top Navigation Notification Bell */}
          <NotificationCenter broadcasts={broadcasts} userRole={role} />

          {/* Account Security & Credentials Settings */}
          <Link
            href={
              role === "super_admin"
                ? "/super-admin?tab=settings"
                : role === "tenant"
                ? "/tenant/settings"
                : "/dashboard/settings"
            }
            title="Account & Login Security Settings"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </Link>

          {/* Role Pill with pulsating live dot */}
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            title="Click to test other role personas"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border transition-all active:scale-95 shadow-xs ${badge.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${badge.dot}`} />
            <span>{badge.label}</span>
          </button>

          {/* Emergency Call Icon for Tenant */}
          {role === "tenant" && (
            <a
              href="tel:+919876543210"
              title="Emergency Helpdesk"
              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Sign Out Action */}
          <button
            onClick={() => signOutAction()}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Building Switcher Sub-bar on Mobile for Owner & Admin */}
      {(role === "owner" || role === "admin") && buildings.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between sm:hidden">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            Scope:
          </span>
          <BuildingSwitcher buildings={buildings} activeBuildingId={activeBuildingId} />
        </div>
      )}

      {/* Demo Persona Switcher Dropdown (Dev Testing) */}
      {showPersonaMenu && (
        <div className="absolute right-3.5 top-14 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
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
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[#F1F5F9] transition-colors text-left"
            >
              <div>
                <span className="font-extrabold text-emerald-700">PG Owner</span>
                <p className="text-[10px] text-[#64748B]">Full business & financial superset</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("owner", { noPg: true });
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[#F1F5F9] transition-colors text-left border border-dashed border-emerald-300 bg-emerald-50/50"
            >
              <div>
                <span className="font-extrabold text-emerald-800">New Owner (First-Time)</span>
                <p className="text-[10px] text-emerald-700">Test /onboarding wizard</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("admin");
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[#F1F5F9] transition-colors text-left"
            >
              <div>
                <span className="font-extrabold text-amber-700">Admin / Warden</span>
                <p className="text-[10px] text-[#64748B]">Assigned building ops & gate passes</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("tenant");
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[#F1F5F9] transition-colors text-left"
            >
              <div>
                <span className="font-extrabold text-[#4F46E5]">Tenant / Student</span>
                <p className="text-[10px] text-[#64748B]">Bed, rent dues, QR gate passes</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowPersonaMenu(false);
                switchDemoPersonaAction("super_admin");
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[#F1F5F9] transition-colors text-left"
            >
              <div>
                <span className="font-extrabold text-purple-700">Super Admin</span>
                <p className="text-[10px] text-[#64748B]">Platform governance & subscriptions</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
