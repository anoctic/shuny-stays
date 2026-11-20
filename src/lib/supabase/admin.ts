import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

const FALLBACK_SUPABASE_URL = "https://lrghfxcmygytjkzaeccd.supabase.co";
const FALLBACK_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2hmeGNteWd5dGpremFlY2NkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDkyOTk2MywiZXhwIjoyMTEwNTA1OTYzfQ.J7ch5P-7fuWg7_bp0ivBJXh8asf-A-FrUnEPzVIJhRc";

/**
 * Strips quotes, spaces, control characters, tabs, and newlines from environment variable strings
 * so workerd / Edge runtime fetch NEVER throws "TypeError: Invalid header value."
 */
function sanitizeString(val: string | undefined | null): string {
  if (!val) return "";
  return val
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width spaces
    .replace(/[\u00A0]/g, " ") // non-breaking space
    .replace(/[\r\n\t]/g, "") // newlines and tabs
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "") // quotes
    .trim();
}

function resolveSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw || raw.includes("placeholder")) return FALLBACK_SUPABASE_URL;
  const match = raw.match(/https?:\/\/[^\s"'“”‘’\r\n]+/i);
  return match ? match[0].replace(/\/+$/, "") : FALLBACK_SUPABASE_URL;
}

function resolveServiceRoleKey(): string {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!raw || raw.includes("placeholder")) return FALLBACK_SERVICE_ROLE_KEY;

  let cleaned = sanitizeString(raw);
  if (cleaned.toLowerCase().startsWith("bearer ")) {
    cleaned = cleaned.slice(7).trim();
  }

  // Extract valid 3-part dot-separated JWT if present
  const jwtMatch = cleaned.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  if (jwtMatch && jwtMatch[0].length > 40) {
    return jwtMatch[0];
  }

  return FALLBACK_SERVICE_ROLE_KEY;
}

function cleanFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const mergedInit: RequestInit = {
    ...init,
    cache: "no-store",
  };
  if (mergedInit.headers) {
    const rawHeaders = mergedInit.headers as any;
    const cleanHeaders: Record<string, string> = {};
    if (typeof rawHeaders.forEach === "function") {
      rawHeaders.forEach((val: string, key: string) => {
        cleanHeaders[key] = String(val).replace(/[\r\n\t]/g, "").trim();
      });
    } else if (Array.isArray(rawHeaders)) {
      for (const [key, val] of rawHeaders) {
        cleanHeaders[key] = String(val).replace(/[\r\n\t]/g, "").trim();
      }
    } else if (typeof rawHeaders === "object") {
      for (const [key, val] of Object.entries(rawHeaders)) {
        if (val !== undefined && val !== null) {
          cleanHeaders[key] = String(val).replace(/[\r\n\t]/g, "").trim();
        }
      }
    }
    mergedInit.headers = cleanHeaders;
  }
  return fetch(input, mergedInit);
}

/**
 * Administrative Supabase client using Service Role Key.
 * ONLY use in server-side API routes, migrations, and admin endpoints.
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = resolveSupabaseUrl();
  const serviceRoleKey = resolveServiceRoleKey();

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: cleanFetch,
    },
  });
}
