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
    isLoading: true, 
    agreedToTerms: false 
  });
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      setSubscription({ plan: 'free', expiry: null, isLoading: false });
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isPro = data.plan === 'pro';
        const expiryDate = data.planExpiry ? new Date(data.planExpiry) : null;
        const now = new Date();
        const GRACE_PERIOD_MS = 4 * 24 * 60 * 60 * 1000;

        if (isPro && expiryDate) {
          const cutoffDate = new Date(expiryDate.getTime() + GRACE_PERIOD_MS);
          
          if (now > cutoffDate) {
            if (data.plan !== 'free') {
              updateDoc(doc(db, "users", user.uid), { plan: 'free' });
            }
            setSubscription({ 
              plan: 'free', 
              expiry: data.planExpiry, 
              totalTrades: data.totalTradesLogged || 0,
              totalJournals: data.totalJournalsLogged || 0,
              agreedToTerms: data.agreedToTerms || false,
              isLoading: false 
            });
          } else {
            setSubscription({ 
              plan: 'pro', 
              expiry: data.planExpiry, 
              totalTrades: data.totalTradesLogged || 0,
              totalJournals: data.totalJournalsLogged || 0,
              agreedToTerms: data.agreedToTerms || false,
              isLoading: false,
              isGracePeriod: now > expiryDate 
            });
          }
        } else {
          setSubscription({ 
            plan: data.plan || 'free', 
            expiry: data.planExpiry || null, 
            totalTrades: data.totalTradesLogged || 0,
            totalJournals: data.totalJournalsLogged || 0,
            agreedToTerms: data.agreedToTerms || false,
            isLoading: false 
          });
        }
      } else {
        // Create profile if missing
        setDoc(doc(db, "users", user.uid), { plan: 'free', totalTradesLogged: 0, totalJournalsLogged: 0, agreedToTerms: false }, { merge: true });
        setSubscription({ plan: 'free', expiry: null, totalTrades: 0, totalJournals: 0, agreedToTerms: false, isLoading: false });
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
