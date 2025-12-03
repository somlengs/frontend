import { NextRequest, NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api-client-server'
import { BACKEND_API_ROUTES } from '@/lib/config'

export const runtime = 'edge'

// PATCH /api/v1/project/[id]/files/[fileId] - Edit file
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await params
    const body = await request.json()

    const response = await fetchBackend(
      BACKEND_API_ROUTES.PROJECTS.FILES.UPDATE(id, fileId),
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to update file' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/project/[id]/files/[fileId] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { id, fileId } = await params

    const response = await fetchBackend(
      BACKEND_API_ROUTES.PROJECTS.FILES.DELETE(id, fileId),
      { method: 'DELETE' }
    )

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(
        { error: data.message || 'Failed to delete file' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

