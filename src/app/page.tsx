import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootPage() {
  const session = await getCurrentUserSession();

  if (session.role === "super_admin") {
    redirect("/super-admin");
  } else if (session.role === "owner") {
    if (!session.has_pg) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  } else if (session.role === "admin") {
    redirect("/dashboard");
  } else {
    redirect("/tenant");
  }
}
