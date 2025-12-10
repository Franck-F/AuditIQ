import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface EDADataSource {
  id: number;
  name: string;
  description?: string;
  source_type: 'csv' | 'warehouse' | 'api' | 'google_sheets';
  connection_config: any;
  ingestion_schedule: 'daily' | 'hourly' | 'weekly' | 'manual';
  last_ingestion?: string;
  is_active: boolean;
  created_at: string;
}

export interface EDAAnalysis {
  id: number;
  data_source_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  analysis_date: string;
  summary_stats?: any;
  top_anomalies?: AnomalyFinding[];
  findings_count?: number;
  error_message?: string;
}

export interface AnomalyFinding {
  metric_name: string;
  dimension?: string;
  dimension_value?: string;
  observed_value: number;
  expected_value: number;
  deviation_std: number;
  p_value: number;
  business_impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probable_root_cause?: string;
  confidence?: number;
}

export interface MorningReport {
  title: string;
  summary: string;
  findings: any[];
  recommendations: string[];
  metadata: {
    analysis_id: number;
    generated_at: string;
    total_anomalies: number;
    critical_count: number;
    high_count: number;
  };
}

class EDAService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Data Sources
  async getDataSources(): Promise<EDADataSource[]> {
    const response = await axios.get(`${API_URL}/api/eda/data-sources`, this.getAuthHeaders());
    return response.data;
  }

  async getDataSource(id: number): Promise<EDADataSource> {
    const response = await axios.get(`${API_URL}/api/eda/data-sources/${id}`, this.getAuthHeaders());
    return response.data;
  }

  async createDataSource(data: Partial<EDADataSource>): Promise<{ id: number; status: string }> {
    const response = await axios.post(`${API_URL}/api/eda/data-sources`, data, this.getAuthHeaders());
    return response.data;
  }

  async deleteDataSource(id: number): Promise<void> {
    await axios.delete(`${API_URL}/api/eda/data-sources/${id}`, this.getAuthHeaders());
  }

  // Analyses
  async runAnalysis(config: {
    data_source_id: number;
    metrics: any;
    dimensions: string[];
    confidence_level?: number;
  }): Promise<{ analysis_id: number; status: string }> {
    const response = await axios.post(`${API_URL}/api/eda/analyses/run`, config, this.getAuthHeaders());
    return response.data;
  }

  async getAnalyses(dataSourceId?: number): Promise<EDAAnalysis[]> {
    const params = dataSourceId ? { data_source_id: dataSourceId } : {};
    const response = await axios.get(`${API_URL}/api/eda/analyses`, {
      ...this.getAuthHeaders(),
      params,
    });
    return response.data;
  }

  async getAnalysis(id: number): Promise<EDAAnalysis> {
    const response = await axios.get(`${API_URL}/api/eda/analyses/${id}`, this.getAuthHeaders());
    return response.data;
  }

  // Reports
  async getLatestReport(): Promise<MorningReport> {
    const response = await axios.get(`${API_URL}/api/eda/reports/latest`, this.getAuthHeaders());
    return response.data;
  }
}

export const edaService = new EDAService();
