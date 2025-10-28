/*
  # Add user_id to Legacy Tables
  
  Adds user_id column to all legacy tables and backfills with current user.
  This allows existing data (like China itinerary) to be associated with you.
  
  Tables Updated:
  - suppliers
  - business_contacts
  - itinerary_items
  - expenses
  - todos
  - appointments
  - destinations
*/

-- Add user_id to suppliers
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE suppliers SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4' WHERE user_id IS NULL;
ALTER TABLE suppliers ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);

-- Add user_id to business_contacts
ALTER TABLE business_contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE business_contacts SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4' WHERE user_id IS NULL;
ALTER TABLE business_contacts ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_contacts_user_id ON business_contacts(user_id);

-- Add user_id to itinerary_items
ALTER TABLE itinerary_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE itinerary_items SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4' WHERE user_id IS NULL;
ALTER TABLE itinerary_items ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_itinerary_items_user_id ON itinerary_items(user_id);

-- Add user_id to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE expenses SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4' WHERE user_id IS NULL;
ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- Add user_id to todos
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE todos SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4' WHERE user_id IS NULL;
ALTER TABLE todos ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Add user_id to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE appointments SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4' WHERE user_id IS NULL;
ALTER TABLE appointments ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- Add user_id to destinations
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE destinations SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4' WHERE user_id IS NULL;
ALTER TABLE destinations ALTER COLUMN user_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_destinations_user_id ON destinations(user_id);
