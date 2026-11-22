export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface MealPoll {
  id: string;
  pg_id: string;
  poll_date: string; // YYYY-MM-DD
  meal_type: string; // "lunch"
  title: string; // "Dopahar Ka Khana (Lunch Poll)"
  cutoff_time: string; // "10:00"
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  is_expired?: boolean;
}

export interface TenantPollResponse {
  id: string;
  poll_id: string;
  tenant_id: string;
  user_id?: string | null;
  vote: "yes" | "no";
  created_at: string;
  updated_at: string;
}

export interface TenantHeadcountItem {
  tenantId: string;
  fullName: string;
  phone: string;
  roomNumber: string;
  bedName: string;
  vote: "yes" | "no" | "not_answered";
  votedAt?: string | null;
}

export interface MealPollSummary {
  poll: MealPoll | null;
  isCutoffPassed: boolean;
  scheduleStatus: "upcoming" | "open" | "closed";
  isFacilityEnabled: boolean;
  autoStartTime: string; // "06:00"
  cutoffTime: string; // "10:00"
  totalYes: number;
  totalNo: number;
  totalNotAnswered: number;
  totalTenants: number;
  yesList: TenantHeadcountItem[];
  noList: TenantHeadcountItem[];
  notAnsweredList: TenantHeadcountItem[];
}

export interface TenantMealPollStatusResult {
  poll: MealPoll | null;
  isFacilityEnabled: boolean;
  scheduleStatus: "upcoming" | "open" | "closed";
  isCutoffPassed: boolean;
  tenantVote: "yes" | "no" | null;
  canVote: boolean;
  statusMessage: string;
}
