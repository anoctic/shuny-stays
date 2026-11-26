"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Flame,
  Zap,
} from "lucide-react";
import { MealPoll } from "@/types/meal-poll.types";
import { voteMealPollAction } from "@/app/actions/meal-polls";

interface TenantMealPollCardProps {
  poll: MealPoll | null;
  dinnerPoll?: MealPoll | null;
  isCutoffPassed: boolean;
  dinnerIsCutoffPassed?: boolean;
  initialVote: "yes" | "no" | null;
  dinnerInitialVote?: "yes" | "no" | null;
  tenantId: string;
  scheduleStatus?: "upcoming" | "open" | "closed";
  dinnerScheduleStatus?: "upcoming" | "open" | "closed";
}

export function TenantMealPollCard({
  poll,
  dinnerPoll,
  isCutoffPassed,
  dinnerIsCutoffPassed = false,
  initialVote,
  dinnerInitialVote = null,
  tenantId,
  scheduleStatus = isCutoffPassed ? "closed" : "open",
  dinnerScheduleStatus = dinnerIsCutoffPassed ? "closed" : "open",
}: TenantMealPollCardProps) {
  const router = useRouter();
  // Auto-select dinner after 12:00 PM IST if dinner poll is available
  const [selectedMeal, setSelectedMeal] = useState<"lunch" | "dinner">(() => {
    if (!dinnerPoll) return "lunch";
    if (!poll) return "dinner";
    const currentHour = new Date().getHours();
    return currentHour >= 12 ? "dinner" : "lunch";
  });

  const [lunchVote, setLunchVote] = useState<"yes" | "no" | null>(initialVote);
  const [dinnerVote, setDinnerVote] = useState<"yes" | "no" | null>(dinnerInitialVote);
  const [pendingChoice, setPendingChoice] = useState<"yes" | "no" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLunchVote(initialVote);
  }, [initialVote]);

  useEffect(() => {
    setDinnerVote(dinnerInitialVote);
  }, [dinnerInitialVote]);

  const activePoll = selectedMeal === "dinner" ? dinnerPoll : poll;
  const activeCutoffPassed = selectedMeal === "dinner" ? dinnerIsCutoffPassed : isCutoffPassed;
  const activeScheduleStatus = selectedMeal === "dinner" ? dinnerScheduleStatus : scheduleStatus;
  const currentVote = selectedMeal === "dinner" ? dinnerVote : lunchVote;

  if (!poll && !dinnerPoll) {
    return null;
  }

  const isDinner = selectedMeal === "dinner";
  const startTime = activePoll?.start_time || (isDinner ? "16:00" : "06:00");
  const cutoffTime = activePoll?.cutoff_time || (isDinner ? "19:00" : "10:00");
  const isUpcoming = activeScheduleStatus === "upcoming";
  const canVote = (activePoll?.is_active ?? true) && !activeCutoffPassed && activeScheduleStatus === "open";

  const formatDisplayTime = (timeStr: string) => {
    const [h, m] = (timeStr || "10:00").split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m < 10 ? "0" + m : m} ${suffix}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleVote = async (choice: "yes" | "no") => {
    if (!activePoll || !canVote || isSubmitting) return;

    if (isDinner) {
      setDinnerVote(choice);
    } else {
      setLunchVote(choice);
    }
    setPendingChoice(null);
    setIsSubmitting(true);

    try {
      const res = await voteMealPollAction(activePoll.id, choice, tenantId);
      if (res.error) {
        showToast(`Error: ${res.error}`);
        if (isDinner) setDinnerVote(dinnerInitialVote);
        else setLunchVote(initialVote);
      } else {
        showToast(
          choice === "yes"
            ? `✅ Confirmed! Aapne aaj ke ${isDinner ? "Dinner" : "Lunch"} ke liye "Haan, Khana Hai" opt kiya hai. Owner portal par live sync ho gaya!`
            : `✅ Confirmed! Aapne aaj ke ${isDinner ? "Dinner" : "Lunch"} ke liye "Nahi Khana" opt kiya hai.`
        );
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to submit vote"}`);
      if (isDinner) setDinnerVote(dinnerInitialVote);
      else setLunchVote(initialVote);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 border border-amber-200/90 shadow-sm space-y-3.5">
      {/* MEAL SWITCHER TABS (LUNCH / DINNER) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl w-full select-none">
        <button
          type="button"
          onClick={() => setSelectedMeal("lunch")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
            selectedMeal === "lunch"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>☀️ Dopahar (Lunch)</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedMeal("dinner")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
            selectedMeal === "dinner"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🌙 Raat (Dinner 4–7 PM)</span>
        </button>
      </div>

      {/* HEADER ROW */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-2xl ${isDinner ? "bg-indigo-600" : "bg-amber-500"} text-white flex items-center justify-center font-black shrink-0 shadow-xs`}>
            <Utensils className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
              {isDinner ? "Raat Ka Khana (Dinner Poll)" : "Dopahar Ka Khana (Lunch Poll)"}
            </h3>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>
                Window: <strong>{formatDisplayTime(startTime)} – {formatDisplayTime(cutoffTime)}</strong>
              </span>
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider shrink-0 border ${
            isUpcoming
              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
              : canVote
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {isUpcoming
            ? `Opens at ${formatDisplayTime(startTime)}`
            : canVote
            ? "Voting Open"
            : "Poll Closed"}
        </span>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-2xl bg-white border border-amber-300 text-slate-900 text-xs font-bold animate-in fade-in flex items-center gap-2 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UPCOMING STATE (BEFORE START TIME) */}
      {isUpcoming ? (
        <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
          <div className="font-extrabold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Poll {formatDisplayTime(startTime)} par open hoga</span>
          </div>
          <p className="text-[11px] text-indigo-700 font-normal">
            Aap shaam {formatDisplayTime(startTime)} se {formatDisplayTime(cutoffTime)} ke beech me {isDinner ? "dinner" : "lunch"} ke liye apna YES ya NO vote submit kar sakenge.
          </p>
        </div>
      ) : canVote ? (
        /* VOTING STATE */
        <div className="space-y-3">
          <p className="text-xs text-slate-700 font-medium">
            Kya aap aaj PG me {isDinner ? "dinner" : "lunch"} khayenge? Please vote before <strong>{formatDisplayTime(cutoffTime)}</strong>:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* YES BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setPendingChoice("yes")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${
                currentVote === "yes"
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30"
                  : pendingChoice === "yes"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-300"
                  : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <CheckCircle2 className={`w-4 h-4 ${currentVote === "yes" ? "text-white" : "text-emerald-600"}`} />
                <span>Haan, Khana Hai</span>
              </div>
              <span className={`text-[10px] ${currentVote === "yes" ? "text-emerald-100 font-bold" : "text-slate-400"}`}>
                {currentVote === "yes" ? "✓ Confirmed Eating" : "Tap to Opt In (YES)"}
              </span>
            </button>

            {/* NO BUTTON */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setPendingChoice("no")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${
                currentVote === "no"
                  ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/30"
                  : pendingChoice === "no"
                  ? "bg-rose-50 text-rose-900 border-rose-400 ring-2 ring-rose-300"
                  : "bg-white text-slate-800 border-slate-200 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                <XCircle className={`w-4 h-4 ${currentVote === "no" ? "text-white" : "text-rose-600"}`} />
                <span>Nahi Khana</span>
              </div>
              <span className={`text-[10px] ${currentVote === "no" ? "text-rose-100 font-bold" : "text-slate-400"}`}>
                {currentVote === "no" ? "✓ Opted Out" : "Tap to Skip (NO)"}
              </span>
            </button>
          </div>

          {/* CONFIRMATION STEP PROMPT */}
          {pendingChoice && (
            <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-2.5 shadow-lg border border-slate-700 animate-in fade-in">
              <div className="text-xs font-extrabold flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-amber-300 text-[10px] uppercase tracking-wider">
                    Confirm Your Choice
                  </div>
                  <p className="mt-0.5 leading-snug">
                    {pendingChoice === "yes"
                      ? `Haan, aap aaj ke ${isDinner ? "Dinner (Raat ka Khana)" : "Lunch (Dopahar ka Khana)"} ke liye "Khana Khaunga (YES)" opt kar rahe hain. Confirm karein?`
                      : `Aap aaj ke ${isDinner ? "Dinner (Raat ka Khana)" : "Lunch (Dopahar ka Khana)"} ko "Nahi Khana (NO)" opt kar rahe hain. Confirm karein?`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingChoice(null)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleVote(pendingChoice)}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black transition shadow-sm ${
                    pendingChoice === "yes"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-rose-500 hover:bg-rose-400 text-white"
                  }`}
                >
                  {isSubmitting ? "Saving..." : pendingChoice === "yes" ? "✓ Confirm Khana Hai" : "✓ Confirm Nahi Khana"}
                </button>
              </div>
            </div>
          )}

          {/* PERSISTENT CONFIRMATION BANNER */}
          {!pendingChoice && currentVote && (
            <div
              className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                currentVote === "yes"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {currentVote === "yes" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>
                {currentVote === "yes"
                  ? `Confirmed: Aapne aaj ke ${isDinner ? "Dinner" : "Lunch"} ke liye "Haan, Khana Hai" opt kiya hai.`
                  : `Confirmed: Aapne aaj ke ${isDinner ? "Dinner" : "Lunch"} ke liye "Nahi Khana" opt kiya hai.`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-0.5">
            <span>Aap {formatDisplayTime(cutoffTime)} se pehle apna vote change kar sakte hain.</span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" /> Zero Wastage
            </span>
          </div>
        </div>
      ) : (
        /* CLOSED STATE */
        <div className="space-y-2 pt-1">
          <div className="p-3 rounded-2xl border text-xs font-bold flex items-start gap-2.5">
            {currentVote === "yes" ? (
              <div className="w-full flex items-start gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne YES vote kiya tha</div>
                  <div className="text-[11px] font-normal text-emerald-700 mt-0.5">
                    Aapka {isDinner ? "dinner" : "lunch"} confirm ho chuka hai. Khana {isDinner ? "8:30 PM" : "12:30 PM"} par mess me serve hoga.
                  </div>
                </div>
              </div>
            ) : currentVote === "no" ? (
              <div className="w-full flex items-start gap-2 text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne NO vote kiya tha</div>
                  <div className="text-[11px] font-normal text-rose-700 mt-0.5">
                    Aapka {isDinner ? "dinner" : "lunch"} skip kar diya gaya hai.
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-start gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-xs">Aapne vote nahi kiya tha</div>
                  <div className="text-[11px] font-normal text-amber-700 mt-0.5">
                    {formatDisplayTime(cutoffTime)} deadline nikal chuki hai. Food wastage rokne ke liye aapka vote automatically <strong>NO (Not Eating)</strong> mark kiya gaya hai.
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
