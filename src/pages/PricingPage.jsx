import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';
import { auth } from '../firebase';
import { useSubscription } from '../hooks/useSubscription';
import { ProTermsModal } from '../components/ProTermsModal';
import { useToast } from '../components/ToastContext';

const FREE_FEATURES = [
  '50 trades / month',
  'Basic P&L tracking',
  'Trade calendar',
  'Manual trade entry',
  'Email support',
];

const PRO_FEATURES = [
  'Unlimited trades',
  'Full analytics suite',
  'Session intelligence',
  'MT5 Expert Advisor sync',
  'TradingView webhook',
  'API key access',
  'Priority support',
  'Early access to new features',
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from the billing portal at any time. You keep Pro access until the end of your billing period — no partial-month charges.' },
  { q: 'Is my trading data secure?', a: 'Your data is secured using industry-standard encryption and isolated cloud storage. Only you have access to your trade history; we cannot read your private logs.' },
  { q: 'Does the EA work on mobile MT5?', a: 'Expert Advisors require the MT5 desktop terminal on Windows. The recommended workflow is to run the EA on your desktop while executing trades from mobile — data syncs in real time.' },
  { q: 'What payment methods do you accept?', a: 'All major credit and debit cards and PayPal.' },
  { q: 'Is there a free trial for Pro?', a: 'The free plan provides full access to the core journaling experience. We are currently developing a Pro trial experience—sign up to be notified when it launches.' },
];

export function PricingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();
  const user = auth.currentUser;
  const { startCheckout, recordProAcceptance } = useSubscription(user);
  const [showTerms, setShowTerms] = useState(false);
  const toast = useToast();

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
    { to: '/', label: 'Home' },
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
          className={`fixed top-0 left-0 right-0 z-[100] h-16 md:h-20 flex items-center justify-between px-6 md:px-12 transition-all duration-300 ease-in-out ${
            isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm' : 'bg-transparent border-transparent'
          }`}
        >
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]">
            <span className="text-xl font-bold tracking-tighter">xaujournal</span>
          </button>

          <ul className="hidden md:flex items-center gap-2 ml-auto mr-10">
            {navLinks.map(({ to, label }) => (
              <motion.li 
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
              </motion.li>
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
                 {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <main className="relative z-10 px-6 pt-32 pb-24 md:pt-40 md:pb-40 max-w-7xl mx-auto">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >

          <motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            Trade better. <span className="text-primary">Stress less.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Start with our generous free tier. Upgrade to Pro when you're ready to unlock the full institutional-grade analytics suite.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto mb-32 md:mb-48">
          <motion.div 
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
              {FREE_FEATURES.map(f=>(
                <li key={f} className="flex items-center gap-4 text-sm font-semibold text-foreground/80">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => navigate('/login')} 
              className="w-full py-3.5 sm:py-5 rounded-2xl border-2 border-border/60 bg-transparent text-foreground font-bold tracking-wide hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Get started free
            </button>
          </motion.div>

          <motion.div 
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
                <span className="text-6xl font-black tracking-tighter leading-none text-primary">$19.99</span>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">/mo</span>
              </div>
              <p className="text-sm text-primary font-bold mt-3">Monthly subscription · Cancel anytime</p>
              <p className="text-base text-muted-foreground mt-6 leading-relaxed font-medium">The complete professional suite for high-performance gold traders.</p>
            </div>
            
            <ul className="flex-1 space-y-5 mb-10 relative z-10">
              {PRO_FEATURES.map(f=>(
                <li key={f} className="flex items-center gap-4 text-sm font-bold text-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            
            <button 
              onClick={handleUpgradeClick} 
              className="w-full py-3.5 sm:py-5 rounded-2xl bg-primary text-primary-foreground font-black tracking-wide shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative z-10"
            >
              Upgrade to Pro
            </button>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Common questions</h2>
            <p className="text-muted-foreground font-medium">Everything you need to know about xaujournal Pro.</p>
          </motion.div>
          
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <FAQItem key={item.q} {...item} index={i} />
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-2xl font-bold tracking-tighter">xaujournal</span>
              <p className="text-sm text-muted-foreground font-medium max-w-xs text-center md:text-left">
                Empowering traders with clarity and institutional-grade analytics.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex items-center gap-8 text-sm font-semibold flex-wrap justify-center md:justify-end">
                <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
                <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
                <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-2 text-center md:text-right">
                © {new Date().getFullYear()} <span className="animate-rgb">xaujournal</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
        className={`fixed bottom-8 right-8 z-[90] p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-border/40 text-primary shadow-xl transition-all duration-500 hover:-translate-y-2 active:scale-90 ${
          isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
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

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }} 
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-6 md:p-8 rounded-[2rem] border border-border/40 bg-card/20 hover:bg-card/40 transition-colors"
    >
      <button onClick={()=>setOpen(o=>!o)} className="w-full bg-transparent border-none text-left cursor-pointer flex items-center justify-between gap-6 group">
        <span className="text-base md:text-lg font-bold tracking-tight group-hover:text-primary transition-colors">{q}</span>
        <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-transform duration-500 ${open ? 'rotate-180 bg-primary/10 text-primary' : 'rotate-0'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-muted-foreground leading-relaxed font-medium text-sm md:text-base">{a}</p>
      </div>
    </motion.div>
  );
}