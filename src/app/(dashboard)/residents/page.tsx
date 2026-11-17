import { Plus, Search, ShieldCheck, Phone, Mail, User } from "lucide-react";
import { MOCK_RESIDENTS } from "@/lib/mock-data";

export default function ResidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Residents & Guests
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tenant onboarding, KYC verification documents, emergency contacts, and bed assignments.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors">
          <Plus className="h-4 w-4" />
          Check-in New Resident
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search resident by name, room number, or phone..."
          className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
        />
      </div>

      {/* Residents Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase font-semibold border-b border-zinc-200 dark:border-zinc-800 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Resident</th>
                <th className="px-5 py-3.5">Room & Bed</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">KYC Status</th>
                <th className="px-5 py-3.5">Emergency Contact</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {MOCK_RESIDENTS.map((res) => (
                <tr key={res.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {res.full_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                          {res.full_name}
                        </span>
                        <span className="text-[11px] text-zinc-500 block">
                          {res.work_or_college}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200 block">
                      Room {res.current_bed?.room_number} ({res.current_bed?.bed_code})
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {res.current_bed?.property_name}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <Phone className="h-3 w-3 text-zinc-400" />
                      {res.phone}
                    </div>
                    {res.email && (
                      <div className="flex items-center gap-1.5 text-zinc-500 mt-0.5">
                        <Mail className="h-3 w-3 text-zinc-400" />
                        {res.email}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      {res.id_proof_type} ({res.id_proof_number})
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    <span className="block font-medium">{res.emergency_contact_name}</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {res.emergency_contact_phone}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Active Stay
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
