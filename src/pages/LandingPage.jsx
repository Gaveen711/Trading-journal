import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { pad2 } from '../lib/tradeUtils';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { Arrow, CTALink, SectionHead, TextLink } from '../components/PublicSite';
import {
  GOLD_SESSIONS,
  formatUtc,
  formatWait,
  getNextOpen,
  isMarketClosed,
  isSessionOpen,
  useDeskReveal,
  useUtcClock,
} from '../lib/goldSessions';
import {
  DEMO_TRADES,
  bestHour,
  equityCurve,
  formatR,
  formatR2,
  hourWindow,
  sessionSplit,
  summarise,
} from '../lib/deskDemo';
import {
  LANDING_FAQ,
  applyPageSEO,
  buildFAQSchema,
  buildOrganizationSchema,
  buildSoftwareSchema,
  buildWebSiteSchema,
  injectJsonLd,
  removeJsonLd,
} from '../lib/seo';
import { PRO_MONTHLY_DISPLAY } from '../lib/pricing';
import { getArticle } from '../data/study';
import './LandingPage.css';

/* ————————————————————————————————————————————————————————————————
   xaujournal — landing page, "Vitrine" direction.

   The page is a dark showroom: the working product sits under museum
   glass, tilted on a plinth, and every number on display is derived
   from the one sample record in src/lib/deskDemo.js. Amber appears
   only as a signal — live dots, the active session tab, the one
   figure being pointed at. P&L alone may be green or red.
   ———————————————————————————————————————————————————————————————— */

/* ————————————————————— derived exhibits —————————————————————
   Everything below is computed once at module scope from DEMO_TRADES.
   Nothing is hand-written per metric, so the plates and their captions
   can never quote two figures that disagree. */

const STATS = summarise(DEMO_TRADES);
const CURVE = equityCurve(DEMO_TRADES, 520, 150, 12);
const BEST_HOUR = bestHour(DEMO_TRADES);
const SPLIT = sessionSplit();
const SPLIT_WIDEST = Math.max(...SPLIT.map((s) => Math.abs(s.net)), 1);

const DESK_NAMES = { asia: 'Asia', london: 'London', ny: 'New York' };

/** Rail city → the deskDemo session its window belongs to (for highlights). */
const RAIL_TO_DESK = { syd: 'asia', tok: 'asia', lon: 'london', ny: 'ny' };

/** Net R per sample day — feeds the calendar heatmap in the analytics plate. */
const DAY_NET = new Map();
for (const trade of DEMO_TRADES) DAY_NET.set(trade.day, (DAY_NET.get(trade.day) ?? 0) + trade.r);

let strongestDay = { day: 0, net: -Infinity };
for (const [day, net] of DAY_NET) {
  if (net > strongestDay.net) strongestDay = { day, net };
}
const BEST_DAY = strongestDay;

/* Sample days are numbered so day 1 is a Monday and weekends are absent —
   six calendar weeks cover the whole record. */
const CAL_CELLS = Array.from({ length: 42 }, (_, index) => {
  const day = index + 1;
  return { day, net: DAY_NET.has(day) ? DAY_NET.get(day) : null };
});

const LAST_DAY = DEMO_TRADES[DEMO_TRADES.length - 1].day;
const LAST_IMPORT = DEMO_TRADES.filter((t) => t.day === LAST_DAY).length;

/* The last four fills of the record, with the note field a broker never
   stores. The notes are prose, not figures — the figures come from RECORD. */
const LOG_NOTES = [
  'Faded London late without the sweep. Rule broken, filed.',
  'Second stop in NY and the size was revenge. Logged it.',
  'Open drive, waited for the retest. By the book.',
  'NY continuation off the London high. Clean.',
];
const LOG_ROWS = DEMO_TRADES.slice(-4).map((trade, index) => ({ ...trade, note: LOG_NOTES[index] }));

const windowLabel = (session) => `${pad2(session.open)}:00–${pad2(session.close)}:00`;

/** The four rail sessions, each carrying the sample figures for its UTC window. */
const RAIL = GOLD_SESSIONS.map((session) => ({
  ...session,
  figures: summarise(
    DEMO_TRADES.filter((t) =>
      session.open < session.close
        ? t.hour >= session.open && t.hour < session.close
        : t.hour >= session.open || t.hour < session.close,
    ),
  ),
}));

/* ————————————————————— live instruments ————————————————————— */

/** One reading of the desk clock: which city is open, or what opens next. */
function useLiveLabel(tickMs = 1000) {
  const now = useUtcClock(tickMs);
  const open = GOLD_SESSIONS.find((session) => isSessionOpen(session, now));
  let label;
  if (open) {
    label = `${open.city} is open`;
  } else {
    const next = getNextOpen(now);
    label = next ? `${next.city} opens in ${formatWait(next.minutes)}` : 'The desk is ready';
  }
  return { now, open: Boolean(open), label };
}

/** The hero microline: one live fact in mono, nothing decorative. */
function LiveFact() {
  const { now, open, label } = useLiveLabel();
  return (
    <p className='xv-fact'>
      <span className={open ? 'xj-live' : 'xj-live is-idle'}>{label}</span>
      <b className='xj-num'>{formatUtc(now)} UTC</b>
    </p>
  );
}

/** The floating session chip above the vitrine. */
function LiveChip() {
  const now = useUtcClock();
  const open = GOLD_SESSIONS.find((session) => isSessionOpen(session, now));
  const closed = isMarketClosed(now);
  return (
    <>
      <span className={closed ? 'xj-live is-idle' : 'xj-live'}>
        {closed ? 'At rest' : open ? `${open.city} open` : 'Between sessions'}
      </span>
      <b className='xj-num'>{formatUtc(now)}</b>
    </>
  );
}

/* ————————————————————— the vitrine (hero) ————————————————————— */

/** The dashboard plate under glass: stats, equity curve, one pointed figure. */
function DashboardPlate() {
  return (
    <div className='xj-glass xv-plate'>
      <div className='xj-panel-bar'>
        <strong>xaujournal · desk</strong>
        <span>XAU/USD · {DEMO_TRADES.length} trades</span>
      </div>

      <div className='xv-plate-body'>
        <dl className='xv-stats'>
          {[
            ['Win rate', `${STATS.winRate}%`, ''],
            ['Expectancy', formatR2(STATS.expectancy), STATS.expectancy >= 0 ? 'is-up' : 'is-down'],
            ['Profit factor', STATS.profitFactor ? STATS.profitFactor.toFixed(2) : '—', ''],
            ['Net', formatR(STATS.net), STATS.net >= 0 ? 'is-up' : 'is-down'],
          ].map(([label, value, tone]) => (
            <div key={label}>
              <dt className='xj-label'>{label}</dt>
              <dd className={`xj-num ${tone}`.trim()}>{value}</dd>
            </div>
          ))}
        </dl>

        <div className='xv-curve'>
          <svg
            viewBox={`0 0 ${CURVE.width} ${CURVE.height}`}
            role='img'
            aria-label={`Cumulative R across the sample record, finishing at ${formatR(CURVE.final)}.`}
          >
            <line className='xv-curve-zero' x1='0' y1={CURVE.zeroY} x2={CURVE.width} y2={CURVE.zeroY} />
            <path className='xv-curve-area' d={CURVE.area} />
            <path className='xv-curve-line' d={CURVE.line} />
          </svg>
          <span className='xv-curve-tag xj-num is-up'>{formatR(CURVE.final)}</span>
        </div>
      </div>

      {/* The one figure the plate points at: the hour is amber (a signal),
          the R it made stays green (P&L). */}
      <p className='xv-plate-foot'>
        Strongest hour <b className='xj-num is-signal'>{hourWindow(BEST_HOUR.hour)} UTC</b>
        <b className='xj-num is-up'>{formatR(BEST_HOUR.net)}</b>
        <span>across {BEST_HOUR.count} trades</span>
      </p>
    </div>
  );
}

function HeroSection() {
  const heroRef = useRef(null);
  const stageRef = useRef(null);

  /* The plate rights itself on scroll, and the floating panes track the
     pointer by a few pixels. Both write straight to the DOM — no re-renders —
     and neither is wired up under reduced motion or on coarse pointers. */
  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage) return undefined;

    let bounds = null;
    const onScroll = () => {
      bounds = null;
      stage.classList.toggle('is-flat', window.scrollY > 140);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return;
      if (!bounds) bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      stage.style.setProperty('--par-x', x.toFixed(3));
      stage.style.setProperty('--par-y', y.toFixed(3));
    };
    const onLeave = () => {
      stage.style.setProperty('--par-x', '0');
      stage.style.setProperty('--par-y', '0');
    };

    if (fine && !reduce) {
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section ref={heroRef} className='xv-hero' aria-labelledby='hero-heading'>
      <div className='xj-shell grid items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]'>
        <div className='xj-settle'>
          <p className='xj-eyebrow'>Gold only · XAU/USD · MT4 &amp; MT5</p>

          <h1 id='hero-heading' className='xj-h1'>
            The record your broker <em>never</em> kept.
          </h1>

          <p className='xj-lede'>
            xaujournal files every gold trade with its chart, its session and the reason you took
            it — then shows which hours of the day actually pay you. London opens at 07:00 UTC;
            your journal already knows what you do there.
          </p>

          <div className='xj-actions'>
            <CTALink to='/login?mode=signup'>Start free</CTALink>
            <Link className='xj-link' to='/pricing'>See pricing</Link>
          </div>

          <LiveFact />
        </div>

        <div ref={stageRef} className='xv-stage' aria-label='The product, on display'>
          <div className='xv-plate3d'>
            <DashboardPlate />

            {/* museum glass over the plate — a slow specular sweep, nothing else */}
            <div className='xv-glasspane' aria-hidden='true' />

            <div className='xj-glass xv-float xv-float--live'>
              <LiveChip />
            </div>

            <div className='xj-glass xv-float xv-float--pnl'>
              <span className='xj-label'>Net · {DEMO_TRADES.length} trades</span>
              <strong className={`xj-num ${STATS.net >= 0 ? 'is-up' : 'is-down'}`}>
                {formatR(STATS.net)}
              </strong>
            </div>
          </div>

          <div className='xv-plinth' aria-hidden='true' />
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— the session rail ————————————————————— */

/**
 * Four sessions as a real tablist: roving tabindex, arrow keys, and the
 * selection refilters every plate caption in the chapters below through
 * that session's UTC window of the sample record.
 */
function SessionRail({ selectedId, onSelect }) {
  const now = useUtcClock(30000);
  const tabRefs = useRef([]);

  const moveTo = (index) => {
    const next = (index + RAIL.length) % RAIL.length;
    onSelect(RAIL[next].id);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); moveTo(index + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); moveTo(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); moveTo(0); }
    else if (event.key === 'End') { event.preventDefault(); moveTo(RAIL.length - 1); }
  };

  return (
    <section className='xv-rail-band' aria-label='The trading day, four sessions'>
      <div className='xj-shell'>
        <div className='xv-rail' role='tablist' aria-label='Read the sample record through a session'>
          {RAIL.map((session, index) => {
            const selected = session.id === selectedId;
            const open = isSessionOpen(session, now);
            return (
              <button
                key={session.id}
                ref={(el) => { tabRefs.current[index] = el; }}
                type='button'
                role='tab'
                id={`rail-tab-${session.id}`}
                aria-selected={selected}
                aria-controls='vitrine-chapters'
                tabIndex={selected ? 0 : -1}
                className='xv-rail-tab'
                onClick={() => onSelect(session.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <span className='xv-rail-city'>{session.city}</span>
                <span className='xv-rail-hours xj-num'>{windowLabel(session)} UTC</span>
                {open ? (
                  <span className='xv-rail-meta xj-live'>Open now</span>
                ) : (
                  <span className='xv-rail-meta'>{session.figures.count} trades</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— product chapters ————————————————————— */

function JournalPlate() {
  return (
    <div className='xj-glass xv-plate'>
      <div className='xj-panel-bar'>
        <strong>Trade log</strong>
        <span>day {LOG_ROWS[0].day}–{LAST_DAY}</span>
      </div>
      <ul className='xv-log'>
        {LOG_ROWS.map((row) => (
          <li key={`${row.day}-${row.hour}`} className='xv-log-row'>
            <span className='xv-log-time xj-num'>D{row.day} · {pad2(row.hour)}:00</span>
            <span className='xv-log-session'>{DESK_NAMES[row.session]}</span>
            <b className={`xv-log-r xj-num ${row.r > 0 ? 'is-up' : row.r < 0 ? 'is-down' : ''}`.trim()}>
              {formatR(row.r)}
            </b>
            <span className='xv-log-note'>{row.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalyticsPlate({ session }) {
  const deskId = RAIL_TO_DESK[session.id];
  return (
    <div className='xj-glass xv-plate'>
      <div className='xj-panel-bar'>
        <strong>Analytics</strong>
        <span>sessions · calendar</span>
      </div>
      <div className='xv-ana'>
        <div className='xv-ana-split'>
          {SPLIT.map((desk) => (
            <div key={desk.id} className={desk.id === deskId ? 'xv-split-row is-here' : 'xv-split-row'}>
              <span className='xv-split-name'>{desk.label}</span>
              <i
                className={desk.net >= 0 ? 'is-up' : 'is-down'}
                style={{ '--w': `${Math.max((Math.abs(desk.net) / SPLIT_WIDEST) * 100, 6)}%` }}
                aria-hidden='true'
              />
              <b className={`xj-num ${desk.net >= 0 ? 'is-up' : 'is-down'}`}>{formatR(desk.net)}</b>
            </div>
          ))}
        </div>
        <div className='xv-ana-cal'>
          <div className='xv-cal' aria-hidden='true'>
            {CAL_CELLS.map((cell) => {
              let tone = 'is-rest';
              if (cell.net !== null) {
                if (cell.net >= 2) tone = 'is-up-2';
                else if (cell.net > 0) tone = 'is-up-1';
                else if (cell.net <= -2) tone = 'is-down-2';
                else if (cell.net < 0) tone = 'is-down-1';
                else tone = 'is-even';
              }
              return (
                <i
                  key={cell.day}
                  className={cell.day === BEST_DAY.day ? `${tone} is-best` : tone}
                />
              );
            })}
          </div>
          <p className='xv-cal-note'>
            Best day <b className='xj-num is-signal'>D{BEST_DAY.day}</b>
            <b className='xj-num is-up'>{formatR(BEST_DAY.net)}</b>
          </p>
        </div>
      </div>
    </div>
  );
}

function SyncPlate() {
  return (
    <div className='xj-glass xv-plate'>
      <div className='xj-panel-bar'>
        <strong>Broker sync</strong>
        <span className='xj-live'>Live</span>
      </div>
      <div className='xv-sync'>
        <div className='xv-sync-flow'>
          <span>MT4 / MT5</span>
          <i aria-hidden='true' />
          <span>Encrypted bridge</span>
          <i aria-hidden='true' />
          <span className='is-dest'>Your journal</span>
        </div>
        <dl className='xv-sync-rows'>
          <div>
            <dt className='xj-label'>Last import</dt>
            <dd className='xj-num'>{LAST_IMPORT} fills · 0 duplicates</dd>
          </div>
          <div>
            <dt className='xj-label'>History</dt>
            <dd className='xj-num'>{DEMO_TRADES.length} trades · XAU/USD only</dd>
          </div>
          <div>
            <dt className='xj-label'>Typed by hand</dt>
            <dd className='xj-num'>0</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

const CHAPTERS = [
  {
    id: 'journal',
    spec: 'XJ-01 · trade log',
    title: <>The log that keeps the <em>reason</em></>,
    copy: 'Each fill arrives with its session, its R and space for the one honest line: what you saw, and whether you followed the plan. Forty seconds at the close beats an hour of remembering on Sunday.',
    Visual: JournalPlate,
  },
  {
    id: 'analytics',
    spec: 'XJ-02 · session analytics',
    title: <>Sessions and the calendar, read from your <em>record</em></>,
    copy: 'The split shows which desk pays you; the calendar shows how often you let it. Both are computed from your fills, not your memory.',
    Visual: AnalyticsPlate,
  },
  {
    id: 'sync',
    spec: 'XJ-03 · broker sync',
    title: <>MT4 and MT5 fills file <em>themselves</em></>,
    copy: 'Connect once and closed trades arrive on their own — deduplicated, timestamped, zero retyping. Your part of the work starts at the review.',
    Visual: SyncPlate,
  },
];

/** Plate caption, refiltered by the rail: same record, one session's window. */
function ChapterCaption({ id, session }) {
  const f = session.figures;
  const win = `${session.city} · ${windowLabel(session)} UTC`;
  if (id === 'journal') {
    return (
      <p className='xv-caption'>
        <span>{win}</span>
        <span>{f.count} trades on record</span>
        <span>{f.wins}W · {f.losses}L</span>
      </p>
    );
  }
  if (id === 'analytics') {
    return (
      <p className='xv-caption'>
        <span>{win}</span>
        <span>net <b className={`xj-num ${f.net >= 0 ? 'is-up' : 'is-down'}`}>{formatR(f.net)}</b></span>
        <span>
          expectancy{' '}
          <b className={`xj-num ${f.expectancy >= 0 ? 'is-up' : 'is-down'}`}>{formatR2(f.expectancy)}</b>
        </span>
      </p>
    );
  }
  return (
    <p className='xv-caption'>
      <span>{win}</span>
      <span>{f.count} fills auto-filed</span>
      <span>0 typed by hand</span>
    </p>
  );
}

function ChaptersSection({ session }) {
  return (
    <section className='xj-section' aria-labelledby='chapters-heading'>
      <div className='xj-shell'>
        <SectionHead
          id='chapters-heading'
          eyebrow='The product'
          title={<>Three instruments, <em>one</em> record.</>}
          lede={`Pick a session on the rail above — every caption below re-reads the same ${DEMO_TRADES.length}-trade sample through that window.`}
        />

        <div
          id='vitrine-chapters'
          role='tabpanel'
          aria-labelledby={`rail-tab-${session.id}`}
          className='xv-chapters'
        >
          {CHAPTERS.map(({ id, spec, title, copy, Visual }, index) => (
            <article key={id} className='xv-chapter xj-reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
              <div className={index % 2 ? 'lg:order-2' : undefined}>
                <p className='xv-spec'>{spec}</p>
                <h3>{title}</h3>
                <p className='xv-chapter-copy'>{copy}</p>
              </div>
              <div className={index % 2 ? 'lg:order-1' : undefined}>
                <Visual session={session} />
                <ChapterCaption id={id} session={session} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— the study teaser ————————————————————— */

const STUDY_PICKS = [
  'why-keep-a-trading-journal',
  'gold-trading-sessions-explained',
  'risk-per-trade-position-sizing-gold',
].map(getArticle).filter(Boolean);

function StudySection() {
  return (
    <section className='xj-section' aria-labelledby='study-heading'>
      <div className='xj-shell'>
        <SectionHead
          id='study-heading'
          eyebrow='The study'
          title={<>Study materials for the <em>gold</em> desk.</>}
          lede='Short reads that take a beginner from a raw XAUUSD quote to a position sized on purpose. Free, no login.'
        />

        <div className='xj-reveal grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {STUDY_PICKS.map((article) => (
            <Link key={article.slug} className='xj-glass xjs-card' to={`/blogs/${article.slug}`}>
              <span className='xjs-card-spine' aria-hidden='true'>{article.category}</span>
              <h3>{article.title}</h3>
              <p className='xjs-card-meta'>
                <span>{article.readMinutes} min</span>
                <Arrow />
              </p>
            </Link>
          ))}
        </div>

        <div className='mt-10'>
          <TextLink to='/blogs'>Browse the study</TextLink>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— proof strip ————————————————————— */

const PROOF = ['XAUUSD only', 'MT4 / MT5 auto-sync', 'Free plan — no card', 'P&L calendar'];

function ProofStrip() {
  return (
    <section className='xv-proof-band' aria-label='Plain facts'>
      <div className='xj-shell'>
        <ul className='xv-proof'>
          {PROOF.map((fact) => <li key={fact}>{fact}</li>)}
        </ul>
      </div>
    </section>
  );
}

/* ————————————————————— pricing bridge ————————————————————— */

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    mark: null,
    price: '$0',
    per: 'forever',
    items: ['Manual trade journal', 'P&L calendar', 'Core statistics'],
  },
  {
    id: 'pro',
    name: 'Pro',
    mark: 'MT4 / MT5 sync',
    price: PRO_MONTHLY_DISPLAY,
    per: '/ month',
    items: ['Broker auto-sync', 'Full session analytics', 'TradingView webhooks'],
  },
];

function PricingBridge() {
  return (
    <section className='xj-section' aria-labelledby='pricing-heading'>
      <div className='xj-shell'>
        <SectionHead
          id='pricing-heading'
          eyebrow='Pricing'
          title={<>Free to keep. Paid to <em>automate</em>.</>}
          lede='Manual journaling never costs anything. Pro pays for itself the first week you stop retyping fills.'
        />

        <div className='xj-reveal grid gap-4 md:grid-cols-2'>
          {TIERS.map((tier) => (
            <Link key={tier.id} className='xj-glass xv-tier' to='/pricing'>
              <p className='xv-tier-name'>
                <span>{tier.name}</span>
                {tier.mark ? <mark>{tier.mark}</mark> : null}
              </p>
              <p className='xv-tier-price'>
                <strong>{tier.price}</strong>
                <span>{tier.per}</span>
              </p>
              <ul>
                {tier.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <span className='xv-tier-more'>Full pricing <Arrow /></span>
            </Link>
          ))}
        </div>

        <div className='xj-actions'>
          <CTALink to='/login?mode=signup'>Start free</CTALink>
          <small>No card · cancel any time</small>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— FAQ ————————————————————— */

function FAQSection() {
  return (
    <section className='xj-section' aria-labelledby='faq-heading'>
      <div className='xj-shell'>
        <div className='xj-faq xj-reveal'>
          <div>
            <p className='xj-eyebrow'>Direct answers</p>
            <h2 id='faq-heading' className='xj-h2'>Asked before <em>the first login.</em></h2>
          </div>
          <div className='xj-faq-list'>
            {LANDING_FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}<span aria-hidden='true'>+</span></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— final CTA ————————————————————— */

function FinalSection() {
  const { label } = useLiveLabel(60000);
  return (
    <section className='xj-section xv-final' aria-labelledby='final-heading'>
      <div className='xj-shell xj-reveal'>
        <p className='xj-eyebrow'>{label}</p>
        <h2 id='final-heading' className='xv-final-title'>
          Your next session is <em>journaled</em> before you sit down.
        </h2>
        <div className='xj-actions'>
          <CTALink to='/login?mode=signup'>Start free</CTALink>
          <small>No card · no trial clock</small>
        </div>
      </div>
    </section>
  );
}

/* ————————————————————— page ————————————————————— */

function useLandingSchemas() {
  useEffect(() => {
    injectJsonLd('ld-organization', buildOrganizationSchema());
    injectJsonLd('ld-website', buildWebSiteSchema());
    injectJsonLd('ld-software', buildSoftwareSchema());
    injectJsonLd('ld-faq', buildFAQSchema(LANDING_FAQ));

    return () => {
      removeJsonLd('ld-organization');
      removeJsonLd('ld-website');
      removeJsonLd('ld-software');
      removeJsonLd('ld-faq');
    };
  }, []);
}

export function LandingPage() {
  const location = useLocation();
  useLandingSchemas();
  useDeskReveal();

  useEffect(() => {
    applyPageSEO(location.pathname);
  }, [location.pathname]);

  /* The rail opens on whichever desk is live when the visitor arrives;
     London — the record's edge — when the market is at rest. */
  const [railId, setRailId] = useState(() => {
    const now = new Date();
    const open = GOLD_SESSIONS.find((session) => isSessionOpen(session, now));
    return open ? open.id : 'lon';
  });
  const railSession = RAIL.find((session) => session.id === railId) ?? RAIL[2];

  return (
    <>
      <PublicNavbar />
      <div className='xj xv' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <HeroSection />
          <SessionRail selectedId={railId} onSelect={setRailId} />
          <ChaptersSection session={railSession} />
          <StudySection />
          <ProofStrip />
          <PricingBridge />
          <FAQSection />
          <FinalSection />
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
