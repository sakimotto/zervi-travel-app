/*
  # Update Legacy Tables RLS for Delegation

  Updates RLS policies on legacy tables to support delegated access.
  Now your secretary can view/edit your data.
*/

-- EXPENSES
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON expenses;

CREATE POLICY "Users can view own or delegated expenses"
  ON expenses FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create expenses"
  ON expenses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated expenses"
  ON expenses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated expenses"
  ON expenses FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));

-- TODOS
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
DROP POLICY IF EXISTS "Enable read access for all users" ON todos;
DROP POLICY IF EXISTS "Enable insert for all users" ON todos;
DROP POLICY IF EXISTS "Enable update for all users" ON todos;
DROP POLICY IF EXISTS "Enable delete for all users" ON todos;

CREATE POLICY "Users can view own or delegated todos"
  ON todos FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create todos"
  ON todos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated todos"
  ON todos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated todos"
  ON todos FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));

-- APPOINTMENTS
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;

CREATE POLICY "Users can view own or delegated appointments"
  ON appointments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated appointments"
  ON appointments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));

-- ITINERARY_ITEMS
DROP POLICY IF EXISTS "Users can view own itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can insert own itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can update own itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Users can delete own itinerary items" ON itinerary_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON itinerary_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON itinerary_items;
DROP POLICY IF EXISTS "Enable update for all users" ON itinerary_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON itinerary_items;

CREATE POLICY "Users can view own or delegated itinerary_items"
  ON itinerary_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create itinerary_items"
  ON itinerary_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated itinerary_items"
  ON itinerary_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated itinerary_items"
  ON itinerary_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));

-- SUPPLIERS
DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Enable read access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable insert for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable update for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable delete for all users" ON suppliers;

CREATE POLICY "Users can view own or delegated suppliers"
  ON suppliers FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create suppliers"
  ON suppliers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated suppliers"
  ON suppliers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated suppliers"
  ON suppliers FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));

-- BUSINESS_CONTACTS
DROP POLICY IF EXISTS "Users can view own business contacts" ON business_contacts;
DROP POLICY IF EXISTS "Users can insert own business contacts" ON business_contacts;
DROP POLICY IF EXISTS "Users can update own business contacts" ON business_contacts;
DROP POLICY IF EXISTS "Users can delete own business contacts" ON business_contacts;
DROP POLICY IF EXISTS "Enable read access for all users" ON business_contacts;
DROP POLICY IF EXISTS "Enable insert for all users" ON business_contacts;
DROP POLICY IF EXISTS "Enable update for all users" ON business_contacts;
DROP POLICY IF EXISTS "Enable delete for all users" ON business_contacts;

CREATE POLICY "Users can view own or delegated business_contacts"
  ON business_contacts FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create business_contacts"
  ON business_contacts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated business_contacts"
  ON business_contacts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated business_contacts"
  ON business_contacts FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));

-- DESTINATIONS
DROP POLICY IF EXISTS "Enable read access for all users" ON destinations;
DROP POLICY IF EXISTS "Enable insert for all users" ON destinations;
DROP POLICY IF EXISTS "Enable update for all users" ON destinations;
DROP POLICY IF EXISTS "Enable delete for all users" ON destinations;

CREATE POLICY "Users can view own or delegated destinations"
  ON destinations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'read'));

CREATE POLICY "Users can create destinations"
  ON destinations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or delegated destinations"
  ON destinations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'write'))
  WITH CHECK (auth.uid() = user_id OR has_delegated_access(user_id, 'write'));

CREATE POLICY "Users can delete own or delegated destinations"
  ON destinations FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_delegated_access(user_id, 'admin'));
