import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  Globe2,
  Layers3,
  NotebookPen,
  PlugZap,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const HERO_PROOF = [
  ['Founder', 'Developer + trader', 'Built from the same review pain the product now solves.'],
  ['Focus', 'XAUUSD first', 'Gold trading workflows before broad market noise.'],
  ['Ambition', 'Global SaaS', 'A review system made to serve millions of disciplined traders.'],
];

const ORIGIN_POINTS = [
  {
    icon: NotebookPen,
    title: 'The record was scattered',
    body: 'Broker history showed the execution. Screenshots held the context. Notes carried the psychology. The real lesson lived between them.',
  },
  {
    icon: Target,
    title: 'Gold needed precision',
    body: 'XAUUSD does not behave like a generic pair. Position sizing, contract value, volatility, and session rhythm deserve a product built around that reality.',
  },
  {
    icon: Layers3,
    title: 'Review needed less friction',
    body: 'The habit breaks when a trader has to rebuild the session manually. The product began as a way to protect the review habit.',
  },
];

const FOUNDER_TIMELINE = [
  ['01', 'Trade the problem', 'I was not looking for a startup idea. I was looking for a cleaner way to understand my own XAUUSD decisions after the market closed.'],
  ['02', 'Build the workflow', 'The first principle was practical: capture the trade, keep the context, and make the next review faster than the last one.'],
  ['03', 'Shape the company', 'Once the workflow kept proving useful, XAU Journal became a company mission: make serious trade review accessible as a focused SaaS product.'],
];

const PRODUCT_STEPS = [
  {
    key: 'Capture',
    label: '01',
    accent: '#06b6d4',
    soft: 'rgba(6, 182, 212, 0.16)',
    icon: PlugZap,
    title: 'Capture the execution',
    outcome: 'A clean record before memory starts editing the story.',
    body: 'Closed MT4/MT5 trades can become structured entries with price, size, result, and instrument context preserved.',
    rows: [['Input', 'MT4 / MT5 closed trades'], ['Preserve', 'price, size, P&L'], ['Result', 'less manual admin']],
  },
  {
    key: 'Context',
    label: '02',
    accent: '#10b981',
    soft: 'rgba(16, 185, 129, 0.16)',
    icon: NotebookPen,
    title: 'Attach the reason',
    outcome: 'The trade becomes evidence, not just a number.',
    body: 'Notes, screenshots, session labels, setup quality, and emotional state sit beside the trade they explain.',
    rows: [['Explain', 'setup and session'], ['Remember', 'psychology and intent'], ['Connect', 'screenshots and notes']],
  },
  {
    key: 'Read',
    label: '03',
    accent: '#2563eb',
    soft: 'rgba(37, 99, 235, 0.15)',
    icon: BarChart3,
    title: 'Read the pattern',
    outcome: 'The journal shows where execution is improving or leaking.',
    body: 'Calendar rhythm, drawdown, win rate, profit factor, session behavior, and repeat setups become easier to compare.',
    rows: [['Metrics', 'win rate and profit factor'], ['Risk', 'drawdown and exposure'], ['Pattern', 'session edge']],
  },
  {
    key: 'Scale',
    label: '04',
    accent: '#f59e0b',
    soft: 'rgba(245, 158, 11, 0.18)',
    icon: TrendingUp,
    title: 'Scale the discipline',
    outcome: 'A private workflow becomes a product for serious traders everywhere.',
    body: 'The company builds infrastructure around the habit: secure accounts, cloud history, subscription access, and a roadmap filtered by real trading utility.',
    rows: [['Product', 'SaaS review system'], ['Audience', 'millions of traders'], ['Promise', 'better decisions']],
  },
];

const SCALE_POINTS = [
  {
    icon: Globe2,
    title: 'Built for a global desk',
    body: 'A trader in Colombo, London, New York, or Dubai should be able to open the same clean review system and understand the last session.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust is part of the product',
    body: 'Trading history is sensitive. The experience is designed to feel private, controlled, and serious from the first screen.',
  },
  {
    icon: Database,
    title: 'Data becomes memory',
    body: 'The product stores the shape of a trader\'s process so the next decision is informed by evidence, not mood.',
  },
];

const PRINCIPLES = [
  'Specialize deeply before expanding broadly.',
  'Reduce the work around journaling so traders keep the habit.',
  'Make analytics explain behavior, not decorate a dashboard.',
  'Build every feature as the trader who has to trust it after a live session.',
];

const MARKET_BARS = [38, 52, 44, 67, 58, 74, 63, 82, 71, 88, 79, 94];

const STYLES = `
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }
  .lenis.lenis-stopped { overflow: hidden; }
  .story-page { --story-bg:#f8f6ef; --story-bg-2:#f0eadb; --story-surface:#fffdf7; --story-surface-2:#ffffff; --story-ink:#14120d; --story-muted:#655f51; --story-border:rgba(39,31,19,.12); --story-strong:rgba(39,31,19,.24); --story-accent:#0f9f8a; --story-teal:#0f9f8a; --story-copper:#b55337; --story-rust:#c98924; --story-shadow:0 28px 80px rgba(39,31,19,.14); min-height:100vh; position:relative; isolation:isolate; overflow-x:hidden; background:linear-gradient(125deg,color-mix(in srgb,var(--story-accent) 10%,transparent),transparent 24%),linear-gradient(220deg,color-mix(in srgb,var(--story-accent) 9%,transparent),transparent 30%),linear-gradient(180deg,var(--story-bg) 0%,color-mix(in srgb,var(--story-bg) 95%,var(--story-surface)) 54%,var(--story-bg) 100%); color:var(--story-ink); font-family:'Poppins','Inter',system-ui,sans-serif; overflow-x:clip; overflow-y:visible }
  .story-page:before { content:''; position:fixed; inset:0; z-index:-2; pointer-events:none; background-image:linear-gradient(var(--story-border) 1px,transparent 1px),linear-gradient(90deg,var(--story-border) 1px,transparent 1px); background-size:88px 88px; mask-image:linear-gradient(to bottom,black 0%,transparent 84%) }
  .story-page:after { content:''; position:fixed; inset:0; z-index:-1; pointer-events:none; background:linear-gradient(180deg,transparent 0%,color-mix(in srgb,var(--story-bg) 70%,transparent) 72%,var(--story-bg) 100%) }
  .dark .story-page { --story-bg:#050604; --story-bg-2:#0d0f0a; --story-surface:#0e120d; --story-surface-2:#0a0d09; --story-border:rgba(245,229,191,.12); --story-strong:rgba(245,229,191,.23); --story-ink:#f8f3e7; --story-muted:#b8ad99; --story-accent:#5eead4; --story-teal:#35db7a; --story-copper:#ff7a59; --story-rust:#f5b544; --story-shadow:0 32px 90px rgba(0,0,0,.48); }
  .story-page .scroll-reveal-text { opacity:1 !important; transform:none !important; }
  .story-page > section, .story-page > footer { position:relative; z-index:1; }
  .story-progress { position:fixed; inset:0 auto auto 0; width:100%; height:3px; transform:scaleX(0); transform-origin:left; z-index:1000; background:linear-gradient(90deg,var(--story-rust),var(--story-copper),var(--story-teal),var(--story-accent)); }
  .story-shell { width:min(1180px,calc(100% - 2rem)); margin:0 auto; }
  .story-eyebrow { display:inline-flex; align-items:center; gap:.55rem; color:var(--story-accent); font-size:.78rem; font-weight:800; line-height:1.2; letter-spacing:0; text-transform:uppercase; }
  .story-eyebrow::before { content:none; }
  .story-gradient-word { display:inline-block; background:linear-gradient(90deg,#B08A5A 0%,#D49224 22%,#C95B3C 44%,#14B8A6 72%,#B08A5A 100%); background-size:220% 100%; background-repeat:repeat; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent; text-decoration:none; animation:storyGradientText 8s linear infinite; }
  .dark .story-gradient-word { background-image:linear-gradient(90deg,#D4A76A 0%,#F5B544 22%,#FF7A59 44%,#2DD4BF 72%,#D4A76A 100%); }
  @keyframes storyGradientText { 0% { background-position:0% 50%; } 100% { background-position:220% 50%; } }
  .story-title-xl { margin-top:1.2rem; color:var(--story-ink); font-size:clamp(3rem,7.3vw,7.6rem) !important; line-height:.96 !important; font-weight:800 !important; letter-spacing:0 !important; text-wrap:balance; }
  .story-title-lg { margin-top:1rem; color:var(--story-ink); font-size:clamp(2.2rem,5vw,5.2rem) !important; line-height:1.02 !important; font-weight:800 !important; letter-spacing:0 !important; text-wrap:balance; }
  .story-title-md { color:var(--story-ink); font-size:clamp(1.5rem,3vw,2.4rem) !important; line-height:1.08 !important; font-weight:850 !important; letter-spacing:0 !important; }
  .story-lede, .story-copy { color:var(--story-muted); line-height:1.75; font-weight:560; }
  .story-lede { max-width:760px; margin:1.35rem auto 0; font-size:clamp(1rem,1.35vw,1.16rem); }
  .story-copy { max-width:680px; margin-top:1rem; font-size:clamp(1rem,1.35vw,1.12rem); }
  .story-hero { min-height:100dvh; display:grid; align-items:center; padding:clamp(7.5rem,10vw,10rem) 0 clamp(4rem,8vw,6rem); }
  .story-hero-grid { display:grid; grid-template-columns:1fr; gap:clamp(2.25rem,5vw,4.75rem); align-items:center; justify-items:center; text-align:center; }
  .story-hero-copy { max-width:min(980px,100%); margin:0 auto; display:grid; justify-items:center; text-align:center; }
  .story-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:.75rem; margin-top:2rem; }
  .story-primary, .story-secondary { min-height:48px; display:inline-flex; align-items:center; justify-content:center; gap:.55rem; border-radius:8px; padding:0 1.1rem; font-size:.92rem; font-weight:800; text-decoration:none; transition:transform 220ms ease,border-color 220ms ease,background 220ms ease,color 220ms ease; }
  .story-primary { border:1px solid var(--story-ink); background:var(--story-ink); color:var(--story-surface); }
  .story-secondary { border:1px solid var(--story-strong); background:color-mix(in srgb,var(--story-surface) 70%,transparent); color:var(--story-ink); }
  .story-primary:hover, .story-secondary:hover { transform:translateY(-2px); }
  .story-primary:focus-visible, .story-secondary:focus-visible, .story-scroll-top:focus-visible { outline:2px solid var(--story-accent); outline-offset:4px; }
  .story-proof { width:min(980px,100%); display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border-top:1px solid var(--story-border); border-bottom:1px solid var(--story-border); margin-top:3rem; text-align:left; }
  .story-proof-item { padding:1.05rem 1.1rem 1.05rem 0; border-right:1px solid var(--story-border); }
  .story-proof-item:nth-child(2) { padding-left:1.1rem; }
  .story-proof-item:last-child { border-right:0; padding-right:0; padding-left:1.1rem; }
  .story-proof-item span, .story-board-title span, .story-board-metric span { display:block; color:var(--story-muted); font-size:.78rem; font-weight:740; text-transform:uppercase; }
  .story-proof-item strong, .story-board-metric strong { display:block; margin-top:.35rem; color:var(--story-ink); font-size:1.02rem; line-height:1.25; }
  .story-proof-item p { margin-top:.35rem; color:var(--story-muted); font-size:.84rem; line-height:1.5; }
  .story-board, .story-item, .story-founder-note, .story-scale-item, .story-principle, .story-product-panel { border:none!important; border-radius:8px; background:transparent!important; box-shadow:none!important; }
  .story-hero-stack { display:grid; gap:1rem; align-self:center; }
  .story-board { width:min(980px,100%); margin:0 auto; border:none!important; box-shadow:none!important; overflow:hidden; text-align:left; }
  .story-board-inner { will-change:transform; }
  .story-board-header { min-height:68px; display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem; border-bottom:none!important; background:transparent!important; }
  .story-board-brand { color:var(--story-ink); font-size:1.15rem; line-height:1; font-weight:850; }
  .story-board-brand span { color:var(--story-accent); }
  .story-board-status { display:inline-flex; align-items:center; gap:.45rem; color:var(--story-muted); font-size:.78rem; font-weight:760; }
  .story-board-status::before { content:''; width:.52rem; height:.52rem; border-radius:999px; background:var(--story-teal); }
  .story-board-body { padding:clamp(1rem,3vw,1.6rem); }
  .story-board-title { display:grid; gap:.5rem; padding-bottom:1.15rem; border-bottom:none!important; }
  .story-board-title strong { color:var(--story-ink); font-size:clamp(1.3rem,2.2vw,2rem); line-height:1.08; }
  .story-board-metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border-bottom:none!important; }
  .story-board-metric { padding:1rem .9rem 1rem 0; border-right:none!important; }
  .story-board-metric + .story-board-metric { padding-left:.9rem; }
  .story-board-metric:last-child { border-right:0; padding-right:0; }
  .story-market { padding-top:1.2rem; }
  .story-market-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; color:var(--story-muted); font-size:.82rem; font-weight:760; }
  .story-market-bars { height:164px; display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); align-items:end; gap:.52rem; margin-top:1rem; padding:1rem; border:none!important; background:transparent!important; }
  .story-market-bar { min-height:18px; border-radius:3px 3px 0 0; background:var(--story-teal); opacity:.82; }
  .story-market-bar:nth-child(3n + 1) { background:var(--story-accent); }
  .story-market-bar:nth-child(4n) { background:var(--story-copper); }
  .story-code-line { display:flex; align-items:center; gap:.6rem; margin-top:1rem; border-top:none!important; padding-top:1rem; color:var(--story-muted); font-family:'Roboto Mono',Consolas,monospace; font-size:.78rem; line-height:1.6; }
  .story-section { padding:clamp(4.5rem,9vw,8rem) 0; }
  .story-section-head { max-width:820px; margin:0 auto clamp(2rem,5vw,3.5rem); display:grid; justify-items:center; text-align:center; }
  .story-section-head .story-copy { margin-left:auto; margin-right:auto; }
  .story-split { display:grid; grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); gap:clamp(1.2rem,4vw,3rem); align-items:start; }
  .story-statement { border-top:none!important; padding-top:1.4rem; }
  .story-statement blockquote { color:var(--story-ink); font-size:clamp(1.7rem,3.4vw,3rem); line-height:1.15; font-weight:800; text-wrap:balance; }
  .story-statement p { margin-top:1.2rem; color:var(--story-muted); font-size:1rem; line-height:1.75; font-weight:560; }
  .story-list { display:grid; gap:1rem; }
  .story-item, .story-scale-item { display:grid; grid-template-columns:auto 1fr; gap:1rem; padding:1.1rem; }
  .story-icon { width:2.65rem; height:2.65rem; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--story-border); border-radius:8px; color:var(--story-accent); background:var(--story-surface-2); }
  .story-item h3, .story-founder-note h3, .story-timeline-item h3, .story-scale-item h3 { color:var(--story-ink); font-size:1.05rem !important; line-height:1.25 !important; font-weight:800 !important; letter-spacing:0 !important; }
  .story-item p, .story-founder-note p, .story-timeline-item p, .story-scale-item p { margin-top:.45rem; color:var(--story-muted); font-size:.94rem; line-height:1.65; font-weight:540; }
  .story-founder-note { position:sticky; top:7rem; padding:clamp(1.2rem,3vw,1.7rem); }
  .story-founder-mark { width:4.35rem; height:4.35rem; display:grid; place-items:center; border:1px solid var(--story-strong); border-radius:8px; background:var(--story-ink); color:var(--story-surface); font-weight:850; font-size:1.25rem; }
  .story-founder-note h3 { margin-top:1.2rem; font-size:clamp(1.5rem,2.5vw,2.2rem) !important; }
  .story-founder-meta { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1.2rem; }
  .story-founder-meta span { border:none!important; padding:.45rem .6rem; color:var(--story-muted); font-size:.78rem; font-weight:760; }
  .story-timeline-item { display:grid; grid-template-columns:4rem 1fr; gap:1rem; border-bottom:none!important; padding-bottom:1.25rem; }
  .story-timeline-item:last-child { border-bottom:0; padding-bottom:0; }
  .story-timeline-number { color:var(--story-accent); font-size:1.8rem; line-height:1; font-weight:850; }
  .story-showcase { padding:clamp(5rem,10vw,9rem) 0; border:none!important; background:transparent!important; }
  .story-showcase-stage { --stage-progress:0; --stage-shift:0px; --stage-accent:#0f766e; --stage-accent-soft:rgba(15,118,110,.16); min-height:min(78vh,760px); display:grid; grid-template-columns:minmax(0,.86fr) minmax(360px,1.14fr); gap:clamp(2rem,6vw,5rem); align-items:center; position:relative; }
  .story-showcase-stage::before { content:''; position:absolute; left:0; right:0; top:0; height:1px; background:linear-gradient(90deg,var(--stage-accent),transparent); transform:scaleX(calc(.18 + (var(--stage-progress) * .82))); transform-origin:left; }
  .story-stage-label { display:flex; align-items:center; gap:.75rem; color:var(--stage-accent); font-size:.9rem; font-weight:820; text-transform:uppercase; }
  .story-stage-progress { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.4rem; margin-top:2rem; }
  .story-stage-step { min-height:44px; display:inline-flex; align-items:center; justify-content:center; border-bottom:2px solid var(--story-border); color:var(--story-muted); font-size:.82rem; font-weight:800; transition:color 220ms ease,border-color 220ms ease; }
  .story-stage-step.is-active { color:var(--stage-accent); border-color:var(--stage-accent); }
  .story-product-shell { transform:translateX(var(--stage-shift)); transition:transform 280ms ease; }
  .story-product-panel { border:none!important; background:transparent!important; box-shadow:none!important; overflow:hidden; }
  .story-product-head { display:flex; align-items:center; justify-content:space-between; gap:1rem; min-height:64px; padding:1rem; border-bottom:none!important; background:var(--stage-accent-soft); }
  .story-product-head span { color:var(--stage-accent); font-size:.84rem; font-weight:820; text-transform:uppercase; }
  .story-product-head strong { color:var(--story-ink); font-size:1rem; }
  .story-product-body { padding:clamp(1.1rem,3vw,1.6rem); }
  .story-product-main { display:grid; grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr); gap:1.2rem; align-items:stretch; }
  .story-product-number { min-height:220px; display:grid; place-items:center; border:1px solid var(--story-border); border-radius:8px; overflow:hidden; background:linear-gradient(90deg,var(--story-border) 1px,transparent 1px),linear-gradient(180deg,var(--story-border) 1px,transparent 1px),var(--stage-accent-soft); background-size:28px 28px; color:var(--stage-accent); font-size:clamp(4.5rem,10vw,8rem); line-height:1; font-weight:860; }
  .story-product-outcome { margin-top:.6rem; color:var(--stage-accent); font-size:.94rem; font-weight:820; }
  .story-product-detail p:not(.story-product-outcome) { margin-top:.9rem; color:var(--story-muted); font-size:.95rem; line-height:1.65; font-weight:540; }
  .story-product-rows { display:grid; gap:.55rem; margin-top:1.1rem; }
  .story-product-row { display:grid; grid-template-columns:.8fr 1.2fr; gap:.75rem; border-top:none!important; padding-top:.65rem; }
  .story-product-row span { color:var(--story-muted); font-size:.78rem; font-weight:760; }
  .story-product-row strong { color:var(--story-ink); font-size:.9rem; font-weight:820; }
  .story-scale-lead { border-top:none!important; padding-top:1.4rem; }
  .story-principle { display:grid; grid-template-columns:auto 1fr; gap:.85rem; padding:1rem; color:var(--story-muted); font-size:.96rem; line-height:1.6; font-weight:650; border:none!important; background:transparent!important; box-shadow:none!important; }
  .story-principle svg { color:var(--story-teal); margin-top:.18rem; }
  .story-final { padding:clamp(5rem,9vw,8rem) 0; }
  .story-final-inner { display:grid; grid-template-columns:1fr; gap:2rem; justify-items:center; text-align:center; border-top:none!important; padding-top:clamp(1.5rem,4vw,2.5rem); }
  .story-final-inner .story-copy { margin-left:auto; margin-right:auto; }
  .story-scroll-top { position:fixed; right:1.25rem; bottom:1.25rem; z-index:90; width:46px; height:46px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--story-strong); border-radius:8px; background:var(--story-surface); color:var(--story-ink); box-shadow:var(--story-shadow); cursor:pointer; transition:transform 220ms ease,opacity 220ms ease; }
  .story-reveal { will-change:transform,opacity; }
  @media (max-width:1023px) { .story-hero { min-height:auto; padding-top:7rem; } .story-hero-grid, .story-split, .story-showcase-stage, .story-final-inner { grid-template-columns:1fr; } .story-founder-note { position:relative; top:auto; } .story-showcase-stage { min-height:auto; gap:2rem; } .story-product-shell { transform:none !important; } }
  @media (max-width:720px) { .story-shell { width:min(100% - 1.25rem,1180px); } .story-title-xl { font-size:clamp(2.65rem,15vw,4.35rem) !important; } .story-actions { flex-direction:column; } .story-primary, .story-secondary { width:100%; } .story-proof, .story-board-metrics, .story-product-main { grid-template-columns:1fr; } .story-proof-item, .story-proof-item:nth-child(2), .story-proof-item:last-child, .story-board-metric, .story-board-metric + .story-board-metric, .story-board-metric:last-child { padding-left:0; padding-right:0; border-right:0; } .story-proof-item, .story-board-metric { border-bottom:none!important; } .story-proof-item:last-child, .story-board-metric:last-child { border-bottom:0; } .story-board-header { align-items:flex-start; flex-direction:column; } .story-item, .story-scale-item { grid-template-columns:1fr; } .story-timeline-item { grid-template-columns:1fr; gap:.45rem; } .story-stage-progress { grid-template-columns:repeat(2,minmax(0,1fr)); } .story-product-number { min-height:150px; } .story-product-row { grid-template-columns:1fr; gap:.25rem; } .story-market-bars { height:132px; gap:.35rem; padding:.8rem; } }
  @media (prefers-reduced-motion:reduce) { .story-reveal, .story-board-inner, .story-product-shell { opacity:1 !important; transform:none !important; } .story-primary, .story-secondary, .story-stage-step, .story-scroll-top { transition-duration:.01ms !important; } }
`;

function StoryButton({ to, children, variant = 'primary' }) {
  const className = variant === 'primary' ? 'story-primary' : 'story-secondary';

  if (to.startsWith('#')) {
    return <a href={to} className={className}>{children}</a>;
  }

  return <Link to={to} className={className}>{children}</Link>;
}

function Highlight({ children }) {
  return <span className='story-gradient-word'>{children}</span>;
}

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className='story-section-head story-reveal'>
      <span className='story-eyebrow'>{eyebrow}</span>
      <h2 className='story-title-lg'>{title}</h2>
      {children ? <p className='story-copy'>{children}</p> : null}
    </div>
  );
}

function MissionBoard() {
  return (
    <div className='story-board story-reveal' aria-label='XAU Journal product mission board'>
      <div className='story-board-inner'>
        <div className='story-board-header'>
          <span className='story-board-brand' aria-label='XAU Journal'>Xau Journal<span>.</span></span>
          <span className='story-board-status'>Founder build active</span>
        </div>

        <div className='story-board-body'>
          <div className='story-board-title'>
            <span>Company note</span>
            <strong>From one trader's review problem to a SaaS product for serious traders.</strong>
          </div>

          <div className='story-board-metrics'>
            <div className='story-board-metric'><span>Instrument</span><strong>XAUUSD</strong></div>
            <div className='story-board-metric'><span>Workflow</span><strong>Sync + review</strong></div>
            <div className='story-board-metric'><span>Built by</span><strong>Gaveen Perera</strong></div>
          </div>

          <div className='story-market'>
            <div className='story-market-head'><span>Review signal</span><span>session by session</span></div>
            <div className='story-market-bars' aria-hidden='true'>
              {MARKET_BARS.map((height, index) => (
                <span className='story-market-bar' style={{ height: `${height}%` }} key={`${height}-${index}`} />
              ))}
            </div>
          </div>

          <div className='story-code-line'>
            <Code2 size={16} />
            <span>mission = capture execution + preserve context + improve the next decision</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function TheStoryPage() {
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const activeProductRef = useRef(0);
  const [activeProduct, setActiveProduct] = useState(0);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis = null;
    let tickerCallback = null;

    if (!reducedMotion) {
      lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      gsap.to('.story-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
      });

      if (!reducedMotion) {
        gsap.utils.toArray('.story-reveal').forEach((element) => {
          gsap.fromTo(
            element,
            { y: 34, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.82,
              ease: 'power3.out',
              scrollTrigger: { trigger: element, start: 'top 84%', once: true },
            },
          );
        });

        gsap.to('.story-board-inner', {
          yPercent: -3,
          ease: 'none',
          scrollTrigger: { trigger: '.story-hero', start: 'top top', end: 'bottom top', scrub: true },
        });

        const stage = stageRef.current;
        const card = cardRef.current;

        const mm = gsap.matchMedia();
        mm.add({
          isDesktop: '(min-width: 900px)',
          isMobile: '(max-width: 899px)'
        }, (context) => {
          const { isDesktop } = context.conditions;

          if (stage) {
            ScrollTrigger.create({
              trigger: '.story-showcase-pin-wrapper',
              start: isDesktop ? 'top top+=88' : 'top 72%',
              end: isDesktop ? () => `+=${window.innerHeight * 3}` : 'bottom 28%',
              pin: isDesktop ? '.story-showcase-pin-wrapper' : false,
              scrub: 0.7,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const rawStep = self.progress * (PRODUCT_STEPS.length - 1);
                const nextStep = Math.min(PRODUCT_STEPS.length - 1, Math.round(rawStep));
                const next = PRODUCT_STEPS[nextStep];

                stage.style.setProperty('--stage-progress', self.progress.toFixed(3));
                stage.style.setProperty('--stage-shift', isDesktop ? `${gsap.utils.interpolate(-18, 18, self.progress)}px` : '0px');
                stage.style.setProperty('--stage-accent', next.accent);
                stage.style.setProperty('--stage-accent-soft', next.soft);

                if (activeProductRef.current !== nextStep) {
                  activeProductRef.current = nextStep;
                  setActiveProduct(nextStep);

                  if (card) {
                    gsap.fromTo(card, { autoAlpha: 0.58, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' });
                  }
                }
              },
            });
          }
        });
      }
    });
    ScrollTrigger.refresh();

    return () => {
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
      if (lenis) lenis.destroy();
      ctx.revert();
    };
  }, []);

  const activeStep = PRODUCT_STEPS[activeProduct];
  const ActiveIcon = activeStep.icon;

  return (
    <>
      <PublicNavbar />
      <main className='story-page'>
        <style>{STYLES}</style>
        <div className='story-progress' />

        <section className='story-hero'>
          <div className='story-shell story-hero-grid'>
            <div className='story-hero-copy'>
              <span className='story-eyebrow story-reveal'>The Story</span>
              <h1 className='story-title-xl story-reveal'>A trading journal built from the <Highlight>desk it serves.</Highlight></h1>
              <p className='story-lede story-reveal'>
                I am Gaveen Perera, a developer and gold trader. XAU Journal began with a personal problem:
                every session produced data, screenshots, notes, emotions, and lessons, but no clean system to
                connect them. The company exists to turn that review discipline into a SaaS product for millions
                of traders.
              </p>
              <div className='story-actions story-reveal'>
                <StoryButton to='/signup'>Start journaling <ArrowRight size={17} /></StoryButton>
                <StoryButton to='#product-showcase' variant='secondary'>See the creation</StoryButton>
              </div>

              <div className='story-proof story-reveal' aria-label='Story highlights'>
                {HERO_PROOF.map(([label, value, detail]) => (
                  <div className='story-proof-item' key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <p>{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <MissionBoard />
          </div>
        </section>

        <section className='story-section'>
          <div className='story-shell'>
            <SectionHeading eyebrow='Origin' title={<>The company began with a <Highlight>workflow failure.</Highlight></>}>
              Good traders do not need more noise after the closing bell. They need a clear record of what
              happened, why it happened, and what must change before the next session.
            </SectionHeading>

            <div className='story-split'>
              <article className='story-statement story-reveal'>
                <blockquote>When review takes longer than the session, the habit breaks.</blockquote>
                <p>
                  XAU Journal was created to protect that habit. It connects execution, context, and analysis
                  so the trader can spend less time rebuilding the past and more time improving the next trade.
                </p>
              </article>

              <div className='story-list'>
                {ORIGIN_POINTS.map((point) => {
                  const Icon = point.icon;

                  return (
                    <article className='story-item story-reveal' key={point.title}>
                      <span className='story-icon'><Icon size={20} /></span>
                      <div>
                        <h3>{point.title}</h3>
                        <p>{point.body}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className='story-section'>
          <div className='story-shell story-split'>
            <aside className='story-founder-note story-reveal'>
              <div className='story-founder-mark'>G.P</div>
              <h3>Built by the <Highlight>trader</Highlight> using it.</h3>
              <p>
                That is the constraint behind the product. I write the code, but I also have to trust the result
                after real trades. The page is the company story, and the company story is product discipline.
              </p>
              <div className='story-founder-meta' aria-label='Founder roles'>
                <span>Developer</span>
                <span>XAUUSD trader</span>
                <span>Product owner</span>
              </div>
            </aside>

            <div className='story-list'>
              {FOUNDER_TIMELINE.map(([number, title, body]) => (
                <article className='story-timeline-item story-reveal' key={title}>
                  <span className='story-timeline-number'>{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className='story-showcase' id='product-showcase'>
          <div className='story-shell'>
            <SectionHeading eyebrow='Creation' title={<>How a private workflow became a <Highlight>product.</Highlight></>}>
              The scroll below follows the product logic: capture the trade, attach the reason, read the
              pattern, then scale the discipline through software.
            </SectionHeading>

            <div className='story-showcase-pin-wrapper w-full'>
              <div
                className='story-showcase-stage'
                ref={stageRef}
                style={{ '--stage-accent': activeStep.accent, '--stage-accent-soft': activeStep.soft }}
              >
                <div className='story-reveal'>
                  <span className='story-stage-label'><ActiveIcon size={18} />{activeStep.key}</span>
                  <h2 className='story-title-lg'><Highlight>{activeStep.key}</Highlight>: {activeStep.outcome}</h2>
                  <p className='story-copy'>{activeStep.body}</p>

                  <div className='story-stage-progress' aria-label='Product creation progress'>
                    {PRODUCT_STEPS.map((step, index) => (
                      <span className={`story-stage-step ${activeProduct === index ? 'is-active' : ''}`} key={step.key}>
                        {step.label} {step.key}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='story-product-shell story-reveal'>
                  <article className='story-product-panel' ref={cardRef} aria-live='polite'>
                    <div className='story-product-head'>
                      <span>XAU Journal system</span>
                      <strong>{activeStep.title}</strong>
                    </div>

                    <div className='story-product-body'>
                      <div className='story-product-main'>
                        <div className='story-product-number' aria-hidden='true'>{activeStep.label}</div>
                        <div className='story-product-detail'>
                          <h3 className='story-title-md'><Highlight>{activeStep.title}</Highlight></h3>
                          <p className='story-product-outcome'>{activeStep.outcome}</p>
                          <p>{activeStep.body}</p>

                          <div className='story-product-rows'>
                            {activeStep.rows.map(([label, value]) => (
                              <div className='story-product-row' key={label}>
                                <span>{label}</span>
                                <strong>{value}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='story-section'>
          <div className='story-shell story-split'>
            <div className='story-scale-lead story-reveal'>
              <span className='story-eyebrow'>Company</span>
              <h2 className='story-title-lg'>A SaaS product with a <Highlight>trading-desk standard.</Highlight></h2>
              <p className='story-copy'>
                The ambition is not to create another dashboard. It is to build durable review infrastructure for
                traders who want their history, discipline, and decisions in one place.
              </p>
            </div>

            <div className='story-list'>
              {SCALE_POINTS.map((point) => {
                const Icon = point.icon;

                return (
                  <article className='story-scale-item story-reveal' key={point.title}>
                    <span className='story-icon'><Icon size={20} /></span>
                    <div>
                      <h3>{point.title}</h3>
                      <p>{point.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className='story-section'>
          <div className='story-shell story-split'>
            <SectionHeading eyebrow='Principles' title={<>The roadmap stays close to the <Highlight>trading desk.</Highlight></>}>
              The product should get calmer and more useful as it grows. These principles keep the company from
              drifting into feature noise.
            </SectionHeading>

            <div className='story-list'>
              {PRINCIPLES.map((principle) => (
                <div className='story-principle story-reveal' key={principle}>
                  <CheckCircle2 size={19} />
                  <span>{principle}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='story-final'>
          <div className='story-shell story-final-inner'>
            <div className='story-reveal'>
              <span className='story-eyebrow'>Next session</span>
              <h2 className='story-title-lg'>Built so review becomes <Highlight>better execution.</Highlight></h2>
              <p className='story-copy'>
                Start with the record. Add the context. Read the pattern. Improve the next session. That is the
                product promise and the reason XAU Journal exists.
              </p>
            </div>

            <div className='story-actions story-reveal'>
              <StoryButton to='/signup'>Start now <ArrowRight size={17} /></StoryButton>
              <StoryButton to='/pricing' variant='secondary'>View pricing</StoryButton>
            </div>
          </div>
        </section>

        <PublicFooter />

      </main>
    </>
  );
}
