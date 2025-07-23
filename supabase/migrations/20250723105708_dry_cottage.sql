/*
  # Add nickname and supplier linking to business contacts

  1. Schema Changes
    - Add `nickname` field to business_contacts table
    - Add `linked_supplier_id` field to business_contacts table
    - Add foreign key constraint to link contacts with suppliers

  2. Security
    - Maintain existing RLS policies
    - Add index for supplier lookups
*/

-- Add nickname field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'nickname'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN nickname text DEFAULT '';
  END IF;
END $$;

-- Add supplier linking field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'linked_supplier_id'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN linked_supplier_id uuid;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'business_contacts_linked_supplier_id_fkey'
  ) THEN
    ALTER TABLE business_contacts 
    ADD CONSTRAINT business_contacts_linked_supplier_id_fkey 
    FOREIGN KEY (linked_supplier_id) REFERENCES suppliers(id);
  END IF;
END $$;

-- Add index for supplier lookups
CREATE INDEX IF NOT EXISTS idx_business_contacts_linked_supplier 
ON business_contacts(linked_supplier_id);