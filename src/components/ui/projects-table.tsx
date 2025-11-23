'use client'

import React from 'react'
import { CheckCircle, Clock, AlertCircle, FileText, Trash2, Edit, FolderOpen, LucideIcon } from 'lucide-react'
import { Button } from './liquid-glass-button'
import { GooeyLoader } from './gooey-loader'
import { EmptyState } from './empty-state'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from './popover'

export interface Project {
  id: string
  name: string
  description: string
  status: 'completed' | 'processing' | 'draft' | 'error'
  audioFiles: number
  transcriptions: number
  createdAt: string
  lastModified: string
}

const statusConfig = {
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock
  },
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: FileText
  },
  error: {
    label: 'Error',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  }
}

interface ProjectsTableProps {
  projects: Project[]
  onProjectClick?: (project: Project) => void
  onActionClick?: (action: string, project: Project) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  loading?: boolean
  emptyIcon?: LucideIcon
  emptyVariant?: 'default' | 'warning' | 'error'
}

export function ProjectsTable({
  projects,
  onProjectClick,
  onActionClick,
  emptyTitle = 'No projects yet',
  emptyDescription = 'Create your first project to start managing datasets and transcriptions.',
  emptyActionLabel = 'Create Project',
  onEmptyAction,
  loading = false,
  emptyIcon,
  emptyVariant
}: ProjectsTableProps) {
  const actions = [
    {
      label: 'Edit Project',
      icon: <Edit className="w-4 h-4" />,
      onClick: (project: Project) => onActionClick?.('edit', project)
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (project: Project) => onActionClick?.('delete', project),
      className: 'text-red-600 hover:bg-red-50'
    }
  ]

  const isEmpty = projects.length === 0

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[60vh]">
        <GooeyLoader
          primaryColor="var(--color-accent)"
          secondaryColor="var(--accent-foreground)"
          borderColor="var(--border)"
        />
      </div>
    )
  }

  return (
    <div className="bg-bg border border-border rounded-lg overflow-hidden">
      {isEmpty ? (
        <div className="flex items-center justify-center w-full min-h-[60vh]">
          <div className="w-full max-w-xl">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              icons={emptyIcon ? [emptyIcon] : [FolderOpen, FileText, Edit]}
              action={onEmptyAction ? {
                label: (
                  <span className="inline-flex items-center gap-2"><FolderOpen className="w-4 h-4" />{emptyActionLabel}</span>
                ), onClick: onEmptyAction
              } : undefined}
              variant={emptyVariant}
            />
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-text">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-bg">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-bg">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-bg">Files</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-bg">Created</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-bg"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                // Get status config with fallback to draft if status is unknown
                const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.draft
                const StatusIcon = status.icon
                return (
                  <tr
                    key={project.id}
                    className="cursor-pointer group hover:bg-muted/50 border-b transition-colors"
                    onClick={() => onProjectClick?.(project)}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-md font-medium text-text  ">{project.name || 'Unnamed Project'}</div>
                        <div className="text-xs text-muted-foreground">{project.description || 'No description'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 ${project.status === 'processing' ? 'px-0 py-0 border-0 bg-transparent' : 'px-2 py-1 rounded-full text-xs font-medium border ' + status.color}`}>
                        {project.status === 'processing' ? (
                          <>
                            <div className="relative w-32 h-7 overflow-hidden">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 scale-[0.5] origin-left">
                                <GooeyLoader
                                  primaryColor="#6EA8FE"
                                  secondaryColor="#CFE0FF"
                                  borderColor="#DBEAFE"
                                />
                              </div>
                            </div>
                            <span className="sr-only">{status.label}</span>
                          </>
                        ) : (
                          <>
                            <StatusIcon className="h-3 w-3 shrink-0" />
                            {status.label}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-text">{project.audioFiles ?? 0}</td>
                    <td className="py-3 px-4 text-sm text-text">{project.createdAt || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-0 bg-bg border-border" align="end" side="bottom" sideOffset={4}>
                          <div className="py-1">
                            {actions.map((action, actionIndex) => (
                              <PopoverClose asChild key={actionIndex}>
                                <button
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 ${action.className || 'text-text'}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    action.onClick(project)
                                  }}
                                >
                                  {action.icon}
                                  {action.label}
                                </button>
                              </PopoverClose>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
