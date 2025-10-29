/*
  # Add Missing Foreign Key Indexes
  
  Creates indexes on all foreign key columns that don't have covering indexes.
  This improves JOIN performance and query optimization.
*/

-- Appointments table foreign keys
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id ON public.appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_supplier_id ON public.appointments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);

-- Business contacts table foreign keys
CREATE INDEX IF NOT EXISTS idx_business_contacts_linked_supplier_id ON public.business_contacts(linked_supplier_id);
CREATE INDEX IF NOT EXISTS idx_business_contacts_user_id ON public.business_contacts(user_id);

-- Cars table foreign keys
CREATE INDEX IF NOT EXISTS idx_cars_trip_id ON public.cars(trip_id);
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON public.cars(user_id);

-- Delegations table foreign keys
CREATE INDEX IF NOT EXISTS idx_delegations_delegate_id ON public.delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_delegations_granted_by ON public.delegations(granted_by);

-- Destinations table foreign keys
CREATE INDEX IF NOT EXISTS idx_destinations_user_id ON public.destinations(user_id);

-- Expenses table foreign keys
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);

-- Flights table foreign keys
CREATE INDEX IF NOT EXISTS idx_flights_trip_id ON public.flights(trip_id);
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON public.flights(user_id);

-- Hotels table foreign keys
CREATE INDEX IF NOT EXISTS idx_hotels_trip_id ON public.hotels(trip_id);
CREATE INDEX IF NOT EXISTS idx_hotels_user_id ON public.hotels(user_id);

-- Itinerary items table foreign keys
CREATE INDEX IF NOT EXISTS idx_itinerary_items_user_id ON public.itinerary_items(user_id);

-- Meetings table foreign keys
CREATE INDEX IF NOT EXISTS idx_meetings_customer_id ON public.meetings(customer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_trip_id ON public.meetings(trip_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);

-- Suppliers table foreign keys
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);

-- Todos table foreign keys
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);

-- Trade show meetings table foreign keys
CREATE INDEX IF NOT EXISTS idx_trade_show_meetings_customer_id ON public.trade_show_meetings(customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_show_meetings_trade_show_id ON public.trade_show_meetings(trade_show_id);

-- Trade shows table foreign keys
CREATE INDEX IF NOT EXISTS idx_trade_shows_user_id ON public.trade_shows(user_id);

-- Trips table foreign keys
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);

-- User activity log table foreign keys
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);

-- User permissions table foreign keys
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted_by ON public.user_permissions(granted_by);

-- User profiles table foreign keys
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_by ON public.user_profiles(created_by);
