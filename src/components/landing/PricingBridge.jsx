import { Check, X } from 'lucide-react';
import { CTALink, SectionHead } from '../PublicSite';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY, PRO_YEARLY_MONTHLY_DISPLAY } from '../../lib/pricing';
import './PricingBridge.css';

/* ————————————————————————————————————————————————————————————————
   Pricing bridge — two compact plates that hand off to /pricing.
   Prices come from src/lib/pricing.js; the bullet lines mirror FEATURES
   in src/pages/PricingPage.jsx word for word (a test in __tests__ holds
   them to it), so the landing page cannot promise what the rate card
   does not.
   ———————————————————————————————————————————————————————————————— */

const PLAN_LINES = {
  free: [
    { label: 'Unlimited manual trade entries', included: true },
    { label: 'Calendar, notes and core P&L', included: true },
    { label: 'Setup tags and trade notes', included: true },
    { label: 'Screenshots and MT4/MT5 import', included: false },
  ],
  pro: [
    { label: 'MT4/MT5 automatic import', included: true },
    { label: 'Full session and setup analytics', included: true },
    { label: 'Unlimited synced trade history', included: true },
    { label: 'TradingView webhooks and API access', included: true },
  ],
};

function Lines({ lines }) {
  return (
    <ul className='xj-ledger xpb-lines'>
      {lines.map((line) => (
        <li key={line.label} className={line.included ? undefined : 'is-out'}>
          {line.included ? <Check aria-hidden='true' /> : <X aria-hidden='true' />}
          <span>{line.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function PricingBridge() {
  return (
    <section className='xj-section xpb' aria-labelledby='pricing-bridge-heading'>
      <div className='xj-shell'>
        <SectionHead
          split
          id='pricing-bridge-heading'
          eyebrow='Pricing'
          title={<>Free to keep. Paid to <em>automate.</em></>}
          lede='Manual review never costs anything. Pro pays for the admin: broker sync, the full analytics and a record that does not stop at this month.'
        />

        <div className='xpb-plates xj-reveal'>
          <article className='xpb-plate' aria-labelledby='xpb-free'>
            <p className='xj-plan-tag'><span>Free · manual desk</span></p>
            <h3 id='xpb-free' className='xpb-name'>Free</h3>
            <p className='xpb-price'>
              <strong>$0</strong>
              <span>/ month</span>
            </p>
            <p className='xpb-note'>No card. No trial clock.</p>
            <Lines lines={PLAN_LINES.free} />
            <div className='xpb-actions'>
              <CTALink to='/login?mode=signup'>Start free</CTALink>
            </div>
          </article>

          <article className='xpb-plate xpb-plate--lead xj-glass' aria-labelledby='xpb-pro'>
            <p className='xj-plan-tag'><span>Pro · connected desk</span><mark>MT4 / MT5 sync</mark></p>
            <h3 id='xpb-pro' className='xpb-name'>Pro</h3>
            <p className='xpb-price'>
              <strong>{PRO_MONTHLY_DISPLAY}</strong>
              <span>/ month</span>
            </p>
            <p className='xpb-note'>
              or {PRO_YEARLY_DISPLAY} a year — {PRO_YEARLY_MONTHLY_DISPLAY} a month
            </p>
            <Lines lines={PLAN_LINES.pro} />
            <div className='xpb-actions'>
              <CTALink ghost to='/pricing'>Full rate card</CTALink>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
