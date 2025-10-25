'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'

export default function ExportDatasetPage() {
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeTranscriptions, setIncludeTranscriptions] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON',
      description: 'Structured data format for developers',
      icon: '📄'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Spreadsheet format for data analysis',
      icon: '📊'
    },
    {
      id: 'txt',
      name: 'Text Files',
      description: 'Plain text files for each transcription',
      icon: '📝'
    },
    {
      id: 'srt',
      name: 'SRT',
      description: 'SubRip subtitle format for video editing',
      icon: '🎬'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Show success message
    alert(`Dataset exported successfully as ${selectedFormat.toUpperCase()}!`)
    
    setIsExporting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects/1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-text">
            <BrushUnderline variant="accent" animated>Export Dataset</BrushUnderline>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Download your project data in various formats
          </p>
        </div>
      </div>

        {/* Export Options */}
        <div className="space-y-6">
          {/* Dataset Organization Plan */}
          <div className="bg-bg border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Dataset Organization</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-text mb-2">Standard Dataset Structure</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>📁 <strong>wav/</strong> - Original audio files (WAV format)</div>
                  <div>📄 <strong>metadata.tsv</strong> - Tab-separated file with metadata and transcriptions</div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Export Format</h3>
                <p className="text-sm text-muted-foreground">
                  Your dataset will be exported as a ZIP file containing the standard structure above.
                </p>
              </div>
            </div>
          </div>

        {/* Export Options */}
        <div className="bg-bg border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Export Options</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-border"
              />
              <div>
                <div className="font-medium text-text">Include Metadata</div>
                <div className="text-sm text-muted-foreground">
                  File names, sizes, durations, and creation dates
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeTranscriptions}
                onChange={(e) => setIncludeTranscriptions(e.target.checked)}
                className="rounded border-border"
              />
              <div>
                <div className="font-medium text-text">Include Transcriptions</div>
                <div className="text-sm text-muted-foreground">
                  All text transcriptions and their timestamps
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-muted/30 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Export Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text">12</div>
              <div className="text-sm text-muted-foreground">Audio Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text">8</div>
              <div className="text-sm text-muted-foreground">Transcriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text">2.4 MB</div>
              <div className="text-sm text-muted-foreground">Estimated Size</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/projects/1">
            <Button variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-accent text-text hover:bg-accent/90"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Dataset
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
