// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('html2canvas', () => ({
  default: vi.fn(async () => ({ toDataURL: () => 'data:image/png;base64,test' })),
}));

const { ShareTradeModal } = await import('../ShareTradeModal');

describe('ShareTradeModal accessibility', () => {
  it('uses the accessible dialog shell and dismisses with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShareTradeModal trade={{ id: 'trade-1' }} onClose={onClose} />);

    expect(await screen.findByRole('dialog', { name: 'Share trade' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
