# Backend Data Persistence Validation

## 🗄️ **Supabase Backend Verification**

### **Database Tables Status**
```sql
-- Check all tables exist and have data
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public';
```

### **Data Integrity Checks**

#### **1. Destinations Table**
```sql
SELECT COUNT(*) as total_destinations FROM destinations;
SELECT * FROM destinations ORDER BY created_at DESC LIMIT 5;
```

#### **2. Suppliers Table**  
```sql
SELECT COUNT(*) as total_suppliers FROM suppliers;
SELECT company_name, status, created_at FROM suppliers ORDER BY created_at DESC LIMIT 5;
```

#### **3. Business Contacts Table**
```sql
SELECT COUNT(*) as total_contacts FROM business_contacts;
SELECT name, company, relationship FROM business_contacts ORDER BY created_at DESC LIMIT 5;
```

#### **4. Itinerary Items Table**
```sql
SELECT COUNT(*) as total_itinerary FROM itinerary_items;
SELECT title, type, start_date, confirmed FROM itinerary_items ORDER BY start_date DESC LIMIT 5;
```

#### **5. Expenses Table**
```sql
SELECT COUNT(*) as total_expenses FROM expenses;
SELECT description, amount, currency, approved FROM expenses ORDER BY date DESC LIMIT 5;
```

#### **6. Todos Table**
```sql
SELECT COUNT(*) as total_todos FROM todos;
SELECT title, priority, completed, due_date FROM todos ORDER BY created_at DESC LIMIT 5;
```

#### **7. Appointments Table**
```sql
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT title, start_date, start_time, status FROM appointments ORDER BY start_date DESC LIMIT 5;
```

---

## 🔍 **Real-time Sync Validation**

### **Test Procedure:**
1. **Open Supabase Dashboard** → Go to Table Editor
2. **Open App in Browser** → Navigate to relevant section
3. **Add Item in App** → Should appear in Supabase immediately
4. **Edit in Supabase** → Should update in app (may need refresh)
5. **Delete in App** → Should remove from Supabase

### **Expected Results:**
- ✅ **Create**: New records appear in Supabase within 1-2 seconds
- ✅ **Update**: Changes reflect in database immediately  
- ✅ **Delete**: Records removed from Supabase instantly
- ✅ **Read**: App loads current database state on refresh

---

## 🚨 **Common Backend Issues**

### **Issue: "Failed to create/update"**
**Check:**
- [ ] Supabase connection active
- [ ] RLS policies allow operations
- [ ] Field names match database schema
- [ ] Required fields are provided

### **Issue: Data not persisting**
**Check:**
- [ ] Using Supabase hooks (not localStorage)
- [ ] Proper error handling in place
- [ ] Network connectivity stable
- [ ] Database permissions correct

### **Issue: "Cannot read properties of undefined"**
**Check:**
- [ ] Default empty arrays for data
- [ ] Loading states handled properly
- [ ] Props passed correctly between components
- [ ] Supabase hooks returning expected data structure

---

## ✅ **Backend Health Checklist**

### **Connection Status**
- [ ] Supabase URL configured correctly
- [ ] API keys are valid and active
- [ ] Database is accessible
- [ ] No rate limiting issues

### **Data Operations**
- [ ] INSERT operations work across all tables
- [ ] UPDATE operations persist changes
- [ ] DELETE operations remove records
- [ ] SELECT operations return current data

### **Security & Permissions**
- [ ] RLS enabled on all tables
- [ ] Policies allow authenticated operations
- [ ] Anonymous access properly blocked
- [ ] User data isolation working

### **Performance**
- [ ] Query response times under 500ms
- [ ] No connection timeouts
- [ ] Efficient data loading
- [ ] Proper indexing on frequently queried fields

---

## 🎯 **Backend Validation Commands**

### **Quick Database Check:**
```bash
# Check if all tables have recent activity
curl -X GET 'https://anymkdmgqkrilzatmnmc.supabase.co/rest/v1/destinations?select=count' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### **Test Data Creation:**
```javascript
// Test in browser console
const { supabase } = await import('./src/lib/supabase.js');

// Test insert
const { data, error } = await supabase
  .from('destinations')
  .insert({ name: 'Test City', description: 'Test', region: 'Test', image: 'https://example.com/test.jpg' });

console.log('Insert result:', { data, error });
```

---

## 🏆 **Success Metrics**

**Backend is Ready when:**
- [ ] All 7 tables are operational
- [ ] CRUD operations work without errors
- [ ] Data persists across browser sessions
- [ ] Multi-user access works correctly
- [ ] Real-time synchronization functions
- [ ] No data loss occurs during operations

**Performance Benchmarks:**
- [ ] Page load times < 3 seconds
- [ ] Data operations complete < 1 second
- [ ] No memory leaks detected
- [ ] Smooth user interactions maintained