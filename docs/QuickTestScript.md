# Quick Test Script - 5 Minute Validation

## 🚀 **Rapid Testing Protocol**

### **1. Navigation Test (30 seconds)**
```
✅ Click each nav item:
Home → Dashboard → Destinations → Suppliers → Contacts → Itinerary → Calendar → Expenses → About
```

### **2. CRUD Operations Test (2 minutes)**
```
✅ Add New Supplier:
- Click "Add Supplier" 
- Fill: Company="Test Corp", Contact="John Doe", Email="test@test.com"
- Save → Should appear in list immediately

✅ Add New Itinerary Item:
- Click "Add Item"
- Type="Flight", Title="Test Flight", Date=Today, Location="Bangkok"
- Save → Should appear in itinerary

✅ Add New Todo:
- Go to Dashboard
- Click "Add Task" 
- Title="Test Task", Priority="High", Due Date=Today
- Save → Should appear in todo list
```

### **3. Cross-Page Sync Test (1 minute)**
```
✅ Data Synchronization:
- Add item in Itinerary → Go to Dashboard → Should see in "Upcoming Travel"
- Add todo in Dashboard → Go to Calendar → Should see in calendar
- Add appointment → Should appear in Dashboard schedule
```

### **4. Backend Persistence Test (1 minute)**
```
✅ Refresh Test:
- Refresh browser (F5)
- All data should remain
- No "undefined" errors in console

✅ Multi-tab Test:
- Open new tab with same URL
- Should see same data
- Add item in one tab → Should appear in other tab
```

### **5. Mobile Responsive Test (30 seconds)**
```
✅ Mobile View:
- Press F12 → Toggle device toolbar
- Select iPhone/Android view
- Navigation menu should work
- Forms should be usable
```

## 🎯 **Pass/Fail Criteria**

**✅ PASS** - All tests complete without errors
**❌ FAIL** - Any console errors or data loss

**Quick Status Check:**
- [ ] Navigation: ✅ / ❌
- [ ] CRUD Ops: ✅ / ❌  
- [ ] Data Sync: ✅ / ❌
- [ ] Persistence: ✅ / ❌
- [ ] Mobile: ✅ / ❌

**Overall Status: PASS / FAIL**