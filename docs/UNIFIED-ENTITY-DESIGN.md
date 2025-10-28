# Unified Entity Architecture Design

## Problem Statement
Currently, Contacts, Suppliers, and Customers are separate tables with:
- Duplicated fields (name, email, phone, address, etc.)
- No way to mark one entity with multiple roles
- Inconsistent data when same company is both customer AND supplier
- Complex UI with different forms for each type

## Proposed Solution: Unified Entity Table

### Single Source of Truth
One `entities` table that can represent ANY business relationship with role flags.

```sql
entities
  ├── Core Identity
  │   ├── company_name (primary identifier)
  │   ├── contact_person
  │   ├── email
  │   ├── phone
  │   ├── website
  │   └── logo_url
  │
  ├── Location
  │   ├── address
  │   ├── city
  │   ├── state_province
  │   └── country
  │
  ├── Social/Communication
  │   ├── wechat
  │   ├── linkedin
  │   ├── whatsapp
  │   └── skype
  │
  ├── Role Flags (boolean)
  │   ├── is_customer
  │   ├── is_supplier
  │   ├── is_contact (individual)
  │   ├── is_partner
  │   ├── is_competitor
  │   └── is_other
  │
  ├── Customer-Specific Fields (when is_customer=true)
  │   ├── customer_status (Lead|Prospect|Active|Inactive)
  │   ├── customer_priority (Low|Medium|High|Critical)
  │   ├── estimated_value
  │   ├── is_oem, is_odm, is_importer
  │   ├── is_shop_owner, is_retail_chain
  │   ├── is_manufacturing_outsource
  │   ├── is_distributor, is_wholesaler
  │   └── lead_source
  │
  ├── Supplier-Specific Fields (when is_supplier=true)
  │   ├── products (text[])
  │   ├── certifications (text[])
  │   ├── minimum_order
  │   ├── payment_terms
  │   ├── lead_time
  │   ├── supplier_rating
  │   └── supplier_status (Active|Potential|Inactive)
  │
  ├── Business Details
  │   ├── industry
  │   ├── year_established
  │   ├── employee_count
  │   ├── annual_revenue
  │   └── business_type
  │
  ├── Relationship Management
  │   ├── relationship_type
  │   ├── importance (High|Medium|Low)
  │   ├── last_contact_date
  │   ├── next_followup_date
  │   ├── assigned_to (sales rep)
  │   └── tags (text[])
  │
  └── Metadata
      ├── notes
      ├── created_at
      ├── updated_at
      └── user_id
```

## Benefits

### 1. Single Entry, Multiple Roles
```
Example: "Acme Manufacturing Co."
✓ is_customer = true (they buy from us)
✓ is_supplier = true (we buy from them)
✓ is_partner = true (joint ventures)

One record, complete relationship history!
```

### 2. No Duplicate Data
- Update email once, reflected everywhere
- One address for all relationships
- Consistent contact information

### 3. Flexible Categorization
- Add a new role? Just add a boolean flag
- No need to create new tables
- Easy to query "all entities that are customers"

### 4. Better Reporting
```sql
-- Find all customers who are also suppliers
SELECT * FROM entities
WHERE is_customer = true AND is_supplier = true;

-- Find Thai manufacturing outsource customers
SELECT * FROM entities
WHERE is_customer = true
AND is_manufacturing_outsource = true;
```

## UI/UX Design: Right-Hand Drawer

### Instead of Center Modal:
```
[Page Content]                          [Drawer →]
                                       ┌─────────────┐
Customer List                          │ Edit Entity │
                                       ├─────────────┤
┌──────────────┐                       │             │
│ Acme Corp    │  ←click              │ Company:    │
│ Contact: John│                       │ Acme Corp   │
└──────────────┘                       │             │
                                       │ Roles:      │
                                       │ ☑ Customer  │
                                       │ ☑ Supplier  │
                                       │ ☐ Partner   │
                                       │             │
                                       │ [Customer]  │
                                       │ Status: Lead│
                                       │             │
                                       │ [Supplier]  │
                                       │ Products:   │
                                       │ Rating: 4.5 │
                                       │             │
                                       └─────────────┘
```

### Drawer Advantages:
- ✅ Doesn't block the main view
- ✅ Can reference list while editing
- ✅ Smooth slide-in animation
- ✅ Mobile-friendly (full screen on mobile)
- ✅ Can keep drawer open while navigating
- ✅ Better for long forms

## Form Logic: Role-Based Field Display

```javascript
const EntityForm = () => {
  const [roles, setRoles] = useState({
    is_customer: false,
    is_supplier: false,
    is_contact: false
  });

  return (
    <form>
      {/* Always visible: Core fields */}
      <Input name="company_name" required />
      <Input name="email" />
      <Input name="phone" />

      {/* Role Selection */}
      <CheckboxGroup>
        <Checkbox checked={roles.is_customer}
                  onChange={() => toggle('is_customer')}>
          Customer
        </Checkbox>
        <Checkbox checked={roles.is_supplier}>
          Supplier
        </Checkbox>
        <Checkbox checked={roles.is_contact}>
          Individual Contact
        </Checkbox>
      </CheckboxGroup>

      {/* Conditional: Customer fields */}
      {roles.is_customer && (
        <Section title="Customer Details">
          <Select name="customer_status" />
          <Select name="customer_priority" />
          <Input name="estimated_value" type="number" />

          <CheckboxGroup title="Customer Type">
            <Checkbox name="is_oem">OEM</Checkbox>
            <Checkbox name="is_odm">ODM</Checkbox>
            <Checkbox name="is_manufacturing_outsource">
              Thai Mfg Outsource
            </Checkbox>
          </CheckboxGroup>
        </Section>
      )}

      {/* Conditional: Supplier fields */}
      {roles.is_supplier && (
        <Section title="Supplier Details">
          <TagInput name="products" />
          <Input name="minimum_order" />
          <Select name="supplier_rating" />
        </Section>
      )}
    </form>
  );
};
```

## Migration Strategy

### Option A: Consolidate Tables (Breaking Change)
```sql
-- Create new unified table
CREATE TABLE entities (all fields);

-- Migrate data
INSERT INTO entities (company_name, is_customer, ...)
  SELECT company_name, true, ... FROM customers;

INSERT INTO entities (company_name, is_supplier, ...)
  SELECT company_name, true, ... FROM suppliers;

-- Drop old tables
DROP TABLE customers;
DROP TABLE suppliers;
DROP TABLE business_contacts;
```

### Option B: Keep Tables + Create Views (Backward Compatible)
```sql
-- Keep existing tables
-- Create unified view
CREATE VIEW entities AS
  SELECT *, true as is_customer FROM customers
  UNION ALL
  SELECT *, true as is_supplier FROM suppliers
  UNION ALL
  SELECT *, true as is_contact FROM business_contacts;
```

### ✅ Recommended: Option A (Clean Break)
- Simpler long-term maintenance
- Better performance
- Cleaner architecture
- One-time migration pain vs ongoing complexity

## Implementation Plan

### Phase 1: Database
1. Create `entities` table with all fields
2. Migrate data from customers/suppliers/contacts
3. Create views for backward compatibility (temporary)
4. Update RLS policies

### Phase 2: Backend
1. Update hooks to use `entities` table
2. Add helper functions (isCustomer(), isSupplier())
3. Update queries to filter by role flags

### Phase 3: Frontend
1. Create `<EntityDrawer>` component
2. Build unified form with conditional sections
3. Update all pages to use drawer pattern
4. Add role-based filtering in list views

### Phase 4: Cleanup
1. Remove old table references
2. Drop temporary views
3. Update documentation
4. Train users on new unified system

## Example Queries

```sql
-- All customers
SELECT * FROM entities WHERE is_customer = true;

-- All suppliers
SELECT * FROM entities WHERE is_supplier = true;

-- Entities that are BOTH customer and supplier
SELECT * FROM entities
WHERE is_customer = true AND is_supplier = true;

-- High-priority customers who want Thai manufacturing
SELECT * FROM entities
WHERE is_customer = true
  AND customer_priority = 'High'
  AND is_manufacturing_outsource = true;

-- Top-rated suppliers in automotive industry
SELECT * FROM entities
WHERE is_supplier = true
  AND industry = 'Automotive'
  AND supplier_rating >= 4
ORDER BY supplier_rating DESC;
```

## Next Steps

1. ✅ Review and approve design
2. Create migration SQL
3. Build EntityDrawer component
4. Update CustomerPage to use new system
5. Roll out to other pages
6. Delete old code

This unified approach eliminates data silos and provides a flexible foundation for complex business relationships!
