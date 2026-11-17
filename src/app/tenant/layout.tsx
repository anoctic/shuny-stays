import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // If super_admin or owner/admin, redirect to respective portals
  if (session.role === "super_admin") {
    redirect("/super-admin");
  } else if (session.role === "owner" || session.role === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <MobileTopHeader
        fullName={session.full_name}
        role="tenant"
        pgName={session.pg_name || "Stanza Living Residency"}
      />
      <main className="flex-1 p-4 pb-24 overflow-y-auto">{children}</main>
      <MobileBottomNav role="tenant" pendingDuesCount={1} />
    </div>
  );
}
