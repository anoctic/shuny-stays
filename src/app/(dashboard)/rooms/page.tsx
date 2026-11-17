import { Plus, Filter } from "lucide-react";
import { MOCK_ROOMS } from "@/lib/mock-data";
import { BedOccupancyGrid } from "@/components/pg/BedOccupancyGrid";

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Rooms & Bed Allocations
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Visual bed matrix across sharing types (single, double, triple) and AC options.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            Filter Status
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors">
            <Plus className="h-4 w-4" />
            Add Room
          </button>
        </div>
      </div>

      <BedOccupancyGrid rooms={MOCK_ROOMS} />
    </div>
  );
}
