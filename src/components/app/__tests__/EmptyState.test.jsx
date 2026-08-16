// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('app/EmptyState', () => {
  it('renders the title and description', () => {
    render(
      <EmptyState
        title="No trades yet"
        description="Log a trade to see it here."
      />
    );
    expect(screen.getByText('No trades yet')).toBeInTheDocument();
    expect(screen.getByText('Log a trade to see it here.')).toBeInTheDocument();
  });

  it('adds role="status" only when announce is set', () => {
    const { rerender } = render(<EmptyState title="No trades match the current filters" />);
    expect(screen.queryByRole('status')).toBeNull();

    rerender(<EmptyState title="No trades match the current filters" announce />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a clickable action', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <EmptyState
        title="No trades match the current filters"
        action={
          <button type="button" onClick={onClear}>
            Clear filters
          </button>
        }
      />
    );
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders no decorative image or icon', () => {
    render(<EmptyState title="No setup data yet" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(document.querySelector('svg')).toBeNull();
  });
});
