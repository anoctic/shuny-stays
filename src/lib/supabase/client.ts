import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

const FALLBACK_SUPABASE_URL = "https://lrghfxcmygytjkzaeccd.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2hmeGNteWd5dGpremFlY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5Mjk5NjMsImV4cCI6MjExMDUwNTk2M30.3khqrllzC1S69EFGFXDdNp-f87dZSpqkogiWYk9tJBo";

function sanitizeString(val: string | undefined | null): string {
  if (!val) return "";
  return val
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u00A0]/g, " ")
    .replace(/[\r\n\t]/g, "")
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .trim();
}

function resolveSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw || raw.includes("placeholder")) return FALLBACK_SUPABASE_URL;
  const match = raw.match(/https?:\/\/[^\s"'“”‘’\r\n]+/i);
  return match ? match[0].replace(/\/+$/, "") : FALLBACK_SUPABASE_URL;
}

function resolveAnonKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!raw || raw.includes("placeholder")) return FALLBACK_ANON_KEY;

  let cleaned = sanitizeString(raw);
  if (cleaned.toLowerCase().startsWith("bearer ")) {
    cleaned = cleaned.slice(7).trim();
  }

  const jwtMatch = cleaned.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  if (jwtMatch && jwtMatch[0].length > 40) {
    return jwtMatch[0];
  }

  return FALLBACK_ANON_KEY;
}

function cleanFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (init && init.headers) {
    const rawHeaders = init.headers as any;
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
    init.headers = cleanHeaders;
  }
  return fetch(input, init);
}

export function createClient() {
  const supabaseUrl = resolveSupabaseUrl();
  const supabaseAnonKey = resolveAnonKey();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: cleanFetch,
    },
  });
}
