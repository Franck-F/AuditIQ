import { apiFetch, ApiError, persistToken } from '@/lib/api-client'

type LoginResponse = {
  access_token: string
  token_type: string
}

type RegisterResponse = LoginResponse | { message: string }

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  if (!email || !password) {
    throw new ApiError('Email et mot de passe requis', 400)
  }

  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)

  const data = await apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  persistToken(data.access_token)
  return data
}

export type SignupPayload = {
  email: string
  password: string
  first_name: string
  last_name: string
  company_name: string
  sector: string
  company_size: string
}

export async function registerUser(payload: SignupPayload): Promise<RegisterResponse> {
  const requiredFields = [
    'email',
    'password',
    'first_name',
    'last_name',
    'company_name',
    'sector',
    'company_size',
  ] as const

  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new ApiError(`Le champ ${field} est requis`, 400)
    }
  }

  const data = await apiFetch<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if ('access_token' in data) {
    persistToken(data.access_token)
  }

  return data
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
    })
  } finally {
    // Quoi qu'il arrive, on nettoie le token local
    persistToken(null)
  }
}

