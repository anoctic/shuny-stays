import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { MOCK_PG_POLICIES } from "@/lib/mock-data";

export default function RlsSecurityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              Row Level Security (RLS) Auditor
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
              Enforced
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Every table enforces tenant boundary conditions via <code className="font-mono text-xs">get_user_organization_ids()</code>.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Policy Name</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">USING (Partition Qualifier)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {MOCK_PG_POLICIES.map((p, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                    public.{p.tablename}
                  </td>
                  <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-medium">
                    {p.policyname}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{p.roles.join(", ")}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
                      {p.cmd}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 text-[11px] max-w-md truncate">
                    {p.qual}
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
