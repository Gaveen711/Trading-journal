import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';

const SECTIONS = [
  {
    id: 'data-collection',
    title: '1. What data we collect',
    content: `We collect only what is necessary to operate xaujournal:

• Account data — your email address, display name, and authentication provider (email/password or Google OAuth) via secure industry-standard authentication.

• Trade data — entry/exit prices, lot size, direction, duration, P&L, and any notes you attach. This is sent by you manually or by the MT5 Expert Advisor under your explicit control.

• Usage telemetry — basic interaction signals (feature usage frequency, session counts) used solely to enforce plan limits and improve the product. We never track keystrokes or screen content.

• Billing data — your subscription status and Stripe customer ID. We do not store or process card numbers; all payment data is handled by Stripe.`,
  },
  {
    id: 'data-security',
    title: '2. How we protect your data',
    content: `All data in transit is encrypted via TLS 1.3. Data at rest is stored in encrypted, isolated cloud databases protected by strict security protocols that enforce user-level isolation — no user can access another user's data, and neither can we in normal operation.

Your trade data is strictly scoped, meaning only a valid authentication token for your account grants read/write access. API keys for MT5 sync are stored in a separate secure collection, hashed, and can be rotated or revoked at any time from your account settings.`,
  },
  {
    id: 'mt5-sync',
    title: '3. MT5 Expert Advisor & API sync',
    content: `Our MQL5 Expert Advisor (EA) transmits trade data from your MetaTrader 5 terminal to our Vercel serverless API endpoint using your unique API key. The EA sends: position ID, symbol, direction, lot size, open/close prices, open/close times, and broker-reported P&L.

We do not receive your MT5 account credentials, account balance beyond individual trade P&L, open positions, or any other account metadata. The EA only runs when the MT5 terminal is active on your Windows desktop — it has no persistent access to your broker account.

You can revoke sync access at any time by rotating your API key or removing the EA from your chart.`,
  },
  {
    id: 'payments',
    title: '4. Payments & subscriptions',
    content: `All financial transactions are processed by Stripe. xaujournal does not store credit card numbers, CVVs, or bank details on our servers. When you upgrade to Pro, we create a Stripe Customer and Subscription linked to your unique account identifier.

Subscription status (active, cancelled, past due) is synced securely to our database and used to gate Pro features. You can manage or cancel your subscription at any time via the billing portal accessible from your account settings.`,
  },
  {
    id: 'data-sharing',
    title: '5. Data sharing & third parties',
    content: `We do not sell, rent, or share your personal or trading data with any third party for advertising or commercial purposes. The only third-party services that process your data are:

• Infrastructure partners — secure authentication and cloud storage.
• Stripe — payment processing and subscription management.
• Vercel — serverless function hosting for the sync API.

Each of these services maintains its own privacy and security certifications (SOC 2, ISO 27001). Links to their privacy policies are available on their respective websites.`,
  },
  {
    id: 'user-rights',
    title: '6. Your rights & data control',
    content: `You retain full ownership of your data. You can:

• Export — download a CSV of all trade records from the History page at any time.
• Delete entries — permanently remove individual trades from the History page.
• Reset account — use the "Reset Terminal" function in account settings to wipe all trade and journal data.
• Delete account — contact us at support@xaujournal.com to permanently delete your account. All associated data will be purged from our records within 30 days.

If you are located in the European Economic Area (EEA), you have additional rights under the GDPR including the right to access, rectify, port, and erase your data. Contact us to exercise any of these rights.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies & local storage',
    content: `xaujournal uses minimal browser storage:

• localStorage — stores your onboarding state, starting balance, and theme preference. This data never leaves your device.
• Authentication service — stores an authentication token in IndexedDB to keep you logged in between sessions. This is essential for the app to function.

We do not use advertising cookies, tracking pixels, or third-party analytics scripts.`,
  },
  {
    id: 'changes',
    title: '8. Changes to this policy',
    content: `We may update this policy as the product evolves. Material changes will be communicated via the in-app notification system and by email to your registered address at least 14 days before they take effect. Continued use of xaujournal after that date constitutes acceptance of the revised policy.`,
  },
  {
    id: 'contact',
    title: '9. Contact',
    content: `For any privacy-related questions or requests:\n\nEmail: support@xaujournal.com\n\nWe aim to respond within two business days.`,
  },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();

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
        <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/3 blur-[100px] opacity-40 mix-blend-screen" />
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

          <ul className="hidden md:flex items-center gap-2">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink 
                  to={to} 
                  className="text-sm font-medium px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  {label}
                </NavLink>
              </li>
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

          <motion.div 
            initial={false}
            animate={{ opacity: mobileMenuOpen ? 1 : 0, y: mobileMenuOpen ? 0 : -20 }}
            className={`md:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8 ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
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
        </nav>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 md:pt-40 md:pb-40">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >
          <motion.span variants={itemVariants} className="inline-block text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 px-3 py-1 rounded-full bg-primary/10">
            Privacy Matters
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            Privacy <span className="text-primary">Policy</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            We believe privacy policies should be readable. This one is. Your trust is our most valuable asset.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 lg:gap-24 items-start">
          <aside className="hidden lg:block sticky top-32">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-8">Table of Contents</h3>
            <nav className="flex flex-col gap-4">
              {SECTIONS.map((s) => (
                <a 
                  key={s.id} 
                  href={`#${s.id}`} 
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200"
                >
                  {s.title.split('. ')[1]}
                </a>
              ))}
            </nav>
          </aside>

          <motion.article 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-sm mb-20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <p className="text-base md:text-lg leading-relaxed font-medium relative z-10">
                <strong className="text-primary mr-2 font-bold uppercase tracking-wide text-sm">Summary:</strong> 
                We only collect what's needed to run the app. Your trading data belongs to you. We don't sell it. You can delete everything at any time.
              </p>
            </div>

            <div className="space-y-24 md:space-y-32">
              {SECTIONS.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-32 group">
                  <div className="flex items-center gap-5 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                      {s.title.split('.')[0]}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{s.title.split('. ')[1]}</h2>
                  </div>
                  <div className="pl-2 md:pl-15 space-y-6">
                    {s.content.split('\n\n').map((block, i) => (
                      <p key={i} className="text-base md:text-lg text-muted-foreground/90 leading-relaxed whitespace-pre-line font-medium">
                        {block}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </motion.article>
        </div>
      </main>

      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-2xl font-bold tracking-tighter">xaujournal</span>
              <p className="text-sm text-muted-foreground font-medium max-w-xs text-center md:text-left">
                Built with a focus on security, performance, and user privacy.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex items-center gap-8 text-sm font-semibold">
                <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
                <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
                <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
              </div>
              <p className="text-xs text-muted-foreground/60 font-medium text-center md:text-right">
                © {new Date().getFullYear()} xaujournal. Your data, your rules.
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-rgb mt-2">
                Crafted by GP WALKER
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
    </div>
  );
}