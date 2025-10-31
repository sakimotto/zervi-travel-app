/*
  # Allow Admin Users to Manage All Resources
  
  1. Overview
    - Updates RLS policies across all tables to allow admin users full access
    - Admins can allocate activities, tasks, flights, hotels, etc. to any trip
    - Regular users maintain existing access to their own data
    
  2. Tables Updated
    - flights: Allow admin SELECT, INSERT, UPDATE, DELETE
    - hotels: Allow admin SELECT, INSERT, UPDATE, DELETE
    - cars: Allow admin SELECT, INSERT, UPDATE, DELETE
    - itinerary_items: Allow admin SELECT, INSERT, UPDATE, DELETE
    - appointments: Allow admin SELECT, INSERT, UPDATE, DELETE
    - todos: Allow admin SELECT, INSERT, UPDATE, DELETE
    - expenses: Allow admin SELECT, INSERT, UPDATE, DELETE
    - suppliers: Allow admin SELECT, INSERT, UPDATE, DELETE
    - business_contacts: Allow admin SELECT, INSERT, UPDATE, DELETE
    - destinations: Allow admin SELECT, INSERT, UPDATE, DELETE
    - trips: Allow admin SELECT, INSERT, UPDATE, DELETE
    - entities: Allow admin SELECT, INSERT, UPDATE, DELETE
    
  3. Security
    - Admin role is checked via user_profiles table
    - Regular users retain their existing permissions
    - Maintains existing delegation system
    
  4. Implementation
    - Creates helper function to check admin status
    - Updates all relevant RLS policies to include admin check
*/

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FLIGHTS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated flights" ON flights;
DROP POLICY IF EXISTS "Users can update own flights" ON flights;
DROP POLICY IF EXISTS "Users can delete own flights" ON flights;
DROP POLICY IF EXISTS "Users can create flights" ON flights;

CREATE POLICY "Users and admins can view flights"
  ON flights FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = flights.user_id
    )
  );

CREATE POLICY "Users and admins can insert flights"
  ON flights FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update flights"
  ON flights FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete flights"
  ON flights FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- HOTELS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated hotels" ON hotels;
DROP POLICY IF EXISTS "Users can update own hotels" ON hotels;
DROP POLICY IF EXISTS "Users can delete own hotels" ON hotels;
DROP POLICY IF EXISTS "Users can create hotels" ON hotels;

CREATE POLICY "Users and admins can view hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = hotels.user_id
    )
  );

CREATE POLICY "Users and admins can insert hotels"
  ON hotels FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update hotels"
  ON hotels FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete hotels"
  ON hotels FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- CARS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated cars" ON cars;
DROP POLICY IF EXISTS "Users can update own cars" ON cars;
DROP POLICY IF EXISTS "Users can delete own cars" ON cars;
DROP POLICY IF EXISTS "Users can create cars" ON cars;

CREATE POLICY "Users and admins can view cars"
  ON cars FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = cars.user_id
    )
  );

CREATE POLICY "Users and admins can insert cars"
  ON cars FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update cars"
  ON cars FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete cars"
  ON cars FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- ITINERARY_ITEMS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated itinerary_items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can update own itinerary_items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can delete own itinerary_items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can create itinerary_items" ON itinerary_items;

CREATE POLICY "Users and admins can view itinerary_items"
  ON itinerary_items FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = itinerary_items.user_id
    )
  );

CREATE POLICY "Users and admins can insert itinerary_items"
  ON itinerary_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update itinerary_items"
  ON itinerary_items FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete itinerary_items"
  ON itinerary_items FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- APPOINTMENTS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;

CREATE POLICY "Users and admins can view appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = appointments.user_id
    )
  );

CREATE POLICY "Users and admins can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- TODOS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated todos" ON todos;
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
DROP POLICY IF EXISTS "Users can create todos" ON todos;

CREATE POLICY "Users and admins can view todos"
  ON todos FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = todos.user_id
    )
  );

CREATE POLICY "Users and admins can insert todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete todos"
  ON todos FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- EXPENSES TABLE
DROP POLICY IF EXISTS "Users can view own and delegated expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON expenses;

CREATE POLICY "Users and admins can view expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = expenses.user_id
    )
  );

CREATE POLICY "Users and admins can insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- SUPPLIERS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can create suppliers" ON suppliers;

CREATE POLICY "Users and admins can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = suppliers.user_id
    )
  );

CREATE POLICY "Users and admins can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- BUSINESS_CONTACTS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated business_contacts" ON business_contacts;
DROP POLICY IF EXISTS "Users can update own business_contacts" ON business_contacts;
DROP POLICY IF EXISTS "Users can delete own business_contacts" ON business_contacts;
DROP POLICY IF EXISTS "Users can create business_contacts" ON business_contacts;

CREATE POLICY "Users and admins can view business_contacts"
  ON business_contacts FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = business_contacts.user_id
    )
  );

CREATE POLICY "Users and admins can insert business_contacts"
  ON business_contacts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update business_contacts"
  ON business_contacts FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete business_contacts"
  ON business_contacts FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- DESTINATIONS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated destinations" ON destinations;
DROP POLICY IF EXISTS "Users can update own destinations" ON destinations;
DROP POLICY IF EXISTS "Users can delete own destinations" ON destinations;
DROP POLICY IF EXISTS "Users can create destinations" ON destinations;

CREATE POLICY "Users and admins can view destinations"
  ON destinations FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = destinations.user_id
    )
  );

CREATE POLICY "Users and admins can insert destinations"
  ON destinations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update destinations"
  ON destinations FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete destinations"
  ON destinations FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- TRIPS TABLE
DROP POLICY IF EXISTS "Users can view own and delegated trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;

CREATE POLICY "Users and admins can view trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = trips.user_id
    )
  );

CREATE POLICY "Users and admins can insert trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete trips"
  ON trips FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());

-- ENTITIES TABLE
DROP POLICY IF EXISTS "Users can view own and delegated entities" ON entities;
DROP POLICY IF EXISTS "Users can update own entities" ON entities;
DROP POLICY IF EXISTS "Users can delete own entities" ON entities;
DROP POLICY IF EXISTS "Users can create entities" ON entities;

CREATE POLICY "Users and admins can view entities"
  ON entities FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    user_id = auth.uid() OR
    auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = entities.user_id
    )
  );

CREATE POLICY "Users and admins can insert entities"
  ON entities FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can update entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid())
  WITH CHECK (is_admin() OR user_id = auth.uid());

CREATE POLICY "Users and admins can delete entities"
  ON entities FOR DELETE
  TO authenticated
  USING (is_admin() OR user_id = auth.uid());
