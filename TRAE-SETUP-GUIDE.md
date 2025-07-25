# Trae AI Environment Setup Guide

This guide helps you replicate the exact Trae AI development environment on another device for the Zervi Travel project.

## Prerequisites

- **Trae AI IDE** installed on the target device
- **Node.js** (v18 or higher)
- **Git** configured with your credentials
- **Docker** (optional, for containerized development)

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/zervi-travel.git
cd zervi-travel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your specific configuration:
- Supabase credentials
- API keys
- Database URLs

## MCP Servers Configuration

The following MCP servers are configured in this environment:

### Core MCP Servers

1. **GitLab MCP Server**
   - **Purpose**: Repository management and GitLab operations
   - **Configuration**: `mcp.config.usrlocalmcp.gitlab`
   - **Tools**: create_or_update_file, search_repositories, create_repository, get_file_contents, push_files, create_issue, create_merge_request, fork_repository, create_branch

2. **Filesystem MCP Server**
   - **Purpose**: Local file system operations
   - **Configuration**: `mcp.config.usrlocalmcp.filesystem`
   - **Tools**: read_file, read_multiple_files, write_file, edit_file, create_directory, list_directory, move_file, search_files, get_file_info

3. **Memory MCP Server**
   - **Purpose**: Knowledge graph and entity management
   - **Configuration**: `mcp.config.usrlocalmcp.Memory`
   - **Tools**: create_entities, create_relations, add_observations, delete_entities, search_nodes, open_nodes

4. **Brave Search MCP Server**
   - **Purpose**: Web search capabilities
   - **Configuration**: `mcp.config.usrlocalmcp.Brave Search`
   - **Tools**: brave_web_search, brave_local_search

5. **Sequential Thinking MCP Server**
   - **Purpose**: Complex problem-solving and analysis
   - **Configuration**: `mcp.config.usrlocalmcp.Sequential Thinking`
   - **Tools**: sequentialthinking

6. **GitHub MCP Server**
   - **Purpose**: GitHub repository operations
   - **Configuration**: `mcp.config.usrlocalmcp.GitHub`
   - **Tools**: create_or_update_file, search_repositories, create_repository, get_file_contents, push_files, list_commits

7. **File System (21) MCP Server**
   - **Purpose**: Special file transport operations
   - **Configuration**: `mcp.config.usrlocalmcp.File System`
   - **Tools**: read-file-21

### MCP Server Installation

To install these MCP servers in Trae AI:

1. Open Trae AI settings
2. Navigate to MCP Servers section
3. Add each server with the configurations listed above
4. Ensure all required API keys and credentials are configured

## Development Environment

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Testing
npm test
npm run test:coverage

# Code formatting
npm run format
npm run format:check
```

### Docker Setup (Optional)

#### Development
```bash
docker-compose up
```

#### Production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Project Structure

```
zervi-travel/
├── .trae/                 # Trae AI configuration
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── data/             # Sample data
│   └── types.ts          # TypeScript definitions
├── docs/                 # Documentation
├── supabase/             # Database migrations
├── .env.example          # Environment template
└── package.json          # Dependencies and scripts
```

## Key Configuration Files

### Build Tools
- `vite.config.ts` - Vite configuration with optimizations
- `postcss.config.js` - PostCSS with Tailwind CSS
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Code Quality
- `.eslintrc.js` - ESLint configuration
- `.prettierrc.js` - Prettier formatting rules
- `jest.config.js` - Jest testing configuration

### Git Hooks
- `.husky/` - Git hooks for pre-commit validation
- Automated linting and formatting on commit

## Quick Start Commands

### Windows
```bash
# Run the quick start script
.\quick-start.bat
```

### Unix/Linux/macOS
```bash
# Run the quick start script
./quick-start.sh
```

## Verification Steps

1. **Environment Check**
   ```bash
   npm run dev
   ```
   Should start development server on `http://localhost:5173` or `http://localhost:5174`

2. **Build Check**
   ```bash
   npm run build
   ```
   Should complete without errors

3. **Linting Check**
   ```bash
   npm run lint
   ```
   Should pass all linting rules

4. **Test Check**
   ```bash
   npm test
   ```
   Should run all tests successfully

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Vite will automatically try the next available port
   - Check for other running development servers

2. **Environment Variables**
   - Ensure all required variables are set in `.env`
   - Check `.env.example` for required variables

3. **MCP Server Connection**
   - Verify API keys and credentials
   - Check Trae AI MCP server status
   - Restart Trae AI if servers aren't responding

4. **Dependencies**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

### Support

For additional support:
- Check the `docs/` directory for detailed documentation
- Review `CONTRIBUTING.md` for development guidelines
- See `DEPLOYMENT.md` for production deployment

## Current Project Status

- ✅ Development environment configured
- ✅ All MCP servers active
- ✅ Docker setup complete
- ✅ CI/CD pipeline configured
- ✅ Testing framework setup
- ✅ Code quality tools configured
- ✅ Documentation complete

---

*Last updated: January 2025*
*Project: Zervi Travel Management System*