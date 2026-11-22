import { Utensils } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getMealPollSummary, getMealPollHistory } from "@/lib/data/meal-polls";
import { AdminMealPollCard } from "@/components/mess/AdminMealPollCard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardMealPollPage() {
  const session = await getCurrentUserSession();
  const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

  const [pollSummary, history] = await Promise.all([
    getMealPollSummary(pgId, "lunch"),
    getMealPollHistory(pgId, 30),
  ]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Utensils className="w-5 h-5 text-amber-500" />
          <span>Lunch Headcount & Meal Poll</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Automated schedule, live resident headcount, and zero food waste management
        </p>
      </div>

      {/* DEDICATED MEAL POLL CARD WITH HISTORY */}
      <AdminMealPollCard summary={pollSummary} history={history} pgId={pgId} />
    </div>
  );
}
