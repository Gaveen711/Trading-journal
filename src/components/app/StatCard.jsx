import { useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

const TONE_CLASS = {
  neutral: 'text-foreground',
  positive: 'text-win',
  negative: 'text-loss',
};

const DELTA_CLASS = {
  up: 'text-win',
  down: 'text-loss',
  flat: 'text-muted-foreground',
};

// U+2212 MINUS — same advance width as '+' in IBM Plex Mono. Never the hyphen.
const DELTA_SIGN = { up: '+', down: '−', flat: '' };

/**
 * StatCard — a KPI panel. The value arrives pre-formatted; StatCard never
 * formats. A figure is P&L or it is foreground — there is no accent tone.
 *
 * @param {object} props
 * @param {string} props.label                     Sentence case: "Net P&L, month to date".
 * @param {React.ReactNode} props.value            PRE-FORMATTED by the page.
 * @param {React.ReactNode} [props.hint]           Secondary line.
 * @param {{value: React.ReactNode, direction: 'up'|'down'|'flat'}} [props.delta]
 * @param {'neutral'|'positive'|'negative'} [props.tone='neutral']   foreground | text-win | text-loss.
 * @param {'stacked'|'inline'} [props.layout='stacked']
 * @param {React.ComponentType} [props.icon]       layout="inline" ONLY. Stacked cards get no icon.
 * @param {boolean} [props.interactive=false]
 * @param {(revealed: boolean) => void} [props.onRevealChange]  hover/focus/click/Enter/Space. Page owns revealed state.
 * @param {boolean} [props.locked=false]           Redaction, not blur: the real value never enters the DOM.
 * @param {() => void} [props.onLockedActivate]
 * @param {string} [props.lockLabel='Unlock with Pro']
 * @param {boolean} [props.loading=false]
 * @param {string} [props.className]
 */
export function StatCard({
  label,
  value,
  hint,
  delta,
  tone = 'neutral',
  layout = 'stacked',
  icon: Icon,
  interactive = false,
  onRevealChange,
  locked = false,
  onLockedActivate,
  lockLabel = 'Unlock with Pro',
  loading = false,
  className,
}) {
  const revealedRef = useRef(false);
  const isInteractive = interactive || locked;
  const valueNode = locked ? '••••' : value;
  const toneClass = TONE_CLASS[tone] ?? TONE_CLASS.neutral;

  const emitReveal = (next) => {
    if (locked) return;
    revealedRef.current = next;
    onRevealChange?.(next);
  };

  const handleActivate = () => {
    if (locked) {
      onLockedActivate?.();
      return;
    }
    emitReveal(!revealedRef.current);
  };

  const overlayButton = isInteractive ? (
    <button
      type="button"
      className="absolute inset-0 rounded-xl"
      aria-label={locked ? `${lockLabel}: ${label}` : label}
      onMouseEnter={() => emitReveal(true)}
      onMouseLeave={() => emitReveal(false)}
      onFocus={() => emitReveal(true)}
      onBlur={() => emitReveal(false)}
      onClick={handleActivate}
    />
  ) : null;

  if (layout === 'inline') {
    return (
      <Card className={cn('dashboard-stat-card relative border border-border ring-0', className)}>
        <CardContent className="flex items-center gap-3">
          {Icon != null && (
            <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            {loading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <span className={cn('figure text-lg font-medium', toneClass)}>{valueNode}</span>
            )}
          </div>
        </CardContent>
        {overlayButton}
      </Card>
    );
  }

  return (
    <Card className={cn('dashboard-stat-card relative border border-border ring-0', className)}>
      <CardContent className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span
              className={cn('figure text-2xl font-medium leading-none tracking-tight', toneClass)}
            >
              {valueNode}
            </span>
            {delta != null && !locked && (
              <span
                className={cn(
                  'figure text-[11px] leading-none',
                  DELTA_CLASS[delta.direction] ?? DELTA_CLASS.flat
                )}
              >
                {DELTA_SIGN[delta.direction] ?? ''}
                {delta.value}
              </span>
            )}
          </div>
        )}
        {hint != null && <span className="text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
      {overlayButton}
    </Card>
  );
}
