import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { API_CONFIG } from '@/lib/config'

export async function GET(request: NextRequest) {
    try {
        // Get auth from Supabase
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Forward SSE request to backend with auth header
        const backendUrl = `${API_CONFIG.BASE_URL}/v1/project/events`

        const response = await fetch(backendUrl, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Accept': 'text/event-stream',
            },
        })

        if (!response.ok) {
            return new Response(`Backend error: ${response.statusText}`, {
                status: response.status
            })
        }

        // Stream the response back to the client
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('[SSE Proxy] Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}
