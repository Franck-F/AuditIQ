import { api } from './api';

export interface Report {
  id: number;
  name: string;
  type: string;
  status: 'ready' | 'generating' | 'failed';
  created_at: string;
  url?: string;
  size?: string;
}

export const reportService = {
  generate: async (auditId: number) => {
    const response = await api.get<{ message: string; url: string }>(`/reports/generate/${auditId}`);
    return response.data;
  },

  download: async (auditId: number) => {
    // Trigger download directly via browser or fetch blob
    const response = await api.get(`/reports/${auditId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
