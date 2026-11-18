import { getAllBroadcasts } from "@/lib/data/broadcasts";
import { getAllPgs } from "@/lib/data/pgs";
import { SuperAdminDashboard } from "@/components/super-admin/SuperAdminDashboard";

export default async function SuperAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tab = (resolvedParams?.tab as "overview" | "pgs" | "broadcast" | "billing") || "overview";

  const broadcasts = await getAllBroadcasts();
  const pgs = await getAllPgs();

  return (
    <SuperAdminDashboard
      pgs={pgs}
      broadcasts={broadcasts}
      initialTab={tab}
    />
  );
}
