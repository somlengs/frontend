import { NextRequest, NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api-client-server'
import { BACKEND_API_ROUTES } from '@/lib/config'


// GET /api/v1/project/[id]/download - Download project dataset
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const response = await fetchBackend(
            BACKEND_API_ROUTES.PROJECTS.DOWNLOAD(id),
            { method: 'GET' }
        )

        if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            return NextResponse.json(
                { error: data.message || 'Failed to download project' },
                { status: response.status }
            )
        }

        // Forward the response headers and body for file download
        const headers = new Headers(response.headers)

        // Ensure we have the correct content type and disposition
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/zip')
        }

        return new NextResponse(response.body, {
            status: response.status,
            headers,
        })
    } catch (error) {
        console.error('Error downloading project:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
