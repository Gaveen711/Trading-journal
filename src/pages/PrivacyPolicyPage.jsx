import { LegalPolicyPage } from './LegalPolicyPage';

const SEO = {
  title: 'Privacy Policy | XAU Journal — XAUUSD Gold Trading Journal',
  description:
    'Read the XAU Journal privacy policy. We only collect what is needed to run your XAUUSD trading journal. Your trade data belongs to you — we never sell it.',
  keywords:
    'xaujournal privacy policy, gold trading journal privacy, XAUUSD trade data security, forex journal app privacy, trading journal data protection, MetaTrader journal privacy, xau journal terms',
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
    content: `All data in transit is encrypted using modern TLS. Data at rest is stored in encrypted, isolated cloud databases protected by strict security protocols that enforce user-level isolation — no user can access another user's data, and neither can we in normal operation.

Your trade data is strictly scoped, meaning only a valid authentication token for your account grants read/write access. Broker credentials and broker-provider account tokens are not stored in our database.`,
  },
  {
    id: 'meta-api-sync',
    title: '3. Meta API & broker connection',
    content: `xaujournal supports automatic trade synchronisation via the Meta API — the industry-standard protocol used by MetaTrader 4 and MetaTrader 5 brokers. When you connect your broker account, you authorise xaujournal to read your trade history using a secure read-only API connection.

We store only the resulting trade fields: position ID, symbol, direction, lot size, open/close prices, open/close times, and broker-reported P&L. Our sync endpoint receives your broker login and password only during a sync request; it does not write them to our database, logs, or background jobs.

Your broker password never leaves the browser and device where you enter it, and it is held only in sessionStorage — cleared when you close the tab, and cleared again when you sign out. Only non-secret account details (server name, login number, display name) persist between sessions, so you may be asked for your password again when you return. For an explicit sync, the browser sends the credentials over HTTPS/TLS to a serverless route, which creates a temporary Meta API provider connection, retrieves trade history, and removes that provider connection in request cleanup. We do not retain credentials or provider access tokens, so unattended background sync is not performed.

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

• localStorage - stores your onboarding state, starting balance, theme preference, optionally your remembered email address, and non-secret broker account details (server name and login number) when you enable broker sync. No password is written to localStorage.
• sessionStorage - holds your broker password for the current browser tab only, so a sync can be performed without asking for it again. It is discarded when the tab closes and when you sign out, and it leaves the device only during an explicit sync request over HTTPS/TLS.
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
  return (
    <LegalPolicyPage
      seo={SEO}
      code="PRV"
      eyebrow="Policy register / data & account"
      title="Privacy"
      accent="Policy"
      lede="We believe privacy policies should be readable. This one is. Your trust is our most valuable asset."
      summary="We only collect what's needed to run the app. Your trading data belongs to you. We don't sell it. Payments are handled securely. You can delete everything at any time."
      sections={SECTIONS}
    />
  );
}
