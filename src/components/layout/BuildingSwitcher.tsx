"use client";

import { useState } from "react";
import { Building2, ChevronDown, Check, Home } from "lucide-react";
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
      {/* Trigger Button styled with Fintech subtle pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] border border-[#E2E8F0] text-[11px] font-extrabold text-[#0F172A] transition-all shadow-xs max-w-[155px]"
        aria-label="Switch PG Building Scope"
      >
        <Building2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
        <span className="truncate">{activeLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#64748B] shrink-0 transition-transform duration-200 ${
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
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
          <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
            Scope View
          </div>

          {/* Option: All Buildings */}
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              !activeBuildingId
                ? "bg-[#EEF2FF] text-[#4338CA] font-extrabold border border-indigo-200"
                : "text-[#0F172A] hover:bg-[#F1F5F9]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Home className="w-3.5 h-3.5 text-[#4F46E5]" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-xs">All Buildings</p>
                <p className="text-[10px] text-[#64748B]">Consolidated PG View</p>
              </div>
            </div>
            {!activeBuildingId && <Check className="w-4 h-4 text-[#4F46E5] shrink-0" />}
          </button>

          <div className="my-1.5 border-t border-slate-100" />

          {/* List of Individual Buildings */}
          <div className="max-h-48 overflow-y-auto phone-scroll space-y-1 pr-1">
            {buildings.map((building) => {
              const isSelected = activeBuildingId === building.id;
              const genderBadge =
                building.gender_type === "boys"
                  ? "bg-indigo-100 text-indigo-700"
                  : building.gender_type === "girls"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-purple-100 text-purple-700";

              return (
                <button
                  key={building.id}
                  onClick={() => handleSelect(building.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? "bg-[#EEF2FF] text-[#4338CA] font-extrabold border border-indigo-200"
                      : "text-[#0F172A] hover:bg-[#F1F5F9]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="font-bold text-xs truncate">{building.name}</p>
                      <span className={`inline-block px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase ${genderBadge}`}>
                        {building.gender_type}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#4F46E5] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
