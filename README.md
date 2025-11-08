# Next-Gen CRM System

A modern, scalable Customer Relationship Management (CRM) platform built for fast-scaling startups. Features real-time insights, automated workflows, and collaborative tools - all in one place.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue.svg)](https://www.typescriptlang.org/)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start with Docker](#quick-start-with-docker)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Quick Start with Docker 🐳

The fastest way to get started! Requires only Docker installed.

```bash
# Clone the repository
git clone <your-repo-url>
cd MastersUnion

# Copy environment template
cp .env.docker.example .env

# Start with one command (Windows PowerShell)
.\docker-start.ps1

# Or on Linux/Mac
chmod +x docker-start.sh
./docker-start.sh
```

Access the application at **http://localhost** 🎉

**Default Credentials:**
- Admin: `admin@crm.com` / `Admin@123`
- Manager: `manager@crm.com` / `Manager@123`
- Sales: `sales@crm.com` / `Sales@123`

📖 **Detailed Guide**: See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete Docker documentation.

---

## Features

### Core Features

- **Authentication & Role Management**
  - JWT-based authentication with secure token management
  - Role-based access control (Admin, Manager, Sales Executive)
  - Protected routes and API endpoints

- **Lead Management**
  - Complete CRUD operations for leads
  - Lead ownership tracking
  - Status pipeline management (NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST)
  - Priority levels and tags
  - Full activity history trail

- **Activity Timeline**
  - Detailed logging of notes, calls, meetings, emails
  - Status change tracking
  - Duration and outcome recording
  - Real-time updates

- **Task Management**
  - Create and assign tasks to team members
  - Due date tracking
  - Priority management
  - Task status workflow

- **Real-time Notifications**
  - WebSocket-based instant notifications
  - Lead assignment alerts
  - Task reminders
  - Status change notifications

- **Dashboard & Analytics**
  - Performance metrics visualization
  - Lead conversion funnel
  - Revenue tracking
  - Team performance indicators
  - Interactive charts using Chart.js

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Bcrypt
- **Validation**: Zod
- **Real-time**: Socket.io
- **Testing**: Jest + Supertest
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
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

### Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/p4r1ch4y/crm-system.git
   cd crm-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/health

### Default Test Accounts

After seeding the database, use these accounts to login:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crm.com | Admin@123 |
| Manager | manager@crm.com | Manager@123 |
| Sales Executive 1 | sales1@crm.com | Sales@123 |
| Sales Executive 2 | sales2@crm.com | Sales@123 |

## Installation

### Backend Setup

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

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Project Structure

```
crm-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Type definitions
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── socket/           # WebSocket handlers
│   │   ├── utils/            # Helper functions
│   │   └── server.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Database migrations
│   │   └── seed.ts           # Seed data
│   ├── tests/                # Test files
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── common/       # Shared components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   ├── leads/        # Lead components
│   │   │   ├── activities/   # Activity components
│   │   │   └── tasks/        # Task components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux store
│   │   │   └── slices/       # Redux slices
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helper functions
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docker/
│   ├── docker-compose.yml
│   └── .env.example
│
├── db/
│   ├── ERD.png              # Entity Relationship Diagram
│   └── README.md            # Database documentation
│
└── README.md
```

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
