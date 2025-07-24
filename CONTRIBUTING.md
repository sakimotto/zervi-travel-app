# Contributing to Zervi Travel

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Maintainers:** Zervi Travel Development Team  

Thank you for your interest in contributing to Zervi Travel! This document provides guidelines and information for contributors.

---

## 🤝 How to Contribute

### Ways to Contribute

- 🐛 **Bug Reports** - Report issues and bugs
- 💡 **Feature Requests** - Suggest new features
- 📝 **Documentation** - Improve docs and guides
- 🔧 **Code Contributions** - Submit bug fixes and features
- 🧪 **Testing** - Help with testing and QA
- 🎨 **Design** - UI/UX improvements
- 🌍 **Translations** - Localization support

### Before You Start

1. **Check Existing Issues** - Look for similar issues or feature requests
2. **Read Documentation** - Familiarize yourself with the project
3. **Join Discussions** - Participate in GitHub Discussions
4. **Follow Guidelines** - Adhere to our coding standards

---

## 🚀 Getting Started

### 🔗 Quick Start Options

#### Option 1: Live Demo (Netlify)
```bash
# Access live production environment
https://superb-chebakia-bcacf0.netlify.app

# Features:
- ✅ Production-ready deployment
- ✅ Global CDN performance
- ✅ Mobile-optimized experience
- ✅ Automatic HTTPS
- ✅ Real user testing environment
```

#### Option 2: Local Development Setup
```bash
# 1. Fork the repository
git clone https://github.com/your-username/zervi-travel.git
cd zervi-travel

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Configure your Supabase credentials

# 4. Start development server
npm run dev

# 5. Run tests
npm run test
```

### 🤖 Built with Bolt.new
This project was originally created using [Bolt.new](https://bolt.new), an AI-powered full-stack development platform. This means:
- **Rapid Development**: AI-assisted code generation
- **Modern Stack**: Latest React, TypeScript, and Vite setup
- **Best Practices**: Following current web development standards
- **Comprehensive Structure**: Complete project scaffolding

### Development Environment

**Required:**
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Supabase account (for backend)

**Recommended:**
- VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

---

## 📝 Coding Standards

### Code Style

```typescript
// ✅ Good: Use TypeScript interfaces
interface User {
  id: string;
  email: string;
  created_at: string;
}

// ✅ Good: Functional components with proper typing
const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">{user.email}</h2>
    </div>
  );
};

// ✅ Good: Custom hooks with proper naming
const useUser = (): { user: User | null; loading: boolean; error: string | null } => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook implementation
  
  return { user, loading, error };
};
```

### File Naming Conventions

```
📁 Components: PascalCase
├── UserProfile.tsx
├── ExpenseCard.tsx
└── NavigationMenu.tsx

📁 Pages: PascalCase
├── Dashboard.tsx
├── ExpensesPage.tsx
└── SettingsPage.tsx

📁 Hooks: camelCase with 'use' prefix
├── useAuth.ts
├── useExpenses.ts
└── useLocalStorage.ts

📁 Utils: camelCase
├── formatDate.ts
├── validateEmail.ts
└── apiHelpers.ts

📁 Types: camelCase
├── user.ts
├── expense.ts
└── api.ts
```

### TypeScript Guidelines

```typescript
// ✅ Use strict typing
interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}

// ✅ Use proper generics
const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => {
  // Implementation
};

// ✅ Use union types for state
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ Use proper prop types
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

### CSS/Styling Guidelines

```tsx
// ✅ Use Tailwind CSS classes
const Button: React.FC<ButtonProps> = ({ variant, size = 'md', children }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </button>
  );
};
```

---

## 🔄 Development Workflow

### Branch Strategy

```
🌳 Branch Structure:
├── main (production)
├── develop (integration)
├── feature/feature-name
├── bugfix/issue-description
├── hotfix/critical-fix
└── release/version-number
```

### Commit Message Format

```bash
# Format: type(scope): description

# Types:
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code refactoring
test: adding tests
chore: maintenance tasks

# Examples:
feat(auth): add password reset functionality
fix(expenses): resolve calculation error in totals
docs(api): update authentication endpoints
test(components): add unit tests for UserProfile
refactor(hooks): optimize useExpenses performance
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation
   - Ensure all tests pass

3. **Pre-submission Checklist**
   ```bash
   # Run quality checks
   npm run lint          # ESLint
   npm run type-check    # TypeScript
   npm run test          # Unit tests
   npm run build         # Production build
   ```

4. **Submit Pull Request**
   - Use descriptive title
   - Fill out PR template
   - Link related issues
   - Request appropriate reviewers

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Related Issues
Closes #123
```

---

## 🧪 Testing Guidelines

### Test Structure

```typescript
// Component tests
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    created_at: '2025-01-01'
  };

  it('renders user email', () => {
    render(<UserProfile user={mockUser} />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    render(<UserProfile user={mockUser} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(mockUser);
  });
});

// Hook tests
import { renderHook, act } from '@testing-library/react';
import { useUser } from './useUser';

describe('useUser', () => {
  it('initializes with loading state', () => {
    const { result } = renderHook(() => useUser());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('fetches user data', async () => {
    const { result } = renderHook(() => useUser());
    
    await act(async () => {
      // Trigger data fetch
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeDefined();
  });
});
```

### Test Coverage Requirements

```
📊 Minimum Coverage Targets:
├── Components: 85%
├── Hooks: 90%
├── Utils: 95%
├── Pages: 70%
└── Overall: 85%
```

### Testing Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test UserProfile.test.tsx

# Run tests for specific pattern
npm run test -- --testNamePattern="user"
```

---

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Version: [e.g. 2.0.0]
- Device: [e.g. Desktop/Mobile]

## Additional Context
Any other context about the problem

## Possible Solution
(Optional) Suggest a fix or reason for the bug
```

### Bug Severity Levels

```
🔴 Critical (P0)
├── Application crashes
├── Data loss
├── Security vulnerabilities
└── Core functionality broken

🟡 High (P1)
├── Major feature not working
├── Performance issues
├── UI/UX problems
└── Workflow interruptions

🟢 Medium (P2)
├── Minor feature issues
├── Cosmetic problems
├── Edge case bugs
└── Enhancement requests

🔵 Low (P3)
├── Documentation issues
├── Minor UI inconsistencies
├── Nice-to-have features
└── Code cleanup
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Summary
Brief description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
Detailed description of the proposed feature

## User Stories
- As a [user type], I want [goal] so that [benefit]
- As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Design Mockups
[If applicable, add design mockups]

## Technical Considerations
- Implementation complexity
- Performance impact
- Security implications
- Breaking changes

## Alternative Solutions
Other approaches considered

## Additional Context
Any other relevant information
```

---

## 📚 Documentation

### Documentation Standards

```markdown
# Document Title

**Version:** X.X.X
**Last Updated:** Month Year
**Status:** [Draft/Review/Published]

## Overview
Brief description of the document

## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1
Content with proper formatting

### Code Examples
```typescript
// Well-commented code examples
const example = () => {
  // Implementation
};
```

### Screenshots
![Alt text](path/to/image.png)

## References
- [Link 1](url)
- [Link 2](url)
```

### Documentation Types

```
📖 User Documentation
├── User guides
├── Tutorials
├── FAQ
└── Troubleshooting

🔧 Developer Documentation
├── API reference
├── Architecture guides
├── Setup instructions
└── Contributing guidelines

🧪 Technical Documentation
├── Testing procedures
├── Deployment guides
├── Performance analysis
└── Security audits
```

---

## 🏆 Recognition

### Contributor Recognition

- **Hall of Fame** - Top contributors featured in README
- **Contributor Badge** - GitHub profile badge
- **Release Notes** - Contributors mentioned in releases
- **Community Spotlight** - Featured in project updates

### Contribution Levels

```
🥉 Bronze Contributor
├── 1-5 merged PRs
├── Bug reports with reproductions
├── Documentation improvements
└── Community participation

🥈 Silver Contributor
├── 6-15 merged PRs
├── Feature implementations
├── Test coverage improvements
└── Code reviews

🥇 Gold Contributor
├── 16+ merged PRs
├── Major feature development
├── Architecture improvements
└── Mentoring other contributors

💎 Core Contributor
├── Consistent contributions
├── Project maintenance
├── Release management
└── Community leadership
```

---

## 📞 Getting Help

### Communication Channels

- 💬 **GitHub Discussions** - General questions and ideas
- 🐛 **GitHub Issues** - Bug reports and feature requests
- 📧 **Email** - contribute@zervitravel.com
- 📖 **Documentation** - Check `/docs` folder first

### Response Times

```
⏰ Expected Response Times:
├── Bug reports: 24-48 hours
├── Feature requests: 3-5 days
├── Pull requests: 2-3 days
├── Questions: 1-2 days
└── Security issues: Same day
```

### Code of Conduct

- **Be Respectful** - Treat everyone with respect
- **Be Inclusive** - Welcome all contributors
- **Be Constructive** - Provide helpful feedback
- **Be Patient** - Understand different skill levels
- **Be Professional** - Maintain professional communication

---

## 🎯 Current Priorities

### High Priority (v2.0.1)

- [ ] Fix 22 database schema mismatches
- [ ] Resolve 5 security vulnerabilities
- [ ] Optimize bundle size (reduce by 40-50%)
- [ ] Improve error handling and user feedback
- [ ] Add comprehensive error boundaries

### Medium Priority (v2.1.0)

- [ ] Enhanced mobile experience
- [ ] Offline synchronization
- [ ] Advanced reporting and analytics
- [ ] Team collaboration features
- [ ] Third-party integrations

### Low Priority (Future)

- [ ] AI-powered recommendations
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Enterprise features
- [ ] Advanced customization

---

## 📋 Contributor Checklist

### Before Your First Contribution

- [ ] Read this contributing guide
- [ ] Set up development environment
- [ ] Run the application locally
- [ ] Read existing code and documentation
- [ ] Join GitHub Discussions
- [ ] Look for "good first issue" labels

### For Each Contribution

- [ ] Create feature branch from `develop`
- [ ] Follow coding standards
- [ ] Add/update tests
- [ ] Update documentation
- [ ] Run quality checks locally
- [ ] Submit pull request
- [ ] Respond to review feedback
- [ ] Ensure CI/CD passes

### Quality Gates

- [ ] All tests pass
- [ ] Code coverage maintained
- [ ] No linting errors
- [ ] TypeScript compilation succeeds
- [ ] Build process completes
- [ ] No security vulnerabilities introduced
- [ ] Performance impact assessed

---

Thank you for contributing to Zervi Travel! Your efforts help make travel planning better for everyone. 🌍✈️

---

*Last updated: January 2025 | Version 2.0.0*