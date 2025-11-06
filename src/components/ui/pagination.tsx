'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

const DOTS = '…'

function range(start: number, end: number): number[] {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

function getPages(
  totalPages: number,
  currentPage: number,
  siblingCount: number
): (number | string)[] {
  const totalPageNumbers = siblingCount + 5 // first, last, current, 2 dots

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftDots = leftSiblingIndex > 2
  const showRightDots = rightSiblingIndex < totalPages - 2

  const firstPageIndex = 1
  const lastPageIndex = totalPages

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = range(1, leftItemCount)
    return [...leftRange, DOTS, totalPages]
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = range(totalPages - rightItemCount + 1, totalPages)
    return [firstPageIndex, DOTS, ...rightRange]
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex)
  return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
}

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  if (totalPages <= 1) return null

  const pages = getPages(totalPages, currentPage, siblingCount)
  const isFirst = currentPage === 1
  const isLast = currentPage === totalPages

  return (
    <nav
      className={cn('flex items-center gap-1 text-sm select-none', className)}
      role="navigation"
      aria-label="Pagination"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={isFirst}
        onClick={() => !isFirst && onPageChange(currentPage - 1)}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
          'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50',
          isFirst && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, idx) => {
        if (p === DOTS) {
          return (
            <span
              key={`dots-${idx}`}
              className="px-2 text-muted-foreground"
              aria-hidden
            >
              {DOTS}
            </span>
          )
        }

        const pageNumber = p as number
        const isActive = pageNumber === currentPage
        return (
          <button
            key={pageNumber}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              'min-w-8 px-3 h-8 rounded-md border transition-colors',
              'border-border',
              isActive
                ? 'bg-text text-bg border-text'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {pageNumber}
          </button>
        )
      })}

      <button
        type="button"
        aria-label="Next page"
        disabled={isLast}
        onClick={() => !isLast && onPageChange(currentPage + 1)}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
          'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50',
          isLast && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export default Pagination


