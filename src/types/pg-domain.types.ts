// Domain Types for Multi-Tenant Paying Guest (PG) Accommodation

export type GenderType = 'male' | 'female' | 'coliving' | 'unisex';
export type RoomType = 'single' | 'double' | 'triple' | 'four_sharing' | 'dormitory';
export type BedStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';
export type LeaseStatus = 'active' | 'notice_period' | 'completed' | 'terminated';
export type InvoiceStatus = 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintCategory = 'plumbing' | 'electrical' | 'carpentry' | 'cleaning' | 'wifi' | 'appliance' | 'security' | 'other';
export type UserRole = 'super_admin' | 'owner' | 'resident';
export type MembershipRole = 'super_admin' | 'owner' | 'resident';

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string | null;
  role: MembershipRole;
  is_active: boolean;
  created_at: string;
  organization?: Organization | null;
}

export interface UserSessionProfile {
  id: string;
  email: string;
  full_name: string;
  role: MembershipRole;
  organization_id: string | null;
  organization_name?: string;
  is_super_admin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  created_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gender_type: GenderType;
  total_floors: number;
  warden_name?: string;
  warden_phone?: string;
  amenities: string[];
  rules: string[];
  is_active: boolean;
  created_at: string;
  // Computed aggregations
  total_rooms?: number;
  total_beds?: number;
  occupied_beds?: number;
  vacant_beds?: number;
}

export interface Room {
  id: string;
  organization_id: string;
  property_id: string;
  room_number: string;
  floor_number: number;
  room_type: RoomType;
  is_ac: boolean;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  base_rent_paise: number;
  security_deposit_paise: number;
  beds?: Bed[];
}

export interface Bed {
  id: string;
  organization_id: string;
  room_id: string;
  bed_code: string;
  status: BedStatus;
  monthly_rent_paise?: number;
  notes?: string;
}

export interface Resident {
  id: string;
  organization_id: string;
  full_name: string;
  phone: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  work_or_college?: string;
  is_active: boolean;
  created_at: string;
  current_bed?: {
    bed_code: string;
    room_number: string;
    property_name: string;
  };
}

export interface Lease {
  id: string;
  organization_id: string;
  resident_id: string;
  bed_id: string;
  check_in_date: string;
  expected_check_out_date?: string;
  agreed_rent_paise: number;
  security_deposit_paid_paise: number;
  status: LeaseStatus;
}

export interface Invoice {
  id: string;
  organization_id: string;
  resident_id: string;
  invoice_number: string;
  billing_month: string;
  due_date: string;
  rent_amount_paise: number;
  electricity_amount_paise: number;
  total_amount_paise: number;
  status: InvoiceStatus;
  resident_name?: string;
  room_number?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  organization_id: string;
  property_id: string;
  room_id?: string;
  resident_id?: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_to?: string;
  created_at: string;
  property_name?: string;
  resident_name?: string;
}
