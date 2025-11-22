
'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Save,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Home,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { useFiles, AudioFile } from '@/hooks/dashboard/use-files'
import { Doodle } from '@/components/ui/doodle'
import { useSnackbar } from '@/components/ui/snackbar-provider'
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
  AudioPlayerDuration,
  AudioPlayerItem,
  useAudioPlayer,
} from '@/components/ui/audio-player'

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

type TrackData = {
  id: string
  name: string
  url: string
}

function TranscriptionAudioPlayer({ file }: { file: AudioFile | undefined }) {
  const player = useAudioPlayer<TrackData>()

  useEffect(() => {
    if (!file?.audioUrl) return

    const item: AudioPlayerItem<TrackData> = {
      id: file.id,
      src: file.audioUrl,
      data: {
        id: file.id,
        name: file.name,
        url: file.audioUrl,
      },
    }

    player.setActiveItem(item).catch((err) =>
      console.error('Failed to set active audio item:', err),
    )
  }, [file?.id, file?.audioUrl, file?.name, player])

  const currentItem = file?.audioUrl
    ? ({
      id: file.id,
      src: file.audioUrl,
      data: { id: file.id, name: file.name, url: file.audioUrl },
    } as AudioPlayerItem<TrackData>)
    : undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <AudioPlayerButton
          item={currentItem}
          variant="outline"
          size="icon"
          disabled={!currentItem}
          className="h-10 w-10 rounded-full bg-accent text-text hover:bg-accent/90"
        />
        <div className="flex flex-1 items-center gap-3">
          <AudioPlayerTime className="text-xs tabular-nums" />
          <AudioPlayerProgress className="flex-1" />
          <AudioPlayerDuration className="text-xs tabular-nums" />
        </div>
      </div>
      {!currentItem && (
        <p className="text-xs text-muted-foreground">
          Audio URL is not available yet for this file.
        </p>
      )}
    </div>
  )
}

export default function TranscriptionEditorSection() {
  const params = useParams()
  const projectId = params?.id as string
  const fileId = params?.fileId as string

  const { files, updateFile, isLoading: filesLoading } = useFiles(projectId || '')
  // const { startProcess } = useProcess()
  const { showSnackbar } = useSnackbar()

  const [selectedFileId, setSelectedFileId] = useState(fileId || '')
  const [transcription, setTranscription] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0]

  // Update transcription when file is selected or files are loaded
  useEffect(() => {
    if (selectedFileId) {
      // Assuming fetchFile is a function that fetches the file details
      // and updates the state, or that `files` array is already populated
      // and `selectedFile` will be updated reactively.
      // For this example, we'll just ensure the transcription is set
      // if the selectedFileId changes and the file is available.
      const file = files.find(f => f.id === selectedFileId);
      if (file) {
        setTranscription(file.transcription || '');
        setHasChanges(false);
      }
    }
  }, [selectedFileId, files]); // Added files to dependency array to ensure it reacts to file data loading

  // Update transcription when file is selected or files are loaded
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
  }, [fileId, files, selectedFileId])

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

  const handleFileSelect = (fileId: string) => {
    if (hasChanges) {
      // TODO: Ask user if they want to save changes
    }
    setSelectedFileId(fileId)
    const file = files.find(f => f.id === fileId)
    setTranscription(file?.transcription || '')
    setHasChanges(false)
  }

  return (
    <AudioPlayerProvider<TrackData>>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-text transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/ dashboard / projects / ${projectId} `} className="hover:text-text transition-colors">
            Project
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text">Transcriptions</span>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Audio Files Sidebar */}
          <div className="w-64 bg-text border border-border rounded-lg p-4 h-[600px] flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-bg font-serif">Audio Files</h2>
              <p className="text-sm text-bg/70 font-serif">{files.length} files</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 audio-files-scroll">
              {files.map((file) => {
                const status = statusConfig[file.status as keyof typeof statusConfig]
                const StatusIcon = status.icon
                const isSelected = file.id === selectedFileId

                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file.id)}
                    className={`p - 3 rounded - lg cursor - pointer transition - colors ${isSelected
                      ? 'bg-bg bordertext-text'
                      : 'hover:bg-bg/20 text-bg/70 hover:text-bg'
                      } `}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-sm truncate flex-1">{file.name}</h3>
                      <span className={`inline - flex items - center gap - 1 px - 1.5 py - 0.5 rounded - full text - xs font - medium border ${status.color} `}>
                        <StatusIcon className="h-3 w-3" />
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{file.duration}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main Content - Transcription Editor */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif text-text">
                  <BrushUnderline variant="accent" animated>Edit Transcription</BrushUnderline>
                </h1>
                <p className="text-muted-foreground mt-1">{selectedFile?.name || 'Loading...'}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <Button
                  size="sm"
                  className="bg-accent text-text hover:bg-accent/90"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Doodle type="circle" className="w-4 h-4 mr-2" />
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

            {/* Content Area */}
            <div className="space-y-6">
              {/* Audio Player */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text">Audio Player</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedFile?.duration || '00:00:00'}</span>
                    <span>•</span>
                    <span>{selectedFile?.size || '0 B'}</span>
                  </div>
                </div>

                <TranscriptionAudioPlayer file={selectedFile} />
              </div>

              {/* Transcription Editor */}
              <div className="bg-card border border-border rounded-lg p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text">Transcription</h2>
                  <div className="flex items-center gap-2">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTranscription(selectedFile?.transcription || '')}
                      className="text-bg bg-text"
                      disabled={isSaving}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button> */}

                    {/* <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-text bg-accent"
                    >
                      <Link href={`/ dashboard / projects / ${ projectId } /transcriptions/${ selectedFileId }/download`}>
  <Download className="w-4 h-4 mr-2" />
Download
                      </Link >
                    </Button > */}
                  </div >
                </div >

                <div className="space-y-4 relative">
                  {isSaving && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-3">
                        <Doodle type="star" className="w-12 h-12 text-accent" />
                        <p className="text-sm text-text font-medium">Saving...</p>
                      </div>
                    </div>
                  )}
                  <textarea
                    value={transcription}
                    onChange={(e) => handleTranscriptionChange(e.target.value)}
                    className="w-full min-h-[200px] p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    placeholder="Enter or edit the transcription here..."
                    disabled={filesLoading}
                  />

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{transcription.length} characters</span>
                    <span>{transcription.split(' ').filter(word => word.length > 0).length} words</span>
                  </div>
                </div>
              </div >
            </div >
          </div >
        </div >
      </div >
    </AudioPlayerProvider >
  )
}
