// @vitest-environment jsdom
//
// Regression: HistoryPage grew a `setups`/`setupsById`/`resolveSetup` read from
// the outlet context and EditTradeModal grew a Setup picker, but the modal was
// still rendered with the pre-catalog prop list. Every prop the picker needs is
// optional and degrades silently — an empty picker with no "Create" row — so
// nothing threw, nothing logged, and a trade could only ever be UNTAGGED from
// the edit modal, never re-tagged.
//
// The modal is stubbed so this asserts the wiring at the call site rather than
// re-testing the picker (SetupCombobox has its own suite).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let outletContext;
let modalProps;

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useOutletContext: () => outletContext,
}));

vi.mock('../../components/EditTradeModal', () => ({
  EditTradeModal: (props) => {
    modalProps = props;
    return <div data-testid="edit-trade-modal" />;
  },
}));

const { HistoryPage } = await import('../HistoryPage');

const TRADE = {
  id: 'trade_1',
  date: '2026-08-19',
  direction: 'BUY',
  entry: 2400,
  exit: 2410,
  lots: 0.1,
  pnl: 100,
  outcome: 'WIN',
  session: 'London',
  setupId: 'default_breakout',
  screenshots: [],
};

const SETUPS = [
  { id: 'default_breakout', name: 'Breakout', slug: 'breakout', isDefault: true, archived: false, mergedInto: null },
  { id: 'custom_1', name: 'Asia sweep', slug: 'asia-sweep', isDefault: false, archived: true, mergedInto: null },
];

const createSetup = vi.fn();
const archiveSetup = vi.fn();

beforeEach(() => {
  modalProps = undefined;
  outletContext = {
    trades: [TRADE],
    isLoadingTrades: false,
    isLoadingMore: false,
    hasMoreTrades: false,
    loadMoreTrades: vi.fn(),
    loadAllTrades: vi.fn(),
    removeTrade: vi.fn(),
    editTrade: vi.fn(),
    plan: 'pro',
    setShowPricingModal: vi.fn(),
    setups: SETUPS,
    setupsById: Object.fromEntries(SETUPS.map((s) => [s.id, s])),
    resolveSetup: (id) => SETUPS.find((s) => s.id === id) || null,
    createSetup,
    archiveSetup,
    enabledRuleIds: [],
    disciplineViolationsByTradeId: new Map(),
    indeterminateDisciplineDayKey: null,
  };
});

async function openEditModal() {
  const user = userEvent.setup();
  render(<HistoryPage />);
  await user.click(screen.getByRole('button', { name: /show row details/i }));
  await user.click(screen.getByRole('button', { name: /^edit$/i }));
  expect(screen.getByTestId('edit-trade-modal')).toBeInTheDocument();
  return user;
}

describe('HistoryPage → EditTradeModal setup-catalog wiring', () => {
  it('hands the modal the FULL catalog, including archived docs', async () => {
    await openEditModal();
    // Archived rows are what let the picker offer Restore instead of minting a
    // second document on the same slug, so the full list — not a filtered one —
    // has to reach the modal.
    expect(modalProps.setups).toEqual(SETUPS);
  });

  it('hands the modal the catalog writers, so a trade can be re-tagged and not only untagged', async () => {
    await openEditModal();
    expect(modalProps.createSetup).toBe(createSetup);
    expect(modalProps.archiveSetup).toBe(archiveSetup);
  });
});
