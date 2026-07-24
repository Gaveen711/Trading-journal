import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, Target } from 'lucide-react';

import { XauEmblem } from '../components/Logo';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import {
  LANDING_FAQ,
  buildFAQSchema,
  buildOrganizationSchema,
  buildSoftwareSchema,
  buildWebSiteSchema,
  injectJsonLd,
  removeJsonLd,
} from '../lib/seo';
import './LandingPage.css';

function useLandingSchemas() {
  useLayoutEffect(() => {
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

/**
 * One night, told on scroll. The scrollbar is the clock:
 * 14:32 close → 18:05 replay → 22:47 note → 01:15 build → 06:58 next open.
 */
function useNightScroll(chartRef, clockRef) {
  const [clock, setClock] = useState('14:32');

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealTargets = document.querySelectorAll('.xnl-reveal');
    let revealObserver;
    if (reduceMotion) {
      revealTargets.forEach((el) => el.classList.add('is-in'));
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        }),
        { threshold: 0.18 },
      );
      revealTargets.forEach((el) => revealObserver.observe(el));
    }

    const chapterObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setClock(entry.target.dataset.time);
      }),
      { rootMargin: '-42% 0px -42% 0px' },
    );
    document.querySelectorAll('[data-time]').forEach((el) => chapterObserver.observe(el));

    const chartEl = chartRef.current;
    const path = chartEl?.querySelector('.xnl-chart-path');
    let frameId = 0;

    const paint = () => {
      frameId = 0;
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      clockRef.current?.style.setProperty('--p', total > 0 ? String(window.scrollY / total) : '0');

      if (!chartEl || !path) return;
      if (reduceMotion) {
        path.style.strokeDashoffset = '0';
        chartEl.classList.add('show-entry', 'show-exit');
        return;
      }
      const rect = chartEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.92 - rect.top) / (vh * 0.62)));
      path.style.strokeDashoffset = String(1 - p);
      chartEl.classList.toggle('show-entry', p > 0.42);
      chartEl.classList.toggle('show-exit', p > 0.92);
    };

    const onScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(paint);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();

    return () => {
      revealObserver?.disconnect();
      chapterObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [chartRef, clockRef]);

  return clock;
}

function ActionLink({ to, children, secondary = false }) {
  return (
    <Link className={secondary ? 'xnl-action xnl-action--secondary' : 'xnl-action xnl-action--primary'} to={to}>
      <ArrowRight className='xnl-arr xnl-arr--in' aria-hidden='true' />
      <span>{children}</span>
      <ArrowRight className='xnl-arr xnl-arr--out' aria-hidden='true' />
      <i className='xnl-action-fill' aria-hidden='true' />
    </Link>
  );
}

function Kicker({ time, children }) {
  return (
    <p className='xnl-kicker'>
      {time ? <span className='xnl-kicker-time'>{time}</span> : null}
      {children}
    </p>
  );
}

/* ——— 14:32 — the close ——— */

function FillTicket() {
  return (
    <article className='xnl-ticket' aria-label='Broker fill confirmation for the trade this story is about'>
      <header>
        <span>FILL CONFIRMATION</span>
        <strong>MT5 / 8842107</strong>
      </header>
      <div className='xnl-ticket-rows'>
        <div><span>Instrument</span><strong>XAU / USD</strong></div>
        <div><span>Side</span><strong>BUY 0.50</strong></div>
        <div><span>Entry</span><strong>2,387.44</strong></div>
        <div><span>Exit</span><strong>2,394.18</strong></div>
        <div><span>Session</span><strong>London</strong></div>
        <div><span>Result</span><strong className='is-positive'>+1.18R</strong></div>
      </div>
      <footer>
        <span className='xnl-ticket-barcode' aria-hidden='true' />
        <span>CLOSED 14:32:07 GMT</span>
      </footer>
      <span className='xnl-ticket-stamp' aria-hidden='true'>PROFIT<i>reason unrecorded</i></span>
    </article>
  );
}

const TICKER_ITEMS = [
  'XAU/USD 2,394.18 ▲ +1.18R',
  'London — closed 14:32 GMT',
  'Free plan — no card',
  'MT4 / MT5 sync on Pro',
  'Private by default',
  'The trade is closed — the lesson isn’t',
];

function TickerRow({ hidden = false }) {
  return (
    <span className='xnl-ticker-group' aria-hidden={hidden || undefined}>
      {TICKER_ITEMS.map((item) => (
        <span key={item}>{item}<i aria-hidden='true'>◆</i></span>
      ))}
    </span>
  );
}

function HeroSection() {
  return (
    <section className='xnl-hero' data-time='14:32' aria-labelledby='landing-hero-heading'>
      <div className='xnl-shell xnl-hero-inner'>
        <header className='xnl-mast'>
          <span>Case file 001</span>
          <span className='xnl-mast-mid'>A true story from one gold desk</span>
          <span>XAU / USD — London</span>
        </header>
        <h1 id='landing-hero-heading' className='xnl-h'>
          <span className='xnl-h-line'><span>The best trade</span></span>
          <span className='xnl-h-line xnl-h-line--hollow'><span>I ever took</span></span>
          <span className='xnl-h-line'><span>was a <em>mistake.</em></span></span>
        </h1>
        <div className='xnl-hero-foot'>
          <p className='xnl-lede'>
            XAU/USD, London session, closed +1.18R. This page is that night — and the gold trading
            journal it forced me to build.
          </p>
          <div className='xnl-hero-actions'>
            <ActionLink to='/login?mode=signup'>Start the free journal</ActionLink>
            <a className='xnl-scroll-cue' href='#replay'>
              <ArrowDown aria-hidden='true' /> The night starts at 18:05
            </a>
          </div>
        </div>
        <FillTicket />
      </div>
      <div className='xnl-ticker' aria-label='Product facts ticker'>
        <div className='xnl-ticker-track'>
          <TickerRow />
          <TickerRow hidden />
        </div>
      </div>
    </section>
  );
}

/* ——— 18:05 — the replay ——— */

function ReplayChart({ chartRef }) {
  return (
    <figure className='xnl-chart xnl-reveal' ref={chartRef}>
      <svg viewBox='0 0 680 260' role='img' aria-labelledby='replay-title replay-desc'>
        <title id='replay-title'>Replay of the XAUUSD trade</title>
        <desc id='replay-desc'>Price runs up after an entry taken six minutes before the plan allowed. The planned entry sits later, after the confirmation close.</desc>
        <g className='xnl-chart-grid' aria-hidden='true'>
          <path d='M0 52H680M0 104H680M0 156H680M0 208H680' />
          <path d='M97 0V260M194 0V260M291 0V260M388 0V260M485 0V260M582 0V260' />
        </g>
        <path
          className='xnl-chart-path'
          pathLength='1'
          d='M0 178 C36 172 58 204 92 190 S148 128 184 150 S238 202 272 168 S316 118 348 132 S398 168 432 120 S492 44 540 66 S632 70 680 32'
        />
        <line className='xnl-chart-plan-line' x1='348' y1='132' x2='432' y2='120' aria-hidden='true' />
        <g className='xnl-pin xnl-pin--entry'>
          <circle cx='272' cy='168' r='7' />
          <text x='150' y='226'>my entry — 6 min early</text>
        </g>
        <g className='xnl-pin xnl-pin--plan'>
          <circle cx='348' cy='132' r='7' />
          <text x='362' y='158'>planned entry — after the close</text>
        </g>
        <g className='xnl-pin xnl-pin--exit'>
          <circle cx='680' cy='32' r='7' />
          <text x='588' y='24'>exit +1.18R</text>
        </g>
      </svg>
      <figcaption>
        <span>2394.18</span>
        <span>Replay, 18:05 — the confirmation candle never closed.</span>
        <span>2387.44</span>
      </figcaption>
    </figure>
  );
}

function ReplaySection({ chartRef }) {
  return (
    <section id='replay' className='xnl-chapter xnl-chapter--replay' data-time='18:05' aria-labelledby='replay-heading'>
      <span className='xnl-watermark' aria-hidden='true'>18:05</span>
      <div className='xnl-shell'>
        <div className='xnl-chapter-head'>
          <Kicker time='18:05'>The replay</Kicker>
          <h2 id='replay-heading'>The win was real.<br /><em>The entry wasn’t earned.</em></h2>
          <p>
            That evening I replayed the session candle by candle. My plan said: wait for the five-minute close
            back inside the range. My fill said 14:26 — six minutes early. The confirmation I was waiting for
            never arrived. The market simply forgave me.
          </p>
        </div>
        <ReplayChart chartRef={chartRef} />
        <dl className='xnl-two-truths xnl-reveal'>
          <div>
            <dt>The broker recorded</dt>
            <dd>Entry 2,387.44. Exit 2,394.18. +1.18R. Closed 14:32.</dd>
          </div>
          <div>
            <dt>It could not record</dt>
            <dd>The rule. The hesitation. The six minutes that made this luck, not process.</dd>
          </div>
        </dl>
        <p className='xnl-pull xnl-reveal'>A profitable mistake is still a mistake. <em>It’s just better disguised.</em></p>
      </div>
    </section>
  );
}

/* ——— 22:47 — the note ——— */

function NoteSection() {
  return (
    <section className='xnl-chapter xnl-chapter--night' data-time='22:47' aria-labelledby='note-heading'>
      <span className='xnl-watermark' aria-hidden='true'>22:47</span>
      <div className='xnl-shell xnl-note-grid'>
        <div className='xnl-note-copy'>
          <Kicker time='22:47'>The desk note</Kicker>
          <h2 id='note-heading'>“The P&amp;L says green.<br /><em>The replay says I was early.”</em></h2>
          <p>
            I’m Gaveen Perera — developer by profession, gold trader after hours. That night, the evidence of my
            own trade lived in three places: the fill in MT5, the screenshot in a folder, the reason only in my
            head. Rebuilding one trade honestly took twenty minutes. So most nights, I didn’t.
          </p>
          <p>
            A week later the same early entry appeared inside another winning trade. Once is a slip. Twice,
            recorded nowhere, is a pattern with a future.
          </p>
          <div className='xnl-signature'>
            <strong>Gaveen Perera</strong>
            <span>Founder — developer and gold trader</span>
          </div>
        </div>
        <figure className='xnl-note-photo xnl-reveal'>
          <img
            src='/founder-trader-session.webp'
            width='1536'
            height='1024'
            loading='lazy'
            alt='Gaveen Perera reviewing a gold trading session at his desk late at night'
          />
          <figcaption>22:47 — after the session, not in a pitch meeting.</figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ——— 01:15 — the build ——— */

function BuildSection() {
  return (
    <section className='xnl-chapter xnl-chapter--night xnl-chapter--build' data-time='01:15' aria-labelledby='build-heading'>
      <span className='xnl-watermark' aria-hidden='true'>01:15</span>
      <div className='xnl-shell xnl-build-grid'>
        <div className='xnl-chapter-head'>
          <Kicker time='01:15'>The build</Kicker>
          <h2 id='build-heading'>So I did what developers do<br /><em>at one in the morning.</em></h2>
          <p>
            I stopped waiting for someone else to build it. One screen for the fill, the chart, the reason and
            one rule for tomorrow. Capture is automatic so the thinking doesn’t have to be. That small nightly
            tool ran every session for months before it had a name.
          </p>
        </div>
        <div className='xnl-terminal xnl-reveal' role='img' aria-label='Terminal showing the first commit of XAU Journal'>
          <header><i /><i /><i /><span>gaveen@desk — 01:15</span></header>
          <pre>
            <code>
              <span className='xnl-t-dim'>$</span> touch review.jsx{'\n'}
              <span className='xnl-t-dim'>$</span> git commit -m <span className='xnl-t-gold'>"one screen: fill, chart, reason, rule"</span>{'\n'}
              <span className='xnl-t-dim'>#</span> 1 file changed.{'\n'}
              <span className='xnl-t-dim'>#</span> <em>Everything else did too.</em>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

/* ——— 06:58 — the next session ——— */

const MARGIN_NOTES = [
  ['Capture', 'Save the trade before memory edits it — chart, session, risk, screenshot, reason.'],
  ['Context', 'The reason sits beside the result, so a profitable mistake can’t hide.'],
  ['Compare', 'Read setups and sessions together and find the process that repeats.'],
  ['Carry', 'Every review ends as one sentence you take into the next open.'],
];

function ProductWindow() {
  return (
    <div className='xnl-product-window xnl-reveal' aria-label='Sample XAU Journal weekly review workspace'>
      <div className='xnl-product-topbar'>
        <div><XauEmblem className='xnl-product-emblem' /><strong>XAU Journal</strong></div>
        <span>Week 27 — review before London</span>
      </div>
      <div className='xnl-product-metrics'>
        <div><span>Net result</span><strong>+8.4R</strong><small>9 closed trades</small></div>
        <div><span>Plan followed</span><strong>7 / 9</strong><small>Two early entries</small></div>
        <div><span>Best session</span><strong>London</strong><small>+6.1R this week</small></div>
      </div>
      <div className='xnl-product-body'>
        <div className='xnl-product-trades'>
          <header>LAST DECISIONS</header>
          <div><span className='is-buy'>BUY</span><p><strong>London sweep</strong><small>Waited for confirmation</small></p><b className='is-positive'>+3.2R</b></div>
          <div><span className='is-sell'>SELL</span><p><strong>NY continuation</strong><small>Plan followed</small></p><b className='is-positive'>+2.1R</b></div>
          <div><span className='is-buy'>BUY</span><p><strong>Late impulse</strong><small>Entered before retest</small></p><b className='is-negative'>−1.0R</b></div>
        </div>
        <aside className='xnl-product-rule'>
          <Target aria-hidden='true' />
          <span>NEXT-SESSION RULE</span>
          <strong>Do not take the first London impulse.</strong>
          <small><Check aria-hidden='true' /> Saved for tomorrow</small>
        </aside>
      </div>
    </div>
  );
}

function ProductSection() {
  return (
    <section className='xnl-chapter xnl-chapter--dawn' data-time='06:58' aria-labelledby='product-heading'>
      <span className='xnl-watermark' aria-hidden='true'>06:58</span>
      <div className='xnl-shell'>
        <div className='xnl-chapter-head'>
          <Kicker time='06:58'>The next London open</Kicker>
          <h2 id='product-heading'>One night’s tool<br /><em>became XAU Journal.</em></h2>
          <p>
            The screen from that night grew into a full desk — calendar, sessions, risk, screenshots — but it
            still does exactly four jobs, in the same order I needed them at 01:15.
          </p>
        </div>
        <div className='xnl-product-grid'>
          <ProductWindow />
          <ol className='xnl-margin-notes'>
            {MARGIN_NOTES.map(([title, body], i) => (
              <li className='xnl-reveal' key={title}>
                <span>0{i + 1}</span>
                <div><h3>{title}</h3><p>{body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ——— every desk ——— */

function AudienceSection() {
  return (
    <section className='xnl-chapter xnl-chapter--audience' data-time='TONIGHT' aria-labelledby='audience-heading'>
      <div className='xnl-shell'>
        <div className='xnl-chapter-head'>
          <Kicker>For every desk that trades gold</Kicker>
          <h2 id='audience-heading'>Beginners build the habit.<br /><em>Professionals defend it.</em></h2>
        </div>
        <div className='xnl-audience-rows'>
          <article className='xnl-reveal'>
            <span>STARTING OUT</span>
            <h3>Your first hundred trades write your habits.</h3>
            <p>Log them manually on Free and learn your own patterns while the size is still small enough to forgive you.</p>
          </article>
          <article className='xnl-reveal'>
            <span>TRADING FOR A LIVING</span>
            <h3>Keep prop-firm discipline visible.</h3>
            <p>Sync MT4/MT5 on Pro and review London and New York with the same rigor you demand of the entry itself.</p>
          </article>
        </div>
        <p className='xnl-pull xnl-reveal'>Gold trades through every timezone. <em>So do its mistakes.</em></p>
      </div>
    </section>
  );
}

/* ——— the rate card + close ——— */

function RateCardSection() {
  return (
    <section className='xnl-chapter xnl-chapter--rates' data-time='TONIGHT' aria-labelledby='rates-heading'>
      <div className='xnl-shell xnl-rates-grid'>
        <div>
          <Kicker>The rate card</Kicker>
          <h2 id='rates-heading'>Start free.<br /><em>Upgrade when automation earns it.</em></h2>
          <p>Manual journaling is free for as long as you want it. Pro exists for one reason: to give your review time back.</p>
          <div className='xnl-hero-actions'>
            <ActionLink to='/login?mode=signup'>Start the free journal</ActionLink>
            <Link className='xnl-inline-link' to='/pricing'>Compare Free and Pro <ArrowRight aria-hidden='true' /></Link>
          </div>
        </div>
        <div className='xnl-plans' aria-label='Free and Pro plan overview'>
          <div className='xnl-reveal'>
            <span>FREE</span>
            <strong>Unlimited manual journaling</strong>
            <p>Every trade, the calendar and core P&amp;L. No card required to begin.</p>
          </div>
          <div className='xnl-reveal'>
            <span>PRO</span>
            <strong>MT4 / MT5 sync + full analytics</strong>
            <p>Trades import themselves. You keep the ten minutes for the thinking.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CloseSection() {
  return (
    <section className='xnl-chapter xnl-chapter--close' data-time='TONIGHT' aria-labelledby='close-heading'>
      <div className='xnl-shell'>
        <Kicker>Tonight, after your last trade</Kicker>
        <h2 id='close-heading'>Give it ten<br /><em>honest minutes.</em></h2>
        <p>One review is enough to begin. The rest of the habit follows the first honest one.</p>
        <div className='xnl-hero-actions'>
          <ActionLink to='/login?mode=signup'>Start the free journal</ActionLink>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className='xnl-faq' aria-labelledby='faq-heading'>
      <div className='xnl-shell xnl-faq-grid'>
        <div>
          <Kicker>Before you begin</Kicker>
          <h2 id='faq-heading'>Direct answers.</h2>
        </div>
        <div className='xnl-faq-list'>
          {LANDING_FAQ.slice(0, 4).map((item) => (
            <details key={item.q}>
              <summary>{item.q}<span aria-hidden='true'>+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  useLandingSchemas();
  const chartRef = useRef(null);
  const clockRef = useRef(null);
  const clock = useNightScroll(chartRef, clockRef);

  return (
    <>
      <PublicNavbar />
      <div className='xnl-site' data-ux-skip='true'>
        <main className='xnl-page' data-ux-skip='true'>
          <HeroSection />
          <ReplaySection chartRef={chartRef} />
          <NoteSection />
          <BuildSection />
          <ProductSection />
          <AudienceSection />
          <RateCardSection />
          <CloseSection />
          <FAQSection />
        </main>
        <div className='xnl-clock' ref={clockRef} aria-hidden='true'>
          <span>SESSION</span>
          <strong>{clock}</strong>
          <i className='xnl-clock-bar' />
        </div>
      </div>
      <PublicFooter className='qgs-footer' />
    </>
  );
}
