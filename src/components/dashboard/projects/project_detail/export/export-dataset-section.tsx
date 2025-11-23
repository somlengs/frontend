'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import { useSnackbar } from '@/components/ui/snackbar-provider'
import { useParams } from 'next/navigation'
import { useExport } from '@/hooks/dashboard/use-export'

export default function ExportDatasetSection() {
  const [format, setFormat] = useState<'csv' | 'tsv'>('csv')
  const params = useParams()
  const projectId = params?.id as string
  const { showSnackbar } = useSnackbar()
  const { exportDataset, isExporting } = useExport()

  const handleExport = async () => {
    const result = await exportDataset({
      projectId,
      format
    })

    if (result.success) {
      showSnackbar({ message: 'Dataset exported successfully', variant: 'success' })
    } else {
      showSnackbar({ message: result.error || 'Export failed', variant: 'error' })
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
                <div>📁 <strong>files/</strong> - Original audio files (WAV format)</div>
                <div>📄 <strong>metadata.{format}</strong> - {format === 'csv' ? 'Comma' : 'Tab'}-separated file with metadata and transcriptions</div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Export Format</h3>
              <p className="text-sm text-muted-foreground">
                Your dataset will be exported as a ZIP file containing the standard structure above.
                Metadata and transcriptions are always included for completed files.
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-bg border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Export Options</h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-text">Metadata Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value as 'csv')}
                    className="text-accent focus:ring-accent"
                  />
                  <span className="text-text">CSV (Comma-separated)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="tsv"
                    checked={format === 'tsv'}
                    onChange={(e) => setFormat(e.target.value as 'tsv')}
                    className="text-accent focus:ring-accent"
                  />
                  <span className="text-text">TSV (Tab-separated)</span>
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose the delimiter for your metadata file. Both formats include file paths and transcriptions.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href={`/dashboard/projects/${projectId}`}>
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
