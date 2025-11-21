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
      console.log('Raw backend response:', data)
      
      // Handle different response formats: array, { projects: [] }, { data: [] }
      const rawProjects = Array.isArray(data) 
        ? data 
        : data?.projects || data?.data || []
      
      console.log('Raw projects array:', rawProjects)
      // Debug: Log file counts from backend
      rawProjects.forEach((p: any) => {
        console.log(`Project ${p.name}: num_of_files = ${p.num_of_files}, audioFiles = ${p.audioFiles}`)
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
      let projectsList: Project[] = rawProjects.map((p: any) => {
        // Normalise backend status values to our limited set
        let status = (p.status || 'draft').toLowerCase()

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
          id: p.id || p.project_id || String(p.id),
          name: p.name || p.project_name || 'Unnamed Project',
          description: p.description || p.desc || '',
          status: status as 'draft' | 'processing' | 'completed' | 'error',
          audioFiles: p.num_of_files ?? p.audioFiles ?? p.audio_files ?? p.file_count ?? p.files_count ?? 0,
          transcriptions: p.transcriptions || p.transcription_count || 0,
          createdAt: formatDate(p.created_at || p.createdAt || p.created),
          lastModified: formatDate(p.updated_at || p.lastModified || p.last_modified || p.updated || p.created_at || p.createdAt)
        }
      })
      
      // If num_of_files is 0 but files might exist in storage, fetch file counts
      // This is a fallback - backend should ideally provide the count
      const projectsWithZeroFiles = projectsList.filter(p => p.audioFiles === 0)
      if (projectsWithZeroFiles.length > 0) {
        console.log(`Fetching file counts for ${projectsWithZeroFiles.length} project(s) with 0 files...`)
        
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
    } catch (err) {
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
    } catch (err) {
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
