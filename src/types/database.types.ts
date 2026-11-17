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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          contact_email: string
          contact_phone: string | null
          address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          role: 'super_admin' | 'owner' | 'resident'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>
      }
      properties: {
        Row: {
          id: string
          organization_id: string
          name: string
          code: string
          address: string
          city: string
          state: string
          pincode: string
          gender_type: string
          total_floors: number
          warden_name: string | null
          warden_phone: string | null
          amenities: Json
          rules: Json
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      rooms: {
        Row: {
          id: string
          organization_id: string
          property_id: string
          room_number: string
          floor_number: number
          room_type: string
          is_ac: boolean
          has_attached_bathroom: boolean
          has_balcony: boolean
          base_rent_paise: number
          security_deposit_paise: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
      }
      beds: {
        Row: {
          id: string
          organization_id: string
          room_id: string
          bed_code: string
          status: string
          monthly_rent_paise: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['beds']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['beds']['Insert']>
      }
      residents: {
        Row: {
          id: string
          organization_id: string
          full_name: string
          phone: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          work_or_college: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['residents']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['residents']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          organization_id: string
          resident_id: string
          invoice_number: string
          billing_month: string
          due_date: string
          rent_amount_paise: number
          electricity_amount_paise: number
          total_amount_paise: number
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      complaints: {
        Row: {
          id: string
          organization_id: string
          property_id: string
          room_id: string | null
          resident_id: string | null
          category: string
          title: string
          description: string
          priority: string
          status: string
          assigned_to: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['complaints']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['complaints']['Insert']>
      }
    }
  }
}
