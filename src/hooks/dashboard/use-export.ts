import { useState } from 'react'
import { fetchBackend } from '@/lib/api-client'
import { BACKEND_API_ROUTES } from '@/lib/config'

interface ExportData {
  projectId: string
  format: 'csv' | 'tsv'
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportDataset = async (data: ExportData) => {
    setIsExporting(true)
    setError(null)

    try {
      const endpoint = BACKEND_API_ROUTES.PROJECTS.DOWNLOAD(data.projectId)
      const response = await fetchBackend(
        `${endpoint}?format=${data.format}&toolkit=Wav2Vec2`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        // Try to parse error message from backend
        let errorMessage = 'Export failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText
        }

        // Map to user-friendly messages
        if (response.status === 403 || response.status === 400) {
          errorMessage = 'All files must be transcribed before exporting. Please complete processing first.'
        } else if (response.status === 404) {
          errorMessage = 'Project not found. Please try again.'
        } else if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.'
        }

        throw new Error(errorMessage)
      }

      const blob = await response.blob()

      // Create blob link to download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from header or default
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `project-${data.projectId}-export.zip`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2)
          fileName = fileNameMatch[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true }
    } catch (err) {
      console.error('Export error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Export failed. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportDataset,
    isExporting,
    error,
    clearError: () => setError(null)
  }
}
