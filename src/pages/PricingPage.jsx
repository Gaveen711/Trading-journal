import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, LockKeyhole, PlugZap, X } from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { ProTermsModal } from '../components/ProTermsModal';
import { AppServicesProvider } from '../app/di/AppServicesContext';
import { auth } from '../firebaseAuth';
import { useSubscription } from '../hooks/useSubscription';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY, PRO_YEARLY_MONTHLY_DISPLAY, PRO_YEARLY_SAVINGS } from '../lib/pricing';
import './PublicEditorial.css';

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

const FAQ = [
  ['What is included in Free?', 'Free includes unlimited manual logging, calendar review, core P&L, screenshots and notes. You can build a real review habit before paying for automation.'],
  ['Does Free include MT4 or MT5 sync?', 'No. Broker sync is a Pro feature. Free traders enter trades manually; Pro can import supported MetaTrader history automatically.'],
  ['When should I move to Pro?', 'Move when copying trades is slowing down your review, or when your sample is large enough that session, setup and execution analytics become useful.'],
  ['Can I cancel at any time?', 'Yes. Cancel from the billing portal. Pro remains active until the end of the paid billing period.'],
  ['Is my trading data private?', 'Yes. Journals are account-scoped. A broker account is only connected after you explicitly authorize it.'],
  ['How is payment handled?', 'Checkout is handled by Lemon Squeezy and supports major credit and debit cards.'],
];

function FeatureLedger({ plan }) {
  return (
    <ul className='xep-feature-ledger'>
      {FEATURES.map((feature) => {
        const included = plan === 'pro' ? feature.pro : feature.free;
        return (
          <li className={included ? '' : 'is-out'} key={feature.label}>
            {included ? <Check aria-hidden='true' /> : <X aria-hidden='true' />}
            <span>{feature.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function Plan({ name, label, price, description, pro = false, onClick }) {
  return (
    <article className='xep-plan'>
      <div className='xep-plan-top'>
        <div className='xep-plan-meta'>
          <span className='xep-plan-label'>{label}</span>
          {pro ? <span className='xep-plan-mark'>Active desk</span> : null}
        </div>
        <h2>{name}</h2>
        <div className='xep-price'><strong>{price}</strong><span>/ month</span></div>
        <p className='xep-yearly'>
          {pro ? <>or {PRO_YEARLY_DISPLAY}/year ({PRO_YEARLY_MONTHLY_DISPLAY}/month) — save ${PRO_YEARLY_SAVINGS}</> : 'No card. No trial clock.'}
        </p>
        <p className='xep-plan-description'>{description}</p>
      </div>
      <FeatureLedger plan={pro ? 'pro' : 'free'} />
      <button className={pro ? 'xep-button xep-button--primary' : 'xep-button'} type='button' onClick={onClick}>
        {pro ? 'Move to Pro' : 'Open the free journal'} <ArrowRight aria-hidden='true' />
      </button>
    </article>
  );
}

function PricingPageContent() {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const user = auth.currentUser;
  const { startCheckout, recordProAcceptance } = useSubscription(user);

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
    <div data-ux-skip='true'>
      <PublicNavbar />

      <main className='xep-page' data-ux-skip='true'>
        <section className='xep-pricing-hero' aria-labelledby='pricing-heading'>
          <div className='xep-shell'>
            <div className='xep-pricing-intro'>
              <div>
                <p className='xep-kicker'><span>01</span> Desk rates / clear terms</p>
                <h1 id='pricing-heading' className='xep-title'>Journal free.<br /><em>Automate when ready.</em></h1>
              </div>
              <p className='xep-lede'>Manual review should not sit behind a paywall. Start there. Pay only when broker sync, deeper analytics and a larger trading record save you real time.</p>
            </div>

            <div className='xep-rate-table' aria-label='XAU Journal plans'>
              <div className='xep-rate-head'><span>Rate sheet / July 2026</span><span>USD / cancel any time</span></div>
              <div className='xep-plans'>
                <Plan
                  name='Free'
                  label='Manual review desk'
                  price='$0'
                  description='For traders building the habit: capture the trade, add context and review the week without a subscription.'
                  onClick={() => navigate('/login?mode=signup')}
                />
                <Plan
                  pro
                  name='Pro'
                  label='Connected review desk'
                  price={PRO_MONTHLY_DISPLAY}
                  description='For active gold and forex traders who want the admin handled and the full pattern visible.'
                  onClick={handleUpgradeClick}
                />
              </div>
            </div>
          </div>
        </section>

        <section className='xep-section xep-section--sheet' aria-labelledby='compare-heading'>
          <div className='xep-shell'>
            <p className='xep-kicker'><span>02</span> Compare the work</p>
            <h2 id='compare-heading' className='xep-heading'>The difference is <em>admin and depth.</em></h2>
            <p className='xep-lede'>Both plans let you review. Pro removes repeated data entry and gives a larger sample enough structure to answer better questions.</p>

            <div className='xep-compare' role='table' aria-label='Free and Pro comparison'>
              <div className='xep-compare-row' role='row'><span role='columnheader'>Review task</span><span role='columnheader'>Free</span><span role='columnheader'>Pro</span></div>
              {COMPARISON_ROWS.map(([feature, free, pro]) => (
                <div className='xep-compare-row' role='row' key={feature}>
                  <strong role='rowheader'>{feature}</strong>
                  <span role='cell'>{free}</span>
                  <span role='cell'>{pro}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='xep-section' aria-labelledby='pro-purpose-heading'>
          <div className='xep-shell xep-beliefs'>
            <div>
              <p className='xep-kicker'><span>03</span> What Pro is for</p>
              <h2 id='pro-purpose-heading' className='xep-heading'>Protect the review time.</h2>
            </div>
            <div className='xep-support-list'>
              <div className='xep-support-row'><span>01</span><h3>Capture</h3><p>Bring supported MT4 and MT5 fills into the journal without copying every line.</p><PlugZap aria-hidden='true' /></div>
              <div className='xep-support-row'><span>02</span><h3>Read</h3><p>Compare sessions, setups, execution quality and account performance in one record.</p><Check aria-hidden='true' /></div>
              <div className='xep-support-row'><span>03</span><h3>Keep private</h3><p>Your journal remains account-scoped, with broker connections added only by you.</p><LockKeyhole aria-hidden='true' /></div>
            </div>
          </div>
        </section>

        <section className='xep-section xep-section--sheet' aria-labelledby='pricing-faq-heading'>
          <div className='xep-shell xep-faq-grid'>
            <div>
              <p className='xep-kicker'><span>04</span> Before you choose</p>
              <h2 id='pricing-faq-heading' className='xep-heading'>Straight answers.<br />No plan fog.</h2>
            </div>
            <div className='xep-faq-list'>
              {FAQ.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}<span aria-hidden='true'>+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      {showTerms ? (
        <ProTermsModal onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
      ) : null}
    </div>
  );
}

export function PricingPage() {
  return (
    <AppServicesProvider>
      <PricingPageContent />
    </AppServicesProvider>
  );
}