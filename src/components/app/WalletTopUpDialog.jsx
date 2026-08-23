import { useEffect, useId, useState } from 'react';
import { useSessionWallet } from '../../app/di/AuthenticatedSessionContext.jsx';
import { useToast } from '../ToastContext';
import { formatCurrency } from '../../lib/tradeUtils';
import { AppDialog } from './AppDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

/**
 * Adding funds to the wallet, from anywhere in the app.
 *
 * It reads the wallet through `useSessionWallet` rather than taking the balance
 * as a prop, and that is deliberate: the balance published on the outlet context
 * is masked to 0 whenever the account-balance sync permission is off. A top-up
 * computed from that masked 0 would write the top-up alone and silently erase
 * the user's real deposit. The only safe input to the arithmetic is the stored
 * value, so this owns the read and the write together.
 */
export function WalletTopUpDialog({ open, onOpenChange }) {
  const { walletBalance, updateBalance } = useSessionWallet();
  const toast = useToast();
  const amountId = useId();
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // A dialog is not unmounted between openings, so a rejected amount would
  // still be sitting in the field the next time it opens.
  useEffect(() => {
    if (open) setAmount('');
  }, [open]);

  const current = walletBalance || 0;
  const parsed = Number(amount);
  const isValid = Number.isFinite(parsed) && parsed > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid) {
      toast('Enter an amount greater than zero.', 'error');
      return;
    }
    setSaving(true);
    try {
      // The stored field is an absolute balance, so a deposit is read-add-write.
      // Rounded because floating-point cents accumulate into a balance every
      // downstream metric divides by.
      const next = Number((current + parsed).toFixed(2));
      await updateBalance(next);
      toast(`Wallet topped up. New balance ${formatCurrency(next)}.`, 'success');
      onOpenChange?.(false);
    } catch (error) {
      toast(error?.message || 'Could not update your wallet balance.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Top up wallet"
      description="Your starting capital. Trade P&L is applied on top of this figure."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">Current balance</span>
          <span className="figure text-sm text-foreground">{formatCurrency(current)}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={amountId} className="text-xs font-medium text-muted-foreground">
            Add funds
          </label>
          <Input
            id={amountId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>

        {/* The result, before committing to it — a deposit is not something the
            user should have to do arithmetic to check. */}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">New balance</span>
          <span className="figure text-sm text-foreground">
            {isValid ? formatCurrency(Number((current + parsed).toFixed(2))) : '—'}
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={saving || !isValid}>
            {saving ? 'Adding…' : 'Top up'}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}
