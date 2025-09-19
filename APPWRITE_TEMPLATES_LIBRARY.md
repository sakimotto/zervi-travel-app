# 🛠️ Appwrite Templates Library

## 📋 Overview
Ready-to-use templates for common Appwrite operations, extracted from proven implementations. Each template includes error handling, best practices, and real-world usage examples.

## 🏗️ Project Setup Templates

### 1. Complete Environment Configuration
```javascript
// .env.local template
VITE_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
VITE_APPWRITE_DATABASE_ID=your-database-id

// Environment validation template
const validateEnvironment = () => {
  const required = [
    'VITE_APPWRITE_ENDPOINT',
    'VITE_APPWRITE_PROJECT_ID', 
    'APPWRITE_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
};
```

### 2. Client Setup Template
```javascript
// lib/appwrite.js
import { Client, Account, Databases, Storage, Functions } from 'appwrite';

const config = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Helper functions
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return user !== null;
};
```

## 🗄️ Database Schema Templates

### 1. Standard Business Record Template
```javascript
const businessRecordSchema = {
  id: 'business_records',
  name: 'Business Records',
  permissions: [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users())
  ],
  attributes: [
    { key: 'user_id', type: 'string', size: 255, required: true },
    { key: 'document_number', type: 'string', size: 50, required: true },
    { key: 'title', type: 'string', size: 200, required: true },
    { key: 'description', type: 'string', size: 1000, required: false },
    { key: 'status', type: 'string', size: 20, required: true, default: 'draft' },
    { key: 'priority', type: 'string', size: 10, required: true, default: 'medium' },
    { key: 'assigned_to', type: 'string', size: 255, required: false },
    { key: 'due_date', type: 'datetime', required: false },
    { key: 'completed_at', type: 'datetime', required: false },
    { key: 'metadata', type: 'string', size: 2000, required: false }
  ],
  indexes: [
    { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
    { key: 'status_index', type: 'key', attributes: ['status'] },
    { key: 'document_number_index', type: 'key', attributes: ['document_number'] },
    { key: 'due_date_index', type: 'key', attributes: ['due_date'] }
  ]
};
```

### 2. User Profile Extension Template
```javascript
const userProfileSchema = {
  id: 'user_profiles',
  name: 'User Profiles',
  permissions: [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users())
  ],
  attributes: [
    { key: 'user_id', type: 'string', size: 255, required: true },
    { key: 'display_name', type: 'string', size: 100, required: true },
    { key: 'department', type: 'string', size: 50, required: false },
    { key: 'role', type: 'string', size: 50, required: false },
    { key: 'phone', type: 'string', size: 20, required: false },
    { key: 'preferences', type: 'string', size: 1000, required: false },
    { key: 'avatar_url', type: 'string', size: 500, required: false },
    { key: 'timezone', type: 'string', size: 50, required: false },
    { key: 'language', type: 'string', size: 10, required: false, default: 'en' },
    { key: 'is_active', type: 'boolean', required: true, default: true }
  ],
  indexes: [
    { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
    { key: 'department_index', type: 'key', attributes: ['department'] },
    { key: 'role_index', type: 'key', attributes: ['role'] }
  ]
};
```

### 3. Audit Log Template
```javascript
const auditLogSchema = {
  id: 'audit_logs',
  name: 'Audit Logs',
  permissions: [
    Permission.read(Role.users()),
    Permission.create(Role.users())
  ],
  attributes: [
    { key: 'user_id', type: 'string', size: 255, required: true },
    { key: 'action', type: 'string', size: 50, required: true },
    { key: 'resource_type', type: 'string', size: 50, required: true },
    { key: 'resource_id', type: 'string', size: 255, required: true },
    { key: 'old_values', type: 'string', size: 2000, required: false },
    { key: 'new_values', type: 'string', size: 2000, required: false },
    { key: 'ip_address', type: 'string', size: 45, required: false },
    { key: 'user_agent', type: 'string', size: 500, required: false }
  ],
  indexes: [
    { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
    { key: 'action_index', type: 'key', attributes: ['action'] },
    { key: 'resource_index', type: 'key', attributes: ['resource_type', 'resource_id'] },
    { key: 'created_at_index', type: 'key', attributes: ['$createdAt'] }
  ]
};
```

## 🔧 CRUD Operation Templates

### 1. Complete CRUD Service Template
```javascript
// services/crudService.js
import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

export class CRUDService {
  constructor(databaseId, collectionId) {
    this.databaseId = databaseId;
    this.collectionId = collectionId;
  }

  async create(data, userId) {
    try {
      const document = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        {
          ...data,
          user_id: userId
        }
      );
      return { success: true, data: document };
    } catch (error) {
      console.error('Create error:', error);
      return { success: false, error: error.message };
    }
  }

  async getById(documentId) {
    try {
      const document = await databases.getDocument(
        this.databaseId,
        this.collectionId,
        documentId
      );
      return { success: true, data: document };
    } catch (error) {
      console.error('Get error:', error);
      return { success: false, error: error.message };
    }
  }

  async list(userId, filters = [], limit = 25, offset = 0) {
    try {
      const queries = [
        Query.equal('user_id', userId),
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt'),
        ...filters
      ];

      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        queries
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('List error:', error);
      return { success: false, error: error.message };
    }
  }

  async update(documentId, data) {
    try {
      const document = await databases.updateDocument(
        this.databaseId,
        this.collectionId,
        documentId,
        data
      );
      return { success: true, data: document };
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error: error.message };
    }
  }

  async delete(documentId) {
    try {
      await databases.deleteDocument(
        this.databaseId,
        this.collectionId,
        documentId
      );
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  async search(userId, searchTerm, searchFields = ['title', 'description']) {
    try {
      const queries = [
        Query.equal('user_id', userId),
        Query.search('title', searchTerm),
        Query.limit(50)
      ];

      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        queries
      );
      return { success: true, data: response };
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### 2. Batch Operations Template
```javascript
// services/batchService.js
export class BatchService {
  constructor(databaseId, collectionId) {
    this.databaseId = databaseId;
    this.collectionId = collectionId;
  }

  async batchCreate(items, userId, batchSize = 10) {
    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(async (item) => {
        try {
          const document = await databases.createDocument(
            this.databaseId,
            this.collectionId,
            ID.unique(),
            {
              ...item,
              user_id: userId
            }
          );
          return { success: true, data: document };
        } catch (error) {
          return { success: false, error: error.message, item };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push(result);
        }
      });
    }

    return {
      success: errors.length === 0,
      created: results.length,
      errors: errors.length,
      results,
      errorDetails: errors
    };
  }

  async batchUpdate(updates, batchSize = 10) {
    const results = [];
    const errors = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchPromises = batch.map(async ({ id, data }) => {
        try {
          const document = await databases.updateDocument(
            this.databaseId,
            this.collectionId,
            id,
            data
          );
          return { success: true, data: document };
        } catch (error) {
          return { success: false, error: error.message, id };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push(result);
        }
      });
    }

    return {
      success: errors.length === 0,
      updated: results.length,
      errors: errors.length,
      results,
      errorDetails: errors
    };
  }
}
```

## 👥 User Management Templates

### 1. User Administration Service
```javascript
// services/userAdminService.js
import { Client, Users } from 'node-appwrite';

export class UserAdminService {
  constructor(endpoint, projectId, apiKey) {
    this.client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    
    this.users = new Users(this.client);
  }

  async listUsers(limit = 100, offset = 0) {
    try {
      const response = await this.users.list([], limit, offset);
      return {
        success: true,
        users: response.users,
        total: response.total
      };
    } catch (error) {
      console.error('List users error:', error);
      return { success: false, error: error.message };
    }
  }

  async createUser(email, password, name) {
    try {
      const user = await this.users.create(
        ID.unique(),
        email,
        undefined, // phone
        password,
        name
      );
      return { success: true, user };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteUser(userId) {
    try {
      await this.users.delete(userId);
      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: error.message };
    }
  }

  async findUserByEmail(email) {
    try {
      const response = await this.users.list([
        Query.equal('email', email)
      ]);
      
      if (response.users.length > 0) {
        return { success: true, user: response.users[0] };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Find user error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const user = await this.users.updateStatus(userId, status);
      return { success: true, user };
    } catch (error) {
      console.error('Update user status error:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### 2. Authentication Hooks Template
```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { account } from '../lib/appwrite';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      await account.createEmailSession(email, password);
      const user = await account.get();
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      await account.create(ID.unique(), email, password, name);
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
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

## 🚀 Deployment Templates

### 1. Database Setup Script Template
```javascript
#!/usr/bin/env node
// scripts/setup-database.js

import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const config = {
  endpoint: process.env.VITE_APPWRITE_ENDPOINT,
  projectId: process.env.VITE_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.VITE_APPWRITE_DATABASE_ID
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

async function setupDatabase() {
  console.log('🚀 Setting up Appwrite Database...');
  
  try {
    // Create database
    await databases.create(config.databaseId, 'Application Database');
    console.log('✅ Database created');
  } catch (error) {
    if (error.code === 409) {
      console.log('ℹ️ Database already exists');
    } else {
      throw error;
    }
  }

  // Create collections
  const collections = [
    // Add your collection schemas here
  ];

  for (const collection of collections) {
    await createCollection(collection);
  }

  console.log('🎉 Database setup complete!');
}

async function createCollection(schema) {
  try {
    // Create collection
    await databases.createCollection(
      config.databaseId,
      schema.id,
      schema.name,
      schema.permissions
    );
    console.log(`✅ Collection "${schema.name}" created`);

    // Create attributes
    for (const attr of schema.attributes) {
      await createAttribute(schema.id, attr);
    }

    // Create indexes
    for (const index of schema.indexes) {
      await createIndex(schema.id, index);
    }

  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️ Collection "${schema.name}" already exists`);
    } else {
      throw error;
    }
  }
}

async function createAttribute(collectionId, attr) {
  try {
    switch (attr.type) {
      case 'string':
        await databases.createStringAttribute(
          config.databaseId,
          collectionId,
          attr.key,
          attr.size,
          attr.required,
          attr.default
        );
        break;
      case 'integer':
        await databases.createIntegerAttribute(
          config.databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.min,
          attr.max,
          attr.default
        );
        break;
      case 'boolean':
        await databases.createBooleanAttribute(
          config.databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.default
        );
        break;
      case 'datetime':
        await databases.createDatetimeAttribute(
          config.databaseId,
          collectionId,
          attr.key,
          attr.required,
          attr.default
        );
        break;
    }
    console.log(`  ✅ Attribute "${attr.key}" created`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️ Attribute "${attr.key}" already exists`);
    } else {
      console.error(`  ❌ Error creating attribute "${attr.key}":`, error.message);
    }
  }
}

async function createIndex(collectionId, index) {
  try {
    await databases.createIndex(
      config.databaseId,
      collectionId,
      index.key,
      index.type,
      index.attributes
    );
    console.log(`  ✅ Index "${index.key}" created`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`  ℹ️ Index "${index.key}" already exists`);
    } else {
      console.error(`  ❌ Error creating index "${index.key}":`, error.message);
    }
  }
}

setupDatabase().catch(console.error);
```

### 2. Environment Setup Template
```bash
# scripts/setup-env.sh
#!/bin/bash

echo "🔧 Setting up environment..."

# Copy environment template
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ Created .env.local from template"
else
  echo "ℹ️ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
node scripts/setup-database.js

echo "🎉 Setup complete!"
echo "📝 Please update .env.local with your Appwrite credentials"
```

## 📊 Monitoring Templates

### 1. Health Check Template
```javascript
// utils/healthCheck.js
import { databases, account } from '../lib/appwrite';

export const healthCheck = async () => {
  const checks = {
    database: false,
    authentication: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Test database connection
    await databases.list();
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Test authentication service
    await account.get();
    checks.authentication = true;
  } catch (error) {
    // Expected if not authenticated
    checks.authentication = 'not_authenticated';
  }

  return checks;
};
```

### 2. Error Logging Template
```javascript
// utils/errorLogger.js
import { databases } from '../lib/appwrite';
import { ID } from 'appwrite';

export const logError = async (error, context = {}) => {
  try {
    await databases.createDocument(
      'your-database-id',
      'error_logs',
      ID.unique(),
      {
        message: error.message,
        stack: error.stack,
        context: JSON.stringify(context),
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    );
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};
```

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Usage**: Copy and customize templates for your specific use case  
**Support**: Refer to Appwrite Expert Knowledge Base for patterns and best practices