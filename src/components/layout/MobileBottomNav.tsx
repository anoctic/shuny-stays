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
    <nav
      aria-label="Mobile Bottom Navigation"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
      }}
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none lg:hidden"
    >
      <div
        className={cn(
          "max-w-md mx-auto grid items-center h-14 px-1.5",
          tabs.length === 5 ? "grid-cols-5" : "grid-cols-4"
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={tab.isActive ? "page" : undefined}
              onClick={(e) => handleTabClick(e, tab)}
              className={cn(
                "relative flex flex-col items-center justify-center h-full gap-0.5 rounded-xl transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                tab.isActive
                  ? "text-indigo-600 font-extrabold"
                  : "text-slate-400 hover:text-slate-700 font-medium"
              )}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-150",
                    tab.isActive
                      ? "stroke-[2.25] text-indigo-600 scale-105"
                      : "stroke-[1.75] text-slate-400 group-hover:text-slate-600"
                  )}
                  aria-hidden="true"
                />

                {/* Count Badge */}
                {tab.badge != null && tab.badge > 0 && (
                  <span
                    aria-label={`${tab.badge} pending items`}
                    className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white animate-in zoom-in-75"
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>

              {/* Short Label */}
              <span
                className={cn(
                  "text-[10px] tracking-tight leading-none text-center transition-colors duration-150",
                  tab.isActive
                    ? "font-bold text-indigo-600"
                    : "font-medium text-slate-500"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
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
