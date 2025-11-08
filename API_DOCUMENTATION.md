# CRM System API Documentation

## Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Rate Limiting
- 100 requests per 15 minutes per IP
- Returns 429 (Too Many Requests) when exceeded

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "SALES_REP"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "SALES_REP",
    "isActive": true,
    "createdAt": "2025-11-08T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules**:
- `email`: Valid email format, unique
- `password`: Min 8 characters, 1 uppercase, 1 lowercase, 1 number
- `name`: Min 2 characters
- `role`: ADMIN | MANAGER | SALES_REP

**Errors**:
- `400`: Validation error
- `409`: Email already exists

---

### POST /auth/login
Authenticate user and receive JWT token.

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "SALES_REP",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400`: Validation error
- `401`: Invalid credentials
- `403`: Account inactive

**Audit Log**: ✅ Logged (login attempts)

---

### GET /auth/me
Get current authenticated user's profile.

**Access**: Authenticated users

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "SALES_REP",
  "isActive": true,
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

**Errors**:
- `401`: Not authenticated

---

## Lead Management

### GET /leads
Get all leads with filtering and pagination.

**Access**: Authenticated users

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 10, max: 100): Items per page
- `status`: Filter by status (NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST)
- `source`: Filter by source (WEBSITE, REFERRAL, COLD_CALL, LINKEDIN, EMAIL, OTHER)
- `assignedTo`: Filter by assigned user ID
- `search`: Search in name, email, company, phone

**Response** (200):
```json
{
  "leads": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@company.com",
      "phone": "+1234567890",
      "company": "Tech Corp",
      "position": "CTO",
      "status": "QUALIFIED",
      "source": "LINKEDIN",
      "value": 50000,
      "notes": "Interested in enterprise plan",
      "assignedTo": "user-uuid",
      "assignedUser": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@crm.com"
      },
      "createdAt": "2025-11-08T10:00:00.000Z",
      "updatedAt": "2025-11-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 10,
    "totalPages": 16
  }
}
```

**Errors**:
- `401`: Not authenticated
- `400`: Invalid query parameters

---

### GET /leads/:id
Get a specific lead by ID.

**Access**: Authenticated users

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "position": "CTO",
  "status": "QUALIFIED",
  "source": "LINKEDIN",
  "value": 50000,
  "notes": "Interested in enterprise plan",
  "assignedTo": "user-uuid",
  "assignedUser": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@crm.com",
    "role": "SALES_REP"
  },
  "activities": [
    {
      "id": "activity-uuid",
      "type": "CALL",
      "description": "Follow-up call",
      "createdAt": "2025-11-08T10:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe"
      }
    }
  ],
  "tasks": [
    {
      "id": "task-uuid",
      "title": "Send proposal",
      "status": "PENDING",
      "priority": "HIGH",
      "dueDate": "2025-11-10T00:00:00.000Z"
    }
  ],
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

**Errors**:
- `401`: Not authenticated
- `404`: Lead not found

---

### POST /leads
Create a new lead.

**Access**: Authenticated users

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "position": "CTO",
  "status": "NEW",
  "source": "LINKEDIN",
  "value": 50000,
  "notes": "Interested in enterprise plan",
  "assignedTo": "user-uuid"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "position": "CTO",
  "status": "NEW",
  "source": "LINKEDIN",
  "value": 50000,
  "notes": "Interested in enterprise plan",
  "assignedTo": "user-uuid",
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

**Validation Rules**:
- `name`: Required, min 2 characters
- `email`: Required, valid email format
- `phone`: Optional, valid phone format
- `status`: Valid status enum value
- `source`: Valid source enum value
- `value`: Optional, positive number

**Errors**:
- `400`: Validation error
- `401`: Not authenticated
- `409`: Email already exists

**Audit Log**: ✅ Logged with full request body (email redacted)

---

### PUT /leads/:id
Update an existing lead.

**Access**: Authenticated users

**Request Body** (all fields optional):
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.new@company.com",
  "phone": "+1234567890",
  "company": "Tech Corp Inc",
  "position": "VP Technology",
  "status": "QUALIFIED",
  "source": "LINKEDIN",
  "value": 75000,
  "notes": "Upgraded to premium plan",
  "assignedTo": "another-user-uuid"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Jane Smith Updated",
  "email": "jane.new@company.com",
  "status": "QUALIFIED",
  "value": 75000,
  "updatedAt": "2025-11-08T11:00:00.000Z"
}
```

**Errors**:
- `400`: Validation error
- `401`: Not authenticated
- `404`: Lead not found
- `409`: Email already exists (if changing email)

**Audit Log**: ✅ Logged with changed fields

---

### DELETE /leads/:id
Delete a lead.

**Access**: ADMIN, MANAGER only

**Response** (200):
```json
{
  "message": "Lead deleted successfully"
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Lead not found

**Audit Log**: ✅ Logged with lead ID and user

---

## Task Management

### GET /tasks
Get all tasks with filtering.

**Access**: Authenticated users

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 10, max: 100): Items per page
- `status`: Filter by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `assignedTo`: Filter by assigned user ID
- `leadId`: Filter by lead ID
- `dueBefore`: Filter tasks due before date (ISO 8601)
- `dueAfter`: Filter tasks due after date (ISO 8601)

**Response** (200):
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Follow up with lead",
      "description": "Call to discuss proposal",
      "status": "PENDING",
      "priority": "HIGH",
      "dueDate": "2025-11-10T00:00:00.000Z",
      "leadId": "lead-uuid",
      "assignedTo": "user-uuid",
      "lead": {
        "id": "lead-uuid",
        "name": "Jane Smith",
        "company": "Tech Corp"
      },
      "assignedUser": {
        "id": "user-uuid",
        "name": "John Doe"
      },
      "createdAt": "2025-11-08T10:00:00.000Z",
      "updatedAt": "2025-11-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Errors**:
- `401`: Not authenticated
- `400`: Invalid query parameters

---

### GET /tasks/:id
Get a specific task by ID.

**Access**: Authenticated users

**Response** (200):
```json
{
  "id": "uuid",
  "title": "Follow up with lead",
  "description": "Call to discuss proposal",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-11-10T00:00:00.000Z",
  "completedAt": null,
  "leadId": "lead-uuid",
  "assignedTo": "user-uuid",
  "lead": {
    "id": "lead-uuid",
    "name": "Jane Smith",
    "company": "Tech Corp",
    "status": "QUALIFIED"
  },
  "assignedUser": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@crm.com"
  },
  "createdBy": "creator-uuid",
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

**Errors**:
- `401`: Not authenticated
- `404`: Task not found

---

### POST /tasks
Create a new task.

**Access**: Authenticated users

**Request Body**:
```json
{
  "title": "Follow up with lead",
  "description": "Call to discuss proposal",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-11-10T00:00:00.000Z",
  "leadId": "lead-uuid",
  "assignedTo": "user-uuid"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "title": "Follow up with lead",
  "description": "Call to discuss proposal",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-11-10T00:00:00.000Z",
  "leadId": "lead-uuid",
  "assignedTo": "user-uuid",
  "createdBy": "current-user-uuid",
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

**Validation Rules**:
- `title`: Required, min 3 characters
- `status`: Valid status enum value
- `priority`: Valid priority enum value
- `dueDate`: Optional, valid ISO 8601 date
- `leadId`: Optional, must exist
- `assignedTo`: Optional, must exist

**Errors**:
- `400`: Validation error
- `401`: Not authenticated
- `404`: Lead or user not found

**Audit Log**: ✅ Logged with task details

---

### PUT /tasks/:id
Update an existing task.

**Access**: Authenticated users

**Request Body** (all fields optional):
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "dueDate": "2025-11-12T00:00:00.000Z",
  "assignedTo": "another-user-uuid"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "title": "Updated task title",
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "updatedAt": "2025-11-08T11:00:00.000Z"
}
```

**Special Behavior**:
- Setting `status` to "COMPLETED" automatically sets `completedAt` timestamp
- Changing status from "COMPLETED" clears `completedAt`

**Errors**:
- `400`: Validation error
- `401`: Not authenticated
- `404`: Task not found

**Audit Log**: ✅ Logged with changed fields

---

### DELETE /tasks/:id
Delete a task.

**Access**: Task creator, assigned user, or ADMIN/MANAGER

**Response** (200):
```json
{
  "message": "Task deleted successfully"
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Task not found

**Audit Log**: ✅ Logged with task ID

---

## Activity Tracking

### GET /activities
Get activity feed with filtering.

**Access**: Authenticated users

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Items per page
- `type`: Filter by type (NOTE, CALL, EMAIL, MEETING, STATUS_CHANGE)
- `leadId`: Filter by lead ID
- `userId`: Filter by user who performed activity
- `from`: Filter activities after date (ISO 8601)
- `to`: Filter activities before date (ISO 8601)

**Response** (200):
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "CALL",
      "description": "Discussed pricing options",
      "leadId": "lead-uuid",
      "userId": "user-uuid",
      "metadata": {
        "duration": "15 minutes",
        "outcome": "positive"
      },
      "lead": {
        "id": "lead-uuid",
        "name": "Jane Smith",
        "company": "Tech Corp"
      },
      "user": {
        "id": "user-uuid",
        "name": "John Doe"
      },
      "createdAt": "2025-11-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 234,
    "page": 1,
    "limit": 20,
    "totalPages": 12
  }
}
```

**Errors**:
- `401`: Not authenticated
- `400`: Invalid query parameters

---

### POST /activities
Create a new activity.

**Access**: Authenticated users

**Request Body**:
```json
{
  "type": "CALL",
  "description": "Discussed pricing options",
  "leadId": "lead-uuid",
  "metadata": {
    "duration": "15 minutes",
    "outcome": "positive"
  }
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "type": "CALL",
  "description": "Discussed pricing options",
  "leadId": "lead-uuid",
  "userId": "current-user-uuid",
  "metadata": {
    "duration": "15 minutes",
    "outcome": "positive"
  },
  "createdAt": "2025-11-08T10:00:00.000Z"
}
```

**Validation Rules**:
- `type`: Required, valid enum value
- `description`: Required, min 3 characters
- `leadId`: Required, must exist
- `metadata`: Optional, valid JSON object

**Errors**:
- `400`: Validation error
- `401`: Not authenticated
- `404`: Lead not found

**Audit Log**: ✅ Logged with activity details

---

### DELETE /activities/:id
Delete an activity.

**Access**: Activity creator or ADMIN/MANAGER

**Response** (200):
```json
{
  "message": "Activity deleted successfully"
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Activity not found

**Audit Log**: ✅ Logged with activity ID

---

## User Management

### GET /users
Get all users (filtered by role permissions).

**Access**: Authenticated users

**Query Parameters**:
- `page` (default: 1): Page number
- `limit` (default: 10, max: 100): Items per page
- `role`: Filter by role
- `isActive`: Filter by active status (true/false)

**Response** (200):
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@crm.com",
      "name": "John Doe",
      "role": "SALES_REP",
      "isActive": true,
      "createdAt": "2025-11-08T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Errors**:
- `401`: Not authenticated

---

### GET /users/:id
Get a specific user by ID.

**Access**: Authenticated users

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@crm.com",
  "name": "John Doe",
  "role": "SALES_REP",
  "isActive": true,
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z",
  "_count": {
    "assignedLeads": 12,
    "assignedTasks": 8,
    "activities": 45
  }
}
```

**Errors**:
- `401`: Not authenticated
- `404`: User not found

---

### PUT /users/:id
Update a user (ADMIN only).

**Access**: ADMIN only

**Request Body** (all fields optional):
```json
{
  "name": "John Doe Updated",
  "role": "MANAGER",
  "isActive": false
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@crm.com",
  "name": "John Doe Updated",
  "role": "MANAGER",
  "isActive": false,
  "updatedAt": "2025-11-08T11:00:00.000Z"
}
```

**Validation Rules**:
- `name`: Min 2 characters
- `role`: Valid role enum value
- Cannot change own role or active status

**Errors**:
- `400`: Validation error
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: User not found

**Audit Log**: ✅ Logged with changed fields

---

### DELETE /users/:id
Delete a user (ADMIN only).

**Access**: ADMIN only

**Response** (200):
```json
{
  "message": "User deleted successfully"
}
```

**Special Behavior**:
- Cannot delete yourself
- Reassigns all leads/tasks to requesting admin

**Errors**:
- `400`: Cannot delete yourself
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: User not found

**Audit Log**: ✅ Logged with user ID

---

## Analytics

### GET /analytics/overview
Get dashboard overview statistics.

**Access**: Authenticated users

**Query Parameters**:
- `startDate`: Start date for metrics (ISO 8601, default: 30 days ago)
- `endDate`: End date for metrics (ISO 8601, default: now)

**Response** (200):
```json
{
  "leads": {
    "total": 156,
    "new": 12,
    "qualified": 34,
    "won": 23,
    "lost": 15,
    "conversionRate": 14.74
  },
  "tasks": {
    "total": 89,
    "pending": 23,
    "inProgress": 15,
    "completed": 45,
    "overdue": 6
  },
  "activities": {
    "total": 234,
    "byType": {
      "CALL": 89,
      "EMAIL": 76,
      "MEETING": 45,
      "NOTE": 24
    }
  },
  "revenue": {
    "total": 1250000,
    "won": 850000,
    "pipeline": 400000
  }
}
```

**Errors**:
- `401`: Not authenticated
- `400`: Invalid date range

---

### GET /analytics/conversion-funnel
Get conversion funnel data.

**Access**: ADMIN, MANAGER only

**Query Parameters**:
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)

**Response** (200):
```json
{
  "funnel": [
    { "stage": "NEW", "count": 156, "percentage": 100 },
    { "stage": "CONTACTED", "count": 98, "percentage": 62.82 },
    { "stage": "QUALIFIED", "count": 67, "percentage": 42.95 },
    { "stage": "PROPOSAL", "count": 45, "percentage": 28.85 },
    { "stage": "NEGOTIATION", "count": 32, "percentage": 20.51 },
    { "stage": "CLOSED_WON", "count": 23, "percentage": 14.74 }
  ],
  "dropoff": {
    "NEW_to_CONTACTED": 37.18,
    "CONTACTED_to_QUALIFIED": 31.63,
    "QUALIFIED_to_PROPOSAL": 32.84,
    "PROPOSAL_to_NEGOTIATION": 28.89,
    "NEGOTIATION_to_CLOSED_WON": 28.13
  }
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions

---

### GET /analytics/sales-pipeline
Get sales pipeline metrics.

**Access**: ADMIN, MANAGER only

**Response** (200):
```json
{
  "byStage": [
    {
      "status": "QUALIFIED",
      "count": 34,
      "totalValue": 850000,
      "averageValue": 25000
    },
    {
      "status": "PROPOSAL",
      "count": 28,
      "totalValue": 700000,
      "averageValue": 25000
    }
  ],
  "bySource": [
    {
      "source": "LINKEDIN",
      "count": 45,
      "conversionRate": 22.5,
      "totalValue": 1125000
    },
    {
      "source": "REFERRAL",
      "count": 38,
      "conversionRate": 31.2,
      "totalValue": 950000
    }
  ],
  "totalPipelineValue": 2850000,
  "weightedPipelineValue": 1425000
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions

---

## Notifications

### GET /notifications
Get user notifications.

**Access**: Authenticated users

**Query Parameters**:
- `isRead`: Filter by read status (true/false)
- `limit` (default: 20, max: 100): Number of notifications

**Response** (200):
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "TASK_ASSIGNED",
      "title": "New task assigned",
      "message": "You have been assigned: Follow up with lead",
      "isRead": false,
      "metadata": {
        "taskId": "task-uuid",
        "leadId": "lead-uuid"
      },
      "createdAt": "2025-11-08T10:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

**Notification Types**:
- `TASK_ASSIGNED`: New task assigned to user
- `TASK_DUE_SOON`: Task due in 24 hours
- `TASK_OVERDUE`: Task past due date
- `LEAD_ASSIGNED`: New lead assigned
- `LEAD_STATUS_CHANGED`: Lead status updated
- `MENTION`: User mentioned in note/comment

**Errors**:
- `401`: Not authenticated

---

### PUT /notifications/:id/read
Mark a notification as read.

**Access**: Authenticated users (own notifications only)

**Response** (200):
```json
{
  "id": "uuid",
  "isRead": true,
  "updatedAt": "2025-11-08T11:00:00.000Z"
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Not your notification
- `404`: Notification not found

---

### PUT /notifications/read-all
Mark all notifications as read.

**Access**: Authenticated users

**Response** (200):
```json
{
  "message": "All notifications marked as read",
  "count": 12
}
```

**Errors**:
- `401`: Not authenticated

---

## Logging & Monitoring

### GET /logs
Get application logs (ADMIN/MANAGER only).

**Access**: ADMIN, MANAGER only

**Query Parameters**:
- `limit` (default: 200, max: 2000): Number of recent lines
- `level`: Filter by level (error, warn, info, debug, http)
- `search`: Text search in log lines
- `type`: Log type - "audit" or "main" (default: "main")
- `from`: Start datetime (ISO 8601)
- `to`: End datetime (ISO 8601)

**Response** (200):
```json
{
  "file": "all.log",
  "count": 150,
  "records": [
    {
      "raw": "2025-11-08 22:37:11 info: Server started on port 5000",
      "timestamp": "2025-11-08T22:37:11.000Z",
      "level": "info",
      "message": "Server started on port 5000"
    },
    {
      "raw": "2025-11-08 22:38:45 error: Database connection failed",
      "timestamp": "2025-11-08T22:38:45.000Z",
      "level": "error",
      "message": "Database connection failed"
    }
  ]
}
```

**Audit Log Response** (type=audit):
```json
{
  "file": "audit.log",
  "count": 50,
  "records": [
    {
      "raw": "{\"timestamp\":\"2025-11-08T10:00:00.000Z\",\"method\":\"POST\",...}",
      "timestamp": "2025-11-08T10:00:00.000Z",
      "parsed": {
        "timestamp": "2025-11-08T10:00:00.000Z",
        "method": "POST",
        "path": "/api/v1/leads",
        "status": 201,
        "duration": 145,
        "userId": "user-uuid",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "body": {
          "name": "Jane Smith",
          "email": "***REDACTED***",
          "company": "Tech Corp"
        }
      }
    }
  ]
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `400`: Invalid parameters
- `404`: Log file not found

---

### GET /logs/download
Download raw log file.

**Access**: ADMIN, MANAGER only

**Query Parameters**:
- `type`: "audit" or "main" (default: "main")

**Response**: File download (text/plain)

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Log file not found

---

### GET /health
Liveness probe for health checks.

**Access**: Public

**Response** (200):
```json
{
  "status": "success",
  "uptime": 3600,
  "timestamp": "2025-11-08T11:00:00.000Z",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "responseTime": 12
  }
}
```

**Degraded State** (DB unreachable):
```json
{
  "status": "degraded",
  "uptime": 3600,
  "timestamp": "2025-11-08T11:00:00.000Z",
  "version": "1.0.0",
  "database": {
    "status": "disconnected",
    "error": "Connection timeout"
  }
}
```

---

### GET /ready
Readiness probe for orchestration.

**Access**: Public

**Response** (200 if ready):
```json
{
  "status": "ready",
  "database": "connected"
}
```

**Response** (503 if not ready):
```json
{
  "status": "not_ready",
  "database": "disconnected"
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events Received

#### `notification`
New notification for current user.
```json
{
  "id": "uuid",
  "type": "TASK_ASSIGNED",
  "title": "New task assigned",
  "message": "You have been assigned: Follow up with lead",
  "metadata": {
    "taskId": "task-uuid"
  },
  "createdAt": "2025-11-08T10:00:00.000Z"
}
```

#### `lead:updated`
Lead was updated (if user has access).
```json
{
  "id": "lead-uuid",
  "name": "Jane Smith",
  "status": "QUALIFIED",
  "updatedBy": "user-uuid"
}
```

#### `task:assigned`
Task assigned to current user.
```json
{
  "id": "task-uuid",
  "title": "Follow up with lead",
  "priority": "HIGH",
  "dueDate": "2025-11-10T00:00:00.000Z"
}
```

#### `activity:created`
New activity on lead user follows.
```json
{
  "id": "activity-uuid",
  "type": "CALL",
  "leadId": "lead-uuid",
  "userId": "user-uuid",
  "description": "Discussed pricing"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error
- `503`: Service Unavailable

---

## Data Models

### User Roles
- `ADMIN`: Full system access
- `MANAGER`: Team management, analytics access
- `SALES_REP`: Lead and task management

### Lead Status
- `NEW`: Initial contact
- `CONTACTED`: First contact made
- `QUALIFIED`: Qualified opportunity
- `PROPOSAL`: Proposal sent
- `NEGOTIATION`: Negotiating terms
- `CLOSED_WON`: Deal won
- `CLOSED_LOST`: Deal lost

### Lead Source
- `WEBSITE`: Company website
- `REFERRAL`: Customer referral
- `COLD_CALL`: Outbound call
- `LINKEDIN`: LinkedIn outreach
- `EMAIL`: Email campaign
- `OTHER`: Other sources

### Task Status
- `PENDING`: Not started
- `IN_PROGRESS`: Currently working
- `COMPLETED`: Finished
- `CANCELLED`: Cancelled

### Task Priority
- `LOW`: Low priority
- `MEDIUM`: Medium priority
- `HIGH`: High priority
- `URGENT`: Urgent

### Activity Type
- `NOTE`: General note
- `CALL`: Phone call
- `EMAIL`: Email communication
- `MEETING`: In-person/virtual meeting
- `STATUS_CHANGE`: Lead status changed

---

## Best Practices

### Pagination
Always use pagination for list endpoints to avoid performance issues:
```
GET /api/v1/leads?page=1&limit=20
```

### Filtering
Combine multiple filters for precise queries:
```
GET /api/v1/leads?status=QUALIFIED&source=LINKEDIN&assignedTo=user-id
```

### Date Ranges
Use ISO 8601 format for all dates:
```
GET /api/v1/activities?from=2025-11-01T00:00:00Z&to=2025-11-08T23:59:59Z
```

### Search
Use search parameter for text queries:
```
GET /api/v1/leads?search=tech+corp
```

### Error Handling
Always check response status and handle errors:
```javascript
try {
  const response = await fetch('/api/v1/leads', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.message);
    return;
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('Network Error:', error);
}
```

### Rate Limiting
Implement exponential backoff for 429 responses:
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status !== 429) {
      return response;
    }
    
    const delay = Math.pow(2, i) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## Audit Logging

All state-changing operations (POST, PUT, DELETE) are automatically logged to `logs/audit.log`.

### Audit Log Entry Structure
```json
{
  "timestamp": "2025-11-08T10:00:00.000Z",
  "method": "POST",
  "path": "/api/v1/leads",
  "status": 201,
  "duration": 145,
  "userId": "user-uuid",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "params": {},
  "query": {},
  "body": {
    "name": "Jane Smith",
    "email": "***REDACTED***",
    "company": "Tech Corp"
  }
}
```

### Sensitive Data Redaction
The following fields are automatically redacted:
- `password`
- `token`
- `authorization`
- Email addresses in body (replaced with `***REDACTED***`)

### Audit Log Retention
- Logs are append-only (never modified)
- No automatic deletion (manual cleanup required)
- Recommended: Archive logs older than 90 days
- Recommended: Implement log rotation for files > 100MB

---

## Rate Limiting

### Default Limits
- **Standard endpoints**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 login attempts per 15 minutes per IP

### Headers
Rate limit info included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699459200
```

### Exceeded Response
```json
{
  "message": "Too many requests, please try again later."
}
```
Status: `429 Too Many Requests`

---

## Changelog

### Version 1.0.0 (2025-11-08)
- Initial API release
- CRUD operations for leads, tasks, activities, users
- Authentication with JWT
- Role-based access control
- Analytics endpoints
- Real-time notifications via WebSocket
- Audit logging system
- Health and readiness probes
- Rate limiting
