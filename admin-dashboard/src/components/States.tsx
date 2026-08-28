import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, LoaderCircle, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { cx } from './utils'

interface StateProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({ title, description, action, compact = false, className }: StateProps) {
  return (
    <div className={cx('admin-state', compact && 'admin-state--compact', className)}>
      <span className="admin-state__icon" aria-hidden="true"><Inbox /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="admin-state__action">{action}</div>}
    </div>
  )
}

export interface ErrorStateProps extends StateProps {
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({ title, description, action, onRetry, retryLabel = 'Try again', compact = false, className }: ErrorStateProps) {
  return (
    <div className={cx('admin-state', 'admin-state--error', compact && 'admin-state--compact', className)} role="alert">
      <span className="admin-state__icon" aria-hidden="true"><AlertTriangle /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <div className="admin-state__action">
        {action || (onRetry && <Button variant="secondary" size="sm" onClick={onRetry} leadingIcon={<RotateCcw />}>{retryLabel}</Button>)}
      </div>
    </div>
  )
}

export interface LoadingStateProps {
  label?: string
  rows?: number
  compact?: boolean
  className?: string
}

export function LoadingState({ label = 'Loading', rows = 3, compact = false, className }: LoadingStateProps) {
  return (
    <div className={cx('admin-loading', compact && 'admin-loading--compact', className)} role="status" aria-live="polite">
      <div className="admin-loading__label">
        <LoaderCircle aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="admin-loading__rows" aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => <span key={index} />)}
      </div>
    </div>
  )
}

