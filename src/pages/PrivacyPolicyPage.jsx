import { useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const GOLD = '#C9A84C';
const GOLD_DIM = 'rgba(201,168,76,0.12)';
const GOLD_LINE = 'rgba(201,168,76,0.28)';

function useNavScroll(ref) {
  useEffect(() => {
    const nav = ref.current; if (!nav) return;
    const fn = () => { nav.style.background = window.scrollY > 20 ? 'rgba(3,3,10,0.84)' : 'transparent'; nav.style.backdropFilter = window.scrollY > 20 ? 'blur(24px)' : 'none'; nav.style.borderBottomColor = window.scrollY > 20 ? 'rgba(255,255,255,0.06)' : 'transparent'; };
    window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn);
  }, [ref]);
}

const SECTIONS = [
  {
    id: 'data-collection',
    title: '1. What data we collect',
    content: `We collect only what is necessary to operate Gold Journal:

• Account data — your email address, display name, and authentication provider (email/password or Google OAuth) via Firebase Authentication.

• Trade data — entry/exit prices, lot size, direction, duration, P&L, and any notes you attach. This is sent by you manually or by the MT5 Expert Advisor under your explicit control.

• Usage telemetry — basic interaction signals (feature usage frequency, session counts) used solely to enforce plan limits and improve the product. We never track keystrokes or screen content.

• Billing data — your subscription status and Stripe customer ID. We do not store or process card numbers; all payment data is handled by Stripe.`,
  },
  {
    id: 'data-security',
    title: '2. How we protect your data',
    content: `All data in transit is encrypted via TLS 1.3. Data at rest is stored in Google Firebase (Firestore), protected by Firestore Security Rules that enforce strict user-level isolation — no user can access another user's data, and neither can we in normal operation.

Your trade data is scoped under the path users/{uid}/trades, meaning only a valid Firebase Auth token for your account grants read/write access. API keys for MT5 sync are stored in a separate Firestore collection, hashed, and can be rotated or revoked at any time from your account settings.`,
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
    content: `All financial transactions are processed by Stripe. Gold Journal does not store credit card numbers, CVVs, or bank details on our servers. When you upgrade to Pro, we create a Stripe Customer and Subscription linked to your Firebase UID.

Subscription status (active, cancelled, past due) is synced from Stripe webhooks to Firestore and used to gate Pro features. You can manage or cancel your subscription at any time via the billing portal accessible from your account settings.`,
  },
  {
    id: 'data-sharing',
    title: '5. Data sharing & third parties',
    content: `We do not sell, rent, or share your personal or trading data with any third party for advertising or commercial purposes. The only third-party services that process your data are:

• Google Firebase — authentication and database storage.
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
• Delete account — contact us at support@xaujournal.com to permanently delete your account. All associated data will be purged from Firestore within 30 days.

If you are located in the European Economic Area (EEA), you have additional rights under the GDPR including the right to access, rectify, port, and erase your data. Contact us to exercise any of these rights.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies & local storage',
    content: `Gold Journal uses minimal browser storage:

• localStorage — stores your onboarding state, starting balance, and theme preference. This data never leaves your device.
• Firebase Auth SDK — stores an authentication token in IndexedDB to keep you logged in between sessions. This is essential for the app to function.

We do not use advertising cookies, tracking pixels, or third-party analytics scripts.`,
  },
  {
    id: 'changes',
    title: '8. Changes to this policy',
    content: `We may update this policy as the product evolves. Material changes will be communicated via the in-app notification system and by email to your registered address at least 14 days before they take effect. Continued use of Gold Journal after that date constitutes acceptance of the revised policy.`,
  },
  {
    id: 'contact',
    title: '9. Contact',
    content: `For any privacy-related questions or requests:\n\nEmail: support@xaujournal.com\n\nWe aim to respond within two business days.`,
  },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const navRef = useRef(null);
  useNavScroll(navRef);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <header>
        <nav ref={navRef} role="navigation" aria-label="Main navigation" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'transparent', borderBottom: '1px solid transparent', transition: 'background 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.4s' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--foreground))' }}>
            <span style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg,${GOLD},#7B5A1A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, color: '#000' }}>XAU</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Gold Journal</span>
          </Link>
          <ul className="hidden md:flex" style={{ alignItems: 'center', gap: '0.125rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {[{ to: '/', l: 'Home' }, { to: '/pricing', l: 'Pricing' }, { to: '/contact', l: 'Contact' }].map(({ to, l }) => (
              <li key={to}><NavLink to={to} style={{ textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500, padding: '0.375rem 0.875rem', borderRadius: 6, color: 'hsl(var(--muted-foreground))', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseOut={e => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>{l}</NavLink></li>
            ))}
          </ul>
          <button onClick={() => navigate('/login')} style={{ background: GOLD, color: '#000', border: 'none', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.03em', padding: '0.5rem 1.25rem', borderRadius: 7, cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 20px ${GOLD_LINE}`; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>Get started free</button>
        </nav>
      </header>

      <main style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '9rem 2rem 5rem', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1.25rem' }}>Legal</p>
          <h1 style={{ fontSize: 'clamp(2.25rem,5vw,3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.06, margin: '0 0 1.25rem' }}>Privacy Policy</h1>
          <p style={{ fontSize: '1rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.75, fontWeight: 400, margin: '0 0 0.5rem' }}>
            We believe privacy policies should be readable. This one is.
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>Effective date: April 15, 2026 · Last updated: April 15, 2026</p>
        </div>

        {/* Two-column layout: TOC + content */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 10rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '5rem', alignItems: 'start' }}>

          {/* Table of contents — sticky sidebar */}
          <nav aria-label="Table of contents" className="hidden lg:block" style={{ position: 'sticky', top: '5.5rem', paddingTop: '0.25rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, marginBottom: '1rem' }}>Contents</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} style={{ textDecoration: 'none', fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', display: 'block', padding: '0.25rem 0', transition: 'color 0.2s', lineHeight: 1.5 }}
                    onMouseOver={e => e.currentTarget.style.color = GOLD}
                    onMouseOut={e => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>{s.title.replace(/^\d+\.\s/, '')}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Policy content */}
          <article>
            <div style={{ padding: '1.5rem', borderRadius: 10, border: `1px solid ${GOLD_LINE}`, background: GOLD_DIM, marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, fontWeight: 400, color: 'hsl(var(--foreground))', margin: 0 }}>
                <strong>Summary:</strong> We only collect what's needed to run the app. Your trading data belongs to you. We don't sell it. You can delete everything at any time.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
              {SECTIONS.map(s => (
                <section key={s.id} id={s.id} style={{ scrollMarginTop: '5.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 3, height: 24, background: GOLD, borderRadius: 2, flexShrink: 0 }} />
                    <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{s.title}</h2>
                  </div>
                  <div style={{ paddingLeft: '1.75rem' }}>
                    {s.content.split('\n\n').map((block, i) => (
                      <p key={i} style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.85, fontWeight: 400, margin: '0 0 1rem', whiteSpace: 'pre-line' }}>{block}</p>
                    ))}
                  </div>
                  <div style={{ marginTop: '2rem', height: 1, background: 'hsl(var(--border))' }} />
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid hsl(var(--border))', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--foreground))' }}>
            <span style={{ width: 24, height: 24, borderRadius: 5, background: `linear-gradient(135deg,${GOLD},#7B5A1A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 900, color: '#000' }}>XAU</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Gold Journal</span>
          </Link>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {[{ to: '/', l: 'Home' }, { to: '/pricing', l: 'Pricing' }, { to: '/contact', l: 'Contact' }].map(({ to, l }) => (
              <li key={to}><NavLink to={to} style={{ textDecoration: 'none', fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseOut={e => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>{l}</NavLink></li>
            ))}
          </ul>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>© {new Date().getFullYear()} XAU Journal</p>
        </div>
      </footer>
    </div>
  );
}