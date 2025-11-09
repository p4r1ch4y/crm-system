# Database Setup Guide

This guide covers database setup for both **production (Supabase)** and **local development** environments.

---

## Production Setup (Supabase) - Recommended

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: smartcrm-pro
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project" (takes ~2 minutes)

### Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Configure Backend Environment

1. Open `backend/.env` file
2. Update the `DATABASE_URL`:

```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Optional: Direct connection for migrations (no connection pooler)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

**Note**: Supabase uses connection pooling (PgBouncer). Use `DIRECT_URL` for migrations if needed.

### Step 4: Run Prisma Migrations

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy  # Use 'deploy' for production
npx prisma db seed
```

### Step 5: Verify Connection

```powershell
# Test database connection
npx prisma studio
```

Your browser should open with the Prisma Studio interface connected to Supabase!

---

## Local Development Setup (Docker PostgreSQL)

For local development without Supabase, you can use Docker PostgreSQL:

### Step 1: Start Docker PostgreSQL

```powershell
# Using docker-compose
docker-compose up -d postgres
```

### Step 2: Configure Local Database

1. Open `backend\.env` file
2. Update for local PostgreSQL:

```env
# Local PostgreSQL Connection
DATABASE_URL="postgresql://postgres:Testnet@1@localhost:5432/crm_db?schema=public"
```

**Note**: Password encoding required for special characters. `@` becomes `%40`:
```env
DATABASE_URL="postgresql://postgres:Testnet%401@postgres:5432/crm_db?schema=public"
```

### Step 3: Run Migrations Locally

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

---

## Supabase Additional Features

### Email Service (Supabase Auth)

Supabase provides built-in authentication with email templates:

```typescript
// Future enhancement: Use Supabase Auth SDK
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Send email verification
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

### Real-time Database

Enable real-time subscriptions for live updates:

1. In Supabase Dashboard → **Database** → **Replication**
2. Enable replication for tables: `leads`, `tasks`, `notifications`
3. Use Supabase Realtime:

```typescript
// Subscribe to lead changes
supabase
  .from('leads')
  .on('INSERT', payload => {
    console.log('New lead:', payload.new)
  })
  .subscribe()
```

### Storage (File Uploads)

Use Supabase Storage for user avatars and attachments:

1. Create storage bucket in Supabase Dashboard
2. Configure bucket policies
3. Upload files:

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-id/avatar.png', file)
```

---

## Database Schema Overview

The CRM database consists of 5 main tables:

```
Users (Authentication & RBAC)
  ├── Leads (Customer prospects)
  │     ├── Activities (Interactions timeline)
  │     └── Tasks (Action items)
  └── Notifications (Real-time alerts)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed ER diagrams and schema documentation.

---

## Troubleshooting

### Supabase Issues

**Error: "Can't reach database server"**
- Check your Supabase project is active (not paused due to inactivity)
- Verify DATABASE_URL has correct password and host
- Ensure IP allowlist includes your deployment platform (Render auto-allowed)

**Error: "password authentication failed"**
- Double-check you replaced `[YOUR-PASSWORD]` in connection string
- Verify password in Supabase Dashboard → Settings → Database
- Try resetting database password

**Connection Pooling Issues**
- Use `?pgbouncer=true` for regular queries
- Use `DIRECT_URL` (without pgbouncer) for Prisma migrations
- Set `connection_limit=1` to prevent exhausting connections

### Local Docker Issues

**Error: "database crm_db does not exist"**
- Create the database first: `docker-compose exec postgres psql -U postgres -c "CREATE DATABASE crm_db;"`
- Or recreate containers: `docker-compose down -v && docker-compose up -d`

**Error: "role postgres does not exist"**
- Check docker-compose.yml for correct POSTGRES_USER
- Default user should be `postgres`

**Port Conflict (5432 already in use)**
- Stop local PostgreSQL service or change port mapping in docker-compose.yml

---

## Default Test Users (After Seeding)

After running `npx prisma db seed`, you'll have these users:

| Email | Password | Role |
|-------|----------|------|
| admin@crm.com | Admin@123 | ADMIN |
| manager@crm.com | Manager@123 | MANAGER |
| sales1@crm.com | Sales@123 | SALES_EXECUTIVE |
| sales2@crm.com | Sales@123 | SALES_EXECUTIVE |

---

## Migration Commands Reference

```powershell
# Generate Prisma Client
npx prisma generate

# Create new migration (development)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio

# Seed database with test data
npx prisma db seed

# View migration status
npx prisma migrate status
```

---

## Production Checklist

Before deploying to Render with Supabase:

- [ ] Supabase project created and active
- [ ] DATABASE_URL configured with Supabase connection string
- [ ] DIRECT_URL configured for migrations (if using connection pooler)
- [ ] Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Database seeded with initial admin user
- [ ] Connection pooling configured (`?pgbouncer=true`)
- [ ] SSL mode enabled (Supabase enforces SSL by default)
- [ ] Backup strategy configured in Supabase dashboard
- [ ] Monitoring alerts set up for connection pool exhaustion

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase + Prisma Integration Guide](https://supabase.com/docs/guides/integrations/prisma)

