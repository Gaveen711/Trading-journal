// @vitest-environment jsdom
// Smoke test for the destructive-confirmation RECIPE (no wrapper exists by
// design): the installed alert-dialog primitives composed the way the
// Phase-3 call sites will use them for the three native confirm() sites.
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../ui/alert-dialog';

function DeleteTradeConfirm({ onConfirm }) {
  const [open, setOpen] = useState(true);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="z-[80] border border-border ring-0">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the trade from your journal. It cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete trade
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe('app/alert recipe (destructive confirmation)', () => {
  it('renders role="alertdialog" with name, description and both buttons', async () => {
    render(<DeleteTradeConfirm onConfirm={() => {}} />);
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete this trade?' });
    expect(dialog).toHaveAccessibleDescription(
      'This removes the trade from your journal. It cannot be undone.'
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete trade' })).toBeInTheDocument();
  });

  it('Cancel closes without firing the action callback', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteTradeConfirm onConfirm={onConfirm} />);
    await screen.findByRole('alertdialog', { name: 'Delete this trade?' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('the destructive action fires the callback', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteTradeConfirm onConfirm={onConfirm} />);
    await screen.findByRole('alertdialog', { name: 'Delete this trade?' });

    await user.click(screen.getByRole('button', { name: 'Delete trade' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });
});
