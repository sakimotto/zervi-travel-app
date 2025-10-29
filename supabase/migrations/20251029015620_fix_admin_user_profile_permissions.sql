/*
  # Fix Admin User Profile Permissions

  1. Changes
    - Add RLS policy allowing admins to update any user profile
    - This enables admins to set role, phone, department, job_title when creating users

  2. Security
    - Only users with admin role can update other users' profiles
    - Regular users can still only update their own profiles
*/

-- Add policy for admins to update any user profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );
