# Git Version Control Standards

**Document Version:** 1.0.0
**Last Updated:** October 29, 2025
**Status:** Production Standard
**Applies To:** All Bolt.new projects

---

## Table of Contents

1. [Git Workflow](#1-git-workflow)
2. [Branch Management](#2-branch-management)
3. [Commit Standards](#3-commit-standards)
4. [Pull Request Process](#4-pull-request-process)
5. [Version Tagging](#5-version-tagging)
6. [Git Hooks](#6-git-hooks)
7. [.gitignore Standards](#7-gitignore-standards)
8. [Repository Setup](#8-repository-setup)

---

## 1. Git Workflow

### 1.1 Branching Strategy

We use **Git Flow** for structured development:

```
┌─────────────────────────────────────────────────────────┐
│                         main                            │ ← Production
│  v1.0.0      v1.1.0      v1.2.0       v2.0.0           │
└────┬──────────┬──────────┬────────────┬────────────────┘
     │          │          │            │
┌────┴──────────┴──────────┴────────────┴────────────────┐
│                       develop                           │ ← Staging
└──┬───────┬───────┬────────┬────────┬───────────────────┘
   │       │       │        │        │
   │   ┌───┴───┐  │    ┌───┴───┐    │
   │   │ fix/  │  │    │ feat/ │    │
   │   │ bug   │  │    │ new   │    │
   │   └───────┘  │    └───────┘    │
   │              │                 │
   └──────────────┴─────────────────┘
```

**Branch Hierarchy:**
```
main (production)
├── develop (staging)
│   ├── feature/* (new features)
│   ├── fix/* (bug fixes)
│   ├── refactor/* (code improvements)
│   ├── docs/* (documentation)
│   └── test/* (testing)
└── hotfix/* (emergency fixes - branches from main)
```

---

### 1.2 Branch Lifecycle

**1. Feature Development:**
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# Work on feature
git add .
git commit -m "feat(auth): implement login functionality"

# Keep updated with develop
git fetch origin
git rebase origin/develop

# Push to remote
git push origin feature/user-authentication
```

**2. Bug Fixes:**
```bash
# Create fix branch from develop
git checkout -b fix/login-validation

# Fix the bug
git commit -m "fix(auth): resolve email validation issue"

# Push and create PR
git push origin fix/login-validation
```

**3. Hotfixes (Emergency):**
```bash
# Branch from main for critical fixes
git checkout main
git pull origin main
git checkout -b hotfix/security-patch

# Apply fix
git commit -m "fix(security): patch authentication vulnerability"

# Merge to both main and develop
git checkout main
git merge --no-ff hotfix/security-patch
git tag -a v1.0.1 -m "Security hotfix"

git checkout develop
git merge --no-ff hotfix/security-patch
```

---

## 2. Branch Management

### 2.1 Branch Naming Conventions

**Format:** `type/short-description`

**Branch Types:**

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New features | `feature/user-dashboard` |
| `fix/` | Bug fixes | `fix/login-error` |
| `hotfix/` | Critical production fixes | `hotfix/data-corruption` |
| `refactor/` | Code restructuring | `refactor/auth-service` |
| `docs/` | Documentation updates | `docs/api-reference` |
| `test/` | Testing additions | `test/unit-coverage` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |

**Naming Rules:**
- ✅ Use lowercase with hyphens
- ✅ Keep descriptions short (2-4 words)
- ✅ Be descriptive and clear
- ❌ Avoid special characters
- ❌ Don't use personal names
- ❌ Don't use numbers only

**Examples:**
```bash
✅ GOOD:
feature/payment-integration
fix/dashboard-crash
refactor/api-endpoints
docs/deployment-guide

❌ BAD:
feature123
johns-branch
my-fix
temp
```

---

### 2.2 Branch Protection Rules

**main branch:**
- ✅ Require pull request reviews (minimum 1)
- ✅ Require status checks to pass
- ✅ Require conversation resolution
- ✅ Require linear history
- ✅ Block force pushes
- ✅ Block deletions

**develop branch:**
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Block force pushes

**Feature branches:**
- ✅ Delete after merge
- ✅ Keep for maximum 30 days if unmerged

---

### 2.3 Branch Cleanup

**Regular Maintenance:**
```bash
# List merged branches
git branch --merged develop

# Delete local merged branches
git branch -d feature/completed-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Prune remote-tracking branches
git fetch --prune
```

**Stale Branch Policy:**
- Branches inactive for 30+ days → Warning
- Branches inactive for 60+ days → Auto-close PR
- Branches inactive for 90+ days → Auto-delete

---

## 3. Commit Standards

### 3.1 Commit Message Format

**Structure:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
feat(auth): add two-factor authentication

Implement TOTP-based 2FA for enhanced security.
Users can now enable 2FA in account settings.

- Add QR code generation
- Implement verification flow
- Add backup codes

Closes #123
Breaking Change: Auth API updated
```

---

### 3.2 Commit Types

| Type | Purpose | Changelog | Example |
|------|---------|-----------|---------|
| `feat` | New feature | Yes | `feat(ui): add dark mode` |
| `fix` | Bug fix | Yes | `fix(api): resolve timeout issue` |
| `docs` | Documentation | No | `docs(readme): update setup steps` |
| `style` | Formatting | No | `style(css): fix indentation` |
| `refactor` | Code restructure | No | `refactor(auth): simplify logic` |
| `perf` | Performance | Yes | `perf(db): add query indexing` |
| `test` | Testing | No | `test(auth): add unit tests` |
| `build` | Build system | No | `build(deps): update packages` |
| `ci` | CI configuration | No | `ci(github): add workflow` |
| `chore` | Maintenance | No | `chore(deps): update versions` |
| `revert` | Revert change | Yes | `revert: feat(ui): dark mode` |

---

### 3.3 Commit Scopes

**Common Scopes:**
- `auth` - Authentication
- `api` - API endpoints
- `db` - Database
- `ui` - User interface
- `docs` - Documentation
- `config` - Configuration
- `deps` - Dependencies
- `security` - Security
- `perf` - Performance

**Examples:**
```
feat(auth): implement OAuth login
fix(api): handle null responses
docs(readme): update installation
refactor(db): optimize queries
test(ui): add component tests
```

---

### 3.4 Commit Rules

**Do's:**
- ✅ Write in present tense ("add" not "added")
- ✅ Use imperative mood ("move" not "moves")
- ✅ Keep subject line under 50 characters
- ✅ Capitalize first letter of subject
- ✅ No period at end of subject
- ✅ Separate subject from body with blank line
- ✅ Wrap body at 72 characters
- ✅ Explain what and why, not how
- ✅ Reference issues in footer

**Don'ts:**
- ❌ Don't commit commented code
- ❌ Don't commit TODO comments
- ❌ Don't commit console.log statements
- ❌ Don't commit sensitive data
- ❌ Don't commit large files
- ❌ Don't mix unrelated changes
- ❌ Don't use vague messages like "fix stuff"

**Good Examples:**
```
✅ feat(auth): add password reset flow
✅ fix(ui): resolve button alignment issue
✅ docs(api): update endpoint documentation
✅ refactor(hooks): extract shared logic
✅ perf(query): add database indexes
```

**Bad Examples:**
```
❌ fixed bug
❌ WIP
❌ changes
❌ update
❌ test123
```

---

### 3.5 Atomic Commits

**One Logical Change Per Commit:**

```bash
# ❌ BAD - Multiple unrelated changes
git add .
git commit -m "add feature, fix bugs, update docs"

# ✅ GOOD - Separate commits
git add src/features/auth
git commit -m "feat(auth): add login functionality"

git add src/components/Button.tsx
git commit -m "fix(ui): resolve button styling issue"

git add README.md
git commit -m "docs(readme): update setup instructions"
```

---

## 4. Pull Request Process

### 4.1 Creating Pull Requests

**PR Title Format:**
```
<type>(<scope>): <description>

Examples:
feat(auth): Add two-factor authentication
fix(dashboard): Resolve chart rendering issue
docs(api): Update endpoint documentation
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Changes generate no breaking changes

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
Fixes #456
```

---

### 4.2 PR Review Process

**Before Requesting Review:**
1. ✅ Self-review your code
2. ✅ Run all tests locally
3. ✅ Check for console errors
4. ✅ Update documentation
5. ✅ Ensure CI passes
6. ✅ Resolve merge conflicts
7. ✅ Add screenshots if UI changes

**Reviewer Checklist:**
- ✅ Code quality and readability
- ✅ Follows project standards
- ✅ Proper error handling
- ✅ Security considerations
- ✅ Performance implications
- ✅ Test coverage adequate
- ✅ Documentation updated

**Review Guidelines:**
- Comment constructively
- Explain reasoning for changes
- Approve when satisfied
- Request changes when needed
- Ask questions for clarity

---

### 4.3 PR Labels

**Status Labels:**
- `status: in-progress` - Work in progress
- `status: ready-for-review` - Ready for review
- `status: changes-requested` - Changes needed
- `status: approved` - Approved, ready to merge

**Type Labels:**
- `type: feature` - New feature
- `type: bugfix` - Bug fix
- `type: hotfix` - Critical fix
- `type: docs` - Documentation
- `type: refactor` - Code improvement

**Priority Labels:**
- `priority: critical` - Must fix immediately
- `priority: high` - Important, fix soon
- `priority: medium` - Normal priority
- `priority: low` - Nice to have

---

### 4.4 Merging Strategy

**Merge Options:**

**1. Squash and Merge (Recommended for features):**
```bash
# Combines all commits into one
# Keeps main/develop history clean
```

**2. Rebase and Merge (For small changes):**
```bash
# Maintains individual commits
# Creates linear history
```

**3. Merge Commit (For releases):**
```bash
# Preserves all commit history
# Shows merge relationships
```

**When to Use:**
- **Squash:** Feature branches with multiple WIP commits
- **Rebase:** Bug fixes with clean commit history
- **Merge:** Release branches, hotfixes

---

## 5. Version Tagging

### 5.1 Semantic Versioning

**Format:** `MAJOR.MINOR.PATCH`

**Version Components:**
- **MAJOR:** Breaking changes (e.g., v1.0.0 → v2.0.0)
- **MINOR:** New features (backward compatible) (e.g., v1.0.0 → v1.1.0)
- **PATCH:** Bug fixes (e.g., v1.0.0 → v1.0.1)

**Pre-release Versions:**
- `v1.0.0-alpha.1` - Alpha release
- `v1.0.0-beta.2` - Beta release
- `v1.0.0-rc.1` - Release candidate

---

### 5.2 Creating Tags

**Annotated Tags (Recommended):**
```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release version 1.2.0

New Features:
- User authentication
- Dashboard analytics

Bug Fixes:
- Login validation
- Chart rendering

Breaking Changes:
- Updated API endpoints
"

# Push tag to remote
git push origin v1.2.0

# Push all tags
git push origin --tags
```

**Lightweight Tags:**
```bash
# Simple tag (not recommended for releases)
git tag v1.2.0
git push origin v1.2.0
```

---

### 5.3 Release Process

**1. Prepare Release:**
```bash
# Update version in package.json
npm version minor  # or major, patch

# Update CHANGELOG.md
# Update documentation
```

**2. Create Release Branch:**
```bash
git checkout -b release/1.2.0 develop
```

**3. Final Testing:**
```bash
npm run test
npm run build
npm run lint
```

**4. Merge to Main:**
```bash
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags
```

**5. Merge Back to Develop:**
```bash
git checkout develop
git merge --no-ff release/1.2.0
git push origin develop
```

**6. Delete Release Branch:**
```bash
git branch -d release/1.2.0
```

---

## 6. Git Hooks

### 6.1 Pre-commit Hook

**Setup with Husky:**
```bash
# Install Husky
npm install --save-dev husky lint-staged

# Initialize
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**lint-staged Configuration (package.json):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

### 6.2 Commit Message Hook

**Enforce Conventional Commits:**
```bash
# Install commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Add commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

**commitlint.config.js:**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'build', 'ci', 'chore', 'revert'
      ]
    ],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
```

---

### 6.3 Pre-push Hook

**Run Tests Before Push:**
```bash
npx husky add .husky/pre-push "npm test"
```

---

## 7. .gitignore Standards

### 7.1 Standard .gitignore Template

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Temporary
.cache/
.temp/
.tmp/

# OS
Thumbs.db
.DS_Store

# Optional: Large files
*.psd
*.ai
```

---

### 7.2 Supabase-specific

```gitignore
# Supabase
.supabase/
supabase/.branches/
supabase/.temp/

# Keep migrations
!supabase/migrations/
```

---

## 8. Repository Setup

### 8.1 Initial Setup

```bash
# Initialize repository
git init

# Set default branch name
git config --global init.defaultBranch main

# Create main branch
git checkout -b main

# First commit
git add .
git commit -m "chore: initial commit"

# Add remote
git remote add origin https://github.com/username/repo.git

# Push to remote
git push -u origin main

# Create develop branch
git checkout -b develop
git push -u origin develop
```

---

### 8.2 Repository Configuration

**.git/config:**
```ini
[core]
  editor = code --wait
  autocrlf = input

[user]
  name = Your Name
  email = your.email@example.com

[pull]
  rebase = false

[push]
  default = current

[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  lg = log --oneline --graph --decorate
```

---

### 8.3 GitHub Repository Settings

**Settings:**
- ✅ Enable branch protection
- ✅ Require pull requests
- ✅ Enable status checks
- ✅ Auto-delete head branches
- ✅ Enable dependabot
- ✅ Enable security alerts

**Templates:**
- Create issue templates (`.github/ISSUE_TEMPLATE/`)
- Create PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
- Add CODEOWNERS (`.github/CODEOWNERS`)

---

## 9. Best Practices Summary

### 9.1 Daily Workflow

```bash
# Start of day
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit frequently
git add .
git commit -m "feat(scope): description"

# Keep updated with develop
git fetch origin
git rebase origin/develop

# Push changes
git push origin feature/my-feature

# Create PR when ready
# Request reviews
# Address feedback
# Merge when approved
```

---

### 9.2 Common Commands

```bash
# Status
git status
git log --oneline --graph

# Branches
git branch -a
git checkout -b new-branch
git branch -d old-branch

# Committing
git add .
git commit -m "message"
git commit --amend

# Syncing
git fetch origin
git pull origin develop
git push origin branch-name

# Merging
git merge branch-name
git rebase branch-name

# Undoing
git reset HEAD~1
git revert commit-hash
git stash
git stash pop
```

---

### 9.3 Troubleshooting

**Undo last commit:**
```bash
git reset --soft HEAD~1  # Keep changes
git reset --hard HEAD~1  # Discard changes
```

**Fix wrong branch:**
```bash
git stash
git checkout correct-branch
git stash pop
```

**Resolve merge conflicts:**
```bash
# 1. Pull latest
git pull origin develop

# 2. Resolve conflicts in editor
# 3. Stage resolved files
git add .

# 4. Complete merge
git commit
```

---

## Conclusion

Following these Git standards ensures:
- ✅ Clean commit history
- ✅ Easy code review
- ✅ Traceable changes
- ✅ Collaborative workflow
- ✅ Professional codebase
- ✅ Release management

**Review and update this document quarterly.**

---

**Document Owner:** Development Team
**Last Review:** October 29, 2025
**Next Review:** January 29, 2026
