"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { BulkImportRowInput } from "@/lib/utils/bulk-import-parser";
import { processBulkImportChunk, BulkImportBatchSummary } from "@/lib/data/bulk-import";

export async function bulkImportChunkAction(params: {
  rows: BulkImportRowInput[];
  createLogins: boolean;
  isLastChunk?: boolean;
  targetPgId?: string | null;
}): Promise<{ success?: boolean; summary?: BulkImportBatchSummary; error?: string }> {
  const session = await getCurrentUserSession();
  if (
    session.role !== "owner" &&
    session.role !== "super_admin" &&
    !session.is_super_admin
  ) {
    return { error: "Unauthorized. PG Owner or Super Admin access required." };
  }

  const pgId =
    params.targetPgId && (session.is_super_admin || session.role === "super_admin")
      ? params.targetPgId
      : session.pg_id;

  if (!pgId) {
    return { error: "No active PG selected. Please select or onboard a PG first." };
  }

  try {
    let pgName = session.pg_name || "PG Property";
    if (!session.pg_name || params.targetPgId) {
      const admin = createAdminClient();
      const { data: pgRow } = await (admin.from("pgs" as any) as any)
        .select("name")
        .eq("id", pgId)
        .maybeSingle();
      if (pgRow?.name) pgName = pgRow.name;
    }

    const summary = await processBulkImportChunk({
      pgId,
      pgName,
      rows: params.rows,
      createLogins: params.createLogins,
      collectorId: session.id || null,
      collectorName: session.full_name || "PG Owner",
    });

    if (params.isLastChunk !== false) {
      revalidatePath("/dashboard/rooms");
      revalidatePath("/dashboard/tenants");
      revalidatePath("/dashboard/attendance");
      revalidatePath("/dashboard/ledger");
      revalidatePath("/dashboard");
      revalidatePath("/super-admin");
    }

    return { success: true, summary };
  } catch (err: any) {
    console.error("bulkImportChunkAction error:", err);
    return { error: err?.message || "Failed to process bulk import batch." };
  }
}
