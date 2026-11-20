import { createAdminClient } from "@/lib/supabase/admin";
import {
  SubscriptionPlanItem,
  DEFAULT_SUBSCRIPTION_PLANS,
} from "@/types/subscription.types";

export * from "@/types/subscription.types";

/**
 * Fetch all subscription plans directly from Supabase
 */
export async function getAllSubscriptionPlans(): Promise<SubscriptionPlanItem[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("subscription_plans" as any) as any)
      .select("*")
      .order("price", { ascending: true });

    if (!error && data && data.length > 0) {
      const parsed: SubscriptionPlanItem[] = (data as any[]).map((d) => ({
        id: d.id,
        name: d.name,
        price: Number(d.price) || 0,
        billing_cycle: d.billing_cycle || "monthly",
        max_beds: Number(d.max_beds) || 50,
        features: Array.isArray(d.features)
          ? d.features
          : typeof d.features === "string"
          ? JSON.parse(d.features || "[]")
          : [],
        badge: d.badge || null,
        is_active: d.is_active ?? true,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }));

      return parsed;
    }
  } catch (err) {
    console.error("getAllSubscriptionPlans database error:", err);
  }

  return [...DEFAULT_SUBSCRIPTION_PLANS];
}

/**
 * Upsert a subscription plan in Supabase
 */
export async function upsertSubscriptionPlan(
  plan: SubscriptionPlanItem
): Promise<SubscriptionPlanItem> {
  const planData = {
    id: plan.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_"),
    name: plan.name.trim(),
    price: Number(plan.price) || 0,
    billing_cycle: plan.billing_cycle || "monthly",
    max_beds: Number(plan.max_beds) || 50,
    features: plan.features || [],
    badge: plan.badge?.trim() || null,
    is_active: plan.is_active ?? true,
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  const { error } = await (admin.from("subscription_plans" as any) as any).upsert(planData as any, {
    onConflict: "id",
  });

  if (error) {
    console.error("upsertSubscriptionPlan Supabase error:", error);
    throw new Error(`Failed to save subscription plan: ${error.message}`);
  }

  return planData;
}

/**
 * Delete a subscription plan from Supabase
 */
export async function deleteSubscriptionPlan(planId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await (admin.from("subscription_plans" as any) as any)
    .delete()
    .eq("id", planId);

  if (error) {
    console.error("deleteSubscriptionPlan database error:", error);
    throw new Error(`Failed to delete subscription plan: ${error.message}`);
  }

  return true;
}
