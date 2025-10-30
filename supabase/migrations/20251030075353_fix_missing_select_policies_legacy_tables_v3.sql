/*
  # Fix Missing SELECT Policies for Legacy Tables

  1. Changes
    - Add SELECT policies for all legacy tables
    - Add UPDATE policies for all legacy tables
    - Add DELETE policies for all legacy tables

  2. Security
    - Users can view their own data
    - Users can view data delegated to them via delegations table
    - Users can only modify/delete their own data
*/

-- appointments: SELECT policy
CREATE POLICY "Users can view own and delegated appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations 
      WHERE owner_id = user_id
    )
  );

-- appointments: UPDATE policy
CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- appointments: DELETE policy
CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- business_contacts: SELECT policy
CREATE POLICY "Users can view own and delegated business_contacts"
  ON business_contacts FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations 
      WHERE owner_id = user_id
    )
  );

-- business_contacts: UPDATE policy
CREATE POLICY "Users can update own business_contacts"
  ON business_contacts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- business_contacts: DELETE policy
CREATE POLICY "Users can delete own business_contacts"
  ON business_contacts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- destinations: SELECT policy
CREATE POLICY "Users can view own and delegated destinations"
  ON destinations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations 
      WHERE owner_id = user_id
    )
  );

-- destinations: UPDATE policy
CREATE POLICY "Users can update own destinations"
  ON destinations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- destinations: DELETE policy
CREATE POLICY "Users can delete own destinations"
  ON destinations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- expenses: SELECT policy
CREATE POLICY "Users can view own and delegated expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations 
      WHERE owner_id = user_id
    )
  );

-- expenses: UPDATE policy
CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- expenses: DELETE policy
CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- itinerary_items: SELECT policy
CREATE POLICY "Users can view own and delegated itinerary_items"
  ON itinerary_items FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations 
      WHERE owner_id = user_id
    )
  );

-- itinerary_items: UPDATE policy
CREATE POLICY "Users can update own itinerary_items"
  ON itinerary_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- itinerary_items: DELETE policy
CREATE POLICY "Users can delete own itinerary_items"
  ON itinerary_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- suppliers: SELECT policy
CREATE POLICY "Users can view own and delegated suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations 
      WHERE owner_id = user_id
    )
  );

-- suppliers: UPDATE policy
CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- suppliers: DELETE policy
CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- todos: SELECT policy
CREATE POLICY "Users can view own and delegated todos"
  ON todos FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR auth.uid() IN (
      SELECT delegate_id FROM delegations 
      WHERE owner_id = user_id
    )
  );

-- todos: UPDATE policy
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- todos: DELETE policy
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());