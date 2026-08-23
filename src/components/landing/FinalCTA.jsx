import { CTALink, TextLink } from '../PublicSite';
import {
  GOLD_SESSIONS,
  formatUtc,
  formatWait,
  getNextOpen,
  isSessionOpen,
  useUtcClock,
} from '../../lib/goldSessions';
import './FinalCTA.css';

/* ————————————————————————————————————————————————————————————————
   Closing panel. One pane of glass with the gold day drawn along its
   top edge — four session windows on a 24-hour rule and a needle at
   the current UTC instant — then the closing line and the one action.
   The only amber is the open desk and the needle: both are live.
   ———————————————————————————————————————————————————————————————— */

const HOUR_TICKS = [0, 6, 12, 18, 24];

/** A session window as one or two [from, to] spans on the 0–24 rule. */
function spans(session) {
  return session.open < session.close
    ? [[session.open, session.close]]
    : [[session.open, 24], [0, session.close]];
}

const LANES = GOLD_SESSIONS.map((session, index) => ({ session, index, spans: spans(session) }));

function liveLabel(now) {
  const open = GOLD_SESSIONS.find((session) => isSessionOpen(session, now));
  if (open) return `${open.city} is open`;
  const next = getNextOpen(now);
  return next ? `${next.city} opens in ${formatWait(next.minutes)}` : 'The desk is ready';
}

function DayRule({ now }) {
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  return (
    <div className='xe-day' aria-hidden='true'>
      <div className='xe-lanes'>
        {LANES.map(({ session, index, spans: parts }) => {
          const open = isSessionOpen(session, now);
          return parts.map(([from, to]) => (
            <i
              key={`${session.id}-${from}`}
              className={open ? 'xe-lane is-open' : 'xe-lane'}
              style={{ '--i': index, '--from': from, '--to': to }}
            />
          ));
        })}
        <i className='xe-needle' style={{ '--t': hours.toFixed(3) }} />
      </div>
      <div className='xe-ticks xj-num'>
        {HOUR_TICKS.map((hour) => (
          <span key={hour} style={{ '--h': hour }}>{String(hour).padStart(2, '0')}</span>
        ))}
      </div>
      <ul className='xe-cities'>
        {GOLD_SESSIONS.map((session) => (
          <li key={session.id} className={isSessionOpen(session, now) ? 'is-open' : undefined}>
            <span>{session.city}</span>
            <span className='xj-num'>
              {String(session.open).padStart(2, '0')}–{String(session.close).padStart(2, '0')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FinalCTA() {
  const now = useUtcClock(1000);
  return (
    <section className='xj-section xe' aria-labelledby='final-heading'>
      <div className='xj-shell'>
        <div className='xe-panel xj-glass xj-reveal'>
          <DayRule now={now} />
          <div className='xe-body'>
            <div>
              <p className='xj-eyebrow'>
                <span>{liveLabel(now)}</span>
                <span className='xe-clock xj-num'>{formatUtc(now)} UTC</span>
              </p>
              <h2 id='final-heading' className='xj-h2 xe-title'>
                Your next session is <em>journaled</em> before you sit down.
              </h2>
              <p className='xj-lede'>
                Start on the free desk. Connect a broker when retyping fills stops being worth your time.
              </p>
            </div>
            <div className='xe-actions'>
              <CTALink to='/login?mode=signup'>Start free</CTALink>
              <TextLink to='/blogs'>Read the study notes</TextLink>
              <small>No card · no trial clock</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
