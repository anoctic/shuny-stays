export type Json =
 | string
 | number
 | boolean
 | null
 | { [key: string]: Json | undefined }
 | Json[]

export interface Database {
 public: {
 Tables: {
 profiles: {
 Row: {
 id: string
 role: 'super_admin' | 'owner' | 'admin' | 'tenant'
 full_name: string
 phone: string | null
 avatar_url: string | null
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
 Update: Partial<Database['public']['Tables']['profiles']['Insert']>
 }
 pgs: {
 Row: {
 id: string
 owner_id: string
 name: string
 slug: string
 logo_url: string | null
 contact_email: string
 contact_phone: string
 status: 'pending' | 'active' | 'suspended'
 subscription_tier: string
 subscription_valid_until: string | null
 upi_id: string | null
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['pgs']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['pgs']['Insert']>
 }
 buildings: {
 Row: {
 id: string
 pg_id: string
 name: string
 gender_type: 'boys' | 'girls' | 'coliving'
 address: string
 city: string
 state: string
 pincode: string
 warden_name: string | null
 warden_phone: string | null
 total_floors: number
 amenities: string[]
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['buildings']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['buildings']['Insert']>
 }
 floors: {
 Row: {
 id: string
 pg_id: string
 building_id: string
 floor_number: number
 floor_name: string
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['floors']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['floors']['Insert']>
 }
 rooms: {
 Row: {
 id: string
 pg_id: string
 building_id: string
 floor_id: string
 room_number: string
 sharing_type: number
 room_type: string
 is_ac: boolean
 has_attached_bathroom: boolean
 has_balcony: boolean
 base_rent_monthly: number
 default_deposit: number
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['rooms']['Insert']>
 }
 beds: {
 Row: {
 id: string
 pg_id: string
 building_id: string
 room_id: string
 bed_name: string
 status: 'vacant' | 'occupied' | 'maintenance' | 'notice'
 monthly_rent: number
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['beds']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['beds']['Insert']>
 }
 pg_staff: {
 Row: {
 id: string
 user_id: string
 pg_id: string
 assigned_building_ids: string[]
 permissions: string[]
 designation: string
 is_active: boolean
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['pg_staff']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['pg_staff']['Insert']>
 }
 tenants: {
 Row: {
 id: string
 user_id: string | null
 pg_id: string
 building_id: string
 room_id: string
 bed_id: string
 full_name: string
 phone: string
 email: string | null
 emergency_contact_name: string | null
 emergency_contact_phone: string | null
 work_or_college: string | null
 id_proof_type: string | null
 id_proof_number: string | null
 id_proof_doc_url: string | null
 rent_amount: number
 deposit_amount: number
 check_in_date: string
 check_out_date: string | null
 is_on_notice: boolean
 notice_vacate_date: string | null
 is_active: boolean
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['tenants']['Insert']>
 }
 rent_payments: {
 Row: {
 id: string
 pg_id: string
 building_id: string
 tenant_id: string
 invoice_number: string
 billing_month: string
 due_date: string
 rent_amount: number
 electricity_amount: number
 maintenance_amount: number
 other_charges: number
 total_amount: number
 amount_paid: number
 status: 'pending' | 'paid' | 'verified' | 'rejected'
 payment_mode: 'upi' | 'cash' | 'bank_transfer' | null
 utr_number: string | null
 screenshot_url: string | null
 payment_date: string | null
 verified_by: string | null
 notes: string | null
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['rent_payments']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['rent_payments']['Insert']>
 }
 complaints: {
 Row: {
 id: string
 pg_id: string
 building_id: string
 room_id: string | null
 tenant_id: string
 category: string
 title: string
 description: string
 image_url: string | null
 priority: 'low' | 'medium' | 'high' | 'urgent'
 status: 'open' | 'in_progress' | 'resolved' | 'closed'
 assigned_to: string | null
 resolved_at: string | null
 resolution_notes: string | null
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['complaints']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['complaints']['Insert']>
 }
 mess_menu: {
 Row: {
 id: string
 pg_id: string
 building_id: string | null
 day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
 meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
 menu_items: string
 start_time: string | null
 end_time: string | null
 is_special: boolean
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['mess_menu']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['mess_menu']['Insert']>
 }
 expenses: {
 Row: {
 id: string
 pg_id: string
 building_id: string | null
 category: string
 title: string
 amount: number
 expense_date: string
 receipt_url: string | null
 recorded_by: string
 notes: string | null
 created_at: string
 updated_at: string
 }
 Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['expenses']['Insert']>
 }
 audit_logs: {
 Row: {
 id: string
 pg_id: string | null
 building_id: string | null
 user_id: string | null
 action: string
 entity_table: string
 entity_id: string | null
 details: Json
 ip_address: string | null
 created_at: string
 }
 Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'> & { id?: string }
 Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
 }
 }
 }
}
