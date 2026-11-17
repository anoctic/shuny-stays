-- ==============================================================================
-- 002_row_level_security.sql
-- Row Level Security (RLS) for Strict Multi-Tenant Data Isolation
-- Each tenant (Organization) can only query and mutate their own records
-- ==============================================================================

-- Helper function: Get the current user's authorized organization_ids
CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS TABLE (organization_id UUID) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
AS $$
    SELECT organization_id 
    FROM public.organization_members
    WHERE user_id = auth.uid();
$$;

-- Helper function: Check if current authenticated user has an administrative role in a tenant
CREATE OR REPLACE FUNCTION public.has_tenant_role(target_org_id UUID, required_roles public.user_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_members
        WHERE organization_id = target_org_id
          AND user_id = auth.uid()
          AND role = ANY(required_roles)
    );
$$;

-- 1. Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pg_saved_queries ENABLE ROW LEVEL SECURITY;

-- 2. Organizations RLS Policies
CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations FOR SELECT
    USING (id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "Owners can update their organization"
    ON public.organizations FOR UPDATE
    USING (public.has_tenant_role(id, ARRAY['owner'::public.user_role, 'admin'::public.user_role]));

-- 3. Organization Members Policies
CREATE POLICY "Members can view other members in same organization"
    ON public.organization_members FOR SELECT
    USING (organization_id IN (SELECT public.get_user_organization_ids()));

CREATE POLICY "Admins can manage members"
    ON public.organization_members FOR ALL
    USING (public.has_tenant_role(organization_id, ARRAY['owner'::public.user_role, 'admin'::public.user_role]));

-- 4. Properties Policies
CREATE POLICY "Tenant isolation for properties"
    ON public.properties FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 5. Rooms Policies
CREATE POLICY "Tenant isolation for rooms"
    ON public.rooms FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 6. Beds Policies
CREATE POLICY "Tenant isolation for beds"
    ON public.beds FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 7. Residents Policies
CREATE POLICY "Tenant isolation for residents"
    ON public.residents FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 8. Leases Policies
CREATE POLICY "Tenant isolation for leases"
    ON public.leases FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 9. Invoices Policies
CREATE POLICY "Tenant isolation for invoices"
    ON public.invoices FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 10. Payments Policies
CREATE POLICY "Tenant isolation for payments"
    ON public.payments FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 11. Complaints Policies
CREATE POLICY "Tenant isolation for complaints"
    ON public.complaints FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));

-- 12. Saved SQL Queries Policies
CREATE POLICY "Tenant isolation for saved queries"
    ON public.pg_saved_queries FOR ALL
    USING (organization_id IN (SELECT public.get_user_organization_ids()))
    WITH CHECK (organization_id IN (SELECT public.get_user_organization_ids()));
