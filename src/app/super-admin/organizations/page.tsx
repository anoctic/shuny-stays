import { cookies } from "next/headers";
import Link from "next/link";
import {
  Building2,
  Eye,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getAllPgs } from "@/lib/data/pgs";
import { OnboardPgModal } from "@/components/super-admin/OnboardPgModal";
import { EditBrandingModal } from "@/components/super-admin/EditBrandingModal";
import { enterViewAsOrgAction, exitViewAsOrgAction } from "@/app/actions/auth";

export default async function SuperAdminOrganizationsPage() {
  const cookieStore = await cookies();
  const viewingOrgId = cookieStore.get("pg_active_tenant_id")?.value;
  const pgs = await getAllPgs();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold mb-1">
            <Sparkles className="w-3 h-3" /> ShunyOS Multi-Tenancy
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            PG Brands & Tenant Scopes
          </h1>
          <p className="text-xs text-slate-400">
            White-label onboarded properties, custom logos, and dynamic URL slugs.
          </p>
        </div>
        <OnboardPgModal />
      </div>

      <div className="space-y-3">
        {pgs.map((pg) => {
          const isViewing = viewingOrgId === pg.id;
          const primaryColor = pg.primary_color || "#4F46E5";

          return (
            <div
              key={pg.id}
              className={`rounded-3xl border bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3.5 transition-all ${
                isViewing
                  ? "border-amber-400 ring-2 ring-amber-400/20"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-2xl overflow-hidden flex items-center justify-center font-extrabold text-sm text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {pg.logo_url ? (
                      <img
                        src={pg.logo_url}
                        alt={pg.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      pg.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {pg.name}
                    </h3>
                    <p className="font-mono text-[11px] text-purple-600 dark:text-purple-400">
                      /pg/{pg.slug}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    {pg.subscription_tier}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">
                    {pg.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1 font-semibold">
                    <MapPin className="h-3 w-3" /> Location:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {pg.city}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1 font-semibold">
                    <Building2 className="h-3 w-3" /> Hostels / Capacity:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                    {pg.buildings_count} Blocks • {pg.residents_count} Residents
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1 font-semibold">
                    <Mail className="h-3 w-3" /> Contact:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block mt-0.5 truncate">
                    {pg.contact_email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1 font-semibold">
                    <Phone className="h-3 w-3" /> Phone:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block mt-0.5">
                    {pg.contact_phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/pg/${pg.slug}`}
                  target="_blank"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Resident PWA
                </Link>

                <div className="flex items-center gap-2">
                  <EditBrandingModal pg={pg} />

                  {isViewing ? (
                    <form action={exitViewAsOrgAction}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
                      >
                        Exit View Mode
                      </button>
                    </form>
                  ) : (
                    <form action={enterViewAsOrgAction}>
                      <input type="hidden" name="organization_id" value={pg.id} />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View as PG
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
