import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Facebook, Instagram, TwitterX, Discord } from 'react-bootstrap-icons';
import {
  Activity,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  LineChart,
  LockKeyhole,
  NotebookPen,
  PlugZap,
  Target,
  TrendingUp,
} from 'lucide-react';

import Logo from '../components/Logo';
import { FooterNav } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const HERO_IMAGE = '/story-trader-builder.png';

const PROOF_POINTS = [
  { value: 'XAUUSD', label: 'Built around the way gold actually moves.' },
  { value: 'MT4/MT5', label: 'Sync-first workflow instead of manual entry.' },
  { value: 'Solo', label: 'Designed by the trader who needed it.' },
];

const PROBLEMS = [
  {
    icon: Target,
    title: 'Generic journals got gold wrong',
    body: 'Pip value, contract sizing, and P&L assumptions break quickly when a tool treats XAUUSD like another FX pair.',
  },
  {
    icon: NotebookPen,
    title: 'Manual logging killed the review habit',
    body: 'After a live session, the last thing a trader wants is another hour of spreadsheet cleanup before the real learning starts.',
  },
  {
    icon: Activity,
    title: 'Useful patterns were buried',
    body: 'Sessions, drawdown, psychology, and setup quality need to sit together before your process becomes readable.',
  },
];

const TIMELINE = [
  { title: 'Trader first', body: 'The app started from my own XAUUSD review problem, not a generic SaaS roadmap.' },
  { title: 'Local workflow first', body: 'The first version was practical: capture the trade, preserve the context, and make review faster.' },
  { title: 'Product second', body: 'Once the workflow proved useful, I turned it into a product other gold traders could use.' },
];

const PRODUCT_STEPS = [
  {
    key: 'Sync',
    color: '#65ff57',
    glow: 'rgba(101, 255, 87, 0.58)',
    icon: PlugZap,
    title: 'Sync the trade record',
    body: 'Closed trades can flow into the journal so review starts from structured data instead of hand-entered rows.',
    rows: [['Source', 'MT4 / MT5'], ['State', 'Closed trades'], ['Result', 'Less admin']],
  },
  {
    key: 'Review',
    color: '#5edfff',
    glow: 'rgba(94, 223, 255, 0.58)',
    icon: NotebookPen,
    title: 'Add the trading context',
    body: 'Notes, screenshots, session labels, and psychology sit beside the trade instead of living in scattered files.',
    rows: [['Context', 'Setup + session'], ['Mindset', 'Pre-trade notes'], ['Evidence', 'Screenshots']],
  },
  {
    key: 'Analyze',
    color: '#ffb86b',
    glow: 'rgba(255, 184, 107, 0.56)',
    icon: BarChart3,
    title: 'Read the patterns clearly',
    body: 'Profit factor, drawdown, win rate, session behavior, and calendar rhythm become easier to compare.',
    rows: [['Metrics', 'PF / win rate'], ['Risk', 'Drawdown'], ['Pattern', 'Session edge']],
  },
  {
    key: 'Improve',
    color: '#b58cff',
    glow: 'rgba(181, 140, 255, 0.56)',
    icon: TrendingUp,
    title: 'Turn review into rules',
    body: 'The final output is not another dashboard. It is a cleaner playbook for your next XAUUSD session.',
    rows: [['Output', 'Playbook'], ['Action', 'Keep / fix / stop'], ['Goal', 'Cleaner execution']],
  },
];

const FEATURES = [
  { icon: Cloud, title: 'Cloud-backed review', body: 'Your history is available when you need it, not trapped in one local spreadsheet.' },
  { icon: LockKeyhole, title: 'Private workspace', body: 'Trading data is sensitive, so the experience is designed around focus and control.' },
  { icon: LineChart, title: 'XAU-first metrics', body: 'The product is intentionally specialized instead of trying to become a generic all-market tracker.' },
  { icon: Code2, title: 'Builder-owned roadmap', body: 'Features are filtered by real trading utility, not investor pressure or demo-friendly noise.' },
  { icon: Database, title: 'Structured records', body: 'Trades, notes, screenshots, sessions, and outcomes stay connected for review.' },
  { icon: CalendarDays, title: 'Calendar rhythm', body: 'Daily performance becomes easier to inspect when the whole month is visible.' },
];


const PRINCIPLES = [
  'One instrument done properly beats thirty instruments done badly.',
  'Every feature should reduce review friction or expose a real trading pattern.',
  'The product should feel like a quiet trading desk, not a noisy marketing dashboard.',
  'I build it as the person who has to trust it after a live session.',
];

const STYLES = `
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }
  .lenis.lenis-stopped { overflow: hidden; }

  .story-page {
    --story-bg: #f8fbff;
    --story-ink: #08111f;
    --story-muted: #53647c;
    --story-soft: rgba(8, 17, 31, 0.055);
    --story-border: rgba(8, 17, 31, 0.1);
    --story-card: rgba(255, 255, 255, 0.78);
    --story-card-solid: #ffffff;
    --story-shadow: 0 24px 80px rgba(15, 23, 42, 0.1);
    --story-cyan: #00c8e8;
    --story-orange: #ff6b43;
    --story-green: #24c66d;
    --story-violet: #8b5cf6;
    min-height: 100vh;
    background:
      radial-gradient(circle at 10% 8%, rgba(0, 200, 232, 0.16), transparent 32rem),
      radial-gradient(circle at 90% 14%, rgba(255, 107, 67, 0.11), transparent 28rem),
      linear-gradient(180deg, #ffffff 0%, var(--story-bg) 42%, #ffffff 100%);
    color: var(--story-ink);
    font-family: 'Poppins', 'Inter', system-ui, sans-serif;
    position: relative;
    overflow: clip;
  }

  .dark .story-page {
    --story-bg: #030507;
    --story-ink: #f7fbff;
    --story-muted: rgba(247, 251, 255, 0.68);
    --story-soft: rgba(255, 255, 255, 0.055);
    --story-border: rgba(255, 255, 255, 0.1);
    --story-card: rgba(255, 255, 255, 0.055);
    --story-card-solid: #070a0f;
    --story-shadow: 0 24px 80px rgba(0, 0, 0, 0.58);
    background:
      radial-gradient(circle at 10% 8%, rgba(0, 200, 232, 0.14), transparent 30rem),
      radial-gradient(circle at 90% 14%, rgba(139, 92, 246, 0.11), transparent 30rem),
      linear-gradient(180deg, #000000 0%, var(--story-bg) 48%, #000000 100%);
  }

  .story-page > section, .story-page > footer { position: relative; z-index: 1; }
  .story-grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(var(--story-soft) 1px, transparent 1px), linear-gradient(90deg, var(--story-soft) 1px, transparent 1px); background-size: 80px 80px; mask-image: linear-gradient(to bottom, black 0%, transparent 78%); }
  .story-progress { position: fixed; inset: 0 auto auto 0; width: 100%; height: 3px; transform: scaleX(0); transform-origin: left; z-index: 1000; background: linear-gradient(90deg, var(--story-cyan), var(--story-orange), var(--story-violet)); }
  .story-shell { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; }

  .story-kicker, .story-section-kicker { display: inline-flex; align-items: center; gap: 0.6rem; width: fit-content; border: 1px solid var(--story-border); border-radius: 999px; background: var(--story-card); padding: 0.5rem 0.85rem; color: var(--story-cyan); font-size: 0.68rem; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: blur(16px) saturate(140%); }
  .story-kicker::before, .story-section-kicker::before { content: ''; width: 0.45rem; height: 0.45rem; border-radius: 999px; background: currentColor; box-shadow: 0 0 16px currentColor; }

  .story-hero { min-height: auto; display: grid; align-items: center; padding: clamp(8rem, 11vw, 10rem) 0 clamp(4.5rem, 8vw, 6.5rem); }
  .story-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: clamp(2rem, 5vw, 3.5rem); }
  .story-hero-copy-block { max-width: 960px; margin: 0 auto; display: grid; justify-items: center; text-align: center; }
  .story-hero-title { margin-top: 1.35rem; max-width: 940px; color: var(--story-ink); font-size: clamp(2.55rem, 5.4vw, 5rem) !important; line-height: 1.02 !important; font-weight: 900 !important; letter-spacing: 0 !important; text-wrap: balance; }
  .story-gradient-text, .story-aurora-word { background: linear-gradient(90deg, #FF3CAC 0%, #8B5CF6 25%, #00D4FF 50%, #8B5CF6 75%, #FF3CAC 100%); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; animation: storyGradientText 7s linear infinite; }
  .story-aurora-word { display: inline-block; }
  @keyframes storyGradientText {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  .story-hero-copy, .story-section-copy { color: var(--story-muted); font-weight: 600; line-height: 1.75; }
  .story-hero-copy { margin-top: 1.35rem; max-width: 720px; font-size: clamp(1rem, 1.35vw, 1.12rem); }
  .story-hero-actions { margin-top: 2rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.8rem; }
  .story-primary, .story-secondary { min-height: 3rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.55rem; border-radius: 999px; padding: 0 1.25rem; font-size: 0.86rem; font-weight: 900; transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease; }
  .story-primary { border: 1px solid rgba(0, 200, 232, 0.42); background: linear-gradient(135deg, var(--story-cyan), var(--story-violet)); color: white; box-shadow: 0 18px 48px rgba(0, 200, 232, 0.22); }
  .story-secondary { border: 1px solid var(--story-border); background: var(--story-card); color: var(--story-ink); }
  .story-primary:hover, .story-secondary:hover { transform: translateY(-2px); }
  .story-hero-proof { margin-top: 2rem; width: min(840px, 100%); display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; }
  .story-proof-card, .story-glass-card, .story-feature-card, .story-builder-card { border: 1px solid var(--story-border); background: var(--story-card); box-shadow: var(--story-shadow); backdrop-filter: blur(18px) saturate(140%); -webkit-backdrop-filter: blur(18px) saturate(140%); }
  .story-proof-card { border-radius: 1.1rem; padding: 1rem; }
  .story-proof-card strong { display: block; color: var(--story-ink); font-size: 1.08rem; font-weight: 900; }
  .story-proof-card span { display: block; margin-top: 0.25rem; color: var(--story-muted); font-size: 0.74rem; font-weight: 700; line-height: 1.35; }

  .story-hero-visual { position: relative; width: min(1060px, 100%); min-height: auto; margin: 0 auto; }
  .story-hero-frame { position: relative; top: auto; overflow: hidden; border: 1px solid var(--story-border); border-radius: 1.6rem; background: #070a0f; box-shadow: 0 30px 90px rgba(0, 0, 0, 0.26); transform-style: preserve-3d; }
  .story-hero-frame img { display: block; width: 100%; min-height: clamp(320px, 38vw, 500px); object-fit: cover; opacity: 0.92; }
  .story-hero-frame::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.82) 100%), radial-gradient(circle at 18% 20%, rgba(0, 200, 232, 0.28), transparent 24rem); pointer-events: none; }
  .story-visual-caption { position: absolute; left: 1.2rem; right: 1.2rem; bottom: 1.2rem; z-index: 2; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 1.2rem; background: rgba(4, 8, 12, 0.74); padding: 1rem; color: white; backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: blur(16px) saturate(140%); }
  .story-visual-caption p { margin-top: 0.35rem; color: rgba(255, 255, 255, 0.68); font-size: 0.78rem; line-height: 1.5; font-weight: 600; }

  .story-section { padding: clamp(4.5rem, 9vw, 8rem) 0; }
  .story-section-head { max-width: 720px; margin-bottom: clamp(2rem, 5vw, 3.5rem); }
  .story-section-title { margin-top: 1rem; color: var(--story-ink); font-size: clamp(2.3rem, 5vw, 4.7rem) !important; line-height: 1.02 !important; font-weight: 900 !important; letter-spacing: 0 !important; }
  .story-section-copy { margin-top: 1rem; font-size: clamp(1rem, 1.45vw, 1.12rem); }
  .story-problem-grid, .story-builder-grid, .story-philosophy { display: grid; grid-template-columns: 0.92fr 1.08fr; gap: 1rem; align-items: stretch; }
  .story-glass-card, .story-builder-card { border-radius: 1.5rem; padding: clamp(1.25rem, 3vw, 2rem); }
  .story-quote { min-height: 100%; display: flex; flex-direction: column; justify-content: space-between; background: radial-gradient(circle at 0% 0%, rgba(0, 200, 232, 0.14), transparent 22rem), var(--story-card); }
  .story-quote blockquote { color: var(--story-ink); font-size: clamp(1.45rem, 3vw, 2.4rem); line-height: 1.22; font-weight: 900; }
  .story-quote p { margin-top: 1.4rem; color: var(--story-muted); font-weight: 600; line-height: 1.7; }
  .story-problem-list, .story-timeline, .story-principles { display: grid; gap: 1rem; }
  .story-mini-card { display: grid; grid-template-columns: auto 1fr; gap: 1rem; border-radius: 1.25rem; padding: 1.15rem; }
  .story-icon { display: inline-flex; width: 2.55rem; height: 2.55rem; align-items: center; justify-content: center; border-radius: 0.9rem; background: rgba(0, 200, 232, 0.11); color: var(--story-cyan); }
  .story-mini-card h3, .story-feature-card h3, .story-builder-card h3 { color: var(--story-ink); font-size: 1.08rem !important; line-height: 1.2 !important; font-weight: 900 !important; }
  .story-mini-card p, .story-feature-card p, .story-builder-card p { margin-top: 0.45rem; color: var(--story-muted); font-size: 0.9rem; line-height: 1.62; font-weight: 600; }
  .story-builder-grid { grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr); align-items: start; }
  .story-builder-card { position: sticky; top: 6.5rem; }
  .story-avatar { width: 4.5rem; height: 4.5rem; display: grid; place-items: center; border-radius: 1.25rem; color: white; background: linear-gradient(135deg, var(--story-cyan), var(--story-violet)); font-size: 1.6rem; font-weight: 900; box-shadow: 0 16px 48px rgba(0, 200, 232, 0.22); }
  .story-builder-card h3 { margin-top: 1.25rem; font-size: 1.55rem !important; }
  .story-timeline-item { position: relative; border-left: 1px solid var(--story-border); padding-left: 1.25rem; }
  .story-timeline-item::before { content: ''; position: absolute; left: -0.38rem; top: 0.3rem; width: 0.72rem; height: 0.72rem; border-radius: 999px; background: var(--story-cyan); box-shadow: 0 0 18px rgba(0, 200, 232, 0.56); }
`;

const SHOWCASE_STYLES = `
  .story-showcase { padding: clamp(4rem, 8vw, 7rem) 0; }
  .story-showcase-title { color: var(--story-ink); font-size: clamp(2.6rem, 7vw, 6rem) !important; line-height: 0.95 !important; font-weight: 900 !important; letter-spacing: 0 !important; }
  .story-showcase-stage { --pin-progress: 0; --indicator-x: 0%; --card-shift: 0px; --step-color: #65ff57; --step-glow: rgba(101, 255, 87, 0.58); --pin-surface: #f6fbff; --pin-surface-2: #ffffff; --pin-text: #08111f; --pin-muted: rgba(8, 17, 31, 0.6); --pin-card: #ffffff; --pin-row: rgba(0, 200, 232, 0.08); position: relative; min-height: min(78vh, 760px); margin-top: 1.4rem; overflow: clip; border: 0; border-radius: 0; background: transparent; color: var(--pin-text); box-shadow: none; transition: color 260ms ease; }
  .dark .story-showcase-stage { --pin-surface: #080c0d; --pin-surface-2: #091314; --pin-text: #fffceb; --pin-muted: rgba(255, 252, 235, 0.52); --pin-card: #081010; --pin-row: rgba(94, 223, 255, 0.08); border-color: transparent; box-shadow: none; }
  .story-showcase-stage::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 72% 50%, var(--step-glow), transparent 24rem), linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent 46%); opacity: 0.18; pointer-events: none; transition: background 260ms ease; }
  .dark .story-showcase-stage::before { opacity: 0.24; background: radial-gradient(circle at 72% 50%, var(--step-glow), transparent 24rem), linear-gradient(90deg, rgba(36, 198, 109, 0.045), transparent 45%); }
  .story-pin-grid { position: relative; z-index: 1; min-height: inherit; display: grid; grid-template-columns: minmax(240px, 0.72fr) minmax(320px, 1fr); align-items: center; gap: clamp(2rem, 8vw, 7rem); padding: clamp(2rem, 7vw, 5.5rem); }
  .story-pin-copy { border-left: 2px solid var(--step-color); padding-left: 1rem; color: var(--pin-text); font-size: clamp(1.55rem, 3vw, 2.6rem); line-height: 1.32; font-weight: 700; transition: border-color 260ms ease, color 260ms ease; }
  .story-pin-copy span { display: block; color: var(--pin-text); transition: color 260ms ease, text-shadow 260ms ease; }
  .story-pin-copy .story-pin-step-name { color: var(--step-color); text-shadow: 0 0 18px var(--step-glow); }
  .story-pin-eyebrow { margin-bottom: 0.75rem; color: var(--pin-muted); font-size: 0.72rem; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; }
  .story-pin-card-wrap { display: grid; justify-items: center; transform: translateX(var(--card-shift)); transition: transform 300ms ease; }
  .story-pin-card { position: relative; width: min(360px, 80vw); min-height: 500px; display: flex; flex-direction: column; justify-content: space-between; border: 3px solid var(--step-color); border-radius: 1.1rem; background: var(--pin-card); color: var(--step-color); padding: 1.25rem; box-shadow: 0 0 0 1px var(--step-glow), 0 24px 80px var(--step-glow); transition: border-color 260ms ease, box-shadow 260ms ease, background 260ms ease, color 260ms ease; }
  .story-pin-card::before, .story-pin-card::after { content: ''; position: absolute; width: 2rem; height: 2rem; background: var(--step-color); clip-path: polygon(50% 0, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0 50%, 36% 36%); filter: drop-shadow(0 0 14px var(--step-glow)); transition: background 260ms ease, filter 260ms ease; }
  .story-pin-card::before { left: 2.2rem; bottom: 5.2rem; }
  .story-pin-card::after { right: 2.2rem; bottom: 5.2rem; }
  .story-card-top, .story-card-bottom { display: flex; align-items: center; justify-content: center; color: var(--step-color); font-size: 1rem; font-weight: 900; text-align: center; transition: color 260ms ease; }
  .story-card-bottom { transform: rotate(180deg); }
  .story-card-number { display: grid; place-items: center; min-height: 190px; color: var(--step-color); font-size: clamp(5rem, 12vw, 8rem); line-height: 1; font-weight: 900; text-shadow: 0 0 28px var(--step-glow); transition: color 260ms ease, text-shadow 260ms ease; }
  .story-card-star { position: absolute; top: 8rem; left: 50%; width: 2.2rem; height: 2.2rem; transform: translateX(-50%); background: var(--step-color); clip-path: polygon(50% 0, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0 50%, 36% 36%); filter: drop-shadow(0 0 14px var(--step-glow)); transition: background 260ms ease, filter 260ms ease; }
  .story-card-side { position: absolute; top: 50%; color: var(--step-color); font-size: 0.68rem; font-weight: 900; letter-spacing: 0.04em; writing-mode: vertical-rl; transform: translateY(-50%); transition: color 260ms ease; }
  .story-card-side.left { left: 0.55rem; }
  .story-card-side.right { right: 0.55rem; }
  .story-card-body { color: var(--pin-muted); font-weight: 750; line-height: 1.55; }
  .story-card-rows { display: grid; gap: 0.55rem; margin-top: 0.75rem; }
  .story-card-row { display: grid; grid-template-columns: 0.78fr 1fr; gap: 0.75rem; border-radius: 0.75rem; background: var(--pin-row); padding: 0.65rem 0.8rem; }
  .story-card-row span { color: var(--pin-muted); font-size: 0.72rem; font-weight: 800; }
  .story-card-row strong { color: var(--pin-text); font-size: 0.76rem; font-weight: 900; text-align: right; }
  .story-pin-card > div:not([class]) { padding-inline: 1.35rem; }
  .story-pin-scrollbar { position: absolute; top: 0; right: 0; width: 0.55rem; height: 100%; background: transparent; }
  .story-pin-thumb { position: absolute; top: 0; left: 0; right: 0; height: 26%; border-radius: 999px; background: var(--step-color); box-shadow: 0 0 18px var(--step-glow); transform: translateY(calc(var(--pin-progress) * 285%)); transition: background 260ms ease, box-shadow 260ms ease; }
  .story-lateral-indicator { position: absolute; left: clamp(2rem, 7vw, 5.5rem); right: clamp(2rem, 7vw, 5.5rem); bottom: 1.5rem; z-index: 2; }

  .story-lateral-progress { position: absolute; left: 0; top: 0; bottom: 0; width: 25%; border-radius: 999px; background: var(--step-color); box-shadow: 0 0 20px var(--step-glow); opacity: 0.28; transform: translateX(var(--indicator-x)); transition: transform 260ms ease, background 260ms ease, box-shadow 260ms ease; }
  .story-lateral-steps { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; }
  .story-lateral-step { min-height: 2.5rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; border: 1px solid transparent; border-radius: 999px; background: transparent; color: var(--pin-muted); font-size: 0.76rem; font-weight: 900; transition: color 220ms ease, border-color 220ms ease, background 220ms ease; }
  .story-lateral-step.is-active { color: var(--step-color); border-color: transparent; background: transparent; text-shadow: 0 0 14px var(--step-glow); }

  .story-feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
  .story-feature-card { border-radius: 1.35rem; padding: 1.25rem; }
  .story-principle { display: flex; gap: 0.8rem; align-items: flex-start; border-radius: 1rem; padding: 1rem; background: var(--story-soft); color: var(--story-muted); font-weight: 650; line-height: 1.55; }
  .story-principle svg { color: var(--story-green); margin-top: 0.16rem; flex: 0 0 auto; }
`;

const FINAL_STYLES = `
  .story-final { padding: clamp(5rem, 9vw, 8rem) 0; }
  .story-final-card { overflow: hidden; border-radius: 2rem; background: radial-gradient(circle at 16% 20%, rgba(0, 200, 232, 0.26), transparent 26rem), radial-gradient(circle at 88% 20%, rgba(255, 107, 67, 0.2), transparent 24rem), #071013; color: white; padding: clamp(2rem, 6vw, 4rem); box-shadow: 0 30px 90px rgba(0, 0, 0, 0.3); }
  .story-final-card h2 { max-width: 830px; color: white; font-size: clamp(2.4rem, 5.7vw, 5rem) !important; line-height: 1 !important; font-weight: 900 !important; }
  .story-final-card p { max-width: 680px; margin-top: 1rem; color: rgba(255,255,255,0.72); font-weight: 600; line-height: 1.7; }
  .story-footer { padding: 4.5rem 1.5rem; background: var(--story-soft); }
  .story-scroll-top { position: fixed; right: 1.4rem; bottom: 1.4rem; z-index: 90; width: 2.85rem; height: 2.85rem; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--story-border); border-radius: 999px; background: var(--story-card); color: var(--story-ink); box-shadow: var(--story-shadow); backdrop-filter: blur(16px) saturate(140%); -webkit-backdrop-filter: blur(16px) saturate(140%); transition: transform 220ms ease, opacity 220ms ease; }
  .story-reveal { will-change: transform, opacity; }

  @media (max-width: 1023px) {
    .story-problem-grid, .story-builder-grid, .story-philosophy, .story-footer-grid { grid-template-columns: 1fr; }
    .story-hero { min-height: auto; }
    .story-hero-visual { min-height: auto; }
    .story-hero-frame img { min-height: 380px; }
    .story-builder-card { position: relative; top: auto; }
    .story-feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .story-showcase-stage { min-height: auto; }
    .story-showcase { overflow: clip; }
    .story-pin-grid { min-height: auto; grid-template-columns: 1fr; gap: 1.5rem; padding: 2rem 1.5rem 7rem; }
    .story-pin-card-wrap { justify-items: center; transform: none !important; }
    .story-lateral-indicator { left: 1rem; right: 1rem; }
    .story-lateral-step { font-size: 0.68rem; }
    .story-socials { justify-content: flex-start; }
  }

  @media (max-width: 640px) {
    .story-shell { width: min(100% - 1.25rem, 1180px); }
    .story-hero { padding-top: 6.8rem; }
    .story-hero-title { font-size: clamp(2.15rem, 10.8vw, 3.15rem) !important; line-height: 1.04 !important; }
    .story-hero-proof, .story-feature-grid { grid-template-columns: 1fr; }
    .story-hero-actions { flex-direction: column; }
    .story-primary, .story-secondary { width: 100%; }
    .story-hero-frame img { min-height: 280px; }
    .story-section, .story-showcase { padding: 4rem 0; }
    .story-showcase-stage { border-radius: 0; margin-inline: 0; min-height: auto; }
    .story-pin-grid { padding: 1.2rem 0 8.5rem; }
    .story-pin-copy { font-size: 1.6rem; }
    .story-pin-card { width: min(100%, 320px); min-height: 420px; padding: 1rem; }
    .story-card-number { min-height: 140px; }
    .story-glass-card, .story-builder-card, .story-feature-card { border-radius: 1.2rem; }
    .story-lateral-indicator { left: 0; right: 0; bottom: 0.75rem; }
    .story-lateral-progress { display: none; }
    .story-lateral-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.35rem; }
    .story-lateral-step { min-height: 2.35rem; background: rgba(255,255,255,0.04); }
    .story-lateral-step svg { display: inline-flex; }
    .story-footer { padding: 3rem 1rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-reveal, .story-hero-frame, .story-pin-card-wrap { opacity: 1 !important; transform: none !important; }
    .story-gradient-text, .story-aurora-word { animation: none !important; }
  }
`;

function StoryButton({ to, children, variant = 'primary' }) {
  return (
    <Link to={to} className={variant === 'primary' ? 'story-primary' : 'story-secondary'}>
      {children}
    </Link>
  );
}

function SectionHeading({ kicker, title, children }) {
  return (
    <div className="story-section-head story-reveal">
      <span className="story-section-kicker">{kicker}</span>
      <h2 className="story-section-title">{title}</h2>
      {children ? <p className="story-section-copy">{children}</p> : null}
    </div>
  );
}

function Footer() {
  return (
    <footer className="story-footer">
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <Logo iconSize="w-7 h-7" />
          <FooterNav
            className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold md:justify-end"
            linkClassName="transition hover:text-cyan-300"
            style={{ color: 'var(--story-muted)' }}
          />
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 pt-8 md:flex-row">
          <p className="order-2 text-center text-[9px] font-black uppercase tracking-[0.2em] md:order-1 md:text-left" style={{ color: 'var(--story-muted)' }}>
            Copyright 2026 Xau Journal. All Rights Reserved.
          </p>

          <div className="order-1 flex flex-col items-center gap-4 md:order-2 md:items-end">
            <ul className="example-2">
              <li className="icon-content">
                <a data-social="facebook" aria-label="Facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                  <div className="filled" />
                  <Facebook />
                </a>
              </li>
              <li className="icon-content">
                <a data-social="instagram" aria-label="Instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                  <div className="filled" />
                  <Instagram />
                </a>
              </li>
              <li className="icon-content">
                <a data-social="x" aria-label="X" href="https://x.com/xau_journal" target="_blank" rel="noopener noreferrer">
                  <div className="filled" />
                  <TwitterX />
                </a>
              </li>
              <li className="icon-content">
                <a data-social="discord" aria-label="Discord" href="https://discord.gg/smbNwBZC2" target="_blank" rel="noopener noreferrer">
                  <div className="filled" />
                  <Discord />
                </a>
              </li>
            </ul>
            <p className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] md:justify-end" style={{ color: 'var(--story-muted)' }}>
              made with ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}export default function TheStoryPage() {
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const activeProductRef = useRef(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    let rafId = 0;

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.to('.story-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
      });

      if (!reducedMotion) {
        gsap.from('.story-reveal', {
          y: 42,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.story-page', start: 'top 75%' },
        });

        gsap.to('.story-hero-frame', {
          yPercent: 8,
          rotateX: -2,
          ease: 'none',
          scrollTrigger: { trigger: '.story-hero', start: 'top top', end: 'bottom top', scrub: true },
        });
      }

      const stage = stageRef.current;
      const card = cardRef.current;
      if (stage) {
        ScrollTrigger.create({
          trigger: stage,
          start: 'top top+=80',
          end: () => `+=${window.innerHeight * 3.2}`,
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const rawStep = self.progress * (PRODUCT_STEPS.length - 1);
            const nextStep = Math.min(PRODUCT_STEPS.length - 1, Math.round(rawStep));
            stage.style.setProperty('--pin-progress', self.progress.toFixed(3));
            stage.style.setProperty('--indicator-x', `${rawStep * 100}%`);
            stage.style.setProperty('--card-shift', `${gsap.utils.interpolate(-28, 28, self.progress)}px`);
            stage.style.setProperty('--step-color', PRODUCT_STEPS[nextStep].color);
            stage.style.setProperty('--step-glow', PRODUCT_STEPS[nextStep].glow);

            if (activeProductRef.current !== nextStep) {
              activeProductRef.current = nextStep;
              setActiveProduct(nextStep);
              if (card && !reducedMotion) {
                gsap.fromTo(card, { autoAlpha: 0.55, y: 20, rotate: -2 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.32, ease: 'power2.out' });
              }
            }
          },
        });
      }

    });

    const handleScroll = () => setIsScrolled(window.scrollY > 360);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  const activeStep = PRODUCT_STEPS[activeProduct];

  return (
    <>
      <PublicNavbar />
      <main className="story-page">
        <style>{STYLES + SHOWCASE_STYLES + FINAL_STYLES}</style>
        <div className="story-grid-bg" />
        <div className="story-progress" />

        <section className="story-hero">
          <div className="story-shell story-hero-grid">
            <div className="story-hero-copy-block story-reveal">
              <span className="story-kicker">Trader built product</span>
              <h1 className="story-hero-title">I built the journal I needed after every <span className="story-gradient-text">XAUUSD</span> session.</h1>
              <p className="story-hero-copy">This is not a generic trading tracker with a gold label on it. XAU Journal is shaped around my own review pain: fast sync, honest context, and analytics that help the next session instead of decorating the last one.</p>
              <div className="story-hero-actions">
                <StoryButton to="/signup">Start journaling <ArrowRight size={17} /></StoryButton>
                <StoryButton to="/contact" variant="secondary">Talk about the product</StoryButton>
              </div>
              <div className="story-hero-proof">
                {PROOF_POINTS.map((point) => (
                  <div className="story-proof-card" key={point.value}>
                    <strong>{point.value}</strong>
                    <span>{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="story-hero-visual story-reveal">
              <figure className="story-hero-frame">
                <img src={HERO_IMAGE} alt="Anonymous trader-builder workstation with XAUUSD charts, code, and a trading journal" />
                <figcaption className="story-visual-caption">
                  <strong>Built between trades and code.</strong>
                  <p>The product comes from the same workflow it serves: review the trade, find the gap, improve the system.</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="story-section">
          <div className="story-shell">
            <SectionHeading kicker="Why I rebuilt it" title={<>The usual journal flow was <span className="story-aurora-word">too slow</span> for a real trading routine.</>}>
              The goal became simple: remove admin, keep context, and make review strong enough to change execution.
            </SectionHeading>
            <div className="story-problem-grid">
              <article className="story-glass-card story-quote story-reveal">
                <blockquote>When review takes longer than the session, the habit breaks.</blockquote>
                <p>XAU Journal is my answer to that problem: a trading desk style workflow where the product supports the review instead of becoming the work.</p>
              </article>
              <div className="story-problem-list">
                {PROBLEMS.map((problem) => {
                  const Icon = problem.icon;
                  return (
                    <article className="story-glass-card story-mini-card story-reveal" key={problem.title}>
                      <span className="story-icon"><Icon size={20} /></span>
                      <div>
                        <h3>{problem.title}</h3>
                        <p>{problem.body}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="story-section">
          <div className="story-shell story-builder-grid">
            <article className="story-builder-card story-reveal">
              <div className="story-avatar">G.P</div>
              <h3>Built by the trader using it.</h3>
              <p>The story is not a founder myth. It is a product constraint. I care about speed, clarity, and trust because I have to use this after real sessions too.</p>
            </article>
            <div className="story-timeline">
              {TIMELINE.map((item) => (
                <article className="story-glass-card story-timeline-item story-reveal" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="story-showcase" id="product-showcase">
          <div className="story-shell">
            <h2 className="story-showcase-title story-reveal">Product <span className="story-aurora-word">showcase</span></h2>
            <div className="story-showcase-stage" ref={stageRef} style={{ '--step-color': activeStep.color, '--step-glow': activeStep.glow }}>
              <div className="story-pin-grid">
                <div className="story-pin-copy" aria-live="polite">
                  <div className="story-pin-eyebrow"></div>
                  <span className="story-pin-step-name">{activeStep.key}</span>
                  <span>{activeProduct === 0 ? 'The Record' : activeProduct === 1 ? 'The Context' : activeProduct === 2 ? 'The Patterns' : 'The Rules'}</span>
                  <span>With</span>
                  <span>XAU Journal</span>
                </div>

                <div className="story-pin-card-wrap">
                  <article className="story-pin-card" ref={cardRef}>
                    <span className="story-card-side left">XAU</span>
                    <span className="story-card-side right">XAU</span>
                    <span className="story-card-star" />
                    <div className="story-card-top">{activeStep.title}</div>
                    <div className="story-card-number">{String(activeProduct + 1).padStart(2, '0')}</div>
                    <div>
                      <p className="story-card-body">{activeStep.body}</p>
                      <div className="story-card-rows">
                        {activeStep.rows.map(([label, value]) => (
                          <div className="story-card-row" key={label}>
                            <span>{label}</span>
                            <strong>{value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="story-card-bottom">{activeStep.title}</div>
                  </article>
                </div>
              </div>

              <div className="story-pin-scrollbar" aria-hidden="true"><span className="story-pin-thumb" /></div>
              <div className="story-lateral-indicator" aria-label="Product showcase progress">
                <div className="story-lateral-progress" />
                <div className="story-lateral-steps">
                  {PRODUCT_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <span className={`story-lateral-step ${activeProduct === index ? 'is-active' : ''}`} key={step.key}>
                        <Icon size={14} /> {step.key}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="story-section">
          <div className="story-shell">
            <SectionHeading kicker="What the product keeps" title={<>A focused <span className="story-aurora-word">workflow</span> for traders who review seriously.</>}>
              The app is built around the parts of journaling that actually change behavior after enough trades.
            </SectionHeading>
            <div className="story-feature-grid">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article className="story-feature-card story-reveal" key={feature.title}>
                    <span className="story-icon"><Icon size={20} /></span>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>


        <section className="story-section">
          <div className="story-shell story-philosophy">
            <SectionHeading kicker="Product principles" title={<>The <span className="story-aurora-word">roadmap</span> stays close to the trading desk.</>}>
              This page is a story, but the story has to keep showing up in the product decisions.
            </SectionHeading>
            <div className="story-principles">
              {PRINCIPLES.map((principle) => (
                <div className="story-principle story-reveal" key={principle}>
                  <CheckCircle2 size={19} />
                  <span>{principle}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="story-final">
          <div className="story-shell">
            <div className="story-final-card story-reveal">
              <h2>Built for traders who want review to become <span className="story-aurora-word">execution.</span></h2>
              <p>Start with sync. Add the context. Read the patterns. Improve the next session. That is the product promise and the reason I built it.</p>
              <div className="story-hero-actions">
                <StoryButton to="/signup">Start now <ArrowRight size={17} /></StoryButton>
                <StoryButton to="/pricing" variant="secondary">View pricing</StoryButton>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        <button
          type="button"
          className="story-scroll-top"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ opacity: isScrolled ? 1 : 0, pointerEvents: isScrolled ? 'auto' : 'none', transform: isScrolled ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <ArrowUp size={18} />
        </button>
      </main>
    </>
  );
}




