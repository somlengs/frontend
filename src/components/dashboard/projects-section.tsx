'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MoreVertical,
  Trash2,
  Edit,
  Grid3X3,
  List,
  Search,
  Filter,
  FolderOpen,
  FileText,
  WifiOff,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { ProjectsTable, Project } from '@/components/ui/projects-table'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover'
import { GooeyLoader } from '@/components/ui/gooey-loader'
import { EmptyState } from '@/components/ui/empty-state'
import { useProjects } from '@/hooks'
import { useSnackbar } from '@/components/ui/snackbar-provider'
import { parseServiceError } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const statusColors = {
  pending: 'text-orange-600 bg-orange-50',
  processing: 'text-blue-600 bg-blue-50',
  completed: 'text-green-600 bg-green-50',
  error: 'text-red-600 bg-red-50'
}

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  error: 'Error'
}

export default function ProjectsSection() {
  const { projects, isLoading, error, deleteProject, fetchProjects } = useProjects()
  const router = useRouter()
  const { showSnackbar } = useSnackbar()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const hasError = Boolean(error)
  const errorInfo = parseServiceError(error)

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open) {
      setProjectToDelete(null)
    }
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleDelete = (project: Project) => {
    setProjectToDelete(project)
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    setDeletingId(projectToDelete.id)
    const result = await deleteProject(projectToDelete.id)
    setDeletingId(null)

    if (result.success) {
      showSnackbar({ message: 'Project deleted', variant: 'success' })
    } else {
      showSnackbar({ message: result.error || 'Failed to delete project', variant: 'error' })
    }
    setProjectToDelete(null)
  }

  // Handle edit project
  const handleEdit = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}/edit`)
  }

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
            {mounted && (
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
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterStatus === null
                          ? 'bg-muted text-text'
                          : 'text-muted-foreground hover:text-text hover:bg-muted/50'
                          }`}
                      >
                        All Projects
                      </button>
                      <button
                        onClick={() => setFilterStatus('processing')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterStatus === 'processing'
                          ? 'bg-muted text-text'
                          : 'text-muted-foreground hover:text-text hover:bg-muted/50'
                          }`}
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => setFilterStatus('completed')}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterStatus === 'completed'
                          ? 'bg-muted text-text'
                          : 'text-muted-foreground hover:text-text hover:bg-muted/50'
                          }`}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/30 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-bg text-text shadow-sm'
                  : 'text-muted-foreground hover:text-text'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
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
              <Link href="/dashboard/projects/new" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Create Project
              </Link>
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          // Table View
          <ProjectsTable
            projects={hasError ? [] : filteredProjects}
            loading={isLoading}
            emptyTitle={
              hasError
                ? errorInfo.title
                : searchQuery || filterStatus
                  ? 'No projects match your filters'
                  : 'No projects yet'
            }
            emptyDescription={
              hasError
                ? errorInfo.description
                : searchQuery || filterStatus
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first project to start managing datasets and transcriptions.'
            }
            emptyActionLabel={hasError ? 'Try again' : 'Create Project'}
            onEmptyAction={
              hasError
                ? () => { fetchProjects() }
                : !searchQuery && !filterStatus
                  ? () => { window.location.href = '/dashboard/projects/new' }
                  : undefined
            }
            emptyIcon={hasError ? WifiOff : undefined}
            emptyVariant={hasError && errorInfo.isServiceOutage ? 'warning' : undefined}
            onProjectClick={(project) => window.location.href = `/dashboard/projects/${project.id}`}
            onActionClick={(action, project) => {
              if (action === 'delete') {
                handleDelete(project)
              } else if (action === 'edit') {
                handleEdit(project)
              }
            }}
          />
        ) : (
          // Grid View - Simplified Cards
          isLoading ? (
            <div className="flex items-center justify-center w-full min-h-[60vh]">
              <GooeyLoader
                primaryColor="var(--color-accent)"
                secondaryColor="var(--accent-foreground)"
                borderColor="var(--border)"
              />
            </div>
          ) : hasError ? (
            <div className="flex items-center justify-center w-full min-h-[60vh]">
              <div className="bg-bg border border-border rounded-lg w-full max-w-xl">
                <EmptyState
                  title={errorInfo.title}
                  description={errorInfo.description}
                  icons={[WifiOff]}
                  action={{
                    label: (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try again
                      </span>
                    ),
                    onClick: () => { fetchProjects() }
                  }}
                  variant={errorInfo.isServiceOutage ? 'warning' : 'error'}
                />
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex border border-border rounded-lg items-center justify-center w-full min-h-[60vh]">
              <div className="bg-bg w-full max-w-xl">
                <EmptyState
                  title={searchQuery || filterStatus ? 'No projects match your filters' : 'No projects yet'}
                  description={
                    searchQuery || filterStatus
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first project to start managing datasets and transcriptions.'
                  }
                  icons={[FolderOpen, FileText, Edit]}
                  action={
                    !searchQuery && !filterStatus
                      ? {
                        label: (
                          <span className="inline-flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Create Project
                          </span>
                        ),
                        onClick: () => { window.location.href = '/dashboard/projects/new' }
                      }
                      : undefined
                  }
                />
              </div>
            </div>
          ) : (
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
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[project.status as keyof typeof statusColors] || statusColors.pending}`}>
                      {statusLabels[project.status as keyof typeof statusLabels] || statusLabels.pending}
                    </span>

                    {mounted && (
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
                            <PopoverClose asChild>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-text hover:bg-muted/50 flex items-center gap-2 disabled:opacity-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(project)
                                }}
                                disabled={deletingId === project.id}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Project
                              </button>
                            </PopoverClose>
                            <PopoverClose asChild>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted/50 flex items-center gap-2 disabled:opacity-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(project)
                                }}
                                disabled={deletingId === project.id || isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                                {deletingId === project.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </PopoverClose>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Dialog open={!!projectToDelete} onOpenChange={handleDeleteDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProjectToDelete(null)}
              disabled={deletingId === projectToDelete?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId === projectToDelete?.id}
            >
              {deletingId === projectToDelete?.id ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
