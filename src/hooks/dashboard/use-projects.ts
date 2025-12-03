import { useState, useEffect, useCallback } from 'react'
import { API_ROUTES } from '@/lib/config'
import { useProjectEvents } from './use-project-events'

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
  status: 'loading' | 'pending' | 'processing' | 'completed' | 'error'
  audioFiles: number
  transcriptions: number
  createdAt: string
  lastModified: string
}

export function useProjects(enableSSE: boolean = true) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true) // Start as true to show loading state initially
  const [error, setError] = useState<string | null>(null)

  // Helper function to convert technical errors to user-friendly messages
  // Helper function to convert technical errors to user-friendly messages
  const getFriendlyErrorMessage = useCallback((error: unknown, context: string): string => {
    // Check for specific error messages from backend
    const errorObj = error as Record<string, unknown>
    const errorMsg = (typeof errorObj?.message === 'string' ? errorObj.message : null) ||
      (typeof errorObj?.error === 'string' ? errorObj.error : null) ||
      String(error)

    // Map common errors to friendly messages
    if (errorMsg.includes('Invalid zip file') || errorMsg.includes('422')) {
      return 'Please upload a valid ZIP file containing your audio files'
    }
    if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
      return 'You don\'t have permission to perform this action'
    }
    if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
      return 'The requested resource was not found'
    }
    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
      return 'Your session has expired. Please sign in again'
    }
    if (errorMsg.includes('500') || errorMsg.includes('Internal Server Error')) {
      return 'Something went wrong on our end. Please try again later'
    }
    if (errorMsg.includes('Network') || errorMsg.includes('network')) {
      return 'Network error. Please check your connection and try again'
    }

    // Context-specific messages
    if (context === 'create') {
      return 'Unable to create project. Please check your files and try again'
    }
    if (context === 'export') {
      return 'Unable to export dataset. Make sure you have completed files to export'
    }
    if (context === 'process') {
      return 'Unable to start processing. Please make sure your project has files'
    }
    if (context === 'delete') {
      return 'Unable to delete project. Please try again'
    }

    // Generic fallback
    return `Something went wrong. Please try again`
  }, [])

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
        if (response.status === 401) {
          if (typeof window !== 'undefined') window.location.href = '/signin'
          throw new Error('Session expired')
        }
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
        let status = (String(proj.status || 'pending')).toLowerCase()

        // Keep pending as pending (waiting to be processed)
        if (status === 'pending' || status === 'waiting') {
          status = 'pending'
        }
        // Treat loading and in_progress as "processing"
        else if (status === 'loading' || status === 'in_progress') {
          status = 'processing'
        }
        // Normalise completed-like states
        else if (status === 'done' || status === 'completed' || status === 'complete') {
          status = 'completed'
        }
        // Fallback to pending if we still don't recognise it
        else if (!['loading', 'pending', 'processing', 'completed', 'error'].includes(status)) {
          status = 'pending'
        }

        return {
          id: String(proj.id || proj.project_id || proj.id),
          name: String(proj.name || proj.project_name || 'Unnamed Project'),
          description: String(proj.description || proj.desc || ''),
          status: status as 'loading' | 'pending' | 'processing' | 'completed' | 'error',
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

  // SSE event handlers
  const handleProjectCreated = useCallback((project: Project) => {
    console.log('[useProjects] Project created:', project)
    setProjects(prev => {
      // Check if project already exists
      if (prev.some(p => p.id === project.id)) {
        return prev
      }
      return [project, ...prev]
    })
  }, [])

  const handleProjectUpdated = useCallback((project: Project) => {
    console.log('[useProjects] Project updated:', project)
    setProjects(prev => prev.map(p => p.id === project.id ? project : p))
  }, [])

  const handleProjectDeleted = useCallback((projectId: string) => {
    console.log('[useProjects] Project deleted:', projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }, [])

  // Enable SSE for real-time updates
  useProjectEvents({
    enabled: enableSSE,
    onProjectCreated: handleProjectCreated,
    onProjectUpdated: handleProjectUpdated,
    onProjectDeleted: handleProjectDeleted,
  })

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
        if (response.status === 401) {
          if (typeof window !== 'undefined') window.location.href = '/signin'
          return { success: false, error: 'Session expired' }
        }

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
      const errorMessage = getFriendlyErrorMessage(err, 'create')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [getFriendlyErrorMessage])

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
        if (response.status === 401) {
          if (typeof window !== 'undefined') window.location.href = '/signin'
          return { success: false, error: 'Session expired' }
        }

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
      const errorMessage = getFriendlyErrorMessage(err, 'update')
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [getFriendlyErrorMessage])

  const getProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(API_ROUTES.PROJECTS.GET(id), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') window.location.href = '/signin'
          return { success: false, error: 'Session expired' }
        }

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
        if (response.status === 401) {
          if (typeof window !== 'undefined') window.location.href = '/signin'
          return { success: false, error: 'Session expired' }
        }
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

  const processProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(API_ROUTES.PROJECTS.PROCESS(projectId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to start processing')
      }

      const data = await response.json()

      // Refresh the projects list to get updated status
      await fetchProjects()

      return { success: true, message: data.detail }
    } catch (err) {
      const errorMessage = getFriendlyErrorMessage(err, 'process')
      console.error('Error processing project:', err)
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [fetchProjects, getFriendlyErrorMessage])

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
    processProject,
    clearError: () => setError(null)
  }
}
