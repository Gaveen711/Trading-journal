// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatCard } from '../StatCard';

function IconStub(props) {
  return <svg {...props} />;
}

describe('app/StatCard', () => {
  it('shows the label and the pre-formatted value', () => {
    render(<StatCard label="Net P&L, month to date" value="+$1,240.50" />);
    expect(screen.getByText('Net P&L, month to date')).toBeInTheDocument();
    expect(screen.getByText('+$1,240.50')).toBeInTheDocument();
  });

  it('interactive renders a real button and reports reveal state for hover, focus and activation', async () => {
    const user = userEvent.setup();
    const onRevealChange = vi.fn();
    render(<StatCard label="Win rate" value="61%" interactive onRevealChange={onRevealChange} />);

    const button = screen.getByRole('button', { name: 'Win rate' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');

    await user.hover(button);
    await user.unhover(button);
    await user.tab(); // focus
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.tab(); // blur — leaving must always emit false

    expect(onRevealChange.mock.calls.map(([revealed]) => revealed)).toEqual([
      true, // hover in
      false, // hover out
      true, // focus
      false, // Enter toggles off
      true, // Space toggles on
      false, // blur
    ]);
    expect(onRevealChange).toHaveBeenLastCalledWith(false);
  });

  it('locked redacts the value and routes activation to onLockedActivate only', async () => {
    const user = userEvent.setup();
    const onLockedActivate = vi.fn();
    const onRevealChange = vi.fn();
    render(
      <StatCard
        label="Profit factor"
        value="2.31"
        locked
        onLockedActivate={onLockedActivate}
        onRevealChange={onRevealChange}
      />
    );

    expect(screen.queryByText('2.31')).toBeNull();
    expect(screen.getByText('••••')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('Unlock with Pro: Profit factor');

    await user.click(button);
    expect(onLockedActivate).toHaveBeenCalledTimes(1);
    expect(onRevealChange).not.toHaveBeenCalled();
  });

  it('loading shows a skeleton and no value', () => {
    render(<StatCard label="Total trades" value="128" loading />);
    expect(screen.queryByText('128')).toBeNull();
    expect(document.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });

  it('renders a down delta with U+2212 MINUS, never the ASCII hyphen', () => {
    render(
      <StatCard label="Net P&L" value="$980.00" delta={{ direction: 'down', value: '3.2%' }} />
    );
    expect(screen.getByText('−3.2%')).toBeInTheDocument();
    expect(screen.queryByText('-3.2%')).toBeNull();
    expect(screen.getByText('−3.2%')).toHaveClass('text-loss');
  });

  it('renders an up delta in text-win with a leading plus', () => {
    render(<StatCard label="Net P&L" value="$980.00" delta={{ direction: 'up', value: '4%' }} />);
    const delta = screen.getByText('+4%');
    expect(delta).toHaveClass('text-win');
  });

  it('stacked layout never renders an icon', () => {
    render(<StatCard label="Win rate" value="61%" icon={IconStub} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(document.querySelector('svg')).toBeNull();
  });
});
