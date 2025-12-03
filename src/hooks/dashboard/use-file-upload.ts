import { useState } from 'react'
import { API_ROUTES } from '@/lib/config'

export interface AudioFile {
  id: string
  name: string
  duration: string
  size: string
  status: 'pending' | 'completed' | 'processing' | 'error'
  transcription?: string
  createdAt: string
  updatedAt?: string
  audioUrl?: string
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFiles = async (projectId: string, files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Create FormData with files
      const formData = new FormData()

      // Append each file with the key "files" (backend should expect this)
      // For multiple files, use the same key name
      files.forEach(file => {
        formData.append('files', file)
      })

      // Use XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(Math.round(percentComplete))
        }
      })

      const uploadPromise = new Promise<AudioFile[]>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              // Handle different response formats
              const filesList = data.files || data.data || (Array.isArray(data) ? data : [])
              resolve(filesList)
            } catch {
              reject(new Error('Invalid response format'))
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText)
              reject(new Error(errorData.message || errorData.error || `HTTP ${xhr.status}`))
            } catch {
              reject(new Error(`HTTP ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error: Upload failed'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'))
        })

        // Use the Next.js API proxy route
        xhr.open('POST', API_ROUTES.PROJECTS.FILES.CREATE(projectId))
        // Don't set Content-Type header - browser will set it automatically with boundary
        xhr.send(formData)
      })

      const uploadedFiles = await uploadPromise
      return { success: true, uploadedFiles }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null)
  }
}
