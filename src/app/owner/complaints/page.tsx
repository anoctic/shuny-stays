import { AlertCircle, CheckCircle2, Clock, Wrench } from "lucide-react";
import { MOCK_COMPLAINTS } from "@/lib/mock-data";

export default function OwnerComplaintsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Complaints & Maintenance
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Issues filed by residents in your properties.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MOCK_COMPLAINTS.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
                  {c.category}
                </span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {c.property_name}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  c.status === "open"
                    ? "bg-red-100 text-red-700"
                    : c.status === "in_progress"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {c.status.replace("_", " ")}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                {c.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>Raised by: <strong className="text-zinc-800 dark:text-zinc-200">{c.resident_name}</strong></span>
              <span>{c.created_at.slice(0, 10)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
