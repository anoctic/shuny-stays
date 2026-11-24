import { getComplaints } from "@/lib/data/rooms";
import { getCurrentUserSession } from "@/lib/auth/session";
import { TenantComplaintsExplorer } from "@/components/tenant/TenantComplaintsExplorer";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TenantComplaintsPage() {
 const session = await getCurrentUserSession();
 const allComplaints = await getComplaints();

 // Scope to the tenant's complaints (or all if not filtered)
 const tenantComplaints = allComplaints.filter(
 (c) => c.tenantId === session.id || c.tenantName?.toLowerCase().includes(session.full_name.toLowerCase())
 );

 return (
 <TenantComplaintsExplorer
 initialTickets={tenantComplaints.length > 0 ? tenantComplaints : allComplaints}
 />
 );
}
