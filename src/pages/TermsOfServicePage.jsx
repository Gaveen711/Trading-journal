import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';
import Logo from '../components/Logo';
import { PublicNavbar } from '../components/PublicNavbar';


const SEO = {
  title: 'Terms of Service | XAU Journal — XAUUSD Gold Trading Journal',
  description:
    'Read the XAU Journal terms of service. Understand your rights and responsibilities when using our XAUUSD gold trading journal platform, broker connection via Meta API, and Pro subscription.',
  keywords:
    'xaujournal terms of service, gold trading journal terms, XAUUSD journal user agreement, xau journal legal, forex trading app terms, Meta API broker connection terms, xaujournal subscription terms, gold trader app terms and conditions',
  canonical: 'https://www.xaujournal.com/terms-and-conditions',
};

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
    content: `xaujournal is a cloud-based trading journal platform designed for XAUUSD (Gold) traders. It allows users to log trades, track performance analytics, write journal entries, and optionally synchronise trade data from their broker account via the Meta API broker connection.

The Service is provided on a subscription basis. A free tier with limited features is available. Advanced features are gated behind the Pro subscription plan.`,
  },
  {
    id: 'accounts',
    title: '3. Accounts & eligibility',
    content: `You must be at least 18 years old to create an account. By registering, you confirm you meet this requirement.

You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at info@xaujournal.com if you suspect unauthorized access.

We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or abuse the platform in any way.`,
  },
  {
    id: 'subscriptions',
    title: '4. Subscriptions & billing',
    content: `Pro subscriptions are billed monthly at the rate displayed at the time of purchase. All prices are in USD. Payments are processed securely via our payment processor.

Subscriptions auto-renew each billing cycle unless cancelled before the renewal date. You may cancel at any time via the billing portal in your account settings. Cancellation takes effect at the end of the current billing period — you retain Pro access until then.

xaujournal offers a 7-day money-back guarantee on your first Pro subscription payment. If you are not satisfied within 7 days of your initial purchase, contact us at info@xaujournal.com for a full refund. Renewal charges are non-refundable. Please refer to our full Refund Policy at www.xaujournal.com/refund-policy for complete details.`,
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

We will never sell your data to third parties. We do not use your trading data for advertising purposes. See our Privacy Policy at www.xaujournal.com/privacy for full details on how we handle your information.

You may export or delete your data at any time from within the platform.`,
  },
  {
    id: 'meta-api',
    title: '7. Meta API & broker connection',
    content: `xaujournal supports optional trade synchronisation via the Meta API — the industry-standard protocol used by MetaTrader 4 (MT4) and MetaTrader 5 (MT5) compatible brokers. By connecting your broker account through this feature, you authorise xaujournal to establish a read-only connection to your broker's trade history using a secure token issued through the Meta API protocol.

The Meta API connection is provided for personal use only. You may not share, transfer, or use another person's broker credentials to connect to xaujournal.

You are responsible for keeping your xaujournal account secure and for any activity resulting from your broker connection. We are not liable for any trading losses, broker actions, account restrictions, or data exposure resulting from your use of the Meta API connection or the misuse of your account credentials.

The Meta API connection feature is provided as-is. We make no warranty that it will be compatible with all brokers, MT4/MT5 server versions, or broker configurations. You may revoke the broker connection at any time from your account settings, which will immediately terminate our access to your broker data.

xaujournal is not affiliated with, endorsed by, or responsible for MetaQuotes Software Corp., any MetaTrader platform, or any broker you choose to connect.`,
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
    content: `You may stop using the Service and delete your account at any time by contacting info@xaujournal.com. We will process account deletion requests within 30 days.

We may terminate or suspend your account at any time, with or without notice, for violation of these Terms or any other reason we deem necessary to protect the integrity of the platform. Upon termination, your right to use the Service ceases immediately.`,
  },
  {
    id: 'governing-law',
    title: '11. Governing law',
    content: `These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the Service shall first be attempted to be resolved through good-faith negotiation.

If you have a dispute or complaint, please contact us first at info@xaujournal.com. We aim to resolve all issues within 5 business days.`,
  },
  {
    id: 'contact',
    title: '12. Contact',
    content: `For any questions regarding these Terms:\n\nEmail: info@xaujournal.com\n\nWe aim to respond within two business days.`,
  },
];

export function TermsOfServicePage() {
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
    { to: '/', label: 'How it works' },
    { to: '/the-story', label: 'The Story' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/3 blur-[100px] opacity-40 mix-blend-screen" />
      </div>

      <PublicNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 md:pt-40 md:pb-40">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >
          <Motion.span variants={itemVariants} className="inline-block text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 px-3 py-1 rounded-full bg-primary/10">
            Legal & Privacy
          </Motion.span>
          <Motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            Terms of <span className="text-primary">Service</span>
          </Motion.h1>
          <Motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Our commitment to transparency and fairness in providing the best trading journal experience.
          </Motion.p>
          <Motion.p variants={itemVariants} className="text-sm text-muted-foreground/60 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Effective immediately
          </Motion.p>
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 lg:gap-24 items-start">
          <aside className="hidden lg:block sticky top-32">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-8">Table of Contents</h3>
            <nav className="flex flex-col gap-4" aria-label="Terms of service sections">
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
                <strong className="text-primary mr-2 font-bold uppercase tracking-wide text-sm">TL;DR:</strong>
                Use xaujournal responsibly. Your data is yours. We don't give financial advice. Connect your broker securely via Meta API. Pro subscriptions are billed securely, auto-renew monthly, and come with a 7-day money-back guarantee.
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
            <Logo iconSize="w-7 h-7" />
            <div className="flex items-center gap-8 text-sm font-semibold flex-wrap justify-center md:justify-end text-muted-foreground">
              <NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy</NavLink>
              <NavLink to="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</NavLink>
              <NavLink to="/refund-policy" className="hover:text-primary transition-colors">Refunds</NavLink>
              <NavLink to="/the-story" className="hover:text-primary transition-colors">The Story</NavLink>
              <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-1.5 justify-center md:justify-end order-1 md:order-2">
              made with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 animate-rgb shrink-0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center md:text-left order-2 md:order-1">
              © Copyright 2026 Xau Journal. All Rights Reserved.
            </p>
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