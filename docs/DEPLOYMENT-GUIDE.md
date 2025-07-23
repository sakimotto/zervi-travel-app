# Deployment Guide

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Deployment Status:** ✅ Production Ready  
**Architecture:** React SPA + Supabase Backend  
**Built with:** Bolt.new (AI-powered development platform)  
**Current Hosting:** Netlify (Live Demo) + Supabase (Backend)  
**Alternative Hosting:** Vercel, Netlify, Static Hosting  

---

## 🚀 Quick Deployment

### 🔗 Live Demo
**Current Live Version:** [View on Netlify](https://superb-chebakia-bcacf0.netlify.app)

### Prerequisites
- Node.js 18+ installed
- Git repository access
- Supabase account
- Hosting platform account (Netlify, Vercel, StackBlitz, etc.)

### One-Click Deploy
```bash
# Clone and deploy
git clone <repository-url>
cd zervi-travel
npm install
npm run build
```

---

## 🏗️ Environment Setup

### 1. Supabase Backend Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key
4. Run database migrations

#### Database Migration
```sql
-- Run the migration file
-- Location: supabase/migrations/20250723015307_sparkling_dew.sql

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Expected tables:
-- destinations, suppliers, business_contacts, 
-- itinerary_items, expenses, todos, appointments
```

#### Environment Variables
```bash
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Frontend Setup

#### Install Dependencies
```bash
npm install
# or
yarn install
```

#### Development Server
```bash
npm run dev
# Runs on http://localhost:5173
```

#### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Deployment Options

### Option 1: Netlify (Current Live Demo)

#### Features
- ⚡ **Production Ready** - Optimized for performance
- 🌐 **Global CDN** - Fast loading worldwide
- 🔒 **Automatic HTTPS** - Secure by default
- 🔄 **Continuous Deployment** - Auto-deploy from Git
- 📱 **Mobile Optimized** - Perfect mobile experience
- 🚀 **Edge Functions** - Serverless functionality

#### Access
```bash
# Live demo URL
https://superb-chebakia-bcacf0.netlify.app

# Deploy your own
1. Connect your GitHub repository to Netlify
2. Configure build settings
3. Add environment variables
4. Deploy automatically on push
```

### Option 2: Vercel

#### Automatic Deployment
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

### Option 3: StackBlitz (Development)

#### Features
- ⚡ **Instant development** - No local setup required
- 🔄 **Live editing** - Real-time code changes
- 🌐 **Public sharing** - Shareable live demo links
- 📱 **Mobile preview** - Test on different devices
- 🔗 **GitHub sync** - Automatic updates from repository

#### Access
```bash
# Development URL
https://stackblitz.com/~/github.com/your-username/zervi-travel

# Fork and edit
1. Visit the StackBlitz link
2. Click "Fork" to create your own copy
3. Edit code directly in browser
4. Changes are instantly reflected
```

### Option 4: Other Static Hosts

#### Build Settings
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### Option 5: Custom Static Hosting

#### Build for Static Hosting
```bash
npm run build
# Upload dist/ folder to any static host
```

#### Supported Hosts
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting
- Surge.sh
- Any CDN or static host

---

## 🔧 Configuration

### Environment Variables

#### Required Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Optional Variables
```bash
# Analytics (if implemented)
VITE_GA_TRACKING_ID=GA-XXXXXXXXX

# Feature Flags
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_OFFLINE_MODE=true

# API Configuration
VITE_API_BASE_URL=https://api.example.com
```

### Build Configuration

#### Vite Config (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
```

---

## 🔒 Security Configuration

### Supabase Security

#### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)

-- Create policies for authenticated users
CREATE POLICY "Users can manage their own data" ON destinations
FOR ALL USING (auth.uid() = user_id);
```

#### API Security
- Anon key is safe for frontend use
- RLS policies protect user data
- Service role key should never be exposed

### Frontend Security

#### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               connect-src 'self' https://*.supabase.co;">
```

#### Environment Security
- Never commit .env files
- Use different keys for dev/staging/prod
- Rotate keys regularly

---

## 📊 Performance Optimization

### Build Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

#### Code Splitting
```typescript
// Lazy load large components
const TipsPage = lazy(() => import('./pages/TipsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
```

### Runtime Optimization

#### Supabase Optimization
```typescript
// Use select to limit data
const { data } = await supabase
  .from('suppliers')
  .select('id, company_name, status')
  .limit(50);

// Use indexes for better performance
// Add indexes in Supabase dashboard
```

#### Caching Strategy
```typescript
// React Query for caching (if implemented)
import { useQuery } from 'react-query';

const useSuppliers = () => {
  return useQuery('suppliers', fetchSuppliers, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

---

## 🧪 Pre-Deployment Testing

### Automated Testing
```bash
# Run all tests before deployment
npm run lint
npm run type-check
npm run test
npm run build

# Test endpoints
node test-endpoints.js
```

### Manual Testing Checklist
- [ ] All navigation routes work
- [ ] Authentication flow works
- [ ] CRUD operations function
- [ ] Responsive design on mobile
- [ ] No console errors
- [ ] Performance is acceptable

### Production Validation
```bash
# After deployment, test production URL
curl -I https://your-app.vercel.app

# Check all routes
curl https://your-app.vercel.app/dashboard
curl https://your-app.vercel.app/destinations
# ... test all routes
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Example)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: |
          npm run lint
          npm run type-check
          npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Stages
1. **Code Push** → Trigger CI/CD
2. **Tests** → Lint, TypeScript, Unit tests
3. **Build** → Create production bundle
4. **Deploy** → Push to hosting platform
5. **Verify** → Health checks and smoke tests

---

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

#### Supabase Connection Issues
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     "$VITE_SUPABASE_URL/rest/v1/destinations"
```

#### Runtime Errors
```javascript
// Check browser console for errors
// Common issues:
// - Missing environment variables
// - CORS issues
// - Authentication problems
// - Network connectivity
```

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev

# Check network requests in browser DevTools
# Verify Supabase requests are successful
```

---

## 📈 Monitoring & Maintenance

### Health Checks
```bash
# Automated health check script
#!/bin/bash
URL="https://your-app.vercel.app"

# Check if app is responding
if curl -f $URL > /dev/null 2>&1; then
  echo "✅ App is healthy"
else
  echo "❌ App is down"
  # Send alert
fi
```

### Performance Monitoring
- Use Vercel Analytics
- Monitor Core Web Vitals
- Track error rates
- Monitor API response times

### Maintenance Tasks
- Update dependencies monthly
- Review security vulnerabilities
- Monitor database performance
- Backup critical data
- Review and rotate API keys

---

## 📞 Support

### Deployment Issues
1. Check this deployment guide
2. Review error logs in hosting platform
3. Verify environment variables
4. Test locally first
5. Check Supabase dashboard for issues

### Emergency Procedures
- **Rollback**: Revert to previous deployment
- **Hotfix**: Deploy critical fixes immediately
- **Maintenance**: Schedule downtime for major updates

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

For deployment assistance, consult the troubleshooting section or check the hosting platform's documentation.