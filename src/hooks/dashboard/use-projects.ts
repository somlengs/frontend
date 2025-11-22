import { useState, useEffect, useCallback } from 'react'
import { API_ROUTES } from '@/lib/config'

// Helper to fetch file count for a project
async function fetchFileCount(projectId: string): Promise<number> {
  try {
    const response = await fetch(API_ROUTES.PROJECTS.FILES.LIST(projectId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      const files = Array.isArray(data) ? data : data?.files || data?.data || []
      return files.length
    }
  } catch (error) {
    console.error(`Error fetching file count for project ${projectId}:`, error)
  }
  return 0
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'processing' | 'completed' | 'error'
  audioFiles: number
  transcriptions: number
  createdAt: string
  lastModified: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true) // Start as true to show loading state initially
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.PROJECTS.LIST, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message =
          (errorData && (errorData.error || errorData.message)) ||
          `HTTP ${response.status}`
        throw new Error(message)
      }

      const data = await response.json()

      // Handle different response formats: array, { projects: [] }, { data: [] }
      const rawProjects = Array.isArray(data)
        ? data
        : data?.projects || data?.data || []

      // Debug: Log file counts from backend
      rawProjects.forEach((p: unknown) => {
        const proj = p as Record<string, unknown>
      })

      // Format date to YYYY-MM-DD
      const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A'
        try {
          const date = new Date(dateString)
          return date.toISOString().split('T')[0] // Returns YYYY-MM-DD
        } catch {
          return dateString
        }
      }

      // Map backend response to Project interface
      let projectsList: Project[] = rawProjects.map((p: unknown) => {
        const proj = p as Record<string, unknown>
        // Normalise backend status values to our limited set
        let status = (String(proj.status || 'draft')).toLowerCase()

        // Treat various in-progress states as "processing"
        if (status === 'loading' || status === 'pending' || status === 'in_progress') {
          status = 'processing'
        }

        // Normalise completed-like states
        if (status === 'done' || status === 'completed' || status === 'complete') {
          status = 'completed'
        }

        // Fallback to draft if we still don't recognise it
        if (!['draft', 'processing', 'completed', 'error'].includes(status)) {
          status = 'draft'
        }

        return {
          id: String(proj.id || proj.project_id || proj.id),
          name: String(proj.name || proj.project_name || 'Unnamed Project'),
          description: String(proj.description || proj.desc || ''),
          status: status as 'draft' | 'processing' | 'completed' | 'error',
          audioFiles: Number(proj.num_of_files ?? proj.audioFiles ?? proj.audio_files ?? proj.file_count ?? proj.files_count ?? 0),
          transcriptions: Number(proj.transcriptions || proj.transcription_count || 0),
          createdAt: formatDate(String(proj.created_at || proj.createdAt || proj.created)),
          lastModified: formatDate(String(proj.updated_at || proj.lastModified || proj.last_modified || proj.updated || proj.created_at || proj.createdAt))
        }
      })

      // If num_of_files is 0 but files might exist in storage, fetch file counts
      // This is a fallback - backend should ideally provide the count
      const projectsWithZeroFiles = projectsList.filter(p => p.audioFiles === 0)
      if (projectsWithZeroFiles.length > 0) {

        // Fetch file counts in parallel
        const fileCountPromises = projectsWithZeroFiles.map(async (project) => {
          const count = await fetchFileCount(project.id)
          return { id: project.id, count }
        })

        const fileCounts = await Promise.all(fileCountPromises)

        // Update projects with actual file counts
        projectsList = projectsList.map(project => {
          const fileCount = fileCounts.find(fc => fc.id === project.id)
          if (fileCount && fileCount.count > 0) {
            return { ...project, audioFiles: fileCount.count }
          }
          return project
        })
      }

      setProjects(projectsList)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createProject = useCallback(async (data: { name?: string; description?: string; files?: File[] }) => {
    setIsLoading(true)
    setError(null)

    try {
      const hasFiles = Array.isArray(data.files) && data.files.length > 0

      let response: Response

      if (hasFiles) {
        // Use multipart/form-data when files are provided
        const formData = new FormData()

        data.files!.forEach((file) => {
          formData.append('files', file)
        })

        if (data.name) {
          formData.append('name', data.name)
        }

        if (data.description) {
          formData.append('description', data.description)
        }

        response = await fetch(API_ROUTES.PROJECTS.CREATE, {
          method: 'POST',
          body: formData,
        })
      } else {
        // Fallback: JSON payload without files
        response = await fetch(API_ROUTES.PROJECTS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message =
          (errorData && (errorData.error || errorData.message)) ||
          `HTTP ${response.status}`
        throw new Error(message)
      }

      const newProject = await response.json()
      setProjects(prev => [newProject, ...prev])

      return { success: true, project: newProject }
    } catch (err: unknown) {
      console.error('Error creating project:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.PROJECTS.UPDATE(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message =
          (errorData && (errorData.error || errorData.message)) ||
          `HTTP ${response.status}`
        throw new Error(message)
      }

      const updatedProject = await response.json()
      setProjects(prev => prev.map(project =>
        project.id === id ? updatedProject : project
      ))

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(API_ROUTES.PROJECTS.GET(id), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const message =
          (errorData && (errorData.error || errorData.message)) ||
          `HTTP ${response.status}`
        throw new Error(message)
      }

      const project = await response.json()
      return { success: true, project }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.PROJECTS.DELETE(id), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      setProjects(prev => prev.filter(project => project.id !== id))

      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load projects on mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    clearError: () => setError(null)
  }
}
