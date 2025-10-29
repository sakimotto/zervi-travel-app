-- ============================================================================
-- SECURITY FIXES FOR PERSONAL SUPABASE DATABASE
-- ============================================================================
-- Run this script in your Supabase SQL Editor to apply all security fixes
-- Database: lvbkobrvcfqtyivebrmf.supabase.co
-- ============================================================================

-- ============================================================================
-- 1. REMOVE UNUSED INDEXES
-- ============================================================================
-- Drop unused indexes on appointments table
DROP INDEX IF EXISTS idx_appointments_contact_id;
DROP INDEX IF EXISTS idx_appointments_supplier_id;
DROP INDEX IF EXISTS idx_appointments_user_id;

-- Drop unused indexes on business_contacts table
DROP INDEX IF EXISTS idx_business_contacts_linked_supplier_id;
DROP INDEX IF EXISTS idx_business_contacts_user_id;

-- Drop unused indexes on cars table
DROP INDEX IF EXISTS idx_cars_trip_id;
DROP INDEX IF EXISTS idx_cars_user_id;

-- Drop unused indexes on delegations table
DROP INDEX IF EXISTS idx_delegations_delegate_id;
DROP INDEX IF EXISTS idx_delegations_granted_by;

-- Drop unused indexes on destinations table
DROP INDEX IF EXISTS idx_destinations_user_id;

-- Drop unused indexes on expenses table
DROP INDEX IF EXISTS idx_expenses_user_id;

-- Drop unused indexes on flights table
DROP INDEX IF EXISTS idx_flights_trip_id;
DROP INDEX IF EXISTS idx_flights_user_id;

-- Drop unused indexes on hotels table
DROP INDEX IF EXISTS idx_hotels_trip_id;
DROP INDEX IF EXISTS idx_hotels_user_id;

-- Drop unused indexes on itinerary_items table
DROP INDEX IF EXISTS idx_itinerary_items_user_id;

-- Drop unused indexes on meetings table
DROP INDEX IF EXISTS idx_meetings_customer_id;
DROP INDEX IF EXISTS idx_meetings_trip_id;
DROP INDEX IF EXISTS idx_meetings_user_id;

-- Drop unused indexes on suppliers table
DROP INDEX IF EXISTS idx_suppliers_user_id;

-- Drop unused indexes on todos table
DROP INDEX IF EXISTS idx_todos_user_id;

-- Drop unused indexes on trade_show_meetings table
DROP INDEX IF EXISTS idx_trade_show_meetings_customer_id;
DROP INDEX IF EXISTS idx_trade_show_meetings_trade_show_id;

-- Drop unused indexes on trade_shows table
DROP INDEX IF EXISTS idx_trade_shows_user_id;

-- Drop unused indexes on trips table
DROP INDEX IF EXISTS idx_trips_user_id;

-- Drop unused indexes on user_activity_log table
DROP INDEX IF EXISTS idx_user_activity_log_user_id;

-- Drop unused indexes on user_permissions table
DROP INDEX IF EXISTS idx_user_permissions_granted_by;

-- Drop unused indexes on user_profiles table
DROP INDEX IF EXISTS idx_user_profiles_created_by;

-- ============================================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================================================

-- Fix user_activity_log policies
DROP POLICY IF EXISTS "Admins can view all activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity log" ON user_activity_log;

CREATE POLICY "Users can view own activity, admins can view all"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Fix user_permissions policies
DROP POLICY IF EXISTS "Admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;

CREATE POLICY "Users can view own permissions, admins can view all"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. FIX SECURITY DEFINER VIEW
-- ============================================================================

-- Drop existing view
DROP VIEW IF EXISTS trips_with_costs;

-- Recreate view with SECURITY INVOKER (runs with caller's permissions)
CREATE VIEW trips_with_costs
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  trip_name,
  purpose,
  destination_city,
  destination_country,
  start_date,
  end_date,
  status,
  budget,
  notes,
  created_at,
  updated_at,
  COALESCE(
    (SELECT SUM(flights.cost) FROM flights WHERE flights.trip_id = t.id),
    0
  ) + COALESCE(
    (SELECT SUM(hotels.total_cost) FROM hotels WHERE hotels.trip_id = t.id),
    0
  ) + COALESCE(
    (SELECT SUM(cars.total_cost) FROM cars WHERE cars.trip_id = t.id),
    0
  ) AS actual_cost,
  (SELECT COUNT(*) FROM flights WHERE flights.trip_id = t.id) AS flights_count,
  (SELECT COUNT(*) FROM hotels WHERE hotels.trip_id = t.id) AS hotels_count,
  (SELECT COUNT(*) FROM cars WHERE cars.trip_id = t.id) AS cars_count,
  (SELECT COUNT(*) FROM meetings WHERE meetings.trip_id = t.id) AS meetings_count
FROM trips t;

COMMENT ON VIEW trips_with_costs IS
  'View showing trips with aggregated cost data from flights, hotels, and cars. Uses SECURITY INVOKER to respect caller RLS policies.';

-- ============================================================================
-- SECURITY FIXES APPLIED SUCCESSFULLY
-- ============================================================================
