"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
 BedDouble,
 ClipboardCheck,
 IndianRupee,
 ShieldCheck,
 Ticket,
 Utensils,
 Home,
 MessageSquareWarning,
 Building2,
 Database,
 Activity,
 CreditCard,
 Settings,
 LogOut,
 Sparkles,
 Users,
 ChevronRight,
 LucideIcon,
 Crown,
 Lock,
 Menu,
} from "lucide-react";
import { UserRole, Building } from "@/types/schema.types";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { signOutAction, switchDemoPersonaAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

interface SidebarItem {
 id: string;
 label: string;
 href: string;
 icon: LucideIcon;
 badge?: number | string | null;
 isActive: boolean;
}

interface DesktopSidebarProps {
 role: UserRole;
 fullName: string;
 pgName?: string | null;
 buildings?: Building[];
 activeBuildingId?: string | null;
 openComplaintsCount?: number;
 pendingPassesCount?: number;
 pendingDuesCount?: number;
}

export function DesktopSidebar({
 role,
 fullName,
 pgName,
 buildings = [],
 activeBuildingId,
 openComplaintsCount = 0,
 pendingPassesCount = 0,
 pendingDuesCount = 0,
}: DesktopSidebarProps) {
 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const { isCollapsed, toggleSidebar } = useSidebar();
 const [isHovered, setIsHovered] = useState(false);
 const isExpanded = !isCollapsed || isHovered;
 const [activeTabOverride, setActiveTabOverride] = useState<string | null>(null);

 useEffect(() => {
 setActiveTabOverride(null);
 }, [pathname, searchParams]);

 const superAdminCurrentTab =
 activeTabOverride || searchParams?.get("tab") || "overview";

 const handleSuperAdminClick = (e: React.MouseEvent, tabId: string, href: string) => {
 if (role === "super_admin") {
 e.preventDefault();
 setActiveTabOverride(tabId);
 window.dispatchEvent(
 new CustomEvent("superadmin:switchtab", { detail: { tab: tabId } })
 );
 if (pathname === "/super-admin") {
 router.push(href, { scroll: false });
 } else {
 router.push(href);
 }
 }
 };

 // Nav configurations per role
 let navItems: SidebarItem[] = [];

 if (role === "super_admin") {
 navItems = [
 {
 id: "overview",
 label: "Master Overview",
 href: "/super-admin?tab=overview",
 icon: Building2,
 isActive: pathname === "/super-admin" && superAdminCurrentTab === "overview",
 },
 {
 id: "organizations",
 label: "Hosted PG Brands",
 href: "/super-admin?tab=organizations",
 icon: Crown,
 isActive:
 (pathname === "/super-admin" && superAdminCurrentTab === "organizations") ||
 pathname.startsWith("/super-admin/organizations"),
 },
 {
 id: "billing",
 label: "PG Subscriptions & Plans",
 href: "/super-admin?tab=billing",
 icon: CreditCard,
 isActive:
 (pathname === "/super-admin" && superAdminCurrentTab === "billing") ||
 pathname.startsWith("/super-admin/subscriptions"),
 },
 {
 id: "database",
 label: "Database & Tables",
 href: "/super-admin/database",
 icon: Database,
 isActive: pathname.startsWith("/super-admin/database"),
 },
 {
 id: "health",
 label: "System Health & Ops",
 href: "/super-admin/health",
 icon: Activity,
 isActive: pathname.startsWith("/super-admin/health"),
 },
 {
 id: "settings",
 label: "Platform & Bank Settings",
 href: "/super-admin?tab=settings",
 icon: Settings,
 isActive:
 (pathname === "/super-admin" && superAdminCurrentTab === "settings") ||
 pathname.startsWith("/super-admin/settings"),
 },
 ];
 } else if (role === "owner") {
 navItems = [
 {
 id: "rooms",
 label: "Rooms & Beds",
 href: "/dashboard/rooms",
 icon: BedDouble,
 isActive: pathname === "/dashboard" || pathname.startsWith("/dashboard/rooms"),
 },
 {
 id: "attendance",
 label: "Resident Attendance",
 href: "/dashboard/attendance",
 icon: ClipboardCheck,
 isActive: pathname.startsWith("/dashboard/attendance"),
 },
 {
 id: "meal_poll",
 label: "Meal Poll & Wastage",
 href: "/dashboard/meal-poll",
 icon: Utensils,
 isActive: pathname.startsWith("/dashboard/meal-poll"),
 },
 {
 id: "ledger",
 label: "Rent Ledger & Finance",
 href: "/dashboard/ledger",
 icon: IndianRupee,
 isActive:
 pathname.startsWith("/dashboard/ledger") ||
 pathname.startsWith("/dashboard/finance"),
 badge: pendingDuesCount > 0 ? `${pendingDuesCount} Due` : null,
 },
 {
 id: "passes",
 label: "Gate Passes",
 href: "/dashboard/passes",
 icon: Ticket,
 isActive: pathname.startsWith("/dashboard/passes"),
 badge: pendingPassesCount > 0 ? pendingPassesCount : null,
 },
 {
 id: "complaints",
 label: "Complaints & Support",
 href: "/dashboard/complaints",
 icon: MessageSquareWarning,
 isActive: pathname.startsWith("/dashboard/complaints"),
 badge: openComplaintsCount > 0 ? openComplaintsCount : null,
 },
 {
 id: "staff",
 label: "Wardens & Staff",
 href: "/dashboard/staff",
 icon: ShieldCheck,
 isActive:
 pathname.startsWith("/dashboard/staff") ||
 pathname.startsWith("/dashboard/ops"),
 },
 {
 id: "settings",
 label: "PG Branding & Settings",
 href: "/dashboard/settings",
 icon: Settings,
 isActive: pathname.startsWith("/dashboard/settings"),
 },
 ];
 } else if (role === "admin") {
 navItems = [
 {
 id: "rooms",
 label: "Rooms & Beds",
 href: "/dashboard/rooms",
 icon: BedDouble,
 isActive: pathname === "/dashboard" || pathname.startsWith("/dashboard/rooms"),
 },
 {
 id: "attendance",
 label: "Mark Attendance",
 href: "/dashboard/attendance",
 icon: ClipboardCheck,
 isActive: pathname.startsWith("/dashboard/attendance"),
 },
 {
 id: "meal_poll",
 label: "Lunch Headcount",
 href: "/dashboard/meal-poll",
 icon: Utensils,
 isActive: pathname.startsWith("/dashboard/meal-poll"),
 },
 {
 id: "passes",
 label: "Issue Gate Passes",
 href: "/dashboard/passes",
 icon: Ticket,
 isActive: pathname.startsWith("/dashboard/passes"),
 badge: pendingPassesCount > 0 ? pendingPassesCount : null,
 },
 {
 id: "cash_rent",
 label: "Cash Rent Collection",
 href: "/dashboard/ledger",
 icon: IndianRupee,
 isActive: pathname.startsWith("/dashboard/ledger"),
 },
 {
 id: "complaints",
 label: "Tenant Complaints",
 href: "/dashboard/complaints",
 icon: MessageSquareWarning,
 isActive: pathname.startsWith("/dashboard/complaints"),
 badge: openComplaintsCount > 0 ? openComplaintsCount : null,
 },
 {
 id: "settings",
 label: "Warden Settings",
 href: "/dashboard/settings",
 icon: Settings,
 isActive: pathname.startsWith("/dashboard/settings"),
 },
 ];
 } else {
 // Tenant Portal
 navItems = [
 {
 id: "home",
 label: "Resident Desk",
 href: "/tenant",
 icon: Home,
 isActive: pathname === "/tenant",
 },
 {
 id: "mess",
 label: "Mess & Lunch Poll",
 href: "/tenant/mess",
 icon: Utensils,
 isActive: pathname.startsWith("/tenant/mess"),
 },
 {
 id: "dues",
 label: "Rent & Invoices",
 href: "/tenant/dues",
 icon: IndianRupee,
 isActive: pathname.startsWith("/tenant/dues"),
 },
 {
 id: "passes",
 label: "Gate Passes",
 href: "/tenant/passes",
 icon: Ticket,
 isActive: pathname.startsWith("/tenant/passes"),
 },
 {
 id: "complaints",
 label: "Raise Complaint",
 href: "/tenant/complaints",
 icon: MessageSquareWarning,
 isActive: pathname.startsWith("/tenant/complaints"),
 },
 {
 id: "settings",
 label: "Account & KYC",
 href: "/tenant/settings",
 icon: Settings,
 isActive: pathname.startsWith("/tenant/settings"),
 },
 ];
 }

 const roleLabels = {
 super_admin: "Super Admin",
 owner: "PG Owner",
 admin: "PG Warden",
 tenant: "Resident Tenant",
 };

 const roleColors = {
 super_admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
 owner: "bg-emerald-50 text-emerald-700 border-emerald-200",
 admin: "bg-amber-50 text-amber-800 border-amber-200",
 tenant: "bg-indigo-50 text-indigo-700 border-indigo-200",
 };

 return (
 <aside
 onMouseEnter={() => {
 if (isCollapsed) setIsHovered(true);
 }}
 onMouseLeave={() => {
 if (isCollapsed) setIsHovered(false);
 }}
 className={cn(
 "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-50 bg-white border-r border-slate-200 shadow-sm transition-[width,box-shadow] duration-300 ease-in-out select-none overflow-x-hidden",
 isExpanded ? "lg:w-64" : "lg:w-[72px]",
 isCollapsed && isHovered && "shadow-2xl ring-1 ring-slate-900/10"
 )}
 aria-label="Desktop Sidebar Navigation"
 >
 {/* 1. BRAND HEADER */}
 <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2 min-h-[64px]">
 <Link
 href={role === "super_admin" ? "/super-admin" : role === "tenant" ? "/tenant" : "/dashboard"}
 className="flex items-center gap-2.5 min-w-0 group flex-1 overflow-hidden"
 title={role === "super_admin" ? "ShunyStays Admin" : pgName || "Shuny Stays PG"}
 >
 <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform mx-auto">
 {role === "super_admin" ? (
 <Crown className="w-5 h-5 text-amber-300" />
 ) : pgName && pgName !== "Shuny Stays Properties" ? (
 pgName.slice(0, 2).toUpperCase()
 ) : (
 <ShunyStaysEmblem className="w-7 h-7" />
 )}
 </div>
 {isExpanded && (
 <div className="min-w-0 flex-1 animate-in fade-in duration-200">
 <div className="font-black text-xs sm:text-sm text-slate-900 truncate">
 {role === "super_admin" ? (
 <span>Shuny<span className="text-indigo-600">Stays</span> Admin</span>
 ) : (
 pgName || "Shuny Stays PG"
 )}
 </div>
 <div className="flex items-center gap-1.5 mt-0.5">
 <span className={cn("px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border", roleColors[role])}>
 {roleLabels[role]}
 </span>
 </div>
 </div>
 )}
 </Link>

 {isExpanded && (
 <button
 type="button"
 onClick={toggleSidebar}
 title={isCollapsed ? "Pin sidebar open" : "Shrink sidebar to icons (Ctrl+B)"}
 className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0 animate-in fade-in duration-200"
 aria-label="Toggle Sidebar Shrink"
 >
 <Menu className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* 2. NAVIGATION LINKS */}
 <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto phone-scroll overflow-x-hidden">
 {isExpanded ? (
 <div className="text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400 px-3 pb-1 truncate animate-in fade-in duration-200">
 Menu & Operations
 </div>
 ) : (
 <div className="h-1" />
 )}

 {navItems.map((item) => {
 const Icon = item.icon;
 return (
 <Link
 key={item.id}
 href={item.href}
 title={!isExpanded ? item.label : undefined}
 onClick={(e) => {
 if (role === "super_admin") {
 handleSuperAdminClick(e, item.id, item.href);
 }
 }}
 className={cn(
 "group relative flex items-center rounded-xl text-xs transition-all duration-150 cursor-pointer",
 isExpanded ? "justify-between px-3 py-2.5" : "justify-center w-11 h-11 mx-auto",
 item.isActive
 ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-2xs"
 : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
 )}
 >
 <div className={cn("flex items-center min-w-0", isExpanded ? "gap-2.5 flex-1" : "justify-center")}>
 <Icon
 className={cn(
 "w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
 item.isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
 )}
 />
 {isExpanded && <span className="truncate animate-in fade-in duration-200">{item.label}</span>}
 </div>

 {item.badge != null && (
 isExpanded ? (
 <span
 className={cn(
 "px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 animate-in fade-in duration-200",
 item.isActive
 ? "bg-indigo-100 text-indigo-800"
 : "bg-indigo-50 text-indigo-700 border border-indigo-200"
 )}
 >
 {item.badge}
 </span>
 ) : (
 <span
 className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse"
 title={`${item.badge}`}
 />
 )
 )}
 </Link>
 );
 })}
 </nav>

 {/* 3. USER PROFILE & LOGOUT FOOTER */}
 <div className="p-2.5 border-t border-slate-100 bg-slate-50/70">
 {isExpanded ? (
 <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs animate-in fade-in duration-200">
 <div className="min-w-0 flex items-center gap-2">
 <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-[11px] shrink-0">
 {fullName ? fullName[0].toUpperCase() : "U"}
 </div>
 <div className="min-w-0">
 <div className="text-xs font-black text-slate-900 truncate">
 {fullName}
 </div>
 <div className="text-[9.5px] text-slate-500 truncate">
 {roleLabels[role]}
 </div>
 </div>
 </div>

 <form action={signOutAction}>
 <button
 type="submit"
 className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
 title="Log Out"
 >
 <LogOut className="w-3.5 h-3.5" />
 </button>
 </form>
 </div>
 ) : (
 <div className="flex flex-col items-center gap-2 py-1">
 <div
 className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xs shadow-2xs"
 title={`${fullName} (${roleLabels[role]})`}
 >
 {fullName ? fullName[0].toUpperCase() : "U"}
 </div>
 <form action={signOutAction}>
 <button
 type="submit"
 className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
 title="Log Out"
 >
 <LogOut className="w-3.5 h-3.5" />
 </button>
 </form>
 </div>
 )}
 </div>
 </aside>
 );
}
