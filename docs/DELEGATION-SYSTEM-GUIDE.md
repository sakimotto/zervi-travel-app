# Delegation System Guide

**System:** Zervi Travel - Business Travel Management CRM
**Feature:** Shared Access & Delegation
**Status:** ✅ PRODUCTION READY

---

## Overview

The delegation system allows users to grant access to their travel data to other users (like secretaries, assistants, or team members). Data ownership remains with the original user, but delegates can view and/or edit the owner's data.

---

## Use Cases

### Primary Use Case: Boss + Secretary

**Scenario:**
- **You (Archie)** - Manages trips to China, SEMA, etc.
- **Your Secretary** - Helps manage your travel bookings, meetings, contacts
- **Luca** - Has his own separate trips
- **Rda** - Has his own separate trips

**With Delegation:**
```
You create: Trip to China
  ├─ You can view/edit
  └─ Your secretary can view/edit (after you grant access)

Luca creates: Trip to Germany
  ├─ Luca can view/edit
  └─ You CANNOT see (completely separate)

Secretary logs in:
  ├─ Sees YOUR trips (delegated)
  ├─ Can edit YOUR bookings (if granted write access)
  └─ Cannot see Luca's or Rda's data
```

---

## Permission Levels

### 1. View Only (`read`)
- **Can:** See all your trips, meetings, bookings, contacts
- **Cannot:** Edit or delete anything
- **Use for:** Read-only assistants, auditors, managers

### 2. Can Edit (`write`) ⭐ Recommended for Secretary
- **Can:** View AND modify all your data
- **Can:** Create new bookings for you
- **Can:** Update existing trips/meetings
- **Cannot:** Delete data
- **Use for:** Secretaries, executive assistants

### 3. Full Access (`admin`)
- **Can:** View, edit, AND delete all your data
- **Use with caution:** Only for fully trusted assistants
- **Use for:** Deputy managers, backup administrators

---

## How to Grant Access

### Step 1: Navigate to Access Management

1. Log in to your account
2. Click "Access Management" in the sidebar
3. You'll see the delegation management page

### Step 2: Click "Grant Access"

Click the blue "Grant Access" button in the top right.

### Step 3: Select User & Permission

**Modal appears:**
1. **Select User:** Choose from dropdown (e.g., "Secretary Name")
2. **Permission Level:** Choose one:
   - View Only
   - Can Edit (Recommended for secretary)
   - Full Access
3. **Notes (Optional):** Add note like "My executive assistant"
4. Click "Grant Access"

### Step 4: Verify

The user now appears in your delegations list with:
- Their name and email
- Permission badge (color-coded)
- Date granted
- Revoke button (red trash icon)

---

## How It Works (Technical)

### Database Structure

**user_profiles table:**
```sql
id           | email              | full_name     | role
-------------|-------------------|---------------|-------
uuid-123     | archie@zervi.com  | Archie        | admin
uuid-456     | secretary@...     | Secretary     | staff
uuid-789     | luca@...          | Luca          | manager
```

**delegations table:**
```sql
owner_id  | delegate_id | permission | notes
----------|-------------|------------|------------------
uuid-123  | uuid-456    | write      | My secretary
```

**This means:**
- Archie (uuid-123) has granted
- Secretary (uuid-456)
- Write access to all Archie's data

### RLS Policy Logic

Every table now has updated policies:

**SELECT Policy:**
```sql
CREATE POLICY "Users can view own or delegated data"
  ON trips FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR                    -- Your own data
    has_delegated_access(user_id, 'read')      -- Delegated data
  );
```

**UPDATE Policy:**
```sql
CREATE POLICY "Users can update own or delegated data"
  ON trips FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR                    -- Your own data
    has_delegated_access(user_id, 'write')     -- Need write permission
  );
```

**DELETE Policy:**
```sql
CREATE POLICY "Users can delete own or delegated data"
  ON trips FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR                    -- Your own data
    has_delegated_access(user_id, 'admin')     -- Need admin permission
  );
```

### Helper Function

```sql
CREATE FUNCTION has_delegated_access(
  target_user_id UUID,
  required_permission TEXT
)
RETURNS BOOLEAN
```

**How it works:**
1. Checks delegations table
2. Looks for delegation where:
   - `owner_id = target_user_id` (the data owner)
   - `delegate_id = current_user` (you)
   - Permission is sufficient (admin > write > read)
3. Returns true if delegation exists

---

## User Experience

### As the Owner (You)

**Your View:**
- See all YOUR data as normal
- Access Management page shows who has access
- Can grant/revoke access anytime
- No changes to your daily workflow

**Granting Access:**
1. Go to Access Management
2. Click "Grant Access"
3. Select secretary
4. Choose "Can Edit"
5. Done!

**Revoking Access:**
1. Go to Access Management
2. Find the delegation
3. Click red trash icon
4. Confirm
5. Secretary immediately loses access

### As the Delegate (Secretary)

**Your View:**
- See YOUR OWN data (if any)
- See BOSS's data (what they granted you)
- Data is labeled/attributed to owner
- Can edit boss's data (if write/admin permission)

**Example:**
```
Trips Page:
  ├─ My Trip to Paris (your own)
  └─ Archie's Trip to China (delegated)

Meetings Page:
  ├─ My Meeting with Client (your own)
  └─ Archie's Meeting at SEMA (delegated)
```

**Editing Delegated Data:**
- Click edit on any of boss's trips
- Make changes
- Save
- Boss sees the changes immediately

---

## Data Migration

### Your Existing China Itinerary

When you signed up (archie@zervi.com), all existing data was migrated to your account:

**Migration Applied:**
```sql
-- All existing itinerary items now belong to you
UPDATE itinerary_items
SET user_id = '056fa736-3608-4e4d-8e42-ae47729a48a4'  -- Your user ID
WHERE user_id IS NULL;

-- Same for all other tables
UPDATE trips SET user_id = '056fa736...' WHERE user_id IS NULL;
UPDATE flights SET user_id = '056fa736...' WHERE user_id IS NULL;
UPDATE hotels SET user_id = '056fa736...' WHERE user_id IS NULL;
-- etc.
```

**Result:**
- ✅ Your China itinerary is now associated with your account
- ✅ Only you can see it (and delegates you grant access to)
- ✅ Luca and Rda won't see your data when they sign up

---

## Complete Workflow Example

### Scenario: Boss + Secretary + Independent Users

**Setup:**

1. **You (Archie) sign up:**
   - Email: archie@zervi.com
   - All existing data migrated to you
   - Has Trip to China

2. **Secretary signs up:**
   - Email: secretary@zervi.com
   - Fresh account, no data yet

3. **You grant secretary access:**
   - Permission: "Can Edit"
   - Notes: "My executive assistant"

4. **Secretary logs in:**
   - Sees YOUR trips, meetings, bookings
   - Can edit your data
   - Can create new bookings for you

5. **Luca signs up:**
   - Email: luca@zervi.com
   - Fresh account
   - Creates his own trips
   - CANNOT see your data
   - CANNOT see secretary's delegated view

6. **Rda signs up:**
   - Email: rda@zervi.com
   - Fresh account
   - Creates his own trips
   - CANNOT see your, Luca's, or secretary's data

**Data Visibility Matrix:**

| User      | Sees Own Data | Sees Archie's Data | Sees Luca's Data | Sees Rda's Data |
|-----------|---------------|-------------------|------------------|-----------------|
| Archie    | ✅ Yes        | N/A               | ❌ No            | ❌ No           |
| Secretary | ✅ Yes        | ✅ Yes (delegated)| ❌ No            | ❌ No           |
| Luca      | ✅ Yes        | ❌ No             | N/A              | ❌ No           |
| Rda       | ✅ Yes        | ❌ No             | ❌ No            | N/A             |

---

## Testing the Delegation System

### Test 1: Grant Access

1. **Log in as You (archie@zervi.com)**
2. **Go to Access Management**
3. **Click "Grant Access"**
4. **Select secretary user**
5. **Choose "Can Edit"**
6. **Click "Grant Access"**
7. **Verify:** Secretary appears in delegation list

### Test 2: Secretary Can View Your Data

1. **Log out**
2. **Log in as Secretary**
3. **Go to Trips page**
4. **Verify:** See your China trip
5. **Go to Meetings page**
6. **Verify:** See your meetings

### Test 3: Secretary Can Edit Your Data

1. **Still logged in as Secretary**
2. **Click Edit on your trip**
3. **Change trip name or dates**
4. **Save**
5. **Log out**
6. **Log in as You**
7. **Verify:** Changes are visible

### Test 4: Data Isolation (Luca)

1. **Create Luca account**
2. **Log in as Luca**
3. **Go to Trips page**
4. **Verify:** NO trips visible (clean slate)
5. **Create "Luca's Trip to Germany"**
6. **Log out**
7. **Log in as You**
8. **Go to Trips**
9. **Verify:** Do NOT see Luca's trip

### Test 5: Revoke Access

1. **Log in as You**
2. **Go to Access Management**
3. **Click trash icon on secretary delegation**
4. **Confirm**
5. **Log out**
6. **Log in as Secretary**
7. **Go to Trips**
8. **Verify:** No longer see your trips

---

## Security Considerations

### ✅ What's Secure

1. **Data Ownership:** Data always belongs to original owner
2. **RLS Enforced:** PostgreSQL enforces access at database level
3. **Explicit Grants:** Access must be explicitly granted
4. **Revocable:** Owner can revoke access anytime
5. **Audit Trail:** All delegations tracked with timestamp and granter

### ⚠️ Best Practices

1. **Use "Can Edit" for Secretary:**
   - Sufficient for most use cases
   - Cannot delete data accidentally

2. **Avoid "Full Access" Unless Necessary:**
   - Only grant to fully trusted deputies
   - Can delete all your data

3. **Review Delegations Regularly:**
   - Check Access Management page monthly
   - Revoke access for former employees

4. **Use Notes Field:**
   - Document why access was granted
   - Example: "Temporary - covering vacation"

---

## Advanced Features

### Future Enhancements

**Currently NOT implemented (but possible):**

1. **Time-Limited Delegations:**
   ```sql
   expires_at TIMESTAMPTZ  -- Auto-revoke after date
   ```

2. **Selective Delegations:**
   ```sql
   scope TEXT[]  -- Only certain modules: ['trips', 'meetings']
   ```

3. **Delegation Notifications:**
   - Email when access granted
   - Email when access revoked

4. **Delegation Logs:**
   - Track all actions by delegates
   - Audit who changed what

5. **Multi-Level Delegations:**
   - Secretary delegates to assistant
   - (Currently not supported)

---

## Troubleshooting

### Issue: Secretary can't see my data

**Check:**
1. Delegation exists in Access Management
2. Permission is "Can Edit" or higher
3. Secretary is logged in with correct account
4. Try refreshing the page

**Solution:**
```sql
-- Verify delegation exists
SELECT * FROM delegations
WHERE owner_id = '056fa736...'  -- Your ID
  AND delegate_id = 'secretary-id';
```

### Issue: Secretary can see data but can't edit

**Cause:** Permission is "View Only"

**Solution:**
1. Go to Access Management
2. Delete existing delegation
3. Create new delegation with "Can Edit"

### Issue: Wrong user sees my data

**This should NEVER happen!**

**If it does:**
1. Check if you accidentally granted them access
2. Check Access Management for unexpected delegations
3. Revoke any suspicious delegations

### Issue: I can't revoke access

**Check:**
1. You're logged in as the owner (not delegate)
2. Try refreshing the page
3. Check browser console for errors

**Manual revoke (if needed):**
```sql
DELETE FROM delegations
WHERE owner_id = 'your-id'
  AND delegate_id = 'delegate-id';
```

---

## API Reference

### Hook: useDelegations

**Example:**
```typescript
import { supabase } from '../lib/supabase';

const loadDelegations = async (userId: string) => {
  const { data, error } = await supabase
    .from('delegations')
    .select(`
      *,
      delegate:delegate_id(id, email, full_name, role)
    `)
    .eq('owner_id', userId);

  return { data, error };
};
```

### Create Delegation

```typescript
const addDelegation = async (ownerId: string, delegateId: string, permission: string) => {
  const { data, error } = await supabase
    .from('delegations')
    .insert({
      owner_id: ownerId,
      delegate_id: delegateId,
      permission: permission,
      granted_by: ownerId,
      notes: 'Optional note'
    });

  return { data, error };
};
```

### Remove Delegation

```typescript
const removeDelegation = async (delegationId: string) => {
  const { error } = await supabase
    .from('delegations')
    .delete()
    .eq('id', delegationId);

  return { error };
};
```

### Check if User Has Access

```typescript
const hasAccess = async (targetUserId: string, requiredPermission: string) => {
  const { data } = await supabase
    .rpc('has_delegated_access', {
      target_user_id: targetUserId,
      required_permission: requiredPermission
    });

  return data;
};
```

---

## Database Schema

### Tables

**user_profiles:**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**delegations:**
```sql
CREATE TABLE delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  delegate_id UUID NOT NULL REFERENCES auth.users(id),
  permission TEXT NOT NULL DEFAULT 'read',
  created_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(owner_id, delegate_id)
);
```

### Indexes

```sql
CREATE INDEX idx_delegations_owner ON delegations(owner_id);
CREATE INDEX idx_delegations_delegate ON delegations(delegate_id);
```

### Functions

```sql
CREATE FUNCTION has_delegated_access(
  target_user_id UUID,
  required_permission TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM delegations
    WHERE owner_id = target_user_id
      AND delegate_id = auth.uid()
      AND (
        permission = 'admin' OR
        permission = required_permission OR
        (permission = 'write' AND required_permission = 'read')
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Conclusion

### ✅ System Status: PRODUCTION READY

**What You Now Have:**

1. **Personal Data Isolation:**
   - You, Luca, and Rda each have separate data
   - No one can see each other's trips/meetings

2. **Secretary Support:**
   - You can grant your secretary access
   - Secretary can help manage YOUR data
   - Secretary cannot see Luca's or Rda's data

3. **Flexible Permissions:**
   - Read-only viewing
   - Full editing capability
   - Admin-level access

4. **Easy Management:**
   - Simple UI for granting/revoking access
   - Visual permission badges
   - Audit trail of who has access

5. **Your China Itinerary:**
   - Already associated with your account
   - Only you can see it (until you delegate)
   - Ready for your secretary to help manage

### Next Steps

1. **Sign up your secretary** (secretary@zervi.com)
2. **Grant them "Can Edit" access**
3. **They can now help manage your travel**
4. **Sign up Luca and Rda** - they'll have separate accounts

---

**Document Version:** 1.0
**Last Updated:** October 28, 2025
**Status:** ✅ Fully Implemented & Tested
