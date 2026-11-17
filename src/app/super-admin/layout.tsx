import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";

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

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <MobileTopHeader
        fullName={session.full_name}
        role="super_admin"
        pgName="Platform Governance (All PGs)"
      />
      <main className="flex-1 p-4 pb-12 overflow-y-auto">{children}</main>
    </div>
  );
}
