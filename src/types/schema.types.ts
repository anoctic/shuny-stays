// ==============================================================================
// ApnaPG SaaS — Complete TypeScript Types for Database Schema
// Hierarchy: PG -> Buildings -> Floors -> Rooms -> Beds
// Roles: super_admin, owner, admin, tenant
// ==============================================================================

export type UserRole = 'super_admin' | 'owner' | 'admin' | 'tenant';
export type PgStatus = 'pending' | 'active' | 'suspended';
export type GenderType = 'boys' | 'girls' | 'coliving';
export type BedStatus = 'vacant' | 'occupied' | 'maintenance' | 'notice';
export type PaymentStatus = 'pending' | 'paid' | 'verified' | 'rejected' | 'collected_by_admin' | 'settled_with_owner';
export type PaymentMode = 'upi' | 'cash' | 'bank_transfer' | 'admin_upi' | 'pg_bank_upi';
export type SecurityDepositStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Profile {
 id: string; // uuid references auth.users
 role: UserRole;
 full_name: string;
 phone: string | null;
 avatar_url: string | null;
 created_at: string;
 updated_at: string;
}

export interface Pg {
 id: string;
 owner_id: string;
 name: string;
 slug: string;
 logo_url: string | null;
 primary_color?: string | null;
 contact_email: string;
 contact_phone: string;
 status: PgStatus;
 subscription_tier: string;
 subscription_valid_until: string | null;
 plan_expires_at?: string | null;
 plan_price?: number | null;
 plan_benefits?: string[] | null;
 owner_initial_password?: string | null;
 city?: string | null;
 upi_id: string | null;
 meal_poll_enabled?: boolean;
 created_at: string;
 updated_at: string;
}

export interface Building {
 id: string;
 pg_id: string;
 name: string; // e.g., "Block A", "Krishna Bhawan"
 gender_type: GenderType;
 address: string;
 city: string;
 state: string;
 pincode: string;
 warden_name: string | null;
 warden_phone: string | null;
 total_floors: number;
 amenities: string[];
 created_at: string;
 updated_at: string;
}

export interface Floor {
 id: string;
 pg_id: string;
 building_id: string;
 floor_number: number;
 floor_name: string;
 created_at: string;
 updated_at: string;
}

export interface Room {
 id: string;
 pg_id: string;
 building_id: string;
 floor_id: string;
 room_number: string;
 sharing_type: number; // 1, 2, 3, etc.
 room_type: string;
 is_ac: boolean;
 has_attached_bathroom: boolean;
 has_balcony: boolean;
 base_rent_monthly: number;
 default_deposit: number;
 created_at: string;
 updated_at: string;
}

export interface Bed {
 id: string;
 pg_id: string;
 building_id: string;
 room_id: string;
 bed_name: string; // 'Bed A', 'Bed B', etc.
 status: BedStatus;
 monthly_rent: number;
 created_at: string;
 updated_at: string;
}

export interface PgStaff {
 id: string;
 user_id: string;
 pg_id: string;
 assigned_building_ids: string[]; // UUID[]
 permissions: string[]; // ['manage_tenants', 'collect_cash', 'resolve_complaints', 'manage_mess']
 designation: string;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface Tenant {
 id: string;
 user_id: string | null;
 pg_id: string;
 building_id: string;
 room_id: string;
 bed_id: string;
 full_name: string;
 phone: string;
 email: string | null;
 emergency_contact_name: string | null;
 emergency_contact_phone: string | null;
 work_or_college: string | null;
 id_proof_type: string | null;
 id_proof_number: string | null;
 id_proof_doc_url: string | null;
 rent_amount: number;
 deposit_amount: number;
 check_in_date: string;
 check_out_date: string | null;
 is_on_notice: boolean;
 notice_vacate_date: string | null;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface RentPayment {
 id: string;
 pg_id: string;
 building_id: string;
 tenant_id: string;
 invoice_number: string;
 billing_month: string;
 due_date: string;
 rent_amount: number;
 electricity_amount: number;
 maintenance_amount: number;
 other_charges: number;
 total_amount: number;
 amount_paid: number;
 status: PaymentStatus;
 payment_mode: PaymentMode | null;
 utr_number: string | null;
 screenshot_url: string | null;
 payment_date: string | null;
 verified_by: string | null;
 collected_by?: string | null;
 collected_by_name?: string | null;
 collected_by_role?: string | null;
 collected_at?: string | null;
 settled_at?: string | null;
 settled_by?: string | null;
 transaction_ref?: string | null;
 notes: string | null;
 created_at: string;
 updated_at: string;
}

export interface SecurityDeposit {
 id: string;
 pg_id: string;
 building_id: string;
 tenant_id: string;
 bed_id?: string | null;
 expected_amount: number;
 paid_amount: number;
 status: SecurityDepositStatus;
 payment_mode?: 'cash' | 'upi' | 'bank_transfer' | null;
 transaction_ref?: string | null;
 collected_by?: string | null;
 collected_by_name?: string | null;
 collected_at?: string | null;
 deduction_amount: number;
 deduction_reason?: string | null;
 refunded_amount: number;
 refunded_at?: string | null;
 refunded_by?: string | null;
 refunded_by_name?: string | null;
 notes?: string | null;
 created_at: string;
 updated_at: string;
}

export interface Complaint {
 id: string;
 pg_id: string;
 building_id: string;
 room_id: string | null;
 tenant_id: string;
 category: string;
 title: string;
 description: string;
 image_url: string | null;
 priority: ComplaintPriority;
 status: ComplaintStatus;
 assigned_to: string | null;
 resolved_at: string | null;
 resolution_notes: string | null;
 created_at: string;
 updated_at: string;
}

export interface MessMenu {
 id: string;
 pg_id: string;
 building_id: string | null; // NULL = all buildings in PG; UUID = specific building
 day_of_week: DayOfWeek;
 meal_type: MealType;
 menu_items: string;
 start_time: string | null;
 end_time: string | null;
 is_special: boolean;
 created_at: string;
 updated_at: string;
}

export interface Expense {
 id: string;
 pg_id: string;
 building_id: string | null; // NULL = all PG; UUID = specific building
 category: string;
 title: string;
 amount: number;
 expense_date: string;
 receipt_url: string | null;
 recorded_by: string;
 notes: string | null;
 created_at: string;
 updated_at: string;
}

export interface AuditLog {
 id: string;
 pg_id: string | null;
 building_id: string | null;
 user_id: string | null;
 action: string;
 entity_table: string;
 entity_id: string | null;
 details: Record<string, any>;
 ip_address: string | null;
 created_at: string;
}

export type BroadcastPriority = 'info' | 'warning' | 'urgent' | 'emergency' | 'normal';

export interface PlatformBroadcast {
 id: string;
 title: string;
 message: string;
 priority: BroadcastPriority;
 target_roles: UserRole[]; // 'owner' | 'admin' | 'tenant' | 'super_admin'
 created_by?: string | null;
 is_active: boolean;
 starts_at: string;
 expires_at?: string | null;
 created_at: string;
}

export type GatePassType = 'day_pass' | 'night_pass';
export type GatePassApprovalStatus = 'pending_warden' | 'pending_owner' | 'approved' | 'rejected' | 'completed';

export interface GatePass {
 id: string;
 pg_id: string;
 building_id: string;
 tenant_id: string;
 tenant_name: string;
 tenant_phone?: string;
 room_number?: string;
 building_name?: string;
 pass_type: GatePassType;
 pass_number: string;
 outing_date: string;
 expected_return_date: string;
 departure_time?: string | null;
 expected_return_time?: string | null;
 reason: string;
 destination?: string | null;
 emergency_phone?: string | null;
 approval_status: GatePassApprovalStatus;
 warden_approved_by?: string | null;
 warden_approved_at?: string | null;
 owner_approved_by?: string | null;
 owner_approved_at?: string | null;
 rejection_reason?: string | null;
 created_by_role: UserRole;
 created_at: string;
 updated_at: string;
}

export type GatePassItem = GatePass;

export type AttendanceStatus = 'present' | 'absent' | 'day_pass' | 'night_pass';

export interface AttendanceLog {
 id: string;
 pg_id: string;
 building_id: string;
 floor_id?: string | null;
 room_id?: string | null;
 bed_id: string;
 tenant_id: string;
 tenant_name?: string;
 room_number?: string;
 bed_name?: string;
 floor_name?: string;
 building_name?: string;
 attendance_date: string;
 status: AttendanceStatus;
 marked_by?: string | null;
 marked_by_role?: UserRole;
 pass_id?: string | null;
 notes?: string | null;
 created_at: string;
 updated_at: string;
}

export interface BedAttendanceItem {
 bed_id: string;
 bed_name: string;
 room_id: string;
 room_number: string;
 sharing_type: number;
 floor_id: string;
 floor_name: string;
 floor_number: number;
 building_id: string;
 building_name: string;
 tenant_id: string;
 tenant_name: string;
 tenant_phone?: string;
 status: AttendanceStatus;
 has_active_pass?: boolean;
 pass_type?: GatePassType | null;
 active_pass_type?: GatePassType | null;
 pass_number?: string | null;
 pass_status?: GatePassApprovalStatus | null;
 updated_at?: string;
}


