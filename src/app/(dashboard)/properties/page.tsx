import { Building2, Plus, MapPin, Phone, User, CheckCircle2 } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mock-data";

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Properties & PG Hostels
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your buildings, warden contacts, rules, and floor layouts.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors">
          <Plus className="h-4 w-4" />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_PROPERTIES.map((prop) => (
          <div
            key={prop.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    {prop.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {prop.code}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {prop.address}, {prop.city} - {prop.pincode}
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 capitalize">
                {prop.gender_type}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-center text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Floors</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {prop.total_floors}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Total Beds</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {prop.total_beds}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Occupancy</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {Math.round(((prop.occupied_beds || 0) / (prop.total_beds || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Warden Info */}
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                Warden: {prop.warden_name}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="h-3 w-3 text-zinc-400" />
                {prop.warden_phone}
              </span>
            </div>

            {/* Amenities Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {prop.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 text-[11px] rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
