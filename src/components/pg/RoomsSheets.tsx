"use client";

import { useState } from "react";
import { X, Layers, Plus, FileSpreadsheet, UserPlus } from "lucide-react";
import { BuildingItem, FloorItem, RoomItem } from "@/lib/data/rooms";
import {
  addAutoBuildingAction,
  addFloorAction,
  addRoomAction,
  addBedAction,
  walkInAddTenantAction,
} from "@/app/actions/rooms-and-ops";

// ==============================================================================
// 1. WALK-IN EXPRESS ADD TENANT SHEET
// ==============================================================================
interface WalkInSheetProps {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem;
  floor: FloorItem;
  floorIdx: number;
  room: RoomItem;
  bedIdx: number;
}

export function WalkInSheet({
  isOpen,
  onClose,
  building,
  floor,
  floorIdx,
  room,
  bedIdx,
}: WalkInSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;
  const bed = room.beds[bedIdx];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await walkInAddTenantAction(building.id, floorIdx, room.id, bedIdx, formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A]">Walk-In Express Add</h3>
              <p className="text-[10.5px] text-emerald-600 font-bold">
                {building.name} • {floor.name} • Room {room.number} ({bed?.label || "Bed"})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            <div>
              <label className="font-bold text-[#64748B] block mb-1">1. Tenant Full Name</label>
              <input
                name="name"
                type="text"
                required
                defaultValue="Kabir Malhotra"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#64748B] block mb-1">2. Phone / WhatsApp</label>
              <input
                name="phone"
                type="tel"
                required
                defaultValue="9871234560"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#64748B] block mb-1">3. Joining Date</label>
              <input
                name="joinDate"
                type="text"
                defaultValue="18 Nov 2026"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A] focus:outline-none"
              />
            </div>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] cursor-pointer">
              <span className="font-bold text-[#0F172A]">4. Current Month Rent Paid?</span>
              <input
                name="rentPaid"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <p className="text-[10px] text-[#64748B]">
              Sets kyc_status = &apos;pending&apos; so resident uploads Aadhar & selfie on resident login.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Assigning..." : "Assign Bed & Send Welcome"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 2. SMART AUTO-BUILDING BUILDER SHEET
// ==============================================================================
export function AutoBuildingSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await addAutoBuildingAction(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Smart Auto-Building Builder</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="font-bold text-[#64748B] block mb-1">Building Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue="Block B"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                />
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Type</label>
                <select
                  name="type"
                  className="w-full px-2 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Co-ed">Co-ed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Total Floors</label>
                <input
                  name="floorsCount"
                  type="number"
                  min="1"
                  max="8"
                  defaultValue="3"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
                />
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Rooms Per Floor</label>
                <input
                  name="roomsPerFloor"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue="3"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Sharing</label>
                <select
                  name="sharing"
                  defaultValue="2"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                >
                  <option value="2">2-Seater</option>
                  <option value="3">3-Seater</option>
                  <option value="1">1-Seater</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Monthly Rent (₹)</label>
                <input
                  name="rent"
                  type="number"
                  defaultValue="8500"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-extrabold text-[#0F172A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95 mt-2"
            >
              {isSubmitting ? "Generating..." : "Auto-Divide Floors, Rooms & Beds"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 3. ADD FLOOR SHEET
// ==============================================================================
export function AddFloorSheet({
  isOpen,
  onClose,
  building,
}: {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen || !building) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const roomsCount = parseInt(formData.get("roomsCount") as string) || 3;
    await addFloorAction(building.id, name, roomsCount);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">+ Add Floor to {building.name}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            <div>
              <label className="font-bold text-[#64748B] block mb-1">Floor Name</label>
              <input
                name="name"
                type="text"
                required
                defaultValue={`${building.floors.length}th Floor`}
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
              />
            </div>
            <div>
              <label className="font-bold text-[#64748B] block mb-1">Initial Rooms Count</label>
              <input
                name="roomsCount"
                type="number"
                defaultValue="3"
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Creating..." : "Create Floor & Rooms"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 4. ADD ROOM SHEET (SINGLE OR BULK SERIES)
// ==============================================================================
export function AddRoomSheet({
  isOpen,
  onClose,
  building,
  floorIdx,
}: {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem | null;
  floorIdx: number;
}) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !building) return null;
  const floor = building.floors[floorIdx];
  if (!floor) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const sharing = parseInt(formData.get("sharing") as string) || 2;
    const rent = parseInt(formData.get("rent") as string) || 8500;

    if (mode === "single") {
      const roomNumber = formData.get("roomNumber") as string;
      await addRoomAction(building.id, floorIdx, "single", { roomNumber, sharing, rent });
    } else {
      const startNo = parseInt(formData.get("startNo") as string) || 102;
      const endNo = parseInt(formData.get("endNo") as string) || 105;
      await addRoomAction(building.id, floorIdx, "bulk", { startNo, endNo, sharing, rent });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              + Add Room ({building.name} • {floor.name})
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[10.5px] font-extrabold">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`py-1.5 rounded-lg transition ${
                mode === "single" ? "bg-[#4F46E5] text-white shadow-xs" : "text-[#64748B]"
              }`}
            >
              Single Room
            </button>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`py-1.5 rounded-lg transition ${
                mode === "bulk" ? "bg-[#4F46E5] text-white shadow-xs" : "text-[#64748B]"
              }`}
            >
              Bulk Series
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
            {mode === "single" ? (
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Room Number</label>
                <input
                  name="roomNumber"
                  type="text"
                  required
                  defaultValue={`${(floorIdx + 1) * 100 + floor.rooms.length + 1}`}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">Start No.</label>
                  <input
                    name="startNo"
                    type="number"
                    defaultValue="102"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#64748B] block mb-1">End No.</label>
                  <input
                    name="endNo"
                    type="number"
                    defaultValue="105"
                    className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Sharing</label>
                <select
                  name="sharing"
                  defaultValue="2"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                >
                  <option value="2">2-Seater</option>
                  <option value="3">3-Seater</option>
                  <option value="1">1-Seater</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#64748B] block mb-1">Rent (₹)</label>
                <input
                  name="rent"
                  type="number"
                  defaultValue="8500"
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[#0F172A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Generating..." : "Generate Room(s) & Beds"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 5. ADD BED SHEET
// ==============================================================================
export function AddBedSheet({
  isOpen,
  onClose,
  building,
  floorIdx,
  roomId,
}: {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingItem | null;
  floorIdx: number;
  roomId: string | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen || !building || !roomId) return null;

  const floor = building.floors[floorIdx];
  const room = floor?.rooms.find((r) => r.id === roomId);
  if (!room) return null;

  const nextLabel = `Bed ${String.fromCharCode(65 + room.beds.length)}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const label = formData.get("label") as string;
    await addBedAction(building.id, floorIdx, roomId, label);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              + Add Extra Bed (Room {room.number})
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <input
              name="label"
              type="text"
              required
              defaultValue={nextLabel}
              className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-xs text-[#0F172A]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              {isSubmitting ? "Adding..." : `Add ${nextLabel}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// 6. CSV IMPORT MODAL
// ==============================================================================
export function CsvImportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [imported, setImported] = useState(false);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 pb-8 shadow-2xl border-t border-[#E2E8F0] bg-white text-[#0F172A] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Bulk CSV / Excel Migration</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#64748B]">
            Upload or paste CSV rows containing your resident directory:
          </p>

          <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[10px] font-mono text-[#64748B] overflow-x-auto leading-relaxed">
            building, floor, room, sharing, rent, tenant_name, phone, paid<br />
            Block A, Ground, G-01, 2, 8500, Harsh Vardhan, 9811776655, true
          </div>

          {imported ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-bold text-center">
              ✓ Sample CSV row parsed and added to vacant bed!
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setImported(true)}
              className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-extrabold shadow-sm transition active:scale-95"
            >
              Import Sample CSV Row to Vacant Bed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
