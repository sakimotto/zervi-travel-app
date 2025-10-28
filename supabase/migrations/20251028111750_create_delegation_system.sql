/*
  # Create Delegation System

  1. New Tables
    - `user_profiles` - Store user display names and metadata
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text) - staff, manager, admin
      - `created_at` (timestamptz)
      
    - `delegations` - Allow users to delegate access to others
      - `id` (uuid, primary key)
      - `owner_id` (uuid) - The user who owns the data
      - `delegate_id` (uuid) - The user who gets access
      - `permission` (text) - read, write, admin
      - `created_at` (timestamptz)
      - `granted_by` (uuid) - Who granted the delegation
  
  2. Security
    - Enable RLS on both tables
    - Users can view their own profile
    - Users can view delegations where they are owner or delegate
    - Only owners can grant/revoke delegations
  
  3. Important Notes
    - Delegation allows secretary to access boss's data
    - RLS policies will be updated to check delegations
    - Supports read-only or read-write access
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create delegations table
CREATE TABLE IF NOT EXISTS delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'read',
  created_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(owner_id, delegate_id)
);

-- Create index for faster delegation lookups
CREATE INDEX IF NOT EXISTS idx_delegations_owner ON delegations(owner_id);
CREATE INDEX IF NOT EXISTS idx_delegations_delegate ON delegations(delegate_id);

-- Enable RLS on delegations
ALTER TABLE delegations ENABLE ROW LEVEL SECURITY;

-- Delegation policies
CREATE POLICY "Users can view delegations they are involved in"
  ON delegations FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = delegate_id);

CREATE POLICY "Owners can create delegations"
  ON delegations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id AND auth.uid() = granted_by);

CREATE POLICY "Owners can update delegations"
  ON delegations FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete delegations"
  ON delegations FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create function to check if user has delegated access
CREATE OR REPLACE FUNCTION has_delegated_access(target_user_id UUID, required_permission TEXT DEFAULT 'read')
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM delegations
    WHERE owner_id = target_user_id
      AND delegate_id = auth.uid()
      AND (
        permission = 'admin' OR
        permission = required_permission OR
        (permission = 'write' AND required_permission = 'read')
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
