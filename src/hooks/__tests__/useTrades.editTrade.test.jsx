// @vitest-environment jsdom
//
// Two regressions in one place, both about the trades a user has paged in
// beyond the live 100-doc window:
//
//  1. `editTrade` merged only the caller's payload into local state. Since
//     Phase 3 the repository re-derives the session tag inside its transaction,
//     so the applied patch is wider — and `getTradeSessionCode` TRUSTS a stored,
//     version-matched `sessionCode` over the entry instant. The edited trade
//     therefore kept reporting under its pre-edit session bucket on Analytics
//     and History until a full page reload.
//
//  2. It never touched `olderRef`, the only place a paged-in trade lives. The
//     next listener event rebuilds `trades` from `mergeTrades(recent, older)`
//     with `older` winning, so an unrelated new trade landing silently reverted
//     the edit the user had just watched apply.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const harness = vi.hoisted(() => ({ services: null }));

vi.mock('../../app/di/AppServicesContext.jsx', () => ({
  useAppServices: () => harness.services,
}));

const { useTrades } = await import('../useTrades');

const USER = { uid: 'u1' };

// A paged-in trade: outside the live window, so only `olderRef` holds it.
const OLD_TRADE = {
  id: 'old_1',
  date: '2026-01-05',
  session: 'London',
  entryTimestampUtc: '2026-01-05T14:30:00.000Z',
  sessionCode: 'LondonNY',
  sessionSource: 'manual-logtime',
  sessionEngineVersion: 1,
  pnl: 100,
};

const RECENT_TRADE = { id: 'new_1', date: '2026-08-19', pnl: 10 };
const LATER_TRADE = { id: 'new_2', date: '2026-08-20', pnl: 20 };

// What the repository's transaction actually applies for a date move that
// retires the stored instant — wider than the `{ date, session }` the form sent.
const APPLIED_PATCH = {
  date: '2026-01-04',
  session: 'Tokyo',
  entryTimestampUtc: null,
  sessionCode: 'Asia',
  sessionSource: 'user',
  sessionEngineVersion: 1,
};

let emit;
let editTradeSpy;

beforeEach(() => {
  emit = null;
  editTradeSpy = vi.fn().mockResolvedValue(APPLIED_PATCH);
  harness.services = {
    tradeRepository: {
      subscribeToTrades: (_userId, onUpdate) => {
        emit = onUpdate;
        onUpdate([RECENT_TRADE], false, { cursor: { id: 'c1' }, hasMore: true });
        return () => {};
      },
      getTradesPage: vi.fn().mockResolvedValue({
        trades: [OLD_TRADE],
        cursor: null,
        hasMore: false,
      }),
      editTrade: editTradeSpy,
      removeTrade: vi.fn(),
    },
    logTradeUseCase: { execute: vi.fn() },
    resetTradesUseCase: { execute: vi.fn() },
  };
});

async function mountWithPagedHistory() {
  const view = renderHook(() => useTrades(USER));
  await waitFor(() => expect(view.result.current.hasMoreTrades).toBe(true));
  await act(async () => { await view.result.current.loadMoreTrades(); });
  expect(view.result.current.trades.map((t) => t.id)).toContain('old_1');
  return view;
}

const edited = (view) => view.result.current.trades.find((t) => t.id === 'old_1');

describe('useTrades.editTrade local cache', () => {
  it('merges the patch the repository applied, not just the caller payload', async () => {
    const view = await mountWithPagedHistory();

    await act(async () => {
      await view.result.current.editTrade('old_1', { date: '2026-01-04', session: 'Tokyo' });
    });

    expect(editTradeSpy).toHaveBeenCalledWith('u1', 'old_1', { date: '2026-01-04', session: 'Tokyo' });
    // The derived fields are what every session reader keys on.
    expect(edited(view)).toMatchObject({
      date: '2026-01-04',
      sessionCode: 'Asia',
      sessionSource: 'user',
      entryTimestampUtc: null,
    });
  });

  it('survives the next listener event instead of being reverted from the paged cache', async () => {
    const view = await mountWithPagedHistory();

    await act(async () => {
      await view.result.current.editTrade('old_1', { date: '2026-01-04', session: 'Tokyo' });
    });

    // An unrelated trade lands: the hook rebuilds `trades` from the paged cache.
    await act(async () => {
      emit([LATER_TRADE, RECENT_TRADE], false, { cursor: { id: 'c1' }, hasMore: true });
    });

    expect(view.result.current.trades.map((t) => t.id)).toContain('new_2');
    expect(edited(view).sessionCode).toBe('Asia');
    expect(edited(view).date).toBe('2026-01-04');
  });

  it('falls back to the caller payload when the repository reports no patch', async () => {
    editTradeSpy.mockResolvedValue(undefined);
    const view = await mountWithPagedHistory();

    await act(async () => {
      await view.result.current.editTrade('old_1', { note: 'reviewed' });
    });

    expect(edited(view).note).toBe('reviewed');
  });
});
