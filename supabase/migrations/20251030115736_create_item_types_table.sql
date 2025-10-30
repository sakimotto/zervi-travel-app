/*
  # Create Item Types Table

  1. New Tables
    - `item_types`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type_name` (text, unique per user) - e.g., "Flight", "Hotel", "Meeting"
      - `icon_name` (text) - Lucide icon name
      - `color_class` (text) - Tailwind color class
      - `is_system` (boolean) - true for built-in types, false for user-created
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on `item_types` table
    - Users can view system types and their own types
    - Users can create their own types
    - Users can update/delete only their own non-system types
    
  3. Initial Data
    - Insert default system item types (Flight, Hotel, Car, Train, Bus, Meeting, TradeShow, etc.)
*/

-- Create item_types table
CREATE TABLE IF NOT EXISTS item_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type_name text NOT NULL,
  icon_name text DEFAULT 'MapPin',
  color_class text DEFAULT 'text-gray-500',
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_type UNIQUE (user_id, type_name)
);

-- Enable RLS
ALTER TABLE item_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view system types and own types"
  ON item_types FOR SELECT
  TO authenticated
  USING (is_system = true OR user_id = auth.uid());

CREATE POLICY "Users can create own types"
  ON item_types FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can update own non-system types"
  ON item_types FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false)
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete own non-system types"
  ON item_types FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

-- Insert system types
INSERT INTO item_types (user_id, type_name, icon_name, color_class, is_system) VALUES
  (NULL, 'Flight', 'Plane', 'text-blue-500', true),
  (NULL, 'Hotel', 'Hotel', 'text-indigo-500', true),
  (NULL, 'Car', 'Car', 'text-yellow-500', true),
  (NULL, 'Train', 'Train', 'text-amber-500', true),
  (NULL, 'Bus', 'Bus', 'text-lime-500', true),
  (NULL, 'Taxi', 'Car', 'text-yellow-500', true),
  (NULL, 'Meeting', 'Users', 'text-pink-500', true),
  (NULL, 'TradeShow', 'Briefcase', 'text-green-500', true),
  (NULL, 'BusinessVisit', 'Building', 'text-purple-500', true),
  (NULL, 'Conference', 'Calendar', 'text-red-500', true)
ON CONFLICT (user_id, type_name) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_item_types_user_id ON item_types(user_id);
CREATE INDEX IF NOT EXISTS idx_item_types_is_system ON item_types(is_system);
