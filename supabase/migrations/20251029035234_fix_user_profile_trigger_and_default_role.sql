/*
  # Fix User Profile Trigger and Default Role

  1. Changes
    - Update create_user_profile() trigger function to default role to 'user' instead of 'staff'
    - The role constraint only allows: admin, manager, user, viewer
    - The trigger was using 'staff' which violates the constraint

  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Update the trigger function to use 'user' as default role instead of 'staff'
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
