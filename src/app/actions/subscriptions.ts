"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import {
  SubscriptionPlanItem,
  upsertSubscriptionPlan,
  deleteSubscriptionPlan,
} from "@/lib/data/subscriptions";

/**
 * Super Admin Action: Save or update a subscription / membership plan
 */
export async function saveSubscriptionPlanAction(plan: SubscriptionPlanItem) {
  const session = await getCurrentUserSession();

  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  if (!plan.id || !plan.name) {
    return { error: "Plan ID and Name are required." };
  }

  try {
    const saved = await upsertSubscriptionPlan(plan);
    revalidatePath("/super-admin");
    revalidatePath("/super-admin/subscriptions");
    return { success: true, plan: saved };
  } catch (err: any) {
    return { error: err?.message || "Failed to save subscription plan." };
  }
}

/**
 * Super Admin Action: Delete a subscription plan
 */
export async function deleteSubscriptionPlanAction(planId: string) {
  const session = await getCurrentUserSession();

  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  if (!planId) {
    return { error: "Plan ID is required." };
  }

  try {
    await deleteSubscriptionPlan(planId);
    revalidatePath("/super-admin");
    revalidatePath("/super-admin/subscriptions");
    return { success: true, planId };
  } catch (err: any) {
    return { error: err?.message || "Failed to delete subscription plan." };
  }
}
