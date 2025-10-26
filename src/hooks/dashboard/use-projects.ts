import { useState, useEffect } from 'react'
import { API_CONFIG, API_ROUTES } from '@/lib/config'

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ROUTES.PROJECTS.LIST}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.API_KEY,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setProjects(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const createProject = async (data: { name: string; description: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ROUTES.PROJECTS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
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
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ROUTES.PROJECTS.UPDATE(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
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
  }

  const deleteProject = async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ROUTES.PROJECTS.DELETE(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.API_KEY,
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
  }

  // Load projects on mount
  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError: () => setError(null)
  }
}
