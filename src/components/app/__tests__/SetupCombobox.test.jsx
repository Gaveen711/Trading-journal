// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SetupCombobox } from '../SetupCombobox';

// The catalog a picker actually receives: every doc, archived and merged ones
// included (useSetups returns them for the Manage dialog and for name lookup).
const CATALOG = [
  { id: 's1', name: 'Liquidity sweep', slug: 'liquidity-sweep' },
  { id: 's2', name: 'Breakout', slug: 'breakout' },
  { id: 's3', name: 'News fade', slug: 'news-fade', archived: true },
  { id: 's4', name: 'Scalp', slug: 'scalp', mergedInto: 's2' },
];

function renderCombobox(props = {}) {
  const onValueChange = vi.fn();
  render(<SetupCombobox setups={CATALOG} onValueChange={onValueChange} {...props} />);
  // While closed the trigger is the only button in the tree; its accessible
  // name is the SELECTED setup, so a name query would depend on the fixture.
  return { onValueChange, trigger: screen.getByRole('button') };
}

describe('SetupCombobox', () => {
  it('lists only pickable setups — archived and merged docs stay out', async () => {
    const user = userEvent.setup();
    const { trigger } = renderCombobox();

    await user.click(trigger);

    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'Liquidity sweep', 'Breakout', 'None',
    ]);
  });

  it('marks the current value and reports the id of a clicked option', async () => {
    const user = userEvent.setup();
    const { trigger, onValueChange } = renderCombobox({ value: 's2' });

    expect(trigger).toHaveTextContent('Breakout');
    await user.click(trigger);
    expect(await screen.findByRole('option', { name: 'Breakout' })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('option', { name: 'Liquidity sweep' }));
    expect(onValueChange).toHaveBeenCalledWith('s1');
  });

  it('moves the highlight with the arrow keys and commits it with Enter', async () => {
    const user = userEvent.setup();
    const { trigger, onValueChange } = renderCombobox();

    await user.click(trigger);
    const search = await screen.findByRole('combobox');

    await user.keyboard('{ArrowDown}');
    expect(search).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Breakout' }).id);
    await user.keyboard('{ArrowUp}');
    expect(search).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Liquidity sweep' }).id);

    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('s1');
  });

  it('clears the tag through None', async () => {
    const user = userEvent.setup();
    const { trigger, onValueChange } = renderCombobox({ value: 's1' });

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'None' }));

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('creates on a miss and selects what the catalog hands back', async () => {
    const user = userEvent.setup();
    const onCreateSetup = vi.fn().mockResolvedValue({ id: 'new_1', name: 'Asia sweep' });
    const { trigger, onValueChange } = renderCombobox({ onCreateSetup });

    await user.click(trigger);
    await user.type(await screen.findByRole('combobox'), 'Asia sweep');
    await user.click(await screen.findByRole('option', { name: /Create "Asia sweep"/ }));

    expect(onCreateSetup).toHaveBeenCalledWith('Asia sweep');
    expect(onValueChange).toHaveBeenCalledWith('new_1');
  });

  it('offers Restore, not Create, when the typed name collides with an archived slug', async () => {
    const user = userEvent.setup();
    const onCreateSetup = vi.fn();
    const onRestoreSetup = vi.fn().mockResolvedValue(undefined);
    const { trigger, onValueChange } = renderCombobox({ onCreateSetup, onRestoreSetup });

    await user.click(trigger);
    // Different case, same slug: creating here would mint a second doc on
    // 'news-fade' and split every legacy trade that matched it.
    await user.type(await screen.findByRole('combobox'), 'news FADE');

    expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: /Restore "News fade"/ }));

    expect(onRestoreSetup).toHaveBeenCalledWith('s3');
    expect(onValueChange).toHaveBeenCalledWith('s3');
    expect(onCreateSetup).not.toHaveBeenCalled();
  });

  it('never submits the surrounding form on Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SetupCombobox setups={CATALOG} onValueChange={() => {}} />
        <button type="submit">Save</button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: /setup/i }));
    await user.type(await screen.findByRole('combobox'), 'Break{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cannot be opened while the Pro gate holds it disabled', async () => {
    const user = userEvent.setup();
    const { trigger } = renderCombobox({ disabled: true });

    await user.click(trigger);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
