import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/liquid-glass-button"
import { LucideIcon } from 'lucide-react'
import { Doodle } from "./doodle"

interface EmptyStateProps {
  title: string
  description: string
  icons?: LucideIcon[]
  action?: {
    label: React.ReactNode
    onClick: () => void
  }
  framed?: boolean
  className?: string
  variant?: 'default' | 'warning' | 'error'
}

export function EmptyState({
  title,
  description,
  icons = [],
  action,
  framed = false,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-background',
      iconRing: 'ring-border',
      iconColor: 'text-muted-foreground',
      accentColor: 'text-accent'
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconRing: 'ring-amber-200',
      iconColor: 'text-amber-600',
      accentColor: 'text-amber-600'
    },
    error: {
      iconBg: 'bg-red-50',
      iconRing: 'ring-red-200',
      iconColor: 'text-red-600',
      accentColor: 'text-red-600'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className={cn(
      "w-full text-center px-8 py-16 group",
      framed && "bg-background border-2 border-dashed border-border rounded-xl p-14 max-w-[620px] mx-auto hover:bg-muted/50 hover:border-border/80 transition duration-500 hover:duration-200",
      className
    )}>
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className={cn("size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200", styles.iconBg, styles.iconRing)}>
              {React.createElement(icons[0], {
                className: cn("w-6 h-6", styles.iconColor)
              })}
            </div>
            <div className={cn("size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200", styles.iconBg, styles.iconRing)}>
              {React.createElement(icons[1], {
                className: cn("w-6 h-6", styles.iconColor)
              })}
            </div>
            <div className={cn("size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200", styles.iconBg, styles.iconRing)}>
              {React.createElement(icons[2], {
                className: cn("w-6 h-6", styles.iconColor)
              })}
            </div>
          </>
        ) : (
          <div className={cn("size-12 grid place-items-center rounded-xl shadow-lg ring-1 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200", styles.iconBg, styles.iconRing)}>
            {icons[0] && React.createElement(icons[0], {
              className: cn("w-6 h-6", styles.iconColor)
            })}
          </div>
        )}
      </div>
      <div className="relative inline-block mt-6">
        <h2 className="text-foreground font-serif text-xl leading-tight">{title}</h2>
        <div className="absolute left-0 right-0 -bottom-2 pointer-events-none">
          <Doodle type="squiggle" className={cn("h-3 w-full", styles.accentColor)} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4 whitespace-pre-line">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-text text-bg hover:bg-text/90 mt-4 "
          size="sm"
        >
          {action.label}
        </Button>

      )}
    </div>
  )
}