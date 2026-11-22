import { createAdminClient } from "@/lib/supabase/admin";
import {
  MealPoll,
  MealPollSummary,
  TenantHeadcountItem,
  TenantPollResponse,
  TenantMealPollStatusResult,
} from "@/types/meal-poll.types";

/**
 * Returns current IST time breakdown: YYYY-MM-DD, hour (0-23), minute (0-59), and currentMinutes
 */
export function getISTTimeParts(): {
  todayIST: string;
  hour: number;
  minute: number;
  currentMinutes: number;
} {
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
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "00", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "00", 10);

  return {
    todayIST: `${year}-${month}-${day}`,
    hour,
    minute,
    currentMinutes: hour * 60 + minute,
  };
}

/**
 * Returns current date string in IST (Asia/Kolkata) as YYYY-MM-DD
 */
export function getTodayDateIST(): string {
  return getISTTimeParts().todayIST;
}

/**
 * Calculates current schedule status:
 * - "upcoming": Poll is scheduled to auto-open at 06:00 AM IST
 * - "open": Currently active between 06:00 AM and Cut-off time (e.g. 10:00 AM)
 * - "closed": Cut-off time has passed for today
 */
export function getPollScheduleStatus(
  pollDate: string,
  cutoffTime: string = "10:00"
): {
  status: "upcoming" | "open" | "closed";
  isCutoffPassed: boolean;
  currentMinutes: number;
  cutoffMinutes: number;
} {
  const { todayIST, currentMinutes } = getISTTimeParts();

  const [cutoffH, cutoffM] = (cutoffTime || "10:00").split(":").map((v) => parseInt(v, 10));
  const cutoffMinutes = (cutoffH || 10) * 60 + (cutoffM || 0);
  const autoStartMinutes = 6 * 60; // 06:00 AM IST

  if (todayIST > pollDate) {
    return { status: "closed", isCutoffPassed: true, currentMinutes, cutoffMinutes };
  }
  if (todayIST < pollDate) {
    return { status: "upcoming", isCutoffPassed: false, currentMinutes, cutoffMinutes };
  }

  // Today
  if (currentMinutes < autoStartMinutes) {
    return { status: "upcoming", isCutoffPassed: false, currentMinutes, cutoffMinutes };
  } else if (currentMinutes >= cutoffMinutes) {
    return { status: "closed", isCutoffPassed: true, currentMinutes, cutoffMinutes };
  } else {
    return { status: "open", isCutoffPassed: false, currentMinutes, cutoffMinutes };
  }
}

/**
 * Checks whether the cut-off time for a poll has passed in IST
 */
export function isPollCutoffPassed(pollDate: string, cutoffTime: string = "10:00"): boolean {
  return getPollScheduleStatus(pollDate, cutoffTime).isCutoffPassed;
}

/**
 * Check if the PG has the Meal Poll Facility enabled by Super Admin
 */
export async function isMealPollFacilityEnabled(pgId: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("pgs" as any) as any)
      .select("meal_poll_enabled")
      .eq("id", pgId)
      .maybeSingle();

    if (!data) return true; // Default enabled for legacy or demo PGs
    return data.meal_poll_enabled !== false;
  } catch (err) {
    console.error("isMealPollFacilityEnabled check error:", err);
    return true;
  }
}

/**
 * Fetch or auto-initialize today's meal poll for a PG
 * Starts automatically at 06:00 AM IST and closes at the designated cut-off time
 */
export async function getTodayMealPoll(
  pgId: string,
  mealType: string = "lunch"
): Promise<MealPoll | null> {
  try {
    const admin = createAdminClient();
    const today = getTodayDateIST();

    // 1. Check if facility is enabled for this PG
    const isEnabled = await isMealPollFacilityEnabled(pgId);
    if (!isEnabled) {
      return null;
    }

    // 2. Query today's existing poll
    const { data, error } = await (admin.from("meal_polls" as any) as any)
      .select("*")
      .eq("pg_id", pgId)
      .eq("poll_date", today)
      .eq("meal_type", mealType)
      .maybeSingle();

    if (error) {
      console.error("getTodayMealPoll query error:", error);
    }

    if (data) {
      const { isCutoffPassed } = getPollScheduleStatus(data.poll_date, data.cutoff_time);
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
        is_expired: isCutoffPassed,
      };
    }

    // 3. Auto-initialize today's poll: Runs automatically every morning without requiring manual admin start!
    const autoPayload = {
      pg_id: pgId,
      poll_date: today,
      meal_type: mealType,
      title: "Dopahar Ka Khana (Lunch Poll)",
      cutoff_time: "10:00",
      is_active: true, // Automatically active
      updated_at: new Date().toISOString(),
    };

    const { data: createdPoll, error: createErr } = await (admin.from("meal_polls" as any) as any)
      .upsert(autoPayload, { onConflict: "pg_id,poll_date,meal_type" })
      .select()
      .single();

    if (createErr || !createdPoll) {
      // If DB upsert failed, return in-memory active fallback so the user is never blocked
      const { isCutoffPassed } = getPollScheduleStatus(today, "10:00");
      return {
        id: `auto-${pgId}-${today}`,
        pg_id: pgId,
        poll_date: today,
        meal_type: mealType,
        title: "Dopahar Ka Khana (Lunch Poll)",
        cutoff_time: "10:00",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_expired: isCutoffPassed,
      };
    }

    const { isCutoffPassed } = getPollScheduleStatus(createdPoll.poll_date, createdPoll.cutoff_time);
    return {
      id: createdPoll.id,
      pg_id: createdPoll.pg_id,
      poll_date: createdPoll.poll_date,
      meal_type: createdPoll.meal_type,
      title: createdPoll.title || "Dopahar Ka Khana (Lunch Poll)",
      cutoff_time: createdPoll.cutoff_time || "10:00",
      is_active: createdPoll.is_active,
      created_by: createdPoll.created_by,
      created_at: createdPoll.created_at,
      updated_at: createdPoll.updated_at,
      is_expired: isCutoffPassed,
    };
  } catch (err) {
    console.error("getTodayMealPoll critical:", err);
    return null;
  }
}

/**
 * Toggle or customize meal poll for a PG
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
    const { isCutoffPassed } = getPollScheduleStatus(today, cutoffTime);
    return {
      id: `poll-${params.pgId}-${today}`,
      pg_id: params.pgId,
      poll_date: today,
      meal_type: mealType,
      title,
      cutoff_time: cutoffTime,
      is_active: params.isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_expired: isCutoffPassed,
    };
  }

  const { isCutoffPassed } = getPollScheduleStatus(data.poll_date, data.cutoff_time);
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
    is_expired: isCutoffPassed,
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

    // 1. Check if facility is enabled by Super Admin
    const isFacilityEnabled = await isMealPollFacilityEnabled(pgId);
    if (!isFacilityEnabled) {
      return {
        poll: null,
        isCutoffPassed: true,
        scheduleStatus: "closed",
        isFacilityEnabled: false,
        autoStartTime: "06:00",
        cutoffTime: "10:00",
        totalYes: 0,
        totalNo: 0,
        totalNotAnswered: 0,
        totalTenants: 0,
        yesList: [],
        noList: [],
        notAnsweredList: [],
      };
    }

    // 2. Get or auto-initialize today's poll
    const poll = await getTodayMealPoll(pgId, mealType);
    const cutoffTime = poll?.cutoff_time || "10:00";
    const today = getTodayDateIST();
    const { status: scheduleStatus, isCutoffPassed } = getPollScheduleStatus(
      poll?.poll_date || today,
      cutoffTime
    );

    // 3. Fetch all active tenants for this PG
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

    // 4. Fetch poll responses if poll exists
    let responses: TenantPollResponse[] = [];
    if (poll?.id && !poll.id.startsWith("auto-")) {
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
      responseMap.set(r.tenant_id, {
        vote: r.vote as "yes" | "no",
        votedAt: r.updated_at || r.created_at,
      });
    });

    // 5. Categorize into 3 sections (YES, NO, NOT ANSWERED)
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
      isCutoffPassed,
      scheduleStatus,
      isFacilityEnabled: true,
      autoStartTime: "06:00",
      cutoffTime,
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
      scheduleStatus: "closed",
      isFacilityEnabled: true,
      autoStartTime: "06:00",
      cutoffTime: "10:00",
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
): Promise<TenantMealPollStatusResult> {
  try {
    const isEnabled = await isMealPollFacilityEnabled(pgId);
    if (!isEnabled) {
      return {
        poll: null,
        isFacilityEnabled: false,
        scheduleStatus: "closed",
        isCutoffPassed: true,
        tenantVote: null,
        canVote: false,
        statusMessage: "Meal poll facility is disabled by platform administrator.",
      };
    }

    const poll = await getTodayMealPoll(pgId, mealType);
    if (!poll || !poll.is_active) {
      return {
        poll: null,
        isFacilityEnabled: true,
        scheduleStatus: "closed",
        isCutoffPassed: true,
        tenantVote: null,
        canVote: false,
        statusMessage: "No active lunch poll today.",
      };
    }

    const { status: scheduleStatus, isCutoffPassed } = getPollScheduleStatus(
      poll.poll_date,
      poll.cutoff_time
    );

    const admin = createAdminClient();

    // Fetch tenant's vote if any
    let vote: "yes" | "no" | null = null;
    if (poll.id && !poll.id.startsWith("auto-")) {
      const { data: response } = await (admin.from("meal_poll_responses" as any) as any)
        .select("vote")
        .eq("poll_id", poll.id)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      vote = response?.vote || null;
    }

    const canVote = poll.is_active && scheduleStatus === "open";

    let statusMessage = "";
    if (scheduleStatus === "upcoming") {
      statusMessage = `Aaj ka lunch poll subah 06:00 AM par open hoga (Cut-off: ${poll.cutoff_time} AM).`;
    } else if (scheduleStatus === "open") {
      if (vote === "yes") {
        statusMessage = `Aapne YES vote kiya hai (Lunch confirmed). Aap ${poll.cutoff_time} AM tak apna vote change kar sakte hain.`;
      } else if (vote === "no") {
        statusMessage = `Aapne NO vote kiya hai (Not eating). Aap ${poll.cutoff_time} AM tak apna vote change kar sakte hain.`;
      } else {
        statusMessage = `Voting open hai! Please ${poll.cutoff_time} AM se pehle vote karein.`;
      }
    } else {
      // Closed / Cutoff passed
      if (vote === "yes") {
        statusMessage = `Aapne YES vote kiya tha. Aapka lunch confirm ho chuka hai (${poll.cutoff_time} AM cut-off passed).`;
      } else if (vote === "no") {
        statusMessage = `Aapne NO vote kiya tha. Aapka lunch skip kar diya gaya hai.`;
      } else {
        statusMessage = `Aapne ${poll.cutoff_time} AM tak vote nahi kiya tha. Food wastage rokne ke liye system ne aapka vote automatically NO (Not Eating) mark kar diya hai.`;
      }
    }

    return {
      poll,
      isFacilityEnabled: true,
      scheduleStatus,
      isCutoffPassed,
      tenantVote: vote,
      canVote,
      statusMessage,
    };
  } catch (err) {
    console.error("getTenantMealPollStatus error:", err);
    return {
      poll: null,
      isFacilityEnabled: true,
      scheduleStatus: "closed",
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

    // Verify poll exists and is currently in "open" window
    const { data: poll, error: pollErr } = await (admin.from("meal_polls" as any) as any)
      .select("id, poll_date, cutoff_time, is_active")
      .eq("id", pollId)
      .maybeSingle();

    if (pollErr || !poll) {
      return { success: false, vote, error: "Poll not found." };
    }

    if (!poll.is_active) {
      return { success: false, vote, error: "Poll has been deactivated by management." };
    }

    const { status: scheduleStatus, isCutoffPassed } = getPollScheduleStatus(
      poll.poll_date,
      poll.cutoff_time
    );

    if (scheduleStatus === "upcoming") {
      return {
        success: false,
        vote,
        error: "Voting has not started yet. Poll will open automatically at 06:00 AM IST.",
      };
    }

    if (isCutoffPassed || scheduleStatus === "closed") {
      return {
        success: false,
        vote,
        error: `Voting is closed! Cut-off deadline (${poll.cutoff_time} AM) has passed.`,
      };
    }

    // Upsert vote response (safely without foreign key errors)
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
