// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  NeatGradient: vi.fn(function NeatGradientMock() {
    this.destroy = vi.fn();
  }),
}));

vi.mock('@firecms/neat', () => ({ NeatGradient: mocks.NeatGradient }));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }) => <div className={className}>{children}</div>,
  },
  useReducedMotion: () => true,
}));

const { StickyFooter } = await import('../sticky-footer');

describe('StickyFooter accessibility', () => {
  it('keeps decorative content non-interactive and disables its canvas animation for reduced motion', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <StickyFooter />
      </MemoryRouter>,
    );

    expect(baseElement.querySelector('[aria-hidden="true"] a')).toBeNull();
    expect(mocks.NeatGradient).not.toHaveBeenCalled();
  });
});
