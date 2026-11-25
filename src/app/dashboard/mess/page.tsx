import { Utensils, Clock, Sparkles } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getWeeklyMessMenu } from "@/lib/data/mess-menu";
import { getMealPollSummary } from "@/lib/data/meal-polls";
import { AdminMealPollCard } from "@/components/mess/AdminMealPollCard";
import { WeeklyMessExplorer } from "@/components/mess/WeeklyMessExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardMessPage() {
  const session = await getCurrentUserSession();
  const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

  const [weeklyMenu, lunchSummary, dinnerSummary] = await Promise.all([
    getWeeklyMessMenu(pgId),
    getMealPollSummary(pgId, "lunch"),
    getMealPollSummary(pgId, "dinner"),
  ]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-black text-slate-900">Mess & Dining Management</h1>
        <p className="text-xs text-slate-400">
          Live meal headcount voting, today&apos;s active menu and full 7-day weekly timetable editor
        </p>
      </div>

      {/* INTERACTIVE LUNCH & DINNER HEADCOUNT POLL CARD */}
      <AdminMealPollCard
        summary={lunchSummary}
        dinnerSummary={dinnerSummary}
        pgId={pgId}
      />

      {/* COMPREHENSIVE 7-DAY & TODAY'S MESS MENU EXPLORER WITH EDITING */}
      <WeeklyMessExplorer
        weeklyMenu={weeklyMenu}
        viewerRole={session.role}
        pgId={pgId}
      />
    </div>
  );
}
