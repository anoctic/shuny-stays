-- ==============================================================================
-- Migration 008: Strict 4-Tier RBAC Hardening & Live Supabase Persistence
-- ==============================================================================

-- 1. Profiles Strict PG Scoping
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    (id = auth.uid()) OR 
    is_super_admin() OR 
    (pg_id IN (SELECT get_owner_pg_ids())) OR
    (id IN (SELECT user_id FROM public.tenants WHERE pg_id IN (SELECT get_owner_pg_ids()))) OR
    (id IN (SELECT user_id FROM public.pg_staff WHERE pg_id IN (SELECT get_owner_pg_ids()))) OR
    (id IN (SELECT user_id FROM public.tenants WHERE building_id = ANY (get_staff_building_ids())))
  );

-- 2. Gate Passes Policies
ALTER TABLE public.gate_passes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gate_passes_super_admin_all" ON public.gate_passes;
CREATE POLICY "gate_passes_super_admin_all" ON public.gate_passes
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "gate_passes_owner_all" ON public.gate_passes;
CREATE POLICY "gate_passes_owner_all" ON public.gate_passes
  FOR ALL TO authenticated
  USING (pg_id IN (SELECT get_owner_pg_ids()))
  WITH CHECK (pg_id IN (SELECT get_owner_pg_ids()));

DROP POLICY IF EXISTS "gate_passes_staff_all" ON public.gate_passes;
CREATE POLICY "gate_passes_staff_all" ON public.gate_passes
  FOR ALL TO authenticated
  USING (building_id = ANY (get_staff_building_ids()) OR pg_id = get_staff_pg_id())
  WITH CHECK (building_id = ANY (get_staff_building_ids()) OR pg_id = get_staff_pg_id());

DROP POLICY IF EXISTS "gate_passes_tenant_select" ON public.gate_passes;
CREATE POLICY "gate_passes_tenant_select" ON public.gate_passes
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT t_id FROM get_tenant_record()));

DROP POLICY IF EXISTS "gate_passes_tenant_insert" ON public.gate_passes;
CREATE POLICY "gate_passes_tenant_insert" ON public.gate_passes
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT t_id FROM get_tenant_record()));

-- 3. Attendance Logs Policies
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_logs_super_admin_all" ON public.attendance_logs;
CREATE POLICY "attendance_logs_super_admin_all" ON public.attendance_logs
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "attendance_logs_owner_all" ON public.attendance_logs;
CREATE POLICY "attendance_logs_owner_all" ON public.attendance_logs
  FOR ALL TO authenticated
  USING (pg_id IN (SELECT get_owner_pg_ids()))
  WITH CHECK (pg_id IN (SELECT get_owner_pg_ids()));

DROP POLICY IF EXISTS "attendance_logs_staff_all" ON public.attendance_logs;
CREATE POLICY "attendance_logs_staff_all" ON public.attendance_logs
  FOR ALL TO authenticated
  USING (building_id = ANY (get_staff_building_ids()) OR pg_id = get_staff_pg_id())
  WITH CHECK (building_id = ANY (get_staff_building_ids()) OR pg_id = get_staff_pg_id());

DROP POLICY IF EXISTS "attendance_logs_tenant_select" ON public.attendance_logs;
CREATE POLICY "attendance_logs_tenant_select" ON public.attendance_logs
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT t_id FROM get_tenant_record()));

-- 4. Rent Payments Super Admin Policy
DROP POLICY IF EXISTS "rent_payments_super_admin_all" ON public.rent_payments;
CREATE POLICY "rent_payments_super_admin_all" ON public.rent_payments
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- 5. Security Deposits Super Admin Policy
DROP POLICY IF EXISTS "security_deposits_super_admin_all" ON public.security_deposits;
CREATE POLICY "security_deposits_super_admin_all" ON public.security_deposits
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- 6. Subscription Plans Super Admin Policy
DROP POLICY IF EXISTS "subscription_plans_super_admin_all" ON public.subscription_plans;
CREATE POLICY "subscription_plans_super_admin_all" ON public.subscription_plans
  FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
