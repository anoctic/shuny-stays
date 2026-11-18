-- ==============================================================================
-- ApnaPG SaaS — Complete Multi-Tenant Database Schema with Row-Level Security
-- Architecture: 5-Level Hierarchy (PG -> Buildings -> Floors -> Rooms -> Beds)
-- Roles: super_admin, owner, admin (warden/manager), tenant
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CLEAN TEARDOWN & RECREATE ENUMS (Fixes existing enum conflict)
-- ==============================================================================

-- Safely drop old prototype tables and views if replacing previous schema
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.mess_menu CASCADE;
DROP TABLE IF EXISTS public.complaints CASCADE;
DROP TABLE IF EXISTS public.rent_payments CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TABLE IF EXISTS public.pg_staff CASCADE;
DROP TABLE IF EXISTS public.beds CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.floors CASCADE;
DROP TABLE IF EXISTS public.buildings CASCADE;
DROP TABLE IF EXISTS public.pgs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop and recreate enums cleanly so no conflicting enum values remain
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.pg_status CASCADE;
DROP TYPE IF EXISTS public.gender_type CASCADE;
DROP TYPE IF EXISTS public.bed_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.payment_mode CASCADE;
DROP TYPE IF EXISTS public.complaint_status CASCADE;
DROP TYPE IF EXISTS public.complaint_priority CASCADE;
DROP TYPE IF EXISTS public.meal_type CASCADE;
DROP TYPE IF EXISTS public.day_of_week CASCADE;

-- 2.1 CREATE ENUMS
CREATE TYPE public.user_role AS ENUM ('super_admin', 'owner', 'admin', 'tenant');
CREATE TYPE public.pg_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE public.gender_type AS ENUM ('boys', 'girls', 'coliving');
CREATE TYPE public.bed_status AS ENUM ('vacant', 'occupied', 'maintenance', 'notice');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'verified', 'rejected');
CREATE TYPE public.payment_mode AS ENUM ('upi', 'cash', 'bank_transfer');
CREATE TYPE public.complaint_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'snacks', 'dinner');
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ==============================================================================
-- 3. TABLES DEFINITION (13 Tables)
-- ==============================================================================

-- 3.1 PROFILES (1:1 with auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'tenant',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 PGS (PG Brand / Top-level Tenant Entity)
CREATE TABLE public.pgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status public.pg_status NOT NULL DEFAULT 'active',
  subscription_tier TEXT NOT NULL DEFAULT 'starter',
  subscription_valid_until TIMESTAMPTZ,
  upi_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 BUILDINGS (Blocks / Wings within a PG)
CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Block A", "Krishna Bhawan"
  gender_type public.gender_type NOT NULL DEFAULT 'coliving',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  warden_name TEXT,
  warden_phone TEXT,
  total_floors INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 FLOORS
CREATE TABLE public.floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL, -- 0 = Ground Floor, 1 = 1st Floor
  floor_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building_id, floor_number)
);

-- 3.5 ROOMS
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  sharing_type INTEGER NOT NULL CHECK (sharing_type >= 1 AND sharing_type <= 10),
  room_type TEXT NOT NULL DEFAULT 'standard',
  is_ac BOOLEAN NOT NULL DEFAULT false,
  has_attached_bathroom BOOLEAN NOT NULL DEFAULT true,
  has_balcony BOOLEAN NOT NULL DEFAULT false,
  base_rent_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  default_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (building_id, room_number)
);

-- 3.6 BEDS
CREATE TABLE public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  bed_name TEXT NOT NULL, -- e.g. "Bed A", "Bed B"
  status public.bed_status NOT NULL DEFAULT 'vacant',
  monthly_rent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, bed_name)
);

-- 3.7 PG_STAFF (Admins / Wardens with Granular Permissions)
CREATE TABLE public.pg_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  assigned_building_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  permissions TEXT[] NOT NULL DEFAULT ARRAY['manage_tenants', 'resolve_complaints']::TEXT[],
  designation TEXT NOT NULL DEFAULT 'Warden',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pg_id, user_id)
);

-- 3.8 TENANTS
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  bed_id UUID UNIQUE NOT NULL REFERENCES public.beds(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  work_or_college TEXT,
  id_proof_type TEXT,
  id_proof_number TEXT,
  id_proof_doc_url TEXT,
  rent_amount NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_out_date DATE,
  is_on_notice BOOLEAN NOT NULL DEFAULT false,
  notice_vacate_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.9 RENT_PAYMENTS
CREATE TABLE public.rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  billing_month DATE NOT NULL,
  due_date DATE NOT NULL,
  rent_amount NUMERIC(10, 2) NOT NULL,
  electricity_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  maintenance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  other_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status public.payment_status NOT NULL DEFAULT 'pending',
  payment_mode public.payment_mode,
  utr_number TEXT,
  screenshot_url TEXT,
  payment_date TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.10 COMPLAINTS
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.11 MESS_MENU (building_id IS NULL applies to ALL buildings; Set applies to that building only)
CREATE TABLE public.mess_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  day_of_week public.day_of_week NOT NULL,
  meal_type public.meal_type NOT NULL,
  menu_items TEXT NOT NULL,
  start_time TIME,
  end_time TIME,
  is_special BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.12 EXPENSES (building_id IS NULL applies to whole PG; Set applies to specific building)
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.13 AUDIT_LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID REFERENCES public.pgs(id) ON DELETE SET NULL,
  building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_table TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. DATABASE TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 4.1 AUTOMATIC BED CREATION TRIGGER
-- When a room is created with sharing_type = N, automatically creates Bed A, Bed B, ... Bed N.
CREATE OR REPLACE FUNCTION public.handle_room_auto_beds()
RETURNS TRIGGER AS $$
DECLARE
  i INTEGER;
  v_bed_name TEXT;
  v_rent_per_bed NUMERIC(10, 2);
BEGIN
  v_rent_per_bed := NEW.base_rent_monthly;

  FOR i IN 1..NEW.sharing_type LOOP
    v_bed_name := 'Bed ' || CHR(64 + i); -- 'Bed A', 'Bed B', 'Bed C', etc.
    INSERT INTO public.beds (
      pg_id,
      building_id,
      room_id,
      bed_name,
      status,
      monthly_rent
    ) VALUES (
      NEW.pg_id,
      NEW.building_id,
      NEW.id,
      v_bed_name,
      'vacant',
      v_rent_per_bed
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_rooms_auto_create_beds ON public.rooms;
CREATE TRIGGER trg_rooms_auto_create_beds
AFTER INSERT ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.handle_room_auto_beds();

-- 4.2 AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'tenant'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.3 AUTOMATIC BED STATUS SYNC ON TENANT CHECK-IN / NOTICE / VACATE
CREATE OR REPLACE FUNCTION public.handle_tenant_bed_status_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.beds
    SET status = 'occupied', updated_at = now()
    WHERE id = NEW.bed_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_active = false OR NEW.check_out_date IS NOT NULL THEN
      UPDATE public.beds
      SET status = 'vacant', updated_at = now()
      WHERE id = NEW.bed_id;
    ELSIF NEW.is_on_notice = true AND OLD.is_on_notice = false THEN
      UPDATE public.beds
      SET status = 'notice', updated_at = now()
      WHERE id = NEW.bed_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_tenants_sync_bed ON public.tenants;
CREATE TRIGGER trg_tenants_sync_bed
AFTER INSERT OR UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.handle_tenant_bed_status_sync();

-- ==============================================================================
-- 5. RLS SECURITY DEFINER HELPER FUNCTIONS (Prevents Infinite Recursion)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_owner_pg_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM public.pgs WHERE owner_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_staff_building_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(assigned_building_ids, ARRAY[]::UUID[])
  FROM public.pg_staff
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_staff_pg_id()
RETURNS UUID AS $$
  SELECT pg_id
  FROM public.pg_staff
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_tenant_record()
RETURNS TABLE (t_id UUID, t_pg_id UUID, t_building_id UUID, t_bed_id UUID) AS $$
  SELECT id, pg_id, building_id, bed_id
  FROM public.tenants
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pg_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6.1 PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_super_admin() OR EXISTS (SELECT 1 FROM public.pgs WHERE owner_id = auth.uid()));

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_super_admin())
WITH CHECK (id = auth.uid() OR public.is_super_admin());

-- 6.2 PGS
CREATE POLICY "pgs_super_admin_all" ON public.pgs FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "pgs_owner_all" ON public.pgs FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "pgs_staff_select" ON public.pgs FOR SELECT TO authenticated
USING (id = public.get_staff_pg_id());

CREATE POLICY "pgs_tenant_select" ON public.pgs FOR SELECT TO authenticated
USING (id IN (SELECT t_pg_id FROM public.get_tenant_record()));

-- 6.3 BUILDINGS
CREATE POLICY "buildings_super_admin_all" ON public.buildings FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "buildings_owner_all" ON public.buildings FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "buildings_staff_select" ON public.buildings FOR SELECT TO authenticated
USING (id = ANY(public.get_staff_building_ids()));

CREATE POLICY "buildings_tenant_select" ON public.buildings FOR SELECT TO authenticated
USING (id IN (SELECT t_building_id FROM public.get_tenant_record()));

-- 6.4 FLOORS
CREATE POLICY "floors_super_admin_all" ON public.floors FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "floors_owner_all" ON public.floors FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "floors_staff_all" ON public.floors FOR ALL TO authenticated
USING (building_id = ANY(public.get_staff_building_ids()))
WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

CREATE POLICY "floors_tenant_select" ON public.floors FOR SELECT TO authenticated
USING (building_id IN (SELECT t_building_id FROM public.get_tenant_record()));

-- 6.5 ROOMS
CREATE POLICY "rooms_super_admin_all" ON public.rooms FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "rooms_owner_all" ON public.rooms FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "rooms_staff_all" ON public.rooms FOR ALL TO authenticated
USING (building_id = ANY(public.get_staff_building_ids()))
WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

CREATE POLICY "rooms_tenant_select" ON public.rooms FOR SELECT TO authenticated
USING (building_id IN (SELECT t_building_id FROM public.get_tenant_record()));

-- 6.6 BEDS
CREATE POLICY "beds_super_admin_all" ON public.beds FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "beds_owner_all" ON public.beds FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "beds_staff_all" ON public.beds FOR ALL TO authenticated
USING (building_id = ANY(public.get_staff_building_ids()))
WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

CREATE POLICY "beds_tenant_select" ON public.beds FOR SELECT TO authenticated
USING (id IN (SELECT t_bed_id FROM public.get_tenant_record()));

-- 6.7 PG_STAFF
CREATE POLICY "pg_staff_super_admin_all" ON public.pg_staff FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "pg_staff_owner_all" ON public.pg_staff FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "pg_staff_self_select" ON public.pg_staff FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 6.8 TENANTS
CREATE POLICY "tenants_super_admin_all" ON public.tenants FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "tenants_owner_all" ON public.tenants FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "tenants_staff_all" ON public.tenants FOR ALL TO authenticated
USING (building_id = ANY(public.get_staff_building_ids()))
WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

CREATE POLICY "tenants_self_select" ON public.tenants FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "tenants_self_update" ON public.tenants FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6.9 RENT_PAYMENTS
CREATE POLICY "rent_payments_super_admin_all" ON public.rent_payments FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "rent_payments_owner_all" ON public.rent_payments FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "rent_payments_staff_all" ON public.rent_payments FOR ALL TO authenticated
USING (building_id = ANY(public.get_staff_building_ids()))
WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

CREATE POLICY "rent_payments_tenant_select" ON public.rent_payments FOR SELECT TO authenticated
USING (tenant_id IN (SELECT t_id FROM public.get_tenant_record()));

CREATE POLICY "rent_payments_tenant_update" ON public.rent_payments FOR UPDATE TO authenticated
USING (tenant_id IN (SELECT t_id FROM public.get_tenant_record()))
WITH CHECK (tenant_id IN (SELECT t_id FROM public.get_tenant_record()));

-- 6.10 COMPLAINTS
CREATE POLICY "complaints_super_admin_all" ON public.complaints FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "complaints_owner_all" ON public.complaints FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "complaints_staff_all" ON public.complaints FOR ALL TO authenticated
USING (building_id = ANY(public.get_staff_building_ids()))
WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

CREATE POLICY "complaints_tenant_select" ON public.complaints FOR SELECT TO authenticated
USING (tenant_id IN (SELECT t_id FROM public.get_tenant_record()));

CREATE POLICY "complaints_tenant_insert" ON public.complaints FOR INSERT TO authenticated
WITH CHECK (tenant_id IN (SELECT t_id FROM public.get_tenant_record()));

-- 6.11 MESS_MENU (building_id NULL = PG-wide; building_id UUID = Block-specific)
CREATE POLICY "mess_menu_super_admin_all" ON public.mess_menu FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "mess_menu_owner_all" ON public.mess_menu FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "mess_menu_staff_all" ON public.mess_menu FOR ALL TO authenticated
USING (
  pg_id = public.get_staff_pg_id()
  AND (building_id IS NULL OR building_id = ANY(public.get_staff_building_ids()))
)
WITH CHECK (
  pg_id = public.get_staff_pg_id()
  AND (building_id IS NULL OR building_id = ANY(public.get_staff_building_ids()))
);

CREATE POLICY "mess_menu_tenant_select" ON public.mess_menu FOR SELECT TO authenticated
USING (
  pg_id IN (SELECT t_pg_id FROM public.get_tenant_record())
  AND (building_id IS NULL OR building_id IN (SELECT t_building_id FROM public.get_tenant_record()))
);

-- 6.12 EXPENSES (Staff restricted to assigned buildings; Owner sees whole PG; Tenants denied)
CREATE POLICY "expenses_super_admin_all" ON public.expenses FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "expenses_owner_all" ON public.expenses FOR ALL TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()))
WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "expenses_staff_scoped" ON public.expenses FOR ALL TO authenticated
USING (
  pg_id = public.get_staff_pg_id()
  AND building_id = ANY(public.get_staff_building_ids())
)
WITH CHECK (
  pg_id = public.get_staff_pg_id()
  AND building_id = ANY(public.get_staff_building_ids())
);

-- 6.13 AUDIT_LOGS
CREATE POLICY "audit_logs_super_admin_select" ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_super_admin());

CREATE POLICY "audit_logs_owner_select" ON public.audit_logs FOR SELECT TO authenticated
USING (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- ==============================================================================
-- 7. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_buildings_pg_id ON public.buildings(pg_id);
CREATE INDEX IF NOT EXISTS idx_floors_building_id ON public.floors(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor_id ON public.rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON public.rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON public.beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON public.beds(status);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_bed_id ON public.tenants(bed_id);
CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON public.tenants(building_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant_id ON public.rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_status ON public.rent_payments(status);
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_id ON public.complaints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_mess_menu_lookup ON public.mess_menu(pg_id, building_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_expenses_lookup ON public.expenses(pg_id, building_id, expense_date);
