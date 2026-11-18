import Link from "next/link";
import {
  Crown,
  Building2,
  Users,
  ShieldCheck,
  Megaphone,
  Sparkles,
  ExternalLink,
  MapPin,
  Palette,
} from "lucide-react";
import { BroadcastCreatorModal } from "@/components/broadcasts/BroadcastCreatorModal";
import { getAllBroadcasts } from "@/lib/data/broadcasts";
import { getAllPgs } from "@/lib/data/pgs";
import { OnboardPgModal } from "@/components/super-admin/OnboardPgModal";
import { EditBrandingModal } from "@/components/super-admin/EditBrandingModal";

export default async function SuperAdminPage() {
  const broadcasts = await getAllBroadcasts();
  const pgs = await getAllPgs();

  const totalResidents = pgs.reduce((acc, p) => acc + (p.residents_count || 0), 0);
  const totalBeds = pgs.reduce((acc, p) => acc + (p.beds_count || 0), 0);

  return (
    <div className="space-y-4">
      {/* Platform Header: ShunyOS Platform Governance */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 text-white p-5 shadow-lg shadow-purple-500/15">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-300" /> ShunyOS Platform Governance
          </div>
          <span className="text-[10px] font-mono text-purple-200">v2.4 Production</span>
        </div>
        <h1 className="text-xl font-black tracking-tight">ShunyOS SaaS Command Center</h1>
        <p className="text-xs text-purple-100/90 mt-1">
          Platform-level governance, white-label PG onboarding, and multi-tenant branding.
        </p>
      </div>

      {/* Super Admin Actions: Onboard New PG + Broadcast */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-purple-600" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Hosted PG Directory ({pgs.length})
          </h2>
        </div>
        <OnboardPgModal />
      </div>

      {/* Directory of PGs with Branding & Edit Buttons */}
      <div className="space-y-3">
        {pgs.map((pg) => {
          const primaryColor = pg.primary_color || "#4F46E5";

          return (
            <div
              key={pg.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs"
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
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {pg.name}
                      </h3>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                        title={`Brand color: ${primaryColor}`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {pg.city} • Owner: {pg.owner_name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    {pg.subscription_tier}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">
                    {pg.status}
                  </span>
                </div>
              </div>

              {/* Scope & Tenant Link Info */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Scale</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {pg.buildings_count} Blocks • {pg.residents_count} Residents
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">White-Label URL</span>
                  <p className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold truncate">
                    /pg/{pg.slug}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Preview Public PWA Link & Edit Branding */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href={`/pg/${pg.slug}`}
                  target="_blank"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Resident PWA
                </Link>

                <div className="flex items-center gap-2">
                  <EditBrandingModal pg={pg} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Section */}
      <div className="bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-800/60 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Targeted Role Broadcasts
              </h2>
              <p className="text-[11px] text-slate-400">
                Announcements targeted to Owners, Wardens, or Tenants
              </p>
            </div>
          </div>
          <BroadcastCreatorModal initialBroadcasts={broadcasts} />
        </div>

        {/* Broadcasts Summary Pills */}
        <div className="space-y-2 mt-2">
          {broadcasts.slice(0, 2).map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between"
            >
              <div className="truncate pr-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      b.priority === "urgent"
                        ? "bg-rose-100 text-rose-800"
                        : b.priority === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {b.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Target: {b.target_roles.join(", ")}
                  </span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {b.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {b.message}
                </p>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  b.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                }`}
              >
                {b.is_active ? "Active" : "Paused"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active PGs</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{pgs.length}</div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% Operational</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Residents</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalResidents}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Capacity: {totalBeds} beds</p>
        </div>
      </div>

      {/* Database Security / RLS Health */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Supabase Storage & RLS Isolation
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Active
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Logos saved to bucket <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">pg-logos/$&#123;pgId&#125;/logo.*</code>.
          Multi-tenant RLS restricts tenant and staff data strictly to their organization.
        </p>
      </div>

      {/* Footer Powered by ShunyOS */}
      <div className="text-center pt-2 pb-4">
        <p className="text-[11px] text-slate-400 font-medium">
          ShunyOS Core Engine • Built with Supabase PostgreSQL & Next.js App Router
        </p>
      </div>
    </div>
  );
}
