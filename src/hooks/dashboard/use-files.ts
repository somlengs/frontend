import { useState, useEffect, useCallback } from 'react'
import { API_ROUTES } from '@/lib/config'
import { AudioFile } from './use-file-upload'
import { useFileEvents } from './use-file-events'
export type { AudioFile }

// Helper functions for data mapping
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatDurationValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '00:00:00'
  }

  // Backend duration might be in milliseconds. Convert to seconds if > 1000.
  const seconds = value > 1000 ? value / 1000 : value
  return formatDuration(seconds)
}

function mapStatus(status: string): 'pending' | 'completed' | 'processing' | 'error' | 'queued' {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'pending' || normalized === 'waiting') {
    return 'pending'
  }
  if (normalized === 'queued') {
    return 'queued'
  }
  if (normalized === 'completed' || normalized === 'finished' || normalized === 'done') {
    return 'completed'
  }
  if (normalized === 'processing' || normalized === 'ongoing' || normalized === 'in_progress') {
    return 'processing'
  }
  if (normalized === 'error' || normalized === 'failed') {
    return 'error'
  }
  // Default to pending (not processing) to match backend initial state
  return 'pending'
}

export function useFiles(projectId: string, enableSSE: boolean = true) {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async (silent = false) => {
    if (!projectId) return

    if (!silent) {
      setIsLoading(true)
    }
    setError(null)

    try {
      // Fetch files without limit - use backend's default pagination
      const baseUrl = API_ROUTES.PROJECTS.FILES.LIST(projectId)
      const url = baseUrl

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()

      // Backend returns paginated response: { data: [...], pagination: {...} }
      // Also support legacy formats for backwards compatibility
      const rawFiles = data.data || data.files || (Array.isArray(data) ? data : [])

      // Map backend response to frontend AudioFile format
      const mappedFiles: AudioFile[] = rawFiles.map((f: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const file = f as any;

        const transcription =
          file.transcription ||
          file.transcription_text ||
          file.transcription_content ||
          file.transcriptions?.[0]?.data ||
          null

        // Backend returns 'transcription_status', prioritize it first
        const rawStatus = file.transcription_status || file.status || file.processing_status || 'pending'
        let status = mapStatus(rawStatus)



        // If we already have a transcription but backend status is still "processing",
        // treat it as completed for UX purposes.
        if (status === 'processing' && transcription) {
          status = 'completed'
        }

        return {
          id: String(file.id || file.file_id || file.fileId || ''),
          name: file.name || file.file_name || file.filename || 'Unknown',
          duration: formatDurationValue(
            file.duration ?? file.duration_seconds ?? file.duration_ms,
          ),
          size: formatFileSize(file.file_size ?? file.size_bytes ?? file.size ?? 0),
          status,
          transcription,
          createdAt:
            file.created_at || file.createdAt || file.created || new Date().toISOString(),
          updatedAt:
            file.updated_at || file.updatedAt || file.updated || file.created_at || file.createdAt,
          audioUrl:
            file.public_url ||
            file.audioUrl ||
            file.file_url ||
            file.url ||
            undefined,
        }
      })

      // Keep files in backend order (no sorting needed)
      // All files get processed anyway, order is cosmetic

      setFiles(mappedFiles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch files'
      setError(errorMessage)
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [projectId])

  // SSE event handlers
  const handleFileCreated = useCallback((event: import('./use-file-events').FileEvent) => {


    // Convert FileEvent to AudioFile format
    const file: AudioFile = {
      id: event.file_id || '',
      name: event.file_name || 'Unknown',
      duration: formatDurationValue(event.duration),
      size: formatFileSize(event.file_size || 0),
      status: mapStatus(event.transcription_status || 'processing'),
      transcription: event.transcription_content || undefined,
      createdAt: event.created_at || new Date().toISOString(),
      updatedAt: event.updated_at || event.created_at || new Date().toISOString(),
      audioUrl: event.public_url || undefined,
    }

    setFiles(prev => {
      // Check if file already exists
      if (prev.some(f => f.id === file.id)) {
        return prev
      }
      return [...prev, file]
    })
  }, [])

  const handleFileUpdated = useCallback((event: import('./use-file-events').FileEvent) => {


    // Convert FileEvent to AudioFile format
    const file: AudioFile = {
      id: event.file_id || '',
      name: event.file_name || 'Unknown',
      duration: formatDurationValue(event.duration),
      size: formatFileSize(event.file_size || 0),
      status: mapStatus(event.transcription_status || 'processing'),
      transcription: event.transcription_content || undefined,
      createdAt: event.created_at || new Date().toISOString(),
      updatedAt: event.updated_at || event.created_at || new Date().toISOString(),
      audioUrl: event.public_url || undefined,
    }

    setFiles(prev => prev.map(f => f.id === file.id ? file : f))
  }, [])

  const handleFileDeleted = useCallback(() => {

    fetchFiles()
  }, [fetchFiles])

  // Disable SSE for now - use manual refresh or polling instead
  useFileEvents(projectId, {
    enabled: false, // Disabled to reduce API calls
    onFileCreated: handleFileCreated,
    onFileUpdated: handleFileUpdated,
    onFileDeleted: handleFileDeleted,
  })

  const updateFile = async (fileId: string, data: Partial<AudioFile>) => {
    setIsLoading(true)
    setError(null)

    try {
      // Transform frontend field names to backend field names
      const backendData: Record<string, unknown> = {}
      if (data.name !== undefined) {
        backendData.file_name = data.name
      }
      if (data.transcription !== undefined) {
        backendData.transcription_content = data.transcription
      }

      const response = await fetch(
        API_ROUTES.PROJECTS.FILES.UPDATE(projectId, fileId),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendData),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const responseData = await response.json()
      const updatedFile = responseData.file || responseData.data || responseData

      // Map backend response to frontend format
      const mappedFile: AudioFile = {
        id: String(updatedFile.id || updatedFile.file_id || fileId),
        name: updatedFile.name || updatedFile.file_name || updatedFile.filename || '',
        duration: formatDurationValue(updatedFile.duration ?? updatedFile.duration_seconds ?? updatedFile.duration_ms),
        size: formatFileSize(updatedFile.file_size ?? updatedFile.size_bytes ?? updatedFile.size ?? 0),
        status: mapStatus(updatedFile.status || updatedFile.processing_status || updatedFile.transcription_status || 'processing'),
        transcription: updatedFile.transcription || updatedFile.transcription_text || updatedFile.transcription_content || updatedFile.transcriptions?.[0]?.data || null,
        createdAt: updatedFile.created_at || updatedFile.createdAt || updatedFile.created || new Date().toISOString(),
        updatedAt: updatedFile.updated_at || updatedFile.updatedAt || updatedFile.updated || updatedFile.created_at || updatedFile.createdAt,
        audioUrl: updatedFile.audioUrl || updatedFile.file_url || updatedFile.url || updatedFile.public_url || undefined
      }

      setFiles(prev => prev.map(file =>
        file.id === fileId ? mappedFile : file
      ))

      return { success: true }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update file'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        API_ROUTES.PROJECTS.FILES.DELETE(projectId, fileId),
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      setFiles(prev => prev.filter(file => file.id !== fileId))

      return { success: true }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchFiles()
    }
  }, [projectId, fetchFiles])

  // Smart polling: Auto-refresh every 5s when files are processing
  useEffect(() => {
    const hasProcessingFiles = files.some(f => f.status === 'processing')

    if (!hasProcessingFiles || !projectId) return

    const interval = setInterval(() => {
      fetchFiles()
    }, 5000) // Poll every 5 seconds

    return () => {
      clearInterval(interval)
    }
  }, [files, projectId, fetchFiles])

  const updatePendingToProcessing = useCallback(() => {
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'processing' } : f))
  }, [])

  return {
    files,
    isLoading,
    error,
    fetchFiles,
    updateFile,
    deleteFile,
    updatePendingToProcessing,
    clearError: () => setError(null)
  }
}
