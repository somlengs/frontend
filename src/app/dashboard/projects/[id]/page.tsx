'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Edit, 
  Trash2, 
  MoreVertical,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { AudioFilesTable, AudioFile } from '@/components/ui/audio-files-table'

// Mock data - replace with real data from your API
const mockProject = {
  id: '1',
  name: 'Speech Recognition Research',
  description: 'Dataset for training speech recognition models',
  status: 'processing',
  audioFiles: 12,
  transcriptions: 8,
  createdAt: '2024-01-15',
  lastModified: '2024-01-20'
}

const mockAudioFiles = [
  {
    id: '1',
    name: 'speech_sample_001.wav',
    duration: '00:02:34',
    size: '2.4 MB',
    status: 'completed',
    transcription: 'Hello, this is a sample speech recording for our research dataset.',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2', 
    name: 'speech_sample_002.wav',
    duration: '00:01:45',
    size: '1.8 MB',
    status: 'processing',
    transcription: null,
    createdAt: '2024-01-15T10:35:00Z'
  },
  {
    id: '3',
    name: 'speech_sample_003.wav', 
    duration: '00:03:12',
    size: '3.1 MB',
    status: 'completed',
    transcription: 'This is another example of speech data that has been successfully transcribed.',
    createdAt: '2024-01-15T10:40:00Z'
  },
  {
    id: '4',
    name: 'interview_001.wav',
    duration: '00:05:18',
    size: '4.2 MB',
    status: 'completed',
    transcription: 'Thank you for joining us today. Can you tell us about your experience with the product?',
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '5',
    name: 'meeting_001.wav',
    duration: '00:08:45',
    size: '7.1 MB',
    status: 'processing',
    transcription: null,
    createdAt: '2024-01-15T11:30:00Z'
  },
  {
    id: '6',
    name: 'lecture_001.wav',
    duration: '00:15:30',
    size: '12.4 MB',
    status: 'error',
    transcription: null,
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '7',
    name: 'conference_001.wav',
    duration: '00:12:18',
    size: '9.7 MB',
    status: 'completed',
    transcription: 'Welcome to our annual conference. Today we will discuss the latest developments in artificial intelligence.',
    createdAt: '2024-01-15T13:00:00Z'
  },
  {
    id: '8',
    name: 'podcast_001.wav',
    duration: '00:25:42',
    size: '20.1 MB',
    status: 'completed',
    transcription: 'In this episode, we explore the fascinating world of machine learning and its applications in healthcare.',
    createdAt: '2024-01-15T14:00:00Z'
  },
  {
    id: '9',
    name: 'presentation_001.wav',
    duration: '00:18:55',
    size: '14.8 MB',
    status: 'processing',
    transcription: null,
    createdAt: '2024-01-15T15:00:00Z'
  },
  {
    id: '10',
    name: 'training_001.wav',
    duration: '00:07:23',
    size: '5.9 MB',
    status: 'completed',
    transcription: 'This training session covers the fundamentals of data science and statistical analysis.',
    createdAt: '2024-01-15T16:00:00Z'
  },
  {
    id: '11',
    name: 'demo_001.wav',
    duration: '00:14:12',
    size: '11.3 MB',
    status: 'error',
    transcription: null,
    createdAt: '2024-01-15T17:00:00Z'
  },
  {
    id: '12',
    name: 'workshop_001.wav',
    duration: '00:32:15',
    size: '25.7 MB',
    status: 'completed',
    transcription: 'Today we will learn about advanced techniques in natural language processing and text analysis.',
    createdAt: '2024-01-15T18:00:00Z'
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

export default function ProjectDetailPage() {
  const [project] = useState(mockProject)
  const [audioFiles] = useState(mockAudioFiles)
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'processing' | 'error'>('all')

  // Filter files based on active tab
  const filteredFiles = audioFiles.filter(file => {
    if (activeTab === 'all') return true
    return file.status === activeTab
  })

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
            <span className="text-text">{project.name}</span>
          </div>
          <h1 className="text-3xl font-serif text-text">
            <BrushUnderline variant="accent" animated>{project.name}</BrushUnderline>
          </h1>
          <p className="mt-2 text-muted-foreground">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-text text-bg hover:bg-text/90"
            asChild
          >
            <Link href="/dashboard/projects/1/upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </Link>
          </Button>
          
          <Button
            size="sm"
            className="bg-accent text-text hover:bg-accent/90"
            asChild
          >
            <Link href="/dashboard/projects/1/export">
              <Download className="w-4 h-4 mr-2" />
              Export Dataset
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="bg-muted/30 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg">🎵</span>
            <span className="text-sm font-medium text-text">{project.audioFiles} audio files</span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <div className="flex items-center gap-1">
            <span className="text-lg">📄</span>
            <span className="text-sm font-medium text-text">{project.transcriptions} transcriptions</span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <div className="flex items-center gap-1">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium text-text">{Math.round((project.transcriptions / project.audioFiles) * 100)}% complete</span>
          </div>
        </div>
      </div> */}

      {/* Audio Files List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">Audio Files</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              // Handle transcription processing
              console.log('Starting transcription processing...')
              alert('Transcription processing started! This may take a few minutes.')
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Process Transcription
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="border-b border-border">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'text-text border-text'
                  : 'text-muted-foreground border-transparent hover:text-text'
              }`}
            >
              All ({audioFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'completed'
                  ? 'text-text border-text'
                  : 'text-muted-foreground border-transparent hover:text-text'
              }`}
            >
              Completed ({audioFiles.filter(f => f.status === 'completed').length})
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'processing'
                  ? 'text-text border-text'
                  : 'text-muted-foreground border-transparent hover:text-text'
              }`}
            >
              Processing ({audioFiles.filter(f => f.status === 'processing').length})
            </button>
            <button
              onClick={() => setActiveTab('error')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'error'
                  ? 'text-text border-text'
                  : 'text-muted-foreground border-transparent hover:text-text'
              }`}
            >
              Error ({audioFiles.filter(f => f.status === 'error').length})
            </button>
          </div>
        </div>

        <AudioFilesTable
          files={filteredFiles as AudioFile[]}
          onFileClick={(file) => window.location.href = `/dashboard/projects/1/transcriptions/${file.id}`}
          onActionClick={(action, file) => {
            console.log(`${action} clicked for file:`, file.name)
            // Handle different actions
          }}
          stickyHeader={true}
          maxHeight="600px"
        />
      </div>

    </div>
  )
}
