import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  LockKeyhole,
  Target,
} from 'lucide-react';

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

const REVIEW_STEPS = [
  {
    number: '01',
    title: 'Capture it before memory edits it.',
    body: 'Save the entry, exit, session, risk, screenshot and reason while the chart is still fresh.',
    note: 'Two minutes after the close',
  },
  {
    number: '02',
    title: 'Compare process, not just profit.',
    body: 'Read setups and sessions together so a profitable mistake cannot hide inside the weekly result.',
    note: 'At the end of the session',
  },
  {
    number: '03',
    title: 'Carry one rule into tomorrow.',
    body: 'Turn the review into a sentence you can follow before the next London or New York open.',
    note: 'Before the next entry',
  },
];

const PRODUCT_NAV = [
  { label: 'Overview', Icon: BarChart3 },
  { label: 'Calendar', Icon: CalendarDays },
  { label: 'Journal', Icon: BookOpen, active: true },
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

function ActionLink({ to, children, secondary = false }) {
  return (
    <Link className={secondary ? 'xdl-action xdl-action--secondary' : 'xdl-action xdl-action--primary'} to={to}>
      <span>{children}</span>
      <ArrowRight aria-hidden='true' />
    </Link>
  );
}

function MarketTrace() {
  return (
    <svg className='xdl-market-trace' viewBox='0 0 640 220' role='img' aria-labelledby='trace-title trace-description'>
      <title id='trace-title'>Sample XAUUSD trade chart</title>
      <desc id='trace-description'>Price sweeps a session low, recovers, and reaches the marked exit after an early entry.</desc>
      <g className='xdl-chart-grid' aria-hidden='true'>
        <path d='M0 44H640M0 88H640M0 132H640M0 176H640' />
        <path d='M80 0V220M160 0V220M240 0V220M320 0V220M400 0V220M480 0V220M560 0V220' />
      </g>
      <path className='xdl-trace-path' pathLength='1' d='M0 155 C42 148 59 178 96 161 S151 106 189 126 S248 172 282 132 S329 72 371 91 S430 126 468 82 S536 26 576 47 S612 64 640 29' />
      <path className='xdl-trace-plan' d='M282 132 L371 91' />
      <g className='xdl-trace-point xdl-trace-entry'>
        <circle cx='282' cy='132' r='7' />
        <text x='294' y='151'>early entry</text>
      </g>
      <g className='xdl-trace-point xdl-trace-exit'>
        <circle cx='640' cy='29' r='7' />
        <text x='548' y='22'>exit +1.18R</text>
      </g>
    </svg>
  );
}

function DebriefSheet() {
  return (
    <article className='xdl-debrief' aria-label='Sample XAUUSD post-trade debrief'>
      <header className='xdl-debrief-head'>
        <div><span>POST-TRADE DEBRIEF</span><strong>REVIEW / 0047</strong></div>
        <div className='xdl-assay-mark' aria-label='Process marked for review'>
          <span>PROCESS</span><strong>REVIEW</strong><small>XAU / USD</small>
        </div>
      </header>

      <div className='xdl-debrief-facts'>
        <div><span>Market</span><strong>XAU / USD</strong></div>
        <div><span>Session</span><strong>London</strong></div>
        <div><span>Risk</span><strong>0.50%</strong></div>
        <div><span>Result</span><strong className='is-positive'>+1.18R</strong></div>
      </div>

      <div className='xdl-debrief-chart'>
        <div className='xdl-chart-axis'><span>2394.18</span><span>2387.44</span></div>
        <MarketTrace />
      </div>

      <div className='xdl-process-check'>
        <span>Did I follow the entry plan?</span>
        <strong>No — entered before the 5m close.</strong>
      </div>

      <div className='xdl-next-rule'>
        <Target aria-hidden='true' />
        <div><span>RULE FOR TOMORROW</span><strong>Wait for price to close back inside the range before entering.</strong></div>
      </div>
    </article>
  );
}

function Hero() {
  return (
    <section className='xdl-hero' aria-labelledby='landing-hero-heading'>
      <div className='xdl-hero-code' aria-hidden='true'>XAU / USD</div>
      <div className='xdl-shell xdl-hero-grid'>
        <div className='xdl-hero-copy'>
          <p className='xdl-kicker'><span>01</span> For forex traders who take gold seriously</p>
          <h1 id='landing-hero-heading'>The trade is closed.<br /><em>The lesson isn’t.</em></h1>
          <p className='xdl-hero-lede'>Record the setup while the candle, hesitation and mistake are still fresh. XAU Journal keeps the chart, session, risk and reason together—then gives tomorrow one clear rule.</p>
          <div className='xdl-hero-actions'>
            <ActionLink to='/login?mode=signup'>Start the free journal</ActionLink>
            <a className='xdl-inline-link' href='#method'>See the review method <ArrowRight aria-hidden='true' /></a>
          </div>
          <div className='xdl-hero-facts' aria-label='Product facts'>
            <span><Check aria-hidden='true' /> Unlimited manual trades on Free</span>
            <span><Check aria-hidden='true' /> MT4 / MT5 sync on Pro</span>
            <span><Check aria-hidden='true' /> Private account workspace</span>
          </div>
        </div>
        <div className='xdl-hero-art'>
          <DebriefSheet />
          <p className='xdl-hero-caption'><span>Sample review</span> Profit is a result. Process is the evidence.</p>
        </div>
      </div>
    </section>
  );
}

function EvidenceSection() {
  return (
    <section className='xdl-evidence' aria-labelledby='evidence-heading'>
      <div className='xdl-shell'>
        <div className='xdl-section-intro xdl-section-intro--split'>
          <p className='xdl-kicker'><span>02</span> Same trade. Different truth.</p>
          <div>
            <h2 id='evidence-heading'>Your broker records the fill.<br />It cannot record the decision.</h2>
            <p>Broker history answers what happened. A useful journal preserves why it happened and what you will do differently.</p>
          </div>
        </div>

        <div className='xdl-ledger-compare' role='table' aria-label='Broker history compared with a trade review'>
          <div className='xdl-ledger-head' role='row'><span role='columnheader'>Broker history</span><span role='columnheader'>Your review</span></div>
          <div className='xdl-ledger-row' role='row'><span role='cell'>Entry 2,387.44 → Exit 2,394.18</span><strong role='cell'>Entered before confirmation closed.</strong></div>
          <div className='xdl-ledger-row' role='row'><span role='cell'>Result +1.18R</span><strong role='cell'>Profitable outcome. Unrepeatable process.</strong></div>
          <div className='xdl-ledger-row' role='row'><span role='cell'>Closed 14:32</span><strong role='cell'>Tomorrow: wait for the 5m close.</strong></div>
        </div>
      </div>
    </section>
  );
}

function ReviewMethod() {
  return (
    <section id='method' className='xdl-method' aria-labelledby='method-heading'>
      <div className='xdl-shell'>
        <header className='xdl-method-heading'>
          <p className='xdl-kicker'><span>03</span> The after-session method</p>
          <h2 id='method-heading'>A review that ends with a decision.</h2>
        </header>
        <div className='xdl-method-list'>
          {REVIEW_STEPS.map((step) => (
            <article className='xdl-method-step' key={step.number}>
              <span className='xdl-method-number'>{step.number}</span>
              <div><h3>{step.title}</h3><p>{step.body}</p></div>
              <small>{step.note}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductWindow() {
  return (
    <div className='xdl-product-window' aria-label='Sample XAU Journal weekly review workspace'>
      <div className='xdl-product-topbar'>
        <div><XauEmblem className='xdl-product-emblem' /><strong>XAU Journal</strong></div>
        <span>Sample workspace / Week 27</span>
      </div>
      <div className='xdl-product-body'>
        <aside className='xdl-product-nav' aria-label='Product preview navigation'>
          <span>WORKSPACE</span>
          {PRODUCT_NAV.map(({ label, Icon, active }) => (
            <div className={active ? 'is-active' : ''} key={label}><Icon aria-hidden='true' /> {label}</div>
          ))}
          <p><LockKeyhole aria-hidden='true' /> Private by default</p>
        </aside>

        <div className='xdl-product-main'>
          <header className='xdl-product-heading'>
            <div><span>WEEKLY DEBRIEF</span><h3>Review before London</h3></div>
            <small><i /> Review ready</small>
          </header>

          <div className='xdl-product-metrics'>
            <div><span>Net result</span><strong>+8.4R</strong><small>9 closed trades</small></div>
            <div><span>Plan followed</span><strong>7 / 9</strong><small>Two early entries</small></div>
            <div><span>Best session</span><strong>London</strong><small>+6.1R this week</small></div>
          </div>

          <div className='xdl-product-content'>
            <div className='xdl-product-trades'>
              <header><span>LAST DECISIONS</span><strong>Process beside result</strong></header>
              <div><span className='is-buy'>BUY</span><p><strong>London sweep</strong><small>Waited for confirmation</small></p><b className='is-positive'>+3.2R</b></div>
              <div><span className='is-sell'>SELL</span><p><strong>NY continuation</strong><small>Plan followed</small></p><b className='is-positive'>+2.1R</b></div>
              <div><span className='is-buy'>BUY</span><p><strong>Late impulse</strong><small>Entered before retest</small></p><b className='is-negative'>−1.0R</b></div>
            </div>

            <aside className='xdl-product-rule'>
              <Target aria-hidden='true' />
              <span>NEXT-SESSION RULE</span>
              <strong>Do not enter the first London impulse.</strong>
              <p>Wait for the sweep, retest and a candle close back inside the range.</p>
              <small><Check aria-hidden='true' /> Saved for tomorrow</small>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSection() {
  return (
    <section id='journal' className='xdl-product' aria-labelledby='product-heading'>
      <div className='xdl-shell'>
        <div className='xdl-section-intro xdl-section-intro--product'>
          <div><p className='xdl-kicker'><span>04</span> The journal at work</p><h2 id='product-heading'>See the week.<br />Not just the winners.</h2></div>
          <p>Results, rule quality and session behavior sit in the same review. The point is not more data. It is knowing which decision deserves to repeat.</p>
        </div>
        <ProductWindow />
        <div className='xdl-product-notes'>
          <div><strong>Manual from day one.</strong><span>Unlimited trade logging, calendar and core P&amp;L are available on Free.</span></div>
          <div><strong>Automation when it earns its place.</strong><span>Pro adds MT4/MT5 import and the full analytics suite.</span></div>
          <div><strong>Review stays private.</strong><span>Your workspace is account-scoped and broker sync starts only when you connect it.</span></div>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className='xdl-audience' aria-labelledby='audience-heading'>
      <div className='xdl-shell'>
        <p className='xdl-kicker'><span>05</span> Built for the desk you actually trade</p>
        <h2 id='audience-heading'>Gold first.<br />Forex discipline throughout.</h2>
        <div className='xdl-audience-rows'>
          <article>
            <span>XAU / GOLD TRADERS</span>
            <h3>Keep London, New York and your risk decisions visible.</h3>
            <p>XAU Journal is calibrated around gold: XAUUSD records, session review, screenshots, P&amp;L and the repeated habits that volatility exposes.</p>
          </article>
          <article>
            <span>FOREX TRADERS WITH GOLD ON THE DESK</span>
            <h3>Use one review discipline across the week.</h3>
            <p>If you trade majors alongside gold, the same questions still matter: Was the setup valid? Was risk respected? Which rule follows you into the next session?</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className='xdl-founder' aria-labelledby='founder-heading'>
      <div className='xdl-shell xdl-founder-grid'>
        <figure className='xdl-founder-image'>
          <img src='/founder-trader-session.webp' width='1536' height='1024' loading='lazy' alt='A developer and gold trader reviewing a paper journal beside an XAUUSD chart after the session' />
          <figcaption>Built after the session, not in a pitch meeting.</figcaption>
        </figure>
        <div className='xdl-founder-copy'>
          <p className='xdl-kicker'><span>06</span> Founder / developer / trader</p>
          <h2 id='founder-heading'>I built the screen I needed after making money for the wrong reason.</h2>
          <blockquote>“The broker showed a profit. My notes showed an early entry. I needed both truths in one place.”</blockquote>
          <p>XAU Journal began as a nightly review tool: enough structure to make the lesson survive, without turning the session into admin work.</p>
          <div className='xdl-founder-signature'><strong>Gaveen Perera</strong><span>Founder, developer and gold trader</span></div>
          <ActionLink to='/the-story' secondary>Read the full story</ActionLink>
        </div>
      </div>
    </section>
  );
}

function ConversionSection() {
  return (
    <section className='xdl-conversion' aria-labelledby='conversion-heading'>
      <div className='xdl-shell xdl-conversion-grid'>
        <div>
          <p className='xdl-kicker'><span>07</span> Start with today’s last trade</p>
          <h2 id='conversion-heading'>One honest review is enough to begin.</h2>
          <p>Log manually for free. Add automation only when it gives real review time back.</p>
          <div className='xdl-conversion-actions'>
            <ActionLink to='/login?mode=signup'>Start the free journal</ActionLink>
            <Link to='/pricing'>Compare Free and Pro <ArrowRight aria-hidden='true' /></Link>
          </div>
        </div>
        <div className='xdl-plan-ledger' aria-label='Free and Pro plan overview'>
          <div><span>FREE</span><strong>Unlimited manual journaling</strong><p>Calendar, notes and core P&amp;L. No card needed to begin.</p></div>
          <div><span>PRO</span><strong>MT4 / MT5 sync + full analytics</strong><p>For active traders who want less entry work and deeper review.</p></div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className='xdl-faq' aria-labelledby='faq-heading'>
      <div className='xdl-shell xdl-faq-grid'>
        <div><p className='xdl-kicker'><span>08</span> Before you begin</p><h2 id='faq-heading'>Direct answers.<br />No sales fog.</h2></div>
        <div className='xdl-faq-list'>
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

  return (
    <>
      <PublicNavbar />
      <div className='xdl-site' data-ux-skip='true'>
        <main className='xdl-page' data-ux-skip='true'>
          <Hero />
          <EvidenceSection />
          <ReviewMethod />
          <ProductSection />
          <AudienceSection />
          <FounderSection />
          <ConversionSection />
          <FAQSection />
        </main>
      </div>
      <PublicFooter className='qgs-footer' />
    </>
  );
}