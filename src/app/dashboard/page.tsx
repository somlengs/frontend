'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  MoreVertical, 
  Play, 
  Pause,
  Download,
  Trash2,
  Edit,
  Grid3X3,
  List,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { ProjectsTable, Project } from '@/components/ui/projects-table'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Mock data - replace with real data from your API
const mockProjects = [
  {
    id: '1',
    name: 'Speech Recognition Research',
    description: 'Dataset for training speech recognition models',
    status: 'processing',
    audioFiles: 12,
    transcriptions: 8,
    createdAt: '2024-01-15',
    lastModified: '2024-01-20'
  },
  {
    id: '2', 
    name: 'Voice Cloning Dataset',
    description: 'High-quality voice samples for cloning research',
    status: 'completed',
    audioFiles: 25,
    transcriptions: 25,
    createdAt: '2024-01-10',
    lastModified: '2024-01-18'
  },
  {
    id: '3',
    name: 'Multilingual Speech Corpus',
    description: 'Speech data in multiple languages',
    status: 'draft',
    audioFiles: 5,
    transcriptions: 0,
    createdAt: '2024-01-22',
    lastModified: '2024-01-22'
  }
]

const statusColors = {
  draft: 'text-muted-foreground bg-muted',
  processing: 'text-blue-600 bg-blue-50',
  completed: 'text-green-600 bg-green-50',
  error: 'text-red-600 bg-red-50'
}

const statusLabels = {
  draft: 'Draft',
  processing: 'Processing',
  completed: 'Completed', 
  error: 'Error'
}

export default function DashboardPage() {
  const [projects] = useState(mockProjects)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)


  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === null || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-text">
          <BrushUnderline variant="accent" animated>Your Projects</BrushUnderline>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your speech datasets and transcriptions
        </p>
      </div>


      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for a project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-border focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-border focus-visible:shadow-none"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-md transition-colors border border-dashed text-muted-foreground hover:text-text border-muted-foreground/30 hover:border-muted-foreground/50">
                  <Filter className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-bg border-border" align="end" side="bottom" sideOffset={4}>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-text mb-3">Filter by Status</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setFilterStatus(null)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filterStatus === null 
                          ? 'bg-muted text-text' 
                          : 'text-muted-foreground hover:text-text hover:bg-muted/50'
                      }`}
                    >
                      All Projects
                    </button>
                    <button
                      onClick={() => setFilterStatus('processing')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filterStatus === 'processing' 
                          ? 'bg-muted text-text' 
                          : 'text-muted-foreground hover:text-text hover:bg-muted/50'
                      }`}
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => setFilterStatus('completed')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filterStatus === 'completed' 
                          ? 'bg-muted text-text' 
                          : 'text-muted-foreground hover:text-text hover:bg-muted/50'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setFilterStatus('draft')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filterStatus === 'draft' 
                          ? 'bg-muted text-text' 
                          : 'text-muted-foreground hover:text-text hover:bg-muted/50'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/30 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-bg text-text shadow-sm' 
                    : 'text-muted-foreground hover:text-text'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-bg text-text shadow-sm' 
                    : 'text-muted-foreground hover:text-text'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
            <Button
              size="sm"
              className="bg-text text-bg hover:bg-text/90"
              asChild
            >
              <Link href="/dashboard/projects/new">
                Create Project
              </Link>
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          // Table View
            <ProjectsTable
            projects={filteredProjects as Project[]}
            onProjectClick={(project) => window.location.href = `/dashboard/projects/${project.id}`}
            onActionClick={(action, project) => {
              console.log(`${action} clicked for project:`, project.name)
              // Handle different actions
            }}
          />
        ) : (
          // Grid View - Simplified Cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-bg border border-border rounded-lg p-5 hover:bg-muted/30 transition-colors cursor-pointer group relative min-h-[140px] flex flex-col"
                onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
              >
                {/* Content Area - Full Width */}
                <div className="flex-1 mb-4">
                  <h3 className="text-base font-semibold text-text mb-2 line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                </div>
                
                {/* Bottom Row - Status and More Options */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                    {statusLabels[project.status as keyof typeof statusLabels]}
                  </span>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0 bg-bg border-border" align="end" side="bottom" sideOffset={4} style={{ position: 'fixed' }}>
                      <div className="py-1">
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-text hover:bg-muted/50 flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle edit
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          Edit Project
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted/50 flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle delete
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
