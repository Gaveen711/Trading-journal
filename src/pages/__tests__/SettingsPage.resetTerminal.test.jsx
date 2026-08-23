// @vitest-environment jsdom
//
// The Reset terminal button is reported as "doesn't reset the trades". This
// pins down the whole client-side path: the confirm dialog, every store the
// reset is supposed to clear, and what the user is told when one of them fails.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let outletContext;
let brokerContext;
const toast = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useOutletContext: () => outletContext,
  useNavigate: () => vi.fn(),
}));

vi.mock('../../components/ToastContext', () => ({
  useToast: () => toast,
}));

vi.mock('../../app/di/AuthenticatedSessionContext.jsx', () => ({
  useSessionBrokerAccounts: () => brokerContext,
}));

vi.mock('../../firebase', () => ({
  auth: { currentUser: { uid: 'u1', email: 'a@b.c', displayName: 'Trader', providerData: [] } },
}));

vi.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({ isLightMode: false, toggleTheme: vi.fn(), currentTemplate: 'default' }),
}));

const { SettingsPage } = await import('../SettingsPage');

function makeContext(overrides = {}) {
  return {
    plan: 'pro',
    expiry: null,
    openPortal: vi.fn(),
    setShowPricingModal: vi.fn(),
    setShowThemeSelector: vi.fn(),
    resetTrades: vi.fn().mockResolvedValue(undefined),
    resetWallet: vi.fn().mockResolvedValue(undefined),
    updateMonthlyGoal: vi.fn().mockResolvedValue(undefined),
    deleteAllEntries: vi.fn().mockResolvedValue(undefined),
    disciplineRules: undefined,
    saveDisciplineRules: vi.fn().mockResolvedValue(undefined),
    setups: [
      { id: 's1', name: 'Breakout', isDefault: false },
      { id: 's2', name: 'Stock default', isDefault: true },
    ],
    deleteSetup: vi.fn().mockResolvedValue(undefined),
    isSavingDisciplineRules: false,
    isLoadingDisciplineRules: false,
    ...overrides,
  };
}

async function resetTerminal(user) {
  await user.click(screen.getByRole('button', { name: /reset terminal/i }));
  // The confirm dialog's own action button, not the card's trigger.
  const confirm = screen.getAllByRole('button', { name: /reset terminal/i }).at(-1);
  await user.click(confirm);
}

beforeEach(() => {
  toast.mockClear();
  outletContext = makeContext();
  brokerContext = {
    accounts: [{ id: 'acc1', server: 'JustMarkets-Demo2' }],
    removeAccount: vi.fn().mockResolvedValue(undefined),
  };
  localStorage.clear();
});

describe('SettingsPage — reset terminal', () => {
  it('clears every store the workspace owns', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await resetTerminal(user);

    expect(outletContext.resetTrades).toHaveBeenCalledTimes(1);
    expect(outletContext.resetWallet).toHaveBeenCalledTimes(1);
    expect(outletContext.deleteAllEntries).toHaveBeenCalledTimes(1);
    expect(outletContext.updateMonthlyGoal).toHaveBeenCalledWith(1000);
    expect(outletContext.saveDisciplineRules).toHaveBeenCalledTimes(1);
    // Only the user's own setups: deleteSetup refuses the stock ones outright.
    expect(outletContext.deleteSetup).toHaveBeenCalledTimes(1);
    expect(outletContext.deleteSetup).toHaveBeenCalledWith('s1');
    expect(brokerContext.removeAccount).toHaveBeenCalledWith('acc1');
    expect(toast).toHaveBeenCalledWith('Terminal reset complete.', 'success');
  });

  it('does nothing until the confirmation is accepted', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByRole('button', { name: /reset terminal/i }));
    expect(outletContext.resetTrades).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(outletContext.resetTrades).not.toHaveBeenCalled();
  });

  it('names the store that failed instead of reporting a blanket failure', async () => {
    const user = userEvent.setup();
    outletContext = makeContext({
      resetTrades: vi.fn().mockRejectedValue(new Error('Failed to reset trades via API')),
    });
    render(<SettingsPage />);

    await resetTerminal(user);

    // The other stores still went through — that is the whole point of not
    // short-circuiting on the first rejection.
    expect(outletContext.resetWallet).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining('trades'),
      'error'
    );
  });
});
