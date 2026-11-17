import { Terminal, Database } from "lucide-react";
import { SqlConsole } from "@/components/postgres/SqlConsole";

export default function QueryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Terminal className="h-6 w-6 text-cyan-600" />
              SQL Query Console
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-semibold">
              Read-Safe
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Execute SQL queries directly against Supabase PostgreSQL with tenant row-level boundaries.
          </p>
        </div>
      </div>

      <SqlConsole />
    </div>
  );
}
