'use client'

import React, { useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { AudioFile } from '@/hooks/dashboard/use-files'
import {
    AudioPlayerButton,
    AudioPlayerProgress,
    AudioPlayerTime,
    AudioPlayerDuration,
    AudioPlayerItem,
    useAudioPlayer,
} from '@/components/ui/audio-player'
import { cn } from '@/lib/utils'

type TrackData = {
    id: string
    name: string
    url: string
}

type StudioPlayerProps = {
    file: AudioFile | undefined
    onNext?: () => void
    onPrev?: () => void
    hasNext?: boolean
    hasPrev?: boolean
}

export function StudioPlayer({ file, onNext, onPrev, hasNext, hasPrev }: StudioPlayerProps) {
    const player = useAudioPlayer<TrackData>()
    const [isMuted, setIsMuted] = React.useState(false)

    useEffect(() => {
        if (!file?.audioUrl) return

        const item: AudioPlayerItem<TrackData> = {
            id: file.id,
            src: file.audioUrl,
            data: {
                id: file.id,
                name: file.name,
                url: file.audioUrl,
            },
        }

        player.setActiveItem(item).catch((err) =>
            console.error('Failed to set active audio item:', err),
        )
    }, [file?.id, file?.audioUrl, file?.name, player])

    const currentItem = file?.audioUrl
        ? ({
            id: file.id,
            src: file.audioUrl,
            data: { id: file.id, name: file.name, url: file.audioUrl },
        } as AudioPlayerItem<TrackData>)
        : undefined

    return (
        <div className="w-full bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 py-4">
                <div className="flex flex-col gap-4">
                    {/* Top Row: Controls & Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Playback Controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onPrev}
                                    disabled={!hasPrev}
                                    className="h-8 w-8 text-muted-foreground hover:text-text"
                                >
                                    <SkipBack className="w-4 h-4" />
                                </Button>

                                <AudioPlayerButton
                                    item={currentItem}
                                    variant="default"
                                    size="icon"
                                    disabled={!currentItem}
                                    className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-transform hover:scale-105"
                                />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onNext}
                                    disabled={!hasNext}
                                    className="h-8 w-8 text-muted-foreground hover:text-text"
                                >
                                    <SkipForward className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* File Info */}
                            <div className="flex flex-col">
                                <h2 className="text-lg font-semibold text-text truncate max-w-[300px]">
                                    {file?.name || 'No file selected'}
                                </h2>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <AudioPlayerTime className="tabular-nums font-medium" />
                                    <span>/</span>
                                    <AudioPlayerDuration className="tabular-nums font-medium" />
                                </div>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-muted-foreground hover:text-text"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>

                            {/* Placeholder for future download/actions */}
                            {/* <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button> */}
                        </div>
                    </div>

                    {/* Bottom Row: Progress Bar / Waveform */}
                    <div className="relative h-8 flex items-center group">
                        {/* Simulated Waveform Background (Optional visual flair) */}
                        <div className="absolute inset-0 flex items-center justify-between opacity-20 pointer-events-none">
                            {Array.from({ length: 50 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-primary rounded-full transition-all duration-300"
                                    style={{
                                        height: `${Math.max(20, (Math.sin(i * 0.5) + 1) * 40 + (i % 3) * 10)}%`,
                                        opacity: (i % 2 === 0) ? 1 : 0.5
                                    }}
                                />
                            ))}
                        </div>

                        <AudioPlayerProgress className="z-10 h-2 group-hover:h-3 transition-all duration-200" />
                    </div>
                </div>
            </div>
        </div>
    )
}
