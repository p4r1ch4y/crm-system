# 🐳 Docker Deployment Guide

Complete guide for containerizing and deploying the CRM system using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Docker Commands](#docker-commands)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## 🔧 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Installation

**Windows (PowerShell):**
```powershell
# Install Docker Desktop
winget install Docker.DockerDesktop

# Verify installation
docker --version
docker-compose --version
```

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## 🚀 Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd MastersUnion

# Create environment file
cp .env.docker.example .env

# Edit .env with your configuration
# On Windows: notepad .env
# On Linux: nano .env
```

### 2. Build and Run

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **PostgreSQL**: localhost:5432

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crm.com | Admin@123 |
| Manager | manager@crm.com | Manager@123 |
| Sales Executive | sales@crm.com | Sales@123 |

## ⚙️ Configuration

### Environment Variables

Edit `.env` file with your production values:

```env
# Database
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=crm_db

# Backend
JWT_SECRET=<generate-strong-secret-min-32-chars>
CORS_ORIGIN=http://localhost

# Frontend
VITE_API_URL=http://localhost:5000/api/v1

# Email (Optional)
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-specific-password>
```

### Generate Strong Secrets

```bash
# Generate JWT secret (Linux/Mac)
openssl rand -base64 32

# Generate JWT secret (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## 🎮 Docker Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Stop and remove volumes (DANGER: deletes data)
docker-compose down -v
```

### Individual Services

```bash
# Start specific service
docker-compose up -d backend

# Restart specific service
docker-compose restart frontend

# View logs for specific service
docker-compose logs -f backend
```

### Monitoring

```bash
# View all logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend

# Check service status
docker-compose ps

# View resource usage
docker stats
```

### Database Operations

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U crm_user -d crm_db

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed

# Backup database
docker-compose exec postgres pg_dump -U crm_user crm_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U crm_user -d crm_db
```

### Maintenance

```bash
# Remove stopped containers
docker-compose rm -f

# Remove unused images
docker image prune -a

# Remove all unused resources
docker system prune -a --volumes

# View disk usage
docker system df
```

## 🏗️ Architecture

### Container Structure

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│              (React + Vite + Nginx)             │
│                  Port: 80                        │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 │
┌────────────────▼────────────────────────────────┐
│                   Backend                        │
│         (Node.js + Express + Socket.IO)         │
│                  Port: 5000                      │
└────────────────┬────────────────────────────────┘
                 │
                 │ Prisma ORM
                 │
┌────────────────▼────────────────────────────────┐
│                  PostgreSQL                      │
│              Database Server                     │
│                  Port: 5432                      │
└─────────────────────────────────────────────────┘
```

### Network Configuration

- **Network Name**: `crm-network`
- **Driver**: Bridge
- **DNS**: Automatic service discovery
- Services communicate using service names (e.g., `postgres`, `backend`)

### Volumes

1. **postgres_data**: Persistent database storage
2. **backend_logs**: Application logs

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Windows - Find process using port
netstat -ano | findstr :5000

# Linux/Mac - Find process using port
lsof -i :5000

# Change port in .env
BACKEND_PORT=5001
FRONTEND_PORT=8080
```

#### 2. Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Verify connection
docker-compose exec postgres psql -U crm_user -d crm_db -c "SELECT 1"
```

#### 3. Backend Not Starting

```bash
# View detailed logs
docker-compose logs backend

# Check if migrations ran
docker-compose exec backend npx prisma migrate status

# Manually run migrations
docker-compose exec backend npx prisma migrate deploy

# Rebuild backend
docker-compose up -d --build backend
```

#### 4. Frontend Not Loading

```bash
# Check nginx logs
docker-compose logs frontend

# Verify build artifacts
docker-compose exec frontend ls -la /usr/share/nginx/html

# Rebuild frontend
docker-compose up -d --build frontend
```

#### 5. Out of Memory

```bash
# Increase Docker memory (Docker Desktop Settings)
# Or add to docker-compose.yml:

services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Health Checks

```bash
# Check all services health
docker-compose ps

# Manual health check
curl http://localhost:5000/health
curl http://localhost

# Check inside container
docker-compose exec backend wget -O- http://localhost:5000/health
```

## 🚢 Production Deployment

### AWS EC2 / DigitalOcean

```bash
# 1. Install Docker on server
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Clone repository
git clone <your-repo-url>
cd MastersUnion

# 3. Configure environment
cp .env.docker.example .env
nano .env  # Update with production values

# 4. Deploy
docker-compose -f docker-compose.yml up -d

# 5. Set up SSL (using Caddy or nginx-proxy)
```

### Docker Hub Deployment

```bash
# 1. Build images
docker-compose build

# 2. Tag images
docker tag mastersunion-backend:latest yourusername/crm-backend:latest
docker tag mastersunion-frontend:latest yourusername/crm-frontend:latest

# 3. Push to Docker Hub
docker login
docker push yourusername/crm-backend:latest
docker push yourusername/crm-frontend:latest

# 4. Pull and run on server
docker pull yourusername/crm-backend:latest
docker pull yourusername/crm-frontend:latest
docker-compose up -d
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml crm

# Check services
docker service ls

# Scale services
docker service scale crm_backend=3

# Remove stack
docker stack rm crm
```

### Using Kubernetes

```bash
# Convert docker-compose to k8s manifests
kompose convert

# Apply manifests
kubectl apply -f .

# Check pods
kubectl get pods

# Scale deployment
kubectl scale deployment backend --replicas=3
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` to git
- Use strong, unique passwords
- Rotate JWT secrets regularly

### 2. Database Security
```yaml
# Add to docker-compose.yml
postgres:
  environment:
    POSTGRES_PASSWORD_FILE: /run/secrets/db_password
  secrets:
    - db_password
```

### 3. Network Isolation
```yaml
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
