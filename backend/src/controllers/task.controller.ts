import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';

const prisma = new PrismaClient();

/**
 * Get all tasks with filters
 * @route GET /api/v1/tasks
 * @access Private
 */
export const getTasks = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      status,
      priority,
      assignedTo,
      leadId,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    // Role-based filtering
    if (req.user?.role === 'SALES_EXECUTIVE') {
      where.assignedTo = req.user.id;
    } else if (assignedTo) {
      where.assignedTo = assignedTo as string;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (leadId) where.leadId = leadId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        tasks,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

/**
 * Create new task
 * @route POST /api/v1/tasks
 * @access Private
 */
export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      leadId,
      assignedTo,
    } = req.body;

    // Verify assigned user exists
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedTo },
    });

    if (!assignedUser) {
      return next(new AppError('Assigned user not found', 404));
    }

    // Verify lead exists if provided
    if (leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        return next(new AppError('Lead not found', 404));
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        leadId,
        assignedTo,
        createdById: req.user!.id,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
      },
    });

    // Create notification and send email for assigned user
    if (assignedTo !== req.user?.id) {
      const assignedByName = `${req.user!.firstName} ${req.user!.lastName}`;
      const leadName = task.lead 
        ? `${task.lead.firstName} ${task.lead.lastName}`
        : undefined;

      // Create notification
      await notificationService.createTaskAssignedNotification(
        assignedTo,
        task.id,
        title,
        assignedByName,
        dueDate ? new Date(dueDate) : undefined
      );

      // Send email
      await emailService.sendTaskAssignedEmail(
        assignedUser.email,
        {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority: priority || 'MEDIUM',
          assignedBy: assignedByName,
          leadName,
        }
      );
    }

    res.status(201).json({
      status: 'success',
      data: { task },
    });
  }
);

/**
 * Update task
 * @route PATCH /api/v1/tasks/:id
 * @access Private
 */
export const updateTask = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return next(new AppError('Task not found', 404));
    }

    // Check permissions
    if (
      req.user?.role === 'SALES_EXECUTIVE' &&
      existingTask.assignedTo !== req.user.id &&
      existingTask.createdById !== req.user.id
    ) {
      return next(
        new AppError('You do not have permission to update this task', 403)
      );
    }

    // Set completedAt if status changed to COMPLETED
    if (updateData.status === 'COMPLETED' && !existingTask.completedAt) {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { task },
    });
  }
);

/**
 * Delete task
 * @route DELETE /api/v1/tasks/:id
 * @access Private
 */
export const deleteTask = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Check permissions
    if (
      req.user?.role === 'SALES_EXECUTIVE' &&
      task.createdById !== req.user.id
    ) {
      return next(
        new AppError('You do not have permission to delete this task', 403)
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
