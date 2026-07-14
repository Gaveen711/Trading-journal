import { useEffect, useState } from 'react';

const ONBOARDING_KEY = 'xau-onboarded';

/** Encapsulates onboarding persistence and wallet initialization. */
export function useOnboarding({ updateBalance, toast }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY)) return undefined;
    const timer = window.setTimeout(() => setIsOpen(true), 400);
    return () => window.clearTimeout(timer);
  }, []);
  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setIsOpen(false);
  };
  const complete = async (value) => {
    const startingBalance = Number(value);
    if (!Number.isNaN(startingBalance) && startingBalance > 0) {
      await updateBalance(Number(startingBalance.toFixed(2)));
    }
    localStorage.setItem(ONBOARDING_KEY, '1');
    setIsOpen(false);
    toast('Welcome! Log your first trade below.', 'success');
  };
  return { isOpen, dismiss, complete };
}
