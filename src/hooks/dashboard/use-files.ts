import { useState, useEffect } from 'react'
import { API_ROUTES } from '@/lib/config'
import { AudioFile } from './use-file-upload'

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

function mapStatus(status: string): 'completed' | 'processing' | 'error' {
  const normalized = (status || '').toLowerCase()
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

export function useFiles(projectId: string) {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
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
      const mappedFiles: AudioFile[] = rawFiles.map((f: any) => {
        const transcription =
          f.transcription ||
          f.transcription_text ||
          f.transcription_content ||
          f.transcriptions?.[0]?.data ||
          null

        let status = mapStatus(
          f.status || f.processing_status || f.transcription_status || 'processing',
        )

        // If we already have a transcription but backend status is still "processing",
        // treat it as completed for UX purposes.
        if (status === 'processing' && transcription) {
          status = 'completed'
        }

        return {
          id: String(f.id || f.file_id || f.fileId || ''),
          name: f.name || f.file_name || f.filename || 'Unknown',
          duration: formatDurationValue(
            f.duration ?? f.duration_seconds ?? f.duration_ms,
          ),
          size: formatFileSize(f.file_size ?? f.size_bytes ?? f.size ?? 0),
          status,
          transcription,
          createdAt:
            f.created_at || f.createdAt || f.created || new Date().toISOString(),
          audioUrl:
            f.audio_url ||
            f.audioUrl ||
            f.file_url ||
            f.url ||
            undefined,
        }
      })

      setFiles(mappedFiles)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch files'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFile = async (fileId: string, data: Partial<AudioFile>) => {
    setIsLoading(true)
    setError(null)

    try {
      // Transform frontend field names to backend field names
      const backendData: any = {}
      if (data.name !== undefined) {
        backendData.file_name = data.name
      }
      // Add other field mappings here if needed in the future

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
        createdAt: updatedFile.created_at || updatedFile.createdAt || updatedFile.created || new Date().toISOString()
      }

      setFiles(prev => prev.map(file =>
        file.id === fileId ? mappedFile : file
      ))

      return { success: true }
    } catch (err) {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [projectId])

  return {
    files,
    isLoading,
    error,
    fetchFiles,
    updateFile,
    deleteFile,
    clearError: () => setError(null)
  }
}

