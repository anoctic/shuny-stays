"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserSession } from "@/lib/auth/session";
import { AttendanceStatus } from "@/types/schema.types";
import { saveAttendanceLogs } from "@/lib/data/attendance";

export async function saveAttendanceAction(
  items: { tenant_id: string; status: AttendanceStatus; bed_id?: string }[]
) {
  const session = await getCurrentUserSession();

  if (session.role !== "owner" && session.role !== "admin") {
    return { error: "Unauthorized to record attendance." };
  }

  const result = await saveAttendanceLogs(items, session.role, session.full_name);

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/tenant");

  return { success: true, count: result.count };
}
