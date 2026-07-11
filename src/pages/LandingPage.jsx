import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  LineChart,
  LockKeyhole,
  NotebookPen,
  PlugZap,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';

import Logo from '../components/Logo';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAppTheme } from '../hooks/useAppTheme';
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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const themes = {
  light: {
    '--qgs-paper': '#f4efe4',
    '--qgs-paper-raised': '#fffaf0',
    '--qgs-ink': '#15120d',
    '--qgs-muted': '#6d6557',
    '--qgs-line': 'rgba(37, 29, 17, .16)',
    '--qgs-line-strong': 'rgba(37, 29, 17, .3)',
    '--qgs-gold': '#a66f12',
    '--qgs-gold-bright': '#d2a13e',
    '--qgs-deep': '#0f0e0b',
    '--qgs-on-deep': '#f6efe0',
    '--qgs-success': '#28775a',
    '--qgs-danger': '#a84f3f',
  },
  dark: {
    '--qgs-paper': '#0c0b08',
    '--qgs-paper-raised': '#14120d',
    '--qgs-ink': '#f4ecdc',
    '--qgs-muted': '#b7ad9a',
    '--qgs-line': 'rgba(244, 236, 220, .14)',
    '--qgs-line-strong': 'rgba(244, 236, 220, .28)',
    '--qgs-gold': '#d2a13e',
    '--qgs-gold-bright': '#f0c467',
    '--qgs-deep': '#070705',
    '--qgs-on-deep': '#f6efe0',
    '--qgs-success': '#6bbf95',
    '--qgs-danger': '#d98673',
  },
};

const reviewSteps = [
  {
    number: '01',
    label: 'Capture the facts',
    title: <>The trade enters before <span className='qgs-rgb-highlight'>memory edits</span> it.</>,
    body: 'Entry, exit, session, pips, P&L and the setup are recorded while the chart is still fresh.',
  },
  {
    number: '02',
    label: 'Keep the context',
    title: <>The result stays beside the <span className='qgs-rgb-highlight'>reason</span>.</>,
    body: 'A screenshot, the risk decision and the emotion behind the click make the trade readable later.',
  },
  {
    number: '03',
    label: 'Read the pattern',
    title: <>The week stops hiding where <span className='qgs-rgb-highlight'>discipline broke</span>.</>,
    body: 'Sessions, setups and repeated mistakes become evidence instead of another vague feeling.',
  },
  {
    number: '04',
    label: 'Carry one rule',
    title: <>The next session opens with a <span className='qgs-rgb-highlight'>decision</span>.</>,
    body: 'Keep one rule to protect before the next XAUUSD entry. That is where review becomes an edge.',
  },
];

const journalNav = [
  { label: 'Overview', icon: BarChart3 },
  { label: 'Trades', icon: Clock3 },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Journal', icon: BookOpen, active: true },
];

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

function getWavyPath(scrollPhaseVal, timePhaseVal) {
  const amp = 16; // wave amplitude (tasteful wiggle)
  const freq = 0.008; // wave frequency
  
  const getOffset = (x, yOrig) => {
    const phase = x * freq + scrollPhaseVal + timePhaseVal;
    const damping = Math.sin((x / 1100) * Math.PI);
    return yOrig + Math.sin(phase) * amp * damping;
  };

  const y0 = getOffset(20, 85);
  const y1 = getOffset(196, 85);
  const y2 = getOffset(184, 28);
  const y3 = getOffset(365, 28);
  const y4 = getOffset(516, 28);
  const y5 = getOffset(527, 143);
  const y6 = getOffset(704, 143);
  const y7 = getOffset(872, 143);
  const y8 = getOffset(871, 61);
  const y9 = getOffset(1080, 61);
  
  return `M 20 ${y0} C 196 ${y1} 184 ${y2} 365 ${y3} C 516 ${y4} 527 ${y5} 704 ${y6} C 872 ${y7} 871 ${y8} 1080 ${y9}`;
}

function useLandingMotion(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const cleanupEvents = [];
    let lenis;
    let rafId;
    let media;

    if (!reduceMotion) {
      lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        wheelMultiplier: 0.88,
        touchMultiplier: 1.05,
      });
      lenis.on('scroll', ScrollTrigger.update);

      const raf = (time) => {
        lenis.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };
      rafId = window.requestAnimationFrame(raf);
    }

    const context = gsap.context(() => {
      const heroItems = gsap.utils.toArray('[data-hero-enter]', root);
      const heroPath = root.querySelector('.qgs-hero-thread-path');
      const productStage = root.querySelector('.qgs-product-stage');

      if (!reduceMotion) {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from(heroItems, { y: 34, autoAlpha: 0, duration: 0.8, stagger: 0.08 })
          .from(productStage, { y: 72, autoAlpha: 0, scale: 0.975, duration: 1 }, '-=.38');

        if (heroPath) {
          gsap.fromTo(
            heroPath,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.4, delay: 0.32, ease: 'power2.inOut' },
          );
        }
      }

      if (!reduceMotion && finePointer && productStage) {
        const rotateX = gsap.quickTo(productStage, 'rotationX', { duration: 0.55, ease: 'power3.out' });
        const rotateY = gsap.quickTo(productStage, 'rotationY', { duration: 0.55, ease: 'power3.out' });

        const onMove = (event) => {
          const box = productStage.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width - 0.5;
          const y = (event.clientY - box.top) / box.height - 0.5;
          rotateX(y * -2.6);
          rotateY(x * 3.2);
        };
        const onLeave = () => {
          rotateX(0);
          rotateY(0);
        };

        productStage.addEventListener('pointermove', onMove);
        productStage.addEventListener('pointerleave', onLeave);
        cleanupEvents.push(() => {
          productStage.removeEventListener('pointermove', onMove);
          productStage.removeEventListener('pointerleave', onLeave);
        });
      }

      media = gsap.matchMedia();
      media.add('(min-width: 960px)', () => {
        const section = root.querySelector('.qgs-trail');
        const pin = root.querySelector('.qgs-trail-pin');
        const path = root.querySelector('.qgs-trail-path');
        const rail = root.querySelector('.qgs-trail-rail');
        const steps = gsap.utils.toArray('[data-trail-step]', root);
        const panels = gsap.utils.toArray('[data-trail-panel]', root);

        if (!section || !pin || !path || !rail || !steps.length || !panels.length || reduceMotion) {
          return undefined;
        }

        gsap.set(path, { strokeDashoffset: 1 });
        gsap.set(steps, { opacity: 0.32 });
        gsap.set(steps[0], { opacity: 1 });
        gsap.set(panels, { autoAlpha: 0, y: 24 });
        gsap.set(panels[0], { autoAlpha: 1, y: 0 });

        const timePhase = { value: 0 };
        const scrollPhase = { value: 0 };

        const updatePath = () => {
          const d = getWavyPath(scrollPhase.value, timePhase.value);
          path.setAttribute('d', d);
          rail.setAttribute('d', d);
        };

        const waveTween = gsap.to(timePhase, {
          value: Math.PI * 2,
          duration: 4,
          repeat: -1,
          ease: 'none',
          paused: true,
          onUpdate: updatePath,
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + Math.max(window.innerHeight * 1.5, 1200),
            scrub: 0.72,
            pin,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              if (self.isActive) {
                waveTween.play();
              } else {
                waveTween.pause();
              }
            },
          },
        });

        timeline.to(path, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0);
        timeline.to(scrollPhase, { value: Math.PI * 4, duration: 1, ease: 'none' }, 0);

        steps.slice(1).forEach((step, index) => {
          const panelIndex = index + 1;
          const at = (panelIndex / (reviewSteps.length - 1)) * 0.9;
          timeline
            .to(steps[panelIndex - 1], { opacity: 0.32, duration: 0.05 }, at - 0.05)
            .to(panels[panelIndex - 1], { autoAlpha: 0, y: -18, duration: 0.05 }, at - 0.05)
            .to(step, { opacity: 1, duration: 0.05 }, at)
            .fromTo(
              panels[panelIndex],
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, y: 0, duration: 0.08 },
              at
            );
        });

        return () => {
          waveTween.kill();
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set([path, rail, ...steps, ...panels], { clearProps: 'all' });
          const originalD = 'M20 85 C196 85 184 28 365 28 C516 28 527 143 704 143 C872 143 871 61 1080 61';
          path.setAttribute('d', originalD);
          rail.setAttribute('d', originalD);
        };
      });
    }, root);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      window.clearTimeout(refreshId);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
      cleanupEvents.forEach((cleanup) => cleanup());
      if (media) media.revert();
      context.revert();
    };
  }, [rootRef]);
}

function PrimaryLink({ to, children, quiet = false }) {
  return (
    <Link className={quiet ? 'qgs-button qgs-button--quiet' : 'qgs-button qgs-button--primary'} to={to}>
      <span>{children}</span>
      <ArrowRight aria-hidden='true' />
    </Link>
  );
}

function HeroJournalWindow() {
  return (
    <div className='qgs-product-stage' aria-label='Example XAU Journal weekly review'>
      <div className='qgs-window-bar'>
        <div className='qgs-window-brand'>
          <Logo iconSize='w-6 h-6' />
          <span>Weekly review</span>
        </div>
        <span className='qgs-window-demo'>Sample workspace</span>
      </div>

      <div className='qgs-window-body'>
        <aside className='qgs-window-nav' aria-label='Product preview navigation'>
          <span className='qgs-window-nav-label'>Workspace</span>
          {journalNav.map(({ label, icon: Icon, active }) => (
            <div className={active ? 'qgs-window-nav-item is-active' : 'qgs-window-nav-item'} key={label}>
              <Icon aria-hidden='true' />
              <span>{label}</span>
            </div>
          ))}
          <div className='qgs-window-private'>
            <LockKeyhole aria-hidden='true' />
            <span>Private by default</span>
          </div>
        </aside>

        <div className='qgs-window-content'>
          <div className='qgs-window-heading'>
            <div>
              <span className='qgs-overline'>Week 27 / XAUUSD</span>
              <h2>Review before London</h2>
            </div>
            <span className='qgs-ready-dot'>Review ready</span>
          </div>

          <div className='qgs-window-metrics'>
            <div><span>Net result</span><strong>+8.4R</strong><small>Across 9 trades</small></div>
            <div><span>Rule quality</span><strong>7 / 9</strong><small>Two impulse entries</small></div>
            <div><span>Best session</span><strong>London</strong><small>+6.1R this week</small></div>
          </div>

          <div className='qgs-window-grid'>
            <article className='qgs-trades-card'>
              <div className='qgs-card-heading'>
                <div><span>Evidence trail</span><strong>Last three decisions</strong></div>
                <FileText aria-hidden='true' />
              </div>
              <div className='qgs-trade-row'>
                <span className='qgs-side qgs-side--buy'>Buy</span>
                <div><strong>London sweep</strong><small>Waited for confirmation</small></div>
                <strong className='qgs-positive'>+3.2R</strong>
              </div>
              <div className='qgs-trade-row'>
                <span className='qgs-side qgs-side--sell'>Sell</span>
                <div><strong>NY continuation</strong><small>Plan followed</small></div>
                <strong className='qgs-positive'>+2.1R</strong>
              </div>
              <div className='qgs-trade-row'>
                <span className='qgs-side qgs-side--buy'>Buy</span>
                <div><strong>Late impulse</strong><small>Entered before retest</small></div>
                <strong className='qgs-negative'>-1.0R</strong>
              </div>
            </article>

            <article className='qgs-rule-card'>
              <span className='qgs-overline'>Rule for next open</span>
              <Target aria-hidden='true' />
              <h3>Do not enter the first London impulse.</h3>
              <p>Wait for the sweep, retest and a candle close back inside the range.</p>
              <div className='qgs-rule-saved'><Check aria-hidden='true' /> Carried into next session</div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className='qgs-hero' aria-labelledby='landing-hero-heading'>
      <div className='qgs-shell qgs-hero-shell'>
        <div className='qgs-hero-kicker' data-hero-enter>
          <span>XAU Journal</span>
          <span>Built by a developer who trades gold</span>
        </div>

        <h1 id='landing-hero-heading' data-hero-enter>
          <span>Your next <span className='qgs-rgb-highlight'>gold trade</span></span>
          <span>should <span className='qgs-rgb-highlight'>remember</span></span>
          <em>the last one.</em>
        </h1>

        <p className='qgs-hero-copy' data-hero-enter>
          Keep the entry, exit, reason and session in one evidence trail—then open the next market with one rule you can defend.
        </p>

        <div className='qgs-hero-actions' data-hero-enter>
          <PrimaryLink to='/login'>Open your journal</PrimaryLink>
          <a className='qgs-text-link' href='#decision-trail'>
            See the review loop <ArrowDown aria-hidden='true' />
          </a>
        </div>

        <div className='qgs-hero-proof' data-hero-enter aria-label='Product facts'>
          <span><Check aria-hidden='true' /> Manual journal from day one</span>
          <span><Check aria-hidden='true' /> MT4 / MT5 sync on Pro</span>
          <span><Check aria-hidden='true' /> Built around XAUUSD review</span>
        </div>

        <svg className='qgs-hero-thread' viewBox='0 0 1200 230' preserveAspectRatio='none' aria-hidden='true'>
          <path
            className='qgs-hero-thread-path'
            pathLength='1'
            d='M18 24 C174 24 176 148 336 148 C488 148 507 62 650 62 C803 62 812 186 977 186 C1068 186 1116 145 1182 145'
          />
        </svg>

        <HeroJournalWindow />
      </div>
    </section>
  );
}

function TrailPanel({ index }) {
  if (index === 0) {
    return (
      <div className='qgs-trail-ui qgs-capture-ui'>
        <div className='qgs-trail-ui-head'><span>New trade / XAUUSD</span><span>21:42</span></div>
        <div className='qgs-form-line'><span>Session</span><strong>London</strong></div>
        <div className='qgs-form-split'>
          <div><span>Entry</span><strong>2,387.44</strong></div>
          <div><span>Exit</span><strong>2,394.18</strong></div>
          <div><span>Result</span><strong className='qgs-positive'>+3.2R</strong></div>
        </div>
        <div className='qgs-form-note'><span>Setup</span><p>Liquidity sweep, retest, confirmation close.</p></div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className='qgs-trail-ui qgs-context-ui'>
        <div className='qgs-candle-frame' aria-hidden='true'>
          <svg viewBox='0 0 560 210'>
            <path d='M0 156 C82 145 126 164 187 128 C246 92 298 112 356 73 C420 29 472 62 560 24' />
            <g><line x1='90' y1='62' x2='90' y2='166' /><rect x='80' y='92' width='20' height='46' /></g>
            <g><line x1='150' y1='85' x2='150' y2='178' /><rect x='140' y='111' width='20' height='38' /></g>
            <g><line x1='238' y1='52' x2='238' y2='139' /><rect x='228' y='77' width='20' height='43' /></g>
            <g><line x1='330' y1='31' x2='330' y2='118' /><rect x='320' y='55' width='20' height='39' /></g>
            <g><line x1='426' y1='15' x2='426' y2='88' /><rect x='416' y='38' width='20' height='35' /></g>
          </svg>
        </div>
        <div className='qgs-context-note'>
          <span>What I saw</span>
          <strong>Price swept the London low and closed back above the range.</strong>
          <p>Risk stayed at 0.5%. I waited for the close instead of anticipating it.</p>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className='qgs-trail-ui qgs-pattern-ui'>
        <div className='qgs-pattern-summary'>
          <span>Pattern found</span>
          <strong>Impulse entries cost 2.4R this week.</strong>
        </div>
        <div className='qgs-pattern-bars'>
          <div><span>Planned entry</span><i style={{ width: '84%' }} /><strong>+9.8R</strong></div>
          <div><span>Impulse entry</span><i style={{ width: '28%' }} /><strong className='qgs-negative'>-2.4R</strong></div>
          <div><span>Late-session entry</span><i style={{ width: '42%' }} /><strong>+0.7R</strong></div>
        </div>
      </div>
    );
  }

  return (
    <div className='qgs-trail-ui qgs-next-rule-ui'>
      <span className='qgs-overline'>Before the next open</span>
      <Target aria-hidden='true' />
      <blockquote>“No entry on the first impulse. Wait for the sweep, retest and close.”</blockquote>
      <div className='qgs-next-rule-foot'>
        <span>Saved to London session</span>
        <span><Check aria-hidden='true' /> Ready</span>
      </div>
    </div>
  );
}

function DecisionTrail() {
  return (
    <section className='qgs-trail' id='decision-trail' aria-labelledby='decision-trail-heading'>
      <div className='qgs-trail-pin'>
        <div className='qgs-shell qgs-trail-shell'>
          <div className='qgs-trail-heading'>
            <span className='qgs-eyebrow'>The decision trail</span>
            <h2 id='decision-trail-heading'>One <span className='qgs-rgb-highlight'>trade</span>. Four passes. One <span className='qgs-rgb-highlight'>cleaner</span> next decision.</h2>
            <p>Scroll through the after-session ritual. The motion follows the work; it does not compete with it.</p>
          </div>

          <div className='qgs-trail-desktop'>
            <div className='qgs-trail-steps'>
              {reviewSteps.map((step) => (
                <article data-trail-step key={step.number}>
                  <span>{step.number}</span>
                  <div><strong>{step.label}</strong><p>{step.title}</p></div>
                </article>
              ))}
            </div>

            <div className='qgs-trail-stage'>
              <svg viewBox='0 0 1100 170' preserveAspectRatio='none' aria-hidden='true'>
                <path className='qgs-trail-rail' d='M20 85 C196 85 184 28 365 28 C516 28 527 143 704 143 C872 143 871 61 1080 61' />
                <path className='qgs-trail-path' pathLength='1' d='M20 85 C196 85 184 28 365 28 C516 28 527 143 704 143 C872 143 871 61 1080 61' />
              </svg>
              <div className='qgs-trail-panel-stack'>
                {reviewSteps.map((step, index) => (
                  <div data-trail-panel className='qgs-trail-panel' key={step.number}>
                    <div className='qgs-trail-panel-copy'>
                      <span>{step.number} / 04</span>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                    <TrailPanel index={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='qgs-trail-mobile'>
            {reviewSteps.map((step, index) => (
              <article key={step.number}>
                <span className='qgs-trail-mobile-number'>{step.number}</span>
                <div className='qgs-trail-mobile-copy'>
                  <strong>{step.label}</strong>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                <TrailPanel index={index} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TradeRecordVisual() {
  return (
    <div className='qgs-proof-visual qgs-record-visual'>
      <div className='qgs-record-top'><span>Trade 047</span><span className='qgs-positive'>Closed +3.2R</span></div>
      <div className='qgs-record-grid'>
        <div><span>Market</span><strong>XAUUSD</strong></div>
        <div><span>Session</span><strong>London</strong></div>
        <div><span>Risk</span><strong>0.5%</strong></div>
        <div><span>Plan followed</span><strong>Yes</strong></div>
      </div>
      <div className='qgs-record-reason'>
        <span>Reason</span>
        <p>Sweep below the range, rejection, then confirmation close. Entry after retest.</p>
      </div>
      <div className='qgs-record-tags'><span>liquidity sweep</span><span>planned</span><span>patient entry</span></div>
    </div>
  );
}

function PatternVisual() {
  return (
    <div className='qgs-proof-visual qgs-analytics-visual'>
      <div className='qgs-analytics-head'>
        <div><span>30-day review</span><strong>Where performance changes</strong></div>
        <LineChart aria-hidden='true' />
      </div>
      <div className='qgs-session-line'>
        <div><span>London</span><i style={{ width: '88%' }} /></div><strong className='qgs-positive'>+12.4R</strong>
      </div>
      <div className='qgs-session-line'>
        <div><span>New York</span><i style={{ width: '61%' }} /></div><strong>+5.7R</strong>
      </div>
      <div className='qgs-session-line'>
        <div><span>Late session</span><i style={{ width: '24%' }} /></div><strong className='qgs-negative'>-2.1R</strong>
      </div>
      <div className='qgs-analytics-note'><ShieldCheck aria-hidden='true' /><span>Review note: stop trading after the second New York loss.</span></div>
    </div>
  );
}

function SyncVisual() {
  return (
    <div className='qgs-proof-visual qgs-sync-visual'>
      <div className='qgs-sync-line'>
        <span className='qgs-platform-mark'><img src='/mt4.svg' alt='' /></span>
        <div><strong>MetaTrader 4</strong><span>Supported history import</span></div>
        <Check aria-hidden='true' />
      </div>
      <div className='qgs-sync-line'>
        <span className='qgs-platform-mark'><img src='/mt5.svg' alt='' /></span>
        <div><strong>MetaTrader 5</strong><span>Supported history import</span></div>
        <Check aria-hidden='true' />
      </div>
      <div className='qgs-sync-principle'>
        <PlugZap aria-hidden='true' />
        <p><strong>Manual first.</strong> Upgrade when importing broker history gives review time back.</p>
      </div>
    </div>
  );
}

function ProductProof() {
  return (
    <section className='qgs-proof-section' aria-labelledby='proof-heading'>
      <div className='qgs-shell'>
        <header className='qgs-section-heading'>
          <span className='qgs-eyebrow'>Product, not promises</span>
          <h2 id='proof-heading'>The journal keeps the parts your <span className='qgs-rgb-highlight'>broker history cannot</span>.</h2>
          <p>Every screen is built around a decision a gold trader needs to revisit after the market closes.</p>
        </header>

        <div className='qgs-proof-list'>
          <article className='qgs-proof-row'>
            <div className='qgs-proof-copy'>
              <span>01 / The record</span>
              <h3>Facts and <span className='qgs-rgb-highlight'>reasoning</span> live in the same place.</h3>
              <p>A broker can show price and profit. XAU Journal also keeps the session, setup, screenshot context and why you clicked.</p>
            </div>
            <TradeRecordVisual />
          </article>

          <article className='qgs-proof-row qgs-proof-row--reverse'>
            <div className='qgs-proof-copy'>
              <span>02 / The pattern</span>
              <h3>Your week becomes <span className='qgs-rgb-highlight'>readable</span> before it becomes expensive.</h3>
              <p>Compare the sessions and setups that pay you with the habits that quietly return those gains.</p>
            </div>
            <PatternVisual />
          </article>

          <article className='qgs-proof-row'>
            <div className='qgs-proof-copy'>
              <span>03 / The scale</span>
              <h3><span className='qgs-rgb-highlight'>Automation</span> arrives only when it saves real review time.</h3>
              <p>Journal manually from day one. Use Pro sync when supported MT4 or MT5 history becomes too repetitive to enter by hand.</p>
            </div>
            <SyncVisual />
          </article>
        </div>
      </div>
    </section>
  );
}

function FounderStory() {
  return (
    <section className='qgs-founder' aria-labelledby='founder-heading'>
      <div className='qgs-shell qgs-founder-grid'>
        <figure className='qgs-founder-image'>
          <img
            src='/founder-trader-session.webp'
            width='1536'
            height='1024'
            loading='lazy'
            alt='A developer and gold trader reviewing a paper journal beside an XAUUSD chart after the session'
          />
          <figcaption>One desk. Two disciplines. A product shaped by both.</figcaption>
        </figure>

        <div className='qgs-founder-copy'>
          <span className='qgs-eyebrow'>Built from the desk, not the pitch deck</span>
          <h2 id='founder-heading'>I built the <span className='qgs-rgb-highlight'>journal I needed</span> after learning the same lesson twice.</h2>
          <p>I am a developer and a gold trader. XAU Journal started when screenshots, broker history and memory kept disagreeing at the exact moment review mattered.</p>
          <p>Every part of the product answers three practical questions: What did I do? Why did I do it? What must change before the next session?</p>
          <div className='qgs-founder-signature'>
            <span>Gaveen Perera</span>
            <small>Founder, developer and trader</small>
          </div>
          <PrimaryLink to='/the-story' quiet>Read why I built it</PrimaryLink>
        </div>
      </div>
    </section>
  );
}

function Conversion() {
  return (
    <section className='qgs-conversion' aria-labelledby='conversion-heading'>
      <div className='qgs-shell'>
        <div className='qgs-conversion-main'>
          <span className='qgs-eyebrow'>A clear place to begin</span>
          <h2 id='conversion-heading'>Start with the <span className='qgs-rgb-highlight'>habit</span>. Pay only when automation earns its place.</h2>
          <p>Log today’s trades manually. Move to Pro when MT4 or MT5 sync gives enough time back to make the upgrade obvious.</p>
          <div className='qgs-conversion-actions'>
            <PrimaryLink to='/login'>Start your first review</PrimaryLink>
            <PrimaryLink to='/pricing' quiet>Compare plans</PrimaryLink>
          </div>
        </div>

        <div className='qgs-conversion-rail' aria-label='Conversion path'>
          <div><span>Today</span><strong>Journal the first trade</strong></div>
          <div><span>As volume grows</span><strong>Connect supported history</strong></div>
          <div><span>Every session</span><strong>Carry one rule forward</strong></div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className='qgs-faq' aria-labelledby='faq-heading'>
      <div className='qgs-shell qgs-faq-grid'>
        <header className='qgs-section-heading'>
          <span className='qgs-eyebrow'>Before you commit</span>
          <h2 id='faq-heading'>Questions a <span className='qgs-rgb-highlight'>serious trader</span> should ask.</h2>
        </header>
        <div className='qgs-faq-list'>
          {LANDING_FAQ.slice(0, 4).map((item, index) => (
            <details key={item.q} open={index === 0}>
              <summary><span>0{index + 1}</span>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const rootRef = useRef(null);
  const { isLightMode } = useAppTheme();

  useLandingSchemas();
  useLandingMotion(rootRef);

  return (
    <>
      <PublicNavbar />
      <main ref={rootRef} className='qgs-page' style={isLightMode ? themes.light : themes.dark}>
        <Hero />
        <DecisionTrail />
        <ProductProof />
        <FounderStory />
        <Conversion />
        <FAQ />
        <PublicFooter className='qgs-footer' />
      </main>
    </>
  );
}
