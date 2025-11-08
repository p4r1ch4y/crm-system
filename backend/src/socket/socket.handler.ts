import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

/**
 * Initialize Socket.IO server with authentication and event handlers
 */
export const initializeSocket = (io: SocketIOServer) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      );

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle lead updates
    socket.on('lead:update', (data) => {
      io.to(`lead:${data.leadId}`).emit('lead:updated', data);
    });

    // Handle activity updates
    socket.on('activity:new', (data) => {
      io.to(`lead:${data.leadId}`).emit('activity:created', data);
    });

    // Handle task updates
    socket.on('task:update', (data) => {
      if (data.assignedTo) {
        io.to(`user:${data.assignedTo}`).emit('task:updated', data);
      }
    });

    // Handle notifications
    socket.on('notification:read', async (notificationId) => {
      try {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
        socket.emit('notification:read:success', { notificationId });
      } catch (error) {
        socket.emit('notification:read:error', { error: 'Failed to mark as read' });
      }
    });

    // Handle typing indicators
    socket.on('activity:typing', (data) => {
      socket.to(`lead:${data.leadId}`).emit('activity:typing', {
        userId: socket.userId,
        leadId: data.leadId,
      });
    });

    // Join lead room
    socket.on('lead:join', (leadId) => {
      socket.join(`lead:${leadId}`);
      logger.info(`User ${socket.userId} joined lead room: ${leadId}`);
    });

    // Leave lead room
    socket.on('lead:leave', (leadId) => {
      socket.leave(`lead:${leadId}`);
      logger.info(`User ${socket.userId} left lead room: ${leadId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

/**
 * Send notification to specific user
 */
export const sendNotificationToUser = (
  io: SocketIOServer,
  userId: string,
  notification: any
) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};

/**
 * Broadcast lead update to all users watching that lead
 */
export const broadcastLeadUpdate = (
  io: SocketIOServer,
  leadId: string,
  data: any
) => {
  io.to(`lead:${leadId}`).emit('lead:updated', data);
};
