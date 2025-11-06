'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Upload, 
  Download, 
  FileText,
  ChevronRight,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { AudioFilesTable, AudioFile } from '@/components/ui/audio-files-table'
import { useTranscription } from '@/hooks/dashboard/use-transcription'
import { Doodle } from '@/components/ui/doodle'
import Pagination from '@/components/ui/pagination'

// Mock data - replace with real data from your API
const mockProject = {
  id: '1',
  name: 'Speech Recognition Research',
  description: 'Dataset for training speech recognition models',
  status: 'processing',
  audioFiles: 30,
  transcriptions: 18,
  createdAt: '2024-01-15',
  lastModified: '2024-01-20'
}

const baseFiles = [
  {
    name: 'speech_sample',
    duration: '00:02:34',
    size: '2.4 MB',
    status: 'completed',
    transcription: 'Hello, this is a sample speech recording for our research dataset.',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    name: 'speech_sample',
    duration: '00:01:45',
    size: '1.8 MB',
    status: 'processing',
    transcription: null,
    createdAt: '2024-01-15T10:35:00Z',
  },
  {
    name: 'speech_sample',
    duration: '00:03:12',
    size: '3.1 MB',
    status: 'completed',
    transcription: 'This is another example of speech data that has been successfully transcribed.',
    createdAt: '2024-01-15T10:40:00Z',
  },
  {
    name: 'interview',
    duration: '00:05:18',
    size: '4.2 MB',
    status: 'completed',
    transcription: 'Thank you for joining us today. Can you tell us about your experience with the product?',
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    name: 'meeting',
    duration: '00:08:45',
    size: '7.1 MB',
    status: 'processing',
    transcription: null,
    createdAt: '2024-01-15T11:30:00Z',
  },
  {
    name: 'lecture',
    duration: '00:15:30',
    size: '12.4 MB',
    status: 'error',
    transcription: null,
    createdAt: '2024-01-15T12:00:00Z',
  },
  {
    name: 'conference',
    duration: '00:12:18',
    size: '9.7 MB',
    status: 'completed',
    transcription: 'Welcome to our annual conference. Today we will discuss the latest developments in artificial intelligence.',
    createdAt: '2024-01-15T13:00:00Z',
  },
  {
    name: 'podcast',
    duration: '00:25:42',
    size: '20.1 MB',
    status: 'completed',
    transcription: 'In this episode, we explore the fascinating world of machine learning and its applications in healthcare.',
    createdAt: '2024-01-15T14:00:00Z',
  },
  {
    name: 'presentation',
    duration: '00:18:55',
    size: '14.8 MB',
    status: 'processing',
    transcription: null,
    createdAt: '2024-01-15T15:00:00Z',
  },
  {
    name: 'training',
    duration: '00:07:23',
    size: '5.9 MB',
    status: 'completed',
    transcription: 'This training session covers the fundamentals of data science and statistical analysis.',
    createdAt: '2024-01-15T16:00:00Z',
  },
  {
    name: 'demo',
    duration: '00:14:12',
    size: '11.3 MB',
    status: 'error',
    transcription: null,
    createdAt: '2024-01-15T17:00:00Z',
  },
  {
    name: 'workshop',
    duration: '00:32:15',
    size: '25.7 MB',
    status: 'completed',
    transcription: 'Today we will learn about advanced techniques in natural language processing and text analysis.',
    createdAt: '2024-01-15T18:00:00Z',
  }
]

const makeFakeTranscription = (idx: number) => {
  const texts = [
    null,
    'Sample text for transcription.',
    'Recording was not clear enough to process.',
    'Successfully transcribed.',
    null,
    null,
    'Another example transcription.',
    null,
    'No speech detected.',
    'Processed with warnings.',
    'Speaker accent identified.',
    null
  ]
  return texts[idx % texts.length]
}

const makeStatus = (idx: number) => {
  const statuses = ['completed', 'processing', 'error']
  return statuses[idx % statuses.length]
}

// Generate 30 dummy files
const mockAudioFiles = Array.from({ length: 30 }, (_, i) => {
  const base = baseFiles[i % baseFiles.length]
  return {
    id: String(i + 1),
    name: `${base.name}_${String(i + 1).padStart(3, '0')}.wav`,
    duration: base.duration,
    size: base.size,
    status: makeStatus(i),
    transcription: makeFakeTranscription(i),
    createdAt: new Date(Date.parse(base.createdAt || '2024-01-15T12:00:00Z') + i * 3600000).toISOString()
  }
})

// const statusConfig = {
//   completed: {
//     label: 'Completed',
//     color: 'bg-green-100 text-green-800 border-green-200',
//     icon: CheckCircle
//   },
//   processing: {
//     label: 'Processing',
//     color: 'bg-blue-100 text-blue-800 border-blue-200',
//     icon: Clock
//   },
//   error: {
//     label: 'Error',
//     color: 'bg-red-100 text-red-800 border-red-200',
//     icon: AlertCircle
//   }
// }

export default function ProjectDetailSection() {
  const [project] = useState(mockProject)
  const [audioFiles] = useState(mockAudioFiles)
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'processing' | 'error'>('all')
  const { processTranscription, isProcessing } = useTranscription()
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 13 // Capped at 13 for now cuz more than that it broke the page height.
  React.useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // Reset to first page when tab/filter changes
  React.useEffect(() => {
    setPage(1)
  }, [activeTab])

  // Filter files based on active tab
  const filteredFiles = audioFiles.filter(file => {
    if (activeTab === 'all') return true
    return file.status === activeTab
  })

  const totalCount = filteredFiles.length
  const paginatedFiles = filteredFiles.slice((page - 1) * pageSize, page * pageSize)

  const handleProcessTranscription = async () => {
    // Process all files that haven't been processed yet
    const unprocessedFiles = audioFiles.filter(f => f.status !== 'completed' && f.status !== 'error')
    if (unprocessedFiles.length === 0) {
      alert('All files have already been processed!')
      return
    }
    
    for (const file of unprocessedFiles) {
      await processTranscription(file.id)
    }
  }

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

      {/* Audio Files List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">Audio Files</h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleProcessTranscription}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Doodle type="circle" className="w-4 h-4 mr-2" />
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

        <div className="flex-1 min-h-0 overflow-hidden grid" style={{ gridTemplateRows: '1fr auto' }}>
          <AudioFilesTable
            files={paginatedFiles as AudioFile[]}
            // files={[]}
            loading={loading}
            emptyActionLabel="Upload Files"
            onEmptyAction={() => { window.location.href = '/dashboard/projects/1/upload' }}
            onFileClick={(file) => window.location.href = `/dashboard/projects/1/transcriptions/${file.id}`}
            onActionClick={(action, file) => {
              console.log(`${action} clicked for file:`, file.name)
              // Handle different actions
            }}
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

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center gap-6 max-w-md mx-4">
              <Doodle type="circle" className="w-24 h-24 text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-text">Processing Transcription</h3>
                <p className="text-muted-foreground">
                  Please wait while we process your audio files. This may take a few minutes.
                </p>
              </div>
              <div className="flex gap-2">
                <Doodle type="squiggle" className="w-16 h-6 text-accent" />
                <Doodle type="star" className="w-8 h-8 text-primary" />
                <Doodle type="arrow" className="w-12 h-12 text-accent" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
