import { NextRequest, NextResponse } from 'next/server'
import { fetchBackend } from '@/lib/api-client-server'
import { BACKEND_API_ROUTES } from '@/lib/config'


async function extractParams(params: { id: string } | Promise<{ id: string }>) {
  return typeof (params as Record<string, unknown>).then === 'function' ? await params : (params as { id: string })
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json()
    return data?.message || data?.error || fallback
  } catch {
    try {
      const text = await response.text()
      return text || fallback
    } catch {
      return fallback
    }
  }
}

// GET /api/v1/project/[id] - Fetch specific project
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(context.params)
    const response = await fetchBackend(
      BACKEND_API_ROUTES.PROJECTS.GET(id),
      { method: 'GET' }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch project' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/project/[id] - Update project (Name, Description)
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(context.params)
    const body = await request.json()

    const response = await fetchBackend(
      BACKEND_API_ROUTES.PROJECTS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to update project' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/project/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await extractParams(context.params)
    const response = await fetchBackend(
      BACKEND_API_ROUTES.PROJECTS.DELETE(id),
      { method: 'DELETE' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: await getErrorMessage(response, 'Failed to delete project') },
        { status: response.status }
      )
    }
    let data: unknown = null
    try {
      data = await response.json()
    } catch {
      // no body
    }
    return NextResponse.json(data ?? { detail: 'Project deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete project' },
      { status: 500 }
    )
  }
}
