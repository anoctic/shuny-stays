"use client";

import { useState, useTransition } from "react";
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

  // Handle single bed status change
  const handleStatusChange = (bedId: string, tenantId: string, status: AttendanceStatus) => {
    setBedStatuses((prev) => ({
      ...prev,
      [bedId]: { status, tenant_id: tenantId },
    }));
  };

  // Mark all remaining beds on a floor as Present
  const handleMarkFloorRemainingPresent = (beds: BedAttendanceItem[]) => {
    setBedStatuses((prev) => {
      const next = { ...prev };
      beds.forEach((b) => {
        const current = next[b.bed_id]?.status || b.status;
        if (current !== "day_pass" && current !== "night_pass") {
          next[b.bed_id] = {
            status: "present",
            tenant_id: b.tenant_id,
          };
        }
      });
      return next;
    });
  };

  // Save & Sync all attendance to tenant apps
  const handleSaveAndSync = () => {
    const payload = Object.entries(bedStatuses).map(([bedId, val]) => ({
      bed_id: bedId,
      tenant_id: val.tenant_id,
      status: val.status,
    }));

    startTransition(async () => {
      const res = await saveAttendanceAction(payload);
      if (res?.success) {
        setSaveSuccessMsg(`Attendance saved & synced for ${res.count} residents!`);
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    });
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Top Attendance Summary Bar */}
      <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-extrabold text-[#0F172A]">Daily Bed Roll Call</div>
          <div className="text-[10px] text-[#64748B]">Auto-detects active Day & Night passes</div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold tabular-nums">
          <span className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
            {presentCnt} P
          </span>
          <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-600 border border-amber-500/30">
            {passCnt} Pass
          </span>
          <span className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/30">
            {absentCnt} A
          </span>
        </div>
      </div>

      {/* Building Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto phone-scroll pb-0.5">
        {!isAdminScoped && (
          <button
            onClick={() => setSelectedBuildingId("all")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 border transition ${
              selectedBuildingId === "all"
                ? "bg-[#4F46E5] text-white border-transparent shadow-xs"
                : "bg-white text-[#0F172A] border-[#E2E8F0]"
            }`}
          >
            All Buildings ({initialBuildings.length})
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
                  ? "bg-[#4F46E5] text-white border-transparent shadow-xs"
                  : locked
                  ? "opacity-50 bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]"
                  : "bg-white text-[#0F172A] border-[#E2E8F0]"
              }`}
            >
              <span>{b.building_name.split(" - ")[0]}</span>
              {locked && <Lock className="w-3 h-3 text-[#64748B]" />}
            </button>
          );
        })}
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. Building Sections -> Floor Sections -> All Occupied Beds */}
      <div className="space-y-3.5">
        {filteredBuildings.map((building) => (
          <div
            key={building.building_id}
            className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden"
          >
            {/* Building Header */}
            <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-extrabold">
                {building.building_name} ({building.gender_type})
              </span>
              <span className="text-[10px] text-slate-300">
                {building.floors.length} Floors
              </span>
            </div>

            {/* Floors List */}
            <div className="p-3 space-y-3">
              {building.floors.map((floor) => {
                const flPresent = floor.beds.filter(
                  (bed) => (bedStatuses[bed.bed_id]?.status || bed.status) === "present"
                ).length;

                return (
                  <div key={floor.floor_id} className="space-y-2">
                    {/* Floor Sub-header */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
                      <span className="text-[11px] font-extrabold text-[#0F172A]">
                        {floor.floor_name}{" "}
                        <span className="text-emerald-600">
                          ({flPresent}/{floor.beds.length} Present)
                        </span>
                      </span>
                      <button
                        onClick={() => handleMarkFloorRemainingPresent(floor.beds)}
                        className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 text-[9.5px] font-extrabold border border-emerald-500/30 active:scale-95 transition"
                      >
                        Mark Remaining Present
                      </button>
                    </div>

                    {/* Beds on Floor */}
                    {floor.beds.length === 0 ? (
                      <p className="text-[10.5px] text-[#64748B] px-2">
                        No occupied beds on this floor.
                      </p>
                    ) : (
                      floor.beds.map((bed) => {
                        const st = bedStatuses[bed.bed_id]?.status || bed.status;
                        const hasPass = bed.active_pass_type != null;

                        return (
                          <div
                            key={bed.bed_id}
                            className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-extrabold text-[#0F172A]">
                                  {bed.tenant_name}
                                </div>
                                <div className="text-[10px] text-[#64748B]">
                                  Room {bed.room_number} • {bed.bed_name}
                                </div>
                              </div>
                              {hasPass && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                    bed.active_pass_type === "day_pass"
                                      ? "bg-amber-500/20 text-amber-700 border border-amber-500/30"
                                      : "bg-indigo-500/20 text-indigo-600 border border-indigo-500/30"
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
                                className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition ${
                                  st === "present"
                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]"
                                }`}
                              >
                                Present
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "absent")}
                                className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition ${
                                  st === "absent"
                                    ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]"
                                }`}
                              >
                                Absent
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "day_pass")}
                                className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition ${
                                  st === "day_pass"
                                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]"
                                }`}
                              >
                                Day Pass
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(bed.bed_id, bed.tenant_id, "night_pass")}
                                className={`py-1.5 rounded-lg text-[9.5px] font-extrabold border transition ${
                                  st === "night_pass"
                                    ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs"
                                    : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]"
                                }`}
                              >
                                Night Pass
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Sticky Save & Sync Attendance Button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleSaveAndSync}
        className="w-full py-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition disabled:opacity-50"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>{isPending ? "Syncing to Tenant Apps..." : "Save & Sync Attendance to Tenant Apps"}</span>
      </button>
    </div>
  );
}
