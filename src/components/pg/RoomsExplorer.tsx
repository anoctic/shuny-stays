"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { computeTenantCycleStatus } from "@/lib/utils/billing-cycle";
import {
 FileSpreadsheet,
 Layers,
 Plus,
 Lock,
 ChevronRight,
 UserPlus,
 Trash2,
 Clock,
 AlertTriangle,
 BedDouble,
 X,
 CheckCircle2,
} from "lucide-react";
import { BuildingItem, FloorItem, RoomItem, BedItem } from "@/lib/data/rooms";
import { BedProfileSheet } from "./BedProfileSheet";
import {
 WalkInSheet,
 AutoBuildingSheet,
 AddFloorSheet,
 AddRoomSheet,
 AddBedSheet,
} from "./RoomsSheets";
import { BulkSetupModal } from "./BulkSetupModal";
import {
 deleteBuildingAction,
 deleteFloorAction,
 deleteRoomAction,
 deleteBedAction,
} from "@/app/actions/rooms-and-ops";

interface RoomsExplorerProps {
 initialBuildings: BuildingItem[];
 userRole: "owner" | "admin" | "super_admin" | "tenant";
 activePasses?: { tenantId: string; passType: "day_pass" | "night_pass"; status: string }[];
}

export function RoomsExplorer({
 initialBuildings,
 userRole,
 activePasses = [],
}: RoomsExplorerProps) {
 const router = useRouter();
 useRealtimeSync(["buildings", "floors", "rooms", "beds", "tenants", "rent_payments", "security_deposits", "gate_passes", "complaints", "pgs"]);

 const isOwner = userRole === "owner" || userRole === "super_admin";
 const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
 const [selectedFloorByBuilding, setSelectedFloorByBuilding] = useState<Record<string, number>>({});
 const [deletingId, setDeletingId] = useState<string | null>(null);

 // Active Bottom Sheet Targets
 const [activeProfileBed, setActiveProfileBed] = useState<{
 building: BuildingItem;
 floor: FloorItem;
 floorIdx: number;
 room: RoomItem;
 bed: BedItem;
 bedIdx: number;
 } | null>(null);

 const [activeWalkInBed, setActiveWalkInBed] = useState<{
 building: BuildingItem;
 floor: FloorItem;
 floorIdx: number;
 room: RoomItem;
 bedIdx: number;
 } | null>(null);

 const [isAutoBuildingOpen, setIsAutoBuildingOpen] = useState(false);
 const [addFloorBuilding, setAddFloorBuilding] = useState<BuildingItem | null>(null);
 const [addRoomTarget, setAddRoomTarget] = useState<{ building: BuildingItem; floorIdx: number } | null>(null);
 const [addBedTarget, setAddBedTarget] = useState<{ building: BuildingItem; floorIdx: number; roomId: string } | null>(null);
 const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
 const [activeDirectoryFilter, setActiveDirectoryFilter] = useState<
 "none" | "vacant" | "3days" | "7days" | "expired" | "all_cycles"
 >("none");

 const resolvedProfileBed = activeProfileBed
 ? (() => {
 const lb = initialBuildings.find((b) => b.id === activeProfileBed.building.id);
 if (!lb) return null;
 const lf = lb.floors[activeProfileBed.floorIdx];
 const lr = lf?.rooms.find((r) => r.id === activeProfileBed.room.id);
 const lbed = lr?.beds[activeProfileBed.bedIdx];
 return lb && lf && lr && lbed && lbed.occupied && lbed.tenant
 ? {
 building: lb,
 floor: lf,
 floorIdx: activeProfileBed.floorIdx,
 room: lr,
 bed: lbed,
 bedIdx: activeProfileBed.bedIdx,
 }
 : null;
 })()
 : null;

 // Scoped buildings (Admins see their assigned buildings, Owners see all)
 const visibleBuildings =
 selectedBuildingId === "all"
 ? initialBuildings
 : initialBuildings.filter((b) => b.id === selectedBuildingId);

 // Stats, Vacant Beds list & Tenant Monthly Cycle Expiry calculation
 let totalBeds = 0;
 let occupiedBeds = 0;
 let expectedRent = 0;
 let collectedRent = 0;

 const vacantBedsList: {
 building: BuildingItem;
 floor: FloorItem;
 floorIdx: number;
 room: RoomItem;
 bed: BedItem;
 bedIdx: number;
 }[] = [];

 const tenantCycleList: {
 building: BuildingItem;
 floor: FloorItem;
 floorIdx: number;
 room: RoomItem;
 bed: BedItem;
 bedIdx: number;
 cycle: ReturnType<typeof computeTenantCycleStatus>;
 }[] = [];

 visibleBuildings.forEach((b) => {
 b.floors.forEach((f, fIdx) => {
 f.rooms.forEach((r) => {
 r.beds.forEach((bed, bIdx) => {
 totalBeds++;
 if (bed.occupied && bed.tenant) {
 occupiedBeds++;
 const monthlyRent = bed.tenant.rent || r.rent;
 expectedRent += monthlyRent;
 if (bed.tenant.rentPaid) {
 collectedRent += monthlyRent;
 }
 tenantCycleList.push({
 building: b,
 floor: f,
 floorIdx: fIdx,
 room: r,
 bed,
 bedIdx: bIdx,
 cycle: computeTenantCycleStatus({
 checkInDate: bed.tenant.joinDate,
 rentPaid: bed.tenant.rentPaid,
 lastPaidAt: bed.tenant.lastRentPaidAt,
 }),
 });
 } else {
 vacantBedsList.push({
 building: b,
 floor: f,
 floorIdx: fIdx,
 room: r,
 bed,
 bedIdx: bIdx,
 });
 }
 });
 });
 });
 });

 tenantCycleList.sort((a, b) => a.cycle.daysLeft - b.cycle.daysLeft);
 const expiredCycles = tenantCycleList.filter((item) => item.cycle.daysLeft < 0);
 const threeDayCycles = tenantCycleList.filter(
 (item) => item.cycle.daysLeft >= 0 && item.cycle.daysLeft <= 3
 );
 const sevenDayCycles = tenantCycleList.filter(
 (item) => item.cycle.daysLeft >= 0 && item.cycle.daysLeft <= 7
 );
 const vacantBeds = totalBeds - occupiedBeds;

 const getActivePassForTenant = (tenantId?: string) => {
 if (!tenantId) return null;
 return activePasses.find((p) => p.tenantId === tenantId) || null;
 };

 // --- DELETE HANDLERS (OWNER ONLY) ---
 const handleDeleteBuilding = async (buildingId: string, buildingName: string) => {
 if (
 !window.confirm(
 `Are you sure you want to delete building "${buildingName}"? All vacant floors, rooms, and beds inside it will be permanently deleted.`
 )
 ) {
 return;
 }
 setDeletingId(buildingId);
 try {
 const res = await deleteBuildingAction(buildingId);
 if ("error" in res && res.error) {
 alert(res.error);
 } else {
 router.refresh();
 }
 } finally {
 setDeletingId(null);
 }
 };

 const handleDeleteFloor = async (floorId: string, floorName: string) => {
 if (!window.confirm(`Are you sure you want to delete floor "${floorName}"?`)) {
 return;
 }
 setDeletingId(floorId);
 try {
 const res = await deleteFloorAction(floorId);
 if ("error" in res && res.error) {
 alert(res.error);
 } else {
 router.refresh();
 }
 } finally {
 setDeletingId(null);
 }
 };

 const handleDeleteRoom = async (roomId: string, roomNumber: string | number) => {
 if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}?`)) {
 return;
 }
 setDeletingId(roomId);
 try {
 const res = await deleteRoomAction(roomId);
 if ("error" in res && res.error) {
 alert(res.error);
 } else {
 router.refresh();
 }
 } finally {
 setDeletingId(null);
 }
 };

 const handleDeleteBed = async (bedId: string, bedLabel: string) => {
 if (!window.confirm(`Are you sure you want to delete Bed ${bedLabel}?`)) {
 return;
 }
 setDeletingId(bedId);
 try {
 const res = await deleteBedAction(bedId);
 if ("error" in res && res.error) {
 alert(res.error);
 } else {
 router.refresh();
 }
 } finally {
 setDeletingId(null);
 }
 };

 return (
 <div className="space-y-3.5">
 <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
 {/* Left: Property Explorer & Room Grid */}
 <div className={activeProfileBed ? "space-y-3.5 lg:col-span-8" : "space-y-3.5 lg:col-span-12"}>
 {/* 1. Multi-Column Responsive KPI Strip (2 cols mobile, 4 cols desktop) */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5">
 <button
 type="button"
 onClick={() => setActiveDirectoryFilter("none")}
 className={`text-left bg-white border rounded-2xl p-3.5 shadow-sm transition cursor-pointer ${
 activeDirectoryFilter === "none"
 ? "border-slate-300 ring-1 ring-slate-200"
 : "border-slate-200/90 hover:border-slate-300"
 }`}
 >
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
 Live Occupancy
 </div>
 <div className="text-sm md:text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
 {occupiedBeds}/{totalBeds} Beds
 </div>
 <div className="text-[10px] font-bold text-slate-500 mt-0.5">
 {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}% Occupied
 </div>
 </button>

 <button
 type="button"
 onClick={() =>
 setActiveDirectoryFilter((prev) => (prev === "vacant" ? "none" : "vacant"))
 }
 className={`text-left bg-white border rounded-2xl p-3.5 shadow-sm transition cursor-pointer ${
 activeDirectoryFilter === "vacant"
 ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40"
 : "border-slate-200/90 hover:border-emerald-300"
 }`}
 >
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
 <span>Vacant Beds</span>
 <BedDouble className="w-3.5 h-3.5 text-emerald-600" />
 </div>
 <div className="text-sm md:text-base font-extrabold text-emerald-600 tabular-nums mt-0.5">
 {vacantBeds} Beds Vacant
 </div>
 <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
 {activeDirectoryFilter === "vacant" ? "Showing Vacant List ✓" : "Tap to view vacant list →"}
 </div>
 </button>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-indigo-300 transition">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
 Rent Collected
 </div>
 <div className="text-sm md:text-base font-extrabold text-indigo-600 tabular-nums mt-0.5">
 ₹{collectedRent.toLocaleString("en-IN")}
 </div>
 <div className="text-[10px] font-bold text-indigo-500 mt-0.5">
 This Month Live
 </div>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
 Expected Pipeline
 </div>
 <div className="text-sm md:text-base font-extrabold text-slate-800 tabular-nums mt-0.5">
 ₹{expectedRent.toLocaleString("en-IN")}
 </div>
 <div className="text-[10px] text-slate-400 mt-0.5">
 Pending: ₹{(expectedRent - collectedRent).toLocaleString("en-IN")}
 </div>
 </div>
 </div>

 {/* Monthly Cycle Expiry Watch Bar (<= 3 Days, <= 7 Days, Expired, All) */}
 {tenantCycleList.length > 0 && (
 <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm space-y-2.5">
 <div className="flex items-center justify-between gap-2 flex-wrap">
 <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-900">
 <Clock className="w-3.5 h-3.5 text-indigo-600" />
 <span>Tenant Month-End &amp; Cycle Expiry Alerts</span>
 </div>
 {activeDirectoryFilter !== "none" && (
 <button
 type="button"
 onClick={() => setActiveDirectoryFilter("none")}
 className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer"
 >
 <X className="w-3 h-3" />
 <span>Show All Rooms</span>
 </button>
 )}
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 <button
 type="button"
 onClick={() =>
 setActiveDirectoryFilter((prev) => (prev === "3days" ? "none" : "3days"))
 }
 className={`p-2 rounded-xl border text-left transition cursor-pointer ${
 activeDirectoryFilter === "3days"
 ? "bg-amber-50 border-amber-500 ring-2 ring-amber-400/25"
 : "bg-amber-50/50 border-amber-200 hover:bg-amber-50"
 }`}
 >
 <div className="text-[9.5px] font-extrabold text-amber-800 uppercase">
 ⚡ ≤ 3 Days Left
 </div>
 <div className="text-sm font-black text-amber-900 tabular-nums mt-0.5">
 {threeDayCycles.length} Tenants
 </div>
 </button>

 <button
 type="button"
 onClick={() =>
 setActiveDirectoryFilter((prev) => (prev === "7days" ? "none" : "7days"))
 }
 className={`p-2 rounded-xl border text-left transition cursor-pointer ${
 activeDirectoryFilter === "7days"
 ? "bg-sky-50 border-sky-500 ring-2 ring-sky-400/25"
 : "bg-sky-50/50 border-sky-200 hover:bg-sky-50"
 }`}
 >
 <div className="text-[9.5px] font-extrabold text-sky-800 uppercase">
 📅 ≤ 7 Days Left
 </div>
 <div className="text-sm font-black text-sky-900 tabular-nums mt-0.5">
 {sevenDayCycles.length} Tenants
 </div>
 </button>

 <button
 type="button"
 onClick={() =>
 setActiveDirectoryFilter((prev) => (prev === "expired" ? "none" : "expired"))
 }
 className={`p-2 rounded-xl border text-left transition cursor-pointer ${
 activeDirectoryFilter === "expired"
 ? "bg-rose-50 border-rose-500 ring-2 ring-rose-400/25"
 : "bg-rose-50/50 border-rose-200 hover:bg-rose-50"
 }`}
 >
 <div className="text-[9.5px] font-extrabold text-rose-700 uppercase">
 🚨 Expired / Overdue
 </div>
 <div className="text-sm font-black text-rose-900 tabular-nums mt-0.5">
 {expiredCycles.length} Tenants
 </div>
 </button>

 <button
 type="button"
 onClick={() =>
 setActiveDirectoryFilter((prev) =>
 prev === "all_cycles" ? "none" : "all_cycles"
 )
 }
 className={`p-2 rounded-xl border text-left transition cursor-pointer ${
 activeDirectoryFilter === "all_cycles"
 ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400/25"
 : "bg-slate-50 border-slate-200 hover:bg-slate-100"
 }`}
 >
 <div className="text-[9.5px] font-extrabold text-slate-600 uppercase">
 📋 All Active Cycles
 </div>
 <div className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
 {tenantCycleList.length} Tenants
 </div>
 </button>
 </div>
 </div>
 )}

 {/* FILTERED VIEW 1: VACANT BEDS ONLY LIST */}
 {activeDirectoryFilter === "vacant" && (
 <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3">
 <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
 <div>
 <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
 <BedDouble className="w-4 h-4 text-emerald-600" />
 <span>Vacant Beds Available ({vacantBedsList.length})</span>
 </h3>
 <p className="text-[10.5px] text-slate-500">
 Only vacant beds ready for walk-in allotment are shown below.
 </p>
 </div>
 <button
 type="button"
 onClick={() => setActiveDirectoryFilter("none")}
 className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-extrabold transition"
 >
 ← All Rooms
 </button>
 </div>

 {vacantBedsList.length === 0 ? (
 <div className="p-6 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
 Abhi koi bed vacant nahi hai — 100% beds occupied hain!
 </div>
 ) : (
 <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-2.5">
 {vacantBedsList.map((vb) => (
 <div
 key={vb.bed.id}
 className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-2"
 >
 <div className="min-w-0">
 <div className="text-xs font-black text-slate-900 truncate">
 Room {vb.room.number} • {vb.bed.label}
 </div>
 <div className="text-[10px] font-semibold text-slate-600 truncate">
 {vb.building.name} • {vb.floor.name}
 </div>
 <div className="text-[10.5px] font-extrabold text-emerald-700 mt-0.5">
 ₹{vb.room.rent.toLocaleString("en-IN")}/mo • {vb.room.sharing}-Seater
 </div>
 </div>
 {isOwner ? (
 <button
 type="button"
 onClick={() =>
 setActiveWalkInBed({
 building: vb.building,
 floor: vb.floor,
 floorIdx: vb.floorIdx,
 room: vb.room,
 bedIdx: vb.bedIdx,
 })
 }
 className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-extrabold shrink-0 shadow-xs active:scale-95 transition cursor-pointer"
 >
 + Walk-In
 </button>
 ) : (
 <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0">
 Vacant
 </span>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* FILTERED VIEW 2: EXPIRY WATCH LIST (<= 3 DAYS, <= 7 DAYS, EXPIRED, ALL) */}
 {(activeDirectoryFilter === "3days" ||
 activeDirectoryFilter === "7days" ||
 activeDirectoryFilter === "expired" ||
 activeDirectoryFilter === "all_cycles") && (() => {
 const activeList =
 activeDirectoryFilter === "3days"
 ? threeDayCycles
 : activeDirectoryFilter === "7days"
 ? sevenDayCycles
 : activeDirectoryFilter === "expired"
 ? expiredCycles
 : tenantCycleList;
 const headingTitle =
 activeDirectoryFilter === "3days"
 ? `Expiring in ≤ 3 Days (${activeList.length})`
 : activeDirectoryFilter === "7days"
 ? `Expiring in ≤ 7 Days (${activeList.length})`
 : activeDirectoryFilter === "expired"
 ? `Expired / Overdue Month Cycles (${activeList.length})`
 : `All Residents Monthly Cycle Tracker (${activeList.length})`;

 return (
 <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
 <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
 <div>
 <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
 <AlertTriangle className="w-4 h-4 text-amber-600" />
 <span>{headingTitle}</span>
 </h3>
 <p className="text-[10.5px] text-slate-500">
 Kisi bhi tenant par tap karein uske bed, rent, deposit aur KYC details kholne ke liye.
 </p>
 </div>
 <button
 type="button"
 onClick={() => setActiveDirectoryFilter("none")}
 className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-extrabold transition"
 >
 ← All Rooms
 </button>
 </div>

 {activeList.length === 0 ? (
 <div className="p-6 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
 Is category me abhi koi tenant nahi hai.
 </div>
 ) : (
 <>
 {/* Mobile List */}
 <div className="space-y-2 md:hidden">
 {activeList.map((item) => {
 const isUrgent3d = item.cycle.daysLeft >= 0 && item.cycle.daysLeft <= 3;
 const isExp = item.cycle.daysLeft < 0;
 return (
 <button
 key={item.bed.id}
 type="button"
 onClick={() =>
 setActiveProfileBed({
 building: item.building,
 floor: item.floor,
 floorIdx: item.floorIdx,
 room: item.room,
 bed: item.bed,
 bedIdx: item.bedIdx,
 })
 }
 className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 flex items-center justify-between gap-2 transition"
 >
 <div className="min-w-0">
 <div className="text-xs font-black text-slate-900 truncate">
 {item.bed.tenant?.name} • Room {item.room.number} ({item.bed.label})
 </div>
 <div className="text-[10px] text-slate-500 truncate">
 {item.building.name} • Ends {item.cycle.formattedEndDate}
 </div>
 <div className="flex items-center gap-1.5 mt-1 flex-wrap">
 {isUrgent3d && (
 <span className="px-1.5 py-0.5 rounded bg-amber-100 text-rose-700 border border-rose-200 text-[9px] font-black">
 ⚡ ≤ 3 Days Alert
 </span>
 )}
 <span
 className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${
 isExp
 ? "bg-rose-50 text-rose-700 border-rose-200"
 : isUrgent3d
 ? "bg-amber-50 text-amber-800 border-amber-200"
 : "bg-emerald-50 text-emerald-700 border-emerald-200"
 }`}
 >
 {item.cycle.badgeText}
 </span>
 </div>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
 </button>
 );
 })}
 </div>

 {/* Desktop Table with Extra 3-Day Column */}
 <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
 <table className="w-full text-left text-xs">
 <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500">
 <tr>
 <th className="px-3.5 py-2.5">Tenant</th>
 <th className="px-3.5 py-2.5">Room &amp; Bed</th>
 <th className="px-3.5 py-2.5">Month End Date</th>
 <th className="px-3.5 py-2.5">3-Day Left Status</th>
 <th className="px-3.5 py-2.5">Remaining Days</th>
 <th className="px-3.5 py-2.5 text-right">Bed Details</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {activeList.map((item) => {
 const isUrgent3d = item.cycle.daysLeft >= 0 && item.cycle.daysLeft <= 3;
 const isExp = item.cycle.daysLeft < 0;
 return (
 <tr
 key={item.bed.id}
 onClick={() =>
 setActiveProfileBed({
 building: item.building,
 floor: item.floor,
 floorIdx: item.floorIdx,
 room: item.room,
 bed: item.bed,
 bedIdx: item.bedIdx,
 })
 }
 className="hover:bg-indigo-50/60 cursor-pointer transition"
 >
 <td className="px-3.5 py-2.5">
 <div className="font-extrabold text-slate-900">{item.bed.tenant?.name}</div>
 <div className="text-[10px] text-slate-400 font-mono">{item.bed.tenant?.phone}</div>
 </td>
 <td className="px-3.5 py-2.5">
 <div className="font-bold text-slate-800">
 Room {item.room.number} • {item.bed.label}
 </div>
 <div className="text-[10px] text-slate-400">{item.building.name}</div>
 </td>
 <td className="px-3.5 py-2.5 font-semibold text-slate-700">
 {item.cycle.formattedEndDate}
 </td>
 <td className="px-3.5 py-2.5">
 {isUrgent3d ? (
 <span className="px-2 py-0.5 rounded-full bg-amber-100 text-rose-700 border border-rose-200 text-[10px] font-black">
 ⚡ ≤ 3 Days Left
 </span>
 ) : isExp ? (
 <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black">
 🚨 Expired
 </span>
 ) : item.cycle.daysLeft <= 7 ? (
 <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
 ≤ 7 Days
 </span>
 ) : (
 <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
 On Track
 </span>
 )}
 </td>
 <td className="px-3.5 py-2.5">
 <span
 className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
 isExp
 ? "bg-rose-50 text-rose-700 border-rose-200"
 : isUrgent3d
 ? "bg-amber-50 text-amber-800 border-amber-200"
 : "bg-emerald-50 text-emerald-700 border-emerald-200"
 }`}
 >
 {item.cycle.badgeText}
 </span>
 </td>
 <td className="px-3.5 py-2.5 text-right">
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10.5px] font-extrabold">
 Open Bed →
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </>
 )}
 </div>
 );
 })()}

 {/* Quick Action Strip (Bldg Builder & CSV) - Owner Only */}
 {isOwner && (
 <div className="flex items-center justify-between gap-2 px-0.5">
 <span className="text-[11px] font-extrabold text-slate-700">Property Blocks</span>
 <div className="flex items-center gap-1.5">
 <button
 onClick={() => setIsAutoBuildingOpen(true)}
 className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10.5px] font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>+ Add Block</span>
 </button>
 <button
 onClick={() => setIsCsvImportOpen(true)}
 className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10.5px] font-extrabold flex items-center gap-1 transition"
 >
 <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
 <span>Bulk Setup (80+)</span>
 </button>
 </div>
 </div>
 )}

 {/* 2. Horizontal Building Filter Pills */}
 <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
 <button
 onClick={() => setSelectedBuildingId("all")}
 className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 border transition ${
 selectedBuildingId === "all"
 ? "bg-indigo-600 text-white border-transparent shadow-xs"
 : "bg-white text-slate-800 border-slate-200"
 }`}
 >
 All ({initialBuildings.length})
 </button>

 {initialBuildings.map((b) => {
 const selected = selectedBuildingId === b.id;
 return (
 <button
 key={b.id}
 onClick={() => setSelectedBuildingId(b.id)}
 className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 flex items-center gap-1 border transition ${
 selected
 ? "bg-indigo-600 text-white border-transparent shadow-xs"
 : "bg-white text-slate-800 border-slate-200"
 }`}
 >
 <span>{b.name}</span>
 </button>
 );
 })}
 </div>

 {/* 3. Buildings -> Floors -> Rooms -> Beds (Hidden when viewing dedicated Vacant/Expiry list) */}
 {activeDirectoryFilter === "none" && (
 <div className="space-y-3.5">
 {visibleBuildings.length === 0 ? (
 <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
 <Layers className="w-6 h-6" />
 </div>
 <div className="space-y-1">
 <h3 className="text-sm font-extrabold text-slate-800">No Buildings Added Yet</h3>
 <p className="text-xs text-slate-500 max-w-sm mx-auto">
 Create your first building block with automated floors, rooms, and beds to start managing your PG.
 </p>
 </div>
 {isOwner && (
 <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
 <button
 onClick={() => setIsCsvImportOpen(true)}
 className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md active:scale-95 transition cursor-pointer"
 >
 <FileSpreadsheet className="w-4 h-4" />
 <span>⚡ Bulk Setup (80+ Rooms & Tenants)</span>
 </button>
 <button
 onClick={() => setIsAutoBuildingOpen(true)}
 className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm active:scale-95 transition cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 <span>Add Single Block</span>
 </button>
 </div>
 )}
 </div>
 ) : (
 visibleBuildings.map((building) => {
 const floorIdx = Math.min(
 selectedFloorByBuilding[building.id] || 0,
 Math.max(0, building.floors.length - 1)
 );
 const activeFloor = building.floors[floorIdx];

 return (
 <section
 key={building.id}
 className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden"
 >
 {/* Building Header */}
 <div className="p-3 bg-slate-900 text-white flex items-center justify-between gap-2">
 <div className="min-w-0">
 <div className="flex items-center gap-1.5">
 <h3 className="text-xs font-extrabold truncate">{building.name}</h3>
 <span className="px-1.5 py-0.5 rounded bg-white/15 text-[9px] font-extrabold uppercase">
 {building.type}
 </span>
 </div>
 <p className="text-[10px] text-slate-300 truncate mt-0.5">
 Shuny Stays Managed • {building.floors.length} Floors
 </p>
 </div>

 {isOwner && (
 <div className="flex items-center gap-1.5 shrink-0">
 <button
 onClick={() => setAddFloorBuilding(building)}
 className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition"
 >
 <Layers className="w-3 h-3" />
 <span>+ Add Floor</span>
 </button>
 <button
 type="button"
 disabled={deletingId === building.id}
 onClick={() => handleDeleteBuilding(building.id, building.name)}
 className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-rose-300 hover:text-white transition"
 title="Delete Building Block"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </div>

 {/* Floor Tabs */}
 <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto">
 {building.floors.map((fl, idx) => (
 <button
 key={fl.id}
 onClick={() =>
 setSelectedFloorByBuilding({
 ...selectedFloorByBuilding,
 [building.id]: idx,
 })
 }
 className={`px-2.5 py-1 rounded-xl text-[10.5px] font-extrabold shrink-0 transition ${
 floorIdx === idx
 ? "bg-indigo-600 text-white shadow-xs"
 : "bg-white text-slate-700 border border-slate-200"
 }`}
 >
 {fl.name} ({fl.rooms.length})
 </button>
 ))}
 </div>

 {/* Active Floor Rooms & Beds */}
 {activeFloor ? (
 <div className="p-3.5 space-y-3">
 <div className="flex items-center justify-between pb-1 border-b border-slate-100">
 <span className="text-xs font-extrabold text-slate-800">
 {activeFloor.name} Rooms
 </span>
 {isOwner && (
 <div className="flex items-center gap-1.5">
 <button
 onClick={() =>
 setAddRoomTarget({
 building,
 floorIdx,
 })
 }
 className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold flex items-center gap-1 hover:bg-indigo-100 transition active:scale-95"
 >
 <Plus className="w-3 h-3" />
 <span>Add Room</span>
 </button>
 <button
 type="button"
 disabled={deletingId === activeFloor.id}
 onClick={() => handleDeleteFloor(activeFloor.id, activeFloor.name)}
 className="p-1 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
 title="Delete Floor"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </div>

 {/* Desktop Multi-Column Grid (1 col mobile, 2 col md, 3 col lg, 4 col xl) */}
 <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-3.5">
 {activeFloor.rooms.map((room) => (
 <div
 key={room.id}
 className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5 flex flex-col justify-between hover:border-slate-300 transition"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5">
 <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-extrabold">
 Room {room.number}
 </span>
 <span className="text-[10px] font-bold text-slate-400">
 {room.beds.length}-Seater
 </span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="text-[11px] font-extrabold text-indigo-600 tabular-nums">
 ₹{room.rent.toLocaleString("en-IN")}/mo
 </span>
 {isOwner && (
 <div className="flex items-center gap-1">
 <button
 onClick={() =>
 setAddBedTarget({
 building,
 floorIdx,
 roomId: room.id,
 })
 }
 className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9.5px] font-extrabold border border-emerald-200 transition active:scale-95"
 >
 + Bed
 </button>
 <button
 type="button"
 disabled={deletingId === room.id}
 onClick={() => handleDeleteRoom(room.id, room.number)}
 className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
 title="Delete Room"
 >
 <Trash2 className="w-3 h-3" />
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Clean Color-Coded Bed Grid Pills */}
 <div className="grid grid-cols-2 gap-1.5">
 {room.beds.map((bed, bIdx) => {
 if (bed.occupied && bed.tenant) {
 const activePass = getActivePassForTenant(bed.tenant.id);
 return (
 <button
 key={bed.id}
 onClick={() =>
 setActiveProfileBed({
 building,
 floor: activeFloor,
 floorIdx,
 room,
 bed,
 bedIdx: bIdx,
 })
 }
 className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200 text-left transition flex items-center justify-between gap-1 active:scale-95"
 >
 <div className="min-w-0">
 <div className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
 <span className="text-[9.5px] font-extrabold text-rose-700">
 {bed.label}
 </span>
 {activePass && (
 <span
 className={`px-1 rounded text-[8px] font-extrabold ${
 activePass.status === "approved"
 ? "bg-emerald-100 text-emerald-700"
 : "bg-amber-100 text-amber-700"
 }`}
 >
 {activePass.passType === "day_pass" ? "DAY" : "NIGHT"}
 </span>
 )}
 </div>
 <div className="flex items-center gap-1.5 mt-0.5">
 {bed.tenant.profilePhotoUrl && (
 <img
 src={bed.tenant.profilePhotoUrl}
 alt={bed.tenant.name}
 className="w-4 h-4 rounded-full object-cover border border-rose-200 shrink-0"
 />
 )}
 <div className="text-[11px] font-extrabold text-slate-900 truncate">
 {bed.tenant.name}
 </div>
 </div>
 <div className="flex flex-wrap gap-1 mt-1">
 {!bed.tenant.rentPaid && (
 <span className="px-1 py-0.2 rounded bg-rose-100 text-rose-700 text-[8px] font-extrabold">
 Rent Due
 </span>
 )}
 {bed.tenant.depositStatus === "pending" && (
 <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 text-[8px] font-extrabold">
 Dep Due
 </span>
 )}
 {bed.tenant.kycStatus === "Under Review" && (
 <span className="px-1 py-0.2 rounded bg-sky-100 text-sky-800 text-[8px] font-extrabold">
 KYC Review
 </span>
 )}
 </div>
 </div>
 <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
 </button>
 );
 } else {
 return (
 <div
 key={bed.id}
 className="p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-dashed border-emerald-300 text-left transition flex items-center justify-between gap-1"
 >
 <button
 type="button"
 onClick={() => {
 if (isOwner) {
 setActiveWalkInBed({
 building,
 floor: activeFloor,
 floorIdx,
 room,
 bedIdx: bIdx,
 });
 }
 }}
 className="min-w-0 flex-1 text-left"
 >
 <div className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
 <span className="text-[9.5px] font-extrabold text-emerald-700">
 {bed.label}
 </span>
 </div>
 <div className="text-[11px] font-bold text-emerald-700 mt-0.5 truncate">
 {isOwner ? "+ Walk-In" : "Vacant"}
 </div>
 </button>

 <div className="flex items-center gap-0.5">
 {isOwner && (
 <>
 <button
 type="button"
 onClick={() =>
 setActiveWalkInBed({
 building,
 floor: activeFloor,
 floorIdx,
 room,
 bedIdx: bIdx,
 })
 }
 className="p-1 rounded text-emerald-600 hover:bg-emerald-100 transition"
 title="Add Walk-In Tenant"
 >
 <UserPlus className="w-3.5 h-3.5" />
 </button>
 <button
 type="button"
 disabled={deletingId === bed.id}
 onClick={() => handleDeleteBed(bed.id, bed.label)}
 className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
 title="Delete Bed"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </>
 )}
 </div>
 </div>
 );
 }
 })}
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : null}
 </section>
 );
 })
 )}
 </div>
 )}
 </div>

 {/* Right: Sticky Docked Bed Profile Side Inspector (Desktop >= 1024px) */}
 {resolvedProfileBed && (
 <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto phone-scroll">
 <BedProfileSheet
 key={`${resolvedProfileBed.bed.id}-${resolvedProfileBed.bed.tenant?.id || ""}`}
 isOpen={true}
 onClose={() => setActiveProfileBed(null)}
 building={resolvedProfileBed.building}
 floor={resolvedProfileBed.floor}
 floorIdx={resolvedProfileBed.floorIdx}
 room={resolvedProfileBed.room}
 bed={resolvedProfileBed.bed}
 bedIdx={resolvedProfileBed.bedIdx}
 userRole={userRole}
 allBuildings={initialBuildings}
 isDocked={true}
 />
 </div>
 )}
 </div>

 {/* 360 Occupied Bed Profile Bottom Sheet (< 1024px) */}
 {resolvedProfileBed && (
 <BedProfileSheet
 key={`sheet-${resolvedProfileBed.bed.id}-${resolvedProfileBed.bed.tenant?.id || ""}`}
 isOpen={true}
 onClose={() => setActiveProfileBed(null)}
 building={resolvedProfileBed.building}
 floor={resolvedProfileBed.floor}
 floorIdx={resolvedProfileBed.floorIdx}
 room={resolvedProfileBed.room}
 bed={resolvedProfileBed.bed}
 bedIdx={resolvedProfileBed.bedIdx}
 userRole={userRole}
 allBuildings={initialBuildings}
 isDocked={false}
 />
 )}

 {/* Walk-In Sheet */}
 {activeWalkInBed && (
 <WalkInSheet
 isOpen={true}
 onClose={() => setActiveWalkInBed(null)}
 building={activeWalkInBed.building}
 floor={activeWalkInBed.floor}
 floorIdx={activeWalkInBed.floorIdx}
 room={activeWalkInBed.room}
 bedIdx={activeWalkInBed.bedIdx}
 />
 )}

 {/* Auto-Building Sheet */}
 <AutoBuildingSheet
 isOpen={isAutoBuildingOpen}
 onClose={() => setIsAutoBuildingOpen(false)}
 />

 {/* Add Floor Sheet */}
 {addFloorBuilding && (
 <AddFloorSheet
 isOpen={true}
 onClose={() => setAddFloorBuilding(null)}
 building={addFloorBuilding}
 />
 )}

 {/* Add Room Sheet */}
 {addRoomTarget && (
 <AddRoomSheet
 isOpen={true}
 onClose={() => setAddRoomTarget(null)}
 building={addRoomTarget.building}
 floorIdx={addRoomTarget.floorIdx}
 />
 )}

 {/* Add Bed Sheet */}
 {addBedTarget && (
 <AddBedSheet
 isOpen={true}
 onClose={() => setAddBedTarget(null)}
 building={addBedTarget.building}
 floorIdx={addBedTarget.floorIdx}
 roomId={addBedTarget.roomId}
 />
 )}

 {/* CSV Import Modal */}
 <BulkSetupModal
 isOpen={isCsvImportOpen}
 onClose={() => setIsCsvImportOpen(false)}
 buildings={initialBuildings}
 />
 </div>
 );
}
