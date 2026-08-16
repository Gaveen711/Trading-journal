import { GOLD_SESSIONS, isMarketClosed, isSessionOpen, useUtcClock } from '../../lib/goldSessions';
import { cn } from '../../lib/utils';

const RAIL_FILL = {
  live: 'bg-foreground',
  closed: 'bg-border',
  ahead: 'bg-border/40',
};

/** Per-segment state for a weekday: live, already closed today, or still ahead. */
function segmentState(session, now) {
  if (isSessionOpen(session, now)) return 'live';
  const hour = now.getUTCHours();
  if (session.open < session.close) {
    return hour >= session.close ? 'closed' : 'ahead';
  }
  // Wraparound window (Sydney 21:00 -> 06:00): after its close and before its
  // evening reopen it has finished its overnight run for this UTC day.
  return hour >= session.close && hour < session.open ? 'closed' : 'ahead';
}

function listCities(cities) {
  if (cities.length <= 1) return cities[0] ?? '';
  if (cities.length === 2) return `${cities[0]} and ${cities[1]}`;
  return `${cities.slice(0, -1).join(', ')} and ${cities[cities.length - 1]}`;
}

function normalizeSession(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/**
 * SessionRail — the page-scale signature mark. 3px tall, full width, under
 * the page title on every /app route. Four segments in UTC order (Sydney,
 * Tokyo, London, New York); no hue, ever. Never re-implements the session
 * math — `src/lib/goldSessions.js` is the one engine.
 *
 * @param {object} props
 * @param {Date} [props.now]        Defaults to a useUtcClock(30_000) tick.
 * @param {string} [props.className]
 */
export function SessionRail({ now, className }) {
  const tick = useUtcClock(30_000);
  const current = now ?? tick;
  const closed = isMarketClosed(current);
  const segments = GOLD_SESSIONS.map((session) => ({
    session,
    state: closed ? 'closed' : segmentState(session, current),
  }));
  const openCities = segments.filter((s) => s.state === 'live').map((s) => s.session.city);
  const label = closed
    ? 'Market closed — reopens Sunday 22:00 UTC'
    : openCities.length === 0
      ? 'No session open'
      : `${listCities(openCities)} ${openCities.length === 1 ? 'session' : 'sessions'} open`;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn('flex h-[3px] w-full gap-[2px]', className)}
    >
      {segments.map(({ session, state }) => (
        <i
          key={session.id}
          data-session={session.id}
          data-state={state}
          className={cn(
            'flex-1 transition-colors duration-100 motion-reduce:transition-none',
            RAIL_FILL[state]
          )}
        />
      ))}
    </span>
  );
}

/**
 * SessionGlyph — the row/cell-scale mark. 14×6px inline. Display-only: a
 * scanning aid beside the stored session text, never the only
 * representation. Unrecognized values (analytics buckets like "Asia" or
 * "Overlap", free text) render all four segments neutral with the raw
 * string in the title.
 *
 * @param {object} props
 * @param {string} props.session    Stored trade.session value (free text tolerated).
 * @param {string} [props.className]
 */
export function SessionGlyph({ session, className }) {
  const key = normalizeSession(session);
  const match = GOLD_SESSIONS.find(
    (candidate) => normalizeSession(candidate.city) === key || candidate.id === key
  );

  // No stored session: render decor only. An img role must have an accessible
  // name, so an unnamed glyph ships as aria-hidden instead.
  if (!key) {
    return (
      <span aria-hidden="true" className={cn('inline-flex h-1.5 w-3.5 gap-px', className)}>
        {GOLD_SESSIONS.map((candidate) => (
          <i key={candidate.id} data-state="off" className="flex-1 rounded-sm bg-border" />
        ))}
      </span>
    );
  }

  const label = match ? `${match.city} session` : String(session);

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn('inline-flex h-1.5 w-3.5 gap-px', className)}
    >
      {GOLD_SESSIONS.map((candidate) => {
        const on = match != null && candidate.id === match.id;
        return (
          <i
            key={candidate.id}
            data-session={candidate.id}
            data-state={on ? 'on' : 'off'}
            className={cn('flex-1', on ? 'bg-foreground' : 'bg-border')}
          />
        );
      })}
    </span>
  );
}
