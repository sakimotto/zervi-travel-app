/*
  # Add user_id to Legacy Tables - CRITICAL FIX

  ## Critical Issue
  Legacy tables (destinations, suppliers, business_contacts, etc.) lack user_id foreign keys,
  causing data privacy issues where users can see each other's data.

  ## Changes
  1. Add user_id column to all legacy tables
  2. Backfill user_id for existing records (set to first user if any)
  3. Update RLS policies to enforce user-based isolation
  4. Add NOT NULL constraint after backfill

  ## Tables Updated
    - suppliers
    - business_contacts
    - itinerary_items
    - expenses
    - todos
    - appointments

  ## Note
  destinations table intentionally left as shared/public resource
*/

-- Add user_id to suppliers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'user_id'
  ) THEN
    -- Add column as nullable first
    ALTER TABLE suppliers ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

    -- Backfill with first user (or leave null if no users)
    UPDATE suppliers SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

    -- Make it NOT NULL after backfill
    ALTER TABLE suppliers ALTER COLUMN user_id SET NOT NULL;

    -- Create index
    CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
  END IF;
END $$;

-- Add user_id to business_contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE business_contacts SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    ALTER TABLE business_contacts ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_business_contacts_user_id ON business_contacts(user_id);
  END IF;
END $$;

-- Add user_id to itinerary_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itinerary_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE itinerary_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE itinerary_items SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    ALTER TABLE itinerary_items ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_user_id ON itinerary_items(user_id);
  END IF;
END $$;

-- Add user_id to expenses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE expenses ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE expenses SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
  END IF;
END $$;

-- Add user_id to todos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE todos ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE todos SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    ALTER TABLE todos ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
  END IF;
END $$;

-- Add user_id to appointments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE appointments SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    ALTER TABLE appointments ALTER COLUMN user_id SET NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
  END IF;
END $$;

-- Update RLS policies for suppliers
DROP POLICY IF EXISTS "Enable read access for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable insert for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable update for all users" ON suppliers;
DROP POLICY IF EXISTS "Enable delete for all users" ON suppliers;

CREATE POLICY "Users can view own suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for business_contacts
DROP POLICY IF EXISTS "Enable read access for all users" ON business_contacts;
DROP POLICY IF EXISTS "Enable insert for all users" ON business_contacts;
DROP POLICY IF EXISTS "Enable update for all users" ON business_contacts;
DROP POLICY IF EXISTS "Enable delete for all users" ON business_contacts;

CREATE POLICY "Users can view own business contacts"
  ON business_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business contacts"
  ON business_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business contacts"
  ON business_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business contacts"
  ON business_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for itinerary_items
DROP POLICY IF EXISTS "Enable read access for all users" ON itinerary_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON itinerary_items;
DROP POLICY IF EXISTS "Enable update for all users" ON itinerary_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON itinerary_items;

CREATE POLICY "Users can view own itinerary items"
  ON itinerary_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itinerary items"
  ON itinerary_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itinerary items"
  ON itinerary_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own itinerary items"
  ON itinerary_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for expenses
DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
DROP POLICY IF EXISTS "Enable insert for all users" ON expenses;
DROP POLICY IF EXISTS "Enable update for all users" ON expenses;
DROP POLICY IF EXISTS "Enable delete for all users" ON expenses;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for todos
DROP POLICY IF EXISTS "Enable read access for all users" ON todos;
DROP POLICY IF EXISTS "Enable insert for all users" ON todos;
DROP POLICY IF EXISTS "Enable update for all users" ON todos;
DROP POLICY IF EXISTS "Enable delete for all users" ON todos;

CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for appointments
DROP POLICY IF EXISTS "Enable read access for all users" ON appointments;
DROP POLICY IF EXISTS "Enable insert for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
