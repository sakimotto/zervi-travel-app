# 🚀 Appwrite Expert Worker - Knowledge Base

## 📋 Overview
This knowledge base contains extracted patterns, templates, and workflows from real-world Appwrite implementations. It serves as the institutional memory for the Appwrite Expert Worker, enabling consistent, efficient, and secure backend operations.

## 🏗️ Architecture Patterns

### 1. Configuration Management Pattern
```javascript
// Standard Appwrite Client Setup Pattern
const config = {
  endpoint: process.env.VITE_APPWRITE_ENDPOINT,
  projectId: process.env.VITE_APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: 'your-database-id'
};

// Validation Pattern
if (!config.endpoint || !config.projectId || !config.apiKey) {
  console.error('❌ Missing Appwrite credentials');
  process.exit(1);
}

// Client Initialization Pattern
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);
```

### 2. Service Layer Pattern
```javascript
// Frontend Service Exports
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Helper Functions Pattern
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    return null;
  }
};
```

## 🗄️ Database Schema Patterns

### Collection Design Principles
1. **User-Centric Permissions**: All collections use `Permission.read(Role.users())`
2. **Consistent Indexing**: Always index foreign keys and frequently queried fields
3. **Status Fields**: Include status tracking for workflow management
4. **Audit Fields**: Leverage Appwrite's built-in `$createdAt` and `$updatedAt`

### Standard Collection Template
```javascript
{
  id: 'collection_name',
  name: 'Human Readable Name',
  permissions: [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users())
  ],
  attributes: [
    { key: 'user_id', type: 'string', size: 255, required: true },
    { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
    // ... other attributes
  ],
  indexes: [
    { key: 'user_id_index', type: 'key', attributes: ['user_id'] },
    { key: 'status_index', type: 'key', attributes: ['status'] }
  ]
}
```

## 👥 User Management Patterns

### User Lifecycle Operations
1. **List Users**: Pagination with 100 users per page
2. **Delete Users**: Batch operations with error handling
3. **Find Users**: Email-based lookup with exact matching
4. **User Validation**: Check for existing users before operations

### Access Control Patterns
- **Role-Based**: Use `Role.users()` for authenticated access
- **User-Specific**: Use `Role.user(userId)` for personal data
- **Public Read**: Use `Role.any()` for public information
- **Admin Only**: Use `Role.team('admin')` for administrative functions

## 🔧 Common Operations Templates

### Database Setup Script Pattern
```javascript
async function createCollection(collectionConfig) {
  try {
    await databases.createCollection(
      databaseId,
      collectionConfig.id,
      collectionConfig.name,
      collectionConfig.permissions
    );
    console.log(`✅ Collection "${collectionConfig.name}" created`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️ Collection already exists`);
    } else {
      throw error;
    }
  }
}
```

### Error Handling Pattern
```javascript
try {
  const result = await operation();
  return result;
} catch (error) {
  if (error.code === 409) {
    // Resource already exists
    console.log('Resource already exists');
  } else if (error.code === 404) {
    // Resource not found
    console.log('Resource not found');
  } else {
    // Unexpected error
    console.error('Unexpected error:', error);
    throw error;
  }
}
```

## 📊 Proven Schema Designs

### 1. Sewing Records Schema (Manufacturing)
- **Header-Detail Pattern**: Main record + line items
- **User Tracking**: All records tied to user_id
- **Status Workflow**: draft → in_progress → completed
- **Audit Trail**: Checked by, approved by fields

### 2. Task Management Schema
- **Priority System**: high, medium, low
- **Assignment Pattern**: assigned_to field for delegation
- **Relationship Tracking**: related_record_id for context
- **Time Tracking**: due_date, completed_at

### 3. AI Conversation Schema
- **Session Management**: session_id for conversation grouping
- **Context Preservation**: context_data for AI memory
- **Model Tracking**: ai_model field for version control
- **Token Management**: tokens_used for cost tracking

## 🛡️ Security Best Practices

### Environment Variables
- Never hardcode credentials
- Use `.env.local` for local development
- Validate all required environment variables
- Use different keys for different environments

### Permission Strategies
- **Principle of Least Privilege**: Grant minimum necessary permissions
- **User Isolation**: Ensure users can only access their own data
- **Role Segregation**: Separate read/write permissions when needed
- **Admin Controls**: Separate admin functions from user functions

## 🔄 Workflow Patterns

### Collection Creation Workflow
1. Define schema with proper types and constraints
2. Set appropriate permissions for user roles
3. Create necessary indexes for performance
4. Handle existing resource conflicts gracefully
5. Validate creation with test operations

### User Management Workflow
1. Validate user existence before operations
2. Handle batch operations with proper error handling
3. Log all administrative actions
4. Provide clear feedback on operation results

## 📈 Performance Optimization

### Indexing Strategy
- Index all foreign key fields (user_id, record_id, etc.)
- Index frequently filtered fields (status, date, priority)
- Use compound indexes for complex queries
- Monitor query performance regularly

### Query Optimization
- Use pagination for large datasets
- Implement proper filtering to reduce data transfer
- Cache frequently accessed data when appropriate
- Use batch operations for multiple updates

## 🎯 Implementation Guidelines

### Code Organization
- Separate configuration from business logic
- Use consistent naming conventions
- Implement proper error handling throughout
- Document all custom patterns and decisions

### Testing Strategy
- Test all CRUD operations
- Validate permission enforcement
- Test error scenarios and edge cases
- Verify data integrity constraints

## 📚 Learning Patterns

### Common Mistakes to Avoid
1. **Missing Indexes**: Always index foreign keys and filter fields
2. **Overpermissive Access**: Don't use `Role.any()` unless truly public
3. **Hardcoded Values**: Use environment variables for all configuration
4. **Poor Error Handling**: Always handle 409 (conflict) and 404 (not found)
5. **Missing Validation**: Validate required fields and data types

### Success Patterns
1. **Consistent Schema Design**: Follow established patterns across collections
2. **Proper Permission Model**: Use role-based access control effectively
3. **Comprehensive Error Handling**: Handle all expected error scenarios
4. **Performance Awareness**: Design with query performance in mind
5. **Security First**: Validate all inputs and enforce proper access controls

## 🔮 Future Enhancements

### Planned Improvements
- Real-time subscriptions for live updates
- Advanced search capabilities with full-text indexing
- File upload and management patterns
- Multi-tenant architecture support
- Advanced analytics and reporting

### Integration Opportunities
- AI-powered data validation
- Automated backup and recovery
- Performance monitoring and alerting
- Advanced user analytics
- Cross-platform synchronization

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Appwrite Expert Worker  
**Next Review**: Weekly updates based on new implementations