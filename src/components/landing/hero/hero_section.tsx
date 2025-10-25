'use client'

import React from 'react'
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave'
import { Button } from '@/components/ui/liquid-glass-button'
import { BrushUnderline } from '@/components/ui/brush-underline'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <div className="h-screen bg-bg flex flex-col">
      {/* Top Banner */}
      <div className="bg-green text-white py-2 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm">
          <span>Accelerate your speech research with automated dataset preparation</span>
          <Link href="#" className="hover:underline">Learn More →</Link>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
        {/* Main Headline */}
        <div className="text-center mb-8 flex justify-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-tight">
            <span className="text-gray-400">Audio -&gt;</span>{' '}
            <span className="text-text">Dataset</span>
          </h1>
        </div>

        {/* Description */}
        <div className="text-center mb-6">
          <p className="text-md md:text-md text-text max-w-lg mx-auto font-semibold">
            Somleng helps researchers prepare their speech datasets <BrushUnderline variant="accent" animated>4x faster</BrushUnderline> than typing. Upload your audio, Somleng process the transcription and prepare your dataset for export. You edit the transcriptions and export.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-6">
          <Button
            asChild
            size="lg"
            className="bg-accent text-text hover:bg-accent/90 transition-colors"
          >
            <Link href="/signup" className="group relative">
              <span className="group-hover:hidden flex items-center gap-2">
                Get Started
              </span>
              <span className="hidden group-hover:inline-block">
                <TextShimmerWave 
                  waveOnly={true}
                  fontSize="1.1rem"
                >
                  Get Started
                </TextShimmerWave>
              </span>
            </Link>
          </Button>
        </div>

        {/* Availability Text */}
        <div className="text-center text-sm text-gray-500 mb-16">
          Supports multiple audio formats.
        </div>
        </div>
      </div>
    </div>
  )
}