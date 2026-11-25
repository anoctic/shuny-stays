import { Utensils, Clock } from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getWeeklyMessMenu } from "@/lib/data/mess-menu";
import { getTenantMealPollStatus } from "@/lib/data/meal-polls";
import { TenantMealPollCard } from "@/components/mess/TenantMealPollCard";
import { WeeklyMessExplorer } from "@/components/mess/WeeklyMessExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantMessPage() {
  const session = await getCurrentUserSession();
  const pgId = session.pg_id || "23594b9e-da90-4884-95aa-5f978d91a0d2";

  const [weeklyMenu, lunchPollStatus, dinnerPollStatus] = await Promise.all([
    getWeeklyMessMenu(pgId),
    getTenantMealPollStatus(pgId, session.id, "lunch"),
    getTenantMealPollStatus(pgId, session.id, "dinner"),
  ]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-black text-slate-900">Mess & Dining Schedule</h1>
        <p className="text-xs text-slate-400">
          Vote for today&apos;s meals, view today&apos;s live menu and the complete 7-day weekly timetable
        </p>
      </div>

      {/* TENANT MEAL HEADCOUNT POLL CARD (LUNCH & DINNER) */}
      {(lunchPollStatus.poll || dinnerPollStatus.poll) && (
        <TenantMealPollCard
          poll={lunchPollStatus.poll || null}
          dinnerPoll={dinnerPollStatus.poll || null}
          isCutoffPassed={lunchPollStatus.isCutoffPassed}
          dinnerIsCutoffPassed={dinnerPollStatus.isCutoffPassed}
          initialVote={lunchPollStatus.tenantVote}
          dinnerInitialVote={dinnerPollStatus.tenantVote}
          tenantId={session.id}
          scheduleStatus={lunchPollStatus.scheduleStatus}
          dinnerScheduleStatus={dinnerPollStatus.scheduleStatus}
        />
      )}

      {/* COMPREHENSIVE 7-DAY & TODAY'S MESS MENU EXPLORER */}
      <WeeklyMessExplorer
        weeklyMenu={weeklyMenu}
        viewerRole="tenant"
        pgId={pgId}
      />
    </div>
  );
}
