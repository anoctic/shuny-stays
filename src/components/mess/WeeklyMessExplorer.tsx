"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  Sparkles,
  Calendar,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  Sunrise,
  Edit3,
  RotateCcw,
  CheckCircle2,
  X,
  Flame,
  LayoutGrid,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import {
  WeeklyMessMenu,
  DayMenuPlan,
  MealSlot,
  DAYS_ORDER,
  DAY_METADATA,
} from "@/lib/data/mess-menu";
import { DayOfWeek, MealType, UserRole } from "@/types/schema.types";
import { updateMealMenuAction, seedWeeklyMenuAction } from "@/app/actions/mess-menu";

interface WeeklyMessExplorerProps {
  weeklyMenu: WeeklyMessMenu;
  viewerRole: UserRole;
  pgId?: string;
}

const MEAL_ICONS: Record<MealType, any> = {
  breakfast: Sunrise,
  lunch: Sun,
  snacks: Coffee,
  dinner: Moon,
};

const MEAL_COLORS: Record<MealType, { border: string; bg: string; text: string; badge: string }> = {
  breakfast: {
    border: "border-amber-200",
    bg: "bg-amber-50/50",
    text: "text-amber-900",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
  },
  lunch: {
    border: "border-orange-200",
    bg: "bg-orange-50/50",
    text: "text-orange-900",
    badge: "bg-orange-100 text-orange-800 border-orange-300",
  },
  snacks: {
    border: "border-teal-200",
    bg: "bg-teal-50/50",
    text: "text-teal-900",
    badge: "bg-teal-100 text-teal-800 border-teal-300",
  },
  dinner: {
    border: "border-indigo-200",
    bg: "bg-indigo-50/50",
    text: "text-indigo-900",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
};

export function WeeklyMessExplorer({
  weeklyMenu,
  viewerRole,
  pgId,
}: WeeklyMessExplorerProps) {
  const router = useRouter();

  // Currently inspected day in Day-by-Day mode (defaults to Today)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(weeklyMenu.currentDay);

  // View Mode: "day_view" (tabbed) or "full_week" (7-day grid)
  const [viewMode, setViewMode] = useState<"day_view" | "full_week">("day_view");

  // Edit Modal State (Management only)
  const [editingMeal, setEditingMeal] = useState<{
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    title: string;
    items: string;
    time: string;
    isSpecial: boolean;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isManagement = viewerRole === "owner" || viewerRole === "admin";
  const activeDayPlan = weeklyMenu.daysMap[selectedDay] || weeklyMenu.today;

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMeal) return;

    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("pg_id", pgId || weeklyMenu.pgId || "");
    fd.set("day_of_week", editingMeal.dayOfWeek);
    fd.set("meal_type", editingMeal.mealType);

    try {
      const res = await updateMealMenuAction(fd);
      if (res?.error) {
        showToast(`Error: ${res.error}`);
      } else {
        showToast("✅ Meal menu updated successfully!");
        setEditingMeal(null);
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to update"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetWeeklyMenu = async () => {
    if (!confirm("Are you sure you want to apply the standard 7-day curated Royal Mess Menu across all 28 slots?")) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await seedWeeklyMenuAction(pgId || weeklyMenu.pgId);
      if (res?.error) {
        showToast(`Error: ${res.error}`);
      } else {
        showToast("✅ Standard 7-Day Royal Menu applied!");
        router.refresh();
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || "Failed to reset"}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-slate-700 backdrop-blur-md animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: AAJ KA MENU (TODAY'S HIGHLIGHTED LIVE MENU)                     */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span>Aaj Ka Menu (Today&apos;s Live Menu)</span>
            </h2>
          </div>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {weeklyMenu.formattedDateIST}
          </span>
        </div>

        {/* Hero Card for Today */}
        <div className="rounded-3xl border-2 border-indigo-200/90 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
          {/* Subtle Ambient Background Watermark */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 border-b border-indigo-100 pb-3 relative z-10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 block">
                Today&apos;s Special Timetable
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {weeklyMenu.today.dayLabel} ({weeklyMenu.today.dayLabelHindi})
              </h3>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                Active: {weeklyMenu.today.meals[weeklyMenu.currentActiveMealType]?.title || "Dining"}
              </span>
            </div>
          </div>

          {/* Today's 4 Meals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
            {(["breakfast", "lunch", "snacks", "dinner"] as MealType[]).map((mType) => {
              const meal = weeklyMenu.today.meals[mType];
              const Icon = MEAL_ICONS[mType];
              const color = MEAL_COLORS[mType];
              const isActiveNow = weeklyMenu.currentActiveMealType === mType;

              return (
                <div
                  key={`today-${mType}`}
                  className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    isActiveNow
                      ? "bg-white border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-white/90 border-slate-200/90 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-7 h-7 rounded-xl ${color.bg} ${color.text} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight">
                            {meal.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            {meal.titleHindi}
                          </span>
                        </div>
                      </div>

                      {isActiveNow ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Active Now
                        </span>
                      ) : meal.isSpecial ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 shrink-0 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-600" />
                          Special
                        </span>
                      ) : null}
                    </div>

                    {/* Meal Timings */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold pt-0.5">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{meal.time}</span>
                    </div>

                    {/* Food Items Description */}
                    <p className="text-xs text-slate-800 font-medium pt-1.5 leading-relaxed">
                      {meal.items}
                    </p>
                  </div>

                  {/* Owner Edit Button on slot */}
                  {isManagement && (
                    <div className="pt-3 mt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingMeal({
                            dayOfWeek: weeklyMenu.today.dayOfWeek,
                            mealType: mType,
                            title: meal.title,
                            items: meal.items,
                            time: meal.time,
                            isSpecial: Boolean(meal.isSpecial),
                          })
                        }
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: POORE WEEK KA MENU (FULL 7-DAY TIMETABLE)                      */}
      {/* ========================================================================= */}
      <section className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between gap-3 flex-wrap px-0.5">
          <div className="space-y-0.5">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Poore Week Ka Menu (Full 7-Day Timetable)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Monday to Sunday meal timetable for this property
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("day_view")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "day_view"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Day-by-Day</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("full_week")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === "full_week"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Full 7-Day Grid</span>
              </button>
            </div>

            {/* Management Reset Seed Button */}
            {isManagement && (
              <button
                type="button"
                onClick={handleResetWeeklyMenu}
                disabled={isResetting}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                title="Apply standard chef curated 7-day menu"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Apply 7-Day Royal Menu</span>
              </button>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* VIEW A: DAY-BY-DAY TABBED SELECTOR                                      */}
        {/* ----------------------------------------------------------------------- */}
        {viewMode === "day_view" && (
          <div className="space-y-4">
            {/* Day Selector Pill Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar select-none">
              {DAYS_ORDER.map((dayKey) => {
                const meta = DAY_METADATA[dayKey];
                const isSelected = selectedDay === dayKey;
                const isToday = weeklyMenu.currentDay === dayKey;

                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => setSelectedDay(dayKey)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <span>{meta.label}</span>
                    <span className={`text-[10px] font-semibold opacity-80 ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                      ({meta.short})
                    </span>
                    {isToday && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase ${
                        isSelected ? "bg-amber-400 text-slate-950" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        Aaj
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day's 4 Meals Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {activeDayPlan.dayLabel} ({activeDayPlan.dayLabelHindi})
                  </h3>
                  {activeDayPlan.isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Today&apos;s Menu
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-semibold">
                  4 Scheduled Meals
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {(["breakfast", "lunch", "snacks", "dinner"] as MealType[]).map((mType) => {
                  const meal = activeDayPlan.meals[mType];
                  const Icon = MEAL_ICONS[mType];
                  const color = MEAL_COLORS[mType];

                  return (
                    <div
                      key={`${selectedDay}-${mType}`}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-xl ${color.bg} ${color.text} flex items-center justify-center shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-slate-900">
                              {meal.title}
                            </span>
                          </div>

                          {meal.isSpecial && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                              Special
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{meal.time}</span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed pt-1">
                          {meal.items}
                        </p>
                      </div>

                      {isManagement && (
                        <div className="pt-3 mt-3 border-t border-slate-200/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingMeal({
                                dayOfWeek: selectedDay,
                                mealType: mType,
                                title: meal.title,
                                items: meal.items,
                                time: meal.time,
                                isSpecial: Boolean(meal.isSpecial),
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Dish</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* VIEW B: FULL 7-DAY GRID (ALL DAYS AT A GLANCE)                          */}
        {/* ----------------------------------------------------------------------- */}
        {viewMode === "full_week" && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4 w-32">Day</th>
                    <th className="py-3 px-3">Breakfast (07:30 - 09:30)</th>
                    <th className="py-3 px-3">Lunch (12:30 - 02:30)</th>
                    <th className="py-3 px-3">Snacks (05:00 - 06:15)</th>
                    <th className="py-3 px-3">Dinner (08:00 - 10:00)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {weeklyMenu.days.map((dayPlan) => {
                    const isToday = dayPlan.dayOfWeek === weeklyMenu.currentDay;

                    return (
                      <tr
                        key={`row-${dayPlan.dayOfWeek}`}
                        className={`transition ${
                          isToday
                            ? "bg-indigo-50/60 font-medium"
                            : "hover:bg-slate-50/70"
                        }`}
                      >
                        {/* Day Column */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-0.5">
                            <span className="font-black text-slate-900 block">
                              {dayPlan.dayLabel}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              {dayPlan.dayLabelHindi}
                            </span>
                            {isToday && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-600 text-white">
                                Today
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4 Meal Columns */}
                        {(["breakfast", "lunch", "snacks", "dinner"] as MealType[]).map((mType) => {
                          const meal = dayPlan.meals[mType];

                          return (
                            <td key={`cell-${dayPlan.dayOfWeek}-${mType}`} className="py-3 px-3 align-top">
                              <div className="space-y-1">
                                {meal.isSpecial && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                    <Sparkles className="w-2.5 h-2.5" /> Special
                                  </span>
                                )}
                                <p className="text-slate-800 text-[11px] leading-snug">
                                  {meal.items}
                                </p>
                                {isManagement && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingMeal({
                                        dayOfWeek: dayPlan.dayOfWeek,
                                        mealType: mType,
                                        title: meal.title,
                                        items: meal.items,
                                        time: meal.time,
                                        isSpecial: Boolean(meal.isSpecial),
                                      })
                                    }
                                    className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 pt-0.5"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" /> Edit
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* EDIT MEAL MODAL (MANAGEMENT ONLY)                                         */}
      {/* ========================================================================= */}
      {editingMeal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-[440px] rounded-3xl border border-slate-200 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Edit {editingMeal.dayOfWeek.toUpperCase()} {editingMeal.title}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Update dishes and timings for this meal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingMeal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Menu Dishes & Items
                </label>
                <textarea
                  name="menu_items"
                  defaultValue={editingMeal.items}
                  rows={3}
                  required
                  placeholder="e.g. Paneer Butter Masala, Dal Makhani, Steamed Rice, Roti & Salad"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_special"
                  name="is_special"
                  value="true"
                  defaultChecked={editingMeal.isSpecial}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_special" className="text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mark as Special Feast Dish (हाइलाइट करें)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
                >
                  {isSaving ? "Saving Menu..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
