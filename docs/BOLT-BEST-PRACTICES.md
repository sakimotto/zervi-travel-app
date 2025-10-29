# Bolt.new Development Best Practices

**Document Version:** 1.0.0
**Last Updated:** October 29, 2025
**Status:** Production Standard
**Applies To:** All Bolt.new projects using React + TypeScript + Supabase

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Database Standards](#2-database-standards-supabase)
3. [TypeScript Guidelines](#3-typescript-guidelines)
4. [React Component Standards](#4-react-component-standards)
5. [State Management](#5-state-management)
6. [API and Data Fetching](#6-api-and-data-fetching)
7. [Security Best Practices](#7-security-best-practices)
8. [Performance Optimization](#8-performance-optimization)
9. [Testing Standards](#9-testing-standards)
10. [Documentation Requirements](#10-documentation-requirements)
11. [Git Workflow](#11-git-workflow)
12. [Deployment Guidelines](#12-deployment-guidelines)

---

## 1. Project Setup

### 1.1 Package.json Standards

**ALWAYS include proper metadata:**

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Clear, concise project description",
  "author": "Your Name or Organization",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo"
  },
  "keywords": ["relevant", "searchable", "keywords"],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "preview": "vite preview"
  }
}
```

**Required Scripts:**
- ✅ `dev` - Development server
- ✅ `build` - Production build
- ✅ `lint` - Code linting
- ✅ `type-check` - TypeScript validation
- ✅ `test` - Unit tests
- ✅ `preview` - Preview build

---

### 1.2 Environment Configuration

**Create separate environment files:**

```bash
.env.development    # Development settings
.env.production     # Production settings
.env.example        # Template (committed to git)
.env.local          # Local overrides (gitignored)
```

**Standard .env.example:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Application
VITE_APP_NAME=Your App Name
VITE_APP_ENV=development

# Optional: Analytics
VITE_ANALYTICS_ID=
```

**Rules:**
- ✅ Prefix all variables with `VITE_` for Vite projects
- ✅ Never commit `.env` files (except `.env.example`)
- ✅ Document all variables in `.env.example`
- ❌ Never hardcode sensitive data

---

### 1.3 Project Structure

**Standard Folder Structure:**

```
project/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/      # Generic components (Button, Input)
│   │   ├── features/    # Feature-specific components
│   │   └── layout/      # Layout components (Navbar, Footer)
│   ├── pages/           # Route-level components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Third-party library configs
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types/interfaces
│   ├── services/        # API services
│   ├── contexts/        # React contexts
│   ├── constants/       # App constants
│   └── assets/          # Static assets
├── public/              # Public static files
├── docs/                # Documentation
├── supabase/
│   ├── migrations/      # Database migrations
│   └── functions/       # Edge functions
├── tests/               # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── [config files]
```

---

## 2. Database Standards (Supabase)

### 2.1 Database Selection

**ALWAYS use Supabase for Bolt.new projects unless explicitly specified otherwise.**

**Why Supabase:**
- ✅ Built-in authentication
- ✅ Row Level Security (RLS)
- ✅ Real-time subscriptions
- ✅ PostgreSQL with full SQL support
- ✅ Bolt.new provides managed instances

**Setup:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### 2.2 Migration Standards

**File Naming Convention:**
```
YYYYMMDDHHMMSS_descriptive_action.sql

✅ Good Examples:
20251029120000_create_users_table.sql
20251029120100_add_email_index_to_users.sql
20251029120200_enable_rls_on_posts.sql

❌ Bad Examples:
migration_1.sql
sparkling_dew.sql
temp_fix.sql
```

**Migration Template:**
```sql
/*
  # [Migration Title]

  ## Description
  Brief explanation of what this migration does

  ## Changes
  1. New Tables
     - `table_name` - Description
       - `column1` (type) - Description
       - `column2` (type) - Description

  2. Modified Tables
     - Added `column_name` to `table_name`

  3. Security
     - Enable RLS on `table_name`
     - Add SELECT policy for authenticated users
     - Add INSERT policy with validation

  ## Rollback
  -- Optional rollback instructions
*/

-- Create table
CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_table_name_user_id
  ON table_name(user_id);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own records"
  ON table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON table_name FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
  ON table_name FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

**Migration Rules:**
- ✅ ALWAYS use `IF NOT EXISTS` / `IF EXISTS`
- ✅ ALWAYS enable RLS on user data tables
- ✅ ALWAYS create separate policies for SELECT, INSERT, UPDATE, DELETE
- ✅ ALWAYS add indexes on foreign keys and frequently queried columns
- ✅ ALWAYS use `auth.uid()` for user identification
- ❌ NEVER use `USING (true)` in RLS policies
- ❌ NEVER create policies with `FOR ALL`
- ❌ NEVER skip RLS on tables with user data

---

### 2.3 Schema Design Principles

**Naming Conventions:**
- Tables: `snake_case` plural (e.g., `user_profiles`, `blog_posts`)
- Columns: `snake_case` (e.g., `first_name`, `created_at`)
- Indexes: `idx_table_column` (e.g., `idx_users_email`)
- Foreign Keys: `fk_table_column` (e.g., `fk_posts_user_id`)

**Standard Columns:**
```sql
-- Every table should have:
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at timestamptz DEFAULT now() NOT NULL
updated_at timestamptz DEFAULT now() NOT NULL

-- Tables with user data should have:
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
```

**Foreign Key Rules:**
- Use `ON DELETE CASCADE` for mandatory relationships
- Use `ON DELETE SET NULL` to preserve history
- Always create indexes on foreign key columns

---

## 3. TypeScript Guidelines

### 3.1 Strict Mode Configuration

**tsconfig.json must include:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

---

### 3.2 Type Definition Standards

**Create proper interfaces instead of 'any':**

```typescript
// ❌ BAD
const processData = (data: any) => {
  return data.map((item: any) => item.value);
};

// ✅ GOOD
interface DataItem {
  id: string;
  value: number;
  label: string;
}

const processData = (data: DataItem[]): number[] => {
  return data.map(item => item.value);
};
```

**Database Type Generation:**
```typescript
// Generate types from Supabase
// Run: npx supabase gen types typescript --local > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      users: {
        Row: { /* */ };
        Insert: { /* */ };
        Update: { /* */ };
      };
    };
  };
};
```

**Type Organization:**
```typescript
// src/types/index.ts - Central type exports
export type { Database } from './database';
export type { User, UserProfile } from './user';
export type { Post, Comment } from './content';
```

---

### 3.3 Type Safety Rules

**Rules:**
- ✅ ALWAYS define return types for functions
- ✅ ALWAYS use interfaces for objects
- ✅ ALWAYS use enums for fixed sets of values
- ✅ ALWAYS use `unknown` instead of `any` when type is truly unknown
- ❌ NEVER use `any` without a comment explaining why
- ❌ NEVER use `@ts-ignore` without documenting reason
- ❌ NEVER use type assertions (`as`) unless absolutely necessary

**Handling Unknown Types:**
```typescript
// ❌ BAD
const processUnknown = (data: any) => {
  return data.value;
};

// ✅ GOOD
const processUnknown = (data: unknown): string => {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String(data.value);
  }
  throw new Error('Invalid data format');
};
```

---

## 4. React Component Standards

### 4.1 Component Structure

**Functional Component Template:**
```typescript
import { useState, useEffect } from 'react';
import type { FC } from 'react';

interface ComponentProps {
  title: string;
  onSubmit: (value: string) => void;
  isActive?: boolean; // Optional props marked with ?
}

export const Component: FC<ComponentProps> = ({
  title,
  onSubmit,
  isActive = false // Default values
}) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    // Effect logic
  }, []);

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <div className="container">
      <h2>{title}</h2>
      {/* Component JSX */}
    </div>
  );
};
```

**File Naming:**
- Component files: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hook files: `camelCase.ts` (e.g., `useAuth.ts`)
- Utility files: `camelCase.ts` (e.g., `formatDate.ts`)

---

### 4.2 Component Organization

**Single Responsibility:**
```typescript
// ❌ BAD - Too many responsibilities
const UserDashboard = () => {
  // User profile logic
  // Analytics logic
  // Settings logic
  // Notifications logic
  return (/* 500 lines of JSX */);
};

// ✅ GOOD - Separated concerns
const UserDashboard = () => {
  return (
    <div>
      <UserProfile />
      <UserAnalytics />
      <UserSettings />
      <UserNotifications />
    </div>
  );
};
```

**Component Size Guidelines:**
- Keep components under 200 lines
- Extract reusable logic into hooks
- Break down complex components into smaller ones
- Use composition over complexity

---

### 4.3 Props Best Practices

**Props Interface:**
```typescript
// ✅ GOOD - Clear, typed props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

// ❌ BAD - Unclear props
interface ButtonProps {
  type?: string;
  config?: any;
  handler?: Function;
}
```

**Props Destructuring:**
```typescript
// ✅ GOOD - Clear defaults
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children
}) => {
  // Component logic
};

// ❌ BAD - No defaults
export const Button: FC<ButtonProps> = (props) => {
  const variant = props.variant || 'primary';
  // ...
};
```

---

## 5. State Management

### 5.1 Local State (useState)

**Use for:**
- Component-specific state
- Form inputs
- UI toggles
- Temporary data

```typescript
const [isOpen, setIsOpen] = useState<boolean>(false);
const [email, setEmail] = useState<string>('');
const [count, setCount] = useState<number>(0);
```

---

### 5.2 Context API (Global State)

**Use for:**
- Authentication state
- Theme preferences
- User preferences
- Shared UI state

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    // Sign in logic
  };

  const signOut = async () => {
    // Sign out logic
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### 5.3 Server State (Supabase)

**Use for:**
- Database queries
- Real-time subscriptions
- API data

```typescript
// src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
```

---

## 6. API and Data Fetching

### 6.1 Supabase Query Patterns

**Basic CRUD:**
```typescript
// CREATE
const { data, error } = await supabase
  .from('posts')
  .insert({ title, content, user_id })
  .select()
  .single();

// READ
const { data, error } = await supabase
  .from('posts')
  .select('*, author:users(name, avatar)')
  .eq('published', true)
  .order('created_at', { ascending: false });

// UPDATE
const { data, error } = await supabase
  .from('posts')
  .update({ title, content })
  .eq('id', postId)
  .select()
  .single();

// DELETE
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

**Error Handling:**
```typescript
try {
  const { data, error } = await supabase
    .from('posts')
    .select('*');

  if (error) throw error;

  return { success: true, data };
} catch (error) {
  console.error('Database error:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

---

### 6.2 Real-time Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('posts-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // or 'INSERT', 'UPDATE', 'DELETE'
        schema: 'public',
        table: 'posts'
      },
      (payload) => {
        console.log('Change received!', payload);
        // Update local state
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 7. Security Best Practices

### 7.1 Authentication

**Always use Supabase Auth:**
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, role: 'user' }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Sign out
const { error } = await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state
});
```

---

### 7.2 Row Level Security

**Always enable RLS:**
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**Policy Examples:**
```sql
-- Users can only see their own data
CREATE POLICY "Users view own data"
  ON table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public read, authenticated write
CREATE POLICY "Public can view"
  ON table_name FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Authenticated can insert"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

---

### 7.3 Security Checklist

**Code Security:**
- ✅ Never expose service role key in frontend
- ✅ Always validate user input
- ✅ Use parameterized queries (Supabase handles this)
- ✅ Sanitize user-generated content
- ❌ Never trust client-side validation alone
- ❌ Never store sensitive data in localStorage
- ❌ Never log sensitive information

**Environment Variables:**
- ✅ Use `.env.example` as template
- ✅ Never commit `.env` files
- ✅ Use different keys for dev/prod
- ❌ Never hardcode API keys
- ❌ Never expose secrets in client code

---

## 8. Performance Optimization

### 8.1 Code Splitting

```typescript
// Lazy load route components
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
```

---

### 8.2 Memoization

```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.value - b.value);
}, [items]);

// Memoize callback functions
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

---

### 8.3 Query Optimization

```typescript
// ❌ BAD - Fetches all columns
const { data } = await supabase.from('users').select('*');

// ✅ GOOD - Only fetch needed columns
const { data } = await supabase
  .from('users')
  .select('id, name, email');

// ✅ GOOD - Use pagination
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(0, 9); // Get first 10 items
```

---

## 9. Testing Standards

### 9.1 Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  beforeEach(() => {
    // Setup
  });

  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

---

### 9.2 Coverage Requirements

**Minimum Coverage:**
- Unit Tests: 80% coverage
- Critical paths: 100% coverage
- Utilities: 90% coverage
- Components: 70% coverage

**What to Test:**
- ✅ User interactions
- ✅ Edge cases
- ✅ Error states
- ✅ Loading states
- ✅ Success states
- ✅ Form validation
- ✅ API integration

---

## 10. Documentation Requirements

### 10.1 Code Documentation

**Component Documentation:**
```typescript
/**
 * Button component for user interactions
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Submit
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, onClick, children }) => {
  // ...
};
```

**Function Documentation:**
```typescript
/**
 * Formats a date string to a readable format
 *
 * @param date - ISO date string or Date object
 * @param format - Desired output format (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 *
 * @example
 * formatDate('2025-10-29') // Returns "Oct 29, 2025"
 */
export const formatDate = (date: string | Date, format = 'MMM dd, yyyy'): string => {
  // ...
};
```

---

### 10.2 Project Documentation

**Required Files:**
- `README.md` - Project overview and setup
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history
- `docs/API.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/ARCHITECTURE.md` - System architecture

---

## 11. Git Workflow

### 11.1 Branch Strategy

```
main (production)
  └── develop (staging)
      ├── feature/user-auth
      ├── feature/dashboard
      ├── fix/login-bug
      └── hotfix/critical-fix
```

**Branch Naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

---

### 11.2 Commit Message Format

```
type(scope): short description

Longer description if needed

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Testing
- `chore`: Maintenance

**Examples:**
```
feat(auth): add password reset functionality
fix(dashboard): resolve chart rendering issue
docs(api): update endpoint documentation
```

---

## 12. Deployment Guidelines

### 12.1 Pre-deployment Checklist

- ✅ All tests pass
- ✅ Build succeeds without errors
- ✅ No console errors
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Security audit passed
- ✅ Performance optimized
- ✅ Documentation updated

---

### 12.2 Deployment Process

```bash
# 1. Run all checks
npm run type-check
npm run lint
npm test
npm run build

# 2. Test build locally
npm run preview

# 3. Deploy to staging
# (Platform-specific commands)

# 4. Run smoke tests

# 5. Deploy to production
```

---

## Conclusion

These best practices ensure:
- ✅ Consistent code quality
- ✅ Maintainable codebase
- ✅ Secure applications
- ✅ Optimal performance
- ✅ Comprehensive testing
- ✅ Clear documentation

**Review this document quarterly and update as needed.**

---

**Document Owner:** Development Team
**Last Review:** October 29, 2025
**Next Review:** January 29, 2026
