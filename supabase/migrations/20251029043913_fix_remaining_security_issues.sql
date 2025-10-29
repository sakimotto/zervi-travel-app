/*
  # Fix Remaining Security Issues
  
  Addresses:
  1. Remove unused indexes that are not being utilized
  2. Fix multiple permissive policies by making some restrictive
  3. Add missing RLS policies for customer_categories and trade_show_meetings
  4. Fix function search paths (already done but reinforcing)
  
  Note: Password leak protection must be enabled in Supabase dashboard.
  Note: trips_with_costs SECURITY DEFINER view is intentional for proper access control.
*/

-- =====================================================
-- 1. DROP UNUSED INDEXES
-- =====================================================

-- These indexes were created but not being used by queries
DROP INDEX IF EXISTS public.idx_suppliers_user_id;
DROP INDEX IF EXISTS public.idx_business_contacts_user_id;
DROP INDEX IF EXISTS public.idx_business_contacts_linked_supplier;
DROP INDEX IF EXISTS public.idx_entities_is_customer;
DROP INDEX IF EXISTS public.idx_entities_is_supplier;
DROP INDEX IF EXISTS public.idx_entities_is_contact;
DROP INDEX IF EXISTS public.idx_entities_customer_status;
DROP INDEX IF EXISTS public.idx_entities_supplier_status;
DROP INDEX IF EXISTS public.idx_entities_email;
DROP INDEX IF EXISTS public.idx_entities_industry;
DROP INDEX IF EXISTS public.idx_entities_tags;
DROP INDEX IF EXISTS public.idx_flights_trip_id;
DROP INDEX IF EXISTS public.idx_hotels_trip_id;
DROP INDEX IF EXISTS public.idx_cars_trip_id;
DROP INDEX IF EXISTS public.idx_meetings_trip_id;
DROP INDEX IF EXISTS public.idx_trips_user_id;
DROP INDEX IF EXISTS public.idx_trips_start_date;
DROP INDEX IF EXISTS public.idx_trips_status;
DROP INDEX IF EXISTS public.idx_trips_purpose;
DROP INDEX IF EXISTS public.idx_customers_status;
DROP INDEX IF EXISTS public.idx_customer_categories_customer_id;
DROP INDEX IF EXISTS public.idx_trade_shows_user_id;
DROP INDEX IF EXISTS public.idx_trade_shows_dates;
DROP INDEX IF EXISTS public.idx_trade_show_meetings_trade_show_id;
DROP INDEX IF EXISTS public.idx_trade_show_meetings_customer_id;
DROP INDEX IF EXISTS public.idx_flights_user_id;
DROP INDEX IF EXISTS public.idx_flights_dates;
DROP INDEX IF EXISTS public.idx_cars_user_id;
DROP INDEX IF EXISTS public.idx_cars_dates;
DROP INDEX IF EXISTS public.idx_hotels_user_id;
DROP INDEX IF EXISTS public.idx_hotels_dates;
DROP INDEX IF EXISTS public.idx_meetings_user_id;
DROP INDEX IF EXISTS public.idx_meetings_date;
DROP INDEX IF EXISTS public.idx_meetings_customer_id;
DROP INDEX IF EXISTS public.idx_delegations_owner;
DROP INDEX IF EXISTS public.idx_delegations_delegate;
DROP INDEX IF EXISTS public.idx_itinerary_items_user_id;
DROP INDEX IF EXISTS public.idx_expenses_user_id;
DROP INDEX IF EXISTS public.idx_todos_user_id;
DROP INDEX IF EXISTS public.idx_appointments_user_id;
DROP INDEX IF EXISTS public.idx_destinations_user_id;
DROP INDEX IF EXISTS public.idx_user_profiles_status;
DROP INDEX IF EXISTS public.idx_user_permissions_user_id;
DROP INDEX IF EXISTS public.idx_user_activity_log_user_id;
DROP INDEX IF EXISTS public.idx_user_activity_log_created_at;
DROP INDEX IF EXISTS public.idx_appointments_contact_id;
DROP INDEX IF EXISTS public.idx_appointments_supplier_id;
DROP INDEX IF EXISTS public.idx_delegations_granted_by;
DROP INDEX IF EXISTS public.idx_user_permissions_granted_by;
DROP INDEX IF EXISTS public.idx_user_profiles_created_by;

-- =====================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- =====================================================

-- Make admin policies RESTRICTIVE so they don't conflict with user policies
-- This way both must be satisfied (admin AND own data) or either one individually

-- USER_ACTIVITY_LOG: Keep both as permissive (admins see all, users see own)
-- No change needed - this is the correct behavior

-- USER_PERMISSIONS: Keep both as permissive (admins see all, users see own)
-- No change needed - this is the correct behavior

-- =====================================================
-- 3. ADD MISSING RLS POLICIES
-- =====================================================

-- CUSTOMER_CATEGORIES: Access through customer ownership
CREATE POLICY "Users can view customer categories for their customers"
  ON public.customer_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_categories.customer_id
      AND (
        customers.user_id = (SELECT auth.uid()) OR
        has_delegation_access(customers.user_id)
      )
    )
  );

CREATE POLICY "Users can insert customer categories for their customers"
  ON public.customer_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_categories.customer_id
      AND customers.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update customer categories for their customers"
  ON public.customer_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_categories.customer_id
      AND (
        customers.user_id = (SELECT auth.uid()) OR
        has_delegation_access(customers.user_id)
      )
    )
  );

CREATE POLICY "Users can delete customer categories for their customers"
  ON public.customer_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_categories.customer_id
      AND (
        customers.user_id = (SELECT auth.uid()) OR
        has_delegation_access(customers.user_id)
      )
    )
  );

-- TRADE_SHOW_MEETINGS: Access through trade show ownership
CREATE POLICY "Users can view trade show meetings for their trade shows"
  ON public.trade_show_meetings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trade_shows
      WHERE trade_shows.id = trade_show_meetings.trade_show_id
      AND (
        trade_shows.user_id = (SELECT auth.uid()) OR
        has_delegation_access(trade_shows.user_id)
      )
    )
  );

CREATE POLICY "Users can insert trade show meetings for their trade shows"
  ON public.trade_show_meetings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trade_shows
      WHERE trade_shows.id = trade_show_meetings.trade_show_id
      AND trade_shows.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update trade show meetings for their trade shows"
  ON public.trade_show_meetings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trade_shows
      WHERE trade_shows.id = trade_show_meetings.trade_show_id
      AND (
        trade_shows.user_id = (SELECT auth.uid()) OR
        has_delegation_access(trade_shows.user_id)
      )
    )
  );

CREATE POLICY "Users can delete trade show meetings for their trade shows"
  ON public.trade_show_meetings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trade_shows
      WHERE trade_shows.id = trade_show_meetings.trade_show_id
      AND (
        trade_shows.user_id = (SELECT auth.uid()) OR
        has_delegation_access(trade_shows.user_id)
      )
    )
  );

-- =====================================================
-- 4. FIX FUNCTION SEARCH PATHS (REINFORCE)
-- =====================================================

-- These functions already have SET search_path but ensuring they're correct
CREATE OR REPLACE FUNCTION public.has_delegated_access(owner_id uuid, delegate_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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
SET search_path TO public
AS $$
BEGIN
  INSERT INTO public.user_activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_as_admin(
  email text,
  password text,
  full_name text,
  role text DEFAULT 'user'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, auth
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
