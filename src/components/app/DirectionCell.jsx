import { isLongDirection } from '../../lib/tradeAnalytics.js';
import { cn } from '../../lib/utils';

/**
 * Trade direction as form + word — deliberately never green/red, those
 * belong to P&L alone. Replaces four identical inline copies across
 * History, Analytics, Calendar and LogTrade tables.
 */
export function DirectionCell({ direction, className }) {
  const isLong = isLongDirection(direction);
  return (
    <span className={cn('text-foreground', className)}>
      <span aria-hidden="true">{isLong ? '▲' : '▼'}</span> {isLong ? 'Buy' : 'Sell'}
    </span>
  );
}
