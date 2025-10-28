/*
  # Create Unified Entities Table

  ## Purpose
  Consolidate customers, suppliers, and business_contacts into a single unified
  entities table where one entity can have multiple roles (customer AND supplier).

  ## Changes
  1. Create new `entities` table with all fields from all three tables
  2. Add role flags: is_customer, is_supplier, is_contact, is_partner
  3. Migrate data from existing tables
  4. Create views for backward compatibility
  5. Update RLS policies

  ## Migration Strategy
  - Keep old tables temporarily
  - Create views as aliases
  - New features use entities table
  - Gradual transition period

  ## Benefits
  - No duplicate data
  - One entity can be customer + supplier simultaneously
  - Unified contact management
  - Better reporting capabilities
*/

-- Create unified entities table
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Core Identity
  company_name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  website text,
  logo_url text,

  -- Location
  address text,
  city text,
  state_province text,
  country text,
  postal_code text,

  -- Social/Communication
  wechat text,
  linkedin text,
  whatsapp text,
  skype text,

  -- Role Flags
  is_customer boolean DEFAULT false,
  is_supplier boolean DEFAULT false,
  is_contact boolean DEFAULT false,
  is_partner boolean DEFAULT false,
  is_competitor boolean DEFAULT false,
  is_other boolean DEFAULT false,

  -- Customer-Specific Fields
  customer_status text CHECK (customer_status IN ('Lead', 'Prospect', 'Active', 'Inactive') OR customer_status IS NULL),
  customer_priority text CHECK (customer_priority IN ('Low', 'Medium', 'High', 'Critical') OR customer_priority IS NULL),
  estimated_value numeric DEFAULT 0,
  lead_source text,

  -- Customer Categories
  is_oem boolean DEFAULT false,
  is_odm boolean DEFAULT false,
  is_importer boolean DEFAULT false,
  is_shop_owner boolean DEFAULT false,
  is_retail_chain boolean DEFAULT false,
  is_manufacturing_outsource boolean DEFAULT false,
  is_distributor boolean DEFAULT false,
  is_wholesaler boolean DEFAULT false,

  -- Supplier-Specific Fields
  products text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  minimum_order text,
  payment_terms text,
  lead_time text,
  supplier_rating numeric,
  supplier_status text CHECK (supplier_status IN ('Active', 'Potential', 'Inactive') OR supplier_status IS NULL),

  -- Business Details
  industry text,
  year_established text,
  employee_count text,
  annual_revenue numeric,
  business_type text,

  -- Relationship Management
  relationship_type text,
  importance text CHECK (importance IN ('High', 'Medium', 'Low') OR importance IS NULL),
  last_contact_date date,
  next_followup_date date,
  assigned_to text,
  tags text[] DEFAULT '{}',

  -- Additional Fields
  notes text,
  category_notes text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own entities"
  ON entities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entities"
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_company_name ON entities(company_name);
CREATE INDEX IF NOT EXISTS idx_entities_is_customer ON entities(is_customer) WHERE is_customer = true;
CREATE INDEX IF NOT EXISTS idx_entities_is_supplier ON entities(is_supplier) WHERE is_supplier = true;
CREATE INDEX IF NOT EXISTS idx_entities_is_contact ON entities(is_contact) WHERE is_contact = true;
CREATE INDEX IF NOT EXISTS idx_entities_customer_status ON entities(customer_status);
CREATE INDEX IF NOT EXISTS idx_entities_supplier_status ON entities(supplier_status);
CREATE INDEX IF NOT EXISTS idx_entities_email ON entities(email);
CREATE INDEX IF NOT EXISTS idx_entities_industry ON entities(industry);
CREATE INDEX IF NOT EXISTS idx_entities_tags ON entities USING GIN(tags);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_entities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entities_updated_at ON entities;
CREATE TRIGGER entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW
  EXECUTE FUNCTION update_entities_updated_at();

-- Migrate data from customers table
INSERT INTO entities (
  user_id,
  company_name,
  contact_person,
  email,
  phone,
  website,
  address,
  city,
  country,
  notes,
  is_customer,
  customer_status,
  customer_priority,
  estimated_value,
  created_at,
  updated_at
)
SELECT
  user_id,
  company_name,
  contact_person,
  email,
  phone,
  website,
  address,
  city,
  country,
  notes,
  true as is_customer,
  status as customer_status,
  priority as customer_priority,
  estimated_value,
  created_at,
  updated_at
FROM customers
ON CONFLICT DO NOTHING;

-- Update customer categories
UPDATE entities e
SET
  is_oem = cc.is_oem,
  is_odm = cc.is_odm,
  is_importer = cc.is_importer,
  is_shop_owner = cc.is_shop_owner,
  is_retail_chain = cc.is_retail_chain,
  is_manufacturing_outsource = cc.is_manufacturing_outsource,
  is_distributor = cc.is_distributor,
  is_wholesaler = cc.is_wholesaler,
  category_notes = cc.category_notes
FROM customer_categories cc
JOIN customers c ON c.id = cc.customer_id
WHERE e.company_name = c.company_name
  AND e.user_id = c.user_id
  AND e.is_customer = true;

-- Migrate data from suppliers table
INSERT INTO entities (
  user_id,
  company_name,
  contact_person,
  email,
  phone,
  address,
  city,
  state_province,
  website,
  industry,
  products,
  certifications,
  minimum_order,
  payment_terms,
  lead_time,
  notes,
  year_established,
  employee_count,
  supplier_rating,
  supplier_status,
  last_contact_date,
  is_supplier,
  created_at,
  updated_at
)
SELECT
  user_id,
  company_name,
  contact_person,
  email,
  phone,
  address,
  city,
  province as state_province,
  website,
  industry,
  products,
  certifications,
  minimum_order,
  payment_terms,
  lead_time,
  notes,
  established as year_established,
  employees as employee_count,
  rating as supplier_rating,
  status as supplier_status,
  last_contact as last_contact_date,
  true as is_supplier,
  created_at,
  updated_at
FROM suppliers
ON CONFLICT DO NOTHING;

-- For entities that exist in BOTH customers and suppliers, update to have both roles
UPDATE entities e
SET
  is_supplier = true,
  products = s.products,
  certifications = s.certifications,
  minimum_order = s.minimum_order,
  payment_terms = s.payment_terms,
  lead_time = s.lead_time,
  supplier_rating = s.rating,
  supplier_status = s.status,
  year_established = COALESCE(e.year_established, s.established),
  employee_count = COALESCE(e.employee_count, s.employees)
FROM suppliers s
WHERE e.company_name ILIKE s.company_name
  AND e.user_id = s.user_id
  AND e.is_customer = true;

-- Migrate data from business_contacts table
INSERT INTO entities (
  user_id,
  company_name,
  contact_person,
  email,
  phone,
  wechat,
  linkedin,
  address,
  city,
  industry,
  notes,
  relationship_type,
  importance,
  last_contact_date,
  is_contact,
  created_at,
  updated_at
)
SELECT
  user_id,
  company as company_name,
  name as contact_person,
  email,
  phone,
  wechat,
  linkedin,
  address,
  city,
  industry,
  notes,
  relationship as relationship_type,
  importance,
  last_contact as last_contact_date,
  true as is_contact,
  created_at,
  updated_at
FROM business_contacts
ON CONFLICT DO NOTHING;

-- Create views for backward compatibility (temporary)
CREATE OR REPLACE VIEW customers_view AS
SELECT
  id,
  user_id,
  company_name,
  contact_person,
  email,
  phone,
  website,
  country,
  city,
  address,
  notes,
  customer_status as status,
  customer_priority as priority,
  estimated_value,
  created_at,
  updated_at
FROM entities
WHERE is_customer = true;

CREATE OR REPLACE VIEW suppliers_view AS
SELECT
  id,
  user_id,
  company_name,
  contact_person,
  email,
  phone,
  address,
  city,
  state_province as province,
  industry,
  products,
  certifications,
  minimum_order,
  payment_terms,
  lead_time,
  notes,
  website,
  year_established as established,
  employee_count as employees,
  supplier_rating as rating,
  last_contact_date as last_contact,
  supplier_status as status,
  created_at,
  updated_at
FROM entities
WHERE is_supplier = true;

CREATE OR REPLACE VIEW business_contacts_view AS
SELECT
  id,
  user_id,
  contact_person as name,
  company_name as company,
  email,
  phone,
  wechat,
  linkedin,
  address,
  city,
  industry,
  notes,
  relationship_type as relationship,
  importance,
  last_contact_date as last_contact,
  created_at,
  updated_at
FROM entities
WHERE is_contact = true;

-- Add helpful comments
COMMENT ON TABLE entities IS 'Unified table for all business relationships - customers, suppliers, contacts, partners';
COMMENT ON COLUMN entities.is_customer IS 'True if this entity is a customer';
COMMENT ON COLUMN entities.is_supplier IS 'True if this entity is a supplier';
COMMENT ON COLUMN entities.is_contact IS 'True if this is an individual contact';
COMMENT ON COLUMN entities.is_manufacturing_outsource IS 'Customer wants to outsource manufacturing to our Thai facility';
