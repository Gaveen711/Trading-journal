// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManageSetupsDialog } from '../ManageSetupsDialog';
import { ToastProvider } from '../../ToastContext';

// The catalog a Manage dialog actually receives: every doc, archived and merged
// ones included (exactly what useSetups returns).
const CATALOG = [
  { id: 'default_breakout', name: 'Breakout', slug: 'breakout', isDefault: true },
  { id: 'c1', name: 'Liquidity sweep', slug: 'liquidity-sweep', isDefault: false },
  { id: 'c2', name: 'News fade', slug: 'news-fade', isDefault: false },
  { id: 'c4', name: 'Sweep v1', slug: 'sweep-v1', isDefault: false, mergedInto: 'default_breakout' },
  { id: 'c3', name: 'Old scalp', slug: 'old-scalp', isDefault: false, archived: true },
];

const BY_ID = Object.fromEntries(CATALOG.map((setup) => [setup.id, setup]));

/**
 * Reference shapes that must stay distinguishable:
 *  - stored `setupId` on a live doc              -> c1 (x2), default_breakout (x3)
 *  - stored `setupId` on a MERGED doc            -> c4 (x1): buckets under the
 *    merge target, so its own bucket count is 0 while its raw reference is 1
 *  - a pre-catalog trade matched by legacy slug  -> c1 (x1)
 *  - nothing at all                              -> c2, c3 are deletable
 */
const TRADES = [
  { id: 't1', setupId: 'default_breakout' },
  { id: 't2', setupId: 'default_breakout' },
  { id: 't3', setupId: 'default_breakout' },
  { id: 't4', setupId: 'c1' },
  { id: 't5', setupId: 'c1' },
  { id: 't6', strategy: 'Liquidity sweep' },
  { id: 't7', setupId: 'c4' },
];

function renderDialog(props = {}) {
  const handlers = {
    onOpenChange: vi.fn(),
    onHydrate: vi.fn().mockResolvedValue(TRADES),
    renameSetup: vi.fn().mockResolvedValue(undefined),
    mergeSetups: vi.fn().mockResolvedValue(undefined),
    archiveSetup: vi.fn().mockResolvedValue(undefined),
    deleteSetup: vi.fn().mockResolvedValue(undefined),
  };
  render(
    <ToastProvider>
      <ManageSetupsDialog
        open
        setups={CATALOG}
        setupsById={BY_ID}
        trades={TRADES}
        tradesHydrated
        {...handlers}
        {...props}
      />
    </ToastProvider>,
  );
  return handlers;
}

const rowFor = (name) => screen.getByText(name).closest('tr');
const actionIn = (name, label) => within(rowFor(name)).getByRole('button', { name: label });

describe('app/ManageSetupsDialog', () => {
  it('renders the dialog copy that promises trades are never rewritten', () => {
    renderDialog();
    expect(screen.getByRole('dialog', { name: 'Manage setups' })).toBeInTheDocument();
    expect(
      screen.getByText('Rename, merge, or archive. Historical trades are never modified.'),
    ).toBeInTheDocument();
  });

  it('asks for full hydration on open, and until it lands counts load and Delete is disabled', async () => {
    // A hydration that never settles: the pre-hydration state is the one under test.
    const onHydrate = vi.fn(() => new Promise(() => {}));
    renderDialog({ tradesHydrated: false, onHydrate, trades: TRADES.slice(0, 2) });

    expect(onHydrate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Counting trades across your full history…',
    );

    // The paged window holds 2 Breakout trades. Showing "2" here would be a lie,
    // so no number is rendered at all.
    expect(within(rowFor('Breakout')).queryByText('2')).not.toBeInTheDocument();

    // Zero references in the paged window is not zero references — Delete stays
    // disabled for every row until the full history is in hand.
    expect(actionIn('News fade', 'Delete')).toBeDisabled();
    expect(actionIn('Old scalp', 'Delete')).toBeDisabled();
  });

  it('counts trades by bucket once hydrated — a merged setup reports under its target', () => {
    renderDialog();

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    // 3 stored + 1 inherited from the merged 'Sweep v1'.
    expect(within(rowFor('Breakout')).getByText('4')).toBeInTheDocument();
    // 2 stored + 1 matched by legacy slug.
    expect(within(rowFor('Liquidity sweep')).getByText('3')).toBeInTheDocument();
    expect(within(rowFor('Sweep v1')).getByText('0')).toBeInTheDocument();
    expect(rowFor('Sweep v1')).toHaveTextContent('merged into Breakout');
  });

  it('keeps Delete disabled for any setup a trade still references, by bucket or by pointer', () => {
    renderDialog();

    expect(actionIn('Liquidity sweep', 'Delete')).toBeDisabled();
    expect(actionIn('Liquidity sweep', 'Delete')).toHaveAttribute(
      'title',
      '3 trades still use this setup.',
    );

    // The gate that the bucket count cannot see: 'Sweep v1' reports 0 trades
    // because it is merged, but a trade still stores its id.
    expect(actionIn('Sweep v1', 'Delete')).toBeDisabled();
    expect(actionIn('Sweep v1', 'Delete')).toHaveAttribute(
      'title',
      '1 trade still uses this setup.',
    );

    // A seeded setup is never hard-deletable, so it has no Delete at all.
    expect(within(rowFor('Breakout')).queryByRole('button', { name: 'Delete' })).toBeNull();
  });

  it('hard-deletes a custom setup with zero references after the destructive confirm', async () => {
    const user = userEvent.setup();
    const { deleteSetup } = renderDialog();

    const deleteButton = actionIn('News fade', 'Delete');
    expect(deleteButton).toBeEnabled();
    await user.click(deleteButton);

    const confirm = await screen.findByRole('alertdialog');
    expect(within(confirm).getByText(/"News fade" will be removed from your catalog\./))
      .toBeInTheDocument();

    await user.click(within(confirm).getByRole('button', { name: 'Delete setup' }));
    await waitFor(() => expect(deleteSetup).toHaveBeenCalledWith('c2'));
  });

  it('rejects a rename that collides on slug, with an error toast and no write', async () => {
    const user = userEvent.setup();
    const { renameSetup } = renderDialog();

    await user.click(actionIn('News fade', 'Rename'));
    const input = screen.getByRole('textbox', { name: 'Rename News fade' });
    await user.clear(input);
    // Same slug as 'Liquidity sweep' — the rename must not reach the catalog.
    await user.type(input, 'liquidity  sweep');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('"Liquidity sweep" already uses that name.')).toBeInTheDocument();
    expect(renameSetup).not.toHaveBeenCalled();
    // The row stays in edit mode so the user can fix the name in place.
    expect(screen.getByRole('textbox', { name: 'Rename News fade' })).toBeInTheDocument();
  });

  it('renames through the catalog when the slug is free', async () => {
    const user = userEvent.setup();
    const { renameSetup } = renderDialog();

    await user.click(actionIn('News fade', 'Rename'));
    const input = screen.getByRole('textbox', { name: 'Rename News fade' });
    await user.clear(input);
    await user.type(input, 'CPI fade');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(renameSetup).toHaveBeenCalledWith('c2', 'CPI fade'));
  });

  it('spells out what a merge does, naming both setups, before it will commit', async () => {
    const user = userEvent.setup();
    const { mergeSetups } = renderDialog();

    await user.click(actionIn('Liquidity sweep', 'Merge'));
    const mergeDialog = await screen.findByRole('dialog', { name: 'Merge setup' });

    // No target yet: the sentence still promises history is kept.
    expect(
      within(mergeDialog).getByText(
        "Trades keep their history; 'Liquidity sweep' will report under the setup you pick.",
      ),
    ).toBeInTheDocument();
    expect(within(mergeDialog).getByRole('button', { name: 'Merge' })).toBeDisabled();

    await user.click(within(mergeDialog).getByRole('combobox'));
    // Archived and already-merged docs are not offerable targets.
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Breakout', 'News fade']);

    await user.click(screen.getByRole('option', { name: 'News fade' }));
    expect(
      within(mergeDialog).getByText(
        "Trades keep their history; 'Liquidity sweep' will report under 'News fade'.",
      ),
    ).toBeInTheDocument();

    await user.click(within(mergeDialog).getByRole('button', { name: 'Merge' }));
    await waitFor(() => expect(mergeSetups).toHaveBeenCalledWith('c1', 'c2'));
  });

  it('groups archived setups under their own header and restores them in place', async () => {
    const user = userEvent.setup();
    const { archiveSetup } = renderDialog();

    expect(screen.getByRole('heading', { name: 'Archived' })).toBeInTheDocument();
    // An archived row offers Restore, never Archive, and never Merge.
    expect(within(rowFor('Old scalp')).queryByRole('button', { name: 'Merge' })).toBeNull();

    await user.click(actionIn('Old scalp', 'Restore'));
    await waitFor(() => expect(archiveSetup).toHaveBeenCalledWith('c3', false));

    await user.click(actionIn('News fade', 'Archive'));
    await waitFor(() => expect(archiveSetup).toHaveBeenCalledWith('c2', true));
  });
});
