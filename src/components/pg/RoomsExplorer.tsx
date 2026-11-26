"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
 FileSpreadsheet,
 Layers,
 Plus,
 Lock,
 ChevronRight,
 UserPlus,
 Trash2,
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
 useRealtimeSync(["buildings", "floors", "rooms", "beds", "tenants", "payments", "complaints", "pgs"]);

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

 // Scoped buildings (Admins see their assigned buildings, Owners see all)
 const visibleBuildings =
 selectedBuildingId === "all"
 ? initialBuildings
 : initialBuildings.filter((b) => b.id === selectedBuildingId);

 // Stats calculation
 let totalBeds = 0;
 let occupiedBeds = 0;
 let expectedRent = 0;
 let collectedRent = 0;

 visibleBuildings.forEach((b) => {
 b.floors.forEach((f) => {
 f.rooms.forEach((r) => {
 r.beds.forEach((bed) => {
 totalBeds++;
 if (bed.occupied) {
 occupiedBeds++;
 expectedRent += r.rent;
 if (bed.tenant?.rentPaid) {
 collectedRent += r.rent;
 }
 }
 });
 });
 });
 });
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
 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-slate-300 transition">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
 Live Occupancy
 </div>
 <div className="text-sm md:text-base font-extrabold text-slate-900 tabular-nums mt-0.5">
 {occupiedBeds}/{totalBeds} Beds
 </div>
 <div className="text-[10px] font-bold text-slate-500 mt-0.5">
 {totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0}% Occupied
 </div>
 </div>

 <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:border-emerald-300 transition">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
 Vacant Beds
 </div>
 <div className="text-sm md:text-base font-extrabold text-emerald-600 tabular-nums mt-0.5">
 {vacantBeds} Beds Vacant
 </div>
 <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
 Ready for Walk-In
 </div>
 </div>

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

 {/* 3. Buildings -> Floors -> Rooms -> Beds */}
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
 <div className="text-[11px] font-extrabold text-slate-900 truncate mt-0.5">
 {bed.tenant.name}
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
 </div>

 {/* Right: Sticky Docked Bed Profile Side Inspector (Desktop >= 1024px) */}
 {activeProfileBed && (
 <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto phone-scroll">
 <BedProfileSheet
 isOpen={true}
 onClose={() => setActiveProfileBed(null)}
 building={activeProfileBed.building}
 floor={activeProfileBed.floor}
 floorIdx={activeProfileBed.floorIdx}
 room={activeProfileBed.room}
 bed={activeProfileBed.bed}
 bedIdx={activeProfileBed.bedIdx}
 userRole={userRole}
 allBuildings={initialBuildings}
 isDocked={true}
 />
 </div>
 )}
 </div>

 {/* 360 Occupied Bed Profile Bottom Sheet (< 1024px) */}
 {activeProfileBed && (
 <BedProfileSheet
 isOpen={true}
 onClose={() => setActiveProfileBed(null)}
 building={activeProfileBed.building}
 floor={activeProfileBed.floor}
 floorIdx={activeProfileBed.floorIdx}
 room={activeProfileBed.room}
 bed={activeProfileBed.bed}
 bedIdx={activeProfileBed.bedIdx}
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
