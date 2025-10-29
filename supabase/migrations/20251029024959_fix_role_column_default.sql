/*
  # Fix Role Column Default Value

  1. Changes
    - Change default value of role column from 'staff' to 'user'
    - This matches the CHECK constraint that only allows: 'admin', 'manager', 'user', 'viewer'

  2. Security
    - New users default to 'user' role which is safe and expected
*/

-- Update the default value for role column
ALTER TABLE user_profiles 
  ALTER COLUMN role SET DEFAULT 'user';
