import { BedDouble, Wind, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { MOCK_ROOMS } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export default function OwnerRoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Rooms & Bed Inventory
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Live occupancy by room and bed slot for your organization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_ROOMS.map((room) => (
          <div
            key={room.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  {room.property_name}
                </span>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
                  Room {room.room_number}
                </h3>
                <p className="text-xs text-zinc-400 capitalize">
                  Floor {room.floor_number} • {room.room_type} Sharing
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 block">
                  {formatINR(room.base_rent_paise)}
                </span>
                <span className="text-[10px] text-zinc-400">/ bed / month</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              {room.is_ac ? (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium flex items-center gap-1">
                  <Wind className="h-3 w-3" /> AC
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                  Non-AC
                </span>
              )}
              {room.has_attached_bathroom && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                  Attached Bath
                </span>
              )}
              {room.has_balcony && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                  Balcony
                </span>
              )}
            </div>

            {/* Beds */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Beds in Room:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {room.beds?.map((bed) => {
                  const isOccupied = bed.status === "occupied";
                  const isVacant = bed.status === "vacant";

                  return (
                    <div
                      key={bed.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isOccupied
                          ? "bg-zinc-50 border-zinc-200 dark:bg-zinc-800/40 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                          : isVacant
                          ? "bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-amber-50 border-amber-300 text-amber-800"
                      }`}
                    >
                      <span className="font-bold">{bed.bed_code}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          isOccupied
                            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            : isVacant
                            ? "bg-emerald-200 text-emerald-900"
                            : "bg-amber-200 text-amber-900"
                        }`}
                      >
                        {bed.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
