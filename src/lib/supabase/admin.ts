import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * Administrative Supabase client using Service Role Key.
 * ONLY use in server-side API routes, migrations, and admin endpoints.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : "https://lrghfxcmygytjkzaeccd.supabase.co";

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder")
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2hmeGNteWd5dGpremFlY2NkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDkyOTk2MywiZXhwIjoyMTEwNTA1OTYzfQ.J7ch5P-7fuWg7_bp0ivBJXh8asf-A-FrUnEPzVIJhRc";

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
