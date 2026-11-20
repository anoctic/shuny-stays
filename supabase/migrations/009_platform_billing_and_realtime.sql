-- Migration 009: Platform Billing Settings, PG Subscription Expiry & Renewal Requests, and Realtime Publications

-- 1. Create platform_billing_settings table
CREATE TABLE IF NOT EXISTS public.platform_billing_settings (
  id text PRIMARY KEY DEFAULT 'default',
  upi_id text NOT NULL DEFAULT 'anoctic@oksbi',
  payee_name text NOT NULL DEFAULT 'Shuny Stays Admin',
  account_holder_name text NOT NULL DEFAULT 'Anoctic Technologies',
  bank_name text NOT NULL DEFAULT 'State Bank of India',
  account_number text NOT NULL DEFAULT '39820192831',
  ifsc_code text NOT NULL DEFAULT 'SBIN0001234',
  plan_price numeric NOT NULL DEFAULT 1999,
  plan_duration_days integer NOT NULL DEFAULT 30,
  plan_benefits jsonb NOT NULL DEFAULT '["Full White-label Branding", "Automated WhatsApp Rent Reminders", "Live Attendance & Gate Pass System", "2-Step Cash & UPI Ledger Settlement", "Instant Real-Time Multi-Building Management"]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Seed default settings row if not present
INSERT INTO public.platform_billing_settings (id, upi_id, payee_name, account_holder_name, bank_name, account_number, ifsc_code, plan_price, plan_duration_days, plan_benefits)
VALUES (
  'default',
  'anoctic@oksbi',
  'Shuny Stays Admin',
  'Anoctic Technologies',
  'State Bank of India',
  '39820192831',
  'SBIN0001234',
  1999,
  30,
  '["Full White-label Branding", "Automated WhatsApp Rent Reminders", "Live Attendance & Gate Pass System", "2-Step Cash & UPI Ledger Settlement", "Instant Real-Time Multi-Building Management"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on platform_billing_settings
ALTER TABLE public.platform_billing_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS platform_billing_settings_select ON public.platform_billing_settings;
CREATE POLICY platform_billing_settings_select ON public.platform_billing_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS platform_billing_settings_all_super_admin ON public.platform_billing_settings;
CREATE POLICY platform_billing_settings_all_super_admin ON public.platform_billing_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- 2. Add columns to pgs table
ALTER TABLE public.pgs 
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS plan_price numeric DEFAULT 1999,
  ADD COLUMN IF NOT EXISTS plan_benefits jsonb DEFAULT '["Full White-label Branding", "Automated WhatsApp Rent Reminders", "Live Attendance & Gate Pass System", "2-Step Cash & UPI Ledger Settlement", "Instant Real-Time Multi-Building Management"]'::jsonb;

-- Populate existing PGs plan_expires_at if null
UPDATE public.pgs
SET plan_expires_at = COALESCE(plan_expires_at, subscription_valid_until, now() + interval '30 days')
WHERE plan_expires_at IS NULL;

-- 3. Create pg_subscription_requests table
CREATE TABLE IF NOT EXISTS public.pg_subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id uuid NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE,
  pg_name text NOT NULL,
  submitted_by_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_by_name text NOT NULL,
  submitted_by_role text NOT NULL DEFAULT 'owner',
  amount numeric NOT NULL DEFAULT 1999,
  utr_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on pg_subscription_requests
ALTER TABLE public.pg_subscription_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pg_subscription_requests_super_admin ON public.pg_subscription_requests;
CREATE POLICY pg_subscription_requests_super_admin ON public.pg_subscription_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

DROP POLICY IF EXISTS pg_subscription_requests_owner_insert ON public.pg_subscription_requests;
CREATE POLICY pg_subscription_requests_owner_insert ON public.pg_subscription_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'owner' OR role = 'admin'))
);

DROP POLICY IF EXISTS pg_subscription_requests_owner_select ON public.pg_subscription_requests;
CREATE POLICY pg_subscription_requests_owner_select ON public.pg_subscription_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'owner' OR role = 'admin') AND pg_id = pg_subscription_requests.pg_id)
);

-- 4. Add attendance_logs, platform_billing_settings, pg_subscription_requests to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'attendance_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'platform_billing_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_billing_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pg_subscription_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pg_subscription_requests;
  END IF;
END $$;
