const DEFAULT_API_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8000'

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

type ApiFetchOptions = RequestInit & {
  baseUrl?: string
}

export async function apiFetch<TResponse = unknown>(
  path: string,
  { baseUrl = DEFAULT_API_URL, headers, ...init }: ApiFetchOptions = {}
): Promise<TResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  })

  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const body = isJson ? await response.json().catch(() => null) : await response.text()

  if (!response.ok) {
    // Extraction sécurisée du message d'erreur
    let message = 'Erreur API'
    
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = body.detail
      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        // Erreurs de validation Pydantic
        message = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
      } else if (typeof detail === 'object' && detail.msg) {
        message = detail.msg
      } else if (typeof detail === 'object') {
        message = JSON.stringify(detail)
      }
    } else if (typeof body === 'string' && body) {
      message = body
    } else if (response.statusText) {
      message = response.statusText
    }

    throw new ApiError(message, response.status, body ?? undefined)
  }

  return (isJson ? body : ({} as TResponse)) as TResponse
}

export function persistToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (!token) {
    window.localStorage.removeItem('audit_iq_token')
    return
  }
  window.localStorage.setItem('audit_iq_token', token)
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('audit_iq_token')
}

