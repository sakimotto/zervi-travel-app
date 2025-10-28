/*
  # Create Unified Trips System

  ## Purpose
  Create a parent "trips" table to organize flights, hotels, cars, and meetings
  into cohesive travel itineraries. One trip (e.g., "SEMA 2025") contains multiple
  bookings and meetings.

  ## Changes
  1. Create trips table
  2. Add trip_id foreign key to flights, hotels, cars, meetings
  3. Create calculated cost views
  4. Add RLS policies
  5. Create indexes

  ## Benefits
  - Organize all travel components by trip
  - Auto-calculate total trip cost
  - Track trip status and budget
  - Better reporting and planning
*/

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core Info
  trip_name text NOT NULL,
  purpose text CHECK (purpose IN ('Business', 'Leisure', 'Mixed') OR purpose IS NULL) DEFAULT 'Business',

  -- Location
  destination_city text,
  destination_country text,

  -- Dates
  start_date date NOT NULL,
  end_date date NOT NULL,

  -- Status & Finance
  status text DEFAULT 'Planning' CHECK (status IN ('Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),
  budget numeric DEFAULT 0,

  -- Additional
  notes text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CHECK (end_date >= start_date)
);

-- Add trip_id to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'flights' AND column_name = 'trip_id'
  ) THEN
    ALTER TABLE flights ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_flights_trip_id ON flights(trip_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hotels' AND column_name = 'trip_id'
  ) THEN
    ALTER TABLE hotels ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_hotels_trip_id ON hotels(trip_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cars' AND column_name = 'trip_id'
  ) THEN
    ALTER TABLE cars ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_cars_trip_id ON cars(trip_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'trip_id'
  ) THEN
    ALTER TABLE meetings ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_meetings_trip_id ON meetings(trip_id);
  END IF;
END $$;

-- Create indexes for trips
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON trips(start_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_purpose ON trips(purpose);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trips_updated_at ON trips;
CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trips_updated_at();

-- Create view for trip with calculated costs
CREATE OR REPLACE VIEW trips_with_costs AS
SELECT
  t.*,
  COALESCE(
    (SELECT SUM(cost) FROM flights WHERE trip_id = t.id),
    0
  ) +
  COALESCE(
    (SELECT SUM(total_cost) FROM hotels WHERE trip_id = t.id),
    0
  ) +
  COALESCE(
    (SELECT SUM(total_cost) FROM cars WHERE trip_id = t.id),
    0
  ) as actual_cost,
  (SELECT COUNT(*) FROM flights WHERE trip_id = t.id) as flights_count,
  (SELECT COUNT(*) FROM hotels WHERE trip_id = t.id) as hotels_count,
  (SELECT COUNT(*) FROM cars WHERE trip_id = t.id) as cars_count,
  (SELECT COUNT(*) FROM meetings WHERE trip_id = t.id) as meetings_count
FROM trips t;

-- Add helpful comments
COMMENT ON TABLE trips IS 'Parent table organizing flights, hotels, cars, and meetings into cohesive trip itineraries';
COMMENT ON COLUMN trips.trip_name IS 'Name of trip, e.g., "SEMA 2025", "Thailand Factory Visit"';
COMMENT ON COLUMN trips.purpose IS 'Business, Leisure, or Mixed trip';
COMMENT ON COLUMN trips.budget IS 'Planned budget for entire trip';
COMMENT ON VIEW trips_with_costs IS 'Trips with auto-calculated actual costs from all associated bookings';