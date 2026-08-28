import { useEffect, useId, useRef, type MouseEvent } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'
import { cx } from './utils'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onOpenChange: (open: boolean) => void
  className?: string
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
  onConfirm,
  onOpenChange,
  className,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const handleBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && !loading) onOpenChange(false)
  }

  return (
    <dialog
      ref={dialogRef}
      className={cx('admin-dialog', `admin-dialog--${tone}`, className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onOpenChange(false)
      }}
      onClose={() => open && onOpenChange(false)}
      onMouseDown={handleBackdrop}
    >
      <div className="admin-dialog__surface">
        <div className="admin-dialog__icon" aria-hidden="true"><AlertTriangle /></div>
        <button
          type="button"
          className="admin-dialog__close"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          aria-label="Close dialog"
        >
          <X aria-hidden="true" />
        </button>
        <div className="admin-dialog__copy">
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        <div className="admin-dialog__actions">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

