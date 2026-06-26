import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}
import Logo from '../components/Logo';
import { PublicNavbar } from '../components/PublicNavbar';
import { MagicTextReveal } from '../components/MagicTextReveal';
import { useAppTheme } from '../hooks/useAppTheme';
import {
  LANDING_FAQ,
  buildFAQSchema,
  buildOrganizationSchema,
  buildSoftwareSchema,
  buildWebSiteSchema,
  injectJsonLd,
  removeJsonLd,
} from '../lib/seo';
import {
  MoonStarsFill,
  SunFill,
  CloudArrowDownFill,
  LightningChargeFill,
  BarChartLineFill,
  Stars,
  Phone,
  HddNetwork,
  Display,
  GearWideConnected,
  DatabaseFill,
  WindowSidebar,
  TwitterX,
  Facebook,
  Instagram,
  Discord
} from 'react-bootstrap-icons';

/* ─── Data ───────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    title: 'Instant MT5 Sync',
    body: 'Effortlessly capture your trade history and sync your performance data to the cloud. Eliminate manual logging and ensure 100% accuracy for every position closed.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>,
    title: 'Deep Analytics',
    body: 'Win-rate by session, drawdown clusters, streak analysis, and behavioural heatmaps, every metric purpose-built for clarity.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    title: 'Trade Calendar',
    body: 'A month-view calendar shows your P&L heat at a glance. Identify your best and worst days in a single look.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    title: 'Private & Secure Data',
    body: 'Your trading data is yours alone. We use industry-standard encryption and isolated storage protocols to ensure your sensitive performance data remains 100% private.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    title: 'Trade Journal',
    body: 'Attach thoughts, emotions, and notes to each trade. Build an annotated playbook straight from your own history.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    title: 'Session Intelligence',
    body: 'London, New York, Tokyo, Sydney — see exactly which session your edge lives in and schedule your trading around it.',
  },
];

const STEPS = [
  {
    id: '01',
    icon: <CloudArrowDownFill className="w-6 h-6" />,
    title: 'Connect Your Broker',
    body: 'Authorize your account via our secure portal. No plugins or Expert Advisors required just a direct, encrypted connection to your MT5 platform.'
  },
  {
    id: '02',
    icon: <LightningChargeFill className="w-6 h-6" />,
    title: 'Real-time Trade Sync',
    body: 'Stop logging trades manually. Our automated system syncs every closed position from your broker to your journal the moment it happens.'
  },
  {
    id: '03',
    icon: <BarChartLineFill className="w-6 h-6" />,
    title: 'Optimize Your Strategy',
    body: 'Transform trade data into profit. Use our advanced analytics, behavioral heatmaps, and session tracking to identify your edge and master your psychology.'
  },
];

const STATS = [
  { value: 'Precision', label: 'Built specifically for traders' },
  { value: '1s', label: 'MT5 sync latency' },
  { value: '100%', label: 'Your data, your control' },
];

/* ─── Story chapters for scroll narrative ─── */
const STORY_CHAPTERS = [
  {
    chapter: '01',
    label: 'The Problem',
    headline: "You're trading blindly.",
    sub: "Every missed trade. Every blown stop. Every emotional entry. Without a journal, you repeat the same mistakes and the market keeps the tuition.",
    accent: 'from-rose-400/20 to-pink-300/10',
    glow: 'rgba(251,113,133,0.2)',
    dotColor: '#fb7185',
  },
  {
    chapter: '02',
    label: 'The Pattern',
    headline: 'Your edge already exists.',
    sub: "It's buried in your trade history in the sessions where you win, the setups that perform, the hours when your focus is sharp. You just can't see it yet.",
    accent: 'from-amber-400/20 to-orange-300/10',
    glow: 'rgba(251,191,36,0.2)',
    dotColor: '#fbbf24',
  },
  {
    chapter: '03',
    label: 'The Insight',
    headline: 'Data reveals what instinct misses.',
    sub: 'Drawdown curves. Session heatmaps. Streak analysis. When your trades become data, patterns emerge that transform how you approach every position.',
    accent: 'from-violet-400/20 to-purple-300/10',
    glow: 'rgba(167,139,250,0.2)',
    dotColor: '#a78bfa',
  },
  {
    chapter: '04',
    label: 'The Solution',
    headline: 'Meet XAU Journal.',
    sub: 'The only trading journal built exclusively for XAUUSD. Auto-sync every trade from MT5. Analyze your edge. Journal your psychology. All in one precision tool.',
    accent: 'from-emerald-400/20 to-teal-300/10',
    glow: 'rgba(52,211,153,0.2)',
    dotColor: '#34d399',
  },
];

/* ─── Floating particles ─── */
function Particles({ count = 20, isLightMode }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => {
      const pseudoRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      return {
        id: i,
        x: pseudoRandom(i + 1) * 100,
        y: pseudoRandom(i + 2) * 100,
        size: pseudoRandom(i + 3) * 2.5 + 1,
        duration: pseudoRandom(i + 4) * 14 + 10,
        delay: pseudoRandom(i + 5) * 8,
        opacity: pseudoRandom(i + 6) * 0.25 + 0.05,
      };
    })
  );

  const activeCount = isMobile ? 6 : count;
  const colors = ['167,139,250', '251,113,133', '52,211,153', '251,191,36', '129,140,248'];

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {particles.slice(0, activeCount).map((p) => (
        <Motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: isLightMode
              ? `rgba(${colors[p.id % colors.length]},${p.opacity * 0.5})`
              : `rgba(${colors[p.id % colors.length]},${p.opacity})`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(p.id) * 15, 0],
            opacity: [p.opacity, p.opacity * 0.2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Magnetic CTA button ─── */
function MagneticButton({ children, onClick, className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const spring = { type: 'spring', stiffness: 200, damping: 18 };

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({ x: (e.clientX - cx) * 0.2, y: (e.clientY - cy) * 0.2 });
  };

  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <Motion.button
      ref={ref}
      animate={{ x: pos.x, y: pos.y }}
      transition={spring}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </Motion.button>
  );
}

/* ─── Animated number counter ─── */
function Counter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const isNum = !isNaN(parseFloat(target));
    if (!isNum) return;
    const end = parseFloat(target);
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(end);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  const isNum = !isNaN(parseFloat(target));
  return (
    <span ref={ref}>
      {prefix}{isNum ? count : target}{suffix}
    </span>
  );
}

/* ─── Story chapter with scroll reveal ─── */
function StoryChapter({ chapter, label, headline, sub, glow, dotColor }) {
  const ref = useRef(null);
  
  return (
    <Motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="story-chapter-card relative w-full flex flex-col justify-center items-start text-left"
    >
      {/* Background Glow */}
      <Motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 0.8, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <div 
          className="absolute inset-0 blur-3xl rounded-full"
          style={{ 
            background: `radial-gradient(circle at center, ${glow} 0%, transparent 70%)`,
            transform: 'translateZ(0)'
          }}
        />
      </Motion.div>

      <div className="relative z-10 w-full max-w-xl mx-auto md:mx-0">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-3 bg-secondary/50 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: dotColor, boxShadow: `0 0 12px ${dotColor}` }} />
            <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">{chapter}</span>
          </div>
          <div className="h-px bg-border/50 flex-1" />
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground/60 hidden sm:block">{label}</span>
        </div>

        <Motion.h2 
          className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6"
        >
          {headline}
        </Motion.h2>
        
        <p className="text-xl md:text-2xl font-medium text-muted-foreground mb-6 leading-relaxed">
          {sub}
        </p>
      </div>
    </Motion.div>
  );
}

/* ─── Scroll progress indicator ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <Motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(to right, #a78bfa, #fb7185, #34d399)',
      }}
    />
  );
}

/* ─── Animated Text for Hero ─── */
function AnimatedText({ text, className = '' }) {
  const letterVariants = {
    hidden: { y: "110%" },
    visible: { y: "0%", transition: { ease: [0.16, 1, 0.3, 1], duration: 0.8 } }
  };
  return (
    <span className={`inline-flex flex-wrap pb-2 ${className}`}>
      {text.split(' ').map((word, i, arr) => (
        <span key={i} className={`inline-block whitespace-nowrap overflow-hidden ${i < arr.length - 1 ? 'mr-[0.25em]' : ''}`}>
          {word.split('').map((char, j) => (
            <Motion.span
              key={j}
              variants={letterVariants}
              className="inline-block"
            >
              {char}
            </Motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

/* ─── Mock Trading Dashboard UI for Hero ─── */
function MockDashboardUI() {
  return (
    <div className="relative w-full max-w-[580px] lg:max-w-none aspect-[1.32] group select-none">
      {/* Dynamic ambient radial gradients under/behind mockup */}
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 via-purple-500/25 to-pink-500/20 blur-2xl opacity-60 group-hover:opacity-75 transition-all duration-700 pointer-events-none" />

      {/* Floating tag badges */}
      <Motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 -right-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md text-emerald-400 text-[10px] font-black tracking-wider uppercase z-30 shadow-md flex items-center gap-1.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
        MT5 Live Synced
      </Motion.div>

      <Motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -left-4 px-3 py-2 rounded-xl bg-primary/10 border border-primary/25 backdrop-blur-md text-foreground z-30 shadow-md flex items-center gap-2"
      >
        <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-primary text-[9px] font-black">2.8</div>
        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Profit Factor</div>
      </Motion.div>

      {/* Main glassomorphic terminal frame */}
      <Motion.div
        whileHover={{ y: -3, rotateX: 1.5, rotateY: -1.5 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full rounded-[2rem] border border-border/40 bg-card/65 dark:bg-card/45 backdrop-blur-xl shadow-2xl p-4 overflow-hidden flex flex-col will-change-transform"
      >
        {/* Mock Title Bar */}
        <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="h-4 w-px bg-border/30 mx-1" />
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">XAU Journal v2.0</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-foreground/[0.03] border border-border/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[9px] font-bold text-foreground">XAUUSD $2,342.15</span>
              <span className="text-[9px] font-black text-emerald-400">+0.85%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Connected</span>
            </div>
          </div>
        </div>

        {/* Workspace panel */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Sidebar */}
          <div className="w-[110px] md:w-[130px] border-r border-border/25 pr-3 flex flex-col gap-1 shrink-0">
            <div className="px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Dashboard
            </div>
            <div className="px-2 py-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.02] text-[10px] font-bold flex items-center gap-2 transition-colors cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
              Playbook
            </div>
            <div className="px-2 py-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.02] text-[10px] font-bold flex items-center gap-2 transition-colors cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
              Analytics
            </div>
            <div className="px-2 py-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.02] text-[10px] font-bold flex items-center gap-2 transition-colors cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
              Calendar
            </div>

            <div className="mt-auto border-t border-border/25 pt-2.5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-[8px] font-black text-white">
                TR
              </div>
              <div className="overflow-hidden">
                <div className="text-[9px] font-black text-foreground truncate">GoldTrader</div>
                <div className="text-[7.5px] font-black text-muted-foreground/50 tracking-wider">PRO LIFE</div>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Stat Row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-foreground/[0.01] border border-border/20 rounded-xl p-2">
                <div className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-0.5">Net Profit</div>
                <div className="text-xs font-black text-emerald-400 font-mono">+$14,250.00</div>
              </div>
              <div className="bg-foreground/[0.01] border border-border/20 rounded-xl p-2">
                <div className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-0.5">Win Rate</div>
                <div className="text-xs font-black text-foreground font-mono">72.4%</div>
              </div>
              <div className="bg-foreground/[0.01] border border-border/20 rounded-xl p-2">
                <div className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-0.5">Trades</div>
                <div className="text-xs font-black text-foreground font-mono">134</div>
              </div>
            </div>

            {/* Price Chart SVG */}
            <div className="relative bg-foreground/[0.01] border border-border/20 rounded-xl p-3 flex-1 flex flex-col min-h-[110px] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              <div className="flex justify-between items-center relative z-10 mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-foreground">XAUUSD Performance</span>
                <span className="text-[8px] font-bold text-muted-foreground/50">Trade Execution Path</span>
              </div>

              {/* Graphic line chart */}
              <div className="flex-1 relative mt-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Dash grid base lines */}
                  <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(128,128,128,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
                  <line x1="0" y1="30" x2="320" y2="30" stroke="rgba(128,128,128,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />

                  {/* Gradient fill */}
                  <path
                    d="M 0 85 Q 60 70 110 80 T 210 35 T 300 15 L 320 20 L 320 100 L 0 100 Z"
                    fill="url(#chart-grad)"
                  />

                  {/* Execution paths */}
                  <path
                    d="M 0 85 Q 60 70 110 80 T 210 35 T 300 15 L 320 20"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Buy point */}
                  <circle cx="110" cy="80" r="4.5" className="fill-emerald-400 stroke-card" strokeWidth="1.5" />
                  <text x="117" y="83" className="fill-muted-foreground text-[7px] font-black uppercase tracking-wider">Buy MT5</text>

                  {/* Take Profit point */}
                  <circle cx="300" cy="15" r="4.5" className="fill-emerald-400 stroke-card" strokeWidth="1.5" />
                  <text x="250" y="12" className="fill-emerald-400 text-[7px] font-black uppercase tracking-wider font-mono">+$4,820.00</text>
                </svg>
              </div>
            </div>

            {/* Recent trade item */}
            <div className="bg-foreground/[0.01] border border-border/20 rounded-xl p-2.5 flex items-center justify-between transition-colors hover:bg-foreground/[0.03]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-black">
                  BUY
                </div>
                <div>
                  <div className="text-[10px] font-black text-foreground">London Breakout</div>
                  <div className="text-[8px] font-bold text-muted-foreground/50">2321.40 → 2335.10 | +137 pips</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-emerald-400 font-mono">+$1,644.00</div>
                <div className="text-[7.5px] font-black px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400 uppercase tracking-wider inline-block">Focused</div>
              </div>
            </div>

          </div>
        </div>
      </Motion.div>
    </div>
  );
}


/* ─── Main landing ─── */
export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode } = useAppTheme();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isHoveredButton, setIsHoveredButton] = useState(false);
  const [isMobileLanding, setIsMobileLanding] = useState(false);
  const lenisRef = useRef(null);

  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
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

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    if (location.hash) {
      setTimeout(() => {
        lenis.scrollTo(location.hash, { duration: 1.2, immediate: false });
      }, 350);
    } else {
      window.scrollTo(0, 0);
    }

    // Set up GSAP for Steps section
    gsap.fromTo(".step-card",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".step-card",
          start: "top 80%",
        }
      }
    );

    // Set up GSAP for Bento features section
    gsap.fromTo("#features .grid > div",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#features .grid",
          start: "top 85%",
        }
      }
    );

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
      cancelAnimationFrame(rafId);
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.hash && lenisRef.current) {
      lenisRef.current.scrollTo(location.hash, { duration: 1.2 });
    }
  }, [location.hash]);



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 17, mass: 1 } },
  };



  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased">
      <ScrollProgress />
      <Particles isLightMode={isLightMode} />

      {/* Subtle ambient background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          background: isLightMode
            ? 'radial-gradient(ellipse at 30% 0%, rgba(167,139,250,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(251,113,133,0.03) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 30% 0%, rgba(167,139,250,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(251,113,133,0.04) 0%, transparent 50%)'
        }}
        aria-hidden="true"
      />

      {/* ─── NAV ─── */}
      <PublicNavbar />

      <main>
        {/* ─── HERO ─── */}
        <section ref={heroRef} className="relative z-10 min-h-[100vh] flex flex-col justify-center px-6 pt-28 pb-32 md:pb-44 overflow-hidden">
          <Motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="max-w-7xl mx-auto w-full relative z-10 will-change-transform">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
              {/* Left Column: Hero Copy & Actions */}
              <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                <Motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center lg:items-start">

                  {/* Badge */}
                  <Motion.div
                    variants={itemVariants}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/40 bg-foreground/[0.03] text-muted-foreground text-[11px] font-bold uppercase tracking-[0.15em] mb-8 backdrop-blur-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent -translate-x-full animate-[shimmer_4s_infinite] pointer-events-none" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                    Exclusively for Gold Traders
                  </Motion.div>

                  {/* Hero headline */}
                  <Motion.div variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                        staggerChildren: 0.02
                      }
                    }
                  }}>
                    <h1 className="!text-[clamp(2.5rem,5.5vw,4.5rem)] font-black leading-[0.95] tracking-tighter mb-8 text-foreground flex flex-col items-center lg:items-start">
                      <AnimatedText text="Every trade" className="justify-center lg:justify-start" />
                      <AnimatedText text="you make" className="justify-center lg:justify-start" />
                      <AnimatedText text="tells a story." className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-to to-purple-400 italic justify-center lg:justify-start" />
                    </h1>
                  </Motion.div>

                  {/* Sub text */}
                  <Motion.p variants={itemVariants} className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mb-10 font-medium">
                    XAU Journal is the precision trading journal built for gold traders — track, analyse, and master your edge in XAUUSD.
                  </Motion.p>

                  {/* CTA */}
                  <Motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start justify-center w-full sm:w-auto mb-12">
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
                  </Motion.div>

                  {/* Stats */}
                  <Motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 md:gap-12 w-full max-w-md">
                    {STATS.map((s) => (
                      <div key={s.label} className="text-left group">
                        <div className="text-xl md:text-2xl font-black tracking-tight text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300">
                          <Counter target={s.value} />
                        </div>
                        <div className="text-[0.55rem] font-bold text-muted-foreground/70 uppercase tracking-[0.15em] leading-tight">{s.label}</div>
                      </div>
                    ))}
                  </Motion.div>

                </Motion.div>
              </div>

              {/* Right Column: High-Fidelity Mock Terminal/Dashboard UI */}
              <div className="lg:col-span-6 w-full flex justify-center items-center">
                <Motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <MockDashboardUI isLightMode={isLightMode} />
                </Motion.div>
              </div>
            </div>

          </Motion.div>
        </section>

        {/* ─── STORY NARRATIVE ─── */}
        <ScrollStorytelling isLightMode={isLightMode} />

        {/* ─── FEATURES ─── */}
        <BentoFeatures isLightMode={isLightMode} />

        {/* ─── STEPS ─── */}
        <section className="relative z-10 py-28 md:py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: isLightMode
              ? 'radial-gradient(ellipse at center, rgba(167,139,250,0.03) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at center, rgba(167,139,250,0.06) 0%, transparent 60%)'
          }} />
          <div className="max-w-6xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20 md:mb-28"
            >
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-5 inline-block px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground">Workflow</span>
              <h2 className="text-[clamp(2rem,5.5vw,3.5rem)] font-black leading-tight tracking-tight mt-4">Three steps to mastery</h2>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-20 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

              {STEPS.map((step, i) => {
                const accentColors = ['#a78bfa', '#fb7185', '#34d399'];
                return (
                  <div
                    key={step.id}
                    className="step-card relative group mt-8 md:mt-0 opacity-0"
                  >
                    <div className="relative bg-card/50 backdrop-blur-sm border border-border/30 rounded-3xl p-8 pt-12 transition-all duration-500 hover:border-border/60 hover:shadow-lg">
                      {/* Inner wrapper for overflow content to prevent badge clipping */}
                      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px" style={{ background: `linear-gradient(to right, transparent, ${accentColors[i]}40, transparent)` }} />
                        <div className="absolute top-6 right-8 text-7xl font-black text-foreground/[0.03] select-none">{step.id}</div>
                      </div>

                      {/* Number badge */}
                      <div
                        className="absolute -top-6 left-8 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-white font-black text-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                        style={{ background: `linear-gradient(135deg, ${accentColors[i]}, ${accentColors[i]}cc)` }}
                      >
                        {step.icon}
                      </div>

                      {/* Faint number watermark */}
                      <div className="absolute top-6 right-8 text-7xl font-black text-foreground/[0.03] select-none">{step.id}</div>

                      <div className="mt-4 relative z-10">
                        <h3 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <ScaleTimeline />

        {/* ─── FAQ ─── */}
        <section id="faq" className="relative z-10 py-28 md:py-36 px-6">
          <div className="max-w-2xl mx-auto">
            <Motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 inline-block px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground">FAQ</span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3 mt-4">Frequently asked questions</h2>
              <p className="text-sm text-muted-foreground font-medium">Everything you need to know about XAU Journal.</p>
            </Motion.div>
            <div className="space-y-0.5">
              {LANDING_FAQ.map((item, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <Motion.div
                    key={item.q}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    layout
                    className="overflow-hidden rounded-xl"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full flex justify-between items-center gap-4 py-5 px-2 text-left font-semibold text-sm md:text-[15px] border-0 bg-transparent outline-none group focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="group-hover:text-primary transition-colors duration-200">{item.q}</span>
                      <Motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="text-muted-foreground text-lg flex-shrink-0 font-light">
                        +
                      </Motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <Motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                          <p className="pb-5 px-2 text-sm text-muted-foreground leading-relaxed font-medium">{item.a}</p>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </Motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="relative z-10 py-36 md:py-56 px-6 text-center overflow-hidden">
          {/* Soft pastel ambient gradient */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: isLightMode
              ? 'radial-gradient(ellipse at center, rgba(167,139,250,0.06) 0%, transparent 55%)'
              : 'radial-gradient(ellipse at center, rgba(167,139,250,0.1) 0%, transparent 55%)'
          }} />

          {/* Subtle concentric rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            {[1, 2, 3].map((ring) => (
              <Motion.div
                key={ring}
                className="absolute rounded-full border border-foreground/[0.04]"
                style={{ width: `${ring * 220}px`, height: `${ring * 220}px` }}
                animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 5 + ring, repeat: Infinity, ease: 'easeInOut', delay: ring * 0.6 }}
              />
            ))}
          </div>

          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto relative z-10"
          >
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase mb-8 inline-block px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-border/30 text-muted-foreground">Start for free</span>
            <h2 className="!text-[clamp(3rem,5vw,7rem)] font-black leading-[0.95] tracking-tighter mb-8 text-foreground mt-4">
              Stop guessing.<br />
              <span className="text-gradient">Start knowing.</span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground mb-14 font-medium max-w-xl mx-auto leading-relaxed">
              Join thousands of traders who have standardized their journaling with XAU Journal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <MagneticButton onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300">
                <span>Create free account</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
              </MagneticButton>
            </div>
          </Motion.div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/30 py-16 px-6 md:px-10 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.8fr_1fr] gap-14 md:gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left justify-center gap-3">
              <Logo iconSize="w-6 h-6" />
              <p className="text-[11px] font-medium text-muted-foreground/70 max-w-[200px] leading-relaxed">
                Precision performance terminal and automated MT5 synchronization designed exclusively for XAUUSD traders.
              </p>
            </div>
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70 mb-6">Platform</h4>
              <ul className="space-y-3 text-[13px] font-medium text-muted-foreground text-center md:text-left">
                <li><Link to="/pricing" className="hover:text-foreground transition-colors duration-200">Pricing</Link></li>
                <li><Link to="/the-story" className="hover:text-foreground transition-colors duration-200">The Story</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors duration-200">Contact</Link></li>
                <li><Link to="/login?mode=signin" className="hover:text-foreground transition-colors duration-200">Login</Link></li>
              </ul>
            </div>
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70 mb-6">Legal</h4>
              <ul className="space-y-3 text-[13px] font-medium text-muted-foreground text-center md:text-left">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-foreground transition-colors duration-200">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-foreground transition-colors duration-200">Refund Policy</Link></li>
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
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-1.5 justify-center md:justify-end">
                  made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 text-center md:text-right">© Copyright 2026 Xau Journal. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <Motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : 30 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-6 right-6 z-[90] p-3.5 rounded-2xl bg-background/80 backdrop-blur-md border border-transparent text-muted-foreground hover:text-foreground shadow-lg hover:-translate-y-1 active:scale-90 transition-all duration-200 ${!isScrolled ? 'pointer-events-none' : ''}`}
        aria-label="Scroll to top"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
      </Motion.button>
    </div>
  );
}

/* ─── Storytelling Mockups ─── */
function MockupDrawdown() {
  return (
    <div className="relative w-full h-full rounded-2xl border border-rose-500/30 bg-card/60 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden group shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
      <div className="flex justify-between items-center z-10">
        <div>
          <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Drawdown Alert</div>
          <div className="text-lg font-black text-foreground font-mono">-$2,450.00</div>
        </div>
        <div className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase">
          Uncontrolled
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center my-4 h-[120px]">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rose-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M 0 10 Q 30 15 60 45 T 120 30 T 180 75 L 200 70 L 200 80 L 0 80 Z" fill="url(#rose-grad)" />
          <path d="M 0 10 Q 30 15 60 45 T 120 30 T 180 75 L 200 70" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="45" r="3.5" className="fill-rose-500 stroke-card" strokeWidth="1.5" />
          <circle cx="180" cy="75" r="3.5" className="fill-rose-500 stroke-card" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider text-center z-10">
        No Playbook · No Journal · Repeating Mistakes
      </div>
    </div>
  );
}

function MockupRadar() {
  return (
    <div className="relative w-full h-full rounded-2xl border border-amber-500/30 bg-card/60 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      <div className="flex justify-between items-center z-10">
        <div>
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Edge Discovery</div>
          <div className="text-lg font-black text-foreground">Analyzing Sessions</div>
        </div>
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      </div>

      <div className="flex-1 relative flex items-center justify-center my-4 h-[120px]">
        <div className="absolute w-[110px] h-[110px] rounded-full border border-amber-500/10 flex items-center justify-center">
          <div className="w-[80px] h-[80px] rounded-full border border-amber-500/15 flex items-center justify-center">
            <div className="w-[50px] h-[50px] rounded-full border border-amber-500/20" />
          </div>
        </div>

        <div
          className="absolute w-[110px] h-[110px] rounded-full overflow-hidden pointer-events-none"
          style={{
            maskImage: 'conic-gradient(from 0deg, black, transparent 30%)',
            WebkitMaskImage: 'conic-gradient(from 0deg, black, transparent 30%)'
          }}
        >
          <div className="w-full h-full origin-center animate-[spin_4s_linear_infinite] bg-gradient-to-r from-amber-500/20 to-transparent" />
        </div>

        <div className="absolute w-[120px] h-px bg-amber-500/10" />
        <div className="absolute h-[120px] w-px bg-amber-500/10" />

        <div className="absolute top-[35%] left-[30%] w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
        <div className="absolute bottom-[28%] right-[35%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse [animation-delay:0.7s]" />
        <div className="absolute top-[25%] right-[28%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse [animation-delay:1.4s]" />
      </div>

      <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider text-center z-10">
        Scanning 124 trades... patterns detected
      </div>
    </div>
  );
}

function MockupHeatmap() {
  return (
    <div className="relative w-full h-full rounded-2xl border border-violet-500/30 bg-card/60 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
      <div className="flex justify-between items-center z-10">
        <div>
          <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Analytics Layer</div>
          <div className="text-lg font-black text-foreground">Session Efficiency</div>
        </div>
        <div className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[9px] font-black uppercase">
          78.4% WR
        </div>
      </div>

      <div className="flex-1 my-4 flex flex-col justify-center gap-1.5 h-[120px] px-2">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[8px] font-black text-muted-foreground/60 w-10 uppercase tracking-wider">London</span>
          <div className="flex-1 h-3 rounded bg-violet-500/40 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[78%] bg-gradient-to-r from-violet-500 to-purple-400" />
          </div>
          <span className="text-[9px] font-black text-foreground font-mono">78%</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[8px] font-black text-muted-foreground/60 w-10 uppercase tracking-wider">New York</span>
          <div className="flex-1 h-3 rounded bg-violet-500/40 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-violet-500 to-purple-400" />
          </div>
          <span className="text-[9px] font-black text-foreground font-mono">52%</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[8px] font-black text-muted-foreground/60 w-10 uppercase tracking-wider">Tokyo</span>
          <div className="flex-1 h-3 rounded bg-violet-500/40 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[24%] bg-gradient-to-r from-violet-500 to-purple-400" />
          </div>
          <span className="text-[9px] font-black text-foreground font-mono">24%</span>
        </div>
      </div>

      <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider text-center z-10">
        London session is your primary edge
      </div>
    </div>
  );
}

function MockupSync() {
  return (
    <div className="relative w-full h-full rounded-2xl border border-emerald-500/30 bg-card/60 backdrop-blur-md p-5 flex flex-col justify-between overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="flex justify-between items-center z-10">
        <div>
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Precision Terminal</div>
          <div className="text-lg font-black text-foreground">Sync Complete</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Connected</span>
        </div>
      </div>

      <div className="flex-1 my-4 flex flex-col items-center justify-center gap-3 h-[120px]">
        <div className="flex items-center justify-between w-full max-w-[200px]">
          <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] border border-border/20 flex items-center justify-center text-xs font-black">
            MT5
          </div>
          <div className="flex-1 mx-2 relative h-1 flex items-center justify-center">
            <div className="absolute inset-0 bg-border/20 rounded" />
            <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] font-black text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            XAU
          </div>
        </div>

        <div className="text-[10px] font-black text-foreground flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          232 positions imported
        </div>
      </div>

      <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider text-center z-10">
        Institutional pipeline is fully operational
      </div>
    </div>
  );
}

/* ─── Scroll-Driven Storytelling Component ─── */
export function ScrollStorytelling({ isLightMode }) {
  return (
    <div className="relative w-full border-t border-border/20 bg-background z-10 py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full px-6 flex flex-col gap-24 md:gap-32">
        {STORY_CHAPTERS.map((ch, i) => {
          const isEven = i % 2 === 0;
          
          return (
            <div key={ch.chapter} className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
              
              {/* Image Column */}
              <div className={`col-span-12 md:col-span-6 w-full ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                <Motion.div 
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                  className="w-full max-w-[500px] h-[300px] md:h-[380px] mx-auto relative shrink-0"
                >
                  {i === 0 && <MockupDrawdown isLightMode={isLightMode} />}
                  {i === 1 && <MockupRadar isLightMode={isLightMode} />}
                  {i === 2 && <MockupHeatmap isLightMode={isLightMode} />}
                  {i === 3 && <MockupSync isLightMode={isLightMode} />}
                </Motion.div>
              </div>

              {/* Text Column */}
              <div className={`col-span-12 md:col-span-6 flex flex-col ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                <StoryChapter {...ch} index={i} isEven={isEven} />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Bento Features Component ─── */
export function BentoFeatures({ isLightMode }) {
  return (
    <section id="features" className="relative z-10 py-28 md:py-40 px-6 overflow-hidden border-t border-border/20">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isLightMode
          ? 'radial-gradient(ellipse at bottom, rgba(167,139,250,0.03) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at bottom, rgba(167,139,250,0.06) 0%, transparent 60%)'
      }} />

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
            Every tool you need.<br />Nothing you don't.
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed">
            Designed by traders, for traders. We've stripped away the noise to focus on the metrics that actually improve your edge.
          </p>
        </Motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: MT5 Sync */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-border/30 bg-card/45 backdrop-blur-md p-8 flex flex-col justify-between min-h-[300px] hover:border-border/60 hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Instant MT5 Sync</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Effortlessly capture your trade history and sync your performance data to the cloud. Eliminate manual logging and ensure 100% accuracy for every position closed.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4 bg-foreground/[0.01] border border-border/20 rounded-2xl p-4 w-full max-w-[340px]">
                <div className="text-[10px] font-black text-foreground">Broker Server</div>
                <div className="flex-1 h-1 bg-border/20 rounded relative overflow-hidden">
                  <div className="absolute inset-y-0 w-8 bg-primary rounded animate-[shimmer_2s_infinite]" />
                </div>
                <div className="text-[10px] font-black text-primary">Terminal Sync</div>
              </div>
            </div>
          </div>

          {/* Card 2: Session Intelligence */}
          <div className="md:col-span-1 relative group overflow-hidden rounded-3xl border border-border/30 bg-card/45 backdrop-blur-md p-8 flex flex-col justify-between min-h-[300px] hover:border-border/60 hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Session Intelligence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                London, New York, Tokyo, Sydney — see exactly which session your edge lives in and schedule your trading around it.
              </p>
            </div>

            <div className="mt-6 flex justify-center items-center h-20">
              <div className="w-14 h-14 rounded-full border border-amber-500/30 flex items-center justify-center relative">
                <div className="absolute top-1 bottom-1/2 w-0.5 bg-amber-500 origin-bottom rotate-[45deg]" />
                <div className="absolute left-1 right-1/2 h-0.5 bg-amber-500/60 origin-right" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
            </div>
          </div>

          {/* Card 3: Trade Calendar */}
          <div className="md:col-span-1 relative group overflow-hidden rounded-3xl border border-border/30 bg-card/45 backdrop-blur-md p-8 flex flex-col justify-between min-h-[300px] hover:border-border/60 hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Trade Calendar</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A month-view calendar shows your P&L heat at a glance. Identify your best and worst days in a single look.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-1 w-full max-w-[140px] mx-auto">
              {[...Array(15)].map((_, i) => {
                const profitColors = ['bg-emerald-500/20 border-emerald-500/30', 'bg-emerald-500/40 border-emerald-500/50', 'bg-rose-500/20 border-rose-500/30', 'bg-foreground/[0.02] border-border/20'];
                const colIdx = i % profitColors.length;
                return <div key={i} className={`aspect-square rounded border ${profitColors[colIdx]}`} />;
              })}
            </div>
          </div>

          {/* Card 4: Deep Analytics */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-border/30 bg-card/45 backdrop-blur-md p-8 flex flex-col justify-between min-h-[300px] hover:border-border/60 hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Deep Analytics</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Win-rate by session, drawdown clusters, streak analysis, and behavioural heatmaps — every metric purpose-built for clarity.
                </p>
              </div>

              <div className="mt-8 flex gap-6 overflow-hidden">
                <div className="flex-1 h-14 bg-foreground/[0.01] border border-border/20 rounded-xl p-2 flex items-end gap-1">
                  <div className="flex-1 h-[30%] bg-violet-500/40 rounded-sm" />
                  <div className="flex-1 h-[60%] bg-violet-500/60 rounded-sm" />
                  <div className="flex-1 h-[45%] bg-violet-500/40 rounded-sm" />
                  <div className="flex-1 h-[80%] bg-violet-500 rounded-sm" />
                </div>
                <div className="flex-1 h-14 bg-foreground/[0.01] border border-border/20 rounded-xl p-2 flex items-end gap-1">
                  <div className="flex-1 h-[70%] bg-violet-500 rounded-sm" />
                  <div className="flex-1 h-[40%] bg-violet-500/40 rounded-sm" />
                  <div className="flex-1 h-[55%] bg-violet-500/60 rounded-sm" />
                  <div className="flex-1 h-[90%] bg-violet-500 rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Private Vault */}
          <div className="md:col-span-1 relative group overflow-hidden rounded-3xl border border-border/30 bg-card/45 backdrop-blur-md p-8 flex flex-col justify-between min-h-[300px] hover:border-border/60 hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Private & Secure Data</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your trading data is yours alone. We use industry-standard encryption and isolated storage protocols to protect your history.
              </p>
            </div>

            <div className="mt-6 flex justify-center items-center h-14">
              <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center relative shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 6: Playbook Journal */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-border/30 bg-card/45 backdrop-blur-md p-8 flex flex-col justify-between min-h-[300px] hover:border-border/60 hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Trade Journal & Playbook</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Attach thoughts, emotions, and notes to each trade. Build an annotated playbook straight from your own history and easily review the setups that actually work for you.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">Focused</span>
                <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500">FOMO Avoided</span>
                <span className="px-3 py-1 rounded bg-foreground/[0.03] border border-border/20 text-[10px] font-bold text-muted-foreground">Setup: Breakout</span>
                <span className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-500">Revenge Trade</span>
                <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500">Followed Plan</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ScaleTimeline
   Scroll-driven vertical center line + cards
   branching left & right as the line passes them
───────────────────────────────────────────── */
const TIMELINE_ITEMS = [
  { label: 'Mobile Access', sub: 'Universal MT5 connectivity for traders on the move.', icon: <Phone className="w-5 h-5" />, side: 'left' },
  { label: 'Broker Agnostic', sub: 'Seamlessly connects with any MT5 broker worldwide.', icon: <HddNetwork className="w-5 h-5" />, side: 'right' },
  { label: 'Automated Sync', sub: 'Zero manual entry — your trades are recorded instantly.', icon: <Display className="w-5 h-5" />, side: 'left' },
  { label: 'Cloud Processing', sub: 'Advanced logic layer handles all complex calculations.', icon: <GearWideConnected className="w-5 h-5" />, side: 'right' },
  { label: 'Encrypted Vault', sub: 'Military-grade protection for your private trade data.', icon: <DatabaseFill className="w-5 h-5" />, side: 'left' },
  { label: 'Intelligence Suite', sub: 'Professional dashboard for deep performance insights.', icon: <WindowSidebar className="w-5 h-5" />, side: 'right' },
];

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
          gsap.set(card, {
            opacity: 0,
            scale: 0.95,
            y: 10,
            x: isLeft ? -30 : 30
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#scale-timeline-container",
            start: "top 55%",
            end: "bottom 45%",
            scrub: 2, // slower scrub for smooth experience
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
            { backgroundColor: "#a78bfa", boxShadow: "0 0 18px rgba(167, 139, 250, 0.8)", duration: 0.16 },
            { backgroundColor: "#fb7185", boxShadow: "0 0 18px rgba(251, 113, 133, 0.8)", duration: 0.16 },
            { backgroundColor: "#fbbf24", boxShadow: "0 0 18px rgba(251, 191, 36, 0.8)", duration: 0.16 },
            { backgroundColor: "#34d399", boxShadow: "0 0 18px rgba(52, 211, 153, 0.8)", duration: 0.16 },
            { backgroundColor: "#818cf8", boxShadow: "0 0 18px rgba(129, 140, 248, 0.8)", duration: 0.16 }
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
            onStart: () => card.classList.add('pastel-active'),
            onReverseComplete: () => card.classList.remove('pastel-active')
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

  const pastelAccents = ['#a78bfa', '#fb7185', '#34d399', '#818cf8', '#fbbf24', '#38bdf8'];

  return (
    <section ref={containerRef} className="relative z-10 py-20 md:py-28 px-6 overflow-hidden">
      <style>{`
        @keyframes pastelBorderGlow {
          0%   { border-color: rgba(167,139,250,0.5); box-shadow: 0 8px 24px rgba(167,139,250,0.15); }
          20%  { border-color: rgba(251,113,133,0.5); box-shadow: 0 8px 24px rgba(251,113,133,0.15); }
          40%  { border-color: rgba(251,191,36,0.5);  box-shadow: 0 8px 24px rgba(251,191,36,0.15); }
          60%  { border-color: rgba(52,211,153,0.5);  box-shadow: 0 8px 24px rgba(52,211,153,0.15); }
          80%  { border-color: rgba(129,140,248,0.5); box-shadow: 0 8px 24px rgba(129,140,248,0.15); }
          100% { border-color: rgba(167,139,250,0.5); box-shadow: 0 8px 24px rgba(167,139,250,0.15); }
        }
        .pastel-active {
          animation: pastelBorderGlow 5s linear infinite;
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
          <h2 className="text-[clamp(2rem,5.5vw,3.5rem)] font-black leading-tight tracking-tight mb-3 mt-3">Built for Scale</h2>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            An institutional-grade pipeline ensures your data is always synced, secured, and ready for analysis.
          </p>
          <div id="timeline-start-node" className="absolute left-1/2 -bottom-2 w-1 h-1 bg-transparent" />
        </Motion.div>

        <div id="scale-timeline-container" className="relative">
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg className="w-full h-full">
              <path id="scale-path" fill="none" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="2" strokeDasharray="6 6" />
              <path id="scale-path-progress" fill="none" stroke="url(#scale-glow-gradient)" strokeWidth="3" strokeLinecap="round" className="opacity-0" />
              <defs>
                <linearGradient id="scale-glow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="25%" stopColor="#fb7185" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div
            className="scale-box absolute w-4 h-4 rounded-md shadow-lg border border-white/80 flex items-center justify-center z-20 pointer-events-none opacity-0"
            style={{ left: 0, top: 0, background: 'linear-gradient(135deg, #a78bfa, #fb7185)' }}
          >
            <div className="w-1 h-1 rounded-sm bg-white shadow-[0_0_3px_#fff]" />
          </div>

          <div className="flex flex-col gap-10 md:gap-20 relative z-10 py-10 md:py-20">
            {TIMELINE_ITEMS.map((item, idx) => {
              const isLeft = item.side === 'left';
              return (
                <div key={item.label} className={`flex w-full ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <Motion.div
                    className="timeline-card w-[85%] sm:w-[70%] md:w-[45%] flex items-center gap-4 bg-card/40 backdrop-blur-sm border border-border/30 p-5 rounded-2xl shadow-sm transition-all duration-500 cursor-default group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${pastelAccents[idx]}15`,
                        color: pastelAccents[idx],
                      }}
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
