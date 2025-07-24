# API Documentation

**Version:** 2.0.0  
**Last Updated:** January 2025  
**API Type:** Supabase REST API + Real-time Subscriptions  
**Base URL:** `https://[project-id].supabase.co/rest/v1/`  
**Authentication:** Bearer Token (JWT)  
**Database:** PostgreSQL with Row Level Security (RLS)  

---

## 🔗 API Overview

### Authentication
```typescript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Authentication headers
const headers = {
  'Authorization': `Bearer ${session?.access_token}`,
  'apikey': process.env.VITE_SUPABASE_ANON_KEY,
  'Content-Type': 'application/json'
};
```

### Base Configuration
```typescript
// API configuration
const API_CONFIG = {
  baseURL: 'https://[project-id].supabase.co/rest/v1/',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
};
```

---

## 🗄️ Database Schema

### Tables Overview
```sql
-- Core application tables
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  country TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  service_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  position TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  destination_id UUID REFERENCES destinations(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  activity_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  category TEXT,
  expense_date DATE NOT NULL,
  payment_method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  attendees TEXT[],
  appointment_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- User data isolation policies
CREATE POLICY "Users can only access their own data" 
ON destinations FOR ALL 
USING (auth.uid() = user_id);

-- Apply similar policies to all tables
```

---

## 📍 Destinations API

### Data Model
```typescript
interface Destination {
  id: string;
  user_id: string;
  name: string;
  country?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Endpoints

#### GET /destinations
```typescript
// Fetch all destinations
const { data, error } = await supabase
  .from('destinations')
  .select('*')
  .order('created_at', { ascending: false });
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "user-uuid",
      "name": "Paris",
      "country": "France",
      "description": "City of Light",
      "image_url": "https://example.com/paris.jpg",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "error": null
}
```

#### GET /destinations/:id
```typescript
// Fetch single destination
const { data, error } = await supabase
  .from('destinations')
  .select('*')
  .eq('id', destinationId)
  .single();
```

#### POST /destinations
```typescript
// Create new destination
const { data, error } = await supabase
  .from('destinations')
  .insert({
    name: 'Tokyo',
    country: 'Japan',
    description: 'Modern metropolis',
    user_id: user.id
  })
  .select()
  .single();
```

**Request Body:**
```json
{
  "name": "Tokyo",
  "country": "Japan",
  "description": "Modern metropolis",
  "image_url": "https://example.com/tokyo.jpg"
}
```

#### PUT /destinations/:id
```typescript
// Update destination
const { data, error } = await supabase
  .from('destinations')
  .update({
    name: 'Updated Name',
    description: 'Updated description'
  })
  .eq('id', destinationId)
  .select()
  .single();
```

#### DELETE /destinations/:id
```typescript
// Delete destination
const { error } = await supabase
  .from('destinations')
  .delete()
  .eq('id', destinationId);
```

---

## 🏢 Suppliers API

### Data Model
```typescript
interface Supplier {
  id: string;
  user_id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  service_type?: string;
  created_at: string;
  updated_at: string;
}
```

### Endpoints

#### GET /suppliers
```typescript
// Fetch all suppliers with filtering
const { data, error } = await supabase
  .from('suppliers')
  .select('*')
  .ilike('company_name', `%${searchTerm}%`)
  .order('company_name');
```

#### POST /suppliers
```typescript
// Create new supplier
const { data, error } = await supabase
  .from('suppliers')
  .insert({
    company_name: 'Travel Agency Inc',
    contact_person: 'John Doe',
    email: 'john@travelagency.com',
    phone: '+1-555-0123',
    service_type: 'Travel Agency',
    user_id: user.id
  })
  .select()
  .single();
```

**Request Body:**
```json
{
  "company_name": "Travel Agency Inc",
  "contact_person": "John Doe",
  "email": "john@travelagency.com",
  "phone": "+1-555-0123",
  "address": "123 Main St, City, State",
  "service_type": "Travel Agency"
}
```

---

## 👥 Business Contacts API

### Data Model
```typescript
interface BusinessContact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  company?: string;
  email?: string;
  phone?: string;
  position?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Endpoints

#### GET /business_contacts
```typescript
// Fetch contacts with search
const { data, error } = await supabase
  .from('business_contacts')
  .select('*')
  .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%`)
  .order('last_name');
```

#### POST /business_contacts
```typescript
// Create new contact
const { data, error } = await supabase
  .from('business_contacts')
  .insert({
    first_name: 'Jane',
    last_name: 'Smith',
    company: 'Tech Corp',
    email: 'jane.smith@techcorp.com',
    position: 'Manager',
    user_id: user.id
  })
  .select()
  .single();
```

---

## 🗓️ Itinerary Items API

### Data Model
```typescript
interface ItineraryItem {
  id: string;
  user_id: string;
  destination_id?: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  activity_type?: string;
  created_at: string;
  updated_at: string;
}
```

### Endpoints

#### GET /itinerary_items
```typescript
// Fetch itinerary with destination info
const { data, error } = await supabase
  .from('itinerary_items')
  .select(`
    *,
    destinations (
      id,
      name,
      country
    )
  `)
  .order('start_date', { ascending: true });
```

#### POST /itinerary_items
```typescript
// Create new itinerary item
const { data, error } = await supabase
  .from('itinerary_items')
  .insert({
    title: 'Visit Eiffel Tower',
    description: 'Iconic landmark visit',
    start_date: '2025-06-15',
    start_time: '10:00',
    location: 'Champ de Mars, Paris',
    activity_type: 'Sightseeing',
    destination_id: destinationId,
    user_id: user.id
  })
  .select()
  .single();
```

---

## 💰 Expenses API

### Data Model
```typescript
interface Expense {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  description: string;
  category?: string;
  expense_date: string;
  payment_method?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Endpoints

#### GET /expenses
```typescript
// Fetch expenses with filtering and aggregation
const { data, error } = await supabase
  .from('expenses')
  .select('*')
  .gte('expense_date', startDate)
  .lte('expense_date', endDate)
  .order('expense_date', { ascending: false });

// Get expense summary
const { data: summary } = await supabase
  .from('expenses')
  .select('category, amount.sum()')
  .gte('expense_date', startDate)
  .lte('expense_date', endDate);
```

#### POST /expenses
```typescript
// Create new expense
const { data, error } = await supabase
  .from('expenses')
  .insert({
    amount: 25.50,
    currency: 'USD',
    description: 'Coffee and pastry',
    category: 'Food',
    expense_date: '2025-01-15',
    payment_method: 'Credit Card',
    user_id: user.id
  })
  .select()
  .single();
```

---

## ✅ Todos API

### Data Model
```typescript
interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}
```

### Endpoints

#### GET /todos
```typescript
// Fetch todos with filtering
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('completed', false)
  .order('due_date', { ascending: true, nullsLast: true });
```

#### PATCH /todos/:id
```typescript
// Toggle todo completion
const { data, error } = await supabase
  .from('todos')
  .update({ completed: !currentStatus })
  .eq('id', todoId)
  .select()
  .single();
```

---

## 📅 Appointments API

### Data Model
```typescript
interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  attendees?: string[];
  appointment_type?: string;
  created_at: string;
  updated_at: string;
}
```

### Endpoints

#### GET /appointments
```typescript
// Fetch appointments for date range
const { data, error } = await supabase
  .from('appointments')
  .select('*')
  .gte('start_time', startDate)
  .lte('start_time', endDate)
  .order('start_time');
```

#### POST /appointments
```typescript
// Create new appointment
const { data, error } = await supabase
  .from('appointments')
  .insert({
    title: 'Client Meeting',
    description: 'Discuss project requirements',
    start_time: '2025-01-20T14:00:00Z',
    end_time: '2025-01-20T15:00:00Z',
    location: 'Conference Room A',
    attendees: ['john@example.com', 'jane@example.com'],
    appointment_type: 'Business',
    user_id: user.id
  })
  .select()
  .single();
```

---

## 🔄 Real-time Subscriptions

### Setting Up Subscriptions
```typescript
// Subscribe to table changes
const subscription = supabase
  .channel('table_changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'expenses',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('Change received!', payload);
      // Update local state
      handleRealTimeUpdate(payload);
    }
  )
  .subscribe();

// Cleanup subscription
const cleanup = () => {
  subscription.unsubscribe();
};
```

### Real-time Event Types
```typescript
interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Record<string, any>; // New row data
  old?: Record<string, any>; // Old row data (UPDATE/DELETE)
  schema: string;
  table: string;
  commit_timestamp: string;
}
```

---

## 🔐 Authentication API

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
```

### Password Reset
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: 'https://yourapp.com/reset-password'
  }
);
```

---

## 📊 Analytics & Aggregations

### Expense Analytics
```typescript
// Monthly expense summary
const { data: monthlyExpenses } = await supabase
  .from('expenses')
  .select('expense_date, amount, category')
  .gte('expense_date', startOfMonth)
  .lte('expense_date', endOfMonth);

// Category breakdown
const { data: categoryBreakdown } = await supabase
  .rpc('get_expense_by_category', {
    start_date: startDate,
    end_date: endDate,
    user_uuid: user.id
  });
```

### Custom RPC Functions
```sql
-- Create custom function for complex queries
CREATE OR REPLACE FUNCTION get_expense_by_category(
  start_date DATE,
  end_date DATE,
  user_uuid UUID
)
RETURNS TABLE (
  category TEXT,
  total_amount DECIMAL,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.category,
    SUM(e.amount) as total_amount,
    COUNT(*) as transaction_count
  FROM expenses e
  WHERE e.user_id = user_uuid
    AND e.expense_date >= start_date
    AND e.expense_date <= end_date
  GROUP BY e.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚨 Error Handling

### Common Error Responses
```typescript
// Error structure
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Error handling pattern
const handleApiError = (error: SupabaseError) => {
  switch (error.code) {
    case 'PGRST116':
      return 'No data found';
    case '23505':
      return 'Duplicate entry';
    case '23503':
      return 'Referenced record not found';
    case '42501':
      return 'Insufficient permissions';
    default:
      return error.message || 'An unexpected error occurred';
  }
};
```

### Retry Logic
```typescript
const apiWithRetry = async <T>(
  operation: () => Promise<{ data: T; error: any }>,
  maxRetries = 3
): Promise<{ data: T; error: any }> => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      if (!result.error) return result;
      lastError = result.error;
    } catch (error) {
      lastError = error;
    }
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return { data: null as any, error: lastError };
};
```

---

## 🔧 Custom Hooks

### Data Fetching Hooks
```typescript
// Generic data fetching hook
const useSupabaseQuery = <T>(
  table: string,
  query?: (builder: any) => any
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let builder = supabase.from(table).select('*');
      
      if (query) {
        builder = query(builder);
      }
      
      const { data: result, error: err } = await builder;
      
      if (err) {
        setError(err.message);
      } else {
        setData(result || []);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [table]);
  
  return { data, loading, error };
};

// Usage example
const { data: expenses, loading, error } = useSupabaseQuery<Expense>(
  'expenses',
  (builder) => builder.order('expense_date', { ascending: false })
);
```

### Mutation Hooks
```typescript
// Generic mutation hook
const useSupabaseMutation = <T>(table: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const create = async (data: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    const { data: result, error: err } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    setLoading(false);
    
    if (err) {
      setError(err.message);
      return { data: null, error: err };
    }
    
    return { data: result, error: null };
  };
  
  const update = async (id: string, data: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    const { data: result, error: err } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    setLoading(false);
    
    if (err) {
      setError(err.message);
      return { data: null, error: err };
    }
    
    return { data: result, error: null };
  };
  
  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    
    const { error: err } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    setLoading(false);
    
    if (err) {
      setError(err.message);
      return { error: err };
    }
    
    return { error: null };
  };
  
  return { create, update, remove, loading, error };
};
```

---

## 📝 API Testing

### Test Data Setup
```sql
-- Insert test data
INSERT INTO destinations (user_id, name, country, description) VALUES
('user-uuid', 'Paris', 'France', 'City of Light'),
('user-uuid', 'Tokyo', 'Japan', 'Modern metropolis'),
('user-uuid', 'New York', 'USA', 'The Big Apple');

INSERT INTO expenses (user_id, amount, description, category, expense_date) VALUES
('user-uuid', 25.50, 'Coffee', 'Food', '2025-01-15'),
('user-uuid', 120.00, 'Hotel', 'Accommodation', '2025-01-15'),
('user-uuid', 45.75, 'Taxi', 'Transportation', '2025-01-15');
```

### API Testing Examples
```typescript
// Test API endpoints
const testAPI = async () => {
  // Test authentication
  const { data: user } = await supabase.auth.getUser();
  console.log('Current user:', user);
  
  // Test data fetching
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*');
  console.log('Destinations:', destinations);
  
  // Test data creation
  const { data: newExpense } = await supabase
    .from('expenses')
    .insert({
      amount: 15.99,
      description: 'Test expense',
      category: 'Test',
      expense_date: new Date().toISOString().split('T')[0],
      user_id: user?.user?.id
    })
    .select()
    .single();
  console.log('New expense:', newExpense);
};
```

---

## 🔍 API Monitoring

### Performance Monitoring
```typescript
// API performance tracking
const trackAPIPerformance = (operation: string, startTime: number) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`API ${operation} took ${duration.toFixed(2)}ms`);
  
  // Send to analytics service
  if (duration > 1000) {
    console.warn(`Slow API call detected: ${operation}`);
  }
};

// Usage
const fetchExpenses = async () => {
  const startTime = performance.now();
  const { data, error } = await supabase.from('expenses').select('*');
  trackAPIPerformance('fetch_expenses', startTime);
  return { data, error };
};
```

### Error Tracking
```typescript
// API error tracking
const trackAPIError = (operation: string, error: any) => {
  console.error(`API Error in ${operation}:`, error);
  
  // Send to error tracking service
  // Sentry.captureException(error, { tags: { operation } });
};
```

For API questions or integration assistance, refer to the [Supabase Documentation](https://supabase.com/docs) or contact the development team.