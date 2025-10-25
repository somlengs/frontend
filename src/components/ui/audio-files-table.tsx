'use client'

import React from 'react'
import { CheckCircle, Clock, AlertCircle, Edit, Download, Trash2 } from 'lucide-react'
import { Button } from './liquid-glass-button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface AudioFile {
  id: string
  name: string
  duration: string
  size: string
  status: 'completed' | 'processing' | 'error'
  transcription: string | null
  createdAt: string
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
  error: {
    label: 'Error',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  }
}

  interface AudioFilesTableProps {
  files: AudioFile[]
  onFileClick?: (file: AudioFile) => void
  onActionClick?: (action: string, file: AudioFile) => void
  stickyHeader?: boolean
  maxHeight?: string
}

export function AudioFilesTable({ 
  files, 
  onFileClick, 
  onActionClick,
  stickyHeader = false,
  maxHeight = '500px'
}: AudioFilesTableProps) {
  const actions = [
    {
      label: 'Edit Transcription',
      icon: <Edit className="w-4 h-4" />,
      onClick: (file: AudioFile) => onActionClick?.('edit', file),
      className: 'text-text'
    },
    {
      label: 'Download Audio',
      icon: <Download className="w-4 h-4" />,
      onClick: (file: AudioFile) => onActionClick?.('download', file),
      className: 'text-text'
    },
    {
      label: 'Delete File',
      icon: <Trash2 className="w-4 h-4 text-red-600" />,
      onClick: (file: AudioFile) => onActionClick?.('delete', file),
      className: 'text-red-600'
    }
  ]

  return (
    <div className="bg-bg border border-border rounded-lg overflow-hidden">
      <div 
        className="overflow-x-auto overflow-y-auto custom-scrollbar"
        style={{ maxHeight }}
      >
        <table className="w-full caption-bottom text-sm">
          <thead className={stickyHeader ? 'sticky top-0 z-10 bg-text' : 'bg-text'}>
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-bg">#</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-bg">File Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-bg">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-bg">Duration</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-bg">Size</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-bg">Date</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-bg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => {
              const status = statusConfig[file.status as keyof typeof statusConfig]
              const StatusIcon = status.icon
              
              return (
                <tr 
                  key={file.id}
                  className="cursor-pointer group hover:bg-muted/50 border-b transition-colors"
                  onClick={() => onFileClick?.(file)}
                >
                  <td className="py-3 px-4 text-right text-sm text-text">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-text truncate max-w-[200px]">
                      {file.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-text">{file.duration}</td>
                  <td className="py-3 px-4 text-right text-sm text-text">{file.size}</td>
                  <td className="py-3 px-4 text-sm text-text">{new Date(file.createdAt).toLocaleDateString()}</td>
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
                                action.onClick(file)
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
