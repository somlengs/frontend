'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  Download,
  FileText,
  ChevronRight,
  Home,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { AudioFilesTable, AudioFile } from '@/components/ui/audio-files-table'
import { useProjects, Project } from '@/hooks/dashboard/use-projects'
import { useFiles } from '@/hooks/dashboard/use-files'
import Pagination from '@/components/ui/pagination'
import { useSnackbar } from '@/components/ui/snackbar-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ProjectDetailSection() {
  const params = useParams()
  const projectId = params?.id as string

  const { getProject, processProject } = useProjects()
  const { files: audioFiles, isLoading: filesLoading, fetchFiles, deleteFile, updateFile, updatePendingToProcessing } = useFiles(projectId || '')
  const { showSnackbar } = useSnackbar()

  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'processing' | 'error'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 13 // Capped at 13 for now cuz more than that it broke the page height.
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<AudioFile | null>(null)

  // Fetch project data
  useEffect(() => {
    if (!projectId) {
      setProjectLoading(false)
      return
    }

    let cancelled = false
    let pollInterval: NodeJS.Timeout | null = null

    const loadProject = async () => {
      setProjectLoading(true)
      try {
        const result = await getProject(projectId)
        if (cancelled) return

        if (result.success && result.project) {
          // Map backend response to project format
          let status = (result.project.status || 'pending').toLowerCase()

          // Keep pending as pending
          if (status === 'pending' || status === 'waiting') {
            status = 'pending'
          }
          else if (status === 'loading' || status === 'in_progress') {
            status = 'loading'  // Keep as 'loading', don't map to 'processing'
          }
          else if (status === 'processing') {
            status = 'processing'
          }

          const projectData = {
            id: result.project.id || result.project.project_id || projectId,
            name: result.project.name || result.project.project_name || 'Unnamed Project',
            description: result.project.description || result.project.desc || '',
            status: status as 'loading' | 'pending' | 'processing' | 'completed' | 'error',
            audioFiles: result.project.num_of_files ?? result.project.audioFiles ?? result.project.audio_files ?? 0,
            transcriptions: result.project.transcriptions || result.project.transcription_count || 0,
            createdAt: result.project.created_at || result.project.createdAt || result.project.created || '',
            lastModified: result.project.updated_at || result.project.lastModified || result.project.updated || result.project.created_at || result.project.createdAt || ''
          }
          setProject(projectData)

          if (status === 'loading' && !cancelled) {
            pollInterval = setInterval(async () => {
              // Fetch files in SILENT mode (no loading skeleton)
              await fetchFiles(true)

              // Check if project finished loading
              const pollResult = await getProject(projectId)
              if (pollResult.success && pollResult.project) {
                const pollStatus = (pollResult.project.status || 'pending').toLowerCase()
                if (pollStatus !== 'loading') {
                  if (pollInterval) clearInterval(pollInterval)

                  // Update project state to remove the badge
                  let finalStatus = pollStatus
                  if (finalStatus === 'pending' || finalStatus === 'waiting') {
                    finalStatus = 'pending'
                  } else if (finalStatus === 'processing') {
                    finalStatus = 'processing'
                  }

                  setProject(prev => prev ? {
                    ...prev,
                    status: finalStatus as 'loading' | 'pending' | 'processing' | 'completed' | 'error'
                  } : null)

                  // Final fetch to ensure we have all files
                  await fetchFiles(true)
                }
              }
            }, 1500) // Poll every 1.5 seconds for smooth updates
          }
        } else {
          console.error('Failed to load project:', result.error)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load project:', error)
        }
      } finally {
        if (!cancelled) {
          setProjectLoading(false)
        }
      }
    }

    loadProject()

    return () => {
      cancelled = true
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [projectId, getProject, fetchFiles])

  // Reset to first page when tab/filter changes
  useEffect(() => {
    setPage(1)
  }, [activeTab])

  // Filter files based on active tab
  const filteredFiles = audioFiles.filter(file => {
    if (activeTab === 'all') return true
    return file.status === activeTab
  })

  const totalCount = filteredFiles.length
  const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize)

  // Derive button state from file statuses
  const hasProcessingFiles = audioFiles.some(f => f.status === 'processing')
  const hasPendingFiles = audioFiles.some(f => f.status === 'pending')
  const allFilesCompleted = audioFiles.length > 0 && audioFiles.every(f => f.status === 'completed')
  const completedFiles = audioFiles.filter(f => f.status === 'completed').length

  // Show completion snackbar when all files finish processing
  useEffect(() => {
    if (hasProcessingFiles) {
      // Track that we started processing
      sessionStorage.setItem(`processing_${projectId}`, 'true')
    } else if (sessionStorage.getItem(`processing_${projectId}`) === 'true') {
      // Processing just finished
      sessionStorage.removeItem(`processing_${projectId}`)
      if (completedFiles > 0) {
        showSnackbar({
          message: `Transcription complete! ${completedFiles} file${completedFiles > 1 ? 's' : ''} processed successfully`,
          variant: 'success'
        })
      }
    }
  }, [hasProcessingFiles, completedFiles, projectId, showSnackbar])

  const handleProcessTranscription = async () => {
    if (!projectId) return

    // Immediately update UI - files go to processing state
    updatePendingToProcessing()

    try {
      const result = await processProject(projectId)

      if (!result.success) {
        // Only show snackbar on error, revert optimistic update
        await fetchFiles()
        showSnackbar({
          message: result.error || 'Failed to start processing',
          variant: 'error'
        })
      }
      // No success snackbar - user sees files processing immediately
    } catch {
      // Revert optimistic update on error
      await fetchFiles()
      showSnackbar({
        message: 'An unexpected error occurred',
        variant: 'error'
      })
    }
  }

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open) {
      setFileToDelete(null)
    }
  }

  const handleDeleteFile = (file: AudioFile) => {
    setFileToDelete(file)
  }

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return
    setDeletingId(fileToDelete.id)

    try {
      const result = await deleteFile(fileToDelete.id)
      if (result.success) {
        fetchFiles() // Refresh the list
        showSnackbar({ message: 'File deleted', variant: 'success' })
      } else {
        showSnackbar({ message: result.error || 'Failed to delete file', variant: 'error' })
      }
    } catch (error: unknown) {
      console.error('Delete error:', error)
      showSnackbar({ message: 'Failed to delete file', variant: 'error' })
    }

    setDeletingId(null)
    setFileToDelete(null)
  }

  const handleRenameFile = async (fileId: string, newName: string) => {
    try {
      // Backend expects 'file_name' not 'name'
      const result = await updateFile(fileId, { name: newName })
      if (result.success) {
        showSnackbar({ message: 'File renamed successfully', variant: 'success' })
        return { success: true }
      } else {
        showSnackbar({ message: result.error || 'Failed to rename file', variant: 'error' })
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Rename error:', error)
      const errorMessage = 'Failed to rename file'
      showSnackbar({ message: errorMessage, variant: 'error' })
      return { success: false, error: errorMessage }
    }
  }

  const handleFileAction = async (action: string, file: AudioFile) => {
    if (action === 'delete') {
      handleDeleteFile(file)
    } else if (action === 'rename') {
      // Rename is handled inline in the table
      return
    } else if (action === 'edit') {
      window.location.href = `/dashboard/projects/${projectId}/transcriptions/${file.id}`
    } else if (action === 'download') {
      // TODO: Implement file download
    }
  }

  // Show loading skeleton if:
  // 1. Files are loading OR project is loading
  // 2. AND we don't have any files yet (prevents flash of empty table)
  // 3. AND we're not currently processing (show real-time updates during processing)
  const filesTableLoading = (filesLoading || projectLoading || audioFiles.length === 0) && !hasProcessingFiles

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/dashboard" className="hover:text-text transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            {projectLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="text-text truncate max-w-[200px]">{project?.name || 'Unnamed Project'}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-text">
            {projectLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <BrushUnderline variant="accent" animated>
                {project?.name || 'Unnamed Project'}
              </BrushUnderline>
            )}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button className="p-2 rounded-md transition-colors border border-dashed hover:text-text border-muted-foreground/30 hover:border-muted-foreground/50">
            <Link href={`/dashboard/projects/${projectId}/upload`}>
              <Upload className="w-4 h-4" />
            </Link>
          </button>

          {!allFilesCompleted && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 sm:py-2 rounded-md whitespace-nowrap">
              {completedFiles}/{audioFiles.length} completed
            </span>
          )}

          <Button
            size="sm"
            variant="outline"
            className="whitespace-nowrap"
            onClick={() => window.location.href = `/dashboard/projects/${projectId}/export`}
            disabled={completedFiles === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Dataset</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Audio Files List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-text">Audio Files</h2>
            {project?.status === 'loading' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Extracting... ({audioFiles.length})
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            onClick={handleProcessTranscription}
            disabled={hasProcessingFiles || !hasPendingFiles}
          >
            {hasProcessingFiles ? (
              <>
                <div className="animate-spin bg-accent rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Process Transcription
              </>
            )}
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="border-b border-border">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'all'
                ? 'text-text border-text'
                : 'text-muted-foreground border-transparent hover:text-text'
                }`}
            >
              All ({audioFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'completed'
                ? 'text-text border-text'
                : 'text-muted-foreground border-transparent hover:text-text'
                }`}
            >
              Completed ({audioFiles.filter(f => f.status === 'completed').length})
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'processing'
                ? 'text-text border-text'
                : 'text-muted-foreground border-transparent hover:text-text'
                }`}
            >
              Processing ({audioFiles.filter(f => f.status === 'processing').length})
            </button>
            <button
              onClick={() => setActiveTab('error')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'error'
                ? 'text-text border-text'
                : 'text-muted-foreground border-transparent hover:text-text'
                }`}
            >
              Error ({audioFiles.filter(f => f.status === 'error').length})
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden grid" style={{ gridTemplateRows: '1fr auto' }}>


          <AudioFilesTable
            files={paginatedFiles as AudioFile[]}
            loading={filesTableLoading}
            emptyActionLabel="Upload Files"
            onEmptyAction={() => { window.location.href = `/dashboard/projects/${projectId}/upload` }}
            onFileClick={(file) => window.location.href = `/dashboard/projects/${projectId}/transcriptions/${file.id}`}
            onActionClick={handleFileAction}
            onRename={handleRenameFile}
            stickyHeader={true}
            maxHeight="550px"
            currentPage={page}
            itemsPerPage={pageSize}
          />
          {/* Pagination */}
          <div className="flex justify-between items-center pt-3">
            <div className="text-md text-muted-foreground font-serif">
              <p>Showing {page * pageSize - pageSize + 1} - {Math.min(page * pageSize, filteredFiles.length)} of {filteredFiles.length} files</p>
            </div>
            <Pagination
              currentPage={page}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>

      </div>

      <Dialog open={!!fileToDelete} onOpenChange={handleDeleteDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{fileToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFileToDelete(null)}
              disabled={deletingId === fileToDelete?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId === fileToDelete?.id}
            >
              {deletingId === fileToDelete?.id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
