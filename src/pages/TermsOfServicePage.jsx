import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of terms',
    content: `By creating an account or using xaujournal (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.

These Terms apply to all users, including visitors, free-tier members, and Pro subscribers. We reserve the right to update these Terms at any time. Continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.`,
  },
  {
    id: 'description',
    title: '2. Description of service',
    content: `xaujournal is a cloud-based trading journal platform designed for XAUUSD (Gold) traders. It allows users to log trades, track performance analytics, write journal entries, and optionally synchronize trade data from MetaTrader 5 via a dedicated Expert Advisor (EA).

The Service is provided on a subscription basis. A free tier with limited features is available. Advanced features are gated behind the Pro subscription plan.`,
  },
  {
    id: 'accounts',
    title: '3. Accounts & eligibility',
    content: `You must be at least 18 years old to create an account. By registering, you confirm you meet this requirement.

You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at support@xaujournal.com if you suspect unauthorized access.

We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or abuse the platform in any way.`,
  },
  {
    id: 'subscriptions',
    title: '4. Subscriptions & billing',
    content: `Pro subscriptions are billed monthly at the rate displayed at the time of purchase. All prices are in USD. Payments are processed securely by Stripe.

Subscriptions auto-renew each billing cycle unless cancelled before the renewal date. You may cancel at any time via the billing portal in your account settings. Cancellation takes effect at the end of the current billing period — you retain Pro access until then.

We do not offer refunds for partial months or unused features. If you believe a charge is in error, contact us within 14 days at support@xaujournal.com.`,
  },
  {
    id: 'acceptable-use',
    title: '5. Acceptable use',
    content: `You agree not to use xaujournal to:

• Engage in any unlawful activity or violate any applicable law or regulation.
• Attempt to reverse-engineer, decompile, or extract source code from the platform.
• Overload, disrupt, or attack our servers or infrastructure.
• Scrape, harvest, or systematically collect data from the Service using automated means.
• Resell, sublicense, or distribute access to the Service to third parties.
• Impersonate any other person or entity.

Violation of this section may result in immediate account termination without refund.`,
  },
  {
    id: 'data-ownership',
    title: '6. Your data & content',
    content: `All trade data, journal entries, and notes you enter into xaujournal remain your property. You grant us a limited, non-exclusive license to store and process this data solely to provide the Service to you.

We will never sell your data to third parties. We do not use your trading data for advertising purposes. See our Privacy Policy at xaujournal.vercel.app/privacy for full details on how we handle your information.

You may export or delete your data at any time from within the platform.`,
  },
  {
    id: 'mt5-ea',
    title: '7. MT5 Expert Advisor',
    content: `The MT5 Expert Advisor (EA) provided as part of xaujournal is for personal use only. You may not distribute, sell, or share the EA file or its source code with others.

The EA connects to our API using a unique key tied to your account. You are responsible for keeping this key secure. We are not liable for any trading losses, broker actions, or data exposure resulting from misuse of the EA or your API key.

The EA is provided as-is. We make no warranty that it will be free from errors or compatible with all MT5 builds or broker configurations.`,
  },
  {
    id: 'disclaimers',
    title: '8. Disclaimers & no financial advice',
    content: `xaujournal is a journaling and analytics tool. Nothing on the platform constitutes financial advice, investment advice, or a recommendation to buy or sell any financial instrument.

Trading in financial markets, including Gold (XAUUSD), involves substantial risk of loss. Past performance data shown in the app is for informational purposes only and is not indicative of future results. You are solely responsible for your own trading decisions.

THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
  },
  {
    id: 'liability',
    title: '9. Limitation of liability',
    content: `To the maximum extent permitted by applicable law, xaujournal and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising out of your use of or inability to use the Service.

Our total liability to you for any claim arising from these Terms or your use of the Service shall not exceed the total amount you paid us in the 12 months preceding the claim.`,
  },
  {
    id: 'termination',
    title: '10. Termination',
    content: `You may stop using the Service and delete your account at any time by contacting support@xaujournal.com. We will process account deletion requests within 30 days.

We may terminate or suspend your account at any time, with or without notice, for violation of these Terms or any other reason we deem necessary to protect the integrity of the platform. Upon termination, your right to use the Service ceases immediately.`,
  },
  {
    id: 'governing-law',
    title: '11. Governing law',
    content: `These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the Service shall first be attempted to be resolved through good-faith negotiation.

If you have a dispute or complaint, please contact us first at support@xaujournal.com. We aim to resolve all issues within 5 business days.`,
  },
  {
    id: 'contact',
    title: '12. Contact',
    content: `For any questions regarding these Terms:\n\nEmail: support@xaujournal.com\n\nWe aim to respond within two business days.`,
  },
];

export function TermsOfServicePage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();

  // Consolidated scroll and lifecycle logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Smooth scrolling initialization
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

    // Lock body scroll when mobile menu is open
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
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/3 blur-[100px] opacity-40 mix-blend-screen" />
      </div>

      {/* Navigation */}
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

          {/* Mobile Menu Overlay */}
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
        {/* Hero Section */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >
          <motion.span variants={itemVariants} className="inline-block text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 px-3 py-1 rounded-full bg-primary/10">
            Legal & Privacy
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            Terms of <span className="text-primary">Service</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Our commitment to transparency and fairness in providing the best trading journal experience.
          </motion.p>
        </motion.div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 lg:gap-24 items-start">
          
          {/* Sticky Table of Contents */}
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

          {/* Main Content */}
          <motion.article 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-sm mb-20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <p className="text-base md:text-lg leading-relaxed font-medium relative z-10">
                <strong className="text-primary mr-2 font-bold uppercase tracking-wide text-sm">TL;DR:</strong>
                Use xaujournal responsibly. Your data is yours. We don't give financial advice. Pro subscriptions auto-renew and can be cancelled anytime.
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

      {/* Footer */}
      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-2xl font-bold tracking-tighter">xaujournal</span>
              <p className="text-sm text-muted-foreground font-medium max-w-xs text-center md:text-left">
                Empowering gold traders with institutional-grade analytics and journaling.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex items-center gap-8 text-sm font-semibold">
                <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
                <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
                <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
              </div>
              <p className="text-xs text-muted-foreground/60 font-medium text-center md:text-right">
                © {new Date().getFullYear()} xaujournal. Built for precision.
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-rgb mt-2">
                Crafted by GP WALKER
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
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
