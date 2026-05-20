import { useEffect, useState } from 'react';
import { CheckCircleFill, ArrowRight, Receipt } from 'react-bootstrap-icons';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { auth } from '../firebase';

export function CheckoutSuccess() {
  const navigate = useNavigate();
  const { openPortal } = useOutletContext();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Finalizing your payment...');

  useEffect(() => {
    const token = searchParams.get('token');
    const planType = searchParams.get('planType') || 'pro_monthly';

    if (!token) {
      setStatus('done');
      setMessage('Your payment was successful. Your account has been upgraded to Pro.');
      return;
    }

    const captureOrder = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Please sign in again to complete checkout.');

        const idToken = await user.getIdToken();
        const resp = await fetch('/api/paypal-capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            orderId: token,
            planType,
            userId: user.uid,
          }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || 'Payment verification failed.');
        }

        setStatus('done');
        setMessage('Thank you! Your account has been upgraded to Pro.');
      } catch (error) {
        console.error('Checkout completion failed:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred while finalizing your payment.');
      }
    };

    captureOrder();
  }, [searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="card-premium max-w-md w-full p-10 text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl shadow-primary/20 border-primary/20">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center shadow-inner animate-in zoom-in-50 duration-700 delay-150">
            <CheckCircleFill className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gradient uppercase tracking-tight">Upgrade Successful</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {status === 'processing'
              ? 'Finalizing your payment. Please do not close this window.'
              : message}
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => navigate('/')}
            className="btn-primary w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
          >
            Return to Terminal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={openPortal}
            className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Receipt className="w-3.5 h-3.5" /> View Billing & Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

