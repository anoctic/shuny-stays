-- ==============================================================================
-- 004_auth_memberships_rls.sql
-- User Memberships, Role-Based Access Control (RBAC), and Tenant-Locked RLS
-- Roles: super_admin, owner, resident
-- ==============================================================================

-- 1. Create Role Enum for Memberships
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_role') THEN
        CREATE TYPE public.membership_role AS ENUM ('super_admin', 'owner', 'resident');
    END IF;
END $$;

-- 2. Memberships Table
-- Links each user (from auth.users) to an organization with a specific role
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    -- Note: organization_id can be NULL for platform super_admin who governs all organizations
    role public.membership_role NOT NULL DEFAULT 'resident',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON public.memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON public.memberships(role);

-- 3. Security Definer Helper Functions

-- Check if current authenticated user is a super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.memberships
        WHERE user_id = auth.uid()
          AND role = 'super_admin'
          AND is_active = TRUE
    );
$$;

-- Get the current authenticated user's assigned organization IDs from memberships
CREATE OR REPLACE FUNCTION public.get_current_user_org_ids()
RETURNS TABLE (organization_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT organization_id
    FROM public.memberships
    WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND organization_id IS NOT NULL;
$$;

-- Get the highest role of the authenticated user
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.membership_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role
    FROM public.memberships
    WHERE user_id = auth.uid()
      AND is_active = TRUE
    ORDER BY 
        CASE role 
            WHEN 'super_admin' THEN 1 
            WHEN 'owner' THEN 2 
            WHEN 'resident' THEN 3 
            ELSE 4 
        END ASC
    LIMIT 1;
$$;

-- 4. Enable RLS on memberships
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 5. Memberships RLS Policies
DROP POLICY IF EXISTS "Memberships access policy" ON public.memberships;
CREATE POLICY "Super admins can manage all memberships"
    ON public.memberships FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view their own memberships"
    ON public.memberships FOR SELECT
    USING (user_id = auth.uid());

-- 6. Updated Organizations RLS Policies
-- Super admins can manage all organizations; owners and residents can view their assigned organization
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update their organization" ON public.organizations;

CREATE POLICY "Super admins full access to organizations"
    ON public.organizations FOR ALL
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

CREATE POLICY "Members can view their assigned organization"
    ON public.organizations FOR SELECT
    USING (id IN (SELECT public.get_current_user_org_ids()));

CREATE POLICY "Owners can update their assigned organization"
    ON public.organizations FOR UPDATE
    USING (
        id IN (
            SELECT organization_id 
            FROM public.memberships 
            WHERE user_id = auth.uid() 
              AND role = 'owner' 
              AND is_active = TRUE
        )
    );

-- 7. Updated Domain Policies (Properties, Rooms, Beds, Residents, Invoices, Complaints)
-- Crucial Invariant: The organization filter comes strictly from the logged-in user's membership

-- Properties
DROP POLICY IF EXISTS "Tenant isolation for properties" ON public.properties;
CREATE POLICY "Properties access policy"
    ON public.properties FOR ALL
    USING (
        public.is_super_admin() 
        OR organization_id IN (SELECT public.get_current_user_org_ids())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR organization_id IN (
            SELECT organization_id 
            FROM public.memberships 
            WHERE user_id = auth.uid() 
              AND role = 'owner' 
              AND is_active = TRUE
        )
    );

-- Rooms
DROP POLICY IF EXISTS "Tenant isolation for rooms" ON public.rooms;
CREATE POLICY "Rooms access policy"
    ON public.rooms FOR ALL
    USING (
        public.is_super_admin() 
        OR organization_id IN (SELECT public.get_current_user_org_ids())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR organization_id IN (
            SELECT organization_id 
            FROM public.memberships 
            WHERE user_id = auth.uid() 
              AND role = 'owner' 
              AND is_active = TRUE
        )
    );

-- Beds
DROP POLICY IF EXISTS "Tenant isolation for beds" ON public.beds;
CREATE POLICY "Beds access policy"
    ON public.beds FOR ALL
    USING (
        public.is_super_admin() 
        OR organization_id IN (SELECT public.get_current_user_org_ids())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR organization_id IN (
            SELECT organization_id 
            FROM public.memberships 
            WHERE user_id = auth.uid() 
              AND role = 'owner' 
              AND is_active = TRUE
        )
    );

-- Residents
DROP POLICY IF EXISTS "Tenant isolation for residents" ON public.residents;
CREATE POLICY "Residents access policy"
    ON public.residents FOR ALL
    USING (
        public.is_super_admin() 
        OR organization_id IN (SELECT public.get_current_user_org_ids())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR organization_id IN (
            SELECT organization_id 
            FROM public.memberships 
            WHERE user_id = auth.uid() 
              AND role = 'owner' 
              AND is_active = TRUE
        )
    );

-- Invoices
DROP POLICY IF EXISTS "Tenant isolation for invoices" ON public.invoices;
CREATE POLICY "Invoices access policy"
    ON public.invoices FOR ALL
    USING (
        public.is_super_admin() 
        OR organization_id IN (SELECT public.get_current_user_org_ids())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR organization_id IN (
            SELECT organization_id 
            FROM public.memberships 
            WHERE user_id = auth.uid() 
              AND role = 'owner' 
              AND is_active = TRUE
        )
    );

-- Complaints
DROP POLICY IF EXISTS "Tenant isolation for complaints" ON public.complaints;
CREATE POLICY "Complaints access policy"
    ON public.complaints FOR ALL
    USING (
        public.is_super_admin() 
        OR organization_id IN (SELECT public.get_current_user_org_ids())
    )
    WITH CHECK (
        public.is_super_admin() 
        OR organization_id IN (SELECT public.get_current_user_org_ids())
    );
