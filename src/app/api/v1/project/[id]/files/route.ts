import { NextRequest, NextResponse } from 'next/server'
import { fetchBackend, getAuthHeaders } from '@/lib/api-client-server'
import { BACKEND_API_ROUTES, API_CONFIG } from '@/lib/config'


// GET /api/v1/project/[id]/files - Get all files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Forward query parameters to backend
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const backendUrl = BACKEND_API_ROUTES.PROJECTS.FILES.LIST(id) + (queryString ? `?${queryString}` : '')

    const response = await fetchBackend(
      backendUrl,
      { method: 'GET' }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch files' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/project/[id]/files - Add file(s)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()

    // Backend expects 'file' (singular) per request
    // We'll upload files one by one
    const files = formData.getAll('files')

    const headers = await getAuthHeaders()
    // Remove Content-Type header - fetch will set it automatically with boundary for FormData
    delete headers['Content-Type']

    const backendUrl = `${API_CONFIG.BASE_URL}${BACKEND_API_ROUTES.PROJECTS.FILES.CREATE(id)}`

    // Upload files sequentially (backend accepts one file at a time)
    const results = []
    for (const file of files) {
      const singleFileFormData = new FormData()
      singleFileFormData.append('file', file) // Backend expects 'file' not 'files'


      const response = await fetch(backendUrl, {
        method: 'POST',
        headers,
        body: singleFileFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(`Failed to upload ${(file as File).name}:`, data)
        return NextResponse.json(
          { error: data.message || data.error || `Failed to upload ${(file as File).name}` },
          { status: response.status }
        )
      }

      results.push(data)
    }

    // Return all uploaded files
    return NextResponse.json({ files: results.map(r => r.file) }, { status: 201 })
  } catch (error) {
    console.error('Error adding file:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

