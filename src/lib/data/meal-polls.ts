import { createAdminClient } from "@/lib/supabase/admin";
import {
  MealPoll,
  MealPollSummary,
  TenantHeadcountItem,
  TenantPollResponse,
} from "@/types/meal-poll.types";

/**
 * Returns current date string in IST (Asia/Kolkata) as YYYY-MM-DD
 */
export function getTodayDateIST(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Checks whether the cut-off time for a poll has passed in IST
 * Default cut-off is 10:00 AM IST
 */
export function isPollCutoffPassed(pollDate: string, cutoffTime: string = "10:00"): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const year = parts.find((p) => p.type === "year")?.value || "2026";
    const month = parts.find((p) => p.type === "month")?.value || "01";
    const day = parts.find((p) => p.type === "day")?.value || "01";
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";

    const todayIST = `${year}-${month}-${day}`;
    if (todayIST > pollDate) return true; // Poll date was in the past
    if (todayIST < pollDate) return false; // Poll date is in the future

    const currentMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10);
    const [cutoffH, cutoffM] = (cutoffTime || "10:00").split(":").map((v) => parseInt(v, 10));
    const cutoffMinutes = (cutoffH || 10) * 60 + (cutoffM || 0);

    return currentMinutes >= cutoffMinutes;
  } catch (err) {
    console.error("Error evaluating poll cutoff:", err);
    return false;
  }
}

/**
 * Fetch today's meal poll for a PG
 */
export async function getTodayMealPoll(
  pgId: string,
  mealType: string = "lunch"
): Promise<MealPoll | null> {
  try {
    const admin = createAdminClient();
    const today = getTodayDateIST();

    const { data, error } = await (admin.from("meal_polls" as any) as any)
      .select("*")
      .eq("pg_id", pgId)
      .eq("poll_date", today)
      .eq("meal_type", mealType)
      .maybeSingle();

    if (error) {
      console.error("getTodayMealPoll error:", error);
      return null;
    }

    if (!data) return null;

    const isCutoff = isPollCutoffPassed(data.poll_date, data.cutoff_time);

    return {
      id: data.id,
      pg_id: data.pg_id,
      poll_date: data.poll_date,
      meal_type: data.meal_type,
      title: data.title || "Dopahar Ka Khana (Lunch Poll)",
      cutoff_time: data.cutoff_time || "10:00",
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_expired: isCutoff,
    };
  } catch (err) {
    console.error("getTodayMealPoll critical:", err);
    return null;
  }
}

/**
 * Toggle or create meal poll for a PG
 */
export async function toggleMealPoll(params: {
  pgId: string;
  isActive: boolean;
  cutoffTime?: string;
  mealType?: string;
  title?: string;
  userId?: string;
}): Promise<MealPoll> {
  const admin = createAdminClient();
  const today = getTodayDateIST();
  const mealType = params.mealType || "lunch";
  const cutoffTime = params.cutoffTime || "10:00";
  const title = params.title || "Dopahar Ka Khana (Lunch Poll)";

  const payload = {
    pg_id: params.pgId,
    poll_date: today,
    meal_type: mealType,
    title: title,
    cutoff_time: cutoffTime,
    is_active: params.isActive,
    created_by: params.userId || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (admin.from("meal_polls" as any) as any)
    .upsert(payload, { onConflict: "pg_id,poll_date,meal_type" })
    .select()
    .single();

  if (error || !data) {
    console.error("toggleMealPoll error:", error);
    throw new Error(`Failed to toggle meal poll: ${error?.message || "Unknown error"}`);
  }

  const isCutoff = isPollCutoffPassed(data.poll_date, data.cutoff_time);

  return {
    id: data.id,
    pg_id: data.pg_id,
    poll_date: data.poll_date,
    meal_type: data.meal_type,
    title: data.title,
    cutoff_time: data.cutoff_time,
    is_active: data.is_active,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_expired: isCutoff,
  };
}

/**
 * Fetch full 3-section headcount summary for Admin / Owner
 * Returns Yes, No, and Not Answered lists
 */
export async function getMealPollSummary(
  pgId: string,
  mealType: string = "lunch"
): Promise<MealPollSummary> {
  try {
    const admin = createAdminClient();
    const today = getTodayDateIST();

    // 1. Get today's poll
    const poll = await getTodayMealPoll(pgId, mealType);
    const isCutoff = poll ? isPollCutoffPassed(poll.poll_date, poll.cutoff_time) : false;

    // 2. Fetch all active tenants for this PG
    const { data: tenantsData, error: tenantsErr } = await (admin.from("tenants" as any) as any)
      .select(`
        id,
        user_id,
        full_name,
        phone,
        room_id,
        bed_id,
        rooms (room_number),
        beds (bed_name)
      `)
      .eq("pg_id", pgId)
      .eq("is_active", true)
      .order("full_name", { ascending: true });

    if (tenantsErr) {
      console.error("getMealPollSummary tenants error:", tenantsErr);
    }

    const tenants = tenantsData || [];

    // 3. If poll exists, fetch responses
    let responses: TenantPollResponse[] = [];
    if (poll?.id) {
      const { data: respData, error: respErr } = await (admin.from("meal_poll_responses" as any) as any)
        .select("*")
        .eq("poll_id", poll.id);

      if (respErr) {
        console.error("getMealPollSummary responses error:", respErr);
      } else {
        responses = respData || [];
      }
    }

    const responseMap = new Map<string, { vote: "yes" | "no"; votedAt: string }>();
    responses.forEach((r) => {
      responseMap.set(r.tenant_id, { vote: r.vote as "yes" | "no", votedAt: r.updated_at || r.created_at });
    });

    // 4. Categorize into 3 sections
    const yesList: TenantHeadcountItem[] = [];
    const noList: TenantHeadcountItem[] = [];
    const notAnsweredList: TenantHeadcountItem[] = [];

    tenants.forEach((t: any) => {
      const resp = responseMap.get(t.id);
      const roomNum = t.rooms?.room_number ? `Room ${t.rooms.room_number}` : "Room Assigned";
      const bedName = t.beds?.bed_name ? `• ${t.beds.bed_name}` : "";

      const item: TenantHeadcountItem = {
        tenantId: t.id,
        fullName: t.full_name || "Resident",
        phone: t.phone || "",
        roomNumber: roomNum,
        bedName: bedName,
        vote: resp ? resp.vote : "not_answered",
        votedAt: resp ? resp.votedAt : null,
      };

      if (resp?.vote === "yes") {
        yesList.push(item);
      } else if (resp?.vote === "no") {
        noList.push(item);
      } else {
        notAnsweredList.push(item);
      }
    });

    return {
      poll,
      isCutoffPassed: isCutoff,
      totalYes: yesList.length,
      totalNo: noList.length,
      totalNotAnswered: notAnsweredList.length,
      totalTenants: tenants.length,
      yesList,
      noList,
      notAnsweredList,
    };
  } catch (err) {
    console.error("getMealPollSummary critical:", err);
    return {
      poll: null,
      isCutoffPassed: false,
      totalYes: 0,
      totalNo: 0,
      totalNotAnswered: 0,
      totalTenants: 0,
      yesList: [],
      noList: [],
      notAnsweredList: [],
    };
  }
}

/**
 * Fetch tenant's personal poll status for today
 */
export async function getTenantMealPollStatus(
  pgId: string,
  tenantId: string,
  mealType: string = "lunch"
): Promise<{
  poll: MealPoll | null;
  isCutoffPassed: boolean;
  tenantVote: "yes" | "no" | null;
  canVote: boolean;
  statusMessage: string;
}> {
  try {
    const poll = await getTodayMealPoll(pgId, mealType);
    if (!poll || !poll.is_active) {
      return {
        poll: null,
        isCutoffPassed: false,
        tenantVote: null,
        canVote: false,
        statusMessage: "No active lunch poll today.",
      };
    }

    const isCutoff = isPollCutoffPassed(poll.poll_date, poll.cutoff_time);
    const admin = createAdminClient();

    // Fetch tenant's response if any
    const { data: response } = await (admin.from("meal_poll_responses" as any) as any)
      .select("vote")
      .eq("poll_id", poll.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    const vote: "yes" | "no" | null = response?.vote || null;
    const canVote = poll.is_active && !isCutoff;

    let statusMessage = "";
    if (canVote) {
      if (vote === "yes") {
        statusMessage = "Aapne YES vote kiya hai (Lunch confirmed). Aap deadline tak apna vote change kar sakte hain.";
      } else if (vote === "no") {
        statusMessage = "Aapne NO vote kiya hai (Not eating). Aap deadline tak apna vote change kar sakte hain.";
      } else {
        statusMessage = `Please vote before ${poll.cutoff_time} AM.`;
      }
    } else {
      // Cutoff passed
      if (vote === "yes") {
        statusMessage = `Aapne YES vote kiya tha. Aapka lunch confirm ho chuka hai (${poll.cutoff_time} AM cut-off passed).`;
      } else if (vote === "no") {
        statusMessage = `Aapne NO vote kiya tha. Aapka lunch skip kar diya gaya hai.`;
      } else {
        statusMessage = `Aapne ${poll.cutoff_time} AM tak vote nahi kiya tha. Wastage prevent karne ke liye default: NO (Not eating) mark hua hai.`;
      }
    }

    return {
      poll,
      isCutoffPassed: isCutoff,
      tenantVote: vote,
      canVote,
      statusMessage,
    };
  } catch (err) {
    console.error("getTenantMealPollStatus error:", err);
    return {
      poll: null,
      isCutoffPassed: false,
      tenantVote: null,
      canVote: false,
      statusMessage: "Unable to load meal poll.",
    };
  }
}

/**
 * Submit or update a tenant's meal poll vote
 */
export async function submitTenantMealVote(
  pollId: string,
  tenantId: string,
  vote: "yes" | "no",
  userId?: string
): Promise<{ success: boolean; vote: "yes" | "no"; error?: string }> {
  try {
    const admin = createAdminClient();

    // Verify poll exists and is still open
    const { data: poll, error: pollErr } = await (admin.from("meal_polls" as any) as any)
      .select("id, poll_date, cutoff_time, is_active")
      .eq("id", pollId)
      .maybeSingle();

    if (pollErr || !poll) {
      return { success: false, vote, error: "Poll not found." };
    }

    if (!poll.is_active) {
      return { success: false, vote, error: "Poll has been deactivated by the management." };
    }

    if (isPollCutoffPassed(poll.poll_date, poll.cutoff_time)) {
      return {
        success: false,
        vote,
        error: `Voting is closed! Cut-off time (${poll.cutoff_time} AM) has passed.`,
      };
    }

    // Upsert vote response
    const { error: upsertErr } = await (admin.from("meal_poll_responses" as any) as any).upsert(
      {
        poll_id: pollId,
        tenant_id: tenantId,
        user_id: userId || null,
        vote: vote,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "poll_id,tenant_id" }
    );

    if (upsertErr) {
      return { success: false, vote, error: upsertErr.message };
    }

    return { success: true, vote };
  } catch (err: any) {
    console.error("submitTenantMealVote critical error:", err);
    return { success: false, vote, error: err?.message || "Failed to submit vote." };
  }
}
