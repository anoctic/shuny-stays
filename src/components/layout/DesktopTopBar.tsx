"use client";

import Link from "next/link";
import {
 Building2,
 PhoneCall,
 KeyRound,
 Menu,
} from "lucide-react";
import { UserRole, Building, PlatformBroadcast } from "@/types/schema.types";
import { BuildingSwitcher } from "./BuildingSwitcher";
import { NotificationCenter } from "./NotificationCenter";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

interface DesktopTopBarProps {
 fullName: string;
 role: UserRole;
 pgName?: string | null;
 buildings?: Building[];
 activeBuildingId?: string | null;
 broadcasts?: PlatformBroadcast[];
}

export function DesktopTopBar({
 fullName,
 role,
 pgName,
 buildings = [],
 activeBuildingId,
 broadcasts = [],
}: DesktopTopBarProps) {
 const { isCollapsed, toggleSidebar, effectiveWidth, isDragging } = useSidebar();

 const roleBadgeConfig = {
 super_admin: {
 label: "Super Admin",
 className: "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs",
 dot: "bg-indigo-600",
 },
 owner: {
 label: "PG Owner",
 className: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs",
 dot: "bg-emerald-600",
 },
 admin: {
 label: "Warden / Admin",
 className: "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs",
 dot: "bg-amber-600",
 },
 tenant: {
 label: "Tenant Resident",
 className: "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs",
 dot: "bg-indigo-600",
 },
 };

 const badge = roleBadgeConfig[role] || roleBadgeConfig.tenant;

 return (
 <header
      style={{ ["--sidebar-w" as any]: `${effectiveWidth + 16}px` }}
      className={cn(
        "hidden lg:flex h-16 sticky top-0 z-30 apple-liquid-glass-toolbar pr-8 lg:pl-[var(--sidebar-w)] select-none",
        isDragging ? "transition-none" : "transition-[padding] duration-200 ease-in-out"
      )}
    >
 <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
 {/* LEFT: 3-Lines Menu Toggle + Context Breadcrumb */}
 <div className="flex items-center gap-3 min-w-0">
 <button
 type="button"
 onClick={toggleSidebar}
 title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
 className={cn(
        "p-2 rounded-full apple-liquid-glass-pill text-slate-700 hover:text-indigo-600 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600",
 isCollapsed && "bg-indigo-50/80 text-indigo-600 border-indigo-200"
 )}
 aria-label="Toggle Sidebar Navigation"
 >
 <Menu className="w-4 h-4" />
 </button>

 <div className="h-4 w-px bg-slate-200 hidden sm:block" />

 {role === "super_admin" ? (
 <div className="flex items-center gap-2 min-w-0">
 <span className="text-xs font-black text-slate-900 truncate">
 SaaS Governance Console
 </span>
 <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
 Global Control
 </span>
 </div>
 ) : role === "tenant" ? (
 <div className="flex items-center gap-2 min-w-0">
 <span className="text-xs font-black text-slate-900 truncate">
 {pgName || "My PG Stay"}
 </span>
 <span className="text-xs text-slate-300">•</span>
 <span className="text-xs font-medium text-slate-500">Resident Portal</span>
 </div>
 ) : (
 <div className="flex items-center gap-2 min-w-0">
 <span className="text-xs font-black text-slate-900 truncate">
 {pgName || "My Property"}
 </span>
 <span className="text-[10px] text-slate-400 hidden md:inline">
 ({role === "owner" ? "Owner View" : "Warden View"})
 </span>
 </div>
 )}
 </div>

 {/* RIGHT: Desktop Utilities (Building Switcher, Notifications, Settings, Persona Switcher) */}
 <div className="flex items-center gap-2.5">
 {/* Building Switcher for Owner & Admin with multiple buildings */}
 {(role === "owner" || role === "admin") && buildings.length > 0 && (
 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full apple-liquid-glass-pill text-slate-800">
 <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <BuildingSwitcher buildings={buildings} activeBuildingId={activeBuildingId} />
 </div>
 )}

 {/* Real-time Notification Center */}
 <NotificationCenter broadcasts={broadcasts} userRole={role} />

 {/* Security & Settings shortcut */}
 <Link
 href={
 role === "super_admin"
 ? "/super-admin?tab=settings"
 : role === "tenant"
 ? "/tenant/settings"
 : "/dashboard/settings"
 }
 title="Account & Security Settings"
 className="p-2 text-slate-600 hover:text-indigo-600 rounded-full apple-liquid-glass-pill transition-all cursor-pointer flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
 >
 <KeyRound className="w-4 h-4" />
 </Link>

 {/* Current Logged-In Role Badge (Read-only) */}
 <div
 title={`Current Role: ${badge.label}`}
 className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black shadow-xs apple-liquid-glass-pill",
        badge.className
      )}
 >
 <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
 <span>{badge.label}</span>
 </div>

 {/* Tenant Emergency Call Hotline */}
 {role === "tenant" && (
 <a
 href="tel:+919876543210"
 title="Emergency Helpdesk"
 className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
 >
 <PhoneCall className="w-4 h-4" />
 </a>
 )}
 </div>
 </div>
 </header>
 );
}
