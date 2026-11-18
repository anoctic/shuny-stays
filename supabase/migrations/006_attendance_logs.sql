-- ==============================================================================
-- ApnaPG SaaS — Migration 006: Attendance Management & Logs
-- Supports: 4 Statuses (present, absent, day_pass, night_pass), bed hierarchy linking,
-- and live tenant reflection.
-- ==============================================================================

-- 1. Create enum for attendance status safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'day_pass', 'night_pass');
  END IF;
END $$;

-- 2. Create attendance_logs table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES public.beds(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  marked_by_role public.user_role,
  pass_id UUID REFERENCES public.gate_passes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, attendance_date)
);

-- 3. Indexes for rapid lookups
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON public.attendance_logs(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_tenant ON public.attendance_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_bed ON public.attendance_logs(bed_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_status ON public.attendance_logs(status);

-- 4. Enable RLS
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "attendance_logs_tenant_select" ON public.attendance_logs;
CREATE POLICY "attendance_logs_tenant_select" ON public.attendance_logs
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "attendance_logs_staff_upsert" ON public.attendance_logs;
CREATE POLICY "attendance_logs_staff_upsert" ON public.attendance_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'super_admin'))
  );
