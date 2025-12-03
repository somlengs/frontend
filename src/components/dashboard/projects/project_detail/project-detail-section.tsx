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
    }
  }, [projectId, getProject])

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
  const hasPendingFiles = audioFiles.filter(f => f.status === 'pending').length
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

  // Only show full loading state if we're loading AND not processing
  // If we are processing, we want to show the table with skeletons
  // We also need to wait for project to load so we know the expected file count
  const filesTableLoading = (filesLoading || projectLoading) && !hasProcessingFiles

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/dashboard" className="hover:text-text transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            {projectLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="text-text">{project?.name || 'Unnamed Project'}</span>
            )}
          </div>
          <h1 className="text-3xl font-serif text-text">
            {projectLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <BrushUnderline variant="accent" animated>
                {project?.name || 'Unnamed Project'}
              </BrushUnderline>
            )}
          </h1>
          {/* <p className="text-muted-foreground mb-6">You haven&apos;t uploaded any audio files yet.</p> */}
        </div>

        <div className="flex items-center gap-3">
          {/* <Button
            size="sm"
            className="bg-text text-bg hover:bg-text/90"
            asChild
          >
            <Link href={`/dashboard/projects/${projectId}/upload`}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </Link>
          </Button> */}
          <button className="p-2 rounded-md transition-colors border border-dashed hover:text-text border-muted-foreground/30 hover:border-muted-foreground/50">
            <Link href={`/dashboard/projects/${projectId}/upload`}>

              <Upload className="w-4 h-4" />
            </Link>
          </button>

          <Button
            size="sm"
            className="bg-accent text-text hover:bg-accent/90"
            asChild
          >
            <Link href={`/dashboard/projects/${projectId}/export`}>
              <Download className="w-4 h-4 mr-2" />
              Export Dataset
            </Link>
          </Button>
        </div>
      </div>

      {/* Audio Files List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">Audio Files</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleProcessTranscription}
            disabled={hasProcessingFiles || hasPendingFiles === 0}
          >
            {hasProcessingFiles ? (
              <>
                <div className="animate-spin bg-accent rounded-full h-4 w-4 border-b-2 border-text mr-2"></div>
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
          {/* Debug logging */}
          {(() => {
            console.log('[ProjectDetail] Render state:', {
              filesLoading,
              hasProcessingFiles,
              projectStatus: project?.status,
              audioFilesLength: audioFiles.length,
              expectedFiles: project?.audioFiles,
              filesTableLoading
            })
            return null
          })()}

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
