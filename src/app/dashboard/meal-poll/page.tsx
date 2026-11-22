import { Utensils, Clock, Flame, ShieldAlert } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getMealPollSummary } from "@/lib/data/meal-polls";
import { AdminMealPollCard } from "@/components/mess/AdminMealPollCard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardMealPollPage() {
  const session = await getCurrentUserSession();
  const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

  const pollSummary = await getMealPollSummary(pgId, "lunch");

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-500" />
            <span>Lunch Headcount & Meal Poll</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-starts at 06:00 AM daily • 10:00 AM Cut-off • Zero Food Wastage
          </p>
        </div>
      </div>

      {/* DEDICATED MEAL POLL CARD & 3-SECTION REPORT */}
      <AdminMealPollCard summary={pollSummary} pgId={pgId} />
    </div>
  );
}
