import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import { cx } from './utils'

export interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
  itemLabel?: string
  className?: string
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  totalItems,
  pageSize,
  itemLabel = 'items',
  className,
}: PaginationProps) {
  const safePageCount = Math.max(1, pageCount)
  const current = Math.min(Math.max(1, page), safePageCount)
  const hasItemRange = totalItems != null && pageSize != null
  const start = hasItemRange && totalItems > 0 ? (current - 1) * pageSize + 1 : 0
  const end = hasItemRange ? Math.min(current * pageSize, totalItems) : 0

  return (
    <nav className={cx('admin-pagination', className)} aria-label="Pagination">
      <p className="admin-pagination__summary" aria-live="polite">
        {hasItemRange
          ? totalItems === 0
            ? <>0 {itemLabel}</>
            : <><strong>{start}–{end}</strong> of <strong>{totalItems}</strong> {itemLabel}</>
          : <>Page <strong>{current}</strong> of <strong>{safePageCount}</strong></>}
      </p>
      <div className="admin-pagination__controls">
        <Button
          variant="ghost"
          size="sm"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          leadingIcon={<ChevronLeft />}
          aria-label="Go to previous page"
        >
          Previous
        </Button>
        <span aria-hidden="true">{current} / {safePageCount}</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={current >= safePageCount}
          onClick={() => onPageChange(current + 1)}
          trailingIcon={<ChevronRight />}
          aria-label="Go to next page"
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
