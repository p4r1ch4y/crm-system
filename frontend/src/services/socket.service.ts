import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

class SocketService {
  private socket: Socket | null = null;

  initialize(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = (import.meta as any).env?.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Real-time connection error');
    });
  }

  // Notification handlers
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification:new', callback);
  }

  offNotification() {
    this.socket?.off('notification:new');
  }

  // Lead update handlers
  onLeadUpdate(callback: (data: any) => void) {
    this.socket?.on('lead:updated', callback);
  }

  offLeadUpdate() {
    this.socket?.off('lead:updated');
  }

  // Activity handlers
  onActivityCreated(callback: (data: any) => void) {
    this.socket?.on('activity:created', callback);
  }

  offActivityCreated() {
    this.socket?.off('activity:created');
  }

  // Task update handlers
  onTaskUpdate(callback: (data: any) => void) {
    this.socket?.on('task:updated', callback);
  }

  offTaskUpdate() {
    this.socket?.off('task:updated');
  }

  // Join/leave lead rooms for real-time updates
  joinLeadRoom(leadId: string) {
    this.socket?.emit('lead:join', leadId);
  }

  leaveLeadRoom(leadId: string) {
    this.socket?.emit('lead:leave', leadId);
  }

  // Emit events
  emitLeadUpdate(data: any) {
    this.socket?.emit('lead:update', data);
  }

  emitActivityNew(data: any) {
    this.socket?.emit('activity:new', data);
  }

  emitTaskUpdate(data: any) {
    this.socket?.emit('task:update', data);
  }

  emitTyping(leadId: string) {
    this.socket?.emit('activity:typing', { leadId });
  }

  // Mark notification as read
  markNotificationRead(notificationId: string) {
    this.socket?.emit('notification:read', notificationId);
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Reconnect with new token
  reconnect(token: string) {
    this.disconnect();
    this.initialize(token);
  }
}

export const socketService = new SocketService();
