/*
  # Add trip_id to itinerary_items

  1. Changes
    - Add optional `trip_id` column to `itinerary_items` table as foreign key to `trips`
    - Add index for faster trip-based queries
  
  2. Security
    - No changes to RLS policies needed (inherits from existing policies)
*/

-- Add trip_id column (optional/nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itinerary_items' AND column_name = 'trip_id'
  ) THEN
    ALTER TABLE itinerary_items 
    ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id 
    ON itinerary_items(trip_id);
  END IF;
END $$;
