"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  Receipt,
  AlertCircle,
  Building,
} from "lucide-react";

interface OwnerSidebarProps {
  organizationName?: string | null;
}

const navItems = [
  { name: "Overview", href: "/owner", icon: LayoutDashboard },
  { name: "Properties", href: "/owner/properties", icon: Building2 },
  { name: "Rooms & Beds", href: "/owner/rooms", icon: BedDouble },
  { name: "Residents", href: "/owner/residents", icon: Users },
  { name: "Rent & Ledger", href: "/owner/rent", icon: Receipt },
  { name: "Complaints", href: "/owner/complaints", icon: AlertCircle, badge: "2 Open" },
];

export function OwnerSidebar({ organizationName }: OwnerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-indigo-100 dark:border-indigo-950/60 bg-white dark:bg-zinc-950 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-950/60">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-500/20">
          <Building className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight block truncate">
            {organizationName || "Zenith Luxury PG"}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block">
            Owner Operations
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
            Hostel Management
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/owner"
                  ? pathname === "/owner"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 shadow-xs border border-indigo-200 dark:border-indigo-900/60"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-4 w-4 ${
                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-zinc-900/40">
        <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block truncate">
          {organizationName || "Zenith Luxury PG"}
        </span>
        <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
          RLS Tenant Membership Enforced
        </span>
      </div>
    </aside>
  );
}
