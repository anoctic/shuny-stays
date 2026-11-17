import { cookies } from "next/headers";
import { Building2, Eye, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { DEMO_TENANTS } from "@/lib/tenant/constants";
import { CreateOrgModal } from "@/components/super-admin/CreateOrgModal";
import { enterViewAsOrgAction, exitViewAsOrgAction } from "@/app/actions/auth";

export default async function SuperAdminOrganizationsPage() {
  const cookieStore = await cookies();
  const viewingOrgId = cookieStore.get("pg_active_tenant_id")?.value;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Organizations & PG Owners
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage hosted organizations, tenancy boundaries, and view-as-organization scopes.
          </p>
        </div>
        <CreateOrgModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DEMO_TENANTS.map((org) => {
          const isViewing = viewingOrgId === org.id;

          return (
            <div
              key={org.id}
              className={`rounded-3xl border bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-5 transition-all ${
                isViewing
                  ? "border-amber-400 ring-2 ring-amber-400/20"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-base flex items-center justify-center">
                    {org.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      {org.name}
                    </h3>
                    <p className="font-mono text-[11px] text-zinc-400">
                      Slug: {org.slug}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    org.subscriptionStatus === "active"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {org.subscriptionStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl">
                <div>
                  <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location:
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                    {org.city}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Properties:
                  </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                    {org.propertiesCount} Hostels
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Contact:
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-0.5 truncate">
                    {org.contactEmail}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Subscription:
                  </span>
                  <span className="font-bold text-purple-700 dark:text-purple-300 block mt-0.5">
                    {org.subscriptionPlan}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-zinc-400">
                  Tenant: {org.id.slice(0, 8)}...
                </span>

                {isViewing ? (
                  <form action={exitViewAsOrgAction}>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
                    >
                      Exit View Mode
                    </button>
                  </form>
                ) : (
                  <form action={enterViewAsOrgAction}>
                    <input type="hidden" name="organization_id" value={org.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View as Organization
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
