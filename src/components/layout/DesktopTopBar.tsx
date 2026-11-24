import { ThemeToggle } from "@/components/common/ThemeToggle";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
 Sparkles,
 Building2,
 PhoneCall,
 KeyRound,
 Crown,
 ChevronDown,
 Shield,
 User,
 ExternalLink,
 Menu,
} from "lucide-react";
import { UserRole, Building, PlatformBroadcast } from "@/types/schema.types";
import { BuildingSwitcher } from "./BuildingSwitcher";
import { NotificationCenter } from "./NotificationCenter";
import { switchDemoPersonaAction, signOutAction } from "@/app/actions/auth";
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
  userId?: string;
}

export function DesktopTopBar({
 fullName,
 role,
 pgName,
 buildings = [],
 activeBuildingId,
 broadcasts = [],
}: DesktopTopBarProps) {
 const [showPersonaMenu, setShowPersonaMenu] = useState(false);
 const { isCollapsed, toggleSidebar } = useSidebar();

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
 className={cn(
 "hidden lg:flex h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 pr-8 transition-[padding] duration-300 ease-in-out shadow-xs",
 isCollapsed ? "lg:pl-[92px]" : "lg:pl-[280px]"
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
 "p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs",
 isCollapsed && "bg-indigo-50 text-indigo-600 border-indigo-200"
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
 {pgName || "Shuny Stays PG"}
 </span>
 <span className="text-xs text-slate-300">•</span>
 <span className="text-xs font-medium text-slate-500">Resident Portal</span>
 </div>
 ) : (
 <div className="flex items-center gap-2 min-w-0">
 <span className="text-xs font-black text-slate-900 truncate">
 {pgName || "Shuny Stays PG Network"}
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
 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
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
 className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
 >
 <KeyRound className="w-4 h-4" />
 </Link>

 {/* Role Persona Switcher Pill (Interactive dropdown for dev/testing) */}
 <div className="relative">
 <button
 type="button"
 onClick={() => setShowPersonaMenu(!showPersonaMenu)}
 title="Click to switch live persona"
 className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black border transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${badge.className}`}
 >
 <span className={`w-2 h-2 rounded-full animate-pulse ${badge.dot}`} />
 <span>{badge.label}</span>
 <ChevronDown className="w-3 h-3 opacity-60" />
 </button>

 {showPersonaMenu && (
 <div className="absolute right-0 top-11 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95">
 <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
 <span className="flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Switch Demo Role Persona
 </span>
 </div>

 <div className="space-y-1">
 <button
 type="button"
 onClick={() => {
 setShowPersonaMenu(false);
 switchDemoPersonaAction("owner");
 }}
 className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors text-left"
 >
 <div>
 <span className="font-extrabold text-emerald-600">PG Owner</span>
 <p className="text-[10px] text-slate-500">Full business & financial superset</p>
 </div>
 </button>

 <button
 type="button"
 onClick={() => {
 setShowPersonaMenu(false);
 switchDemoPersonaAction("admin");
 }}
 className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors text-left"
 >
 <div>
 <span className="font-extrabold text-amber-700">PG Warden / Admin</span>
 <p className="text-[10px] text-slate-500">Attendance, meal poll & cash desk</p>
 </div>
 </button>

 <button
 type="button"
 onClick={() => {
 setShowPersonaMenu(false);
 switchDemoPersonaAction("tenant");
 }}
 className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors text-left"
 >
 <div>
 <span className="font-extrabold text-indigo-600">Resident Tenant</span>
 <p className="text-[10px] text-slate-500">Digital ID, meal poll & UPI dues</p>
 </div>
 </button>

 <button
 type="button"
 onClick={() => {
 setShowPersonaMenu(false);
 switchDemoPersonaAction("super_admin");
 }}
 className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors text-left"
 >
 <div>
 <span className="font-extrabold text-purple-700">Super Admin</span>
 <p className="text-[10px] text-slate-500">Platform SaaS governance & all PGs</p>
 </div>
 </button>
 </div>
 </div>
 )}
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
