"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Layers,
  Plus,
  Lock,
  ChevronRight,
  UserPlus,
  BedDouble,
} from "lucide-react";
import { BuildingItem, FloorItem, RoomItem, BedItem } from "@/lib/data/rooms";
import { BedProfileSheet } from "./BedProfileSheet";
import {
  WalkInSheet,
  AutoBuildingSheet,
  AddFloorSheet,
  AddRoomSheet,
  AddBedSheet,
  CsvImportModal,
} from "./RoomsSheets";

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
  const isAdminScoped = userRole === "admin";
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [selectedFloorByBuilding, setSelectedFloorByBuilding] = useState<Record<string, number>>({});

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

  // Scoped buildings
  const allowedBuildingIds = isAdminScoped ? ["b-a"] : initialBuildings.map((b) => b.id);
  const visibleBuildings = isAdminScoped
    ? initialBuildings.filter((b) => allowedBuildingIds.includes(b.id))
    : selectedBuildingId === "all"
    ? initialBuildings
    : initialBuildings.filter((b) => b.id === selectedBuildingId);

  // Stats calculation
  let totalBeds = 0;
  let occupiedBeds = 0;
  visibleBuildings.forEach((b) => {
    b.floors.forEach((f) => {
      f.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          totalBeds++;
          if (bed.occupied) occupiedBeds++;
        });
      });
    });
  });
  const vacantBeds = totalBeds - occupiedBeds;

  const getActivePassForTenant = (tenantId?: string) => {
    if (!tenantId) return null;
    return activePasses.find((p) => p.tenantId === tenantId) || null;
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Quick Occupancy Strip + CSV Import */}
      <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            Live Occupancy
          </div>
          <div className="text-sm font-extrabold text-[#0F172A] tabular-nums">
            {occupiedBeds}/{totalBeds} Beds{" "}
            <span className="text-xs font-bold text-emerald-600">({vacantBeds} Vacant)</span>
          </div>
        </div>

        {!isAdminScoped ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoBuildingOpen(true)}
              className="px-2 py-1.5 rounded-xl bg-[#4F46E5] text-white text-[10.5px] font-extrabold flex items-center gap-1 shrink-0 shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bldg</span>
            </button>
            <button
              onClick={() => setIsCsvImportOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#EEF2FF] text-[#4338CA] hover:bg-indigo-100 border border-indigo-200 text-[10.5px] font-extrabold flex items-center gap-1 shrink-0 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
          </div>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-extrabold">
            Block A Scoped
          </span>
        )}
      </div>

      {/* 2. Building Filter Pills */}
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
            All ({initialBuildings.length})
          </button>
        )}

        {initialBuildings.map((b) => {
          const locked = isAdminScoped && !allowedBuildingIds.includes(b.id);
          const selected = selectedBuildingId === b.id;

          return (
            <button
              key={b.id}
              onClick={() => {
                if (!locked) setSelectedBuildingId(b.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 flex items-center gap-1 border transition ${
                selected
                  ? "bg-[#4F46E5] text-white border-transparent shadow-xs"
                  : locked
                  ? "opacity-50 bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]"
                  : "bg-white text-[#0F172A] border-[#E2E8F0]"
              }`}
            >
              <span>{b.name}</span>
              {locked && <Lock className="w-3 h-3 text-[#64748B]" />}
            </button>
          );
        })}
      </div>

      {/* 3. Buildings -> Floors -> Rooms -> Beds */}
      <div className="space-y-3.5">
        {visibleBuildings.map((building) => {
          const floorIdx = Math.min(
            selectedFloorByBuilding[building.id] || 0,
            Math.max(0, building.floors.length - 1)
          );
          const activeFloor = building.floors[floorIdx];

          return (
            <section
              key={building.id}
              className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden"
            >
              {/* Building Dark Header */}
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-extrabold truncate">{building.name}</h3>
                    <span className="px-1.5 py-0.5 rounded bg-white/15 text-[9px] font-extrabold uppercase">
                      {building.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 truncate mt-0.5">
                    ShunyOS Managed • {building.floors.length} Floors
                  </p>
                </div>

                {!isAdminScoped && (
                  <button
                    onClick={() => setAddFloorBuilding(building)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold flex items-center gap-1 shrink-0 active:scale-95 transition"
                  >
                    <Layers className="w-3 h-3" />
                    <span>+ Add Floor</span>
                  </button>
                )}
              </div>

              {/* Floor Tabs */}
              <div className="px-3 py-2 border-b border-[#E2E8F0] bg-[#F1F5F9] flex items-center gap-1.5 overflow-x-auto phone-scroll">
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
                        ? "bg-[#4F46E5] text-white shadow-xs"
                        : "bg-white text-[#0F172A] border border-[#E2E8F0]"
                    }`}
                  >
                    {fl.name} ({fl.rooms.length})
                  </button>
                ))}
              </div>

              {/* Active Floor Rooms */}
              {activeFloor ? (
                <div className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
                    <span className="text-[11px] font-extrabold text-[#0F172A]">
                      {activeFloor.name} Rooms
                    </span>
                    {!isAdminScoped && (
                      <button
                        onClick={() => setAddRoomTarget({ building, floorIdx })}
                        className="px-2.5 py-1 rounded-lg bg-[#EEF2FF] text-[#4338CA] border border-indigo-200 text-[10px] font-extrabold flex items-center gap-1 transition active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Room</span>
                      </button>
                    )}
                  </div>

                  {activeFloor.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-extrabold">
                            Room {room.number}
                          </span>
                          <span className="text-[10px] font-bold text-[#64748B]">
                            {room.sharing}-Seater
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-extrabold text-[#4F46E5] tabular-nums">
                            ₹{room.rent.toLocaleString("en-IN")}/mo
                          </span>
                          {!isAdminScoped && (
                            <button
                              onClick={() =>
                                setAddBedTarget({
                                  building,
                                  floorIdx,
                                  roomId: room.id,
                                })
                              }
                              className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 text-[9.5px] font-extrabold border border-emerald-500/30 transition active:scale-95"
                            >
                              + Bed
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Color-Coded Bed Pills */}
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
                                    floor,
                                    floorIdx,
                                    room,
                                    bed,
                                    bedIdx: bIdx,
                                  })
                                }
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 text-left transition flex items-center justify-between gap-1 active:scale-95"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                    <span className="text-[9.5px] font-extrabold text-rose-500">
                                      {bed.label}
                                    </span>
                                    {activePass && (
                                      <span
                                        className={`px-1 rounded text-[8px] font-extrabold ${
                                          activePass.status === "approved"
                                            ? "bg-emerald-500/20 text-emerald-600"
                                            : "bg-amber-500/25 text-amber-700"
                                        }`}
                                      >
                                        {activePass.passType === "day_pass" ? "DAY" : "NIGHT"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] font-extrabold text-[#0F172A] truncate mt-0.5">
                                    {bed.tenant.name}
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              </button>
                            );
                          } else {
                            return (
                              <button
                                key={bed.id}
                                onClick={() =>
                                  setActiveWalkInBed({
                                    building,
                                    floor,
                                    floorIdx,
                                    room,
                                    bedIdx: bIdx,
                                  })
                                }
                                className="p-2 rounded-xl text-left transition flex items-center justify-between gap-1 border border-dashed bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/40 active:scale-95"
                              >
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[9.5px] font-extrabold text-emerald-600">
                                      {bed.label}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                                    + Walk-In
                                  </div>
                                </div>
                                <UserPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              </button>
                            );
                          }
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {/* Slide-Up Bottom Sheets & Modals */}
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
        />
      )}

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

      <AutoBuildingSheet
        isOpen={isAutoBuildingOpen}
        onClose={() => setIsAutoBuildingOpen(false)}
      />

      <AddFloorSheet
        isOpen={Boolean(addFloorBuilding)}
        onClose={() => setAddFloorBuilding(null)}
        building={addFloorBuilding}
      />

      <AddRoomSheet
        isOpen={Boolean(addRoomTarget)}
        onClose={() => setAddRoomTarget(null)}
        building={addRoomTarget?.building || null}
        floorIdx={addRoomTarget?.floorIdx || 0}
      />

      <AddBedSheet
        isOpen={Boolean(addBedTarget)}
        onClose={() => setAddBedTarget(null)}
        building={addBedTarget?.building || null}
        floorIdx={addBedTarget?.floorIdx || 0}
        roomId={addBedTarget?.roomId || null}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />
    </div>
  );
}
