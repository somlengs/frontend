import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/liquid-glass-button"
import { FolderOpen, Link, LucideIcon } from "lucide-react"
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
}

export function EmptyState({
  title,
  description,
  icons = [],
  action,
  framed = false,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "w-full text-center px-8 py-16 group",
      framed && "bg-background border-2 border-dashed border-border rounded-xl p-14 max-w-[620px] mx-auto hover:bg-muted/50 hover:border-border/80 transition duration-500 hover:duration-200",
      className
    )}>
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[0], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[1], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[2], {
                className: "w-6 h-6 text-muted-foreground"
              })}
            </div>
          </>
        ) : (
          <div className="bg-background size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            {icons[0] && React.createElement(icons[0], {
              className: "w-6 h-6 text-muted-foreground"
            })}
          </div>
        )}
      </div>
      <div className="relative inline-block mt-6">
        <h2 className="text-foreground font-serif text-xl leading-tight">{title}</h2>
        <div className="absolute left-0 right-0 -bottom-2 pointer-events-none">
          <Doodle type="squiggle" className="h-3 w-full text-accent" />
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