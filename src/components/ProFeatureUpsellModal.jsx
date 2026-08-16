import { useState } from 'react';
import { CheckCircleFill } from 'react-bootstrap-icons';
import { ProTermsModal } from './ProTermsModal';
import { AppDialog } from './app/AppDialog';
import { Button } from './ui/button';
import { DialogClose } from './ui/dialog';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY, PRO_YEARLY_MONTHLY_DISPLAY, PRO_YEARLY_SAVINGS } from '../lib/pricing';

const FEATURE_COPY = {
  'broker-sync': {
    title: 'Broker sync is a Pro feature',
    description:
      'Upgrade to Pro to pull trades from your MT4/MT5 broker into your journal with one tap.',
    highlights: ['One-tap broker sync', 'MT4 & MT5 integration', 'Advanced analytics'],
  },
};

export function ProFeatureUpsellModal({
  feature = 'broker-sync',
  plan,
  onSubscribe,
  onClose,
  recordProAcceptance,
}) {
  const [showTerms, setShowTerms] = useState(false);
  const copy = FEATURE_COPY[feature] || FEATURE_COPY['broker-sync'];

  const handleAcceptTerms = async () => {
    const success = await recordProAcceptance();
    if (success) {
      setShowTerms(false);
      onSubscribe();
    }
  };

  return (
    <AppDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={copy.title}
      description={copy.description}
      size="md"
      footer={
        <>
          <DialogClose render={<Button variant="outline" />}>Maybe later</DialogClose>
          {plan === 'pro' ? (
            <Button disabled>Pro active</Button>
          ) : (
            <Button onClick={() => setShowTerms(true)}>Upgrade to Pro</Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-md bg-muted p-3">
          <span className="inline-flex h-[18px] w-fit items-center rounded-sm border border-foreground px-1.5 font-mono text-[11px] leading-none text-foreground">
            Pro
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="figure text-2xl font-medium text-foreground">{PRO_MONTHLY_DISPLAY}</span>
            <span className="font-mono text-[11px] text-muted-foreground">/ month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            or {PRO_YEARLY_DISPLAY}/year ({PRO_YEARLY_MONTHLY_DISPLAY}/mo) — save ${PRO_YEARLY_SAVINGS}
          </p>
          <p className="text-xs text-muted-foreground">Cancel anytime from billing.</p>
        </div>

        <ul className="flex flex-col gap-2">
          {copy.highlights.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircleFill className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {showTerms && (
        <ProTermsModal onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
      )}
    </AppDialog>
  );
}
