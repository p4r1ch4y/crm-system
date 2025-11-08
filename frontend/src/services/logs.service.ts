import apiClient from './api.client';

export interface LogRecordResponse {
  file: string;
  count: number;
  records: any[];
  filters?: {
    from?: string;
    to?: string;
    level?: string;
    search?: string;
  };
}

export async function fetchLogs(params: { 
  limit?: number; 
  level?: string; 
  search?: string; 
  type?: 'audit' | 'main';
  from?: string;
  to?: string;
} = {}): Promise<LogRecordResponse> {
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', String(params.limit));
  if (params.level) query.append('level', params.level);
  if (params.search) query.append('search', params.search);
  if (params.type) query.append('type', params.type);
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);
  return apiClient.get(`/logs?${query.toString()}`);
}

