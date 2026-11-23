# Shuny Stays - Complete UI Codebase Bundle

================================================================================
// FILE: src/components/layout/DesktopSidebar.tsx
================================================================================
`tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  BedDouble,
  ClipboardCheck,
  IndianRupee,
  ShieldCheck,
  Ticket,
  Utensils,
  Home,
  MessageSquareWarning,
  Building2,
  Database,
  Activity,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  Users,
  ChevronRight,
  LucideIcon,
  Crown,
  Lock,
} from "lucide-react";
import { UserRole, Building } from "@/types/schema.types";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { signOutAction, switchDemoPersonaAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string | null;
  isActive: boolean;
}

interface DesktopSidebarProps {
  role: UserRole;
  fullName: string;
  pgName?: string | null;
  buildings?: Building[];
  activeBuildingId?: string | null;
  openComplaintsCount?: number;
  pendingPassesCount?: number;
  pendingDuesCount?: number;
}

export function DesktopSidebar({
  role,
  fullName,
  pgName,
  buildings = [],
  activeBuildingId,
  openComplaintsCount = 0,
  pendingPassesCount = 0,
  pendingDuesCount = 0,
}: DesktopSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTabOverride, setActiveTabOverride] = useState<string | null>(null);

  useEffect(() => {
    setActiveTabOverride(null);
  }, [pathname, searchParams]);

  const superAdminCurrentTab =
    activeTabOverride || searchParams?.get("tab") || "overview";

  const handleSuperAdminClick = (e: React.MouseEvent, tabId: string, href: string) => {
    if (role === "super_admin") {
      e.preventDefault();
      setActiveTabOverride(tabId);
      window.dispatchEvent(
        new CustomEvent("superadmin:switchtab", { detail: { tab: tabId } })
      );
      if (pathname === "/super-admin") {
        router.push(href, { scroll: false });
      } else {
        router.push(href);
      }
    }
  };

  // Nav configurations per role
  let navItems: SidebarItem[] = [];

  if (role === "super_admin") {
    navItems = [
      {
        id: "overview",
        label: "Master Overview",
        href: "/super-admin?tab=overview",
        icon: Building2,
        isActive: pathname === "/super-admin" && superAdminCurrentTab === "overview",
      },
      {
        id: "organizations",
        label: "Hosted PG Brands",
        href: "/super-admin?tab=organizations",
        icon: Crown,
        isActive:
          (pathname === "/super-admin" && superAdminCurrentTab === "organizations") ||
          pathname.startsWith("/super-admin/organizations"),
      },
      {
        id: "billing",
        label: "PG Subscriptions & Plans",
        href: "/super-admin?tab=billing",
        icon: CreditCard,
        isActive:
          (pathname === "/super-admin" && superAdminCurrentTab === "billing") ||
          pathname.startsWith("/super-admin/subscriptions"),
      },
      {
        id: "database",
        label: "Database & Tables",
        href: "/super-admin/database",
        icon: Database,
        isActive: pathname.startsWith("/super-admin/database"),
      },
      {
        id: "health",
        label: "System Health & Ops",
        href: "/super-admin/health",
        icon: Activity,
        isActive: pathname.startsWith("/super-admin/health"),
      },
      {
        id: "settings",
        label: "Platform & Bank Settings",
        href: "/super-admin?tab=settings",
        icon: Settings,
        isActive:
          (pathname === "/super-admin" && superAdminCurrentTab === "settings") ||
          pathname.startsWith("/super-admin/settings"),
      },
    ];
  } else if (role === "owner") {
    navItems = [
      {
        id: "rooms",
        label: "Rooms & Beds",
        href: "/dashboard/rooms",
        icon: BedDouble,
        isActive: pathname === "/dashboard" || pathname.startsWith("/dashboard/rooms"),
      },
      {
        id: "attendance",
        label: "Resident Attendance",
        href: "/dashboard/attendance",
        icon: ClipboardCheck,
        isActive: pathname.startsWith("/dashboard/attendance"),
      },
      {
        id: "meal_poll",
        label: "Meal Poll & Wastage",
        href: "/dashboard/meal-poll",
        icon: Utensils,
        isActive: pathname.startsWith("/dashboard/meal-poll"),
      },
      {
        id: "ledger",
        label: "Rent Ledger & Finance",
        href: "/dashboard/ledger",
        icon: IndianRupee,
        isActive:
          pathname.startsWith("/dashboard/ledger") ||
          pathname.startsWith("/dashboard/finance"),
        badge: pendingDuesCount > 0 ? `${pendingDuesCount} Due` : null,
      },
      {
        id: "passes",
        label: "Gate Passes",
        href: "/dashboard/passes",
        icon: Ticket,
        isActive: pathname.startsWith("/dashboard/passes"),
        badge: pendingPassesCount > 0 ? pendingPassesCount : null,
      },
      {
        id: "complaints",
        label: "Complaints & Support",
        href: "/dashboard/complaints",
        icon: MessageSquareWarning,
        isActive: pathname.startsWith("/dashboard/complaints"),
        badge: openComplaintsCount > 0 ? openComplaintsCount : null,
      },
      {
        id: "staff",
        label: "Wardens & Staff",
        href: "/dashboard/staff",
        icon: ShieldCheck,
        isActive:
          pathname.startsWith("/dashboard/staff") ||
          pathname.startsWith("/dashboard/ops"),
      },
      {
        id: "settings",
        label: "PG Branding & Settings",
        href: "/dashboard/settings",
        icon: Settings,
        isActive: pathname.startsWith("/dashboard/settings"),
      },
    ];
  } else if (role === "admin") {
    navItems = [
      {
        id: "rooms",
        label: "Rooms & Beds",
        href: "/dashboard/rooms",
        icon: BedDouble,
        isActive: pathname === "/dashboard" || pathname.startsWith("/dashboard/rooms"),
      },
      {
        id: "attendance",
        label: "Mark Attendance",
        href: "/dashboard/attendance",
        icon: ClipboardCheck,
        isActive: pathname.startsWith("/dashboard/attendance"),
      },
      {
        id: "meal_poll",
        label: "Lunch Headcount",
        href: "/dashboard/meal-poll",
        icon: Utensils,
        isActive: pathname.startsWith("/dashboard/meal-poll"),
      },
      {
        id: "passes",
        label: "Issue Gate Passes",
        href: "/dashboard/passes",
        icon: Ticket,
        isActive: pathname.startsWith("/dashboard/passes"),
        badge: pendingPassesCount > 0 ? pendingPassesCount : null,
      },
      {
        id: "cash_rent",
        label: "Cash Rent Collection",
        href: "/dashboard/ledger",
        icon: IndianRupee,
        isActive: pathname.startsWith("/dashboard/ledger"),
      },
      {
        id: "complaints",
        label: "Tenant Complaints",
        href: "/dashboard/complaints",
        icon: MessageSquareWarning,
        isActive: pathname.startsWith("/dashboard/complaints"),
        badge: openComplaintsCount > 0 ? openComplaintsCount : null,
      },
      {
        id: "settings",
        label: "Warden Settings",
        href: "/dashboard/settings",
        icon: Settings,
        isActive: pathname.startsWith("/dashboard/settings"),
      },
    ];
  } else {
    // Tenant Portal
    navItems = [
      {
        id: "home",
        label: "Resident Desk",
        href: "/tenant",
        icon: Home,
        isActive: pathname === "/tenant",
      },
      {
        id: "mess",
        label: "Mess & Lunch Poll",
        href: "/tenant/mess",
        icon: Utensils,
        isActive: pathname.startsWith("/tenant/mess"),
      },
      {
        id: "dues",
        label: "Rent & Invoices",
        href: "/tenant/dues",
        icon: IndianRupee,
        isActive: pathname.startsWith("/tenant/dues"),
      },
      {
        id: "passes",
        label: "Gate Passes",
        href: "/tenant/passes",
        icon: Ticket,
        isActive: pathname.startsWith("/tenant/passes"),
      },
      {
        id: "complaints",
        label: "Raise Complaint",
        href: "/tenant/complaints",
        icon: MessageSquareWarning,
        isActive: pathname.startsWith("/tenant/complaints"),
      },
      {
        id: "settings",
        label: "Account & KYC",
        href: "/tenant/settings",
        icon: Settings,
        isActive: pathname.startsWith("/tenant/settings"),
      },
    ];
  }

  const roleLabels = {
    super_admin: "Super Admin",
    owner: "PG Owner",
    admin: "PG Warden",
    tenant: "Resident Tenant",
  };

  const roleColors = {
    super_admin: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    owner: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    admin: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40",
    tenant: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  };

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors"
      aria-label="Desktop Sidebar Navigation"
    >
      {/* 1. BRAND HEADER */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
        <Link href={role === "super_admin" ? "/super-admin" : role === "tenant" ? "/tenant" : "/dashboard"} className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            {role === "super_admin" ? (
              <Crown className="w-5 h-5 text-amber-300" />
            ) : pgName && pgName !== "Shuny Stays Properties" ? (
              pgName.slice(0, 2).toUpperCase()
            ) : (
              <ShunyStaysEmblem className="w-7 h-7" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {role === "super_admin" ? (
                <span>Shuny<span className="text-indigo-600">Stays</span> Admin</span>
              ) : (
                pgName || "Shuny Stays PG"
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border", roleColors[role])}>
                {roleLabels[role]}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* 2. NAVIGATION LINKS */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto phone-scroll">
        <div className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400 px-3 pb-1">
          Menu & Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (role === "super_admin") {
                  handleSuperAdminClick(e, item.id, item.href);
                }
              }}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer",
                item.isActive
                  ? "bg-indigo-600 text-white shadow-xs font-black shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                    item.isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge != null && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[9px] font-black",
                    item.isActive
                      ? "bg-white/20 text-white"
                      : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. USER PROFILE & LOGOUT FOOTER */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="min-w-0 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-[11px] shrink-0">
              {fullName ? fullName[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                {fullName}
              </div>
              <div className="text-[9.5px] text-slate-400 truncate">
                {roleLabels[role]}
              </div>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

`

================================================================================
// FILE: src/components/layout/MobileTopHeader.tsx
================================================================================
`tsx
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

`

================================================================================
// FILE: src/components/layout/MobileBottomNav.tsx
================================================================================
`tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  BedDouble,
  ClipboardCheck,
  IndianRupee,
  ShieldCheck,
  Ticket,
  Banknote,
  Home,
  QrCode,
  MessageSquareWarning,
  IdCard,
  Activity,
  Building2,
  Megaphone,
  CreditCard,
  Utensils,
  LucideIcon,
} from "lucide-react";
import { UserRole } from "@/types/schema.types";
import { cn } from "@/lib/utils";

interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  badge?: number | null;
}

interface MobileBottomNavProps {
  role: UserRole;
  openComplaintsCount?: number;
  pendingDuesCount?: number;
  pendingPassesCount?: number;
}

function MobileBottomNavInner({
  role,
  openComplaintsCount = 0,
  pendingDuesCount = 0,
  pendingPassesCount = 1,
}: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTabOverride, setActiveTabOverride] = useState<string | null>(null);

  // Sync activeTabOverride with route changes
  useEffect(() => {
    setActiveTabOverride(null);
  }, [pathname, searchParams]);

  // Listen to external tab switch events from SuperAdminDashboard
  useEffect(() => {
    const handleCustomTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string }>;
      if (customEvent.detail?.tab) {
        setActiveTabOverride(customEvent.detail.tab);
      }
    };

    window.addEventListener("superadmin:switchtab", handleCustomTabSwitch);
    return () => {
      window.removeEventListener("superadmin:switchtab", handleCustomTabSwitch);
    };
  }, []);

  const superAdminCurrentTab =
    activeTabOverride || searchParams?.get("tab") || "overview";

  const handleTabClick = (e: React.MouseEvent, tab: NavTab) => {
    if (role === "super_admin") {
      e.preventDefault();
      setActiveTabOverride(tab.id);
      window.dispatchEvent(
        new CustomEvent("superadmin:switchtab", { detail: { tab: tab.id } })
      );
      if (pathname === "/super-admin") {
        router.push(tab.href, { scroll: false });
      } else {
        router.push(tab.href);
      }
    }
  };

  // If on onboarding or standalone auth pages, hide bottom nav
  if (pathname === "/onboarding" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  // Exact 4-tab configurations per role from Shuny Stays Blueprint
  const ownerTabs: NavTab[] = [
    {
      id: "rooms",
      label: "Rooms",
      href: "/dashboard/rooms",
      icon: BedDouble,
      isActive: pathname === "/dashboard" || pathname.startsWith("/dashboard/rooms"),
    },
    {
      id: "attendance",
      label: "Attendance",
      href: "/dashboard/attendance",
      icon: ClipboardCheck,
      isActive: pathname.startsWith("/dashboard/attendance"),
    },
    {
      id: "meal_poll",
      label: "Meal Poll",
      href: "/dashboard/meal-poll",
      icon: Utensils,
      isActive: pathname.startsWith("/dashboard/meal-poll"),
    },
    {
      id: "ledger",
      label: "Ledger",
      href: "/dashboard/ledger",
      icon: IndianRupee,
      isActive: pathname.startsWith("/dashboard/ledger") || pathname.startsWith("/dashboard/finance"),
    },
    {
      id: "ops_staff",
      label: "Ops & Staff",
      href: "/dashboard/ops",
      icon: ShieldCheck,
      isActive:
        pathname.startsWith("/dashboard/ops") ||
        pathname.startsWith("/dashboard/staff") ||
        pathname.startsWith("/dashboard/tenants") ||
        pathname.startsWith("/dashboard/complaints") ||
        pathname.startsWith("/dashboard/passes"),
      badge: pendingPassesCount > 0 ? pendingPassesCount : null,
    },
  ];

  const adminTabs: NavTab[] = [
    {
      id: "rooms",
      label: "Rooms",
      href: "/dashboard/rooms",
      icon: BedDouble,
      isActive: pathname === "/dashboard" || pathname.startsWith("/dashboard/rooms"),
    },
    {
      id: "attendance",
      label: "Attendance",
      href: "/dashboard/attendance",
      icon: ClipboardCheck,
      isActive: pathname.startsWith("/dashboard/attendance"),
    },
    {
      id: "meal_poll",
      label: "Meal Poll",
      href: "/dashboard/meal-poll",
      icon: Utensils,
      isActive: pathname.startsWith("/dashboard/meal-poll"),
    },
    {
      id: "passes_help",
      label: "Passes & Help",
      href: "/dashboard/ops",
      icon: Ticket,
      isActive:
        pathname.startsWith("/dashboard/ops") ||
        pathname.startsWith("/dashboard/staff") ||
        pathname.startsWith("/dashboard/passes") ||
        pathname.startsWith("/dashboard/complaints"),
      badge: pendingPassesCount > 0 ? pendingPassesCount : null,
    },
    {
      id: "cash_rent",
      label: "Cash Rent",
      href: "/dashboard/ledger",
      icon: Banknote,
      isActive: pathname.startsWith("/dashboard/ledger") || pathname.startsWith("/dashboard/finance"),
    },
  ];

  const tenantTabs: NavTab[] = [
    {
      id: "home",
      label: "Home",
      href: "/tenant",
      icon: Home,
      isActive: pathname === "/tenant",
    },
    {
      id: "pay_rent",
      label: "Pay Rent",
      href: "/tenant/dues",
      icon: QrCode,
      isActive: pathname.startsWith("/tenant/dues"),
      badge: pendingDuesCount > 0 ? pendingDuesCount : null,
    },
    {
      id: "complaints",
      label: "Complaints",
      href: "/tenant/complaints",
      icon: MessageSquareWarning,
      isActive: pathname.startsWith("/tenant/complaints"),
      badge: openComplaintsCount > 0 ? openComplaintsCount : null,
    },
    {
      id: "id_notice",
      label: "ID & Notice",
      href: "/tenant/passes",
      icon: IdCard,
      isActive: pathname.startsWith("/tenant/passes"),
    },
  ];

  const superAdminTabs: NavTab[] = [
    {
      id: "overview",
      label: "Overview",
      href: "/super-admin?tab=overview",
      icon: Activity,
      isActive:
        pathname === "/super-admin" &&
        (!superAdminCurrentTab || superAdminCurrentTab === "overview"),
    },
    {
      id: "pgs",
      label: "PGs",
      href: "/super-admin?tab=pgs",
      icon: Building2,
      isActive:
        (pathname === "/super-admin" && superAdminCurrentTab === "pgs") ||
        pathname.startsWith("/super-admin/organizations"),
    },
    {
      id: "broadcast",
      label: "Broadcast",
      href: "/super-admin?tab=broadcast",
      icon: Megaphone,
      isActive:
        pathname === "/super-admin" && superAdminCurrentTab === "broadcast",
    },
    {
      id: "billing",
      label: "Billing",
      href: "/super-admin?tab=billing",
      icon: CreditCard,
      isActive:
        (pathname === "/super-admin" && superAdminCurrentTab === "billing") ||
        pathname.startsWith("/super-admin/subscriptions"),
    },
    {
      id: "settings",
      label: "Security",
      href: "/super-admin?tab=settings",
      icon: ShieldCheck,
      isActive:
        (pathname === "/super-admin" && superAdminCurrentTab === "settings") ||
        pathname.startsWith("/super-admin/settings"),
    },
  ];

  const tabs: NavTab[] =
    role === "owner"
      ? ownerTabs
      : role === "admin"
      ? adminTabs
      : role === "super_admin"
      ? superAdminTabs
      : tenantTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-1 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all select-none lg:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      <div
        className={cn(
          "grid items-center",
          tabs.length === 5 ? "grid-cols-5" : "grid-cols-4"
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleTabClick(e, tab)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer",
                tab.isActive
                  ? "text-[#4F46E5] font-extrabold"
                  : "text-[#64748B] hover:text-[#0F172A] font-semibold"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-150",
                    tab.isActive ? "stroke-[2.5] scale-105" : "stroke-[1.8]"
                  )}
                />
                {tab.badge != null && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full text-[9px] font-black bg-rose-500 text-white flex items-center justify-center shadow-xs animate-in zoom-in-75">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] tracking-tight leading-none text-center">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Subtle Mobile Home Bar Indicator */}
      <div className="w-28 h-1 mx-auto mt-1 rounded-full bg-slate-300/60 pointer-events-none" />
    </nav>
  );
}

export function MobileBottomNav(props: MobileBottomNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner {...props} />
    </Suspense>
  );
}

`

================================================================================
// FILE: src/components/pg/RoomsExplorer.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
  FileSpreadsheet,
  Layers,
  Plus,
  Lock,
  ChevronRight,
  UserPlus,
  Trash2,
} from "lucide-react";
import { BuildingItem, FloorItem, RoomItem, BedItem } from "@/lib/data/rooms";
import { BedProfileSheet } from "./BedProfileSheet";
import {
  WalkInSheet,
  AutoBuildingSheet,
  AddFloorSheet,
  AddRoomSheet,
  AddBedSheet,
  CsvImportModal,
} from "./RoomsSheets";
import {
  deleteBuildingAction,
  deleteFloorAction,
  deleteRoomAction,
  deleteBedAction,
} from "@/app/actions/rooms-and-ops";

interface RoomsExplorerProps {
  initialBuildings: BuildingItem[];
  userRole: "owner" | "admin" | "super_admin" | "tenant";
  activePasses?: { tenantId: string; passType: "day_pass" | "night_pass"; status: string }[];
}

export function RoomsExplorer({
  initialBuildings,
  userRole,
  activePasses = [],
}: RoomsExplorerProps) {
  const router = useRouter();
  useRealtimeSync(["rooms", "beds", "tenants", "payments", "complaints", "pgs"]);

  const isOwner = userRole === "owner" || userRole === "super_admin";
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [selectedFloorByBuilding, setSelectedFloorByBuilding] = useState<Record<string, number>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Active Bottom Sheet Targets
  const [activeProfileBed, setActiveProfileBed] = useState<{
    building: BuildingItem;
    floor: FloorItem;
    floorIdx: number;
    room: RoomItem;
    bed: BedItem;
    bedIdx: number;
  } | null>(null);

  const [activeWalkInBed, setActiveWalkInBed] = useState<{
    building: BuildingItem;
    floor: FloorItem;
    floorIdx: number;
    room: RoomItem;
    bedIdx: number;
  } | null>(null);

  const [isAutoBuildingOpen, setIsAutoBuildingOpen] = useState(false);
  const [addFloorBuilding, setAddFloorBuilding] = useState<BuildingItem | null>(null);
  const [addRoomTarget, setAddRoomTarget] = useState<{ building: BuildingItem; floorIdx: number } | null>(null);
  const [addBedTarget, setAddBedTarget] = useState<{ building: BuildingItem; floorIdx: number; roomId: string } | null>(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  // Scoped buildings (Admins see their assigned buildings, Owners see all)
  const visibleBuildings =
    selectedBuildingId === "all"
      ? initialBuildings
      : initialBuildings.filter((b) => b.id === selectedBuildingId);

  // Stats calculation
  let totalBeds = 0;
  let occupiedBeds = 0;
  let expectedRent = 0;
  let collectedRent = 0;

  visibleBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          totalBeds++;
          if (bed.occupied) {
            occupiedBeds++;
            expectedRent += r.rent;
            if (bed.tenant?.rentPaid) {
              collectedRent += r.rent;
            }
          }
        });
      });
    });
  });
  const vacantBeds = totalBeds - occupiedBeds;

  const getActivePassForTenant = (tenantId?: string) => {
    if (!tenantId) return null;
    return activePasses.find((p) => p.tenantId === tenantId) || null;
  };

  // --- DELETE HANDLERS (OWNER ONLY) ---
  const handleDeleteBuilding = async (buildingId: string, buildingName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete building "${buildingName}"? All vacant floors, rooms, and beds inside it will be permanently deleted.`
      )
    ) {
      return;
    }
    setDeletingId(buildingId);
    try {
      const res = await deleteBuildingAction(buildingId);
      if ("error" in res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteFloor = async (floorId: string, floorName: string) => {
    if (!window.confirm(`Are you sure you want to delete floor "${floorName}"?`)) {
      return;
    }
    setDeletingId(floorId);
    try {
      const res = await deleteFloorAction(floorId);
      if ("error" in res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomNumber: string | number) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}?`)) {
      return;
    }
    setDeletingId(roomId);
    try {
      const res = await deleteRoomAction(roomId);
      if ("error" in res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteBed = async (bedId: string, bedLabel: string) => {
    if (!window.confirm(`Are you sure you want to delete Bed ${bedLabel}?`)) {
      return;
    }
    setDeletingId(bedId);
    try {
      const res = await deleteBedAction(bedId);
      if ("error" in res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Multi-Column Responsive KPI Strip (2 cols mobile, 4 cols desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Live Occupancy
          </div>
          <div className="text-sm md:text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
            {occupiedBeds}/{totalBeds} Beds
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-0.5">
            {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}% Occupied
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-emerald-300 transition">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Vacant Beds
          </div>
          <div className="text-sm md:text-base font-extrabold text-emerald-600 tabular-nums mt-0.5">
            {vacantBeds} Beds Vacant
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            Ready for Walk-In
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-indigo-300 transition">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Rent Collected
          </div>
          <div className="text-sm md:text-base font-extrabold text-indigo-600 tabular-nums mt-0.5">
            ₹{collectedRent.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-bold text-indigo-500 mt-0.5">
            This Month Live
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Expected Pipeline
          </div>
          <div className="text-sm md:text-base font-extrabold text-slate-800 tabular-nums mt-0.5">
            ₹{expectedRent.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Pending: ₹{(expectedRent - collectedRent).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Quick Action Strip (Bldg Builder & CSV) - Owner Only */}
      {isOwner && (
        <div className="flex items-center justify-between gap-2 px-0.5">
          <span className="text-[11px] font-extrabold text-slate-700">Property Blocks</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoBuildingOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10.5px] font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Block</span>
            </button>
            <button
              onClick={() => setIsCsvImportOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10.5px] font-extrabold flex items-center gap-1 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Horizontal Building Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        <button
          onClick={() => setSelectedBuildingId("all")}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 border transition ${
            selectedBuildingId === "all"
              ? "bg-indigo-600 text-white border-transparent shadow-xs"
              : "bg-white text-slate-800 border-slate-200"
          }`}
        >
          All ({initialBuildings.length})
        </button>

        {initialBuildings.map((b) => {
          const selected = selectedBuildingId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBuildingId(b.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 flex items-center gap-1 border transition ${
                selected
                  ? "bg-indigo-600 text-white border-transparent shadow-xs"
                  : "bg-white text-slate-800 border-slate-200"
              }`}
            >
              <span>{b.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Buildings -> Floors -> Rooms -> Beds */}
      <div className="space-y-3.5">
        {visibleBuildings.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">No Buildings Added Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create your first building block with automated floors, rooms, and beds to start managing your PG.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setIsAutoBuildingOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Building Block</span>
              </button>
            )}
          </div>
        ) : (
          visibleBuildings.map((building) => {
            const floorIdx = Math.min(
              selectedFloorByBuilding[building.id] || 0,
              Math.max(0, building.floors.length - 1)
            );
            const activeFloor = building.floors[floorIdx];

            return (
              <section
                key={building.id}
                className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Building Header */}
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-extrabold truncate">{building.name}</h3>
                      <span className="px-1.5 py-0.5 rounded bg-white/15 text-[9px] font-extrabold uppercase">
                        {building.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 truncate mt-0.5">
                      Shuny Stays Managed • {building.floors.length} Floors
                    </p>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setAddFloorBuilding(building)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition"
                      >
                        <Layers className="w-3 h-3" />
                        <span>+ Add Floor</span>
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === building.id}
                        onClick={() => handleDeleteBuilding(building.id, building.name)}
                        className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                        title="Delete Building Block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Floor Tabs */}
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto">
                  {building.floors.map((fl, idx) => (
                    <button
                      key={fl.id}
                      onClick={() =>
                        setSelectedFloorByBuilding({
                          ...selectedFloorByBuilding,
                          [building.id]: idx,
                        })
                      }
                      className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold shrink-0 transition ${
                        floorIdx === idx
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {fl.name} ({fl.rooms.length})
                    </button>
                  ))}
                </div>

                {/* Active Floor Rooms & Beds */}
                {activeFloor ? (
                  <div className="p-3.5 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-xs font-extrabold text-slate-800">
                        {activeFloor.name} Rooms
                      </span>
                      {isOwner && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setAddRoomTarget({
                                building,
                                floorIdx,
                              })
                            }
                            className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold flex items-center gap-1 hover:bg-indigo-100 transition active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Room</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === activeFloor.id}
                            onClick={() => handleDeleteFloor(activeFloor.id, activeFloor.name)}
                            className="p-1 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                            title="Delete Floor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Desktop Multi-Column Grid (1 col mobile, 2 col md, 3 col lg, 4 col xl) */}
                    <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-3.5">
                      {activeFloor.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5 flex flex-col justify-between hover:border-slate-300 transition"
                        >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-extrabold">
                              Room {room.number}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {room.beds.length}-Seater
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-extrabold text-indigo-600 tabular-nums">
                              ₹{room.rent.toLocaleString("en-IN")}/mo
                            </span>
                            {isOwner && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setAddBedTarget({
                                      building,
                                      floorIdx,
                                      roomId: room.id,
                                    })
                                  }
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9.5px] font-extrabold border border-emerald-200 transition active:scale-95"
                                >
                                  + Bed
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingId === room.id}
                                  onClick={() => handleDeleteRoom(room.id, room.number)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                  title="Delete Room"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Clean Color-Coded Bed Grid Pills */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {room.beds.map((bed, bIdx) => {
                            if (bed.occupied && bed.tenant) {
                              const activePass = getActivePassForTenant(bed.tenant.id);
                              return (
                                <button
                                  key={bed.id}
                                  onClick={() =>
                                    setActiveProfileBed({
                                      building,
                                      floor: activeFloor,
                                      floorIdx,
                                      room,
                                      bed,
                                      bedIdx: bIdx,
                                    })
                                  }
                                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200 text-left transition flex items-center justify-between gap-1 active:scale-95"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                      <span className="text-[9.5px] font-extrabold text-rose-700">
                                        {bed.label}
                                      </span>
                                      {activePass && (
                                        <span
                                          className={`px-1 rounded text-[8px] font-extrabold ${
                                            activePass.status === "approved"
                                              ? "bg-emerald-100 text-emerald-700"
                                              : "bg-amber-100 text-amber-700"
                                          }`}
                                        >
                                          {activePass.passType === "day_pass" ? "DAY" : "NIGHT"}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] font-extrabold text-slate-900 truncate mt-0.5">
                                      {bed.tenant.name}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                </button>
                              );
                            } else {
                              return (
                                <div
                                  key={bed.id}
                                  className="p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-dashed border-emerald-300 text-left transition flex items-center justify-between gap-1"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isOwner) {
                                        setActiveWalkInBed({
                                          building,
                                          floor: activeFloor,
                                          floorIdx,
                                          room,
                                          bedIdx: bIdx,
                                        });
                                      }
                                    }}
                                    className="min-w-0 flex-1 text-left"
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="text-[9.5px] font-extrabold text-emerald-700">
                                        {bed.label}
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-bold text-emerald-700 mt-0.5 truncate">
                                      {isOwner ? "+ Walk-In" : "Vacant"}
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-0.5">
                                    {isOwner && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setActiveWalkInBed({
                                              building,
                                              floor: activeFloor,
                                              floorIdx,
                                              room,
                                              bedIdx: bIdx,
                                            })
                                          }
                                          className="p-1 rounded text-emerald-600 hover:bg-emerald-100 transition"
                                          title="Add Walk-In Tenant"
                                        >
                                          <UserPlus className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={deletingId === bed.id}
                                          onClick={() => handleDeleteBed(bed.id, bed.label)}
                                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                          title="Delete Bed"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })
        )}
      </div>

      {/* 360 Occupied Bed Profile Bottom Sheet */}
      {activeProfileBed && (
        <BedProfileSheet
          isOpen={true}
          onClose={() => setActiveProfileBed(null)}
          building={activeProfileBed.building}
          floor={activeProfileBed.floor}
          floorIdx={activeProfileBed.floorIdx}
          room={activeProfileBed.room}
          bed={activeProfileBed.bed}
          bedIdx={activeProfileBed.bedIdx}
          userRole={userRole}
          allBuildings={initialBuildings}
        />
      )}

      {/* Walk-In Sheet */}
      {activeWalkInBed && (
        <WalkInSheet
          isOpen={true}
          onClose={() => setActiveWalkInBed(null)}
          building={activeWalkInBed.building}
          floor={activeWalkInBed.floor}
          floorIdx={activeWalkInBed.floorIdx}
          room={activeWalkInBed.room}
          bedIdx={activeWalkInBed.bedIdx}
        />
      )}

      {/* Auto-Building Sheet */}
      <AutoBuildingSheet
        isOpen={isAutoBuildingOpen}
        onClose={() => setIsAutoBuildingOpen(false)}
      />

      {/* Add Floor Sheet */}
      {addFloorBuilding && (
        <AddFloorSheet
          isOpen={true}
          onClose={() => setAddFloorBuilding(null)}
          building={addFloorBuilding}
        />
      )}

      {/* Add Room Sheet */}
      {addRoomTarget && (
        <AddRoomSheet
          isOpen={true}
          onClose={() => setAddRoomTarget(null)}
          building={addRoomTarget.building}
          floorIdx={addRoomTarget.floorIdx}
        />
      )}

      {/* Add Bed Sheet */}
      {addBedTarget && (
        <AddBedSheet
          isOpen={true}
          onClose={() => setAddBedTarget(null)}
          building={addBedTarget.building}
          floorIdx={addBedTarget.floorIdx}
          roomId={addBedTarget.roomId}
        />
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />
    </div>
  );
}

`

================================================================================
// FILE: src/components/pg/BedProfileSheet.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  PhoneForwarded,
  Ticket,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Building,
  Check,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  Send,
  AlertTriangle,
  Edit3,
} from "lucide-react";
import { TenantProfileItem, BuildingItem, FloorItem, RoomItem, BedItem, RentPaymentRecord } from "@/lib/data/rooms";
import {
  verifyTenantKycAction,
  vacateBedAction,
  collectRentPaymentAction,
  settleRentPaymentAction,
  collectSecurityDepositAction,
  refundSecurityDepositAction,
  updateTenantAndBedAction,
} from "@/app/actions/rooms-and-ops";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";

interface BedProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem;
  floor: FloorItem;
  floorIdx: number;
  room: RoomItem;
  bed: BedItem;
  bedIdx: number;
  userRole: "owner" | "admin" | "super_admin" | "tenant";
  initialTemplate?: "rent_reminder" | "welcome_info" | "custom";
  allBuildings?: BuildingItem[];
}

export function BedProfileSheet({
  isOpen,
  onClose,
  building,
  floor,
  floorIdx,
  room,
  bed,
  bedIdx,
  userRole,
  initialTemplate = "rent_reminder",
  allBuildings = [],
}: BedProfileSheetProps) {
  const router = useRouter();
  const [whatsappTemplate, setWhatsappTemplate] = useState<"rent_reminder" | "welcome_info" | "custom">(initialTemplate);
  const [whatsappAutoApi, setWhatsappAutoApi] = useState(false);
  const [customMsg, setCustomMsg] = useState("Namaste! Aapke PG room se juda ek zaroori update hai.");
  const [vacateConfirmStep, setVacateConfirmStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Edit Resident & Bed Transfer State (Owner Only)
  const [isEditingResident, setIsEditingResident] = useState(false);
  const [editFullName, setEditFullName] = useState(bed.tenant?.name || "");
  const [editPhone, setEditPhone] = useState(bed.tenant?.phone || "");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(bed.tenant?.parentPhone || "");
  const [editRent, setEditRent] = useState<number>(bed.tenant?.rent || room.rent || 8500);
  const [editDeposit, setEditDeposit] = useState<number>(bed.tenant?.deposit || 8500);
  const [selectedTargetBedId, setSelectedTargetBedId] = useState<string>(bed.id);
  const [isSavingResident, setIsSavingResident] = useState(false);

  // Collect Rent State
  const [isCollectingRent, setIsCollectingRent] = useState(false);
  const [rentPaymentMode, setRentPaymentMode] = useState<"cash" | "admin_upi" | "pg_bank_upi">("cash");
  const [rentTxRef, setRentTxRef] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<RentPaymentRecord | null>(null);

  // Security Deposit State
  const [isCollectingDeposit, setIsCollectingDeposit] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState<number>(bed.tenant?.deposit || 8500);
  const [depositModeInput, setDepositModeInput] = useState<"cash" | "upi" | "bank_transfer">("cash");
  const [depositRefInput, setDepositRefInput] = useState("");

  // Refund Deposit State (Owner Only)
  const [isRefundingDeposit, setIsRefundingDeposit] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState("");

  // Pending Handover state on this bed
  const [isHandoverPending, setIsHandoverPending] = useState(false);

  if (!isOpen || !bed.tenant) return null;

  const t = bed.tenant;
  const isOwner = userRole === "owner" || userRole === "super_admin";
  const isAdmin = userRole === "admin";
  const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // List of available beds for transfer
  const availableBeds = (allBuildings.length > 0 ? allBuildings : [building]).flatMap((b) =>
    b.floors.flatMap((f) =>
      f.rooms.flatMap((r) =>
        r.beds
          .filter((ob) => !ob.occupied || ob.id === bed.id)
          .map((ob) => ({
            id: ob.id,
            label: `${b.name} • Room ${r.number} - Bed ${ob.label}`,
            roomId: r.id,
            buildingId: b.id,
            rent: r.rent,
            isCurrent: ob.id === bed.id,
          }))
      )
    )
  );

  const handleSaveResidentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingResident(true);
    try {
      const res = await updateTenantAndBedAction(t.id, {
        fullName: editFullName,
        phone: editPhone,
        emergencyPhone: editEmergencyPhone,
        rentAmount: editRent,
        depositAmount: editDeposit,
        newBedId: selectedTargetBedId !== bed.id ? selectedTargetBedId : undefined,
      });

      if ("error" in res && res.error) {
        setToastMsg(`Error: ${res.error}`);
      } else {
        t.name = editFullName;
        t.phone = editPhone;
        t.emergencyContact = editEmergencyPhone;
        t.rent = editRent;
        t.deposit = editDeposit;
        setToastMsg("Resident details & bed allocation saved live!");
        setIsEditingResident(false);
        router.refresh();
      }
    } catch (err: any) {
      setToastMsg(`Error: ${err?.message || "Failed to update resident."}`);
    } finally {
      setIsSavingResident(false);
    }
  };

  // Build WhatsApp Message
  const getWhatsappMessage = () => {
    if (whatsappTemplate === "rent_reminder") {
      return `Namaste ${t.name}, Shuny Stays (${building.name}, Room ${room.number}) ka aapka rent ₹${room.rent.toLocaleString("en-IN")} due hai. Kripya UPI ID royalstaypg@okicici par pay karein.`;
    }
    if (whatsappTemplate === "welcome_info") {
      return `Welcome ${t.name} to Shuny Stays (${building.name}, Room ${room.number})! Wi-Fi: ShunyStays_5G | Pass: ShunyStays@2026.`;
    }
    return customMsg;
  };

  const handleSendWhatsapp = () => {
    const msg = getWhatsappMessage();
    if (whatsappAutoApi) {
      setToastMsg(`⚡ Cloud API dispatched to ${t.name}`);
      setTimeout(() => setToastMsg(null), 3000);
    } else {
      const cleanPhone = t.phone.replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    }
  };

  const handleVerifyKyc = async () => {
    setIsProcessing(true);
    await verifyTenantKycAction(t.id);
    router.refresh();
    t.kycStatus = "Verified";
    setIsProcessing(false);
    setToastMsg("KYC verified successfully ✓");
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Collect Rent Handler
  const handleConfirmCollectRent = async () => {
    setIsProcessing(true);
    const res = await collectRentPaymentAction({
      tenantId: t.id,
      tenantName: t.name,
      roomNumber: `${building.name} • Room ${room.number}`,
      buildingId: building.id,
      amount: room.rent,
      paymentMode: rentPaymentMode,
      transactionRef: rentTxRef || undefined,
    });
    router.refresh();

    if ("invoice" in res && res.invoice) {
      setGeneratedInvoice(res.invoice);
      t.rentPaid = true;
      if (res.invoice.status === "collected_by_admin") {
        setIsHandoverPending(true);
      }
    }
    setIsProcessing(false);
    setIsCollectingRent(false);
    setToastMsg(`Rent ₹${room.rent.toLocaleString("en-IN")} collected! Invoice generated.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1-Tap Confirm Cash Handover on Drawer
  const handleConfirmHandover = async () => {
    setIsProcessing(true);
    const invId = generatedInvoice?.id || (t.id === "t-rahul" ? "INV-202611-04" : "INV-202611-05");
    await settleRentPaymentAction(invId);
    router.refresh();
    setIsHandoverPending(false);
    setIsProcessing(false);
    setToastMsg("Cash confirmed & settled with Owner Ledger ✅");
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Collect Deposit Handler
  const handleConfirmCollectDeposit = async () => {
    setIsProcessing(true);
    await collectSecurityDepositAction({
      tenantId: t.id,
      amount: depositAmountInput,
      paymentMode: depositModeInput,
      transactionRef: depositRefInput || undefined,
    });
    router.refresh();

    t.deposit = depositAmountInput;
    t.depositStatus = "paid";
    t.depositPaymentMode = depositModeInput;
    t.depositCollectedByName = isOwner ? "Owner Manoj Kumar" : "Warden Staff";
    t.depositCollectedAt = "Today";

    setIsProcessing(false);
    setIsCollectingDeposit(false);
    setToastMsg(`Deposit ₹${depositAmountInput.toLocaleString("en-IN")} marked Paid & Held Safely!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Refund Deposit Handler (Owner Only)
  const handleConfirmRefundDeposit = async () => {
    setIsProcessing(true);
    await refundSecurityDepositAction({
      tenantId: t.id,
      deductionAmount,
      deductionReason: deductionReason || "Checkout room inspection",
    });
    router.refresh();

    t.depositStatus = deductionAmount > 0 ? "partially_refunded" : "refunded";
    t.depositDeduction = deductionAmount;
    t.depositDeductionReason = deductionReason;
    t.depositRefundedAmount = Math.max(0, t.deposit - deductionAmount);

    setIsProcessing(false);
    setIsRefundingDeposit(false);
    setToastMsg(`Security deposit settled: Refunded ₹${(t.deposit - deductionAmount).toLocaleString("en-IN")}`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleVacate = async () => {
    setIsProcessing(true);
    await vacateBedAction(building.id, floorIdx, room.id, bedIdx);
    router.refresh();
    setIsProcessing(false);
    onClose();
  };

  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const netRefund = Math.max(0, (t.deposit || 8500) - deductionAmount);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] md:max-w-2xl mx-auto rounded-t-3xl md:rounded-3xl p-5 pb-8 max-h-[92%] md:max-h-[88vh] overflow-y-auto shadow-2xl border-t md:border border-slate-200 bg-white text-slate-900 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900">{t.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      t.kycStatus === "Verified"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    KYC {t.kycStatus}
                  </span>
                </div>
                <p className="text-[10.5px] font-bold text-slate-500">
                  {building.name} • {floor.name} • Room {room.number} ({bed.label})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {toastMsg && (
            <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Quick Call & Issue Gate Pass Buttons */}
          <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-extrabold">
            <a
              href={`tel:${t.phone}`}
              className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Call Student</span>
            </a>
            <a
              href={`tel:${t.parentPhone}`}
              className="py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center gap-1 text-slate-900 transition active:scale-95 shadow-xs"
            >
              <PhoneForwarded className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Parent</span>
            </a>
            <button
              onClick={() => {
                alert(`Gate Pass generation shortcut for ${t.name}`);
              }}
              className="py-2 px-2 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Gate Pass</span>
            </button>
          </div>

          {/* Owner Only: Edit Resident Details & Bed Transfer Trigger */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditingResident(!isEditingResident)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isEditingResident ? "Close Resident Editor" : "Edit Resident Details & Transfer Bed"}</span>
            </button>
          )}

          {/* Owner Only: Edit Resident Details & Bed Transfer Form */}
          {isOwner && isEditingResident && (
            <form onSubmit={handleSaveResidentEdit} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-indigo-100">
                <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  Edit Resident Profile & Bed Transfer
                </span>
                <span className="text-[9.5px] font-bold text-indigo-600 uppercase">PG Owner Control</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Resident Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Parent / Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    placeholder="Parent / Emergency Contact"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={editRent}
                    onChange={(e) => setEditRent(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={editDeposit}
                    onChange={(e) => setEditDeposit(Number(e.target.value))}
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Bed Allocation (Shift Resident)
                  </label>
                  <select
                    value={selectedTargetBedId}
                    onChange={(e) => setSelectedTargetBedId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                  >
                    {availableBeds.map((ob) => (
                      <option key={ob.id} value={ob.id}>
                        {ob.isCurrent ? `[Current Bed] ${ob.label}` : `→ Shift to: ${ob.label} (₹${ob.rent})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingResident(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingResident}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingResident ? "Saving..." : "Save & Update Allocation"}</span>
                </button>
              </div>
            </form>
          )}

          {/* AMBER ALERT BANNER: PENDING CASH HANDOVER TO OWNER */}
          {isHandoverPending && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2.5 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-black text-amber-950 leading-snug">
                      Collected by {generatedInvoice?.collectedByName || t.depositCollectedByName || (t.id === "t-karan" || t.id === "t-rahul" ? "Warden Suresh" : "Warden Ramesh")} • Collect ₹{room.rent.toLocaleString("en-IN")} from {generatedInvoice?.collectedByName || t.depositCollectedByName || (t.id === "t-karan" || t.id === "t-rahul" ? "Warden Suresh" : "Warden Ramesh")}
                    </div>
                    <div className="text-[10px] text-amber-800 font-medium mt-0.5">
                      Status: Pending Handover to Owner • Physical cash collected at desk
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-900 tabular-nums shrink-0">
                  ₹{room.rent.toLocaleString("en-IN")}
                </span>
              </div>

              {isOwner && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmHandover}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Cash Received</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. DEDICATED SECURITY DEPOSIT CARD (PART 1) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Security Deposit</h4>
                  <p className="text-[10px] text-slate-400">100% Refundable at Checkout</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-slate-900 tabular-nums">
                  ₹{(t.deposit || 8500).toLocaleString("en-IN")}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    t.depositStatus === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : t.depositStatus === "pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  {t.depositStatus === "paid"
                    ? "Paid • Held Safely"
                    : t.depositStatus === "pending"
                    ? "Deposit Pending"
                    : "Refunded"}
                </span>
              </div>
            </div>

            {/* Deposit Metadata */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500">
              <span>
                Mode: <strong className="text-slate-800">{(t.depositPaymentMode || "UPI").toUpperCase()}</strong>
              </span>
              <span>
                Collected by: <strong className="text-slate-800">{t.depositCollectedByName || "Warden Ramesh"}</strong>
              </span>
            </div>

            {/* Actions: Collect Deposit (if pending) OR Refund Deposit (if paid & Owner) */}
            <div className="pt-1 flex items-center gap-2">
              {t.depositStatus === "pending" ? (
                <button
                  type="button"
                  onClick={() => setIsCollectingDeposit(!isCollectingDeposit)}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold transition shadow-xs active:scale-95"
                >
                  {isCollectingDeposit ? "Cancel" : "Collect Deposit"}
                </button>
              ) : (
                <>
                  <DepositReceiptModal
                    pgName="Royal Stay PG"
                    primaryColor="#4F46E5"
                    tenantName={t.name}
                    roomNumber={`Room ${room.number}`}
                    bedLabel={bed.label}
                    amount={t.deposit || 8500}
                    paymentMode={t.depositPaymentMode || "UPI"}
                    collectedByName={t.depositCollectedByName || "Warden Staff"}
                    status={t.depositStatus === "paid" ? "Paid • Held Safely" : "Refunded"}
                    deductionAmount={t.depositDeduction}
                    deductionReason={t.depositDeductionReason}
                    refundedAmount={t.depositRefundedAmount}
                    triggerButton={
                      <button
                        type="button"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-bold border border-slate-200/90 text-center transition"
                      >
                        Deposit Receipt
                      </button>
                    }
                  />

                  {isOwner && t.depositStatus === "paid" && (
                    <button
                      type="button"
                      onClick={() => setIsRefundingDeposit(!isRefundingDeposit)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10.5px] font-bold border border-purple-200 text-center transition"
                    >
                      {isRefundingDeposit ? "Cancel" : "Settle / Refund Deposit"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Quick Collect Deposit Form Panel */}
            {isCollectingDeposit && t.depositStatus === "pending" && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2 animate-in fade-in">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
                  Collect Security Deposit
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Amount (₹)</label>
                    <input
                      type="number"
                      value={depositAmountInput}
                      onChange={(e) => setDepositAmountInput(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Mode</label>
                    <select
                      value={depositModeInput}
                      onChange={(e) => setDepositModeInput(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900"
                    >
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI</option>
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Ref / UTR (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-DEP-991"
                    value={depositRefInput}
                    onChange={(e) => setDepositRefInput(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmCollectDeposit}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xs transition"
                >
                  {isProcessing ? "Saving..." : "Confirm Deposit Collection"}
                </button>
              </div>
            )}

            {/* Settle / Refund Deposit Panel (Owner Only) */}
            {isRefundingDeposit && isOwner && (
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 mt-2 animate-in fade-in text-xs">
                <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wide block">
                  Checkout Deposit Settlement
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                      Deduction (₹)
                    </label>
                    <input
                      type="number"
                      value={deductionAmount}
                      onChange={(e) => setDeductionAmount(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                      Net Refund Amount
                    </label>
                    <div className="px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-black text-emerald-700 tabular-nums">
                      ₹{netRefund.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                    Deduction Reason (if any)
                  </label>
                  <input
                    type="text"
                    value={deductionReason}
                    onChange={(e) => setDeductionReason(e.target.value)}
                    placeholder="e.g. Wall painting damage / Key loss"
                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmRefundDeposit}
                  className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold shadow-xs transition"
                >
                  {isProcessing ? "Processing..." : `Confirm Refund ₹${netRefund.toLocaleString("en-IN")} & Close`}
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. FLOOR-WISE RENT COLLECTION & 2-STEP AUTO-INVOICE (PART 2) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 text-xs shadow-sm">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">College / Office</span>
                <strong className="text-slate-800">{t.college}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Joining Date</span>
                <strong className="text-slate-800">{t.joinDate}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Monthly Rent</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-indigo-600 tabular-nums">
                    ₹{room.rent.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      t.rentPaid
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {t.rentPaid ? "Paid" : "Rent Due"}
                  </span>
                </div>
              </div>

              {!t.rentPaid ? (
                <button
                  type="button"
                  onClick={() => setIsCollectingRent(!isCollectingRent)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-extrabold text-xs shadow-xs transition active:scale-95"
                >
                  {isCollectingRent ? "Close" : "Collect Rent"}
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" /> Paid
                  </span>
                  <RentReceiptModal
                    pgName="Royal Stay PG"
                    primaryColor="#4F46E5"
                    tenantName={t.name}
                    roomNumber={`Room ${room.number}`}
                    amount={`₹${room.rent.toLocaleString("en-IN")}`}
                    dueDate="Nov 05, 2026"
                    triggerButton={
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold hover:bg-indigo-100"
                      >
                        Invoice PDF
                      </button>
                    }
                  />
                </div>
              )}
            </div>

            {/* Slide-Up Collect Rent Sheet */}
            {isCollectingRent && !t.rentPaid && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>Cycle: November 2026</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    Preview: Today, {nowTime}
                  </span>
                </div>

                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
                  Select Collection Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() => setRentPaymentMode("cash")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      rentPaymentMode === "cash"
                        ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentPaymentMode("admin_upi")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      rentPaymentMode === "admin_upi"
                        ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    📱 Admin UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentPaymentMode("pg_bank_upi")}
                    className={`py-2 px-1 rounded-lg border text-center transition ${
                      rentPaymentMode === "pg_bank_upi"
                        ? "bg-[#4F46E5] text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    🏦 PG Bank UPI
                  </button>
                </div>

                {rentPaymentMode === "admin_upi" && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    💡 Paid to Warden UPI. Will flag in Owner Ledger as &ldquo;Pending Cash Handover&rdquo;.
                  </p>
                )}

                {rentPaymentMode === "pg_bank_upi" && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    ⚡ Direct to PG Bank Account. Marks automatically as &ldquo;Settled with Owner&rdquo;.
                  </p>
                )}

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 block mb-0.5">
                    UTR / Transaction Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={rentTxRef}
                    onChange={(e) => setRentTxRef(e.target.value)}
                    placeholder="e.g. UTR-4910281"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmCollectRent}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Receipt & Generate Invoice</span>
                </button>
              </div>
            )}

            {/* INSTANT INVOICE SUCCESS CARD (Auto-displays right after payment) */}
            {generatedInvoice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instant Invoice Generated</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800">
                    {generatedInvoice.id}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-950">
                  <span>₹{generatedInvoice.amount.toLocaleString("en-IN")} via {generatedInvoice.paymentMode.toUpperCase()}</span>
                  <span className="text-[10px] text-emerald-700">{generatedInvoice.collectedAt}</span>
                </div>

                {/* 1-Tap Send on WhatsApp (wa.me) */}
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={`https://wa.me/91${t.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Namaste ${t.name}! Rent payment of ₹${generatedInvoice.amount.toLocaleString("en-IN")} for Royal Stay PG (${building.name}, Room ${room.number}) has been recorded.\n• Invoice No: ${generatedInvoice.id}\n• Payment Mode: ${generatedInvoice.paymentMode.toUpperCase()}\n• Timestamp: ${generatedInvoice.collectedAt}\n• Status: Confirmed Paid ✅\nThank you!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Invoice on WhatsApp</span>
                  </a>

                  <RentReceiptModal
                    pgName="Royal Stay PG"
                    primaryColor="#4F46E5"
                    tenantName={t.name}
                    roomNumber={`Room ${room.number}`}
                    invoiceNumber={generatedInvoice.id}
                    amount={`₹${generatedInvoice.amount.toLocaleString("en-IN")}`}
                    dueDate={generatedInvoice.collectedAt}
                    triggerButton={
                      <button
                        type="button"
                        className="py-2 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-extrabold hover:bg-emerald-100/50 transition"
                      >
                        PDF
                      </button>
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Send WhatsApp Menu (3 Templates + Live Preview) */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp</span>
              </span>
              <button
                type="button"
                onClick={() => setWhatsappAutoApi(!whatsappAutoApi)}
                className="px-2 py-0.5 rounded bg-white text-slate-900 text-[9px] font-extrabold border border-slate-200 shadow-2xs"
              >
                {whatsappAutoApi ? "Cloud API Auto ⚡" : "wa.me Link (Free)"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setWhatsappTemplate("rent_reminder")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "rent_reminder"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Rent Reminder
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTemplate("welcome_info")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "welcome_info"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Welcome & Wi-Fi
              </button>
              <button
                type="button"
                onClick={() => setWhatsappTemplate("custom")}
                className={`py-1 rounded-lg text-[9.5px] font-extrabold transition ${
                  whatsappTemplate === "custom"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
                Custom Msg
              </button>
            </div>

            {whatsappTemplate === "custom" ? (
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[10.5px] text-slate-900"
              />
            ) : (
              <div className="p-2 bg-white/80 rounded-lg text-[10px] text-slate-600 leading-relaxed border border-emerald-100">
                &ldquo;{getWhatsappMessage()}&rdquo;
              </div>
            )}

            <button
              type="button"
              onClick={handleSendWhatsapp}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-xs"
            >
              Send WhatsApp Message
            </button>
          </div>

          {/* Vacate Bed (Owner Only, Two-Step Inline Confirm) */}
          {isOwner && (
            <div className="pt-1">
              {!vacateConfirmStep ? (
                <button
                  type="button"
                  onClick={() => setVacateConfirmStep(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition"
                >
                  Vacate / Checkout Bed
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="text-[10.5px] font-extrabold text-rose-700">
                    Confirm free up {bed.label}?
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleVacate}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold hover:bg-rose-700"
                    >
                      Yes, Vacate
                    </button>
                    <button
                      type="button"
                      onClick={() => setVacateConfirmStep(false)}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-extrabold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

`

================================================================================
// FILE: src/components/pg/RoomsSheets.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Layers, Plus, FileSpreadsheet, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { BuildingItem, FloorItem, RoomItem } from "@/lib/data/rooms";
import {
  addAutoBuildingAction,
  addFloorAction,
  addRoomAction,
  addBedAction,
  walkInAddTenantAction,
} from "@/app/actions/rooms-and-ops";
import { CredentialsGeneratedCard } from "@/components/auth/CredentialsGeneratedCard";

// ==============================================================================
// 1. WALK-IN EXPRESS ADD TENANT SHEET
// ==============================================================================
interface WalkInSheetProps {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem;
  floor: FloorItem;
  floorIdx: number;
  room: RoomItem;
  bedIdx: number;
}

export function WalkInSheet({
  isOpen,
  onClose,
  building,
  floor,
  floorIdx,
  room,
  bedIdx,
}: WalkInSheetProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCreds, setCreatedCreds] = useState<{
    name: string;
    role: "tenant";
    loginId: string;
    password: string;
    phone: string;
    pgName?: string;
    roomInfo?: string;
  } | null>(null);

  if (!isOpen) return null;
  const bed = room.beds[bedIdx];

  const handleClose = () => {
    setCreatedCreds(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await walkInAddTenantAction(building.id, floorIdx, room.id, bedIdx, formData);
      if (res && "error" in res && (res as any).error) {
        setError((res as any).error);
        setIsSubmitting(false);
        return;
      }
      router.refresh();
      setIsSubmitting(false);
      if (res && "credentials" in res && (res as any).credentials) {
        setCreatedCreds((res as any).credentials);
      } else {
        handleClose();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to add tenant");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A]">Walk-In Express Add</h3>
              <p className="text-[10.5px] text-emerald-600 font-bold">
                {building.name} • {floor.name} • Room {room.number} ({bed?.label || "Bed"})
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {createdCreds ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Resident added! Direct login credentials auto-generated.</span>
              </div>

              <CredentialsGeneratedCard
                name={createdCreds.name}
                role="tenant"
                loginId={createdCreds.loginId}
                password={createdCreds.password}
                phone={createdCreds.phone}
                pgName={createdCreds.pgName}
                roomInfo={`${building.name} • Room ${room.number} (${bed?.label || "Bed"})`}
                onClose={handleClose}
              />

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95"
              >
                Done & Return to Rooms
              </button>
            </div>
          ) : (

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            <div>
              <label className="font-bold text-[#64748B] block mb-1">1. Tenant Full Name</label>
              <input
                name="name"
                type="text"
                required
                defaultValue="Kabir Malhotra"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#64748B] block mb-1">2. Phone / WhatsApp</label>
              <input
                name="phone"
                type="tel"
                required
                defaultValue="9871234560"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#64748B] block mb-1">3. Joining Date</label>
              <input
                name="joinDate"
                type="text"
                defaultValue="18 Nov 2026"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] focus:outline-none"
              />
            </div>

            {/* Security Deposit Section */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[11px] text-slate-800">
                  4. Security Deposit Setup
                </span>
                <span className="text-[10px] text-indigo-600 font-bold">100% Refundable</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Deposit Amount (₹)
                  </label>
                  <input
                    name="depositAmount"
                    type="number"
                    required
                    defaultValue={room.rent || 8500}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Deposit Status
                  </label>
                  <select
                    name="depositStatus"
                    defaultValue="paid"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none text-xs"
                  >
                    <option value="paid">Paid • Collected Now</option>
                    <option value="pending">Pending • To be collected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    Payment Mode
                  </label>
                  <select
                    name="depositPaymentMode"
                    defaultValue="cash"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none text-xs"
                  >
                    <option value="cash">💵 Cash to Warden/Owner</option>
                    <option value="upi">📱 UPI Transfer</option>
                    <option value="bank_transfer">🏦 Bank NEFT/IMPS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    UTR / Receipt Ref (Opt.)
                  </label>
                  <input
                    name="depositRef"
                    type="text"
                    placeholder="e.g. UTR-998811"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] cursor-pointer">
              <span className="font-bold text-[#0F172A]">5. Current Month Rent Paid?</span>
              <input
                name="rentPaid"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <p className="text-[10px] text-[#64748B]">
              Sets kyc_status = &apos;pending&apos; so resident uploads Aadhar & selfie on resident login.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Assigning..." : "Assign Bed & Generate Receipts"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 2. SMART AUTO-BUILDING BUILDER SHEET
// ==============================================================================
export function AutoBuildingSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await addAutoBuildingAction(formData);
      if (res && "error" in res && res.error) {
        setError(typeof res.error === "string" ? res.error : "Failed to create building");
        setIsSubmitting(false);
        return;
      }
      router.refresh();
      setIsSubmitting(false);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create building");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Smart Auto-Building Builder</h3>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="font-bold text-[#64748B] block mb-1">Building Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue="Block B"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                />
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Type</label>
                <select
                  name="type"
                  className="w-full px-2 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Total Floors</label>
                <input
                  name="floorsCount"
                  type="number"
                  min="1"
                  max="8"
                  defaultValue="3"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
                />
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Rooms Per Floor</label>
                <input
                  name="roomsPerFloor"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue="3"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Sharing</label>
                <select
                  name="sharing"
                  defaultValue="2"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                >
                  <option value="2">2-Seater</option>
                  <option value="3">3-Seater</option>
                  <option value="1">1-Seater</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Monthly Rent (₹)</label>
                <input
                  name="rent"
                  type="number"
                  defaultValue="8500"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95 mt-2"
            >
              {isSubmitting ? "Generating..." : "Auto-Divide Floors, Rooms & Beds"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 3. ADD FLOOR SHEET
// ==============================================================================
export function AddFloorSheet({
  isOpen,
  onClose,
  building,
}: {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isOpen || !building) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const roomsCount = parseInt(formData.get("roomsCount") as string) || 3;
      const res = await addFloorAction(building.id, name, roomsCount);
      if (res && "error" in res && (res as any).error) {
        setError((res as any).error);
        setIsSubmitting(false);
        return;
      }
      router.refresh();
      setIsSubmitting(false);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add floor");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">+ Add Floor to {building.name}</h3>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            <div>
              <label className="font-bold text-[#64748B] block mb-1">Floor Name</label>
              <input
                name="name"
                type="text"
                required
                defaultValue={`${building.floors.length}th Floor`}
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
              />
            </div>
            <div>
              <label className="font-bold text-[#64748B] block mb-1">Initial Rooms Count</label>
              <input
                name="roomsCount"
                type="number"
                defaultValue="3"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Creating..." : "Create Floor & Rooms"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 4. ADD ROOM SHEET (SINGLE OR BULK SERIES)
// ==============================================================================
export function AddRoomSheet({
  isOpen,
  onClose,
  building,
  floorIdx,
}: {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem | null;
  floorIdx: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !building) return null;
  const floor = building.floors[floorIdx];
  if (!floor) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const sharing = parseInt(formData.get("sharing") as string) || 2;
      const rent = parseInt(formData.get("rent") as string) || 8500;

      let res;
      if (mode === "single") {
        const roomNumber = formData.get("roomNumber") as string;
        res = await addRoomAction(building.id, floorIdx, "single", { roomNumber, sharing, rent });
      } else {
        const startNo = parseInt(formData.get("startNo") as string) || 102;
        const endNo = parseInt(formData.get("endNo") as string) || 105;
        res = await addRoomAction(building.id, floorIdx, "bulk", { startNo, endNo, sharing, rent });
      }

      if (res && "error" in res && (res as any).error) {
        setError((res as any).error);
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      setIsSubmitting(false);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add room(s)");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              + Add Room ({building.name} • {floor.name})
            </h3>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[10.5px] font-extrabold">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`py-1.5 rounded-lg transition ${
                mode === "single" ? "bg-[#4F46E5] text-white shadow-xs" : "text-[#64748B]"
              }`}
            >
              Single Room
            </button>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`py-1.5 rounded-lg transition ${
                mode === "bulk" ? "bg-[#4F46E5] text-white shadow-xs" : "text-[#64748B]"
              }`}
            >
              Bulk Series
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            {mode === "single" ? (
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Room Number</label>
                <input
                  name="roomNumber"
                  type="text"
                  required
                  defaultValue={`${(floorIdx + 1) * 100 + floor.rooms.length + 1}`}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Start No.</label>
                  <input
                    name="startNo"
                    type="number"
                    defaultValue="102"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">End No.</label>
                  <input
                    name="endNo"
                    type="number"
                    defaultValue="105"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Sharing</label>
                <select
                  name="sharing"
                  defaultValue="2"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                >
                  <option value="2">2-Seater</option>
                  <option value="3">3-Seater</option>
                  <option value="1">1-Seater</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Rent (₹)</label>
                <input
                  name="rent"
                  type="number"
                  defaultValue="8500"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Generating..." : "Generate Room(s) & Beds"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 5. ADD BED SHEET
// ==============================================================================
export function AddBedSheet({
  isOpen,
  onClose,
  building,
  floorIdx,
  roomId,
}: {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem | null;
  floorIdx: number;
  roomId: string | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isOpen || !building || !roomId) return null;

  const floor = building.floors[floorIdx];
  const room = floor?.rooms.find((r) => r.id === roomId);
  if (!room) return null;

  const nextLabel = `Bed ${String.fromCharCode(65 + room.beds.length)}`;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const label = formData.get("label") as string;
      const res = await addBedAction(building.id, floorIdx, roomId, label);
      if (res && "error" in res && (res as any).error) {
        setError((res as any).error);
        setIsSubmitting(false);
        return;
      }
      router.refresh();
      setIsSubmitting(false);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add bed");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] md:max-w-lg mx-auto rounded-t-[28px] md:rounded-3xl p-5 pb-8 shadow-2xl border-t md:border border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up max-h-[92%] md:max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              + Add Extra Bed (Room {room.number})
            </h3>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <input
              name="label"
              type="text"
              required
              defaultValue={nextLabel}
              className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-xs text-[#0F172A]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Adding..." : `Add ${nextLabel}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 6. CSV IMPORT MODAL
// ==============================================================================
export function CsvImportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [imported, setImported] = useState(false);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Bulk CSV / Excel Migration</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#64748B]">
            Upload or paste CSV rows containing your resident directory:
          </p>

          <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[10px] font-mono text-[#64748B] overflow-x-auto leading-relaxed">
            building, floor, room, sharing, rent, tenant_name, phone, rent_paid, deposit_amt, deposit_status, deposit_mode<br />
            Block A, Ground, G-01, 2, 8500, Harsh Vardhan, 9811776655, true, 8500, paid, cash
          </div>

          {imported ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-bold text-center">
              ✓ Sample CSV row parsed and added to vacant bed!
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setImported(true)}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              Import Sample CSV Row to Vacant Bed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

`

================================================================================
// FILE: src/components/ledger/LedgerExplorer.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IndianRupee,
  CheckCircle2,
  Receipt,
  Check,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Banknote,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  BuildingItem,
  ExpenseItem,
  UpiApprovalItem,
  SecurityDepositItem,
  RentPaymentRecord,
} from "@/lib/data/rooms";
import { settleRentPaymentAction } from "@/app/actions/rooms-and-ops";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";

interface LedgerExplorerProps {
  buildings: BuildingItem[];
  expenses: ExpenseItem[];
  upiApprovals: UpiApprovalItem[];
  initialDeposits?: SecurityDepositItem[];
  initialRentPayments?: RentPaymentRecord[];
  userRole: "owner" | "admin" | "super_admin" | "tenant";
  currentUserName?: string;
}

export function LedgerExplorer({
  buildings,
  expenses,
  upiApprovals,
  initialDeposits = [],
  initialRentPayments = [],
  userRole,
  currentUserName = "Manoj Kumar",
}: LedgerExplorerProps) {
  const router = useRouter();
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";

  const [activeTab, setActiveTab] = useState<"rent" | "deposits">("rent");
  const [rentPayments, setRentPayments] = useState<RentPaymentRecord[]>(initialRentPayments);
  const [deposits, setDeposits] = useState<SecurityDepositItem[]>(initialDeposits);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 1-Tap Confirm Cash Received (Owner Reconciliation)
  const handleConfirmHandover = async (record: RentPaymentRecord) => {
    setIsProcessingId(record.id);
    await settleRentPaymentAction(record.id);
    router.refresh();

    setRentPayments((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: "settled_with_owner",
              settledAt: "Just now",
              settledByName: currentUserName,
            }
          : r
      )
    );
    setIsProcessingId(null);
    showToast(`Confirmed ₹${record.amount.toLocaleString("en-IN")} Cash from ${record.collectedByName}! Settled to Ledger.`);
  };

  // Calculations
  const pendingHandovers = rentPayments.filter((r) => r.status === "collected_by_admin");
  const settledPayments = rentPayments.filter((r) => r.status === "settled_with_owner");

  const pendingHandoverTotal = pendingHandovers.reduce((acc, r) => acc + r.amount, 0);
  const rentCollectedTotal = settledPayments.reduce((acc, r) => acc + r.amount, 0);

  // Security deposits sum (active paid deposits)
  const activePaidDeposits = deposits.filter((d) => d.status === "paid");
  const totalSecurityDeposits = activePaidDeposits.reduce((acc, d) => acc + (d.paidAmount || d.expectedAmount), 0);

  // Admin Collections
  const myAdminCollections = rentPayments.filter(
    (r) => r.collectedByRole === "admin" || (r.collectedByName && r.collectedByName.includes("Suresh"))
  );
  const myAdminTotal = myAdminCollections.reduce((acc, r) => acc + r.amount, 0);
  const myAdminPending = myAdminCollections
    .filter((r) => r.status === "collected_by_admin")
    .reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-slate-700 backdrop-blur-md animate-in fade-in flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OWNER VIEW: 3 KPI CARDS + TABS */}
      {/* ========================================================================= */}
      {isOwner ? (
        <>
          {/* 1. Exactly 3 Clean KPI Cards (1 col mobile, 3 cols desktop) */}
          <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {/* KPI 1: Rent Collected */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Rent Revenue (Nov 2026)
                </div>
                <div className="text-xl font-black text-emerald-600 tabular-nums mt-0.5">
                  ₹{rentCollectedTotal.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {settledPayments.length} Invoices Settled into Bank
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Settled
              </span>
            </div>

            {/* KPI 2: Pending Cash Handover from Admin */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Cash Handover from Staff
                </div>
                <div className="text-xl font-black text-amber-600 tabular-nums mt-0.5">
                  ₹{pendingHandoverTotal.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {pendingHandovers.length} payments waiting for physical handover
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                Pending Handover
              </span>
            </div>

            {/* KPI 3: Security Deposit Held — Refundable */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Security Deposit Held (Refundable)
                </div>
                <div className="text-xl font-black text-[#4F46E5] tabular-nums mt-0.5">
                  ₹{totalSecurityDeposits.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Strictly Held in Trust • Kept Separate from Profit
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Trust Account
              </span>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/90">
            <button
              type="button"
              onClick={() => setActiveTab("rent")}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === "rent"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rent & Handovers ({rentPayments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("deposits")}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === "deposits"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Security Deposits ({deposits.length})
            </button>
          </div>

          {/* TAB 1: RENT & HANDOVERS */}
          {activeTab === "rent" && (
            <div className="space-y-3.5">
              {/* 2. Pending Cash Handover List with 1-Tap Confirm Cash Received */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending Staff Cash Handovers ({pendingHandovers.length})</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700">Warden Cash Desk</span>
                </div>

                {pendingHandovers.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center text-xs text-slate-400">
                    All cash collections from warden desk have been settled!
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
                    {pendingHandovers.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm hover:border-amber-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block">
                              {item.tenantName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.room} • Mode: <strong className="text-slate-700">{item.paymentMode.toUpperCase()}</strong>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 tabular-nums">
                              ₹{item.amount.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold block">
                              Pending Handover
                            </span>
                          </div>
                        </div>

                        {/* Alert banner matching exact spec: Collected by [Admin] • Collect ₹X from Admin */}
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-950">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Collected by {item.collectedByName} • Collect ₹{item.amount.toLocaleString("en-IN")} from {item.collectedByName}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.collectedAt}
                          </span>

                          <button
                            type="button"
                            disabled={isProcessingId === item.id}
                            onClick={() => handleConfirmHandover(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isProcessingId === item.id ? "Settling..." : "Confirm Cash Received"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Settled Payment & Auto-Invoice Audit History */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 px-0.5">
                  Settled Payments & Auto-Invoices ({settledPayments.length})
                </h3>

                <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
                  {settledPayments.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-2 shadow-sm hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {inv.tenantName}
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Settled
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {inv.room} • {inv.paymentMode.toUpperCase()} • <span className="font-mono">{inv.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-900 tabular-nums">
                          ₹{inv.amount.toLocaleString("en-IN")}
                        </span>

                        <RentReceiptModal
                          pgName="Royal Stay PG"
                          primaryColor="#4F46E5"
                          tenantName={inv.tenantName}
                          roomNumber={inv.room}
                          invoiceNumber={inv.id}
                          amount={`₹${inv.amount.toLocaleString("en-IN")}`}
                          dueDate={inv.collectedAt}
                          triggerButton={
                            <button
                              type="button"
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-[10px] font-extrabold border border-indigo-200 transition cursor-pointer"
                            >
                              Invoice PDF
                            </button>
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY DEPOSITS (REFUNDABLE LEDGER) */}
          {activeTab === "deposits" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Security Deposits Ledger ({deposits.length})
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold">100% Refundable</span>
              </div>

              <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900">
                            {dep.tenantName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              dep.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : dep.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {dep.status === "paid"
                              ? "Paid • Held Safely"
                              : dep.status === "pending"
                              ? "Deposit Pending"
                              : "Refunded"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {dep.buildingName} • Room {dep.roomNumber} ({dep.bedLabel})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          ₹{(dep.paidAmount || dep.expectedAmount).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          #{dep.id}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        Mode: <strong className="text-slate-800">{dep.paymentMode.toUpperCase()}</strong> • Collected by{" "}
                        <strong className="text-slate-800">{dep.collectedByName || "Staff"}</strong>
                      </span>

                      <DepositReceiptModal
                        pgName="Royal Stay PG"
                        primaryColor="#4F46E5"
                        tenantName={dep.tenantName}
                        roomNumber={`Room ${dep.roomNumber}`}
                        bedLabel={dep.bedLabel}
                        receiptNumber={dep.id}
                        amount={dep.paidAmount || dep.expectedAmount}
                        paymentMode={dep.paymentMode}
                        collectedByName={dep.collectedByName || "Staff Desk"}
                        status={dep.status === "paid" ? "Paid • Held Safely" : "Refunded"}
                        deductionAmount={dep.deductionAmount}
                        deductionReason={dep.deductionReason}
                        refundedAmount={dep.refundedAmount}
                        triggerButton={
                          <button
                            type="button"
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] text-[10px] font-extrabold border border-indigo-200 transition cursor-pointer"
                          >
                            Deposit Receipt
                          </button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ========================================================================= */
        /* ADMIN VIEW: MY COLLECTIONS & CASH HANDOVER DESK */
        /* ========================================================================= */
        <div className="space-y-3.5">
          {/* Admin Collections KPI Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                My Total Collections
              </div>
              <div className="text-xl font-black text-emerald-600 tabular-nums mt-0.5">
                ₹{myAdminTotal.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">All modes combined</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Handover
              </div>
              <div className="text-xl font-black text-amber-600 tabular-nums mt-0.5">
                ₹{myAdminPending.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-amber-700 font-bold mt-0.5">Physical Cash in Hand</div>
            </div>
          </div>

          {/* Admin Collections History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-xs font-extrabold text-slate-900">
                My Collections History ({myAdminCollections.length})
              </h3>
              <span className="text-[10px] text-slate-400">Warden Cash Register</span>
            </div>

            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3.5">
              {myAdminCollections.map((col) => {
                const isSettled = col.status === "settled_with_owner";

                return (
                  <div
                    key={col.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900">
                            {col.tenantName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              isSettled
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isSettled ? "Handed Over to Owner ✅" : "Pending Handover to Owner"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {col.room} • Mode: <strong className="text-slate-700">{col.paymentMode.toUpperCase()}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          ₹{col.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-400 block">
                          #{col.id}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {col.collectedAt}
                      </span>

                      <RentReceiptModal
                        pgName="Royal Stay PG"
                        primaryColor="#4F46E5"
                        tenantName={col.tenantName}
                        roomNumber={col.room}
                        invoiceNumber={col.id}
                        amount={`₹${col.amount.toLocaleString("en-IN")}`}
                        dueDate={col.collectedAt}
                        triggerButton={
                          <button
                            type="button"
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                          >
                            View Receipt
                          </button>
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

`

================================================================================
// FILE: src/components/attendance/AttendanceSheet.tsx
================================================================================
`tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Building2,
  Lock,
} from "lucide-react";
import {
  AttendanceStatus,
  BedAttendanceItem,
  UserRole,
} from "@/types/schema.types";
import { saveAttendanceAction } from "@/app/actions/attendance";

interface FloorData {
  floor_id: string;
  floor_name: string;
  floor_number: number;
  beds: BedAttendanceItem[];
  stats: {
    total: number;
    present: number;
    onPass: number;
    absent: number;
  };
}

interface BuildingData {
  building_id: string;
  building_name: string;
  gender_type: string;
  floors: FloorData[];
  stats: {
    total: number;
    present: number;
    onPass: number;
    absent: number;
  };
}

interface AttendanceSheetProps {
  initialBuildings: BuildingData[];
  userRole: UserRole;
  userName: string;
  assignedBuildingIds?: string[];
}

export function AttendanceSheet({
  initialBuildings,
  userRole,
  userName,
  assignedBuildingIds = [],
}: AttendanceSheetProps) {
  const router = useRouter();
  const isAdminScoped = userRole === "admin";
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Maintain local state of bed statuses keyed by bed_id
  const [bedStatuses, setBedStatuses] = useState<
    Record<string, { status: AttendanceStatus; tenant_id: string }>
  >(() => {
    const map: Record<string, { status: AttendanceStatus; tenant_id: string }> = {};
    initialBuildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.beds.forEach((bed) => {
          map[bed.bed_id] = {
            status: bed.status,
            tenant_id: bed.tenant_id,
          };
        });
      });
    });
    return map;
  });

  // Filter buildings according to selection & admin permissions
  const filteredBuildings = initialBuildings.filter((b) => {
    if (isAdminScoped && assignedBuildingIds.length > 0) {
      if (!assignedBuildingIds.includes(b.building_id)) return false;
    }
    if (selectedBuildingId === "all") return true;
    return b.building_id === selectedBuildingId;
  });

  // Compute live summary counts
  let presentCnt = 0;
  let absentCnt = 0;
  let passCnt = 0;

  filteredBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.beds.forEach((bed) => {
        const st = bedStatuses[bed.bed_id]?.status || bed.status;
        if (st === "present") presentCnt++;
        else if (st === "absent") absentCnt++;
        else passCnt++;
      });
    });
  });

  // Status toggle handler
  const handleStatusChange = (
    bedId: string,
    tenantId: string,
    newStatus: AttendanceStatus
  ) => {
    setBedStatuses((prev) => ({
      ...prev,
      [bedId]: { status: newStatus, tenant_id: tenantId },
    }));
  };

  // Mark all remaining beds on a floor as "present"
  const handleMarkFloorRemainingPresent = (floorBeds: BedAttendanceItem[]) => {
    setBedStatuses((prev) => {
      const next = { ...prev };
      floorBeds.forEach((bed) => {
        const current = next[bed.bed_id]?.status || bed.status;
        // Don't overwrite if they are on pass
        if (current !== "day_pass" && current !== "night_pass") {
          next[bed.bed_id] = {
            status: "present",
            tenant_id: bed.tenant_id,
          };
        }
      });
      return next;
    });
  };

  // Save & Sync all attendance
  const handleSaveAndSync = () => {
    startTransition(async () => {
      const itemsToSave: {
        tenant_id: string;
        bed_id: string;
        status: AttendanceStatus;
      }[] = [];

      filteredBuildings.forEach((b) => {
        b.floors.forEach((f) => {
          f.beds.forEach((bed) => {
            const entry = bedStatuses[bed.bed_id];
            if (entry) {
              itemsToSave.push({
                tenant_id: entry.tenant_id,
                bed_id: bed.bed_id,
                status: entry.status,
              });
            }
          });
        });
      });

      await saveAttendanceAction(itemsToSave);
      router.refresh();
      setSaveSuccessMsg("Attendance saved & synced live to all Tenant apps!");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    });
  };

  return (
    <div className="space-y-3.5 pb-20">
      {/* 1. Daily Roll Call Summary Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-extrabold text-slate-900">Daily Bed Roll Call</div>
          <div className="text-[10px] text-slate-400">Auto-detects active Day & Night passes</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-extrabold tabular-nums">
          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            {presentCnt} Present
          </span>
          <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            {passCnt} Pass
          </span>
          <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {absentCnt} Absent
          </span>
        </div>
      </div>

      {/* 2. Building Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {!isAdminScoped && (
          <button
            onClick={() => setSelectedBuildingId("all")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 border transition ${
              selectedBuildingId === "all"
                ? "bg-indigo-600 text-white border-transparent shadow-xs"
                : "bg-white text-slate-800 border-slate-200"
            }`}
          >
            All Buildings
          </button>
        )}

        {initialBuildings.map((b) => {
          const locked = isAdminScoped && assignedBuildingIds.length > 0 && !assignedBuildingIds.includes(b.building_id);
          const selected = selectedBuildingId === b.building_id;

          return (
            <button
              key={b.building_id}
              onClick={() => {
                if (!locked) setSelectedBuildingId(b.building_id);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 flex items-center gap-1 border transition ${
                selected
                  ? "bg-indigo-600 text-white border-transparent shadow-xs"
                  : locked
                  ? "opacity-50 bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-white text-slate-800 border-slate-200"
              }`}
            >
              <span>{b.building_name}</span>
              {locked && <Lock className="w-3 h-3 text-slate-400" />}
            </button>
          );
        })}
      </div>

      {/* 3. Building Sections -> Floor Sections -> Occupied Bed Rows */}
      <div className="space-y-3.5">
        {filteredBuildings.map((building) => (
          <div
            key={building.building_id}
            className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Building Header */}
            <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-extrabold">{building.building_name}</span>
              <span className="text-[10px] text-slate-300">
                {building.floors.length} Floors • {building.gender_type}
              </span>
            </div>

            {/* Floors List */}
            <div className="p-3.5 space-y-3">
              {building.floors.map((floor) => {
                const flPresent = floor.beds.filter(
                  (bed) => (bedStatuses[bed.bed_id]?.status || bed.status) === "present"
                ).length;

                return (
                  <div key={floor.floor_id} className="space-y-2">
                    {/* Floor Sub-header */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-extrabold text-slate-900">
                        {floor.floor_name}{" "}
                        <span className="text-emerald-700">
                          ({flPresent}/{floor.beds.length} Present)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMarkFloorRemainingPresent(floor.beds)}
                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9.5px] font-extrabold border border-emerald-200 active:scale-95 transition"
                      >
                        Mark Remaining Present
                      </button>
                    </div>

                    {/* Beds on Floor: 1 col mobile, 2 col md, 3 col lg, 4 col xl */}
                    {floor.beds.length === 0 ? (
                      <p className="text-[10.5px] text-slate-400 px-2">
                        No occupied beds on this floor.
                      </p>
                    ) : (
                      <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-3">
                        {floor.beds.map((bed) => {
                          const st = bedStatuses[bed.bed_id]?.status || bed.status;
                          const hasPass = bed.active_pass_type != null;

                          return (
                            <div
                              key={bed.bed_id}
                              className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:border-slate-300 transition flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-extrabold text-slate-900">
                                    {bed.tenant_name}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Room {bed.room_number} • {bed.bed_name}
                                  </div>
                                </div>
                                {hasPass && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                      bed.active_pass_type === "day_pass"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    }`}
                                  >
                                    Active {bed.active_pass_type === "day_pass" ? "Day Pass" : "Night Pass"}
                                  </span>
                                )}
                              </div>

                              {/* 4 Quick-Tap Attendance Status Pills */}
                              <div className="grid grid-cols-4 gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "present")}
                                  className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
                                    st === "present"
                                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
                                  }`}
                                >
                                  Present
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "absent")}
                                  className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
                                    st === "absent"
                                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
                                  }`}
                                >
                                  Absent
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "day_pass")}
                                  className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
                                    st === "day_pass"
                                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
                                  }`}
                                >
                                  Day Pass
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "night_pass")}
                                  className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
                                    st === "night_pass"
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
                                  }`}
                                >
                                  Night Pass
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save Success Toast */}
      {saveSuccessMsg && (
        <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Sticky Save & Sync Attendance Bottom Bar */}
      <div className="sticky bottom-20 z-20 pt-2">
        <button
          type="button"
          onClick={handleSaveAndSync}
          disabled={isPending}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isPending ? "Syncing to Student Apps..." : "Save & Sync Attendance to Tenant Apps"}</span>
        </button>
      </div>
    </div>
  );
}

`

================================================================================
// FILE: src/components/super-admin/SuperAdminDashboard.tsx
================================================================================
`tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
  Sparkles,
  Building2,
  Users,
  Megaphone,
  CreditCard,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  Crown,
  KeyRound,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { PgDetailItem } from "@/lib/data/pgs";
import { PlatformBroadcast, UserRole } from "@/types/schema.types";
import {
  SubscriptionPlanItem,
  DEFAULT_SUBSCRIPTION_PLANS,
} from "@/types/subscription.types";
import {
  PlatformBillingSettings,
  PgSubscriptionRequest,
  DEFAULT_PLATFORM_BILLING_SETTINGS,
} from "@/lib/data/billing-settings";
import { PlatformBillingCard } from "@/components/super-admin/PlatformBillingCard";
import { EditPgPlanModal } from "@/components/super-admin/EditPgPlanModal";
import { PgDetailsModal } from "@/components/super-admin/PgDetailsModal";
import { PlanManagementModal } from "@/components/super-admin/PlanManagementModal";
import { OnboardPgModal } from "@/components/super-admin/OnboardPgModal";
import { EditBrandingModal } from "@/components/super-admin/EditBrandingModal";
import { CredentialsGeneratedCard } from "@/components/auth/CredentialsGeneratedCard";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import {
  togglePgStatusAction,
  deletePgAction,
} from "@/app/actions/branding";
import { deleteSubscriptionPlanAction } from "@/app/actions/subscriptions";
import {
  createBroadcastAction,
  toggleBroadcastAction,
  deleteBroadcastAction,
} from "@/app/actions/passes-and-broadcasts";
import { switchDemoPersonaAction } from "@/app/actions/auth";

interface SuperAdminDashboardProps {
  pgs: PgDetailItem[];
  broadcasts: PlatformBroadcast[];
  plans?: SubscriptionPlanItem[];
  billingSettings?: PlatformBillingSettings;
  subscriptionRequests?: PgSubscriptionRequest[];
  initialTab?: "overview" | "pgs" | "broadcast" | "billing" | "settings";
}

export function SuperAdminDashboard({
  pgs: initialPgs,
  broadcasts: initialBroadcasts,
  plans: initialPlans,
  billingSettings,
  subscriptionRequests,
  initialTab = "overview",
}: SuperAdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useRealtimeSync([
    "pgs",
    "profiles",
    "subscription_plans",
    "platform_billing_settings",
    "pg_subscription_requests",
  ]);

  const tabFromQuery = searchParams?.get("tab") as
    | "overview"
    | "pgs"
    | "broadcast"
    | "billing"
    | "settings"
    | null;

  const currentTab = tabFromQuery || initialTab || "overview";
  const [activeTab, setActiveTab] = useState<
    "overview" | "pgs" | "broadcast" | "billing" | "settings"
  >(currentTab);
  const [pgsList, setPgsList] = useState<PgDetailItem[]>(initialPgs);
  const [broadcastsList, setBroadcastsList] = useState<PlatformBroadcast[]>(initialBroadcasts);
  const [plansList, setPlansList] = useState<SubscriptionPlanItem[]>(
    initialPlans && initialPlans.length > 0 ? initialPlans : DEFAULT_SUBSCRIPTION_PLANS
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PG deletion modal state
  const [pgToDelete, setPgToDelete] = useState<PgDetailItem | null>(null);
  const [isDeletingPg, setIsDeletingPg] = useState(false);

  // PG details and credentials modal state
  const [selectedPgForDetails, setSelectedPgForDetails] = useState<PgDetailItem | null>(null);

  // Sync with searchParams / bottom navigation
  useEffect(() => {
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  const handleTabChange = (
    newTab: "overview" | "pgs" | "broadcast" | "billing" | "settings"
  ) => {
    setActiveTab(newTab);
    router.push(`/super-admin?tab=${newTab}`, { scroll: false });
  };

  useEffect(() => {
    setPgsList(initialPgs);
  }, [initialPgs]);

  useEffect(() => {
    setBroadcastsList(initialBroadcasts);
  }, [initialBroadcasts]);

  useEffect(() => {
    if (initialPlans && initialPlans.length > 0) {
      setPlansList(initialPlans);
    }
  }, [initialPlans]);

  // New Onboarded Owner Credentials Banner state (null by default; populated on real PG onboarding)
  const [newOwnerCredentials, setNewOwnerCredentials] = useState<{
    pgName: string;
    email: string;
    tempPass: string;
    portalUrl: string;
  } | null>(null);

  // Broadcast Creator Form State
  const [targetOwner, setTargetOwner] = useState(true);
  const [targetAdmin, setTargetAdmin] = useState(false);
  const [targetTenant, setTargetTenant] = useState(false);
  const [bcTitle, setBcTitle] = useState("Rent Reminder Automation");
  const [bcMsg, setBcMsg] = useState(
    "1st-of-month automated WhatsApp rent reminders are scheduled for tomorrow 9:00 AM IST."
  );
  const [bcLoading, setBcLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  // Status toggle handler: sets PG membership status to suspended or active
  const handleToggleStatus = async (
    pgId: string,
    currentStatus: "active" | "pending" | "suspended"
  ) => {
    let nextStatus: "active" | "pending" | "suspended" = "active";
    if (currentStatus === "pending") {
      nextStatus = "active";
    } else if (currentStatus === "active") {
      nextStatus = "suspended";
    } else {
      nextStatus = "active";
    }

    // Optimistic UI update so status changes instantly
    setPgsList((prev) =>
      prev.map((p) => (p.id === pgId ? { ...p, status: nextStatus } : p))
    );

    try {
      const res = await togglePgStatusAction(pgId, nextStatus);
      if (res?.error) {
        // Rollback on server error
        setPgsList((prev) =>
          prev.map((p) => (p.id === pgId ? { ...p, status: currentStatus } : p))
        );
        showToast(`Failed: ${res.error}`);
        return;
      }

      showToast(
        nextStatus === "active"
          ? "PG Approved & Activated!"
          : "PG Membership Suspended"
      );
      router.refresh();
    } catch (err: any) {
      // Rollback on network/client error
      setPgsList((prev) =>
        prev.map((p) => (p.id === pgId ? { ...p, status: currentStatus } : p))
      );
      showToast(`Error: ${err?.message || "Failed to update PG status"}`);
    }
  };

  // Permanent Delete PG handler
  const handleConfirmDeletePg = async () => {
    if (!pgToDelete) return;
    setIsDeletingPg(true);
    const targetId = pgToDelete.id;
    const targetName = pgToDelete.name;

    // Optimistically remove from view
    setPgsList((prev) => prev.filter((p) => p.id !== targetId));

    try {
      const res = await deletePgAction(targetId);
      if (res?.error) {
        showToast(`Delete failed: ${res.error}`);
        setPgsList((prev) => [...prev, pgToDelete]);
        setIsDeletingPg(false);
        setPgToDelete(null);
        return;
      }

      showToast(`PG "${targetName}" and all associated data permanently deleted.`);
      router.refresh();
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to delete PG"}`);
    } finally {
      setIsDeletingPg(false);
      setPgToDelete(null);
    }
  };

  // Impersonate / switch to owner
  const handleViewAsOwner = async (pgName: string) => {
    showToast(`Impersonating ${pgName} Owner View...`);
    try {
      await switchDemoPersonaAction("owner");
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    }
  };

  // Push targeted broadcast
  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const roles: string[] = [];
    if (targetOwner) roles.push("owner");
    if (targetAdmin) roles.push("admin");
    if (targetTenant) roles.push("tenant");

    if (roles.length === 0) {
      showToast("Select at least 1 target role!");
      return;
    }

    if (!bcTitle.trim() || !bcMsg.trim()) return;

    setBcLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", bcTitle);
      fd.append("message", bcMsg);
      fd.append("priority", "info");
      roles.forEach((r) => fd.append("target_roles", r));

      await createBroadcastAction(fd);
      router.refresh();

      const newBc: PlatformBroadcast = {
        id: `bc-${Date.now()}`,
        title: bcTitle,
        message: bcMsg,
        priority: "info",
        target_roles: roles as UserRole[],
        is_active: true,
        starts_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      setBroadcastsList([newBc, ...broadcastsList]);
      showToast(`Broadcast pushed to: ${roles.join(", ").toUpperCase()}!`);
    } catch {
      showToast("Broadcast created!");
    } finally {
      setBcLoading(false);
    }
  };

  // Toggle broadcast status
  const handleToggleBroadcast = async (bcId: string) => {
    try {
      await toggleBroadcastAction(bcId);
      router.refresh();
      setBroadcastsList((prev) =>
        prev.map((b) => (b.id === bcId ? { ...b, is_active: !b.is_active } : b))
      );
      showToast("Broadcast status toggled.");
    } catch {
      setBroadcastsList((prev) =>
        prev.map((b) => (b.id === bcId ? { ...b, is_active: !b.is_active } : b))
      );
    }
  };

  // Permanently delete broadcast
  const handleDeleteBroadcast = async (bcId: string) => {
    const prevList = [...broadcastsList];
    setBroadcastsList((prev) => prev.filter((b) => b.id !== bcId));

    try {
      const res = await deleteBroadcastAction(bcId);
      if (res?.error) {
        setBroadcastsList(prevList);
        showToast(`Failed: ${res.error}`);
        return;
      }
      showToast("Broadcast message permanently deleted.");
      router.refresh();
    } catch {
      setBroadcastsList(prevList);
      showToast("Failed to delete broadcast announcement.");
    }
  };

  const activePgs = pgsList.filter((p) => p.status === "active");
  const totalMrr = activePgs.reduce((acc, p) => {
    const tier = p.subscription_tier;
    const val = tier === "Pro" ? 2499 : tier === "Enterprise" ? 4999 : tier === "Starter" ? 999 : 0;
    return acc + val;
  }, 14991); // Platform baseline MRR

  const totalBeds = pgsList.reduce((acc, p) => acc + (p.beds_count || 24), 295);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-2xl text-[11px] font-extrabold text-slate-600 border border-slate-200/80">
        <button
          type="button"
          onClick={() => handleTabChange("overview")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "overview"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("pgs")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "pgs"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          PGs ({pgsList.length})
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("broadcast")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "broadcast"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Broadcast
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("billing")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "billing"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Billing
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("settings")}
          className={`py-1.5 rounded-xl transition ${
            activeTab === "settings"
              ? "bg-white text-indigo-600 shadow-xs"
              : "hover:text-slate-900"
          }`}
        >
          Security
        </button>
      </div>

      {/* Instant Owner Credentials Card (with Copy & Send on WhatsApp) */}
      {newOwnerCredentials && (
        <CredentialsGeneratedCard
          name="Vikram Malhotra"
          role="owner"
          loginId={newOwnerCredentials.email}
          password={newOwnerCredentials.tempPass}
          phone="9822233441"
          email={newOwnerCredentials.email}
          pgName={newOwnerCredentials.pgName}
          onClose={() => setNewOwnerCredentials(null)}
        />
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-3">
          {/* MRR & Platform Beds KPI Cards (2 cols mobile, 4 cols desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Shuny Stays MRR
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-indigo-600 tabular-nums mt-1">
                ₹{totalMrr.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5">+28% MoM SaaS</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Active Platform Beds
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {totalBeds}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                Across {pgsList.length} White-Label PGs
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-emerald-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Hosted PG Brands
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">
                {pgsList.length}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                {pgsList.filter((p) => p.status === "active").length} Active / Live
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Actions
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-amber-600 tabular-nums mt-1">
                {pgsList.filter((p) => p.status === "pending").length + (subscriptionRequests?.length || 0)}
              </div>
              <div className="text-[10px] font-bold text-amber-600 mt-0.5">
                Approvals & Requests
              </div>
            </div>
          </div>

          {/* City Footprint Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900">City Footprint</h3>
            <div className="space-y-1.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-3 text-[11px]">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-700">Noida & Greater Noida</span>
                <strong className="text-slate-900">140 Beds</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-700">Gurugram Cyber Hub</span>
                <strong className="text-slate-900">95 Beds</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-700">Kota & Pune</span>
                <strong className="text-slate-900">70 Beds</strong>
              </div>
            </div>
          </div>

          {/* + Onboard New PG Button */}
          <OnboardPgModal
            triggerButton={
              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>+ Onboard White-Label PG & Custom Branding</span>
              </button>
            }
          />
        </div>
      )}

      {/* TAB 2: PGS DIRECTORY */}
      {activeTab === "pgs" && (
        <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-4">
          {pgsList.map((pg) => {
            const isSuspended = pg.status === "suspended";
            const isPending = pg.status === "pending";
            const isActive = pg.status === "active";
            const primaryColor = pg.primary_color || "#4F46E5";

            return (
              <div
                key={pg.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-sm hover:border-indigo-300 transition"
              >
                {/* CARD HEADER: LOGO, NAME, STATUS & DELETE */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => setSelectedPgForDetails(pg)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                    title="Click to view all PG details, login ID & password"
                  >
                    {pg.logo_url ? (
                      <img
                        src={pg.logo_url}
                        alt={pg.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs group-hover:scale-105 transition"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {pg.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-600 transition">
                          {pg.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {isActive ? "Active" : isPending ? "Pending" : "Suspended"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        /pg/{pg.slug} • {pg.owner_name} • {pg.subscription_tier}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPgToDelete(pg)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 border border-transparent hover:border-rose-200 transition shrink-0"
                    title="Permanently Delete PG"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* PLAN EXPIRY & PRICING BAR */}
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10.5px]">
                  <span className="font-medium text-slate-600 truncate">
                    Expires:{" "}
                    <strong className={pg.plan_expires_at && new Date(pg.plan_expires_at) < new Date() ? "text-rose-600" : "text-slate-800"}>
                      {pg.plan_expires_at
                        ? new Date(pg.plan_expires_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "30 Days"}
                    </strong>
                  </span>
                  <span className="font-extrabold text-indigo-600 shrink-0">
                    ₹{pg.plan_price || 1999}/mo
                  </span>
                </div>

                {/* ACTION BUTTONS ROW */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedPgForDetails(pg)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 text-[10.5px] font-extrabold border border-indigo-200 transition flex items-center justify-center gap-1.5 shadow-2xs"
                    title="View all details, phone, and password"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Details & Password</span>
                  </button>

                  <EditPgPlanModal pg={pg} />
                  <EditBrandingModal
                    pg={pg}
                    triggerButton={
                      <button
                        type="button"
                        className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-[10.5px] font-extrabold border border-slate-200 transition"
                      >
                        Branding
                      </button>
                    }
                  />
                </div>

                {/* OPERATION CONTROLS: SUSPEND / ACTIVATE & VIEW AS OWNER */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pg.id, "pending")}
                      className="py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-extrabold shadow-xs transition"
                    >
                      Approve PG
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(pg.id, pg.status)}
                      className={`py-2.5 sm:py-2 rounded-xl text-[11px] font-extrabold transition active:scale-95 border flex items-center justify-center gap-1.5 ${
                        isActive
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-600 text-white border-transparent hover:bg-emerald-500 shadow-xs"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3 h-3 text-rose-600" />
                          <span>Suspend PG</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-white" />
                          <span>Activate PG</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleViewAsOwner(pg.name)}
                    className="py-2.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold transition flex items-center justify-center gap-1"
                  >
                    <span>View as Owner</span>
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete PG Confirmation Modal */}
      {pgToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Permanently Delete PG?
                </h3>
                <p className="text-[11px] text-slate-400">
                  {pgToDelete.name} • /pg/{pgToDelete.slug}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                This action is destructive and CANNOT be undone.
              </p>
              <p className="text-[11px] leading-relaxed">
                Deleting this PG will permanently erase all associated buildings, rooms, beds, tenant leases, staff credentials, rent payments, security deposits, and complaints from PostgreSQL.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeletingPg}
                onClick={() => setPgToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPg}
                onClick={handleConfirmDeletePg}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/25 flex items-center gap-1.5 disabled:opacity-50 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingPg ? "Deleting PG & All Data..." : "Yes, Delete PG Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full PG Details & Generated Credentials Modal */}
      {selectedPgForDetails && (
        <PgDetailsModal
          pg={selectedPgForDetails}
          isOpen={!!selectedPgForDetails}
          onClose={() => setSelectedPgForDetails(null)}
          onPlanUpdated={(newExpiry, newPrice) => {
            setPgsList((prev) =>
              prev.map((p) =>
                p.id === selectedPgForDetails.id
                  ? { ...p, plan_expires_at: newExpiry, plan_price: newPrice }
                  : p
              )
            );
            setSelectedPgForDetails((prev) =>
              prev
                ? { ...prev, plan_expires_at: newExpiry, plan_price: newPrice }
                : null
            );
            showToast("Plan details updated successfully!");
          }}
          onStatusToggled={(newStatus) => {
            setPgsList((prev) =>
              prev.map((p) =>
                p.id === selectedPgForDetails.id ? { ...p, status: newStatus } : p
              )
            );
            setSelectedPgForDetails((prev) =>
              prev ? { ...prev, status: newStatus } : null
            );
            showToast(
              newStatus === "active"
                ? "PG Activated!"
                : "PG Membership Suspended"
            );
          }}
        />
      )}

      {/* TAB 3: BROADCAST */}
      {activeTab === "broadcast" && (
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Targeted Platform Broadcast Creator */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm h-fit">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">
                Targeted Platform Broadcast
              </h3>
              <p className="text-[10px] text-slate-400">
                Select exactly which roles receive this live banner
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Target Audience Roles
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-extrabold">
                <label className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetOwner}
                    onChange={(e) => setTargetOwner(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800">PG Owners</span>
                </label>
                <label className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetAdmin}
                    onChange={(e) => setTargetAdmin(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800">Wardens</span>
                </label>
                <label className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={targetTenant}
                    onChange={(e) => setTargetTenant(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <span className="text-slate-800">Tenants</span>
                </label>
              </div>
            </div>

            <form onSubmit={handlePublishBroadcast} className="space-y-2 text-xs">
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-indigo-500"
              />
              <textarea
                rows={2}
                value={bcMsg}
                onChange={(e) => setBcMsg(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-indigo-500"
              />
              <button
                type="submit"
                disabled={bcLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{bcLoading ? "Pushing Broadcast..." : "Push Targeted Broadcast Live"}</span>
              </button>
            </form>
          </div>

          {/* Active Platform Broadcasts List */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-900">
              Active Platform Broadcasts
            </h3>

            {broadcastsList.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    {b.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleBroadcast(b.id)}
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition border ${
                        b.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-200 text-slate-600 border-slate-300"
                      }`}
                    >
                      {b.is_active ? "Live" : "Paused"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBroadcast(b.id)}
                      title="Delete broadcast"
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500">{b.message}</p>
                <div className="flex gap-1 pt-0.5">
                  {b.target_roles.map((r) => (
                    <span
                      key={r}
                      className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[8.5px] font-extrabold uppercase"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BILLING & MEMBERSHIP PLANS */}
      {activeTab === "billing" && (
        <div className="space-y-3.5 animate-in fade-in">
          <PlatformBillingCard
            initialSettings={billingSettings || DEFAULT_PLATFORM_BILLING_SETTINGS}
            initialRequests={subscriptionRequests || []}
          />

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  SaaS Membership Plans & Pricing
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Super Admin can customize plan prices, update bed capacities, and add new tiers.
                </p>
              </div>

              <PlanManagementModal
                mode="create"
                onSuccess={(newPlan) => {
                  setPlansList((prev) => {
                    const idx = prev.findIndex((p) => p.id === newPlan.id);
                    if (idx !== -1) {
                      const updated = [...prev];
                      updated[idx] = newPlan;
                      return updated;
                    }
                    return [...prev, newPlan];
                  });
                  showToast(`Plan "${newPlan.name}" saved successfully!`);
                  router.refresh();
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {plansList.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3.5 rounded-2xl border transition-all relative ${
                    plan.badge
                      ? "border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 shadow-xs"
                      : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{plan.name}</h4>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-black text-indigo-600">
                          {plan.price === 0 ? "₹0 (Free)" : `₹${plan.price.toLocaleString("en-IN")}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          /{plan.billing_cycle === "14-days" ? "14 days" : plan.billing_cycle}
                        </span>
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-slate-500">
                        Up to {plan.max_beds} Beds
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <PlanManagementModal
                        plan={plan}
                        mode="edit"
                        onSuccess={(updatedPlan) => {
                          setPlansList((prev) =>
                            prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
                          );
                          showToast(`Plan "${updatedPlan.name}" updated!`);
                          router.refresh();
                        }}
                      />

                      {plan.id !== "free_trial" && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete plan "${plan.name}"?`)) {
                              setPlansList((prev) => prev.filter((p) => p.id !== plan.id));
                              await deleteSubscriptionPlanAction(plan.id);
                              showToast(`Plan "${plan.name}" deleted.`);
                              router.refresh();
                            }
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS & ACCOUNT SECURITY */}
      {activeTab === "settings" && (
        <div className="space-y-4 animate-in fade-in">
          <AccountSecurityCard
            role="super_admin"
            currentEmail="superadmin@apnapg.com"
            currentPhone="9999900001"
          />
        </div>
      )}

      {/* Platform Governance Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <ShunyStaysEmblem className="w-3.5 h-3.5" rounded={true} />
          <span>Shuny Stays SaaS Engine</span>
          <span className="text-slate-400">• v2.4 Production</span>
        </div>
      </footer>
    </div>
  );
}

`

================================================================================
// FILE: src/components/super-admin/PgDetailsModal.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  RefreshCw,
  KeyRound,
  Calendar,
  ShieldCheck,
  MapPin,
  Palette,
  BedDouble,
  Users,
  CheckCircle2,
  X,
  Edit3,
  ArrowRight,
  Pause,
  Play,
  Save,
  Clock,
  Crown,
  Utensils,
  Power,
} from "lucide-react";
import { PgDetailItem } from "@/lib/data/pgs";
import {
  resetPgOwnerPasswordAction,
  togglePgStatusAction,
} from "@/app/actions/branding";
import { updatePgPlanDetailsAction } from "@/app/actions/billing";
import { switchDemoPersonaAction } from "@/app/actions/auth";
import { togglePgMealPollFacilityAction } from "@/app/actions/meal-polls";

interface PgDetailsModalProps {
  pg: PgDetailItem;
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated?: (newExpiry: string, newPrice: number) => void;
  onStatusToggled?: (newStatus: "active" | "pending" | "suspended") => void;
}

export function PgDetailsModal({
  pg,
  isOpen,
  onClose,
  onPlanUpdated,
  onStatusToggled,
}: PgDetailsModalProps) {
  const router = useRouter();

  // Password state
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(
    pg.owner_initial_password || "Shuny@2026"
  );
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  // Status state
  const [currentStatus, setCurrentStatus] = useState(pg.status);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Copy tracking states
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Inline Edit Plan state
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const defaultDateStr = pg.plan_expires_at
    ? new Date(pg.plan_expires_at).toISOString().split("T")[0]
    : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
  const [planExpiryDate, setPlanExpiryDate] = useState(defaultDateStr);
  const [planPrice, setPlanPrice] = useState(pg.plan_price || 1999);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState<string | null>(null);

  // Meal Poll Facility Master Switch state
  const [mealPollEnabled, setMealPollEnabled] = useState<boolean>(
    pg.meal_poll_enabled !== false
  );
  const [isTogglingFacility, setIsTogglingFacility] = useState(false);
  const [facilityToast, setFacilityToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleMealFacility = async () => {
    setIsTogglingFacility(true);
    const nextState = !mealPollEnabled;
    try {
      const res = await togglePgMealPollFacilityAction(pg.id, nextState);
      if (res.error) {
        setFacilityToast(`Error: ${res.error}`);
      } else {
        setMealPollEnabled(nextState);
        setFacilityToast(
          nextState
            ? "✅ Lunch Headcount & Meal Poll Facility Activated!"
            : "❌ Lunch Headcount & Meal Poll Facility Disabled."
        );
        router.refresh();
      }
    } catch (err: any) {
      setFacilityToast(`Error: ${err?.message || "Failed to update facility"}`);
    } finally {
      setIsTogglingFacility(false);
      setTimeout(() => setFacilityToast(null), 3500);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleRegeneratePassword = async () => {
    if (
      !confirm(
        `Are you sure you want to regenerate a new password for "${pg.name}"? The owner will need the new password to log in.`
      )
    ) {
      return;
    }

    setIsResettingPassword(true);
    setPasswordToast(null);

    try {
      const res = await resetPgOwnerPasswordAction(pg.id);
      if (res?.error) {
        setPasswordToast(`Error: ${res.error}`);
      } else if (res?.newPassword) {
        setCurrentPassword(res.newPassword);
        setShowPassword(true);
        navigator.clipboard.writeText(res.newPassword);
        setPasswordToast("New password generated & copied to clipboard!");
        router.refresh();
      }
    } catch (err: any) {
      setPasswordToast(`Error: ${err?.message || "Failed to reset password"}`);
    } finally {
      setIsResettingPassword(false);
      setTimeout(() => setPasswordToast(null), 4000);
    }
  };

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    let nextStatus: "active" | "pending" | "suspended" = "active";
    if (currentStatus === "active") nextStatus = "suspended";
    else nextStatus = "active";

    try {
      const res = await togglePgStatusAction(pg.id, nextStatus);
      if (res?.error) {
        alert(`Status update failed: ${res.error}`);
      } else {
        setCurrentStatus(nextStatus);
        if (onStatusToggled) onStatusToggled(nextStatus);
        router.refresh();
      }
    } catch (err: any) {
      alert(`Error: ${err?.message || "Failed to update status"}`);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    setPlanError(null);
    setPlanSuccess(null);

    try {
      const isoExpiry = new Date(`${planExpiryDate}T23:59:59.000Z`).toISOString();
      const res = await updatePgPlanDetailsAction(
        pg.id,
        isoExpiry,
        Number(planPrice)
      );

      if (res?.error) {
        setPlanError(res.error);
      } else {
        setPlanSuccess("Plan updated successfully!");
        if (onPlanUpdated) {
          onPlanUpdated(isoExpiry, Number(planPrice));
        }
        setIsEditingPlan(false);
        router.refresh();
        setTimeout(() => setPlanSuccess(null), 3000);
      }
    } catch (err: any) {
      setPlanError(err?.message || "Failed to save plan details.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleViewAsOwner = async () => {
    try {
      await switchDemoPersonaAction("owner");
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    }
  };

  // Expiry calculation
  const expiryDateObj = pg.plan_expires_at ? new Date(pg.plan_expires_at) : null;
  const isExpired = expiryDateObj ? expiryDateObj < new Date() : false;
  const daysRemaining = expiryDateObj
    ? Math.ceil((expiryDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 30;

  const cleanPhone = (pg.contact_phone || "").replace(/\D/g, "").slice(-10);
  const portalUrl = `https://shunystays.com/pg/${pg.slug}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92dvh] sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MOBILE DRAG HANDLE */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* MODAL HEADER */}
        <div className="px-4 py-3 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {pg.logo_url ? (
              <img
                src={pg.logo_url}
                alt={pg.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0 bg-white"
              />
            ) : (
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shrink-0 border-2 border-white/20"
                style={{ backgroundColor: pg.primary_color || "#4F46E5" }}
              >
                {pg.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white truncate max-w-[170px] sm:max-w-none">
                  {pg.name}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                    currentStatus === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : currentStatus === "pending"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {currentStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 hidden xs:inline-flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5 text-amber-300" />
                  {pg.subscription_tier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-0.5 truncate">
                <span className="font-mono">/pg/{pg.slug}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {pg.city || "Bengaluru"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 text-slate-300 hover:text-white transition flex items-center justify-center shrink-0"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-slate-800 dark:text-slate-200 text-xs phone-scroll">
          {/* SECTION 1: PG OWNER CREDENTIALS & LOGIN PASSWORD */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-200/90 dark:border-indigo-800/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-indigo-950 dark:text-indigo-200 truncate">
                    Owner Login Credentials & Password
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Used by PG Owner to log into dashboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRegeneratePassword}
                disabled={isResettingPassword}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs transition shrink-0"
                title="Generate fresh password and update Supabase Auth"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isResettingPassword ? "animate-spin" : ""}`}
                />
                <span className="hidden xs:inline">Reset / </span>
                <span>Regenerate</span>
              </button>
            </div>

            {passwordToast && (
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 font-bold text-[11px] flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{passwordToast}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* Login ID / Mobile */}
              <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/90 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Owner Mobile / Login ID
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm sm:text-base select-all tracking-wide">
                    {cleanPhone || pg.contact_phone}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(cleanPhone || pg.contact_phone, "login_id")
                    }
                    className="p-2 sm:p-1.5 rounded-lg hover:bg-slate-100 active:scale-90 text-slate-500 hover:text-indigo-600 transition"
                    title="Copy Login ID"
                  >
                    {copiedField === "login_id" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Generated Password
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-black text-indigo-900 dark:text-indigo-200 text-sm sm:text-base select-all tracking-wider break-all">
                    {showPassword ? currentPassword : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 sm:p-1.5 rounded-lg hover:bg-slate-100 active:scale-90 text-slate-500 hover:text-indigo-600 transition"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentPassword, "password")}
                      className="p-2 sm:p-1.5 rounded-lg hover:bg-slate-100 active:scale-90 text-slate-500 hover:text-indigo-600 transition"
                      title="Copy Password"
                    >
                      {copiedField === "password" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Email & Auth Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] pt-0.5">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">Owner:</span>
                <strong className="text-slate-900 dark:text-white truncate">
                  {pg.owner_name}
                </strong>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400">Email:</span>
                <strong className="text-slate-900 dark:text-white truncate select-all">
                  {pg.contact_email}
                </strong>
              </div>
            </div>
          </div>

          {/* SECTION 2: INITIAL DETAILS ENTERED AT PG ONBOARDING */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full PG Brand & Property Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  PG Name
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                  {pg.name}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  City / Location
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                  {pg.city || "Bengaluru"}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Brand Color
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className="w-3.5 h-3.5 rounded-md border border-slate-300 shrink-0 shadow-2xs"
                    style={{ backgroundColor: pg.primary_color || "#4F46E5" }}
                  />
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                    {pg.primary_color || "#4F46E5"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Buildings
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs">
                  {pg.buildings_count} Wing
                </p>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Total Capacity
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 text-xs">
                  <BedDouble className="w-3 h-3 text-indigo-500" />
                  {pg.beds_count} Beds
                </p>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  Active Residents
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3 text-emerald-500" />
                  {pg.residents_count} Tenants
                </p>
              </div>
            </div>

            {/* Custom URL & White-label Portal Link */}
            <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">
                  Resident Portal URL
                </span>
                <p className="font-mono text-slate-800 dark:text-slate-200 truncate font-semibold text-[11px] sm:text-xs">
                  {portalUrl}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(portalUrl, "portal_url")}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 active:scale-95 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  title="Copy URL"
                >
                  {copiedField === "portal_url" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Link</span>
                </button>
                <a
                  href={`/pg/${pg.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 active:scale-95 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* SECTION 2.5: MEAL POLL & FOOD WASTAGE FACILITY SWITCH */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    Meal Poll & Food Wastage Facility (Master Switch)
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    Allow this PG to use auto-lunch poll (06:00 AM) & headcount system
                  </p>
                </div>
              </div>

              {/* Master Switch Button */}
              <button
                type="button"
                onClick={handleToggleMealFacility}
                disabled={isTogglingFacility}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-2xs ${
                  mealPollEnabled
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                    : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>
                  {isTogglingFacility
                    ? "Updating..."
                    : mealPollEnabled
                    ? "Facility: Enabled"
                    : "Facility: Disabled"}
                </span>
              </button>
            </div>

            {facilityToast && (
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 text-indigo-900 dark:text-indigo-200 font-bold text-[11px] flex items-center gap-1.5 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{facilityToast}</span>
              </div>
            )}

            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-slate-300">
                Current Access Status:{" "}
                <strong className={mealPollEnabled ? "text-emerald-600" : "text-rose-600"}>
                  {mealPollEnabled ? "Active & Running (06:00 AM Daily Auto-Start)" : "Access Revoked (Hidden from Portal)"}
                </strong>
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {mealPollEnabled ? "Zero Food Waste ON" : "No Headcount"}
              </span>
            </div>
          </div>

          {/* SECTION 3: SUBSCRIPTION PLAN & EDIT PLAN */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    Subscription & Renewal Plan
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    Expiry date, monthly pricing, and benefits
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingPlan(!isEditingPlan)}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 active:scale-95 text-slate-800 dark:text-white text-[10px] font-extrabold flex items-center gap-1 transition shadow-2xs shrink-0"
              >
                <Edit3 className="w-3 h-3 text-indigo-600" />
                <span>{isEditingPlan ? "Cancel" : "Edit Plan"}</span>
              </button>
            </div>

            {planSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{planSuccess}</span>
              </div>
            )}

            {planError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-800 dark:text-rose-200 font-bold text-[11px]">
                {planError}
              </div>
            )}

            {/* INLINE EDIT PLAN FORM */}
            {isEditingPlan ? (
              <form
                onSubmit={handleSavePlan}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Plan Expiry Date
                    </label>
                    <input
                      type="date"
                      value={planExpiryDate}
                      onChange={(e) => setPlanExpiryDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-base sm:text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">
                      Monthly Price (₹)
                    </label>
                    <input
                      type="number"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(Number(e.target.value))}
                      required
                      min={0}
                      step={50}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-base sm:text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingPlan(false)}
                    className="px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPlan}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingPlan ? "Saving..." : "Save Plan Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* PLAN DISPLAY SUMMARY */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Plan Expiry
                  </span>
                  <div className="flex items-center justify-between sm:block mt-0.5">
                    <p
                      className={`font-black text-xs sm:text-sm ${
                        isExpired ? "text-rose-600" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {expiryDateObj
                        ? expiryDateObj.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "30 Days"}
                    </p>
                    <span
                      className={`inline-block sm:mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isExpired
                          ? "bg-rose-50 text-rose-700"
                          : daysRemaining <= 5
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isExpired
                        ? "Expired"
                        : `${daysRemaining} days left`}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Plan Price
                  </span>
                  <div className="flex items-center justify-between sm:block mt-0.5">
                    <p className="font-black text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                      ₹{pg.plan_price || 1999}
                      <span className="text-[9px] font-normal text-slate-400">
                        /month
                      </span>
                    </p>
                    <span className="text-[9px] font-medium text-slate-400">
                      UPI / Bank
                    </span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">
                    Tier & Onboarding
                  </span>
                  <div className="flex items-center justify-between sm:block mt-0.5">
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {pg.subscription_tier}
                    </p>
                    <span className="text-[9px] text-slate-400">
                      Joined:{" "}
                      {new Date(pg.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Benefits Checklist */}
            <div className="pt-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1.5">
                Active Plan Benefits
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(pg.plan_benefits || [
                  "Full White-label Branding & Custom Domain",
                  "Automated WhatsApp Rent Reminders",
                  "Live Attendance & Gate Pass System",
                  "2-Step Cash & UPI Ledger Settlement",
                  "Multi-Building & Multi-Warden Controls",
                ]).map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`flex-1 sm:flex-none px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                currentStatus === "active"
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
              }`}
            >
              {currentStatus === "active" ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-rose-600" />
                  <span>Suspend PG</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-white" />
                  <span>Activate PG</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleViewAsOwner}
              className="flex-1 sm:flex-none px-3.5 py-2.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>Login as Owner</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

`

================================================================================
// FILE: src/components/mess/AdminMealPollCard.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Power,
  RefreshCw,
  Sparkles,
  Phone,
  DoorOpen,
  ChevronRight,
  Flame,
  ShieldAlert,
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  MealPollSummary,
  MealPollHistoryItem,
  TenantHeadcountItem,
} from "@/types/meal-poll.types";
import {
  toggleMealPollAction,
  updateMealScheduleAction,
} from "@/app/actions/meal-polls";

interface AdminMealPollCardProps {
  summary: MealPollSummary;
  history?: MealPollHistoryItem[];
  pgId: string;
}

export function AdminMealPollCard({
  summary: initialSummary,
  history = [],
  pgId,
}: AdminMealPollCardProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<MealPollSummary>(initialSummary);
  const [mainView, setMainView] = useState<"live" | "history">("live");
  const [activeTab, setActiveTab] = useState<"yes" | "no" | "not_answered">("yes");
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [historySubTab, setHistorySubTab] = useState<"yes" | "no" | "not_answered">("yes");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const poll = summary.poll;
  const isPollActive = poll?.is_active ?? true;
  const isExpired = summary.isCutoffPassed;
  const startTime = poll?.start_time || summary.startTime || "06:00";
  const cutoffTime = poll?.cutoff_time || summary.cutoffTime || "10:00";
  const scheduleStatus = summary.scheduleStatus || (isExpired ? "closed" : "open");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTogglePoll = async () => {
    setIsUpdating(true);
    const nextActive = !isPollActive;

    try {
      const res = await toggleMealPollAction(pgId, nextActive, startTime, cutoffTime);
      if (res.error) {
        showToast(`Failed: ${res.error}`);
      } else {
        showToast(
          nextActive
            ? `Lunch Poll Active! (${startTime} AM - ${cutoffTime} AM)`
            : "Lunch Poll Paused for today"
        );
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to toggle poll"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeStartTime = async (newStart: string) => {
    setIsUpdating(true);
    try {
      const res = await updateMealScheduleAction(pgId, newStart, cutoffTime);
      if (res.error) {
        showToast(`Failed: ${res.error}`);
      } else {
        showToast(`Start time updated to ${newStart} AM!`);
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to update start time"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeCutoff = async (newCutoff: string) => {
    setIsUpdating(true);
    try {
      const res = await updateMealScheduleAction(pgId, startTime, newCutoff);
      if (res.error) {
        showToast(`Failed: ${res.error}`);
      } else {
        showToast(`Cut-off deadline updated to ${newCutoff} AM!`);
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to update cut-off"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // If Super Admin disabled the facility for this PG
  if (summary.isFacilityEnabled === false) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black shrink-0 border border-amber-200/50">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Meal Poll & Food Wastage Prevention
            </h2>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              Facility Disabled by Super Admin
            </p>
          </div>
        </div>
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          Ye facility Super Admin dwara is PG ke liye deactivate ki gayi hai. Rozana automatic lunch headcount poll aur zero-wastage system chalu karne ke liye Super Admin se activate karwayein.
        </div>
      </div>
    );
  }

  const currentTabList: TenantHeadcountItem[] =
    activeTab === "yes"
      ? summary.yesList
      : activeTab === "no"
      ? summary.noList
      : summary.notAnsweredList;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* TOP BAR: VIEW TOGGLE (TODAY'S POLL vs HISTORY) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setMainView("live")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              mainView === "live"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-amber-500" />
            <span>Today&apos;s Live Poll</span>
          </button>

          <button
            type="button"
            onClick={() => setMainView("history")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              mainView === "history"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>Poll History {history.length > 0 ? `(${history.length})` : ""}</span>
          </button>
        </div>

        {/* Status indicator on top right */}
        {mainView === "live" && (
          <span
            className={`px-2.5 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider shrink-0 border ${
              !isPollActive
                ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                : scheduleStatus === "upcoming"
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300"
                : scheduleStatus === "open"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 animate-pulse"
                : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {!isPollActive
              ? "Paused"
              : scheduleStatus === "upcoming"
              ? `Opens at ${startTime} AM`
              : scheduleStatus === "open"
              ? "🟢 Live Voting Active"
              : `Closed (${cutoffTime} AM passed)`}
          </span>
        )}
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 text-indigo-900 dark:text-indigo-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===================== VIEW 1: TODAY'S LIVE POLL ===================== */}
      {mainView === "live" ? (
        <div className="space-y-4">
          {/* HEADER ROW WITH SCHEDULE & PAUSE/RESUME */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Dopahar Ka Khana (Lunch Headcount)
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Auto-Schedule: <strong>{startTime} AM to {cutoffTime} AM IST</strong>
                </span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  <Flame className="w-3 h-3" /> Zero Food Wastage
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleTogglePoll}
              disabled={isUpdating}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-xs shrink-0 ${
                isPollActive
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isUpdating ? "Updating..." : isPollActive ? "Pause Today" : "Resume Poll"}</span>
            </button>
          </div>

          {/* TIME CONFIGURATION CONTROLS (START TIME & CUT-OFF TIME) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* START TIME PRESETS */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-600" />
                <span>Auto-Start Time:</span>
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {["06:00", "06:30", "07:00", "07:30", "08:00"].map((timeStr) => (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => handleChangeStartTime(timeStr)}
                    disabled={isUpdating || startTime === timeStr}
                    className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition active:scale-95 ${
                      startTime === timeStr
                        ? "bg-indigo-600 text-white border-transparent shadow-xs"
                        : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {timeStr} AM {timeStr === "06:00" ? "(Def)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* CUT-OFF TIME PRESETS */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Cut-off Deadline:</span>
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {["09:30", "10:00", "10:30", "11:00"].map((timeStr) => (
                  <button
                    key={timeStr}
                    type="button"
                    onClick={() => handleChangeCutoff(timeStr)}
                    disabled={isUpdating || cutoffTime === timeStr}
                    className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition active:scale-95 ${
                      cutoffTime === timeStr
                        ? "bg-amber-600 text-white border-transparent shadow-xs"
                        : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {timeStr} AM {timeStr === "10:00" ? "(Def)" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* YES: Total Food to prepare */}
            <div
              onClick={() => setActiveTab("yes")}
              className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
                activeTab === "yes"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  YES (Confirmed)
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                {summary.totalYes}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                🍽️ Plates to Prepare
              </div>
            </div>

            {/* NO: Opted Out */}
            <div
              onClick={() => setActiveTab("no")}
              className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
                activeTab === "no"
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  NO (Opted Out)
                </span>
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                {summary.totalNo}
              </div>
              <div className="text-[10px] text-rose-700 font-bold mt-0.5">
                ❌ Skip Lunch
              </div>
            </div>

            {/* NOT ANSWERED: Auto-considered NO */}
            <div
              onClick={() => setActiveTab("not_answered")}
              className={`p-3 rounded-2xl border cursor-pointer transition active:scale-98 ${
                activeTab === "not_answered"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Not Answered
                </span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                {summary.totalNotAnswered}
              </div>
              <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                ⚠️ Counted as NO
              </div>
            </div>

            {/* TOTAL RESIDENTS */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Total Residents
                </span>
                <Users className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                {summary.totalTenants}
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                Active in PG
              </div>
            </div>
          </div>

          {/* 3 HEADCOUNT SECTIONS / TABS */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setActiveTab("yes")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === "yes"
                    ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>YES ({summary.totalYes})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("no")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === "no"
                    ? "bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>NO ({summary.totalNo})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("not_answered")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === "not_answered"
                    ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>NOT ANSWERED ({summary.totalNotAnswered})</span>
              </button>
            </div>

            {/* TENANT LIST CARDS */}
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto phone-scroll pr-0.5">
              {currentTabList.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Koi bhi tenant is category me nahi hai.
                </div>
              ) : (
                currentTabList.map((tenant) => (
                  <div
                    key={tenant.tenantId}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {tenant.fullName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {tenant.roomNumber} {tenant.bedName}
                        </span>
                      </div>
                      {tenant.phone && (
                        <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{tenant.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                          tenant.vote === "yes"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : tenant.vote === "no"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {tenant.vote === "yes" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Eating Lunch</span>
                          </>
                        ) : tenant.vote === "no" ? (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Not Eating</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>No Response (Default NO)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ===================== VIEW 2: DATE-WISE MEAL POLL HISTORY ===================== */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Past Daily Poll Records (Tap any date to inspect)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">
              Total {history.length} Days Recorded
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              Abhi tak koi purana poll history record nahi mila.
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((record) => {
                const isExpanded = expandedHistoryId === record.id;
                const formattedDate = new Date(record.pollDate + "T12:00:00Z").toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );

                const listToDisplay =
                  historySubTab === "yes"
                    ? record.yesList
                    : historySubTab === "no"
                    ? record.noList
                    : record.notAnsweredList;

                return (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition"
                  >
                    {/* ACCORDION HEADER (COMPACT PREVIEW) */}
                    <div
                      onClick={() =>
                        setExpandedHistoryId(isExpanded ? null : record.id)
                      }
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {formattedDate}
                          </div>
                          <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                            <span>Schedule: {record.startTime} AM - {record.cutoffTime} AM</span>
                            <span>•</span>
                            <span>{record.totalTenants} Residents</span>
                          </div>
                        </div>
                      </div>

                      {/* QUICK METRICS CHIPS */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10.5px] border border-emerald-200 dark:border-emerald-800">
                          🍽️ {record.totalYes} Plates
                        </span>
                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                          ❌ {record.totalNo} No
                        </span>
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED FULL BREAKDOWN */}
                    {isExpanded && (
                      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 animate-in fade-in">
                        {/* 3 TABS FOR THIS HISTORICAL DATE */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setHistorySubTab("yes")}
                            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
                              historySubTab === "yes"
                                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                                : "text-slate-500"
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>YES ({record.totalYes})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setHistorySubTab("no")}
                            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
                              historySubTab === "no"
                                ? "bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-2xs"
                                : "text-slate-500"
                            }`}
                          >
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>NO ({record.totalNo})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setHistorySubTab("not_answered")}
                            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition flex items-center justify-center gap-1 ${
                              historySubTab === "not_answered"
                                ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-2xs"
                                : "text-slate-500"
                            }`}
                          >
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Unanswered ({record.totalNotAnswered})</span>
                          </button>
                        </div>

                        {/* LIST OF TENANTS FOR THIS TAB */}
                        <div className="space-y-1.5 max-h-[240px] overflow-y-auto phone-scroll pr-0.5">
                          {listToDisplay.length === 0 ? (
                            <div className="text-center py-4 text-slate-400 text-xs">
                              Koi bhi tenant is category me nahi tha.
                            </div>
                          ) : (
                            listToDisplay.map((t) => (
                              <div
                                key={t.tenantId}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                      {t.fullName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                      {t.roomNumber} {t.bedName}
                                    </span>
                                  </div>
                                  {t.phone && (
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      {t.phone}
                                    </div>
                                  )}
                                </div>

                                <div className="shrink-0 text-right">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-md text-[9.5px] font-extrabold ${
                                      t.vote === "yes"
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                        : t.vote === "no"
                                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                    }`}
                                  >
                                    {t.vote === "yes"
                                      ? "Confirmed Eating"
                                      : t.vote === "no"
                                      ? "Skipped"
                                      : "Defaulted to NO"}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

`

================================================================================
// FILE: src/components/mess/TenantMealPollCard.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Flame,
  Check,
  Zap,
} from "lucide-react";
import { MealPoll } from "@/types/meal-poll.types";
import { voteMealPollAction } from "@/app/actions/meal-polls";

interface TenantMealPollCardProps {
  poll: MealPoll | null;
  isCutoffPassed: boolean;
  initialVote: "yes" | "no" | null;
  tenantId: string;
  scheduleStatus?: "upcoming" | "open" | "closed";
}

export function TenantMealPollCard({
  poll,
  isCutoffPassed,
  initialVote,
  tenantId,
  scheduleStatus = isCutoffPassed ? "closed" : "open",
}: TenantMealPollCardProps) {
  const router = useRouter();
  const [currentVote, setCurrentVote] = useState<"yes" | "no" | null>(initialVote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!poll || !poll.is_active) {
    return null;
  }

  const startTime = poll.start_time || "06:00";
  const cutoffTime = poll.cutoff_time || "10:00";
  const isUpcoming = scheduleStatus === "upcoming";
  const canVote = poll.is_active && !isCutoffPassed && scheduleStatus === "open";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleVote = async (choice: "yes" | "no") => {
    if (!canVote || isSubmitting) return;

    // Optimistic UI update
    setCurrentVote(choice);
    setIsSubmitting(true);

    try {
      const res = await voteMealPollAction(poll.id, choice, tenantId);
      if (res.error) {
        showToast(`Error: ${res.error}`);
        setCurrentVote(initialVote);
      } else {
        showToast(
          choice === "yes"
            ? "✅ Lunch confirmed for today!"
            : "❌ Noted: You are skipping lunch today."
        );
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to submit vote"}`);
      setCurrentVote(initialVote);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 border border-amber-200/90 dark:border-amber-800/60 shadow-sm space-y-3.5">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
              Dopahar Ka Khana (Lunch Poll)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Cut-off Deadline: <strong>{cutoffTime} AM IST</strong></span>
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider shrink-0 border ${
            isUpcoming
              ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300"
              : canVote
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 animate-pulse"
              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {isUpcoming ? `Opens at ${startTime} AM` : canVote ? "Voting Open" : "Poll Closed"}
        </span>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-300 text-slate-900 dark:text-white text-xs font-bold animate-in fade-in flex items-center gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UPCOMING STATE (BEFORE START TIME) */}
      {isUpcoming ? (
        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
          <div className="font-extrabold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Poll subah {startTime} AM par open hoga</span>
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-normal">
            Aap subah {startTime} AM se {cutoffTime} AM ke beech me lunch ke liye apna YES ya NO vote submit kar sakenge.
          </p>
        </div>
      ) : canVote ? (
        /* VOTING STATE (BETWEEN 06:00 AM AND CUTOFF) */
        <div className="space-y-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Kya aap aaj PG me lunch khayenge? Please vote before <strong>{cutoffTime} AM</strong>:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* YES BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVote("yes")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-xs ${
                currentVote === "yes"
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <CheckCircle2 className={`w-4 h-4 ${currentVote === "yes" ? "text-white" : "text-emerald-600"}`} />
                <span>Haan, Khana Hai</span>
              </div>
              <span className={`text-[10px] ${currentVote === "yes" ? "text-emerald-100 font-bold" : "text-slate-400"}`}>
                {currentVote === "yes" ? "✓ Confirmed Eating" : "Tap to Vote YES"}
              </span>
            </button>

            {/* NO BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVote("no")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-xs ${
                currentVote === "no"
                  ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <XCircle className={`w-4 h-4 ${currentVote === "no" ? "text-white" : "text-rose-600"}`} />
                <span>Nahi Khana</span>
              </div>
              <span className={`text-[10px] ${currentVote === "no" ? "text-rose-100 font-bold" : "text-slate-400"}`}>
                {currentVote === "no" ? "✓ Opted Out" : "Tap to Vote NO"}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-0.5">
            <span>Aap {cutoffTime} AM se pehle apna vote change kar sakte hain.</span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" /> Zero Wastage
            </span>
          </div>
        </div>
      ) : (
        /* CLOSED STATE (AFTER 10:00 AM) */
        <div className="space-y-2 pt-1">
          <div className="p-3 rounded-2xl border text-xs font-bold flex items-start gap-2.5">
            {currentVote === "yes" ? (
              <div className="w-full flex items-start gap-2 text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne YES vote kiya tha</div>
                  <div className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Aapka dopahar ka lunch confirm ho chuka hai. Khana 12:30 PM par mess me serve hoga.
                  </div>
                </div>
              </div>
            ) : currentVote === "no" ? (
              <div className="w-full flex items-start gap-2 text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne NO vote kiya tha</div>
                  <div className="text-[11px] font-normal text-rose-700 dark:text-rose-300 mt-0.5">
                    Aapka lunch skip kar diya gaya hai.
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-start gap-2 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne vote nahi kiya tha</div>
                  <div className="text-[11px] font-normal text-amber-700 dark:text-amber-300 mt-0.5">
                    {cutoffTime} AM cut-off tak vote na aane par food wastage rokne ke liye rule ke mutabiq aapka vote automatically <strong>NO (Not Eating)</strong> mark kiya gaya hai.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

`

================================================================================
// FILE: src/components/tenant/TenantHomeExplorer.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
  Sparkles,
  IdCard,
  QrCode,
  Ticket,
  Wifi,
  Utensils,
  CreditCard,
  CheckCircle2,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  UploadCloud,
  Check,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { GatePassItem, PlatformBroadcast } from "@/types/schema.types";
import { ActiveBroadcastBanner } from "@/components/broadcasts/ActiveBroadcastBanner";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { DepositReceiptModal } from "@/components/tenant/DepositReceiptModal";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { SecurityDepositItem, RentPaymentRecord } from "@/lib/data/rooms";
import { TenantMealPollCard } from "@/components/mess/TenantMealPollCard";
import { MealPoll } from "@/types/meal-poll.types";
import {
  submitTenantUpiScreenshotAction,
  verifySelfKycAction,
} from "@/app/actions/rooms-and-ops";

interface TenantHomeExplorerProps {
  session: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    room_id?: string | null;
    building_id?: string | null;
  };
  pg: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
    primary_color: string;
    city: string;
    contact_phone?: string;
  };
  passes: GatePassItem[];
  attendance: {
    todayStatus: "present" | "absent" | "day_pass" | "night_pass";
    markedAt: string;
    markedBy: string;
    history: { date: string; status: string; note?: string }[];
  };
  messMenu: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  initialDinnerPoll?: "Yes" | "No";
  initialKycStatus?: "Verified" | "Pending";
  roomNumber?: string;
  buildingName?: string;
  rentAmount?: number;
  rentPaid?: boolean;
  depositAmount?: number;
  depositDetails?: SecurityDepositItem | null;
  invoices?: RentPaymentRecord[];
  upiId?: string;
  wifiName?: string;
  wifiPass?: string;
  broadcasts?: PlatformBroadcast[];
  mealPollStatus?: {
    poll: MealPoll | null;
    isCutoffPassed: boolean;
    scheduleStatus?: "upcoming" | "open" | "closed";
    tenantVote: "yes" | "no" | null;
    canVote: boolean;
    statusMessage: string;
  } | null;
}

export function TenantHomeExplorer({
  session,
  pg,
  passes,
  attendance,
  messMenu,
  initialKycStatus = "Pending",
  roomNumber = "Room 101 • Bed A",
  buildingName = "Block A - Krishna Bhawan",
  rentAmount = 8500,
  rentPaid = false,
  depositAmount = 8500,
  depositDetails,
  invoices = [],
  upiId = "royalstay@okicici",
  wifiName = "ROYAL_5G_RESIDENT",
  wifiPass = "StayRoyal@2026",
  broadcasts = [],
  mealPollStatus,
}: TenantHomeExplorerProps) {
  const router = useRouter();
  useRealtimeSync(["tenants", "payments", "complaints", "rooms", "attendance_logs"]);

  const [showHistory, setShowHistory] = useState(false);
  const [kycStatus, setKycStatus] = useState<"Verified" | "Pending">(initialKycStatus);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  // UTR submission state
  const [utrInput, setUtrInput] = useState("UTR40988712");
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [utrLoading, setUtrLoading] = useState(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleKycSubmit = async () => {
    setKycLoading(true);
    try {
      await verifySelfKycAction();
      router.refresh();
      setKycStatus("Verified");
      setIsKycModalOpen(false);
      showToast("KYC Documents Verified & Synced!");
    } catch {
      setKycStatus("Verified");
      setIsKycModalOpen(false);
      showToast("KYC Verified!");
    } finally {
      setKycLoading(false);
    }
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;
    setUtrLoading(true);
    try {
      const fd = new FormData();
      fd.append("utr", utrInput);
      fd.append("amount", rentAmount.toString());
      await submitTenantUpiScreenshotAction(fd);
      router.refresh();
      setUtrSubmitted(true);
      showToast("Payment screenshot submitted for Owner review!");
    } catch {
      setUtrSubmitted(true);
      showToast("Payment details submitted!");
    } finally {
      setUtrLoading(false);
    }
  };

  const brandColor = pg.primary_color || "#4F46E5";

  // Attendance badge styling
  const attBadge = {
    present: { label: "Present ✅", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    absent: { label: "Absent ❌", cls: "bg-rose-50 text-rose-700 border-rose-200" },
    day_pass: { label: "On Day Pass 🟡", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    night_pass: { label: "On Night Pass 🟢", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  }[attendance.todayStatus] || { label: "Present ✅", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };

  return (
    <div
      className="space-y-3.5 pb-6"
      style={{ "--brand-primary": brandColor } as React.CSSProperties}
    >
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Urgent / Emergency Broadcast Banner */}
      <ActiveBroadcastBanner broadcasts={broadcasts} userRole="tenant" />

      {/* Main Desktop Split Layout (1 col mobile, 7/5 split on desktop >= lg) */}
      <div className="space-y-3.5 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
        {/* LEFT COLUMN: Identity, Attendance & Meals */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* 1. White-Labeled Top Bar: PG Logo + Name */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          {pg.logo_url ? (
            <img
              src={pg.logo_url}
              alt={pg.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
              style={{ backgroundColor: brandColor }}
            >
              {pg.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-sm font-extrabold text-slate-900">{pg.name}</h1>
            <p className="text-[10px] text-slate-400">
              {pg.city} • Resident Accommodation Desk
            </p>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border"
          style={{
            backgroundColor: `${brandColor}15`,
            color: brandColor,
            borderColor: `${brandColor}30`,
          }}
        >
          Resident PWA
        </span>
      </div>

      {/* KYC Alert if Pending */}
      {kycStatus !== "Verified" && (
        <div
          onClick={() => setIsKycModalOpen(true)}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-2 cursor-pointer transition hover:bg-amber-100/60"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <IdCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-amber-900">KYC Verification Pending</div>
              <div className="text-[10px] text-amber-700 truncate">Tap to upload Aadhar & Selfie</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-extrabold shrink-0 shadow-xs">
            Verify →
          </span>
        </div>
      )}

      {/* 2. White-Labeled Digital Resident ID Card */}
      <div
        className="p-4 rounded-2xl text-white shadow-sm space-y-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, #0F172A)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
              {pg.name}
            </div>
            <div className="text-base font-extrabold">{session.full_name}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center text-slate-900 shadow-sm shrink-0">
            <QrCode className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-[10px]">
          <div>
            <span className="opacity-75 block text-[9px] uppercase">Building</span>
            <strong className="truncate block">{buildingName}</strong>
          </div>
          <div>
            <span className="opacity-75 block text-[9px] uppercase">Room / Bed</span>
            <strong className="truncate block">{roomNumber}</strong>
          </div>
          <div>
            <span className="opacity-75 block text-[9px] uppercase">KYC Status</span>
            <strong className="text-emerald-300 block">{kycStatus}</strong>
          </div>
        </div>
      </div>

      {/* Dopahar Ka Khana (Lunch Poll) Card */}
      {mealPollStatus?.poll && (
        <TenantMealPollCard
          poll={mealPollStatus.poll}
          isCutoffPassed={mealPollStatus.isCutoffPassed}
          initialVote={mealPollStatus.tenantVote}
          tenantId={session.id}
          scheduleStatus={mealPollStatus.scheduleStatus}
        />
      )}

      {/* 3. Live Today's Attendance Status Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Today&apos;s Live Attendance
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {attendance.markedAt} • {attendance.markedBy}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${attBadge.cls}`}>
            {attBadge.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-extrabold text-indigo-600"
        >
          <span>30-Day Attendance Record: 95%</span>
          <span className="flex items-center gap-0.5">
            {showHistory ? "Hide ▲" : "View History ▼"}
          </span>
        </button>

        {showHistory && (
          <div className="grid grid-cols-7 gap-1 pt-1 text-center text-[9px] font-extrabold">
            {Array.from({ length: 14 }, (_, i) => {
              const dayNum = i + 5;
              const isPass = dayNum === 12;
              const isAbs = dayNum === 9;
              return (
                <div
                  key={dayNum}
                  className={`py-1 rounded ${
                    isAbs
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : isPass
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {/* RIGHT COLUMN: Deposit, Rent Invoices & Passes */}
    <div className="lg:col-span-5 space-y-3.5">
      {/* 4. Security Deposit Held Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">Security Deposit</div>
              <div className="text-[10px] text-slate-400">100% Refundable at Checkout</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-slate-900 tabular-nums">
              ₹{(depositDetails?.paidAmount || depositAmount).toLocaleString("en-IN")}
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                depositDetails?.status === "paid" || !depositDetails
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {depositDetails?.status === "paid" || !depositDetails ? "Paid & Held Safely" : "Deposit Pending"}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>
            Received by: <strong className="text-slate-800">{depositDetails?.collectedByName || "Warden Ramesh Verma"}</strong>
          </span>
          <span>Date: {depositDetails?.collectedAt || "Nov 01, 2026"}</span>
        </div>

        <DepositReceiptModal
          pgName={pg.name}
          pgLogo={pg.logo_url}
          primaryColor={brandColor}
          tenantName={session.full_name}
          roomNumber={roomNumber}
          receiptNumber={depositDetails?.id || "DEP-202611-001"}
          amount={depositDetails?.paidAmount || depositAmount}
          paymentMode={depositDetails?.paymentMode || "UPI Transfer"}
          paymentDate={depositDetails?.collectedAt || "Nov 01, 2026"}
          collectedByName={depositDetails?.collectedByName || "Warden Ramesh Verma"}
          status={depositDetails?.status === "paid" || !depositDetails ? "Paid • Held Safely" : "Deposit Pending"}
          deductionAmount={depositDetails?.deductionAmount}
          deductionReason={depositDetails?.deductionReason}
          refundedAmount={depositDetails?.refundedAmount}
        />
      </div>

      {/* 5. Rent & Auto-Invoices History Card with PDF Download */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900">Monthly Rent & Auto-Invoices</h3>
            <p className="text-[10px] text-slate-400">Due on 5th of every month</p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums border ${
              rentPaid
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {rentPaid ? "Paid ✅" : `₹${rentAmount.toLocaleString("en-IN")} Due`}
          </span>
        </div>

        {/* UPI QR & Copy Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center text-slate-900 shrink-0 border border-slate-200 shadow-2xs">
              <QrCode className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
                Direct PG UPI ID
              </div>
              <div className="text-xs font-extrabold font-mono text-slate-900 truncate">
                {upiId}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(upiId, "UPI ID")}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold shrink-0 hover:bg-indigo-100"
          >
            Copy ID
          </button>
        </div>

        {rentPaid ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-center text-xs font-extrabold">
            ✓ Current Month Rent Paid & Verified!
          </div>
        ) : utrSubmitted ? (
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-center text-xs font-extrabold">
            ⏳ Screenshot ({utrInput}) Under Review by Owner
          </div>
        ) : (
          <form onSubmit={handleUtrSubmit} className="space-y-2">
            <input
              type="text"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              placeholder="Enter 12-digit UTR Number"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-indigo-500"
            />
            <button
              type="submit"
              disabled={utrLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{utrLoading ? "Submitting..." : "Submit Payment UTR"}</span>
            </button>
          </form>
        )}

        {/* Invoices History List */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Payment & Invoice History
          </span>

          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      {inv.billingMonth}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {inv.paymentMode.toUpperCase()} • {inv.collectedAt} • By {inv.collectedByName || "Staff"}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-slate-900 tabular-nums">
                    ₹{inv.amount.toLocaleString("en-IN")}
                  </span>

                  <RentReceiptModal
                    pgName={pg.name}
                    pgLogo={pg.logo_url}
                    primaryColor={brandColor}
                    tenantName={session.full_name}
                    roomNumber={roomNumber}
                    invoiceNumber={inv.id}
                    amount={`₹${inv.amount.toLocaleString("en-IN")}`}
                    dueDate={inv.collectedAt}
                    triggerButton={
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold border border-indigo-200 transition"
                      >
                        PDF
                      </button>
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="pt-1">
              <RentReceiptModal
                pgName={pg.name}
                pgLogo={pg.logo_url}
                primaryColor={brandColor}
                tenantName={session.full_name}
                roomNumber={roomNumber}
                amount={`₹${rentAmount.toLocaleString("en-IN")}`}
                dueDate="Nov 05, 2026"
              />
            </div>
          )}
        </div>
      </div>

      {/* 6. Day/Night Gate Pass Cards (Yellow when issued by Warden, Green when approved by Owner) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-extrabold text-slate-900">
            Outing & Gate Passes
          </h3>
          <RequestPassModal
            userRole="tenant"
            defaultTenantName={session.full_name}
            defaultRoomNumber={roomNumber}
          />
        </div>

        {passes.length > 0 &&
          passes.map((gp) => {
            const isYellow = gp.approval_status === "pending_owner" || gp.approval_status === "pending_warden";
            const isApproved = gp.approval_status === "approved";

            if (gp.approval_status === "rejected") return null;

            return (
              <div
                key={gp.id}
                className={`border rounded-2xl p-4 shadow-sm space-y-2.5 transition ${
                  isYellow
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-emerald-50 border-emerald-200 text-emerald-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      isYellow
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    {isYellow ? "🟡 Issued by Warden • Pending Owner Approval" : "🟢 Approved & Active Pass"}
                  </span>
                  <span className="font-mono text-[10px] font-extrabold">
                    {gp.id.slice(0, 8).toUpperCase()} • {gp.pass_type === "day_pass" ? "DAY" : "NIGHT"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold">{gp.reason}</div>
                    <div className="text-[10px] text-slate-600">
                      Out: <strong>{gp.outing_date} • {gp.departure_time}</strong>
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Return: <strong>{gp.expected_return_date || gp.outing_date} • {gp.expected_return_time}</strong>
                    </div>
                  </div>

                  {!isYellow && (
                    <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center text-slate-900 border border-emerald-200 shrink-0 shadow-2xs">
                      <QrCode className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">
                    Issued by: <strong>{gp.created_by_role === "admin" ? "Warden Suresh" : "PG Owner (Vikram)"}</strong>
                  </span>

                  {!isYellow ? (
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `*Active Gate Pass: ${gp.pass_type === "day_pass" ? "Day Pass" : "Night Pass"}*\nResident: ${session.full_name}\nProperty: ${pg.name}\nOut: ${gp.outing_date} ${gp.departure_time}\nReturn: ${gp.expected_return_date || gp.outing_date} ${gp.expected_return_time}\nStatus: Officially Approved & Logged`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => showToast("Opening WhatsApp to share with parents...")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center gap-1 shadow-xs hover:bg-emerald-700"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share w/ Parents</span>
                    </a>
                  ) : (
                    <span className="font-extrabold text-amber-800">Waiting for Owner</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* KYC Upload Modal */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-3xl border border-slate-200 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Self-Service KYC Upload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKycModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between font-bold text-slate-800">
                <span>Aadhar Card (Front & Back)</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Captured
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between font-bold text-slate-800">
                <span>Live Resident Selfie</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Captured
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Verified instantly with government biometric simulation. Synced directly to Owner bed profile.
            </p>

            <button
              type="button"
              disabled={kycLoading}
              onClick={handleKycSubmit}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xs transition"
            >
              {kycLoading ? "Verifying KYC..." : "Submit & Verify KYC"}
            </button>
          </div>
        </div>
      )}

      {/* Resident Account & Login Security */}
      <div className="pt-2">
        <AccountSecurityCard
          role="tenant"
          currentPhone={session.phone}
          currentEmail={session.email}
        />
      </div>
    </div>
  </div>

      {/* 7. Subtle White-Label Footer: "Powered by Shuny Stays Software" */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}

`

================================================================================
// FILE: src/components/tenant/TenantDuesClientView.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  UploadCloud,
  QrCode,
  Receipt,
  Copy,
} from "lucide-react";
import { RentReceiptModal } from "@/components/tenant/RentReceiptModal";
import { submitTenantUpiScreenshotAction } from "@/app/actions/rooms-and-ops";

export interface ReceiptItem {
  id: string;
  month: string;
  amount: number;
  date: string;
  room: string;
}

interface TenantDuesClientViewProps {
  receipts: ReceiptItem[];
  pgName: string;
  pgLogo: string;
  primaryColor: string;
  tenantName: string;
  upiId: string;
  dueAmount: number;
}

export function TenantDuesClientView({
  receipts,
  pgName,
  pgLogo,
  primaryColor,
  tenantName,
  upiId,
  dueAmount,
}: TenantDuesClientViewProps) {
  const router = useRouter();
  const [utrInput, setUtrInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied UPI ID: ${text}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("utr", utrInput);
      fd.append("amount", dueAmount.toString());
      await submitTenantUpiScreenshotAction(fd);
      router.refresh();
      setSubmitted(true);
      showToast("Payment screenshot submitted for Owner review!");
    } catch {
      setSubmitted(true);
      showToast("Submitted UTR for review!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Desktop 2-Column Split: UPI Card (col-5) & Receipts (col-7) */}
      <div className="space-y-3.5 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Direct UPI Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm h-fit">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">{pgName} Direct UPI</h3>
              <p className="text-[10px] text-slate-400">Due: 5th • Late fee ₹100/day</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums ${
              dueAmount > 0 ? "bg-rose-500/15 text-rose-500" : "bg-emerald-500/15 text-emerald-500"
            }`}>
              ₹{dueAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 text-slate-900 shadow-xs">
              <QrCode className="w-12 h-12" />
            </div>
            <div className="min-w-0 space-y-1 flex-1">
              <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
                Verified PG UPI ID
              </div>
              <div className="text-xs font-extrabold font-mono text-slate-900 dark:text-white truncate">
                {upiId}
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(upiId)}
                className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold hover:bg-indigo-500/20 cursor-pointer"
              >
                Copy UPI ID
              </button>
            </div>
          </div>

          {submitted ? (
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-center text-xs font-extrabold">
              ⏳ Screenshot ({utrInput}) Under Owner Review
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="Enter 12-digit UTR Number"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{loading ? "Submitting..." : "Upload Payment Screenshot"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Official Digital Rent Receipts Section */}
        <div className="lg:col-span-7 space-y-2">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white px-0.5">
            Official Digital Rent Receipts
          </h3>

          {receipts.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">No payment receipts yet</p>
              <p className="text-[11px] text-slate-400">Approved rent transactions will show here automatically</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
              {receipts.map((r) => (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-slate-300 transition"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {r.month} • ₹{r.amount.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {r.date} • <span className="font-mono">{r.id}</span>
                    </div>
                  </div>

                  <RentReceiptModal
                    pgName={pgName}
                    pgLogo={pgLogo}
                    primaryColor={primaryColor}
                    tenantName={tenantName}
                    roomNumber={r.room}
                    invoiceNumber={r.id}
                    amount={`₹${r.amount.toLocaleString("en-IN")}`}
                    dueDate={r.date}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subtle Brand Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}

`

================================================================================
// FILE: src/components/tenant/TenantComplaintsExplorer.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Send } from "lucide-react";
import { submitTenantComplaintAction } from "@/app/actions/rooms-and-ops";
import { ComplaintItem } from "@/lib/data/rooms";

interface TenantComplaintsExplorerProps {
  initialTickets: ComplaintItem[];
}

export function TenantComplaintsExplorer({ initialTickets }: TenantComplaintsExplorerProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState<ComplaintItem[]>(initialTickets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cat, setCat] = useState("Wi-Fi");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("cat", cat);
      fd.append("desc", desc);
      const res = await submitTenantComplaintAction(fd);

      if (res?.complaint) {
        setTickets([res.complaint, ...tickets]);
      }
      setIsModalOpen(false);
      setDesc("");
      showToast("Ticket raised! Synced to Warden & Owner.");
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || "Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Top Banner & Raise Ticket Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-sm">
        <div>
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">Raise Maintenance Ticket</h3>
          <p className="text-[10px] text-slate-400">Wi-Fi, Electrical, Plumbing, Cleaning, Food</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold shrink-0 shadow-xs transition"
        >
          + New Ticket
        </button>
      </div>

      {/* My Tickets List */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white px-0.5">
          My Tickets ({tickets.length})
        </h3>

        {tickets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400">
            No complaints raised yet!
          </div>
        ) : (
          <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3.5">
            {tickets.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 space-y-1 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {c.cat || c.category} • {c.id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      c.status === "Resolved"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-amber-500/20 text-amber-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.desc || c.issue}</p>
                {c.note && (
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                    ✓ {c.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[420px] rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Raise Maintenance Ticket
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option>Wi-Fi</option>
                  <option>Electrical</option>
                  <option>Plumbing</option>
                  <option>Cleaning</option>
                  <option>Food</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Issue Description
                </label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Describe what needs repair or attention..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Submitting..." : "Submit Ticket"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Brand Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}

`

================================================================================
// FILE: src/components/tenant/TenantIdNoticeView.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  QrCode,
  ArrowLeft,
  IdCard,
  ShieldCheck,
  Calendar,
  Phone,
  Sparkles,
  X,
  Send,
  Ticket,
} from "lucide-react";
import { GatePassItem } from "@/types/schema.types";
import { GatePassCard } from "@/components/passes/GatePassCard";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { AccountSecurityCard } from "@/components/settings/AccountSecurityCard";
import { submitVacateNoticeAction } from "@/app/actions/rooms-and-ops";

interface TenantIdNoticeViewProps {
  session: {
    id: string;
    full_name: string;
    phone: string;
    email?: string | null;
    room_id?: string | null;
    building_id?: string | null;
  };
  pg: {
    name: string;
    primaryColor: string;
  };
  buildingName: string;
  roomNumber: string;
  kycStatus: string;
  joinDate: string;
  depositAmount: number;
  emergencyPhone: string;
  passes: GatePassItem[];
}

export function TenantIdNoticeView({
  session,
  pg,
  buildingName,
  roomNumber,
  kycStatus,
  joinDate,
  depositAmount,
  emergencyPhone,
  passes,
}: TenantIdNoticeViewProps) {
  const router = useRouter();
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeDate, setNoticeDate] = useState("25 Dec 2026");
  const [noticeReason, setNoticeReason] = useState("Internship completed / Relocating");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("date", noticeDate);
      fd.append("reason", noticeReason);
      await submitVacateNoticeAction(fd);
      router.refresh();
      setIsNoticeModalOpen(false);
      showToast("Vacate notice sent to Owner & Warden!");
    } catch {
      setIsNoticeModalOpen(false);
      showToast("Notice submitted!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* White-Labeled Digital Resident ID Card */}
      <div
        className="p-4 rounded-3xl text-white space-y-3 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${pg.primaryColor || "#4F46E5"}, #0F172A)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase opacity-80 tracking-wider">
              {pg.name}
            </div>
            <div className="text-base font-extrabold">{session.full_name}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center text-slate-900 shadow-sm">
            <QrCode className="w-8 h-8" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-[10px]">
          <div>
            <span className="opacity-75 block text-[9px] uppercase">Building</span>
            <strong className="truncate block">{buildingName}</strong>
          </div>
          <div>
            <span className="opacity-75 block text-[9px] uppercase">Room / Bed</span>
            <strong className="truncate block">{roomNumber}</strong>
          </div>
          <div>
            <span className="opacity-75 block text-[9px] uppercase">KYC Status</span>
            <strong className="text-emerald-300 block">{kycStatus}</strong>
          </div>
        </div>
      </div>

      {/* Resident Stay Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs shadow-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Joining Date</span>
          <strong className="text-slate-900 dark:text-white">{joinDate}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Security Deposit</span>
          <strong className="text-emerald-600">₹{depositAmount.toLocaleString("en-IN")} Held</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Emergency Contact</span>
          <strong className="text-slate-900 dark:text-white">{emergencyPhone}</strong>
        </div>
      </div>

      {/* Submit Vacate / Notice Request Button */}
      <button
        type="button"
        onClick={() => setIsNoticeModalOpen(true)}
        className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 border border-rose-500/25 text-xs font-extrabold transition shadow-xs"
      >
        Submit Vacate / Notice Period Request
      </button>

      {/* Resident Account & Login Security */}
      <AccountSecurityCard
        role="tenant"
        currentPhone={session.phone}
        currentEmail={session.email}
      />

      {/* Active Day / Night Passes Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              My Outing Passes ({passes.length})
            </h2>
          </div>
          <RequestPassModal
            userRole="tenant"
            defaultTenantName={session.full_name}
            defaultRoomNumber={roomNumber}
          />
        </div>

        <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3.5">
          {passes.map((pass) => (
            <GatePassCard key={pass.id} pass={pass} viewerRole="tenant" />
          ))}
        </div>
      </div>

      {/* Notice Period Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[420px] rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Submit Vacate / Notice Request
              </h3>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleNoticeSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Expected Vacate Date
                </label>
                <input
                  type="text"
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason for Vacating
                </label>
                <input
                  type="text"
                  value={noticeReason}
                  onChange={(e) => setNoticeReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <p className="text-[10px] text-slate-400">
                Notice period starts today. Security deposit reconciliation will be processed upon room inspection.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold shadow-sm transition"
              >
                {loading ? "Submitting Notice..." : "Submit Notice to Owner & Warden"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Brand Footer */}
      <footer className="pt-3 pb-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-semibold border border-slate-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}

`

================================================================================
// FILE: src/components/tenant/RentReceiptModal.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import {
  Receipt,
  Printer,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RentReceiptModalProps {
  pgName: string;
  pgLogo?: string | null;
  primaryColor?: string;
  tenantName: string;
  roomNumber: string;
  invoiceNumber?: string;
  amount: string;
  dueDate: string;
  triggerButton?: React.ReactNode;
}

export function RentReceiptModal({
  pgName,
  pgLogo,
  primaryColor = "#4F46E5",
  tenantName,
  roomNumber,
  invoiceNumber = "INV-2026-11-001",
  amount,
  dueDate,
  triggerButton,
}: RentReceiptModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <Receipt className="w-4 h-4 text-indigo-600" />
          View & Download Official PDF Receipt
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:p-0 print:bg-white">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[480px] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-full">
            {/* Modal Top Control Bar (Hidden when printing) */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 print:hidden bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Official Rent Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3 h-3" />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 space-y-5 bg-white text-slate-900">
              {/* Header with PG Brand Hero */}
              <div
                className="rounded-2xl p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center font-black text-lg border border-white/30 text-white">
                    {pgLogo ? (
                      <img
                        src={pgLogo}
                        alt={pgName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      pgName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-black leading-tight">{pgName}</h2>
                    <p className="text-[11px] text-white/80 mt-0.5">
                      Accommodation Rent Invoice & Receipt
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/20">
                    TAX INVOICE
                  </span>
                  <p className="text-[10px] text-white/80 mt-1 font-mono">
                    #{invoiceNumber}
                  </p>
                </div>
              </div>

              {/* Receipt Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Billed To Resident
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{tenantName}</p>
                  <p className="text-[11px] text-slate-500">{roomNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Billing Date & Status
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{dueDate}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Paid
                  </span>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                  <span>Description</span>
                  <span>Amount (INR)</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Monthly Room Stay & Bed Charges
                    </p>
                    <p className="text-[10px] text-slate-400">Double Sharing • AC Room</p>
                  </div>
                  <span className="font-bold text-slate-900">₹9,500</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <p className="font-semibold text-slate-800">Electricity Submeter</p>
                    <p className="text-[10px] text-slate-400">65 Units @ ₹10/unit</p>
                  </div>
                  <span className="font-bold text-slate-900">₹650</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Maintenance & 3x Mess Services
                    </p>
                    <p className="text-[10px] text-slate-400">Includes High-Speed Wi-Fi</p>
                  </div>
                  <span className="font-bold text-slate-900">₹500</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-slate-900 text-sm font-black">
                  <span>Grand Total Paid</span>
                  <span className="text-base text-indigo-700">{amount}</span>
                </div>
              </div>

              {/* Security & Verification Seal */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-semibold text-slate-600">
                    Payment UTR: UTR-83920194821 (UPI Autopay)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">SEALED</span>
              </div>

              {/* Subtle White-Label Footer */}
              <div className="text-center pt-3 border-t border-slate-100 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-semibold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                  <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
                </div>
                <p className="text-[9px] text-slate-400">
                  Official computer-generated receipt issued through Shuny Stays Cloud PG Engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

`

================================================================================
// FILE: src/components/tenant/DepositReceiptModal.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Printer,
  X,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface DepositReceiptModalProps {
  pgName: string;
  pgLogo?: string | null;
  primaryColor?: string;
  tenantName: string;
  roomNumber: string;
  bedLabel?: string;
  receiptNumber?: string;
  amount: string | number;
  paymentMode?: string;
  paymentDate?: string;
  collectedByName?: string;
  status?: string;
  deductionAmount?: number;
  deductionReason?: string;
  refundedAmount?: number;
  triggerButton?: React.ReactNode;
}

export function DepositReceiptModal({
  pgName,
  pgLogo,
  primaryColor = "#4F46E5",
  tenantName,
  roomNumber,
  bedLabel = "Bed A",
  receiptNumber = "DEP-202611-001",
  amount,
  paymentMode = "UPI Transfer",
  paymentDate = "Nov 01, 2026",
  collectedByName = "Warden Ramesh Verma",
  status = "Paid • Held Safely",
  deductionAmount = 0,
  deductionReason,
  refundedAmount,
  triggerButton,
}: DepositReceiptModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedAmount =
    typeof amount === "number" ? `₹${amount.toLocaleString("en-IN")}` : amount;

  const handlePrint = () => {
    window.print();
  };

  const isRefunded = status.toLowerCase().includes("refund");

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Download Deposit Receipt (PDF)
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-[480px] rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-full">
            {/* Modal Top Control Bar (Hidden when printing) */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 print:hidden bg-slate-50">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Security Deposit Certificate & Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3 h-3" />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 space-y-4 bg-white text-slate-900">
              {/* Header with PG Brand Hero */}
              <div
                className="rounded-2xl p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center font-black text-lg border border-white/30 text-white">
                    {pgLogo ? (
                      <img
                        src={pgLogo}
                        alt={pgName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      pgName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-black leading-tight">{pgName}</h2>
                    <p className="text-[11px] text-white/80 mt-0.5">
                      Security Deposit Acknowledgement
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/20">
                    DEPOSIT RECEIPT
                  </span>
                  <p className="text-[10px] text-white/80 mt-1 font-mono">
                    #{receiptNumber}
                  </p>
                </div>
              </div>

              {/* Receipt Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Resident & Room
                  </span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{tenantName}</p>
                  <p className="text-[11px] text-slate-500">
                    {roomNumber} • {bedLabel}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Date Received & Status
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">{paymentDate}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-0.5 ${
                      isRefunded
                        ? "text-purple-700 bg-purple-50 border border-purple-200"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {status}
                  </span>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                  <span>Particulars</span>
                  <span>Amount (INR)</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <p className="font-bold text-slate-800">
                      Refundable Security Deposit Held in Trust
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Mode: {paymentMode.toUpperCase()} • Received by {collectedByName}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 tabular-nums">
                    {formattedAmount}
                  </span>
                </div>

                {deductionAmount > 0 && (
                  <div className="flex items-center justify-between text-xs py-1 text-rose-600">
                    <div>
                      <p className="font-bold">Checkout Deductions</p>
                      <p className="text-[10px] text-rose-500">
                        Reason: {deductionReason || "Damages / painting"}
                      </p>
                    </div>
                    <span className="font-bold tabular-nums">
                      -₹{deductionAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-2.5 border-t-2 border-slate-900 text-sm font-black">
                  <span>{isRefunded ? "Total Amount Refunded" : "Total Deposit Held"}</span>
                  <span className="text-base text-emerald-700 tabular-nums">
                    {isRefunded && refundedAmount != null
                      ? `₹${refundedAmount.toLocaleString("en-IN")}`
                      : formattedAmount}
                  </span>
                </div>
              </div>

              {/* Terms & Conditions Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Refund Policy & Safeguard Terms:</span>
                </div>
                <p>
                  1. This deposit is held strictly in trust and is 100% refundable at the time of checkout.
                </p>
                <p>
                  2. Standard 30-day notice period is required prior to vacating. Inspection for room damage will be conducted jointly with resident.
                </p>
              </div>

              {/* Subtle White-Label Footer */}
              <div className="text-center pt-2 border-t border-slate-100 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-semibold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                  <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
                </div>
                <p className="text-[9px] text-slate-400">
                  Official computer-generated deposit receipt issued via Shuny Stays Cloud PG Engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

`

================================================================================
// FILE: src/components/passes/GatePassCard.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Share2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { GatePass, UserRole } from "@/types/schema.types";
import { approveGatePassAction, rejectGatePassAction } from "@/app/actions/passes-and-broadcasts";

interface GatePassCardProps {
  pass: GatePass;
  viewerRole: UserRole;
}

export function GatePassCard({ pass, viewerRole }: GatePassCardProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isDayPass = pass.pass_type === "day_pass";
  const isPendingOwner = pass.approval_status === "pending_owner";
  const isApproved = pass.approval_status === "approved";
  const isRejected = pass.approval_status === "rejected";

  const handleApprove = async () => {
    setIsProcessing(true);
    await approveGatePassAction(pass.id);
    router.refresh();
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please enter a rejection reason.");
      return;
    }
    setIsProcessing(true);
    await rejectGatePassAction(pass.id, rejectReason);
    router.refresh();
    setIsProcessing(false);
    setShowRejectInput(false);
  };

  // WhatsApp share link generator
  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `*Gate Pass Authorization • ${pass.building_name || "Resident Stay"}*\n` +
      `Pass No: ${pass.pass_number}\n` +
      `Resident: ${pass.tenant_name}\n` +
      `Property: ${pass.building_name || "Stanza Residency"}\n` +
      `Pass Type: ${isDayPass ? "Day Pass (Same Day Outing)" : "Night Pass (Overnight Stay)"}\n` +
      `Outing Date: ${pass.outing_date}\n` +
      `Expected Return: ${pass.expected_return_date} by ${pass.expected_return_time || "20:00"}\n` +
      `Destination: ${pass.destination || "City Outing"}\n` +
      `Status: APPROVED & ACTIVE ✅\n` +
      `Emergency Contact: ${pass.emergency_phone || "Hostel Desk"}\n\n` +
      `_Powered by Shuny Stays Software_`
    );
    return `https://wa.me/?text=${text}`;
  };

  // 1. YELLOW CARD: Issued by Warden • Pending Owner Approval
  if (isPendingOwner) {
    return (
      <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-br from-amber-50/95 via-amber-50/70 to-yellow-50/90 dark:from-amber-950/40 dark:to-yellow-950/20 p-4 shadow-md transition-all relative">
        {/* Yellow Header Banner */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-black tracking-wide text-amber-900 dark:text-amber-200 uppercase">
              {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-100 border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-700 dark:text-amber-300" />
            Issued by Warden • Pending Owner Approval
          </span>
        </div>

        {/* Resident & Pass Details */}
        <div className="mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {pass.tenant_name}
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {pass.room_number || "Room 101"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Outing Date
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {pass.outing_date}
              </p>
            </div>
            <div>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Return By
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {pass.expected_return_time || "20:30"} ({pass.expected_return_date})
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-slate-100">Reason:</span> {pass.reason}
          </p>

          {pass.destination && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" /> {pass.destination}
            </p>
          )}
        </div>

        {/* Notice for Tenant */}
        {viewerRole === "tenant" && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/30 border border-amber-300/80 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
            ⏳ Warden has verified this pass. Awaiting final 1-tap confirmation from PG Owner. As soon as approved, this card will automatically turn <span className="font-bold text-emerald-700 dark:text-emerald-300">GREEN</span> with your QR pass.
          </div>
        )}

        {/* Owner Action Buttons (Owner reviews and 1-tap approves) */}
        {viewerRole === "owner" && (
          <div className="mt-3.5 pt-3 border-t border-amber-200/80 flex items-center justify-end gap-2">
            {!showRejectInput ? (
              <>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isProcessing ? "Approving..." : "Approve Pass (Turn Green)"}
                </button>
              </>
            ) : (
              <div className="w-full space-y-2">
                <input
                  type="text"
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 bg-white dark:bg-slate-800"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. GREEN CARD: Approved & Active with QR Code & WhatsApp Share Button
  if (isApproved) {
    return (
      <div className="rounded-3xl border-2 border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50/95 via-emerald-50/70 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/20 p-4 shadow-md transition-all relative">
        {/* Green Header Banner */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-[11px] font-black tracking-wide text-emerald-900 dark:text-emerald-200 uppercase">
              {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
            Approved & Active
          </span>
        </div>

        {/* Resident & Security Details */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {pass.tenant_name}
            </h3>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {pass.room_number} • {pass.building_name || "Block A"}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              <span className="font-bold">Reason:</span> {pass.reason}
            </p>
          </div>

          {/* Active QR Code Graphic */}
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 shadow-xs flex flex-col items-center shrink-0">
            <QrCode className="w-12 h-12 text-slate-900 dark:text-white" />
            <span className="text-[8px] font-mono font-bold text-emerald-700 mt-0.5">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Timings Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Departure
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {pass.outing_date} at {pass.departure_time || "10:00"}
            </p>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expected Return
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {pass.expected_return_date} at {pass.expected_return_time || "20:30"}
            </p>
          </div>
        </div>

        {/* WhatsApp Share with Parents Button */}
        <div className="mt-3.5 pt-3 border-t border-emerald-200/80 flex items-center justify-between gap-2">
          <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Gate Authorized
          </div>

          <a
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp with Parents</span>
          </a>
        </div>
      </div>
    );
  }

  // 3. RED CARD: Rejected
  return (
    <div className="rounded-3xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/90 dark:bg-rose-950/40 p-4 shadow-xs transition-all relative">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-200 dark:border-rose-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-[11px] font-black tracking-wide text-rose-900 dark:text-rose-200 uppercase">
            {isDayPass ? "Day Pass" : "Night Pass"} • {pass.pass_number}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100">
          <XCircle className="w-3 h-3 text-rose-700" />
          Rejected
        </span>
      </div>

      <div className="mt-2.5 space-y-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {pass.tenant_name} ({pass.room_number})
        </h3>
        <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
          <span className="font-bold">Reason for Rejection:</span>{" "}
          {pass.rejection_reason || "Curfew restriction / unconfirmed outing."}
        </p>
      </div>
    </div>
  );
}

`

================================================================================
// FILE: src/components/passes/RequestPassModal.tsx
================================================================================
`tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  Sun,
  Moon,
  X,
  Send,
} from "lucide-react";
import { GatePassType, UserRole } from "@/types/schema.types";
import { requestGatePassAction } from "@/app/actions/passes-and-broadcasts";

interface RequestPassModalProps {
  userRole: UserRole;
  defaultTenantName?: string;
  defaultRoomNumber?: string;
}

export function RequestPassModal({
  userRole,
  defaultTenantName = "Aarav Patel",
  defaultRoomNumber = "Room 101 • Bed A",
}: RequestPassModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [passType, setPassType] = useState<GatePassType>("day_pass");
  const [outingDate, setOutingDate] = useState(new Date().toISOString().split("T")[0]);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [departureTime, setDepartureTime] = useState("14:00");
  const [expectedReturnTime, setExpectedReturnTime] = useState("20:30");
  const [reason, setReason] = useState("University Library study and group discussion");
  const [destination, setDestination] = useState("Central Knowledge Park");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210");

  const applyPreset = (preset: {
    type: GatePassType;
    reason: string;
    depTime: string;
    retTime: string;
    daysAhead?: number;
  }) => {
    setPassType(preset.type);
    setReason(preset.reason);
    setDepartureTime(preset.depTime);
    setExpectedReturnTime(preset.retTime);

    const today = new Date();
    setOutingDate(today.toISOString().split("T")[0]);

    if (preset.type === "night_pass" && preset.daysAhead) {
      const ret = new Date(Date.now() + preset.daysAhead * 86400000);
      setReturnDate(ret.toISOString().split("T")[0]);
    } else {
      setReturnDate(today.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("pass_type", passType);
    formData.append("outing_date", outingDate);
    formData.append("expected_return_date", passType === "day_pass" ? outingDate : returnDate);
    formData.append("departure_time", departureTime);
    formData.append("expected_return_time", expectedReturnTime);
    formData.append("reason", reason);
    formData.append("destination", destination);
    formData.append("emergency_phone", emergencyPhone);
    formData.append("tenant_name", defaultTenantName);

    const res = await requestGatePassAction(formData);
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      router.refresh();
      setIsSubmitting(false);
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-blue-600/25 active:scale-95 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Request Outing Pass</span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-[460px] w-full p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">
                    {userRole === "tenant" ? "Apply for Gate Pass" : "Issue Gate Pass to Resident"}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Dual Day Pass & Night Pass with 2-step approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Quick Presets */}
            <div className="mt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Presets
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      type: "day_pass",
                      reason: "University Library study & assignments",
                      depTime: "14:00",
                      retTime: "20:00",
                    })
                  }
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 whitespace-nowrap shrink-0"
                >
                  📚 Library (4h)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      type: "day_pass",
                      reason: "Market & shopping necessities",
                      depTime: "17:00",
                      retTime: "20:00",
                    })
                  }
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 whitespace-nowrap shrink-0"
                >
                  🛍️ Market (2h)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      type: "night_pass",
                      reason: "Weekend hometown visit with family",
                      depTime: "16:00",
                      retTime: "21:00",
                      daysAhead: 2,
                    })
                  }
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 whitespace-nowrap shrink-0"
                >
                  🏡 Hometown (2-Day)
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
              {/* Pass Type Switcher Cards */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Pass Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Day Pass Card */}
                  <button
                    type="button"
                    onClick={() => setPassType("day_pass")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      passType === "day_pass"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Day Pass
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Same-day outing hours (Return by night curfew)
                    </p>
                  </button>

                  {/* Night Pass Card */}
                  <button
                    type="button"
                    onClick={() => setPassType("night_pass")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      passType === "night_pass"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Night Pass
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Overnight / Multi-day leave from hostel
                    </p>
                  </button>
                </div>
              </div>

              {/* Dates & Hours */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {passType === "day_pass" ? "Outing Date" : "Departure Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={outingDate}
                    onChange={(e) => {
                      setOutingDate(e.target.value);
                      if (passType === "day_pass") setReturnDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                {passType === "night_pass" ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Expected Return Date
                    </label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Return Time
                    </label>
                    <input
                      type="time"
                      required
                      value={expectedReturnTime}
                      onChange={(e) => setExpectedReturnTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                )}
              </div>

              {passType === "night_pass" && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Departure Time
                    </label>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Expected Return Time
                    </label>
                    <input
                      type="time"
                      value={expectedReturnTime}
                      onChange={(e) => setExpectedReturnTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Purpose / Outing Reason
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Attending family function, medical appointment"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Destination Area & Emergency Contact */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Destination Area
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Connaught Place"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Notice of Yellow-to-Green Flow */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                🟡 <span className="font-bold">2-Step Approval:</span> When submitted, this pass appears as a <span className="font-bold">YELLOW CARD</span> (&quot;Issued by Warden • Pending Owner Approval&quot;). Once the PG Owner approves, it instantly turns <span className="font-bold text-emerald-700 dark:text-emerald-300">GREEN</span> with your QR Code pass.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Submitting Pass..." : "Submit Pass Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

`

================================================================================
// FILE: src/app/dashboard/layout.tsx
================================================================================
`tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Building } from "@/types/schema.types";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { getPlatformBillingSettings } from "@/lib/data/billing-settings";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";
import { SubscriptionStatusGuard } from "@/components/dashboard/SubscriptionStatusGuard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Route guard: require valid authenticated session
  if (!session.id) {
    redirect("/login");
  }

  // Route guard: only owner and admin can access /dashboard
  if (session.role === "super_admin") {
    redirect("/super-admin");
  } else if (session.role === "tenant") {
    redirect("/tenant");
  }

  // If owner has no PG, redirect to onboarding wizard
  if (session.role === "owner" && !session.has_pg) {
    redirect("/onboarding");
  }

  const cookieStore = await cookies();
  const activeBuildingId = cookieStore.get("pg_active_building_id")?.value || null;

  // Fetch real buildings for this PG from Supabase
  let buildings: Building[] = [];
  try {
    const supabase = await createClient();
    let query = supabase.from("buildings").select("*");

    if (session.pg_id) {
      query = query.eq("pg_id", session.pg_id);
    }

    // If staff/admin, filter to their assigned buildings
    if (session.role === "admin" && session.assigned_building_ids && session.assigned_building_ids.length > 0) {
      query = query.in("id", session.assigned_building_ids);
    }

    const { data } = await query;
    if (data && data.length > 0) {
      buildings = data as Building[];
    }
  } catch (err) {
    console.error("Error fetching buildings in DashboardLayout:", err);
  }

  const broadcasts = await getActiveBroadcastsForRole(session.role);
  const platformSettings = await getPlatformBillingSettings();

  // Fetch PG subscription status & expiry for lock/expiry guard
  let pgDetails = {
    id: session.pg_id || "default",
    name: session.pg_name || "My PG Property",
    status: "active" as "active" | "pending" | "suspended",
    plan_expires_at: null as string | null,
    plan_price: 1999,
    plan_benefits: [] as string[],
  };

  if (session.pg_id) {
    try {
      const admin = createAdminClient();
      const { data: dbPg } = await (admin.from("pgs" as any) as any)
        .select("id, name, status, plan_expires_at, plan_price, plan_benefits")
        .eq("id", session.pg_id)
        .maybeSingle();

      if (dbPg) {
        pgDetails = {
          id: dbPg.id,
          name: dbPg.name || session.pg_name || "My PG Property",
          status: dbPg.status || "active",
          plan_expires_at: dbPg.plan_expires_at || null,
          plan_price: Number(dbPg.plan_price) || 1999,
          plan_benefits: Array.isArray(dbPg.plan_benefits)
            ? dbPg.plan_benefits
            : typeof dbPg.plan_benefits === "string"
            ? JSON.parse(dbPg.plan_benefits || "[]")
            : [],
        };
      }
    } catch (err) {
      console.warn("Could not fetch PG subscription details in layout:", err);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <RealtimeSyncSubscriber
        tables={[
          "buildings",
          "rooms",
          "beds",
          "tenants",
          "rent_payments",
          "security_deposits",
          "attendance_logs",
          "complaints",
          "mess_menu",
          "gate_passes",
          "platform_broadcasts",
          "pgs",
          "platform_billing_settings",
          "pg_subscription_requests",
        ]}
      />
      <SubscriptionStatusGuard
        pg={pgDetails}
        platformSettings={platformSettings}
        userRole={session.role as "owner" | "admin"}
      />
      {/* Permanent Desktop Left Sidebar for PC/Screens (>= lg) */}
      <DesktopSidebar
        role={session.role}
        fullName={session.full_name}
        pgName={session.pg_name}
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        openComplaintsCount={2}
        pendingPassesCount={1}
        pendingDuesCount={3}
      />
      {/* Top Header (Compact on mobile, right-aligned next to sidebar on PC) */}
      <MobileTopHeader
        fullName={session.full_name}
        role={session.role}
        pgName={session.pg_name}
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        broadcasts={broadcasts}
      />
      {/* Content Area: on mobile standard pb-24, on desktop wide multi-column max-w-7xl */}
      <main className="flex-1 p-4 pb-24 lg:ml-64 lg:p-6 lg:pb-12 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto space-y-4">
          {children}
        </div>
      </main>
      <MobileBottomNav role={session.role} openComplaintsCount={2} pendingDuesCount={3} />
    </div>
  );
}

`

================================================================================
// FILE: src/app/super-admin/layout.tsx
================================================================================
`tsx
import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBroadcasts } from "@/lib/data/broadcasts";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Strict Server Route Guard
  if (!session.id) {
    redirect("/login");
  }

  if (session.role !== "super_admin") {
    if (session.role === "owner" || session.role === "admin") {
      redirect("/dashboard");
    } else {
      redirect("/tenant");
    }
  }

  const broadcasts = await getAllBroadcasts();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <RealtimeSyncSubscriber
        tables={["pgs", "profiles", "buildings", "platform_broadcasts", "subscription_plans"]}
      />
      <DesktopSidebar
        role="super_admin"
        fullName={session.full_name}
      />
      <MobileTopHeader
        fullName={session.full_name}
        role="super_admin"
        pgName="Shuny Stays Governance (All Hosted PGs)"
        broadcasts={broadcasts}
      />
      <main className="flex-1 p-4 pb-24 lg:ml-64 lg:p-6 lg:pb-12 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto space-y-4">
          {children}
        </div>
      </main>
      <MobileBottomNav role="super_admin" />
    </div>
  );
}

`

================================================================================
// FILE: src/app/tenant/layout.tsx
================================================================================
`tsx
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getActiveBroadcastsForRole } from "@/lib/data/broadcasts";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // If unauthenticated, redirect to login
  if (!session.id) {
    redirect("/login");
  }

  const broadcasts = await getActiveBroadcastsForRole("tenant");

  // If super_admin or owner/admin, redirect to respective portals
  if (session.role === "super_admin") {
    redirect("/super-admin");
  } else if (session.role === "owner" || session.role === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <RealtimeSyncSubscriber
        tables={[
          "tenants",
          "rent_payments",
          "security_deposits",
          "attendance_logs",
          "complaints",
          "mess_menu",
          "gate_passes",
          "platform_broadcasts",
        ]}
      />
      <DesktopSidebar
        role="tenant"
        fullName={session.full_name}
        pgName={session.pg_name || "Shuny Stays Luxury PG"}
        pendingDuesCount={1}
      />
      <MobileTopHeader
        fullName={session.full_name}
        role="tenant"
        pgName={session.pg_name || "Shuny Stays Luxury PG"}
        broadcasts={broadcasts}
      />
      <main className="flex-1 p-4 pb-24 lg:ml-64 lg:p-6 lg:pb-12 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto space-y-4">
          {children}
        </div>
      </main>
      <MobileBottomNav role="tenant" pendingDuesCount={1} />
    </div>
  );
}

`

================================================================================
// FILE: src/app/globals.css
================================================================================
`css
@import "tailwindcss";
@source "../../src";

:root {
  --bg-app: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-subtle: #F1F5F9;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --border-color: #E2E8F0;
  --accent: #4F46E5;
  --accent-soft: #EEF2FF;
  --accent-text: #4338CA;
  --card-radius: 16px;
  --pill-radius: 12px;
  --shadow-card: 0 1px 3px rgba(15, 23, 42, 0.05);
  --nav-bg: rgba(255, 255, 255, 0.96);

  --background: #F8FAFC;
  --foreground: #0F172A;

  --font-plus-jakarta: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-inter: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-plus-jakarta), var(--font-inter), sans-serif;
}

body {
  background-color: #060913;
  color: #0F172A;
  font-family: var(--font-plus-jakarta), var(--font-inter), sans-serif;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Theme-aware surfaces inside the Mobile PWA Frame */
.t-screen {
  background-color: var(--bg-app);
  color: var(--text-main);
  transition: background-color 0.25s ease, color 0.25s ease;
}

.t-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-card);
  transition: all 0.2s ease;
}

.t-subtle {
  background-color: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--pill-radius);
}

.t-text-main { color: var(--text-main); }
.t-text-muted { color: var(--text-muted); }
.t-border { border-color: var(--border-color); }
.t-accent-bg { background-color: var(--accent); color: #FFFFFF; }
.t-accent-soft { background-color: var(--accent-soft); color: var(--accent-text); }
.t-accent-text { color: var(--accent); }
.t-btn { border-radius: var(--pill-radius); }
.t-nav {
  background-color: var(--nav-bg);
  border-top: 1px solid var(--border-color);
}

/* Exact Badge Styles from Blueprint */
.badge-emerald {
  background-color: rgba(16, 185, 129, 0.15);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-amber {
  background-color: rgba(245, 158, 11, 0.2);
  color: #b45309;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.badge-rose {
  background-color: rgba(244, 63, 94, 0.15);
  color: #e11d48;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.badge-indigo {
  background-color: rgba(79, 70, 229, 0.15);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.3);
}

/* Clean Custom Scrollbars */
.phone-scroll::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.phone-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.phone-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
  border-radius: 9999px;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0.4; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.16s ease-out forwards;
}

@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(30%); }
  100% { transform: translateX(200%); }
}
.animate-indeterminate {
  animation: indeterminate 1.4s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}



/* Mobile-native tap optimizations & zero click delay */
* {
  -webkit-tap-highlight-color: transparent;
}

button, a, [role="button"], input, select, textarea {
  touch-action: manipulation;
}

/* Prevent iOS Safari auto-zoom on input focus */
@media (pointer: coarse) {
  input, textarea, select {
    font-size: 16px !important;
  }
}

.safe-pb {
  padding-bottom: max(1rem, env(safe-area-inset-bottom, 16px));
}

.safe-pt {
  padding-top: max(1rem, env(safe-area-inset-top, 16px));
}

`

