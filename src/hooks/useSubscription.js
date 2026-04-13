import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
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

        // Auto-revert if expired
        if (data.plan === 'pro' && expiryDate && now > expiryDate) {
          updateDoc(doc(db, "users", user.uid), { plan: 'free' });
          toast("Your Pro subscription has expired. Reverting to Free plan.", "warn");
          setSubscription({ plan: 'free', expiry: data.planExpiry, isLoading: false });
        } else {
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
      const createSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createSession({ origin: window.location.origin });
      const { url } = result.data;
      if (url) {
        window.location.href = url; // Redirect to Stripe
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast("Could not initiate checkout. Check if your Firebase project is on the Blaze plan.", "error");
    }
  };

  return { ...subscription, startCheckout };
}
