import { useEffect, useCallback } from 'react'
import { useSSE } from '@/hooks/use-sse'
import { API_CONFIG } from '@/lib/config'
import { Project } from './use-projects'

export type ProjectEventType = 'project_created' | 'project_updated' | 'project_deleted'

export interface ProjectEvent {
    event_type: ProjectEventType
    project_id: string
    created_by: string
    data?: Project
}

export interface UseProjectEventsOptions {
    enabled?: boolean
    onProjectCreated?: (project: Project) => void
    onProjectUpdated?: (project: Project) => void
    onProjectDeleted?: (projectId: string) => void
}

export function useProjectEvents(options: UseProjectEventsOptions = {}) {
    const { enabled = true, onProjectCreated, onProjectUpdated, onProjectDeleted } = options

    // Use Next.js API proxy instead of calling backend directly
    // This keeps auth tokens in headers (server-side) instead of URL params
    const url = '/api/v1/project/events'

    const { isConnected, lastMessage } = useSSE<ProjectEvent>(url, {
        enabled,
        onError: (error) => {
            console.error('[ProjectEvents] Connection error:', error)
        },
    })

    const handleEvent = useCallback(
        (event: ProjectEvent) => {
            console.log('[ProjectEvents] Received event:', event.event_type, event.data)

            switch (event.event_type) {
                case 'project_created':
                    if (event.data && onProjectCreated) {
                        onProjectCreated(event.data)
                    }
                    break
                case 'project_updated':
                    if (event.data && onProjectUpdated) {
                        onProjectUpdated(event.data)
                    }
                    break
                case 'project_deleted':
                    if (onProjectDeleted) {
                        onProjectDeleted(event.project_id)
                    }
                    break
            }
        },
        [onProjectCreated, onProjectUpdated, onProjectDeleted]
    )

    useEffect(() => {
        if (lastMessage?.data) {
            handleEvent(lastMessage.data)
        }
    }, [lastMessage, handleEvent])

    return {
        isConnected,
    }
}
