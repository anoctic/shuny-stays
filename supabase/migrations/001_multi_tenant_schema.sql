-- ==============================================================================
-- 001_multi_tenant_schema.sql
-- Multi-Tenant Schema for Paying Guest (PG) & Hostel Accommodation SaaS
-- Supports PostgreSQL RLS (Row Level Security) and tenant-based data isolation
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizations (Tenants)
-- Each organization represents a distinct PG Owner or Hostel Operator
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    gst_number VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organization Members & Roles (RBAC)
CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'manager', 'warden', 'accountant', 'resident');

CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase
    role public.user_role NOT NULL DEFAULT 'manager',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. Properties (Buildings / PG Hostels under an Organization)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- e.g., "PG-KOR-01"
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    gender_type VARCHAR(20) NOT NULL CHECK (gender_type IN ('male', 'female', 'coliving', 'unisex')),
    total_floors INT NOT NULL DEFAULT 1,
    warden_name VARCHAR(150),
    warden_phone VARCHAR(20),
    amenities JSONB DEFAULT '["Wi-Fi", "Daily Cleaning", "RO Water", "CCTV", "Power Backup"]'::jsonb,
    rules JSONB DEFAULT '["No smoking inside", "Gate closes at 10:30 PM", "Visitors allowed in common area"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rooms in a Property
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    floor_number INT NOT NULL DEFAULT 1,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('single', 'double', 'triple', 'four_sharing', 'dormitory')),
    is_ac BOOLEAN DEFAULT FALSE,
    has_attached_bathroom BOOLEAN DEFAULT TRUE,
    has_balcony BOOLEAN DEFAULT FALSE,
    base_rent_paise BIGINT NOT NULL DEFAULT 800000, -- in minor currency units (paise/cents): 8000.00
    security_deposit_paise BIGINT NOT NULL DEFAULT 1500000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, room_number)
);

-- 5. Beds in a Room
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    bed_code VARCHAR(20) NOT NULL, -- e.g. "A", "B", "C"
    status VARCHAR(30) NOT NULL DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'reserved', 'maintenance')),
    monthly_rent_paise BIGINT, -- overrides room default if non-null
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, bed_code)
);

-- 6. Residents / Paying Guests
CREATE TABLE IF NOT EXISTS public.residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID, -- Optional link to auth.users if tenant has app login
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    id_proof_type VARCHAR(50) DEFAULT 'Aadhaar' CHECK (id_proof_type IN ('Aadhaar', 'PAN', 'Passport', 'VoterID', 'DrivingLicense')),
    id_proof_number VARCHAR(100),
    id_proof_document_url TEXT,
    work_or_college VARCHAR(255),
    permanent_address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Resident Leases & Bed Allocations
CREATE TABLE IF NOT EXISTS public.leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES public.beds(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    expected_check_out_date DATE,
    actual_check_out_date DATE,
    agreed_rent_paise BIGINT NOT NULL,
    security_deposit_paid_paise BIGINT NOT NULL DEFAULT 0,
    security_deposit_refunded_paise BIGINT DEFAULT 0,
    notice_period_days INT DEFAULT 30,
    billing_cycle_day INT DEFAULT 1, -- 1st of each month
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notice_period', 'completed', 'terminated')),
    agreement_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Invoices & Billing
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    billing_month DATE NOT NULL, -- e.g. 2026-11-01
    due_date DATE NOT NULL,
    rent_amount_paise BIGINT NOT NULL,
    electricity_amount_paise BIGINT DEFAULT 0,
    maintenance_amount_paise BIGINT DEFAULT 0,
    food_amount_paise BIGINT DEFAULT 0,
    discount_amount_paise BIGINT DEFAULT 0,
    total_amount_paise BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, invoice_number)
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount_paise BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('upi', 'cash', 'bank_transfer', 'card', 'cheque')),
    payment_reference VARCHAR(150),
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Maintenance & Complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    resident_id UUID REFERENCES public.residents(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('plumbing', 'electrical', 'carpentry', 'cleaning', 'wifi', 'appliance', 'security', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(150),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PostgreSQL Admin Studio - Saved Queries & Telemetry Cache
CREATE TABLE IF NOT EXISTS public.pg_saved_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sql_text TEXT NOT NULL,
    is_safe_select BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance multi-tenant querying
CREATE INDEX IF NOT EXISTS idx_properties_org ON public.properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_rooms_org_prop ON public.rooms(organization_id, property_id);
CREATE INDEX IF NOT EXISTS idx_beds_room ON public.beds(room_id, status);
CREATE INDEX IF NOT EXISTS idx_residents_org ON public.residents(organization_id);
CREATE INDEX IF NOT EXISTS idx_leases_res ON public.leases(resident_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_org_month ON public.invoices(organization_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_complaints_org_status ON public.complaints(organization_id, status);
