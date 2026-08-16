import { Link } from 'react-router-dom';
import { GOLD_SESSIONS, formatUtc, isMarketClosed, isSessionOpen, useUtcClock } from '../lib/goldSessions';
import { Wordmark } from './PublicSite';

const PRODUCT_LINKS = [
  { to: '/', label: 'Product' },
  { to: '/blogs', label: 'Blog' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
];

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy policy' },
  { to: '/terms-and-conditions', label: 'Terms of service' },
  { to: '/refund-policy', label: 'Refund policy' },
];

const SUPPORT_LINKS = [
  { href: 'mailto:info@xaujournal.com', label: 'info@xaujournal.com' },
  { href: 'https://discord.gg/smbNwBZC2', label: 'Discord' },
  { href: 'https://x.com/xau_journal', label: 'X / @xau_journal' },
];

// Built once per desk. Constructing Intl.DateTimeFormat is expensive and a fresh
// options object defeats V8's constructor cache, so doing it inline meant four
// new formatters on every tick.
const CITY_FORMATTERS = new Map(
  GOLD_SESSIONS.map((session) => [
    session.tz,
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: session.tz }),
  ]),
);

function cityTime(now, timeZone) {
  return CITY_FORMATTERS.get(timeZone).format(now);
}

/** The footer's one live instrument: four desks and the UTC reference. */
function SessionClocks() {
  // Minute resolution — these read HH:MM, so a 1s tick re-rendered 60× per
  // visible change.
  const now = useUtcClock(30000);
  const closed = isMarketClosed(now);

  return (
    <div className='xj-footer-clocks' role='group' aria-label='Session clocks'>
      {GOLD_SESSIONS.map((session) => (
        <div key={session.id} className={isSessionOpen(session, now) ? 'xj-footer-clock is-open' : 'xj-footer-clock'}>
          <small>{session.city}</small>
          <strong>{cityTime(now, session.tz)}</strong>
        </div>
      ))}
      <div className='xj-footer-clock'>
        <small>{closed ? 'At rest' : 'Reference'}</small>
        <strong>{formatUtc(now, false)} UTC</strong>
      </div>
    </div>
  );
}

export function PublicFooter({ className = '', style }) {
  return (
    <footer className={`xj xj-footer ${className}`.trim()} style={style} data-ux-skip='true'>
      <div className='xj-shell'>
        <div className='xj-footer-grid'>
          <div className='xj-footer-brand'>
            <Wordmark />
            <p>
              A trade journal built for one instrument. Every fill recorded, every
              reason kept, every session measured.
            </p>
          </div>

          <div className='xj-footer-col'>
            <p className='xj-label'>Product</p>
            <ul>
              {PRODUCT_LINKS.map(({ to, label }) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className='xj-footer-col'>
            <p className='xj-label'>Legal</p>
            <ul>
              {LEGAL_LINKS.map(({ to, label }) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>

          <div className='xj-footer-col'>
            <p className='xj-label'>Support</p>
            <ul>
              {SUPPORT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SessionClocks />

        <div className='xj-footer-legal'>
          <p>
            Trading gold and other leveraged products carries substantial risk of loss and is not
            suitable for every investor. xaujournal is a record-keeping and analytics tool — it does
            not execute trades, hold funds, or provide investment advice. Results recorded in a
            journal are not a guarantee of future performance.
          </p>
          <div className='xj-footer-meta'>
            <span>© {new Date().getFullYear()} xaujournal</span>
            <span>XAU/USD spot · session times UTC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
