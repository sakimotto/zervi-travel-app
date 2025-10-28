/*
  # Create Unified Entities Table

  ## Purpose
  Consolidate customers, suppliers, and business_contacts into a single unified
  entities table where one entity can have multiple roles (customer AND supplier).

  ## Note
  This version makes user_id optional since authentication may not be set up yet.
  When authentication is added, user_id can be made required.
*/

-- Create unified entities table
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

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

-- Add helpful comments
COMMENT ON TABLE entities IS 'Unified table for all business relationships - customers, suppliers, contacts, partners';
COMMENT ON COLUMN entities.is_customer IS 'True if this entity is a customer';
COMMENT ON COLUMN entities.is_supplier IS 'True if this entity is a supplier';
COMMENT ON COLUMN entities.is_contact IS 'True if this is an individual contact';
COMMENT ON COLUMN entities.is_manufacturing_outsource IS 'Customer wants to outsource manufacturing to our Thai facility';