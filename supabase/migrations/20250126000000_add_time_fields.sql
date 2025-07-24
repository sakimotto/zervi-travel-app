/*
  # Add time fields to itinerary_items table

  1. Schema Changes
    - Add `start_time` field to itinerary_items table
    - Add `end_time` field to itinerary_items table

  2. Security
    - Maintain existing RLS policies
*/

-- Add start_time field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itinerary_items' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE itinerary_items ADD COLUMN start_time time;
  END IF;
END $$;

-- Add end_time field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'itinerary_items' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE itinerary_items ADD COLUMN end_time time;
  END IF;
END $$;