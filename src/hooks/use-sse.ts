import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SSEMessage<T = unknown> {
  event: string
  data: T
}

export interface UseSSEOptions {
  enabled?: boolean
  reconnectInterval?: number
  onError?: (error: Error) => void
}

export function useSSE<T = unknown>(
  url: string | null,
  options: UseSSEOptions = {}
) {
  const { enabled = true, reconnectInterval = 3000, onError } = options
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<SSEMessage<T> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)
  const mountedRef = useRef(true)
  const onErrorRef = useRef(onError)
  const reconnectAttemptsRef = useRef(0) // Track reconnection attempts

  // Update onError ref when it changes
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (abortControllerRef.current) {
      console.log('[SSE] Disconnecting')
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsConnected(false)
      isConnectingRef.current = false
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const connect = async () => {
      if (!url || !enabled || isConnectingRef.current || !mountedRef.current) return

      isConnectingRef.current = true

      try {
        // Get auth token from Supabase
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          throw new Error('No authentication token available')
        }

        // Create abort controller for this connection
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        console.log('[SSE] Connecting to', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Accept': 'text/event-stream',
          },
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        if (!response.body) {
          throw new Error('Response body is null')
        }

        console.log('[SSE] Connected to', url)
        if (mountedRef.current) {
          setIsConnected(true)
          isConnectingRef.current = false
          reconnectAttemptsRef.current = 0 // Reset attempts on successful connection
        }

        // Read the stream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (mountedRef.current) {
          const { done, value } = await reader.read()

          if (done) {
            console.log('[SSE] Stream ended')
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              console.log('[SSE] Raw data received:', data)
              try {
                const parsed = JSON.parse(data)
                console.log('[SSE] Parsed data:', parsed)
                if (mountedRef.current) {
                  setLastMessage({
                    event: 'message',
                    data: parsed,
                  })
                }
              } catch (error) {
                console.error('[SSE] Failed to parse message:', error)
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('[SSE] Connection aborted')
            return
          }

          // Exponential backoff: 3s, 6s, 12s, 24s, max 30s
          reconnectAttemptsRef.current++
          const backoffTime = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000 // Max 30 seconds
          )

          console.log('[SSE] Connection interrupted:', error.message, `- will reconnect in ${backoffTime / 1000}s (attempt ${reconnectAttemptsRef.current})`)
          onErrorRef.current?.(error)
        }

        if (mountedRef.current) {
          setIsConnected(false)
          isConnectingRef.current = false

          // Attempt to reconnect with exponential backoff
          if (enabled && !abortControllerRef.current?.signal.aborted) {
            const backoffTime = Math.min(
              reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1),
              30000
            )

            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                console.log('[SSE] Attempting to reconnect...')
                connect()
              }
            }, backoffTime)
          }
        }
      }
    }

    if (enabled && url) {
      connect()
    }

    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [url, enabled, reconnectInterval, disconnect])

  return {
    isConnected,
    lastMessage,
    disconnect,
  }
}
