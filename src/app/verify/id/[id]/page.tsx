import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Home,
  Bed,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  QrCode,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeTenantCycleStatus } from "@/lib/utils/billing-cycle";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface VerifyIdPageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyTenantIdPage({ params }: VerifyIdPageProps) {
  const { id } = await params;
  const admin = createAdminClient();

  // 1. Fetch tenant record from Supabase
  let tenant: any = null;
  try {
    const { data, error } = await (admin.from("tenants" as any) as any)
      .select(`
        id,
        full_name,
        phone,
        email,
        kyc_status,
        id_proof_type,
        profile_photo_url,
        is_active,
        check_in_date,
        rent_amount,
        deposit_amount,
        emergency_contact_name,
        emergency_contact_phone,
        room_id,
        bed_id,
        building_id,
        pg_id,
        buildings(name, address),
        rooms(room_number, floor_id),
        beds(bed_name),
        pgs(id, name, logo_url, primary_color, city, contact_phone, contact_email)
      `)
      .or(`id.eq.${id},user_id.eq.${id}`)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      tenant = data;
    }
  } catch (err) {
    console.error("Verification query error:", err);
  }

  // 2. Demo fallback if user is in demo mode or ID matches demo
  if (!tenant && (id.includes("90000000-0000-0000-0000-000000000004") || id === "demo-tenant")) {
    tenant = {
      id: "90000000-0000-0000-0000-000000000004",
      full_name: "Aarav Patel",
      phone: "+91 91234 56789",
      email: "aarav.patel@student.com",
      kyc_status: "verified",
      is_active: true,
      check_in_date: "2026-08-01",
      emergency_contact_name: "Ramesh Patel (Father)",
      emergency_contact_phone: "+91 98111 22233",
      buildings: { name: "Block A - Krishna Bhawan (Boys)", address: "Koramangala 4th Block" },
      rooms: { room_number: "101" },
      beds: { bed_name: "Bed A" },
      pgs: {
        id: "23594b9e-da90-4884-95aa-5f978d91a0d2",
        name: "Shuny Stays Luxury PG",
        primary_color: "#4F46E5",
        city: "Bengaluru",
        contact_phone: "+91 98765 43210",
        contact_email: "support@shunystays.com",
      },
    };
  }

  // Current IST verification timestamp
  const now = new Date();
  const istTimeStr = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(now);

  const verificationHash = `VER-${id.slice(0, 8).toUpperCase()}-${Math.floor(Date.now() / 60000)}`;

  // If resident not found in database
  if (!tenant) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-black text-white">Record Not Found</h1>
            <p className="text-xs text-slate-400">
              No active resident credential found for token:
            </p>
            <p className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-lg">
              {id}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1.5">
            <p className="font-semibold text-slate-300">Possible Reasons:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
              <li>Resident has officially checked out / vacated the property.</li>
              <li>The QR code or identification token has expired.</li>
              <li>Incorrect or revoked identification URL.</li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-block w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all"
          >
            Visit ShunyStays Home
          </Link>
        </div>
      </main>
    );
  }

  const pgName = tenant.pgs?.name || "Premium Stay Residency";
  const primaryColor = tenant.pgs?.primary_color || "#4F46E5";
  const buildingName = tenant.buildings?.name || "Main Block";
  const roomNumber = tenant.rooms?.room_number ? `Room ${tenant.rooms.room_number}` : "Room Assigned";
  const bedName = tenant.beds?.bed_name ? `(${tenant.beds.bed_name})` : "";
  const isActive = tenant.is_active !== false;

  // Live Rent & Security Deposit lookup for scanned ID card
  let rentPaid = false;
  let lastPaidAt: string | null = null;
  let depositPaidAmount = 0;
  let depositExpectedAmount = Number(tenant.deposit_amount) || 0;
  let depositStatus: string = depositExpectedAmount > 0 ? "pending" : "paid";

  if (tenant.id && !String(tenant.id).startsWith("90000000-")) {
    try {
      const nowIst = new Date();
      const currentBillingMonth = nowIst.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      const currentYearMonth = `${nowIst.getFullYear()}-${String(nowIst.getMonth() + 1).padStart(2, "0")}`;

      const [{ data: rpRows }, { data: depRow }] = await Promise.all([
        (admin.from("rent_payments" as any) as any)
          .select("billing_month, status, collected_at, created_at")
          .eq("tenant_id", tenant.id)
          .order("created_at", { ascending: false })
          .limit(6),
        (admin.from("security_deposits" as any) as any)
          .select("expected_amount, paid_amount, status")
          .eq("tenant_id", tenant.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      for (const rp of rpRows || []) {
        const st = (rp.status || "").toLowerCase();
        if (!["settled_with_owner", "collected_by_admin", "paid", "verified"].includes(st)) continue;
        const dt = rp.collected_at || rp.created_at || "";
        if (!lastPaidAt && dt) lastPaidAt = dt;
        const bm = (rp.billing_month || "").trim();
        if (bm.toLowerCase() === currentBillingMonth.toLowerCase() || bm.startsWith(currentYearMonth) || (!bm && dt.startsWith(currentYearMonth))) {
          rentPaid = true;
        }
      }

      if (depRow) {
        depositExpectedAmount = Number(depRow.expected_amount ?? depositExpectedAmount);
        depositPaidAmount = Number(depRow.paid_amount ?? 0);
        depositStatus = depRow.status || (depositPaidAmount >= depositExpectedAmount ? "paid" : "pending");
      }
    } catch {
      // Safe fallback
    }
  }

  const cycleStatus = computeTenantCycleStatus({
    checkInDate: tenant.check_in_date,
    rentPaid,
    lastPaidAt,
  });

  const rawKyc = (tenant.kyc_status || "").toLowerCase();
  const kycState =
    rawKyc === "verified" || tenant.id_proof_type === "verified"
      ? "Verified"
      : rawKyc === "under_review"
      ? "Under Review"
      : rawKyc === "rejected"
      ? "Rejected"
      : "Pending";
  const isKycVerified = kycState === "Verified";

  // Mask phone number for public privacy
  const rawPhone = tenant.phone || "";
  const maskedPhone =
    rawPhone.length > 5
      ? `${rawPhone.slice(0, 3)} •••• ${rawPhone.slice(-3)}`
      : rawPhone;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden select-none">
      {/* Subtle Ambient Glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: primaryColor }}
      />

      <div className="w-full max-w-[430px] space-y-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Verification Status Header Banner */}
        <div className="text-center space-y-1">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${
              isKycVerified
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                : kycState === "Under Review"
                ? "bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-sky-500/10"
                : kycState === "Rejected"
                ? "bg-rose-500/15 border border-rose-500/30 text-rose-300 shadow-rose-500/10"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-amber-500/10"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isKycVerified
                  ? "bg-emerald-400"
                  : kycState === "Under Review"
                  ? "bg-sky-400"
                  : kycState === "Rejected"
                  ? "bg-rose-400"
                  : "bg-amber-400"
              }`}
            />
            {isKycVerified
              ? isActive
                ? "Official Verified Resident"
                : "Verified Alumni Resident"
              : kycState === "Under Review"
              ? "Active Resident • KYC Under Review"
              : kycState === "Rejected"
              ? "Active Resident • KYC Rejected"
              : "Active Resident • KYC Pending"}
          </div>
          <p className="text-[11px] text-slate-400">
            Certified by ShunyStays Security & Trust Network
          </p>
        </div>

        {/* Digital Identity Pass Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Card Top Strip with PG Brand Gradient */}
          <div
            className="p-4 text-white relative"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #0F172A)`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 block">
                  Property Identity
                </span>
                <h1 className="text-lg font-black truncate">{pgName}</h1>
                <p className="text-[11px] text-white/70">
                  {tenant.pgs?.city || "Verified Facility"}
                </p>
              </div>

              {/* Verified Shield Emblem */}
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white shrink-0 shadow-lg">
                <ShieldCheck
                  className={`w-6 h-6 ${
                    isKycVerified
                      ? "text-emerald-300"
                      : kycState === "Under Review"
                      ? "text-sky-300"
                      : kycState === "Rejected"
                      ? "text-rose-300"
                      : "text-amber-300"
                  }`}
                />
                <span
                  className={`text-[7px] font-mono font-black uppercase tracking-wider ${
                    isKycVerified
                      ? "text-emerald-200"
                      : kycState === "Under Review"
                      ? "text-sky-200"
                      : kycState === "Rejected"
                      ? "text-rose-200"
                      : "text-amber-200"
                  }`}
                >
                  {isKycVerified ? "VERIFIED" : kycState === "Under Review" ? "REVIEW" : "PENDING"}
                </span>
              </div>
            </div>
          </div>

          {/* Resident Profile Section */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
              <div
                className="w-13 h-13 rounded-2xl overflow-hidden flex items-center justify-center font-black text-lg text-white shadow-md shrink-0 border border-white/15"
                style={{ backgroundColor: primaryColor }}
              >
                {tenant.profile_photo_url ? (
                  <img
                    src={tenant.profile_photo_url}
                    alt={tenant.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : tenant.full_name ? (
                  tenant.full_name
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                ) : (
                  "RS"
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-base font-black text-white truncate">
                  {tenant.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span>{maskedPhone}</span>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                      isKycVerified
                        ? "text-emerald-400"
                        : kycState === "Under Review"
                        ? "text-sky-400"
                        : kycState === "Rejected"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}
                  >
                    {isKycVerified ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : kycState === "Under Review" ? (
                      <ClockIcon className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    KYC {kycState}
                  </span>
                </div>
              </div>
            </div>

            {/* Room & Property Allocation Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-400" /> Building Block
                </span>
                <p className="font-extrabold text-white truncate">
                  {buildingName}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Home className="w-3 h-3 text-indigo-400" /> Room / Bed
                </span>
                <p className="font-extrabold text-white truncate">
                  {roomNumber} {bedName}
                </p>
              </div>
            </div>

            {/* Verification Metadata Grid */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Resident Check-in Date
                </span>
                <strong className="text-white">
                  {tenant.check_in_date || "Active Lease"}
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                  Month Ends In
                </span>
                <strong
                  className={
                    cycleStatus.bucket === "expired"
                      ? "text-rose-400"
                      : cycleStatus.bucket === "3days" || cycleStatus.bucket === "7days"
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }
                >
                  {cycleStatus.badgeText} ({cycleStatus.formattedEndDate})
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  This Month Rent &amp; Deposit
                </span>
                <strong className="text-white text-[10.5px]">
                  <span className={rentPaid ? "text-emerald-400" : "text-rose-400"}>
                    {rentPaid ? "Rent Paid" : "Rent Due"}
                  </span>
                  {" • "}
                  <span className={depositStatus === "paid" ? "text-emerald-300" : "text-amber-300"}>
                    {depositStatus === "paid"
                      ? `Dep ₹${depositPaidAmount.toLocaleString("en-IN")} Held`
                      : `Dep ₹${Math.max(0, depositExpectedAmount - depositPaidAmount).toLocaleString("en-IN")} Due`}
                  </span>
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Digital Verification Hash
                </span>
                <strong className="text-slate-300 font-mono text-[10px]">
                  {verificationHash}
                </strong>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                  Live Verified At
                </span>
                <strong className="text-emerald-400 text-[10px]">
                  {istTimeStr}
                </strong>
              </div>
            </div>

            {/* Emergency Property Contact */}
            <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 space-y-1">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wide">
                Property Emergency Desk & Warden
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  {tenant.pgs?.contact_phone || "+91 98765 43210"}
                </span>
                {tenant.pgs?.contact_phone && (
                  <a
                    href={`tel:${tenant.pgs.contact_phone}`}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-all"
                  >
                    Call Desk
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tamper-Proof Holographic Security Strip */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span className="font-mono">SHUNYSTAYS-CERTIFIED-ID</span>
            <span className="text-emerald-400 font-bold">● LIVE ACTIVE</span>
          </div>
        </div>

        {/* Platform Footer */}
        <div className="text-center space-y-1 text-slate-600 text-[10px]">
          <p>© {new Date().getFullYear()} ShunyStays Inc. • Enterprise PG Management OS</p>
          <p>For inquiries or reporting: support@shunystays.com</p>
        </div>
      </div>
    </main>
  );
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
