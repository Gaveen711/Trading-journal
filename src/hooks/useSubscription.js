import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { initializePaddle } from '@paddle/paddle-js';

import { db } from '../firebase';
import { useToast } from '../components/ToastContext';

let paddleInstance = null;
export async function getPaddle() {
  if (!paddleInstance) {
    paddleInstance = await initializePaddle({
      environment: import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox',
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || ''
    });
  }
  return paddleInstance;
}


export function useSubscription(user) {
  const [subscription, setSubscription] = useState({ 
    plan: 'free', 
    expiry: null, 
    isTrial: false,
    isLoading: true, 
    agreedToTerms: false 
  });
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      setSubscription({ plan: 'free', expiry: null, isTrial: false, isLoading: false });
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isPro = data.plan === 'pro';
        const expiryDate = data.planExpiry ? new Date(data.planExpiry) : null;
        const now = new Date();
        const GRACE_PERIOD_MS = 4 * 24 * 60 * 60 * 1000;
        const graceMs = data.isTrial ? 0 : GRACE_PERIOD_MS;

        if (isPro && expiryDate) {
          const cutoffDate = new Date(expiryDate.getTime() + graceMs);
          
          if (now > cutoffDate) {
            if (data.plan !== 'free') {
              updateDoc(doc(db, "users", user.uid), { plan: 'free' });
            }
            setSubscription({ 
              plan: 'free', 
              expiry: data.planExpiry, 
              isTrial: false,
              isTrialExpired: data.isTrial || false,
              totalTrades: data.totalTradesLogged || 0,
              totalJournals: data.totalJournalsLogged || 0,
              agreedToTerms: data.agreedToTerms || false,
              isLoading: false 
            });
          } else {
            setSubscription({ 
              plan: 'pro', 
              expiry: data.planExpiry, 
              isTrial: data.isTrial || false,
              isTrialExpired: false,
              totalTrades: data.totalTradesLogged || 0,
              totalJournals: data.totalJournalsLogged || 0,
              agreedToTerms: data.agreedToTerms || false,
              isLoading: false,
              isGracePeriod: now > expiryDate 
            });
          }
        } else {
          const isTrialExpired = data.isTrial && expiryDate && now > expiryDate;
          setSubscription({ 
            plan: data.plan || 'free', 
            expiry: data.planExpiry || null, 
            isTrial: data.isTrial || false,
            isTrialExpired: isTrialExpired || false,
            totalTrades: data.totalTradesLogged || 0,
            totalJournals: data.totalJournalsLogged || 0,
            agreedToTerms: data.agreedToTerms || false,
            isLoading: false 
          });
        }
      } else {
        // VULN-02: Do not write subscription fields client-side.
        // Retrieve the token and trigger server-side user initialization.
        user.getIdToken().then((token) => {
          fetch('/api/init-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }).catch((err) => {
            console.error('[useSubscription] server-side init failed:', err);
          });
        });

        setSubscription({ 
          plan: 'free', 
          expiry: null, 
          isTrial: false, 
          isTrialExpired: false, 
          totalTrades: 0, 
          totalJournals: 0, 
          agreedToTerms: false, 
          isLoading: true 
        });
      }
    });

    return () => unsub();
  }, [user, toast]);

  const startCheckout = async (planType = 'pro_monthly') => {
    try {
      const paddle = await getPaddle();
      if (!paddle) throw new Error("Paddle could not be initialized.");

      const priceId = planType === 'pro_yearly'
        ? import.meta.env.VITE_PADDLE_YEARLY_PRICE_ID
        : import.meta.env.VITE_PADDLE_MONTHLY_PRICE_ID;

      if (!priceId) {
        throw new Error("Payment price configuration is missing.");
      }

      paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1
          }
        ],
        customer: {
          email: user.email
        },
        customData: {
          userId: user.uid,
          planType: planType
        },
        settings: {
          successUrl: `${window.location.origin}/app/checkout-success?planType=${planType}`
        }
      });
    } catch (error) {
      console.error("Checkout Error:", error);
      toast(error.message || "Could not initiate secure checkout. Please try again.", "error");
    }
  };

  const openPortal = () => {
    toast("Billing portal is currently unavailable during our payment gateway transition.", "info");
  };

  const recordProAcceptance = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), { 
        proLegalAccepted: true,
        proLegalAcceptedAt: new Date().toISOString(),
        proLegalVersion: "1.0.4",
        refundPolicyAcknowledged: true
      });
      return true;
    } catch (error) {
      console.error("Legal Acceptance Error:", error);
      toast("Failed to record legal signature. Please try again.", "error");
      return false;
    }
  };

  const agreeToTerms = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), { 
        agreedToTerms: true,
        agreedAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error("Agreement Error:", error);
      toast("Failed to process agreement. Please check your connection.", "error");
    }
  };
  
  return { ...subscription, startCheckout, openPortal, agreeToTerms, recordProAcceptance };
}
