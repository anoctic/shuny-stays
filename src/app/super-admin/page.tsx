import { cookies } from "next/headers";
import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  Activity,
  HardDrive,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import { DEMO_TENANTS } from "@/lib/tenant/constants";
import { MOCK_PROPERTIES, MOCK_CLUSTER_STATS } from "@/lib/mock-data";
import { CreateOrgModal } from "@/components/super-admin/CreateOrgModal";
import { enterViewAsOrgAction, exitViewAsOrgAction } from "@/app/actions/auth";
import { formatINR } from "@/lib/utils";

export default async function SuperAdminOverviewPage() {
  const cookieStore = await cookies();
  const viewingOrgId = cookieStore.get("pg_active_tenant_id")?.value;
  const viewingOrg = viewingOrgId
    ? DEMO_TENANTS.find((t) => t.id === viewingOrgId)
    : null;

  // Platform Aggregates ONLY (across all organizations)
  const totalOrgs = DEMO_TENANTS.length;
  const totalProperties = DEMO_TENANTS.reduce((sum, t) => sum + t.propertiesCount, 0);
  const totalResidents = DEMO_TENANTS.reduce((sum, t) => sum + (t.residentsCount || 3), 0);
  const activeSubs = DEMO_TENANTS.filter((t) => t.subscriptionStatus === "active").length;

  return (
    <div className="space-y-8">
      {/* Platform Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Platform Overview & Governance
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Global metrics across all hosted PG organizations and tenant databases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CreateOrgModal />
          <Link
            href="/super-admin/database"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <Database className="h-3.5 w-3.5 text-purple-600" />
            SQL Console
          </Link>
        </div>
      </div>

      {/* Platform Aggregates (Platform-Level Data ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Orgs */}
        <div className="rounded-2xl border border-purple-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              PG Organizations
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalOrgs}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Active Tenants</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Multi-tenant PostgreSQL isolation</p>
        </div>

        {/* Metric 2: Subscriptions */}
        <div className="rounded-2xl border border-purple-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Subscriptions
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {activeSubs}
            </span>
            <span className="text-xs text-zinc-500 font-medium">/ {totalOrgs} Paid</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            100% Platform billing active
          </p>
        </div>

        {/* Metric 3: Total Properties */}
        <div className="rounded-2xl border border-purple-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Total Properties
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HardDrive className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalProperties}
            </span>
            <span className="text-xs text-zinc-500">Hostels / Coliving</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Across Bengaluru & Hyderabad</p>
        </div>

        {/* Metric 4: Platform Health */}
        <div className="rounded-2xl border border-purple-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Platform Health
            </span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600">
              99.98%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Optimal</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 font-mono">
            Uptime • {MOCK_CLUSTER_STATS.activeConnections} active DB pools
          </p>
        </div>
      </div>

      {/* Organizations List (PG Owners) Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Registered Organizations (PG Owners)
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Click &apos;View as Organization&apos; to inspect a specific PG owner&apos;s operational data.
            </p>
          </div>
          <CreateOrgModal />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Organization</th>
                <th className="px-6 py-3.5">City / Contact</th>
                <th className="px-6 py-3.5">Subscription Plan</th>
                <th className="px-6 py-3.5">Properties</th>
                <th className="px-6 py-3.5">Residents</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {DEMO_TENANTS.map((org) => {
                const isCurrentViewing = viewingOrgId === org.id;

                return (
                  <tr
                    key={org.id}
                    className={`hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                      isCurrentViewing ? "bg-purple-50/50 dark:bg-purple-950/20" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {org.name}
                          </p>
                          <span className="font-mono text-[10px] text-zinc-400">
                            ID: {org.id.slice(0, 13)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {org.city}
                      </p>
                      <p className="text-[11px] text-zinc-500">{org.contactEmail}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {org.subscriptionPlan}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            org.subscriptionStatus === "active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {org.subscriptionStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        Renews {org.renewalDate}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-800 dark:text-zinc-200">
                        {org.propertiesCount} {org.propertiesCount === 1 ? "Property" : "Properties"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-800 dark:text-zinc-200">
                        {org.residentsCount} Residents
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isCurrentViewing ? (
                        <form action={exitViewAsOrgAction} className="inline-block">
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition"
                          >
                            Exit View Mode
                          </button>
                        </form>
                      ) : (
                        <form action={enterViewAsOrgAction} className="inline-block">
                          <input type="hidden" name="organization_id" value={org.id} />
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View as Org
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explicit 'View as Organization' Section:
          Only shown when super admin has entered view-as-org mode */}
      {viewingOrg ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-amber-400 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  <Eye className="h-3 w-3" />
                  View As Organization Mode Active
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  RLS tenant context switched to: {viewingOrg.id}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                {viewingOrg.name} — Operational Snapshot
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/owner"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Open Full Owner Portal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <form action={exitViewAsOrgAction}>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Exit Mode
                </button>
              </form>
            </div>
          </div>

          {/* Operational Numbers for this PG (Shown ONLY in View-As-Org mode) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase text-zinc-500">
                Bed Occupancy
              </span>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                87.5%
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">47 / 52 beds occupied</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase text-zinc-500">
                Monthly Rent Collected
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatINR(995000)}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Billed: {formatINR(2556000)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase text-zinc-500">
                Active Leases & Residents
              </span>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                3 Residents
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">2 verified KYC leases</p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty notice ensuring no single PG occupancy or rent is exposed by default */
        <div className="bg-purple-50/50 dark:bg-zinc-900/40 rounded-2xl p-5 border border-purple-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Individual PG Operations Isolated
              </p>
              <p className="text-[11px] text-zinc-500">
                Single PG occupancy and rent revenue figures are restricted. Click &apos;View as Org&apos; on any organization above to open their operational scope.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
