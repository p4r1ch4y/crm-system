# � Render Deployment Guide

Complete guide for deploying SmartCRM Pro to Render.com with Supabase PostgreSQL.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Supabase Setup](#supabase-setup)
- [Render Configuration](#render-configuration)
- [Deployment Steps](#deployment-steps)
- [Environment Variables](#environment-variables)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)
- [Local Docker Development](#local-docker-development)

---

## 🌟 Overview

**Production Stack:**
- **Frontend**: Render Static Site (Nginx)
- **Backend**: Render Web Service (Node.js)
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Auth**: JWT (future: Supabase Auth)

**Why This Stack?**
- ✅ Zero-cost tier for small projects
- ✅ Automatic HTTPS/SSL
- ✅ Auto-deploy from GitHub
- ✅ Global CDN for frontend
- ✅ Managed database with backups
- ✅ Built-in monitoring and logs

---

## 🔧 Prerequisites

- **GitHub Account**: Repository hosting
- **Render Account**: Sign up at [render.com](https://render.com)
- **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
- **Git**: For version control

---

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Configure:
   - **Name**: `smartcrm-pro`
   - **Database Password**: Generate strong password (save securely!)
   - **Region**: Select closest to your users (e.g., `us-east-1`)
   - **Plan**: Free tier
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Connection Details

1. Navigate to **Settings** → **Database**
2. Copy **Connection String** (URI format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
3. Save for later (you'll add this to Render environment variables)

### Step 3: Configure Database

```bash
# Install Supabase CLI (optional, for local testing)
npm install -g supabase

# Or use Prisma directly
cd backend
npx prisma migrate deploy
npx prisma db seed
```

---

## ☁️ Render Configuration

### Architecture on Render

```
┌─────────────────────────────────────┐
│    Render Infrastructure            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Frontend Static Site       │   │
│  │  (Nginx + React Build)      │   │
│  │  smartcrm.onrender.com      │   │
│  └─────────────────────────────┘   │
│               │                     │
│               ▼                     │
│  ┌─────────────────────────────┐   │
│  │  Backend Web Service        │   │
│  │  (Node.js + Express)        │   │
│  │  smartcrm-api.onrender.com  │   │
│  └─────────────────────────────┘   │
│               │                     │
└───────────────┼─────────────────────┘
                │
                ▼
    ┌───────────────────────────┐
    │   Supabase PostgreSQL     │
    │   db.xxx.supabase.co      │
    └───────────────────────────┘
```

---

## � Deployment Steps

### Part 1: Deploy Backend Service

1. **Login to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Connect your GitHub account

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub repository: `your-username/crm-system`
   - Configure:
     ```
     Name: smartcrm-backend
     Region: Oregon (US West) or closest
     Branch: main
     Root Directory: backend
     Runtime: Node
     Build Command: npm install && npx prisma generate && npm run build
     Start Command: npm run start
     ```

3. **Add Environment Variables**
   Click **"Advanced"** → **"Add Environment Variable"**:
   
   ```env
   NODE_ENV=production
   PORT=5000
   
   # Database (from Supabase)
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   
   # JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   JWT_SECRET=your_generated_secret_here
   
   # CORS (will be your frontend URL)
   CORS_ORIGIN=https://smartcrm.onrender.com
   
   # Optional: Integrations
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   HUBSPOT_API_KEY=your_hubspot_key
   ```

4. **Deploy**
   - Click **"Create Web Service"**
   - Render will build and deploy automatically
   - Wait for "Live" status (~3-5 minutes)

5. **Run Database Migrations**
   Once deployed, open **Shell** tab and run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Part 2: Deploy Frontend Static Site

1. **Create Static Site**
   - Click **"New +"** → **"Static Site"**
   - Select same GitHub repository
   - Configure:
     ```
     Name: smartcrm-frontend
     Branch: main
     Root Directory: frontend
     Build Command: npm install && npm run build
     Publish Directory: dist
     ```

2. **Add Environment Variables**
   ```env
   VITE_API_URL=https://smartcrm-backend.onrender.com/api/v1
   VITE_SOCKET_URL=https://smartcrm-backend.onrender.com
   ```

3. **Deploy**
   - Click **"Create Static Site"**
   - Render will build and deploy
   - Get your URL: `https://smartcrm.onrender.com`

4. **Update Backend CORS**
   - Go back to backend service
   - Update `CORS_ORIGIN` environment variable with frontend URL
   - Trigger manual deploy to apply changes

---

## 🔐 Environment Variables

### Complete Backend Environment

```env
# Node Environment
NODE_ENV=production
PORT=5000

# Database - Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# JWT Authentication
JWT_SECRET=your_generated_32_char_secret_here
JWT_EXPIRES_IN=24h

# CORS - Frontend URL
CORS_ORIGIN=https://smartcrm.onrender.com

# Integrations (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
HUBSPOT_API_KEY=your_hubspot_api_key

# Email Service (Future - using Supabase)
EMAIL_ENABLED=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Logging
LOG_LEVEL=info
```

### Complete Frontend Environment

```env
# API Endpoints
VITE_API_URL=https://smartcrm-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://smartcrm-backend.onrender.com

# Application
VITE_APP_NAME=SmartCRM Pro
VITE_ENV=production
```

### Generate Secure Secrets

```bash
# Generate JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generate JWT secret (Linux/Mac)
openssl rand -base64 32
```

---

## 📊 Monitoring & Logs

### Render Dashboard

**View Logs:**
1. Navigate to your service (Backend or Frontend)
2. Click **"Logs"** tab
3. View real-time logs or filter by date

**Metrics:**
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

### Health Checks

Render automatically monitors health endpoints:

```bash
# Backend health check
curl https://smartcrm-backend.onrender.com/health

# Response:
# {"status":"success","timestamp":"2025-11-09T...","db":"ok"}
```

### Alerts

Set up alerts in Render:
1. Go to service settings
2. Navigate to **"Notifications"**
3. Add email/Slack webhook for:
   - Deploy failures
   - Service downtime
   - High error rates

---

## 🐛 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check build logs in Render dashboard
# Common fixes:
- Ensure package.json has all dependencies
- Verify Node version compatibility (18.x)
- Check for TypeScript errors: npm run build
```

**2. Database Connection Errors**
```bash
# Verify Supabase connection:
- Check DATABASE_URL is correct
- Ensure password has no special characters or is URL-encoded
- Verify Supabase project is active (not paused)
- Test connection: npx prisma db execute --stdin < test.sql
```

**3. CORS Errors**
```bash
# Update CORS_ORIGIN in backend:
CORS_ORIGIN=https://your-frontend.onrender.com

# Redeploy backend service
```

**4. Migration Failures**
```bash
# Use Shell tab in Render backend:
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
```

**5. Frontend Not Connecting to Backend**
```bash
# Check VITE_API_URL in frontend environment:
VITE_API_URL=https://smartcrm-backend.onrender.com/api/v1

# Rebuild frontend static site
```

### Performance Issues

**Slow API Responses:**
- Upgrade Render plan (free tier has limited CPU)
- Enable Supabase read replicas
- Add Redis caching layer
- Optimize database queries with indexes

**Free Tier Spin-Down:**
- Free Render services sleep after 15 min inactivity
- Upgrade to Starter plan for 24/7 uptime
- Use cron job to ping every 10 minutes (temporary fix)

---

## 🔄 Continuous Deployment

### Auto-Deploy from GitHub

Render automatically deploys when you push to main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render deploys automatically in ~2-3 minutes
```

### Manual Deploy

Trigger manual deploy in Render dashboard:
1. Go to service page
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Deploy Hooks

Get webhook URL for external triggers:
1. Service Settings → **"Deploy Hook"**
2. Copy webhook URL
3. Use in CI/CD or external services:

```bash
curl -X POST https://api.render.com/deploy/srv-xxxx?key=yyyy
```

---

## 🏠 Local Docker Development

For local development, you can still use Docker Compose:

### Quick Start

```powershell
# Clone repository
git clone https://github.com/your-username/crm-system
cd MastersUnion

# Create environment file
cp .env.example .env

# Update .env with local database
DATABASE_URL="postgresql://postgres:password@postgres:5432/crm_db?schema=public"

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Postgres: localhost:5432
```

### Docker Commands Reference

```bash
# Build and start
docker-compose up --build -d

# Stop all services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend npm run test

# Access database shell
docker-compose exec postgres psql -U postgres -d crm_db

# Run migrations
docker-compose exec backend npx prisma migrate dev
```

### Local vs Production

| Feature | Local Docker | Render Production |
|---------|--------------|-------------------|
| Database | Docker PostgreSQL | Supabase PostgreSQL |
| SSL | No | Automatic |
| Scaling | Single instance | Auto-scaling |
| Backups | Manual | Automatic daily |
| Domain | localhost | Custom domain |
| Cost | Free | Free tier available |

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma on Render](https://render.com/docs/deploy-prisma)
- [Static Site Deployment](https://render.com/docs/static-sites)

---

## ✅ Production Checklist

Before going live:

**Security:**
- [ ] All secrets stored in Render environment variables (not in code)
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database password is strong
- [ ] CORS configured with frontend domain only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers active

**Database:**
- [ ] Supabase backups enabled
- [ ] Connection pooling configured
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Initial admin user created
- [ ] Database indexes verified

**Monitoring:**
- [ ] Render health checks passing
- [ ] Error tracking configured (Sentry optional)
- [ ] Logging properly configured
- [ ] Alerts set up for failures

**Performance:**
- [ ] Frontend assets minified and optimized
- [ ] Database queries optimized
- [ ] Render instance size appropriate
- [ ] CDN configured for static assets

**Testing:**
- [ ] All API endpoints tested
- [ ] Frontend-backend integration tested
- [ ] Authentication flow tested
- [ ] Real-time WebSocket tested
- [ ] Mobile responsiveness verified

---

## 🎯 Next Steps

1. **Custom Domain**: Configure custom domain in Render settings
2. **Analytics**: Add Google Analytics or Plausible
3. **Error Tracking**: Integrate Sentry for error monitoring
4. **Backup Strategy**: Schedule Supabase backup exports
5. **Performance Monitoring**: Use Render metrics or APM tools
6. **Load Testing**: Test with tools like k6 or Artillery

# Remove port exposure for internal services
postgres:
  # ports:
  #   - "5432:5432"  # Comment out in production
```

### 4. Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 📊 Monitoring

### Logs

```bash
# Export logs
docker-compose logs > logs.txt

# Real-time logs
docker-compose logs -f --tail=100

# Filter logs
docker-compose logs backend | grep ERROR
```

### Metrics

```bash
# Container stats
docker stats

# Detailed info
docker-compose exec backend node -e "console.log(process.memoryUsage())"
```

## 🔄 Updates and Rollbacks

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or for zero-downtime
docker-compose up -d --no-deps --build backend
```

### Rollback

```bash
# Stop services
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose up -d --build
```

## 📝 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure ports are not in use
4. Check Docker daemon is running
5. Review [Troubleshooting](#troubleshooting) section

---

**Note**: For production deployments, always use HTTPS, strong passwords, and regular backups!
