export interface TenantCycleStatus {
  cycleStartDate: string;
  formattedStartDate: string;
  cycleEndDate: string;
  formattedEndDate: string;
  daysLeft: number;
  bucket: "expired" | "3days" | "7days" | "safe";
  badgeText: string;
}

export interface PgExpiryCountdown {
  expiryDate: string;
  formattedDate: string;
  daysLeft: number;
  status: "expired" | "critical" | "warning" | "active";
  label: string;
}

/**
 * Returns today's date in Asia/Kolkata (IST) as YYYY-MM-DD.
 */
export function getTodayISTDateString(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value || "2026";
  const m = parts.find((p) => p.type === "month")?.value || "01";
  const d = parts.find((p) => p.type === "day")?.value || "01";
  return `${y}-${m}-${d}`;
}

function parseYmd(ymd: string): { year: number; month: number; day: number } {
  const clean = (ymd || "").slice(0, 10);
  const [y, m, d] = clean.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) {
    return parseYmd(getTodayISTDateString());
  }
  return { year: y, month: m, day: d };
}

function formatYmd(year: number, month1Based: number, day: number): string {
  const dt = new Date(Date.UTC(year, month1Based - 1, 1));
  const targetYear = dt.getUTCFullYear();
  const targetMonth0 = dt.getUTCMonth();
  const lastDay = new Date(Date.UTC(targetYear, targetMonth0 + 1, 0)).getUTCDate();
  const clampedDay = Math.min(Math.max(1, day), lastDay);
  return `${targetYear}-${String(targetMonth0 + 1).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
}

function addDaysYmd(ymd: string, days: number): string {
  const p = parseYmd(ymd);
  const dt = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function diffDaysYmd(targetYmd: string, baseYmd: string): number {
  const a = parseYmd(targetYmd);
  const b = parseYmd(baseYmd);
  const utcA = Date.UTC(a.year, a.month - 1, a.day);
  const utcB = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((utcA - utcB) / 86400000);
}

function formatReadableDate(ymd: string): string {
  const p = parseYmd(ymd);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Computes when the tenant's current monthly stay cycle ends (and how many days remain).
 */
export function computeTenantCycleStatus(params: {
  checkInDate?: string | null;
  rentPaid?: boolean;
  lastPaidAt?: string | null;
}): TenantCycleStatus {
  const today = getTodayISTDateString();
  const checkInRaw = (params.checkInDate || "").slice(0, 10);
  const checkIn = /^\d{4}-\d{2}-\d{2}$/.test(checkInRaw) ? checkInRaw : today;

  const checkParts = parseYmd(checkIn);
  const todayParts = parseYmd(today);
  const anchorDay = checkParts.day;

  const firstMonthEnd = formatYmd(checkParts.year, checkParts.month + 1, anchorDay);
  const currMonthAnchor = formatYmd(todayParts.year, todayParts.month, anchorDay);
  const prevMonthAnchor = formatYmd(todayParts.year, todayParts.month - 1, anchorDay);
  const nextMonthAnchor = formatYmd(todayParts.year, todayParts.month + 1, anchorDay);

  let cycleEndDate = firstMonthEnd;

  if (today > firstMonthEnd) {
    const mostRecentAnchor = currMonthAnchor <= today ? currMonthAnchor : prevMonthAnchor;
    const upcomingAnchor = currMonthAnchor > today ? currMonthAnchor : nextMonthAnchor;
    const lastPaidYmd = (params.lastPaidAt || "").slice(0, 10);
    const hasRecentPayment =
      Boolean(params.rentPaid) ||
      (/^\d{4}-\d{2}-\d{2}$/.test(lastPaidYmd) && diffDaysYmd(lastPaidYmd, mostRecentAnchor) >= -5);

    cycleEndDate = hasRecentPayment ? upcomingAnchor : mostRecentAnchor;
  }

  const daysLeft = diffDaysYmd(cycleEndDate, today);

  let bucket: TenantCycleStatus["bucket"] = "safe";
  let badgeText = `${daysLeft} Days Left`;

  if (daysLeft < 0) {
    bucket = "expired";
    const overdue = Math.abs(daysLeft);
    badgeText = `Expired ${overdue}d ago`;
  } else if (daysLeft === 0) {
    bucket = "3days";
    badgeText = "Ends Today";
  } else if (daysLeft <= 3) {
    bucket = "3days";
    badgeText = daysLeft === 1 ? "1 Day Left" : `${daysLeft} Days Left`;
  } else if (daysLeft <= 7) {
    bucket = "7days";
    badgeText = `${daysLeft} Days Left`;
  }

  const endParts = parseYmd(cycleEndDate);
  const cycleStartDate = formatYmd(endParts.year, endParts.month - 1, checkParts.day);

  return {
    cycleStartDate,
    formattedStartDate: formatReadableDate(cycleStartDate),
    cycleEndDate,
    formattedEndDate: formatReadableDate(cycleEndDate),
    daysLeft,
    bucket,
    badgeText,
  };
}

/**
 * Computes subscription expiry date and days remaining for a PG Owner in Super Admin.
 */
export function computePgExpiryCountdown(
  expiresAt?: string | null,
  createdAt?: string | null
): PgExpiryCountdown {
  const today = getTodayISTDateString();
  const explicitYmd = (expiresAt || "").slice(0, 10);
  let expiryDate: string;

  if (/^\d{4}-\d{2}-\d{2}$/.test(explicitYmd)) {
    expiryDate = explicitYmd;
  } else {
    const createdYmd = (createdAt || "").slice(0, 10);
    const base = /^\d{4}-\d{2}-\d{2}$/.test(createdYmd) ? createdYmd : today;
    expiryDate = addDaysYmd(base, 30);
  }

  const daysLeft = diffDaysYmd(expiryDate, today);

  let status: PgExpiryCountdown["status"] = "active";
  let label = `${daysLeft} Days Left`;

  if (daysLeft < 0) {
    status = "expired";
    label = `Expired ${Math.abs(daysLeft)}d ago`;
  } else if (daysLeft === 0) {
    status = "critical";
    label = "Expires Today";
  } else if (daysLeft <= 3) {
    status = "critical";
    label = daysLeft === 1 ? "1 Day Left" : `${daysLeft} Days Left`;
  } else if (daysLeft <= 7) {
    status = "warning";
    label = `${daysLeft} Days Left`;
  }

  return {
    expiryDate,
    formattedDate: formatReadableDate(expiryDate),
    daysLeft,
    status,
    label,
  };
}
