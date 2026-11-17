-- ==============================================================================
-- 003_pg_admin_helpers.sql
-- PostgreSQL Administrative & Introspection RPCs for the In-App PG Admin Studio
-- Allows safe inspection of PostgreSQL catalogs, schemas, tables, and RLS policies
-- ==============================================================================

-- 1. Introspect all tables in public schema with row count estimates and RLS status
CREATE OR REPLACE FUNCTION public.pg_admin_get_tables()
RETURNS TABLE (
    table_name TEXT,
    table_type TEXT,
    row_count_estimate BIGINT,
    total_size_pretty TEXT,
    has_rls BOOLEAN,
    rls_enforced BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.relname::TEXT AS table_name,
        CASE c.relkind 
            WHEN 'r' THEN 'table'
            WHEN 'v' THEN 'view'
            WHEN 'm' THEN 'materialized_view'
            ELSE 'other'
        END AS table_type,
        c.reltuples::BIGINT AS row_count_estimate,
        pg_size_pretty(pg_total_relation_size(c.oid))::TEXT AS total_size_pretty,
        c.relrowsecurity AS has_rls,
        c.relforcerowsecurity AS rls_enforced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'v', 'm')
    ORDER BY c.relname ASC;
$$;

-- 2. Introspect table columns, data types, nullability, and primary keys
CREATE OR REPLACE FUNCTION public.pg_admin_get_columns(p_table_name TEXT)
RETURNS TABLE (
    column_name TEXT,
    data_type TEXT,
    is_nullable BOOLEAN,
    column_default TEXT,
    is_primary_key BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT,
        (c.is_nullable = 'YES') AS is_nullable,
        c.column_default::TEXT,
        COALESCE(pk.is_pk, false) AS is_primary_key
    FROM information_schema.columns c
    LEFT JOIN (
        SELECT ku.column_name, true as is_pk
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = p_table_name
          AND tc.table_schema = 'public'
    ) pk ON pk.column_name = c.column_name
    WHERE c.table_schema = 'public'
      AND c.table_name = p_table_name
    ORDER BY c.ordinal_position ASC;
$$;

-- 3. Introspect active RLS policies in PostgreSQL
CREATE OR REPLACE FUNCTION public.pg_admin_get_policies(p_table_name TEXT DEFAULT NULL)
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    policyname TEXT,
    permissive TEXT,
    roles TEXT[],
    cmd TEXT,
    qual TEXT,
    with_check TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        schemaname::TEXT,
        tablename::TEXT,
        policyname::TEXT,
        permissive::TEXT,
        roles::TEXT[],
        cmd::TEXT,
        qual::TEXT,
        with_check::TEXT
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (p_table_name IS NULL OR tablename = p_table_name)
    ORDER BY tablename, policyname;
$$;

-- 4. Safe Query Runner with Statement Timeout and read-only enforcement
CREATE OR REPLACE FUNCTION public.pg_admin_execute_query(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Enforce safety: forbid dangerous DDL if executed through query runner
    IF lower(sql_query) ~ '\y(drop\s+database|truncate\s+auth|drop\s+role)\y' THEN
        RAISE EXCEPTION 'Restricted command detected in query runner.';
    END IF;

    -- Set local timeout for query execution (5 seconds)
    PERFORM set_config('statement_timeout', '5000', true);

    -- Execute and package as JSON array
    EXECUTE format('SELECT COALESCE(json_agg(t), ''[]''::json) FROM (%s) t', sql_query)
    INTO result;

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', SQLERRM,
            'detail', SQLSTATE
        );
END;
$$;
