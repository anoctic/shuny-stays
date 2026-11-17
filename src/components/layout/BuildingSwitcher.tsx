"use client";

import { useState } from "react";
import { Building2, ChevronDown, Check, Plus, Home } from "lucide-react";
import { Building } from "@/types/schema.types";
import { switchActiveBuildingAction } from "@/app/actions/auth";

interface BuildingSwitcherProps {
  buildings: Building[];
  activeBuildingId?: string | null;
}

export function BuildingSwitcher({ buildings, activeBuildingId }: BuildingSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const selectedBuilding = buildings.find((b) => b.id === activeBuildingId);
  const activeLabel = selectedBuilding ? selectedBuilding.name : `All Buildings (${buildings.length})`;

  const handleSelect = async (id: string | null) => {
    setIsPending(true);
    setIsOpen(false);
    await switchActiveBuildingAction(id);
    setIsPending(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all shadow-sm max-w-[200px]"
        aria-label="Switch PG Building"
      >
        <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="truncate">{activeLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Scope View
          </div>

          {/* Option: All Buildings */}
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              !activeBuildingId
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center shrink-0">
                <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-xs">All Buildings</p>
                <p className="text-[10px] text-slate-400">Consolidated PG View</p>
              </div>
            </div>
            {!activeBuildingId && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
          </button>

          <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

          {/* List of Individual Buildings */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {buildings.map((building) => {
              const isSelected = activeBuildingId === building.id;
              const genderBadge =
                building.gender_type === "boys"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  : building.gender_type === "girls"
                  ? "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300";

              return (
                <button
                  key={building.id}
                  onClick={() => handleSelect(building.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="text-left truncate">
                      <p className="font-medium truncate text-xs">{building.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${genderBadge}`}>
                        {building.gender_type}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

          {/* Action: Add New Building */}
          <button
            onClick={() => {
              setIsOpen(false);
              alert("Add Building dialog opens in Step 3!");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Building</span>
          </button>
        </div>
      )}
    </div>
  );
}
