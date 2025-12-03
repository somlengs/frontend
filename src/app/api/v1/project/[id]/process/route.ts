import { NextRequest, NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api-client-server'
import { BACKEND_API_ROUTES } from '@/lib/config'

// POST /api/v1/project/[id]/process - Process the transcription
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await fetchBackend(
      BACKEND_API_ROUTES.PROJECTS.PROCESS(id),
      {
        method: 'POST',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to process transcription' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error processing transcription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/v1/project/[id]/process - Get the process output
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await fetchBackend(
      BACKEND_API_ROUTES.PROJECTS.PROCESS(id),
      { method: 'GET' }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch process output' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching process output:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

