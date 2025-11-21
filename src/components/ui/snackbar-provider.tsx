'use client'

import React from 'react'
import { CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type SnackbarVariant = 'info' | 'success' | 'error'

type Snackbar = {
  id: string
  message: string
  variant: SnackbarVariant
}

type SnackbarContextValue = {
  showSnackbar: (options: { message: string; variant?: SnackbarVariant; duration?: number }) => void
}

const SnackbarContext = React.createContext<SnackbarContextValue | null>(null)

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snacks, setSnacks] = React.useState<Snackbar[]>([])

  const showSnackbar = React.useCallback(
    ({ message, variant = 'info', duration = 3200 }: { message: string; variant?: SnackbarVariant; duration?: number }) => {
      const id = crypto.randomUUID()
      setSnacks((prev) => [...prev, { id, message, variant }])
      setTimeout(() => {
        setSnacks((prev) => prev.filter((snack) => snack.id !== id))
      }, duration)
    },
    []
  )

  const variantStyles: Record<
    SnackbarVariant,
    { container: string; icon: React.ReactNode }
  > = {
    info: {
      container: 'border border-blue-200 bg-blue-600 text-white shadow-blue-500/40',
      icon: <Info className="h-5 w-5 text-white" />,
    },
    success: {
      container: 'border border-emerald-200 bg-emerald-600 text-white shadow-emerald-500/40',
      icon: <CheckCircle2 className="h-5 w-5 text-white" />,
    },
    error: {
      container: 'border border-red-200 bg-red-600 text-white shadow-red-500/40',
      icon: <AlertCircle className="h-5 w-5 text-white" />,
    },
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-xs flex-col gap-3 px-4">
        {snacks.map((snack) => (
          <div
            key={snack.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-xl',
              variantStyles[snack.variant].container
            )}
            role="status"
          >
            {variantStyles[snack.variant].icon}
            <span>{snack.message}</span>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const context = React.useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

