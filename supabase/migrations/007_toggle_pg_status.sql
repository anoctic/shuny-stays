-- ==============================================================================
-- Migration 007: Atomic PG Status Toggle & Management Procedure
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.toggle_pg_status(
  target_pg_id uuid,
  new_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row public.pgs%ROWTYPE;
BEGIN
  -- 1. Validate status enum value
  IF new_status NOT IN ('active', 'pending', 'suspended') THEN
    RAISE EXCEPTION 'Invalid PG status: % (must be active, pending, or suspended)', new_status;
  END IF;

  -- 2. Execute atomic update
  UPDATE public.pgs
  SET 
    status = new_status::public.pg_status,
    updated_at = now()
  WHERE id = target_pg_id
  RETURNING * INTO updated_row;

  -- 3. Verify record was found and updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PG with ID % not found in database', target_pg_id;
  END IF;

  RETURN to_jsonb(updated_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_pg_status(uuid, text) TO authenticated, service_role, anon;
