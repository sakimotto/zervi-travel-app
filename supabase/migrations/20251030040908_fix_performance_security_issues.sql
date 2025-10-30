/*
  # Fix Performance and Security Issues

  ## Overview
  This migration addresses critical performance and security issues identified in the security audit:
  
  1. **Foreign Key Indexes** - Add covering indexes for all foreign key columns
  2. **RLS Performance** - Optimize auth.uid() calls in RLS policies
  
  ## Changes Made
  
  ### 1. Foreign Key Indexes (29 indexes added)
  Adding indexes for all foreign key columns to improve JOIN performance:
  
  **Appointments Table:**
  - idx_appointments_contact_id
  - idx_appointments_supplier_id
  - idx_appointments_user_id
  
  **Business Contacts Table:**
  - idx_business_contacts_linked_supplier_id
  - idx_business_contacts_user_id
  
  **Cars Table:**
  - idx_cars_trip_id
  - idx_cars_user_id
  
  **Delegations Table:**
  - idx_delegations_delegate_id
  - idx_delegations_granted_by
  
  **Destinations Table:**
  - idx_destinations_user_id
  
  **Expenses Table:**
  - idx_expenses_user_id
  
  **Flights Table:**
  - idx_flights_trip_id
  - idx_flights_user_id
  
  **Hotels Table:**
  - idx_hotels_trip_id
  - idx_hotels_user_id
  
  **Itinerary Items Table:**
  - idx_itinerary_items_user_id
  
  **Meetings Table:**
  - idx_meetings_customer_id
  - idx_meetings_trip_id
  - idx_meetings_user_id
  
  **Suppliers Table:**
  - idx_suppliers_user_id
  
  **Todos Table:**
  - idx_todos_user_id
  
  **Trade Show Meetings Table:**
  - idx_trade_show_meetings_customer_id
  - idx_trade_show_meetings_trade_show_id
  
  **Trade Shows Table:**
  - idx_trade_shows_user_id
  
  **Trips Table:**
  - idx_trips_user_id
  
  **User Activity Log Table:**
  - idx_user_activity_log_user_id
  
  **User Permissions Table:**
  - idx_user_permissions_granted_by
  
  **User Profiles Table:**
  - idx_user_profiles_created_by
  
  ### 2. RLS Policy Optimization
  Optimized auth.uid() calls in RLS policies by wrapping in SELECT:
  - user_permissions table policies
  - user_activity_log table policies
  
  ## Performance Impact
  - Foreign key indexes: Dramatically improves JOIN and WHERE clause performance
  - RLS optimization: Reduces per-row function evaluation overhead
  
  ## Notes
  - All indexes use IF NOT EXISTS to prevent errors on re-run
  - Leaked Password Protection must be enabled manually in Supabase Dashboard
    (Auth > Providers > Email > Advanced Settings)
*/

-- =====================================================
-- PART 1: ADD FOREIGN KEY INDEXES
-- =====================================================

-- Appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON public.appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_supplier_id ON public.appointments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);

-- Business Contacts table
CREATE INDEX IF NOT EXISTS idx_business_contacts_linked_supplier_id ON public.business_contacts(linked_supplier_id);
CREATE INDEX IF NOT EXISTS idx_business_contacts_user_id ON public.business_contacts(user_id);

-- Cars table
CREATE INDEX IF NOT EXISTS idx_cars_trip_id ON public.cars(trip_id);
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON public.cars(user_id);

-- Delegations table
CREATE INDEX IF NOT EXISTS idx_delegations_delegate_id ON public.delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_delegations_granted_by ON public.delegations(granted_by);

-- Destinations table
CREATE INDEX IF NOT EXISTS idx_destinations_user_id ON public.destinations(user_id);

-- Expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);

-- Flights table
CREATE INDEX IF NOT EXISTS idx_flights_trip_id ON public.flights(trip_id);
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON public.flights(user_id);

-- Hotels table
CREATE INDEX IF NOT EXISTS idx_hotels_trip_id ON public.hotels(trip_id);
CREATE INDEX IF NOT EXISTS idx_hotels_user_id ON public.hotels(user_id);

-- Itinerary Items table
CREATE INDEX IF NOT EXISTS idx_itinerary_items_user_id ON public.itinerary_items(user_id);

-- Meetings table
CREATE INDEX IF NOT EXISTS idx_meetings_customer_id ON public.meetings(customer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_trip_id ON public.meetings(trip_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);

-- Suppliers table
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);

-- Todos table
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- Trade Show Meetings table
CREATE INDEX IF NOT EXISTS idx_trade_show_meetings_customer_id ON public.trade_show_meetings(customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_show_meetings_trade_show_id ON public.trade_show_meetings(trade_show_id);

-- Trade Shows table
CREATE INDEX IF NOT EXISTS idx_trade_shows_user_id ON public.trade_shows(user_id);

-- Trips table
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);

-- User Activity Log table
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);

-- User Permissions table
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted_by ON public.user_permissions(granted_by);

-- User Profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_by ON public.user_profiles(created_by);

-- =====================================================
-- PART 2: OPTIMIZE RLS POLICIES
-- =====================================================

-- Drop and recreate user_permissions policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own permissions, admins can view all" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can grant permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can revoke permissions" ON public.user_permissions;

CREATE POLICY "Users can view own permissions, admins can view all"
  ON public.user_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can grant permissions"
  ON public.user_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can revoke permissions"
  ON public.user_permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Drop and recreate user_activity_log policies with optimized auth.uid()
DROP POLICY IF EXISTS "Users can view own activity, admins can view all" ON public.user_activity_log;

CREATE POLICY "Users can view own activity, admins can view all"
  ON public.user_activity_log
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );
