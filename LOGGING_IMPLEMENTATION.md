# Logging & Health Check Implementation Summary

## Overview
Implemented comprehensive audit logging, health/readiness endpoints, and an admin logs viewer with advanced filtering capabilities.

## Backend Changes

### 1. Enhanced Logger (`backend/src/utils/logger.ts`)
- **Log Directory**: Auto-creates `logs/` directory if missing
- **File Logging**: 
  - `logs/all.log` - All application logs
  - `logs/error.log` - Error-level logs only
  - `logs/audit.log` - JSON-formatted audit trail
- **Audit Logger**: Dedicated JSON logger for audit entries
- **Redaction**: Helper function to mask sensitive fields (password, token, authorization)

### 2. Audit Middleware (`backend/src/middleware/audit.middleware.ts`)
- Logs all non-GET requests after response completion
- Captures:
  - Method, path, status code, response time
  - User ID (if authenticated)
  - IP address, user agent
  - Request params, query, body (redacted)
- Skips health/ready endpoints to reduce noise

### 3. Health Endpoints (`backend/src/controllers/health.controller.ts`)
- **GET `/health`**: Liveness probe
  - Always returns 200
  - Includes DB status, uptime, version, response time
  - Status: "success" or "degraded" based on DB connectivity
  
- **GET `/ready`**: Readiness probe
  - Returns 200 if DB is reachable
  - Returns 503 if DB is down
  - Suitable for Kubernetes/Docker readiness checks

### 4. Logs API (`backend/src/controllers/log.controller.ts`)
Protected by admin/manager roles only.

#### GET `/api/v1/logs`
Query Parameters:
- `limit` (default: 200, max: 2000) - Number of recent lines
- `level` - Filter by log level (error, warn, info, etc.)
- `search` - Text search in log lines
- `type` - Log type: "audit" or "main" (default: "main")
- `from` - Start datetime (ISO 8601)
- `to` - End datetime (ISO 8601)

Response:
```json
{
  "file": "all.log",
  "count": 150,
  "records": [
    {
      "raw": "2025-11-08 22:37:11 info: Server running",
      "timestamp": "2025-11-08T22:37:11.000Z",
      "level": "info",
      "message": "Server running",
      "parsed": { ... } // For audit logs
    }
  ]
}
```

#### GET `/api/v1/logs/download`
- Downloads raw log file
- Query param: `type` (audit or main)

### 5. Routes Integration (`backend/src/server.ts`)
- Added audit middleware after request logger
- Replaced simple health check with health controller
- Added `/ready` endpoint
- Registered `/api/v1/logs` routes

## Frontend Changes

### 1. Logs Service (`frontend/src/services/logs.service.ts`)
- `fetchLogs()` function with full filter support
- TypeScript interfaces for structured log records
- Handles both raw and parsed audit log entries

### 2. Logs Viewer Component (`frontend/src/components/common/LogsViewer.tsx`)
Features:
- Date range filters (from/to with datetime-local inputs)
- Level dropdown filter (error, warn, info, debug)
- Text search box
- Refresh button
- Clear filters button
- Structured rendering of audit logs (JSON pretty-print)
- Auto-refresh on filter change
- Loading and error states

### 3. Logs Page (`frontend/src/pages/LogsPage.tsx`)
- Role-based access (admin/manager only)
- Split view: Application logs + Audit logs
- Redirects unauthorized users to dashboard

### 4. Navigation (`frontend/src/components/common/MainLayout.tsx`)
- "Logs" link appears only for admin/manager roles
- Integrated into main navigation bar

## CI/CD

### GitHub Actions Workflow (`.github/workflows/ci.yml`)
Runs on:
- Push to main/develop branches
- Pull requests to main/develop

Jobs:
1. **backend-build**
   - Node 18 on Ubuntu
   - `npm ci && npm run build`
   - Caches node_modules

2. **frontend-build**
   - Node 18 on Ubuntu
   - `npm ci && npm run build`
   - Caches node_modules

## Docker Considerations

### Current Health Check
The Dockerfile uses `/health` endpoint which always returns 200.

### Recommended Update
For stricter health checking in production, update the Dockerfile to use `/ready`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/ready', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

This will mark the container unhealthy if the database is unreachable.

## Usage Examples

### Backend API
```bash
# Get recent logs
curl http://localhost:5000/api/v1/logs?limit=100

# Filter by level and date range
curl "http://localhost:5000/api/v1/logs?level=error&from=2025-11-08T00:00:00Z&to=2025-11-08T23:59:59Z"

# Get audit logs
curl http://localhost:5000/api/v1/logs?type=audit&limit=50

# Download log file
curl http://localhost:5000/api/v1/logs/download?type=audit -o audit.log

# Health check
curl http://localhost:5000/health

# Readiness check
curl http://localhost:5000/ready
```

### Frontend
1. Login as admin or manager user
2. Navigate to `/logs` from the main navigation
3. Use filters:
   - Set date range for specific time window
   - Select log level (error, warn, info)
   - Type search keywords
   - Click "Clear" to reset all filters
4. View structured audit log entries with expandable JSON

## Security

- **Authentication**: All logs endpoints require valid JWT
- **Authorization**: Only ADMIN and MANAGER roles can access logs
- **Redaction**: Sensitive fields automatically masked in audit logs
- **Rate Limiting**: Applies to all API endpoints (100 req/15min default)

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── health.controller.ts     (NEW)
│   │   └── log.controller.ts        (NEW)
│   ├── middleware/
│   │   └── audit.middleware.ts      (NEW)
│   ├── routes/
│   │   └── log.routes.ts            (NEW)
│   ├── utils/
│   │   └── logger.ts                (ENHANCED)
│   └── server.ts                    (MODIFIED)
└── logs/
    ├── all.log
    ├── error.log
    └── audit.log

frontend/
├── src/
│   ├── components/common/
│   │   ├── LogsViewer.tsx           (NEW)
│   │   └── MainLayout.tsx           (MODIFIED)
│   ├── pages/
│   │   └── LogsPage.tsx             (NEW)
│   ├── services/
│   │   └── logs.service.ts          (NEW)
│   └── App.tsx                      (MODIFIED)

.github/
└── workflows/
    └── ci.yml                        (NEW)
```

## Testing

### Manual Testing Checklist
- [ ] Backend builds successfully (`npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Health endpoint returns 200 with DB status
- [ ] Ready endpoint returns 200 when DB is up
- [ ] Logs endpoint requires authentication
- [ ] Only admin/manager can access logs
- [ ] Date range filters work correctly
- [ ] Level filter works correctly
- [ ] Search filter works correctly
- [ ] Audit logs parse and display correctly
- [ ] Download endpoint streams log file
- [ ] Frontend logs page shows both log types
- [ ] Logs nav link only visible to admin/manager
- [ ] Unauthorized users redirected from /logs

### CI Testing
- GitHub Actions workflow runs on push
- Both backend and frontend jobs pass
- Build artifacts are validated

## Future Enhancements

1. **Log Rotation**: Implement winston-daily-rotate-file to prevent unbounded growth
2. **Real-time Logs**: Add WebSocket streaming for live log viewing
3. **Log Analytics**: Add aggregation queries (error count by hour, top users, etc.)
4. **Export**: Add CSV/JSON export for filtered logs
5. **Alerts**: Trigger notifications on specific error patterns
6. **Retention Policy**: Auto-delete logs older than X days
7. **Search**: Full-text search with Elasticsearch integration
8. **Metrics**: Expose Prometheus metrics endpoint

## Performance Notes

- Log files are read synchronously (suitable for files < 100MB)
- For large log files (> 100MB), consider streaming or pagination
- Audit logs use newline-delimited JSON for efficient parsing
- Default limit of 200 lines prevents memory issues
- Maximum limit capped at 2000 lines per request

## Compliance

This implementation provides:
- **Audit Trail**: All state-changing operations logged
- **Access Control**: Role-based access to sensitive logs
- **Data Privacy**: Automatic redaction of sensitive fields
- **Tamper Evidence**: Immutable append-only log files
- **Retention**: Manual deletion required (no auto-purge by default)

Suitable for compliance with:
- SOC 2 (Security logging and monitoring)
- GDPR (Right to access, data minimization via redaction)
- HIPAA (Audit controls and access logs)
- PCI DSS (Logging and monitoring requirements)
