import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'SALES_EXECUTIVE']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});

// Lead validation schemas
export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    status: z
      .enum([
        'NEW',
        'CONTACTED',
        'QUALIFIED',
        'PROPOSAL',
        'NEGOTIATION',
        'WON',
        'LOST',
        'ARCHIVED',
      ])
      .optional(),
    source: z.string().optional(),
    value: z.number().positive().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    ownerId: z.string().uuid().optional(),
  }),
});

export const updateLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    status: z
      .enum([
        'NEW',
        'CONTACTED',
        'QUALIFIED',
        'PROPOSAL',
        'NEGOTIATION',
        'WON',
        'LOST',
        'ARCHIVED',
      ])
      .optional(),
    source: z.string().optional(),
    value: z.number().positive().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    ownerId: z.string().uuid().optional(),
  }),
});

// Activity validation schemas
export const createActivitySchema = z.object({
  body: z.object({
    type: z.enum(['NOTE', 'CALL', 'EMAIL', 'MEETING', 'TASK', 'STATUS_CHANGE']),
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().optional(),
    duration: z.number().int().positive().optional(),
    outcome: z.string().optional(),
    leadId: z.string().uuid('Invalid lead ID'),
    scheduledAt: z.string().datetime().optional(),
  }),
});

export const updateActivitySchema = z.object({
  body: z.object({
    subject: z.string().min(1).optional(),
    description: z.string().optional(),
    duration: z.number().int().positive().optional(),
    outcome: z.string().optional(),
    scheduledAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
  }),
});

// Task validation schemas
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().datetime().optional(),
    leadId: z.string().uuid().optional(),
    assignedTo: z.string().uuid('Invalid user ID'),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().datetime().optional(),
    assignedTo: z.string().uuid().optional(),
  }),
});
