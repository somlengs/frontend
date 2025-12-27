'use client'

import React, { useEffect } from 'react'
import { SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { AudioFile } from '@/hooks/dashboard/use-files'
import {
    AudioPlayerButton,
    AudioPlayerProgress,
    AudioPlayerTime,
    AudioPlayerDuration,
    AudioPlayerSpeed,
    AudioPlayerItem,
    useAudioPlayer,
} from '@/components/ui/audio-player'

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
        <div className="w-full backdrop-blur-md border-b border-border/50 sticky top-0 z-10 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 py-4">
                <div className="flex flex-col gap-3">
                    {/* File Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h2 className="text-base font-semibold text-text truncate max-w-[400px] sm:text-lg">
                                {file?.name || 'No file selected'}
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <AudioPlayerTime className="tabular-nums font-medium" />
                                <span>/</span>
                                <AudioPlayerDuration className="tabular-nums font-medium" />
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            <AudioPlayerSpeed
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-text"
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    const newMutedState = !isMuted
                                    setIsMuted(newMutedState)
                                    if (player.ref.current) {
                                        player.ref.current.muted = newMutedState
                                    }
                                }}
                                className="text-muted-foreground hover:text-text"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Playback Controls & Progress */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPrev}
                            disabled={!hasPrev}
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-text sm:h-10 sm:w-10"
                        >
                            <SkipBack className="w-4 h-4" />
                        </Button>

                        <AudioPlayerButton
                            item={currentItem}
                            variant="default"
                            size="default"
                            disabled={!currentItem}
                            className="h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-transform hover:scale-105 sm:h-10 sm:w-10"
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNext}
                            disabled={!hasNext}
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-text sm:h-10 sm:w-10"
                        >
                            <SkipForward className="w-4 h-4" />
                        </Button>

                        {/* Progress Bar */}
                        <AudioPlayerProgress className="flex-1" />
                    </div>
                </div>
            </div>
        </div>
    )
}
