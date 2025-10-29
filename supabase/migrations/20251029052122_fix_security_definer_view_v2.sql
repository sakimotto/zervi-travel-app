/*
  # Fix Security Definer View - Security Hardening

  1. Changes
    - Replace SECURITY DEFINER view with SECURITY INVOKER
    - Ensures view runs with caller's permissions, not owner's
    - Maintains functionality while improving security posture
  
  2. View Modified
    - trips_with_costs: Changed from SECURITY DEFINER to SECURITY INVOKER
    - Aggregates costs from flights, hotels, and cars tables
    - Counts related records from flights, hotels, cars, and meetings
  
  3. Security Benefits
    - Prevents privilege escalation attacks
    - View respects RLS policies of calling user
    - Follows principle of least privilege
    
  4. Notes
    - Users can only see trips they have access to via RLS
    - Aggregated cost data respects user permissions on related tables
*/

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

-- Add comment explaining the security model
COMMENT ON VIEW trips_with_costs IS 
  'View showing trips with aggregated cost data from flights, hotels, and cars. Uses SECURITY INVOKER to respect caller RLS policies.';
