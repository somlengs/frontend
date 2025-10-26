'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Play, 
  Pause, 
  Save, 
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'

// Mock data - replace with real data from your API
const mockFiles = [
  {
    id: '1',
    name: 'speech_sample_001.wav',
    duration: '00:02:34',
    size: '2.4 MB',
    status: 'completed',
    transcription: 'Hello, this is a sample speech recording for our research dataset. We are testing the accuracy of our speech recognition system.',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'interview_002.wav',
    duration: '00:05:12',
    size: '4.8 MB',
    status: 'completed',
    transcription: 'Thank you for joining us today. Can you tell us about your experience with the product?',
    createdAt: '2024-01-15T11:15:00Z'
  },
  {
    id: '3',
    name: 'meeting_003.wav',
    duration: '00:08:45',
    size: '7.2 MB',
    status: 'processing',
    transcription: '',
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '4',
    name: 'lecture_004.wav',
    duration: '00:15:30',
    size: '12.1 MB',
    status: 'error',
    transcription: '',
    createdAt: '2024-01-15T13:30:00Z'
  },
  {
    id: '5',
    name: 'conference_005.wav',
    duration: '00:12:18',
    size: '9.7 MB',
    status: 'completed',
    transcription: 'Welcome to our annual conference. Today we will discuss the latest developments in artificial intelligence.',
    createdAt: '2024-01-15T14:00:00Z'
  },
  {
    id: '6',
    name: 'podcast_006.wav',
    duration: '00:25:42',
    size: '20.1 MB',
    status: 'completed',
    transcription: 'In this episode, we explore the fascinating world of machine learning and its applications in healthcare.',
    createdAt: '2024-01-15T15:30:00Z'
  },
  {
    id: '7',
    name: 'presentation_007.wav',
    duration: '00:18:55',
    size: '14.8 MB',
    status: 'processing',
    transcription: '',
    createdAt: '2024-01-15T16:00:00Z'
  },
  {
    id: '8',
    name: 'training_008.wav',
    duration: '00:07:23',
    size: '5.9 MB',
    status: 'completed',
    transcription: 'This training session covers the fundamentals of data science and statistical analysis.',
    createdAt: '2024-01-15T17:00:00Z'
  },
  {
    id: '9',
    name: 'demo_009.wav',
    duration: '00:14:12',
    size: '11.3 MB',
    status: 'error',
    transcription: '',
    createdAt: '2024-01-15T18:00:00Z'
  },
  {
    id: '10',
    name: 'workshop_010.wav',
    duration: '00:32:15',
    size: '25.7 MB',
    status: 'completed',
    transcription: 'Today we will learn about advanced techniques in natural language processing and text analysis.',
    createdAt: '2024-01-15T19:00:00Z'
  },
  {
    id: '11',
    name: 'seminar_011.wav',
    duration: '00:21:08',
    size: '16.9 MB',
    status: 'processing',
    transcription: '',
    createdAt: '2024-01-15T20:00:00Z'
  },
  {
    id: '12',
    name: 'tutorial_012.wav',
    duration: '00:09:47',
    size: '7.8 MB',
    status: 'completed',
    transcription: 'This tutorial will guide you through the process of building your first neural network.',
    createdAt: '2024-01-15T21:00:00Z'
  },
  {
    id: '13',
    name: 'interview_013.wav',
    duration: '00:16:33',
    size: '13.2 MB',
    status: 'completed',
    transcription: 'Thank you for taking the time to speak with us today. Can you tell us about your background in AI research?',
    createdAt: '2024-01-15T22:00:00Z'
  },
  {
    id: '14',
    name: 'lecture_014.wav',
    duration: '00:28:45',
    size: '23.1 MB',
    status: 'processing',
    transcription: '',
    createdAt: '2024-01-15T23:00:00Z'
  },
  {
    id: '15',
    name: 'meeting_015.wav',
    duration: '00:11:22',
    size: '9.1 MB',
    status: 'completed',
    transcription: 'Let\'s start today\'s meeting by reviewing our progress on the machine learning project.',
    createdAt: '2024-01-16T09:00:00Z'
  }
]

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

export default function TranscriptionEditorSection() {
  const [files] = useState(mockFiles)
  const [selectedFileId, setSelectedFileId] = useState('1')
  const [transcription, setTranscription] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const selectedFile = files.find(f => f.id === selectedFileId) || files[0]

  const handleTranscriptionChange = (value: string) => {
    setTranscription(value)
    setHasChanges(value !== selectedFile.transcription)
  }

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving transcription:', transcription)
    setHasChanges(false)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement audio playback
  }

  const handleFileSelect = (fileId: string) => {
    if (hasChanges) {
      // TODO: Ask user if they want to save changes
      console.log('Unsaved changes detected')
    }
    setSelectedFileId(fileId)
    const file = files.find(f => f.id === fileId)
    setTranscription(file?.transcription || '')
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-text transition-colors">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/dashboard/projects/1" className="hover:text-text transition-colors">
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
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-bg bordertext-text' 
                      : 'hover:bg-bg/20 text-bg/70 hover:text-bg'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm truncate flex-1">{file.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
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
              <p className="text-muted-foreground mt-1">{selectedFile.name}</p>
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
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="text-bg bg-text"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                size="sm"
                className="bg-accent text-text hover:bg-accent/90"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
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
                <span>{selectedFile.duration}</span>
                <span>•</span>
                <span>{selectedFile.size}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Previous */}}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="lg"
                    className="bg-accent text-text hover:bg-accent/90"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Next */}}
                  >
                    <RotateCcw className="w-4 h-4 rotate-180" />
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  00:00 / {selectedFile.duration}
                </div>
              </div>
            </div>
          </div>

          {/* Transcription Editor */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text">Transcription</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTranscription(selectedFile.transcription || '')}
                  className="text-bg bg-text"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-text bg-accent"
                >
                  <Link href="/dashboard/projects/1/transcriptions/1/download">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={transcription}
                onChange={(e) => handleTranscriptionChange(e.target.value)}
                className="w-full min-h-[200px] p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                placeholder="Enter or edit the transcription here..."
              />
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{transcription.length} characters</span>
                <span>{transcription.split(' ').length} words</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
