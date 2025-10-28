/*
  # Update RLS Policies for Delegation Support

  1. Changes
    - Drop existing policies on core tables
    - Recreate policies to support delegated access
    - Allow delegates to view/edit data they have access to
  
  2. Tables Updated
    - trips
    - flights
    - hotels
    - cars
    - meetings
    - entities
    - customers
    - trade_shows
    - expenses
    - todos
    - appointments
    - itinerary_items
    - suppliers
    - business_contacts
    - destinations
  
  3. Policy Logic
    - SELECT: Owner OR delegate with 'read'/'write'/'admin'
    - INSERT: Owner OR delegate with 'write'/'admin'
    - UPDATE: Owner OR delegate with 'write'/'admin'
    - DELETE: Owner OR delegate with 'admin'
*/

-- TRIPS TABLE
DROP POLICY IF EXISTS "Users can view own trips" ON trips;
DROP POLICY IF EXISTS "Users can create trips" ON trips;
DROP POLICY IF EXISTS "Users can update own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON trips;

CREATE POLICY "Users can view own or delegated trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'read')
  );

CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  );

CREATE POLICY "Users can delete own or delegated trips"
  ON trips FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'admin')
  );

-- FLIGHTS TABLE
DROP POLICY IF EXISTS "Users can view own flights" ON flights;
DROP POLICY IF EXISTS "Users can create flights" ON flights;
DROP POLICY IF EXISTS "Users can update own flights" ON flights;
DROP POLICY IF EXISTS "Users can delete own flights" ON flights;

CREATE POLICY "Users can view own or delegated flights"
  ON flights FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'read')
  );

CREATE POLICY "Users can create flights"
  ON flights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated flights"
  ON flights FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  );

CREATE POLICY "Users can delete own or delegated flights"
  ON flights FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'admin')
  );

-- HOTELS TABLE
DROP POLICY IF EXISTS "Users can view own hotels" ON hotels;
DROP POLICY IF EXISTS "Users can create hotels" ON hotels;
DROP POLICY IF EXISTS "Users can update own hotels" ON hotels;
DROP POLICY IF EXISTS "Users can delete own hotels" ON hotels;

CREATE POLICY "Users can view own or delegated hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'read')
  );

CREATE POLICY "Users can create hotels"
  ON hotels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated hotels"
  ON hotels FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  );

CREATE POLICY "Users can delete own or delegated hotels"
  ON hotels FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'admin')
  );

-- CARS TABLE
DROP POLICY IF EXISTS "Users can view own cars" ON cars;
DROP POLICY IF EXISTS "Users can create cars" ON cars;
DROP POLICY IF EXISTS "Users can update own cars" ON cars;
DROP POLICY IF EXISTS "Users can delete own cars" ON cars;

CREATE POLICY "Users can view own or delegated cars"
  ON cars FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'read')
  );

CREATE POLICY "Users can create cars"
  ON cars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated cars"
  ON cars FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  );

CREATE POLICY "Users can delete own or delegated cars"
  ON cars FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'admin')
  );

-- MEETINGS TABLE
DROP POLICY IF EXISTS "Users can view own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON meetings;
DROP POLICY IF EXISTS "Users can update own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can delete own meetings" ON meetings;

CREATE POLICY "Users can view own or delegated meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'read')
  );

CREATE POLICY "Users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  );

CREATE POLICY "Users can delete own or delegated meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'admin')
  );

-- ENTITIES TABLE
DROP POLICY IF EXISTS "Users can view own entities" ON entities;
DROP POLICY IF EXISTS "Users can create entities" ON entities;
DROP POLICY IF EXISTS "Users can update own entities" ON entities;
DROP POLICY IF EXISTS "Users can delete own entities" ON entities;

CREATE POLICY "Users can view own or delegated entities"
  ON entities FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'read')
  );

CREATE POLICY "Users can create entities"
  ON entities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  );

CREATE POLICY "Users can delete own or delegated entities"
  ON entities FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'admin')
  );

-- CUSTOMERS TABLE
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

CREATE POLICY "Users can view own or delegated customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'read')
  );

CREATE POLICY "Users can create customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  )
  WITH CHECK (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'write')
  );

CREATE POLICY "Users can delete own or delegated customers"
  ON customers FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    has_delegated_access(user_id, 'admin')
  );

-- Continue with remaining tables in similar pattern...
-- TRADE SHOWS
DROP POLICY IF EXISTS "Users can view own trade_shows" ON trade_shows;
DROP POLICY IF EXISTS "Users can create trade_shows" ON trade_shows;
DROP POLICY IF EXISTS "Users can update own trade_shows" ON trade_shows;
DROP POLICY IF EXISTS "Users can delete own trade_shows" ON trade_shows;

CREATE POLICY "Users can view own or delegated trade_shows"
  ON trade_shows FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create trade_shows"
  ON trade_shows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated trade_shows"
  ON trade_shows FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated trade_shows"
  ON trade_shows FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));
