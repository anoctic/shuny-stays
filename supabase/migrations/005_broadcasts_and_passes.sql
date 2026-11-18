-- ==============================================================================
-- 005_broadcasts_and_passes.sql
-- Targeted Platform Broadcasts & Dual Day/Night Pass System with 2-Step Approval
-- ==============================================================================

-- 1. PLATFORM BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.platform_broadcasts (
  id TEXT PRIMARY KEY DEFAULT ('bc-' || substr(md5(random()::text), 1, 9)),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'warning', 'urgent')),
  target_roles public.user_role[] NOT NULL DEFAULT ARRAY['owner', 'admin', 'tenant']::public.user_role[],
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for platform_broadcasts
ALTER TABLE public.platform_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "broadcasts_super_admin_all" ON public.platform_broadcasts
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "broadcasts_read_targeted" ON public.platform_broadcasts
  FOR SELECT TO authenticated
  USING (
    is_active = true 
    AND (target_roles IS NULL OR public.get_auth_role() = ANY(target_roles))
  );

-- 2. GATE PASSES (Day Pass & Night Pass)
CREATE TABLE IF NOT EXISTS public.gate_passes (
  id TEXT PRIMARY KEY DEFAULT ('pass-' || substr(md5(random()::text), 1, 9)),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('day_pass', 'night_pass')),
  pass_number TEXT UNIQUE NOT NULL,
  outing_date DATE NOT NULL,
  expected_return_date DATE NOT NULL,
  departure_time TIME DEFAULT '10:00',
  expected_return_time TIME DEFAULT '20:30',
  actual_departure_at TIMESTAMPTZ,
  actual_return_at TIMESTAMPTZ,
  reason TEXT NOT NULL,
  destination TEXT,
  emergency_phone TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending_owner' CHECK (approval_status IN ('pending_warden', 'pending_owner', 'approved', 'rejected', 'completed')),
  warden_approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  warden_approved_at TIMESTAMPTZ,
  owner_approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_by_role public.user_role NOT NULL DEFAULT 'tenant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gate_passes_tenant_id ON public.gate_passes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gate_passes_building_id ON public.gate_passes(building_id);
CREATE INDEX IF NOT EXISTS idx_gate_passes_status ON public.gate_passes(approval_status);
CREATE INDEX IF NOT EXISTS idx_gate_passes_date ON public.gate_passes(outing_date);

-- RLS for gate_passes
ALTER TABLE public.gate_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gate_passes_super_admin_all" ON public.gate_passes
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "gate_passes_owner_all" ON public.gate_passes
  FOR ALL TO authenticated
  USING (pg_id IN (SELECT public.get_owner_pg_ids()))
  WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

CREATE POLICY "gate_passes_staff_all" ON public.gate_passes
  FOR ALL TO authenticated
  USING (building_id = ANY(public.get_staff_building_ids()))
  WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

CREATE POLICY "gate_passes_tenant_select" ON public.gate_passes
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT t_id FROM public.get_tenant_record()));

CREATE POLICY "gate_passes_tenant_insert" ON public.gate_passes
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT t_id FROM public.get_tenant_record()));
