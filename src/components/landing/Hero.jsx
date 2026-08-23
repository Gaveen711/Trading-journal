import { useEffect, useRef } from 'react';
import { CTALink, Shot } from '../PublicSite';
import {
  GOLD_SESSIONS,
  formatUtc,
  formatWait,
  getNextOpen,
  isSessionOpen,
  useUtcClock,
} from '../../lib/goldSessions';
import {
  DEMO_TRADES,
  bestHour,
  formatR,
  formatR2,
  hourWindow,
  sessionSplit,
  summarise,
} from '../../lib/deskDemo';
import './Hero.css';

/* ————————————————————————————————————————————————————————————————
   Hero — "Lightbox".

   The product is the hero. Three real captures of the desk sit on a
   CSS-3D plinth under museum glass: tilted when the page opens, and
   settling flat across the first ~70vh of scroll while the two back
   plates fan out and brighten.

   One implementation of that motion. `--xh-progress` (0 → 1) is a
   registered custom property; browsers with scroll timelines animate it
   from CSS (see Hero.css), everyone else gets it written inline by a
   rAF-throttled scroll listener below. Every plate transform is a calc()
   of that one number, so the two paths can never drift apart.

   Every figure in the ticker is derived from the sample record in
   src/lib/deskDemo.js — the same record the captures were rendered
   from — so the hero can never quote a number the plates disagree with.
   ———————————————————————————————————————————————————————————————— */

/* ————————————————————— derived readouts ————————————————————— */

const STATS = summarise(DEMO_TRADES);
const BEST_HOUR = bestHour(DEMO_TRADES);
const SPLIT = sessionSplit();
const LONDON = SPLIT.find((session) => session.id === 'london');
const ASIA = SPLIT.find((session) => session.id === 'asia');

const toneOf = (value) => (value > 0 ? 'is-up' : value < 0 ? 'is-down' : '');

/** The strip under the stack, left to right: the record, its coin-flip
    hit rate, the positive expectancy anyway, the session that carries it,
    the one that bleeds, and the hour that made the difference. */
const TICKER = [
  { key: 'Sample record', value: `${STATS.count} fills` },
  { key: 'Hit rate', value: `${STATS.winRate}%` },
  { key: 'Expectancy', value: formatR2(STATS.expectancy), tone: toneOf(STATS.expectancy) },
  { key: LONDON.label, value: formatR(LONDON.net), tone: toneOf(LONDON.net) },
  { key: ASIA.label, value: formatR(ASIA.net), tone: toneOf(ASIA.net) },
  { key: 'Best hour', value: `${hourWindow(BEST_HOUR.hour)} UTC` },
];

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

/** The eyebrow is a live chip: the amber dot is the only amber on the page. */
function LiveChip() {
  const { now, open, label } = useLiveLabel();
  return (
    <p className='xj-eyebrow xh-eyebrow'>
      <span className={open ? 'xj-live' : 'xj-live is-idle'}>{label}</span>
      <span className='xh-eyebrow-dot' aria-hidden='true'>·</span>
      <b className='xj-num'>{formatUtc(now, false)} UTC</b>
    </p>
  );
}

/* ————————————————————— motion ————————————————————— */

const SCROLL_SPAN = 0.7; // the stack settles across the first 70vh
const PROGRESS_SUPPORTED = () =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline: scroll()');

/**
 * Scroll fallback + pointer parallax. Both write custom properties straight
 * onto the stage — no React state, no re-renders. The scroll listener only
 * exists where CSS scroll timelines do not; the parallax only on fine
 * pointers; neither under reduced motion.
 */
function useLightbox(sectionRef, stageRef) {
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const disposers = [];

    if (reduce) {
      stage.style.setProperty('--xh-progress', '1');
      return undefined;
    }

    if (!PROGRESS_SUPPORTED()) {
      let frame = 0;
      const write = () => {
        frame = 0;
        const span = Math.max(1, window.innerHeight * SCROLL_SPAN);
        const t = Math.min(1, Math.max(0, window.scrollY / span));
        const eased = 1 - (1 - t) * (1 - t); // matches the CSS ease-out
        stage.style.setProperty('--xh-progress', eased.toFixed(4));
      };
      const schedule = () => {
        if (!frame) frame = window.requestAnimationFrame(write);
      };
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      write();
      disposers.push(() => {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        if (frame) window.cancelAnimationFrame(frame);
      });
    }

    if (fine) {
      let bounds = null;
      let frame = 0;
      let next = [0, 0];
      const write = () => {
        frame = 0;
        stage.style.setProperty('--xh-px', next[0].toFixed(3));
        stage.style.setProperty('--xh-py', next[1].toFixed(3));
      };
      const onMove = (event) => {
        if (event.pointerType !== 'mouse') return;
        if (!bounds) bounds = section.getBoundingClientRect();
        next = [
          ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
          ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
        ];
        if (!frame) frame = window.requestAnimationFrame(write);
      };
      const onLeave = () => {
        next = [0, 0];
        if (!frame) frame = window.requestAnimationFrame(write);
      };
      const onResize = () => {
        bounds = null;
      };
      section.addEventListener('pointermove', onMove);
      section.addEventListener('pointerleave', onLeave);
      window.addEventListener('resize', onResize, { passive: true });
      disposers.push(() => {
        section.removeEventListener('pointermove', onMove);
        section.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('resize', onResize);
        if (frame) window.cancelAnimationFrame(frame);
      });
    }

    return () => disposers.forEach((dispose) => dispose());
  }, [sectionRef, stageRef]);
}

/* ————————————————————— the hero ————————————————————— */

export function Hero() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  useLightbox(sectionRef, stageRef);

  return (
    <section ref={sectionRef} className='xh' aria-labelledby='xh-title'>
      <div className='xj-shell xh-grid'>
        <div className='xh-copy xj-settle'>
          <LiveChip />

          <h1 id='xh-title' className='xj-h1 xh-title'>
            The journal that knows which <em>session</em> pays you.
          </h1>

          <p className='xj-lede xh-lede'>
            XAUUSD and nothing else. MT4 and MT5 fills import themselves, and every session
            — Sydney, Tokyo, London, New York — is measured on its own.
          </p>

          <div className='xj-actions xh-actions'>
            <CTALink to='/login?mode=signup'>Start free</CTALink>
            <CTALink ghost to='/pricing'>See pricing</CTALink>
          </div>

          <p className='xj-label xh-proof'>Free plan · no card · MT4 &amp; MT5 sync on Pro</p>
        </div>

        {/* The lightbox. Perspective lives on the stage; the stack is the
            3D context; each plate is a real capture. The two back plates
            are duplicates of the product for depth only, so they stay out
            of the accessibility tree. */}
        <div ref={stageRef} className='xh-stage'>
          <div className='xh-stack'>
            <div className='xh-plate xh-plate--back'>
              <Shot name='calendar' title='Calendar · realised P&L' aria-hidden='true' />
            </div>
            <div className='xh-plate xh-plate--mid'>
              <Shot name='analytics' title='Analytics · by session' aria-hidden='true' />
            </div>
            <div className='xh-plate xh-plate--front'>
              <Shot
                name='dashboard'
                title='Desk · XAU/USD'
                priority
                className='xj-shot--sweep'
                aria-hidden={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='xj-shell'>
        <ul className='xh-ticker xj-reveal' aria-label='Readouts from the sample record'>
          {TICKER.map(({ key, value, tone }) => (
            <li key={key}>
              <span className='xh-ticker-key'>{key}</span>
              <b className={`xj-num xh-ticker-val ${tone ?? ''}`.trim()}>{value}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
