import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { ProTermsModal } from '../components/ProTermsModal';
import { CTAButton, CTALink, SectionHead } from '../components/PublicSite';
import { useDeskReveal } from '../lib/goldSessions';
import { AppServicesProvider } from '../app/di/AppServicesContext';
import { auth } from '../firebaseAuth';
import { useSubscription } from '../hooks/useSubscription';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY, PRO_YEARLY_MONTHLY_DISPLAY, PRO_YEARLY_SAVINGS } from '../lib/pricing';
import './PublicSite.css';

const FEATURES = [
  { label: 'Unlimited manual trade entries', free: true, pro: true },
  { label: 'Calendar, notes and core P&L', free: true, pro: true },
  { label: 'Trade screenshots and setup context', free: true, pro: true },
  { label: 'MT4/MT5 automatic import', free: false, pro: true },
  { label: 'Full session and setup analytics', free: false, pro: true },
  { label: 'Unlimited synced trade history', free: false, pro: true },
  { label: 'TradingView webhooks and API access', free: false, pro: true },
  { label: 'Priority product support', free: false, pro: true },
];

const COMPARISON_ROWS = [
  ['Trade capture', 'Manual entries', 'Manual + MT4/MT5 sync'],
  ['Review depth', 'Notes and screenshots', 'Setups, mood, quality and rules'],
  ['Analytics', 'Core P&L and calendar', 'Sessions, setups and performance trends'],
  ['History', 'Manual journal history', 'Unlimited synced history'],
  ['Automation', 'Not included', 'Broker sync, webhooks and API'],
  ['Support', 'Standard', 'Priority'],
];

const PRO_JOBS = [
  ['Capture', 'Bring supported MT4 and MT5 fills into the journal without copying a single line.'],
  ['Read', 'Compare sessions, setups, execution quality and account performance in one record.'],
  ['Keep private', 'Your journal stays account-scoped. A broker connection exists only after you authorise it.'],
];

const FAQ = [
  ['What is included in Free?', 'Free includes unlimited manual logging, calendar review, core P&L, screenshots and notes. You can build a real review habit before paying for automation.'],
  ['Does Free include MT4 or MT5 sync?', 'No. Broker sync is a Pro feature. Free traders enter trades manually; Pro can import supported MetaTrader history automatically.'],
  ['When should I move to Pro?', 'Move when copying trades is slowing down your review, or when your sample is large enough that session, setup and execution analytics become useful.'],
  ['Can I cancel at any time?', 'Yes. Cancel from the billing portal. Pro remains active until the end of the paid billing period.'],
  ['Is my trading data private?', 'Yes. Journals are account-scoped. A broker account is only connected after you explicitly authorise it.'],
  ['How is payment handled?', 'Checkout is handled by Lemon Squeezy and supports major credit and debit cards.'],
];

function FeatureLedger({ plan }) {
  return (
    <ul className='xj-ledger'>
      {FEATURES.map((feature) => {
        const included = plan === 'pro' ? feature.pro : feature.free;
        return (
          <li className={included ? undefined : 'is-out'} key={feature.label}>
            {included ? <Check aria-hidden='true' /> : <X aria-hidden='true' />}
            <span>{feature.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function PricingPageContent() {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const user = auth.currentUser;
  const { startCheckout, recordProAcceptance } = useSubscription(user);
  useDeskReveal();

  const handleUpgradeClick = () => {
    if (!user) {
      navigate('/login?mode=signin');
      return;
    }
    setShowTerms(true);
  };

  const handleAcceptTerms = async () => {
    const accepted = await recordProAcceptance();
    if (accepted) {
      setShowTerms(false);
      startCheckout();
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <section className='xj-cover' aria-labelledby='pricing-heading'>
            <div className='xj-shell xj-settle'>
              <p className='xj-eyebrow'>Rate card · USD · cancel any time</p>
              <h1 id='pricing-heading' className='xj-h1'>Two desks. <em>One instrument.</em></h1>
              <p className='xj-lede'>
                Manual review should not sit behind a paywall — so it does not. Pay only when broker
                sync, deeper analytics and a longer record start saving you real time.
              </p>
            </div>
          </section>

          <section className='xj-section xj-section--plain' aria-label='Plans'>
            <div className='xj-shell'>
              <div className='xj-plans'>
                <article className='xj-plan'>
                  <p className='xj-plan-tag'><span>Free · manual desk</span></p>
                  <h2>Free</h2>
                  <div className='xj-price'><strong>$0</strong><span>/ month</span></div>
                  <p className='xj-plan-note'>No card. No trial clock.</p>
                  <p className='xj-plan-desc'>
                    For traders building the habit: capture the trade, add context and review the
                    week without a subscription.
                  </p>
                  <FeatureLedger plan='free' />
                  <CTAButton ghost onClick={() => navigate('/login?mode=signup')}>Start free</CTAButton>
                </article>

                <article className='xj-plan xj-plan--lead'>
                  <p className='xj-plan-tag'><span>Pro · connected desk</span><mark>MT4 / MT5 sync</mark></p>
                  <h2>Pro</h2>
                  <div className='xj-price'><strong>{PRO_MONTHLY_DISPLAY}</strong><span>/ month</span></div>
                  <p className='xj-plan-note'>
                    or {PRO_YEARLY_DISPLAY}/year ({PRO_YEARLY_MONTHLY_DISPLAY}/month) — save ${PRO_YEARLY_SAVINGS}
                  </p>
                  <p className='xj-plan-desc'>
                    For active gold traders who want the admin handled and the full pattern visible.
                  </p>
                  <FeatureLedger plan='pro' />
                  <CTAButton onClick={handleUpgradeClick}>Move to Pro</CTAButton>
                </article>
              </div>
            </div>
          </section>

          <section className='xj-section' aria-labelledby='compare-heading'>
            <div className='xj-shell'>
              <SectionHead
                split
                eyebrow='Compare the work'
                id='compare-heading'
                title={<>The difference is <em>admin and depth.</em></>}
                lede='Both desks let you review honestly. Pro removes repeated data entry and gives a larger sample enough structure to answer better questions.'
              />

              <div className='xj-compare xj-reveal' role='table' aria-label='Free and Pro comparison'>
                <div className='xj-compare-row' role='row'>
                  <span role='columnheader'>Review task</span>
                  <span role='columnheader'>Free</span>
                  <span role='columnheader'>Pro</span>
                </div>
                {COMPARISON_ROWS.map(([feature, free, pro]) => (
                  <div className='xj-compare-row' role='row' key={feature}>
                    <strong role='rowheader'>{feature}</strong>
                    <span role='cell' data-plan='Free'>{free}</span>
                    <span role='cell' data-plan='Pro'>{pro}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className='xj-section' aria-labelledby='pro-purpose-heading'>
            <div className='xj-shell'>
              <SectionHead
                eyebrow='What Pro is for'
                id='pro-purpose-heading'
                title={<>Protect the <em>review time.</em></>}
              />
              <div className='xj-rows'>
                {PRO_JOBS.map(([title, detail]) => (
                  <div className='xj-row' key={title}>
                    <span>{title}</span>
                    <p>{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className='xj-section' aria-labelledby='pricing-faq-heading'>
            <div className='xj-shell'>
              <div className='xj-faq'>
                <div>
                  <p className='xj-eyebrow'>Before you choose</p>
                  <h2 id='pricing-faq-heading' className='xj-h2'>Straight answers. <em>No plan fog.</em></h2>
                </div>
                <div className='xj-faq-list'>
                  {FAQ.map(([question, answer]) => (
                    <details key={question}>
                      <summary>{question}<span aria-hidden='true'>+</span></summary>
                      <p>{answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className='xj-section' aria-label='Start free'>
            <div className='xj-shell'>
              <div className='xj-close-row'>
                <h2 className='xj-h2'>Start on the <em>free desk.</em></h2>
                <div className='xj-actions'>
                  <CTALink to='/login?mode=signup'>Start free</CTALink>
                  <small>Upgrade only when automation earns it</small>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />

      {showTerms ? (
        <ProTermsModal onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
      ) : null}
    </>
  );
}

export function PricingPage() {
  return (
    <AppServicesProvider>
      <PricingPageContent />
    </AppServicesProvider>
  );
}
