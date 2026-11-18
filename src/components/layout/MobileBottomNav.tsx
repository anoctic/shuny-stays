"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const superAdminCurrentTab = searchParams?.get("tab") || "overview";

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
      href: "/super-admin",
      icon: Activity,
      isActive: pathname === "/super-admin" && superAdminCurrentTab === "overview",
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
        (pathname === "/super-admin" && superAdminCurrentTab === "broadcast") ||
        pathname.includes("broadcast"),
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
      className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-white/90 backdrop-blur-md border-t border-slate-200/80 py-1 px-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] transition-all"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95",
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
              <span className="text-[10px] tracking-tight leading-none text-center">
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
