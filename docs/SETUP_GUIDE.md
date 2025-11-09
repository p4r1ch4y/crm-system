# SETUP GUIDE - Next-Gen CRM System

## Quick Setup Instructions

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed
- [ ] npm or yarn package manager

## Step 1: Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# Update .env file with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/crm_db

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with test data
npx prisma db seed

# Start the backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

## Step 2: Frontend Setup

```powershell
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

## Step 3: Testing the Application

1. Open browser and navigate to http://localhost:3000
2. Login with test credentials:
   - **Email**: sales1@crm.com
   - **Password**: Sales@123

## Alternative: Docker Setup

```powershell
# Navigate to docker directory
cd docker

# Copy environment file
Copy-Item .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Running Tests

### Backend Tests
```powershell
cd backend
npm test
```

### Check Code Quality
```powershell
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env file
3. Verify database credentials

### Port Conflicts
- Backend (5000): Change PORT in backend/.env
- Frontend (3000): Change port in frontend/vite.config.ts
- Database (5432): Change PostgreSQL port

### Dependencies Issues
```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Project URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **API Health Check**: http://localhost:5000/health
- **Prisma Studio**: Run `npx prisma studio` in backend directory

## Key Features to Test

1. **Authentication**
   - Login/Logout
   - Role-based access control

2. **Lead Management**
   - Create, view, update, delete leads
   - Filter and search leads
   - Change lead status

3. **Activity Timeline**
   - Add notes, calls, meetings
   - View activity history

4. **Task Management**
   - Create and assign tasks
   - Update task status

5. **Dashboard Analytics**
   - View metrics and charts
   - Monitor performance

## Next Steps

1. Explore the API documentation in README.md
2. Check database schema in db/README.md
3. Review code structure
4. Run tests to verify setup
5. Start building custom features!

## Support

If you encounter any issues:
1. Check the main README.md file
2. Review error logs
3. Ensure all environment variables are set correctly
4. Verify all services are running

---
**Happy Coding!** 🚀
