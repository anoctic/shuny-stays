import { SqlConsole } from "@/components/postgres/SqlConsole";
import { Database, ShieldCheck, Layers, Terminal } from "lucide-react";
import { MOCK_PG_TABLES } from "@/lib/mock-data";

export default function SuperAdminDatabasePage() {
  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-600" />
            PostgreSQL Studio & SQL Console
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Execute SQL queries directly against Supabase PostgreSQL and inspect Row Level Security.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin Only
          </span>
        </div>
      </div>

      {/* SQL Runner */}
      <SqlConsole />

      {/* Database Schema & Tables */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            Public Tables & RLS Status
          </h3>
          <span className="text-xs text-zinc-400">11 Tables Registered</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_PG_TABLES.map((table) => (
            <div
              key={table.table_name}
              className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
            >
              <div>
                <p className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  public.{table.table_name}
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  ~{table.row_count_estimate} rows • {table.total_size_pretty}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                RLS
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
