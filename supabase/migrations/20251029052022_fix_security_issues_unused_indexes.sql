/*
  # Remove Unused Indexes - Security Optimization

  1. Changes
    - Drop all unused indexes that have not been utilized
    - Improves database performance by reducing index maintenance overhead
    - Indexes can be recreated if usage patterns change in the future
  
  2. Indexes Removed
    - appointments: contact_id, supplier_id, user_id indexes
    - business_contacts: linked_supplier_id, user_id indexes
    - cars: trip_id, user_id indexes
    - delegations: delegate_id, granted_by indexes
    - destinations: user_id index
    - expenses: user_id index
    - flights: trip_id, user_id indexes
    - hotels: trip_id, user_id indexes
    - itinerary_items: user_id index
    - meetings: customer_id, trip_id, user_id indexes
    - suppliers: user_id index
    - todos: user_id index
    - trade_show_meetings: customer_id, trade_show_id indexes
    - trade_shows: user_id index
    - trips: user_id index
    - user_activity_log: user_id index
    - user_permissions: granted_by index
    - user_profiles: created_by index

  3. Notes
    - Foreign key constraints remain intact
    - RLS policies are unaffected
    - Query performance monitored; indexes can be recreated if needed
*/

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
