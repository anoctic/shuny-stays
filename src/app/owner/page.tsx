import { redirect } from "next/navigation";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OwnerPage() {
  redirect("/dashboard");
}
