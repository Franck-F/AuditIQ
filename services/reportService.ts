const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const reportService = {
  generate: async (auditId: number): Promise<any> => {
    const response = await fetch(`${API_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ audit_id: auditId })
    })
    if (!response.ok) throw new Error('Failed to generate report')
    return response.json()
  },

  getAll: async (): Promise<any[]> => {
    // Placeholder for future implementation
    return []
  }
}
