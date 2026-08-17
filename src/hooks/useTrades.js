import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppServices } from '../app/di/AppServicesContext.jsx';

const PAGE_SIZE = 100;
// Bigger pages only for the "load everything" path. Same billed reads, a fifth
// of the serial round trips; first paint still uses PAGE_SIZE.
const HYDRATE_PAGE_SIZE = 500;

// Dates are ISO 'YYYY-MM-DD', so plain string comparison orders them exactly
// like localeCompare at a fraction of the cost — and this runs on every
// snapshot over the whole accumulated array.
const byDateDesc = (a, b) => {
  const left = a.date || '';
  const right = b.date || '';
  if (left === right) return 0;
  return left < right ? 1 : -1;
};

const mergeTrades = (...groups) => {
  const byId = new Map();
  groups.flat().forEach((trade) => byId.set(trade.id, trade));
  return Array.from(byId.values()).sort(byDateDesc);
};

/** Coordinates real-time trades, cursor pagination and trade application use cases. */
export function useTrades(user) {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(user));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreTrades, setHasMoreTrades] = useState(false);
  const [lastMT5Sync, setLastMT5Sync] = useState(null);
  // A failed listener must be distinguishable from an empty account — an
  // outage rendered as "no trades" reads as data loss to the user.
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const cursorRef = useRef(null);
  const recentRef = useRef([]);
  const olderRef = useRef([]);
  const hasMoreRef = useRef(false);
  const pagingPromiseRef = useRef(null);
  const activeUserIdRef = useRef(user?.uid || null);
  const { tradeRepository: repository, logTradeUseCase, resetTradesUseCase } = useAppServices();

  useEffect(() => {
    activeUserIdRef.current = user?.uid || null;
    recentRef.current = [];
    olderRef.current = [];
    cursorRef.current = null;
    hasMoreRef.current = false;
    pagingPromiseRef.current = null;
    setTrades([]);
    setHasMoreTrades(false);
    if (!user) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);
    return repository.subscribeToTrades(user.uid, (recentTrades, triggerSync, page) => {
      recentRef.current = recentTrades;
      if (olderRef.current.length === 0) {
        cursorRef.current = page.cursor;
        setHasMoreTrades(page.hasMore);
        hasMoreRef.current = page.hasMore;
      }
      setTrades(mergeTrades(recentTrades, olderRef.current));
      setIsLoading(false);
      setError(null);
      if (triggerSync) setLastMT5Sync(new Date());
    }, (listenerError) => {
      console.error('Real-time trade listener error:', listenerError);
      setError(listenerError);
      setIsLoading(false);
    }, PAGE_SIZE);
  }, [user, repository, attempt]);

  const loadMoreTrades = useCallback(async () => {
    if (!user?.uid || !hasMoreRef.current) return mergeTrades(recentRef.current, olderRef.current);
    if (pagingPromiseRef.current) return pagingPromiseRef.current;

    const userId = user.uid;
    setIsLoadingMore(true);
    const operation = (async () => {
      const page = await repository.getTradesPage(userId, cursorRef.current, PAGE_SIZE);
      if (activeUserIdRef.current !== userId) return mergeTrades(recentRef.current, olderRef.current);
      olderRef.current = mergeTrades(olderRef.current, page.trades);
      cursorRef.current = page.cursor;
      hasMoreRef.current = page.hasMore;
      setHasMoreTrades(page.hasMore);
      const merged = mergeTrades(recentRef.current, olderRef.current);
      setTrades(merged);
      return merged;
    })();
    pagingPromiseRef.current = operation;
    try {
      return await operation;
    } finally {
      if (pagingPromiseRef.current === operation) pagingPromiseRef.current = null;
      if (activeUserIdRef.current === userId) setIsLoadingMore(false);
    }
  }, [repository, user?.uid]);

  const loadAllTrades = useCallback(async () => {
    if (!user?.uid) return mergeTrades(recentRef.current, olderRef.current);
    if (pagingPromiseRef.current) await pagingPromiseRef.current;
    const userId = user.uid;
    if (activeUserIdRef.current !== userId) return mergeTrades(recentRef.current, olderRef.current);
    if (!hasMoreRef.current) return mergeTrades(recentRef.current, olderRef.current);

    setIsLoadingMore(true);
    const operation = (async () => {
      while (hasMoreRef.current) {
        const page = await repository.getTradesPage(userId, cursorRef.current, HYDRATE_PAGE_SIZE);
        if (activeUserIdRef.current !== userId) return mergeTrades(recentRef.current, olderRef.current);
        olderRef.current = mergeTrades(olderRef.current, page.trades);
        cursorRef.current = page.cursor;
        hasMoreRef.current = page.hasMore;
      }
      setHasMoreTrades(false);
      const merged = mergeTrades(recentRef.current, olderRef.current);
      setTrades(merged);
      return merged;
    })();
    pagingPromiseRef.current = operation;
    try {
      return await operation;
    } finally {
      if (pagingPromiseRef.current === operation) pagingPromiseRef.current = null;
      if (activeUserIdRef.current === userId) setIsLoadingMore(false);
    }
  }, [repository, user?.uid]);

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
    cursorRef.current = null;
    hasMoreRef.current = false;
    setHasMoreTrades(false);
  };

  return {
    trades, isLoading, isLoadingMore, hasMoreTrades, loadMoreTrades, loadAllTrades,
    addTrade, removeTrade, editTrade, resetTrades, lastMT5Sync, error, reload,
  };
}
