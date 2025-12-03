import { useEffect, useCallback } from 'react'
import { useSSE } from '@/hooks/use-sse'
import { API_CONFIG } from '@/lib/config'

export type FileEventType = 'file.created' | 'file.updated' | 'file.deleted'

export interface FileEvent {
    event_type: FileEventType
    eid: string
    file_id: string | null
    project_id: string | null
    file_name: string | null
    public_url: string | null
    file_size: number | null
    duration: number | null
    format: string | null
    transcription_status: string | null
    transcription_content: string | null
    created_at: string | null
    updated_at: string | null
    created_by: string | null
}

export interface UseFileEventsOptions {
    enabled?: boolean
    onFileCreated?: (event: FileEvent) => void
    onFileUpdated?: (event: FileEvent) => void
    onFileDeleted?: () => void
}

export function useFileEvents(
    projectId: string | null,
    options: UseFileEventsOptions = {}
) {
    const { enabled = true, onFileCreated, onFileUpdated, onFileDeleted } = options

    const url = projectId
        ? `${API_CONFIG.BASE_URL}/v1/project/${projectId}/files/events`
        : null

    const { isConnected, lastMessage } = useSSE<FileEvent>(url, {
        enabled,
        onError: (error) => {
            console.error('[FileEvents] Connection error:', error)
        },
    })

    const handleEvent = useCallback(
        (event: FileEvent) => {
            console.log('[FileEvents] Received event:', event.event_type, event)

            switch (event.event_type) {
                case 'file.created':
                    console.log('[FileEvents] file.created case, onFileCreated:', onFileCreated)
                    if (onFileCreated) {
                        console.log('[FileEvents] Calling onFileCreated with event')
                        onFileCreated(event)
                    } else {
                        console.log('[FileEvents] onFileCreated is undefined!')
                    }
                    break
                case 'file.updated':
                    if (onFileUpdated) {
                        onFileUpdated(event)
                    }
                    break
                case 'file.deleted':
                    if (onFileDeleted) {
                        onFileDeleted()
                    }
                    break
            }
        },
        [onFileCreated, onFileUpdated, onFileDeleted]
    )

    useEffect(() => {
        console.log('[FileEvents] lastMessage changed:', lastMessage)
        if (lastMessage?.data) {
            console.log('[FileEvents] Calling handleEvent with:', lastMessage.data)
            handleEvent(lastMessage.data)
        }
    }, [lastMessage, handleEvent])

    return {
        isConnected,
    }
}
