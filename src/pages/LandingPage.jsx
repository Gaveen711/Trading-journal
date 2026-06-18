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
function StoryChapter({ chapter, label, headline, sub, accent, glow, dotColor, index }) {
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
      className="story-chapter-card relative min-h-[35vh] flex flex-col justify-center py-12 md:py-16"
    >
      {/* Soft ambient glow */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen transform pointer-events-none">
        <Motion.div
          initial={{ opacity: 0, x: index % 2 === 0 ? '-20%' : '20%', scale: 0.95 }}
          animate={{
            opacity: inView ? 0.8 : 0,
            x: inView ? '0%' : (index % 2 === 0 ? '-20%' : '20%'),
            scale: inView ? 1 : 0.95
          }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
          style={{
            background: `radial-gradient(ellipse 60% 50% at ${index % 2 === 0 ? '0%' : '100%'} 50%, ${glow}, transparent)`,
          }}
        />
      </div>

      <div className={`relative flex flex-col ${index % 2 === 0 ? 'items-start text-left' : 'items-start text-left md:items-end md:text-right'} max-w-2xl ${index % 2 === 0 ? 'ml-0' : 'ml-0 md:ml-auto'}`}>
        <Motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : (index % 2 === 0 ? -40 : 40), y: isMobile ? 20 : 0 }}
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : (isMobile ? 0 : (index % 2 === 0 ? -40 : 40)), y: inView ? 0 : (isMobile ? 20 : 0) }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
            <div
              className="w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-500"
              style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}40` }}
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: dotColor }}>
            Chapter {chapter}
          </div>
          <div className="h-px w-10 bg-border/50" />
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            {label}
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.08] tracking-tight mb-5 text-foreground">
            {headline}
          </h2>
        </Motion.div>

        <Motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-lg text-muted-foreground leading-relaxed font-medium"
        >
          {sub}
        </Motion.p>

        <Motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: index % 2 === 0 ? 'left' : 'right' }}
          className={`mt-8 h-px w-20 bg-gradient-to-r ${accent}`}
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
    <span className={`inline-flex flex-wrap justify-center pb-2 ${className}`}>
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
        <section ref={heroRef} className="relative z-10 min-h-[100vh] flex flex-col items-center justify-center px-6 pt-28 pb-32 md:pb-44 text-center overflow-hidden">
          <Motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="max-w-4xl mx-auto flex flex-col items-center relative z-10 will-change-transform">

            <Motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center">
              {/* Badge */}
              <Motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border/40 bg-foreground/[0.03] text-muted-foreground text-[11px] font-bold uppercase tracking-[0.15em] mb-10 backdrop-blur-sm relative overflow-hidden"
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
                <h1 className="!text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.95] tracking-tighter mb-10 text-foreground flex flex-col items-center">
                  <AnimatedText text="Every trade" />
                  <AnimatedText text="you make" />
                  <AnimatedText text="tells a story." className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-to to-purple-400 italic" />
                </h1>
              </Motion.div>

              {/* Sub text */}
              <Motion.p variants={itemVariants} className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-xl mb-12 font-medium">
                XAU Journal is the precision trading journal built for gold traders — track, analyse, and master your edge in XAUUSD.
              </Motion.p>

              {/* CTA */}
              <Motion.div variants={itemVariants} className="flex flex-col items-center justify-center w-full sm:w-auto mt-4">
                <div
                  onClick={() => navigate('/login')}
                  onMouseEnter={() => setIsHoveredButton(true)}
                  onMouseLeave={() => setIsHoveredButton(false)}
                  onTouchStart={() => setIsHoveredButton(true)}
                  onTouchEnd={() => setIsHoveredButton(false)}
                  onTouchCancel={() => setIsHoveredButton(false)}
                  className="group flex flex-col items-center justify-center rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden relative"
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
              <Motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 mt-16 md:mt-24 w-full max-w-3xl px-4">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center group">
                    <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      <Counter target={s.value} />
                    </div>
                    <div className="text-[0.6rem] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">{s.label}</div>
                  </div>
                ))}
              </Motion.div>
            </Motion.div>
          </Motion.div>

        </section>

        {/* ─── STORY NARRATIVE ─── */}
        <section id="story" className="relative z-10 px-6 overflow-hidden">
          <StoryLine />

          <div className="max-w-5xl mx-auto">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 pt-8"
            >
              <span className="text-muted-foreground/50 text-[10px] font-black tracking-[0.4em] uppercase">Your Trading Story</span>
            </Motion.div>

            {STORY_CHAPTERS.map((ch, i) => (
              <StoryChapter key={ch.chapter} {...ch} index={i} />
            ))}
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="relative z-10 py-28 md:py-40 px-6">
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

            <DraggableMarquee className="hidden sm:block">
              {[...FEATURES, ...FEATURES].map((f, i) => (
                <div key={`${f.title}-${i}`} className="w-[280px] lg:w-[320px] shrink-0 px-2.5">
                  <FeatureCard {...f} index={i % FEATURES.length} />
                </div>
              ))}
            </DraggableMarquee>

            <div className="sm:hidden mt-8 flex flex-col gap-2.5">
              {FEATURES.map((f, i) => (
                <MobileFeatureAccordion key={f.title} {...f} index={i} />
              ))}
            </div>
          </div>
        </section>

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
            <div className="text-center md:text-center flex flex-col items-center md:items-center lg:items-start lg:text-left">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70 mb-6">Platform</h4>
              <ul className="space-y-3 text-[13px] font-medium text-muted-foreground text-center lg:text-left">
                <li><Link to="/pricing" className="hover:text-foreground transition-colors duration-200">Pricing</Link></li>
                <li><Link to="/the-story" className="hover:text-foreground transition-colors duration-200">The Story</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors duration-200">Contact</Link></li>
                <li><Link to="/login?mode=signin" className="hover:text-foreground transition-colors duration-200">Login</Link></li>
              </ul>
            </div>
            <div className="text-center md:text-center flex flex-col items-center md:items-center lg:items-start lg:text-left">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70 mb-6">Legal</h4>
              <ul className="space-y-3 text-[13px] font-medium text-muted-foreground text-center lg:text-left">
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
        className={`fixed bottom-6 right-6 z-[90] p-3.5 rounded-2xl bg-background/80 backdrop-blur-md border border-border/30 text-muted-foreground hover:text-foreground shadow-lg hover:-translate-y-1 active:scale-90 transition-all duration-200 ${!isScrolled ? 'pointer-events-none' : ''}`}
        aria-label="Scroll to top"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
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
  const pastelBgs = ['rgba(167,139,250,0.08)', 'rgba(251,113,133,0.08)', 'rgba(52,211,153,0.08)', 'rgba(129,140,248,0.08)', 'rgba(251,191,36,0.08)', 'rgba(56,189,248,0.08)'];
  const pastelAccents = ['#a78bfa', '#fb7185', '#34d399', '#818cf8', '#fbbf24', '#38bdf8'];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="p-7 rounded-3xl flex flex-col cursor-default select-none transition-all duration-500 ease-out group border border-transparent hover:border-border/30 hover:bg-foreground/[0.02]"
      style={{
        boxShadow: isOpen ? `0 8px 40px -12px ${pastelAccents[index]}30` : 'none',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
        style={{
          backgroundColor: pastelBgs[index],
          color: pastelAccents[index],
        }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors duration-300">{title}</h3>
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
  const pastelBgs = ['rgba(167,139,250,0.1)', 'rgba(251,113,133,0.1)', 'rgba(52,211,153,0.1)', 'rgba(129,140,248,0.1)', 'rgba(251,191,36,0.1)', 'rgba(56,189,248,0.1)'];
  const pastelAccents = ['#a78bfa', '#fb7185', '#34d399', '#818cf8', '#fbbf24', '#38bdf8'];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-border/40 shadow-md' : 'border-border/20'}`}
      style={isOpen ? { backgroundColor: `${pastelAccents[index]}08` } : {}}
    >
      <button type="button" onClick={() => setIsOpen(o => !o)} className="w-full flex items-center gap-4 p-4 text-left" aria-expanded={isOpen}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            backgroundColor: isOpen ? pastelAccents[index] : pastelBgs[index],
            color: isOpen ? '#fff' : pastelAccents[index],
          }}
        >
          {icon}
        </div>
        <span className="flex-1 text-[15px] font-bold text-foreground leading-tight">{title}</span>
        <Motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }} className="text-muted-foreground text-xl font-light shrink-0">+</Motion.span>
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
function DraggableMarquee({ children, className = '', speed = 0.5 }) {
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
      className={`w-full overflow-hidden relative py-8 ${className}`}
      style={{ cursor: grabbing ? 'grabbing' : 'grab', maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', userSelect: 'none' }}
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

          <div className="flex flex-col gap-[20vh] md:gap-[40vh] relative z-10 py-[15vh] md:py-[25vh]">
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
