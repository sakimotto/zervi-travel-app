/*
  # Add SELECT Policies for All Remaining Tables

  1. Changes
    - Add SELECT, UPDATE, DELETE policies for all CRM and travel module tables
    - Handle tables with and without user_id columns
    - Enable delegation support for all tables

  2. Security
    - Users can view their own data
    - Users can view data delegated to them
    - Users can only modify/delete their own data
    - For junction tables, check ownership through parent tables
*/

-- cars
CREATE POLICY "Users can view own and delegated cars"
  ON cars FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own cars"
  ON cars FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own cars"
  ON cars FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- customer_categories (linked via customer_id)
CREATE POLICY "Users can view customer_categories for own customers"
  ON customer_categories FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
    OR customer_id IN (
      SELECT id FROM customers 
      WHERE user_id IN (
        SELECT owner_id FROM delegations WHERE delegate_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update customer_categories for own customers"
  ON customer_categories FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete customer_categories for own customers"
  ON customer_categories FOR DELETE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

-- customers
CREATE POLICY "Users can view own and delegated customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- entities
CREATE POLICY "Users can view own and delegated entities"
  ON entities FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own entities"
  ON entities FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- flights
CREATE POLICY "Users can view own and delegated flights"
  ON flights FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own flights"
  ON flights FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own flights"
  ON flights FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- hotels
CREATE POLICY "Users can view own and delegated hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own hotels"
  ON hotels FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own hotels"
  ON hotels FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- meetings
CREATE POLICY "Users can view own and delegated meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- trade_show_meetings (linked via trade_show_id)
CREATE POLICY "Users can view trade_show_meetings for own trade shows"
  ON trade_show_meetings FOR SELECT
  TO authenticated
  USING (
    trade_show_id IN (
      SELECT id FROM trade_shows WHERE user_id = auth.uid()
    )
    OR trade_show_id IN (
      SELECT id FROM trade_shows 
      WHERE user_id IN (
        SELECT owner_id FROM delegations WHERE delegate_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update trade_show_meetings for own trade shows"
  ON trade_show_meetings FOR UPDATE
  TO authenticated
  USING (
    trade_show_id IN (
      SELECT id FROM trade_shows WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    trade_show_id IN (
      SELECT id FROM trade_shows WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete trade_show_meetings for own trade shows"
  ON trade_show_meetings FOR DELETE
  TO authenticated
  USING (
    trade_show_id IN (
      SELECT id FROM trade_shows WHERE user_id = auth.uid()
    )
  );

-- trade_shows
CREATE POLICY "Users can view own and delegated trade_shows"
  ON trade_shows FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own trade_shows"
  ON trade_shows FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own trade_shows"
  ON trade_shows FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- trips
CREATE POLICY "Users can view own and delegated trips"
  ON trips FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations WHERE owner_id = user_id
    )
  );

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());