"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BedDouble, Receipt, AlertCircle } from "lucide-react";

const navItems = [
  { name: "My Bed & Stay", href: "/resident", icon: BedDouble },
  { name: "My Invoices", href: "/resident/invoices", icon: Receipt },
  { name: "My Complaints", href: "/resident/complaints", icon: AlertCircle },
];

export function ResidentNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop/Tablet Top Tabs */}
      <div className="hidden sm:flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-2.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/resident"
              ? pathname === "/resident"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Fixed Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/resident"
              ? pathname === "/resident"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                isActive ? "text-emerald-600 font-bold" : "text-zinc-400 font-medium"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.name.replace("My ", "")}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
