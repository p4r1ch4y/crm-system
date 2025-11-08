import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get all users
 * @route GET /api/v1/users
 * @access Private (Admin/Manager)
 */
export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users,
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
 * Get user by ID
 * @route GET /api/v1/users/:id
 * @access Private
 */
export const getUser = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

/**
 * Update user
 * @route PATCH /api/v1/users/:id
 * @access Private (Admin or own profile)
 */
export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check permissions
    if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
      return next(
        new AppError('You do not have permission to update this user', 403)
      );
    }

    // Prevent non-admin from changing role
    if (req.user?.role !== 'ADMIN' && updateData.role) {
      delete updateData.role;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

/**
 * Delete user
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin only)
 */
export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
