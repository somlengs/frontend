'use client'

import React from 'react'
import { Header } from '@/components/ui/navbar'
import { BrushUnderline, BrushUnderlineAccent, BrushUnderlinePrimary, BrushUnderlineSecondary, BrushUnderlineAnimated, BrushUnderlineHover } from '@/components/ui/brush-underline'

export default function BrushDemoPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-serif text-text mb-4">
              <BrushUnderline variant="accent" animated>Brush Underline</BrushUnderline> Demo
            </h1>
            <p className="text-lg text-muted-foreground">
              Reusable paint brush underline effects for your text
            </p>
          </div>

          <div className="space-y-16">
            {/* Color Variants */}
            <section className="space-y-8">
              <h2 className="text-3xl font-serif text-text">Color Variants</h2>
              <div className="grid gap-6">
                <div className="text-2xl">
                  Default: <BrushUnderline>This is the default brush underline</BrushUnderline>
                </div>
                <div className="text-2xl">
                  Accent: <BrushUnderlineAccent>This uses the accent color</BrushUnderlineAccent>
                </div>
                <div className="text-2xl">
                  Primary: <BrushUnderlinePrimary>This uses the primary color</BrushUnderlinePrimary>
                </div>
                <div className="text-2xl">
                  Secondary: <BrushUnderlineSecondary>This uses the secondary color</BrushUnderlineSecondary>
                </div>
              </div>
            </section>

            {/* Size Variants */}
            <section className="space-y-8">
              <h2 className="text-3xl font-serif text-text">Size Variants</h2>
              <div className="grid gap-6">
                <div className="text-2xl">
                  Small: <BrushUnderline size="sm">Small brush underline</BrushUnderline>
                </div>
                <div className="text-2xl">
                  Default: <BrushUnderline>Default brush underline</BrushUnderline>
                </div>
                <div className="text-2xl">
                  Large: <BrushUnderline size="lg">Large brush underline</BrushUnderline>
                </div>
              </div>
            </section>

            {/* Animation Variants */}
            <section className="space-y-8">
              <h2 className="text-3xl font-serif text-text">Animation Variants</h2>
              <div className="grid gap-6">
                <div className="text-2xl">
                  Animated: <BrushUnderlineAnimated variant="accent">This draws in on load</BrushUnderlineAnimated>
                </div>
                <div className="text-2xl">
                  Hover: <BrushUnderlineHover variant="primary">Hover to see the effect</BrushUnderlineHover>
                </div>
              </div>
            </section>

            {/* Real-world Examples */}
            <section className="space-y-8">
              <h2 className="text-3xl font-serif text-text">Real-world Examples</h2>
              <div className="grid gap-8">
                <div className="bg-card border border-border rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Marketing Copy</h3>
                  <p className="text-lg">
                    Our platform helps you create datasets <BrushUnderlineAccent animated>10x faster</BrushUnderlineAccent> than traditional methods.
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Feature Highlights</h3>
                  <ul className="space-y-3 text-lg">
                    <li>• <BrushUnderlinePrimary hover>Automated transcription</BrushUnderlinePrimary> with 99% accuracy</li>
                    <li>• <BrushUnderlinePrimary hover>Real-time processing</BrushUnderlinePrimary> for instant results</li>
                    <li>• <BrushUnderlinePrimary hover>Export in multiple formats</BrushUnderlinePrimary> for any workflow</li>
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Call to Action</h3>
                  <p className="text-lg">
                    Ready to <BrushUnderlineAccent size="lg" animated>transform your workflow</BrushUnderlineAccent>? 
                    Get started today and see the difference.
                  </p>
                </div>
              </div>
            </section>

            {/* Usage Examples */}
            <section className="space-y-8">
              <h2 className="text-3xl font-serif text-text">Usage Examples</h2>
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Usage</h3>
                <pre className="bg-background border border-border rounded p-4 text-sm overflow-x-auto">
{`import { BrushUnderline } from '@/components/ui/brush-underline'

// Basic usage
<BrushUnderline>Highlighted text</BrushUnderline>

// With variants
<BrushUnderline variant="accent" animated>Animated accent</BrushUnderline>
<BrushUnderline variant="primary" size="lg">Large primary</BrushUnderline>

// Convenience components
<BrushUnderlineAccent>Accent color</BrushUnderlineAccent>
<BrushUnderlineAnimated>Animated effect</BrushUnderlineAnimated>`}
                </pre>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
