/*
  # Add Missing Relationships Between Tables

  ## Purpose
  Connect related entities to enable better business workflows:
  - Link business_contacts to customers
  - Link expenses to bookings (flights, hotels, cars)
  - Link customers to suppliers (for dual relationships)
  - Add date validation constraints

  ## Changes
  1. Add customer_id to business_contacts
  2. Add booking reference fields to expenses
  3. Add supplier_id to customers (optional dual relationship)
  4. Add date validation check constraints
  5. Add calculated fields triggers

  ## Note
  All changes use IF NOT EXISTS to be safely re-runnable
*/

-- Add customer_id to business_contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE business_contacts
    ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_business_contacts_customer_id
    ON business_contacts(customer_id);
  END IF;
END $$;

-- Add booking references to expenses (to link travel costs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'flight_id'
  ) THEN
    ALTER TABLE expenses
    ADD COLUMN flight_id uuid REFERENCES flights(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'hotel_id'
  ) THEN
    ALTER TABLE expenses
    ADD COLUMN hotel_id uuid REFERENCES hotels(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'car_id'
  ) THEN
    ALTER TABLE expenses
    ADD COLUMN car_id uuid REFERENCES cars(id) ON DELETE SET NULL;
  END IF;

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_expenses_flight_id ON expenses(flight_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_hotel_id ON expenses(hotel_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_car_id ON expenses(car_id);
END $$;

-- Add supplier_id to customers (for customers who are also suppliers)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'supplier_id'
  ) THEN
    ALTER TABLE customers
    ADD COLUMN supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_customers_supplier_id ON customers(supplier_id);
  END IF;
END $$;

-- Add date validation constraints
-- Flights: arrival_date >= departure_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'flights_valid_dates'
  ) THEN
    ALTER TABLE flights
    ADD CONSTRAINT flights_valid_dates
    CHECK (arrival_date >= departure_date);
  END IF;
END $$;

-- Hotels: check_out_date > check_in_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'hotels_valid_dates'
  ) THEN
    ALTER TABLE hotels
    ADD CONSTRAINT hotels_valid_dates
    CHECK (check_out_date > check_in_date);
  END IF;
END $$;

-- Hotels: number_of_guests >= 1
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'hotels_valid_guests'
  ) THEN
    ALTER TABLE hotels
    ADD CONSTRAINT hotels_valid_guests
    CHECK (number_of_guests >= 1);
  END IF;
END $$;

-- Cars: dropoff_date >= pickup_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cars_valid_dates'
  ) THEN
    ALTER TABLE cars
    ADD CONSTRAINT cars_valid_dates
    CHECK (dropoff_date >= pickup_date);
  END IF;
END $$;

-- Meetings: follow_up_date should be after meeting_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'meetings_valid_followup'
  ) THEN
    ALTER TABLE meetings
    ADD CONSTRAINT meetings_valid_followup
    CHECK (follow_up_date IS NULL OR follow_up_date >= meeting_date);
  END IF;
END $$;

-- Trade show meetings: follow_up_date should be after meeting_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'trade_show_meetings_valid_followup'
  ) THEN
    ALTER TABLE trade_show_meetings
    ADD CONSTRAINT trade_show_meetings_valid_followup
    CHECK (follow_up_date IS NULL OR follow_up_date >= meeting_date);
  END IF;
END $$;

-- Trade shows: end_date >= start_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'trade_shows_valid_dates'
  ) THEN
    ALTER TABLE trade_shows
    ADD CONSTRAINT trade_shows_valid_dates
    CHECK (end_date >= start_date);
  END IF;
END $$;

-- Create function to auto-calculate hotel total_nights
CREATE OR REPLACE FUNCTION calculate_hotel_nights()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_date IS NOT NULL AND NEW.check_out_date IS NOT NULL THEN
    NEW.total_nights = NEW.check_out_date - NEW.check_in_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hotel nights calculation
DROP TRIGGER IF EXISTS hotel_calculate_nights ON hotels;
CREATE TRIGGER hotel_calculate_nights
  BEFORE INSERT OR UPDATE ON hotels
  FOR EACH ROW
  EXECUTE FUNCTION calculate_hotel_nights();

-- Create function to auto-calculate hotel total_cost
CREATE OR REPLACE FUNCTION calculate_hotel_cost()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_nights IS NOT NULL AND NEW.cost_per_night IS NOT NULL THEN
    NEW.total_cost = NEW.total_nights * NEW.cost_per_night;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hotel cost calculation
DROP TRIGGER IF EXISTS hotel_calculate_cost ON hotels;
CREATE TRIGGER hotel_calculate_cost
  BEFORE INSERT OR UPDATE ON hotels
  FOR EACH ROW
  EXECUTE FUNCTION calculate_hotel_cost();

-- Add updated_at trigger for customers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables that have it
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment explaining relationships
COMMENT ON COLUMN business_contacts.customer_id IS 'Links contact to a customer in the CRM system';
COMMENT ON COLUMN expenses.flight_id IS 'Auto-links expense to flight booking for travel cost tracking';
COMMENT ON COLUMN expenses.hotel_id IS 'Auto-links expense to hotel booking for accommodation cost tracking';
COMMENT ON COLUMN expenses.car_id IS 'Auto-links expense to car rental for transportation cost tracking';
COMMENT ON COLUMN customers.supplier_id IS 'Links customer to supplier if they have a dual relationship';
