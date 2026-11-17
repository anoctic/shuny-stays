"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  Users,
  Wallet,
  ClipboardCheck,
  AlertCircle,
  Utensils,
  Home,
  CreditCard,
  MessageSquareWarning,
} from "lucide-react";
import { UserRole } from "@/types/schema.types";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  role: UserRole;
  openComplaintsCount?: number;
  pendingDuesCount?: number;
}

export function MobileBottomNav({
  role,
  openComplaintsCount = 0,
  pendingDuesCount = 0,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  // If on super-admin portal or onboarding/auth pages, do not render this bottom nav
  if (role === "super_admin" || pathname.startsWith("/super-admin") || pathname === "/onboarding") {
    return null;
  }

  // 1. Owner Nav Tabs (4 Max)
  const ownerTabs = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Rooms",
      href: "/dashboard/rooms",
      icon: BedDouble,
      active: pathname.startsWith("/dashboard/rooms"),
    },
    {
      label: "Tenants",
      href: "/dashboard/tenants",
      icon: Users,
      active: pathname.startsWith("/dashboard/tenants"),
    },
    {
      label: "Finance",
      href: "/dashboard/finance",
      icon: Wallet,
      active: pathname.startsWith("/dashboard/finance"),
    },
  ];

  // 2. Admin / Warden Nav Tabs (4 Max)
  const adminTabs = [
    {
      label: "Duty Desk",
      href: "/dashboard",
      icon: ClipboardCheck,
      active: pathname === "/dashboard",
    },
    {
      label: "Complaints",
      href: "/dashboard/complaints",
      icon: AlertCircle,
      active: pathname.startsWith("/dashboard/complaints"),
      badge: openComplaintsCount > 0 ? openComplaintsCount : null,
    },
    {
      label: "Mess Menu",
      href: "/dashboard/mess",
      icon: Utensils,
      active: pathname.startsWith("/dashboard/mess"),
    },
    {
      label: "Tenants",
      href: "/dashboard/tenants",
      icon: Users,
      active: pathname.startsWith("/dashboard/tenants"),
    },
  ];

  // 3. Tenant Nav Tabs (4 Max)
  const tenantTabs = [
    {
      label: "My Stay",
      href: "/tenant",
      icon: Home,
      active: pathname === "/tenant",
    },
    {
      label: "Pay Rent",
      href: "/tenant/dues",
      icon: CreditCard,
      active: pathname.startsWith("/tenant/dues"),
      badge: pendingDuesCount > 0 ? pendingDuesCount : null,
    },
    {
      label: "Complaints",
      href: "/tenant/complaints",
      icon: MessageSquareWarning,
      active: pathname.startsWith("/tenant/complaints"),
    },
    {
      label: "Mess Menu",
      href: "/tenant/mess",
      icon: Utensils,
      active: pathname.startsWith("/tenant/mess"),
    },
  ];

  const activeTabs = role === "owner" ? ownerTabs : role === "admin" ? adminTabs : tenantTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 dark:bg-slate-900/95 dark:border-slate-800 transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {activeTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center h-full py-1.5 relative transition-all duration-150 group select-none",
                tab.active
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {/* Active pill indicator */}
              {tab.active && (
                <span className="absolute top-0 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-full shadow-sm" />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-150",
                    tab.active ? "scale-110 stroke-[2.4]" : "stroke-[1.8] group-hover:scale-105"
                  )}
                />
                {"badge" in tab && tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight truncate max-w-[80px]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
