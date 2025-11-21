import { NextRequest, NextResponse } from 'next/server'
import { fetchBackend, getAuthHeaders } from '@/lib/api-client'
import { API_CONFIG, BACKEND_API_ROUTES } from '@/lib/config'

// GET /api/v1/project - Fetch all projects
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching projects from backend:', BACKEND_API_ROUTES.PROJECTS.LIST)
    
    let response: Response
    try {
      response = await fetchBackend(BACKEND_API_ROUTES.PROJECTS.LIST, {
        method: 'GET',
      })
    } catch (fetchError) {
      console.error('Failed to connect to backend:', fetchError)
      return NextResponse.json(
        { 
          error: 'Failed to connect to backend server',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          hint: 'Make sure the backend server is running at ' + (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
        },
        { status: 503 }
      )
    }
    
    console.log('Backend response status:', response.status)
    
    let data: any
    try {
      data = await response.json()
      console.log('Backend response data:', data)
    } catch (jsonError) {
      console.error('Failed to parse backend response:', jsonError)
      const text = await response.text()
      console.error('Response text:', text)
      return NextResponse.json(
        { 
          error: 'Invalid response from backend',
          details: 'Backend returned non-JSON response',
          status: response.status
        },
        { status: 502 }
      )
    }
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || data.error || 'Failed to fetch projects',
          details: data.details,
          status: response.status
        },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error fetching projects:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/project - Create project
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let backendResponse: Response

    if (contentType.includes('multipart/form-data')) {
      // Forward multipart form data (files + optional fields)
      const incomingFormData = await request.formData()
      const formData = new FormData()

      incomingFormData.forEach((value, key) => {
        // Preserve all keys, including multiple "files"
        formData.append(key, value)
      })

      const authHeaders = await getAuthHeaders()
      // Ensure we don't override Content-Type so boundary is set automatically
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ['Content-Type']: _removed, ...safeHeaders } = authHeaders as Record<string, string>

      const url = `${API_CONFIG.BASE_URL}${BACKEND_API_ROUTES.PROJECTS.CREATE}`

      backendResponse = await fetch(url, {
        method: 'POST',
        headers: safeHeaders,
        body: formData,
      })
    } else {
      // Fallback: JSON body without files
      const body = await request.json()

      backendResponse = await fetchBackend(BACKEND_API_ROUTES.PROJECTS.CREATE, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    }

    let data: any
    try {
      data = await backendResponse.json()
    } catch {
      data = { message: await backendResponse.text() }
    }

    const backendMessage = data?.error || data?.message

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: backendMessage || 'Failed to create project',
          message: backendMessage || 'Failed to create project',
        },
        { status: backendResponse.status }
      )
    }

    // Ensure success responses always have a message field too (optional)
    const responseBody =
      typeof data === 'object' && data !== null
        ? { ...data, message: data.message || 'Project created successfully' }
        : data

    return NextResponse.json(responseBody, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

