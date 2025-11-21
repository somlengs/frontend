import { useState } from 'react'
import { API_ROUTES } from '@/lib/config'

export interface ProcessStatus {
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  message?: string
  output?: any
}

export function useProcess() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startProcess = async (projectId: string, options?: any) => {
    setIsProcessing(true)
    setError(null)
    setProcessStatus({ status: 'pending' })

    try {
      const response = await fetch(API_ROUTES.PROJECTS.PROCESS(projectId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options || {}),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setProcessStatus({ status: 'processing', ...data })

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start process'
      setError(errorMessage)
      setProcessStatus({ status: 'error', message: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      setIsProcessing(false)
    }
  }

  const getProcessStatus = async (projectId: string) => {
    try {
      const response = await fetch(API_ROUTES.PROJECTS.PROCESS(projectId), {
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
      setProcessStatus(data)

      return { success: true, status: data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch process status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return {
    isProcessing,
    processStatus,
    error,
    startProcess,
    getProcessStatus,
    clearError: () => setError(null)
  }
}

