import type { HTMLAttributes, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cx } from './utils'

export type MetricTrend = 'up' | 'down' | 'flat'

export interface MetricCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  label: ReactNode
  value: ReactNode
  supportingText?: ReactNode
  trend?: MetricTrend
  trendLabel?: ReactNode
  icon?: ReactNode
  emphasis?: 'default' | 'gold' | 'success' | 'danger'
}

const trendIcons = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }

export function MetricCard({
  label,
  value,
  supportingText,
  trend,
  trendLabel,
  icon,
  emphasis = 'default',
  className,
  ...props
}: MetricCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null
  return (
    <article className={cx('admin-metric', `admin-metric--${emphasis}`, className)} {...props}>
      <div className="admin-metric__topline" aria-hidden="true" />
      <div className="admin-metric__header">
        <p className="admin-metric__label">{label}</p>
        {icon && <span className="admin-metric__icon" aria-hidden="true">{icon}</span>}
      </div>
      <p className="admin-metric__value">{value}</p>
      {(supportingText || trendLabel) && (
        <div className="admin-metric__footer">
          {trendLabel && (
            <span className={cx('admin-metric__trend', trend && `admin-metric__trend--${trend}`)}>
              {TrendIcon && <TrendIcon aria-hidden="true" />}
              {trendLabel}
            </span>
          )}
          {supportingText && <span>{supportingText}</span>}
        </div>
      )}
    </article>
  )
}

