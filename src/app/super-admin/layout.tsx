import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { getAllBroadcasts } from "@/lib/data/broadcasts";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { DesktopTopBar } from "@/components/layout/DesktopTopBar";
import { DesktopLayoutShell } from "@/components/layout/DesktopLayoutShell";
import { RealtimeSyncSubscriber } from "@/components/common/RealtimeSyncSubscriber";

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
 if (!session.id) {
 redirect("/login");
 }

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
 <RealtimeSyncSubscriber
 tables={["pgs", "profiles", "buildings", "platform_broadcasts", "subscription_plans"]}
 />
 <DesktopLayoutShell
 sidebar={
 <DesktopSidebar
 role="super_admin"
 fullName={session.full_name}
 />
 }
 mobileHeader={
 <MobileTopHeader
 fullName={session.full_name}
 role="super_admin"
 pgName="Shuny Stays Governance (All Hosted PGs)"
 broadcasts={broadcasts}
 />
 }
 topBar={
 <DesktopTopBar
 fullName={session.full_name}
 role="super_admin"
 pgName="Shuny Stays SaaS Governance (All Hosted PGs)"
 broadcasts={broadcasts}
 />
 }
 >
 {children}
 </DesktopLayoutShell>
 <MobileBottomNav role="super_admin" />
 </div>
 );
}
