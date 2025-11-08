// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES_EXECUTIVE';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Lead types
export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'ARCHIVED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: LeadStatus;
  source?: string;
  value?: number;
  priority: Priority;
  description?: string;
  tags: string[];
  ownerId: string;
  owner?: User;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    activities: number;
    tasks: number;
  };
}

// Activity types
export type ActivityType =
  | 'NOTE'
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'TASK'
  | 'STATUS_CHANGE';

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  duration?: number;
  outcome?: string;
  leadId: string;
  lead?: Lead;
  userId: string;
  user?: User;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Task types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  leadId?: string;
  lead?: Lead;
  assignedTo: string;
  assignedUser?: User;
  createdById: string;
  createdBy?: User;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export type NotificationType =
  | 'LEAD_ASSIGNED'
  | 'TASK_ASSIGNED'
  | 'TASK_DUE'
  | 'LEAD_STATUS_CHANGED'
  | 'ACTIVITY_REMINDER'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  metadata?: any;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Dashboard analytics types
export interface DashboardAnalytics {
  overview: {
    totalLeads: number;
    wonDeals: number;
    totalValue: number;
    leadsThisMonth: number;
    growthRate: number;
  };
  leadsByStatus: Array<{
    status: LeadStatus;
    _count: number;
  }>;
  leadsByPriority: Array<{
    priority: Priority;
    _count: number;
  }>;
  recentActivities: Activity[];
  upcomingTasks: Task[];
}

export interface PerformanceMetrics {
  userId: string;
  userName: string;
  leadsCreated: number;
  leadsConverted: number;
  conversionRate: number;
  totalValue: number;
  activitiesLogged: number;
  tasksCompleted: number;
}

export interface ConversionFunnel {
  stage: LeadStatus;
  count: number;
  percentage: number;
}
