import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

/**
 * Get dashboard analytics
 * @route GET /api/v1/analytics/dashboard
 * @access Private
 */
export const getDashboardAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const where: any = {};

    // Role-based filtering
    if (req.user?.role === 'SALES_EXECUTIVE') {
      where.ownerId = req.user.id;
    }

    const [
      totalLeads,
      leadsByStatus,
      leadsByPriority,
      recentActivities,
      upcomingTasks,
      leadsThisMonth,
      leadsLastMonth,
      wonDeals,
      totalValue,
    ] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      prisma.activity.findMany({
        where: req.user?.role === 'SALES_EXECUTIVE' ? { userId: req.user.id } : {},
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: {
          assignedTo: req.user?.id,
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.lead.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.lead.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.lead.count({
        where: { ...where, status: 'WON' },
      }),
      prisma.lead.aggregate({
        where: { ...where, status: 'WON' },
        _sum: { value: true },
      }),
    ]);

    // Calculate growth rate
    const growthRate =
      leadsLastMonth > 0
        ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100
        : 0;

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalLeads,
          wonDeals,
          totalValue: totalValue._sum.value || 0,
          leadsThisMonth,
          growthRate: Math.round(growthRate * 100) / 100,
        },
        leadsByStatus,
        leadsByPriority,
        recentActivities,
        upcomingTasks,
      },
    });
  }
);

/**
 * Get performance metrics
 * @route GET /api/v1/analytics/performance
 * @access Private (Manager/Admin)
 */
export const getPerformanceMetrics = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate, userId } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const userFilter = userId ? { ownerId: userId as string } : {};

    const [
      leadConversionByUser,
      activityCountByUser,
      topPerformers,
    ] = await Promise.all([
      prisma.lead.groupBy({
        by: ['ownerId', 'status'],
        where: {
          ...userFilter,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _count: true,
      }),
      prisma.activity.groupBy({
        by: ['userId', 'type'],
        where: {
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['ownerId'],
        where: {
          status: 'WON',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _count: true,
        _sum: { value: true },
        orderBy: { _count: { ownerId: 'desc' } },
        take: 5,
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        leadConversionByUser,
        activityCountByUser,
        topPerformers,
      },
    });
  }
);

/**
 * Get lead conversion funnel
 * @route GET /api/v1/analytics/funnel
 * @access Private
 */
export const getConversionFunnel = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const where: any = {};

    if (req.user?.role === 'SALES_EXECUTIVE') {
      where.ownerId = req.user.id;
    }

    const funnelData = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: true,
      orderBy: { _count: { status: 'desc' } },
    });

    res.status(200).json({
      status: 'success',
      data: { funnel: funnelData },
    });
  }
);
