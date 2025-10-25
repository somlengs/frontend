'use client'

import React from 'react'
import { CheckCircle, Clock, AlertCircle, FileText, Trash2, Edit, Copy } from 'lucide-react'
import { Button } from './liquid-glass-button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

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
}

export function ProjectsTable({ 
  projects, 
  onProjectClick, 
  onActionClick
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

  return (
    <div className="bg-bg border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-text">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-bg">Project</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-bg">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-bg">Files</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-bg">Created</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-bg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => {
              const status = statusConfig[project.status as keyof typeof statusConfig]
              const StatusIcon = status.icon
              
              return (
                <tr 
                  key={project.id}
                  className="cursor-pointer group hover:bg-muted/50 border-b transition-colors"
                  onClick={() => onProjectClick?.(project)}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-md font-medium text-text  ">{project.name}</div>
                      <div className="text-xs text-muted-foreground">{project.description}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-text">{project.audioFiles}</td>
                  <td className="py-3 px-4 text-sm text-text">{project.createdAt}</td>
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
                            <button
                              key={actionIndex}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 ${action.className || 'text-text'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(project)
                              }}
                            >
                              {action.icon}
                              {action.label}
                            </button>
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
    </div>
  )
}
