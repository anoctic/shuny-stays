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
  Sparkles,
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

  return (
    <div className="space-y-3.5">
      {/* 1. 2-Column Compact KPI Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Live Occupancy
          </div>
          <div className="text-sm font-extrabold text-slate-900 tabular-nums mt-0.5">
            {occupiedBeds}/{totalBeds} Beds
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            {vacantBeds} Beds Vacant
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Rent Pipeline
            </div>
            <div className="text-sm font-extrabold text-indigo-600 tabular-nums mt-0.5">
              ₹{collectedRent.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-[10px] text-slate-400">
            Expected: ₹{expectedRent.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Quick Action Strip (Bldg Builder & CSV) */}
      {!isAdminScoped && (
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
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Horizontal Building Filter Pills */}
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
                  ? "bg-indigo-600 text-white border-transparent shadow-xs"
                  : locked
                  ? "opacity-50 bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-white text-slate-800 border-slate-200"
              }`}
            >
              <span>{b.name}</span>
              {locked && <Lock className="w-3 h-3 text-slate-400" />}
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
                    {!isAdminScoped && (
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
                    )}
                  </div>

                  {activeFloor.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5"
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
                          {!isAdminScoped && (
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
                                    floor,
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
                                className="p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-dashed border-emerald-300 text-left transition flex items-center justify-between gap-1 active:scale-95"
                              >
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[9.5px] font-extrabold text-emerald-700">
                                      {bed.label}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
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

      {/* 360 Occupied Bed Profile Bottom Sheet */}
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
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />
    </div>
  );
}
