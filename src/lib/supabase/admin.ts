import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * Administrative Supabase client using Service Role Key.
 * ONLY use in server-side API routes, migrations, and admin endpoints.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
