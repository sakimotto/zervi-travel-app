/*
  # Create Business Travel Schema

  1. New Tables
    - `destinations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image` (text)
      - `region` (text)
      - `activities` (text array)
      - `best_time_to_visit` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `suppliers`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `contact_person` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `province` (text)
      - `industry` (text)
      - `products` (text array)
      - `certifications` (text array)
      - `minimum_order` (text)
      - `payment_terms` (text)
      - `lead_time` (text)
      - `notes` (text)
      - `website` (text)
      - `established` (text)
      - `employees` (text)
      - `rating` (numeric)
      - `last_contact` (date)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `business_contacts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `title` (text)
      - `company` (text)
      - `email` (text)
      - `phone` (text)
      - `wechat` (text)
      - `linkedin` (text)
      - `address` (text)
      - `city` (text)
      - `industry` (text)
      - `notes` (text)
      - `last_contact` (date)
      - `relationship` (text)
      - `importance` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `itinerary_items`
      - `id` (uuid, primary key)
      - `type` (text)
      - `title` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `location` (text)
      - `assigned_to` (text)
      - `confirmed` (boolean)
      - `notes` (text)
      - Additional type-specific fields as jsonb
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `date` (date)
      - `category` (text)
      - `description` (text)
      - `amount` (numeric)
      - `currency` (text)
      - `payment_method` (text)
      - `receipt` (text)
      - `business_purpose` (text)
      - `assigned_to` (text)
      - `reimbursable` (boolean)
      - `approved` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `todos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `completed` (boolean)
      - `priority` (text)
      - `due_date` (date)
      - `category` (text)
      - `assigned_to` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `location` (text)
      - `attendees` (text array)
      - `type` (text)
      - `status` (text)
      - `reminder` (integer)
      - `notes` (text)
      - `supplier_id` (uuid, foreign key)
      - `contact_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  region text NOT NULL,
  activities text[] DEFAULT '{}',
  best_time_to_visit text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text DEFAULT '',
  city text NOT NULL,
  province text NOT NULL,
  industry text NOT NULL,
  products text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  minimum_order text DEFAULT '',
  payment_terms text DEFAULT '',
  lead_time text DEFAULT '',
  notes text DEFAULT '',
  website text DEFAULT '',
  established text DEFAULT '',
  employees text DEFAULT '',
  rating numeric DEFAULT 0,
  last_contact date,
  status text DEFAULT 'Potential',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_contacts table
CREATE TABLE IF NOT EXISTS business_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  wechat text DEFAULT '',
  linkedin text DEFAULT '',
  address text DEFAULT '',
  city text NOT NULL,
  industry text DEFAULT '',
  notes text DEFAULT '',
  last_contact date,
  relationship text DEFAULT 'Other',
  importance text DEFAULT 'Medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create itinerary_items table
CREATE TABLE IF NOT EXISTS itinerary_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  location text NOT NULL,
  assigned_to text NOT NULL,
  confirmed boolean DEFAULT false,
  notes text DEFAULT '',
  type_specific_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  payment_method text NOT NULL,
  receipt text DEFAULT '',
  business_purpose text NOT NULL,
  assigned_to text NOT NULL,
  reimbursable boolean DEFAULT true,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  completed boolean DEFAULT false,
  priority text DEFAULT 'Medium',
  due_date date,
  category text DEFAULT 'Business',
  assigned_to text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_date date NOT NULL,
  end_date date,
  start_time time NOT NULL,
  end_time time,
  location text DEFAULT '',
  attendees text[] DEFAULT '{}',
  type text DEFAULT 'Meeting',
  status text DEFAULT 'Scheduled',
  reminder integer DEFAULT 15,
  notes text DEFAULT '',
  supplier_id uuid REFERENCES suppliers(id),
  contact_id uuid REFERENCES business_contacts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these later for user-specific access)
CREATE POLICY "Allow all operations on destinations" ON destinations FOR ALL USING (true);
CREATE POLICY "Allow all operations on suppliers" ON suppliers FOR ALL USING (true);
CREATE POLICY "Allow all operations on business_contacts" ON business_contacts FOR ALL USING (true);
CREATE POLICY "Allow all operations on itinerary_items" ON itinerary_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations on todos" ON todos FOR ALL USING (true);
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_contacts_updated_at BEFORE UPDATE ON business_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itinerary_items_updated_at BEFORE UPDATE ON itinerary_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();