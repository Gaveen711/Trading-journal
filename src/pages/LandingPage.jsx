import { useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, BookOpen, CalendarDays, Check, CircleDot,
  Clock3, LineChart, ListChecks, NotebookPen, PlugZap, ShieldCheck, Target,
} from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAppTheme } from '../hooks/useAppTheme';
import {
  LANDING_FAQ, buildFAQSchema, buildOrganizationSchema, buildSoftwareSchema,
  buildWebSiteSchema, injectJsonLd, removeJsonLd,
} from '../lib/seo';

const themes = {
  light: {
    '--ld-bg': '#f8f6ef', '--ld-surface': '#fffdf7', '--ld-surface-2': '#f0eadb',
    '--ld-ink': '#14120d', '--ld-muted': '#655f51', '--ld-border': 'rgba(39,31,19,.14)',
    '--ld-border-strong': 'rgba(39,31,19,.27)', '--ld-gold': '#c98924', '--ld-teal': '#0f8878',
    '--ld-green': '#047857', '--ld-red': '#b9402f', '--ld-button-ink': '#14120d',
    '--ld-inverse-muted': '#b8ad99', '--ld-inverse-border': 'rgba(248,246,239,.18)',
  },
  dark: {
    '--ld-bg': '#050604', '--ld-surface': '#0a0d09', '--ld-surface-2': '#0d0f0a',
    '--ld-ink': '#f8f3e7', '--ld-muted': '#b8ad99', '--ld-border': 'rgba(245,229,191,.12)',
    '--ld-border-strong': 'rgba(245,229,191,.24)', '--ld-gold': '#f5b544', '--ld-teal': '#5eead4',
    '--ld-green': '#35db7a', '--ld-red': '#ff6b6b', '--ld-button-ink': '#050604',
    '--ld-inverse-muted': '#b8ad99', '--ld-inverse-border': 'rgba(248,243,231,.18)',
  },
};

function SessionTicket() {
  return <aside className='ld-ticket' aria-label='Example gold trade review'>
    <header><span>After-session file</span><b>Reviewed</b></header>
    <h2>XAUUSD / BUY</h2><strong className='ld-positive'>+$242.64</strong>
    <p>London / Liquidity sweep / +38.4 pips</p>
    <footer><span>Rule for tomorrow</span><strong>No entry before the London low is tested.</strong></footer>
  </aside>;
}

function Hero() {
  return <>
    <section className='ld-hero' aria-labelledby='landing-heading'>
      <div className='ld-shell ld-hero-grid'>
        <div><span className='ld-kicker'>The XAUUSD review desk</span>
          <h1 id='landing-heading'>Keep the lesson.<em>Not just the P&amp;L.</em></h1>
          <p className='ld-copy ld-hero-copy'>xaujournal keeps the trade, the reason and the next rule in one place—so your next gold session starts with evidence instead of memory.</p>
          <div className='ld-actions'><PrimaryLink to='/login'>Start your free journal</PrimaryLink><a className='ld-text-link' href='#product'>See the product <ArrowRight /></a></div>
          <p className='ld-free-note'><ShieldCheck /> Unlimited manual trades. No broker connection required.</p>
        </div><SessionTicket />
      </div>
    </section>
    <div className='ld-proof'><div className='ld-shell'>
      <strong>Built around the review after the XAUUSD chart closes.</strong>
      <div><span>Capture</span><b>Trade + reason</b></div><div><span>Read</span><b>Session + setup data</b></div><div><span>Adjust</span><b>One next-session rule</b></div>
    </div></div>
  </>;
}

function TradeLog() {
  return <><div className='ld-ledger-head'><span>Trade</span><span>Setup</span><span>Hold</span><span>Net P&amp;L</span></div>
    {trades.map(([trade, setup, hold, pnl, positive]) => <div className='ld-ledger-row' key={setup}>
      <div><strong>{trade}</strong><span>Jul 10 / 09:42</span></div><div><strong>{setup}</strong><span>Plan tagged</span></div><div><strong>{hold}</strong><span>Position time</span></div><div><strong className={positive ? 'ld-positive' : 'ld-negative'}>{pnl}</strong><span>Closed</span></div>
    </div>)}
    <div className='ld-callout'><ListChecks /><div><strong>The losing trade stays useful.</strong><p>The impulse chase is tagged beside profitable setups, so the leak is visible during review.</p></div></div>
  </>;
}

function Analytics() {
  return <><div className='ld-stats'><div><span>Net P&amp;L</span><strong className='ld-positive'>+$876.08</strong></div><div><span>Win rate</span><strong>78%</strong></div><div><span>Avg R:R</span><strong>1 : 2.4</strong></div></div>
    <div className='ld-analytics'><div className='ld-chart'><header><strong>30-day equity</strong><span>Closed trades only</span></header>
      <svg viewBox='0 0 620 195' preserveAspectRatio='none' role='img' aria-label='Thirty day equity curve trending upward with two pullbacks'>
        <g stroke='var(--ld-border)'><line x1='0' y1='25' x2='620' y2='25'/><line x1='0' y1='97' x2='620' y2='97'/><line x1='0' y1='170' x2='620' y2='170'/></g>
        <path d='M0 168 L72 154 L142 161 L214 116 L286 128 L360 82 L430 102 L504 58 L620 34' fill='none' stroke='var(--ld-gold)' strokeWidth='4' strokeLinecap='round'/>
      </svg></div>
      <div className='ld-setups'><h4>Setup performance</h4>{[['Liquidity sweep',82],['NY continuation',74],['Impulse chase',31]].map(([label,value]) => <div className='ld-setup' key={label}><p><strong>{label}</strong><span>{value}%</span></p><i><b style={{width:`${value}%`}} /></i></div>)}</div>
    </div>
  </>;
}

function Journal() {
  return <div className='ld-journal'>
    <nav aria-label='Journal dates'><b>Jul 10 / Today</b><span>Jul 09</span><span>Jul 08</span><span>Jul 05</span></nav>
    <article><header><strong>London session review</strong><span>Focused</span></header>
      <blockquote>“The loss came when I entered again without a second sweep. The setup did not fail; I stopped waiting for it.”</blockquote>
      <div><Target /><p><strong>Next-session rule</strong><span>Maximum one entry until the London low or high is swept and reclaimed.</span></p></div>
    </article>
  </div>;
}

function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('history');
  const current = tabs.find(({ id }) => id === activeTab);
  return <section id='product' className='ld-section' aria-labelledby='product-heading'><div className='ld-shell'>
    <div className='ld-section-head'><span className='ld-kicker'>Inside the product</span><h2 id='product-heading'>The whole trading week, in one review desk.</h2><p className='ld-copy'>Move from the closed position to the pattern behind it without rebuilding your week from screenshots, broker history and phone notes.</p></div>
    <div className='ld-product'><div className='ld-product-bar'><strong><i /> xaujournal / review workspace</strong><div><span><img src='/mt4.svg' alt='' /> MT4</span><span><img src='/mt5.svg' alt='' /> MT5</span></div></div>
      <div className='ld-product-body'><nav className='ld-product-nav' aria-label='Product preview views'><small>Workspace</small>
        {tabs.map(({ id, label, Icon }) => <button type='button' className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)} aria-pressed={activeTab === id} key={id}><Icon />{label}</button>)}
        <p>Each view answers a review question: what happened, where the edge sits and what changes next.</p>
      </nav><div className='ld-product-main'><header className='ld-screen-head'><div><h3>{current.label}</h3><p>{activeTab === 'history' ? 'Every closed position with context attached.' : activeTab === 'analytics' ? 'Performance by result, setup and session.' : 'The thought process behind the numbers.'}</p></div><span><CalendarDays /> Jul 01—Jul 10</span></header>
        {activeTab === 'history' && <TradeLog />}{activeTab === 'analytics' && <Analytics />}{activeTab === 'journal' && <Journal />}
      </div></div>
    </div>
  </div></section>;
}

function ReviewMethod() {
  return <section className='ld-section' aria-labelledby='method-heading'><div className='ld-shell ld-method'>
    <div><span className='ld-kicker'>The career value</span><h2 id='method-heading'>A repeatable review before the next entry.</h2><p className='ld-copy'>A journal cannot place the trade for you. It can show whether your process deserves to be repeated.</p></div>
    <div className='ld-method-list'>{reviewSteps.map(([number,title,body,output,Icon]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p><b><Icon />{output}</b></div></article>)}</div>
  </div></section>;
}

function Plans() {
  return <section className='ld-section ld-inverse' aria-labelledby='plans-heading'><div className='ld-shell'>
    <div className='ld-section-head'><span className='ld-kicker'>A clear reason to upgrade</span><h2 id='plans-heading'>Start manual. Pay when typing becomes the work.</h2><p className='ld-copy'>The free journal builds the habit. Pro earns its place when active trade volume makes broker history and deeper reports worth the time saved.</p></div>
    <div className='ld-plans'>
      <article><header><h3>Free</h3><span>Build the habit</span></header><p>For traders who want a complete manual record before connecting anything.</p><ul><li><Check />Unlimited manual trades</li><li><Check />Core P&amp;L and calendar review</li><li><Check />Journal notes for every session</li></ul></article>
      <article><header><h3>Pro</h3><span>Reduce admin</span></header><p>For active XAUUSD traders who want supported broker history and the full analytics suite.</p><ul><li><PlugZap />MT4 / MT5 auto import</li><li><BarChart3 />Full reports and session intelligence</li><li><NotebookPen />Notes, tags, screenshots and psychology</li></ul><div className='ld-brokers'><span><img src='/mt4.svg' alt='' />MetaTrader 4</span><span><img src='/mt5.svg' alt='' />MetaTrader 5</span></div></article>
    </div><PrimaryLink to='/pricing'>Compare Free and Pro</PrimaryLink>
  </div></section>;
}

function FAQ() {
  return <section className='ld-section' aria-labelledby='faq-heading'><div className='ld-shell ld-faq'>
    <div><span className='ld-kicker'>Before you start</span><h2 id='faq-heading'>Straight answers.</h2></div>
    <div>{LANDING_FAQ.slice(0, 3).map((item) => <article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div>
  </div></section>;
}

function FinalCTA() {
  return <section className='ld-final' aria-labelledby='final-heading'><div className='ld-shell'>
    <span className='ld-kicker'>Tonight’s review</span><h2 id='final-heading'>Your next rule is hiding in your last trade.</h2>
    <p className='ld-copy'>Log it while the chart is still fresh. Stay manual for as long as it works, and move to Pro when the volume calls for it.</p>
    <PrimaryLink to='/login'>Review today’s trades</PrimaryLink>
  </div></section>;
}

export function LandingPage() {
  const { isLightMode } = useAppTheme();
  useLandingMetadata();
  return <><PublicNavbar /><main className='ld-page' style={isLightMode ? themes.light : themes.dark}>
    <Hero /><ProductShowcase /><ReviewMethod /><Plans /><FAQ /><FinalCTA /><PublicFooter />
  </main></>;
}

const tabs = [
  { id: 'history', label: 'Trade log', Icon: Clock3 },
  { id: 'analytics', label: 'Analytics', Icon: LineChart },
  { id: 'journal', label: 'Journal', Icon: BookOpen },
];

const trades = [
  ['XAUUSD · Buy', 'London sweep', '42 min', '+$242.64', true],
  ['XAUUSD · Buy', 'NY continuation', '1h 08m', '+$400.95', true],
  ['XAUUSD · Sell', 'Impulse chase', '18 min', '-$35.20', false],
];

const reviewSteps = [
  ['01', 'Record the position', 'Entry, exit, session, setup, pips, P&L, risk and screenshot live in one trade record.', 'A complete trade, not a loose screenshot', NotebookPen],
  ['02', 'Name the decision', 'Write why you entered and whether you followed the rule you planned to trade.', 'The reason survives after the chart closes', CircleDot],
  ['03', 'Read the pattern', 'Compare session, setup, win rate and P&L so a bad week cannot hide inside the balance.', 'Evidence for what works and what leaks', BarChart3],
  ['04', 'Set one next-session rule', 'End the review with one instruction you can follow at the next London or New York open.', 'A specific adjustment for the next entry', Target],
];

function useLandingMetadata() {
  useLayoutEffect(() => {
    injectJsonLd('ld-organization', buildOrganizationSchema());
    injectJsonLd('ld-website', buildWebSiteSchema());
    injectJsonLd('ld-software', buildSoftwareSchema());
    injectJsonLd('ld-faq', buildFAQSchema(LANDING_FAQ));
    return () => ['ld-organization', 'ld-website', 'ld-software', 'ld-faq'].forEach(removeJsonLd);
  }, []);
}

function PrimaryLink({ to, children }) {
  return <Link className='ld-button' to={to}>{children}<ArrowRight aria-hidden='true' /></Link>;
}
