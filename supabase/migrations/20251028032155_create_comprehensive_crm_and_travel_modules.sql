/*
  # Comprehensive CRM and Travel Management System
  
  ## 1. New Tables
  
  ### Customers/CRM Module
    - `customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `company_name` (text)
      - `contact_person` (text)
      - `email` (text)
      - `phone` (text)
      - `website` (text)
      - `country` (text)
      - `city` (text)
      - `address` (text)
      - `notes` (text)
      - `status` (text) - Lead, Prospect, Active, Inactive
      - `priority` (text) - Low, Medium, High, Critical
      - `estimated_value` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `customer_categories`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `is_oem` (boolean) - Original Equipment Manufacturer
      - `is_odm` (boolean) - Original Design Manufacturer
      - `is_importer` (boolean)
      - `is_shop_owner` (boolean)
      - `is_retail_chain` (boolean)
      - `is_manufacturing_outsource` (boolean) - Wants to outsource to Thai facility
      - `is_distributor` (boolean)
      - `is_wholesaler` (boolean)
      - `category_notes` (text)
  
  ### Trade Shows Module
    - `trade_shows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text) - e.g., "SEMA 2025"
      - `location` (text)
      - `venue` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `booth_number` (text)
      - `booth_size` (text)
      - `booth_cost` (numeric)
      - `our_booth_details` (text)
      - `show_website` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `trade_show_meetings`
      - `id` (uuid, primary key)
      - `trade_show_id` (uuid, foreign key)
      - `customer_id` (uuid, foreign key, nullable)
      - `contact_name` (text)
      - `company_name` (text)
      - `meeting_date` (date)
      - `meeting_time` (time)
      - `location` (text) - Booth, Their Booth, Restaurant, etc.
      - `interest_level` (text) - Cold, Warm, Hot
      - `products_interested` (text)
      - `follow_up_required` (boolean)
      - `follow_up_date` (date)
      - `notes` (text)
      - `outcome` (text)
      - `created_at` (timestamptz)
  
  ### Flights Module
    - `flights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `traveler_name` (text)
      - `airline` (text)
      - `flight_number` (text)
      - `confirmation_number` (text)
      - `departure_airport` (text)
      - `departure_city` (text)
      - `arrival_airport` (text)
      - `arrival_city` (text)
      - `departure_date` (date)
      - `departure_time` (time)
      - `arrival_date` (date)
      - `arrival_time` (time)
      - `seat_number` (text)
      - `class` (text) - Economy, Business, First
      - `cost` (numeric)
      - `booking_reference` (text)
      - `status` (text) - Booked, Confirmed, Checked-in, Completed, Cancelled
      - `notes` (text)
      - `created_at` (timestamptz)
  
  ### Cars Module
    - `cars`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `rental_company` (text)
      - `confirmation_number` (text)
      - `vehicle_type` (text)
      - `vehicle_make_model` (text)
      - `pickup_location` (text)
      - `pickup_date` (date)
      - `pickup_time` (time)
      - `dropoff_location` (text)
      - `dropoff_date` (date)
      - `dropoff_time` (time)
      - `driver_name` (text)
      - `cost_per_day` (numeric)
      - `total_cost` (numeric)
      - `insurance_included` (boolean)
      - `gps_included` (boolean)
      - `status` (text) - Reserved, Picked-up, Returned, Cancelled
      - `notes` (text)
      - `created_at` (timestamptz)
  
  ### Hotels Module
    - `hotels`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `hotel_name` (text)
      - `confirmation_number` (text)
      - `address` (text)
      - `city` (text)
      - `country` (text)
      - `phone` (text)
      - `email` (text)
      - `check_in_date` (date)
      - `check_in_time` (time)
      - `check_out_date` (date)
      - `check_out_time` (time)
      - `room_type` (text)
      - `room_number` (text)
      - `guest_name` (text)
      - `number_of_guests` (integer)
      - `cost_per_night` (numeric)
      - `total_nights` (integer)
      - `total_cost` (numeric)
      - `breakfast_included` (boolean)
      - `wifi_included` (boolean)
      - `status` (text) - Reserved, Checked-in, Checked-out, Cancelled
      - `notes` (text)
      - `created_at` (timestamptz)
  
  ### Meetings Module
    - `meetings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `customer_id` (uuid, foreign key, nullable)
      - `title` (text)
      - `meeting_type` (text) - In-person, Phone, Video, Trade Show
      - `meeting_date` (date)
      - `meeting_time` (time)
      - `duration_minutes` (integer)
      - `location` (text)
      - `attendees` (text)
      - `agenda` (text)
      - `meeting_notes` (text)
      - `action_items` (text)
      - `follow_up_required` (boolean)
      - `follow_up_date` (date)
      - `status` (text) - Scheduled, Completed, Cancelled, Rescheduled
      - `priority` (text) - Low, Medium, High
      - `created_at` (timestamptz)
  
  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies to read/write based on user_id
*/

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  website text,
  country text,
  city text,
  address text,
  notes text,
  status text DEFAULT 'Lead' CHECK (status IN ('Lead', 'Prospect', 'Active', 'Inactive')),
  priority text DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  estimated_value numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer categories table
CREATE TABLE IF NOT EXISTS customer_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_oem boolean DEFAULT false,
  is_odm boolean DEFAULT false,
  is_importer boolean DEFAULT false,
  is_shop_owner boolean DEFAULT false,
  is_retail_chain boolean DEFAULT false,
  is_manufacturing_outsource boolean DEFAULT false,
  is_distributor boolean DEFAULT false,
  is_wholesaler boolean DEFAULT false,
  category_notes text
);

-- Trade shows table
CREATE TABLE IF NOT EXISTS trade_shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  location text,
  venue text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  booth_number text,
  booth_size text,
  booth_cost numeric DEFAULT 0,
  our_booth_details text,
  show_website text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Trade show meetings table
CREATE TABLE IF NOT EXISTS trade_show_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_show_id uuid REFERENCES trade_shows(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  contact_name text NOT NULL,
  company_name text NOT NULL,
  meeting_date date NOT NULL,
  meeting_time time,
  location text,
  interest_level text DEFAULT 'Warm' CHECK (interest_level IN ('Cold', 'Warm', 'Hot')),
  products_interested text,
  follow_up_required boolean DEFAULT true,
  follow_up_date date,
  notes text,
  outcome text,
  created_at timestamptz DEFAULT now()
);

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  traveler_name text NOT NULL,
  airline text NOT NULL,
  flight_number text,
  confirmation_number text,
  departure_airport text NOT NULL,
  departure_city text,
  arrival_airport text NOT NULL,
  arrival_city text,
  departure_date date NOT NULL,
  departure_time time,
  arrival_date date NOT NULL,
  arrival_time time,
  seat_number text,
  class text DEFAULT 'Economy' CHECK (class IN ('Economy', 'Premium Economy', 'Business', 'First')),
  cost numeric DEFAULT 0,
  booking_reference text,
  status text DEFAULT 'Booked' CHECK (status IN ('Booked', 'Confirmed', 'Checked-in', 'Completed', 'Cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rental_company text NOT NULL,
  confirmation_number text,
  vehicle_type text,
  vehicle_make_model text,
  pickup_location text NOT NULL,
  pickup_date date NOT NULL,
  pickup_time time,
  dropoff_location text NOT NULL,
  dropoff_date date NOT NULL,
  dropoff_time time,
  driver_name text,
  cost_per_day numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  insurance_included boolean DEFAULT false,
  gps_included boolean DEFAULT false,
  status text DEFAULT 'Reserved' CHECK (status IN ('Reserved', 'Picked-up', 'Returned', 'Cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hotel_name text NOT NULL,
  confirmation_number text,
  address text,
  city text NOT NULL,
  country text,
  phone text,
  email text,
  check_in_date date NOT NULL,
  check_in_time time,
  check_out_date date NOT NULL,
  check_out_time time,
  room_type text,
  room_number text,
  guest_name text NOT NULL,
  number_of_guests integer DEFAULT 1,
  cost_per_night numeric DEFAULT 0,
  total_nights integer DEFAULT 1,
  total_cost numeric DEFAULT 0,
  breakfast_included boolean DEFAULT false,
  wifi_included boolean DEFAULT true,
  status text DEFAULT 'Reserved' CHECK (status IN ('Reserved', 'Checked-in', 'Checked-out', 'Cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  title text NOT NULL,
  meeting_type text DEFAULT 'In-person' CHECK (meeting_type IN ('In-person', 'Phone', 'Video', 'Trade Show')),
  meeting_date date NOT NULL,
  meeting_time time NOT NULL,
  duration_minutes integer DEFAULT 60,
  location text,
  attendees text,
  agenda text,
  meeting_notes text,
  action_items text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  status text DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
  priority text DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_show_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for customer_categories
CREATE POLICY "Users can view own customer categories"
  ON customer_categories FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_categories.customer_id
    AND customers.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own customer categories"
  ON customer_categories FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_categories.customer_id
    AND customers.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own customer categories"
  ON customer_categories FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_categories.customer_id
    AND customers.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_categories.customer_id
    AND customers.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own customer categories"
  ON customer_categories FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_categories.customer_id
    AND customers.user_id = auth.uid()
  ));

-- RLS Policies for trade_shows
CREATE POLICY "Users can view own trade shows"
  ON trade_shows FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trade shows"
  ON trade_shows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trade shows"
  ON trade_shows FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trade shows"
  ON trade_shows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for trade_show_meetings
CREATE POLICY "Users can view own trade show meetings"
  ON trade_show_meetings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trade_shows
    WHERE trade_shows.id = trade_show_meetings.trade_show_id
    AND trade_shows.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own trade show meetings"
  ON trade_show_meetings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM trade_shows
    WHERE trade_shows.id = trade_show_meetings.trade_show_id
    AND trade_shows.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own trade show meetings"
  ON trade_show_meetings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trade_shows
    WHERE trade_shows.id = trade_show_meetings.trade_show_id
    AND trade_shows.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM trade_shows
    WHERE trade_shows.id = trade_show_meetings.trade_show_id
    AND trade_shows.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own trade show meetings"
  ON trade_show_meetings FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trade_shows
    WHERE trade_shows.id = trade_show_meetings.trade_show_id
    AND trade_shows.user_id = auth.uid()
  ));

-- RLS Policies for flights
CREATE POLICY "Users can view own flights"
  ON flights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flights"
  ON flights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flights"
  ON flights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flights"
  ON flights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for cars
CREATE POLICY "Users can view own cars"
  ON cars FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cars"
  ON cars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars"
  ON cars FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars"
  ON cars FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for hotels
CREATE POLICY "Users can view own hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hotels"
  ON hotels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hotels"
  ON hotels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hotels"
  ON hotels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for meetings
CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customer_categories_customer_id ON customer_categories(customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_shows_user_id ON trade_shows(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_shows_dates ON trade_shows(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trade_show_meetings_trade_show_id ON trade_show_meetings(trade_show_id);
CREATE INDEX IF NOT EXISTS idx_trade_show_meetings_customer_id ON trade_show_meetings(customer_id);
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_dates ON flights(departure_date);
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_cars_dates ON cars(pickup_date);
CREATE INDEX IF NOT EXISTS idx_hotels_user_id ON hotels(user_id);
CREATE INDEX IF NOT EXISTS idx_hotels_dates ON hotels(check_in_date);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_customer_id ON meetings(customer_id);