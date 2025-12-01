import { api } from './api';

export interface Audit {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  score: number | null;
  created_at: string;
  risk_level?: string;
  results?: any;
}

export interface CreateAuditRequest {
  dataset_id: number;
  name: string;
  target_column: string;
  sensitive_attributes: string[];
  metrics: string[];
  use_case: string;
}

export const auditService = {
  getAll: async () => {
    const response = await api.get<Audit[]>('/audits/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Audit>(`/audits/${id}`);
    return response.data;
  },

  create: async (data: CreateAuditRequest) => {
    const response = await api.post<Audit>('/audits/create', data);
    return response.data;
  },
};
