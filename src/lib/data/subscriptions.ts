import { createAdminClient } from "@/lib/supabase/admin";
import {
  SubscriptionPlanItem,
  DEFAULT_SUBSCRIPTION_PLANS,
} from "@/types/subscription.types";

export * from "@/types/subscription.types";

let memoryPlans: SubscriptionPlanItem[] = [...DEFAULT_SUBSCRIPTION_PLANS];

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

      memoryPlans = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("getAllSubscriptionPlans fallback to memory:", err);
  }

  return memoryPlans;
}

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

  try {
    const admin = createAdminClient();
    await (admin.from("subscription_plans" as any) as any).upsert(planData as any, {
      onConflict: "id",
    });
  } catch (err) {
    console.warn("upsertSubscriptionPlan db error:", err);
  }

  const existingIdx = memoryPlans.findIndex((p) => p.id === planData.id);
  if (existingIdx !== -1) {
    memoryPlans[existingIdx] = planData;
  } else {
    memoryPlans.push(planData);
  }

  return planData;
}

export async function deleteSubscriptionPlan(planId: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    await (admin.from("subscription_plans" as any) as any)
      .delete()
      .eq("id", planId);
  } catch (err) {
    console.warn("deleteSubscriptionPlan db error:", err);
  }

  memoryPlans = memoryPlans.filter((p) => p.id !== planId);
  return true;
}
