import { Suspense } from "react";
import { getAllBroadcasts } from "@/lib/data/broadcasts";
import { getAllPgs } from "@/lib/data/pgs";
import { getAllSubscriptionPlans } from "@/lib/data/subscriptions";
import {
 getPlatformBillingSettings,
 getAllSubscriptionRequests,
} from "@/lib/data/billing-settings";
import { SuperAdminDashboard } from "@/components/super-admin/SuperAdminDashboard";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminPage({
 searchParams,
}: {
 searchParams?: Promise<{ tab?: string }>;
}) {
 const resolvedParams = searchParams ? await searchParams : {};
 const tab =
 (resolvedParams?.tab as "overview" | "pgs" | "broadcast" | "billing" | "settings") ||
 "overview";

 const [broadcasts, pgs, plans, billingSettings, subscriptionRequests] = await Promise.all([
 getAllBroadcasts(),
 getAllPgs(),
 getAllSubscriptionPlans(),
 getPlatformBillingSettings(),
 getAllSubscriptionRequests(),
 ]);

 return (
 <Suspense fallback={null}>
 <SuperAdminDashboard
 pgs={pgs}
 broadcasts={broadcasts}
 plans={plans}
 billingSettings={billingSettings}
 subscriptionRequests={subscriptionRequests}
 initialTab={tab}
 />
 </Suspense>
 );
}
