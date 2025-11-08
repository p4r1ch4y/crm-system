# CRM Database Documentation

## Overview

The CRM system uses PostgreSQL as the primary database with Prisma ORM for type-safe database access and migrations.

## Entity Relationship Diagram

See `ERD.png` for the visual representation.

## Tables

### users
Stores user accounts with role-based access control.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `email` (String, Unique): User email
- `password` (String): Hashed password
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `role` (Enum): ADMIN, MANAGER, SALES_EXECUTIVE
- `phone` (String, Nullable): Phone number
- `avatar` (String, Nullable): Profile picture URL
- `isActive` (Boolean): Account status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**
- `email` (Unique)
- `role`

### leads
Core entity for managing customer leads.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `firstName` (String): Lead's first name
- `lastName` (String): Lead's last name
- `email` (String): Contact email
- `phone` (String, Nullable): Phone number
- `company` (String, Nullable): Company name
- `position` (String, Nullable): Job title
- `status` (Enum): Lead status in pipeline
- `source` (String, Nullable): Lead source
- `value` (Float, Nullable): Potential deal value
- `priority` (Enum): LOW, MEDIUM, HIGH, URGENT
- `description` (Text, Nullable): Additional notes
- `tags` (String[]): Categorization tags
- `ownerId` (UUID, FK): Assigned user
- `createdById` (UUID, FK): Creator user
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**
- `email`
- `ownerId`
- `status`
- `createdAt`

**Relationships:**
- belongs to `owner` (User)
- belongs to `createdBy` (User)
- has many `activities`
- has many `tasks`

### activities
Tracks all interactions and timeline events.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `type` (Enum): NOTE, CALL, EMAIL, MEETING, TASK, STATUS_CHANGE
- `subject` (String): Activity title
- `description` (Text, Nullable): Details
- `duration` (Integer, Nullable): Duration in minutes
- `outcome` (String, Nullable): Result/outcome
- `leadId` (UUID, FK): Related lead
- `userId` (UUID, FK): User who performed activity
- `scheduledAt` (DateTime, Nullable): Scheduled time
- `completedAt` (DateTime, Nullable): Completion time
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**
- `leadId`
- `userId`
- `type`
- `scheduledAt`

**Relationships:**
- belongs to `lead`
- belongs to `user`

### tasks
Task management system.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `title` (String): Task title
- `description` (Text, Nullable): Task details
- `status` (Enum): TODO, IN_PROGRESS, COMPLETED, CANCELLED
- `priority` (Enum): LOW, MEDIUM, HIGH, URGENT
- `dueDate` (DateTime, Nullable): Due date
- `leadId` (UUID, FK, Nullable): Related lead
- `assignedTo` (UUID, FK): Assigned user
- `createdById` (UUID, FK): Creator user
- `completedAt` (DateTime, Nullable): Completion timestamp
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**
- `assignedTo`
- `status`
- `dueDate`

**Relationships:**
- belongs to `lead` (optional)
- belongs to `assignedUser` (User)
- belongs to `createdBy` (User)

### notifications
Real-time notification system.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `type` (Enum): Notification type
- `title` (String): Notification title
- `message` (String): Notification message
- `isRead` (Boolean): Read status
- `userId` (UUID, FK): Target user
- `metadata` (JSON, Nullable): Additional data
- `createdAt` (DateTime): Creation timestamp

**Indexes:**
- `userId`
- `isRead`
- `createdAt`

**Relationships:**
- belongs to `user`

## Enumerations

### Role
- ADMIN: Full system access
- MANAGER: Team management and reporting
- SALES_EXECUTIVE: Lead management

### LeadStatus
- NEW: Just created
- CONTACTED: Initial contact made
- QUALIFIED: Meets criteria
- PROPOSAL: Proposal sent
- NEGOTIATION: In negotiation
- WON: Deal closed successfully
- LOST: Deal lost
- ARCHIVED: Archived lead

### Priority
- LOW: Low priority
- MEDIUM: Medium priority
- HIGH: High priority
- URGENT: Urgent/Critical

### ActivityType
- NOTE: General note
- CALL: Phone call
- EMAIL: Email communication
- MEETING: In-person or virtual meeting
- TASK: Task completion
- STATUS_CHANGE: Lead status update

### TaskStatus
- TODO: Not started
- IN_PROGRESS: Currently working
- COMPLETED: Finished
- CANCELLED: Cancelled

### NotificationType
- LEAD_ASSIGNED: Lead assignment
- TASK_ASSIGNED: Task assignment
- TASK_DUE: Task due reminder
- LEAD_STATUS_CHANGED: Lead status update
- ACTIVITY_REMINDER: Activity reminder
- SYSTEM: System notification

## Database Migrations

Migrations are managed through Prisma:

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## Seeding

Initial data can be seeded using:

```bash
npx prisma db seed
```

This creates:
- 4 test users (1 admin, 1 manager, 2 sales)
- Sample leads
- Sample activities
- Sample tasks
- Sample notifications
