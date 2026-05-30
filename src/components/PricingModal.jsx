import { useState } from 'react';
import { XLg, CheckCircleFill, CheckCircle } from 'react-bootstrap-icons';
import { ProTermsModal } from './ProTermsModal';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY } from '../lib/pricing';

export function PricingModal({ plan, expiry, isTrial = false, onSubscribe, onClose, recordProAcceptance }) {
  const [showTerms, setShowTerms] = useState(false);
  const SUB_LIMITS = { freeTrades: 50, freeJournals: 10 };

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
    `${SUB_LIMITS.freeTrades} trades / month`,
    'Basic P&L tracking',
    'Trade calendar',
    'Manual trade entry',
    'Email support',
  ];

  const PRO_FEATS = [
    'Unlimited trades',
    'Full analytics suite',
    'Session intelligence',
    'MT5 Expert Advisor sync',
    'TradingView webhook',
    'API key access',
    'Priority support',
    'Early access to new features',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl my-8 card-premium p-6 sm:p-10 z-10 animate-in zoom-in-95 duration-300 shadow-2xl shadow-primary/10 border-primary/10"
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-all active:scale-75 z-20">
          <XLg className="w-5 h-5" />
        </button>

        <header className="text-center space-y-2 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gradient">Upgrade to Pro</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-4">
            Unlock unlimited trades, the full analytics suite, and automated MT5 sync.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {/* Free */}
          <div className={`p-6 sm:p-7 rounded-2xl border border-border/50 bg-muted/20 space-y-5 flex flex-col ${plan === 'free' ? 'ring-2 ring-border/50' : ''}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-1">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">$0</span>
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">/ forever</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1">
              {FREE_FEATS.map(f => (
                <li key={f} className="text-xs flex items-center gap-3 text-muted-foreground/80 font-medium">
                  <CheckCircle className="text-primary/40 w-4 h-4 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default border border-border/30 text-muted-foreground/50">
              {plan === 'free' ? 'Current Plan' : 'Free Plan'}
            </button>
          </div>

          {/* Pro */}
          <div className="p-6 sm:p-7 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background relative space-y-5 flex flex-col shadow-xl shadow-primary/5 hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-[0.15em] shadow-lg">
              Most popular
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary mb-1">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">{PRO_MONTHLY_DISPLAY}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">/ month</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">7-day free trial, then {PRO_MONTHLY_DISPLAY}/mo (or {PRO_YEARLY_DISPLAY}/yr)</p>
            </div>
            <ul className="space-y-3 flex-1">
              {PRO_FEATS.map(f => (
                <li key={f} className="text-xs flex items-center gap-3 font-bold text-foreground/90">
                  <CheckCircleFill className="text-primary w-4 h-4 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            {plan === 'pro' ? (
              <div className="space-y-2">
                <button disabled className="w-full py-3.5 rounded-xl bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                  {isTrial ? 'Pro Active (Trial)' : 'Pro Active'}
                </button>
                {expiry && (
                  <p className="text-[9px] text-center text-primary/60 font-black uppercase tracking-widest">
                    {isTrial ? `Trial Expires: ${new Date(expiry).toLocaleDateString()}` : `Renews: ${new Date(expiry).toLocaleDateString()}`}
                  </p>
                )}
                {isTrial && (
                  <div className="flex flex-col items-center gap-3 pt-3 border-t border-primary/10 mt-2">
                    <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">
                      Skip the wait — subscribe now
                    </p>
                    <button
                      data-tooltip="$14.99 / mo"
                      className="btn-buy-now"
                      onClick={onSubscribe}
                      style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }}
                    >
                      <div className="btn-buy-now-wrapper">
                        <div className="btn-buy-now-text">Buy Now</div>
                        <span className="btn-buy-now-icon">
                          <svg viewBox="0 0 16 16" fill="currentColor" height={18} width={18} xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleProClick}
                className="btn-primary w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 active:scale-95 transition-all"
              >
                Start 7-Day Free Trial
              </button>
            )}
          </div>
        </div>

        <p className="text-[9px] text-center text-muted-foreground/40 mt-8 uppercase tracking-widest font-black">
          Prices in USD · Cancel anytime · All data encrypted
        </p>
      </div>

      {showTerms && (
        <ProTermsModal 
          onAccept={handleAcceptTerms} 
          onClose={() => setShowTerms(false)} 
        />
      )}
    </div>
  );
}

