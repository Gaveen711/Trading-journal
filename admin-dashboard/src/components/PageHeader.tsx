import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cx } from './utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  meta?: ReactNode
  className?: string
}

export function PageHeader({ title, description, eyebrow, actions, breadcrumbs, meta, className }: PageHeaderProps) {
  return (
    <header className={cx('admin-page-header', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                {index > 0 && <ChevronRight aria-hidden="true" />}
                {item.href && index < breadcrumbs.length - 1 ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <span aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="admin-page-header__row">
        <div className="admin-page-header__copy">
          {eyebrow && <p className="admin-page-header__eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="admin-page-header__description">{description}</p>}
          {meta && <div className="admin-page-header__meta">{meta}</div>}
        </div>
        {actions && <div className="admin-page-header__actions">{actions}</div>}
      </div>
    </header>
  )
}

