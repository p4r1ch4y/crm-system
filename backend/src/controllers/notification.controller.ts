import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get all notifications for current user
 * @route GET /api/v1/notifications
 * @access Private
 */
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, isRead } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {
      userId: req.user?.id,
    };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.user?.id, isRead: false },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
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
 * Mark notification as read
 * @route PATCH /api/v1/notifications/:id/read
 * @access Private
 */
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id, userId: req.user?.id },
      data: { isRead: true },
    });

    res.status(200).json({
      status: 'success',
      data: { notification },
    });
  }
);

/**
 * Mark all notifications as read
 * @route PATCH /api/v1/notifications/read-all
 * @access Private
 */
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    await prisma.notification.updateMany({
      where: { userId: req.user?.id, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  }
);

/**
 * Delete notification
 * @route DELETE /api/v1/notifications/:id
 * @access Private
 */
export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id, userId: req.user?.id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
