import apiClient from './api.client';
import { Lead, PaginatedResponse, PaginationData } from '../types';

interface BackendResponse<T> {
  status: string;
  data: T;
}

export const leadService = {
  getLeads: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Lead>> => {
    const response = await apiClient.get<BackendResponse<{ leads: Lead[]; pagination: PaginationData }>>(
      '/leads',
      { params }
    );
    return { data: response.data.leads, pagination: response.data.pagination };
  },

  getLead: async (id: string): Promise<Lead> => {
    const response = await apiClient.get<BackendResponse<{ lead: Lead }>>(`/leads/${id}`);
    return response.data.lead;
  },

  createLead: async (data: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.post<BackendResponse<{ lead: Lead }>>('/leads', data);
    return response.data.lead;
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.patch<BackendResponse<{ lead: Lead }>>(
      `/leads/${id}`,
      data
    );
    return response.data.lead;
  },

  deleteLead: async (id: string): Promise<void> => {
    await apiClient.delete(`/leads/${id}`);
  },

  getLeadStats: async () => {
    const response = await apiClient.get<BackendResponse<any>>('/leads/stats');
    return response.data;
  },
};
