"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Moon,
  Building2,
  Layers,
  Save,
  CheckCheck,
  UserCheck,
  AlertCircle,
  Phone,
  QrCode,
  Sparkles,
} from "lucide-react";
import {
  AttendanceStatus,
  BedAttendanceItem,
  UserRole,
} from "@/types/schema.types";
import { saveAttendanceAction } from "@/app/actions/attendance";
import { cn } from "@/lib/utils";

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
    if (userRole === "admin" && assignedBuildingIds.length > 0) {
      if (!assignedBuildingIds.includes(b.building_id)) return false;
    }
    if (selectedBuildingId === "all") return true;
    return b.building_id === selectedBuildingId;
  });

  // Handle single bed status toggle
  const handleStatusChange = (
    bedId: string,
    tenantId: string,
    status: AttendanceStatus
  ) => {
    setBedStatuses((prev) => ({
      ...prev,
      [bedId]: { status, tenant_id: tenantId },
    }));
    setSaveSuccessMsg(null);
  };

  // Mark all unmarked or absent beds on a floor as "present" in 1 tap
  const handleMarkFloorRemainingPresent = (beds: BedAttendanceItem[]) => {
    setBedStatuses((prev) => {
      const updated = { ...prev };
      beds.forEach((bed) => {
        const current = updated[bed.bed_id]?.status || bed.status;
        // If absent or unconfirmed, change to present (keep active passes intact)
        if (current === "absent" || !updated[bed.bed_id]) {
          updated[bed.bed_id] = {
            status: "present",
            tenant_id: bed.tenant_id,
          };
        }
      });
      return updated;
    });
    setSaveSuccessMsg(null);
  };

  // Save all changed attendance logs via Server Action
  const handleSaveAttendance = () => {
    startTransition(async () => {
      const itemsToSave = Object.entries(bedStatuses).map(([bed_id, data]) => ({
        bed_id,
        tenant_id: data.tenant_id,
        status: data.status,
      }));

      const res = await saveAttendanceAction(itemsToSave);
      if (res?.success) {
        setSaveSuccessMsg(`Attendance saved for ${itemsToSave.length} residents!`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    });
  };

  // Calculate live dynamic metrics across current view
  let viewTotal = 0;
  let viewPresent = 0;
  let viewPass = 0;
  let viewAbsent = 0;

  filteredBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.beds.forEach((bed) => {
        viewTotal++;
        const currentStatus = bedStatuses[bed.bed_id]?.status || bed.status;
        if (currentStatus === "present") viewPresent++;
        else if (currentStatus === "day_pass" || currentStatus === "night_pass")
          viewPass++;
        else viewAbsent++;
      });
    });
  });

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-5 shadow-lg shadow-indigo-500/15">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
            Night Attendance & Roll Call
          </div>
          <span className="text-[11px] text-indigo-200 font-medium">
            {todayFormatted}
          </span>
        </div>
        <h1 className="text-xl font-black tracking-tight">
          Beds & Attendance Sheet
        </h1>
        <p className="text-xs text-indigo-100/90 mt-1">
          {userRole === "owner"
            ? "Full oversight across all PG blocks. Passes automatically sync with gate requests."
            : "Assigned block duty desk. Tap status pills or mark entire floor present in 1 tap."}
        </p>

        {/* Global Attendance Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-200">Total</span>
            <p className="text-base font-black">{viewTotal}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-300">Present</span>
            <p className="text-base font-black text-emerald-300">{viewPresent}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-amber-300">On Pass</span>
            <p className="text-base font-black text-amber-300">{viewPass}</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-rose-300">Absent</span>
            <p className="text-base font-black text-rose-300">{viewAbsent}</p>
          </div>
        </div>
      </div>

      {/* Level 1: Building Selector Tabs */}
      {userRole === "owner" && initialBuildings.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedBuildingId("all")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedBuildingId === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            )}
          >
            All Buildings ({initialBuildings.length})
          </button>
          {initialBuildings.map((b) => (
            <button
              key={b.building_id}
              type="button"
              onClick={() => setSelectedBuildingId(b.building_id)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                selectedBuildingId === b.building_id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              )}
            >
              {b.building_name.split("-")[0].trim()}
            </button>
          ))}
        </div>
      )}

      {/* Level 2 & 3: Buildings -> Floors -> Beds List */}
      <div className="space-y-6">
        {filteredBuildings.map((building) => (
          <div key={building.building_id} className="space-y-4">
            {/* Building Header Banner */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {building.building_name}
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    {building.floors.length} Floors • {building.stats.total} Beds Total
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                {building.gender_type}
              </span>
            </div>

            {/* Floor Sections */}
            {building.floors.map((floor) => {
              // Calculate live counts for this floor from bedStatuses
              const floorTotal = floor.beds.length;
              const floorPresent = floor.beds.filter(
                (b) => (bedStatuses[b.bed_id]?.status || b.status) === "present"
              ).length;
              const floorPass = floor.beds.filter((b) => {
                const s = bedStatuses[b.bed_id]?.status || b.status;
                return s === "day_pass" || s === "night_pass";
              }).length;

              return (
                <div
                  key={floor.floor_id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3.5"
                >
                  {/* Floor Header Bar with 'Mark Remaining Present' 1-Tap Button */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        F{floor.floor_number}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white">
                          {floor.floor_name}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {floorPresent}/{floorTotal} Present
                          </span>
                          {floorPass > 0 && ` • ${floorPass} on Pass`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMarkFloorRemainingPresent(floor.beds)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1 transition-all active:scale-95 border border-emerald-200/60 dark:border-emerald-800/40"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark Remaining Present
                    </button>
                  </div>

                  {/* Level 3: Beds Cards on this floor */}
                  <div className="space-y-2.5">
                    {floor.beds.map((bed) => {
                      const currentStatus =
                        bedStatuses[bed.bed_id]?.status || bed.status;

                      return (
                        <div
                          key={bed.bed_id}
                          className={cn(
                            "p-3 rounded-2xl border transition-all space-y-2",
                            currentStatus === "present"
                              ? "bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-800"
                              : currentStatus === "absent"
                              ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                              : currentStatus === "day_pass"
                              ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                              : "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50"
                          )}
                        >
                          {/* Bed Top Row: Room, Bed, Tenant Name & Pass Pill */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  Room {bed.room_number} • {bed.bed_name}
                                </span>
                                {bed.sharing_type && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {bed.sharing_type}S
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                                {bed.tenant_name}
                              </p>
                            </div>

                            {/* Auto-detected Gate Pass Pill */}
                            {bed.has_active_pass && bed.pass_number && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-bold border border-amber-300/60 dark:border-amber-700/60">
                                <QrCode className="w-3 h-3 text-amber-600" />
                                {bed.pass_number}
                              </div>
                            )}
                          </div>

                          {/* 4 Smart Quick-Tap Status Pills */}
                          <div className="grid grid-cols-4 gap-1.5 pt-1">
                            {/* 1. Present */}
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(bed.bed_id, bed.tenant_id, "present")
                              }
                              className={cn(
                                "py-1.5 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95",
                                currentStatus === "present"
                                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-black"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              )}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Present
                            </button>

                            {/* 2. Absent */}
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(bed.bed_id, bed.tenant_id, "absent")
                              }
                              className={cn(
                                "py-1.5 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95",
                                currentStatus === "absent"
                                  ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30 font-black"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              )}
                            >
                              <XCircle className="w-3 h-3" />
                              Absent
                            </button>

                            {/* 3. Day Pass */}
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(bed.bed_id, bed.tenant_id, "day_pass")
                              }
                              className={cn(
                                "py-1.5 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95",
                                currentStatus === "day_pass"
                                  ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30 font-black"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                              )}
                            >
                              <Clock className="w-3 h-3" />
                              Day Pass
                            </button>

                            {/* 4. Night Pass */}
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(bed.bed_id, bed.tenant_id, "night_pass")
                              }
                              className={cn(
                                "py-1.5 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95",
                                currentStatus === "night_pass"
                                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-black"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                              )}
                            >
                              <Moon className="w-3 h-3" />
                              Night Pass
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Floating Bottom Sticky Action Bar: Save Attendance */}
      <div className="fixed bottom-16 inset-x-0 max-w-[480px] mx-auto px-4 z-40 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/90 text-white backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-slate-200 block">
              {viewPresent}/{viewTotal} Marked Present
            </span>
            <span className="text-[10px] text-slate-400">
              {viewPass} on pass • {viewAbsent} absent
            </span>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveAttendance}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* Save Success Banner Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-20 inset-x-0 max-w-[440px] mx-auto px-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMsg(null)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
