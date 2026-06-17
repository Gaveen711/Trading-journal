import { useCallback } from 'react';
import { submitTrade } from '../services/tradeService';

/**
 * Hook that wraps tradeService submit logic to provide a UI-friendly API.
 * @param {object} params
 * @param {Function} params.addTrade - repository addTrade function
 * @param {string} params.plan - user plan
 * @param {Array} params.trades - current trades array
 * @param {Function} params.toast - toast function
 */
export function useTradeController({ addTrade, plan, trades, toast }) {
  const submit = useCallback(async (tradeData) => {
    try {
      await submitTrade({ addTrade, tradeData, plan, trades });
      toast?.('Trade logged successfully.', 'success');
      return true;
    } catch (err) {
      console.error('submit trade error', err);
      toast?.(err?.message || 'Failed to record trade.', 'error');
      return false;
    }
  }, [addTrade, plan, trades, toast]);

  return { submit };
}
