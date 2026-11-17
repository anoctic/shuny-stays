import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { SuperAdminSidebar } from "@/components/super-admin/SuperAdminSidebar";
import { SuperAdminTopBar } from "@/components/super-admin/SuperAdminTopBar";
import { DEMO_TENANTS } from "@/lib/tenant/constants";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Strict Server Route Guard
  if (!session.is_super_admin) {
    if (session.role === "owner") {
      redirect("/owner");
    } else if (session.role === "resident") {
      redirect("/resident");
    } else {
      redirect("/login");
    }
  }

  const cookieStore = await cookies();
  const viewingOrgId = cookieStore.get("pg_active_tenant_id")?.value;
  const viewingOrg = viewingOrgId
    ? DEMO_TENANTS.find((t) => t.id === viewingOrgId)
    : null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <SuperAdminSidebar viewingOrgName={viewingOrg?.name} />
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminTopBar
          session={session}
          viewingOrgName={viewingOrg?.name}
          viewingOrgId={viewingOrgId}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
