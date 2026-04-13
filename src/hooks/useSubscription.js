import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

import { db } from '../firebase';
import { useToast } from '../components/ToastContext';

export function useSubscription(user) {
  const [subscription, setSubscription] = useState({ plan: 'free', expiry: null, isLoading: true });
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      setSubscription({ plan: 'free', expiry: null, isLoading: false });
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        const expiryDate = data.planExpiry ? new Date(data.planExpiry) : null;

        // Configuration for Grace Period (4 days in milliseconds)
        const GRACE_PERIOD_MS = 4 * 24 * 60 * 60 * 1000;

        if (data.plan === 'pro' && expiryDate) {
          const cutoffDate = new Date(expiryDate.getTime() + GRACE_PERIOD_MS);

          if (now > cutoffDate) {
            // 1. HARD EXPIRE: Current time is beyond Expiry + 4 Days
            updateDoc(doc(db, "users", user.uid), { plan: 'free' });
            toast("Your Pro subscription and grace period have expired. Reverting to Free plan.", "warn");
            setSubscription({ plan: 'free', expiry: data.planExpiry, isLoading: false });
          } else if (now > expiryDate) {
            // 2. SOFT EXPIRE: Plan is technically over, but within the 4-day grace period
            // We keep the plan as 'pro' so they can still log their XAU trades
            setSubscription({ 
              plan: 'pro', 
              expiry: data.planExpiry, 
              isLoading: false,
              isGracePeriod: true 
            });
          } else {
            // 3. ACTIVE: Plan is still valid
            setSubscription({ 
              plan: 'pro', 
              expiry: data.planExpiry, 
              isLoading: false 
            });
          }
        } else {
          // Fallback for Free users
          setSubscription({ 
            plan: data.plan || 'free', 
            expiry: data.planExpiry || null, 
            isLoading: false 
          });
        }
      } else {
        // Create profile if missing
        setDoc(doc(db, "users", user.uid), { plan: 'free' }, { merge: true });
        setSubscription({ plan: 'free', expiry: null, isLoading: false });
      }
    });

    return () => unsub();
  }, [user, toast]);

  const startCheckout = async () => {
    try {
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          origin: window.location.origin,
          email: user.email,
          userId: user.uid
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
      toast("Could not initiate checkout. Check your Vercel logs.", "error");
    }
  };

  const openPortal = async () => {
    try {
      const resp = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid,
          origin: window.location.origin
        })
      });
      
      const contentType = resp.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await resp.text();
        console.error("API Error (Not JSON):", text);
        throw new Error(resp.status === 404 ? "Portal API not found. If testing locally, use 'vercel dev'." : "Server returned an invalid response.");
      }

      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create portal session');
      }
    } catch (error) {
      console.error("Portal Error:", error);
      toast(error.message || "Could not open management portal.", "error");
    }
  };

  return { ...subscription, startCheckout, openPortal };
}