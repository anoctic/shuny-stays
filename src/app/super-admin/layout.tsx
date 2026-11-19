import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBroadcasts } from "@/lib/data/broadcasts";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Strict Server Route Guard
  if (session.role !== "super_admin") {
    if (session.role === "owner" || session.role === "admin") {
      redirect("/dashboard");
    } else {
      redirect("/tenant");
    }
  }

  const broadcasts = await getAllBroadcasts();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <MobileTopHeader
        fullName={session.full_name}
        role="super_admin"
        pgName="Shuny Stays Governance (All Hosted PGs)"
        broadcasts={broadcasts}
      />
      <main className="flex-1 p-4 pb-24 overflow-y-auto">{children}</main>
      <MobileBottomNav role="super_admin" />
    </div>
  );
}
