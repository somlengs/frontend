'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save,
  ChevronRight,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFiles } from '@/hooks/dashboard/use-files'
import { useProjects, Project } from '@/hooks/dashboard/use-projects'
import { useSnackbar } from '@/components/ui/snackbar-provider'
import { AudioPlayerProvider } from '@/components/ui/audio-player'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FilePlaylist } from './file-playlist'
import { StudioPlayer } from './studio-player'

type TrackData = {
  id: string
  name: string
  url: string
}

export default function TranscriptionEditorSection() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const fileId = params?.fileId as string

  const { files, updateFile, isLoading: filesLoading } = useFiles(projectId || '')
  const { getProject } = useProjects()
  const { showSnackbar } = useSnackbar()

  const [project, setProject] = useState<Project | null>(null)
  const [projectLoading, setProjectLoading] = useState(true)
  const [selectedFileId, setSelectedFileId] = useState(fileId || '')
  const [transcription, setTranscription] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingFileId, setPendingFileId] = useState<string | null>(null)

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0]

  // Fetch project data for breadcrumb
  useEffect(() => {
    if (!projectId) {
      setProjectLoading(false)
      return
    }

    const loadProject = async () => {
      try {
        const result = await getProject(projectId)
        if (result.success && result.project) {
          setProject(result.project as Project)
        }
      } finally {
        setProjectLoading(false)
      }
    }

    loadProject()
  }, [projectId, getProject])

  // Update transcription when file is selected or files are loaded
  useEffect(() => {
    if (selectedFileId && !hasChanges) {
      const file = files.find(f => f.id === selectedFileId);
      if (file) {
        setTranscription(file.transcription || '');
      }
    }
  }, [selectedFileId, files, hasChanges]);

  // Initial selection logic
  useEffect(() => {
    if (fileId && files.length > 0) {
      const file = files.find(f => f.id === fileId)
      if (file) {
        setSelectedFileId(fileId)
        setTranscription(file.transcription || '')
        setHasChanges(false)
      }
    } else if (files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id)
      setTranscription(files[0].transcription || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, files]) // Removed selectedFileId to prevent loop

  const handleTranscriptionChange = (value: string) => {
    setTranscription(value)
    setHasChanges(value !== (selectedFile?.transcription || ''))
  }

  const handleSave = async () => {
    if (!projectId || !selectedFileId) return

    setIsSaving(true)
    try {
      const result = await updateFile(selectedFileId, {
        transcription: transcription,
      })
      if (result.success) {
        showSnackbar({ message: 'Transcription saved successfully', variant: 'success' })
        setHasChanges(false)
      } else {
        showSnackbar({ message: result.error || 'Failed to save transcription', variant: 'error' })
      }
    } catch (error: unknown) {
      console.error('Save error:', error)
      showSnackbar({ message: 'Failed to save transcription', variant: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileSelect = (newFileId: string) => {
    if (hasChanges) {
      setPendingFileId(newFileId)
      setShowUnsavedDialog(true)
      return
    }
    proceedToFileSelection(newFileId)
  }

  const proceedToFileSelection = (newFileId: string) => {
    // Update URL to reflect selection
    router.push(`/dashboard/projects/${projectId}/transcriptions/${newFileId}`)

    // Optimistically update local state for immediate feedback
    setSelectedFileId(newFileId)
    const file = files.find(f => f.id === newFileId)
    setTranscription(file?.transcription || '')
    setHasChanges(false)
    setShowUnsavedDialog(false)
    setPendingFileId(null)
  }

  const handleDiscardChanges = () => {
    if (pendingFileId) {
      proceedToFileSelection(pendingFileId)
    }
  }

  const handleNextFile = () => {
    const currentIndex = files.findIndex(f => f.id === selectedFileId)
    if (currentIndex < files.length - 1) {
      handleFileSelect(files[currentIndex + 1].id)
    }
  }

  const handlePrevFile = () => {
    const currentIndex = files.findIndex(f => f.id === selectedFileId)
    if (currentIndex > 0) {
      handleFileSelect(files[currentIndex - 1].id)
    }
  }

  const currentIndex = files.findIndex(f => f.id === selectedFileId)
  const hasNext = currentIndex < files.length - 1
  const hasPrev = currentIndex > 0

  return (
    <AudioPlayerProvider<TrackData>>
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
        {/* Top Bar - Navigation & Actions */}
        <div className="h-14 border-b border-border backdrop-blur  flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-text transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            {projectLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <Link href={`/dashboard/projects/${projectId}`} className="hover:text-text transition-colors">
                {project?.name || 'Project'}
              </Link>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-text font-medium">Transcription</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-accent text-text hover:bg-accent/90"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Playlist */}
          <div className="w-80 shrink-0 h-full">
            <FilePlaylist
              files={files}
              selectedFileId={selectedFileId}
              onSelect={handleFileSelect}
              currentPlayingId={selectedFileId} // Simple assumption for now
              isLoading={filesLoading}
            />
          </div>

          {/* Main Content - Player & Editor */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Sticky Player */}
            <StudioPlayer
              file={selectedFile}
              onNext={handleNextFile}
              onPrev={handlePrevFile}
              hasNext={hasNext}
              hasPrev={hasPrev}
            />

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center">
              <div className="w-full max-w-3xl relative">
                <textarea
                  value={transcription}
                  onChange={(e) => handleTranscriptionChange(e.target.value)}
                  className="w-full min-h-[500px] p-8 bg-card border border-border/50 rounded-xl shadow-sm text-lg leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none font-serif"
                  placeholder="Start typing your transcription here..."
                  spellCheck={false}
                  disabled={filesLoading}
                />

                <div className="mt-4 flex justify-end text-sm text-muted-foreground font-medium">
                  <span>{transcription.split(/\s+/).filter(w => w.length > 0).length} words</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Dialog */}
        <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unsaved Changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes in your transcription. Are you sure you want to discard them and switch files?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => setShowUnsavedDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AudioPlayerProvider>
  )
}
