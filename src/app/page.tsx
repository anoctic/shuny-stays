import { redirect } from "next/navigation";
import { getCurrentUserSession } from "@/lib/auth/session";

export default async function RootPage() {
  const session = await getCurrentUserSession();

  if (session.is_super_admin) {
    redirect("/super-admin");
  } else if (session.role === "owner") {
    redirect("/owner");
  } else {
    redirect("/resident");
  }
}
