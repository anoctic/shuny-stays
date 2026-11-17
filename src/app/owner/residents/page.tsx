import { Users, Phone, Mail, ShieldCheck, BedDouble, AlertCircle } from "lucide-react";
import { MOCK_RESIDENTS } from "@/lib/mock-data";

export default function OwnerResidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Residents & Leases
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Tenants residing in properties of your organization.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Resident</th>
                <th className="px-6 py-3.5">Bed / Room</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Work / College</th>
                <th className="px-6 py-3.5">Emergency Contact</th>
                <th className="px-6 py-3.5">KYC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {MOCK_RESIDENTS.map((res) => (
                <tr key={res.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {res.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {res.full_name}
                        </p>
                        <span className="text-[10px] text-zinc-400">
                          Joined {res.created_at.slice(0, 10)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                      Room {res.current_bed?.room_number} ({res.current_bed?.bed_code})
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {res.current_bed?.property_name}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{res.phone}</p>
                    <p className="text-[11px] text-zinc-500">{res.email}</p>
                  </td>

                  <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                    {res.work_or_college}
                  </td>

                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {res.emergency_contact_name}
                    </p>
                    <p className="text-[10px]">{res.emergency_contact_phone}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      {res.id_proof_type} Verified
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
