import { createClient } from '@/lib/supabase/client'
import { API_CONFIG } from './config'

export async function getAuthHeaders() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  if (API_CONFIG.API_KEY) {
    headers['X-API-Key'] = API_CONFIG.API_KEY
  }

  return headers
}

export async function fetchBackend(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const headers = await getAuthHeaders()

    const url = `${API_CONFIG.BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (response.status === 401) {
      // Handle session expiration globally
      if (typeof window !== 'undefined') {
        window.location.href = '/signin'
      }
    }

    return response
  } catch (error) {
    console.error('Error in fetchBackend:', error)
    throw error
  }
}

