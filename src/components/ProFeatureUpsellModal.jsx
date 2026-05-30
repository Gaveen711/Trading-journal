import { useState } from 'react';
import { XLg, ArrowClockwise, CheckCircleFill } from 'react-bootstrap-icons';
import { ProTermsModal } from './ProTermsModal';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY } from '../lib/pricing';

const FEATURE_COPY = {
  'broker-sync': {
    title: 'Broker sync is a Pro feature',
    description:
      'Upgrade to Pro to pull trades from your MT5 broker into your journal with one tap.',
    highlights: ['One-tap broker sync', 'MT4 & MT5 integration', 'Unlimited trades'],
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
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-start sm:items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-background/85 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      <div
        className="relative w-full max-w-md my-8 card-premium p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-300 shadow-2xl shadow-primary/15 border-primary/20"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-all active:scale-75"
          aria-label="Close"
        >
          <XLg className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
            <ArrowClockwise className="w-7 h-7 text-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Pro required</p>
            <h2 className="text-xl sm:text-2xl font-black text-gradient leading-tight">{copy.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {copy.description}
            </p>
          </div>

          <div className="w-full rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background p-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Pro plan</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-primary">{PRO_MONTHLY_DISPLAY}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">/ month</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              or <span className="text-foreground font-bold">{PRO_YEARLY_DISPLAY}/year</span>
              {' '}
              <span className="text-primary font-black">save over 40%</span>
            </p>
          </div>

          <ul className="w-full space-y-2 text-left">
            {copy.highlights.map((item) => (
              <li key={item} className="text-xs flex items-center gap-2.5 font-medium text-foreground/90">
                <CheckCircleFill className="text-primary w-4 h-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {plan === 'pro' ? (
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-xl bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20"
            >
              Pro active
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="btn-primary w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Upgrade to Pro
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>

      {showTerms && (
        <ProTermsModal onAccept={handleAcceptTerms} onClose={() => setShowTerms(false)} />
      )}
    </div>
  );
}
