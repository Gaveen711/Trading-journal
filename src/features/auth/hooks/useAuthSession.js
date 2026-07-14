import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebaseAuth.js';

const AUTH_HINT_KEY = 'xau-auth-hint';
const AUTH_TIMEOUT_MS = 15_000;

export function hasPersistedAuthHint() {
  return typeof window !== 'undefined' && localStorage.getItem(AUTH_HINT_KEY) === 'true';
}

/** Firebase-auth delivery adapter; repository infrastructure loads only after sign-in. */
export function useAuthSession() {
  const [session, setSession] = useState({ user: null, isLoading: true, hasError: false });
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSession((current) => ({ ...current, hasError: true }));
    }, AUTH_TIMEOUT_MS);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      window.clearTimeout(timeoutId);
      if (user) localStorage.setItem(AUTH_HINT_KEY, 'true');
      else localStorage.removeItem(AUTH_HINT_KEY);
      setSession({ user, isLoading: false, hasError: false });
    }, (error) => {
      console.error('Auth Failure:', error);
      window.clearTimeout(timeoutId);
      setSession({ user: null, isLoading: false, hasError: true });
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timeoutId);
    };
  }, []);
  return session;
}
