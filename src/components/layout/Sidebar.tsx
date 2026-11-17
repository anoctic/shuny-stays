"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  BedDouble,
  Users,
  Receipt,
  AlertCircle,
  Database,
  Terminal,
  ShieldCheck,
  LayoutDashboard,
  HardDrive,
  Layers,
  Building,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSessionProfile } from "@/types/pg-domain.types";

interface SidebarProps {
  session: UserSessionProfile;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const pgOwnerNavItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Rooms & Beds", href: "/rooms", icon: BedDouble },
  { name: "Residents", href: "/residents", icon: Users },
  { name: "Rent & Invoicing", href: "/billing", icon: Receipt },
  { name: "Complaints", href: "/complaints", icon: AlertCircle, badge: "2 Open" },
];

const residentNavItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Room & Bed", href: "/rooms", icon: BedDouble },
  { name: "My Rent Dues", href: "/billing", icon: Receipt },
  { name: "File Complaint", href: "/complaints", icon: AlertCircle },
];

const postgresAdminNavItems: NavItem[] = [
  { name: "DB Overview", href: "/database", icon: HardDrive },
  { name: "Schema & Tables", href: "/database/schema", icon: Layers },
  { name: "SQL Console", href: "/database/query", icon: Terminal, badge: "Admin" },
  { name: "RLS Security", href: "/database/rls", icon: ShieldCheck },
];

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();

  const isSuperAdmin = session.is_super_admin;
  const isResident = session.role === "resident";
  const activeNavItems = isResident ? residentNavItems : pgOwnerNavItems;

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand & Multi-Tenant PG Badge */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          PG
        </div>
        <div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight block">
            PG Manager
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">
            Multi-Tenant • {session.role.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Group 1: Super Admin Area (ONLY visible to super_admin) */}
        {isSuperAdmin && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-cyan-600" />
                Super Admin Area
              </span>
            </div>
            <nav className="space-y-1">
              <Link
                href="/admin/organizations"
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/admin/organizations")
                    ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-cyan-600" />
                  <span>Organizations</span>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 font-mono">
                  Manage
                </span>
              </Link>
            </nav>
          </div>
        )}

        {/* Group 2: Paying Guest / Hostel Operations */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {isResident ? "Resident Portal" : "Hostel / PG Ops"}
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="SaaS Online" />
          </div>
          <nav className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Group 3: PostgreSQL Multi-Tenant DB Manager (RESTRICTED TO super_admin ONLY) */}
        {isSuperAdmin && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Database className="h-3 w-3 text-cyan-600" />
                PostgreSQL Studio
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-mono">
                Admin
              </span>
            </div>
            <nav className="space-y-1">
              {postgresAdminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 font-semibold"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", isActive ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-400")} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer / Tenant Architecture Info */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs text-zinc-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Active Role:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-semibold capitalize">
            {session.role.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">RLS Boundary:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
            {isSuperAdmin ? "Global (Bypass)" : "Membership-Bound"}
          </span>
        </div>
      </div>
    </aside>
  );
}
