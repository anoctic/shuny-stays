"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import { DayOfWeek, MealType } from "@/types/schema.types";
import { updateMealMenuItem, seedDefaultWeeklyMenu } from "@/lib/data/mess-menu";

/**
 * Owner / Warden Action: Update specific meal items for a day
 */
export async function updateMealMenuAction(formData: FormData) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin" && !session.is_super_admin) {
    return { error: "Unauthorized: Management access required to edit mess menu." };
  }

  const pgId = (formData.get("pg_id") as string) || session.pg_id;
  const dayOfWeek = formData.get("day_of_week") as DayOfWeek;
  const mealType = formData.get("meal_type") as MealType;
  const menuItems = formData.get("menu_items") as string;
  const isSpecial = formData.get("is_special") === "true";
  const startTime = (formData.get("start_time") as string) || undefined;
  const endTime = (formData.get("end_time") as string) || undefined;

  if (!pgId || !dayOfWeek || !mealType || !menuItems) {
    return { error: "Please fill in all required meal fields." };
  }

  try {
    await updateMealMenuItem({
      pgId,
      dayOfWeek,
      mealType,
      menuItems,
      isSpecial,
      startTime,
      endTime,
    });

    revalidatePath("/dashboard/mess");
    revalidatePath("/dashboard/meal-poll");
    revalidatePath("/tenant/mess");
    revalidatePath("/tenant");

    return {
      success: true,
      message: `${dayOfWeek.toUpperCase()} ${mealType.toUpperCase()} menu updated successfully!`,
    };
  } catch (err: any) {
    console.error("updateMealMenuAction error:", err);
    return { error: err?.message || "Failed to update menu." };
  }
}

/**
 * Owner / Warden Action: Reset / Seed complete 7-day curated menu
 */
export async function seedWeeklyMenuAction(pgIdTarget?: string) {
  const session = await getCurrentUserSession();
  if (session.role !== "owner" && session.role !== "admin" && !session.is_super_admin) {
    return { error: "Unauthorized: Management access required." };
  }

  const pgId = pgIdTarget || session.pg_id;
  if (!pgId) {
    return { error: "No active PG found for this user." };
  }

  try {
    const res = await seedDefaultWeeklyMenu(pgId);

    revalidatePath("/dashboard/mess");
    revalidatePath("/dashboard/meal-poll");
    revalidatePath("/tenant/mess");
    revalidatePath("/tenant");

    return {
      success: true,
      message: `Standard 7-Day Royal Mess Menu applied across all 28 meal slots!`,
    };
  } catch (err: any) {
    console.error("seedWeeklyMenuAction error:", err);
    return { error: err?.message || "Failed to seed menu." };
  }
}
