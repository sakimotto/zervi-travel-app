# Zervi Travel Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  React Router Pages                                             │
│  ├── HomePage (Hero + Footer)                                  │
│  ├── DashboardPage (Dashboard + Footer)                        │
│  ├── DestinationsPage (DestinationsSection + Footer)           │
│  ├── SuppliersPage (SuppliersSection + Footer)                 │
│  ├── ContactsPage (BusinessContactsSection + Footer)           │
│  ├── ItineraryPage (ItinerarySection + Footer)                 │
│  ├── CalendarPage (CalendarView + Footer)                      │
│  ├── ExpensesPage (ExpensesSection + Footer)                   │
│  ├── TipsPage (TravelTipsSection + Footer)                     │
│  ├── PhrasesPage (PhrasesSection + Footer)                     │
│  └── AboutPage (AboutSection + Footer)                         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Section Components (Data Management)                          │
│  ├── DestinationsSection ──→ AddDestinationModal               │
│  ├── SuppliersSection ──→ AddSupplierModal                     │
│  ├── BusinessContactsSection ──→ AddBusinessContactModal       │
│  ├── ItinerarySection ──→ AddItineraryItem                     │
│  ├── ExpensesSection ──→ AddExpenseModal                       │
│  ├── Dashboard ──→ TodoList ──→ AddTodoModal                   │
│  └── Dashboard ──→ AppointmentsList ──→ AddAppointmentModal    │
│                                                                 │
│  Shared Components                                              │
│  ├── Navbar (Navigation + UserMenu)                            │
│  ├── AuthGuard (Authentication wrapper)                        │
│  ├── TravelChatbot (AI Assistant)                              │
│  ├── CalendarView (Calendar display)                           │
│  ├── MiniCalendar (Dashboard calendar)                         │
│  ├── PrintButton (Print functionality)                         │
│  └── TravelerSelector (Traveler management)                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Hooks (Primary Data Source)                          │
│  ├── useDestinations() ──→ destinations table                  │
│  ├── useSuppliers() ──→ suppliers table                        │
│  ├── useBusinessContacts() ──→ business_contacts table         │
│  ├── useItineraryItems() ──→ itinerary_items table             │
│  ├── useExpenses() ──→ expenses table                          │
│  ├── useTodos() ──→ todos table                                │
│  └── useAppointments() ──→ appointments table                  │
│                                                                 │
│  Authentication                                                 │
│  └── useAuth() ──→ Supabase Auth                               │
│                                                                 │
│  Sample Data (Fallback)                                        │
│  ├── sampleDestinations                                        │
│  ├── sampleSuppliers                                           │
│  ├── sampleBusinessContacts                                    │
│  ├── sampleItinerary                                           │
│  ├── sampleExpenses                                            │
│  ├── sampleTodos                                               │
│  └── sampleAppointments                                        │
│                                                                 │
│  LocalStorage (Legacy Support)                                 │
│  └── localStorage utilities (backup/import/export)             │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL Database                                  │
│  ├── destinations (6 fields)                                   │
│  ├── suppliers (23 fields) ✅ SCHEMA MATCHES                   │
│  ├── business_contacts (17 fields) ❌ 1 FIELD MISMATCH         │
│  ├── itinerary_items (13 fields) ❌ 3 FIELD MISMATCHES         │
│  ├── expenses (14 fields) ❌ 3 FIELD MISMATCHES                │
│  ├── todos (10 fields) ❌ 2 FIELD MISMATCHES                   │
│  └── appointments (17 fields) ❌ 6 FIELD MISMATCHES            │
│                                                                 │
│  Authentication                                                 │
│  └── Supabase Auth (users, sessions, RLS)                      │
│                                                                 │
│  Edge Functions                                                 │
│  └── travel-chat (AI chatbot endpoint)                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🚨 **CRITICAL ISSUES IDENTIFIED**

### **1. Schema Mismatches (ROOT CAUSE)**
```
❌ 15 total field mismatches across 5 tables
❌ Prevents ALL CRUD operations except Suppliers
❌ Causes "Failed to create" errors across the app
```

### **2. Data Flow Problems**
```
Frontend (camelCase) → Database (snake_case) = FAILURE
Example: assignedTo → assigned_to (mismatch)
```

### **3. Component Dependencies**
```
Every section component depends on working CRUD operations
When database operations fail, entire sections break
```

## 🎯 **BULK FIX REQUIRED**

Instead of fixing errors one by one, we need a comprehensive schema alignment that fixes ALL field mismatches simultaneously across:

- ✅ **Suppliers** (already fixed)
- ❌ **Todos** (2 field mismatches)
- ❌ **Expenses** (3 field mismatches) 
- ❌ **Appointments** (6 field mismatches)
- ❌ **Itinerary** (3 field mismatches)
- ❌ **Contacts** (1 field mismatch)

This will resolve ALL "Failed to create" errors at once! 🚀