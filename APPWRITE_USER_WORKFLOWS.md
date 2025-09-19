# 👥 Appwrite User Management Workflows

## 📋 Overview
Comprehensive documentation of user management workflows and access control patterns extracted from real implementations. This guide covers the complete user lifecycle from creation to deactivation.

## 🔐 Access Control Patterns

### Permission Hierarchy
```
1. Role.any() - Public access (use sparingly)
2. Role.users() - Authenticated users only
3. Role.user(userId) - Specific user access
4. Role.team(teamId) - Team-based access
5. Role.member(membershipId) - Membership-based access
```

### Standard Permission Sets
```javascript
// Public read, authenticated write
const publicReadPermissions = [
  Permission.read(Role.any()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users())
];

// User-specific data
const userDataPermissions = [
  Permission.read(Role.users()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users())
];

// Admin-only operations
const adminOnlyPermissions = [
  Permission.read(Role.team('admin')),
  Permission.create(Role.team('admin')),
  Permission.update(Role.team('admin')),
  Permission.delete(Role.team('admin'))
];
```

## 🔄 User Lifecycle Workflows

### 1. User Registration Workflow
```javascript
// Step 1: Create user account
const registerUser = async (email, password, name) => {
  try {
    // Create account
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Send verification email
    await account.createVerification(
      'http://localhost:3000/verify'
    );

    // Create user profile
    await databases.createDocument(
      databaseId,
      'user_profiles',
      user.$id,
      {
        user_id: user.$id,
        display_name: name,
        email: email,
        is_active: true,
        role: 'user',
        created_at: new Date().toISOString()
      }
    );

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### 2. User Authentication Workflow
```javascript
// Login workflow with session management
const loginUser = async (email, password) => {
  try {
    // Create session
    const session = await account.createEmailSession(email, password);
    
    // Get user details
    const user = await account.get();
    
    // Update last login
    await databases.updateDocument(
      databaseId,
      'user_profiles',
      user.$id,
      {
        last_login: new Date().toISOString(),
        login_count: user.login_count + 1
      }
    );

    // Log authentication event
    await logUserActivity(user.$id, 'login', {
      ip: getClientIP(),
      user_agent: navigator.userAgent
    });

    return { success: true, user, session };
  } catch (error) {
    // Log failed attempt
    await logUserActivity(null, 'login_failed', {
      email,
      error: error.message
    });
    
    return { success: false, error: error.message };
  }
};
```

### 3. User Profile Management Workflow
```javascript
// Complete profile update workflow
const updateUserProfile = async (userId, updates) => {
  try {
    // Validate updates
    const validatedUpdates = validateProfileUpdates(updates);
    
    // Get current profile
    const currentProfile = await databases.getDocument(
      databaseId,
      'user_profiles',
      userId
    );

    // Update profile
    const updatedProfile = await databases.updateDocument(
      databaseId,
      'user_profiles',
      userId,
      {
        ...validatedUpdates,
        updated_at: new Date().toISOString()
      }
    );

    // Log profile change
    await logUserActivity(userId, 'profile_updated', {
      changes: Object.keys(validatedUpdates),
      old_values: Object.keys(validatedUpdates).reduce((acc, key) => {
        acc[key] = currentProfile[key];
        return acc;
      }, {})
    });

    return { success: true, profile: updatedProfile };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const validateProfileUpdates = (updates) => {
  const allowedFields = [
    'display_name', 'department', 'phone', 
    'timezone', 'language', 'preferences'
  ];
  
  return Object.keys(updates)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = updates[key];
      return obj;
    }, {});
};
```

## 🛡️ Security Workflows

### 1. Password Management Workflow
```javascript
// Password reset workflow
const initiatePasswordReset = async (email) => {
  try {
    // Send password recovery email
    await account.createRecovery(
      email,
      'http://localhost:3000/reset-password'
    );

    // Log password reset request
    const user = await findUserByEmail(email);
    if (user) {
      await logUserActivity(user.$id, 'password_reset_requested', {
        email,
        timestamp: new Date().toISOString()
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Complete password reset
const completePasswordReset = async (userId, secret, password) => {
  try {
    // Update password
    await account.updateRecovery(userId, secret, password, password);

    // Invalidate all sessions
    await account.deleteSessions();

    // Log password change
    await logUserActivity(userId, 'password_changed', {
      method: 'reset',
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### 2. Session Management Workflow
```javascript
// Session validation and refresh
const validateSession = async () => {
  try {
    const user = await account.get();
    
    // Check if user is still active
    const profile = await databases.getDocument(
      databaseId,
      'user_profiles',
      user.$id
    );

    if (!profile.is_active) {
      await account.deleteSession('current');
      throw new Error('Account deactivated');
    }

    // Update last activity
    await databases.updateDocument(
      databaseId,
      'user_profiles',
      user.$id,
      {
        last_activity: new Date().toISOString()
      }
    );

    return { success: true, user, profile };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout workflow
const logoutUser = async () => {
  try {
    const user = await account.get();
    
    // Delete current session
    await account.deleteSession('current');

    // Log logout event
    await logUserActivity(user.$id, 'logout', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

## 👨‍💼 Administrative Workflows

### 1. User Administration Workflow
```javascript
// Admin user management service
class UserAdministrationService {
  constructor(client) {
    this.users = new Users(client);
    this.databases = new Databases(client);
  }

  async listAllUsers(page = 1, limit = 100) {
    try {
      const offset = (page - 1) * limit;
      const response = await this.users.list([], limit, offset);
      
      // Enrich with profile data
      const enrichedUsers = await Promise.all(
        response.users.map(async (user) => {
          try {
            const profile = await this.databases.getDocument(
              databaseId,
              'user_profiles',
              user.$id
            );
            return { ...user, profile };
          } catch (error) {
            return { ...user, profile: null };
          }
        })
      );

      return {
        success: true,
        users: enrichedUsers,
        total: response.total,
        page,
        limit
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deactivateUser(userId, reason) {
    try {
      // Update user status
      await this.users.updateStatus(userId, false);

      // Update profile
      await this.databases.updateDocument(
        databaseId,
        'user_profiles',
        userId,
        {
          is_active: false,
          deactivated_at: new Date().toISOString(),
          deactivation_reason: reason
        }
      );

      // Delete all sessions
      await this.users.deleteSessions(userId);

      // Log deactivation
      await logUserActivity(userId, 'account_deactivated', {
        reason,
        admin_action: true
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async reactivateUser(userId) {
    try {
      // Update user status
      await this.users.updateStatus(userId, true);

      // Update profile
      await this.databases.updateDocument(
        databaseId,
        'user_profiles',
        userId,
        {
          is_active: true,
          reactivated_at: new Date().toISOString(),
          deactivation_reason: null
        }
      );

      // Log reactivation
      await logUserActivity(userId, 'account_reactivated', {
        admin_action: true
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteUser(userId) {
    try {
      // Delete user profile first
      await this.databases.deleteDocument(
        databaseId,
        'user_profiles',
        userId
      );

      // Delete user account
      await this.users.delete(userId);

      // Log deletion
      await logUserActivity(userId, 'account_deleted', {
        admin_action: true,
        permanent: true
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### 2. Bulk User Operations Workflow
```javascript
// Bulk user operations
const bulkUserOperations = {
  async importUsers(userList, batchSize = 10) {
    const results = {
      success: [],
      errors: [],
      total: userList.length
    };

    for (let i = 0; i < userList.length; i += batchSize) {
      const batch = userList.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (userData) => {
        try {
          // Create user
          const user = await account.create(
            ID.unique(),
            userData.email,
            userData.password || generateRandomPassword(),
            userData.name
          );

          // Create profile
          await databases.createDocument(
            databaseId,
            'user_profiles',
            user.$id,
            {
              user_id: user.$id,
              display_name: userData.name,
              email: userData.email,
              department: userData.department,
              role: userData.role || 'user',
              is_active: true
            }
          );

          return { success: true, user, email: userData.email };
        } catch (error) {
          return { 
            success: false, 
            error: error.message, 
            email: userData.email 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.success.push(result);
        } else {
          results.errors.push(result);
        }
      });
    }

    return results;
  },

  async exportUsers() {
    try {
      const allUsers = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const response = await users.list([], limit, offset);
        
        if (response.users.length === 0) break;

        // Enrich with profile data
        const enrichedUsers = await Promise.all(
          response.users.map(async (user) => {
            try {
              const profile = await databases.getDocument(
                databaseId,
                'user_profiles',
                user.$id
              );
              return {
                id: user.$id,
                email: user.email,
                name: user.name,
                status: user.status,
                created: user.$createdAt,
                ...profile
              };
            } catch (error) {
              return {
                id: user.$id,
                email: user.email,
                name: user.name,
                status: user.status,
                created: user.$createdAt
              };
            }
          })
        );

        allUsers.push(...enrichedUsers);
        offset += limit;
      }

      return { success: true, users: allUsers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

## 📊 Activity Logging Workflow

### User Activity Tracking
```javascript
// Comprehensive activity logging
const logUserActivity = async (userId, action, metadata = {}) => {
  try {
    await databases.createDocument(
      databaseId,
      'user_activities',
      ID.unique(),
      {
        user_id: userId,
        action,
        metadata: JSON.stringify(metadata),
        ip_address: getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
};

// Activity analysis
const getUserActivityReport = async (userId, startDate, endDate) => {
  try {
    const activities = await databases.listDocuments(
      databaseId,
      'user_activities',
      [
        Query.equal('user_id', userId),
        Query.greaterThanEqual('timestamp', startDate),
        Query.lessThanEqual('timestamp', endDate),
        Query.orderDesc('timestamp'),
        Query.limit(1000)
      ]
    );

    const summary = activities.documents.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      activities: activities.documents,
      summary,
      period: { startDate, endDate }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

## 🔧 Utility Functions

### Helper Functions
```javascript
// User lookup utilities
const findUserByEmail = async (email) => {
  try {
    const response = await users.list([
      Query.equal('email', email)
    ]);
    
    return response.users.length > 0 ? response.users[0] : null;
  } catch (error) {
    return null;
  }
};

// Password generation
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// IP address detection
const getClientIP = () => {
  // Implementation depends on your setup
  return 'unknown';
};
```

## 📋 Workflow Checklists

### New User Onboarding Checklist
- [ ] Create user account with strong password
- [ ] Send email verification
- [ ] Create user profile with default settings
- [ ] Assign appropriate role and permissions
- [ ] Send welcome email with getting started guide
- [ ] Log account creation activity

### User Deactivation Checklist
- [ ] Update user status to inactive
- [ ] Invalidate all active sessions
- [ ] Update profile with deactivation reason
- [ ] Notify relevant team members
- [ ] Archive user data if required
- [ ] Log deactivation activity

### Security Incident Response Checklist
- [ ] Immediately deactivate affected accounts
- [ ] Invalidate all sessions for affected users
- [ ] Review activity logs for suspicious behavior
- [ ] Force password reset for affected accounts
- [ ] Notify users of security incident
- [ ] Document incident and response actions

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Compliance**: Follows GDPR and data protection best practices  
**Review Schedule**: Monthly security and workflow review