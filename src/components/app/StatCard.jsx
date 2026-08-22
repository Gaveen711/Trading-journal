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
 * @param {(revealed: boolean) => void} [props.onRevealChange]
 *        Peek-and-pin. Hover or focus reveals for as long as it lasts; click,
 *        Enter or Space pins the reveal so it survives the pointer leaving, and
 *        again to unpin. Fires only when the resulting state actually changes.
 *        Page owns revealed state.
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
  // Peek and pin, tracked as two independent inputs rather than one flag.
  //
  // A single toggled flag made hover and click fight each other: hovering set
  // it true, so the click that followed on the very same card toggled it back
  // to false and the value collapsed under the pointer. Deriving the reveal
  // from (pointer/focus present) OR (pinned) removes the conflict, and gives
  // touch — which has no hover at all — the tap-to-pin behaviour it needs.
  const peekingRef = useRef(false);
  const pinnedRef = useRef(false);
  const revealedRef = useRef(false);
  const isInteractive = interactive || locked;
  const valueNode = locked ? '••••' : value;
  const toneClass = TONE_CLASS[tone] ?? TONE_CLASS.neutral;

  /** Publishes the derived state, and only when it actually changed. */
  const syncReveal = () => {
    if (locked) return;
    const next = peekingRef.current || pinnedRef.current;
    if (next === revealedRef.current) return;
    revealedRef.current = next;
    onRevealChange?.(next);
  };

  const setPeeking = (next) => {
    if (locked) return;
    peekingRef.current = next;
    syncReveal();
  };

  const handleActivate = () => {
    if (locked) {
      onLockedActivate?.();
      return;
    }
    pinnedRef.current = !pinnedRef.current;
    syncReveal();
  };

  const overlayButton = isInteractive ? (
    <button
      type="button"
      className="absolute inset-0 rounded-xl"
      aria-label={locked ? `${lockLabel}: ${label}` : label}
      onMouseEnter={() => setPeeking(true)}
      onMouseLeave={() => setPeeking(false)}
      onFocus={() => setPeeking(true)}
      onBlur={() => setPeeking(false)}
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
