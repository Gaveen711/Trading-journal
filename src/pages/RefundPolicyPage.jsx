import { LegalPolicyPage } from './LegalPolicyPage';

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
  return (
    <LegalPolicyPage
      seo={SEO}
      code="RFD"
      eyebrow="Policy register / billing"
      title="Refund"
      accent="Policy"
      lede="We stand behind xaujournal with a 7-day money-back guarantee. If you're not satisfied, we'll make it right."
      summary="You get a full 7-day money-back guarantee on your first Pro subscription. After 7 days, renewals are non-refundable. Cancel anytime and keep access until your billing period ends. Payments and refunds are handled securely by our payment processor."
      guarantee="Not happy within 7 days of your first Pro payment? Email us for a full refund."
      sections={SECTIONS}
    />
  );
}
