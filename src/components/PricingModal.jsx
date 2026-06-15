import { useState } from 'react';
import { XLg, CheckCircleFill, CheckCircle } from 'react-bootstrap-icons';
import { ProTermsModal } from './ProTermsModal';
import { PRO_MONTHLY_DISPLAY, PRO_YEARLY_DISPLAY } from '../lib/pricing';

export function PricingModal({ plan, expiry, isTrial = false, onSubscribe, onClose, recordProAcceptance }) {
  const [showTerms, setShowTerms] = useState(false);
  const SUB_LIMITS = { freeTrades: 25, freeJournals: 10 };

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
                      className="pay-btn"
                      onClick={onSubscribe}
                    >
                      <span className="btn-text">Buy Now</span>
                      <div className="icon-container">
                        <svg viewBox="0 0 24 24" className="icon card-icon">
                          <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18C2,19.11 2.89,20 4,20H20C21.11,20 22,19.11 22,18V6C22,4.89 21.11,4 20,4Z" fill="currentColor" />
                        </svg>
                        <svg viewBox="0 0 24 24" className="icon payment-icon">
                          <path d="M2,17H22V21H2V17M6.25,7H9V6H6V3H18V6H15V7H17.75L19,17H5L6.25,7M9,10H15V8H9V10M9,13H15V11H9V13Z" fill="currentColor" />
                        </svg>
                        <svg viewBox="0 0 24 24" className="icon dollar-icon">
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor" />
                        </svg>
                        <svg viewBox="0 0 24 24" className="icon wallet-icon default-icon">
                          <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H22V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" fill="currentColor" />
                        </svg>
                        <svg viewBox="0 0 24 24" className="icon check-icon">
                          <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" fill="currentColor" />
                        </svg>
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

