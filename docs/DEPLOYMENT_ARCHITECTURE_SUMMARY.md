# Deployment Architecture Summary

## Overview

SmartCRM Pro is a cloud-native CRM system designed for production deployment on **Render** with **Supabase** as the managed PostgreSQL database.

## Production Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Render                          │
│                                                     │
│  ┌──────────────────┐    ┌──────────────────┐      │
│  │  Static Site     │    │  Web Service     │      │
│  │  (Frontend)      │───▶│  (Backend API)   │      │
│  │  Nginx + React   │    │  Node.js         │      │
│  └──────────────────┘    └────────┬─────────┘      │
│                                   │                 │
└───────────────────────────────────┼─────────────────┘
                                    │
                                    ▼
                        ┌────────────────────┐
                        │    Supabase        │
                        │   PostgreSQL       │
                        │   + Auth + Email   │
                        └────────────────────┘
```

## Technology Stack

### Frontend Deployment
- **Platform**: Render Static Site
- **Server**: Nginx (auto-configured)
- **CDN**: Render Global CDN
- **SSL**: Automatic HTTPS
- **URL**: `https://smartcrm.onrender.com`

### Backend Deployment
- **Platform**: Render Web Service
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **SSL**: Automatic HTTPS
- **URL**: `https://smartcrm-backend.onrender.com`

### Database
- **Platform**: Supabase
- **Engine**: PostgreSQL 15
- **Features**: 
  - Automatic backups
  - Connection pooling (PgBouncer)
  - Real-time database subscriptions
  - Built-in authentication service
  - Email service
  - File storage
- **Location**: US East (configurable)

## Deployment Flow

1. **Developer pushes to GitHub `main` branch**
2. **GitHub Actions CI runs:**
   - TypeScript compilation
   - Jest tests (91 tests)
   - Build validation
3. **Render auto-deploys:**
   - Frontend: Builds React app → Nginx static files
   - Backend: Installs deps → Prisma generate → TypeScript build → Start server
4. **Health checks verify deployment**
5. **Application is live**

## Environment Configuration

### Backend (Render Web Service)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
JWT_SECRET=<32-char-secret>
CORS_ORIGIN=https://smartcrm.onrender.com
```

### Frontend (Render Static Site)
```env
VITE_API_URL=https://smartcrm-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://smartcrm-backend.onrender.com
```

## Local Development

For local development, Docker Compose is used:

```bash
docker-compose up -d
# Runs: PostgreSQL + Backend + Frontend
# Access: http://localhost:3000
```

**Key Difference:**
- **Local**: Docker PostgreSQL container
- **Production**: Supabase managed PostgreSQL

## Scalability

### Current (Free Tier)
- Frontend: Global CDN, unlimited bandwidth
- Backend: 1 instance, sleeps after 15 min inactivity
- Database: 500MB storage, 2 connections

### Future Scaling
- **Backend**: Upgrade Render to Starter ($7/mo) for 24/7 uptime
- **Database**: Upgrade Supabase for more connections, storage
- **Caching**: Add Redis for API response caching
- **CDN**: Already included in Render Static Site

## Monitoring

### Render Dashboard
- Real-time logs
- CPU/Memory metrics
- Request counts
- Error tracking

### Supabase Dashboard
- Connection pooler status
- Query performance
- Database size
- Active connections

## Backup Strategy

### Database (Supabase)
- **Daily backups**: Automatic (retained 7 days on free tier)
- **Point-in-time recovery**: Upgrade plan feature
- **Manual exports**: Use Supabase dashboard

### Code (GitHub)
- **Version control**: All commits tracked
- **Deployment history**: Render keeps deployment logs

## Security

### SSL/TLS
- **Frontend**: Automatic HTTPS (Let's Encrypt)
- **Backend**: Automatic HTTPS (Let's Encrypt)
- **Database**: SSL enforced by Supabase

### Secrets Management
- **Render**: Environment variables encrypted
- **Supabase**: Connection strings in dashboard
- **GitHub**: Secrets for CI/CD

## Cost Estimate

### Free Tier (Current)
- Render Static Site: $0
- Render Web Service: $0 (with spin-down)
- Supabase: $0 (500MB database)
- **Total**: $0/month

### Production Tier (Recommended)
- Render Static Site: $0
- Render Web Service Starter: $7/month (24/7 uptime)
- Supabase Pro: $25/month (8GB database, better support)
- **Total**: $32/month

## Documentation Links

- **Architecture Details**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment Guide**: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **Database Setup**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Quick Deploy Checklist

- [ ] Create Supabase project
- [ ] Get database connection string
- [ ] Fork GitHub repository
- [ ] Create Render backend service
- [ ] Add environment variables
- [ ] Deploy backend
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed database: `npx prisma db seed`
- [ ] Create Render frontend static site
- [ ] Add frontend environment variables
- [ ] Deploy frontend
- [ ] Update backend CORS with frontend URL
- [ ] Test login with admin@crm.com
- [ ] Verify real-time notifications
- [ ] Test Slack integration (optional)

---

**Status**: Production-ready architecture documented and tested.

**Last Updated**: November 2025
