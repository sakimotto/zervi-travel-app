# Zervi Travel - Complete Setup Instructions for Trae AI

## 🚀 Quick Setup Options

### Option 1: Docker Setup (Recommended) 🐳

**Why Docker?**
- Consistent environment across all machines
- No dependency conflicts
- One-command setup
- Isolated from host system

#### Prerequisites
- Docker Desktop installed
- Git installed

#### Setup Steps

1. **Clone the repository:**
```bash
git clone <repository-url>
cd zervi-travel
```

2. **Create Docker files:**

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  zervi-travel:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev -- --host 0.0.0.0
```

3. **Run with Docker Compose:**
```bash
docker-compose up --build
```

4. **Access the application:**
- Open browser: `http://localhost:5173`

---

### Option 2: Manual Setup 🛠️

#### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git installed

#### Setup Steps

1. **Clone and navigate:**
```bash
git clone <repository-url>
cd zervi-travel
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Environment setup:**
```bash
cp .env.example .env
```

4. **Start development server:**
```bash
npm run dev
# or
yarn dev
```

5. **Access the application:**
- Server will start on available port (usually 5173-5177)
- Check terminal output for exact URL

---

## 🔧 Configuration

### Environment Variables
Create `.env` file with:
```env
# Supabase Configuration (Optional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Settings
VITE_APP_ENV=development
```

### Port Configuration
If you need specific ports:
```bash
# For manual setup
npm run dev -- --port 3000

# For Docker (modify docker-compose.yml)
ports:
  - "3000:5173"
```

---

## 📁 Project Structure Overview

```
zervi-travel/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   ├── data/               # Sample data
│   ├── types.ts            # TypeScript types
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── docs/                   # Documentation
└── supabase/              # Database migrations
```

---

## 🚀 Development Workflow

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Key Features to Test
1. **Dashboard** - Real-time flight tracking, QR codes, document tracker
2. **Destinations** - Add/edit cities with details
3. **Itinerary** - Flight/hotel/meeting management
4. **Contacts** - Business contact management
5. **Suppliers** - Vendor directory
6. **Calendar** - Appointment scheduling
7. **User Manual** - Comprehensive guide (newly added)

---

## 🐳 Docker Commands Reference

```bash
# Build and start
docker-compose up --build

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build --force-recreate

# Clean up
docker-compose down -v
docker system prune
```

---

## 🔍 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
netstat -ano | findstr :5173
# Kill process (Windows)
taskkill /PID <process_id> /F
```

**Node modules issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Docker issues:**
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -f
docker-compose up --build
```

**TypeScript errors:**
```bash
# Check types
npm run type-check
# Clear TypeScript cache
rm -rf .tsbuildinfo
```

---

## 📊 Current Status

### ✅ Implemented Features
- Complete dashboard with real-time features
- All navigation routes functional
- Data management (localStorage + schema)
- Responsive design
- User manual with comprehensive documentation

### 🚧 Development Areas
- Real-time API integrations
- Advanced expense reporting
- User settings/preferences
- Notification system
- Enhanced mobile experience

---

## 🎯 Quick Verification Checklist

After setup, verify these work:
- [ ] Dashboard loads with sample data
- [ ] Navigation between all pages
- [ ] Add/edit destinations
- [ ] Create itinerary items
- [ ] Add contacts and suppliers
- [ ] Calendar functionality
- [ ] User manual accessibility
- [ ] Responsive design on different screen sizes

---

## 💡 Development Tips

1. **Hot Reload**: Changes auto-refresh in development
2. **Data Persistence**: Uses localStorage for user preferences
3. **Sample Data**: Pre-loaded for immediate testing
4. **TypeScript**: Strict typing for better development experience
5. **Tailwind CSS**: Utility-first styling framework
6. **Component Structure**: Modular and reusable components

---

## 🔗 Useful Resources

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **TypeScript**: https://www.typescriptlang.org/
- **Docker**: https://docs.docker.com/

---

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review terminal/console errors
3. Verify all prerequisites are installed
4. Try Docker setup if manual setup fails
5. Check port availability

**Happy coding! 🚀**