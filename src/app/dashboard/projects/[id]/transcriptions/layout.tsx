import React from 'react'
import TranscriptionEditorSection from '@/components/dashboard/projects/project_detail/transcription/transcription-editor-section'

export default function TranscriptionLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <TranscriptionEditorSection />
            <div className="hidden">{children}</div>
        </>
    )
}
