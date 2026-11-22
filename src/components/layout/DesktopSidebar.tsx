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
