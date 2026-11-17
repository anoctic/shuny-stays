"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Activity,
  Database,
  Shield,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

interface SuperAdminSidebarProps {
  viewingOrgName?: string | null;
}

const navItems = [
  { name: "Platform Overview", href: "/super-admin", icon: LayoutDashboard },
  { name: "Organizations", href: "/super-admin/organizations", icon: Building2 },
  { name: "Subscriptions", href: "/super-admin/subscriptions", icon: CreditCard },
  { name: "Platform Health", href: "/super-admin/health", icon: Activity },
  { name: "PostgreSQL Studio", href: "/super-admin/database", icon: Database },
];

export function SuperAdminSidebar({ viewingOrgName }: SuperAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-purple-100 dark:border-purple-950/60 bg-white dark:bg-zinc-950 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-purple-100 dark:border-purple-950/60">
        <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-purple-500/20">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight block">
            PG Manager
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
            Platform Super Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-2">
            Governance Console
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/super-admin"
                  ? pathname === "/super-admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 shadow-xs border border-purple-200 dark:border-purple-900/60"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${
                      isActive ? "text-purple-600 dark:text-purple-400" : "text-zinc-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* View As Org Shortcut if active */}
        {viewingOrgName && (
          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
              Active Org Preview
            </span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {viewingOrgName}
            </p>
            <Link
              href="/owner"
              className="flex items-center justify-between text-purple-600 hover:text-purple-700 font-semibold text-[11px] pt-1"
            >
              <span>Open Owner Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-purple-100 dark:border-purple-950/60 bg-purple-50/30 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            Platform Engine Online
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
          PostgreSQL Cloud AP-South-1
        </span>
      </div>
    </aside>
  );
}
