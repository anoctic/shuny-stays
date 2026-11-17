import { Layers, ShieldCheck, HardDrive, KeyRound } from "lucide-react";
import { MOCK_PG_TABLES } from "@/lib/mock-data";

export default function SchemaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-cyan-600" />
            Database Schema & Tables
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Introspecting PostgreSQL catalogs for table sizes, indexes, and Row Level Security settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PG_TABLES.map((table) => (
          <div
            key={table.table_name}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {table.table_name}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {table.table_type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono py-2 border-y border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-zinc-400 text-[10px] block">ESTIMATED ROWS</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {table.row_count_estimate}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">DISK SIZE</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {table.total_size_pretty}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                PK: id (UUID)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                RLS Enforced
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
