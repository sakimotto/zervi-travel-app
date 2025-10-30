/*
  # Create Admin Password Reset Function

  1. Functions
    - `admin_reset_user_password`: Securely resets a user's password (admin only)
  
  2. Security
    - Only callable by users with admin role
    - Uses encrypted_password for secure password storage
    - Requires valid session
*/

-- Create function to reset user password (admin only)
CREATE OR REPLACE FUNCTION admin_reset_user_password(
  target_user_id uuid,
  new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  requesting_user_id uuid;
  user_role text;
  password_hash text;
BEGIN
  -- Get the requesting user's ID from the current session
  requesting_user_id := auth.uid();
  
  IF requesting_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if requesting user is admin
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = requesting_user_id;
  
  IF user_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Admin access required');
  END IF;
  
  -- Validate password length
  IF length(new_password) < 6 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Hash the password using crypt
  password_hash := crypt(new_password, gen_salt('bf'));
  
  -- Update the user's password in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = password_hash,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN json_build_object('success', true, 'message', 'Password reset successfully');
END;
$$;