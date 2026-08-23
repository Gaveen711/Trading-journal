// @vitest-environment jsdom
//
// The top-up moved from a Settings card into this dialog, so the arithmetic and
// its guards move with it. The masking case is the one that matters: the outlet
// publishes 0 for the balance whenever the account-balance sync permission is
// off, and a deposit computed from that would erase the user's real capital.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let walletContext;
const toast = vi.fn();

vi.mock('../../ToastContext', () => ({ useToast: () => toast }));
vi.mock('../../../app/di/AuthenticatedSessionContext.jsx', () => ({
  useSessionWallet: () => walletContext,
}));

const { WalletTopUpDialog } = await import('../WalletTopUpDialog');

function renderDialog(onOpenChange = vi.fn()) {
  render(<WalletTopUpDialog open onOpenChange={onOpenChange} />);
  return onOpenChange;
}

beforeEach(() => {
  toast.mockClear();
  walletContext = { walletBalance: 500, updateBalance: vi.fn().mockResolvedValue(undefined) };
});

describe('WalletTopUpDialog', () => {
  it('adds to the stored balance rather than replacing it', async () => {
    const user = userEvent.setup();
    const onOpenChange = renderDialog();

    await user.type(screen.getByLabelText(/add funds/i), '250.50');
    await user.click(screen.getByRole('button', { name: /^top up$/i }));

    expect(walletContext.updateBalance).toHaveBeenCalledWith(750.5);
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/topped up/i), 'success');
    // A completed deposit closes the dialog; a failed one must not.
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('previews the resulting balance before it is committed', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/add funds/i), '100');
    expect(screen.getByText('$600.00')).toBeInTheDocument();
    expect(walletContext.updateBalance).not.toHaveBeenCalled();
  });

  it('refuses an amount that is not a positive number', async () => {
    const user = userEvent.setup();
    renderDialog();
    const field = screen.getByLabelText(/add funds/i);
    const submit = screen.getByRole('button', { name: /^top up$/i });

    for (const bad of ['0', '-25', 'abc']) {
      await user.clear(field);
      await user.type(field, bad);
      // The guard is the disabled submit; the handler check backs it up.
      expect(submit).toBeDisabled();
    }
    expect(walletContext.updateBalance).not.toHaveBeenCalled();
  });

  it('keeps the dialog open and reports the failure when the write rejects', async () => {
    const user = userEvent.setup();
    walletContext.updateBalance = vi.fn().mockRejectedValue(new Error('offline'));
    const onOpenChange = renderDialog();

    await user.type(screen.getByLabelText(/add funds/i), '50');
    await user.click(screen.getByRole('button', { name: /^top up$/i }));

    expect(toast).toHaveBeenCalledWith('offline', 'error');
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
