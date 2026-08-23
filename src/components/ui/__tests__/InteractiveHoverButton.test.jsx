// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { InteractiveHoverButton } from '../interactive-hover-button';

describe('InteractiveHoverButton', () => {
  it('keeps one accessible label while its animated copy stays decorative', () => {
    const { container } = render(<InteractiveHoverButton text='Start free' />);

    const button = screen.getByRole('button', { name: 'Start free' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-slot', 'interactive-hover-button');
    expect(container.querySelector('.xj-cta__hover')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.xj-cta__fill')).toHaveAttribute('aria-hidden', 'true');
  });

  it('preserves link semantics when used for navigation', () => {
    render(
      <MemoryRouter>
        <InteractiveHoverButton as={Link} to='/pricing'>See pricing</InteractiveHoverButton>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'See pricing' })).toHaveAttribute('href', '/pricing');
  });
});
