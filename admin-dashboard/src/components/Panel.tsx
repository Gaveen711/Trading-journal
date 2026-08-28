import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from './utils'

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  tone?: 'default' | 'raised' | 'danger'
}

export function Panel({
  title,
  description,
  eyebrow,
  actions,
  footer,
  children,
  padding = 'md',
  tone = 'default',
  className,
  ...props
}: PanelProps) {
  const headingId = useId()
  return (
    <section
      className={cx('admin-panel', `admin-panel--${tone}`, `admin-panel--pad-${padding}`, className)}
      aria-labelledby={title ? headingId : undefined}
      {...props}
    >
      {(title || description || eyebrow || actions) && (
        <header className="admin-panel__header">
          <div className="admin-panel__heading">
            {eyebrow && <p className="admin-panel__eyebrow">{eyebrow}</p>}
            {title && <h2 id={headingId} className="admin-panel__title">{title}</h2>}
            {description && <p className="admin-panel__description">{description}</p>}
          </div>
          {actions && <div className="admin-panel__actions">{actions}</div>}
        </header>
      )}
      <div className="admin-panel__body">{children}</div>
      {footer && <footer className="admin-panel__footer">{footer}</footer>}
    </section>
  )
}

