import { NextResponse } from "next/server";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    // 1. Verify super_admin privileges
    const session = await getCurrentUserSession();
    if (!session.is_super_admin) {
      return NextResponse.json(
        { error: "Forbidden: SQL query console execution is restricted to super_admin." },
        { status: 403 }
      );
    }

    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing SQL query" }, { status: 400 });
    }

    // 2. Safety guardrails: block destructive commands in general query runner
    const normalized = query.toLowerCase().trim();
    if (
      normalized.includes("drop database") ||
      normalized.includes("truncate auth") ||
      normalized.includes("drop role")
    ) {
      return NextResponse.json(
        { error: "Forbidden: Destructive DDL command is restricted." },
        { status: 403 }
      );
    }

    const start = performance.now();
    // Service role client is strictly isolated to server-side API execution
    const supabase = createAdminClient();

    // Call Supabase RPC pg_admin_execute_query if exists
    const { data, error } = await (supabase.rpc as any)("pg_admin_execute_query", {
      sql_query: query,
    });

    const duration = performance.now() - start;

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          durationMs: Math.round(duration * 10) / 10,
        },
        { status: 400 }
      );
    }

    const rows = Array.isArray(data) ? data : [];

    return NextResponse.json({
      rows,
      rowCount: rows.length,
      durationMs: Math.round(duration * 10) / 10,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to execute query" },
      { status: 500 }
    );
  }
}
