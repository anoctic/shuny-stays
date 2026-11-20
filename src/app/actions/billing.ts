"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import {
  PlatformBillingSettings,
  updatePlatformBillingSettings,
  submitPgRenewalRequest,
  reviewSubscriptionRequest,
  updatePgPlanDetails,
} from "@/lib/data/billing-settings";

/**
 * Super Admin Action: Save or update platform UPI & bank account settings
 */
export async function savePlatformBillingSettingsAction(settings: Partial<PlatformBillingSettings>) {
  const session = await getCurrentUserSession();
  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  try {
    const updated = await updatePlatformBillingSettings(settings);
    revalidatePath("/super-admin");
    revalidatePath("/dashboard");
    return { success: true, settings: updated };
  } catch (err: any) {
    return { error: err?.message || "Failed to save billing settings." };
  }
}

/**
 * PG Owner or PG Admin Action: Submit UTR renewal reference
 */
export async function submitPgRenewalUtrAction(
  pgId: string,
  pgName: string,
  utrNumber: string,
  amount: number
) {
  const session = await getCurrentUserSession();
  if (!session.id) {
    return { error: "Please log in to submit renewal payment." };
  }

  try {
    const request = await submitPgRenewalRequest({
      pgId,
      pgName,
      utrNumber,
      amount,
      submittedByUserId: session.id,
      submittedByName: session.full_name || "PG Administrator",
      submittedByRole: session.role || "owner",
    });

    revalidatePath("/dashboard");
    revalidatePath("/super-admin");
    return { success: true, request };
  } catch (err: any) {
    return { error: err?.message || "Failed to submit renewal UTR." };
  }
}

/**
 * Super Admin Action: Review (Approve / Reject) PG renewal request
 */
export async function reviewPgRenewalRequestAction(
  requestId: string,
  action: "approve" | "reject",
  rejectionReason?: string
) {
  const session = await getCurrentUserSession();
  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  try {
    const res = await reviewSubscriptionRequest(requestId, action, session.id, rejectionReason);
    revalidatePath("/super-admin");
    revalidatePath("/dashboard");
    return res;
  } catch (err: any) {
    return { error: err?.message || "Failed to review subscription request." };
  }
}

/**
 * Super Admin Action: Edit PG's specific expiry date, price, or benefits
 */
export async function updatePgPlanDetailsAction(
  pgId: string,
  planExpiresAt: string,
  planPrice: number,
  planBenefits?: string[]
) {
  const session = await getCurrentUserSession();
  if (session.role !== "super_admin") {
    return { error: "Unauthorized: Super Admin access required." };
  }

  try {
    await updatePgPlanDetails(pgId, planExpiresAt, planPrice, planBenefits);
    revalidatePath("/super-admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to update PG plan details." };
  }
}
