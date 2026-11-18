-- ==============================================================================
-- ShunyOS SaaS — Migration 007: White-Label PG Onboarding & Dynamic Branding
-- Adds primary_color to pgs table, sets up storage bucket for pg-logos,
-- and folder-scoped RLS policies.
-- ==============================================================================

-- 1. Add primary_color to pgs table
ALTER TABLE public.pgs 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4F46E5';

-- 2. Create pg-logos storage bucket if not already created
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pg-logos',
  'pg-logos',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- 3. Storage bucket RLS Policies
-- Allow anyone (public / tenants / unauthenticated) to view logos
DROP POLICY IF EXISTS "Public PG Logo Read" ON storage.objects;
CREATE POLICY "Public PG Logo Read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'pg-logos');

-- Allow authenticated owners and super admins to upload/update logos
DROP POLICY IF EXISTS "Staff Upload PG Logo" ON storage.objects;
CREATE POLICY "Staff Upload PG Logo" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pg-logos'
    AND (
      -- Super admin can upload to any folder
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
      OR
      -- Owner can upload to their PG folder: (storage.foldername(name))[1] matches their PG ID
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.pgs WHERE owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Staff Update PG Logo" ON storage.objects;
CREATE POLICY "Staff Update PG Logo" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'pg-logos'
    AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
      OR
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.pgs WHERE owner_id = auth.uid()
      )
    )
  );
