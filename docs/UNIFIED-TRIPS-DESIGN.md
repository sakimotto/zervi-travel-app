# Unified Trips Architecture Design

## Problem Statement
Currently flights, hotels, and cars are separate disconnected tables. When planning a business trip to SEMA 2025, you need to:
- Add a flight
- Add a hotel
- Add a car rental
- Keep track of which belongs to which trip

But there's NO connection between them!

## Proposed Solution: Unified Trips System

### Core Concept: Trip as Parent Entity

```
Trip (Parent)
  ├── Purpose: "SEMA 2025 Trade Show"
  ├── Dates: Oct 28 - Nov 1, 2025
  ├── Location: Las Vegas, NV
  ├── Status: Planned
  │
  ├── Flights (Children)
  │   ├── BKK → LAX (Oct 28)
  │   └── LAX → BKK (Nov 1)
  │
  ├── Hotels (Children)
  │   └── Caesars Palace (Oct 28 - Nov 1)
  │
  ├── Cars (Children)
  │   └── Enterprise Rental (Oct 28 - Nov 1)
  │
  └── Meetings (Children)
      ├── AutoWorld USA - Oct 29
      ├── TechSupply booth visit - Oct 30
      └── Networking dinner - Oct 31
```

### New Unified Schema

```sql
trips
  ├── id
  ├── user_id
  ├── trip_name (e.g., "SEMA 2025")
  ├── purpose (Business|Leisure|Mixed)
  ├── destination_city
  ├── destination_country
  ├── start_date
  ├── end_date
  ├── status (Planning|Confirmed|In Progress|Completed|Cancelled)
  ├── budget
  ├── actual_cost
  ├── notes
  └── created_at

-- Existing tables gain trip_id foreign key:
flights.trip_id → trips.id
hotels.trip_id → trips.id
cars.trip_id → trips.id
meetings.trip_id → trips.id
```

## Benefits

### Before (Fragmented)
```
❌ 3 separate bookings with no relationship
❌ Can't see total trip cost
❌ Hard to track what's for which trip
❌ No trip-level status
❌ Difficult reporting
```

### After (Unified)
```
✅ One trip with all bookings attached
✅ Auto-calculate total cost
✅ Clear trip organization
✅ Trip-level status tracking
✅ Easy reporting: "SEMA 2025 cost $3,500"
```

## UI/UX Vision

### Trips Page (New)
```
┌─────────────────────────────────────────────┐
│ Trips                           [Add Trip]  │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🎯 SEMA 2025                 Confirmed  │ │
│ │ Las Vegas, NV • Oct 28 - Nov 1, 2025   │ │
│ │                                         │ │
│ │ ✈️  2 Flights    🏨 1 Hotel            │ │
│ │ 🚗 1 Car        📅 3 Meetings          │ │
│ │                                         │ │
│ │ Budget: $4,000  Actual: $3,500 💚      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🏭 Thai Factory Visit        Planning   │ │
│ │ Bangkok, Thailand • Nov 15-17, 2025    │ │
│ │                                         │ │
│ │ ✈️  0 Flights    🏨 0 Hotels           │ │
│ │ 🚗 0 Cars        📅 2 Meetings         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Trip Detail View (Drawer)
```
┌─────────────────────────┐
│ SEMA 2025          [✕]  │
├─────────────────────────┤
│                         │
│ 📍 Las Vegas, NV        │
│ 📅 Oct 28 - Nov 1       │
│ 💼 Business Trip        │
│                         │
│ ─────────────────────   │
│                         │
│ ✈️ Flights (2)          │
│   BKK → LAX Oct 28      │
│   LAX → BKK Nov 1       │
│   [Add Flight]          │
│                         │
│ 🏨 Hotels (1)           │
│   Caesars Palace        │
│   Oct 28-Nov 1, 4 nights│
│   [Add Hotel]           │
│                         │
│ 🚗 Cars (1)             │
│   Enterprise SUV        │
│   Oct 28-Nov 1          │
│   [Add Car]             │
│                         │
│ 📅 Meetings (3)         │
│   AutoWorld - Oct 29    │
│   TechSupply - Oct 30   │
│   Dinner - Oct 31       │
│   [Add Meeting]         │
│                         │
│ ─────────────────────   │
│                         │
│ 💰 Budget: $4,000       │
│ 💵 Actual: $3,500       │
│ 📊 Under budget by $500 │
│                         │
└─────────────────────────┘
```

## Database Changes

### Migration 1: Add trip_id to existing tables
```sql
ALTER TABLE flights ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
ALTER TABLE hotels ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
ALTER TABLE cars ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
ALTER TABLE meetings ADD COLUMN trip_id uuid REFERENCES trips(id) ON DELETE SET NULL;
```

### Migration 2: Create trips table
```sql
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  trip_name text NOT NULL,
  purpose text CHECK (purpose IN ('Business', 'Leisure', 'Mixed')),

  destination_city text,
  destination_country text,

  start_date date NOT NULL,
  end_date date NOT NULL,

  status text DEFAULT 'Planning' CHECK (status IN ('Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),

  budget numeric DEFAULT 0,
  actual_cost numeric DEFAULT 0,

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CHECK (end_date >= start_date)
);
```

## Implementation Plan

### Phase 1: Add Trips Table
1. Create trips table
2. Add trip_id to flights/hotels/cars/meetings
3. Create RLS policies
4. Add indexes

### Phase 2: Build Trips UI
1. Create TripsPage with list view
2. Create TripDetailDrawer showing all components
3. Update individual pages to support trip_id
4. Add "Add to Trip" functionality

### Phase 3: Smart Features
1. Auto-calculate trip costs from all bookings
2. Trip timeline view
3. Export trip itinerary (PDF/Word)
4. Trip status automation
5. Budget alerts

## Example Queries

### Get complete trip with all components
```sql
SELECT
  t.*,
  (SELECT json_agg(f) FROM flights f WHERE f.trip_id = t.id) as flights,
  (SELECT json_agg(h) FROM hotels h WHERE h.trip_id = t.id) as hotels,
  (SELECT json_agg(c) FROM cars c WHERE c.trip_id = t.id) as cars,
  (SELECT json_agg(m) FROM meetings m WHERE m.trip_id = t.id) as meetings,
  (SELECT COALESCE(SUM(cost), 0) FROM flights WHERE trip_id = t.id) +
  (SELECT COALESCE(SUM(total_cost), 0) FROM hotels WHERE trip_id = t.id) +
  (SELECT COALESCE(SUM(total_cost), 0) FROM cars WHERE trip_id = t.id) as total_cost
FROM trips t
WHERE user_id = auth.uid();
```

### Find upcoming trips
```sql
SELECT * FROM trips
WHERE user_id = auth.uid()
  AND status IN ('Confirmed', 'Planning')
  AND start_date >= CURRENT_DATE
ORDER BY start_date;
```

### Get trip budget status
```sql
SELECT
  trip_name,
  budget,
  actual_cost,
  budget - actual_cost as remaining,
  CASE
    WHEN actual_cost > budget THEN 'Over Budget'
    WHEN actual_cost = budget THEN 'On Budget'
    ELSE 'Under Budget'
  END as budget_status
FROM trips
WHERE user_id = auth.uid();
```

## Benefits Summary

1. **Organization**: All trip components in one place
2. **Cost Tracking**: Automatic trip total from all bookings
3. **Status Management**: Track trip progress
4. **Reporting**: Easy to generate trip summaries
5. **Planning**: See what's missing (no hotel booked yet?)
6. **Context**: Know which booking belongs to which trip
7. **Sharing**: Export complete trip itinerary

This unified approach transforms fragmented bookings into cohesive, manageable trips!
