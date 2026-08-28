import type { HTMLAttributes, ReactNode } from 'react'
import { AlertTriangle, Check, Clock3, Minus } from 'lucide-react'
import { cx } from './utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'gold'

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone
  children: ReactNode
  showIcon?: boolean
}

const icons = {
  success: Check,
  warning: Clock3,
  danger: AlertTriangle,
  neutral: Minus,
  gold: Check,
}

export function StatusBadge({ tone = 'neutral', showIcon = true, className, children, ...props }: StatusBadgeProps) {
  const Icon = icons[tone]
  return (
    <span className={cx('admin-status', `admin-status--${tone}`, className)} {...props}>
      {showIcon && <Icon aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}

