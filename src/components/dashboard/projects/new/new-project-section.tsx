'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'

export default function NewProjectSection() {
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
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
      const isAudio = file.name.toLowerCase().match(/\.(wav|mp3)$/)
      
      if (!isZip && !isAudio) {
        errors.push(`${file.name}: Only WAV, MP3, and ZIP files allowed`)
        continue
      }
      
      newFiles.push(file)
      totalSize += file.size
    }
    
    // Show errors if any
    if (errors.length > 0) {
      alert('Upload errors:\n' + errors.join('\n'))
    }
    
    // Add valid files
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
    
    // Reset input
    event.target.value = ''
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle project creation
    console.log('Creating project:', { projectName, description, uploadedFiles })
    // Redirect to dashboard or project page
    window.location.href = '/dashboard'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
       <div className="flex items-start justify-start gap-4">
         <Link href="/dashboard">
           <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
             <ArrowLeft className="h-4 w-4" />
           </Button>
         </Link>
         <h1 className="text-3xl font-serif text-text">
           <BrushUnderline variant="accent" animated>Create New Project</BrushUnderline>
         </h1>
       </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-bg border border-border rounded-lg p-6 space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-text mb-2">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-card text-text placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className="w-full px-3 py-2 border border-border rounded-md bg-card text-text placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Describe your project"
                rows={3}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text">
              Upload Audio Files
            </label>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                multiple
                accept=".wav,.mp3,.zip"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload audio files or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports WAV, MP3 files or ZIP datasets
                </p>
              </label>
            </div>

            {/* Upload Progress */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text font-medium">
                    Uploaded Files ({uploadedFiles.length}/100)
                  </span>
                  <span className="text-muted-foreground">
                    {(uploadedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)}MB / 500MB
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (uploadedFiles.reduce((sum, file) => sum + file.size, 0) / (500 * 1024 * 1024)) > 0.8 
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

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text">Files Ready for Upload</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => {
                    const isZip = file.name.toLowerCase().endsWith('.zip')
                    const isAudio = file.name.toLowerCase().match(/\.(wav|mp3)$/)
                    return (
                      <div key={index} className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-text truncate">{file.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isZip ? 'bg-blue-100 text-blue-800' : 
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/dashboard">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-text text-bg hover:bg-text/90"
              disabled={!projectName.trim()}
            >
              Create Project
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
