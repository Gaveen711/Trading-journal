import { useState } from 'react';
import { CheckCircleFill, CheckCircle } from 'react-bootstrap-icons';
import { ProTermsModal } from './ProTermsModal';
import { AppDialog } from './app/AppDialog';
import { Button } from './ui/button';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY, PRO_YEARLY_MONTHLY_DISPLAY, PRO_YEARLY_SAVINGS } from '../lib/pricing';

export function PricingModal({ plan, expiry, onSubscribe, onClose, recordProAcceptance }) {
  const [showTerms, setShowTerms] = useState(false);

  const handleProClick = () => {
    setShowTerms(true);
  };

  const handleAcceptTerms = async () => {
    const success = await recordProAcceptance();
    if (success) {
      setShowTerms(false);
      onSubscribe();
    }
  };

  const FREE_FEATS = [
    'Unlimited manual trades',
    'Basic P&L tracking',
    'Trade calendar',
    'Manual journal notes',
    'No Meta API or MT4/MT5 sync',
  ];

  const PRO_FEATS = [
    'Unlimited manual and synced trades',
    'MT4/MT5 Meta API sync',
    'Full analytics suite',
    'Session intelligence',
    'TradingView webhook',
    'API key access',
    'Priority support',
    'Early access to new features',
  ];

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Upgrade to Pro"
      description="Free manual journaling stays unlimited. Pro adds sync, automation, and deeper analytics."
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Free plan */}
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-[18px] items-center rounded-sm border border-border px-1.5 font-mono text-[11px] leading-none text-muted-foreground">
                Free
              </span>
              {plan === 'free' && (
                <span className="font-mono text-[11px] text-muted-foreground">Current plan</span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="figure text-2xl font-medium text-foreground">$0</span>
              <span className="font-mono text-[11px] text-muted-foreground">/ forever</span>
            </div>
            <ul className="flex flex-1 flex-col gap-2">
              {FREE_FEATS.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" disabled className="w-full">
              {plan === 'free' ? 'Current plan' : 'Free plan'}
            </Button>
          </div>

          {/* Pro plan */}
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-[18px] items-center rounded-sm border border-foreground px-1.5 font-mono text-[11px] leading-none text-foreground">
                Pro
              </span>
              {plan === 'pro' && (
                <span className="font-mono text-[11px] text-muted-foreground">Current plan</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="figure text-2xl font-medium text-foreground">{PRO_MONTHLY_DISPLAY}</span>
                <span className="font-mono text-[11px] text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground">
                or {PRO_YEARLY_DISPLAY}/year ({PRO_YEARLY_MONTHLY_DISPLAY}/mo) — save ${PRO_YEARLY_SAVINGS}
              </p>
              <p className="text-xs text-muted-foreground">Cancel anytime from billing.</p>
            </div>
            <ul className="flex flex-1 flex-col gap-2">
              {PRO_FEATS.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-foreground">
                  <CheckCircleFill className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan === 'pro' ? (
              <div className="flex flex-col gap-1.5">
                <Button variant="outline" disabled className="w-full">
                  Pro active
                </Button>
                {expiry && (
                  <p className="text-center font-mono text-[11px] text-muted-foreground">
                    Renews {new Date(expiry).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <Button className="w-full" onClick={handleProClick}>
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Prices in USD · Cancel anytime · All data encrypted
        </p>
      </div>

      {showTerms && (
        <ProTermsModal onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
      )}
    </AppDialog>
  );
}
