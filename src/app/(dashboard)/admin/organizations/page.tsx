import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { DEMO_TENANTS } from "@/lib/tenant/constants";
import { Building2, Plus, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { createOrganizationAction, switchOrganizationAction } from "@/app/actions/auth";

export default async function SuperAdminOrganizationsPage() {
  const session = await getCurrentUserSession();

  // Guard: Only super_admin is permitted in the Super Admin Area
  if (!session.is_super_admin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300 mx-auto flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-red-900 dark:text-red-200">
          Access Denied: Super Admin Area
        </h2>
        <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">
          Your current authenticated membership role is <strong className="font-semibold">{session.role}</strong>. Organization management and governance are restricted exclusively to <strong className="font-semibold">super_admin</strong>.
        </p>
        <div className="pt-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-cyan-600" />
              Super Admin Area: Organizations
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-semibold">
              Super Admin Only
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Provision, inspect, and govern multi-tenant PG organizations across the platform.
          </p>
        </div>
      </div>

      {/* Create Organization Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Building2 className="h-5 w-5 text-indigo-600" />
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Create New PG Organization
          </h2>
        </div>

        <form action={createOrganizationAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Royal Palms Residency"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              name="slug"
              required
              placeholder="e.g., royal-palms"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              required
              placeholder="admin@royalpalms.com"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              name="contact_phone"
              placeholder="+91 98765 00000"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Headquarters / Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Street address, City, State, PIN"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition-colors"
            >
              <Plus className="h-4 w-4" />
              Provision Organization
            </button>
          </div>
        </form>
      </div>

      {/* Organizations Directory */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Registered Organizations ({DEMO_TENANTS.length})
          </h3>
          <span className="text-[11px] text-zinc-500">
            Super Admins can switch context to any tenant below
          </span>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {DEMO_TENANTS.map((org) => (
            <div
              key={org.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {org.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {org.slug}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {org.city}
                  </span>
                  <span>{org.propertiesCount} Properties</span>
                  <span>{org.bedsCount} Beds</span>
                  <span className="font-mono text-[11px] text-zinc-400">
                    ID: {org.id}
                  </span>
                </div>
              </div>

              <form action={switchOrganizationAction.bind(null, org.id)}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>Switch View to this Org</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
