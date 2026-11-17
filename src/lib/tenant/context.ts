import { cookies } from "next/headers";
import { DEFAULT_TENANT_ID } from "./constants";

export * from "./constants";

/**
 * Resolves current tenant ID from cookies or defaults to primary tenant (Server-only)
 */
export async function getCurrentTenantId(): Promise<string> {
  const cookieStore = await cookies();
  const tenantCookie = cookieStore.get("pg_active_tenant_id");
  return tenantCookie?.value || DEFAULT_TENANT_ID;
}
