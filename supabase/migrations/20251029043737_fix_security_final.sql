/*
  # Security Fixes - Final Migration
  
  Fixes:
  1. Foreign Key Indexes
  2. RLS Performance (wrap auth.uid())
  3. Remove Duplicate Policies
  4. Function Search Paths
*/

-- 1. ADD MISSING INDEXES
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON public.appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_supplier_id ON public.appointments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_delegations_granted_by ON public.delegations(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted_by ON public.user_permissions(granted_by);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_by ON public.user_profiles(created_by);

-- 2. DROP DUPLICATE POLICIES
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all operations on business_contacts" ON public.business_contacts;
DROP POLICY IF EXISTS "Allow all operations on destinations" ON public.destinations;
DROP POLICY IF EXISTS "Allow all operations on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow all operations on itinerary_items" ON public.itinerary_items;
DROP POLICY IF EXISTS "Allow all operations on suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow all operations on todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view own trade shows" ON public.trade_shows;
DROP POLICY IF EXISTS "Users can insert own trade shows" ON public.trade_shows;
DROP POLICY IF EXISTS "Users can update own trade shows" ON public.trade_shows;
DROP POLICY IF EXISTS "Users can delete own trade shows" ON public.trade_shows;
DROP POLICY IF EXISTS "Users can insert own flights" ON public.flights;
DROP POLICY IF EXISTS "Users can insert own cars" ON public.cars;
DROP POLICY IF EXISTS "Users can insert own hotels" ON public.hotels;
DROP POLICY IF EXISTS "Users can insert own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can view own customer categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Users can insert own customer categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Users can update own customer categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Users can delete own customer categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Users can view own trade show meetings" ON public.trade_show_meetings;
DROP POLICY IF EXISTS "Users can insert own trade show meetings" ON public.trade_show_meetings;
DROP POLICY IF EXISTS "Users can update own trade show meetings" ON public.trade_show_meetings;
DROP POLICY IF EXISTS "Users can delete own trade show meetings" ON public.trade_show_meetings;

-- 3. HELPER FUNCTION FOR DELEGATION
CREATE OR REPLACE FUNCTION has_delegation_access(owner_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM delegations WHERE owner_id = owner_user_id AND delegate_id = (SELECT auth.uid())); $$;

-- 4. RECREATE POLICIES WITH OPTIMIZED auth.uid()
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['customers', 'trade_shows', 'flights', 'cars', 'hotels', 'meetings', 'entities', 'expenses', 'todos', 'appointments', 'itinerary_items', 'suppliers', 'business_contacts', 'destinations', 'trips']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users can view own or delegated %s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can create %s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own or delegated %s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own or delegated %s" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can view own or delegated %s" ON public.%I FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR has_delegation_access(user_id))', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can create %s" ON public.%I FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()))', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can update own or delegated %s" ON public.%I FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()) OR has_delegation_access(user_id))', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can delete own or delegated %s" ON public.%I FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()) OR has_delegation_access(user_id))', tbl, tbl);
  END LOOP;
END $$;

-- DELEGATIONS
DROP POLICY IF EXISTS "Users can view delegations they are involved in" ON public.delegations;
DROP POLICY IF EXISTS "Owners can create delegations" ON public.delegations;
DROP POLICY IF EXISTS "Owners can update delegations" ON public.delegations;
DROP POLICY IF EXISTS "Owners can delete delegations" ON public.delegations;
CREATE POLICY "Users can view delegations they are involved in" ON public.delegations FOR SELECT TO authenticated USING (owner_id = (SELECT auth.uid()) OR delegate_id = (SELECT auth.uid()));
CREATE POLICY "Owners can create delegations" ON public.delegations FOR INSERT TO authenticated WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owners can update delegations" ON public.delegations FOR UPDATE TO authenticated USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owners can delete delegations" ON public.delegations FOR DELETE TO authenticated USING (owner_id = (SELECT auth.uid()));

-- USER_PERMISSIONS
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can delete permissions" ON public.user_permissions;
CREATE POLICY "Admins can view all permissions" ON public.user_permissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (SELECT auth.uid()) AND user_profiles.role = 'admin'));
CREATE POLICY "Users can view own permissions" ON public.user_permissions FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Admins can insert permissions" ON public.user_permissions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (SELECT auth.uid()) AND user_profiles.role = 'admin'));
CREATE POLICY "Admins can update permissions" ON public.user_permissions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (SELECT auth.uid()) AND user_profiles.role = 'admin'));
CREATE POLICY "Admins can delete permissions" ON public.user_permissions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (SELECT auth.uid()) AND user_profiles.role = 'admin'));

-- USER_ACTIVITY_LOG
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity log" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.user_activity_log;
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (SELECT auth.uid()) AND user_profiles.role = 'admin'));
CREATE POLICY "Users can view own activity log" ON public.user_activity_log FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create activity logs" ON public.user_activity_log FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

-- USER_PROFILES
DROP POLICY IF EXISTS "allow_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.user_profiles;
CREATE POLICY "allow_update_own_profile" ON public.user_profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "allow_insert_own_profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (id = (SELECT auth.uid()));

-- 5. FIX FUNCTION SEARCH PATHS
CREATE OR REPLACE FUNCTION public.create_user_profile() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$ BEGIN INSERT INTO public.user_profiles (id, email, full_name, role, status) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'user', 'active'); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.update_trips_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.update_entities_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.has_delegated_access(owner_id uuid, delegate_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.delegations WHERE delegations.owner_id = has_delegated_access.owner_id AND delegations.delegate_id = has_delegated_access.delegate_id); END; $$;
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE user_role text; BEGIN SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id; RETURN user_role = 'admin'; END; $$;
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ DECLARE user_role text; BEGIN SELECT role INTO user_role FROM public.user_profiles WHERE id = user_id; RETURN user_role; END; $$;
CREATE OR REPLACE FUNCTION public.log_activity(p_user_id uuid, p_action text, p_entity_type text, p_entity_id uuid, p_details jsonb DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.user_activity_log (user_id, action, entity_type, entity_id, details) VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details); END; $$;
CREATE OR REPLACE FUNCTION public.create_user_as_admin(email text, password text, full_name text, role text DEFAULT 'user') RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$ DECLARE new_user_id uuid; BEGIN IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Only admins can create users'; END IF; new_user_id := gen_random_uuid(); INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', email, crypt(password, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', full_name), now(), now()); UPDATE public.user_profiles SET role = create_user_as_admin.role WHERE id = new_user_id; RETURN new_user_id; END; $$;
