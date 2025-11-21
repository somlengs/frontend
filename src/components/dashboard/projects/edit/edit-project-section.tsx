'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { Input } from '@/components/ui/input'
import { useProjects } from '@/hooks'
import { useSnackbar } from '@/components/ui/snackbar-provider'

export default function EditProjectSection() {
  const { getProject, updateProject } = useProjects()
  const params = useParams()
  const router = useRouter()
  const { showSnackbar } = useSnackbar()

  const projectId = params?.id as string

  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadProject = async () => {
      if (!projectId) return
      setIsLoading(true)
      const result = await getProject(projectId)
      if (cancelled) return

      if (result.success && result.project) {
        setProjectName(result.project.name || result.project.project_name || '')
        setDescription(result.project.description || '')
      } else {
        showSnackbar({ message: result.error || 'Failed to load project', variant: 'error' })
      }
      setIsLoading(false)
    }

    loadProject()

    return () => {
      cancelled = true
    }
  }, [projectId, getProject])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!projectId) return

    setIsSaving(true)

    const result = await updateProject(projectId, {
      name: projectName,
      description,
    })

    setIsSaving(false)

    if (result.success) {
      showSnackbar({ message: 'Project updated successfully', variant: 'success' })
      router.refresh()
      setTimeout(() => {
        router.push(`/dashboard/`)
      }, 600)
    } else {
      showSnackbar({ message: result.error || 'Failed to update project', variant: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-text">
            <BrushUnderline variant="accent" animated>Edit Project</BrushUnderline>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Update your project details
          </p>
        </div>
      </div>


      <form onSubmit={handleSubmit} className="space-y-6 bg-bg border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-text mb-2">
              Project Name
            </label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              placeholder="Describe your project"
              rows={4}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href={`/dashboard/`}>
            <Button variant="ghost" type="button" disabled={isSaving}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-text text-bg hover:bg-text/90"
            disabled={!projectName.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

