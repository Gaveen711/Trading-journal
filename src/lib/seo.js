import { PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE } from './pricing';

export const SITE_URL = 'https://www.xaujournal.com';
export const SITE_NAME = 'xaujournal';
export const SITE_TAGLINE = 'XAU Journal — Gold (XAUUSD) Trading Journal';

export const DEFAULT_TITLE =
  'XAU Journal | Best Gold Trading Journal for XAUUSD — MT5 Auto Sync';

export const DEFAULT_DESCRIPTION =
  'xaujournal is the XAU journal built for gold traders. Auto-sync MT5 trades, track XAUUSD P&L, session analytics, trade calendar, and journaling — free to start.';

export const DEFAULT_KEYWORDS =
  'xau journal, XAU journal, gold trading journal, XAUUSD trading journal, XAU USD journal, MT5 trading journal, gold trader journal, XAUUSD analytics, MT5 EA sync, forex gold journal';

/** Per-route titles & descriptions (public marketing pages) */
export const ROUTE_SEO = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/pricing': {
    title: `Pricing — ${SITE_NAME} XAU Gold Trading Journal`,
    description:
      `Compare Free and Pro plans for the best XAUUSD trading journal. MT5 sync, analytics, and session intelligence from ${PRO_MONTHLY_PRICE}/month.`,
  },
  '/login': {
    title: `Sign In — ${SITE_NAME} XAU Trading Journal`,
    description:
      'Log in to your xaujournal account. Access your gold (XAUUSD) trade history, analytics, and MT5-synced journal.',
  },
  '/contact': {
    title: `Contact — ${SITE_NAME} Support`,
    description:
      'Contact the xaujournal team for help with your XAU gold trading journal, MT5 EA setup, or billing.',
  },
  '/privacy': {
    title: `Privacy Policy — ${SITE_NAME}`,
    description: 'How xaujournal collects, stores, and protects your XAUUSD trading journal data.',
  },
  '/terms-and-conditions': {
    title: `Terms of Service — ${SITE_NAME}`,
    description: 'Terms of use for the xaujournal XAU gold trading journal platform.',
  },
  '/refund-policy': {
    title: `Refund Policy — ${SITE_NAME}`,
    description: 'Refund and cancellation policy for xaujournal Pro subscriptions.',
  },
};

function setMeta(attr, key, value, isProperty = false) {
  const selector = isProperty ? `meta[property="${key}"]` : `meta[${attr}="${key}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (isProperty) el.setAttribute('property', key);
    else el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Update document head for the current public route */
export function applyPageSEO(pathname) {
  const base = pathname.split('?')[0];
  const config = ROUTE_SEO[base] || ROUTE_SEO['/'];
  const url = `${SITE_URL}${base === '/' ? '' : base}`;

  document.title = config.title;
  setMeta('name', 'description', config.description);
  setMeta('name', 'keywords', DEFAULT_KEYWORDS);
  setMeta('property', 'og:title', config.title, true);
  setMeta('property', 'og:description', config.description, true);
  setMeta('property', 'og:url', url, true);
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);
  setCanonical(url);
}

/** FAQ targets “xau journal” / gold journal search queries */
export const LANDING_FAQ = [
  {
    q: 'What is an XAU trading journal?',
    a: 'An XAU trading journal records every gold (XAUUSD) trade — entry, exit, lot size, P&L, session, and notes — so you can review performance and improve discipline. xaujournal is built only for gold traders, not generic forex pairs.',
  },
  {
    q: 'Is xaujournal the best gold trading journal for MT5?',
    a: 'xaujournal auto-syncs closed trades from MetaTrader 5 via our Expert Advisor, so you never re-type executions. You get XAUUSD-specific analytics, a P&L calendar, session breakdowns, and manual logging on the free plan.',
  },
  {
    q: 'How is xaujournal different from a Notion XAU journal template?',
    a: 'Notion templates are static. xaujournal is a live app with real-time MT5 sync, structured analytics, and secure cloud storage designed for active XAUUSD traders.',
  },
  {
    q: 'Do I need Pro to start journaling gold trades?',
    a: 'No. The free plan includes manual trade logging, calendar, and core P&L tracking. Pro adds unlimited trades, full analytics, MT5 EA sync, TradingView webhooks, and API access.',
  },
  {
    q: 'Does the journal work only for XAUUSD (gold)?',
    a: 'Yes. xaujournal is exclusively for gold spot (XAU/USD). P&L, pips, and analytics are calibrated for XAUUSD contract sizing.',
  },
];

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [],
  };
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['XAU Journal', 'XAU journal', 'xau journal'],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildSoftwareSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    alternateName: 'XAU Journal',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description:
      'Gold (XAUUSD) trading journal with automated MT5 sync, trade calendar, session analytics, and trade notes.',
    url: SITE_URL,
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
      {
        '@type': 'Offer',
        price: String(PRO_MONTHLY_PRICE),
        priceCurrency: 'USD',
        name: 'Pro Monthly',
      },
      {
        '@type': 'Offer',
        price: String(PRO_YEARLY_PRICE),
        priceCurrency: 'USD',
        name: 'Pro Yearly',
      },
    ],
    featureList: [
      'MT5 Expert Advisor auto-sync',
      'XAUUSD P&L and pip tracking',
      'Trade calendar heatmap',
      'Session analytics (London, New York, Tokyo)',
      'Trade journal notes',
    ],
  };
}

export function buildFAQSchema(faqItems) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** Inject or replace JSON-LD script tags by id */
export function injectJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}
