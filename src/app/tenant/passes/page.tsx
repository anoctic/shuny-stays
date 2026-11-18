import Link from "next/link";
import {
  QrCode,
  ArrowLeft,
  IdCard,
  ShieldCheck,
  Calendar,
  Phone,
  Sparkles,
} from "lucide-react";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getPassesForTenant } from "@/lib/data/gate-passes";
import { getPgById } from "@/lib/data/pgs";
import { GatePassCard } from "@/components/passes/GatePassCard";
import { RequestPassModal } from "@/components/passes/RequestPassModal";
import { TenantIdNoticeView } from "@/components/tenant/TenantIdNoticeView";

export default async function TenantPassesPage() {
  const session = await getCurrentUserSession();
  const passes = await getPassesForTenant(session.id);
  const pg = (await getPgById(session.pg_id || "00000000-0000-0000-0000-000000000001")) || {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Royal Stay PG",
    slug: "royal-stay",
    primary_color: "#4F46E5",
    city: "Bengaluru",
  };

  return (
    <TenantIdNoticeView
      session={{
        id: session.id,
        full_name: session.full_name,
        phone: session.phone || "+91 98765 43210",
        room_id: session.room_id,
        building_id: session.building_id,
      }}
      pg={{
        name: pg.name,
        primaryColor: pg.primary_color || "#4F46E5",
      }}
      buildingName="Block A - Krishna Bhawan"
      roomNumber="Room 101 (Bed A)"
      kycStatus="Verified"
      joinDate="01 Aug 2026"
      depositAmount={8500}
      emergencyPhone="+91 98111 22233"
      passes={passes}
    />
  );
}
