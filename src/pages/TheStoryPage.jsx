import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill, Facebook, Instagram, TwitterX, Discord } from 'react-bootstrap-icons';
import Logo from '../components/Logo';
import { PublicNavbar } from '../components/PublicNavbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STYLES = `
  .xj-story-container {
    --violet: #7c3aed;
    --violet-light: #a78bfa;
    --violet-faint: rgba(124,58,237,0.08);
    --gold: #c9a227;
    font-family: 'Poppins', sans-serif;
    background: var(--bg);
    color: var(--ink);
    position: relative;
    overflow: hidden;
  }


  /* ── NOISE GRAIN OVERLAY ── */
  .xj-story-container::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 180px;
    opacity: 0.028;
    pointer-events: none;
    z-index: 9000;
  }

  /* ── AMBIENT BLOBS ── */
  .xj-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    will-change: transform;
  }
  .xj-blob-1 {
    width: 700px; height: 700px;
    background: radial-gradient(circle, #c4b5fd 0%, transparent 70%);
    top: -200px; right: -200px;
    filter: blur(80px);
    opacity: 0.35;
  }
  .xj-blob-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #ddd6fe 0%, transparent 70%);
    bottom: 10%; left: -150px;
    filter: blur(70px);
    opacity: 0.3;
  }
  .xj-blob-3 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #fef3c7 0%, transparent 70%);
    top: 40%; right: 8%;
    filter: blur(90px);
    opacity: 0.25;
  }

  /* ── PROGRESS BAR ── */
  #xj-progress-bar {
    position: fixed;
    top: 0; left: 0;
    height: 2.5px;
    background: linear-gradient(90deg, var(--violet), var(--gold));
    width: 0%;
    z-index: 1000;
    transform-origin: left;
  }

  /* ── HERO ── */
  .xj-hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 160px 40px 100px;
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
  }
  .xj-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--violet);
    background: var(--violet-faint);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 7px 18px;
    margin-bottom: 40px;
    opacity: 0;
    width: fit-content;
  }
  .xj-badge-dot {
    width: 6px; height: 6px;
    background: var(--violet);
    border-radius: 50%;
  }
  .xj-hero-headline {
    font-family: 'Poppins', sans-serif;
    font-size: clamp(64px, 10vw, 130px);
    line-height: 1.02;
    letter-spacing: -0.025em;
    color: var(--ink);
    margin-bottom: 32px;
    overflow: hidden;
    opacity: 0;
  }
  .xj-hero-headline em {
    font-style: italic;
    color: var(--violet);
  }
  .xj-hero-headline .char {
    display: inline-block;
    transform: translateY(110%);
  }
  .xj-hero-sub {
    font-size: 19px;
    color: var(--muted);
    line-height: 1.75;
    max-width: 560px;
    font-weight: 300;
    opacity: 0;
    transform: translateY(20px);
  }
  .xj-hero-scroll-hint {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    opacity: 0;
  }
  .xj-hero-scroll-hint span {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #999;
  }
  .xj-scroll-arrow {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, var(--violet), transparent);
    animation: xjScrollArrow 1.6s ease infinite;
  }
  @keyframes xjScrollArrow {
    0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
    40% { transform: scaleY(1); transform-origin: top; opacity: 1; }
    70% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
    100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
  }

  /* ── MARQUEE ── */
  .xj-marquee-wrap {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    overflow: hidden;
    padding: 20px 0;
    background: rgba(124,58,237,0.03);
    position: relative;
    z-index: 10;
  }
  .xj-marquee-track {
    display: flex;
    gap: 0;
    white-space: nowrap;
    animation: xjMarquee 22s linear infinite;
  }
  .xj-marquee-track:hover { animation-play-state: paused; }
  @keyframes xjMarquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .xj-marquee-item {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    padding: 0 32px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .xj-marquee-sep {
    width: 4px; height: 4px;
    background: var(--violet);
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── GENERIC CONTENT SECTION ── */
  .xj-content-section {
    max-width: 820px;
    margin: 0 auto;
    padding: 120px 40px;
  }

  .xj-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--violet);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
  }
  .xj-section-label::before {
    content: '';
    width: 28px;
    height: 1px;
    background: var(--violet);
  }

  .xj-split-h2 {
    font-family: 'Poppins', sans-serif;
    font-size: clamp(36px, 5vw, 56px);
    line-height: 1.12;
    color: var(--ink);
    margin-bottom: 32px;
    letter-spacing: -0.015em;
  }
  .xj-split-h2 em {
    font-style: italic;
    color: var(--violet);
  }
  .xj-split-h2 .line { overflow: hidden; display: block; }
  .xj-split-h2 .inner { display: block; transform: translateY(100%); }

  p.xj-body-copy {
    font-size: 17px;
    color: var(--muted);
    line-height: 1.85;
    margin-bottom: 24px;
    font-weight: 300;
  }

  .reveal-up {
    opacity: 0;
  }

  /* ── PULL QUOTE ── */
  .xj-pull-quote {
    position: relative;
    margin: 56px 0;
    padding: 36px 40px 36px 48px;
    border-left: 3px solid var(--violet);
    background: linear-gradient(90deg, var(--violet-faint), transparent);
    border-radius: 0 16px 16px 0;
    overflow: hidden;
  }
  .xj-pull-quote::before {
    content: '"';
    position: absolute;
    top: -20px;
    left: 16px;
    font-family: 'Poppins', sans-serif;
    font-size: 120px;
    color: var(--violet);
    opacity: 0.1;
    line-height: 1;
    pointer-events: none;
  }
  .xj-pull-quote p {
    font-family: 'Poppins', sans-serif;
    font-size: clamp(22px, 3vw, 30px);
    font-style: italic;
    color: var(--ink);
    line-height: 1.45;
    margin: 0;
    position: relative;
    z-index: 1;
  }

  /* ── STATS TICKER ── */
  .xj-stats-row {
    display: flex;
    gap: 0;
    margin: 60px 0;
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    background: var(--card-bg);
    backdrop-filter: blur(10px);
  }
  .xj-stat-item {
    flex: 1;
    padding: 36px 28px;
    text-align: center;
    border-right: 1px solid var(--border);
  }
  .xj-stat-item:last-child { border-right: none; }
  .xj-stat-num {
    font-family: 'Poppins', sans-serif;
    font-size: 60px;
    color: var(--violet);
    line-height: 1;
    display: block;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
    font-weight: 800;
  }
  .xj-stat-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #999;
  }

  /* ── HORIZONTAL SCROLL PANEL ── */
  .xj-hscroll-outer {
    position: relative;
    z-index: 1;
  }
  .xj-hscroll-pin::before,
  .xj-hscroll-pin::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 150px;
    z-index: 10;
    pointer-events: none;
  }
  .xj-hscroll-pin::before {
    top: 0;
    background: linear-gradient(to bottom, var(--bg) 0%, transparent 100%);
  }
  .xj-hscroll-pin::after {
    bottom: 0;
    background: linear-gradient(to top, var(--bg) 0%, transparent 100%);
  }
  .xj-hscroll-pin {
    overflow: hidden;
    position: relative;
  }
  .xj-hscroll-track {
    display: flex;
    width: max-content;
  }
  .xj-hscroll-panel {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px;
    flex-shrink: 0;
    background-image: 
      linear-gradient(var(--hscroll-grid) 1px, transparent 1px), 
      linear-gradient(90deg, var(--hscroll-grid) 1px, transparent 1px);
    background-size: 60px 60px;
    background-position: center;
  }
  .xj-hscroll-panel:nth-child(1) { background-color: var(--hscroll-bg1); }
  .xj-hscroll-panel:nth-child(2) { background-color: var(--hscroll-bg2); }
  .xj-hscroll-panel:nth-child(3) { background-color: var(--hscroll-bg3); }
  .xj-hscroll-panel:nth-child(4) { background-color: var(--hscroll-bg4); }

  .xj-panel-inner {
    background: var(--hscroll-card-bg);
    border: 1px solid var(--hscroll-card-border);
    border-radius: 20px;
    padding: 60px 50px;
    backdrop-filter: blur(24px);
    box-shadow: var(--hscroll-card-shadow);
    text-align: center;
    max-width: 640px;
    position: relative;
  }
  .xj-panel-number {
    font-family: 'Poppins', sans-serif;
    font-size: 140px;
    line-height: 1;
    margin-bottom: 24px;
    letter-spacing: -0.04em;
    font-weight: 900;
  }
  .xj-panel-inner h3 {
    font-family: 'Poppins', sans-serif;
    font-size: 38px;
    line-height: 1.15;
    margin-bottom: 24px;
    letter-spacing: -0.015em;
    color: var(--hscroll-text-title);
    font-weight: 800;
  }
  .xj-panel-inner p {
    font-size: 16px;
    color: var(--hscroll-text-body);
    line-height: 1.8;
    font-weight: 400;
  }

  .xj-hscroll-panel:nth-child(1) .xj-panel-number { color: #c4b5fd; text-shadow: 0 0 50px rgba(139,92,246,0.5); }
  .xj-hscroll-panel:nth-child(2) .xj-panel-number { color: #fde68a; text-shadow: 0 0 50px rgba(245,158,11,0.5); }
  .xj-hscroll-panel:nth-child(3) .xj-panel-number { color: #93c5fd; text-shadow: 0 0 50px rgba(59,130,246,0.5); }
  .xj-hscroll-panel:nth-child(4) .xj-panel-number { color: #86efac; text-shadow: 0 0 50px rgba(34,197,94,0.5); }

  /* progress pills for hscroll */
  .xj-hscroll-nav {
    position: sticky;
    bottom: 40px;
    z-index: 20;
    display: flex;
    justify-content: center;
    gap: 8px;
    pointer-events: none;
    margin-top: -60px;
  }
  .xj-hpill {
    width: 24px; height: 4px;
    background: rgba(124,58,237,0.2);
    border-radius: 2px;
    transition: width 0.4s ease, background 0.4s ease;
  }
  .xj-hpill.active { width: 40px; background: var(--violet); }

  /* ── FEATURE CARDS ── */
  .xj-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 56px;
  }
  @media (max-width: 640px) { .xj-features-grid { grid-template-columns: 1fr; } }

  .xj-fcard {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px 28px;
    backdrop-filter: blur(12px);
    position: relative;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease;
    will-change: transform;
  }
  .xj-fcard::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.06) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .xj-fcard:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 24px 48px rgba(124,58,237,0.14); }
  .xj-fcard:hover::before { opacity: 1; }
  .xj-fcard-icon { font-size: 30px; margin-bottom: 20px; display: block; }
  .xj-fcard h3 { font-size: 17px; font-weight: 700; color: var(--ink); margin-bottom: 12px; }
  .xj-fcard p { font-size: 14px; color: var(--muted); line-height: 1.7; margin: 0; }
  .xj-fcard-tag {
    position: absolute;
    top: 20px; right: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--violet);
    background: var(--violet-faint);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 4px 10px;
  }

  /* ── BUILDER SECTION ── */
  .xj-builder-section {
    background: var(--builder-bg);
    color: #fff;
    padding: 140px 40px;
    position: relative;
    overflow: hidden;
    border-radius: 32px;
    margin: 40px 0;
  }
  .xj-builder-section::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    top: -100px; right: -100px;
    pointer-events: none;
  }
  .xj-builder-inner {
    max-width: 820px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  .xj-builder-section .xj-section-label { color: var(--violet-light); }
  .xj-builder-section .xj-section-label::before { background: var(--violet-light); }
  .xj-builder-section .xj-split-h2 { color: #fff; }
  .xj-builder-section .xj-split-h2 em { color: var(--violet-light); }
  .xj-builder-section p.xj-body-copy { color: rgba(255,255,255,0.55); }

  .xj-avatar-ring {
    width: 90px; height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--violet), #c084fc);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Poppins', sans-serif;
    font-size: 36px;
    color: #fff;
    margin-bottom: 36px;
    box-shadow: 0 0 0 12px rgba(124,58,237,0.15);
    animation: xjAvatarPulse 3s ease infinite;
    font-weight: 700;
  }
  @keyframes xjAvatarPulse {
    0%,100% { box-shadow: 0 0 0 12px rgba(124,58,237,0.15); }
    50% { box-shadow: 0 0 0 20px rgba(124,58,237,0.08); }
  }

  .xj-manifesto-list {
    list-style: none;
    margin-top: 40px;
  }
  .xj-manifesto-list li {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-size: 16px;
    color: rgba(255,255,255,0.7);
    font-weight: 300;
    line-height: 1.7;
  }
  .xj-manifesto-list li::before {
    content: '';
    width: 6px; height: 6px;
    background: var(--violet-light);
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 10px;
  }

  /* ── PARALLAX TEXT ── */
  .xj-parallax-text-section {
    overflow: hidden;
    padding: 80px 0;
    position: relative;
    z-index: 1;
  }
  .xj-ptext-line {
    display: flex;
    gap: 40px;
    white-space: nowrap;
    will-change: transform;
    margin-bottom: 10px;
  }
  .xj-ptext-line span {
    font-family: 'Poppins', sans-serif;
    font-size: clamp(60px, 8vw, 100px);
    color: transparent;
    -webkit-text-stroke: 1.5px var(--violet);
    letter-spacing: -0.02em;
    white-space: nowrap;
    line-height: 1;
    padding-right: 40px;
    display: inline-block;
    font-weight: 900;
    text-shadow: 0 0 15px rgba(124, 58, 237, 0.4), 0 0 30px rgba(124, 58, 237, 0.2);
    filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.25));
  }
  .xj-ptext-line.filled span {
    -webkit-text-stroke: 0;
    color: var(--violet);
    opacity: 0.16;
    text-shadow: 0 0 20px rgba(124, 58, 237, 0.8), 0 0 40px rgba(124, 58, 237, 0.4);
  }

  /* ── CTA ── */
  .xj-cta-section {
    text-align: center;
    padding: 160px 40px 180px;
    position: relative;
    z-index: 1;
  }
  .xj-cta-section .xj-split-h2 {
    font-size: clamp(40px, 6vw, 70px);
    margin-bottom: 20px;
  }
  .xj-cta-section p { font-size: 16px; color: var(--muted); margin-bottom: 48px; }

  /* ── STAGGER REVEAL ── */
  .reveal-up {
    opacity: 0;
    transform: translateY(40px);
  }

  /* ── TIMELINE DOTS ── */
  .xj-story-line {
    position: fixed;
    left: 28px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 14px;
    z-index: 500;
  }
  .xj-story-line::before {
    content: '';
    position: absolute;
    top: 6px; bottom: 6px;
    left: 3px;
    width: 1px;
    background: #e0d9f5;
  }
  .xj-story-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #ccc;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
    position: relative;
  }
  .xj-story-dot.active {
    background: var(--violet);
    transform: scale(2);
    box-shadow: 0 0 12px rgba(124,58,237,0.5);
  }
  @media (max-width: 900px) {
    .xj-story-line { display: none; }
  }

  /* ── CHAPTER LABEL ── */
  .xj-chapter-strip {
    display: flex;
    align-items: center;
    gap: 20px;
    max-width: 820px;
    margin: 0 auto;
    padding: 0 40px 0;
  }
  .xj-chapter-strip span {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #bbb;
    white-space: nowrap;
    font-weight: 700;
  }
  .xj-chapter-strip::before, .xj-chapter-strip::after {
    content: '';
    flex: 1;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent);
  }

  /* ── MOBILE MEDIA QUERIES ── */
  @media (max-width: 768px) {
    .xj-hero {
      padding: 140px 24px 100px;
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .xj-hero-badge {
      margin-bottom: 24px;
    }
    .xj-hero-headline {
      font-size: 46px;
      margin-bottom: 24px;
    }
    .xj-content-section {
      padding: 60px 24px;
    }
    .xj-stats-row {
      flex-direction: column;
      margin: 40px 0;
    }
    .xj-stat-item {
      border-right: none;
      border-bottom: 1px solid var(--border);
      padding: 24px 20px;
    }
    .xj-stat-item:last-child {
      border-bottom: none;
    }
    .xj-hscroll-panel {
      padding: 40px 20px;
    }
    .xj-panel-inner {
      padding: 40px 24px;
    }
    .xj-panel-number {
      font-size: 80px;
    }
    .xj-ptext-line span {
      font-size: 40px;
    }
    .xj-parallax-text-section {
      padding: 40px 0;
    }
  }
`;

const MARQUEE_ITEMS = [
  "MT5 Auto-Sync", "Gold-Native Pip Math", "Drawdown Curve",
  "Calendar Heatmap", "Session Analytics", "Mindset Journal",
  "PayPal Payment", "Realtime Sync",
];

const FEATURES = [
  { icon: "⚡", tag: "Live Sync", title: "MT5 MetaApi Bridge", body: "Secure server-side connection via MetaApi. Your broker credentials never touch the client. Firebase Cloud Functions handle the sync pipeline end-to-end." },
  { icon: "📊", tag: "Analytics", title: "Drawdown & Equity Curve", body: "Visual equity progression and max drawdown tracking built to gold's specs. Know exactly where your edge starts to break down before it costs you." },
  { icon: "🗓", tag: "Patterns", title: "Day & Session Heatmap", body: "A full calendar view of daily P&L with session overlays. Spot the time windows where your strategy works and where it doesn't." },
  { icon: "🧠", tag: "Psychology", title: "Pre-Trade Mindset Log", body: "Rate your focus, confidence, and emotional state before entering positions. Correlate mindset scores with trade outcomes over time. Pattern recognition for your head, not just your chart." },
];

const PANELS = [
  { num: "01", title: "Automated Trade Sync", body: "XAU Journal captures your completed XAUUSD trades automatically and syncs them to your journal in real time. Every entry is recorded instantly with precision eliminating manual logging, spreadsheets, and missed data." },
  { num: "02", title: "Gold-Native Calculations", body: "P&L, pip value, and drawdown calculated using gold's actual contract size of 100 oz, not a retrofitted forex formula. Every number in XAU Journal means exactly what it should." },
  { num: "03", title: "Calendar Heatmap & Session Stats", body: "See your performance across London, New York, and Asian sessions. Identify the days you overtrade. Spot your highest probability setup windows at a glance." },
  { num: "04", title: "Mindset & Risk Journal", body: "Log your psychological state alongside technical entries. Because in gold, where $10 a pip swings are routine, your mindset is part of your edge, not separate from it." },
];

const MANIFESTO = [
  "One instrument. Studied properly rather than fifteen instruments handled carelessly.",
  "Your data stays yours. No broker data-sharing. No third-party analytics on your trades.",
  "Priced to be sustainable, not extractive. Free tier is genuinely functional.",
  "Bugs get fixed. Features get shipped. Because the builder also uses the app every trading day.",
];

export default function TheStoryPage() {
  const navigate = useNavigate();
  const { isLightMode } = useAppTheme();

  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    window.scrollTo(0, 0);

    // GSAP animations linked to Lenis
    let ctx;
    let updateLenis;

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Drive GSAP ticker with Lenis scroll RAF
    updateLenis = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    ctx = gsap.context(() => {

      /* ── HERO WORD-BASED CHAR SPLIT ANIMATION ── */
      const hl = document.getElementById('xj-hero-headline');
      if (hl) {
        hl.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        const nodes = Array.from(hl.childNodes);
        hl.innerHTML = '';
        nodes.forEach(node => {
          if (node.nodeType === 3) {
            const words = node.textContent.split(' ');
            words.forEach((word, wordIdx) => {
              const wordSpan = document.createElement('span');
              wordSpan.style.display = 'inline-block';
              wordSpan.style.whiteSpace = 'nowrap';

              word.split('').forEach(ch => {
                const s = document.createElement('span');
                s.className = 'char';
                s.style.display = 'inline-block';
                s.style.transform = 'translateY(110%)';
                s.textContent = ch;
                wordSpan.appendChild(s);
              });
              hl.appendChild(wordSpan);

              if (wordIdx < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.style.display = 'inline-block';
                spaceSpan.innerHTML = '&nbsp;';
                hl.appendChild(spaceSpan);
              }
            });
          } else if (node.nodeType === 1) {
            const emNode = node;
            const emText = emNode.textContent;
            emNode.innerHTML = '';

            const words = emText.split(' ');
            words.forEach((word, wordIdx) => {
              const wordSpan = document.createElement('span');
              wordSpan.style.display = 'inline-block';
              wordSpan.style.whiteSpace = 'nowrap';

              word.split('').forEach(ch => {
                const s = document.createElement('span');
                s.className = 'char';
                s.style.display = 'inline-block';
                s.style.transform = 'translateY(110%)';
                s.textContent = ch;
                wordSpan.appendChild(s);
              });
              emNode.appendChild(wordSpan);

              if (wordIdx < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.style.display = 'inline-block';
                spaceSpan.innerHTML = '&nbsp;';
                hl.appendChild(spaceSpan);
              }
            });
            hl.appendChild(emNode);
          }
        });

        hl.style.opacity = 1;
        gsap.to(hl.querySelectorAll('.char'), {
          y: 0,
          duration: 0.7,
          ease: 'expo.out',
          stagger: 0.018,
          delay: 0.3
        });
      }

      /* ── HERO BADGE & SUB ── */
      gsap.to('.xj-hero-badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'expo.out' });
      gsap.to('.xj-hero-sub', { opacity: 1, y: 0, duration: 0.9, delay: 0.9, ease: 'expo.out' });
      gsap.to('#xj-scroll-hint', { opacity: 1, duration: 1, delay: 1.6 });

      /* ── H2 LINE REVEALS ── */
      document.querySelectorAll('.xj-split-h2').forEach(h2 => {
        const inners = h2.querySelectorAll('.inner');
        if (!inners.length) return;
        gsap.fromTo(inners, { y: '100%' }, {
          y: '0%',
          duration: 0.85,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: h2,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      /* ── REVEAL-UP ── */
      document.querySelectorAll('.reveal-up').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });

      /* ── STATS COUNTER ANIMATION ── */
      document.querySelectorAll('.xj-stat-num[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        if (isNaN(target)) return;
        gsap.fromTo({ val: 0 }, { val: target }, {
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); },
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });

      /* ── PARALLAX TEXT LINES ── */
      const p1 = document.getElementById('xj-pline1');
      const p2 = document.getElementById('xj-pline2');
      if (p1 && p2) {
        gsap.to(p1, {
          x: '-15%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.xj-parallax-text-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });
        gsap.to(p2, {
          x: '5%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.xj-parallax-text-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }

      /* ── HORIZONTAL SCROLL ── */
      const hpin = document.getElementById('xj-hpin');
      const htrack = document.getElementById('xj-htrack');
      const pills = document.querySelectorAll('.xj-hpill');

      if (hpin && htrack) {
        const panels = htrack.querySelectorAll('.xj-hscroll-panel');
        const scrollDist = (panels.length - 1) * window.innerWidth;

        hpin.style.height = '100vh';

        gsap.to(htrack, {
          x: -scrollDist,
          ease: 'none',
          scrollTrigger: {
            trigger: hpin,
            pin: true,
            scrub: 1,
            end: () => '+=' + scrollDist,
            onUpdate: (self) => {
              const activeIdx = Math.round(self.progress * (panels.length - 1));
              pills.forEach((p, i) => p.classList.toggle('active', i === activeIdx));
            }
          }
        });
      }

      /* ── SECTION LABEL LINES ── */
      gsap.utils.toArray('.xj-section-label').forEach(el => {
        gsap.from(el, {
          opacity: 0,
          x: -20,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
      });

      /* ── DARK SECTION MANIFESTO STAGGER ── */
      const manifesto = document.querySelectorAll('.xj-manifesto-list li');
      manifesto.forEach((li, i) => {
        gsap.fromTo(li, { opacity: 0, x: -30 }, {
          opacity: 1,
          x: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: li,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });

    }, containerRef);

    setTimeout(() => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }, 150);

    return () => {
      lenis.destroy();
      if (ctx) ctx.revert();
      if (updateLenis) {
        gsap.ticker.remove(updateLenis);
      }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  /* ── PROGRESS BAR, INTERSECTION OBSERVER, & BLOB PARALLAX ── */
  useEffect(() => {
    // Progress Bar
    const bar = document.getElementById('xj-progress-bar');
    const handleScrollProgress = () => {
      const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.width = (p * 100) + '%';
    };
    window.addEventListener('scroll', handleScrollProgress);

    // Timeline dots Active observer
    const sections = document.querySelectorAll('[data-section]');
    const dots = document.querySelectorAll('.xj-story-dot');
    const dotObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = e.target.dataset.section;
          dots.forEach(d => d.classList.remove('active'));
          const target = document.querySelector(`.xj-story-dot[data-idx="${idx}"]`);
          if (target) target.classList.add('active');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => dotObs.observe(s));

    // Blob Parallax
    const b1 = document.getElementById('xj-b1');
    const b2 = document.getElementById('xj-b2');
    const b3 = document.getElementById('xj-b3');
    let lastY = 0;
    let rafBlob;

    function blobTick() {
      const y = window.scrollY;
      if (y !== lastY) {
        if (b1) b1.style.transform = `translateY(${y * 0.1}px)`;
        if (b2) b2.style.transform = `translateY(${-y * 0.07}px)`;
        if (b3) b3.style.transform = `translateY(${y * 0.05}px)`;
        lastY = y;
      }
      rafBlob = requestAnimationFrame(blobTick);
    }
    blobTick();

    // Card magnetic tilt
    const cards = document.querySelectorAll('.xj-fcard');
    const cardMoves = [];
    cards.forEach(card => {
      const mm = e => {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / (r.width / 2);
        const dy = (e.clientY - cy) / (r.height / 2);
        card.style.transform = `translateY(-8px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg) scale(1.01)`;
      };
      const ml = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', mm);
      card.addEventListener('mouseleave', ml);
      cardMoves.push({ card, mm, ml });
    });

    return () => {
      window.removeEventListener('scroll', handleScrollProgress);
      dotObs.disconnect();
      cancelAnimationFrame(rafBlob);
      cardMoves.forEach(({ card, mm, ml }) => {
        card.removeEventListener('mousemove', mm);
        card.removeEventListener('mouseleave', ml);
      });
    };
  }, []);

  const themeVariables = {
    '--bg': 'hsl(var(--background))',
    '--ink': 'hsl(var(--foreground))',
    '--muted': 'hsl(var(--muted-foreground))',
    '--border': 'hsl(var(--border))',
    '--card-bg': 'hsl(var(--card))',
    '--violet': 'hsl(var(--primary))',
    '--violet-light': isLightMode ? '#a78bfa' : '#c084fc',
    '--violet-faint': 'hsl(var(--primary) / 0.08)',
    '--builder-bg': isLightMode ? '#0d0d14' : '#141220',
    '--hscroll-bg1': isLightMode ? '#f0ebff' : '#161226',
    '--hscroll-bg2': isLightMode ? '#fff8eb' : '#221a0f',
    '--hscroll-bg3': isLightMode ? '#ebf5ff' : '#101726',
    '--hscroll-bg4': isLightMode ? '#f0ffeb' : '#112211',
    '--hscroll-grid': isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.02)',
    '--hscroll-card-bg': isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.02)',
    '--hscroll-card-border': isLightMode ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
    '--hscroll-text-title': isLightMode ? '#0f172a' : '#ffffff',
    '--hscroll-text-body': isLightMode ? '#475569' : 'rgba(255, 255, 255, 0.7)',
    '--hscroll-card-shadow': isLightMode ? '0 20px 40px rgba(0,0,0,0.06)' : '0 30px 60px rgba(0,0,0,0.5)',
  };

  return (
    <div className="font-sans">
      <PublicNavbar />
      <div className="xj-story-container" style={themeVariables} ref={containerRef}>
      <style>{STYLES}</style>
      {/* Progress Bar */}
      <div id="xj-progress-bar" />

      {/* Blobs */}
      <div className="xj-blob xj-blob-1" id="xj-b1" />
      <div className="xj-blob xj-blob-2" id="xj-b2" />
      <div className="xj-blob xj-blob-3" id="xj-b3" />

      {/* Timeline Dots */}
      <nav className="xj-story-line" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`xj-story-dot${i === 0 ? ' active' : ''}`}
            data-idx={i}
            onClick={() => {
              const sec = document.querySelector(`[data-section="${i}"]`);
              if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        ))}
      </nav>

      {/* ① HERO */}
      <section className="xj-hero" data-section="0">
        <div className="xj-hero-badge">
          <span className="xj-badge-dot" />
          Built by a trader · For gold traders
        </div>
        <h1 className="xj-hero-headline" id="xj-hero-headline">
          Not just another<br /> startup.<br /><em> A necessary tool.</em>
        </h1>
        <p className="xj-hero-sub font-medium">XAU Journal didn't come from a product roadmap. It came from years of watching gold traders, including myself, manage their edge inside spreadsheets that had no idea what XAUUSD actually was.</p>

        <div className="xj-hero-scroll-hint" id="xj-scroll-hint">
          <span>Scroll</span>
          <div className="xj-scroll-arrow" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="xj-marquee-wrap" aria-hidden="true">
        <div className="xj-marquee-track" id="xj-mtrack">
          {MARQUEE_ITEMS.concat(MARQUEE_ITEMS).map((item, i) => (
            <div key={i} className="xj-marquee-item">
              {item} <span className="xj-marquee-sep" />
            </div>
          ))}
        </div>
      </div>

      {/* ② THE FRUSTRATION */}
      <section data-section="1">
        <div className="xj-content-section">
          <p className="xj-section-label reveal-up">The Frustration</p>
          <h2 className="xj-split-h2">
            <span className="line"><span className="inner">Every journal out there was</span></span>
            <span className="line"><span className="inner">built for Forex. Gold was an</span></span>
            <span className="line"><span className="inner"><em>afterthought.</em></span></span>
          </h2>
          <p className="xj-body-copy reveal-up font-medium">I remember the exact session that broke me. A choppy London open on XAUUSD, eight trades, and an afternoon of trying to make sense of it all. The journal I was using didn't know gold's pip value. It calculated my drawdown wrong. The P&L figures were completely off.</p>
          <p className="xj-body-copy reveal-up font-medium">And the worst part I had to enter every single trade manually. After spending four hours watching the chart, I had to spend another hour doing data entry. That's not analysis. That's administration.</p>

          <div className="xj-pull-quote reveal-up">
            <p>I was spending more time logging trades than actually learning from them. Something was fundamentally broken.</p>
          </div>

          <div className="xj-stats-row reveal-up">
            <div className="xj-stat-item">
              <span className="xj-stat-num" data-target="100">0</span>
              <div className="xj-stat-label">oz Contract Size</div>
            </div>
            <div className="xj-stat-item">
              <span className="xj-stat-num" data-target="0">0</span>
              <div className="xj-stat-label">Manual Entries</div>
            </div>
            <div className="xj-stat-item">
              <span className="xj-stat-num" data-target="1">0</span>
              <div className="xj-stat-label">Instrument Focus</div>
            </div>
          </div>
        </div>
      </section>

      <div className="xj-chapter-strip reveal-up"><span>The Turning Point</span></div>

      {/* PARALLAX TEXT BREAK */}
      <div className="xj-parallax-text-section" aria-hidden="true">
        <div className="xj-ptext-line" id="xj-pline1">
          {["XAU/USD", "XAUUSD", "Gold", "XAU/USD", "XAUUSD", "Gold"].map((txt, i) => (
            <span key={i}>{txt}</span>
          ))}
        </div>
        <div className="xj-ptext-line filled" id="xj-pline2">
          {["Journal", "Analyze", "Improve", "Journal", "Analyze", "Improve"].map((txt, i) => (
            <span key={i}>{txt}</span>
          ))}
        </div>
      </div>

      {/* ③ ORIGIN */}
      <section data-section="2">
        <div className="xj-content-section">
          <p className="xj-section-label reveal-up">Origin Story</p>
          <h2 className="xj-split-h2">
            <span className="line"><span className="inner">I didn't set out to build</span></span>
            <span className="line"><span className="inner">software. I just wanted</span></span>
            <span className="line"><span className="inner"><em>my weekends back.</em></span></span>
          </h2>
          <p className="xj-body-copy reveal-up font-medium">XAU Journal started as a local HTML file running on my own machine. I wrote a custom MT5 Expert Advisor that fired on every position close and pushed the trade data to a simple backend. No UI. No branding. Just raw, correct data.</p>
          <p className="xj-body-copy reveal-up font-medium">Over months, it grew. I added a React frontend, real-time synchronization, advanced analytics, and visual performance tracking tools. Eventually other traders saw it and wanted in. That's when I realised this wasn't a personal tool anymore it was a product.</p>
          <p className="xj-body-copy reveal-up font-medium">No investors. No VC pitch deck. No agency. Just one developer who also happens to trade gold, building on evenings and weekends until it was good enough to ship.</p>
        </div>
      </section>

      {/* ④ HORIZONTAL SCROLL — FEATURE PANELS */}
      <section className="xj-hscroll-outer" data-section="3">
        <div className="xj-hscroll-pin" id="xj-hpin">
          <div className="xj-hscroll-track" id="xj-htrack">
            {PANELS.map((p, i) => (
              <div key={i} className="xj-hscroll-panel">
                <div className="xj-panel-inner">
                  <div className="xj-panel-number">{p.num}</div>
                  <h3>{p.title}</h3>
                  <p className="font-medium">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="xj-hscroll-nav" id="xj-hpills">
          {PANELS.map((_, i) => (
            <div key={i} className={`xj-hpill${i === 0 ? ' active' : ''}`} />
          ))}
        </div>
      </section>

      <div className="xj-chapter-strip reveal-up"><span>The Solution</span></div>

      {/* ⑤ WHY SPECIALIZED */}
      <section data-section="3">
        <div className="xj-content-section">
          <p className="xj-section-label reveal-up">Why Specialization Wins</p>
          <h2 className="xj-split-h2">
            <span className="line"><span className="inner">Generic tools try to serve</span></span>
            <span className="line"><span className="inner">everyone. That's precisely</span></span>
            <span className="line"><span className="inner"><em>why they fail specialists.</em></span></span>
          </h2>
          <p className="xj-body-copy reveal-up font-medium">Forex journals calculate pip value assuming a standard contract. Gold doesn't work that way. At 100 oz per lot, a 1-pip move on XAUUSD is worth $1,but the pip itself is a $0.01 price move, not a $0.0001 move like EUR/USD. Get that wrong and every drawdown curve, every expectancy calculation, every risk-reward ratio in your journal is lying to you.</p>
          <p className="xj-body-copy reveal-up font-medium">XAU Journal is calibrated specifically for this. It doesn't support EUR/USD because it doesn't need to. One instrument, done properly, is worth more than thirty instruments done badly.</p>

          <div className="xj-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="xj-fcard reveal-up">
                <span className="xj-fcard-icon">{f.icon}</span>
                <span className="xj-fcard-tag">{f.tag}</span>
                <h3>{f.title}</h3>
                <p className="font-medium">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ BUILDER — DARK SECTION */}
      <section className="xj-builder-section" data-section="4">
        <div className="xj-builder-inner">
          <div className="xj-avatar-ring reveal-up">S</div>
          <p className="xj-section-label reveal-up">The Builder</p>
          <h2 className="xj-split-h2">
            <span className="line"><span className="inner">Solo-built. No investors.</span></span>
            <span className="line"><span className="inner"><em>No hidden agendas.</em></span></span>
          </h2>
          <p className="xj-body-copy reveal-up font-medium">XAU Journal is designed, tested, and maintained by a single developer who also trades gold. There's no corporate product team optimizing for retention metrics, no VC pressure to bloat the feature list, and zero broker affiliations influencing what gets built.</p>
          <p className="xj-body-copy reveal-up font-medium">Every feature in this app exists because it solved a real problem I ran into while trading. That's the only filter. Not what looks impressive in a demo. Not what a roadmap committee approved.</p>
          <ul className="xj-manifesto-list">
            {MANIFESTO.map((m, i) => (
              <li key={i} className="reveal-up font-medium">{m}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ⑦ CTA */}
      <section className="xj-cta-section" data-section="5">
        <h2 className="xj-split-h2 reveal-up">
          <span className="line"><span className="inner">Ready to finally understand</span></span>
          <span className="line"><span className="inner">your real edge in <em>gold?</em></span></span>
        </h2>
        <p className="reveal-up font-medium text-lg">Start journaling free. No credit card. No spreadsheet required.</p>
        <div className="xj-cta-buttons reveal-up flex justify-center">
          <button className="cta active:scale-95 transition-all duration-300" onClick={() => navigate('/login')}>
            <span>Try 7-Day Free Trial</span>
            <svg width="15px" height="10px" viewBox="0 0 13 10">
              <path d="M1,5 L11,5" />
              <polyline points="8 1 12 5 8 9" />
            </svg>
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_1fr] gap-16 md:gap-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center gap-3">
              <Logo iconSize="w-7 h-7" />
              <p className="text-[11px] font-medium text-muted-foreground max-w-[200px] leading-relaxed">
                Precision performance terminal and automated MT5 synchronization designed exclusively for XAUUSD traders.
              </p>
            </div>
            <div className="text-center md:text-center flex flex-col items-center md:items-center lg:items-start lg:text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-8">Platform</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground text-center lg:text-left">
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/the-story" className="hover:text-primary transition-colors">The Story</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/login?mode=signin" className="hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>
            <div className="text-center md:text-center flex flex-col items-center md:items-center lg:items-start lg:text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-8">Legal</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground text-center lg:text-left">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            <div className="flex flex-col items-center md:items-end text-center md:text-right justify-end">
              <div className="mt-auto flex flex-col items-center md:items-end gap-5">
                <ul className="example-2">
                  <li className="icon-content"><a data-social="facebook" aria-label="Facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><div className="filled" /><Facebook /></a></li>
                  <li className="icon-content"><a data-social="instagram" aria-label="Instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><div className="filled" /><Instagram /></a></li>
                  <li className="icon-content"><a data-social="x" aria-label="X" href="https://x.com/xau_journal" target="_blank" rel="noopener noreferrer"><div className="filled" /><TwitterX /></a></li>
                  <li className="icon-content"><a data-social="discord" aria-label="Discord" href="https://discord.gg/smbNwBZC2" target="_blank" rel="noopener noreferrer"><div className="filled" /><Discord /></a></li>
                </ul>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-1.5 justify-center md:justify-end">
                  made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center md:text-right">© Copyright 2026 Xau Journal. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
