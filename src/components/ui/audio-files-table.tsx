'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, Clock, AlertCircle, Edit, Download, Trash2, FileText } from 'lucide-react'
import { Button } from './liquid-glass-button'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from './popover'
import { Doodle } from './doodle'
import { EmptyState } from './empty-state'
import { GooeyLoader } from './gooey-loader'

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
  onRename?: (fileId: string, newName: string) => Promise<{ success: boolean; error?: string }>
  stickyHeader?: boolean
  maxHeight?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  loading?: boolean
}

export function AudioFilesTable({
  files,
  onFileClick,
  onActionClick,
  onRename,
  stickyHeader = false,
  maxHeight = '500px',
  emptyTitle = 'No audio files yet',
  emptyDescription = 'Upload audio files to process and generate transcriptions.',
  emptyActionLabel = 'Upload Files',
  onEmptyAction,
  loading = false
}: AudioFilesTableProps) {
  const [isClient, setIsClient] = useState(false)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleStartEdit = (file: AudioFile) => {
    setEditingFileId(file.id)
    setEditingName(file.name)
  }

  const handleCancelEdit = () => {
    setEditingFileId(null)
    setEditingName('')
  }

  const handleSaveEdit = async (fileId: string) => {
    if (!editingName.trim() || !onRename || isRenaming) return

    setIsRenaming(true)
    const result = await onRename(fileId, editingName.trim())
    setIsRenaming(false)

    if (result.success) {
      setEditingFileId(null)
      setEditingName('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, fileId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit(fileId)
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const actions = [
    {
      label: 'Rename',
      icon: <Edit className="w-4 h-4" />,
      onClick: (file: AudioFile) => {
        handleStartEdit(file)
        onActionClick?.('rename', file)
      },
      className: 'text-text'
    },
    {
      label: 'Delete File',
      icon: <Trash2 className="w-4 h-4 text-red-600" />,
      onClick: (file: AudioFile) => onActionClick?.('delete', file),
      className: 'text-red-600'
    }
  ]

  const isEmpty = files.length === 0

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
      {!isClient ? (
        <div className="p-8 text-center text-muted-foreground">
          Loading...
        </div>
      ) : isEmpty ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icons={[FileText]}
          action={onEmptyAction ? {
            label: (
              <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4" />{emptyActionLabel}</span>
            ), onClick: onEmptyAction
          } : undefined}
        />
      ) : (
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
                    onClick={() => editingFileId !== file.id && onFileClick?.(file)}
                  >
                    <td className="py-3 px-4 text-right text-sm text-text">{index + 1}</td>
                    <td className="py-3 px-4" onClick={(e) => editingFileId === file.id && e.stopPropagation()}>
                      {editingFileId === file.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, file.id)}
                            onBlur={() => handleSaveEdit(file.id)}
                            autoFocus
                            disabled={isRenaming}
                            className="text-sm font-medium text-text bg-bg border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-text max-w-[200px]"
                          />
                          {isRenaming && (
                            <div className="text-xs text-muted-foreground">Saving...</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-text truncate max-w-[200px]">
                          {file.name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 ${file.status === 'processing' ? 'px-0 py-0 border-0 bg-transparent' : 'px-2 py-1 rounded-full text-xs font-medium border ' + status.color}`}>
                        {file.status === 'processing' ? (
                          <>
                            <div className="relative w-32 h-7 overflow-hidden">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 origin-left scale-[0.5]" >
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
                              <PopoverClose asChild key={actionIndex}>
                                <button
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2 ${action.className || 'text-text'}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    action.onClick(file)
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
