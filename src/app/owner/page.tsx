import { redirect } from "next/navigation";

export const runtime = "edge";

export default function OwnerPage() {
  redirect("/dashboard");
}
