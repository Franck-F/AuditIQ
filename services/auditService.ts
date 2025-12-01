const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface Audit {
  id: number
  name: string
  status: string
  score: number
  created_at: string
  dataset_id?: number
  dataset_name?: string
}

export const auditService = {
  getAll: async (): Promise<Audit[]> => {
    const response = await fetch(`${API_URL}/audits`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch audits')
    return response.json()
  },

  getById: async (id: number): Promise<Audit> => {
    const response = await fetch(`${API_URL}/audits/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch audit')
    return response.json()
  },

  create: async (data: any): Promise<Audit> => {
    const response = await fetch(`${API_URL}/audits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create audit')
    return response.json()
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/audits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to delete audit')
  }
}
