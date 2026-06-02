import { useState, useEffect, useMemo } from 'react';
import { FirebaseTradeRepository } from '../data/repositories/FirebaseTradeRepository.js';
import { LogTradeUseCase } from '../core/usecases/LogTrade.js';
import { ResetTradesUseCase } from '../core/usecases/ResetTrades.js';

export function useTrades(user) {
  const [trades, setTrades]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [lastMT5Sync, setLastMT5Sync] = useState(null);

  // Persist references to repository and use cases to prevent recreation
  const repository = useMemo(() => new FirebaseTradeRepository(), []);
  const logTradeUseCase = useMemo(() => new LogTradeUseCase(repository), [repository]);
  const resetTradesUseCase = useMemo(() => new ResetTradesUseCase(repository), [repository]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = repository.subscribeToTrades(
      user.uid,
      (loadedTrades, triggerSync) => {
        setTrades(loadedTrades);
        setIsLoading(false);
        if (triggerSync) {
          setLastMT5Sync(new Date());
        }
      },
      (error) => {
        console.error('Real-time trade listener error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, repository]);

  const addTrade = async (tradeData) => {
    if (!user?.uid) throw new Error('Not authenticated');
    return logTradeUseCase.execute(user.uid, tradeData);
  };

  const removeTrade = async (id) => {
    if (!user?.uid) throw new Error('Not authenticated');
    await repository.removeTrade(user.uid, id);
  };

  const editTrade = async (id, updatedData) => {
    if (!user?.uid) throw new Error('Not authenticated');
    await repository.editTrade(user.uid, id, updatedData);
  };

  const resetTrades = async () => {
    if (!user?.uid) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    await resetTradesUseCase.execute(user.uid, token);
  };

  return { trades, isLoading, addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync };
}
