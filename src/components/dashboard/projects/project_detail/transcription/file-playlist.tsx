'use client'

import React, { useState } from 'react'
import { Search, CheckCircle, Clock, AlertCircle, Play, Pause } from 'lucide-react'
import { AudioFile } from '@/hooks/dashboard/use-files'
import { cn } from '@/lib/utils'

type FilePlaylistProps = {
    files: AudioFile[]
    selectedFileId: string
    onSelect: (fileId: string) => void
    isPlaying?: boolean
    currentPlayingId?: string
}

const statusConfig = {
    completed: {
        icon: CheckCircle,
        color: 'text-green-500',
    },
    processing: {
        icon: Clock,
        color: 'text-blue-500',
    },
    error: {
        icon: AlertCircle,
        color: 'text-red-500',
    },
}

export function FilePlaylist({
    files,
    selectedFileId,
    onSelect,
    isPlaying = false,
    currentPlayingId,
}: FilePlaylistProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full border-r border-border/50">
            {/* Header & Search */}
            <div className="p-4 border-b border-border/50 space-y-4">
                <div>
                    <h2 className="text-lg font-serif font-medium text-text">Playlist</h2>
                    <p className="text-xs text-muted-foreground">{files.length} tracks</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredFiles.map((file) => {
                    const status = statusConfig[file.status as keyof typeof statusConfig] || statusConfig.processing
                    const StatusIcon = status.icon
                    const isSelected = file.id === selectedFileId
                    const isPlayingCurrent = currentPlayingId === file.id && isPlaying

                    return (
                        <button
                            key={file.id}
                            onClick={() => onSelect(file.id)}
                            className={cn(
                                'w-full text-left p-3 rounded-lg transition-all duration-200 group relative overflow-hidden',
                                isSelected
                                    ? 'bg-accent text-accent-foreground shadow-sm'
                                    : 'hover:bg-accent/10 text-muted-foreground hover:text-text'
                            )}
                        >
                            {/* Active Indicator Bar */}
                            {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                            )}

                            <div className="flex items-center gap-3">
                                {/* Status/Play Icon */}
                                <div className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                    isSelected ? "bg-background/20" : "bg-background/50 group-hover:bg-background"
                                )}>
                                    {isPlayingCurrent ? (
                                        <Pause className="w-4 h-4" />
                                    ) : isSelected ? (
                                        <Play className="w-4 h-4 ml-0.5" />
                                    ) : (
                                        <StatusIcon className={cn("w-4 h-4", status.color)} />
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn(
                                        "text-sm font-medium truncate",
                                        isSelected ? "text-accent-foreground" : "text-text"
                                    )}>
                                        {file.name}
                                    </h3>
                                    <div className={cn(
                                        "flex items-center gap-2 text-xs mt-0.5",
                                        isSelected ? "text-accent-foreground/70" : "text-muted-foreground"
                                    )}>
                                        <span>{file.duration}</span>
                                        <span>•</span>
                                        <span>{file.size}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
