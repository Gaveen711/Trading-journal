import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Code2,
  Image,
  NotebookPen,
  PlugZap,
} from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import './TheStoryPage.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const STORY_SCENES = [
  {
    number: '01',
    label: '14:32 / The result',
    title: 'The trade was profitable.',
    body: 'It made +1.18R. I still could not tell whether it was a good trade.',
  },
  {
    number: '02',
    label: '22:47 / The review',
    title: 'Profit answered the wrong question.',
    body: 'The result said yes. The process said I entered before confirmation. Broker history could not hold both truths.',
  },
  {
    number: '03',
    label: 'The ritual',
    title: 'Every review began by rebuilding the trade.',
    body: 'History here. Screenshot there. Notes somewhere else. By the time the evidence met, memory had already edited it.',
  },
  {
    number: '04',
    label: 'The repeat',
    title: 'Then the same lesson returned.',
    body: 'A second profitable trade carried the same early entry. The review system was too fragile to make the lesson survive.',
  },
  {
    number: '05',
    label: 'The decision',
    title: 'Software was not the idea.',
    body: 'A repeatable review loop was: capture the facts, keep the reason, compare what repeats, and carry one rule forward.',
  },
  {
    number: '06',
    label: 'The first build',
    title: 'One nightly screen became the product.',
    body: 'I built the smallest version I would use after a long session. When the loop held up, it became XAU Journal—a focused SaaS tool for serious review.',
  },
  {
    number: '07',
    label: 'The purpose',
    title: 'Make the lesson survive tomorrow.',
    body: 'The product exists to shorten the distance between a closed trade and an honest next decision.',
  },
];

const REVIEW_JOBS = [
  ['01', 'Capture', 'Execution without retyping it'],
  ['02', 'Context', 'The reason beside the result'],
  ['03', 'Compare', 'Patterns across real sessions'],
  ['04', 'Carry', 'One rule into the next trade'],
];

function MarketTrace({ quiet = false }) {
  return (
    <svg className={'xjs-trace' + (quiet ? ' is-quiet' : '')} viewBox="0 0 560 190" role="img" aria-label="A simplified XAUUSD market trace">
      <g className="xjs-chart-grid">
        <path d="M0 38H560M0 76H560M0 114H560M0 152H560" />
        <path d="M70 0V190M140 0V190M210 0V190M280 0V190M350 0V190M420 0V190M490 0V190" />
      </g>
      <path className="xjs-trace-line" d="M0 145 C28 142 32 126 58 130 S91 153 118 123 S153 92 179 102 S212 132 242 105 S276 59 305 69 S337 95 365 71 S397 27 426 38 S456 74 483 48 S523 13 560 28" />
      <circle className="xjs-trace-point is-entry" cx="305" cy="69" r="5" />
      <circle className="xjs-trace-point is-exit" cx="560" cy="28" r="5" />
    </svg>
  );
}

function TradeTicket({ annotated = false, repeat = false }) {
  return (
    <div className={'xjs-trade-ticket' + (repeat ? ' is-repeat' : '')}>
      <div className="xjs-ticket-head">
        <div>
          <span>{repeat ? '21 May / 15:08' : '14 May / 14:32'}</span>
          <strong>XAUUSD</strong>
        </div>
        <span className="xjs-ticket-status">Closed</span>
      </div>
      <MarketTrace quiet={repeat} />
      <div className="xjs-ticket-data">
        <div><span>Result</span><strong className="is-positive">{repeat ? '+0.74R' : '+1.18R'}</strong></div>
        <div><span>Setup</span><strong>Retest</strong></div>
        <div><span>Session</span><strong>London</strong></div>
      </div>
      <div className="xjs-ticket-why">
        <span>Why this trade?</span>
        <strong>{annotated || repeat ? 'Entered before confirmation' : 'Not recorded'}</strong>
      </div>
      {(annotated || repeat) && <div className="xjs-ticket-mark">Same process leak</div>}
    </div>
  );
}

function EvidencePieces({ mobile = false }) {
  return (
    <div className={'xjs-evidence-pieces' + (mobile ? ' is-mobile' : '')}>
      <div className="xjs-piece xjs-piece-history">
        <span>Broker history</span>
        <strong>+ $218.40</strong>
        <small>Reason: —</small>
      </div>
      <div className="xjs-piece xjs-piece-chart">
        <span>Screenshot_1432</span>
        <MarketTrace quiet />
      </div>
      <div className="xjs-piece xjs-piece-note">
        <NotebookPen aria-hidden="true" />
        <span>Desk note</span>
        <p>Waited for the retest.<br />Entered too early?</p>
      </div>
      <div className="xjs-piece xjs-piece-sheet">
        <span>Review.xlsx</span>
        <div><i /> Date</div>
        <div><i /> Result</div>
        <div><i /> Setup</div>
        <div className="is-empty"><i /> Lesson</div>
      </div>
    </div>
  );
}

function ReviewBlueprint({ mobile = false }) {
  return (
    <div className={'xjs-blueprint' + (mobile ? ' is-mobile' : '')}>
      <div className="xjs-blueprint-core">
        <Code2 aria-hidden="true" />
        <span>The review loop</span>
      </div>
      {REVIEW_JOBS.map(([number, title, detail]) => (
        <div className="xjs-build-node" key={title}>
          <span>{number}</span>
          <div><strong>{title}</strong><small>{detail}</small></div>
        </div>
      ))}
    </div>
  );
}

function ProductWindow({ final = false }) {
  return (
    <div className={'xjs-product-window' + (final ? ' is-final' : '')}>
      <div className="xjs-product-bar">
        <strong>Xau Journal.</strong>
        <div><span /> <span /> <span /></div>
        <small>Private workspace</small>
      </div>
      <div className="xjs-product-body">
        <aside>
          <span className="is-active">J</span>
          <span>A</span>
          <span>H</span>
        </aside>
        <div className="xjs-product-main">
          <div className="xjs-product-heading">
            <div><span>Trade review / #042</span><strong>XAUUSD · London</strong></div>
            <span className="xjs-reviewed"><Check aria-hidden="true" /> Reviewed</span>
          </div>
          <div className="xjs-product-trade">
            <div className="xjs-product-chart"><MarketTrace /></div>
            <div className="xjs-product-context">
              <span>Context preserved</span>
              <p>Retest setup. Entry taken before the confirmation candle closed.</p>
              <div><Image aria-hidden="true" /> Screenshot attached</div>
            </div>
          </div>
          <div className="xjs-product-rule">
            <span>Rule for the next session</span>
            <strong>Wait for the close. No exceptions.</strong>
          </div>
          <div className="xjs-product-sync"><PlugZap aria-hidden="true" /> MT4 / MT5 capture removes the admin—not the thinking.</div>
        </div>
      </div>
      <div className="xjs-final-brief">
        <span>Next session brief</span>
        <strong>The result is stored.<br />The lesson is ready.</strong>
        <p>Review complete / London session</p>
      </div>
    </div>
  );
}

function DesktopWorkbench() {
  return (
    <div className="xjs-bench-canvas" aria-hidden="true">
      <div className="xjs-bench-grid" />
      <svg className="xjs-evidence-thread" viewBox="0 0 760 600" preserveAspectRatio="none">
        <path pathLength="1" d="M92 292 C180 84 315 92 363 218 C410 342 520 480 668 304" />
      </svg>
      <span className="xjs-thread-head" />

      <div className="xjs-primary-ticket"><TradeTicket /></div>
      <div className="xjs-process-callout">
        <span>Result</span><strong>Profitable</strong>
        <i />
        <span>Process</span><strong>Entered early</strong>
      </div>

      <div className="xjs-desktop-pieces"><EvidencePieces /></div>
      <div className="xjs-repeat-ticket"><TradeTicket annotated repeat /></div>
      <div className="xjs-repeat-caption">One week later.<br />The same lesson.</div>

      <div className="xjs-desktop-blueprint"><ReviewBlueprint /></div>
      <div className="xjs-desktop-product"><ProductWindow /></div>
    </div>
  );
}

function MobileArtifact({ index }) {
  if (index === 0) return <TradeTicket />;
  if (index === 1) return <TradeTicket annotated />;
  if (index === 2) return <EvidencePieces mobile />;
  if (index === 3) {
    return (
      <div className="xjs-mobile-repeat">
        <TradeTicket annotated />
        <TradeTicket annotated repeat />
      </div>
    );
  }
  if (index === 4) return <ReviewBlueprint mobile />;
  if (index === 5) return <ProductWindow />;
  return <ProductWindow final />;
}

function useStoryMotion(pageRef, storyRef, pinRef) {
  useLayoutEffect(() => {
    const root = pageRef.current;
    const story = storyRef.current;
    const pin = pinRef.current;
    if (!root || !story || !pin || typeof window === 'undefined') return undefined;

    window.scrollTo(0, 0);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;
    let context;
    let media;
    let firstFrame = 0;
    let secondFrame = 0;
    let settleTimer = 0;
    let viewportTimer = 0;

    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    const scheduleRefresh = () => {
      if (cancelled) return;
      window.clearTimeout(viewportTimer);
      viewportTimer = window.setTimeout(refresh, 140);
    };

    const init = () => {
      if (cancelled) return;

      context = gsap.context(() => {
        const heroItems = gsap.utils.toArray('[data-story-intro]', root);

        if (!reducedMotion) {
          gsap.from(heroItems, {
            autoAlpha: 0,
            y: 26,
            duration: 0.72,
            stagger: 0.08,
            ease: 'power3.out',
          });

          gsap.to(root.querySelector('.xjs-opening-time'), {
            yPercent: 16,
            ease: 'none',
            scrollTrigger: {
              trigger: root.querySelector('.xjs-opening'),
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          });
        }

        media = gsap.matchMedia();
        media.add('(min-width: 900px)', () => {
          if (reducedMotion) return undefined;

          const captions = gsap.utils.toArray('[data-story-caption]', root);
          const markers = gsap.utils.toArray('[data-story-marker]', root);
          const pieces = gsap.utils.toArray('.xjs-piece', root);
          const nodes = gsap.utils.toArray('.xjs-build-node', root);
          const thread = root.querySelector('.xjs-evidence-thread path');
          const threadHead = root.querySelector('.xjs-thread-head');
          const ticket = root.querySelector('.xjs-primary-ticket');
          const callout = root.querySelector('.xjs-process-callout');
          const repeatTicket = root.querySelector('.xjs-repeat-ticket');
          const repeatCaption = root.querySelector('.xjs-repeat-caption');
          const blueprint = root.querySelector('.xjs-desktop-blueprint');
          const blueprintCore = root.querySelector('.xjs-blueprint-core');
          const product = root.querySelector('.xjs-desktop-product');
          const productWindow = product?.querySelector('.xjs-product-window');
          const productBody = product?.querySelector('.xjs-product-body');
          const finalBrief = product?.querySelector('.xjs-final-brief');
          const trackFill = root.querySelector('.xjs-story-track-fill');

          if (!captions.length || !ticket || !productWindow || !thread) return undefined;

          gsap.set(captions, { autoAlpha: 0, y: 28, pointerEvents: 'none' });
          gsap.set(captions[0], { autoAlpha: 1, y: 0, pointerEvents: 'auto' });
          gsap.set(markers, { opacity: 0.28 });
          gsap.set(markers[0], { opacity: 1 });
          gsap.set(callout, { autoAlpha: 0, y: 18 });
          gsap.set(pieces, { autoAlpha: 0, y: 28, scale: 0.9 });
          gsap.set([repeatTicket, repeatCaption], { autoAlpha: 0, y: 22 });
          gsap.set(blueprint, { autoAlpha: 0, scale: 0.92 });
          gsap.set([blueprintCore, ...nodes], { autoAlpha: 0, scale: 0.82 });
          gsap.set(thread, { strokeDashoffset: 1 });
          gsap.set(threadHead, { autoAlpha: 0, x: 80, y: 275 });
          gsap.set(product, { autoAlpha: 0, y: 34, scale: 0.9 });
          gsap.set(finalBrief, { autoAlpha: 0, y: 24 });
          gsap.set(trackFill, { scaleX: 0 });

          const timeline = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: {
              trigger: story,
              start: 'top top',
              end: () => '+=' + Math.max(window.innerHeight * (captions.length - 1) * 0.94, 3600),
              scrub: 0.72,
              pin,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          const showCaption = (index, at) => {
            timeline
              .to(captions[index - 1], { autoAlpha: 0, y: -20, pointerEvents: 'none', duration: 0.12 }, at)
              .to(markers[index - 1], { opacity: 0.28, duration: 0.08 }, at)
              .to(captions[index], { autoAlpha: 1, y: 0, pointerEvents: 'auto', duration: 0.16, ease: 'power3.out' }, at + 0.14)
              .to(markers[index], { opacity: 1, duration: 0.1 }, at + 0.14);
          };

          timeline.to(trackFill, { scaleX: 1, duration: 6.4, ease: 'none' }, 0);

          showCaption(1, 0.78);
          timeline
            .to(callout, { autoAlpha: 1, y: 0, duration: 0.24 }, 0.92)
            .to(ticket, { scale: 0.96, duration: 0.35 }, 0.9);

          showCaption(2, 1.72);
          timeline
            .to(ticket, { x: -188, y: 125, scale: 0.58, rotation: -4, opacity: 0.45, duration: 0.42 }, 1.86)
            .to(callout, { autoAlpha: 0, y: -18, duration: 0.16 }, 1.78)
            .to(pieces, { autoAlpha: 1, y: 0, scale: 1, duration: 0.34, stagger: 0.04 }, 1.94);

          showCaption(3, 2.68);
          timeline
            .to(repeatTicket, { autoAlpha: 1, y: 0, rotation: 3, duration: 0.32 }, 2.83)
            .to(repeatCaption, { autoAlpha: 1, y: 0, duration: 0.24 }, 2.96)
            .to(pieces, { opacity: 0.62, duration: 0.22 }, 2.9);

          showCaption(4, 3.64);
          timeline
            .to([repeatTicket, repeatCaption, ticket], { autoAlpha: 0, duration: 0.18 }, 3.7)
            .to(pieces, { opacity: 0.26, scale: 0.92, duration: 0.28 }, 3.74)
            .to(blueprint, { autoAlpha: 1, scale: 1, duration: 0.32 }, 3.82)
            .to(thread, { strokeDashoffset: 0, duration: 0.7, ease: 'none' }, 3.78)
            .to(threadHead, { autoAlpha: 1, duration: 0.08 }, 3.8)
            .to(threadHead, { x: 344, y: 198, duration: 0.24 }, 3.86)
            .to(threadHead, { x: 502, y: 416, duration: 0.24 }, 4.1)
            .to(threadHead, { x: 650, y: 284, duration: 0.22 }, 4.34)
            .to([blueprintCore, ...nodes], { autoAlpha: 1, scale: 1, duration: 0.28, stagger: 0.05 }, 3.94);

          showCaption(5, 4.74);
          timeline
            .to([blueprint, threadHead], { autoAlpha: 0, scale: 0.9, duration: 0.24 }, 4.84)
            .to(thread, { opacity: 0.18, duration: 0.2 }, 4.82)
            .to(pieces, { autoAlpha: 0, scale: 0.78, duration: 0.24, stagger: 0.02 }, 4.84)
            .to(product, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'power3.out' }, 4.96);

          showCaption(6, 5.72);
          timeline
            .to(productBody, { opacity: 0.16, scale: 0.985, duration: 0.26 }, 5.84)
            .to(finalBrief, { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power3.out' }, 5.96)
            .to(productWindow, { scale: 0.97, duration: 0.34 }, 5.9);

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
          };
        });
      }, root);

      root.dataset.motionReady = 'true';
      ScrollTrigger.sort();
      refresh();
      settleTimer = window.setTimeout(refresh, 420);
    };

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(init);
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleRefresh).catch(() => undefined);
    }

    const onLoad = () => scheduleRefresh();
    if (document.readyState === 'complete') {
      scheduleRefresh();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }

    window.visualViewport?.addEventListener('resize', scheduleRefresh);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(settleTimer);
      window.clearTimeout(viewportTimer);
      window.removeEventListener('load', onLoad);
      window.visualViewport?.removeEventListener('resize', scheduleRefresh);
      media?.revert();
      context?.revert();
      delete root.dataset.motionReady;
    };
  }, [pageRef, storyRef, pinRef]);
}

export default function TheStoryPage() {
  const pageRef = useRef(null);
  const storyRef = useRef(null);
  const pinRef = useRef(null);

  useStoryMotion(pageRef, storyRef, pinRef);

  return (
    <div ref={pageRef} className="xjs-page" data-ux-skip="true">
      <PublicNavbar />

      <main className="story-page" data-ux-skip="true">
        <section className="xjs-opening" aria-labelledby="story-heading">
          <div className="xjs-shell xjs-opening-grid">
            <div className="xjs-opening-copy">
              <p className="xjs-kicker" data-story-intro><span>00</span> The origin / one trade</p>
              <h1 id="story-heading" data-story-intro>The trade was profitable.<br />The lesson nearly disappeared.</h1>
              <p className="xjs-opening-lede" data-story-intro>This is how a failed review ritual became XAU Journal.</p>
            </div>
            <div className="xjs-opening-time" data-story-intro aria-hidden="true">
              <span>Closed</span>
              <strong>14:32</strong>
              <small>XAUUSD / +1.18R</small>
            </div>
            <div className="xjs-scroll-cue" data-story-intro aria-hidden="true"><ArrowDown /> Follow the evidence</div>
          </div>
        </section>

        <section ref={storyRef} className="xjs-workbench" aria-label="How one trade became XAU Journal">
          <div ref={pinRef} className="xjs-workbench-pin">
            <div className="xjs-casebar">
              <span>Case 001</span>
              <strong>One trade → one product</strong>
              <span>XAUUSD / London</span>
            </div>

            <div className="xjs-shell xjs-workbench-grid">
              <div className="xjs-caption-stage">
                {STORY_SCENES.map((scene) => (
                  <article className="xjs-caption" data-story-caption key={scene.number}>
                    <p className="xjs-kicker"><span>{scene.number}</span> {scene.label}</p>
                    <h2>{scene.title}</h2>
                    <p>{scene.body}</p>
                  </article>
                ))}
              </div>
              <DesktopWorkbench />
            </div>

            <div className="xjs-story-track" aria-hidden="true">
              <div className="xjs-story-track-line"><span className="xjs-story-track-fill" /></div>
              {STORY_SCENES.map((scene) => (
                <span data-story-marker key={scene.number}>{scene.number}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="xjs-mobile-story" aria-label="How one trade became XAU Journal on mobile">
          <div className="xjs-shell">
            {STORY_SCENES.map((scene, index) => (
              <article className="xjs-mobile-chapter" key={scene.number}>
                <div>
                  <p className="xjs-kicker"><span>{scene.number}</span> {scene.label}</p>
                  <h2>{scene.title}</h2>
                  <p>{scene.body}</p>
                </div>
                <div className="xjs-mobile-artifact" aria-hidden="true"><MobileArtifact index={index} /></div>
              </article>
            ))}
          </div>
        </section>

        <section className="xjs-conviction" aria-labelledby="conviction-heading">
          <div className="xjs-shell xjs-conviction-grid">
            <div>
              <p className="xjs-kicker"><span>08</span> What the company protects</p>
              <h2 id="conviction-heading">A journal should preserve the truth of the trade.</h2>
            </div>
            <div className="xjs-conviction-rail">
              <p>Not a scoreboard. <strong>Process beside outcome.</strong></p>
              <p>Not a broker replacement. <strong>A place to understand what the broker records.</strong></p>
              <p>Not automation for its own sake. <strong>Less admin. More honest review.</strong></p>
            </div>
          </div>
        </section>

        <section className="xjs-close" aria-labelledby="close-heading">
          <div className="xjs-shell xjs-close-inner">
            <p className="xjs-kicker"><span>09</span> Your next session</p>
            <h2 id="close-heading">Your next trade will add a result.<br />Make sure it also leaves a lesson.</h2>
            <div className="xjs-actions">
              <Link className="xjs-button xjs-button-primary" to="/login">Review your first trade <ArrowRight aria-hidden="true" /></Link>
              <Link className="xjs-button xjs-button-secondary" to="/pricing">Compare plans</Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
