# CRM System Testing Guide

## Overview
This guide covers comprehensive automated testing for the CRM system using Jest and Supertest, plus manual testing procedures.

## System Status
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **Database**: PostgreSQL (Prisma ORM)

---

## Automated Testing with Jest

### Test Files Structure
```
backend/tests/
├── auth.test.ts          - Authentication & authorization
├── lead.test.ts          - Lead CRUD operations
├── task.test.ts          - Task management
├── activity.test.ts      - Activity tracking
├── analytics.test.ts     - Analytics endpoints
├── user.test.ts          - User management & notifications
└── health.test.ts        - Health checks & logging
```

### Running Tests

#### All Tests
```bash
cd backend
npm test
```

#### Specific Test File
```bash
npm test auth.test
npm test lead.test
npm test task.test
```

#### Watch Mode
```bash
npm run test:watch
```

#### With Coverage Report
```bash
npm test -- --coverage
```

### Test Coverage Summary

#### Authentication Tests (`auth.test.ts`)
- ✅ User registration (valid/invalid email, password strength)
- ✅ User login (valid/invalid credentials, token generation)
- ✅ Current user profile (authentication, authorization)

#### Lead Tests (`lead.test.ts`)
- ✅ Create lead (validation, duplicate prevention)
- ✅ List leads (pagination, filtering, search)
- ✅ Get single lead (with relationships)
- ✅ Update lead (partial updates, status changes)
- ✅ Delete lead (admin-only, role checks)

#### Task Tests (`task.test.ts`)
- ✅ Create task (priority, status, due dates)
- ✅ List tasks (filtering by status, priority, lead, dates)
- ✅ Update task (completion timestamps)
- ✅ Delete task (permission checks)

#### Activity Tests (`activity.test.ts`)
- ✅ Create activity (types: CALL, EMAIL, MEETING, NOTE)
- ✅ List activities (filtering, pagination)
- ✅ Delete activity (creator validation)

#### Analytics Tests (`analytics.test.ts`)
- ✅ Dashboard overview (lead, task, activity metrics)
- ✅ Conversion funnel (admin/manager only)
- ✅ Sales pipeline (by stage and source)

#### User Tests (`user.test.ts`)
- ✅ List users (role filtering, pagination)
- ✅ Get user details
- ✅ Update user (admin-only, role changes)
- ✅ Delete user (reassignment handling)
- ✅ Notifications (get, mark as read)

#### Health Tests (`health.test.ts`)
- ✅ Health endpoint (liveness probe)
- ✅ Readiness endpoint (DB connectivity)
- ✅ Logs endpoint (admin access, filtering)
- ✅ Log download (file streaming)

### Coverage Goals
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View detailed coverage report:
```bash
# After running npm test -- --coverage
# Open: backend/coverage/index.html
```

---

## Manual Testing Guide

### 1. Authentication & Role Management

#### Login with Seeded Users:
```powershell
# Admin Login
$body = @{ email = "admin@crm.com"; password = "Admin@123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# Manager Login
$body = @{ email = "manager@crm.com"; password = "Manager@123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# Sales Executive Login
$body = @{ email = "sales@crm.com"; password = "Sales@123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

#### Test Registration:
- Navigate to http://localhost:3000/register
- Fill in user details
- Select a role (ADMIN, MANAGER, SALES_EXECUTIVE)
- Submit and verify redirect to login

### 2. Dashboard & Analytics

**What to Test:**
- [ ] Overview cards display correct numbers (Total Leads, Won Deals, Total Value, Leads This Month)
- [ ] Growth rate percentage shown
- [ ] Status Distribution Chart (Doughnut) renders with colored segments
- [ ] Priority Breakdown Chart (Bar) shows priority levels
- [ ] Conversion Funnel Chart (Line) displays sales stages
- [ ] Recent Activities list shows latest 5 activities
- [ ] Upcoming Tasks list shows tasks due soon
- [ ] Dark mode toggle works for all charts

**How to Test:**
1. Login as admin@crm.com
2. View dashboard at http://localhost:3000/
3. Verify charts render correctly
4. Toggle dark mode and check chart colors update

### 3. Lead Management

**What to Test:**
- [ ] Lead list displays with pagination
- [ ] Inline "Create New Lead" form works
- [ ] Lead creation triggers notification (if owner != creator)
- [ ] Lead status change creates activity log
- [ ] Status change triggers email (if EMAIL_ENABLED=true)
- [ ] Search and filter functionality
- [ ] Role-based data visibility (SALES_EXECUTIVE sees only their leads)

**How to Test:**
1. Navigate to Leads page
2. Click "Create New Lead" and fill form
3. Assign to different user and submit
4. Check notification bell for new notification
5. Update lead status
6. Verify activity log updated

### 4. Real-Time Notifications

**What to Test:**
- [ ] Notification bell shows unread count
- [ ] Clicking bell opens dropdown
- [ ] New notifications appear in real-time
- [ ] Toast notification shows for new alerts
- [ ] "Mark as read" functionality works
- [ ] "Mark all as read" button works
- [ ] Clicking notification navigates to related item

**How to Test:**
1. Open two browser windows (different users)
2. Window 1: Login as admin@crm.com
3. Window 2: Login as sales@crm.com
4. Window 1: Create a lead and assign to sales@crm.com
5. Window 2: Should see notification bell update + toast
6. Click bell to view notification
7. Click notification to navigate to lead

### 5. Task Management

**What to Test:**
- [ ] Task list displays assigned tasks
- [ ] Create new task functionality
- [ ] Task assignment triggers notification + email
- [ ] Task status update works
- [ ] Due date filtering
- [ ] Priority sorting

**How to Test:**
1. Navigate to Tasks page
2. Create new task and assign to user
3. Check notification sent to assigned user
4. Update task status to COMPLETED
5. Verify completedAt timestamp set

### 6. Activities & Timeline

**What to Test:**
- [ ] Activities page shows all activities
- [ ] Activity types display correctly (CALL, EMAIL, MEETING, NOTE, etc.)
- [ ] Activities created automatically on lead status change
- [ ] Activity filtering by type and date

**How to Test:**
1. Navigate to Activities page
2. Create/update a lead
3. Verify new activity appears
4. Filter by activity type
5. Check timestamps are correct

### 7. Email Notifications (Optional)

**To Enable:**
1. Edit `backend/.env`
2. Set `EMAIL_ENABLED=true`
3. Configure SMTP settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-specific-password
   SMTP_FROM="CRM System <noreply@crm.com>"
   ```
4. Restart backend server

**What to Test:**
- [ ] Lead assignment sends email
- [ ] Lead status change sends email
- [ ] Task assignment sends email
- [ ] Emails have professional HTML formatting

### 8. Dark Mode

**What to Test:**
- [ ] Toggle button in header works
- [ ] Theme persists after page reload
- [ ] All pages render correctly in dark mode
- [ ] Charts update colors for dark theme
- [ ] Forms and inputs visible in dark mode

### 9. Role-Based Access Control

**What to Test:**

**As ADMIN:**
- [ ] Can see all leads
- [ ] Can create/update/delete any lead
- [ ] Can assign leads to any user
- [ ] Can view all analytics

**As MANAGER:**
- [ ] Can see all leads
- [ ] Can create/update leads
- [ ] Can assign leads to team members
- [ ] Can view team analytics

**As SALES_EXECUTIVE:**
- [ ] Can only see assigned leads
- [ ] Can update own leads
- [ ] Cannot assign leads to others
- [ ] Can view personal analytics only

### 10. WebSocket / Real-Time Features

**What to Test:**
- [ ] Socket connection established on login
- [ ] Socket disconnects on logout
- [ ] Lead updates broadcast to users in same lead room
- [ ] Notifications delivered in real-time
- [ ] Socket reconnects automatically on connection loss

**How to Test:**
1. Open browser DevTools → Network → WS tab
2. Login and verify socket connection
3. Check for `notification:new`, `lead:updated` events
4. Create notifications and watch WebSocket messages

## 🔍 API Testing with PowerShell

### Get Dashboard Analytics:
```powershell
$token = "YOUR_ACCESS_TOKEN"
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/analytics/dashboard" -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
```

### Create Lead:
```powershell
$token = "YOUR_ACCESS_TOKEN"
$body = @{
  firstName = "John"
  lastName = "Doe"
  email = "john.doe@example.com"
  phone = "+1234567890"
  company = "Example Corp"
  status = "NEW"
  priority = "HIGH"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/v1/leads" -Method POST -Headers @{Authorization="Bearer $token"} -Body $body -ContentType "application/json" -UseBasicParsing
```

### Get Notifications:
```powershell
$token = "YOUR_ACCESS_TOKEN"
Invoke-WebRequest -Uri "http://localhost:5000/api/v1/notifications" -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing
```

## 🐛 Troubleshooting

### Backend Issues:
```powershell
# Check backend logs
cd backend
npm run dev
```

### Frontend Issues:
```powershell
# Check frontend console
cd frontend
npm run dev
```

### Database Issues:
```powershell
# Reset database
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### Email Not Sending:
1. Verify EMAIL_ENABLED=true in .env
2. Check SMTP credentials
3. For Gmail, use App-Specific Password
4. Check backend logs for email errors

## 📊 Expected Results

After running the seed script, you should have:
- **3 Users**: admin@crm.com, manager@crm.com, sales@crm.com
- **10 Leads**: Various statuses and priorities
- **25+ Activities**: STATUS_CHANGE, CALL, EMAIL, MEETING, etc.
- **10 Tasks**: Mix of TODO, IN_PROGRESS, COMPLETED
- **Sample Notifications**: For task assignments and lead updates

## ✨ Key Features to Showcase

1. **Live Dashboard** with interactive charts
2. **Real-time notifications** via WebSocket
3. **Email notifications** (when enabled)
4. **Dark mode** support throughout
5. **Role-based access** control
6. **Activity timeline** tracking all changes
7. **Task management** with assignments
8. **Search and filter** across all entities

## 🎯 Next Steps

After testing, you can:
1. Enable email notifications in production
2. Implement webhook integrations (Slack, etc.)
3. Add more chart types (time-series, heat maps)
4. Enhance activity timeline UI component
5. Add export functionality (CSV, PDF)
6. Implement advanced search with Elasticsearch
7. Add file attachments to leads/activities

---

**Note**: Email notifications are disabled by default. Set `EMAIL_ENABLED=true` in backend/.env to enable them.
