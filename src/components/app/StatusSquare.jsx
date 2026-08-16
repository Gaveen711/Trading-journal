import { cn } from '../../lib/utils';

const SQUARE_STATE = {
  on: 'bg-foreground',
  off: 'bg-transparent shadow-[inset_0_0_0_1px_hsl(var(--muted-foreground))]',
  attn: 'bg-foreground shadow-[0_0_0_1px_hsl(var(--background)),0_0_0_2px_hsl(var(--foreground))]',
};

/**
 * StatusSquare — the Console status indicator. A 6px square (never a
 * circle: that collides with the round avatar), always paired with a word.
 * Zero hue budget: encoded by form only, identical across all five accents.
 *
 * @param {object} props
 * @param {'on'|'off'|'attn'} [props.state='off']
 *        on   = live / nominal / open      -> filled
 *        off  = idle / closed / not set up -> hollow
 *        attn = stale / failed / expiring  -> filled square inside a ring
 * @param {string} props.label                 REQUIRED. sr-only when no children.
 * @param {React.ReactNode} [props.children]   Visible text beside the square (font-mono, 11px).
 * @param {string} [props.className]
 */
export function StatusSquare({ state = 'off', label, children, className }) {
  return (
    <span data-state={state} className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-1.5 shrink-0 rounded-none',
          SQUARE_STATE[state] ?? SQUARE_STATE.off
        )}
      />
      {children != null ? (
        <span
          className={cn(
            'font-mono text-[11px] leading-none',
            state === 'off' ? 'text-muted-foreground' : 'text-foreground'
          )}
        >
          {children}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}
