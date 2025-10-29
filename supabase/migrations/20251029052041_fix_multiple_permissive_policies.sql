/*
  # Fix Multiple Permissive Policies - Security Hardening

  1. Changes
    - Replace multiple permissive policies with single comprehensive policies
    - Use OR logic within single policy instead of multiple policies
    - Maintains same access patterns with better security model
  
  2. Tables Fixed
    - user_activity_log: Combine "Admins can view all activity logs" and "Users can view own activity log"
    - user_permissions: Combine "Admins can view all permissions" and "Users can view own permissions"

  3. Security Benefits
    - Clearer policy logic
    - Easier to audit and maintain
    - Prevents potential policy conflicts
*/

-- Fix user_activity_log policies
-- Drop existing permissive SELECT policies
DROP POLICY IF EXISTS "Admins can view all activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity log" ON user_activity_log;

-- Create single comprehensive SELECT policy
CREATE POLICY "Users can view own activity, admins can view all"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Fix user_permissions policies
-- Drop existing permissive SELECT policies
DROP POLICY IF EXISTS "Admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;

-- Create single comprehensive SELECT policy
CREATE POLICY "Users can view own permissions, admins can view all"
  ON user_permissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
