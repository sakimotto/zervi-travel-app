/*
  # Add website and ecommerce platform fields to business contacts

  1. New Fields
    - `website` (text) - Company website URL
    - `alibaba_store` (text) - Alibaba store URL
    - `shopee_store` (text) - Shopee store URL
    - `amazon_store` (text) - Amazon store URL
    - `other_ecommerce` (text) - Other ecommerce platform URLs

  2. Changes
    - Add website and ecommerce platform fields to business_contacts table
    - All fields are optional with default empty strings
*/

-- Add website and ecommerce platform fields to business_contacts table
DO $$
BEGIN
  -- Add website field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'website'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN website text DEFAULT ''::text;
  END IF;

  -- Add Alibaba store field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'alibaba_store'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN alibaba_store text DEFAULT ''::text;
  END IF;

  -- Add Shopee store field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'shopee_store'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN shopee_store text DEFAULT ''::text;
  END IF;

  -- Add Amazon store field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'amazon_store'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN amazon_store text DEFAULT ''::text;
  END IF;

  -- Add other ecommerce field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_contacts' AND column_name = 'other_ecommerce'
  ) THEN
    ALTER TABLE business_contacts ADD COLUMN other_ecommerce text DEFAULT ''::text;
  END IF;
END $$;