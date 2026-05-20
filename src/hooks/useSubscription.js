import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

import { db } from '../firebase';
import { useToast } from '../components/ToastContext';

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

  const startCheckout = async () => {
    try {
      const token = await user.getIdToken();
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          origin: window.location.origin,
          email: user.email,
          userId: user.uid,
          planType: 'pro_monthly' // Defaulting to pro_monthly for now
        })
      });
      
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast("Could not initiate secure checkout. Please try again.", "error");
    }
  };

  const openPortal = () => {
    const portalUrl = import.meta.env.MODE === 'production'
      ? 'https://www.paypal.com/myaccount/autopay/'
      : 'https://www.sandbox.paypal.com/myaccount/autopay/';
    window.open(portalUrl, '_blank');
    toast("Open PayPal autopay settings to manage billing.", "info");
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