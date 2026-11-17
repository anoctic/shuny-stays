import { Plus, Wrench, Wifi, Droplets, Zap, CheckCircle2, Clock } from "lucide-react";
import { MOCK_COMPLAINTS } from "@/lib/mock-data";

export default function ComplaintsPage() {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "wifi":
        return <Wifi className="h-4 w-4 text-cyan-500" />;
      case "plumbing":
        return <Droplets className="h-4 w-4 text-blue-500" />;
      case "electrical":
        return <Zap className="h-4 w-4 text-amber-500" />;
      default:
        return <Wrench className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Maintenance & Complaints
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Track and resolve resident issues: plumbing, Wi-Fi, electricity, and room fixtures.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors">
          <Plus className="h-4 w-4" />
          Log Issue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_COMPLAINTS.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  {getCategoryIcon(c.category)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {c.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {c.property_name} • Reported by {c.resident_name}
                  </p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                  c.status === "open"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                }`}
              >
                {c.status.replace("_", " ")}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-lg">
              {c.description}
            </p>

            <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Reported: {new Date(c.created_at).toLocaleDateString()}
              </span>
              {c.assigned_to && (
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Assigned: {c.assigned_to}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
