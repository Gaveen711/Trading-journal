import { useState, useEffect, useMemo } from 'react';

import { FirebaseSubscriptionRepository } from '../data/repositories/FirebaseSubscriptionRepository';
import { useToast } from '../components/ToastContext';


export function useSubscription(user) {
  const [subscription, setSubscription] = useState({ 
    plan: 'free', 
    expiry: null, 
    isTrial: false,
    isLoading: true, 
    agreedToTerms: false 
  });
  const toast = useToast();

  const repository = useMemo(() => new FirebaseSubscriptionRepository(), []);

  useEffect(() => {
    if (!user) {
      setSubscription({ plan: 'free', expiry: null, isTrial: false, isLoading: false });
      return;
    }

    const unsub = repository.subscribeToUserDoc(user.uid, (docSnap) => {
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
    }, (error) => {
      console.error('[useSubscription] snap subscription error:', error);
    });

    return () => unsub();
  }, [user, repository, toast]);

  const startCheckout = async (_planType = 'pro_monthly') => {
    toast("Checkout is currently transitioning to PayPal. Please check back later!", "info");
  };

  const openPortal = () => {
    toast("Billing portal is currently unavailable during our payment gateway transition.", "info");
  };

  const recordProAcceptance = async () => {
    try {
      await repository.recordProAcceptance(user.uid);
      return true;
    } catch (error) {
      console.error("Legal Acceptance Error:", error);
      toast("Failed to record legal signature. Please try again.", "error");
      return false;
    }
  };

  const agreeToTerms = async () => {
    try {
      await repository.agreeToTerms(user.uid);
    } catch (error) {
      console.error("Agreement Error:", error);
      toast("Failed to process agreement. Please check your connection.", "error");
    }
  };
  
  return { ...subscription, startCheckout, openPortal, agreeToTerms, recordProAcceptance };
}

