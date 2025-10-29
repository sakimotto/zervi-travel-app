/*
  # Fix User Profile Trigger Role Constraint

  1. Changes
    - Update create_user_profile() trigger function to use 'user' as default role instead of 'staff'
    - This matches the role constraint: ('admin', 'manager', 'user', 'viewer')

  2. Security
    - Function remains SECURITY DEFINER to bypass RLS during trigger execution
    - Default role 'user' is safe for new signups
*/

-- Update the trigger function to use correct default role
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
