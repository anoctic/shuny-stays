"use client";

import Link from "next/link";
import { LogOut, PhoneCall, KeyRound } from "lucide-react";
import { ShunyStaysEmblem } from "@/components/common/ShunyStaysLogo";
import { UserRole, Building, PlatformBroadcast } from "@/types/schema.types";
import { BuildingSwitcher } from "./BuildingSwitcher";
import { NotificationCenter } from "./NotificationCenter";
import { signOutAction } from "@/app/actions/auth";

interface MobileTopHeaderProps {
 fullName: string;
 role: UserRole;
 pgName?: string | null;
 buildings?: Building[];
 activeBuildingId?: string | null;
 broadcasts?: PlatformBroadcast[];
}

export function MobileTopHeader({
 fullName,
 role,
 pgName,
 buildings = [],
 activeBuildingId,
 broadcasts = [],
}: MobileTopHeaderProps) {

 // Fintech Indigo Exact Badge Styling from Blueprint
 const roleBadgeConfig = {
 super_admin: {
 label: "Super Admin",
 className: "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30",
 dot: "bg-indigo-600",
 },
 owner: {
 label: "PG Owner",
 className: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30",
 dot: "bg-emerald-600",
 },
 admin: {
 label: "Warden / Admin",
 className: "bg-amber-500/20 text-amber-800 border border-amber-500/40",
 dot: "bg-amber-600",
 },
 tenant: {
 label: "Tenant",
 className: "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30",
 dot: "bg-indigo-600",
 },
 };

 const badge = roleBadgeConfig[role] || roleBadgeConfig.tenant;

 // Initials for avatar
 const initials = fullName
 ? fullName
 .split(" ")
 .map((n) => n[0])
 .join("")
 .slice(0, 2)
 .toUpperCase()
 : "U";

 return (
 <header className="sticky top-0 z-[40] apple-liquid-glass-toolbar px-3.5 py-2.5 shadow-xs transition-colors lg:hidden select-none">
 <div className="flex items-center justify-between gap-2.5">
 {/* Left: Role-Specific Monogram & Brand / Identity */}
 <div className="flex items-center gap-2 min-w-0">
 {role === "owner" && (
 pgName ? (
 <div className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
 {pgName.slice(0, 2).toUpperCase()}
 </div>
 ) : (
 <ShunyStaysEmblem className="w-8 h-8 shadow-xs" />
 )
 )}
 {role === "admin" && (
 <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
 {initials}
 </div>
 )}
 {role === "tenant" && (
 <div className="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
 {pgName ? pgName.slice(0, 2).toUpperCase() : "PG"}
 </div>
 )}
 {role === "super_admin" && (
 <ShunyStaysEmblem className="w-8 h-8 shadow-xs" />
 )}

 <div className="min-w-0">
 <div className="text-xs font-extrabold text-[#0F172A] truncate">
 {role === "super_admin" ? (
 <span>
 Shuny<span className="text-[#4F46E5]">Stays</span> Super Admin
 </span>
 ) : role === "tenant" ? (
 pgName || "My PG Stay"
 ) : role === "admin" ? (
 `Warden ${fullName}`
 ) : (
 pgName || "My Property Stay"
 )}
 </div>
 <div className="text-[10px] font-semibold text-[#64748B] truncate">
 {role === "super_admin"
 ? "SaaS Platform Control"
 : role === "owner"
 ? "Owner • Shuny Stays"
 : role === "admin"
 ? "Scoped Admin • Shuny Stays"
 : `${fullName} • Tenant`}
 </div>
 </div>
 </div>

 {/* Right: Quick Building Switcher / Notification Bell / Role Badge / Sign Out */}
 <div className="flex items-center gap-1.5 shrink-0">
 {/* For Owners with buildings: Compact inline switcher if single bar */}
 {role === "owner" && buildings.length > 0 && (
 <div className="hidden sm:block">
 <BuildingSwitcher buildings={buildings} activeBuildingId={activeBuildingId} />
 </div>
 )}

 {/* Top Navigation Notification Bell */}
 <NotificationCenter broadcasts={broadcasts} userRole={role} />

 {/* Account Security & Credentials Settings */}
 <Link
 href={
 role === "super_admin"
 ? "/super-admin?tab=settings"
 : role === "tenant"
 ? "/tenant/settings"
 : "/dashboard/settings"
 }
 title="Account & Login Security Settings"
 className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-full apple-liquid-glass-pill transition-all cursor-pointer flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-600"
 >
 <KeyRound className="w-3.5 h-3.5" />
 </Link>

 {/* Current Logged-In Role Pill (Read-only) */}
 <span
 title={`Current Role: ${badge.label}`}
 className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold shadow-xs apple-liquid-glass-pill ${badge.className}`}
 >
 <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
 <span>{badge.label}</span>
 </span>

 {/* Emergency Call Icon for Tenant */}
 {role === "tenant" && (
 <a
 href="tel:+919876543210"
 title="Emergency Helpdesk"
 className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
 >
 <PhoneCall className="w-3.5 h-3.5" />
 </a>
 )}

 {/* Sign Out Action */}
 <button
 onClick={() => signOutAction()}
 title="Sign Out"
 className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
 >
 <LogOut className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Building Switcher Sub-bar on Mobile for Owner & Admin */}
 {(role === "owner" || role === "admin") && buildings.length > 0 && (
 <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between sm:hidden">
 <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
 Scope:
 </span>
 <BuildingSwitcher buildings={buildings} activeBuildingId={activeBuildingId} />
 </div>
 )}
 </header>
 );
}
