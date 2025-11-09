# SmartCRM Pro - Next-Gen CRM System

A modern, cloud-native Customer Relationship Management (CRM) platform built for fast-scaling fitness businesses and startups. Features real-time insights, automated workflows, marketing landing page, and third-party integrations.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/supabase-postgres-3ecf8e.svg)](https://supabase.com)
[![Render](https://img.shields.io/badge/deploy-render-46E3B7.svg)](https://render.com)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Local Development](#local-development)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)

## Architecture

SmartCRM Pro uses a modern three-tier cloud-native architecture:

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   React SPA      │ ───── │  Express API     │ ───── │  Supabase        │
│   (Render)       │       │  (Render)        │       │  PostgreSQL      │
│   Static Site    │       │  Web Service     │       │  + Auth/Storage  │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

**Production Stack:**
- **Frontend**: Render Static Site (React + Vite + Nginx)
- **Backend**: Render Web Service (Node.js + Express)
- **Database**: Supabase PostgreSQL (managed, with backups)
- **Storage**: Supabase Storage (future: file uploads)
- **Auth**: JWT (future migration to Supabase Auth)
- **Email**: Supabase Email Service (future)

📐 **Detailed Architecture**: See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, ER diagrams, and workflow diagrams.

---

## Quick Start

### Option 1: Production Deploy (Recommended)

Deploy to Render + Supabase in minutes:

1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project, save database password
   - Copy connection string

2. **Deploy to Render**
   ```bash
   # Fork this repository on GitHub
   # Go to render.com dashboard
   # Connect GitHub repository
   # Deploy backend + frontend (see detailed guide)
   ```

3. **Access Your CRM**
   - Frontend: `https://smartcrm.onrender.com`
   - Backend API: `https://smartcrm-backend.onrender.com`

📖 **Complete Guide**: [DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md) (now covers Render deployment)

### Option 2: Local Development with Docker

For local development:

```bash
# Clone repository
git clone https://github.com/your-username/crm-system
cd MastersUnion

# Start local environment
docker-compose up -d

# Access at http://localhost:3000
```

**Default Credentials:**
- Admin: `admin@crm.com` / `Admin@123`
- Manager: `manager@crm.com` / `Manager@123`
- Sales: `sales1@crm.com` / `Sales@123`

## Features

### Core CRM Features

- **🔐 Authentication & Role Management**
  - JWT-based authentication with secure token management
  - Role-based access control (Admin, Manager, Sales Executive)
  - Protected routes and API endpoints
  - Future: Supabase Auth integration

- **👥 Lead Management**
  - Complete CRUD operations for leads
  - Lead ownership and assignment
  - Status pipeline (NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST)
  - Priority levels, tags, and value tracking
  - Full activity history trail

- **📋 Activity Timeline**
  - Detailed logging of notes, calls, meetings, emails
  - Status change tracking
  - Duration and outcome recording
  - Real-time updates via WebSocket

- **✅ Task Management**
  - Create and assign tasks to team members
  - Due date tracking and reminders
  - Priority management (LOW, MEDIUM, HIGH, URGENT)
  - Task status workflow (TODO → IN_PROGRESS → COMPLETED → CANCELLED)

- **🔔 Real-time Notifications**
  - WebSocket-based instant notifications
  - Lead assignment alerts
  - Task deadline reminders
  - Status change notifications
  - System announcements

- **📊 Dashboard & Analytics**
  - Performance metrics visualization
  - Lead conversion funnel analysis
  - Revenue tracking by status
  - Team performance indicators
  - Interactive charts (Chart.js)

### Bonus Features

- **🎨 Marketing Landing Page**
  - Modern, responsive hero section
  - Feature showcase with animations
  - Benefits & use cases
  - Product roadmap timeline
  - CTA sections for lead capture

- **🔌 Third-Party Integrations**
  - Slack webhook notifications
  - Inbound webhook receiver
  - HubSpot API ready (placeholder)
  - Extensible integration framework

- **📝 Comprehensive Logging**
  - Winston logger with multiple transports
  - HTTP request/response logging
  - Error tracking and stack traces
  - Audit middleware for sensitive operations
  - Log viewing API endpoint

- **🧪 Automated Testing**
  - 91+ Jest test cases
  - Unit tests for controllers and services
  - Integration tests for API endpoints
  - GitHub Actions CI/CD pipeline
  - Code coverage reports

## Tech Stack

### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.3
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma (with connection pooling)
- **Authentication**: JWT + Bcrypt
- **Validation**: Zod schemas
- **Real-time**: Socket.io
- **HTTP Client**: Axios
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Security**: Helmet.js, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 5.x
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Charts**: Chart.js
- **Real-time**: Socket.io Client

### Infrastructure & DevOps
- **Hosting**: Render (Frontend Static Site + Backend Web Service)
- **Database**: Supabase (PostgreSQL + Auth + Storage + Email)
- **Local Dev**: Docker Compose (PostgreSQL + Backend + Frontend)
- **CI/CD**: GitHub Actions
- **Version Control**: Git + GitHub
- **Container**: Docker (multi-stage builds)
- **Charts**: Chart.js + React-Chartjs-2
- **Notifications**: React Hot Toast
- **Real-time**: Socket.io Client

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for frontend)
- **Process Management**: PM2 (optional)

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                 │         │                  │         │                  │
│  React Frontend │◄───────►│  Express Backend │◄───────►│   PostgreSQL     │
│  (Port 3000)    │         │   (Port 5000)    │         │   (Port 5432)    │
│                 │         │                  │         │                  │
└────────┬────────┘         └────────┬─────────┘         └──────────────────┘
         │                           │
         │      WebSocket            │
         └───────────────────────────┘
```

### Design Patterns
- **MVC Architecture**: Clean separation of concerns
- **Repository Pattern**: Database abstraction layer
- **Middleware Pattern**: Request validation, authentication, error handling
- **Observer Pattern**: Real-time notifications via WebSockets

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm or yarn
- Docker (optional, for containerized deployment)

---

## Production Deployment

### Deploy to Render + Supabase

**Step 1: Create Supabase Database**

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project → Save database password
3. Get connection string from Settings → Database
4. Copy: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

**Step 2: Deploy Backend to Render**

1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
4. Add environment variables (see below)
5. Deploy! (takes ~3-5 minutes)

**Step 3: Deploy Frontend to Render**

1. New Static Site on Render
2. Same GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api/v1
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. Deploy!

**Step 4: Run Database Migrations**

In Render backend service shell:
```bash
npx prisma migrate deploy
npx prisma db seed
```

📖 **Complete Deployment Guide**: [docs/DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)

---

## Local Development

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/p4r1ch4y/crm-system.git
cd MastersUnion

# Start all services (Postgres + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Option 2: Manual Setup

**1. Clone Repository**
```bash
git clone https://github.com/p4r1ch4y/crm-system.git
cd MastersUnion
```

**2. Setup Supabase (or local PostgreSQL)**
```bash
# Option A: Use Supabase (recommended)
# Create project at supabase.com, get connection string

# Option B: Local PostgreSQL
# Start PostgreSQL server (port 5432)
# Create database: CREATE DATABASE crm_db;
```

**3. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your database URL
# Supabase: DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
# Local: DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_db"

npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

**4. Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env

# Edit .env
# VITE_API_URL=http://localhost:5000/api/v1
# VITE_SOCKET_URL=http://localhost:5000

npm run dev
```

**5. Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

### Default Test Accounts

After seeding the database (`npx prisma db seed`):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crm.com | Admin@123 |
| Manager | manager@crm.com | Manager@123 |
| Sales Executive 1 | sales1@crm.com | Sales@123 |
| Sales Executive 2 | sales2@crm.com | Sales@123 |

---

## Installation

### System Requirements

- **Node.js**: 20.0.0 or higher (LTS recommended)
- **npm**: 9.0.0 or higher
- **PostgreSQL**: 15+ (Supabase handles this in production)
- **Docker**: 20.10+ (for local development only)

### Backend Setup Details

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────┐          ┌──────────────┐
│    User     │          │     Lead     │          │   Activity   │
├─────────────┤          ├──────────────┤          ├──────────────┤
│ id (PK)     │◄─────────│ ownerId (FK) │◄─────────│ leadId (FK)  │
│ email       │          │ createdById  │          │ userId (FK)  │
│ password    │          ├──────────────┤          ├──────────────┤
│ firstName   │          │ firstName    │          │ type         │
│ lastName    │          │ lastName     │          │ subject      │
│ role        │          │ email        │          │ description  │
│ phone       │          │ company      │          │ duration     │
│ avatar      │          │ status       │          │ outcome      │
│ isActive    │          │ priority     │          │ scheduledAt  │
└─────────────┘          │ value        │          └──────────────┘
       │                 │ tags         │                 
       │                 └──────────────┘                 
       │                        │                         
       │                        │                         
       └────────────────────────┼─────────────────────────
                                │                         
                         ┌──────────────┐          
                         │     Task     │          
                         ├──────────────┤          
                         │ id (PK)      │          
                         │ title        │          
                         │ description  │          
                         │ status       │          
                         │ priority     │          
                         │ dueDate      │          
                         │ leadId (FK)  │          
                         │ assignedTo   │          
                         │ createdById  │          
                         └──────────────┘          
```

### Key Tables

- **users**: User accounts with role-based permissions
- **leads**: Customer leads with full lifecycle tracking
- **activities**: Activity timeline and interaction history
- **tasks**: Task management and assignments
- **notifications**: Real-time notification system

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "SALES_EXECUTIVE"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "SALES_EXECUTIVE"
    },
    "accessToken": "jwt_token_here"
  }
}
```

#### POST /auth/login
Login to get access token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

### Lead Endpoints

### Integrations (Bonus)

These endpoints provide integration capabilities with third-party systems such as Slack. Additional platforms (HubSpot, etc.) can be added following this pattern.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/integrations/status | Returns integration configuration status (Slack, HubSpot placeholder, webhook capability) | User |
| POST | /api/v1/integrations/slack/test | Sends a test message to the configured Slack webhook | User |
| POST | /api/v1/integrations/webhook/inbound | Public inbound webhook receiver (echoes received payload) | Public |

#### Slack Integration

Configure an Incoming Webhook URL in environment variable `SLACK_WEBHOOK_URL`.

Example test request:

```
POST /api/v1/integrations/slack/test
Content-Type: application/json

{
  "text": "Deployment completed successfully!"
}
```

#### Inbound Webhook Payload Example

```
POST /api/v1/integrations/webhook/inbound
Content-Type: application/json

{
  "event": "lead.created",
  "source": "partner-system",
  "payload": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Future (Planned)
* HubSpot contact sync
* WhatsApp / SMS provider integration
* Custom workflow triggers to outbound webhooks

#### GET /leads
Get all leads with filtering and pagination

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `search` (string): Search by name, email, or company
- `sortBy` (string): Field to sort by
- `sortOrder` ('asc' | 'desc'): Sort direction

**Response:**
```json
{
  "status": "success",
  "data": {
    "leads": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

#### POST /leads
Create a new lead

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1234567890",
  "company": "TechCorp",
  "position": "CTO",
  "status": "NEW",
  "priority": "HIGH",
  "value": 50000,
  "description": "Interested in enterprise solution",
  "tags": ["enterprise", "technology"]
}
```

#### GET /leads/:id
Get lead by ID with full details

#### PATCH /leads/:id
Update lead

#### DELETE /leads/:id
Delete lead (Admin/Manager only)

### Activity Endpoints

#### GET /activities
Get activities with filters

#### POST /activities
Create new activity

#### PATCH /activities/:id
Update activity

#### DELETE /activities/:id
Delete activity

### Task Endpoints

#### GET /tasks
Get tasks with filters

#### POST /tasks
Create new task

#### PATCH /tasks/:id
Update task

#### DELETE /tasks/:id
Delete task

### Analytics Endpoints

#### GET /analytics/dashboard
Get dashboard analytics

#### GET /analytics/performance
Get performance metrics (Manager/Admin only)

#### GET /analytics/funnel
Get conversion funnel data

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

```
backend/tests/
├── auth.test.ts         # Authentication tests
├── lead.test.ts         # Lead management tests
├── activity.test.ts     # Activity tests
└── task.test.ts         # Task tests
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
cd docker

# Copy environment file
cp .env.example .env

# Edit .env with your configuration

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Manual Docker Build

```bash
# Build backend
docker build -t crm-backend ./backend

# Build frontend
docker build -t crm-frontend ./frontend

# Run PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15-alpine

# Run backend
docker run -d --name backend \
  --link postgres:postgres \
  -p 5000:5000 crm-backend

# Run frontend
docker run -d --name frontend \
  --link backend:backend \
  -p 3000:80 crm-frontend
```

## Environment Variables

### Backend Environment Variables

**Production (Render + Supabase):**

```env
# Node Environment
NODE_ENV=production
PORT=5000

# Supabase PostgreSQL Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# JWT Authentication
JWT_SECRET=your_generated_32_character_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Frontend URL
CORS_ORIGIN=https://smartcrm.onrender.com

# Integrations (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
HUBSPOT_API_KEY=your_hubspot_api_key

# Email Service (Future - Supabase)
EMAIL_ENABLED=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Logging
LOG_LEVEL=info
```

**Local Development:**

```env
NODE_ENV=development
PORT=5000

# Local PostgreSQL (Docker)
DATABASE_URL=postgresql://postgres:password@localhost:5432/crm_db?schema=public

# JWT
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Frontend Environment Variables

**Production (Render):**

```env
VITE_API_URL=https://smartcrm-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://smartcrm-backend.onrender.com
VITE_APP_NAME=SmartCRM Pro
VITE_ENV=production
```

**Local Development:**

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=SmartCRM Pro (Dev)
VITE_ENV=development
```

### Generate Secure Secrets

```bash
# Generate JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## Project Structure

```
smartcrm-pro/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers (auth, leads, tasks, analytics, integrations)
│   │   ├── middleware/       # Auth, validation, error handling, audit logging
│   │   ├── models/           # TypeScript type definitions
│   │   ├── routes/           # Express API routes
│   │   ├── services/         # Business logic (Slack, email, etc.)
│   │   ├── socket/           # WebSocket handlers (real-time notifications)
│   │   ├── utils/            # Helper functions (logger, validators)
│   │   └── server.ts         # Express server entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (5 models, enums)
│   │   ├── migrations/       # Prisma migrations
│   │   └── seed.ts           # Test user seed data
│   ├── tests/                # Jest test files (91 tests)
│   ├── logs/                 # Winston log files
│   ├── Dockerfile            # Multi-stage Docker build
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Reusable UI components (MainLayout, Sidebar, Navbar)
│   │   │   ├── dashboard/    # Dashboard charts and metrics
│   │   │   ├── leads/        # Lead management components
│   │   │   ├── activities/   # Activity timeline
│   │   │   └── tasks/        # Task management
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Marketing landing page
│   │   │   ├── IntegrationsPage.tsx # Third-party integrations UI
│   │   │   ├── DashboardPage.tsx    # Analytics dashboard
│   │   │   ├── LeadsPage.tsx        # Lead management
│   │   │   └── ... (login, register, tasks, activities)
│   │   ├── store/            # Redux Toolkit store
│   │   │   └── slices/       # Auth, leads, tasks, notifications slices
│   │   ├── services/         # Axios API clients
│   │   ├── hooks/            # Custom React hooks (useAuth, useSocket)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Helper functions
│   │   ├── App.tsx           # Root component with routing
│   │   └── main.tsx          # Entry point
│   ├── public/
│   │   └── favicon.svg       # Custom gradient Zap icon favicon
│   ├── Dockerfile            # Multi-stage build (Node + Nginx)
│   ├── nginx.conf            # Nginx config for SPA
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docs/                     # Comprehensive documentation
│   ├── ARCHITECTURE.md       # System design, ER diagrams, workflows (NEW)
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   ├── DATABASE_SETUP.md     # Supabase + local setup
│   ├── DOCKER_DEPLOYMENT.md  # Render deployment guide (updated)
│   ├── SETUP_GUIDE.md        # Installation instructions
│   ├── TESTING_GUIDE.md      # Testing strategy
│   └── LOGGING_IMPLEMENTATION.md  # Winston logging docs
│
├── docker/
│   └── docker-compose.yml    # Local development stack
│
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD
│
├── db/
│   ├── ERD.png               # Entity Relationship Diagram
│   └── README.md
│
├── docker-compose.yml        # Root compose file (Postgres + Backend + Frontend)
├── .env.example              # Environment template
└── README.md                 # This file
│
├── db/
│   ├── ERD.png              # Entity Relationship Diagram
│   └── README.md            # Database documentation
│
└── README.md
```

## Documentation

All detailed documentation has been organized in the `/docs` directory for easy access:

- **[Setup Guide](docs/SETUP_GUIDE.md)** - Comprehensive installation and configuration instructions
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Database Setup](docs/DATABASE_SETUP.md)** - Database configuration, schema, and migrations
- **[Docker Deployment](docs/DOCKER_DEPLOYMENT.md)** - Docker deployment and container management
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing strategy, implementation, and running tests
- **[Logging Implementation](docs/LOGGING_IMPLEMENTATION.md)** - Logging architecture and best practices

## Key Features Implementation

### Clean Code Standards

- **TypeScript**: Strict type checking for both frontend and backend
- **ESLint**: Code quality enforcement
- **Modular Architecture**: Separation of concerns
- **Error Handling**: Centralized error middleware
- **Logging**: Winston for structured logging
- **Validation**: Zod schemas for request validation
- **Comments**: Clear documentation in code

### Security Features

- JWT-based authentication
- Password hashing with Bcrypt
- Rate limiting
- CORS protection
- Helmet.js security headers
- SQL injection protection via Prisma
- XSS protection

### Performance Optimizations

- Database indexing
- Pagination for large datasets
- Lazy loading components
- Memoization in React
- Connection pooling
- Caching strategies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for Masters' Union CRM Assessment
- Inspired by modern CRM best practices
- Community feedback and contributions

## Support

For support, email support@crm-system.com or open an issue in the repository.

---

**Note**: This project is created as part of Masters' Union Assessment for demonstrating full-stack development capabilities with modern technologies and best practices.
