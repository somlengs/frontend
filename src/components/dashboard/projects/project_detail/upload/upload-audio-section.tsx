'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { useFileUpload } from '@/hooks'
import { useSnackbar } from '@/components/ui/snackbar-provider'

export default function UploadAudioSection() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const { uploadFiles, isUploading, uploadProgress, error } = useFileUpload()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const { showSnackbar } = useSnackbar()

  const processFiles = (files: File[]) => {
    // Check file size limits
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB per file
    const MAX_TOTAL_SIZE = 500 * 1024 * 1024 // 500MB total
    const MAX_FILES = 100 // Maximum number of files

    let totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)
    const newFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      // Check individual file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 50MB)`)
        continue
      }

      // Check total size limit
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        errors.push(`${file.name}: Total upload size would exceed 500MB`)
        continue
      }

      // Check file count limit
      if (uploadedFiles.length + newFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`)
        break
      }

      // Check file type
      const isZip = file.name.toLowerCase().endsWith('.zip')
      const isAudio = file.name.toLowerCase().match(/\.(wav)$/)

      if (!isZip && !isAudio) {
        errors.push(`${file.name}: Only WAV audio files and ZIP datasets are allowed`)
        continue
      }

      newFiles.push(file)
      totalSize += file.size
    }

    // Show errors if any
    if (errors.length > 0) {
      showSnackbar({ message: errors.join(' • '), variant: 'error' })
    }

    // Add valid files
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    processFiles(files)

    // Reset input
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)

    const files = Array.from(event.dataTransfer?.files || [])
    if (files.length === 0) return
    processFiles(files)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isDragActive) setIsDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    // Only reset when leaving the container, not children
    if ((event.target as HTMLElement).id === 'file-dropzone') {
      setIsDragActive(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || uploadedFiles.length === 0) return

    try {
      const result = await uploadFiles(projectId, uploadedFiles)
      if (result.success) {
        showSnackbar({ message: 'Files uploaded successfully', variant: 'success' })
        router.push(`/dashboard/projects/${projectId}`)
      } else {
        showSnackbar({ message: result.error || 'Upload failed', variant: 'error' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      showSnackbar({ message: 'Failed to upload files', variant: 'error' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-text">
            <BrushUnderline variant="accent" animated>Upload Audio Files</BrushUnderline>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add new audio files to your project
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-bg border border-border rounded-lg p-6 space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text">
              Select Audio Files
            </label>

            <div
              id="file-dropzone"
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragActive ? 'border-primary bg-muted/40' : 'border-border hover:border-primary'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".wav,.zip"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload files or drag and drop your audio files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports only WAV audio files
                </p>
              </label>
            </div>

            {/* Upload Progress */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text font-medium">
                    Selected Files ({uploadedFiles.length}/100)
                  </span>
                  <span className="text-muted-foreground">
                    {(uploadedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)}MB / 500MB
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${(uploadedFiles.reduce((sum, file) => sum + file.size, 0) / (500 * 1024 * 1024)) > 0.8
                      ? 'bg-red-500'
                      : (uploadedFiles.reduce((sum, file) => sum + file.size, 0) / (500 * 1024 * 1024)) > 0.6
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                      }`}
                    style={{
                      width: `${Math.min(
                        (uploadedFiles.reduce((sum, file) => sum + file.size, 0) / (500 * 1024 * 1024)) * 100,
                        100
                      )}%`
                    }}
                  ></div>
                </div>
                {(uploadedFiles.reduce((sum, file) => sum + file.size, 0) / (500 * 1024 * 1024)) > 0.8 && (
                  <p className="text-sm text-red-600">
                    ⚠️ Approaching upload limit (500MB max)
                  </p>
                )}
              </div>
            )}

            {/* Selected Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text">Files Ready for Upload</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => {
                    const isZip = file.name.toLowerCase().endsWith('.zip')
                    const isAudio = file.name.toLowerCase().match(/\.(wav)$/)
                    return (
                      <div key={index} className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-text truncate">{file.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${isZip ? 'bg-blue-100 text-blue-800' :
                            isAudio ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {isZip ? 'ZIP Dataset' : isAudio ? 'Audio File' : 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text font-medium">Uploading...</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}


          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href={`/dashboard/projects/${projectId}`}>
              <Button variant="ghost" type="button" disabled={isUploading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-text text-bg hover:bg-text/90"
              disabled={uploadedFiles.length === 0 || isUploading}
            >
              {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
