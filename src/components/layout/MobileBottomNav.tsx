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
  const [pendingTabId, setPendingTabId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Sync overrides and pending navigation with route changes
  useEffect(() => {
    setActiveTabOverride(null);
    setPendingTabId(null);
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Listen to external tab switch events from SuperAdminDashboard
  useEffect(() => {
    const handleCustomTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: string }>;
      if (customEvent.detail?.tab) {
        setActiveTabOverride(customEvent.detail.tab);
        setPendingTabId(customEvent.detail.tab);
      }
    };

    window.addEventListener("superadmin:switchtab", handleCustomTabSwitch);
    return () => {
      window.removeEventListener("superadmin:switchtab", handleCustomTabSwitch);
    };
  }, []);

  const superAdminCurrentTab =
    activeTabOverride || searchParams?.get("tab") || "overview";

  const handleTabPointerDown = (tab: NavTab) => {
    try {
      router.prefetch(tab.href);
    } catch {}
    if (!tab.isActive) {
      setPendingTabId(tab.id);
      setIsNavigating(true);
    }
  };

  const handleTabClick = (e: React.MouseEvent, tab: NavTab) => {
    if (role === "super_admin") {
      e.preventDefault();
      setActiveTabOverride(tab.id);
      setPendingTabId(tab.id);
      window.dispatchEvent(
        new CustomEvent("superadmin:switchtab", { detail: { tab: tab.id } })
      );
      if (pathname === "/super-admin") {
        router.push(tab.href, { scroll: false });
      } else {
        router.push(tab.href);
      }
    } else {
      setPendingTabId(tab.id);
      setIsNavigating(true);
    }
  };

  // If on onboarding or standalone auth pages, hide bottom nav
  if (pathname === "/onboarding" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  // Destinations per role (5 tabs for Owner, Admin, Super Admin; 4 tabs for Tenant)
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
      id: "mess",
      label: "Mess",
      href: "/dashboard/meal-poll",
      icon: Utensils,
      isActive:
        pathname.startsWith("/dashboard/meal-poll") ||
        pathname.startsWith("/dashboard/mess"),
    },
    {
      id: "ledger",
      label: "Ledger",
      href: "/dashboard/ledger",
      icon: IndianRupee,
      isActive: pathname.startsWith("/dashboard/ledger") || pathname.startsWith("/dashboard/finance"),
    },
    {
      id: "passes",
      label: "Passes & Ops",
      href: "/dashboard/passes",
      icon: ShieldCheck,
      isActive:
        pathname.startsWith("/dashboard/passes") ||
        pathname.startsWith("/dashboard/ops") ||
        pathname.startsWith("/dashboard/staff") ||
        pathname.startsWith("/dashboard/complaints"),
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
      id: "mess",
      label: "Mess",
      href: "/dashboard/meal-poll",
      icon: Utensils,
      isActive:
        pathname.startsWith("/dashboard/meal-poll") ||
        pathname.startsWith("/dashboard/mess"),
    },
    {
      id: "passes_help",
      label: "Passes",
      href: "/dashboard/passes",
      icon: Ticket,
      isActive:
        pathname.startsWith("/dashboard/passes") ||
        pathname.startsWith("/dashboard/ops") ||
        pathname.startsWith("/dashboard/staff") ||
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
      label: "Hosted PGs",
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
      isActive: pathname === "/super-admin" && superAdminCurrentTab === "broadcast",
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
    <>
      {/* Top Instant Micro-Progress Bar for Navigation Feedback */}
      {isNavigating && (
        <div
          aria-hidden="true"
          className="fixed top-0 inset-x-0 h-[2.5px] z-[99999] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse pointer-events-none"
        />
      )}

      <nav
        aria-label="Mobile Bottom Navigation"
        style={{
          bottom: "max(env(safe-area-inset-bottom, 0px), 12px)",
        }}
        className="fixed inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] z-40 select-none lg:hidden pointer-events-auto transition-all duration-300"
      >
        <div className="apple-liquid-glass-tabbar p-1.5 shadow-2xl">
          <div
            className={cn(
              "grid items-center h-12 w-full gap-1",
              tabs.length === 5 ? "grid-cols-5" : "grid-cols-4"
            )}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = pendingTabId ? pendingTabId === tab.id : tab.isActive;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  prefetch={true}
                  aria-current={isSelected ? "page" : undefined}
                  onTouchStart={() => handleTabPointerDown(tab)}
                  onPointerDown={() => handleTabPointerDown(tab)}
                  onClick={(e) => handleTabClick(e, tab)}
                  className={cn(
                    "relative flex flex-col items-center justify-center h-full rounded-full transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 select-none",
                    isSelected
                      ? "bg-indigo-600/12 text-indigo-700 shadow-2xs font-extrabold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-black/5 font-semibold"
                  )}
                >
                  {/* Icon Container with Badge */}
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={cn(
                        "w-[19px] h-[19px] transition-transform duration-150",
                        isSelected
                          ? "stroke-[2.35] text-indigo-600 scale-105"
                          : "stroke-[1.8] text-slate-600"
                      )}
                      aria-hidden="true"
                    />

                    {/* Count Badge */}
                    {tab.badge != null && tab.badge > 0 && (
                      <span
                        aria-label={`${tab.badge} pending items`}
                        className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9.5px] font-black bg-rose-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white/95 animate-in zoom-in-75"
                      >
                        {tab.badge > 99 ? "99+" : tab.badge}
                      </span>
                    )}
                  </div>

                  {/* Short Label */}
                  <span
                    className={cn(
                      "text-[9.5px] tracking-tight leading-none text-center transition-colors duration-150 mt-0.5",
                      isSelected
                        ? "font-extrabold text-indigo-700"
                        : "font-semibold text-slate-600"
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

export function MobileBottomNav(props: MobileBottomNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner {...props} />
    </Suspense>
  );
}
