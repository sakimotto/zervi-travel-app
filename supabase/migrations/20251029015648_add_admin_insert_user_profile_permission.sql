/*
  # Add Admin Insert User Profile Permission

  1. Changes
    - Add RLS policy allowing admins to insert user profiles
    - This is a safety net in case the trigger doesn't create the profile
    - Allows admins to use UPSERT operations

  2. Security
    - Only users with admin role can insert user profiles for others
    - Regular users can still only insert their own profile
*/

-- Add policy for admins to insert any user profile
CREATE POLICY "Admins can insert any profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if inserting own profile OR if user is admin
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );
