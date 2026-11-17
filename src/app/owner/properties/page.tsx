import { Building2, MapPin, Users, BedDouble, Phone, CheckCircle2 } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/mock-data";

export default function OwnerPropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Properties & Hostels
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Locations managed by your organization.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_PROPERTIES.map((property) => (
          <div
            key={property.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {property.code} • {property.gender_type}
                </span>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                  {property.name}
                </h3>
                <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {property.address}, {property.city}
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600 block">
                  {Math.round((property.occupied_beds / property.total_beds) * 100)}% Full
                </span>
                <span className="text-[11px] text-zinc-400">
                  {property.occupied_beds}/{property.total_beds} beds
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
              <div>
                <p className="text-[10px] text-zinc-400">Floors</p>
                <p className="font-extrabold text-zinc-800 dark:text-zinc-200">{property.total_floors}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Rooms</p>
                <p className="font-extrabold text-zinc-800 dark:text-zinc-200">{property.total_rooms}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">Warden</p>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{property.warden_name}</p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                Included Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
