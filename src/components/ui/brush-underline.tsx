'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface BrushUnderlineProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'accent' | 'primary' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  weight?: 'normal' | 'bold'
  animated?: boolean
  hover?: boolean
  as?: React.ElementType
}

export function BrushUnderline({
  children,
  className,
  variant = 'default',
  size = 'default',
  weight = 'normal',
  animated = false,
  hover = false,
  as: Component = 'span',
  ...props
}: BrushUnderlineProps) {
  const ComponentElement = Component as React.ElementType
  
  return (
    <ComponentElement
      className={cn(
        'brush-underline',
        {
          'brush-underline-accent': variant === 'accent',
          'brush-underline-primary': variant === 'primary',
          'brush-underline-secondary': variant === 'secondary',
          'brush-underline-sm': size === 'sm',
          'brush-underline-lg': size === 'lg',
          'brush-underline-bold': weight === 'bold',
          'brush-underline-animated': animated,
          'brush-underline-hover': hover,
        },
        className
      )}
      {...props}
    >
      {children}
    </ComponentElement>
  )
}

// Convenience components for common use cases
export function BrushUnderlineAccent({ children, ...props }: Omit<BrushUnderlineProps, 'variant'>) {
  return <BrushUnderline variant="accent" {...props}>{children}</BrushUnderline>
}

export function BrushUnderlinePrimary({ children, ...props }: Omit<BrushUnderlineProps, 'variant'>) {
  return <BrushUnderline variant="primary" {...props}>{children}</BrushUnderline>
}

export function BrushUnderlineSecondary({ children, ...props }: Omit<BrushUnderlineProps, 'variant'>) {
  return <BrushUnderline variant="secondary" {...props}>{children}</BrushUnderline>
}

// Animated variants
export function BrushUnderlineAnimated({ children, ...props }: Omit<BrushUnderlineProps, 'animated'>) {
  return <BrushUnderline animated {...props}>{children}</BrushUnderline>
}

export function BrushUnderlineHover({ children, ...props }: Omit<BrushUnderlineProps, 'hover'>) {
  return <BrushUnderline hover {...props}>{children}</BrushUnderline>
}

export function BrushUnderlineBold({ children, ...props }: Omit<BrushUnderlineProps, 'weight'>) {
  return <BrushUnderline weight="bold" {...props}>{children}</BrushUnderline>
}
