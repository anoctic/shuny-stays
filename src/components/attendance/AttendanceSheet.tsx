"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
 CheckCircle2,
 Building2,
 Lock,
} from "lucide-react";
import {
 AttendanceStatus,
 BedAttendanceItem,
 UserRole,
} from "@/types/schema.types";
import { saveAttendanceAction } from "@/app/actions/attendance";

interface FloorData {
 floor_id: string;
 floor_name: string;
 floor_number: number;
 beds: BedAttendanceItem[];
 stats: {
 total: number;
 present: number;
 onPass: number;
 absent: number;
 };
}

interface BuildingData {
 building_id: string;
 building_name: string;
 gender_type: string;
 floors: FloorData[];
 stats: {
 total: number;
 present: number;
 onPass: number;
 absent: number;
 };
}

interface AttendanceSheetProps {
 initialBuildings: BuildingData[];
 userRole: UserRole;
 userName: string;
 assignedBuildingIds?: string[];
}

export function AttendanceSheet({
 initialBuildings,
 userRole,
 userName,
 assignedBuildingIds = [],
}: AttendanceSheetProps) {
 const router = useRouter();
 const isAdminScoped = userRole === "admin";
 const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
 const [isPending, startTransition] = useTransition();
 const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

 // Maintain local state of bed statuses keyed by bed_id
 const [bedStatuses, setBedStatuses] = useState<
 Record<string, { status: AttendanceStatus; tenant_id: string }>
 >(() => {
 const map: Record<string, { status: AttendanceStatus; tenant_id: string }> = {};
 initialBuildings.forEach((b) => {
 b.floors.forEach((f) => {
 f.beds.forEach((bed) => {
 map[bed.bed_id] = {
 status: bed.status,
 tenant_id: bed.tenant_id,
 };
 });
 });
 });
 return map;
 });

 // Filter buildings according to selection & admin permissions
 const filteredBuildings = initialBuildings.filter((b) => {
 if (isAdminScoped && assignedBuildingIds.length > 0) {
 if (!assignedBuildingIds.includes(b.building_id)) return false;
 }
 if (selectedBuildingId === "all") return true;
 return b.building_id === selectedBuildingId;
 });

 // Compute live summary counts
 let presentCnt = 0;
 let absentCnt = 0;
 let passCnt = 0;

 filteredBuildings.forEach((b) => {
 b.floors.forEach((f) => {
 f.beds.forEach((bed) => {
 const st = bedStatuses[bed.bed_id]?.status || bed.status;
 if (st === "present") presentCnt++;
 else if (st === "absent") absentCnt++;
 else passCnt++;
 });
 });
 });

 // Status toggle handler
 const handleStatusChange = (
 bedId: string,
 tenantId: string,
 newStatus: AttendanceStatus
 ) => {
 setBedStatuses((prev) => ({
 ...prev,
 [bedId]: { status: newStatus, tenant_id: tenantId },
 }));
 };

 // Mark all remaining beds on a floor as "present"
 const handleMarkFloorRemainingPresent = (floorBeds: BedAttendanceItem[]) => {
 setBedStatuses((prev) => {
 const next = { ...prev };
 floorBeds.forEach((bed) => {
 const current = next[bed.bed_id]?.status || bed.status;
 // Don't overwrite if they are on pass
 if (current !== "day_pass" && current !== "night_pass") {
 next[bed.bed_id] = {
 status: "present",
 tenant_id: bed.tenant_id,
 };
 }
 });
 return next;
 });
 };

 // Save & Sync all attendance
 const handleSaveAndSync = () => {
 startTransition(async () => {
 const itemsToSave: {
 tenant_id: string;
 bed_id: string;
 status: AttendanceStatus;
 }[] = [];

 filteredBuildings.forEach((b) => {
 b.floors.forEach((f) => {
 f.beds.forEach((bed) => {
 const entry = bedStatuses[bed.bed_id];
 if (entry) {
 itemsToSave.push({
 tenant_id: entry.tenant_id,
 bed_id: bed.bed_id,
 status: entry.status,
 });
 }
 });
 });
 });

 await saveAttendanceAction(itemsToSave);
 router.refresh();
 setSaveSuccessMsg("Attendance saved & synced live to all Tenant apps!");
 setTimeout(() => setSaveSuccessMsg(null), 4000);
 });
 };

 return (
 <div className="space-y-3.5 pb-20">
 {/* 1. Daily Roll Call Summary Header Card */}
 <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-2">
 <div>
 <div className="text-xs font-extrabold text-slate-900">Daily Bed Roll Call</div>
 <div className="text-[10px] text-slate-400">Auto-detects active Day & Night passes</div>
 </div>
 <div className="flex items-center gap-1 text-[10px] font-extrabold tabular-nums">
 <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
 {presentCnt} Present
 </span>
 <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
 {passCnt} Pass
 </span>
 <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
 {absentCnt} Absent
 </span>
 </div>
 </div>

 {/* 2. Building Switcher Tabs */}
 <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
 {!isAdminScoped && (
 <button
 onClick={() => setSelectedBuildingId("all")}
 className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 border transition ${
 selectedBuildingId === "all"
 ? "bg-indigo-600 text-white border-transparent shadow-xs"
 : "bg-white text-slate-800 border-slate-200"
 }`}
 >
 All Buildings
 </button>
 )}

 {initialBuildings.map((b) => {
 const locked = isAdminScoped && assignedBuildingIds.length > 0 && !assignedBuildingIds.includes(b.building_id);
 const selected = selectedBuildingId === b.building_id;

 return (
 <button
 key={b.building_id}
 onClick={() => {
 if (!locked) setSelectedBuildingId(b.building_id);
 }}
 className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 flex items-center gap-1 border transition ${
 selected
 ? "bg-indigo-600 text-white border-transparent shadow-xs"
 : locked
 ? "opacity-50 bg-slate-100 text-slate-400 border-slate-200"
 : "bg-white text-slate-800 border-slate-200"
 }`}
 >
 <span>{b.building_name}</span>
 {locked && <Lock className="w-3 h-3 text-slate-400" />}
 </button>
 );
 })}
 </div>

 {/* 3. Building Sections -> Floor Sections -> Occupied Bed Rows */}
 <div className="space-y-3.5">
 {filteredBuildings.map((building) => (
 <div
 key={building.building_id}
 className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden"
 >
 {/* Building Header */}
 <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between">
 <span className="text-xs font-extrabold">{building.building_name}</span>
 <span className="text-[10px] text-slate-300">
 {building.floors.length} Floors • {building.gender_type}
 </span>
 </div>

 {/* Floors List */}
 <div className="p-3.5 space-y-3">
 {building.floors.map((floor) => {
 const flPresent = floor.beds.filter(
 (bed) => (bedStatuses[bed.bed_id]?.status || bed.status) === "present"
 ).length;

 return (
 <div key={floor.floor_id} className="space-y-2">
 {/* Floor Sub-header */}
 <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
 <span className="text-[11px] font-extrabold text-slate-900">
 {floor.floor_name}{" "}
 <span className="text-emerald-700">
 ({flPresent}/{floor.beds.length} Present)
 </span>
 </span>
 <button
 type="button"
 onClick={() => handleMarkFloorRemainingPresent(floor.beds)}
 className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9.5px] font-extrabold border border-emerald-200 active:scale-95 transition"
 >
 Mark Remaining Present
 </button>
 </div>

 {/* Beds on Floor: 1 col mobile, 2 col md, 3 col lg, 4 col xl */}
 {floor.beds.length === 0 ? (
 <p className="text-[10.5px] text-slate-400 px-2">
 No occupied beds on this floor.
 </p>
 ) : (
 <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-3">
 {floor.beds.map((bed) => {
 const st = bedStatuses[bed.bed_id]?.status || bed.status;
 const hasPass = bed.active_pass_type != null;

 return (
 <div
 key={bed.bed_id}
 className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2 hover:border-slate-300 transition flex flex-col justify-between"
 >
 <div className="flex items-center justify-between">
 <div>
 <div className="text-xs font-extrabold text-slate-900">
 {bed.tenant_name}
 </div>
 <div className="text-[10px] text-slate-400">
 Room {bed.room_number} • {bed.bed_name}
 </div>
 </div>
 {hasPass && (
 <span
 className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
 bed.active_pass_type === "day_pass"
 ? "bg-amber-50 text-amber-700 border border-amber-200"
 : "bg-indigo-50 text-indigo-700 border border-indigo-200"
 }`}
 >
 Active {bed.active_pass_type === "day_pass" ? "Day Pass" : "Night Pass"}
 </span>
 )}
 </div>

 {/* 4 Quick-Tap Attendance Status Pills */}
 <div className="grid grid-cols-4 gap-1">
 <button
 type="button"
 onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "present")}
 className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
 st === "present"
 ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
 : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
 }`}
 >
 Present
 </button>

 <button
 type="button"
 onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "absent")}
 className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
 st === "absent"
 ? "bg-rose-600 text-white border-rose-600 shadow-xs"
 : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
 }`}
 >
 Absent
 </button>

 <button
 type="button"
 onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "day_pass")}
 className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
 st === "day_pass"
 ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
 : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
 }`}
 >
 Day Pass
 </button>

 <button
 type="button"
 onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "night_pass")}
 className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition cursor-pointer ${
 st === "night_pass"
 ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
 : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
 }`}
 >
 Night Pass
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 {/* Save Success Toast */}
 {saveSuccessMsg && (
 <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
 <span>{saveSuccessMsg}</span>
 </div>
 </div>
 )}

 {/* Sticky Save & Sync Attendance Bottom Bar */}
 <div className="sticky bottom-20 z-20 pt-2">
 <button
 type="button"
 onClick={handleSaveAndSync}
 disabled={isPending}
 className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
 >
 <CheckCircle2 className="w-4 h-4" />
 <span>{isPending ? "Syncing to Student Apps..." : "Save & Sync Attendance to Tenant Apps"}</span>
 </button>
 </div>
 </div>
 );
}
