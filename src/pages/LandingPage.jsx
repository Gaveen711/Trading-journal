import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Lenis from 'lenis';
import Logo from '../components/Logo';
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
    body: 'Authorize your account via our secure portal. No plugins or Expert Advisors required — just a direct, encrypted connection to your MT5 platform.'
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
    sub: "Every missed trade. Every blown stop. Every emotional entry. Without a journal, you repeat the same mistakes — and the market keeps the tuition.",
    accent: 'from-red-500/20 to-orange-500/10',
    glow: 'rgba(239,68,68,0.28)',
  },
  {
    chapter: '02',
    label: 'The Pattern',
    headline: 'Your edge already exists.',
    sub: "It's buried in your trade history — in the sessions where you win, the setups that perform, the hours when your focus is sharp. You just can't see it yet.",
    accent: 'from-amber-500/20 to-yellow-500/10',
    glow: 'rgba(245,158,11,0.28)',
  },
  {
    chapter: '03',
    label: 'The Insight',
    headline: 'Data reveals what instinct misses.',
    sub: 'Drawdown curves. Session heatmaps. Streak analysis. When your trades become data, patterns emerge that transform how you approach every position.',
    accent: 'from-primary/20 to-violet-500/10',
    glow: 'rgba(139,92,246,0.28)',
  },
  {
    chapter: '04',
    label: 'The Solution',
    headline: 'Meet XAU Journal.',
    sub: 'The only trading journal built exclusively for XAUUSD. Auto-sync every trade from MT5. Analyze your edge. Journal your psychology. All in one precision tool.',
    accent: 'from-emerald-500/20 to-teal-500/10',
    glow: 'rgba(16,185,129,0.28)',
  },
];

/* ─── Floating particles ─── */
function Particles({ count = 18, isLightMode }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
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
        size: pseudoRandom(i + 3) * 3 + 1,
        duration: pseudoRandom(i + 4) * 12 + 8,
        delay: pseudoRandom(i + 5) * 6,
        opacity: pseudoRandom(i + 6) * 0.4 + 0.1,
      };
    })
  );

  const activeCount = isMobile ? 6 : count;

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
              ? `rgba(139,92,246,${p.opacity * 0.6})`
              : `rgba(139,92,246,${p.opacity})`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(p.id) * 20, 0],
            opacity: [p.opacity, p.opacity * 0.3, p.opacity],
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
    setPos({ x: (e.clientX - cx) * 0.25, y: (e.clientY - cy) * 0.25 });
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
function StoryChapter({ chapter, label, headline, sub, accent, glow, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-20% 0px -20% 0px' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-[40vh] flex flex-col justify-center py-10 md:py-12"
    >
      {/* Ambient glow behind the card */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen transform pointer-events-none">
        <Motion.div
          initial={{
            opacity: 0,
            x: index % 2 === 0 ? '-25%' : '25%',
            scale: 0.95
          }}
          animate={{
            opacity: inView ? 1 : 0,
            x: inView ? '0%' : (index % 2 === 0 ? '-25%' : '25%'),
            scale: inView ? 1 : 0.95
          }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
          style={{
            background: `radial-gradient(ellipse 70% 60% at ${index % 2 === 0 ? '0%' : '100%'} 50%, ${glow}, transparent)`,
          }}
        />
      </div>

      <div className={`relative flex flex-col ${index % 2 === 0 ? 'items-start text-left' : 'items-start text-left md:items-end md:text-right'} max-w-2xl ${index % 2 === 0 ? 'ml-0' : 'ml-0 md:ml-auto'}`}>
        <Motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : (index % 2 === 0 ? -60 : 60), y: isMobile ? 20 : 0 }}
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : (isMobile ? 0 : (index % 2 === 0 ? -60 : 60)), y: inView ? 0 : (isMobile ? 20 : 0) }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
            Chapter {chapter}
          </div>
          <div className="h-px w-12 bg-primary/30" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {label}
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 40 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-black leading-[1.05] tracking-tight mb-6 text-foreground">
            {headline}
          </h2>
        </Motion.div>

        <Motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-xl text-muted-foreground leading-relaxed font-medium"
        >
          {sub}
        </Motion.p>

        {/* Decorative line */}
        <Motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: index % 2 === 0 ? 'left' : 'right' }}
          className={`mt-8 h-px w-24 bg-gradient-to-r ${accent}`}
        />
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
        background: 'linear-gradient(to right, var(--color-primary, #8b5cf6), #c084fc)',
      }}
    />
  );
}

/* ─── Main landing ─── */
export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const lenisRef = useRef(null);

  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.92]);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    return () => { if ('scrollRestoration' in history) history.scrollRestoration = 'auto'; };
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15, mass: 1.1 } },
  };

  const navLinks = [
    { to: '/#features', label: 'How it works' },
    { to: '/the-story', label: 'The Story' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased">
      <ScrollProgress />
      <Particles isLightMode={isLightMode} />

      {/* Ambient background glow matching the theme */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          background: isLightMode
            ? 'radial-gradient(circle at top, rgba(139, 92, 246, 0.04) 0%, transparent 60%)'
            : 'radial-gradient(circle at top, rgba(139, 92, 246, 0.1) 0%, transparent 60%)'
        }}
        aria-hidden="true"
      />

      {/* ─── NAV ─── */}
      <header>
        <nav
          style={{ transform: 'translateX(-50%)' }}
          className="fixed top-4 left-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] h-16 md:h-18 flex items-center justify-between px-6 md:px-10 bg-card/85 backdrop-blur-xl border border-border/30 rounded-2xl md:rounded-full shadow-2xl transition-all duration-300"
        >
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/', { replace: true }); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]"
          >
            <Logo iconSize="w-7 h-7" />
          </button>

          <ul className="hidden lg:flex items-center gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2">
            {navLinks.map(({ to, label }) => (
              <Motion.li key={to} whileHover={{ scale: 1.05, y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink
                  to={to}
                  onClick={(e) => {
                    if (to.startsWith('/#')) {
                      const hash = to.split('#')[1];
                      if (window.location.pathname === '/') {
                        e.preventDefault();
                        lenisRef.current?.scrollTo('#' + hash, { duration: 1.2 });
                      }
                    }
                  }}
                  className="text-sm font-semibold px-4 py-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all"
                >
                  {label}
                </NavLink>
              </Motion.li>
            ))}
          </ul>

          <div className="flex items-center gap-3 z-[101]">
            <button onClick={toggleTheme} className="p-2 rounded-full border border-border/40 hover:bg-muted transition-colors text-foreground/70 hover:text-foreground" aria-label="Toggle theme">
              {isLightMode ? <MoonStarsFill className="w-4 h-4" /> : <SunFill className="w-4 h-4" />}
            </button>
            <div className="hidden lg:block">
              <button onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300">
                <span>Get Started</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
              </button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-foreground" aria-label="Toggle menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-foreground/80 hover:text-foreground transition-colors z-[102]" aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <div className="flex flex-col items-center justify-center gap-8" onClick={(e) => e.stopPropagation()}>
                {navLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} onClick={(e) => { setMobileMenuOpen(false); if (to.startsWith('/#')) { const hash = to.split('#')[1]; if (window.location.pathname === '/') { e.preventDefault(); lenisRef.current?.scrollTo('#' + hash, { duration: 1.2 }); } } }} className="text-3xl font-bold tracking-tight hover:text-primary transition-colors">
                    {label}
                  </NavLink>
                ))}
                <button onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300 w-full max-w-[280px]">
                  <span>Get started</span>
                  <svg width="15px" height="10px" viewBox="0 0 13 10"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ─── HERO ─── */}
        <section ref={heroRef} className="relative z-10 min-h-[100vh] flex flex-col items-center justify-center px-6 pt-32 pb-36 md:pb-48 text-center overflow-hidden">
          <Motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="max-w-5xl mx-auto flex flex-col items-center relative z-10 will-change-transform">

            <Motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center">
              <Motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-black uppercase mb-10 shadow-[0_0_25px_rgba(139,92,246,0.4)] backdrop-blur-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                Exclusively for Gold Traders
              </Motion.div>

              <Motion.div variants={itemVariants}>
                <h1 className="!text-[clamp(2.5rem,8.5vw,6.25rem)] font-black leading-[0.95] tracking-tighter mb-10 text-foreground">
                  Every trade <br />you make <br />
                  <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-to to-purple-400 italic">tells a story.</span>
                </h1>
              </Motion.div>

              <Motion.p variants={itemVariants} className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-14 font-medium">
                XAU Journal is the precision trading journal built for gold traders — track, analyse, and master your edge in XAUUSD.
              </Motion.p>

              <Motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3.5 w-full sm:w-auto">
                <MagneticButton onClick={() => navigate('/login')} className="btn-menu-underline">
                  Try 7-Day Free Trial
                </MagneticButton>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mt-1">
                  7-day free trial · Cancel anytime · No card required
                </span>
              </Motion.div>

              <Motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-20 mt-16 md:mt-24 w-full max-w-4xl px-4">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center group">
                    <div className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
                      <Counter target={s.value} />
                    </div>
                    <div className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </Motion.div>
            </Motion.div>
          </Motion.div>

        </section>

        {/* ─── STORY NARRATIVE ─── */}
        <section id="story" className="relative z-10 px-6 overflow-hidden">
          {/* Vertical story line */}
          <StoryLine />

          <div className="max-w-5xl mx-auto">
            {/* Chapter intro label */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 pt-8"
            >
              <span className="text-primary/50 text-[10px] font-black tracking-[0.4em] uppercase">Your Trading Story</span>
            </Motion.div>

            {STORY_CHAPTERS.map((ch, i) => (
              <StoryChapter key={ch.chapter} {...ch} index={i} />
            ))}
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="relative z-10 py-32 md:py-48 px-6">
          <div className="max-w-7xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mb-24 md:mb-32"
            >
              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 inline-block px-3 py-1 rounded-full bg-primary/10">The Platform</span>
              <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight mb-8">
                Every tool you need.<br />Nothing you don't.
              </h2>
              <p className="text-sm md:text-xl text-muted-foreground font-medium leading-relaxed">
                Designed by traders, for traders. We've stripped away the noise to focus on the metrics that actually improve your edge.
              </p>
            </Motion.div>

            <DraggableMarquee className="hidden sm:block">
              {[...FEATURES, ...FEATURES].map((f, i) => (
                <div key={`${f.title}-${i}`} className="w-[300px] lg:w-[340px] shrink-0 px-3">
                  <FeatureCard {...f} index={i % FEATURES.length} />
                </div>
              ))}
            </DraggableMarquee>

            <div className="sm:hidden mt-8 flex flex-col gap-3">
              {FEATURES.map((f, i) => (
                <MobileFeatureAccordion key={f.title} {...f} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── STEPS ─── */}
        <section className="relative z-10 py-32 md:py-48 px-6 bg-muted/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24 md:mb-32"
            >
              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 inline-block px-3 py-1 rounded-full bg-primary/10">Workflow</span>
              <h2 className="text-[clamp(2rem,6vw,4rem)] font-black leading-tight tracking-tight">Three steps to mastery</h2>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 relative">
              <div className="hidden md:block absolute top-20 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/5 via-primary/40 to-primary/5" />
              {STEPS.map((step, i) => (
                <Motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 60, rotateX: 15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{ perspective: 1000 }}
                  className="cyber-step-card group"
                >
                  <div className="cyber-step-card-bg" />
                  <div className="absolute -top-10 left-10 w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 z-20">
                    {step.icon}
                  </div>
                  <div className="absolute top-10 right-10 text-8xl font-black step-number select-none z-10">{step.id}</div>
                  <div className="mt-12 relative z-10">
                    <h3 className="text-2xl font-bold mb-5 tracking-tight">{step.title}</h3>
                    <p className="text-base leading-relaxed font-medium">{step.body}</p>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        <ScaleTimeline />

        {/* ─── FAQ ─── */}
        <section id="faq" className="relative z-10 py-32 md:py-40 px-6">
          <div className="max-w-3xl mx-auto">
            <Motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4 inline-block">XAU journal FAQ</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Gold trading journal questions</h2>
              <p className="text-muted-foreground font-medium">Answers for traders searching for an XAUUSD journal, MT5 sync, and XAU journal templates.</p>
            </Motion.div>
            <div className="space-y-1">
              {LANDING_FAQ.map((item, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <Motion.div
                    key={item.q}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    layout
                    className="overflow-hidden rounded-2xl border-0 bg-transparent"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full flex justify-between items-center gap-4 py-5 px-1 text-left font-bold text-sm md:text-base border-0 bg-transparent outline-none group focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
                      aria-expanded={isOpen}
                    >
                      <span className="group-hover:text-primary transition-colors">{item.q}</span>
                      <Motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="text-primary text-xl flex-shrink-0">
                        +
                      </Motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <Motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                          <p className="pb-5 px-1 text-sm text-muted-foreground leading-relaxed font-medium">{item.a}</p>
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
        <section className="relative z-10 py-40 md:py-64 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

          {/* Cinematic ambient light rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            {[1, 2, 3].map((ring) => (
              <Motion.div
                key={ring}
                className="absolute rounded-full border border-primary/10"
                style={{ width: `${ring * 200}px`, height: `${ring * 200}px` }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 4 + ring, repeat: Infinity, ease: 'easeInOut', delay: ring * 0.5 }}
              />
            ))}
          </div>

          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-10 inline-block px-4 py-2 rounded-full bg-primary/10">Start for free</span>
            <h2 className="!text-[clamp(4rem,5.5vw,9rem)] font-black leading-[0.95] tracking-tighter mb-10 text-foreground">
              Stop guessing.<br />
              <span className="text-gradient">Start knowing.</span>
            </h2>
            <p className="text-base md:text-2xl text-muted-foreground mb-16 font-medium max-w-2xl mx-auto leading-relaxed">
              Join thousands of traders who have standardized their journaling with xaujournal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <MagneticButton onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300">
                <span>Create free account</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
              </MagneticButton>
            </div>
          </Motion.div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-1.5 justify-center md:justify-end">
                  made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center md:text-right">© Copyright 2026 Xau Journal.<br />All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <Motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : 40 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-8 right-8 z-[90] p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-white/40 text-primary shadow-xl hover:-translate-y-2 active:scale-90 transition-transform ${!isScrolled ? 'pointer-events-none' : ''}`}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
      </Motion.button>
    </div>
  );
}

/* ─── Animated vertical story line ─── */
function StoryLine() {
  return null;
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, body, index }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="p-8 rounded-[2.5rem] flex flex-col cursor-default select-none transition-all duration-500 ease-out group border border-transparent hover:bg-white/5 hover:border-white/15 hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.5)]"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-5 transition-all duration-300 group-hover:bg-primary/25">{icon}</div>
      <h3 className="text-lg font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors duration-300">{title}</h3>
      <Motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="text-muted-foreground leading-relaxed text-sm mt-3">{body}</p>
      </Motion.div>
    </Motion.div>
  );
}

/* ─── Mobile feature accordion ─── */
function MobileFeatureAccordion({ icon, title, body, index }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-primary/10 border-primary/30 shadow-[0_4px_24px_-8px_rgba(139,92,246,0.4)]' : 'bg-white/5 border-white/10'}`}
    >
      <button type="button" onClick={() => setIsOpen(o => !o)} className="w-full flex items-center gap-4 p-4 text-left" aria-expanded={isOpen}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary'}`}>{icon}</div>
        <span className="flex-1 text-base font-bold text-foreground leading-tight">{title}</span>
        <Motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }} className="text-primary text-xl font-light shrink-0">+</Motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <Motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <p className="px-4 pb-4 pl-[3.5rem] text-sm text-muted-foreground leading-relaxed">{body}</p>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

/* ─── Draggable marquee ─── */
function DraggableMarquee({ children, className = '', speed = 0.6 }) {
  const outerRef = useRef(null);
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const rafRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startPos: 0 });
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    function tick() {
      const track = trackRef.current;
      if (!track) { rafRef.current = requestAnimationFrame(tick); return; }
      if (!dragRef.current.active) posRef.current -= speed;
      const half = track.scrollWidth / 2;
      if (posRef.current <= -half) posRef.current += half;
      if (posRef.current > 0) posRef.current -= half;
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]);

  const onPointerDown = (e) => { dragRef.current = { active: true, startX: e.clientX, startPos: posRef.current }; outerRef.current?.setPointerCapture(e.pointerId); setGrabbing(true); };
  const onPointerMove = (e) => { if (!dragRef.current.active) return; posRef.current = dragRef.current.startPos + (e.clientX - dragRef.current.startX); };
  const onPointerUp = () => { dragRef.current.active = false; setGrabbing(false); };

  return (
    <div
      ref={outerRef}
      className={`w-full overflow-hidden relative py-10 ${className}`}
      style={{ cursor: grabbing ? 'grabbing' : 'grab', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', userSelect: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={trackRef}
        className="flex items-stretch will-change-transform"
        style={{ touchAction: 'none' }}
      >
        {children}
      </div>
    </div>
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
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 20%'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={sectionRef} className="relative z-10 py-20 md:py-28 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">

        {/* Heading */}
        <Motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-5">
            <Stars className="w-3 h-3" /> Architecture
          </div>
          <h2 className="text-[clamp(2rem,6vw,4rem)] font-black leading-tight tracking-tight mb-4">Built for Scale</h2>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
            An institutional-grade pipeline ensures your data is always synced, secured, and ready for analysis.
          </p>
        </Motion.div>

        {/* Timeline */}
        <div className="relative">

          {/* Center vertical line track (background) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-border/30" />

          {/* Animated line that draws downward on scroll */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] overflow-hidden">
            <Motion.div
              className="w-full bg-gradient-to-b from-primary via-primary/70 to-primary/20 origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-8 md:gap-10">
            {TIMELINE_ITEMS.map((item) => {
              const isLeft = item.side === 'left';
              return (
                <div key={item.label} className="relative flex items-center md:grid md:grid-cols-[1fr_40px_1fr] md:gap-4">

                  {/* Left slot */}
                  <div className={`hidden md:flex md:justify-end ${isLeft ? '' : 'md:invisible'}`}>
                    {isLeft && (
                      <Motion.div
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full md:max-w-[320px] flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-5 rounded-2xl hover:bg-card/70 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-500 group cursor-default"
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">{item.sub}</p>
                        </div>
                      </Motion.div>
                    )}
                  </div>

                  {/* Center dot on the line */}
                  <div className="hidden md:flex justify-center items-center relative z-10 w-[40px]">
                    <Motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: [0, 1.2, 1], opacity: 1 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_15px_rgba(139,92,246,0.9)] border-2 border-background"
                    />
                  </div>

                  {/* Right slot */}
                  <div className={`hidden md:flex md:justify-start ${!isLeft ? '' : 'md:invisible'}`}>
                    {!isLeft && (
                      <Motion.div
                        initial={{ opacity: 0, x: 80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full md:max-w-[320px] flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-5 rounded-2xl hover:bg-card/70 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-500 group cursor-default"
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">{item.sub}</p>
                        </div>
                      </Motion.div>
                    )}
                  </div>

                  {/* Mobile: full-width stacked layout with left/right scroll animation */}
                  <Motion.div
                    initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="md:hidden w-full flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-5 rounded-2xl hover:bg-card/70 hover:border-primary/40 transition-all duration-500 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                      </div>
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
