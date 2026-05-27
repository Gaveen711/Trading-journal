import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
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
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    title: 'Trade Journal',
    body: 'Attach thoughts, emotions, and notes to each trade. Build an annotated playbook straight from your own history.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    title: 'Private & Secure Data',
    body: 'Your trading data is yours alone. We use industry-standard encryption and isolated storage protocols to ensure your sensitive performance data remains 100% private. We never track or share your trade details.',
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();
  const canvasRef = useRef(null);
  const gradientRef = useRef(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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
    { to: '/', label: 'Home' },
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
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]">
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
              className="hidden sm:block px-6 py-2 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              Get started
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
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl font-bold tracking-tight hover:text-primary transition-colors"
                  >
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 px-10 py-4 rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  Get started
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
              MT5 Auto-Sync · XAUUSD Specialist
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

            <Motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3 sm:py-5 sm:px-10 rounded-full bg-foreground text-background font-bold text-xs sm:text-base shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Start journaling free
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-6 py-3 sm:py-5 sm:px-10 rounded-full border border-border/60 hover:bg-muted/50 font-semibold text-xs sm:text-base transition-all duration-300 flex items-center justify-center gap-2"
              >
                See how it works
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9l-7 7-7-7" /></svg>
              </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} {...f} index={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 py-32 md:py-48 px-6 bg-muted/5 border-y border-border/40 overflow-hidden">
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

        <section className="relative z-10 py-32 md:py-48 px-6">
          <div className="max-w-5xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24 md:mb-32"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                <Stars className="w-3 h-3" /> Architecture
              </div>
              <h2 className="text-[clamp(2rem,6vw,4rem)] font-black leading-tight tracking-tight mb-8">Built for Scale</h2>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                An institutional-grade pipeline ensures your data is always synced, secured, and ready for analysis.
              </p>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {[
                { label: 'Mobile Access', sub: 'Universal MT5 connectivity for traders on the move.', icon: <Phone className="w-5 h-5" /> },
                { label: 'Broker Agnostic', sub: 'Seamlessly connects with any MT5 broker worldwide.', icon: <HddNetwork className="w-5 h-5" /> },
                { label: 'Automated Sync', sub: 'Zero manual entry — your trades are recorded instantly.', icon: <Display className="w-5 h-5" /> },
                { label: 'Cloud Processing', sub: 'Advanced logic layer handles all complex calculations.', icon: <GearWideConnected className="w-5 h-5" /> },
                { label: 'Encrypted Vault', sub: 'Military-grade protection for your private trade data.', icon: <DatabaseFill className="w-5 h-5" /> },
                { label: 'Intelligence Suite', sub: 'Professional dashboard for deep performance insights.', icon: <WindowSidebar className="w-5 h-5" /> },
              ].map((step, i) => (
                <Motion.div
                  key={step.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex items-center gap-6 bg-card/30 backdrop-blur-md border border-border/40 p-8 rounded-[2.5rem] hover:bg-card/60 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-500 group cursor-default"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{step.label}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-tight">{step.sub}</p>
                  </div>
                </Motion.div>
              ))}
            </div>
          </div>
        </section>

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
                className="w-full sm:w-auto px-8 py-3.5 sm:py-6 sm:px-12 rounded-full bg-foreground text-background font-bold text-sm sm:text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Create free account
              </button>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-6 sm:px-12 rounded-full border border-border/60 hover:bg-muted/50 font-semibold text-sm sm:text-lg transition-all duration-300"
              >
                View pricing
              </Link>
            </div>
          </Motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-10">
            <div className="lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
              <Logo iconSize="w-8 h-8" className="mb-6" />
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">
                The XAU journal for professional gold (XAUUSD) traders MT5 sync, analytics, and secure trade history.
              </p>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-8">Platform</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground">
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground mb-8">Legal</h4>
              <ul className="space-y-4 text-sm font-semibold text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-end text-center md:text-right justify-end">
              <div className="mt-auto flex flex-col items-center md:items-end gap-5">
                <div className="flex gap-6">
                  <Motion.a
                    href="#"
                    whileHover={{ y: -5, scale: 1.2, color: 'hsl(var(--primary))' }}
                    className="text-muted-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook size={22} />
                  </Motion.a>
                  <Motion.a
                    href="#"
                    whileHover={{ y: -5, scale: 1.2, color: 'hsl(var(--primary))' }}
                    className="text-muted-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={22} />
                  </Motion.a>
                  <Motion.a
                    href="https://x.com/xau_journal"
                    whileHover={{ y: -5, scale: 1.2, color: 'hsl(var(--primary))' }}
                    className="text-muted-foreground transition-colors"
                    aria-label="X"
                  >
                    <TwitterX size={22} />
                  </Motion.a>
                  <Motion.a
                    href="https://discord.gg/smbNwBZC2"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5, scale: 1.2, color: 'hsl(var(--primary))' }}
                    className="text-muted-foreground transition-colors"
                    aria-label="Discord"
                  >
                    <Discord size={22} />
                  </Motion.a>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-1.5 justify-center md:justify-end">
                  made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </p>
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

function FeatureCard({ icon, title, body, index }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.02 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: index * 0.05
      }}
      className="p-10 rounded-[3rem] bg-card/60 backdrop-blur-md border border-white/20 hover:border-white/60 hover:bg-primary transition-all duration-300 ease-out group shadow-sm hover:shadow-[0_20px_50px_-15px_rgba(139,92,246,0.5)] h-full flex flex-col cursor-default"
    >
      <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-white group-hover:text-primary transition-all duration-300 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-white transition-colors duration-300">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium text-base group-hover:text-white/90 transition-colors duration-300">{body}</p>
    </Motion.div>
  );
}


