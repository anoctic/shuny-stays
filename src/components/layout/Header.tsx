"use client";

import { useState } from "react";
import { Building, ChevronDown, Check, ShieldCheck, Database, Bell, Lock, LogOut } from "lucide-react";
import { DEMO_TENANTS, DemoTenant } from "@/lib/tenant/constants";
import { UserSessionProfile } from "@/types/pg-domain.types";
import { signOutAction, switchOrganizationAction } from "@/app/actions/auth";

interface HeaderProps {
 session: UserSessionProfile;
}

export function Header({ session }: HeaderProps) {
 const [selectedTenant, setSelectedTenant] = useState<DemoTenant>(
 DEMO_TENANTS.find((t) => t.id === session.organization_id) || DEMO_TENANTS[0]
 );
 const [isTenantOpen, setIsTenantOpen] = useState(false);
 const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

 const handleSelectTenant = async (tenant: DemoTenant) => {
 setSelectedTenant(tenant);
 setIsTenantOpen(false);
 await switchOrganizationAction(tenant.id);
 };

 return (
 <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
 {/* Left Area: Organization Switcher (Super Admin) OR Locked Organization (Owner/Resident) */}
 <div className="relative">
 {session.is_super_admin ? (
 // Super Admin: Interactive Organization Switcher
 <div>
 <button
 onClick={() => setIsTenantOpen(!isTenantOpen)}
 className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-cyan-300 bg-cyan-50/50 hover:bg-cyan-100/60 transition-colors text-left"
 >
 <div className="h-6 w-6 rounded bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
 <Building className="h-3.5 w-3.5" />
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-semibold text-zinc-900">
 {selectedTenant.name}
 </span>
 <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-200 text-cyan-900 font-medium">
 Super Admin Switcher
 </span>
 </div>
 <span className="text-[10px] text-zinc-500 block font-mono">
 Tenant: {selectedTenant.id.slice(0, 8)}... ({selectedTenant.city})
 </span>
 </div>
 <ChevronDown className="h-4 w-4 text-zinc-400 ml-1" />
 </button>

 {/* Dropdown Menu */}
 {isTenantOpen && (
 <div className="absolute left-0 mt-2 w-80 rounded-xl bg-white border border-zinc-200 shadow-xl py-2 z-50">
 <div className="px-3 py-1.5 border-b border-zinc-100 flex items-center justify-between">
 <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
 Switch Organization (Super Admin Only)
 </span>
 </div>
 {DEMO_TENANTS.map((tenant) => {
 const isSelected = tenant.id === selectedTenant.id;
 return (
 <button
 key={tenant.id}
 onClick={() => handleSelectTenant(tenant)}
 className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-zinc-50 transition-colors"
 >
 <div>
 <p className="text-xs font-semibold text-zinc-900">
 {tenant.name}
 </p>
 <p className="text-[11px] text-zinc-500 font-mono">
 {tenant.propertiesCount} Properties • {tenant.city}
 </p>
 </div>
 {isSelected && <Check className="h-4 w-4 text-cyan-600" />}
 </button>
 );
 })}
 </div>
 )}
 </div>
 ) : (
 // Regular User (Owner / Resident): Organization is Locked to Membership
 <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50">
 <div className="h-6 w-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
 <Building className="h-3.5 w-3.5" />
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-semibold text-zinc-900">
 {session.organization_name || "Zenith Luxury PG"}
 </span>
 <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 font-medium">
 <Lock className="h-2.5 w-2.5" />
 Membership Locked
 </span>
 </div>
 <span className="text-[10px] text-zinc-400 block font-mono">
 Organization fixed from membership
 </span>
 </div>
 </div>
 )}
 </div>

 {/* Right Controls: Role Badge, DB Status, User Menu */}
 <div className="flex items-center gap-4">
 {/* Role Pill */}
 <span
 className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold capitalize ${
 session.role === "super_admin"
 ? "bg-cyan-100 text-cyan-800 border border-cyan-300"
 : session.role === "owner"
 ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
 : "bg-zinc-100 text-zinc-800"
 }`}
 >
 <ShieldCheck className="h-3.5 w-3.5" />
 {session.role.replace("_", " ")}
 </span>

 {/* Database Status (Only shown to super_admin or owners) */}
 {session.is_super_admin && (
 <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-xs">
 <Database className="h-3.5 w-3.5 text-cyan-500" />
 <span className="text-zinc-600 text-[11px]">PG RLS:</span>
 <span className="font-mono text-[11px] text-emerald-600 font-medium">
 Enforced
 </span>
 </div>
 )}

 {/* User Avatar & Dropdown */}
 <div className="relative">
 <button
 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
 className="flex items-center gap-2 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
 >
 <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
 {session.full_name.charAt(0).toUpperCase()}
 </div>
 <div className="hidden lg:block text-left">
 <span className="block text-xs font-semibold text-zinc-900 leading-tight">
 {session.full_name.split(" ")[0]}
 </span>
 <span className="block text-[10px] text-zinc-400 capitalize">
 {session.role.replace("_", " ")}
 </span>
 </div>
 <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
 </button>

 {isUserMenuOpen && (
 <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-zinc-200 shadow-xl py-2 z-50 text-xs">
 <div className="px-3 py-2 border-b border-zinc-100">
 <p className="font-semibold text-zinc-900">
 {session.full_name}
 </p>
 <p className="text-[11px] text-zinc-500 truncate">{session.email}</p>
 <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-600 capitalize font-medium">
 Role: {session.role}
 </span>
 </div>

 <div className="p-1">
 <form action={signOutAction}>
 <button
 type="submit"
 className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors text-left"
 >
 <LogOut className="h-3.5 w-3.5" />
 Sign Out / Switch Persona
 </button>
 </form>
 </div>
 </div>
 )}
 </div>
 </div>
 </header>
 );
}
