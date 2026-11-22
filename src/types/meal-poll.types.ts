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
  totalYes: number;
  totalNo: number;
  totalNotAnswered: number;
  totalTenants: number;
  yesList: TenantHeadcountItem[];
  noList: TenantHeadcountItem[];
  notAnsweredList: TenantHeadcountItem[];
}
