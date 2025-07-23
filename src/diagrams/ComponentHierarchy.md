# Component Hierarchy Diagram

```
App (AuthGuard wrapper)
│
├── Navbar
│   ├── NavLink components
│   └── UserMenu
│       └── AuthModal (conditional)
│
├── Hero
│   ├── Canton Fair Banner
│   └── Main Hero Content
│
├── Dashboard
│   ├── Quick Stats Cards (4)
│   ├── MiniCalendar
│   ├── TodoList
│   │   └── AddTodoModal (conditional)
│   └── AppointmentsList
│       └── AddAppointmentModal (conditional)
│
├── DestinationsSection
│   ├── Search & Filter Controls
│   ├── DestinationCard[] (with edit/delete)
│   └── AddDestinationModal (conditional)
│
├── SuppliersSection
│   ├── Search & Filter Controls
│   ├── Supplier Cards[] (with edit/delete)
│   └── AddSupplierModal (conditional)
│
├── BusinessContactsSection
│   ├── Search & Filter Controls
│   ├── Contact Cards[] (with edit/delete)
│   └── AddBusinessContactModal (conditional)
│
├── ItinerarySection
│   ├── View Controls (Full/Summary toggle)
│   ├── Filter Controls
│   ├── ItineraryItem[] / ItinerarySummary
│   ├── PrintButton
│   └── AddItineraryItem Modal (conditional)
│
├── ExpensesSection
│   ├── Summary Cards (3)
│   ├── Filter Controls
│   ├── Expenses Table
│   └── AddExpenseModal (conditional)
│
├── TravelTipsSection
│   └── TravelTip Cards[]
│
├── PhrasesSection
│   ├── Category Tabs
│   └── Phrase Table
│
├── AboutSection
│
└── Footer
```

## Component Analysis

### ✅ **Strengths:**
- Clean hierarchical structure
- Proper separation of concerns
- Consistent modal patterns
- Reusable components

### ⚠️ **Potential Issues:**
- Some components are large (>300 lines)
- Modal state management could be centralized
- Some prop drilling for shared data