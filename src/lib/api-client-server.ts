import { createClient } from '@/lib/supabase/server'
import { API_CONFIG } from './config'

export async function getAuthHeaders() {
    const supabase = await createClient()
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

        return response
    } catch (error) {
        console.error('Error in fetchBackend:', error)
        throw error
    }
}
