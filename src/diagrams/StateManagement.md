# State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION STATE                        │
├─────────────────────────────────────────────────────────────────┤
│  useAuth Hook (Global)                                         │
│  ├── user: AuthUser | null                                     │
│  ├── session: Session | null                                   │
│  ├── loading: boolean                                          │
│  └── Methods: signIn, signUp, signOut, updateProfile           │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT-LEVEL STATE                       │
├─────────────────────────────────────────────────────────────────┤
│  Each Section Component:                                        │
│  ├── Data Array State (useState)                               │
│  ├── Filter/Search State (useState)                            │
│  ├── Modal State (useState)                                    │
│  ├── Loading State (useState)                                  │
│  └── Error State (useState)                                    │
│                                                                 │
│  Examples:                                                      │
│  ├── DestinationsSection: destinations[], searchTerm, filters  │
│  ├── SuppliersSection: suppliers[], industry, status filters   │
│  ├── ItinerarySection: itinerary[], viewMode, filters          │
│  └── ExpensesSection: expenses[], category, traveler filters   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE HOOKS (Available)                  │
├─────────────────────────────────────────────────────────────────┤
│  useSupabaseTable<T> (Generic Hook)                           │
│  ├── data: T[]                                                 │
│  ├── loading: boolean                                          │
│  ├── error: string | null                                      │
│  └── Methods: insert, update, remove, refetch                  │
│                                                                 │
│  Specific Hooks:                                               │
│  ├── useDestinations()                                         │
│  ├── useSuppliers()                                           │
│  ├── useBusinessContacts()                                    │
│  ├── useItineraryItems()                                      │
│  ├── useExpenses()                                            │
│  ├── useTodos()                                               │
│  └── useAppointments()                                        │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Analysis

### ✅ **Strengths:**
- **Clean Separation**: Auth state separate from data state
- **Component Isolation**: Each section manages its own data
- **Supabase Ready**: Hooks prepared for database integration
- **Type Safety**: Full TypeScript coverage

### ⚠️ **Current Gap:**
- **Not Using Supabase Hooks**: Components still use localStorage pattern
- **Potential Duplication**: localStorage and Supabase state not unified

### 🔄 **Migration Strategy Needed:**
```typescript
// Current: localStorage pattern
const [data, setData] = useState(sampleData);
useEffect(() => saveToLocalStorage(data), [data]);

// Future: Supabase pattern  
const { data, loading, error, insert, update, remove } = useSuppliers();
```