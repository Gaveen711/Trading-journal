import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CloudArrowDownFill, LightningChargeFill, BarChartLineFill, Stars, Phone, HddNetwork, Display, GearWideConnected, DatabaseFill, WindowSidebar, TwitterX, Facebook, Instagram, Discord } from 'react-bootstrap-icons';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

import Logo from '../components/Logo';
import { PublicNavbar } from '../components/PublicNavbar';
import { MagicTextReveal } from '../components/MagicTextReveal';
import { useAppTheme } from '../hooks/useAppTheme';
import { LANDING_FAQ, buildFAQSchema, buildOrganizationSchema, buildSoftwareSchema, buildWebSiteSchema, injectJsonLd, removeJsonLd } from '../lib/seo';


/* ═══════════════════════════════════════════
   AURORA PALETTE
   ═══════════════════════════════════════════ */
const AURORA = {
  cyan: '#00E5FF',
  violet: '#FF5A36', // Sunset Coral
  magenta: '#00FF87', // Volt Lime
  mint: '#06FFA5',
  dark: '#050510',
  surface: '#0d0d1a',
};


/* ═══════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════ */
const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    title: 'Instant MT5 Sync',
    body: 'Effortlessly capture your trade history and sync your performance data to the cloud. Eliminate manual logging and ensure 100% accuracy for every position closed.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>,
    title: 'Deep Analytics',
    body: 'Win-rate by session, drawdown clusters, streak analysis, and behavioural heatmaps — every metric purpose-built for clarity.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    title: 'Trade Calendar',
    body: 'A month-view calendar shows your P&L heat at a glance. Identify your best and worst days in a single look.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    title: 'Private & Secure Data',
    body: 'Your trading data is yours alone. We use industry-standard encryption and isolated storage protocols to protect your history.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    title: 'Trade Journal & Playbook',
    body: 'Attach thoughts, emotions, and notes to each trade. Build an annotated playbook straight from your own history.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    title: 'Session Intelligence',
    body: 'London, New York, Tokyo, Sydney — see exactly which session your edge lives in and schedule your trading around it.',
  },
];

const STEPS = [
  { id: 1, icon: <CloudArrowDownFill className="w-6 h-6" />, title: 'Connect Your Broker', body: 'Link your MT4 or MT5 account in under a minute. No EA installation needed — we handle the connection securely in the cloud.' },
  { id: 2, icon: <LightningChargeFill className="w-6 h-6" />, title: 'Real-time Trade Sync', body: 'Every closed position is captured instantly and enriched with session data, pip calculations, and risk metrics.' },
  { id: 3, icon: <BarChartLineFill className="w-6 h-6" />, title: 'Optimize Your Strategy', body: 'Review your analytics, identify patterns, journal your thoughts, and systematically sharpen your edge.' },
];

const STATS = [
  { value: 'Precision', label: 'Built specifically for traders' },
  { value: '1s', label: 'MT5 sync latency' },
  { value: '100%', label: 'Your data, your control' },
];

const STORY_CHAPTERS = [
  { chapter: '01', label: 'The Problem', headline: "You're trading blindly.", sub: 'Most gold traders rely on gut feeling, scattered spreadsheets, or fragmented notes. Without structured data, the same mistakes repeat endlessly.', accent: AURORA.magenta, glow: `${AURORA.magenta}30`, dotColor: AURORA.magenta },
  { chapter: '02', label: 'The Pattern', headline: 'Your edge already exists.', sub: "It's buried in your own history — the sessions you win, the setups that consistently print. You just can't see it yet.", accent: AURORA.cyan, glow: `${AURORA.cyan}30`, dotColor: AURORA.cyan },
  { chapter: '03', label: 'The Insight', headline: 'Data reveals what instinct misses.', sub: 'Session win-rates, drawdown clusters, streak analysis — structured analytics expose the truth behind every trade.', accent: AURORA.violet, glow: `${AURORA.violet}30`, dotColor: AURORA.violet },
  { chapter: '04', label: 'The Solution', headline: 'Meet XAU Journal.', sub: 'A purpose-built intelligence terminal for gold traders. Auto-sync, deep analytics, and journaling — all in one place.', accent: AURORA.mint, glow: `${AURORA.mint}30`, dotColor: AURORA.mint },
];

const TIMELINE_ITEMS = [
  { label: 'Mobile Access', sub: 'Universal MT5 connectivity for traders on the move.', icon: <Phone className="w-5 h-5" />, side: 'left' },
  { label: 'Broker Agnostic', sub: 'Seamlessly connects with any MT5 broker worldwide.', icon: <HddNetwork className="w-5 h-5" />, side: 'right' },
  { label: 'Automated Sync', sub: 'Zero manual entry — your trades are recorded instantly.', icon: <Display className="w-5 h-5" />, side: 'left' },
  { label: 'Cloud Processing', sub: 'Advanced logic layer handles all complex calculations.', icon: <GearWideConnected className="w-5 h-5" />, side: 'right' },
  { label: 'Encrypted Vault', sub: 'Military-grade protection for your private trade data.', icon: <DatabaseFill className="w-5 h-5" />, side: 'left' },
  { label: 'Intelligence Suite', sub: 'Professional dashboard for deep performance insights.', icon: <WindowSidebar className="w-5 h-5" />, side: 'right' },
];


/* ═══════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════ */

/* ─── Film Grain Overlay ─── */
function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}

/* ─── Floating Aurora Orbs ─── */
function AuroraOrbs() {
  const orbs = [
    { color: AURORA.violet, size: 600, x: '70%', y: '-10%', delay: 0, blur: 100 },
    { color: AURORA.cyan, size: 450, x: '-5%', y: '30%', delay: 2, blur: 90 },
    { color: AURORA.magenta, size: 400, x: '80%', y: '60%', delay: 4, blur: 110 },
  ];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {orbs.map((orb, i) => (
        <Motion.div
          key={i}
          className="absolute rounded-full aurora-glow"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
        />
      ))}
    </div>
  );
}

/* ─── Scroll Progress Bar ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <Motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left"
      style={{ scaleX, background: `linear-gradient(90deg, ${AURORA.cyan}, ${AURORA.violet}, ${AURORA.magenta})` }}
    />
  );
}

/* ─── Animated Number Counter ─── */
function Counter({ value, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');
  const isNumeric = !isNaN(parseInt(value));

  useEffect(() => {
    if (!isInView || !isNumeric) { setDisplay(value); return; }
    const target = parseInt(value);
    const start = performance.now();
    const duration = 1800;
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target).toString());
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, value, isNumeric]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Character-by-character Hero Headline ─── */
function AnimatedHeadline({ text, delayOffset = 0, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.3em]">
          {word.split('').map((char, ci) => (
            <Motion.span
              key={ci}
              className="inline-block"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 0.7, delay: delayOffset + wi * 0.12 + ci * 0.03, ease: [0.16, 1, 0.3, 1] }}
            >
              {char}
            </Motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

/* ─── Magnetic Button ─── */
function MagneticButton({ children, onClick, className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({ x: (e.clientX - cx) * 0.2, y: (e.clientY - cy) * 0.2 });
  };
  return (
    <Motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </Motion.button>
  );
}


/* ═══════════════════════════════════════════
   HERO MOCK TRADING TERMINAL
   ═══════════════════════════════════════════ */
function MockTerminal() {
  return (
    <Motion.div
      className="perspective-container w-full max-w-[540px]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Motion.div
        className="relative rounded-2xl overflow-hidden border border-white/[0.06]"
        style={{ background: 'linear-gradient(145deg, rgba(13,13,26,0.9), rgba(5,5,16,0.95))', backdropFilter: 'blur(20px)' }}
        whileHover={{ rotateX: -2, rotateY: 3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-[80px]" style={{ background: AURORA.violet }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-15 blur-[60px]" style={{ background: AURORA.cyan }} />

        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 text-center text-[10px] font-medium text-white/30 tracking-wider uppercase">XAU Journal Terminal</div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Price ticker */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-white/40 tracking-widest uppercase">XAUUSD</div>
              <div className="text-2xl font-black text-white tabular-nums">2,847<span className="text-white/50">.35</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-400">+12.40</div>
              <div className="text-[10px] text-white/40">+0.44%</div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="relative h-24 overflow-hidden rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="aurora-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AURORA.cyan} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={AURORA.cyan} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="aurora-chart-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={AURORA.cyan} />
                  <stop offset="50%" stopColor={AURORA.violet} />
                  <stop offset="100%" stopColor={AURORA.magenta} />
                </linearGradient>
              </defs>
              <path d="M0 70 Q30 65 60 55 T120 50 T180 35 T240 40 T300 25 T360 20 T400 15" fill="none" stroke="url(#aurora-chart-stroke)" strokeWidth="2" />
              <path d="M0 70 Q30 65 60 55 T120 50 T180 35 T240 40 T300 25 T360 20 T400 15 V100 H0Z" fill="url(#aurora-chart-fill)" />
              {/* Buy marker */}
              <circle cx="180" cy="35" r="4" fill={AURORA.cyan} opacity="0.9" />
              <circle cx="180" cy="35" r="7" fill={AURORA.cyan} opacity="0.2" />
              {/* TP marker */}
              <circle cx="360" cy="20" r="4" fill={AURORA.mint} opacity="0.9" />
              <circle cx="360" cy="20" r="7" fill={AURORA.mint} opacity="0.2" />
            </svg>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Net Profit', val: '+$4,280', color: AURORA.mint },
              { label: 'Win Rate', val: '68.5%', color: AURORA.cyan },
              { label: 'Trades', val: '142', color: AURORA.violet },
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{s.label}</div>
                <div className="text-sm font-black mt-0.5" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Floating tags */}
          <div className="flex gap-2">
            <span className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${AURORA.mint}15`, color: AURORA.mint, border: `1px solid ${AURORA.mint}25` }}>MT5 Live Synced</span>
            <span className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${AURORA.violet}15`, color: AURORA.violet, border: `1px solid ${AURORA.violet}25` }}>Profit Factor 2.1</span>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
}


/* ═══════════════════════════════════════════
   STORY CHAPTER MOCKUPS
   ═══════════════════════════════════════════ */
function MockupDrawdown() {
  return (
    <div className="w-full max-w-[280px] rounded-xl p-4 border" style={{ background: `${AURORA.magenta}08`, borderColor: `${AURORA.magenta}20` }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: AURORA.magenta }}>Drawdown Alert</div>
      <svg viewBox="0 0 200 60" className="w-full h-12">
        <path d="M0 10 Q25 8 50 20 T100 35 T150 45 T200 55" fill="none" stroke={AURORA.magenta} strokeWidth="2" opacity="0.7" />
        <path d="M0 10 Q25 8 50 20 T100 35 T150 45 T200 55 V60 H0Z" fill={AURORA.magenta} opacity="0.08" />
      </svg>
      <div className="flex justify-between mt-2 text-[9px] text-white/30">
        <span>-$420</span><span>3 consecutive losses</span>
      </div>
    </div>
  );
}

function MockupRadar() {
  return (
    <div className="w-full max-w-[280px] rounded-xl p-4 border" style={{ background: `${AURORA.cyan}08`, borderColor: `${AURORA.cyan}20` }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: AURORA.cyan }}>Pattern Scan</div>
      <div className="relative w-20 h-20 mx-auto">
        {[1, 2, 3].map(r => (
          <div key={r} className="absolute inset-0 rounded-full border" style={{ borderColor: `${AURORA.cyan}${r === 1 ? '30' : r === 2 ? '20' : '10'}`, transform: `scale(${r * 0.33})` }} />
        ))}
        <Motion.div
          className="absolute inset-0 origin-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-0.5 h-1/2 mx-auto" style={{ background: `linear-gradient(to bottom, ${AURORA.cyan}60, transparent)` }} />
        </Motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: AURORA.cyan, boxShadow: `0 0 8px ${AURORA.cyan}` }} />
      </div>
    </div>
  );
}

function MockupHeatmap() {
  const sessions = [{ name: 'London', pct: 78 }, { name: 'New York', pct: 52 }, { name: 'Tokyo', pct: 24 }];
  return (
    <div className="w-full max-w-[280px] rounded-xl p-4 border" style={{ background: `${AURORA.violet}08`, borderColor: `${AURORA.violet}20` }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: AURORA.violet }}>Session Efficiency</div>
      <div className="space-y-2.5">
        {sessions.map((s, i) => (
          <div key={i}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-white/50">{s.name}</span>
              <span style={{ color: AURORA.violet }}>{s.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <Motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${AURORA.violet}, ${AURORA.cyan})` }}
                initial={{ width: 0 }}
                whileInView={{ width: `${s.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupSync() {
  return (
    <div className="w-full max-w-[280px] rounded-xl p-4 border" style={{ background: `${AURORA.mint}08`, borderColor: `${AURORA.mint}20` }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: AURORA.mint }}>Live Sync</div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${AURORA.mint}15` }}>
          <LightningChargeFill className="w-4 h-4" style={{ color: AURORA.mint }} />
        </div>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full w-full rounded-full relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${AURORA.mint}40, ${AURORA.mint})` }}>
              <div className="absolute inset-0 animate-[shimmer-aurora_2s_infinite]" style={{ background: `linear-gradient(90deg, transparent, ${AURORA.mint}50, transparent)` }} />
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${AURORA.mint}15` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AURORA.mint} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
      </div>
      <div className="text-[9px] text-white/30">MT5 → XAU Journal · 142 trades synced</div>
    </div>
  );
}


/* ─── Story Chapter Card ─── */
function StoryChapter({ chapter, index }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full" style={{ background: `${chapter.accent}12`, color: chapter.accent, border: `1px solid ${chapter.accent}25` }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block mr-2" style={{ background: chapter.dotColor }} />
          {chapter.label}
        </span>
      </div>
      <h3 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight">{chapter.headline}</h3>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">{chapter.sub}</p>
    </Motion.div>
  );
}


/* ═══════════════════════════════════════════
   SCROLL STORYTELLING (exported)
   ═══════════════════════════════════════════ */
export function ScrollStorytelling({ isLightMode }) {
  const mockups = [<MockupDrawdown key="d" />, <MockupRadar key="r" />, <MockupHeatmap key="h" />, <MockupSync key="s" />];
  return (
    <section className="relative z-10 py-24 md:py-40 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24"
        >
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 inline-block px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground">The Story</span>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.08] tracking-tight mt-4">
            Why XAU Journal <span className="aurora-text">exists.</span>
          </h2>
        </Motion.div>

        <div className="space-y-24 md:space-y-40">
          {STORY_CHAPTERS.map((chapter, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
                <div className={`md:col-span-7 ${isEven ? '' : 'md:order-2'}`}>
                  <StoryChapter chapter={chapter} index={idx} />
                </div>
                <div className={`md:col-span-5 flex ${isEven ? 'justify-end' : 'justify-start md:order-1'}`}>
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {mockups[idx]}
                  </Motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   BENTO FEATURES (exported)
   ═══════════════════════════════════════════ */
const FEATURE_ACCENTS = [AURORA.cyan, AURORA.magenta, AURORA.violet, AURORA.mint, AURORA.cyan, AURORA.violet];

export function BentoFeatures({ isLightMode }) {
  return (
    <section id="features" className="relative z-10 py-28 md:py-40 px-6 overflow-hidden border-t border-border/10">
      <div className="max-w-7xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-20 md:mb-28"
        >
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-5 inline-block px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground">The Platform</span>
          <h2 className="text-[clamp(2rem,5.5vw,4rem)] font-black leading-[1.05] tracking-tight mb-6 mt-4">
            Every tool you need.<br /><span className="aurora-text-static">Nothing you don't.</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed">
            Designed by traders, for traders. We've stripped away the noise to focus on the metrics that actually improve your edge.
          </p>
        </Motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bento-grid">
          {FEATURES.map((feat, i) => {
            const accent = FEATURE_ACCENTS[i];
            const spans = [2, 1, 1, 2, 1, 2];
            return (
              <Motion.div
                key={i}
                className={`md:col-span-${spans[i]} group relative overflow-hidden rounded-2xl border border-border/20 p-7 flex flex-col justify-between min-h-[300px] transition-all duration-500 cursor-default`}
                style={{ background: isLightMode ? 'rgba(255,255,255,0.6)' : 'rgba(13,13,26,0.6)', backdropFilter: 'blur(12px)' }}
                whileHover={{ y: -4, borderColor: `${accent}40` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}08, transparent 70%)` }} />

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: `${accent}12`, color: accent }}>
                      {feat.icon}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2.5">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.body}</p>
                  </div>

                  {/* Feature Visualizations */}
                  {i === 0 && (
                    <div className="mt-6 flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 w-full max-w-[340px] animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <div className="text-[10px] font-black text-foreground">Broker Server</div>
                      <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full relative overflow-hidden">
                        <div className="absolute inset-y-0 w-12 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, animation: 'shimmer-aurora 2.5s infinite' }} />
                      </div>
                      <div className="text-[10px] font-black" style={{ color: accent }}>Terminal Sync</div>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="mt-6 flex justify-center items-center h-20">
                      <div className="w-14 h-14 rounded-full border flex items-center justify-center relative" style={{ borderColor: `${accent}30` }}>
                        <div className="absolute top-1.5 bottom-1/2 w-0.5 origin-bottom rotate-[45deg]" style={{ backgroundColor: accent }} />
                        <div className="absolute left-1.5 right-1/2 h-0.5 origin-right" style={{ backgroundColor: `${accent}60` }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                      </div>
                    </div>
                  )}

                  {i === 2 && (
                    <div className="mt-6 grid grid-cols-5 gap-1 w-full max-w-[140px] mx-auto">
                      {[...Array(15)].map((_, idx) => {
                        const styles = [
                          { bg: 'rgba(6,255,165,0.15)', border: 'rgba(6,255,165,0.3)' },
                          { bg: 'rgba(6,255,165,0.35)', border: 'rgba(6,255,165,0.6)' },
                          { bg: 'rgba(255,60,172,0.15)', border: 'rgba(255,60,172,0.3)' },
                          { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.05)' }
                        ];
                        const colIdx = idx % styles.length;
                        return <div key={idx} className="aspect-square rounded border" style={{ backgroundColor: styles[colIdx].bg, borderColor: styles[idx % 2 === 0 ? colIdx : 3].border }} />;
                      })}
                    </div>
                  )}

                  {i === 3 && (
                    <div className="mt-6 flex gap-4 overflow-hidden max-w-[340px]">
                      <div className="flex-1 h-14 bg-white/[0.02] border border-white/[0.05] rounded-xl p-2 flex items-end gap-1">
                        <div className="flex-1 h-[30%] bg-amber-500/40 rounded-sm" />
                        <div className="flex-1 h-[60%] bg-amber-500/60 rounded-sm" />
                        <div className="flex-1 h-[45%] bg-amber-500/40 rounded-sm" />
                        <div className="flex-1 h-[80%] bg-amber-500 rounded-sm" />
                      </div>
                      <div className="flex-1 h-14 bg-white/[0.02] border border-white/[0.05] rounded-xl p-2 flex items-end gap-1">
                        <div className="flex-1 h-[70%] bg-cyan-500/60 rounded-sm" />
                        <div className="flex-1 h-[40%] bg-cyan-500/40 rounded-sm" />
                        <div className="flex-1 h-[55%] bg-cyan-500/60 rounded-sm" />
                        <div className="flex-1 h-[90%] bg-cyan-500 rounded-sm" />
                      </div>
                    </div>
                  )}

                  {i === 4 && (
                    <div className="mt-6 flex justify-center items-center h-14">
                      <div className="w-10 h-10 rounded-full border flex items-center justify-center relative shadow-[0_0_15px_rgba(6,255,165,0.1)]" style={{ borderColor: `${accent}30`, color: accent }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {i === 5 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: `${AURORA.cyan}15`, color: AURORA.cyan, border: `1px solid ${AURORA.cyan}25` }}>Focused</span>
                      <span className="px-3 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: `${AURORA.magenta}15`, color: AURORA.magenta, border: `1px solid ${AURORA.magenta}25` }}>FOMO Avoided</span>
                      <span className="px-3 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>Setup: Breakout</span>
                      <span className="px-3 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: `${AURORA.violet}15`, color: AURORA.violet, border: `1px solid ${AURORA.violet}25` }}>Followed Plan</span>
                    </div>
                  )}
                </div>
              </Motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   SCALE TIMELINE
   ═══════════════════════════════════════════ */
function ScaleTimeline() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx;

    function initScaleGSAP() {
      if (ctx) ctx.revert();

      const container = document.querySelector("#scale-timeline-container");
      const startNode = document.querySelector("#timeline-start-node");
      const cards = document.querySelectorAll("#scale-timeline-container .timeline-card");
      const box = document.querySelector(".scale-box");

      if (!container || cards.length === 0 || !box || !startNode) return;

      const containerRect = container.getBoundingClientRect();
      const startR = startNode.getBoundingClientRect();

      const p0 = {
        x: startR.left + startR.width / 2 - containerRect.left,
        y: startR.top + startR.height / 2 - containerRect.top
      };

      const cardPoints = Array.from(cards).map((card) => {
        const r = card.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top
        };
      });

      const lastPoint = cardPoints[cardPoints.length - 1];
      const pFinal = { x: lastPoint.x, y: lastPoint.y + 150 };
      const points = [p0, ...cardPoints, pFinal];

      const segmentLengths = [];
      let totalLength = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segmentLengths.push(len);
        totalLength += len;
      }

      const cardProgresses = [];
      let currentLen = 0;
      for (let i = 0; i < cardPoints.length; i++) {
        currentLen += segmentLengths[i];
        cardProgresses.push(currentLen / totalLength);
      }

      let d = "";
      if (points.length > 0) {
        d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const pStart = points[i];
          const pEnd = points[i + 1];
          const dy = pEnd.y - pStart.y;
          const cp1x = pStart.x;
          const cp1y = pStart.y + dy * 0.5;
          const cp2x = pEnd.x;
          const cp2y = pEnd.y - dy * 0.5;
          d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pEnd.x} ${pEnd.y}`;
        }
      }

      const pathBg = document.querySelector("#scale-path");
      const pathProgress = document.querySelector("#scale-path-progress");
      if (pathBg) pathBg.setAttribute("d", d);
      if (pathProgress) pathProgress.setAttribute("d", d);

      ctx = gsap.context(() => {
        cards.forEach((card, index) => {
          const item = TIMELINE_ITEMS[index];
          const isLeft = item ? item.side === 'left' : true;
          gsap.set(card, { opacity: 0, scale: 0.95, y: 10, x: isLeft ? -30 : 30 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#scale-timeline-container",
            start: "top 55%",
            end: "bottom 45%",
            scrub: 2,
          }
        });

        tl.fromTo(".scale-box", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.1, ease: "power1.out" });

        tl.to(".scale-box", {
          duration: 0.8,
          ease: "none",
          motionPath: {
            path: "#scale-path",
            align: "#scale-path",
            alignOrigin: [0.5, 0.5],
            autoRotate: true
          }
        }, 0);

        tl.to(".scale-box", {
          keyframes: [
            { backgroundColor: AURORA.cyan, boxShadow: `0 0 18px ${AURORA.cyan}cc`, duration: 0.16 },
            { backgroundColor: AURORA.violet, boxShadow: `0 0 18px ${AURORA.violet}cc`, duration: 0.16 },
            { backgroundColor: AURORA.magenta, boxShadow: `0 0 18px ${AURORA.magenta}cc`, duration: 0.16 },
            { backgroundColor: AURORA.mint, boxShadow: `0 0 18px ${AURORA.mint}cc`, duration: 0.16 },
            { backgroundColor: AURORA.cyan, boxShadow: `0 0 18px ${AURORA.cyan}cc`, duration: 0.16 }
          ],
          ease: "none",
          duration: 0.8
        }, 0);

        if (pathProgress) {
          const length = pathProgress.getTotalLength();
          gsap.set(pathProgress, { strokeDasharray: length, strokeDashoffset: length, opacity: 1 });
          tl.to(pathProgress, { strokeDashoffset: 0, duration: 0.8, ease: "none" }, 0);
        }

        cards.forEach((card, index) => {
          const progress = cardProgresses[index] || 0.5;
          const t = progress * 0.8;
          tl.to(card, {
            opacity: 1,
            scale: 1,
            y: 0,
            x: 0,
            duration: 0.04,
            ease: "power3.out",
            onStart: () => card.classList.add('aurora-card-active'),
            onReverseComplete: () => card.classList.remove('aurora-card-active')
          }, Math.max(0, t - 0.02));
        });

        tl.to(".scale-box", { opacity: 0, scale: 0.3, duration: 0.1, ease: "power1.in" });
      });
    }

    const timer = setTimeout(initScaleGSAP, 600);
    window.addEventListener("resize", initScaleGSAP);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", initScaleGSAP);
      if (ctx) ctx.revert();
    };
  }, []);

  const accents = [AURORA.cyan, AURORA.violet, AURORA.magenta, AURORA.mint, AURORA.cyan, AURORA.violet];

  return (
    <section ref={containerRef} className="relative z-10 py-20 md:py-28 px-6 overflow-hidden">
      <style>{`
        @keyframes auroraCardGlow {
          0%   { border-color: ${AURORA.cyan}60; box-shadow: 0 8px 24px ${AURORA.cyan}15; }
          25%  { border-color: ${AURORA.violet}60; box-shadow: 0 8px 24px ${AURORA.violet}15; }
          50%  { border-color: ${AURORA.magenta}60; box-shadow: 0 8px 24px ${AURORA.magenta}15; }
          75%  { border-color: ${AURORA.mint}60; box-shadow: 0 8px 24px ${AURORA.mint}15; }
          100% { border-color: ${AURORA.cyan}60; box-shadow: 0 8px 24px ${AURORA.cyan}15; }
        }
        .aurora-card-active {
          animation: auroraCardGlow 5s linear infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-18 relative z-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.15em] mb-5">
            <Stars className="w-3 h-3" /> Architecture
          </div>
          <h2 className="text-[clamp(2rem,5.5vw,3.5rem)] font-black leading-tight tracking-tight mb-3 mt-3">
            <span className="aurora-text-static">Built for Scale</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            An institutional-grade pipeline ensures your data is always synced, secured, and ready for analysis.
          </p>
          <div id="timeline-start-node" className="absolute left-1/2 -bottom-2 w-1 h-1 bg-transparent" />
        </Motion.div>

        <div id="scale-timeline-container" className="relative">
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full">
              <path id="scale-path" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="2" strokeDasharray="6 6" />
              <path id="scale-path-progress" fill="none" stroke="url(#aurora-glow-gradient)" strokeWidth="3" strokeLinecap="round" className="opacity-0" />
              <defs>
                <linearGradient id="aurora-glow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={AURORA.cyan} />
                  <stop offset="33%" stopColor={AURORA.violet} />
                  <stop offset="66%" stopColor={AURORA.magenta} />
                  <stop offset="100%" stopColor={AURORA.mint} />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div
            className="scale-box absolute w-4 h-4 rounded-md shadow-lg border border-white/80 flex items-center justify-center z-20 pointer-events-none opacity-0"
            style={{ left: 0, top: 0, background: `linear-gradient(135deg, ${AURORA.cyan}, ${AURORA.violet})` }}
          >
            <div className="w-1 h-1 rounded-sm bg-white shadow-[0_0_3px_#fff]" />
          </div>

          <div className="flex flex-col gap-10 md:gap-20 relative z-10 py-10 md:py-20">
            {TIMELINE_ITEMS.map((item, idx) => {
              const isLeft = item.side === 'left';
              return (
                <div key={item.label} className={`flex w-full ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <Motion.div className="timeline-card w-[85%] sm:w-[70%] md:w-[45%] flex items-center gap-4 bg-card/40 backdrop-blur-sm border border-border/30 p-5 rounded-2xl shadow-sm transition-all duration-500 cursor-default group">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${accents[idx]}15`, color: accents[idx] }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                      <p className="text-[11px] text-muted-foreground leading-snug">{item.sub}</p>
                    </div>
                  </Motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════ */
function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLightMode } = useAppTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isMobileLanding, setIsMobileLanding] = useState(false);
  const [isHoveredButton, setIsHoveredButton] = useState(false);
  const lenisRef = useRef(null);

  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.95]);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    return () => { if ('scrollRestoration' in history) history.scrollRestoration = 'auto'; };
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobileLanding(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobileLanding) return;
    const interval = setInterval(() => {
      setIsHoveredButton(prev => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, [isMobileLanding]);

  useEffect(() => {
    injectJsonLd('ld-org', buildOrganizationSchema());
    injectJsonLd('ld-website', buildWebSiteSchema());
    injectJsonLd('ld-software', buildSoftwareSchema());
    injectJsonLd('ld-faq', buildFAQSchema(LANDING_FAQ));
    return () => { ['ld-org', 'ld-website', 'ld-software', 'ld-faq'].forEach(removeJsonLd); };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    lenisRef.current = lenis;

    let updateLenis;

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Drive GSAP ticker with Lenis scroll RAF
    updateLenis = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    if (location.hash) {
      setTimeout(() => {
        lenis.scrollTo(location.hash, { duration: 1.2, immediate: false });
      }, 350);
    } else {
      window.scrollTo(0, 0);
    }

    // GSAP for Steps section
    gsap.fromTo(".step-card",
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: ".step-card", start: "top 80%" }
      }
    );

    // GSAP for Bento features section
    gsap.fromTo("#features .bento-grid > div",
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out",
        scrollTrigger: { trigger: "#features .bento-grid", start: "top 85%" }
      }
    );

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
      if (updateLenis) gsap.ticker.remove(updateLenis);
      ScrollTrigger.getAll().forEach(t => t.kill());
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.hash && lenisRef.current) {
      lenisRef.current.scrollTo(location.hash, { duration: 1.2 });
    }
  }, [location.hash]);


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative aurora-theme">
      <ScrollProgress />
      <GrainOverlay />
      <AuroraOrbs />
      <PublicNavbar />

      <main>
        {/* ═══════ HERO ═══════ */}
        <section ref={heroRef} className="relative min-h-[100dvh] flex items-center px-6 pt-24 pb-16 overflow-hidden">
          {/* Ambient background */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: isLightMode
              ? 'radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(0,212,255,0.04) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(0,212,255,0.08) 0%, transparent 50%)'
          }} />

          <Motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left — Copy */}
              <div className="relative z-10">
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-6"
                >
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full inline-flex items-center gap-2" style={{ background: `${AURORA.violet}12`, color: AURORA.violet, border: `1px solid ${AURORA.violet}25` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: AURORA.mint }} />
                    Exclusively for Gold Traders
                  </span>
                </Motion.div>

                <h1 className="text-[clamp(3rem,7.5vw,5.5rem)] font-black leading-[0.92] tracking-tighter mb-8 text-foreground flex flex-col items-start">
                  <AnimatedHeadline text="Every trade" delayOffset={0} />
                  <AnimatedHeadline text="you make" delayOffset={0.25} />
                  <AnimatedHeadline text="tells a story." className="aurora-text italic" delayOffset={0.5} />
                </h1>

                <Motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                  className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8"
                >
                  Every trade you make tells a story. XAU Journal captures it, analyses it, and turns raw execution into actionable intelligence.
                </Motion.p>

                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 1.0 }}
                  className="flex flex-wrap gap-6 items-center mb-10"
                >
                  <div
                    onClick={() => navigate('/login')}
                    onMouseEnter={() => setIsHoveredButton(true)}
                    onMouseLeave={() => setIsHoveredButton(false)}
                    onTouchStart={() => setIsHoveredButton(true)}
                    onTouchEnd={() => setIsHoveredButton(false)}
                    onTouchCancel={() => setIsHoveredButton(false)}
                    className="group flex flex-col items-center lg:items-start justify-center rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden relative"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      minWidth: '300px',
                      padding: '14px 20px',
                    }}
                  >
                    <MagicTextReveal
                      text="Try 7-Day Free Trial"
                      text2="CANCEL ANYTIME · NO CARD REQUIRED"
                      fontSize={20}
                      fontWeight={600}
                      color={isLightMode ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 1)"}
                      color2={isLightMode ? "rgba(0, 0, 0, 0.5)" : "rgba(161, 161, 170, 0.7)"}
                      forceHover={isHoveredButton}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        minHeight: '36px',
                        backdropFilter: 'none',
                      }}
                    />
                  </div>
                  <button onClick={() => navigate('/#features')} className="aurora-ghost">
                    See Features
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                  </button>
                </Motion.div>

                {/* Stats */}
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                  className="flex gap-8 md:gap-12"
                >
                  {STATS.map((stat, i) => (
                    <div key={i}>
                      <div className="text-xl md:text-2xl font-black aurora-text-static">
                        <Counter value={stat.value} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </Motion.div>
              </div>

              {/* Right — Mock Terminal */}
              <div className="hidden lg:flex justify-end">
                <MockTerminal />
              </div>
            </div>
          </Motion.div>
        </section>


        {/* ═══════ SCROLL STORYTELLING ═══════ */}
        <ScrollStorytelling isLightMode={isLightMode} />


        {/* ═══════ BENTO FEATURES ═══════ */}
        <BentoFeatures isLightMode={isLightMode} />


        {/* ═══════ HOW IT WORKS (STEPS) ═══════ */}
        <section className="relative z-10 py-24 md:py-36 px-6 overflow-hidden border-t border-border/10">
          <div className="max-w-5xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 md:mb-24"
            >
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-5 inline-block px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground">How It Works</span>
              <h2 className="text-[clamp(2rem,5.5vw,3.5rem)] font-black leading-[1.08] tracking-tight mt-4 mb-4">
                Three steps to <span className="aurora-text-static">mastery.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">From connection to conviction — your journey to data-driven trading starts here.</p>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step, i) => {
                const accents = [AURORA.cyan, AURORA.violet, AURORA.magenta];
                const accent = accents[i];
                return (
                  <div key={step.id} className="step-card relative overflow-hidden rounded-2xl border border-border/20 p-7 transition-all duration-500 group cursor-default" style={{ background: isLightMode ? 'rgba(255,255,255,0.5)' : 'rgba(13,13,26,0.5)', backdropFilter: 'blur(12px)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}06, transparent 70%)` }} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${accent}12`, color: accent }}>
                          {step.icon}
                        </div>
                        <span className="text-[40px] font-black leading-none" style={{ color: `${accent}15` }}>0{step.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* ═══════ SCALE TIMELINE ═══════ */}
        <ScaleTimeline />


        {/* ═══════ FAQ ═══════ */}
        <section className="relative z-10 py-24 md:py-36 px-6 overflow-hidden border-t border-border/10">
          <div className="max-w-3xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-14"
            >
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-5 inline-block px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground">FAQ</span>
              <h2 className="text-[clamp(2rem,5vw,3rem)] font-black leading-tight tracking-tight mt-4">
                Questions <span className="aurora-text-static">answered.</span>
              </h2>
            </Motion.div>

            <div className="space-y-3">
              {LANDING_FAQ.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <Motion.div
                    key={i}
                    className="rounded-xl border overflow-hidden transition-all duration-300"
                    style={{ borderColor: isOpen ? `${AURORA.violet}30` : 'hsl(var(--border) / 0.2)', background: isLightMode ? 'rgba(255,255,255,0.4)' : 'rgba(13,13,26,0.4)' }}
                    initial={false}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                      <svg className={`faq-caret shrink-0 w-4 h-4 text-muted-foreground ${isOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <Motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </section>


        {/* ═══════ FINAL CTA ═══════ */}
        <section className="relative z-10 py-32 md:py-44 px-6 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[600px] h-[600px] rounded-full opacity-10 blur-[120px]" style={{ background: `radial-gradient(circle, ${AURORA.violet}, ${AURORA.cyan})` }} />
          </div>

          {/* Concentric rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            {[1, 2, 3].map((r) => (
              <Motion.div
                key={r}
                className="absolute rounded-full border"
                style={{ width: 200 + r * 120, height: 200 + r * 120, borderColor: `${AURORA.violet}${Math.round(15 / r).toString(16).padStart(2, '0')}` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3 + r, repeat: Infinity, ease: 'easeInOut', delay: r * 0.5 }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-[clamp(2rem,6vw,4rem)] font-black leading-[1.08] tracking-tight mb-6">
                Stop guessing.<br /><span className="aurora-text">Start knowing.</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-10 max-w-md mx-auto">
                Join the traders who've turned raw execution into a quantified edge.
              </p>
              <MagneticButton onClick={() => navigate('/login')} className="aurora-cta text-base px-10 py-4">
                Start Your Free Trial
                <svg width="15" height="10" viewBox="0 0 13 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
              </MagneticButton>
            </Motion.div>
          </div>
        </section>
      </main>


      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 border-t border-border/10 px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                The intelligence terminal built exclusively for gold traders. Auto-sync your MT5 trades, analyse session performance, and sharpen your edge.
              </p>
            </div>
            {/* Platform */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { to: '/pricing', label: 'Pricing' },
                  { to: '/the-story', label: 'Our Story' },
                  { to: '/contact', label: 'Contact' },
                  { to: '/login', label: 'Login' },
                ].map(l => (
                  <li key={l.to}><Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { to: '/privacy', label: 'Privacy Policy' },
                  { to: '/terms-and-conditions', label: 'Terms of Service' },
                  { to: '/refund-policy', label: 'Refund Policy' },
                ].map(l => (
                  <li key={l.to}><Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mt-14 pt-8 border-t border-border/10 gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} XAU Journal. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: TwitterX, href: '#' },
                { Icon: Discord, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/40 transition-all duration-200">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>


      {/* ═══════ SCROLL TO TOP ═══════ */}
      <Motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : 30 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-6 right-6 z-[90] p-3.5 rounded-2xl bg-background/80 backdrop-blur-md border border-border/20 text-muted-foreground hover:text-foreground shadow-lg hover:-translate-y-1 active:scale-90 transition-all duration-200 ${!isScrolled ? 'pointer-events-none' : ''}`}
        aria-label="Scroll to top"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
      </Motion.button>
    </div>
  );
}

export { LandingPage };
