import { useEffect } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';


const SEO = {
  title: 'Privacy Policy | XAU Journal — XAUUSD Gold Trading Journal',
  description:
    'Read the XAU Journal privacy policy. We only collect what is needed to run your XAUUSD trading journal. Your trade data belongs to you — we never sell it.',
  keywords:
    'xaujournal privacy policy, gold trading journal privacy, XAUUSD trade data security, forex journal app privacy, trading journal data protection, MetaTrader journal privacy, xau journal terms',
  canonical: 'https://www.xaujournal.com/privacy',
};

const SECTIONS = [
  {
    id: 'data-collection',
    title: '1. What data we collect',
    content: `We collect only what is necessary to operate xaujournal:

• Account data — your email address, display name, and authentication provider (email/password or Google OAuth) via secure industry-standard authentication.

• Trade data — entry/exit prices, lot size, direction, duration, P&L, and any notes you attach. This data is submitted manually by you or automatically via the Meta API broker connection under your explicit control.

• Usage telemetry — basic interaction signals (feature usage frequency, session counts) used solely to enforce plan limits and improve the product. We never track keystrokes or screen content.

• Billing data — your subscription status and secure customer reference ID. We do not store or process card numbers or bank details; all payment data is handled securely by our payment processor.`,
  },
  {
    id: 'data-security',
    title: '2. How we protect your data',
    content: `All data in transit is encrypted via TLS 1.3. Data at rest is stored in encrypted, isolated cloud databases protected by strict security protocols that enforce user-level isolation — no user can access another user's data, and neither can we in normal operation.

Your trade data is strictly scoped, meaning only a valid authentication token for your account grants read/write access. API keys for Meta API broker sync are stored in a separate secure collection, hashed, and can be rotated or revoked at any time from your account settings.`,
  },
  {
    id: 'meta-api-sync',
    title: '3. Meta API & broker connection',
    content: `xaujournal supports automatic trade synchronisation via the Meta API — the industry-standard protocol used by MetaTrader 4 and MetaTrader 5 brokers. When you connect your broker account, you authorise xaujournal to read your trade history using a secure read-only API connection.

We receive only: position ID, symbol, direction, lot size, open/close prices, open/close times, and broker-reported P&L. We do not receive your broker account password, full account balance, open positions beyond individual trade data, or any other sensitive account metadata.

Your broker credentials are never stored on our servers. The connection is established via a secure OAuth-style token issued by your broker through the Meta API protocol. You can revoke this connection at any time from your account settings, which immediately terminates our access to your broker account.

xaujournal is not affiliated with, endorsed by, or responsible for any broker you choose to connect. Use of the Meta API connection is at your own discretion.`,
  },
  {
    id: 'payments',
    title: '4. Payments & subscriptions',
    content: `All financial transactions are processed securely by our PCI-compliant payment partner. xaujournal does not store credit card numbers, CVVs, payment credentials, or bank details on our servers.

When you upgrade to Pro, we create a subscription record linked to your payment profile and your unique xaujournal identifier. Subscription status (active, cancelled, past due) is synced to our database and used to gate Pro features. You can manage or cancel your subscription at any time via the billing portal in your account settings.

Our payment partner maintains strict privacy and security standards including PCI DSS compliance. For information on how they handle your payment data, please refer to their privacy policy available during checkout.`,
  },
  {
    id: 'data-sharing',
    title: '5. Data sharing & third parties',
    content: `We do not sell, rent, or share your personal or trading data with any third party for advertising or commercial purposes. The only third-party services that process your data are:

• Infrastructure partners — secure authentication (Firebase) and cloud storage (Firestore), which provide user-level data isolation.
• Payment partner — payment processing and subscription management for xaujournal Pro.
• Vercel — serverless function hosting for the Meta API sync and backend services.

Each of these services maintains its own privacy and security certifications (SOC 2, ISO 27001, PCI DSS). Links to their privacy policies are available on their respective websites.`,
  },
  {
    id: 'user-rights',
    title: '6. Your rights & data control',
    content: `You retain full ownership of your data. You can:

• Export — download a CSV of all trade records from the History page at any time.
• Delete entries — permanently remove individual trades from the History page.
• Reset account — use the "Reset Terminal" function in account settings to wipe all trade and journal data.
• Disconnect broker — revoke the Meta API broker connection at any time from account settings.
• Delete account — contact us at info@xaujournal.com to permanently delete your account. All associated data will be purged from our records within 30 days.

If you are located in the European Economic Area (EEA), you have additional rights under the GDPR including the right to access, rectify, port, and erase your data. Contact us to exercise any of these rights.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies & local storage',
    content: `xaujournal uses minimal browser storage:

• localStorage — stores your onboarding state, starting balance, theme preference, and optionally your remembered email address if the "Stay signed in" option is checked. This data never leaves your device.
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
    content: `For any privacy-related questions or requests:\n\nEmail: info@xaujournal.com\n\nWe aim to respond within two business days.`,
  },
];

export function PrivacyPolicyPage() {

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

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    let rafId;
    function raf(time) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);

    document.body.style.overflow = '';
    window.scrollTo(0, 0);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      document.body.style.overflow = '';
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };



  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased aurora-theme">
      <div className="grain-overlay" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute rounded-full w-[600px] h-[600px] left-[65%] top-[-15%] opacity-45 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 75%)' }} />
        <div className="absolute rounded-full w-[450px] h-[450px] left-[-5%] top-[40%] opacity-40 blur-[90px]" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 75%)' }} />
      </div>

      <PublicNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-32 pb-24 md:pt-40 md:pb-40">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
        >
          <Motion.span variants={itemVariants} className="inline-block text-primary text-xs font-bold tracking-[0.2em] uppercase mb-6 px-3 py-1 rounded-full bg-primary/10">
            Privacy Matters
          </Motion.span>
          <Motion.h1 variants={itemVariants} className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[1.1] tracking-tight mb-8">
            Privacy <span className="aurora-text">Policy</span>
          </Motion.h1>
          <Motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            We believe privacy policies should be readable. This one is. Your trust is our most valuable asset.
          </Motion.p>
          <Motion.p variants={itemVariants} className="text-sm text-muted-foreground/60 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Effective immediately
          </Motion.p>
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 sm:gap-12 lg:gap-24 items-start">
          <aside className="hidden lg:block sticky top-32">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-8">Table of Contents</h3>
            <nav className="flex flex-col gap-4" aria-label="Privacy policy sections">
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
                We only collect what's needed to run the app. Your trading data belongs to you. We don't sell it. Payments are handled securely. You can delete everything at any time.
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
      <PublicFooter />
    </div>
  );
}

