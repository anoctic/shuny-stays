-- ==============================================================================
-- ShunyOS SaaS — Migration 008: Security Deposits & 2-Step Rent Payments
-- Adds security_deposits table and enhances rent_payments with 2-step handover
-- ==============================================================================

-- 1. Create security_deposits table
CREATE TABLE IF NOT EXISTS public.security_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  bed_id UUID,
  expected_amount NUMERIC(10, 2) NOT NULL DEFAULT 8500.00,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'partially_refunded')),
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer')),
  transaction_ref TEXT,
  collected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  collected_by_name TEXT,
  collected_at TIMESTAMPTZ,
  deduction_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  deduction_reason TEXT,
  refunded_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  refunded_at TIMESTAMPTZ,
  refunded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  refunded_by_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_deposits ENABLE ROW LEVEL SECURITY;

-- 2. Security Deposits RLS Policies
DROP POLICY IF EXISTS "security_deposits_super_admin_all" ON public.security_deposits;
CREATE POLICY "security_deposits_super_admin_all" ON public.security_deposits
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "security_deposits_owner_all" ON public.security_deposits;
CREATE POLICY "security_deposits_owner_all" ON public.security_deposits
  FOR ALL TO authenticated
  USING (pg_id IN (SELECT public.get_owner_pg_ids()))
  WITH CHECK (pg_id IN (SELECT public.get_owner_pg_ids()));

DROP POLICY IF EXISTS "security_deposits_staff_all" ON public.security_deposits;
CREATE POLICY "security_deposits_staff_all" ON public.security_deposits
  FOR ALL TO authenticated
  USING (building_id = ANY(public.get_staff_building_ids()))
  WITH CHECK (building_id = ANY(public.get_staff_building_ids()));

DROP POLICY IF EXISTS "security_deposits_tenant_select" ON public.security_deposits;
CREATE POLICY "security_deposits_tenant_select" ON public.security_deposits
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT t_id FROM public.get_tenant_record()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_security_deposits_pg_id ON public.security_deposits(pg_id);
CREATE INDEX IF NOT EXISTS idx_security_deposits_tenant_id ON public.security_deposits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_deposits_status ON public.security_deposits(status);

-- 3. Enhance rent_payments table with 2-step collection & handover metadata
ALTER TABLE public.rent_payments
  ADD COLUMN IF NOT EXISTS collected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS collected_by_name TEXT,
  ADD COLUMN IF NOT EXISTS collected_by_role TEXT,
  ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS settled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS transaction_ref TEXT;

-- 4. Audit Log Helper Function
CREATE OR REPLACE FUNCTION public.log_financial_audit(
  p_pg_id UUID,
  p_text TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (pg_id, text, time)
  VALUES (p_pg_id, p_text, now())
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
