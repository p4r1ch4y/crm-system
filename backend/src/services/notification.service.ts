import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { sendNotificationToUser } from '../socket/socket.handler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateNotificationData {
  userId: string;
  type: 'LEAD_ASSIGNED' | 'LEAD_STATUS_CHANGED' | 'TASK_ASSIGNED' | 'TASK_DUE' | 'ACTIVITY_REMINDER' | 'SYSTEM';
  title: string;
  message: string;
  metadata?: any;
}

class NotificationService {
  private io: SocketIOServer | null = null;

  setSocketIO(io: SocketIOServer) {
    this.io = io;
  }

  async createNotification(data: CreateNotificationData): Promise<void> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
          isRead: false,
        },
      });

      // Send real-time notification via Socket.IO
      if (this.io) {
        sendNotificationToUser(this.io, data.userId, notification);
      }

      logger.info(`Notification created for user ${data.userId}: ${data.title}`);
    } catch (error) {
      logger.error('Failed to create notification:', error);
    }
  }

  async createLeadAssignedNotification(
    userId: string,
    leadId: string,
    leadName: string,
    assignedBy: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'LEAD_ASSIGNED',
      title: 'New Lead Assigned',
      message: `${assignedBy} assigned you a new lead: ${leadName}`,
      metadata: { leadId, assignedBy, link: `/leads/${leadId}` },
    });
  }

  async createLeadStatusChangedNotification(
    userId: string,
    leadId: string,
    leadName: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'LEAD_STATUS_CHANGED',
      title: 'Lead Status Updated',
      message: `${changedBy} changed ${leadName} status from ${oldStatus} to ${newStatus}`,
      metadata: { leadId, oldStatus, newStatus, changedBy, link: `/leads/${leadId}` },
    });
  }

  async createTaskAssignedNotification(
    userId: string,
    taskId: string,
    taskTitle: string,
    assignedBy: string,
    dueDate?: Date
  ): Promise<void> {
    const dueDateStr = dueDate ? ` (Due: ${new Date(dueDate).toLocaleDateString()})` : '';
    await this.createNotification({
      userId,
      type: 'TASK_ASSIGNED',
      title: 'New Task Assigned',
      message: `${assignedBy} assigned you a task: ${taskTitle}${dueDateStr}`,
      metadata: { taskId, assignedBy, dueDate, link: `/tasks/${taskId}` },
    });
  }

  async createTaskDueSoonNotification(
    userId: string,
    taskId: string,
    taskTitle: string,
    dueDate: Date
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'TASK_DUE',
      title: 'Task Due Soon',
      message: `Task "${taskTitle}" is due on ${new Date(dueDate).toLocaleDateString()}`,
      metadata: { taskId, dueDate, link: `/tasks/${taskId}` },
    });
  }

  async createMentionNotification(
    userId: string,
    mentionedBy: string,
    context: string,
    link: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'ACTIVITY_REMINDER',
      title: 'You were mentioned',
      message: `${mentionedBy} mentioned you in ${context}`,
      metadata: { mentionedBy, context, link },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
      logger.info(`Notification ${notificationId} marked as read`);
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      logger.info(`All notifications marked as read for user ${userId}`);
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { userId, isRead: false },
      });
    } catch (error) {
      logger.error('Failed to get unread count:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
