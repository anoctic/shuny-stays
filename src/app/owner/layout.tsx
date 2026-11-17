import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { OwnerTopBar } from "@/components/owner/OwnerTopBar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Strict Server Route Guard
  if (session.role !== "owner" && !session.is_super_admin) {
    if (session.role === "resident") {
      redirect("/resident");
    } else {
      redirect("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <OwnerSidebar organizationName={session.organization_name} />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopBar session={session} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
