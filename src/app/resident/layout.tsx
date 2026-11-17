import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { ResidentTopBar } from "@/components/resident/ResidentTopBar";
import { ResidentNav } from "@/components/resident/ResidentNav";

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Strict Server Route Guard
  if (session.role !== "resident") {
    if (session.is_super_admin) {
      redirect("/super-admin");
    } else if (session.role === "owner") {
      redirect("/owner");
    } else {
      redirect("/login");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 flex flex-col">
      <ResidentTopBar session={session} />
      <ResidentNav />
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 pb-20 sm:pb-8">
        {children}
      </main>
    </div>
  );
}
