// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('ui/Button (base-nova)', () => {
  it('renders a real button element with its label', () => {
    render(<Button>Log trade</Button>);
    expect(screen.getByRole('button', { name: 'Log trade' })).toBeInTheDocument();
  });

  it('fires onClick and respects disabled', async () => {
    const user = userEvent.setup();
    let clicks = 0;
    const { rerender } = render(<Button onClick={() => { clicks += 1; }}>Save</Button>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(clicks).toBe(1);

    rerender(<Button disabled onClick={() => { clicks += 1; }}>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toBeDisabled();
  });

  it('supports the render prop for non-button elements (Base UI composition)', () => {
    render(
      <Button render={<a href="/app/history" />} nativeButton={false}>
        View history
      </Button>
    );
    // Base UI keeps role="button" on a rendered anchor: it is a button that
    // navigates. Query by that contract, and assert the element + href.
    const btn = screen.getByRole('button', { name: 'View history' });
    expect(btn.tagName).toBe('A');
    expect(btn).toHaveAttribute('href', '/app/history');
  });
});
