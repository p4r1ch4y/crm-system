# Database Setup Guide

## Quick Setup Steps

### Step 1: Update Database Credentials

1. Open `backend\.env` file
2. Find the line: `DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/crm_db?schema=public"`
3. Replace `your_postgres_password` with your actual PostgreSQL password

**Example:**
```
DATABASE_URL="postgresql://postgres:MyPassword123@localhost:5432/crm_db?schema=public"
```

### Step 2: Create the Database

Open PowerShell and run:

```powershell
# Option 1: Using psql command (if in PATH)
psql -U postgres -c "CREATE DATABASE crm_db;"

# Option 2: Using pgAdmin
# - Open pgAdmin
# - Right-click on "Databases" → Create → Database
# - Name: crm_db
# - Click Save
```

### Step 3: Run Prisma Migrations

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Alternative: Quick Database Setup Script

Run this in PowerShell (backend directory):

```powershell
# Set your PostgreSQL password
$PG_PASSWORD = "your_actual_password"

# Update .env file
$envContent = Get-Content .env -Raw
$envContent = $envContent -replace 'your_postgres_password', $PG_PASSWORD
$envContent | Set-Content .env

# Create database (this will prompt for password)
Write-Output "Creating database..."
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE crm_db;"

# Run migrations
Write-Output "Running migrations..."
npx prisma generate
npx prisma migrate dev --name init

# Seed database
Write-Output "Seeding database..."
npx prisma db seed

Write-Output "Database setup complete!"
```

## Troubleshooting

### Error: "password authentication failed"
- Double-check your PostgreSQL password
- Try resetting it in pgAdmin or during PostgreSQL reinstall

### Error: "database crm_db does not exist"
- Create the database first using pgAdmin or psql command

### Error: "role postgres does not exist"
- Your PostgreSQL user might have a different name
- Check pgAdmin to see available users

## Test Connection

After setup, test the connection:

```powershell
cd backend
npx prisma studio
```

This should open a browser with your database viewer if the connection works!

## Default Test Users (After Seeding)

After running `npx prisma db seed`, you'll have these users:

| Email | Password | Role |
|-------|----------|------|
| admin@crm.com | Admin@123 | ADMIN |
| manager@crm.com | Manager@123 | MANAGER |
| sales1@crm.com | Sales@123 | SALES_EXECUTIVE |
| sales2@crm.com | Sales@123 | SALES_EXECUTIVE |
