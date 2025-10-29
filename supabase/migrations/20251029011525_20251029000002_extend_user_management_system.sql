/*
  # Extend User Management System

  1. Changes to Existing Tables
    - Add columns to `user_profiles`:
      - `status` (text, default 'active')
      - `phone` (text)
      - `department` (text)
      - `job_title` (text)
      - `created_by` (uuid, references auth.users)
      - `last_login` (timestamptz)

  2. New Tables
    - `user_permissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `permission_key` (text, not null)
      - `granted_by` (uuid, references auth.users)
      - `granted_at` (timestamptz)

    - `user_activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `action` (text, not null)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on all tables
    - Admin users can manage all users
    - Users can view their own profile
    - Activity logging for audit trail
*/

-- Add missing columns to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'department'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN department text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'job_title'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN job_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_login timestamptz;
  END IF;
END $$;

-- Ensure role column has proper constraint
DO $$
BEGIN
  ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('admin', 'manager', 'user', 'viewer'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_key)
);

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_permissions

-- Admins can view all permissions
CREATE POLICY "Admins can view all permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage permissions
CREATE POLICY "Admins can insert permissions"
  ON user_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can update permissions"
  ON user_permissions FOR UPDATE
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

CREATE POLICY "Admins can delete permissions"
  ON user_permissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- RLS Policies for user_activity_log

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Users can view their own activity log
CREATE POLICY "Users can view own activity log"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Any authenticated user can insert activity logs
CREATE POLICY "Users can create activity logs"
  ON user_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to log user activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;