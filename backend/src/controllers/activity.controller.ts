import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get all activities for a lead
 * @route GET /api/v1/activities
 * @access Private
 */
export const getActivities = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { leadId, type, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (leadId) where.leadId = leadId as string;
    if (type) where.type = type as string;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
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
      }),
      prisma.activity.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        activities,
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
 * Create new activity
 * @route POST /api/v1/activities
 * @access Private
 */
export const createActivity = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      type,
      subject,
      description,
      duration,
      outcome,
      leadId,
      scheduledAt,
    } = req.body;

    // Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        description,
        duration,
        outcome,
        leadId,
        userId: req.user!.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { activity },
    });
  }
);

/**
 * Update activity
 * @route PATCH /api/v1/activities/:id
 * @access Private
 */
export const updateActivity = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return next(new AppError('Activity not found', 404));
    }

    // Check permissions
    if (
      req.user?.role === 'SALES_EXECUTIVE' &&
      existingActivity.userId !== req.user.id
    ) {
      return next(
        new AppError('You do not have permission to update this activity', 403)
      );
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: updateData,
      include: {
        user: {
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
      data: { activity },
    });
  }
);

/**
 * Delete activity
 * @route DELETE /api/v1/activities/:id
 * @access Private
 */
export const deleteActivity = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return next(new AppError('Activity not found', 404));
    }

    // Check permissions
    if (
      req.user?.role === 'SALES_EXECUTIVE' &&
      activity.userId !== req.user.id
    ) {
      return next(
        new AppError('You do not have permission to delete this activity', 403)
      );
    }

    await prisma.activity.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
