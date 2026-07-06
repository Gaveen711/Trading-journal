import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Lenis from 'lenis';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  NotebookPen,
  PlugZap,
  ShieldCheck,
  X,
} from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { auth } from '../firebase';
import { useSubscription } from '../hooks/useSubscription';
import { ProTermsModal } from '../components/ProTermsModal';
import { PRO_MONTHLY_DISPLAY } from '../lib/pricing';

const ALL_PRODUCT_FEATURES = [
  { label: 'Unlimited manual trades', free: true, pro: true },
  { label: 'Manual trade entry', free: true, pro: true },
  { label: 'Calendar and core P&L', free: true, pro: true },
  { label: 'Journal notes & context', free: true, pro: true },
  { label: 'MT4/MT5 auto import (Meta API sync)', free: false, pro: true },
  { label: 'Full analytics suite', free: false, pro: true },
  { label: 'Unlimited trade history', free: false, pro: true },
  { label: 'Deeper trade context (mood, tags, quality)', free: false, pro: true },
  { label: 'TradingView webhooks & API access', free: false, pro: true },
  { label: 'Private cloud workspace', free: false, pro: true },
  { label: 'Priority product access & support', free: false, pro: true },
];

const COMPARISON_ROWS = [
  ['Trades', 'Unlimited manual trades', 'Unlimited manual + synced trades'],
  ['Logging', 'Manual only', 'Manual + MT4/MT5 sync'],
  ['Broker sync', 'Not included', 'Meta API sync included'],
  ['Analytics', 'Basic P&L and calendar', 'Full reports and session intelligence'],
  ['Trade context', 'Notes', 'Notes, tags, screenshots, psychology, setup review'],
  ['Support', 'Standard', 'Priority'],
];

const FAQ = [
  {
    q: 'What is included in the Free plan?',
    a: 'Free includes unlimited manual trade logging, core P&L tracking, calendar review, and journal notes. Pro is for traders who want automation and deeper analytics.',
  },
  {
    q: 'Does Free include Meta API, MT4, or MT5 sync?',
    a: 'No. Free users log trades manually. Broker sync, Meta API import, and MT4/MT5 automation are Pro features.',
  },
  {
    q: 'What does Pro unlock?',
    a: 'Pro gives you synced trade history, MT4/MT5 Meta API sync, full analytics, deeper trade context, priority support, and early product access.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel from the billing portal. Your Pro access remains available until the end of the paid billing period.',
  },
  {
    q: 'Is my trading data private?',
    a: 'Yes. Your journal is account-scoped and designed around private trade review. Broker sync is only available after you explicitly connect an account.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'Checkout is handled through Lemon Squeezy and supports major credit and debit cards.',
  },
];

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function PricingPage() {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const user = auth.currentUser;
  const { startCheckout, recordProAcceptance } = useSubscription(user);

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

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    let rafId = 0;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);
    document.body.style.overflow = '';
    window.scrollTo(0, 0);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 font-sans antialiased aurora-theme public-aurora-page">
      <div className="grain-overlay" aria-hidden="true" />
      <PublicNavbar />

      <main className="relative z-10 px-5 sm:px-6 pt-32 pb-24 md:pt-40 md:pb-36 max-w-7xl mx-auto">
        <Motion.section
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          <Motion.p variants={itemVariants} className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-primary">
            XAU Journal Pricing
          </Motion.p>
          <Motion.h1 variants={itemVariants} className="text-[clamp(2.7rem,7vw,6.4rem)] font-black leading-[0.98] tracking-tight text-balance">
            One upgrade for traders ready to <span className="aurora-text">review seriously.</span>
          </Motion.h1>
          <Motion.p variants={itemVariants} className="mx-auto mt-7 max-w-2xl text-base md:text-lg text-muted-foreground font-semibold leading-relaxed">
            Start free with unlimited manual journaling. Upgrade when you want MT4/MT5 sync, deeper analytics, and a faster XAUUSD review workflow.
          </Motion.p>
        </Motion.section>

        <section className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-6 md:gap-8 max-w-6xl mx-auto" aria-label="Pricing plans">
          <PlanCard
            title="Free"
            label="Manual journal"
            price="$0"
            period="/mo"
            description="For traders who want unlimited manual journaling before connecting automation."
            cta="Get started free"
            onClick={() => navigate('/login')}
          >
            <FeatureList plan="free" />
          </PlanCard>

          <PlanCard
            featured
            title="Pro"
            label="Complete trading review"
            price={PRO_MONTHLY_DISPLAY}
            period="/mo"
            description="For active XAUUSD traders who want sync, structure, and enough data to actually improve execution."
            cta="Upgrade to Pro"
            onClick={handleUpgradeClick}
          >
            <FeatureList plan="pro" />
          </PlanCard>
        </section>

        <section className="mt-20 md:mt-28 max-w-6xl mx-auto" aria-labelledby="pro-includes-heading">
          <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-8 lg:gap-12 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary mb-4">What Pro gives you</p>
              <h2 id="pro-includes-heading" className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-balance">
                Built for the trader who needs more than a <span className="aurora-text">spreadsheet.</span>
              </h2>
              <p className="mt-5 text-muted-foreground font-semibold leading-relaxed max-w-xl">
                Pro is positioned around the features that change review quality: automatic imports, unlimited sample size, clean analytics, and context around every trade.
              </p>
            </div>

            <ul className="border-y border-border divide-y divide-border">
              {[
                {
                  label: 'MT4/MT5 auto import (Meta API sync)',
                  detail: 'Connect supported MetaTrader accounts and import closed trades automatically.',
                },
                {
                  label: 'Full analytics suite & reports',
                  detail: 'Review win rate, profit factor, drawdown, sessions, setups, and performance trends.',
                },
                {
                  label: 'Unlimited synced trade history',
                  detail: 'Keep logging as your sample size grows instead of cutting review short at the limit.',
                },
                {
                  label: 'Deeper trade context (mood, tags, quality)',
                  detail: 'Use notes, screenshots, tags, setup quality, mood, and post-trade reflection together.',
                },
                {
                  label: 'Private secure cloud database',
                  detail: 'Keep sensitive trade history in a focused account built around your review workflow.',
                },
                {
                  label: 'Priority product support & updates',
                  detail: 'Get priority support and early access to improvements built for serious XAUUSD traders.',
                },
              ].map((feature) => (
                <Motion.li
                  key={feature.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-4 py-5"
                >
                  <span className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  <span>
                    <h3 className="text-base font-black tracking-tight">{feature.label}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed font-medium">{feature.detail}</p>
                  </span>
                </Motion.li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 md:mt-28 max-w-6xl mx-auto" aria-labelledby="compare-heading">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary mb-4">Compare</p>
            <h2 id="compare-heading" className="text-3xl md:text-5xl font-black tracking-tight">Free vs <span className="aurora-text">Pro</span></h2>
            <p className="mt-4 text-muted-foreground font-semibold leading-relaxed">
              Free keeps manual journaling open. Pro removes the admin work when review becomes part of your trading process.
            </p>
          </div>

          <div className="border-y border-border">
            <div className="grid grid-cols-[1fr] sm:grid-cols-[0.9fr_1fr_1fr] py-4 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
              <div className="px-1 py-1">Feature</div>
              <div className="px-1 py-1">Free</div>
              <div className="px-1 py-1 text-primary">Pro</div>
            </div>
            <ul className="divide-y divide-border">
              {COMPARISON_ROWS.map(([feature, free, pro]) => (
                <li key={feature} className="grid grid-cols-1 sm:grid-cols-[0.9fr_1fr_1fr] gap-2 sm:gap-0 py-4 text-sm md:text-base">
                  <div className="px-1 font-black">{feature}</div>
                  <div className="px-1 text-muted-foreground font-semibold">{free}</div>
                  <div className="px-1 font-bold text-foreground">{pro}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 md:mt-28 max-w-3xl mx-auto" aria-labelledby="faq-heading">
          <Motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="mx-auto mb-5 h-11 w-11 rounded-2xl border border-border bg-card flex items-center justify-center text-primary">
              <CircleHelp size={21} />
            </div>
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-black tracking-tight">Common <span className="aurora-text">questions</span></h2>
            <p className="mt-3 text-muted-foreground font-semibold">Clear answers before you upgrade.</p>
          </Motion.div>

          <FAQAccordion />
        </section>
      </main>

      <PublicFooter />


      {showTerms && (
        <ProTermsModal
          onAccept={handleAcceptTerms}
          onClose={() => setShowTerms(false)}
        />
      )}
    </div>
  );
}

function PlanCard({ title, label, price, period, description, cta, onClick, featured = false, children }) {
  return (
    <Motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative flex flex-col rounded-3xl border border-border bg-card/30 backdrop-blur-md p-6 sm:p-8 md:p-10 shadow-lg transition-all duration-300 ${
        featured 
          ? 'border-primary/40 bg-gradient-to-b from-card/60 via-card/40 to-primary/5 shadow-primary/5 shadow-xl' 
          : ''
      }`}
      data-ux-card="true"
    >
      {featured ? (
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
          Best for active traders
        </p>
      ) : null}

      <div className="mb-8 max-w-lg">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
        <div className="mt-7 flex items-end gap-2">
          <span className={`text-[clamp(3.4rem,8vw,5.6rem)] font-black leading-none tracking-tight ${featured ? 'text-primary' : 'text-foreground'}`}>
            {price}
          </span>
          <span className="pb-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{period}</span>
        </div>
        <p className="mt-5 text-sm md:text-base text-muted-foreground font-semibold leading-relaxed">{description}</p>
      </div>

      <div className="flex-1">{children}</div>

      <button
        type="button"
        onClick={onClick}
        className={`mt-9 min-h-12 w-full rounded-2xl px-5 text-sm font-black transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background flex items-center justify-center gap-2 ${featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border bg-background hover:border-primary/40 hover:text-primary'}`}
      >
        {cta}
        {featured ? <ArrowRight size={17} /> : null}
      </button>
    </Motion.article>
  );
}

function FeatureList({ plan }) {
  return (
    <ul className="space-y-4">
      {ALL_PRODUCT_FEATURES.map((item) => {
        const isIncluded = plan === 'pro' ? item.pro : item.free;
        return (
          <li key={item.label} className={`flex items-center gap-3 transition-opacity duration-200 ${isIncluded ? '' : 'opacity-45'}`}>
            <span className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
              isIncluded 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-muted/80 text-muted-foreground/60 border border-border/40'
            }`}>
              {isIncluded ? (
                <Check size={12} strokeWidth={4} />
              ) : (
                <X size={11} strokeWidth={3.5} />
              )}
            </span>
            <span className={`text-sm tracking-tight ${isIncluded ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
              {item.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-border border-y border-border">
      {FAQ.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `pricing-faq-${index}`;

        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full min-h-[64px] py-4 text-left flex items-center justify-between gap-5 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="text-base md:text-lg font-black tracking-tight">{item.q}</span>
              <ChevronDown
                size={19}
                className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <Motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 md:pb-6 text-sm md:text-base text-muted-foreground leading-relaxed font-semibold">
                    {item.a}
                  </p>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
