import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FirebaseTradeRepository } from '../data/repositories/FirebaseTradeRepository.js';
import { LogTradeUseCase } from '../core/usecases/LogTrade.js';
import { ResetTradesUseCase } from '../core/usecases/ResetTrades.js';

const PAGE_SIZE = 100;
const mergeTrades = (...groups) => {
  const byId = new Map();
  groups.flat().forEach((trade) => byId.set(trade.id, trade));
  return Array.from(byId.values()).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
};

export function useTrades(user) {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(user));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreTrades, setHasMoreTrades] = useState(false);
  const [lastMT5Sync, setLastMT5Sync] = useState(null);
  const cursorRef = useRef(null);
  const recentRef = useRef([]);
  const olderRef = useRef([]);

  const repository = useMemo(() => new FirebaseTradeRepository(), []);
  const logTradeUseCase = useMemo(() => new LogTradeUseCase(repository), [repository]);
  const resetTradesUseCase = useMemo(() => new ResetTradesUseCase(repository), [repository]);

  useEffect(() => {
    recentRef.current = [];
    olderRef.current = [];
    cursorRef.current = null;
    setTrades([]);
    setHasMoreTrades(false);
    if (!user) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    return repository.subscribeToTrades(user.uid, (recentTrades, triggerSync, page) => {
      recentRef.current = recentTrades;
      if (olderRef.current.length === 0) {
        cursorRef.current = page.cursor;
        setHasMoreTrades(page.hasMore);
      }
      setTrades(mergeTrades(recentTrades, olderRef.current));
      setIsLoading(false);
      if (triggerSync) setLastMT5Sync(new Date());
    }, (error) => {
      console.error('Real-time trade listener error:', error);
      setIsLoading(false);
    }, PAGE_SIZE);
  }, [user, repository]);

  const loadMoreTrades = useCallback(async () => {
    if (!user?.uid || !hasMoreTrades || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await repository.getTradesPage(user.uid, cursorRef.current, PAGE_SIZE);
      olderRef.current = mergeTrades(olderRef.current, page.trades);
      cursorRef.current = page.cursor;
      setHasMoreTrades(page.hasMore);
      setTrades(mergeTrades(recentRef.current, olderRef.current));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreTrades, isLoadingMore, repository, user?.uid]);

  const addTrade = async (tradeData) => {
    if (!user?.uid) throw new Error('Not authenticated');
    return logTradeUseCase.execute(user.uid, tradeData);
  };
  const removeTrade = async (id) => {
    if (!user?.uid) throw new Error('Not authenticated');
    await repository.removeTrade(user.uid, id);
    olderRef.current = olderRef.current.filter((trade) => trade.id !== id);
    setTrades((current) => current.filter((trade) => trade.id !== id));
  };
  const editTrade = async (id, updatedData) => {
    if (!user?.uid) throw new Error('Not authenticated');
    await repository.editTrade(user.uid, id, updatedData);
    setTrades((current) => current.map((trade) => trade.id === id ? { ...trade, ...updatedData } : trade));
  };
  const resetTrades = async () => {
    if (!user?.uid) throw new Error('Not authenticated');
    await resetTradesUseCase.execute(user.uid, await user.getIdToken());
    olderRef.current = [];
    setTrades([]);
  };

  return {
    trades, isLoading, isLoadingMore, hasMoreTrades, loadMoreTrades,
    addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync,
  };
}