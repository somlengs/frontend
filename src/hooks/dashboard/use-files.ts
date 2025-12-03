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

function mapStatus(status: string): 'pending' | 'completed' | 'processing' | 'error' {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'pending' || normalized === 'waiting') {
    return 'pending'
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
  return 'processing' // default
}

export function useFiles(projectId: string, enableSSE: boolean = true) {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    if (!projectId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ROUTES.PROJECTS.FILES.LIST(projectId), {
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
      const rawFiles = data.files || data.data || (Array.isArray(data) ? data : [])

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

        let status = mapStatus(
          file.status || file.processing_status || file.transcription_status || 'processing',
        )

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

      // Sort by creation date (oldest first) to match backend processing order
      mappedFiles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      setFiles(mappedFiles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch files'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  // SSE event handlers
  const handleFileCreated = useCallback((event: import('./use-file-events').FileEvent) => {
    console.log('[useFiles] handleFileCreated called with event:', event)
    console.log('[useFiles] File created:', event)

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
    console.log('[useFiles] File updated:', event)

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
    console.log('[useFiles] File deleted, refetching...')
    fetchFiles()
  }, [fetchFiles])

  // Enable SSE for real-time updates
  useFileEvents(projectId, {
    enabled: enableSSE,
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
      console.error('Error deleting file:', err)
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
