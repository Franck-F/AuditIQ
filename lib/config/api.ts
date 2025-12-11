/**
 * API Configuration
 * 
 * Centralized API URL configuration for all API calls
 */

export const API_CONFIG = {
  // Base URL for API calls
  // In production, this should point to your deployed backend
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  
  // Helper to build full API URLs
  url: (path: string) => {
    const base = API_CONFIG.baseUrl
    // Retirer leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    // Retirer /api prefix from path if present (since baseUrl already includes it)
    const finalPath = cleanPath.startsWith('api/') ? cleanPath.slice(4) : cleanPath
    return `${base}/${finalPath}`
  }
}

// Export commonly used endpoints
export const API_ENDPOINTS = {
  auth: {
    me: API_CONFIG.url('auth/me'),
    login: API_CONFIG.url('auth/login'),
    logout: API_CONFIG.url('auth/logout'),
    signup: API_CONFIG.url('auth/signup'),
  },
  team: {
    members: API_CONFIG.url('team/members'),
  },
  audits: API_CONFIG.url('audits'),
  connections: API_CONFIG.url('connections'),
  datasets: API_CONFIG.url('datasets'),
  reports: API_CONFIG.url('reports'),
  // Ajouter more endpoints as needed
}

// For backward compatibility - export API_URL
export const API_URL = API_CONFIG.baseUrl
