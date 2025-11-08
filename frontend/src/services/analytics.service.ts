import apiClient from './api.client';
import { DashboardAnalytics, PerformanceMetrics, ConversionFunnel } from '../types';

interface BackendResponse<T> {
  status: string;
  data: T;
}

export const analyticsService = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
   const response = await apiClient.get<BackendResponse<DashboardAnalytics>>(
      '/analytics/dashboard'
    );
   return response.data;
  },

  getPerformanceMetrics: async (): Promise<PerformanceMetrics[]> => {
   const response = await apiClient.get<BackendResponse<PerformanceMetrics[]>>(
      '/analytics/performance'
    );
   return response.data;
  },

  getConversionFunnel: async (): Promise<ConversionFunnel[]> => {
   const response = await apiClient.get<BackendResponse<ConversionFunnel[]>>(
      '/analytics/funnel'
    );
   return response.data;
  },
};
