import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppServices } from '../app/di/AppServicesContext.jsx';
import { pad2 } from '../lib/tradeUtils';

/**
 * Live trades for a single calendar month.
 *
 * The calendar used to drain the entire trades subcollection on mount — 100
 * documents per serial round trip — to render one month. This reads only the
 * month on screen and stays live, so logging a trade still updates it without a
 * reload.
 *
 * Kept separate from the shared paginated `trades` array on purpose: merging
 * them would perturb HistoryPage's cursor state.
 */
export function useMonthTrades(user, year, month) {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(user));
  const [error, setError] = useState(null);
  // Bumped by reload() to force a fresh subscription after a failure.
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const { tradeRepository: repository } = useAppServices();

  // Dates are stored as ISO 'YYYY-MM-DD' strings, so the range bounds are
  // strings too. Day 0 of the next month is the last day of this one.
  const { startDate, endDate } = useMemo(() => ({
    startDate: `${year}-${pad2(month + 1)}-01`,
    endDate: `${year}-${pad2(month + 1)}-${pad2(new Date(year, month + 1, 0).getDate())}`,
  }), [year, month]);

  useEffect(() => {
    if (!user?.uid) {
      setTrades([]);
      setIsLoading(false);
      return undefined;
    }
    setIsLoading(true);
    setError(null);
    return repository.subscribeToTradesInRange(user.uid, startDate, endDate, (loaded) => {
      setTrades(loaded);
      setIsLoading(false);
    }, (subscribeError) => {
      console.error('Calendar month listener error:', subscribeError);
      setError(subscribeError);
      setIsLoading(false);
    });
  }, [repository, user?.uid, startDate, endDate, attempt]);

  return { trades, isLoading, error, reload };
}
