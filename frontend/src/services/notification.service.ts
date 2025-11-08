import apiClient from './api.client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const notificationService = {
  getNotifications: async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    const response = await apiClient.get<{ status: string; data: NotificationsResponse }>(
      `/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getUnreadNotifications: async (): Promise<NotificationsResponse> => {
    const response = await apiClient.get<{ status: string; data: NotificationsResponse }>(
      `/notifications?isRead=false`
    );
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(`/notifications/read-all`);
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
};
