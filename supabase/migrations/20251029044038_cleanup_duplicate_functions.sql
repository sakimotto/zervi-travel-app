/*
  # Cleanup Duplicate Functions
  
  Remove old function versions that don't have proper search_path settings.
  Keep only the versions with correct signatures and search paths.
*/

-- Drop old function versions without proper search paths
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.has_delegated_access(target_user_id uuid, required_permission text) CASCADE;
DROP FUNCTION IF EXISTS public.log_activity(p_action text, p_entity_type text, p_entity_id uuid, p_details jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_as_admin(p_email text, p_password text, p_full_name text, p_role text, p_phone text, p_department text, p_job_title text) CASCADE;

-- Recreate the helper function used by RLS policies with immutable search path
DROP FUNCTION IF EXISTS public.has_delegation_access(uuid) CASCADE;

CREATE FUNCTION public.has_delegation_access(owner_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM delegations
    WHERE owner_id = owner_user_id
    AND delegate_id = (SELECT auth.uid())
  );
$$;
