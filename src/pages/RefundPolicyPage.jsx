import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';
import Logo from '../components/Logo';


const SEO = {
  title: 'Refund Policy | XAU Journal — 7-Day Money-Back Guarantee',
  description:
    'XAU Journal offers a 7-day money-back guarantee. If you are not satisfied with your Pro subscription within 7 days of purchase, contact us for a full refund — no questions asked.',
  keywords:
    'xaujournal refund policy, gold trading journal refund, 7 day money back guarantee trading app, xau journal subscription refund, forex journal refund, cancel xaujournal subscription, payment subscription refund',
  canonical: 'https://www.xaujournal.com/refund-policy',
};

const SECTIONS = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `xaujournal operates on a subscription basis and is committed to your satisfaction. We want you to feel confident when subscribing to xaujournal Pro, which is why we offer a 7-day money-back guarantee.

Please read this policy carefully before subscribing. By completing a purchase, you confirm that you have read and agree to this Refund Policy.`,
  },
  {
    id: 'seven-day-guarantee',
    title: '2. 7-Day money-back guarantee',
    content: `If you are not satisfied with your xaujournal Pro subscription for any reason, you may request a full refund within 7 days of your initial purchase date.

To request a refund under this guarantee:

• Email us at info@xaujournal.com with the subject line "Refund Request."
• Include your registered account email and the date of your purchase.
• We will process your refund within 2 business days of receiving your request.

This guarantee applies to your first-ever Pro subscription payment only. It does not apply to subsequent renewal charges, additional purchases, or accounts that have previously received a goodwill refund.

Once a refund is processed, your account will be downgraded to the free tier immediately.`,
  },
  {
    id: 'cancellation',
    title: '3. Cancellation',
    content: `You may cancel your Pro subscription at any time through the billing portal in your account settings. Cancellation stops future charges but does not automatically trigger a refund for the current billing period (unless you are within your 7-day guarantee window).

Upon cancellation, you will retain full Pro access until the end of your current paid billing cycle. After that date, your account will revert to the free tier automatically.

To cancel: go to Account Settings → Manage Subscription → Cancel Plan.`,
  },
  {
    id: 'renewals',
    title: '4. Renewal charges',
    content: `Subscriptions auto-renew each billing cycle on the same date as your original purchase. Renewal charges are non-refundable except in the circumstances listed in Section 5 below.

We will always notify you by email at least 7 days before your renewal date. You may cancel at any time before the renewal date to avoid the next charge.`,
  },
  {
    id: 'exceptions',
    title: '5. Additional refund exceptions',
    content: `Outside of the 7-day guarantee, we may issue a full or partial refund at our sole discretion in the following situations:

• Duplicate charges — if you were charged more than once for the same billing period due to a technical error, we will refund the duplicate charge in full.

• Service unavailability — if xaujournal experiences a verified outage lasting more than 72 consecutive hours in a single billing month, you may request a pro-rated credit for the affected period.

To request a refund under these exceptions, email info@xaujournal.com with your account email, the charge date, and a brief description of the issue. We aim to respond within 2 business days.`,
  },
  {
    id: 'chargebacks',
    title: '6. Chargebacks & disputes',
    content: `If you initiate a chargeback or payment dispute without first contacting us, your account will be suspended immediately pending resolution. We strongly encourage you to reach out to us first — we are committed to resolving any billing issues fairly and quickly.

Filing a fraudulent chargeback or dispute may result in permanent account termination and recovery of any refunded amounts through applicable legal channels.`,
  },
  {
    id: 'free-tier',
    title: '7. Free tier',
    content: `xaujournal offers a free tier with limited features at no cost. There are no charges associated with the free tier, and therefore no refunds are applicable.

If you are on the free tier and wish to upgrade, we recommend reviewing the features available on our Pricing page before subscribing so you can make an informed decision.`,
  },
  {
    id: 'payment-processing',
    title: '8. Payment processing',
    content: `All subscription payments are processed securely by our payment partner. xaujournal does not store your card details, bank information, or payment credentials on our servers.

Refunds approved by xaujournal are processed through our payment partner and typically appear on your original payment method within 3–5 business days, depending on your bank or card issuer. We have no control over how quickly your bank processes the credit to your account.

For questions about a specific transaction, you may also contact our support directly or reference the support details provided on your billing invoice.`,
  },
  {
    id: 'changes',
    title: '9. Changes to this policy',
    content: `We may update this Refund Policy from time to time. Material changes will be communicated via email to your registered address and via in-app notification at least 14 days before taking effect.

Continued use of xaujournal after the effective date of any changes constitutes your acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact us',
    content: `For any billing or refund enquiries:\n\nEmail: info@xaujournal.com\n\nPlease include your account email and the transaction date in your message. We aim to respond within two business days.`,
  },
];

export function RefundPolicyPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();

  useEffect(() => {
    // SEO meta tags
    document.title = SEO.title;
    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', SEO.description);
    setMeta('keywords', SEO.keywords);
    setMeta('robots', 'index, follow');
    setMeta('og:title', SEO.title, true);
    setMeta('og:description', SEO.description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', SEO.canonical, true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', SEO.title);
    setMeta('twitter:description', SEO.description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', SEO.canonical);

    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
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
    { to: '/contact', label: 'Contact' },
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
            <Logo iconSize="w-7 h-7" />
          </button>

          <ul className="hidden md:flex items-center gap-2">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      isActive ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
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

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 md:pt-40 md:pb-40">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >
          <Motion.span variants={itemVariants} className="inline-block text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 px-3 py-1 rounded-full bg-primary/10">
            Transparency
          </Motion.span>
          <Motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            Refund <span className="text-primary">Policy</span>
          </Motion.h1>
          <Motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            We stand behind xaujournal with a 7-day money-back guarantee. If you're not satisfied, we'll make it right.
          </Motion.p>
          <Motion.p variants={itemVariants} className="text-sm text-muted-foreground/60 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Effective immediately
          </Motion.p>
        </Motion.div>

        {/* 7-day badge highlight */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-2xl mx-auto mb-16 md:mb-24 flex items-center gap-6 p-6 rounded-3xl border border-primary/30 bg-primary/5 backdrop-blur-sm shadow-sm"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg tracking-tight">7-Day Money-Back Guarantee</p>
            <p className="text-sm text-muted-foreground font-medium mt-1">Not happy within 7 days? Email us for a full refund — no questions asked.</p>
          </div>
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 lg:gap-24 items-start">
          <aside className="hidden lg:block sticky top-32">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-8">Table of Contents</h3>
            <nav className="flex flex-col gap-4" aria-label="Refund policy sections">
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

          <Motion.article
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-sm mb-20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <p className="text-base md:text-lg leading-relaxed font-medium relative z-10">
                <strong className="text-primary mr-2 font-bold uppercase tracking-wide text-sm">Summary:</strong>
                You get a full 7-day money-back guarantee on your first Pro subscription. After 7 days, renewals are non-refundable. Cancel anytime and keep access until your billing period ends. Payments and refunds are handled securely by our payment processor.
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
          </Motion.article>
        </div>
      </main>

      <footer className="border-t border-border/40 py-20 px-6 md:px-12 bg-muted/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <NavLink to="/" className="mb-4 inline-block">
                <div className="footer-logo-btn">
                  <div className="box">X</div>
                  <div className="box">A</div>
                  <div className="box">U</div>
                  <div className="box extra"></div>
                  <div className="box extra"></div>
                  <div className="box extra"></div>
                  <div className="box extra"></div>
                </div>
              </NavLink>
            </div>
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex items-center gap-8 text-sm font-semibold flex-wrap justify-center md:justify-end">
                <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
                <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
                <NavLink to="/refund-policy" className="hover:text-primary transition-colors">Refunds</NavLink>
                <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-1.5 justify-center md:justify-end">
                  made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center md:text-right">
                  Copyright © 2026 xaujournal. All Rights Reserved
                </p>
              </div>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}