import { API_URL } from '@/lib/config/api'

export interface Report {
  id: number
  audit_id: number
  audit_name?: string
  report_type: string
  generated_at: string
  file_path?: string
  status: 'ready' | 'generating' | 'failed'
}

export const reportService = {
  getAll: async (): Promise<Report[]> => {
    const response = await fetch(`${API_URL}/reports`, {
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 404) return [] // No reports yet
      throw new Error('Failed to fetch reports')
    }
    return response.json()
  },

  generate: async (auditId: number, reportType: string = 'comprehensive'): Promise<Report> => {
    const response = await fetch(`${API_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ 
        audit_id: auditId,
        report_type: reportType 
      })
    })
    if (!response.ok) throw new Error('Failed to generate report')
    return response.json()
  },

  download: async (reportId: number): Promise<Blob> => {
    const response = await fetch(`${API_URL}/reports/${reportId}/download`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to download report')
    return response.blob()
  }
}
