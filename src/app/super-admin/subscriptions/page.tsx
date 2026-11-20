import { CreditCard, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles } from "lucide-react";
import { DEMO_TENANTS } from "@/lib/tenant/constants";
import { getAllSubscriptionPlans } from "@/lib/data/subscriptions";
import { PlanManagementModal } from "@/components/super-admin/PlanManagementModal";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminSubscriptionsPage() {
  const plans = await getAllSubscriptionPlans();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Platform Subscriptions & Plans
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            SaaS monetization, custom pricing models, and tier perks.
          </p>
        </div>

        <PlanManagementModal mode="create" />
      </div>

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-3xl border p-6 bg-white dark:bg-zinc-900 shadow-xs relative ${
              tier.badge
                ? "border-purple-300 dark:border-purple-800 ring-2 ring-purple-500/20"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {tier.badge && (
              <span className="absolute -top-3 right-6 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                {tier.badge}
              </span>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
                  {tier.name}
                </h3>
                <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-2">
                  {tier.price === 0 ? "₹0 (Free)" : `₹${tier.price.toLocaleString("en-IN")}`}
                  <span className="text-xs text-zinc-500 font-normal ml-1">
                    /{tier.billing_cycle === "14-days" ? "14 days" : tier.billing_cycle}
                  </span>
                </p>
                <p className="text-xs text-zinc-500 mt-1 font-semibold">
                  Capacity: Up to {tier.max_beds} Beds
                </p>
              </div>

              <PlanManagementModal plan={tier} mode="edit" />
            </div>

            <ul className="mt-5 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              {tier.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Subscription Ledger */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
          Organization Subscription Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Cycle</th>
                <th className="px-4 py-3">Renewal Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {DEMO_TENANTS.map((org) => (
                <tr key={org.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                    {org.name}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-purple-700 dark:text-purple-400">
                    {org.subscriptionPlan}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {org.billingCycle}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-500">
                    {org.renewalDate}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {org.subscriptionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
