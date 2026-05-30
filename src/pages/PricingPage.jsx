import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';
import Logo from '../components/Logo';
import { auth } from '../firebase';
import { useSubscription } from '../hooks/useSubscription';
import { ProTermsModal } from '../components/ProTermsModal';
import { PRO_MONTHLY_DISPLAY } from '../lib/pricing';

const FREE_FEATURES = [
  '50 trades / month',
  'Basic P&L tracking',
  'Trade calendar',
  'Manual trade entry',
  'Unlmited Journal Notes',
];

const PRO_FEATURES = [
  'Unlimited trades',
  'Full analytics suite',
  'Session intelligence',
  'MT4/MT5 Access',
  'Priority support',
  'Early access to new features',
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from the billing portal at any time. You keep Pro access until the end of your billing period no partial month charges.' },
  { q: 'Is my trading data secure?', a: 'Your data is secured using industry standard encryption and isolated cloud storage. Only you have access to your trade history; we cannot read your private logs.' },
  { q: 'How does broker sync work?', a: 'Broker Sync connects directly to your MT4 or MT5 broker server using your login credentials. Once connected, your closed trades are pulled into your journal automatically no extra software required.' },
  { q: 'What payment methods do you accept?', a: 'All major credit and debit cards.' },
  { q: 'Is there a free trial for Pro?', a: 'Yes! We offer a 7-day free trial for xaujournal Pro. You can test all features including MT4/MT5 auto-sync and full analytics risk-free before being charged.' },
];

export function PricingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();
  const user = auth.currentUser;
  const { startCheckout, recordProAcceptance } = useSubscription(user);
  const [showTerms, setShowTerms] = useState(false);

  const handleUpgradeClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowTerms(true);
  };

  const handleAcceptTerms = async () => {
    const success = await recordProAcceptance();
    if (success) {
      setShowTerms(false);
      startCheckout();
    }
  };

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

    window.scrollTo(0, 0);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const navLinks = [
    { to: '/#features', label: 'How it works' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/3 blur-[100px] opacity-40 mix-blend-screen" />
      </div>

      <header>
        <nav
          style={{ transform: 'translateX(-50%)' }}
          className={`fixed top-4 left-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] h-16 flex items-center justify-between px-6 md:px-10 rounded-2xl md:rounded-full border transition-all duration-300 ease-in-out ${
            isScrolled
              ? 'bg-card/90 backdrop-blur-xl border-border/40 shadow-2xl'
              : 'bg-card/75 backdrop-blur-md border-border/20 shadow-lg'
          }`}
        >
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]">
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
                  className="text-sm font-medium px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all"
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
            <div className="hidden md:block">
              <button
                onClick={() => navigate('/login')}
                className="cta active:scale-95 transition-all duration-300"
              >
                <span>Get Started</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10">
                  <path d="M1,5 L11,5" />
                  <polyline points="8 1 12 5 8 9" />
                </svg>
              </button>
            </div>
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

      <main className="relative z-10 px-6 pt-32 pb-24 md:pt-40 md:pb-40 max-w-7xl mx-auto">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >

          <Motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            XAU journal <span className="text-primary">pricing</span>
          </Motion.h1>
          <Motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Plans for the best gold (XAUUSD) trading journal free manual logging or Pro with MT5 auto-sync and full analytics.
          </Motion.p>
        </Motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto mb-32 md:mb-48">
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-10 md:p-12 rounded-[3rem] border border-white/20 bg-card/40 backdrop-blur-sm flex flex-col hover:border-white/60 transition-all duration-300 shadow-sm"
          >
            <div className="mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-6">Standard</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter leading-none">$0</span>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">/mo</span>
              </div>
              <p className="text-base text-muted-foreground mt-6 leading-relaxed font-medium">Everything you need to master the habit of journaling.</p>
            </div>

            <ul className="flex-1 space-y-5 mb-10">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-4 text-sm font-semibold text-foreground/80">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/login')}
              className="btn-pricing-custom mt-auto"
            >
              Get started free
            </button>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative p-10 md:p-12 rounded-[3rem] border-2 border-white/30 bg-card flex flex-col shadow-2xl shadow-primary/10 hover:border-primary hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="mb-10 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Institutional</p>
                <span className="text-[10px] font-black tracking-[0.1em] uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Best Value
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter leading-none text-primary">{PRO_MONTHLY_DISPLAY}</span>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">/mo</span>
              </div>
              <p className="text-sm text-primary font-bold mt-3">7-Day Free Trial · Cancel anytime</p>
              <p className="text-base text-muted-foreground mt-6 leading-relaxed font-medium">The complete professional suite for high-performance gold traders.</p>
            </div>

            <ul className="flex-1 space-y-5 mb-10 relative z-10">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-4 text-sm font-bold text-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgradeClick}
              className="btn-pricing-custom mt-auto"
            >
              Start 7-Day Free Trial
            </button>
          </Motion.div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Common questions</h2>
            <p className="text-muted-foreground font-medium">Everything you need to know about xaujournal Pro.</p>
          </Motion.div>

          <FAQAccordion />
        </div>
      </main>

      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8 text-sm font-semibold flex-wrap justify-center md:justify-start">
              <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
              <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
              <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center md:text-left">
              © Copyright 2026 Xau Journal. All Rights Reserved.
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-1.5 justify-center md:justify-end">
              made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </p>
          </div>
        </div>
      </footer>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-[90] p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-border/40 text-primary shadow-xl transition-all duration-500 hover:-translate-y-2 active:scale-90 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
      </button>

      {showTerms && (
        <ProTermsModal
          onAccept={handleAcceptTerms}
          onClose={() => setShowTerms(false)}
        />
      )}
    </div>
  );
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-1">
      {FAQ.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <Motion.div
            key={item.q}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            layout
            className="overflow-hidden rounded-2xl border-0 bg-transparent"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full py-5 md:py-6 px-1 bg-transparent border-0 outline-none text-left cursor-pointer flex items-center justify-between gap-6 group focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
              aria-expanded={isOpen}
            >
              <span className="text-base md:text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                {item.q}
              </span>
              <Motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </Motion.div>
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
                  <p className="pb-5 md:pb-6 px-1 text-muted-foreground leading-relaxed font-medium text-sm md:text-base">
                    {item.a}
                  </p>
                </Motion.div>
              )}
            </AnimatePresence>
          </Motion.div>
        );
      })}
    </div>
  );
}


