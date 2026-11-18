import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  BedDouble,
  ShieldCheck,
  Utensils,
  Wifi,
  Zap,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  ArrowRight,
  Sparkles,
  Download,
  CheckCircle2,
} from "lucide-react";
import { getPgBySlug } from "@/lib/data/pgs";

export default async function WhiteLabelPgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pg = await getPgBySlug(slug);

  if (!pg) {
    notFound();
  }

  const primaryColor = pg.primary_color || "#4F46E5";

  // Dynamic WhatsApp enquiry message template
  const waMessage = encodeURIComponent(
    `Hello ${pg.name}, I am interested in checking bed availability at your property via ${pg.name} Resident App (Powered by Shuny Stays Software).`
  );
  const waLink = `https://wa.me/${pg.contact_phone.replace(/[^0-9]/g, "")}?text=${waMessage}`;

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between pb-24 text-[#0F172A]"
      style={{ "--brand-primary": primaryColor } as React.CSSProperties}
    >
      {/* Dynamic PWA Manifest Link */}
      <link rel="manifest" href={`/api/manifest/${pg.slug}`} />

      {/* Top White-Label Hero Section */}
      <div
        className="relative text-white p-6 rounded-b-[2.5rem] shadow-xl overflow-hidden transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-black/10 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Bar with PG Logo & PWA Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md overflow-hidden border border-white/30 flex items-center justify-center font-black text-lg shadow-sm">
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
                <h1 className="text-xl font-black tracking-tight leading-tight">
                  {pg.name}
                </h1>
                <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {pg.city} • Verified Property
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 uppercase tracking-wider">
              {pg.subscription_tier}
            </span>
          </div>

          {/* Quick Subtitle */}
          <p className="text-xs text-white/90 leading-relaxed pt-1">
            Official resident portal & accommodation desk. Pay rent, download receipts, track attendance, and submit passes.
          </p>

          {/* Resident Sign In / Launch App Button */}
          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/login"
              className="flex-1 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 active:scale-95 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg transition-all"
            >
              Resident Login / Portal
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 flex-1">
        {/* PWA Home Screen Installation Banner */}
        <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Install {pg.name} App
              </p>
              <p className="text-[10px] text-slate-400">
                Tap browser menu &rarr; &apos;Add to Home Screen&apos;
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
            PWA Ready
          </span>
        </div>

        {/* Property Highlights Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Blocks</span>
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {pg.buildings_count} Buildings
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Boys & Girls Wings</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Beds</span>
              <BedDouble className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {pg.beds_count} Beds
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Single & Double Sharing
            </p>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Living Amenities Included
          </h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
              <Utensils className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                3x Daily Mess
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
              <Wifi className="w-4 h-4 text-blue-500 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                High-Speed Wi-Fi
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Biometric Roll Call
              </span>
            </div>
          </div>
        </div>

        {/* Contact Help Desk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Property Desk & Contact
          </h2>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">Owner / Desk:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {pg.owner_name}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Phone:</span>
            <a
              href={`tel:${pg.contact_phone}`}
              className="font-bold text-indigo-600 hover:underline"
            >
              {pg.contact_phone}
            </a>
          </div>
        </div>
      </div>

      {/* SUBTLE BRAND FOOTER: Powered by Shuny Stays Software */}
      <footer className="pt-6 pb-2 text-center space-y-1 border-t border-slate-200/60 mt-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-500 text-[11px] font-semibold shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          <span>Powered by <strong className="text-slate-900 font-extrabold">Shuny Stays Software</strong></span>
        </div>
      </footer>
    </div>
  );
}
