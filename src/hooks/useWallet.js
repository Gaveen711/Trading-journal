import { useCallback, useEffect, useState } from 'react';
import { useAppServices } from '../app/di/AppServicesContext.jsx';

/** React adapter for wallet persistence. Infrastructure is injected by the composition root. */
export function useWallet(user) {
  const [walletBalance, setWalletBalance] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(1000);
  const [isLoading, setIsLoading] = useState(true);
  // A failed load must be distinguishable from a $0 balance.
  const [error, setError] = useState(null);
  // Bumped by reload() to force a fresh load after a failure.
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const { walletRepository: repository } = useAppServices();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const loadWallet = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await repository.getWalletData(user.uid);
        setWalletBalance(data.walletBalance);
        setMonthlyGoal(data.monthlyGoal);
      } catch (loadError) {
        console.error('Wallet Sync Error:', loadError);
        setError(loadError);
      } finally {
        setIsLoading(false);
      }
    };
    loadWallet();
  }, [user, repository, attempt]);

  const updateBalance = async (newBalance) => {
    setWalletBalance(newBalance);
    if (user) await repository.updateBalance(user.uid, newBalance);
  };
  const resetWallet = async () => {
    setWalletBalance(0);
    if (user) await repository.updateBalance(user.uid, 0);
  };
  const updateMonthlyGoal = async (newGoal) => {
    setMonthlyGoal(newGoal);
    if (user) await repository.updateMonthlyGoal(user.uid, newGoal);
  };

  return { walletBalance, updateBalance, monthlyGoal, updateMonthlyGoal, resetWallet, isLoading, error, reload };
}
