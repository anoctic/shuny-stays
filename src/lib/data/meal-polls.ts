import { createAdminClient } from "@/lib/supabase/admin";
import {
  MealPoll,
  MealPollSummary,
  MealPollHistoryItem,
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
 * - "upcoming": Current time is before Start Time (e.g. before 06:00 AM)
 * - "open": Currently active between Start Time and Cut-off time
 * - "closed": Cut-off time has passed for today
 */
export function getPollScheduleStatus(
  pollDate: string,
  startTime: string = "06:00",
  cutoffTime: string = "10:00"
): {
  status: "upcoming" | "open" | "closed";
  isCutoffPassed: boolean;
  currentMinutes: number;
  startMinutes: number;
  cutoffMinutes: number;
} {
  const { todayIST, currentMinutes } = getISTTimeParts();

  const [startH, startM] = (startTime || "06:00").split(":").map((v) => parseInt(v, 10));
  const startMinutes = (startH || 6) * 60 + (startM || 0);

  const [cutoffH, cutoffM] = (cutoffTime || "10:00").split(":").map((v) => parseInt(v, 10));
  const cutoffMinutes = (cutoffH || 10) * 60 + (cutoffM || 0);

  if (todayIST > pollDate) {
    return { status: "closed", isCutoffPassed: true, currentMinutes, startMinutes, cutoffMinutes };
  }
  if (todayIST < pollDate) {
    return { status: "upcoming", isCutoffPassed: false, currentMinutes, startMinutes, cutoffMinutes };
  }

  // Today
  if (currentMinutes < startMinutes) {
    return { status: "upcoming", isCutoffPassed: false, currentMinutes, startMinutes, cutoffMinutes };
  } else if (currentMinutes >= cutoffMinutes) {
    return { status: "closed", isCutoffPassed: true, currentMinutes, startMinutes, cutoffMinutes };
  } else {
    return { status: "open", isCutoffPassed: false, currentMinutes, startMinutes, cutoffMinutes };
  }
}

/**
 * Checks whether the cut-off time for a poll has passed in IST
 */
export function isPollCutoffPassed(
  pollDate: string,
  cutoffTime: string = "10:00",
  startTime: string = "06:00"
): boolean {
  return getPollScheduleStatus(pollDate, startTime, cutoffTime).isCutoffPassed;
}

/**
 * Check if the PG has the Meal Poll Facility enabled by Super Admin and get its default schedule
 */
export async function getPgMealSettings(pgId: string): Promise<{
  isEnabled: boolean;
  defaultStartTime: string;
  defaultCutoffTime: string;
}> {
  try {
    const admin = createAdminClient();
    const { data } = await (admin.from("pgs" as any) as any)
      .select("meal_poll_enabled, meal_poll_start_time, meal_poll_cutoff")
      .eq("id", pgId)
      .maybeSingle();

    if (!data) {
      return { isEnabled: true, defaultStartTime: "06:00", defaultCutoffTime: "10:00" };
    }

    return {
      isEnabled: data.meal_poll_enabled !== false,
      defaultStartTime: data.meal_poll_start_time || "06:00",
      defaultCutoffTime: data.meal_poll_cutoff || "10:00",
    };
  } catch (err) {
    console.error("getPgMealSettings check error:", err);
    return { isEnabled: true, defaultStartTime: "06:00", defaultCutoffTime: "10:00" };
  }
}

/**
 * Fetch or auto-initialize today's meal poll for a PG
 * Starts automatically at designated start_time (default 06:00 AM IST) and closes at cutoff_time
 */
export async function getTodayMealPoll(
  pgId: string,
  mealType: string = "lunch"
): Promise<MealPoll | null> {
  try {
    const admin = createAdminClient();
    const today = getTodayDateIST();

    // 1. Check facility and default schedule for this PG
    const settings = await getPgMealSettings(pgId);
    if (!settings.isEnabled) {
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
      const startTime = data.start_time || settings.defaultStartTime || "06:00";
      const cutoffTime = data.cutoff_time || settings.defaultCutoffTime || "10:00";
      const { isCutoffPassed } = getPollScheduleStatus(data.poll_date, startTime, cutoffTime);

      return {
        id: data.id,
        pg_id: data.pg_id,
        poll_date: data.poll_date,
        meal_type: data.meal_type,
        title: data.title || "Dopahar Ka Khana (Lunch Poll)",
        start_time: startTime,
        cutoff_time: cutoffTime,
        is_active: data.is_active,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_expired: isCutoffPassed,
      };
    }

    // 3. Auto-initialize today's poll using PG's configured start & cutoff times
    const autoPayload = {
      pg_id: pgId,
      poll_date: today,
      meal_type: mealType,
      title: "Dopahar Ka Khana (Lunch Poll)",
      start_time: settings.defaultStartTime,
      cutoff_time: settings.defaultCutoffTime,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { data: createdPoll, error: createErr } = await (admin.from("meal_polls" as any) as any)
      .upsert(autoPayload, { onConflict: "pg_id,poll_date,meal_type" })
      .select()
      .single();

    if (createErr || !createdPoll) {
      const { isCutoffPassed } = getPollScheduleStatus(
        today,
        settings.defaultStartTime,
        settings.defaultCutoffTime
      );
      return {
        id: `auto-${pgId}-${today}`,
        pg_id: pgId,
        poll_date: today,
        meal_type: mealType,
        title: "Dopahar Ka Khana (Lunch Poll)",
        start_time: settings.defaultStartTime,
        cutoff_time: settings.defaultCutoffTime,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_expired: isCutoffPassed,
      };
    }

    const { isCutoffPassed } = getPollScheduleStatus(
      createdPoll.poll_date,
      createdPoll.start_time || settings.defaultStartTime,
      createdPoll.cutoff_time || settings.defaultCutoffTime
    );

    return {
      id: createdPoll.id,
      pg_id: createdPoll.pg_id,
      poll_date: createdPoll.poll_date,
      meal_type: createdPoll.meal_type,
      title: createdPoll.title || "Dopahar Ka Khana (Lunch Poll)",
      start_time: createdPoll.start_time || settings.defaultStartTime,
      cutoff_time: createdPoll.cutoff_time || settings.defaultCutoffTime,
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
 * Toggle or customize meal poll times (Start Time & Cut-off Time) for a PG
 */
export async function toggleMealPoll(params: {
  pgId: string;
  isActive: boolean;
  startTime?: string;
  cutoffTime?: string;
  mealType?: string;
  title?: string;
  userId?: string;
}): Promise<MealPoll> {
  const admin = createAdminClient();
  const today = getTodayDateIST();
  const mealType = params.mealType || "lunch";
  const startTime = params.startTime || "06:00";
  const cutoffTime = params.cutoffTime || "10:00";
  const title = params.title || "Dopahar Ka Khana (Lunch Poll)";

  const payload = {
    pg_id: params.pgId,
    poll_date: today,
    meal_type: mealType,
    title: title,
    start_time: startTime,
    cutoff_time: cutoffTime,
    is_active: params.isActive,
    created_by: params.userId || null,
    updated_at: new Date().toISOString(),
  };

  // 1. Upsert today's poll row
  const { data, error } = await (admin.from("meal_polls" as any) as any)
    .upsert(payload, { onConflict: "pg_id,poll_date,meal_type" })
    .select()
    .single();

  // 2. Persist preferred start_time and cutoff on pgs table as default for future days
  await (admin.from("pgs" as any) as any)
    .update({
      meal_poll_start_time: startTime,
      meal_poll_cutoff: cutoffTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.pgId);

  if (error || !data) {
    console.error("toggleMealPoll error:", error);
    const { isCutoffPassed } = getPollScheduleStatus(today, startTime, cutoffTime);
    return {
      id: `poll-${params.pgId}-${today}`,
      pg_id: params.pgId,
      poll_date: today,
      meal_type: mealType,
      title,
      start_time: startTime,
      cutoff_time: cutoffTime,
      is_active: params.isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_expired: isCutoffPassed,
    };
  }

  const { isCutoffPassed } = getPollScheduleStatus(
    data.poll_date,
    data.start_time || startTime,
    data.cutoff_time || cutoffTime
  );

  return {
    id: data.id,
    pg_id: data.pg_id,
    poll_date: data.poll_date,
    meal_type: data.meal_type,
    title: data.title,
    start_time: data.start_time || startTime,
    cutoff_time: data.cutoff_time || cutoffTime,
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
    const settings = await getPgMealSettings(pgId);
    if (!settings.isEnabled) {
      return {
        poll: null,
        isCutoffPassed: true,
        scheduleStatus: "closed",
        isFacilityEnabled: false,
        startTime: settings.defaultStartTime || "06:00",
        cutoffTime: settings.defaultCutoffTime || "10:00",
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
    const startTime = poll?.start_time || settings.defaultStartTime || "06:00";
    const cutoffTime = poll?.cutoff_time || settings.defaultCutoffTime || "10:00";
    const today = getTodayDateIST();

    const { status: scheduleStatus, isCutoffPassed } = getPollScheduleStatus(
      poll?.poll_date || today,
      startTime,
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
      startTime,
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
      startTime: "06:00",
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
 * Fetch Date-wise Meal Poll History for Admin / Owner
 * Returns all past polls with detailed YES / NO / NOT ANSWERED lists
 */
export async function getMealPollHistory(
  pgId: string,
  limit: number = 30
): Promise<MealPollHistoryItem[]> {
  try {
    const admin = createAdminClient();

    // 1. Fetch polls for this PG ordered newest to oldest
    const { data: pollsData, error: pollsErr } = await (admin.from("meal_polls" as any) as any)
      .select("id, poll_date, start_time, cutoff_time, is_active, created_at")
      .eq("pg_id", pgId)
      .order("poll_date", { ascending: false })
      .limit(limit);

    if (pollsErr || !pollsData || pollsData.length === 0) {
      return [];
    }

    // 2. Fetch all tenants for this PG
    const { data: tenantsData } = await (admin.from("tenants" as any) as any)
      .select(`
        id,
        full_name,
        phone,
        rooms (room_number),
        beds (bed_name)
      `)
      .eq("pg_id", pgId)
      .order("full_name", { ascending: true });

    const tenants = tenantsData || [];

    // 3. Fetch responses for all these polls in one batch
    const pollIds = pollsData.map((p: any) => p.id);
    const { data: responsesData } = await (admin.from("meal_poll_responses" as any) as any)
      .select("poll_id, tenant_id, vote, updated_at, created_at")
      .in("poll_id", pollIds);

    // Map: poll_id -> Map<tenant_id, voteInfo>
    const pollResponsesMap = new Map<string, Map<string, { vote: "yes" | "no"; votedAt: string }>>();
    (responsesData || []).forEach((r: any) => {
      if (!pollResponsesMap.has(r.poll_id)) {
        pollResponsesMap.set(r.poll_id, new Map());
      }
      pollResponsesMap.get(r.poll_id)!.set(r.tenant_id, {
        vote: r.vote as "yes" | "no",
        votedAt: r.updated_at || r.created_at,
      });
    });

    // 4. Construct history items
    const historyList: MealPollHistoryItem[] = pollsData.map((p: any) => {
      const respMap = pollResponsesMap.get(p.id) || new Map();
      const yesList: TenantHeadcountItem[] = [];
      const noList: TenantHeadcountItem[] = [];
      const notAnsweredList: TenantHeadcountItem[] = [];

      tenants.forEach((t: any) => {
        const resp = respMap.get(t.id);
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
        id: p.id,
        pollDate: p.poll_date,
        startTime: p.start_time || "06:00",
        cutoffTime: p.cutoff_time || "10:00",
        totalYes: yesList.length,
        totalNo: noList.length,
        totalNotAnswered: notAnsweredList.length,
        totalTenants: tenants.length,
        yesList,
        noList,
        notAnsweredList,
      };
    });

    return historyList;
  } catch (err) {
    console.error("getMealPollHistory critical error:", err);
    return [];
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
    const settings = await getPgMealSettings(pgId);
    if (!settings.isEnabled) {
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

    const startTime = poll.start_time || settings.defaultStartTime || "06:00";
    const cutoffTime = poll.cutoff_time || settings.defaultCutoffTime || "10:00";

    const { status: scheduleStatus, isCutoffPassed } = getPollScheduleStatus(
      poll.poll_date,
      startTime,
      cutoffTime
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
      statusMessage = `Aaj ka lunch poll subah ${startTime} AM par open hoga (Cut-off: ${cutoffTime} AM).`;
    } else if (scheduleStatus === "open") {
      if (vote === "yes") {
        statusMessage = `Aapne YES vote kiya hai (Lunch confirmed). Aap ${cutoffTime} AM tak apna vote change kar sakte hain.`;
      } else if (vote === "no") {
        statusMessage = `Aapne NO vote kiya hai (Not eating). Aap ${cutoffTime} AM tak apna vote change kar sakte hain.`;
      } else {
        statusMessage = `Voting open hai! Please ${cutoffTime} AM se pehle vote karein.`;
      }
    } else {
      // Closed / Cutoff passed
      if (vote === "yes") {
        statusMessage = `Aapne YES vote kiya tha. Aapka lunch confirm ho chuka hai (${cutoffTime} AM cut-off passed).`;
      } else if (vote === "no") {
        statusMessage = `Aapne NO vote kiya tha. Aapka lunch skip kar diya gaya hai.`;
      } else {
        statusMessage = `Aapne ${cutoffTime} AM tak vote nahi kiya tha. Food wastage rokne ke liye system ne aapka vote automatically NO (Not Eating) mark kar diya hai.`;
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
      .select("id, poll_date, start_time, cutoff_time, is_active")
      .eq("id", pollId)
      .maybeSingle();

    if (pollErr || !poll) {
      return { success: false, vote, error: "Poll not found." };
    }

    if (!poll.is_active) {
      return { success: false, vote, error: "Poll has been deactivated by management." };
    }

    const startTime = poll.start_time || "06:00";
    const cutoffTime = poll.cutoff_time || "10:00";

    const { status: scheduleStatus, isCutoffPassed } = getPollScheduleStatus(
      poll.poll_date,
      startTime,
      cutoffTime
    );

    if (scheduleStatus === "upcoming") {
      return {
        success: false,
        vote,
        error: `Voting has not started yet. Poll will open automatically at ${startTime} AM IST.`,
      };
    }

    if (isCutoffPassed || scheduleStatus === "closed") {
      return {
        success: false,
        vote,
        error: `Voting is closed! Cut-off deadline (${cutoffTime} AM) has passed.`,
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
