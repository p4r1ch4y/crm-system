import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';

const prisma = new PrismaClient();

/**
 * Get all leads with filters and pagination
 * @route GET /api/v1/leads
 * @access Private
 */
export const getLeads = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      ownerId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (req.user?.role === 'SALES_EXECUTIVE') {
      where.ownerId = req.user.id;
    } else if (ownerId) {
      where.ownerId = ownerId as string;
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Search functionality
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              activities: true,
              tasks: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        leads,
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
 * Get single lead by ID
 * @route GET /api/v1/leads/:id
 * @access Private
 */
export const getLead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
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
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
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
        },
      },
    });

    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Check permissions
    if (
      req.user?.role === 'SALES_EXECUTIVE' &&
      lead.ownerId !== req.user.id
    ) {
      return next(
        new AppError('You do not have permission to access this lead', 403)
      );
    }

    res.status(200).json({
      status: 'success',
      data: { lead },
    });
  }
);

/**
 * Create new lead
 * @route POST /api/v1/leads
 * @access Private
 */
export const createLead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      status,
      source,
      value,
      priority,
      description,
      tags,
      ownerId,
    } = req.body;

    // Check if lead with email already exists
    const existingLead = await prisma.lead.findFirst({
      where: { email },
    });

    if (existingLead) {
      return next(new AppError('Lead with this email already exists', 400));
    }

    // Determine owner (if not specified, assign to creator)
    const finalOwnerId = ownerId || req.user!.id;

    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        position,
        status: status || 'NEW',
        source,
        value,
        priority: priority || 'MEDIUM',
        description,
        tags: tags || [],
        ownerId: finalOwnerId,
        createdById: req.user!.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity for lead creation
    await prisma.activity.create({
      data: {
        type: 'STATUS_CHANGE',
        subject: 'Lead created',
        description: `Lead created with status: ${lead.status}`,
        leadId: lead.id,
        userId: req.user!.id,
      },
    });

    // Send notifications and email if owner is different from creator
    if (finalOwnerId !== req.user!.id) {
      const creatorName = `${req.user!.firstName} ${req.user!.lastName}`;
      const leadName = `${lead.firstName} ${lead.lastName}`;
      
      // Create notification
      await notificationService.createLeadAssignedNotification(
        finalOwnerId,
        lead.id,
        leadName,
        creatorName
      );

      // Send email
      await emailService.sendLeadCreatedEmail(
        lead.owner.email,
        {
          firstName: lead.firstName,
          lastName: lead.lastName,
          company: lead.company || undefined,
          status: lead.status,
          assignedTo: `${lead.owner.firstName} ${lead.owner.lastName}`,
        }
      );
    }

    res.status(201).json({
      status: 'success',
      data: { lead },
    });
  }
);

/**
 * Update lead
 * @route PATCH /api/v1/leads/:id
 * @access Private
 */
export const updateLead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return next(new AppError('Lead not found', 404));
    }

    // Check permissions
    if (
      req.user?.role === 'SALES_EXECUTIVE' &&
      existingLead.ownerId !== req.user.id
    ) {
      return next(
        new AppError('You do not have permission to update this lead', 403)
      );
    }

    // Track status change
    if (updateData.status && updateData.status !== existingLead.status) {
      await prisma.activity.create({
        data: {
          type: 'STATUS_CHANGE',
          subject: 'Status changed',
          description: `Status changed from ${existingLead.status} to ${updateData.status}`,
          leadId: id,
          userId: req.user!.id,
        },
      });

      // Get owner details for notification and email
      const owner = await prisma.user.findUnique({
        where: { id: existingLead.ownerId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (owner) {
        const changedByName = `${req.user!.firstName} ${req.user!.lastName}`;
        const leadName = `${existingLead.firstName} ${existingLead.lastName}`;

        // Create notification
        await notificationService.createLeadStatusChangedNotification(
          existingLead.ownerId,
          id,
          leadName,
          existingLead.status,
          updateData.status,
          changedByName
        );

        // Send email
        await emailService.sendStatusChangeEmail(
          owner.email,
          {
            firstName: existingLead.firstName,
            lastName: existingLead.lastName,
            company: existingLead.company || undefined,
            oldStatus: existingLead.status,
            newStatus: updateData.status,
            changedBy: changedByName,
          }
        );
      }
    }

    // Update lead
    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { lead },
    });
  }
);

/**
 * Delete lead
 * @route DELETE /api/v1/leads/:id
 * @access Private (Admin/Manager/Owner)
 */
export const deleteLead = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    await prisma.lead.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * Get lead statistics
 * @route GET /api/v1/leads/stats
 * @access Private
 */
export const getLeadStats = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const where: any = {};

    // Role-based filtering
    if (req.user?.role === 'SALES_EXECUTIVE') {
      where.ownerId = req.user.id;
    }

    const [totalLeads, statusCounts, priorityCounts, recentLeads] =
      await Promise.all([
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
        prisma.lead.findMany({
          where,
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
      ]);

    res.status(200).json({
      status: 'success',
      data: {
        total: totalLeads,
        byStatus: statusCounts,
        byPriority: priorityCounts,
        recent: recentLeads,
      },
    });
  }
);
