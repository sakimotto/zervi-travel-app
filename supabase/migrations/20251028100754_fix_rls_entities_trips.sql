/*
  # Fix RLS for Entities and Trips Tables

  1. Security Updates
    - Enable RLS on `entities` table (was disabled!)
    - Enable RLS on `trips` table (was disabled!)
    - Add comprehensive policies for both tables
  
  2. Policies Added
    **Entities Table:**
    - SELECT: Users can view their own entities
    - INSERT: Users can create entities
    - UPDATE: Users can update their own entities
    - DELETE: Users can delete their own entities
    
    **Trips Table:**
    - SELECT: Users can view their own trips
    - INSERT: Users can create trips
    - UPDATE: Users can update their own trips
    - DELETE: Users can delete their own trips
  
  3. Important Notes
    - Both tables have user_id columns for ownership
    - Policies enforce strict user isolation
    - No data access without authentication
*/

-- Enable RLS on entities table
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- Entities policies
CREATE POLICY "Users can view own entities"
  ON entities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create entities"
  ON entities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entities"
  ON entities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entities"
  ON entities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on trips table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
