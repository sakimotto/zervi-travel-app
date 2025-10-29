/*
  # Fix Function Search Paths - Final
  
  Ensures all functions have immutable search paths set correctly.
  Uses "SET search_path = schema1, schema2" syntax.
*/

-- Fix has_delegated_access function
CREATE OR REPLACE FUNCTION public.has_delegated_access(owner_id uuid, delegate_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.delegations
    WHERE delegations.owner_id = has_delegated_access.owner_id
      AND delegations.delegate_id = has_delegated_access.delegate_id
  );
END;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
END;
$$;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = user_id;
  
  RETURN user_role;
END;
$$;

-- Fix log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$;

-- Fix create_user_as_admin function
CREATE OR REPLACE FUNCTION public.create_user_as_admin(
  email text,
  password text,
  full_name text,
  role text DEFAULT 'user'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  new_user_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', full_name),
    now(),
    now()
  );

  UPDATE public.user_profiles
  SET role = create_user_as_admin.role
  WHERE id = new_user_id;

  RETURN new_user_id;
END;
$$;
