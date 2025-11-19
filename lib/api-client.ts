const DEFAULT_API_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8001'

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
    const message =
      (body && typeof body === 'object' && 'detail' in body && String(body.detail)) ||
      (typeof body === 'string' && body) ||
      response.statusText ||
      'Erreur API'

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

