# Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
├─────────────────────────────────────────────────────────────────┤
│  Local Storage          │  Supabase Database  │  Sample Data    │
│  ├── Destinations       │  ├── destinations   │  ├── destinations│
│  ├── Suppliers          │  ├── suppliers      │  ├── suppliers  │
│  ├── Contacts           │  ├── business_contacts│├── contacts   │
│  ├── Itinerary          │  ├── itinerary_items│  ├── itinerary │
│  ├── Expenses           │  ├── expenses       │  ├── expenses  │
│  ├── Todos              │  ├── todos          │  ├── todos     │
│  └── Appointments       │  └── appointments   │  └── appointments│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT STATE                              │
├─────────────────────────────────────────────────────────────────┤
│  Each section component manages its own state:                  │
│  ├── useState for data arrays                                   │
│  ├── useEffect for localStorage sync                            │
│  ├── CRUD operations (add, edit, delete)                       │
│  ├── Filter and search state                                   │
│  └── Modal visibility state                                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE                            │
├─────────────────────────────────────────────────────────────────┤
│  Dual Strategy:                                                 │
│  ├── localStorage (immediate, local)                           │
│  └── Supabase (cloud, collaborative)                          │
│                                                                 │
│  Flow: Component State → localStorage → Supabase               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Analysis

### ✅ **Current Implementation:**
- **Hybrid Storage**: localStorage + Supabase ready
- **Real-time Sync**: Changes persist immediately
- **Fallback Strategy**: Sample data → localStorage → Supabase

### 🔄 **Data Flow Pattern:**
1. **Load**: Sample Data → localStorage → Component State
2. **Update**: User Action → Component State → localStorage
3. **Sync**: localStorage ↔ Supabase (when connected)

### ⚠️ **Potential Issues:**
- **Dual State Management**: localStorage and Supabase not fully integrated
- **Data Conflicts**: Possible sync issues between local and cloud
- **Migration Path**: Need clear strategy for moving from localStorage to Supabase