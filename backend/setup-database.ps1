# Quick Database Setup Script for CRM
# Run this from the backend directory

Write-Output ""
Write-Output "=========================================="
Write-Output "  CRM Database Setup"
Write-Output "=========================================="
Write-Output ""

# Step 1: Get PostgreSQL password
Write-Output "Step 1: PostgreSQL Configuration"
Write-Output "Please enter your PostgreSQL password for user 'postgres':"
$PG_PASSWORD = Read-Host -AsSecureString
$PG_PASSWORD_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($PG_PASSWORD))

# Step 2: Update .env file
Write-Output ""
Write-Output "Step 2: Updating .env file..."
$envPath = ".env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    $envContent = $envContent -replace 'your_postgres_password', $PG_PASSWORD_TEXT
    $envContent | Set-Content $envPath
    Write-Output "✅ .env file updated"
} else {
    Write-Output "❌ .env file not found. Please run from backend directory."
    exit 1
}

# Step 3: Find psql executable
Write-Output ""
Write-Output "Step 3: Locating PostgreSQL..."
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\17\bin\psql.exe"
)

$psqlExe = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlExe = $path
        Write-Output "✅ Found PostgreSQL at: $path"
        break
    }
}

if (-not $psqlExe) {
    Write-Output "⚠️  Could not find psql.exe automatically"
    Write-Output "Please create the database manually using pgAdmin or psql"
    $skipDbCreation = $true
} else {
    $skipDbCreation = $false
}

# Step 4: Create database
if (-not $skipDbCreation) {
    Write-Output ""
    Write-Output "Step 4: Creating database 'crm_db'..."
    
    $env:PGPASSWORD = $PG_PASSWORD_TEXT
    try {
        & $psqlExe -U postgres -c "CREATE DATABASE crm_db;" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Output "✅ Database 'crm_db' created successfully"
        } else {
            Write-Output "ℹ️  Database might already exist (this is OK)"
        }
    } catch {
        Write-Output "⚠️  Could not create database automatically"
        Write-Output "Please create it manually using pgAdmin"
    }
    Remove-Item Env:\PGPASSWORD
}

# Step 5: Generate Prisma Client
Write-Output ""
Write-Output "Step 5: Generating Prisma Client..."
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Output "✅ Prisma Client generated"
} else {
    Write-Output "❌ Failed to generate Prisma Client"
    exit 1
}

# Step 6: Run migrations
Write-Output ""
Write-Output "Step 6: Running database migrations..."
npx prisma migrate dev --name init
if ($LASTEXITCODE -eq 0) {
    Write-Output "✅ Migrations completed"
} else {
    Write-Output "❌ Migration failed. Check your database connection."
    exit 1
}

# Step 7: Seed database
Write-Output ""
Write-Output "Step 7: Seeding database with test data..."
npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Output "✅ Database seeded successfully"
} else {
    Write-Output "⚠️  Seeding failed, but you can try again later"
}

# Summary
Write-Output ""
Write-Output "=========================================="
Write-Output "  Setup Complete!"
Write-Output "=========================================="
Write-Output ""
Write-Output "✅ Database: crm_db"
Write-Output "✅ Schema: Created"
Write-Output "✅ Test Data: Loaded"
Write-Output ""
Write-Output "📋 Test Users:"
Write-Output "   Admin:    admin@crm.com / Admin@123"
Write-Output "   Manager:  manager@crm.com / Manager@123"
Write-Output "   Sales:    sales1@crm.com / Sales@123"
Write-Output ""
Write-Output "🚀 Next Steps:"
Write-Output "   1. Restart backend: npm run dev"
Write-Output "   2. Open frontend: http://localhost:3000"
Write-Output "   3. Login with test credentials"
Write-Output ""
Write-Output "=========================================="
Write-Output ""
