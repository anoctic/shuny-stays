"use client";

import { BedDouble, Plus, Search, Building2 } from "lucide-react";

export default function RoomsPage() {
  const rooms = [
    { number: "101", floor: "Floor 1", sharing: 2, occupied: 1, vacant: 1, isAc: true, rent: "₹9,500" },
    { number: "102", floor: "Floor 1", sharing: 3, occupied: 2, vacant: 1, isAc: false, rent: "₹7,500" },
    { number: "201", floor: "Floor 2", sharing: 2, occupied: 2, vacant: 0, isAc: true, rent: "₹10,000" },
    { number: "202", floor: "Floor 2", sharing: 1, occupied: 1, vacant: 0, isAc: true, rent: "₹14,000" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">Rooms & Beds</h1>
          <p className="text-xs text-slate-400">Block A - Krishna Bhawan</p>
        </div>
        <button
          onClick={() => alert("Room creation modal will be built in Step 3.")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Room
        </button>
      </div>

      <div className="space-y-2.5">
        {rooms.map((room) => (
          <div
            key={room.number}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                {room.number}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    Room {room.number}
                  </span>
                  {room.isAc && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-bold">
                      AC
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {room.floor} • {room.sharing}-Sharing • {room.rent}/mo
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  room.vacant > 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {room.vacant > 0 ? `${room.vacant} Vacant Bed` : "Fully Occupied"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
