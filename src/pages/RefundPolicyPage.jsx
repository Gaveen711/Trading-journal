import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `xaujournal operates on a subscription basis. We want you to have a great experience with the platform, and we aim to be fair and transparent about our refund approach.

Please read this policy carefully before subscribing. By completing a purchase, you confirm that you have read and agree to this Refund Policy.`,
  },
  {
    id: 'no-refunds',
    title: '2. General no-refund policy',
    content: `All subscription payments to xaujournal are non-refundable by default. This applies to:

• Monthly Pro subscription charges
• Any partial months remaining after cancellation
• Unused features or periods during an active billing cycle

When you subscribe to xaujournal Pro, you gain immediate access to all Pro features. Because digital access is delivered instantly and cannot be "returned," we do not offer refunds for subscription fees already charged.`,
  },
  {
    id: 'cancellation',
    title: '3. Cancellation',
    content: `You may cancel your Pro subscription at any time through the billing portal in your account settings. Cancellation stops future charges but does not trigger a refund for the current billing period.

Upon cancellation, you will retain full Pro access until the end of your current paid billing cycle. After that date, your account will revert to the free tier automatically.

To cancel: go to Account Settings → Manage Subscription → Cancel Plan.`,
  },
  {
    id: 'exceptions',
    title: '4. Exceptions & goodwill refunds',
    content: `We may issue a full or partial refund at our sole discretion in the following situations:

• Duplicate charges — if you were charged more than once for the same billing period due to a technical error, we will refund the duplicate charge in full.

• Service unavailability — if xaujournal experiences a verified outage lasting more than 72 consecutive hours in a single billing month, you may request a pro-rated credit for the affected period.

• Accidental purchase — if you contact us within 48 hours of your first-ever subscription charge and have not used any Pro features, we will consider a one-time refund.

To request a goodwill refund, email support@xaujournal.com with your account email, the charge date, and a brief description of the issue. We aim to respond within 2 business days.`,
  },
  {
    id: 'chargebacks',
    title: '5. Chargebacks',
    content: `If you initiate a chargeback with your bank or card provider without first contacting us, your account will be suspended immediately pending resolution. We strongly encourage you to contact us first — we are committed to resolving any billing issues fairly and quickly.

Fraudulent chargebacks may result in permanent account termination.`,
  },
  {
    id: 'free-tier',
    title: '6. Free tier',
    content: `xaujournal offers a free tier with limited features at no cost. There are no charges associated with the free tier, and therefore no refunds are applicable.

If you are on the free tier and wish to upgrade, review the features available on our Pricing page before subscribing.`,
  },
  {
    id: 'payment_processor',
    title: '7. Payment processor',
    content: `All payments are processed by our payment provider, which is responsible for PCI compliance. xaujournal does not store your card details.

Refunds approved by xaujournal are processed via the payment provider and typically appear on your statement within 5–10 business days, depending on your bank. We have no control over how quickly your bank processes the credit.`,
  },
  {
    id: 'changes',
    title: '8. Changes to this policy',
    content: `We may update this Refund Policy from time to time. Material changes will be communicated via email to your registered address and via in-app notification at least 14 days before taking effect.

Continued use of xaujournal after the effective date of any changes constitutes your acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '9. Contact us',
    content: `For any billing or refund enquiries:\n\nEmail: support@xaujournal.com\n\nPlease include your account email and the transaction date in your message. We aim to respond within two business days.`,
  },
];

export function RefundPolicyPage() {
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
            Transparency
          </motion.span>
          <motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            Refund <span className="text-primary">Policy</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Clear and simple rules about subscriptions and refunds. We believe in being fair to our users.
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
                Subscriptions are non-refundable. You can cancel anytime and keep access until your billing period ends. If something went wrong on our end, contact us.
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
                Empowering traders with clarity and institutional-grade analytics.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex items-center gap-8 text-sm font-semibold flex-wrap justify-center md:justify-end">
                <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
                <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
                <NavLink to="/refund-policy" className="hover:text-primary transition-colors">Refunds</NavLink>
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
    </div>
  );
}
