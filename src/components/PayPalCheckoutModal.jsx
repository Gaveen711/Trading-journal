import { useEffect, useState, useRef } from 'react';
import { XLg, ShieldCheck, CreditCard, ArrowRight, Paypal } from 'react-bootstrap-icons';
import { auth } from '../firebase';

export function PayPalCheckoutModal({ isOpen, onClose, planType = 'pro_monthly', onPaymentSuccess }) {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paypalButtonContainerRef = useRef(null);

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!isOpen) return;

    if (!paypalClientId) {
      setLoading(false);
      return;
    }

    // Check if script is already loaded
    if (window.paypal) {
      setSdkLoaded(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => {
      setSdkLoaded(true);
      setLoading(false);
    };
    script.onerror = () => {
      setError('Failed to load PayPal Payment SDK. Please try again.');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Keep script loaded globally for caching/subsequent loads, but cleanup listeners if any
    };
  }, [isOpen, paypalClientId]);

  useEffect(() => {
    if (!sdkLoaded || !isOpen || !window.paypal || !paypalButtonContainerRef.current) return;

    // Clear container just in case
    paypalButtonContainerRef.current.innerHTML = '';

    window.paypal.Buttons({
      createSubscription: (data, actions) => {
        // You should configure your PayPal Plan ID corresponding to pro_monthly or pro_yearly
        const planId = planType === 'pro_yearly'
          ? (import.meta.env.VITE_PAYPAL_PLAN_ID_YEARLY || '')
          : (import.meta.env.VITE_PAYPAL_PLAN_ID_MONTHLY || '');

        return actions.subscription.create({
          plan_id: planId
        });
      },
      onApprove: async (data) => {
        setLoading(true);
        try {
          const user = auth.currentUser;
          if (!user) throw new Error('Authentication required');

          const idToken = await user.getIdToken();
          const response = await fetch('/api/paypal-success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              subscriptionId: data.subscriptionID,
              planType,
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Backend verification failed');
          }

          await response.json();
          onPaymentSuccess(data.subscriptionID, planType);
        } catch (err) {
          console.error('[PayPal approve error]', err);
          setError(err.message || 'Payment approval verification failed.');
          setLoading(false);
        }
      },
      onError: (err) => {
        console.error('[PayPal error]', err);
        setError('An error occurred during checkout. Please try again.');
      }
    }).render(paypalButtonContainerRef.current);
  }, [sdkLoaded, isOpen, planType, onPaymentSuccess]);

  const handleSimulatedUpgrade = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');

      const idToken = await user.getIdToken();
      const response = await fetch('/api/paypal-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          subscriptionId: `mock-sub-${Date.now()}`,
          planType,
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Simulated upgrade failed');
      }

      onPaymentSuccess(`mock-sub-${Date.now()}`, planType);
    } catch (err) {
      setError(err.message || 'Simulation failed');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/85 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md card-premium p-8 z-10 animate-in zoom-in-95 duration-300 shadow-2xl border-primary/20 bg-card">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-all active:scale-75 z-20">
          <XLg className="w-5 h-5" />
        </button>

        <header className="text-center space-y-3 mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Paypal className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-gradient uppercase tracking-wider">PayPal Checkout</h2>
          <p className="text-xs text-muted-foreground">
            Activate your {planType === 'pro_yearly' ? 'Yearly' : 'Monthly'} Pro membership securely.
          </p>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center mb-4">
            {error}
          </div>
        )}

        <div className="min-h-[120px] flex flex-col justify-center items-center relative">
          {loading && (
            <div className="absolute inset-0 bg-card/60 backdrop-blur-sm z-30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Processing...</span>
              </div>
            </div>
          )}

          {paypalClientId ? (
            <div className="w-full space-y-4">
              <div ref={paypalButtonContainerRef} className="w-full z-10 relative" />
              <p className="text-[9px] text-center text-muted-foreground/50 uppercase tracking-widest">
                Protected by PayPal End-To-End Vault Security
              </p>
            </div>
          ) : (
            <div className="w-full text-center space-y-6">
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-xs text-yellow-500/90 leading-relaxed">
                PayPal Client API keys are not yet configured in environment variables. You can simulate the transaction using the sandbox upgrade fallback below.
              </div>
              <button
                onClick={handleSimulatedUpgrade}
                className="btn-primary w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 group"
              >
                Simulate Successful Subscription <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-2 text-muted-foreground/60">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-wider">PCI-DSS Compliant Secure Payment</span>
        </div>
      </div>
    </div>
  );
}
