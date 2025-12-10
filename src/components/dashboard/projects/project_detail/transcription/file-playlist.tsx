'use client'

import React, { useState } from 'react'
import { Search, CheckCircle, Clock, AlertCircle, Play, Pause } from 'lucide-react'
import { AudioFile } from '@/hooks/dashboard/use-files'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { AudioPlayerButton, AudioPlayerItem, useAudioPlayer } from '@/components/ui/audio-player'

type FilePlaylistProps = {
    files: AudioFile[]
    selectedFileId: string
    onSelect: (fileId: string) => void
    isPlaying?: boolean
    currentPlayingId?: string
    isLoading?: boolean
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
    isLoading = false,
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
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <p className="text-sm">No files found</p>
                    </div>
                ) : (
                    filteredFiles.map((file, index) => {
                        const isSelected = file.id === selectedFileId
                        const isPlayingCurrent = currentPlayingId === file.id && isPlaying

                        const audioItem: AudioPlayerItem = {
                            id: file.id,
                            src: file.audioUrl || '',
                            data: {
                                id: file.id,
                                name: file.name,
                                url: file.audioUrl || '',
                            },
                        }

                        const handlePlayClick = (e: React.MouseEvent) => {
                            e.stopPropagation()
                            // If clicking on a different file, switch to it first
                            if (!isSelected) {
                                onSelect(file.id)
                            }
                        }

                        return (
                            <div key={file.id} className="group/song relative">
                                <div
                                    onClick={() => onSelect(file.id)}
                                    className={cn(
                                        'h-10 w-full justify-start px-3 font-normal sm:h-9 sm:px-2 rounded-md transition-colors cursor-pointer',
                                        isSelected
                                            ? 'bg-secondary'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                    )}
                                >
                                    <div className="flex w-full items-center gap-3 h-full">
                                        {/* Track Number / Play Icon */}
                                        <div
                                            className="flex w-5 shrink-0 items-center justify-center"
                                            onClick={handlePlayClick}
                                        >
                                            {isSelected && isPlayingCurrent ? (
                                                <AudioPlayerButton
                                                    item={audioItem}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 p-0 hover:bg-transparent sm:h-3.5 sm:w-3.5"
                                                />
                                            ) : isSelected ? (
                                                <AudioPlayerButton
                                                    item={audioItem}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 p-0 hover:bg-transparent sm:h-3.5 sm:w-3.5"
                                                />
                                            ) : (
                                                <>
                                                    <span className="text-muted-foreground/60 text-sm tabular-nums group-hover/song:invisible">
                                                        {index + 1}
                                                    </span>
                                                    <Play className="invisible absolute h-4 w-4 group-hover/song:visible sm:h-3.5 sm:w-3.5" />
                                                </>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <span className="truncate text-sm block">{file.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
