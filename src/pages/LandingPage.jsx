import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import Logo from '../components/Logo';
import { NeatGradient } from '@firecms/neat';
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
    body: 'Your trading data is yours alone. We use industry-standard encryption and isolated storage protocols to ensure your sensitive performance data remains 100% private. We never track or share your trade details.',
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
    body: 'Authorize your account via our secure portal. No plugins or Expert Advisors required just a direct, encrypted connection to your MT4 or MT5 platform.'
  },
  {
    id: '02',
    icon: <LightningChargeFill className="w-6 h-6" />,
    title: 'Real-time Trade Sync',
    body: 'Stop logging trades manually. Our automated system syncs every closed position from your broker to your trading journal the moment it happens.'
  },
  {
    id: '03',
    icon: <BarChartLineFill className="w-6 h-6" />,
    title: 'Optimize Your Strategy',
    body: 'Transform trade data into profit. Use our advanced performance analytics, behavioral heatmaps, and session tracking to identify your edge and master your trading psychology.'
  },
];

const STATS = [
  { value: 'Precision', label: 'Built specifically for traders' },
  { value: '1s', label: 'MT5 sync latency' },
  { value: '100%', label: 'Your data, your control' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();
  const canvasRef = useRef(null);
  const gradientRef = useRef(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Always land on hero section on mount/refresh
  // Disable browser scroll restoration first so it doesn't override our scroll
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    if (location.hash === '#features') {
      const timer = setTimeout(() => {
        const el = document.getElementById('features');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useEffect(() => {
    injectJsonLd('ld-org', buildOrganizationSchema());
    injectJsonLd('ld-website', buildWebSiteSchema());
    injectJsonLd('ld-software', buildSoftwareSchema());
    injectJsonLd('ld-faq', buildFAQSchema(LANDING_FAQ));
    return () => {
      ['ld-org', 'ld-website', 'ld-software', 'ld-faq'].forEach(removeJsonLd);
    };
  }, []);

  function createGradient(lightMode) {
    const lightColors = [
      { color: '#ffffff', enabled: true },
      { color: '#2C00FF', enabled: true },
      { color: '#A623F3', enabled: true },
      { color: '#f6f7fb', enabled: true },
      { color: '#ffffff', enabled: true },
    ];

    const darkColors = [
      { color: '#000000', enabled: true },
      { color: '#2C00FF', enabled: true },
      { color: '#A954FF', enabled: true },
      { color: '#04001F', enabled: true },
      { color: '#000000', enabled: true },
    ];

    return new NeatGradient({
      ref: canvasRef.current,
      colors: lightMode ? lightColors : darkColors,
      speed: 10,
      horizontalPressure: 6,
      verticalPressure: 5,
      waveFrequencyX: 4,
      waveFrequencyY: 10,
      waveAmplitude: 1,
      shadows: 2,
      highlights: 2,
      colorBrightness: lightMode ? 1.2 : 1,
      colorSaturation: lightMode ? 0.2 : -1,
      wireframe: false,
      colorBlending: 8,
      backgroundColor: lightMode ? '#f8fafc' : '#010101',
      backgroundAlpha: 1,
      grainScale: 2,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 1,
      resolution: 0.75,
      flowEnabled: false,
      enableProceduralTexture: false,
      domainWarpEnabled: false,
      vignetteIntensity: 0,
      vignetteRadius: 0.8,
      fresnelEnabled: false,
      iridescenceEnabled: false,
      bloomIntensity: 0,
      chromaticAberration: 0,
    });
  }

  useEffect(() => {
    if (!canvasRef.current) return;

    if (gradientRef.current) {
      gradientRef.current.destroy();
      gradientRef.current = null;
    }
    gradientRef.current = createGradient(isLightMode);

    const handleScroll = () => {
      if (gradientRef.current) {
        gradientRef.current.yOffset = window.scrollY * 0.3;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (gradientRef.current) {
        gradientRef.current.destroy();
        gradientRef.current = null;
      }
    };
  }, [isLightMode]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.25
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        mass: 1.1
      }
    },
  };

  const navLinks = [
    { to: '/#features', label: 'How it works' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased">
      {/* NeatGradient animated hero background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', opacity: isLightMode ? 0.28 : 0.55 }}
        />
      </div>

      <header>
        <nav
          className="fixed top-0 left-0 right-0 z-[100] h-16 md:h-20 flex items-center justify-between px-6 md:px-12 bg-background/30 backdrop-blur-md border-b border-border/10 transition-all duration-300"
        >
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              navigate('/', { replace: true });
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]"
          >
            <Logo iconSize="w-7 h-7" />
          </button>

          <ul className="hidden md:flex items-center gap-2 ml-auto mr-10">
            {navLinks.map(({ to, label }) => (
              <Motion.li
                key={to}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <NavLink
                  to={to}
                  onClick={(e) => {
                    if (to.startsWith('/#')) {
                      const hash = to.split('#')[1];
                      if (window.location.pathname === '/') {
                        e.preventDefault();
                        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-border/40 hover:bg-muted transition-colors text-foreground/70 hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isLightMode ? <MoonStarsFill className="w-4 h-4" /> : <SunFill className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="hidden md:block button-animated button-animated-sm px-6 active:scale-95 transition-all duration-300"
            >
              <span className="button-bg">
                <span className="button-bg-layers">
                  <span className="button-bg-layer button-bg-layer-1" />
                  <span className="button-bg-layer button-bg-layer-2" />
                  <span className="button-bg-layer button-bg-layer-3" />
                </span>
              </span>
              <span className="button-inner">
                <span className="button-inner-static">Get started</span>
                <span className="button-inner-hover">Get started</span>
              </span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
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
              className="md:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* Close Button on Top Right */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-foreground/80 hover:text-foreground transition-colors z-[102]"
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col items-center justify-center gap-8" onClick={(e) => e.stopPropagation()}>
                {navLinks.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (to.startsWith('/#')) {
                        const hash = to.split('#')[1];
                        if (window.location.pathname === '/') {
                          e.preventDefault();
                          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className="text-3xl font-bold tracking-tight hover:text-primary transition-colors"
                  >
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={() => navigate('/login')}
                  className="button-animated w-full max-w-[280px] px-8 mt-4 shadow-xl active:scale-95 transition-all duration-300"
                >
                  <span className="button-bg">
                    <span className="button-bg-layers">
                      <span className="button-bg-layer button-bg-layer-1" />
                      <span className="button-bg-layer button-bg-layer-2" />
                      <span className="button-bg-layer button-bg-layer-3" />
                    </span>
                  </span>
                  <span className="button-inner">
                    <span className="button-inner-static">Get started</span>
                    <span className="button-inner-hover">Get started</span>
                  </span>
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section
          className="relative z-10 min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center overflow-hidden"
        >

          <Motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
            <Motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-black uppercase mb-10 shadow-[0_0_25px_rgba(139,92,246,0.4)] backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              MT5 Auto-Sync · Exclusively for XAUUSD Traders
            </Motion.div>

            <Motion.div variants={itemVariants}>
              <h1 className="!text-[clamp(2.5rem,9vw,7.5rem)] font-black leading-[0.95] tracking-tighter mb-10 text-foreground">
                Every trade <br />
                you make <br />
                <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-to to-purple-400 italic">tells a story.</span>
              </h1>
            </Motion.div>

            <Motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-14 font-medium">
              XAU Journal is the precision trading journal built for gold traders track, analyse, and master your edge in XAUUSD.
            </Motion.p>

            <Motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={() => navigate('/login')}
                className="btn-subscribe-slide"
              >
                <p data-text="Try 7-Day Free Trial">Try 7-Day Free Trial</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mt-1">
                7-day free trial · Cancel anytime · No card required
              </span>
            </Motion.div>

            <Motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-20 mt-24 md:mt-32 w-full max-w-4xl px-4">
              {STATS.map((s) => (
                <div key={s.label} className="text-center group">
                  <div className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">{s.value}</div>
                  <div className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </Motion.div>
          </Motion.div>
        </section>

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
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
                Designed by traders, for traders. We've stripped away the noise to focus on the metrics that actually improve your edge.
              </p>
            </Motion.div>

            {/* Desktop: draggable + auto-scrolling infinite marquee */}
            <DraggableMarquee className="hidden sm:block">
              {[...FEATURES, ...FEATURES].map((f, i) => (
                <div key={`${f.title}-${i}`} className="w-[300px] lg:w-[340px] shrink-0 px-3">
                  <FeatureCard {...f} index={i % FEATURES.length} />
                </div>
              ))}
            </DraggableMarquee>

            {/* Mobile: clean full-width accordion */}
            <div className="sm:hidden mt-8 flex flex-col gap-3">
              {FEATURES.map((f, i) => (
                <MobileFeatureAccordion key={f.title} {...f} index={i} />
              ))}
            </div>
          </div>
        </section>

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
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.2 }}
                  className="relative p-10 rounded-[3rem] bg-card border border-border/40 shadow-2xl group hover:border-primary/40 transition-all duration-500"
                >
                  <div className="absolute -top-10 left-10 w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                    {step.icon}
                  </div>

                  <div className="absolute top-10 right-10 text-8xl font-black text-foreground/[0.03] select-none group-hover:text-primary/[0.05] transition-colors duration-700">
                    {step.id}
                  </div>

                  <div className="mt-12">
                    <h3 className="text-2xl font-bold mb-5 tracking-tight group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium text-base">
                      {step.body}
                    </p>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

        <ScaleTimeline />



        <section id="faq" className="relative z-10 py-32 md:py-40 px-6">
          <div className="max-w-3xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
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
                      <Motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="text-primary text-xl flex-shrink-0"
                      >
                        +
                      </Motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <Motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
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

        <section className="relative z-10 py-40 md:py-64 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

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
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 font-medium max-w-2xl mx-auto leading-relaxed">
              Join thousands of traders who have standardized their journaling with xaujournal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => navigate('/login')}
                className="button-animated w-half sm:w-auto px-10 shadow-2xl active:scale-95 transition-all duration-300"
              >
                <span className="button-bg">
                  <span className="button-bg-layers">
                    <span className="button-bg-layer button-bg-layer-1" />
                    <span className="button-bg-layer button-bg-layer-2" />
                    <span className="button-bg-layer button-bg-layer-3" />
                  </span>
                </span>
                <span className="button-inner">
                  <span className="button-inner-static">Create free account</span>
                  <span className="button-inner-hover">Create free account</span>
                </span>
              </button>
              <Link
                to="/pricing"
                className="btn-cta-underline"
              >
                <span className="hover-underline-animation">View pricing</span>
                <svg id="arrow-horizontal" xmlns="http://www.w3.org/2000/svg" width={30} height={10} viewBox="0 0 46 16">
                  <path id="Path_10" data-name="Path 10" d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z" transform="translate(30)" />
                </svg>
              </Link>
            </div>
          </Motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Link to="/" className="mb-6 inline-block">
                <div className="footer-logo-btn">
                  <div className="box">X</div>
                  <div className="box">A</div>
                  <div className="box">U</div>
                  <div className="box extra"></div>
                  <div className="box extra"></div>
                  <div className="box extra"></div>
                  <div className="box extra"></div>
                </div>
              </Link>
            </div>

            <div className="text-center md:text-center flex flex-col items-center md:items-center">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-8">Platform</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground text-center">
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/login?mode=signin" className="hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-center flex flex-col items-center md:items-center">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-8">Legal</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground text-center">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-end text-center md:text-right justify-end">
              <div className="mt-auto flex flex-col items-center md:items-end gap-5">
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
                <div className="flex flex-col items-center md:items-end gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-1.5 justify-center md:justify-end">
                    made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center md:text-right">
                    All Rights Reserved <br></br>
                    Copyright © 2026 xaujournal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-[90] p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-white/40 text-primary shadow-xl transition-all duration-300 hover:-translate-y-2 active:scale-90 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
      </button>
    </div>
  );
}

// Desktop marquee card — hover to reveal description
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
      <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-5 transition-all duration-300 group-hover:bg-primary/25">
        {icon}
      </div>
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

// Mobile accordion card — always visible, tap to expand
function MobileFeatureAccordion({ icon, title, body, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
        ? 'bg-primary/10 border-primary/30 shadow-[0_4px_24px_-8px_rgba(139,92,246,0.4)]'
        : 'bg-white/5 border-white/10'
        }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-4 p-4 text-left"
        aria-expanded={isOpen}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary'
          }`}>
          {icon}
        </div>
        <span className="flex-1 text-base font-bold text-foreground leading-tight">{title}</span>
        <Motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-primary text-xl font-light shrink-0"
        >
          +
        </Motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <Motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 pl-[3.5rem] text-sm text-muted-foreground leading-relaxed">
              {body}
            </p>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

/**
 * DraggableMarquee
 * ─ Auto-scrolls left at a steady pace.
 * ─ User can grab and drag in either direction at any time.
 * ─ Loops infinitely by snapping to the halfway point.
 * ─ Pointer Events API works for both mouse and touch.
 */
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

      // Advance position when not dragging
      if (!dragRef.current.active) {
        posRef.current -= speed;
      }

      // Seamless loop: reset at the midpoint (half of total duplicated content)
      const half = track.scrollWidth / 2;
      if (posRef.current <= -half) posRef.current += half;
      if (posRef.current > 0) posRef.current -= half;

      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]);

  const onPointerDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, startPos: posRef.current };
    outerRef.current?.setPointerCapture(e.pointerId);
    setGrabbing(true);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    posRef.current = dragRef.current.startPos + (e.clientX - dragRef.current.startX);
  };

  const onPointerUp = () => {
    dragRef.current.active = false;
    setGrabbing(false);
  };

  return (
    <div
      ref={outerRef}
      className={`w-full overflow-hidden relative py-10 ${className}`}
      style={{
        cursor: grabbing ? 'grabbing' : 'grab',
        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        userSelect: 'none',
      }}
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
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border/30" />

          {/* Animated line that draws downward on scroll */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px overflow-hidden">
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
                <div key={item.label} className="relative flex items-center md:grid md:grid-cols-2 md:gap-8">

                  {/* Left slot */}
                  <div className={`hidden md:flex md:justify-end ${isLeft ? '' : 'md:invisible'}`}>
                    {isLeft && (
                      <Motion.div
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, margin: '-30px' }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full md:max-w-[320px] flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-5 rounded-2xl hover:bg-card/70 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-500 group cursor-default"
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">{item.story}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">{item.sub}</p>
                        </div>
                      </Motion.div>
                    )}
                  </div>

                  {/* Center dot on the line */}
                  <Motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: false, margin: '-30px' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(139,92,246,0.8)] z-10"
                  />

                  {/* Right slot */}
                  <div className={`hidden md:flex md:justify-start ${!isLeft ? '' : 'md:invisible'}`}>
                    {!isLeft && (
                      <Motion.div
                        initial={{ opacity: 0, x: 80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, margin: '-30px' }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full md:max-w-[320px] flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-5 rounded-2xl hover:bg-card/70 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-500 group cursor-default"
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">{item.story}</span>
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
                    viewport={{ once: false, margin: '-40px' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="md:hidden w-full flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-5 rounded-2xl hover:bg-card/70 hover:border-primary/40 transition-all duration-500 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">{item.story}</span>
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
