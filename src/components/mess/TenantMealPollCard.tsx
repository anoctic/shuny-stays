"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Flame,
  Check,
} from "lucide-react";
import { MealPoll } from "@/types/meal-poll.types";
import { voteMealPollAction } from "@/app/actions/meal-polls";

interface TenantMealPollCardProps {
  poll: MealPoll | null;
  isCutoffPassed: boolean;
  initialVote: "yes" | "no" | null;
  tenantId: string;
}

export function TenantMealPollCard({
  poll,
  isCutoffPassed,
  initialVote,
  tenantId,
}: TenantMealPollCardProps) {
  const router = useRouter();
  const [currentVote, setCurrentVote] = useState<"yes" | "no" | null>(initialVote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!poll || !poll.is_active) {
    return null;
  }

  const cutoffTime = poll.cutoff_time || "10:00";
  const canVote = poll.is_active && !isCutoffPassed;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleVote = async (choice: "yes" | "no") => {
    if (!canVote || isSubmitting) return;

    // Optimistic UI update
    setCurrentVote(choice);
    setIsSubmitting(true);

    try {
      const res = await voteMealPollAction(poll.id, choice, tenantId);
      if (res.error) {
        showToast(`Error: ${res.error}`);
        setCurrentVote(initialVote);
      } else {
        showToast(
          choice === "yes"
            ? "✅ Lunch confirmed for today!"
            : "❌ Noted: You are skipping lunch today."
        );
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to submit vote"}`);
      setCurrentVote(initialVote);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 border border-amber-200/90 dark:border-amber-800/60 shadow-sm space-y-3.5">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
              Dopahar Ka Khana (Lunch Poll)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Cut-off Deadline: <strong>{cutoffTime} AM IST</strong></span>
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider shrink-0 border ${
            canVote
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {canVote ? "Voting Open" : "Poll Closed"}
        </span>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-300 text-slate-900 dark:text-white text-xs font-bold animate-in fade-in flex items-center gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VOTING STATE (BEFORE 10:00 AM) */}
      {canVote ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Kya aap aaj PG me lunch khayenge? Please vote before <strong>{cutoffTime} AM</strong>:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* YES BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVote("yes")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-xs ${
                currentVote === "yes"
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <CheckCircle2 className={`w-4 h-4 ${currentVote === "yes" ? "text-white" : "text-emerald-600"}`} />
                <span>Haan, Khana Hai</span>
              </div>
              <span className={`text-[10px] ${currentVote === "yes" ? "text-emerald-100 font-bold" : "text-slate-400"}`}>
                {currentVote === "yes" ? "✓ Confirmed Eating" : "Tap to Vote YES"}
              </span>
            </button>

            {/* NO BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleVote("no")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-xs ${
                currentVote === "no"
                  ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/30"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <XCircle className={`w-4 h-4 ${currentVote === "no" ? "text-white" : "text-rose-600"}`} />
                <span>Nahi Khana</span>
              </div>
              <span className={`text-[10px] ${currentVote === "no" ? "text-rose-100 font-bold" : "text-slate-400"}`}>
                {currentVote === "no" ? "✓ Opted Out" : "Tap to Vote NO"}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-0.5">
            <span>Aap {cutoffTime} AM se pehle apna vote change kar sakte hain.</span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" /> Zero Wastage
            </span>
          </div>
        </div>
      ) : (
        /* CLOSED STATE (AFTER 10:00 AM) */
        <div className="space-y-2 pt-1">
          <div className="p-3 rounded-2xl border text-xs font-bold flex items-start gap-2.5">
            {currentVote === "yes" ? (
              <div className="w-full flex items-start gap-2 text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne YES vote kiya tha</div>
                  <div className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Aapka dopahar ka lunch confirm ho chuka hai. Khana 12:30 PM par mess me serve hoga.
                  </div>
                </div>
              </div>
            ) : currentVote === "no" ? (
              <div className="w-full flex items-start gap-2 text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne NO vote kiya tha</div>
                  <div className="text-[11px] font-normal text-rose-700 dark:text-rose-300 mt-0.5">
                    Aapka lunch skip kar diya gaya hai.
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-start gap-2 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne vote nahi kiya tha</div>
                  <div className="text-[11px] font-normal text-amber-700 dark:text-amber-300 mt-0.5">
                    {cutoffTime} AM cut-off tak vote na aane par food wastage rokne ke liye rule ke mutabiq aapka vote automatically <strong>NO (Not Eating)</strong> mark kiya gaya hai.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
