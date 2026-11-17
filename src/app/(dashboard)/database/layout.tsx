import { getCurrentUserSession } from "@/lib/auth/session";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function DatabaseStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  // Strict Guard: PostgreSQL Studio & SQL Console are restricted to super_admin only
  if (!session.is_super_admin) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 mx-auto flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200">
          PostgreSQL Studio & SQL Console Restricted
        </h2>
        <p className="text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
          Direct database administration, schema introspection, and raw SQL execution are restricted strictly to <strong className="font-semibold">super_admin</strong>. Your current role is <strong className="font-semibold font-mono">{session.role}</strong>.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PG Operations Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
